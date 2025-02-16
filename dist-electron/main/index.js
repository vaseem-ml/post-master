import { app as n, ipcMain as o, BrowserWindow as m, dialog as I, shell as A } from "electron";
import { createRequire as y } from "node:module";
import { fileURLToPath as j } from "node:url";
import p from "node:path";
import { Schema as f, model as v, connect as q } from "mongoose";
import F from "node:os";
import N from "fs";
const { autoUpdater: d } = y(import.meta.url)("electron-updater");
function x(a) {
  d.autoDownload = !1, d.disableWebInstaller = !1, d.allowDowngrade = !1, d.on("checking-for-update", function() {
  }), d.on("update-available", (e) => {
    a.webContents.send("update-can-available", { update: !0, version: n.getVersion(), newVersion: e == null ? void 0 : e.version });
  }), d.on("update-not-available", (e) => {
    a.webContents.send("update-can-available", { update: !1, version: n.getVersion(), newVersion: e == null ? void 0 : e.version });
  }), o.handle("check-update", async () => {
    if (!n.isPackaged) {
      const e = new Error("The update feature is only available after the package.");
      return { message: e.message, error: e };
    }
    try {
      return await d.checkForUpdatesAndNotify();
    } catch (e) {
      return { message: "Network error", error: e };
    }
  }), o.handle("start-download", (e) => {
    E(
      (t, r) => {
        t ? e.sender.send("update-error", { message: t.message, error: t }) : e.sender.send("download-progress", r);
      },
      () => {
        e.sender.send("update-downloaded");
      }
    );
  }), o.handle("quit-and-install", () => {
    d.quitAndInstall(!1, !0);
  });
}
function E(a, e) {
  d.on("download-progress", (t) => a(null, t)), d.on("error", (t) => a(t, null)), d.on("update-downloaded", e), d.downloadUpdate();
}
const R = new f(
  {
    facility_id: {
      type: String,
      unique: !0,
      required: !0
    },
    pincode: {
      type: String,
      allownull: !0,
      required: !1
    },
    booking_office: {
      type: String,
      allownull: !0,
      required: !1
    },
    office_name: {
      type: String,
      allownull: !0,
      required: !1
    },
    division: {
      type: String,
      allownull: !0,
      required: !1
    },
    region: {
      type: String,
      allownull: !0,
      required: !1
    },
    d1: {
      type: String,
      allownull: !0,
      required: !1
    },
    d2: {
      type: String,
      allownull: !0,
      required: !1
    },
    is_deleted: {
      type: Boolean,
      default: !1,
      allownull: !1,
      required: !0
    },
    is_active: {
      type: Boolean,
      default: !0,
      allownull: !1,
      required: !0
    }
  },
  {
    timestamps: !0
  }
), w = v("master", R), S = new f(
  {
    article: {
      type: String,
      required: !0,
      unique: !0
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
    timestamps: !0
  }
);
S.index({ article: 1 }, { unique: !0 });
const _ = v("delivery", S);
y(import.meta.url);
const h = p.dirname(j(import.meta.url));
process.env.APP_ROOT = p.join(h, "../..");
const C = p.join(process.env.APP_ROOT, "dist-electron"), D = p.join(process.env.APP_ROOT, "dist"), $ = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = $ ? p.join(process.env.APP_ROOT, "public") : D;
F.release().startsWith("6.1") && n.disableHardwareAcceleration();
process.platform === "win32" && n.setAppUserModelId(n.getName());
n.requestSingleInstanceLock() || (n.quit(), process.exit(0));
let i = null;
const b = p.join(h, "../preload/index.mjs"), k = p.join(D, "index.html");
async function O() {
  i = new m({
    title: "Main window",
    icon: p.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: b
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    }
  }), $ ? (i.loadURL($), i.webContents.openDevTools()) : i.loadFile(k), i.webContents.on("did-finish-load", () => {
    i == null || i.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i.webContents.setWindowOpenHandler(({ url: a }) => (a.startsWith("https:") && A.openExternal(a), { action: "deny" })), x(i);
}
n.whenReady().then(O).then(() => {
  q("mongodb://localhost:27017", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }).then(async (a) => {
  }).catch((a) => {
    console.log("Error in db connection", a);
  });
});
n.on("window-all-closed", () => {
  i = null, process.platform !== "darwin" && n.quit();
});
n.on("second-instance", () => {
  i && (i.isMinimized() && i.restore(), i.focus());
});
n.on("activate", () => {
  const a = m.getAllWindows();
  a.length ? a[0].focus() : O();
});
o.handle("open-win", (a, e) => {
  const t = new m({
    webPreferences: {
      preload: b,
      nodeIntegration: !0,
      contextIsolation: !1
    }
  });
  $ ? t.loadURL(`${$}#${e}`) : t.loadFile(k, { hash: e });
});
o.on("login", async (a, e) => {
  try {
    const t = e.map((s) => ({
      updateOne: {
        filter: { facility_id: s.facility_id },
        update: { $set: s },
        upsert: !0
      }
    })), r = await w.bulkWrite(t);
    a.reply("login-success", JSON.stringify({ status: !0, data: r }));
  } catch (t) {
    a.reply("login-error", JSON.stringify({ status: !1, data: t }));
  }
});
o.on("deliveryAdd", async (a, e) => {
  try {
    const t = e.map((s) => ({
      updateOne: {
        filter: { article: s.article },
        // Check if the article already exists
        update: { $set: s },
        // If found, update the document with new values
        upsert: !0
        // If not found, insert the new document
      }
    })), r = await _.bulkWrite(t, { ordered: !1 });
    a.reply("delivery-add-success", JSON.stringify({ status: !0, data: r }));
  } catch (t) {
    a.reply("delivery-add-error", JSON.stringify({ status: !1, data: t }));
  }
});
o.on("getMasterData", async (a, e) => {
  let t = {}, r = null;
  e.search !== null && (r = e.search), r && Object.assign(t, {
    $or: [
      {
        facility_id: {
          $regex: ".*" + r + ".*",
          $options: "si"
        }
      }
    ]
  });
  let s = e.sort ? e.sort : { createdAt: -1 }, l = parseInt(e.limit) || 10, u = (parseInt(e.page) - 1) * l || 0;
  const c = await w.aggregate([
    // {
    //   $match: cond
    // },
    {
      $sort: s
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
          $slice: ["$data", u, {
            $ifNull: [l, "$total.createdAt"]
          }]
        },
        meta: {
          total: "$total.createdAt",
          limit: {
            $literal: l
          },
          page: {
            $literal: u / l + 1
          },
          pages: {
            $ceil: {
              $divide: ["$total.createdAt", l]
            }
          }
        }
      }
    }
  ]);
  let g = [];
  c && c.length ? g = c[0] : g = [], a.reply("get-master-success", JSON.stringify({ status: !0, data: g }));
});
o.on("deleteDelivery", async (a, e) => {
  try {
    const t = await _.deleteMany({ _id: e.ids });
    a.reply("delete-delivery-success", JSON.stringify({ status: !0, data: t }));
  } catch (t) {
    console.log("error+++++++++======", t), a.reply("delete-delivery-error", JSON.stringify({ status: !1, data: t }));
  }
});
o.on("updateDelivery", async (a, e) => {
  try {
    const t = await _.updateOne({ article: e == null ? void 0 : e.article }, { status: e == null ? void 0 : e.status });
    a.reply("update-delivery-success", JSON.stringify({ status: !0, data: t }));
  } catch (t) {
    console.log("error+++++++++======", t), a.reply("update-delivery-error", JSON.stringify({ status: !1, data: t }));
  }
});
o.on("getStatisticsData", async (a, e) => {
  const t = {
    orange: 4,
    green: 4,
    red: 4,
    yellow: 4,
    purple: 4,
    itemDelivered: 4,
    itemBooked: 4
  };
  a.reply("get-statistic-success", JSON.stringify({ status: !0, data: t }));
});
o.on("getDeliveryData", async (a, e) => {
  console.log("get delivery data called");
  let t = e.sort ? e.sort : { createdAt: -1 }, r = {};
  e.startDate && e.endDate && Object.assign(r, {
    $and: [
      {
        event_date: { $gte: new Date(e.startDate) }
      },
      {
        event_date: { $lte: new Date(e.endDate) }
      }
    ]
  }), e.status !== null && Object.assign(r, { status: e.status }), e.color && Object.assign(r, { color: e.color }), e.search && Object.assign(r, {
    $or: [
      {
        article: {
          $regex: ".*" + e.search + ".*",
          $options: "si"
        }
      },
      {
        book_ofc_name: {
          $regex: ".*" + e.search + ".*",
          $options: "si"
        }
      }
    ]
  });
  let s = parseInt(e.limit) || 10, l = (parseInt(e.page) - 1) * s || 0;
  const u = await _.aggregate([
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
    { $match: r },
    { $sort: t },
    {
      $facet: {
        total: [{ $count: "createdAt" }],
        data: [
          {
            $skip: l
          },
          {
            $limit: s
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
          limit: { $literal: s },
          page: { $literal: l / s + 1 },
          pages: { $ceil: { $divide: ["$total.createdAt", s] } }
        }
      }
    }
  ]);
  let c;
  u && u.length ? c = u[0] : c = [], a.reply("get-delivery-success", JSON.stringify({ status: !0, data: c }));
});
o.on("getExportData", async (a, e) => {
  let t = e.sort ? e.sort : { createdAt: -1 }, r = {};
  e.startDate && e.endDate && Object.assign(r, {
    $and: [
      {
        event_date: { $gte: new Date(e.startDate) }
      },
      {
        event_date: { $lte: new Date(e.endDate) }
      }
    ]
  }), e.status !== null && Object.assign(r, { status: e.status }), e.color && Object.assign(r, { color: e.color }), e.search && Object.assign(r, {
    $or: [
      {
        article: {
          $regex: ".*" + e.search + ".*",
          $options: "si"
        }
      },
      {
        book_ofc_name: {
          $regex: ".*" + e.search + ".*",
          $options: "si"
        }
      }
    ]
  }), console.log("this is condition++++++++++==========", r);
  let s = parseInt(e.limit) || 10, l = (parseInt(e.page) - 1) * s || 0;
  const u = await _.aggregate([
    // { $sort: sort },
    {
      $lookup: {
        from: "masters",
        // The name of your master collection
        localField: "book_ofc",
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
    { $match: r },
    { $sort: t },
    {
      $facet: {
        total: [{ $count: "createdAt" }],
        data: [
          {
            $skip: l
          },
          {
            $limit: s
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
          limit: { $literal: s },
          page: { $literal: l / s + 1 },
          pages: { $ceil: { $divide: ["$total.createdAt", s] } }
        }
      }
    }
  ]);
  let c;
  u && u.length ? c = u[0] : c = [], a.reply("get-export-success", JSON.stringify({ status: !0, data: c }));
});
o.handle("save-file", async (a, e) => {
  const { canceled: t, filePath: r } = await I.showSaveDialog({
    defaultPath: "data.json",
    filters: [{ name: "JSON Files", extensions: ["json"] }]
  });
  return !t && r ? (N.writeFileSync(r, e), { success: !0 }) : { success: !1 };
});
export {
  C as MAIN_DIST,
  D as RENDERER_DIST,
  $ as VITE_DEV_SERVER_URL
};
