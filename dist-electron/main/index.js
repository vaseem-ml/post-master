import { app, ipcMain, BrowserWindow, dialog, shell } from "electron";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Schema, model, connect } from "mongoose";
import os from "node:os";
import fs from "fs";
const { autoUpdater } = createRequire(import.meta.url)("electron-updater");
function update(win2) {
  autoUpdater.autoDownload = false;
  autoUpdater.disableWebInstaller = false;
  autoUpdater.allowDowngrade = false;
  autoUpdater.on("checking-for-update", function() {
  });
  autoUpdater.on("update-available", (arg) => {
    win2.webContents.send("update-can-available", { update: true, version: app.getVersion(), newVersion: arg == null ? void 0 : arg.version });
  });
  autoUpdater.on("update-not-available", (arg) => {
    win2.webContents.send("update-can-available", { update: false, version: app.getVersion(), newVersion: arg == null ? void 0 : arg.version });
  });
  ipcMain.handle("check-update", async () => {
    if (!app.isPackaged) {
      const error = new Error("The update feature is only available after the package.");
      return { message: error.message, error };
    }
    try {
      return await autoUpdater.checkForUpdatesAndNotify();
    } catch (error) {
      return { message: "Network error", error };
    }
  });
  ipcMain.handle("start-download", (event) => {
    startDownload(
      (error, progressInfo) => {
        if (error) {
          event.sender.send("update-error", { message: error.message, error });
        } else {
          event.sender.send("download-progress", progressInfo);
        }
      },
      () => {
        event.sender.send("update-downloaded");
      }
    );
  });
  ipcMain.handle("quit-and-install", () => {
    autoUpdater.quitAndInstall(false, true);
  });
}
function startDownload(callback, complete) {
  autoUpdater.on("download-progress", (info) => callback(null, info));
  autoUpdater.on("error", (error) => callback(error, null));
  autoUpdater.on("update-downloaded", complete);
  autoUpdater.downloadUpdate();
}
const masterSchema = new Schema(
  {
    facility_id: {
      type: String,
      unique: true,
      required: true
    },
    pincode: {
      type: String,
      allownull: true,
      required: false
    },
    booking_office: {
      type: String,
      allownull: true,
      required: false
    },
    office_name: {
      type: String,
      allownull: true,
      required: false
    },
    division: {
      type: String,
      allownull: true,
      required: false
    },
    region: {
      type: String,
      allownull: true,
      required: false
    },
    d1: {
      type: String,
      allownull: true,
      required: false
    },
    d2: {
      type: String,
      allownull: true,
      required: false
    },
    is_deleted: {
      type: Boolean,
      default: false,
      allownull: false,
      required: true
    },
    is_active: {
      type: Boolean,
      default: true,
      allownull: false,
      required: true
    }
  },
  {
    timestamps: true
  }
);
const master = model("master", masterSchema);
const deliverySchema = new Schema(
  {
    article: {
      type: String,
      required: true,
      unique: true
    },
    booking: {
      type: String
    },
    track: {
      type: String
    },
    cod: {
      type: String
    },
    book_ofc: {
      type: String
    },
    book_ofc_name: {
      type: String
    },
    dest_ofc_id: {
      type: String
    },
    dest_ofc_name: {
      type: String
    },
    book_id: {
      type: String
    },
    article_type: {
      type: String
    },
    weight: {
      type: String
    },
    book_date: {
      type: Date
    },
    book_time: {
      type: String
    },
    tariff: {
      type: String
    },
    prepaid_value: {
      type: String
    },
    sender_name: {
      type: String
    },
    sender_city: {
      type: String
    },
    sender_mobile: {
      type: String
    },
    receiver_name: {
      type: String
    },
    recevier_addr1: {
      type: String
    },
    recevier_addr2: {
      type: String
    },
    recevier_addr3: {
      type: String
    },
    receiver_city: {
      type: String
    },
    receiver_phone: {
      type: String
    },
    receiver_pin: {
      type: String
    },
    ins_value: {
      type: String
    },
    customer_id: {
      type: String
    },
    contract: {
      type: String
    },
    value: {
      type: String
    },
    service: {
      type: String
    },
    emo_message: {
      type: String
    },
    user_id: {
      type: String
    },
    user_name: {
      type: String
    },
    status: {
      type: String
    },
    office_id: {
      type: String
    },
    office_name: {
      type: String
    },
    event_date: {
      type: Date
    },
    event_time: {
      type: String
    },
    ipvs_article_type: {
      type: String
    },
    bagid: {
      type: String
    },
    rts: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
deliverySchema.index({ article: 1 }, { unique: true });
const delivery = model("delivery", deliverySchema);
createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "../..");
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();
if (process.platform === "win32") app.setAppUserModelId(app.getName());
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}
let win = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    }
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(indexHtml);
  }
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });
  update(win);
}
app.whenReady().then(createWindow).then(() => {
  connect(`mongodb://localhost:27017`, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }).then(async (err) => {
  }).catch((err) => {
    console.log("Error in db connection", err);
  });
});
app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});
app.on("second-instance", () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});
app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});
ipcMain.handle("open-win", (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  if (VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
  } else {
    childWindow.loadFile(indexHtml, { hash: arg });
  }
});
ipcMain.on("login", async (event, payload) => {
  try {
    const bulkOps = payload.map((item) => ({
      updateOne: {
        filter: { facility_id: item.facility_id },
        update: { $set: item },
        upsert: true
      }
    }));
    const docs = await master.bulkWrite(bulkOps);
    event.reply("login-success", JSON.stringify({ status: true, data: docs }));
  } catch (err) {
    event.reply("login-error", JSON.stringify({ status: false, data: err }));
  }
});
ipcMain.on("deliveryAdd", async (event, payload) => {
  try {
    const bulkOps = payload.map((item) => ({
      updateOne: {
        filter: { article: item.article },
        // Check if the article already exists
        update: { $set: item },
        // If found, update the document with new values
        upsert: true
        // If not found, insert the new document
      }
    }));
    const docs = await delivery.bulkWrite(bulkOps, { ordered: false });
    event.reply("delivery-add-success", JSON.stringify({ status: true, data: docs }));
  } catch (err) {
    event.reply("delivery-add-error", JSON.stringify({ status: false, data: err }));
  }
});
ipcMain.on("getMasterData", async (event, filter) => {
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
            $regex: ".*" + search + ".*",
            $options: "si"
          }
        }
      ]
    });
  }
  let sort = filter.sort ? filter.sort : { createdAt: -1 };
  let limit = parseInt(filter.limit) || 10;
  let skip = (parseInt(filter.page) - 1) * limit || 0;
  const allItems = await master.aggregate([
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
        updatedAt: 1
      }
    },
    {
      $facet: {
        total: [{ $count: "createdAt" }],
        data: [{
          $addFields: { _id: "$_id" }
        }]
      }
    },
    {
      $unwind: "$total"
    },
    {
      $project: {
        data: {
          $slice: ["$data", skip, {
            $ifNull: [limit, "$total.createdAt"]
          }]
        },
        meta: {
          total: "$total.createdAt",
          limit: {
            $literal: limit
          },
          page: {
            $literal: skip / limit + 1
          },
          pages: {
            $ceil: {
              $divide: ["$total.createdAt", limit]
            }
          }
        }
      }
    }
  ]);
  let holdVal = [];
  if (allItems && allItems.length) {
    holdVal = allItems[0];
  } else {
    holdVal = [];
  }
  event.reply("get-master-success", JSON.stringify({ status: true, data: holdVal }));
});
ipcMain.on("deleteDelivery", async (event, filter) => {
  try {
    const result = await delivery.deleteMany({ _id: filter.ids });
    event.reply("delete-delivery-success", JSON.stringify({ status: true, data: result }));
  } catch (error) {
    console.log("error+++++++++======", error);
    event.reply("delete-delivery-error", JSON.stringify({ status: false, data: error }));
  }
});
ipcMain.on("updateDelivery", async (event, filter) => {
  try {
    const result = await delivery.updateOne({ article: filter == null ? void 0 : filter.article }, { status: filter == null ? void 0 : filter.status });
    event.reply("update-delivery-success", JSON.stringify({ status: true, data: result }));
  } catch (error) {
    console.log("error+++++++++======", error);
    event.reply("update-delivery-error", JSON.stringify({ status: false, data: error }));
  }
});
ipcMain.on("getStatisticsData", async (event, filter) => {
  try {
    const statisticsData = await delivery.aggregate([
      {
        $lookup: {
          from: "masters",
          localField: "dest_ofc_id",
          foreignField: "facility_id",
          as: "masterData"
        }
      },
      {
        $addFields: {
          masterData: { $arrayElemAt: ["$masterData", 0] }
        }
      },
      {
        $addFields: {
          d: {
            $cond: {
              if: { $isArray: "$masterData.d2" },
              then: { $arrayElemAt: ["$masterData.d2", 0] },
              else: "$masterData.d2"
            }
          }
        }
      },
      {
        $addFields: {
          d: { $ifNull: ["$d", 3] }
          // Default value if `d` is null
        }
      },
      {
        $addFields: {
          edd: {
            $toDate: {
              $add: [
                { $toDate: "$book_date" },
                { $multiply: [{ $subtract: [{ $toInt: "$d" }, 1] }, 24 * 60 * 60 * 1e3] }
              ]
            }
          }
        }
      },
      {
        $addFields: {
          remainDays: {
            $divide: [
              { $subtract: [{ $toLong: "$edd" }, { $toLong: { $toDate: "$event_date" } }] },
              1e3 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $addFields: {
          exceeded_days: {
            $cond: [{ $lt: ["$remainDays", 0] }, { $abs: "$remainDays" }, 0]
          }
        }
      },
      {
        $addFields: {
          color: {
            $switch: {
              branches: [
                {
                  case: { $and: [{ $gte: ["$remainDays", 0] }, { $eq: ["$status", "Item Delivered"] }] },
                  then: "green"
                },
                {
                  case: { $and: [{ $lt: ["$remainDays", 0] }, { $gt: ["$remainDays", -2] }, { $ne: ["$status", "Item Delivered"] }] },
                  then: "orange"
                },
                {
                  case: { $and: [{ $lt: ["$remainDays", -1] }, { $ne: ["$status", "Item Delivered"] }] },
                  then: "red"
                },
                {
                  case: { $and: [{ $lte: ["$remainDays", 0] }, { $ne: ["$dest_ofc_id", "$office_id"] }, { $ne: ["$status", "Item Delivered"] }] },
                  then: "yellow"
                },
                {
                  case: {
                    $and: [
                      { $eq: ["$status", "Item Delivered"] },
                      { $gt: [{ $toDate: "$event_date" }, { $toDate: "$edd" }] }
                    ]
                  },
                  then: "purple"
                }
              ],
              default: ""
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          green: { $sum: { $cond: [{ $eq: ["$color", "green"] }, 1, 0] } },
          orange: { $sum: { $cond: [{ $eq: ["$color", "orange"] }, 1, 0] } },
          red: { $sum: { $cond: [{ $eq: ["$color", "red"] }, 1, 0] } },
          yellow: { $sum: { $cond: [{ $eq: ["$color", "yellow"] }, 1, 0] } },
          purple: { $sum: { $cond: [{ $eq: ["$color", "purple"] }, 1, 0] } },
          itemDelivered: { $sum: { $cond: [{ $eq: ["$status", "Item Delivered"] }, 1, 0] } },
          itemBooked: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          green: 1,
          orange: 1,
          red: 1,
          yellow: 1,
          purple: 1,
          itemDelivered: 1,
          itemBooked: 1
        }
      }
    ]);
    const data = statisticsData.length > 0 ? statisticsData[0] : {
      green: 0,
      orange: 0,
      red: 0,
      yellow: 0,
      itemDelivered: 0,
      itemBooked: 0
    };
    event.reply("get-statistic-success", JSON.stringify({ status: true, data }));
  } catch (error) {
    console.error("Aggregation Error:", error);
    event.reply("get-statistic-error", JSON.stringify({ status: false, data: error.message }));
  }
});
ipcMain.on("getDeliveryData", async (event, filter) => {
  console.log("get delivery data called");
  let sort = filter.sort ? filter.sort : { createdAt: -1 };
  let cond = {};
  if (filter.startDate && filter.endDate) {
    Object.assign(cond, {
      $and: [
        {
          "event_date": { $gte: new Date(filter.startDate) }
        },
        {
          "event_date": { $lte: new Date(filter.endDate) }
        }
      ]
    });
  }
  if (filter.status) {
    const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
    Object.assign(cond, { status: { $in: statusArray } });
  }
  console.log("this is color++++++++++=", filter.color);
  if (filter.color) {
    const colorArray = Array.isArray(filter.color) ? filter.color : [filter.color];
    Object.assign(cond, { color: { $in: colorArray } });
  }
  if (filter.search) {
    Object.assign(cond, {
      $or: [
        {
          article: {
            $regex: ".*" + filter.search + ".*",
            $options: "si"
          }
        },
        {
          book_ofc_name: {
            $regex: ".*" + filter.search + ".*",
            $options: "si"
          }
        }
      ]
    });
  }
  let limit = parseInt(filter.limit) || 10;
  let skip = (parseInt(filter.page) - 1) * limit || 0;
  const allItems = await delivery.aggregate([
    // { $sort: sort },
    {
      $lookup: {
        from: "masters",
        // The name of your master collection
        localField: "dest_ofc_id",
        foreignField: "facility_id",
        as: "masterData"
      }
    },
    {
      $addFields: {
        masterData: { $arrayElemAt: ["$masterData", 0] }
        // Extract the first matching document
      }
    },
    {
      $addFields: {
        d: { $ifNull: ["$masterData.d2", 3] }
      }
    },
    {
      $addFields: {
        edd: {
          $toDate: {
            $add: [
              { $toDate: "$book_date" },
              { $multiply: [{ $subtract: [{ $toInt: "$d" }, 1] }, 24 * 60 * 60 * 1e3] }
              // Convert `$d` to a number
            ]
          }
        }
      }
    },
    {
      $addFields: {
        remainDays: {
          $divide: [
            {
              $subtract: [
                { $toLong: "$edd" },
                { $toLong: { $toDate: "$event_date" } }
              ]
            },
            1e3 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $addFields: {
        exceeded_days: {
          $cond: [{ $lt: ["$remainDays", 0] }, { $abs: "$remainDays" }, 0]
        }
      }
    },
    {
      $addFields: {
        color: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{ $gte: ["$remainDays", 0] }, { $eq: ["$status", "Item Delivered"] }]
                },
                then: "green"
              },
              {
                case: {
                  $and: [{ $lt: ["$remainDays", 0] }, { $gt: ["$remainDays", -2] }, { $ne: ["$status", "Item Delivered"] }]
                },
                then: "orange"
              },
              {
                case: {
                  $and: [{ $lt: ["$remainDays", -1] }, { $ne: ["$status", "Item Delivered"] }]
                },
                then: "red"
              },
              {
                case: {
                  $and: [{ $lte: ["$remainDays", 0] }, { $ne: ["$dest_ofc_id", "$office_id"] }, { $ne: ["$status", "Item Delivered"] }]
                },
                then: "yellow"
              },
              {
                case: {
                  $and: [
                    { $eq: ["$status", "Item Delivered"] },
                    { $gt: [{ $toDate: "$event_date" }, { $toDate: "$edd" }] }
                  ]
                },
                then: "purple"
              }
            ],
            default: ""
          }
        }
      }
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
        color: 1
      }
    },
    // {
    //   $match: { color: 'red'},
    // },
    { $match: cond },
    { $sort: sort },
    {
      $facet: {
        total: [{ $count: "createdAt" }],
        data: [
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ]
      }
    },
    { $unwind: "$total" },
    {
      $project: {
        data: 1,
        meta: {
          total: "$total.createdAt",
          limit: { $literal: limit },
          page: { $literal: skip / limit + 1 },
          pages: { $ceil: { $divide: ["$total.createdAt", limit] } }
        }
      }
    }
  ]);
  let holdVal;
  if (allItems && allItems.length) {
    holdVal = allItems[0];
  } else {
    holdVal = [];
  }
  event.reply("get-delivery-success", JSON.stringify({ status: true, data: holdVal }));
});
ipcMain.on("getExportData", async (event, filter) => {
  let sort = filter.sort ? filter.sort : { createdAt: -1 };
  let cond = {};
  if (filter.startDate && filter.endDate) {
    Object.assign(cond, {
      $and: [
        {
          "event_date": { $gte: new Date(filter.startDate) }
        },
        {
          "event_date": { $lte: new Date(filter.endDate) }
        }
      ]
    });
  }
  if (filter.status) {
    const statusArray = Array.isArray(filter.status) ? filter.status : [filter.status];
    Object.assign(cond, { status: { $in: statusArray } });
  }
  console.log("this is color++++++++++=", filter.color);
  if (filter.color) {
    const colorArray = Array.isArray(filter.color) ? filter.color : [filter.color];
    Object.assign(cond, { color: { $in: colorArray } });
  }
  if (filter.search) {
    Object.assign(cond, {
      $or: [
        {
          article: {
            $regex: ".*" + filter.search + ".*",
            $options: "si"
          }
        },
        {
          book_ofc_name: {
            $regex: ".*" + filter.search + ".*",
            $options: "si"
          }
        }
      ]
    });
  }
  let limit = parseInt(filter.limit) || 10;
  let skip = (parseInt(filter.page) - 1) * limit || 0;
  const allItems = await delivery.aggregate([
    // { $sort: sort },
    {
      $lookup: {
        from: "masters",
        // The name of your master collection
        localField: "dest_ofc_id",
        foreignField: "facility_id",
        as: "masterData"
      }
    },
    {
      $addFields: {
        masterData: { $arrayElemAt: ["$masterData", 0] }
        // Extract the first matching document
      }
    },
    {
      $addFields: {
        d: { $ifNull: ["$masterData.d2", 3] }
      }
    },
    {
      $addFields: {
        edd: {
          $toDate: {
            $add: [
              { $toDate: "$book_date" },
              { $multiply: [{ $subtract: [{ $toInt: "$d" }, 1] }, 24 * 60 * 60 * 1e3] }
              // Convert `$d` to a number
            ]
          }
        }
      }
    },
    {
      $addFields: {
        remainDays: {
          $divide: [
            {
              $subtract: [
                { $toLong: "$edd" },
                { $toLong: { $toDate: "$event_date" } }
              ]
            },
            1e3 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $addFields: {
        exceeded_days: {
          $cond: [{ $lt: ["$remainDays", 0] }, { $abs: "$remainDays" }, 0]
        }
      }
    },
    {
      $addFields: {
        color: {
          $switch: {
            branches: [
              {
                case: {
                  $and: [{ $gte: ["$remainDays", 0] }, { $eq: ["$status", "Item Delivered"] }]
                },
                then: "green"
              },
              {
                case: {
                  $and: [{ $lt: ["$remainDays", 0] }, { $gt: ["$remainDays", -2] }, { $ne: ["$status", "Item Delivered"] }]
                },
                then: "orange"
              },
              {
                case: {
                  $and: [{ $lt: ["$remainDays", -1] }, { $ne: ["$status", "Item Delivered"] }]
                },
                then: "red"
              },
              {
                case: {
                  $and: [{ $lte: ["$remainDays", 0] }, { $ne: ["$dest_ofc_id", "$office_id"] }, { $ne: ["$status", "Item Delivered"] }]
                },
                then: "yellow"
              },
              {
                case: {
                  $and: [
                    { $eq: ["$status", "Item Delivered"] },
                    { $gt: [{ $toDate: "$event_date" }, { $toDate: "$edd" }] }
                  ]
                },
                then: "purple"
              }
            ],
            default: ""
          }
        }
      }
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
        color: 1
      }
    },
    // {
    //   $match: { color: 'red'},
    // },
    { $match: cond },
    { $sort: sort },
    {
      $facet: {
        total: [{ $count: "createdAt" }],
        data: [
          {
            $skip: skip
          },
          {
            $limit: limit
          }
        ]
      }
    },
    { $unwind: "$total" },
    {
      $project: {
        data: 1,
        meta: {
          total: "$total.createdAt",
          limit: { $literal: limit },
          page: { $literal: skip / limit + 1 },
          pages: { $ceil: { $divide: ["$total.createdAt", limit] } }
        }
      }
    }
  ]);
  let holdVal;
  if (allItems && allItems.length) {
    holdVal = allItems[0];
  } else {
    holdVal = [];
  }
  event.reply("get-export-success", JSON.stringify({ status: true, data: holdVal }));
});
ipcMain.handle("save-file", async (event, data) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    defaultPath: "data.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }]
  });
  if (!canceled && filePath) {
    fs.writeFileSync(filePath, data);
    return { success: true };
  } else {
    return { success: false };
  }
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
//# sourceMappingURL=index.js.map
