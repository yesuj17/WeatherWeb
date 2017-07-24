using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using System.Diagnostics;
using System.Collections;
using System.Runtime.InteropServices;

namespace MachineAgent
{
    public class SimMachine
    {
        private enum State {
            IDLE,
            FIRST_DRIVING,            
            FORK,
            SECOND_DRIVING, 
            ERROR 
        };

        private const int CYCLE_LOOP_INTERVAL = 1000;

        private const int MIN_FIRST_DRIVING_TIME = 10;
        private const int MAX_FIRST_DRIVING_TIME = 25;
        
        private const int MIN_FORK_TIME = 5;
        private const int MAX_FORK_TIME = 12;

        private const int MIN_SECOND_DRIVING_TIME = 6;
        private const int MAX_SECOND_DRIVING_TIME = 20;

        private int _machineID = 0;
        private int _readTimePeriod = 0;

        private State _currentState = State.IDLE;
        private bool _shouldStop = false;
        private Thread _workThread = null;        

        private Queue _drivingCurrentQ = new Queue();
        private Queue _hoistingCurrentQ = new Queue();
        private Queue _forkCurrentQ = new Queue();

        private int _cycleMinFirstDrivingCurrent = 0;
        private int _cycleMaxFirstDrivingCurrent = 0;

        private int _cycleMinHoistingCurrent = 0;
        private int _cycleMaxHoistingCurrent = 0;

        private int _cycleMinForkCurrent = 0;
        private int _cycleMaxForkCurrent = 0;

        private int _cycleMinSecondDrivingCurrent = 0;
        private int _cycleMaxSecondDrivingCurrent = 0;        
        private int _cycleFirstDrivingPeriod = 0;
        private int _cycleForkPeriod = 0;
        private int _cycleSecondDrivingPeriod = 0;
        private int _cycleErrorPeriod = 0;

        public int LastDrivingMoveDistance = 0;
        public int LastDrivingMotorPowerConsumption = 0;
        public int LastDrivingMotorBreakCount = 0;
        public int LastDrivingBreakMCCount = 0;

        public int LastUppperDrivingBreakDiscCount = 0;
        public int LastUppperDrivingBreakRollerCount = 0;
        public int LastUppperDrivingBreakMCCount = 0;
        public int LastUppperDrivingBreakRectifierCount = 0;

        public int LastHoistingMoveDistance = 0;
        public int LastHoistingMotorPowerConsumption = 0;
        public int LastHoistingMotorBreakCount = 0;
        public int LastHoistingBreakMCCount = 0;

        public int LastForkMoveDistance = 0;
        public int LastForkMotorPowerConsumption = 0;
        public int LastForkMotorBreakCount = 0;
        public int LastForkBreakMCCount = 0;

        public int LastLaserDistanceMeterTotalUsedTime = 0;
        public int LastOpticalRepeaterTotalUsedTime = 0;        
        public int LastInventoryCount = 200;

        public bool IsExistErrorData = false;
        public bool IsCycleCompleted = false;

        public int CycleJobID = 0;
        public int CycleJobType = 0;
        public int CycleMachineID = 0;
        public string CycleTotalStartTime = string.Empty;
        public string CycleTotalEndTime = string.Empty;

        public MachineCycleDrivingInfo CycleFirstDrivingInfo
            = new MachineCycleDrivingInfo();
        public MachineCycleDrivingInfo CycleSecondDrivingInfo
            = new MachineCycleDrivingInfo();
        public MachineCycleHoistingInfo CycleFirstHoistingInfo
            = new MachineCycleHoistingInfo();
        public MachineCycleHoistingInfo CycleSecondHoistingInfo
            = new MachineCycleHoistingInfo();
        public MachineCycleForkInfo CycleForkInfo
            = new MachineCycleForkInfo();
        public MachineCycleUpperDrivingInfo CycleUpperDrivingInfo
            = new MachineCycleUpperDrivingInfo();

        public int CycleLaserDistanceMeterTotalUsedTime = 0;       
        public int CycleOpticalRepeaterTotalUsedTime = 0;
        public int CycleWeight = 0;               
        public int CycleInventoryCount = 200;        

        public MachineErrorItem CycleErrorData = null;

        [DllImport("kernel32.dll")]
        private static extern int GetPrivateProfileString(string section, string key, string def, StringBuilder retVal, int size, string filePath);

        [DllImport("kernel32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool WritePrivateProfileString(string section, string key, string value, string filePath);

        private string ReadAppINI(string section, string key, string def = "")
        {
            StringBuilder retVal = new StringBuilder(1024);
            try
            {
                GetPrivateProfileString(section, key, def, retVal, 1024,
                    System.IO.Directory.GetCurrentDirectory() + @"\Machine_" + _machineID + @".ini");
            }
            catch
            {
                retVal.Append(def);                
            }
            return retVal.ToString();
        }

        private void WriteAppINI(string section, string key, string value)
        {
            WritePrivateProfileString(section, key, value,
                System.IO.Directory.GetCurrentDirectory() + @"\Machine_" + _machineID + @".ini");
        }

        private string DBDateTime(DateTime dt)
        {
            return dt.ToString("yyyy-MM-dd HH:mm:ss.fff") + @"Z";
        }

        private void LoadLastMachineData()
        {
            LastDrivingMoveDistance = Convert.ToInt32(ReadAppINI("LastData", "LastDrivingMoveDistance", "0"));                
            LastDrivingMotorPowerConsumption = Convert.ToInt32(ReadAppINI("LastData", "LastDrivingMotorPowerConsumption", "0"));
            LastDrivingMotorBreakCount = Convert.ToInt32(ReadAppINI("LastData", "LastDrivingMotorBreakCount", "0"));
            LastDrivingBreakMCCount = Convert.ToInt32(ReadAppINI("LastData", "LastDrivingBreakMCCount", "0"));

            LastUppperDrivingBreakDiscCount = Convert.ToInt32(ReadAppINI("LastData", "LastUppperDrivingBreakDiscCount", "0"));
            LastUppperDrivingBreakRollerCount = Convert.ToInt32(ReadAppINI("LastData", "LastUppperDrivingBreakRollerCount", "0"));
            LastUppperDrivingBreakMCCount = Convert.ToInt32(ReadAppINI("LastData", "LastUppperDrivingBreakMCCount", "0"));
            LastUppperDrivingBreakRectifierCount = Convert.ToInt32(ReadAppINI("LastData", "LastUppperDrivingBreakRectifierCount", "0"));

            LastHoistingMoveDistance = Convert.ToInt32(ReadAppINI("LastData", "LastHoistingMoveDistance", "0"));
            LastHoistingMotorPowerConsumption = Convert.ToInt32(ReadAppINI("LastData", "LastHoistingMotorPowerConsumption", "0"));
            LastHoistingMotorBreakCount = Convert.ToInt32(ReadAppINI("LastData", "LastHoistingMotorBreakCount", "0"));
            LastHoistingBreakMCCount = Convert.ToInt32(ReadAppINI("LastData", "LastHoistingBreakMCCount", "0"));

            LastForkMoveDistance = Convert.ToInt32(ReadAppINI("LastData", "LastForkMoveDistance", "0"));
            LastForkMotorPowerConsumption = Convert.ToInt32(ReadAppINI("LastData", "LastForkMotorPowerConsumption", "0"));
            LastForkMotorBreakCount = Convert.ToInt32(ReadAppINI("LastData", "LastForkMotorBreakCount", "0"));
            LastForkBreakMCCount = Convert.ToInt32(ReadAppINI("LastData", "LastForkBreakMCCount", "0"));

            LastLaserDistanceMeterTotalUsedTime = Convert.ToInt32(ReadAppINI("LastData", "LastLaserDistanceMeterTotalUsedTime", "0"));
            LastOpticalRepeaterTotalUsedTime = Convert.ToInt32(ReadAppINI("LastData", "LastOpticalRepeaterTotalUsedTime", "0"));
            LastInventoryCount = Convert.ToInt32(ReadAppINI("LastData", "LastInventoryCount", "200"));
        }

        private void SaveLastMachineData()
        {
            WriteAppINI("LastData", "LastDrivingMoveDistance", LastDrivingMoveDistance.ToString());
            WriteAppINI("LastData", "LastDrivingMotorPowerConsumption", LastDrivingMotorPowerConsumption.ToString());
            WriteAppINI("LastData", "LastDrivingMotorBreakCount", LastDrivingMotorBreakCount.ToString());
            WriteAppINI("LastData", "LastDrivingBreakMCCount", LastDrivingBreakMCCount.ToString());
            WriteAppINI("LastData", "LastUppperDrivingBreakDiscCount", LastUppperDrivingBreakDiscCount.ToString());
            WriteAppINI("LastData", "LastUppperDrivingBreakRollerCount", LastUppperDrivingBreakRollerCount.ToString());
            WriteAppINI("LastData", "LastUppperDrivingBreakMCCount", LastUppperDrivingBreakMCCount.ToString());
            WriteAppINI("LastData", "LastUppperDrivingBreakRectifierCount", LastUppperDrivingBreakRectifierCount.ToString());
            WriteAppINI("LastData", "LastHoistingMoveDistance", LastHoistingMoveDistance.ToString());
            WriteAppINI("LastData", "LastHoistingMotorPowerConsumption", LastHoistingMotorPowerConsumption.ToString());
            WriteAppINI("LastData", "LastHoistingMotorBreakCount", LastHoistingMotorPowerConsumption.ToString());
            WriteAppINI("LastData", "LastHoistingBreakMCCount", LastHoistingBreakMCCount.ToString());
            WriteAppINI("LastData", "LastForkMoveDistance", LastForkMoveDistance.ToString());
            WriteAppINI("LastData", "LastForkMotorPowerConsumption", LastForkMotorPowerConsumption.ToString());
            WriteAppINI("LastData", "LastForkMotorBreakCount", LastForkMotorBreakCount.ToString());
            WriteAppINI("LastData", "LastForkBreakMCCount", LastForkBreakMCCount.ToString());
            WriteAppINI("LastData", "LastLaserDistanceMeterTotalUsedTime", LastLaserDistanceMeterTotalUsedTime.ToString());
            WriteAppINI("LastData", "LastOpticalRepeaterTotalUsedTime", LastOpticalRepeaterTotalUsedTime.ToString());
            WriteAppINI("LastData", "LastInventoryCount", LastInventoryCount.ToString());
        }

        private void SetMotorCurrent(State state)
        {            
            Random rnd = new Random(unchecked((int)DateTime.Now.Ticks));
            int firstDrivingCurrent = rnd.Next(_cycleMinFirstDrivingCurrent, _cycleMaxFirstDrivingCurrent);
            int hoistingCurrent = rnd.Next(_cycleMinHoistingCurrent, _cycleMaxHoistingCurrent);
            int forkCurrent = rnd.Next(_cycleMinForkCurrent, _cycleMaxForkCurrent);
            int secondDrivingCurrent = rnd.Next(_cycleMinSecondDrivingCurrent, _cycleMaxSecondDrivingCurrent);

            if (state == State.FIRST_DRIVING)
            {
                lock (_drivingCurrentQ.SyncRoot)
                {
                    _drivingCurrentQ.Dequeue();
                    _drivingCurrentQ.Enqueue(firstDrivingCurrent);
                }
                lock (_hoistingCurrentQ.SyncRoot)
                {
                    _hoistingCurrentQ.Dequeue();
                    _hoistingCurrentQ.Enqueue(hoistingCurrent);
                }
                lock (_forkCurrentQ.SyncRoot)
                {
                    _forkCurrentQ.Dequeue();
                    _forkCurrentQ.Enqueue(0);
                }
            }
            else if (state == State.FORK)
            {                                
                lock (_drivingCurrentQ.SyncRoot)
                {
                    _drivingCurrentQ.Dequeue();
                    _drivingCurrentQ.Enqueue(0);
                }
                lock (_hoistingCurrentQ.SyncRoot)
                {
                    _hoistingCurrentQ.Dequeue();
                    _hoistingCurrentQ.Enqueue(0);
                }
                lock (_forkCurrentQ.SyncRoot)
                {
                    _forkCurrentQ.Dequeue();
                    _forkCurrentQ.Enqueue(forkCurrent);
                }
            }
            else if (state == State.SECOND_DRIVING)
            {
                lock (_drivingCurrentQ.SyncRoot)
                {
                    _drivingCurrentQ.Dequeue();

                    _drivingCurrentQ.Enqueue(secondDrivingCurrent);
                }
                lock (_hoistingCurrentQ.SyncRoot)
                {
                    _hoistingCurrentQ.Dequeue();
                    _hoistingCurrentQ.Enqueue(hoistingCurrent);
                }
                lock (_forkCurrentQ.SyncRoot)
                {
                    _forkCurrentQ.Dequeue();
                    _forkCurrentQ.Enqueue(0);
                }
            }
            else 
            {
                lock (_drivingCurrentQ.SyncRoot)
                {
                    _drivingCurrentQ.Dequeue();
                    _drivingCurrentQ.Enqueue(0);
                }
                lock (_hoistingCurrentQ.SyncRoot)
                {
                    _hoistingCurrentQ.Dequeue();
                    _hoistingCurrentQ.Enqueue(0);
                }
                lock (_forkCurrentQ.SyncRoot)
                {
                    _forkCurrentQ.Dequeue();
                    _forkCurrentQ.Enqueue(0);
                }
            }            
        }

        private void PrintCurrent()
        {
            string str = string.Format("({0}) Driving : ", _machineID);
            foreach (object obj in (IEnumerable)_drivingCurrentQ)
            {
                str += obj.ToString() + ", ";
            }
            Trace.WriteLine(str);

            str = string.Format("({0}) Hoisting : ", _machineID);
            foreach (object obj in (IEnumerable)_hoistingCurrentQ)
            {
                str += obj.ToString() + ", ";
            }
            Trace.WriteLine(str);

            str = string.Format("({0}) Fork : ", _machineID);
            foreach (object obj in (IEnumerable)_forkCurrentQ)
            {
                str += obj.ToString() + ", ";
            }
            Trace.WriteLine(str);
        }

        private void InitCycleData()
        {
            Random rnd = new Random(unchecked((int)DateTime.Now.Ticks));

            CycleJobID = rnd.Next();
            CycleJobType = rnd.Next(0, 2);
            CycleMachineID = _machineID;

            _cycleFirstDrivingPeriod = rnd.Next(MIN_FIRST_DRIVING_TIME, MAX_FIRST_DRIVING_TIME);
            _cycleForkPeriod = rnd.Next(MIN_FORK_TIME, MAX_FORK_TIME);            
            _cycleSecondDrivingPeriod = rnd.Next(MIN_SECOND_DRIVING_TIME, MAX_SECOND_DRIVING_TIME);

            _cycleMaxFirstDrivingCurrent = rnd.Next(30000, 34900);
            _cycleMinFirstDrivingCurrent = rnd.Next(20000, 25000);

            _cycleMaxHoistingCurrent = rnd.Next(45900, 58400);
            _cycleMinHoistingCurrent = rnd.Next(20000, 30000);

            _cycleMaxForkCurrent = rnd.Next(45900, 58400);
            _cycleMinForkCurrent = rnd.Next(20000, 30000);

            _cycleMaxSecondDrivingCurrent = rnd.Next(_cycleMaxFirstDrivingCurrent-5000, _cycleMaxFirstDrivingCurrent);
            _cycleMinSecondDrivingCurrent = rnd.Next(_cycleMinFirstDrivingCurrent-5000, _cycleMinFirstDrivingCurrent);
        }

        private void DoWork()
        {
            int state_tick = 0;

            int count = 0;
            int checkCount = CYCLE_LOOP_INTERVAL / 100;
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

                SetMotorCurrent(_currentState);

                switch (_currentState)
                {                   
                    case State.IDLE:
                        {
                            if(IsExistErrorData == true)                            
                            {
                                continue;
                            }

                            Random rnd = new Random(unchecked((int)DateTime.Now.Ticks+_machineID));
                            int randomStateVal = rnd.Next(0, 10);
                            if (randomStateVal == 2)
                            {
                                InitCycleData();

                                int rndErrorVal = rnd.Next(0, 100);
                                if (rndErrorVal == 38)
                                {
                                    // go to error state
                                    _cycleErrorPeriod = rnd.Next(30, 50);

                                    // Make Error Data
                                    CycleErrorData = new MachineErrorItem();
                                    CycleErrorData.MachineID = _machineID;
                                    CycleErrorData.MachineType = "SC";
                                    CycleErrorData.JobID = CycleJobID;
                                    CycleErrorData.TimeStamp = DBDateTime(DateTime.Now);

                                    CycleErrorData.ErrCode = rnd.Next(1, 300);
                                    CycleErrorData.ErrMsg = @"Simulation Error Message";

                                    IsExistErrorData = true;
                                    _currentState = State.ERROR;
                                    state_tick = 0;
                                }
                                else
                                {
                                    IsCycleCompleted = false;

                                    CycleTotalStartTime = DBDateTime(DateTime.Now);
                                    CycleFirstDrivingInfo.MoveStartTime = DBDateTime(DateTime.Now);

                                    DateTime hoistStartTime = DateTime.Now.AddSeconds((rnd.Next(2, 3)));
                                    CycleFirstHoistingInfo.MoveStartTime = DBDateTime(hoistStartTime);

                                    _currentState = State.FIRST_DRIVING;
                                    state_tick = 0;
                                }
                            }
                        }                          
                                                     
                        break;
                    case State.FIRST_DRIVING:  // Driving + Hoisting
                        {
                            if (state_tick >= _cycleFirstDrivingPeriod)
                            {
                                Random rnd = new Random((int)DateTime.Now.Ticks);

                                // Driving 
                                DateTime drivingEndTime = DateTime.Now.AddSeconds(-(rnd.Next(1, 3)));
                                CycleFirstDrivingInfo.MoveEndTime = DBDateTime(drivingEndTime);    
                                
                                LastDrivingMoveDistance += rnd.Next(100, 2000); // 1 ~ 20m                           
                                CycleFirstDrivingInfo.MoveDistance = LastDrivingMoveDistance;
                                LastDrivingMotorPowerConsumption += rnd.Next(230, 2000); // 230 W ~ 2KW 
                                CycleFirstDrivingInfo.MotorPowerConsumption = LastDrivingMotorPowerConsumption;
                                LastDrivingMotorBreakCount += rnd.Next(1, 3);
                                CycleFirstDrivingInfo.MotorBreakCount = LastDrivingMotorBreakCount;                          
                                LastDrivingBreakMCCount += rnd.Next(1, 3);
                                CycleFirstDrivingInfo.BreakMCCount = LastDrivingBreakMCCount;

                                // Upper Driving                                
                                LastUppperDrivingBreakDiscCount += rnd.Next(1, 3);
                                CycleUpperDrivingInfo.BreakDiscCount = LastUppperDrivingBreakDiscCount;
                                LastUppperDrivingBreakRollerCount += rnd.Next(1, 3);
                                CycleUpperDrivingInfo.BreakRollerCount = LastUppperDrivingBreakRollerCount;
                                LastUppperDrivingBreakMCCount += rnd.Next(1, 3);
                                CycleUpperDrivingInfo.BreakMCCount = LastUppperDrivingBreakMCCount;
                                LastUppperDrivingBreakRectifierCount += rnd.Next(1, 3);
                                CycleUpperDrivingInfo.BreakRectifierCount = LastUppperDrivingBreakRectifierCount;


                                // Hoisting
                                CycleFirstHoistingInfo.MoveEndTime = DBDateTime(DateTime.Now);                                
                                LastHoistingMoveDistance += rnd.Next(100, 1000); // 1 ~ 10m                                
                                CycleFirstHoistingInfo.MoveDistance = LastHoistingMoveDistance;
                                LastHoistingMotorPowerConsumption += rnd.Next(530, 4000); // 530 W ~ 4KW                                
                                CycleFirstHoistingInfo.MotorPowerConsumption = LastHoistingMotorPowerConsumption;
                                LastHoistingMotorBreakCount += rnd.Next(1, 3);
                                CycleFirstHoistingInfo.MotorBreakCount = LastHoistingMotorBreakCount;
                                LastHoistingBreakMCCount += rnd.Next(1, 3);
                                CycleFirstHoistingInfo.BreakMCCount = LastHoistingBreakMCCount;

                                // Next
                                CycleForkInfo.MoveStartTime = DBDateTime(DateTime.Now);
                                state_tick = 0;
                                _currentState = State.FORK;
                            }
                        }

                        break;
                    case State.FORK:
                        {
                            if (state_tick >= _cycleForkPeriod)
                            {
                                Random rnd = new Random((int)DateTime.Now.Ticks + 1);

                                // Fork
                                CycleForkInfo.MoveEndTime = DBDateTime(DateTime.Now);
                                LastForkMoveDistance += rnd.Next(50, 200); // 50cm ~ 2m  
                                CycleForkInfo.MoveDistance = LastForkMoveDistance;
                                LastForkMotorPowerConsumption += rnd.Next(50, 500); // 230 W ~ 2KW                                              
                                CycleForkInfo.MotorPowerConsumption = LastForkMotorPowerConsumption;
                                LastForkMotorBreakCount += rnd.Next(1, 3);
                                CycleForkInfo.MotorBreakCount = LastForkMotorBreakCount;
                                LastForkBreakMCCount += rnd.Next(1, 3);
                                CycleForkInfo.BreakMCCount = LastForkBreakMCCount;

                                // Next                                
                                DateTime drivingStartTime = DateTime.Now.AddSeconds(rnd.Next(1, 3));
                                CycleSecondDrivingInfo.MoveStartTime = DBDateTime(drivingStartTime);
                                CycleSecondHoistingInfo.MoveStartTime = DBDateTime(drivingStartTime);

                                state_tick = 0;
                                _currentState = State.SECOND_DRIVING;
                            }
                        }
                        break;
                    case State.SECOND_DRIVING: // Return
                        {
                            if (state_tick >= _cycleSecondDrivingPeriod)
                            {
                                Random rnd = new Random((int)DateTime.Now.Ticks);

                                // Driving 
                                DateTime drivingEndTime = DateTime.Now;
                                CycleSecondDrivingInfo.MoveEndTime = DBDateTime(drivingEndTime);
                                LastDrivingMoveDistance += rnd.Next(100, 2000); // 1 ~ 20m                                                        
                                CycleSecondDrivingInfo.MoveDistance = LastDrivingMoveDistance;
                                LastDrivingMotorPowerConsumption += rnd.Next(130, 2000); // 130 W ~ 1KW             
                                CycleSecondDrivingInfo.MotorPowerConsumption = LastDrivingMotorPowerConsumption;
                                LastDrivingMotorBreakCount += rnd.Next(1, 3);
                                CycleSecondDrivingInfo.MotorBreakCount = LastDrivingMotorBreakCount;
                                LastDrivingBreakMCCount += rnd.Next(1, 3);
                                CycleSecondDrivingInfo.BreakMCCount = LastDrivingBreakMCCount;


                                // Hoisting                                
                                DateTime hoistEndTime = DateTime.Now.AddSeconds(-(rnd.Next(2, 3)));                                
                                CycleSecondHoistingInfo.MoveEndTime = DBDateTime(hoistEndTime);
                                LastHoistingMoveDistance += rnd.Next(100, 1000); // 1 ~ 10m                                
                                CycleSecondHoistingInfo.MoveDistance = LastHoistingMoveDistance;
                                LastHoistingMotorPowerConsumption += rnd.Next(230, 2000); // 230 W ~ 2KW                                
                                CycleSecondHoistingInfo.MotorPowerConsumption = LastHoistingMotorPowerConsumption;
                                LastHoistingMotorBreakCount += rnd.Next(1, 3);
                                CycleSecondHoistingInfo.MotorBreakCount = LastHoistingMotorBreakCount;
                                LastHoistingBreakMCCount += rnd.Next(1, 3);
                                CycleSecondHoistingInfo.BreakMCCount = LastHoistingBreakMCCount;

                                CycleTotalEndTime = DBDateTime(DateTime.Now);

                                DateTime startT = DateTimeOffset.Parse(CycleTotalStartTime).DateTime;                                    
                                DateTime endT = DateTimeOffset.Parse(CycleTotalEndTime).DateTime;
                                TimeSpan diff = endT.Subtract(startT);
                                LastLaserDistanceMeterTotalUsedTime += (int)diff.TotalSeconds;
                                CycleLaserDistanceMeterTotalUsedTime = LastLaserDistanceMeterTotalUsedTime;
                                LastOpticalRepeaterTotalUsedTime += ((int)diff.TotalSeconds + 1);
                                CycleOpticalRepeaterTotalUsedTime = LastOpticalRepeaterTotalUsedTime;
                                
                                CycleWeight = rnd.Next(10, 3000); // 10 ~ 3000 kg

                                if (CycleJobType == 0)
                                {
                                    LastInventoryCount++;                                
                                }
                                else
                                {
                                    LastInventoryCount--;
                                }
                                CycleInventoryCount = LastInventoryCount;


                                SaveLastMachineData();

                                IsCycleCompleted = true;

                                state_tick = 0;
                                _currentState = State.IDLE;
                            }
                        }                       
                        break;
                    case State.ERROR:
                        {
                            if (state_tick >= _cycleErrorPeriod)
                            {
                                state_tick = 0;
                                _currentState = State.IDLE;
                            }
                        }                        
                        break;
                }

                Trace.WriteLine(string.Format("MachineID : {0} , State : {1}", _machineID, _currentState.ToString()));

                //PrintCurrent();
                state_tick++; 
            }            
        }        

        public int[] GetDrivingCurrent()
        {
            int[] data = new int[_readTimePeriod];
            int index = 0;
            lock(_drivingCurrentQ.SyncRoot)
            {
                foreach (object obj in (IEnumerable)_drivingCurrentQ)
                {
                    data[index] = (int)obj;
                    index++;
                }
            }            

            return data;
        }

        public int[] GetHoistingCurrent()
        {
            int[] data = new int[_readTimePeriod];
            int index = 0;
            lock(_hoistingCurrentQ.SyncRoot)
            {
                foreach (object obj in (IEnumerable)_hoistingCurrentQ)
                {
                    data[index] = (int)obj;
                    index++;
                }
            }
                        
            return data;
        }

        public int[] GetForkCurrent()
        {
            int[] data = new int[_readTimePeriod];
            int index = 0;
            lock(_forkCurrentQ.SyncRoot)
            {
                foreach (object obj in (IEnumerable)_forkCurrentQ)
                {
                    data[index] = (int)obj;
                    index++;
                }
            }            

            return data;
        }

        public MachineErrorItem GetMachineErrorData()
        {
            return CycleErrorData;
        }

        public void Start(int machineID, int realTimePeriod)
        {
            _machineID = machineID;

            LoadLastMachineData();

            _readTimePeriod = realTimePeriod;

            for(int i=0; i < realTimePeriod; i++ )
            {
                _drivingCurrentQ.Enqueue(0);
                _hoistingCurrentQ.Enqueue(0);
                _forkCurrentQ.Enqueue(0);
            }

            _workThread = new Thread(DoWork);
            _workThread.Start();
        }

        public void Stop()
        {
            _shouldStop = true;

            if (_workThread != null)
            {
                _workThread.Join();
                _workThread = null;
            }
            
            _shouldStop = false;
        }
    }
}
