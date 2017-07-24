using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MachineAgent
{
    public class DBComm : IMachineInterface
    {
        private int _machineCount = 0;

        private Dictionary<int, MachineRealTimeData> _dicRealTimeData
            = new  Dictionary<int, MachineRealTimeData>();

        private Dictionary<int, MachineCycleData> _dicCycleData
            = new Dictionary<int, MachineCycleData>();

        public void InitMachineComm(int machineCount, int realTimeDataCollectionCount)
        {
            this._machineCount = machineCount;
        }

        public void UnInitMachineComm()
        {

        }                        

        public bool IsCompleteCycle()
        {
            return true;
        }       

        public MachineRealTimeData GetMachineRealTimeData(int machineID )
        {
            if( _dicRealTimeData.ContainsKey(machineID) )
            {
                return _dicRealTimeData[machineID];
            }

            return null;
        }

        public bool ReadMachineRealTimeData()
        {
            // Read from DB & fill to local            


            return false;
        }

        public MachineCycleData GetMachineCycleData(int machineID)
        {
            if (_dicCycleData.ContainsKey(machineID))
            {
                return _dicCycleData[machineID];
            }

            return null;
        }

        public bool ReadMachineCycleData()
        {
            // Read from DB & fill to local

            return false;
        }

        public bool IsThereError()
        {
            return false;
        }

        public MachineErrorData GetMachineErrorData()
        {            
            return null;
        }        
    }
}
