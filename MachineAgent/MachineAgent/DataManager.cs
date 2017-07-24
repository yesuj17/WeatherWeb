using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;
using System.Threading;
using System.Diagnostics;
using System.Configuration;
using System.Windows.Forms;

namespace MachineAgent
{
    public class DataManager
    {
        #region Private Variables 
        private volatile bool _shouldStop = false;
        private Thread _realTimeWatchThread = null;
        private Thread _cycleWatchThread = null;
        private Thread _errorWatchThread = null;

        private int _cycleCheckInterval = 0;
        private int _errorCheckInterval = 0;
        private int _realTimeCollectInterval = 0;
        private bool _isSimulationMode = false;
        private List<MachineInfo> _listMachineInfo = new List<MachineInfo>();

        private IMachineInterface _machineInterface = null;
        private ServerComm _serverComm = null;
        #endregion Private Variables 

        #region Public Properties
        #endregion Public Properties

        #region Private Methods        
        private void RegisterMachine()
        {                                   
            foreach(MachineInfo info in _listMachineInfo)
            {
                _serverComm.RegisterMachine(info);
            }
        }

        private void RealTimeWatcher()
        {                      
            UIHelper.LogInfo(string.Format("RealTime Data를 {0}주기로 수집", _realTimeCollectInterval));

            int count = 0;
            int checkCount = _realTimeCollectInterval / 100;
            while (!_shouldStop)
            {
                if (count < checkCount)
                {
                    // Wait
                    Thread.Sleep(100);

                    count++;
                    continue;
                }
                count = 0;

                // Collect Data from DB     
                if(_machineInterface.ReadMachineRealTimeData() == false )
                {
                    UIHelper.UpdateDBCommStatus(false);
                    continue;
                }

                UIHelper.UpdateDBCommStatus(true);

                foreach (MachineInfo mInfo in _listMachineInfo)
                {
                    MachineRealTimeData rtData = _machineInterface.GetMachineRealTimeData(mInfo.ID);
                                                        
                    _serverComm.SendMachineRealTimeData(rtData);                    
                }                               
            }

            UIHelper.LogInfo("RealTime Data 수집 종료");
        }

        private void CycleWatcher()
        {            
            UIHelper.LogInfo(string.Format("Cycle Data를 {0}주기로 체크", _cycleCheckInterval));

            int count = 0;
            int checkCount = _cycleCheckInterval / 100;
            while (!_shouldStop)
            {
                if(count < checkCount)
                {                   
                    // Wait
                    Thread.Sleep(100);

                    count++;
                    continue;
                }
                count = 0;

                // Check cycle complete flag                                
                if( _machineInterface.IsCompleteCycle() == true )
                {
                    if( _machineInterface.ReadMachineCycleData() == false )
                    {
                        UIHelper.UpdateDBCommStatus(false);
                        continue;
                    }

                    UIHelper.UpdateDBCommStatus(true);                                       
                   
                    // Collect Data from DB
                    foreach (MachineInfo mInfo in _listMachineInfo)
                    {
                        MachineCycleData cycleData = _machineInterface.GetMachineCycleData(mInfo.ID);

                        _serverComm.SendMachineCycleData(cycleData);
                    }                    
                }                
            }

            UIHelper.LogInfo("Cycle Data 수집 종료");
        }

        private void ErrorWatcher()
        {                        
            UIHelper.LogInfo(string.Format("Error Data를 {0}주기로 체크", _errorCheckInterval));

            int count = 0;
            int checkCount = _errorCheckInterval / 100;
            while (!_shouldStop)
            {
                if (count < checkCount)
                {
                    // Wait
                    Thread.Sleep(100);

                    count++;
                    continue;
                }
                count = 0;

                // Check cycle complete flag                                
                if (_machineInterface.IsThereError() == true)
                {
                    MachineErrorData errorData = _machineInterface.GetMachineErrorData();                    

                    _serverComm.SendMachineErrorData(errorData);
                }
            }

            UIHelper.LogInfo("Error Data 수집 종료");
        }

        #endregion Private Methods        

        #region Public Methods        
        public bool Run(bool isSimulationMode )
        {
            Configuration config = ConfigurationManager.OpenExeConfiguration(Application.ExecutablePath);

            if (config.AppSettings.Settings["HIPAS_SERVER_IP"] == null)
            {
                config.AppSettings.Settings.Add("HIPAS_SERVER_IP", "127.0.0.1");
            }

            if (config.AppSettings.Settings["HIPAS_SERVER_WEB_PORT"] == null)
            {
                config.AppSettings.Settings.Add("HIPAS_SERVER_WEB_PORT", "1337");
            }

            UIHelper.LogInfo(string.Format("HIPAS Server IP : {0}, Port : {1}",
                config.AppSettings.Settings["HIPAS_SERVER_IP"].Value,
                config.AppSettings.Settings["HIPAS_SERVER_WEB_PORT"].Value));


            if(config.AppSettings.Settings["REALTIME_DATA_COLLECT_INTERVAL"] == null )
            {
                config.AppSettings.Settings.Add("REALTIME_DATA_COLLECT_INTERVAL", "20000");
            }

            if (config.AppSettings.Settings["CYCLE_CHECK_INTERVAL"] == null)
            {
                config.AppSettings.Settings.Add("CYCLE_CHECK_INTERVAL", "500");
            }

            if (config.AppSettings.Settings["ERROR_CHECK_INTERVAL"] == null)
            {
                config.AppSettings.Settings.Add("ERROR_CHECK_INTERVAL", "1000");
            }

            if (config.AppSettings.Settings["SERVER_SEND_Q_COUNT"] == null)
            {
                config.AppSettings.Settings.Add("SERVER_SEND_Q_COUNT", "100");
            }


            _serverComm = new ServerComm(
                config.AppSettings.Settings["HIPAS_SERVER_IP"].Value,
                config.AppSettings.Settings["HIPAS_SERVER_WEB_PORT"].Value,
                Convert.ToInt32(config.AppSettings.Settings["SERVER_SEND_Q_COUNT"].Value));
            
            _serverComm.Start();            

            _realTimeCollectInterval            
                = Convert.ToInt32(config.AppSettings.Settings["REALTIME_DATA_COLLECT_INTERVAL"].Value);
            _cycleCheckInterval
                = Convert.ToInt32(config.AppSettings.Settings["CYCLE_CHECK_INTERVAL"].Value);
            _errorCheckInterval    
                = Convert.ToInt32(config.AppSettings.Settings["ERROR_CHECK_INTERVAL"].Value);

            this._isSimulationMode = isSimulationMode;
            if( isSimulationMode == true )
            {
                _machineInterface = new SimComm();
            }
            else
            {
                _machineInterface = new DBComm();
            }

            config.Save();


            // Load Machine Config from Appconfig                    
            if (config.AppSettings.Settings["MACHINE_IDS"] == null 
                    || config.AppSettings.Settings["MACHINE_IDS"].Value == string.Empty)
            {
                UIHelper.LogFatal("설정 파일에서 설비 정보를 찾을 수 없습니다.");
                return false;
            }

            _listMachineInfo.Clear();

            string[] machineIDArray
                = config.AppSettings.Settings["MACHINE_IDS"].Value.Split(',');

            foreach (string mID in machineIDArray)
            {
                _listMachineInfo.Add(new MachineInfo("SC", "StackerCrane (" + mID + ")", Convert.ToInt32(mID), 300));
            }

            int realTimeDataCollectionCount = _realTimeCollectInterval / 1000;

            _machineInterface.InitMachineComm(_listMachineInfo.Count, realTimeDataCollectionCount);

            // Register Machine Informations                        
            RegisterMachine();
            
            // Start Data Collection and Transmit
            _realTimeWatchThread = new Thread(RealTimeWatcher);
            _realTimeWatchThread.Start();

            _cycleWatchThread = new Thread(CycleWatcher);
            _cycleWatchThread.Start();

            _errorWatchThread = new Thread(ErrorWatcher);
            _errorWatchThread.Start();

            return true;
        }

        public void Stop()
        {
            _shouldStop = true;

            if( _realTimeWatchThread != null )                
            {
                _realTimeWatchThread.Join();
                _realTimeWatchThread = null;
            }

            if( _cycleWatchThread != null )
            {
                _cycleWatchThread.Join();
                _cycleWatchThread = null;
            }

            if (_errorWatchThread != null)
            {
                _errorWatchThread.Join();
                _errorWatchThread = null;
            }

            if( _machineInterface != null )
            {
                _machineInterface.UnInitMachineComm();
            }                

            if(_serverComm != null)
            {
                _serverComm.Stop();
            }            

            _shouldStop = false;
        }
        #endregion Public Methods        

        #region Constructor
        public DataManager()
        {

        }
        #endregion Constructor
    }
}
