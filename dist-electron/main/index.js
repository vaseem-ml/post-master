import { app as r, ipcMain as d, BrowserWindow as f, shell as P } from "electron";
import { createRequire as w } from "node:module";
import { fileURLToPath as V } from "node:url";
import p from "node:path";
import { Schema as v, model as S, connect as N } from "mongoose";
import T from "node:os";
const { autoUpdater: o } = w(import.meta.url)("electron-updater");
function x(t) {
  o.autoDownload = !1, o.disableWebInstaller = !1, o.allowDowngrade = !1, o.on("checking-for-update", function() {
  }), o.on("update-available", (e) => {
    t.webContents.send("update-can-available", { update: !0, version: r.getVersion(), newVersion: e == null ? void 0 : e.version });
  }), o.on("update-not-available", (e) => {
    t.webContents.send("update-can-available", { update: !1, version: r.getVersion(), newVersion: e == null ? void 0 : e.version });
  }), d.handle("check-update", async () => {
    if (!r.isPackaged) {
      const e = new Error("The update feature is only available after the package.");
      return { message: e.message, error: e };
    }
    try {
      return await o.checkForUpdatesAndNotify();
    } catch (e) {
      return { message: "Network error", error: e };
    }
  }), d.handle("start-download", (e) => {
    U(
      (a, s) => {
        a ? e.sender.send("update-error", { message: a.message, error: a }) : e.sender.send("download-progress", s);
      },
      () => {
        e.sender.send("update-downloaded");
      }
    );
  }), d.handle("quit-and-install", () => {
    o.quitAndInstall(!1, !0);
  });
}
function U(t, e) {
  o.on("download-progress", (a) => t(null, a)), o.on("error", (a) => t(a, null)), o.on("update-downloaded", e), o.downloadUpdate();
}
const L = new v(
  {
    pincode: {
      type: String,
      allownull: !0,
      required: !1
    },
    facility_id: {
      type: String,
      unique: !0,
      required: !0
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
), m = S("master", L), $ = new v(
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
$.index({ article: 1 }, { unique: !0 });
const h = S("delivery", $);
w(import.meta.url);
const b = p.dirname(V(import.meta.url));
process.env.APP_ROOT = p.join(b, "../..");
const H = p.join(process.env.APP_ROOT, "dist-electron"), k = p.join(process.env.APP_ROOT, "dist"), _ = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = _ ? p.join(process.env.APP_ROOT, "public") : k;
T.release().startsWith("6.1") && r.disableHardwareAcceleration();
process.platform === "win32" && r.setAppUserModelId(r.getName());
r.requestSingleInstanceLock() || (r.quit(), process.exit(0));
let n = null;
const A = p.join(b, "../preload/index.mjs"), D = p.join(k, "index.html");
async function q() {
  n = new f({
    title: "Main window",
    icon: p.join(process.env.VITE_PUBLIC, "favicon.ico"),
    webPreferences: {
      preload: A
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // nodeIntegration: true,
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      // contextIsolation: false,
    }
  }), _ ? (n.loadURL(_), n.webContents.openDevTools()) : n.loadFile(D), n.webContents.on("did-finish-load", () => {
    n == null || n.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), n.webContents.setWindowOpenHandler(({ url: t }) => (t.startsWith("https:") && P.openExternal(t), { action: "deny" })), x(n);
}
r.whenReady().then(q).then(() => {
  N("mongodb://localhost:27017", {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  }).then(async (t) => {
    console.log("download done");
  }).catch((t) => {
    console.log("Error in db connection", t);
  });
});
r.on("window-all-closed", () => {
  n = null, process.platform !== "darwin" && r.quit();
});
r.on("second-instance", () => {
  n && (n.isMinimized() && n.restore(), n.focus());
});
r.on("activate", () => {
  const t = f.getAllWindows();
  t.length ? t[0].focus() : q();
});
d.handle("open-win", (t, e) => {
  const a = new f({
    webPreferences: {
      preload: A,
      nodeIntegration: !0,
      contextIsolation: !1
    }
  });
  _ ? a.loadURL(`${_}#${e}`) : a.loadFile(D, { hash: e });
});
d.on("login", async (t, e) => {
  try {
    const a = await m.insertMany(e, { ordered: !1 });
    t.reply("login-success", JSON.stringify({ status: !0, data: a }));
  } catch (a) {
    t.reply("login-error", JSON.stringify({ status: !1, data: a }));
  }
});
d.on("deliveryAdd", async (t, e) => {
  try {
    console.log("addding delivery data+++++++++++++++++=======");
    const a = await h.insertMany(e, { ordered: !1 });
    t.reply("delivery-add-success", JSON.stringify({ status: !0, data: a }));
  } catch (a) {
    t.reply("delivery-add-error", JSON.stringify({ status: !1, data: a }));
  }
});
d.on("getMasterData", async (t, e) => {
  console.log("get master data called"), console.log(e);
  let a = {}, s = null;
  e.search !== null && (s = e.search), s && Object.assign(a, {
    $or: [
      {
        facility_id: {
          $regex: ".*" + s + ".*",
          $options: "si"
        }
      }
    ]
  });
  let u = e.sort ? e.sort : { createdAt: -1 }, l = parseInt(e.limit) || 10, i = (parseInt(e.page) - 1) * l || 0;
  const c = await m.aggregate([
    // {
    //   $match: cond
    // },
    {
      $sort: u
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
          $slice: ["$data", i, {
            $ifNull: [l, "$total.createdAt"]
          }]
        },
        meta: {
          total: "$total.createdAt",
          limit: {
            $literal: l
          },
          page: {
            $literal: i / l + 1
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
  c && c.length ? g = c[0] : g = [], t.reply("get-master-success", JSON.stringify({ status: !0, data: g }));
});
d.on("delete", async (t, e) => {
});
d.on("update", async (t, e) => {
});
d.on("getDeliveryData", async (t, e) => {
  console.log("get delivery data called"), console.log(e);
  let a = e.sort ? e.sort : { createdAt: -1 }, s = {};
  e.startDate && e.endDate && Object.assign(s, {
    $and: [
      {
        event_date: { $gte: new Date(e.startDate) }
      },
      {
        event_date: { $lte: new Date(e.endDate) }
      }
    ]
  }), e.status !== null && Object.assign(s, { status: e.status }), e.search && Object.assign(s, {
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
  let u = parseInt(e.limit) || 10, l = (parseInt(e.page) - 1) * u || 0;
  const i = await h.aggregate([
    {
      $match: s
    },
    {
      $sort: a
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
          $slice: ["$data", l, {
            $ifNull: [u, "$total.createdAt"]
          }]
        },
        meta: {
          total: "$total.createdAt",
          limit: {
            $literal: u
          },
          page: {
            $literal: l / u + 1
          },
          pages: {
            $ceil: {
              $divide: ["$total.createdAt", u]
            }
          }
        }
      }
    }
  ]);
  let c = [];
  if (i && (i != null && i.length)) {
    const g = i[0].data.map((y) => y.book_ofc).filter(Boolean), I = [...new Set(g)], O = await m.find({ facility_id: { $in: I } }), R = i[0].data.map((y) => {
      const j = O.find((E) => E.facility_id === y.book_ofc);
      return {
        ...y,
        // Plain object, no need for toObject()
        masterData: j || null
        // Add master data or null if not found
      };
    });
    i && i.length ? (i[0].data = R, c = i[0]) : c = [];
  } else
    c = [];
  t.reply("get-delivery-success", JSON.stringify({ status: !0, data: c }));
});
export {
  H as MAIN_DIST,
  k as RENDERER_DIST,
  _ as VITE_DEV_SERVER_URL
};
