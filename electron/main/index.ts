import { app, BrowserWindow, shell, ipcMain } from 'electron'
import Mongoose from "mongoose";
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { connect, set } from 'mongoose';
import os from 'node:os'
import { update } from './update'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import master from './controllers/masters.controller';
import delivery from './controllers/delivery.controller';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.mjs   > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.APP_ROOT = path.join(__dirname, '../..')

export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

let win: BrowserWindow | null = null
const preload = path.join(__dirname, '../preload/index.mjs')
const indexHtml = path.join(RENDERER_DIST, 'index.html')

async function createWindow() {
  win = new BrowserWindow({
    title: 'Main window',
    icon: path.join(process.env.VITE_PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,

      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) { // #298
    win.loadURL(VITE_DEV_SERVER_URL)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Auto update
  update(win)
}

app.whenReady().then(createWindow).then(() => {
  connect(`mongodb://localhost:27017`, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }).then(async (err) => {

    console.log("download done");

    // const admin = await client.find({});
    // console.log("admin", admin);

  })
    .catch((err) => {
      console.log("Error in db connection", err)
    })

})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})


ipcMain.on('login', async (event, payload) => {

  try {
    const docs = await master.insertMany(payload, { ordered: false });
    // console.log('Bulk insert successful:', docs);
    event.reply('login-success', JSON.stringify({ status: true, data: docs }));
  } catch (err) {
    // console.log('Error during bulk insert:', err);
    event.reply('login-error', JSON.stringify({ status: false, data: err }));
  }

});

ipcMain.on('deliveryAdd', async (event, payload) => {

  try {

    console.log("addding delivery data+++++++++++++++++=======")
    const docs = await delivery.insertMany(payload, { ordered: false });
    // console.log('Bulk insert successful:', docs);
    event.reply('delivery-add-success', JSON.stringify({ status: true, data: docs }));
  } catch (err) {
    // console.log('Error during bulk insert:', err);
    event.reply('delivery-add-error', JSON.stringify({ status: false, data: err }));
  }

});

ipcMain.on('getMasterData', async (event, filter) => {

  console.log("get master data called");
  console.log(filter);

  // let cond = { company: Mongoose.Types.ObjectId(filter.company) }
  let cond = {};
  let search = null;
  if (filter.search !== null) {
    search = filter.search;
  }

  if (search) {
    Object.assign(cond, {
      $or: [
        {
          facility_id: {
            $regex: '.*' + search + '.*', $options: 'si'
          }
        },
      ]
    })
  }

  let sort: any = filter.sort ? filter.sort : { createdAt: -1 };

  let limit = parseInt(filter.limit) || 10;
  let skip = (parseInt(filter.page) - 1) * limit || 0;

  const allItems: any = await master.aggregate([
    // {
    //   $match: cond
    // },
    {
      $sort: sort
    },
    {
      $project: {
        pincode: 1,
        facility_id: 1,
        booking_office: 1,
        office_name: 1,
        division: 1,
        region: 1,
        d1: 1,
        d2: 1,
        _id: 1,
        is_deleted: 1,
        is_active: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    },
    {
      $facet: {
        total: [{ $count: 'createdAt' }],
        data: [{
          $addFields: { _id: '$_id', }
        }],
      },
    },
    {
      $unwind: '$total'
    },
    {
      $project: {
        data: {
          $slice: ['$data', skip, {
            $ifNull: [limit, '$total.createdAt']
          }]
        },
        meta: {
          total: '$total.createdAt',
          limit: {
            $literal: limit
          },
          page: {
            $literal: ((skip / limit) + 1)
          },
          pages: {
            $ceil: {
              $divide: ['$total.createdAt', limit]
            }
          },
        },
      },
    },
  ]);



  // console.log("allItems i got");
  // console.log(allItems);
  let holdVal = [];
  if (allItems && allItems.length) {
    holdVal = allItems[0];
  } else {
    holdVal = [];
  }

  event.reply('get-master-success', JSON.stringify({ status: true, data: holdVal }));

  // try {
  //   const docs = await master.insertMany(payload, { ordered: false });
  //   // console.log('Bulk insert successful:', docs);
  //   event.reply('login-success', JSON.stringify({ status: true, data: docs }));
  // } catch (err) {
  //   // console.log('Error during bulk insert:', err);
  //   event.reply('login-error', JSON.stringify({ status: false, data: err }));
  // }

});

ipcMain.on('delete', async (event, filter) => {
});

ipcMain.on('update', async (event, filter) => {
});

ipcMain.on('getDeliveryData', async (event, filter) => {

  console.log("get delivery data called");
  console.log(filter);

  // let cond = { company: Mongoose.Types.ObjectId(filter.company) }
  // let cond = {};

  let search = null;
  let sort: any = filter.sort ? filter.sort : { createdAt: -1 };


  // switch (filter.sortKey) {

  //   case "book_ofc":
  //     sort = { "book_ofc": filter.sortType === "ASC" ? 1 : -1 }
  //     break;

  //   case "event_date":
  //     sort = { "event_date": filter.sortType === "ASC" ? 1 : -1 }
  //     break;

  //   case "status":
  //     sort = { "status": filter.sortType === "ASC" ? 1 : -1 }
  //     break;

  //   default:
  //     break;

  // }

  let cond: any = {}

  if (filter.startDate && filter.endDate) {
    Object.assign(cond, {
      $and: [
        {
          "event_date": { $gte: new Date(filter.startDate) },
        },
        {
          "event_date": { $lte: new Date(filter.endDate) },
        },
      ]
    })
  }

  if (filter.status !== null) {
    Object.assign(cond, { status: filter['status'] })
  }


  if (filter.search) {
    Object.assign(cond, {
      $or: [
        {
          article: {
            $regex: '.*' + filter.search + '.*', $options: 'si'
          }
        },
        {
          book_ofc_name: {
            $regex: '.*' + filter.search + '.*', $options: 'si'
          }
        },
      ]
    });
  }



  let limit = parseInt(filter.limit) || 10;
  let skip = (parseInt(filter.page) - 1) * limit || 0;

  const allItems: any = await delivery.aggregate([
    {
      $match: cond
    },
    {
      $sort: sort
    },
    {
      $project: {
        article: 1,
        booking: 1,
        track: 1,
        cod: 1,
        book_ofc: 1,
        book_ofc_name: 1,
        dest_ofc_id: 1,
        dest_ofc_name: 1,
        book_id: 1,
        article_type: 1,
        weight: 1,
        book_date: 1,
        book_time: 1,
        tariff: 1,
        prepaid_value: 1,
        sender_name: 1,
        sender_city: 1,
        sender_mobile: 1,
        receiver_name: 1,
        recevier_addr1: 1,
        recevier_addr2: 1,
        recevier_addr3: 1,
        receiver_city: 1,
        receiver_phone: 1,
        receiver_pin: 1,
        ins_value: 1,
        customer_id: 1,
        contract: 1,
        value: 1,
        service: 1,
        emo_message: 1,
        user_id: 1,
        user_name: 1,
        status: 1,
        office_id: 1,
        office_name: 1,
        event_date: 1,
        event_time: 1,
        ipvs_article_type: 1,
        bagid: 1,
        rts: 1,
        _id: 1,
        is_deleted: 1,
        is_active: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    },
    {
      $facet: {
        total: [{ $count: 'createdAt' }],
        data: [{
          $addFields: { _id: '$_id', }
        }],
      },
    },
    {
      $unwind: '$total'
    },
    {
      $project: {
        data: {
          $slice: ['$data', skip, {
            $ifNull: [limit, '$total.createdAt']
          }]
        },
        meta: {
          total: '$total.createdAt',
          limit: {
            $literal: limit
          },
          page: {
            $literal: ((skip / limit) + 1)
          },
          pages: {
            $ceil: {
              $divide: ['$total.createdAt', limit]
            }
          },
        },
      },
    },
  ]);

  // console.log("this is all items+++++++++=", allItems[0]);

  let holdVal = [];
  if (allItems && allItems?.length) {
    const bookOfcIds = allItems[0].data.map((item: any) => item.book_ofc).filter(Boolean);
    const uniqueBookOfcIds = [...new Set(bookOfcIds)];
    const masterData = await master.find({ facility_id: { $in: uniqueBookOfcIds } })


    const mergedData = allItems[0].data.map((delivery: any) => {
      const matchingMaster = masterData.find(master => master.facility_id === delivery.book_ofc);
      return {
        ...delivery, // Plain object, no need for toObject()
        masterData: matchingMaster || null, // Add master data or null if not found
      };
    });


    if (allItems && allItems.length) {
      allItems[0]["data"] = mergedData
      holdVal = allItems[0];
    } else {
      holdVal = [];
    }

  } else {
    holdVal = [];
  }








  // return {
  //   data: mergedData,
  //   meta: { total: 1680, limit: 10, page: 1, pages: 168 }, // Adjust meta values dynamically
  // };

  event.reply('get-delivery-success', JSON.stringify({ status: true, data: holdVal }));

  // try {
  //   const docs = await master.insertMany(payload, { ordered: false });
  //   // console.log('Bulk insert successful:', docs);
  //   event.reply('get-delivery-success', JSON.stringify({ status: true, data: docs }));
  // } catch (err) {
  //   // console.log('Error during bulk insert:', err);
  //   event.reply('get-delivery-error', JSON.stringify({ status: false, data: err }));
  // }



});