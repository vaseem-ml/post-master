import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import Mongoose from "mongoose";
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { connect, set } from 'mongoose';
import os from 'node:os'
import fs from 'fs'
import { update } from './update'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
import master from './controllers/masters.controller';
import delivery from './controllers/delivery.controller';
import moment from "moment"
// const moment = require('moment');

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

console.log("process process")
console.log(process.env.APP_ROOT)


export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
export const VITE_DEV_SERVER_URL: any = process.env.VITE_DEV_SERVER_URL

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
console.log("preload ", preload)
console.log("indexHtml ", indexHtml)
console.log("RENDERER_DIST ", RENDERER_DIST)
console.log("VITE_DEV_SERVER_URL ", VITE_DEV_SERVER_URL)
console.log("process.env.VITE_PUBLIC ", process.env.VITE_PUBLIC)

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

  // win.loadURL(VITE_DEV_SERVER_URL)
  // Open devTool if the app is not packaged
  // win.webContents.openDevTools()

  // win.loadFile(indexHtml)


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
  // console.log('payload payload:', payload);

  try {
    // const docs = await master.insertMany(payload, { ordered: false });

    const bulkOps = payload.map((item: any) => ({
      updateOne: {
        filter: { facility_id: item.facility_id },
        update: { $set: item },
        upsert: true
      }
    }));

    // Perform the bulk operation
    const docs = await master.bulkWrite(bulkOps);
    // const docs = await master.bulkWrite(bulkOps, { ordered: false });

    // console.log('Bulk insert successful:', docs);
    event.reply('login-success', JSON.stringify({ status: true, data: docs }));
  } catch (err) {
    // console.log('Error during bulk insert:', err);
    event.reply('login-error', JSON.stringify({ status: false, data: err }));
  }


});

ipcMain.on('deliveryAdd', async (event, payload) => {

  try {

    // console.log("addding delivery data+++++++++++++++++=======")
    // const docs = await delivery.insertMany(payload, { ordered: false });
    // // console.log('Bulk insert successful:', docs);
    // event.reply('delivery-add-success', JSON.stringify({ status: true, data: docs }));


    const bulkOps = payload.map((item: any) => ({
      updateOne: {
        filter: { article: item.article }, // Check if the article already exists
        update: { $set: item },             // If found, update the document with new values
        upsert: true                        // If not found, insert the new document
      }
    }));

    // Perform the bulk operation
    const docs = await delivery.bulkWrite(bulkOps, { ordered: false });
    event.reply('delivery-add-success', JSON.stringify({ status: true, data: docs }));

  } catch (err) {
    // console.log('Error during bulk insert:', err);
    event.reply('delivery-add-error', JSON.stringify({ status: false, data: err }));
  }

});

ipcMain.on('getMasterData', async (event, filter) => {

  // console.log("get master data called");
  // console.log(filter);

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

ipcMain.on('deleteDelivery', async (event, filter) => {
  // console.log('delete function is calling+++++++++======', filter);
  // console.log('delete function is calling+++++++++======', filter.ids);

  try {
    const result = await delivery.deleteMany({ _id: filter.ids });
    event.reply('delete-delivery-success', JSON.stringify({ status: true, data: result }));
  } catch (error: any) {
    console.log('error+++++++++======', error);
    event.reply('delete-delivery-error', JSON.stringify({ status: false, data: error }));
  }

  // event.reply('delete-delivery-error', JSON.stringify({ status: false, data: "error" }));


});

ipcMain.on('updateDelivery', async (event, filter) => {

  // const { article, updatedStatus } = filter;
  // console.log("get delivery data called");
  // console.log(filter);

  try {
    const result = await delivery.updateOne({ article: filter?.article }, { status: filter?.status });
    event.reply('update-delivery-success', JSON.stringify({ status: true, data: result }));
  } catch (error: any) {
    console.log('error+++++++++======', error);
    event.reply('update-delivery-error', JSON.stringify({ status: false, data: error }));
  }

  // event.reply('update-delivery-error', JSON.stringify({ status: false, data: "error" }));

});

ipcMain.on('getDeliveryData', async (event, filter) => {

  console.log("get delivery data called");
  console.log(filter);

  // let cond = { company: Mongoose.Types.ObjectId(filter.company) }
  // let cond = {};

  let search = null;
  let sort: any = filter.sort ? filter.sort : { createdAt: -1 };

  // filter.sortKey = "exceeded_days"
  // filter.sortType = "ASC"
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

  //   case "exceeded_days":
  //     sort = { "exceeded_days": filter.sortType === "ASC" ? 1 : -1 }
  //     break;

  //   case "edd":
  //     sort = { "edd": filter.sortType === "ASC" ? 1 : -1 }
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
    // Object.assign(cond, { color: filter['status']})
  }

  if(filter.color) {
    Object.assign(cond, { color: filter['color']})
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

  console.log("this is condition++++++++++==========", cond)



  let limit = parseInt(filter.limit) || 10;
  let skip = (parseInt(filter.page) - 1) * limit || 0;

  const allItems: any = await delivery.aggregate([
    
    // { $sort: sort },
    {
      $lookup: {
        from: 'masters', // The name of your master collection
        localField: 'dest_ofc_id',
        foreignField: 'facility_id',
        as: 'masterData',
      },
    },
    {
      $addFields: {
        masterData: { $arrayElemAt: ['$masterData', 0] }, // Extract the first matching document
      },
    },
    {
      $addFields: {
        d: { $ifNull: ["$masterData.d2", 3]},
        
      }
    },
    {
      $addFields: {
        edd: {
          $toDate: {
            $add: [
              { $toDate: '$book_date' },
              { $multiply: [{ $subtract: [{ $toInt: '$d' }, 1] }, 24 * 60 * 60 * 1000] }, // Convert `$d` to a number
            ],
          },
        },
      }
    },
    {
      $addFields: {
        remainDays: {
          $divide: [
            {
              $subtract: [
                { $toLong: '$edd' },
                { $toLong: { $toDate: '$event_date' } },
              ],
            },
            1000 * 60 * 60 * 24,
          ],
        },
        
      }
    },
    {
      $addFields: {
        exceeded_days: {
          $cond: [{ $lt: ['$remainDays', 0] }, { $abs: '$remainDays' }, 0],
        },
      }
    },
    {
      $addFields: {
        color: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{ $gte: ['$remainDays', 0] }, { $eq: ['$status', 'Item Delivered'] }],
                },
                then: 'green',
              },
              {
                case: {
                  $and: [{ $lt: ['$remainDays', 0] }, { $gt: ['$remainDays', -2] }, { $ne: ['$status', 'Item Delivered'] }],
                },
                then: 'orange',
              },
              {
                case: {
                  $and: [{ $lt: ['$remainDays', -1] }, { $ne: ['$status', 'Item Delivered'] }],
                },
                then: 'red',
              },
              {
                case: {
                  $and: [{ $lte: ['$remainDays', 0] },  { $ne: ['$dest_ofc_id', '$office_id'] }, { $ne: ['$status', 'Item Delivered'] }],
                },
                then: 'yellow',
              },
            ],
            default: '',
          },
        },
      },
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
        event_date: { $dateToString: { format: "%Y-%m-%d", date: "$event_date" } },
        event_time: 1,
        ipvs_article_type: 1,
        bagid: 1,
        rts: 1,
        _id: 1,
        // is_deleted: 1,
        // is_active: 1,
        edd: { $dateToString: { format: "%Y-%m-%d", date: "$edd" } },
        d: 1,
        remainDays: 1,
        exceeded_days: 1,
        color: 1,
      }
    },
    // {
    //   $match: { color: 'red'},
    // },
    { $match: cond },
    { $sort: sort },
    {

      $facet: {
        total: [{ $count: 'createdAt' }],
        data: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],
      },
    },
    { $unwind: '$total' },
    {
      $project: {
        data: 1,
        meta: {
          total: '$total.createdAt',
          limit: { $literal: limit },
          page: { $literal: (skip / limit) + 1 },
          pages: { $ceil: { $divide: ['$total.createdAt', limit] } },
        },
      },
    },
    
  ]);


    // const refinedData = allItems[0].data.map((delivery:any) => {
    //   const edd
    //   const daysDiff = moment(delivery.book_date).diff(delivery.event_date, 'days');
    //   console.log('days+++++++==', daysDiff)
    //   console.log('delivery+++=', delivery)
    // })

    // console.log('all it/ems+++++++++', allItems[0].data)

    // allItems[0].data.map((delivery:any) => {
    //   // if(delivery.exceeded_days>0) {
    //     console.log('event date+++++', delivery.event_date)
    //     console.log('edd+++++', delivery.edd)
    //     console.log('status+++++', delivery.status)

    //     console.log('book+++++', delivery.book_date)
    //     console.log('remain days+++++', delivery.remainDays)
    //     console.log('color+++++', delivery.color)
    //     console.log("===========================")
    //   // }
    // })

    let holdVal;
    if (allItems && allItems.length) {
      
      holdVal = allItems[0];
    } else {
      holdVal = [];
    }



  // console.log(allItems[0]['data']);









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

ipcMain.on('getExportData', async (event, filter) => {

  console.log("get delivery data called");
  console.log(filter);

  // let cond = { company: Mongoose.Types.ObjectId(filter.company) }
  // let cond = {};

  let search = null;
  let sort: any = filter.sort ? filter.sort : { createdAt: -1 };

  // filter.sortKey = "exceeded_days"
  // filter.sortType = "ASC"
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

  //   case "exceeded_days":
  //     sort = { "exceeded_days": filter.sortType === "ASC" ? 1 : -1 }
  //     break;

  //   case "edd":
  //     sort = { "edd": filter.sortType === "ASC" ? 1 : -1 }
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
    // Object.assign(cond, { color: filter['status']})
  }

  if(filter.color) {
    Object.assign(cond, { color: filter['color']})
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

  console.log("this is condition++++++++++==========", cond)



  let limit = parseInt(filter.limit) || 10;
  let skip = (parseInt(filter.page) - 1) * limit || 0;

  const allItems: any = await delivery.aggregate([
    
    // { $sort: sort },
    {
      $lookup: {
        from: 'masters', // The name of your master collection
        localField: 'book_ofc',
        foreignField: 'facility_id',
        as: 'masterData',
      },
    },
    {
      $addFields: {
        masterData: { $arrayElemAt: ['$masterData', 0] }, // Extract the first matching document
      },
    },
    {
      $addFields: {
        d: { $ifNull: ["$masterData.d2", 3]},
        
      }
    },
    {
      $addFields: {
        edd: {
          $toDate: {
            $add: [
              { $toDate: '$book_date' },
              { $multiply: [{ $subtract: [{ $toInt: '$d' }, 1] }, 24 * 60 * 60 * 1000] }, // Convert `$d` to a number
            ],
          },
        },
      }
    },
    {
      $addFields: {
        remainDays: {
          $divide: [
            {
              $subtract: [
                { $toLong: '$edd' },
                { $toLong: { $toDate: '$event_date' } },
              ],
            },
            1000 * 60 * 60 * 24,
          ],
        },
        
      }
    },
    {
      $addFields: {
        exceeded_days: {
          $cond: [{ $lt: ['$remainDays', 0] }, { $abs: '$remainDays' }, 0],
        },
      }
    },
    {
      $addFields: {
        color: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{ $gte: ['$remainDays', 0] }, { $eq: ['$status', 'Item Delivered'] }],
                },
                then: 'green',
              },
              {
                case: {
                  $and: [{ $lt: ['$remainDays', 0] }, { $gt: ['$remainDays', -2] }, { $ne: ['$status', 'Item Delivered'] }],
                },
                then: 'orange',
              },
              {
                case: {
                  $and: [{ $lt: ['$remainDays', -1] }, { $ne: ['$status', 'Item Delivered'] }],
                },
                then: 'red',
              },
              {
                case: {
                  $and: [{ $lte: ['$remainDays', 0] },  { $ne: ['$dest_ofc_id', '$office_id'] }, { $ne: ['$status', 'Item Delivered'] }],
                },
                then: 'yellow',
              },
            ],
            default: '',
          },
        },
      },
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
        event_date: { $dateToString: { format: "%Y-%m-%d", date: "$event_date" } },
        event_time: 1,
        ipvs_article_type: 1,
        bagid: 1,
        rts: 1,
        _id: 1,
        // is_deleted: 1,
        // is_active: 1,
        edd: { $dateToString: { format: "%Y-%m-%d", date: "$edd" } },
        d: 1,
        remainDays: 1,
        exceeded_days: 1,
        color: 1,
      }
    },
    // {
    //   $match: { color: 'red'},
    // },
    { $match: cond },
    { $sort: sort },
    {

      $facet: {
        total: [{ $count: 'createdAt' }],
        data: [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ],
      },
    },
    { $unwind: '$total' },
    {
      $project: {
        data: 1,
        meta: {
          total: '$total.createdAt',
          limit: { $literal: limit },
          page: { $literal: (skip / limit) + 1 },
          pages: { $ceil: { $divide: ['$total.createdAt', limit] } },
        },
      },
    },
    
  ]);


    // const refinedData = allItems[0].data.map((delivery:any) => {
    //   const edd
    //   const daysDiff = moment(delivery.book_date).diff(delivery.event_date, 'days');
    //   console.log('days+++++++==', daysDiff)
    //   console.log('delivery+++=', delivery)
    // })

    // console.log('all it/ems+++++++++', allItems[0].data)

    // allItems[0].data.map((delivery:any) => {
    //   // if(delivery.exceeded_days>0) {
    //     console.log('event date+++++', delivery.event_date)
    //     console.log('edd+++++', delivery.edd)
    //     console.log('status+++++', delivery.status)

    //     console.log('book+++++', delivery.book_date)
    //     console.log('remain days+++++', delivery.remainDays)
    //     console.log('color+++++', delivery.color)
    //     console.log("===========================")
    //   // }
    // })

    let holdVal;
    if (allItems && allItems.length) {
      
      holdVal = allItems[0];
    } else {
      holdVal = [];
    }



  // console.log(allItems[0]['data']);









  // return {
  //   data: mergedData,
  //   meta: { total: 1680, limit: 10, page: 1, pages: 168 }, // Adjust meta values dynamically
  // };

  event.reply('get-export-success', JSON.stringify({ status: true, data: holdVal }));

  // try {
  //   const docs = await master.insertMany(payload, { ordered: false });
  //   // console.log('Bulk insert successful:', docs);
  //   event.reply('get-delivery-success', JSON.stringify({ status: true, data: docs }));
  // } catch (err) {
  //   // console.log('Error during bulk insert:', err);
  //   event.reply('get-delivery-error', JSON.stringify({ status: false, data: err }));
  // }



});

ipcMain.handle('save-file', async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: 'data.json',
    filters: [{ name: 'JSON Files', extensions: ['json'] }],
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, data);
    return { success: true };
  } else {
    return { success: false };
  }
});
