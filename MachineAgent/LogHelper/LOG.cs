using System;
using System.Collections;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Xml;
using System.Xml.XPath;

using log4net;
using log4net.Config;
using log4net.Repository;

namespace LogHelper
{
    public static class LOG
    {
        #region Private Fields

        /// <summary>
        /// The Document Of logconfig Xml File.
        /// </summary>
        private static readonly XmlDocument _LogconfigXmlDocument = new XmlDocument();

        /// <summary>
        /// The Log Manager.
        /// </summary>
        private static readonly ILog LoggerManager =
            log4net.LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        private static bool doFileCheck;

        private static int logFileNum;

        private static string lastTime;

        private static string LogFileDirectory;

        private static string log4netXml = "logconfig.xml";

        private static string logFileHeader = "LOG";
 
        private static string LogConfigXMLFilePath = System.IO.Directory.GetCurrentDirectory() + "/" + log4netXml;

        #endregion



        #region Private Methods

        /// <summary>
        /// Set Max Log file.
        /// </summary>
        private static void MaxDateLogBackups(int logFileNum)
        {
            int CurrentFileCountOperate = 0;
            int CurrentFileCount = 0;

            if (doFileCheck || (Directory.Exists(LogFileDirectory) && (lastTime != DateTime.Now.ToString("dd"))))
            {
                doFileCheck = false;
                lastTime = DateTime.Now.ToString("dd");
                string[] currentFileName = Directory.GetFiles(LogFileDirectory);
                foreach (string str in currentFileName)
                {
                    CurrentFileCount += 1;

                    if (str.Contains(logFileHeader))
                    {
                        CurrentFileCountOperate += 1;
                    }
                }

                while ( CurrentFileCountOperate > logFileNum )                    
                {
                    List<FileInfo> OperateFile = new List<FileInfo>();                    

                    FileInfo OperateMostLastFile = null;

                    string[] FileName = Directory.GetFiles(LogFileDirectory);

                    for (int i = 0; i < CurrentFileCount; i++)
                    {
                        if (FileName[i].Contains(logFileHeader))
                        {
                            OperateFile.Add(new FileInfo(FileName[i]));
                            OperateMostLastFile = OperateFile[0];
                        }
                    }

                    for (int i = 0; i < CurrentFileCountOperate; i++)
                    {
                        if (DateTime.Compare(OperateFile[i].CreationTime, OperateMostLastFile.CreationTime) < 0)
                        {
                            OperateMostLastFile = OperateFile[i];
                        }
                    }

                    if (CurrentFileCountOperate > logFileNum)
                    {
                        try
                        {
                            if (OperateMostLastFile != null)
                            {
                                OperateMostLastFile.Delete();
                            }
                        }
                        catch (Exception e)
                        {
                            System.Console.WriteLine(e.ToString());
                        }

                        CurrentFileCountOperate--;
                        CurrentFileCount--;
                    }
                }
            }
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Logging Fatal Level Log.
        /// </summary>
        public static void Fatal(string message)
        {
            try
            {
                log4net.GlobalContext.Properties["LogFileName"] = LogFileDirectory + "\\" + logFileHeader;
                log4net.Config.XmlConfigurator.Configure(new System.IO.FileInfo(LogConfigXMLFilePath));
                LoggerManager.Fatal(message);
                MaxDateLogBackups(logFileNum);
            }
            catch (Exception e)
            {
                Trace.WriteLine(e.ToString());
            }
        }

        /// <summary>
        /// Logging Error Level Log.
        /// </summary>
        public static void Error(string message)
        {
            try
            {
                log4net.GlobalContext.Properties["LogFileName"] = LogFileDirectory + "\\" + logFileHeader;
                log4net.Config.XmlConfigurator.Configure(new System.IO.FileInfo(LogConfigXMLFilePath));
                LoggerManager.Error(message);
                MaxDateLogBackups(logFileNum);
            }
            catch (Exception e)
            {
                Trace.WriteLine(e.ToString());
            }
        }

        public static void Info(string message)
        {
            try
            {
                log4net.GlobalContext.Properties["LogFileName"] = LogFileDirectory + "\\" + logFileHeader;
                log4net.Config.XmlConfigurator.Configure(new System.IO.FileInfo(LogConfigXMLFilePath));
                LoggerManager.Info(message);
                MaxDateLogBackups(logFileNum);
            }
            catch (System.Exception e)
            {
                Trace.WriteLine(e.ToString());
            }
        }

        public static void Debug(string message)
        {
            try
            {
                log4net.GlobalContext.Properties["LogFileName"] = LogFileDirectory + "\\" + logFileHeader;
                log4net.Config.XmlConfigurator.Configure(new System.IO.FileInfo(LogConfigXMLFilePath));
                LoggerManager.Debug(message);
                MaxDateLogBackups(logFileNum);
            }
            catch (System.Exception e)
            {
                Trace.WriteLine(e.ToString());
            }
        }


        /// <summary>
        /// The set init.
        /// </summary>
        public static bool SetInit(string logPath)
        {
            LogFileDirectory = logPath;
            
            if (!File.Exists(System.IO.Directory.GetCurrentDirectory() + "/" + log4netXml))
            {
                return false;
            }

            try
            {
                _LogconfigXmlDocument.Load(log4netXml); // logconfig.xml 로 고정.
                lastTime = DateTime.Now.ToString("dd");
                doFileCheck = true;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return false;
            }

            // Set Logging Directory
            XmlElement rootElement = _LogconfigXmlDocument.DocumentElement;

            if (rootElement == null)
            {
                return false;
            }

            XmlNodeList root_nodes = _LogconfigXmlDocument.SelectNodes("//root");
            XmlNodeList appender_nodes = _LogconfigXmlDocument.SelectNodes("//appender");

            foreach (XmlNode node in root_nodes)
            {
                XmlNode nameNode = node.SelectSingleNode("appender-ref");
                XmlAttributeCollection acxNode = nameNode.Attributes;

                if (acxNode.GetNamedItem("ref") != null)
                {
                    logFileNum = Int32.Parse(acxNode.GetNamedItem("logfilenum").Value);                    
                    break;
                }
            }

            return true;
        }
        #endregion
    }
}