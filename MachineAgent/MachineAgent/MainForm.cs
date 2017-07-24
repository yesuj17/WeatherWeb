using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using LogHelper;
using MetroFramework.Forms;
using MetroFramework.Controls;
using System.Threading;
using System.Diagnostics;

namespace MachineAgent
{
    public partial class MainForm : MetroForm
    {
        private bool _isSimulationMode = true;

        private DataManager _dataManager = new DataManager();

        private void InitializeData()
        {
            if (System.Configuration.ConfigurationManager.AppSettings.Get("SIMULATION_MODE") == null)
            {
                _isSimulationMode = false;
            }
            else
            {
                _isSimulationMode
                    = Convert.ToBoolean(System.Configuration.ConfigurationManager.AppSettings.Get("SIMULATION_MODE"));
            }

            UIHelper.Init(this);
            UIHelper.LogInfo("Machine Agent Start...");

            if (_isSimulationMode == true)
            {
                this.lblOpMode.Text = "Simulation Mode";                
            }
            else
            {
                this.lblOpMode.Text = "Real Mode";
            }
            UIHelper.ResetCommStatus();
        }

        private void EnableStartButton(bool enable)
        {
            if (enable == true)
            {
                this.buttonStart.Enabled = true;
                this.buttonStop.Enabled = false;
            }
            else
            {
                this.buttonStart.Enabled = false; ;
                this.buttonStop.Enabled = true;
            }
        }

        private void InitializeUI()
        {
            EnableStartButton(true);
        }

        private void buttonStart_Click(object sender, EventArgs e)
        {           
            if(_dataManager.Run(_isSimulationMode) == false )
            {
                return;
            }

            EnableStartButton(false);
        }

        private void buttonStop_Click(object sender, EventArgs e)
        {
            _dataManager.Stop();

            UIHelper.ResetCommStatus();            

            EnableStartButton(true);
        }

        protected override void OnClosing(CancelEventArgs e)
        {
            _dataManager.Stop();
        }

        public RichTextBox GetLogTextBox()
        {
            return this.textBoxLog;
        }

        public MetroTile GetServerStatusTile()
        {
            return this.tileServerStatus;
        }

        public MetroTile GetMachineStatusTile()
        {
            return this.tileMachineStatus;
        }

        public MainForm()
        {
            InitializeComponent();
            InitializeData();
            InitializeUI();
        }
    }
}

