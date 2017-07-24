using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MachineAgent
{
    interface IMachineInterface
    {
        void InitMachineComm(int machineCount, int realTimeDataCollectionCount);

        void UnInitMachineComm();                    
                 
        MachineRealTimeData GetMachineRealTimeData(int machineID);

        bool ReadMachineRealTimeData();

        bool IsCompleteCycle();

        MachineCycleData GetMachineCycleData(int machineID);

        bool ReadMachineCycleData();

        bool IsThereError();

        MachineErrorData GetMachineErrorData();
    }
}
