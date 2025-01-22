"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
function domReady(condition = ["complete", "interactive"]) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}
const safeDOM = {
  append(parent, child) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent, child) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  }
};
function useLoading() {
  const className = `loaders-css__square-spin`;
  const styleContent = `
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${className} > div {
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
    `;
  const oStyle = document.createElement("style");
  const oDiv = document.createElement("div");
  oStyle.id = "app-loading-style";
  oStyle.innerHTML = styleContent;
  oDiv.className = "app-loading-wrap";
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`;
  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    }
  };
}
electron.contextBridge.exposeInMainWorld("loginAPI", {
  login: async (payload, url) => {
    console.log("login hit from preload");
    console.log(payload);
    console.log(url);
    electron.ipcRenderer.send("login", payload);
  },
  receiveMessage: (callback) => {
    electron.ipcRenderer.on("login-error", (event, response) => {
      callback(response);
    });
    electron.ipcRenderer.on("login-success", (event, response) => {
      callback(response);
    });
  }
});
electron.contextBridge.exposeInMainWorld("getMasterData", {
  getData: async (payload, url) => {
    electron.ipcRenderer.send("getMasterData", payload);
  },
  receiveMessage: (callback) => {
    electron.ipcRenderer.on("get-master-error", (event, response) => {
      callback(response);
    });
    electron.ipcRenderer.on("get-master-success", (event, response) => {
      callback(response);
    });
  }
});
electron.contextBridge.exposeInMainWorld("insertDeliveryData", {
  insertData: async (payload, url) => {
    electron.ipcRenderer.send("deliveryAdd", payload);
  },
  receiveMessage: (callback) => {
    electron.ipcRenderer.on("delivery-add-success", (event, response) => {
      callback(response);
    });
    electron.ipcRenderer.on("delivery-add-error", (event, response) => {
      callback(response);
    });
  }
});
electron.contextBridge.exposeInMainWorld("getDeliveryData", {
  getData: async (payload, url) => {
    electron.ipcRenderer.send("getDeliveryData", payload);
  },
  receiveMessage: (callback) => {
    electron.ipcRenderer.on("get-delivery-success", (event, response) => {
      callback(response);
    });
    electron.ipcRenderer.on("get-delivery-error", (event, response) => {
      callback(response);
    });
  }
});
const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);
window.onmessage = (ev) => {
  ev.data.payload === "removeLoading" && removeLoading();
};
setTimeout(removeLoading, 4999);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgubWpzIiwic291cmNlcyI6WyIuLi8uLi9lbGVjdHJvbi9wcmVsb2FkL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGlwY1JlbmRlcmVyLCBjb250ZXh0QnJpZGdlIH0gZnJvbSAnZWxlY3Ryb24nXG5cbi8vIC0tLS0tLS0tLSBFeHBvc2Ugc29tZSBBUEkgdG8gdGhlIFJlbmRlcmVyIHByb2Nlc3MgLS0tLS0tLS0tXG5jb250ZXh0QnJpZGdlLmV4cG9zZUluTWFpbldvcmxkKCdpcGNSZW5kZXJlcicsIHtcbiAgb24oLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIub24+KSB7XG4gICAgY29uc3QgW2NoYW5uZWwsIGxpc3RlbmVyXSA9IGFyZ3NcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIub24oY2hhbm5lbCwgKGV2ZW50LCAuLi5hcmdzKSA9PiBsaXN0ZW5lcihldmVudCwgLi4uYXJncykpXG4gIH0sXG4gIG9mZiguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBpcGNSZW5kZXJlci5vZmY+KSB7XG4gICAgY29uc3QgW2NoYW5uZWwsIC4uLm9taXRdID0gYXJnc1xuICAgIHJldHVybiBpcGNSZW5kZXJlci5vZmYoY2hhbm5lbCwgLi4ub21pdClcbiAgfSxcbiAgc2VuZCguLi5hcmdzOiBQYXJhbWV0ZXJzPHR5cGVvZiBpcGNSZW5kZXJlci5zZW5kPikge1xuICAgIGNvbnN0IFtjaGFubmVsLCAuLi5vbWl0XSA9IGFyZ3NcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuc2VuZChjaGFubmVsLCAuLi5vbWl0KVxuICB9LFxuICBpbnZva2UoLi4uYXJnczogUGFyYW1ldGVyczx0eXBlb2YgaXBjUmVuZGVyZXIuaW52b2tlPikge1xuICAgIGNvbnN0IFtjaGFubmVsLCAuLi5vbWl0XSA9IGFyZ3NcbiAgICByZXR1cm4gaXBjUmVuZGVyZXIuaW52b2tlKGNoYW5uZWwsIC4uLm9taXQpXG4gIH0sXG5cbiAgLy8gWW91IGNhbiBleHBvc2Ugb3RoZXIgQVBUcyB5b3UgbmVlZCBoZXJlLlxuICAvLyAuLi5cbn0pXG5cbi8vIC0tLS0tLS0tLSBQcmVsb2FkIHNjcmlwdHMgbG9hZGluZyAtLS0tLS0tLS1cbmZ1bmN0aW9uIGRvbVJlYWR5KGNvbmRpdGlvbjogRG9jdW1lbnRSZWFkeVN0YXRlW10gPSBbJ2NvbXBsZXRlJywgJ2ludGVyYWN0aXZlJ10pIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIGlmIChjb25kaXRpb24uaW5jbHVkZXMoZG9jdW1lbnQucmVhZHlTdGF0ZSkpIHtcbiAgICAgIHJlc29sdmUodHJ1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigncmVhZHlzdGF0ZWNoYW5nZScsICgpID0+IHtcbiAgICAgICAgaWYgKGNvbmRpdGlvbi5pbmNsdWRlcyhkb2N1bWVudC5yZWFkeVN0YXRlKSkge1xuICAgICAgICAgIHJlc29sdmUodHJ1ZSlcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH0pXG59XG5cbmNvbnN0IHNhZmVET00gPSB7XG4gIGFwcGVuZChwYXJlbnQ6IEhUTUxFbGVtZW50LCBjaGlsZDogSFRNTEVsZW1lbnQpIHtcbiAgICBpZiAoIUFycmF5LmZyb20ocGFyZW50LmNoaWxkcmVuKS5maW5kKGUgPT4gZSA9PT0gY2hpbGQpKSB7XG4gICAgICByZXR1cm4gcGFyZW50LmFwcGVuZENoaWxkKGNoaWxkKVxuICAgIH1cbiAgfSxcbiAgcmVtb3ZlKHBhcmVudDogSFRNTEVsZW1lbnQsIGNoaWxkOiBIVE1MRWxlbWVudCkge1xuICAgIGlmIChBcnJheS5mcm9tKHBhcmVudC5jaGlsZHJlbikuZmluZChlID0+IGUgPT09IGNoaWxkKSkge1xuICAgICAgcmV0dXJuIHBhcmVudC5yZW1vdmVDaGlsZChjaGlsZClcbiAgICB9XG4gIH0sXG59XG5cbi8qKlxuICogaHR0cHM6Ly90b2JpYXNhaGxpbi5jb20vc3BpbmtpdFxuICogaHR0cHM6Ly9jb25ub3JhdGhlcnRvbi5jb20vbG9hZGVyc1xuICogaHR0cHM6Ly9wcm9qZWN0cy5sdWtlaGFhcy5tZS9jc3MtbG9hZGVyc1xuICogaHR0cHM6Ly9tYXRlamt1c3RlYy5naXRodWIuaW8vU3BpblRoYXRTaGl0XG4gKi9cbmZ1bmN0aW9uIHVzZUxvYWRpbmcoKSB7XG4gIGNvbnN0IGNsYXNzTmFtZSA9IGBsb2FkZXJzLWNzc19fc3F1YXJlLXNwaW5gXG4gIGNvbnN0IHN0eWxlQ29udGVudCA9IGBcbkBrZXlmcmFtZXMgc3F1YXJlLXNwaW4ge1xuICAyNSUgeyB0cmFuc2Zvcm06IHBlcnNwZWN0aXZlKDEwMHB4KSByb3RhdGVYKDE4MGRlZykgcm90YXRlWSgwKTsgfVxuICA1MCUgeyB0cmFuc2Zvcm06IHBlcnNwZWN0aXZlKDEwMHB4KSByb3RhdGVYKDE4MGRlZykgcm90YXRlWSgxODBkZWcpOyB9XG4gIDc1JSB7IHRyYW5zZm9ybTogcGVyc3BlY3RpdmUoMTAwcHgpIHJvdGF0ZVgoMCkgcm90YXRlWSgxODBkZWcpOyB9XG4gIDEwMCUgeyB0cmFuc2Zvcm06IHBlcnNwZWN0aXZlKDEwMHB4KSByb3RhdGVYKDApIHJvdGF0ZVkoMCk7IH1cbn1cbi4ke2NsYXNzTmFtZX0gPiBkaXYge1xuICBhbmltYXRpb24tZmlsbC1tb2RlOiBib3RoO1xuICB3aWR0aDogNTBweDtcbiAgaGVpZ2h0OiA1MHB4O1xuICBiYWNrZ3JvdW5kOiAjZmZmO1xuICBhbmltYXRpb246IHNxdWFyZS1zcGluIDNzIDBzIGN1YmljLWJlemllcigwLjA5LCAwLjU3LCAwLjQ5LCAwLjkpIGluZmluaXRlO1xufVxuLmFwcC1sb2FkaW5nLXdyYXAge1xuICBwb3NpdGlvbjogZml4ZWQ7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgd2lkdGg6IDEwMHZ3O1xuICBoZWlnaHQ6IDEwMHZoO1xuICBkaXNwbGF5OiBmbGV4O1xuICBhbGlnbi1pdGVtczogY2VudGVyO1xuICBqdXN0aWZ5LWNvbnRlbnQ6IGNlbnRlcjtcbiAgYmFja2dyb3VuZDogIzI4MmMzNDtcbiAgei1pbmRleDogOTtcbn1cbiAgICBgXG4gIGNvbnN0IG9TdHlsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgY29uc3Qgb0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG5cbiAgb1N0eWxlLmlkID0gJ2FwcC1sb2FkaW5nLXN0eWxlJ1xuICBvU3R5bGUuaW5uZXJIVE1MID0gc3R5bGVDb250ZW50XG4gIG9EaXYuY2xhc3NOYW1lID0gJ2FwcC1sb2FkaW5nLXdyYXAnXG4gIG9EaXYuaW5uZXJIVE1MID0gYDxkaXYgY2xhc3M9XCIke2NsYXNzTmFtZX1cIj48ZGl2PjwvZGl2PjwvZGl2PmBcblxuICByZXR1cm4ge1xuICAgIGFwcGVuZExvYWRpbmcoKSB7XG4gICAgICBzYWZlRE9NLmFwcGVuZChkb2N1bWVudC5oZWFkLCBvU3R5bGUpXG4gICAgICBzYWZlRE9NLmFwcGVuZChkb2N1bWVudC5ib2R5LCBvRGl2KVxuICAgIH0sXG4gICAgcmVtb3ZlTG9hZGluZygpIHtcbiAgICAgIHNhZmVET00ucmVtb3ZlKGRvY3VtZW50LmhlYWQsIG9TdHlsZSlcbiAgICAgIHNhZmVET00ucmVtb3ZlKGRvY3VtZW50LmJvZHksIG9EaXYpXG4gICAgfSxcbiAgfVxufVxuXG5cbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2xvZ2luQVBJJywge1xuICBsb2dpbjogYXN5bmMgKHBheWxvYWQ6IGFueSwgdXJsOiBzdHJpbmcpID0+IHtcbiAgICBjb25zb2xlLmxvZygnbG9naW4gaGl0IGZyb20gcHJlbG9hZCcpO1xuICAgIGNvbnNvbGUubG9nKHBheWxvYWQpO1xuICAgIGNvbnNvbGUubG9nKHVybCk7XG4gICAgaXBjUmVuZGVyZXIuc2VuZCgnbG9naW4nLCBwYXlsb2FkKTtcbiAgfSxcbiAgcmVjZWl2ZU1lc3NhZ2U6IChjYWxsYmFjazogYW55KSA9PiB7XG5cbiAgICBpcGNSZW5kZXJlci5vbignbG9naW4tZXJyb3InLCAoZXZlbnQsIHJlc3BvbnNlKSA9PiB7XG4gICAgICAvLyBjb25zb2xlLmxvZygnZXZlbnQgcmVwbHkgbG9naW4tZXJyb3InKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIGNhbGxiYWNrKHJlc3BvbnNlKTtcbiAgICB9KTtcblxuICAgIGlwY1JlbmRlcmVyLm9uKCdsb2dpbi1zdWNjZXNzJywgKGV2ZW50LCByZXNwb25zZSkgPT4ge1xuICAgICAgLy8gY29uc29sZS5sb2coJ2V2ZW50IHJlcGx5IGxvZ2luLXN1Y2Nlc3MnKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcbiAgICAgIGNhbGxiYWNrKHJlc3BvbnNlKTtcbiAgICB9KTtcblxuICB9LFxuXG59KTtcblxuY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnZ2V0TWFzdGVyRGF0YScsIHtcbiAgZ2V0RGF0YTogYXN5bmMgKHBheWxvYWQ6IGFueSwgdXJsOiBzdHJpbmcpID0+IHtcbiAgICBpcGNSZW5kZXJlci5zZW5kKCdnZXRNYXN0ZXJEYXRhJywgcGF5bG9hZCk7XG4gIH0sXG4gIHJlY2VpdmVNZXNzYWdlOiAoY2FsbGJhY2s6IGFueSkgPT4ge1xuICAgIGlwY1JlbmRlcmVyLm9uKCdnZXQtbWFzdGVyLWVycm9yJywgKGV2ZW50LCByZXNwb25zZSkgPT4ge1xuICAgICAgY2FsbGJhY2socmVzcG9uc2UpO1xuICAgIH0pO1xuICAgIGlwY1JlbmRlcmVyLm9uKCdnZXQtbWFzdGVyLXN1Y2Nlc3MnLCAoZXZlbnQsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBjYWxsYmFjayhyZXNwb25zZSk7XG4gICAgfSk7XG4gIH0sXG59KTtcblxuY29udGV4dEJyaWRnZS5leHBvc2VJbk1haW5Xb3JsZCgnaW5zZXJ0RGVsaXZlcnlEYXRhJywge1xuICBpbnNlcnREYXRhOiBhc3luYyAocGF5bG9hZDogYW55LCB1cmw6IHN0cmluZykgPT4ge1xuICAgIGlwY1JlbmRlcmVyLnNlbmQoJ2RlbGl2ZXJ5QWRkJywgcGF5bG9hZCk7XG4gIH0sXG4gIHJlY2VpdmVNZXNzYWdlOiAoY2FsbGJhY2s6IGFueSkgPT4ge1xuICAgIGlwY1JlbmRlcmVyLm9uKCdkZWxpdmVyeS1hZGQtc3VjY2VzcycsIChldmVudCwgcmVzcG9uc2UpID0+IHtcbiAgICAgIGNhbGxiYWNrKHJlc3BvbnNlKTtcbiAgICB9KTtcbiAgICBpcGNSZW5kZXJlci5vbignZGVsaXZlcnktYWRkLWVycm9yJywgKGV2ZW50LCByZXNwb25zZSkgPT4ge1xuICAgICAgY2FsbGJhY2socmVzcG9uc2UpO1xuICAgIH0pO1xuICB9LFxufSk7XG5cbmNvbnRleHRCcmlkZ2UuZXhwb3NlSW5NYWluV29ybGQoJ2dldERlbGl2ZXJ5RGF0YScsIHtcbiAgZ2V0RGF0YTogYXN5bmMgKHBheWxvYWQ6IGFueSwgdXJsOiBzdHJpbmcpID0+IHtcbiAgICBpcGNSZW5kZXJlci5zZW5kKCdnZXREZWxpdmVyeURhdGEnLCBwYXlsb2FkKTtcbiAgfSxcbiAgcmVjZWl2ZU1lc3NhZ2U6IChjYWxsYmFjazogYW55KSA9PiB7XG4gICAgaXBjUmVuZGVyZXIub24oJ2dldC1kZWxpdmVyeS1zdWNjZXNzJywgKGV2ZW50LCByZXNwb25zZSkgPT4ge1xuICAgICAgY2FsbGJhY2socmVzcG9uc2UpO1xuICAgIH0pO1xuICAgIGlwY1JlbmRlcmVyLm9uKCdnZXQtZGVsaXZlcnktZXJyb3InLCAoZXZlbnQsIHJlc3BvbnNlKSA9PiB7XG4gICAgICBjYWxsYmFjayhyZXNwb25zZSk7XG4gICAgfSk7XG4gIH0sXG59KTtcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbmNvbnN0IHsgYXBwZW5kTG9hZGluZywgcmVtb3ZlTG9hZGluZyB9ID0gdXNlTG9hZGluZygpXG5kb21SZWFkeSgpLnRoZW4oYXBwZW5kTG9hZGluZylcblxud2luZG93Lm9ubWVzc2FnZSA9IChldikgPT4ge1xuICBldi5kYXRhLnBheWxvYWQgPT09ICdyZW1vdmVMb2FkaW5nJyAmJiByZW1vdmVMb2FkaW5nKClcbn1cblxuc2V0VGltZW91dChyZW1vdmVMb2FkaW5nLCA0OTk5KSJdLCJuYW1lcyI6WyJjb250ZXh0QnJpZGdlIiwiaXBjUmVuZGVyZXIiLCJhcmdzIl0sIm1hcHBpbmdzIjoiOztBQUdBQSxTQUFBQSxjQUFjLGtCQUFrQixlQUFlO0FBQUEsRUFDN0MsTUFBTSxNQUF5QztBQUN2QyxVQUFBLENBQUMsU0FBUyxRQUFRLElBQUk7QUFDckIsV0FBQUMscUJBQVksR0FBRyxTQUFTLENBQUMsVUFBVUMsVUFBUyxTQUFTLE9BQU8sR0FBR0EsS0FBSSxDQUFDO0FBQUEsRUFDN0U7QUFBQSxFQUNBLE9BQU8sTUFBMEM7QUFDL0MsVUFBTSxDQUFDLFNBQVMsR0FBRyxJQUFJLElBQUk7QUFDM0IsV0FBT0QscUJBQVksSUFBSSxTQUFTLEdBQUcsSUFBSTtBQUFBLEVBQ3pDO0FBQUEsRUFDQSxRQUFRLE1BQTJDO0FBQ2pELFVBQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxJQUFJO0FBQzNCLFdBQU9BLHFCQUFZLEtBQUssU0FBUyxHQUFHLElBQUk7QUFBQSxFQUMxQztBQUFBLEVBQ0EsVUFBVSxNQUE2QztBQUNyRCxVQUFNLENBQUMsU0FBUyxHQUFHLElBQUksSUFBSTtBQUMzQixXQUFPQSxxQkFBWSxPQUFPLFNBQVMsR0FBRyxJQUFJO0FBQUEsRUFBQTtBQUFBO0FBQUE7QUFLOUMsQ0FBQztBQUdELFNBQVMsU0FBUyxZQUFrQyxDQUFDLFlBQVksYUFBYSxHQUFHO0FBQ3hFLFNBQUEsSUFBSSxRQUFRLENBQVcsWUFBQTtBQUM1QixRQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxjQUFRLElBQUk7QUFBQSxJQUFBLE9BQ1A7QUFDSSxlQUFBLGlCQUFpQixvQkFBb0IsTUFBTTtBQUNsRCxZQUFJLFVBQVUsU0FBUyxTQUFTLFVBQVUsR0FBRztBQUMzQyxrQkFBUSxJQUFJO0FBQUEsUUFBQTtBQUFBLE1BQ2QsQ0FDRDtBQUFBLElBQUE7QUFB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
