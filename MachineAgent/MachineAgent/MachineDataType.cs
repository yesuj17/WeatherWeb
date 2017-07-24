using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace MachineAgent
{

	public class MachineInfo
    {
        public string Type { get; set; }

        public string Name { get; set; }

        public int ID { get; set; }

        public int CellCount { get; set; }

        public string Serializer()
        {
            JavaScriptSerializer js = new JavaScriptSerializer();
            return js.Serialize(this);
        }

        public MachineInfo(string type, string name, int id, int cellCount)
        {        
            this.Type = type;
            this.Name = name;
            this.ID = id;
            this.CellCount = cellCount;
        }
    }


    public class MotorInfo
    {
        public string TimeStamp;

        public int DrivingCurrent { get; set; }
        public int HoistingCurrent { get; set; }
        public int ForkCurrent { get; set; }

        public MotorInfo(string timeStamp, int dCurrent, int hCurrent, int fCurrent )
        {
            this.TimeStamp = timeStamp;
            this.DrivingCurrent = dCurrent;
            this.HoistingCurrent = hCurrent;
            this.ForkCurrent = fCurrent;
        }
    }

    public class MachineRealTimeData
    {
        public int MachineID;

        public List<MotorInfo> MotorInfos { get; set; }             

        public string Serializer()
        {
            JavaScriptSerializer js = new JavaScriptSerializer();
            return js.Serialize(this);
        }                      
    }

    public class MachineCycleDrivingInfo
    {
        public string MoveStartTime { get; set; }
        public string MoveEndTime { get; set; }
        public int MoveDistance { get; set; }
        public int MotorPowerConsumption { get; set; }
        public int MotorBreakCount { get; set; }
        public int BreakMCCount { get; set; }
    }

    public class MachineCycleUpperDrivingInfo
    {
        public int BreakDiscCount { get; set; }
        public int BreakRollerCount { get; set; }
        public int BreakMCCount { get; set; }
        public int BreakRectifierCount { get; set; }

    }

    public class MachineCycleHoistingInfo
    {
        public string MoveStartTime { get; set; }
        public string MoveEndTime { get; set; }
        public int MoveDistance { get; set; }
        public int MotorPowerConsumption { get; set; }
        public int MotorBreakCount { get; set; }
        public int BreakMCCount { get; set; }

    }

    public class MachineCycleForkInfo
    {
        public string MoveStartTime { get; set; }
        public string MoveEndTime { get; set; }
        public int MoveDistance { get; set; }
        public int MotorPowerConsumption { get; set; }
        public int MotorBreakCount { get; set; }
        public int BreakMCCount { get; set; }

    }

    public class MachineCycleData
    {
        public int JobID { get; set; }

        public int JobType { get; set; }

        public int MachineID { get; set; }

        public string TotalStartTime { get; set; }

        public string TotalEndTime { get; set; }

        public List<MachineCycleDrivingInfo> DrivingInfo { get; set; }

        public List<MachineCycleUpperDrivingInfo> UpperDrivingInfo { get; set; }

        public List<MachineCycleHoistingInfo> HoistingInfo { get; set; }

        public List<MachineCycleForkInfo> ForkInfo { get; set; }

        public int LaserDistanceMeterTotalUsedTime { get; set; }

        public int OpticalRepeaterTotalUsedTime { get; set; }

        public int Weight { get; set; }

        public int InventoryCount { get; set; }


        public string Serializer()
        {
            JavaScriptSerializer js = new JavaScriptSerializer();
            return js.Serialize(this);
        }
    }

    public class MachineErrorItem
    {

        public string MachineType { get; set; }

        public int MachineID { get; set; }

        public string TimeStamp { get; set; }

        public int JobID { get; set; }

        public int ErrCode { get; set; }

        public string ErrMsg { get; set; }

        public MachineErrorItem(string type, int id, string date, int jobNo, int code, string msg)
        {
            this.MachineType = type;
            this.MachineID = id;
            this.TimeStamp = date;
            this.JobID = jobNo;
            this.ErrCode = code;
            this.ErrMsg = msg;
        }

        public MachineErrorItem()
        {
        }
    }
    
    public class MachineErrorData
    {

        public List<MachineErrorItem> ErrorInfos { get; set; }

        public string Serializer()
        {
            JavaScriptSerializer js = new JavaScriptSerializer();
            return js.Serialize(this);
        }
    }   
}
