namespace MachineAgent
{
    partial class MainForm
    {
        /// <summary>
        /// 필수 디자이너 변수입니다.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// 사용 중인 모든 리소스를 정리합니다.
        /// </summary>
        /// <param name="disposing">관리되는 리소스를 삭제해야 하면 true이고, 그렇지 않으면 false입니다.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form 디자이너에서 생성한 코드

        /// <summary>
        /// 디자이너 지원에 필요한 메서드입니다. 
        /// 이 메서드의 내용을 코드 편집기로 수정하지 마세요.
        /// </summary>
        private void InitializeComponent()
        {
            this.textBoxLog = new System.Windows.Forms.RichTextBox();
            this.buttonStart = new MetroFramework.Controls.MetroButton();
            this.buttonStop = new MetroFramework.Controls.MetroButton();
            this.lblOpMode = new MetroFramework.Controls.MetroLabel();
            this.tileServerStatus = new MetroFramework.Controls.MetroTile();
            this.tileMachineStatus = new MetroFramework.Controls.MetroTile();
            this.metroLabel1 = new MetroFramework.Controls.MetroLabel();
            this.SuspendLayout();
            // 
            // textBoxLog
            // 
            this.textBoxLog.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(64)))), ((int)(((byte)(64)))));
            this.textBoxLog.Location = new System.Drawing.Point(19, 157);
            this.textBoxLog.Name = "textBoxLog";
            this.textBoxLog.Size = new System.Drawing.Size(621, 236);
            this.textBoxLog.TabIndex = 0;
            this.textBoxLog.Text = "";
            // 
            // buttonStart
            // 
            this.buttonStart.Location = new System.Drawing.Point(533, 69);
            this.buttonStart.Name = "buttonStart";
            this.buttonStart.Size = new System.Drawing.Size(107, 33);
            this.buttonStart.TabIndex = 3;
            this.buttonStart.Text = "START";
            this.buttonStart.Theme = MetroFramework.MetroThemeStyle.Dark;
            this.buttonStart.UseSelectable = true;
            this.buttonStart.Click += new System.EventHandler(this.buttonStart_Click);
            // 
            // buttonStop
            // 
            this.buttonStop.Location = new System.Drawing.Point(533, 108);
            this.buttonStop.Name = "buttonStop";
            this.buttonStop.Size = new System.Drawing.Size(107, 33);
            this.buttonStop.TabIndex = 4;
            this.buttonStop.Text = "STOP";
            this.buttonStop.Theme = MetroFramework.MetroThemeStyle.Dark;
            this.buttonStop.UseSelectable = true;
            this.buttonStop.Click += new System.EventHandler(this.buttonStop_Click);
            // 
            // lblOpMode
            // 
            this.lblOpMode.AutoSize = true;
            this.lblOpMode.BackColor = System.Drawing.Color.Black;
            this.lblOpMode.FontWeight = MetroFramework.MetroLabelWeight.Regular;
            this.lblOpMode.ForeColor = System.Drawing.SystemColors.ButtonFace;
            this.lblOpMode.Location = new System.Drawing.Point(206, 31);
            this.lblOpMode.Name = "lblOpMode";
            this.lblOpMode.Size = new System.Drawing.Size(113, 19);
            this.lblOpMode.TabIndex = 5;
            this.lblOpMode.Text = "Simulation Mode";
            this.lblOpMode.Theme = MetroFramework.MetroThemeStyle.Dark;
            // 
            // tileServerStatus
            // 
            this.tileServerStatus.ActiveControl = null;
            this.tileServerStatus.BackColor = System.Drawing.Color.Orange;
            this.tileServerStatus.CausesValidation = false;
            this.tileServerStatus.ForeColor = System.Drawing.Color.Black;
            this.tileServerStatus.Location = new System.Drawing.Point(112, 69);
            this.tileServerStatus.Name = "tileServerStatus";
            this.tileServerStatus.Size = new System.Drawing.Size(75, 75);
            this.tileServerStatus.TabIndex = 7;
            this.tileServerStatus.Text = "S";
            this.tileServerStatus.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.tileServerStatus.TileTextFontSize = MetroFramework.MetroTileTextSize.Tall;
            this.tileServerStatus.TileTextFontWeight = MetroFramework.MetroTileTextWeight.Bold;
            this.tileServerStatus.UseCustomBackColor = true;
            this.tileServerStatus.UseCustomForeColor = true;
            this.tileServerStatus.UseSelectable = true;
            // 
            // tileMachineStatus
            // 
            this.tileMachineStatus.ActiveControl = null;
            this.tileMachineStatus.BackColor = System.Drawing.Color.Tomato;
            this.tileMachineStatus.ForeColor = System.Drawing.Color.Black;
            this.tileMachineStatus.Location = new System.Drawing.Point(21, 69);
            this.tileMachineStatus.Name = "tileMachineStatus";
            this.tileMachineStatus.Size = new System.Drawing.Size(75, 75);
            this.tileMachineStatus.TabIndex = 8;
            this.tileMachineStatus.Text = "M";
            this.tileMachineStatus.TextAlign = System.Drawing.ContentAlignment.MiddleCenter;
            this.tileMachineStatus.TileTextFontSize = MetroFramework.MetroTileTextSize.Tall;
            this.tileMachineStatus.TileTextFontWeight = MetroFramework.MetroTileTextWeight.Bold;
            this.tileMachineStatus.UseCustomBackColor = true;
            this.tileMachineStatus.UseCustomForeColor = true;
            this.tileMachineStatus.UseSelectable = true;
            // 
            // metroLabel1
            // 
            this.metroLabel1.AutoSize = true;
            this.metroLabel1.Location = new System.Drawing.Point(190, 30);
            this.metroLabel1.Name = "metroLabel1";
            this.metroLabel1.Size = new System.Drawing.Size(15, 19);
            this.metroLabel1.TabIndex = 6;
            this.metroLabel1.Text = "-";
            this.metroLabel1.Theme = MetroFramework.MetroThemeStyle.Dark;
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 12F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(655, 405);
            this.Controls.Add(this.tileMachineStatus);
            this.Controls.Add(this.tileServerStatus);
            this.Controls.Add(this.metroLabel1);
            this.Controls.Add(this.lblOpMode);
            this.Controls.Add(this.buttonStop);
            this.Controls.Add(this.buttonStart);
            this.Controls.Add(this.textBoxLog);
            this.Name = "MainForm";
            this.Text = "Machine Agent";
            this.Theme = MetroFramework.MetroThemeStyle.Dark;
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.RichTextBox textBoxLog;
        private MetroFramework.Controls.MetroButton buttonStart;
        private MetroFramework.Controls.MetroButton buttonStop;
        private MetroFramework.Controls.MetroLabel lblOpMode;
        private MetroFramework.Controls.MetroTile tileServerStatus;
        private MetroFramework.Controls.MetroTile tileMachineStatus;
        private MetroFramework.Controls.MetroLabel metroLabel1;
    }
}

