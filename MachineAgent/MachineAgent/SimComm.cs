using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Diagnostics;

namespace MachineAgent
{
    public class SimComm : IMachineInterface
    {
        private int _machineCount = 0;
        private Dictionary<int, SimMachine> _dicSimMachine 
            = new Dictionary<int, SimMachine>();

        private Dictionary<int, MachineRealTimeData> _dicMachineRealTimeData 
            = new Dictionary<int, MachineRealTimeData>();

        private Dictionary<int, MachineCycleData> _dicMachineCycleData
            = new Dictionary<int, MachineCycleData>();

        public void InitMachineComm(int machineCount, int realTimeDataCollectionCount)
        {
            this._machineCount = machineCount;            

            for( int i=0; i < machineCount; i++ )
            {
                _dicSimMachine.Add(i+1, new SimMachine());
                _dicMachineRealTimeData.Add(i + 1, null);
                _dicMachineCycleData.Add(i + 1, null);
            }

            // Start SimMachine
            foreach( KeyValuePair<int, SimMachine> d in _dicSimMachine)
            {
                _dicSimMachine[d.Key].Start(d.Key, realTimeDataCollectionCount);
            }
        }

        public void UnInitMachineComm()
        {
            foreach (var d in _dicSimMachine.Values)
            {
                d.Stop();
            }
        }

        public MachineRealTimeData GetMachineRealTimeData(int machineID)
        {
            if( _dicMachineRealTimeData.ContainsKey(machineID) == false )
            {
                return null;
            }

            return _dicMachineRealTimeData[machineID];
        }

        public bool ReadMachineRealTimeData()
        {
            foreach (KeyValuePair<int, SimMachine> d in _dicSimMachine)
            {
                MachineRealTimeData realTimeData = new MachineRealTimeData();
                realTimeData.MachineID = d.Key;
                realTimeData.MotorInfos = new List<MotorInfo>();

                SimMachine simMachine = d.Value;                

                int[] drivingCurrents = simMachine.GetDrivingCurrent();
                int[] hoistingCurrents = simMachine.GetHoistingCurrent();
                int[] forkCurrents = simMachine.GetForkCurrent();

                DateTime dt = DateTime.UtcNow;
                for (int i = 0; i < drivingCurrents.Length; i++)
                {
                    DateTime newDT = dt.AddSeconds((i + 1) - drivingCurrents.Length);
                    realTimeData.MotorInfos.Add(
                        new MotorInfo(
                            newDT.ToString("o"),                            
                            drivingCurrents[i],
                            hoistingCurrents[i],
                            forkCurrents[i]));
                }                

                if(_dicMachineRealTimeData.ContainsKey(d.Key) == true )
                {
                    _dicMachineRealTimeData[d.Key] = realTimeData;
                }                
            }

            return true;
        }

        public bool IsCompleteCycle()
        {
            foreach (KeyValuePair<int, SimMachine> d in _dicSimMachine)
            {
                if (d.Value.IsCycleCompleted == true)
                {
                    return true;
                }
            }

            return false;
        }
        
        public MachineCycleData GetMachineCycleData(int machineID)
        {            
            if (_dicMachineCycleData.ContainsKey(machineID) == false)
            {
                return null;
            }

            return _dicMachineCycleData[machineID];          
        }

        public bool ReadMachineCycleData()
        {
            foreach (KeyValuePair<int, SimMachine> d in _dicSimMachine)
            {
                int machineID = d.Key;
                SimMachine simMachine = d.Value;

                if(simMachine.IsCycleCompleted == true )
                {
                    MachineCycleData cycleData = new MachineCycleData();

                    // Fill cycle data and add to dictionary
                    cycleData.JobID = simMachine.CycleJobID;
                    cycleData.JobType = simMachine.CycleJobType;
                    cycleData.MachineID = simMachine.CycleMachineID;
                    cycleData.TotalStartTime = simMachine.CycleTotalStartTime;
                    cycleData.TotalEndTime = simMachine.CycleTotalEndTime;
                    cycleData.DrivingInfo = new List<MachineCycleDrivingInfo>();
                    cycleData.DrivingInfo.Add(simMachine.CycleFirstDrivingInfo);
                    cycleData.DrivingInfo.Add(simMachine.CycleSecondDrivingInfo);
                    cycleData.UpperDrivingInfo = new List<MachineCycleUpperDrivingInfo>();
                    cycleData.UpperDrivingInfo.Add(simMachine.CycleUpperDrivingInfo);
                    cycleData.HoistingInfo = new List<MachineCycleHoistingInfo>();
                    cycleData.HoistingInfo.Add(simMachine.CycleFirstHoistingInfo);
                    cycleData.HoistingInfo.Add(simMachine.CycleSecondHoistingInfo);
                    cycleData.ForkInfo = new List<MachineCycleForkInfo>();
                    cycleData.ForkInfo.Add(simMachine.CycleForkInfo);
                    cycleData.LaserDistanceMeterTotalUsedTime = simMachine.CycleLaserDistanceMeterTotalUsedTime;
                    cycleData.OpticalRepeaterTotalUsedTime = simMachine.CycleOpticalRepeaterTotalUsedTime;
                    cycleData.Weight = simMachine.CycleWeight;
                    cycleData.InventoryCount = simMachine.CycleInventoryCount;

                    if (_dicMachineCycleData.ContainsKey(machineID) == true )
                    {
                        _dicMachineCycleData[machineID] = cycleData;
                    }                    

                    simMachine.IsCycleCompleted = false;
                }
                else
                {
                    _dicMachineCycleData[machineID] = null;
                }
            }

            return true;         
        }

        public bool IsThereError()
        {
            foreach (KeyValuePair<int, SimMachine> d in _dicSimMachine)
            {
                if(d.Value.IsExistErrorData == true )
                {
                    return true;
                }
            }

            return false;
        }

        public MachineErrorData GetMachineErrorData()
        {
            MachineErrorData data = new MachineErrorData();
            data.ErrorInfos = new List<MachineErrorItem>();

            foreach (KeyValuePair<int, SimMachine> d in _dicSimMachine)
            {
                int machineID = d.Key;
                SimMachine simMachine = d.Value;
                if( simMachine.IsExistErrorData == true )
                {
                    MachineErrorItem item = simMachine.GetMachineErrorData();
                    data.ErrorInfos.Add(item);

                    simMachine.IsExistErrorData = false;
                }                
            }

            return data;
        }        
    }
}
