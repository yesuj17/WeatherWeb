using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Threading;
using System.Windows.Forms;
using System.Drawing;
using MetroFramework.Forms;
using MetroFramework.Controls;
using System.Diagnostics;

using LogHelper;

namespace MachineAgent
{
    public static class UIHelper
    {
        #region Private Variables 
        private enum LogLevel
        {
            Info,
            Error,
            Fatal
        };

        private static System.Windows.Forms.Timer blinkTimer 
            = new System.Windows.Forms.Timer();

        private static MainForm _mainForm = null;

        private static BlockingCollection<bool> _serverStatusQ 
            = new BlockingCollection<bool>();
        private static BlockingCollection<bool> _machineStatusQ 
            = new BlockingCollection<bool>();
        #endregion Private Variables 

        #region Public Properties
        #endregion Public Properties

        #region Private Methods    
        private static void AppendLog(LogLevel lvl, string message)
        {
            RichTextBox tb = _mainForm.GetLogTextBox();

            if( tb == null )
            {
                return;
            }

            tb.BeginInvoke(new Action(() =>
            {
                tb.SelectionStart = tb.TextLength;
                tb.SelectionLength = 0;

                if (lvl == LogLevel.Error)
                {
                    tb.SelectionColor = Color.Yellow;
                }
                else if (lvl == LogLevel.Fatal)
                {
                    tb.SelectionColor = Color.Purple;
                }
                else
                {
                    tb.SelectionColor = Color.White;
                }

                tb.AppendText(DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"));
                tb.AppendText("  [");
                tb.AppendText(lvl.ToString());
                tb.AppendText("]  ");
                tb.AppendText(message);
                tb.AppendText(Environment.NewLine);

            }));
        }
        #endregion Private Methods        

        #region Public Methods    
        public static void UpdateDBCommStatus(bool flag)
        {
            _machineStatusQ.Add(flag);
        }

        public static void UpdateServerCommStatus(bool flag)
        {
            _serverStatusQ.Add(flag);
        }

        public static void ResetCommStatus()
        {
            _mainForm.GetMachineStatusTile().BeginInvoke(new Action(() =>
            {
                _mainForm.GetMachineStatusTile().BackColor = Color.Gray;
            }));

            _mainForm.GetServerStatusTile().BeginInvoke(new Action(() =>
            {
                _mainForm.GetServerStatusTile().BackColor = Color.Gray;
            }));
        }

        private static void BlinkTile(MetroTile tile, Color color1, Color color2 )
        {         
            if (tile == null)
            {
                return;
            }

            tile.BeginInvoke(new Action(() =>
            {
                tile.BackColor = color1;
            }));

            System.Threading.Thread.Sleep(100);
            tile.BeginInvoke(new Action(() =>
            {
                tile.BackColor = color2;
            }));

            System.Threading.Thread.Sleep(100);
            tile.BeginInvoke(new Action(() =>
            {
                tile.BackColor = color1;
            }));
        }

        public static void LogInfo(string message)
        {           
            AppendLog(LogLevel.Info, message);
            LOG.Info(message);
        }

        public static void LogError(string message)
        {
            AppendLog(LogLevel.Error, message);            
            LOG.Error(message);
        }

        public static void LogFatal(string message)
        {
            AppendLog(LogLevel.Fatal, message);
            LOG.Fatal(message);        
        }

        public static void Init(MainForm mf)
        {
            _mainForm = mf;            

            string logDir = System.IO.Directory.GetCurrentDirectory() + @"/Log";
            if (System.IO.Directory.Exists(logDir) == false)
            {
                System.IO.Directory.CreateDirectory(logDir);
            }

            LOG.SetInit(logDir);

            Task.Factory.StartNew(() =>
            {
                while (!_serverStatusQ.IsCompleted)
                {
                    bool status = _serverStatusQ.Take();

                    if( status == true )
                    {
                        BlinkTile(_mainForm.GetServerStatusTile(), Color.LawnGreen, Color.Orange);
                    }
                    else
                    {
                        BlinkTile(_mainForm.GetServerStatusTile(), Color.Tomato, Color.White);
                    }                    
                }
            });

            Task.Factory.StartNew(() =>
            {
                while (!_machineStatusQ.IsCompleted)
                {
                    bool status = _machineStatusQ.Take();

                    if (status == true)
                    {
                        BlinkTile(_mainForm.GetMachineStatusTile(), Color.Aqua, Color.Orange);
                    }
                    else
                    {
                        BlinkTile(_mainForm.GetMachineStatusTile(), Color.Tomato, Color.White);
                    }
                }
            });

        }
        #endregion Public Methods        

        #region Constructor
        #endregion Constructor
    }
}
