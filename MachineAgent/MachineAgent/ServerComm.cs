using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Net;
using System.Diagnostics;
using System.Collections;
using System.Threading;

namespace MachineAgent
{
    public class ServerComm
    {
        private string _serverIP = string.Empty;
        private string _serverPort = string.Empty;
        private int _serverSendMaxQueueCount = 100;

        private Queue sendQ = new Queue();
        private volatile bool _shouldStop = false;
        private Thread _sendQWatchThread = null;

        private bool SendToServer(string uri, string jsonData)
        {
            Trace.WriteLine(jsonData);
                     
            string serverURL = string.Format("http://{0}:{1}/{2}", _serverIP, _serverPort, uri);

            WebClient webClient = new WebClient();
            webClient.Headers[HttpRequestHeader.ContentType] = "application/json";
            webClient.Encoding = UTF8Encoding.UTF8;

            try
            {
                string response = webClient.UploadString(serverURL, jsonData);
            }
            catch (WebException e)
            {
                Trace.WriteLine(e.ToString());
                LogHelper.LOG.Error(e.ToString());               
                UIHelper.UpdateServerCommStatus(false);
                return false;
            }

            UIHelper.UpdateServerCommStatus(true);

            return true;
        }

        private void InsertSendQueue(string uri, string jsonData)
        {
            lock(sendQ.SyncRoot)
            {
                if (sendQ.Count > _serverSendMaxQueueCount)
                {
                    sendQ.Dequeue();
                }

                sendQ.Enqueue(new Tuple<string, string>(uri, jsonData));                
            }       
        }

        private void SendQWatcher()
        {
            while (!_shouldStop)
            {
                if (sendQ.Count == 0)
                {
                    continue;
                }

                Tuple<string, string> data = (Tuple<string, string>)sendQ.Peek();
                if (SendToServer(data.Item1, data.Item2) == true)
                {
                    lock (sendQ.SyncRoot)
                    {
                        sendQ.Dequeue();
                    }                 
                }

                Thread.Sleep(100);
            }
        }

        public void Start()
        {
            _sendQWatchThread = new Thread(SendQWatcher);
            _sendQWatchThread.Start();
        }

        public void Stop()
        {            
            _shouldStop = true;

            if(_sendQWatchThread != null )
            {
                _sendQWatchThread.Join();
                _sendQWatchThread = null;
            }

            lock(sendQ.SyncRoot)
            {
                sendQ.Clear();
            }
            
            _shouldStop = false;
        }


        public bool RegisterMachine(MachineInfo info)
        {
            if(info == null )
            {
                return false;
            }

            string jsonString = info.Serializer();

            InsertSendQueue("MA/updateMachineConfig", jsonString);

            return true;
        }

        public bool SendMachineRealTimeData(MachineRealTimeData data)
        {            
            if( data == null )
            {
                return false;
            }

            string jsonString = data.Serializer();

            InsertSendQueue("MA/addMachineRealTimeData", jsonString);

            return true;
        }

        public bool SendMachineCycleData(MachineCycleData data)
        {
            if( data == null )
            {
                return false;
            }

            string jsonString = data.Serializer();

            InsertSendQueue("MA/addMachineCycleData", jsonString);            

            return true;
        }

        public bool SendMachineErrorData(MachineErrorData data)
        {
            if (data == null)
            {
                return false;
            }

            string jsonString = data.Serializer();

            InsertSendQueue("MA/addMachineErrorData", jsonString);

            return true;
        }

        public ServerComm(string ipAddress, string port, int qCount)
        {
            this._serverIP = ipAddress;
            this._serverPort = port;
            this._serverSendMaxQueueCount = qCount;
        }
    }
}
