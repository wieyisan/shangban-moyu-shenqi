const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('qingyu', {
  call:(action,payload)=>ipcRenderer.invoke('qingyu',action,payload),
  onState:callback=>ipcRenderer.on('state',(_event,data)=>callback(data))
});
