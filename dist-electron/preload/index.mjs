"use strict";const t=require("electron");t.contextBridge.exposeInMainWorld("ipcRenderer",{on(...e){const[r,n]=e;return t.ipcRenderer.on(r,(o,...s)=>n(o,...s))},off(...e){const[r,...n]=e;return t.ipcRenderer.off(r,...n)},send(...e){const[r,...n]=e;return t.ipcRenderer.send(r,...n)},invoke(...e){const[r,...n]=e;return t.ipcRenderer.invoke(r,...n)}});function a(e=["complete","interactive"]){return new Promise(r=>{e.includes(document.readyState)?r(!0):document.addEventListener("readystatechange",()=>{e.includes(document.readyState)&&r(!0)})})}const i={append(e,r){if(!Array.from(e.children).find(n=>n===r))return e.appendChild(r)},remove(e,r){if(Array.from(e.children).find(n=>n===r))return e.removeChild(r)}};function c(){const e="loaders-css__square-spin",r=`
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${e} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `,n=document.createElement("style"),o=document.createElement("div");return n.id="app-loading-style",n.innerHTML=r,o.className="app-loading-wrap",o.innerHTML=`<div class="${e}"><div></div></div>`,{appendLoading(){i.append(document.head,n),i.append(document.body,o)},removeLoading(){i.remove(document.head,n),i.remove(document.body,o)}}}t.contextBridge.exposeInMainWorld("loginAPI",{login:async(e,r)=>{console.log("login hit from preload"),console.log(e),console.log(r),t.ipcRenderer.send("login",e)},receiveMessage:e=>{t.ipcRenderer.on("login-error",(r,n)=>{e(n)}),t.ipcRenderer.on("login-success",(r,n)=>{e(n)})}});t.contextBridge.exposeInMainWorld("getMasterData",{getData:async(e,r)=>{t.ipcRenderer.send("getMasterData",e)},receiveMessage:e=>{t.ipcRenderer.on("get-master-error",(r,n)=>{e(n)}),t.ipcRenderer.on("get-master-success",(r,n)=>{e(n)})}});t.contextBridge.exposeInMainWorld("insertDeliveryData",{insertData:async(e,r)=>{t.ipcRenderer.send("deliveryAdd",e)},receiveMessage:e=>{t.ipcRenderer.on("delivery-add-success",(r,n)=>{e(n)}),t.ipcRenderer.on("delivery-add-error",(r,n)=>{e(n)})}});t.contextBridge.exposeInMainWorld("getDeliveryData",{getData:async(e,r)=>{t.ipcRenderer.send("getDeliveryData",e)},receiveMessage:e=>{t.ipcRenderer.on("get-delivery-success",(r,n)=>{e(n)}),t.ipcRenderer.on("get-delivery-error",(r,n)=>{e(n)})}});const{appendLoading:p,removeLoading:d}=c();a().then(p);window.onmessage=e=>{e.data.payload==="removeLoading"&&d()};setTimeout(d,4999);
