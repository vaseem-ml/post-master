import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// --------- Preload scripts loading ---------
function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise(resolve => {
    if (condition.includes(document.readyState)) {
      resolve(true)
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true)
        }
      })
    }
  })
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find(e => e === child)) {
      return parent.appendChild(child)
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find(e => e === child)) {
      return parent.removeChild(child)
    }
  },
}

/**
 * https://tobiasahlin.com/spinkit
 * https://connoratherton.com/loaders
 * https://projects.lukehaas.me/css-loaders
 * https://matejkustec.github.io/SpinThatShit
 */
function useLoading() {
  const className = `loaders-css__square-spin`
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
    `
  const oStyle = document.createElement('style')
  const oDiv = document.createElement('div')

  oStyle.id = 'app-loading-style'
  oStyle.innerHTML = styleContent
  oDiv.className = 'app-loading-wrap'
  oDiv.innerHTML = `<div class="${className}"><div></div></div>`

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle)
      safeDOM.append(document.body, oDiv)
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle)
      safeDOM.remove(document.body, oDiv)
    },
  }
}


contextBridge.exposeInMainWorld('loginAPI', {
  login: async (payload: any, url: string) => {
    console.log('login hit from preload');
    console.log(payload);
    console.log(url);
    ipcRenderer.send('login', payload);
  },
  receiveMessage: (callback: any) => {

    ipcRenderer.on('login-error', (event, response) => {
      // console.log('event reply login-error');
      // console.log(response);
      callback(response);
    });

    ipcRenderer.on('login-success', (event, response) => {
      // console.log('event reply login-success');
      // console.log(response);
      callback(response);
    });

  },

});

contextBridge.exposeInMainWorld('getMasterData', {
  getData: async (payload: any, url: string) => {
    ipcRenderer.send('getMasterData', payload);
  },
  receiveMessage: (callback: any) => {
    ipcRenderer.on('get-master-error', (event, response) => {
      callback(response);
    });
    ipcRenderer.on('get-master-success', (event, response) => {
      callback(response);
    });
  },
});

contextBridge.exposeInMainWorld('insertDeliveryData', {
  insertData: async (payload: any, url: string) => {
    ipcRenderer.send('deliveryAdd', payload);
  },
  receiveMessage: (callback: any) => {
    ipcRenderer.on('delivery-add-success', (event, response) => {
      callback(response);
    });
    ipcRenderer.on('delivery-add-error', (event, response) => {
      callback(response);
    });
  },
});

contextBridge.exposeInMainWorld('getDeliveryData', {
  getData: async (payload: any, url: string) => {
    ipcRenderer.send('getDeliveryData', payload);
  },
  receiveMessage: (callback: any) => {
    ipcRenderer.on('get-delivery-success', (event, response) => {
      callback(response);
    });
    ipcRenderer.on('get-delivery-error', (event, response) => {
      callback(response);
    });
  },
});

contextBridge.exposeInMainWorld('deleteDelivery', {
  deleteCall: async (payload: any, url: string) => {
    ipcRenderer.send('deleteDelivery', payload);
  },
  receiveMessage: (callback: any) => {
    ipcRenderer.on('delete-delivery-success', (event, response) => {
      callback(response);
    });
    ipcRenderer.on('delete-delivery-error', (event, response) => {
      callback(response);
    });
  },
});

contextBridge.exposeInMainWorld('updateDelivery', {
  updateCall: async (payload: any, url: string) => {
    ipcRenderer.send('updateDelivery', payload);
  },
  receiveMessage: (callback: any) => {
    ipcRenderer.on('update-delivery-success', (event, response) => {
      callback(response);
    });
    ipcRenderer.on('update-delivery-error', (event, response) => {
      callback(response);
    });
  },
});


// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading()
domReady().then(appendLoading)

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading()
}

setTimeout(removeLoading, 4999)