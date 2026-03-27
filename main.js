const { app, BrowserWindow, dialog, ipcMain, session, screen } = require("electron");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const { Readable } = require("stream");
const { pipeline } = require("stream/promises");

let win = null;
let deckBuilderWin = null;

const BASE_VIEWPORT = {
  width: 1600,
  height: 960
};

function getDiagnosticLogPath() {
  const logDir = path.join(app.getPath("userData"), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  return path.join(logDir, "diagnostics.log");
}

function getDiagnosticStatePath() {
  const logDir = path.join(app.getPath("userData"), "logs");
  fs.mkdirSync(logDir, { recursive: true });
  return path.join(logDir, "last-diagnostic-state.json");
}

function writeLastDiagnosticState(entry) {
  try {
    fs.writeFileSync(getDiagnosticStatePath(), JSON.stringify({
      timestamp: new Date().toISOString(),
      ...entry
    }, null, 2), "utf8");
  } catch {
    // Ignore diagnostic write failures.
  }
}

async function appendDiagnosticLog(entry) {
  const line = `${JSON.stringify({
    timestamp: new Date().toISOString(),
    ...entry
  })}\n`;
  await fsp.appendFile(getDiagnosticLogPath(), line, "utf8");
}

function toSafeName(input) {
  return String(input || "")
    .replace(/[^\w.-]+/g, "_")
    .slice(0, 120);
}

async function downloadToFile(url, outputPath) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const tmpPath = `${outputPath}.tmp`;
  try {
    if (res.body && typeof Readable.fromWeb === "function") {
      await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tmpPath));
    } else {
      const ab = await res.arrayBuffer();
      await fsp.writeFile(tmpPath, Buffer.from(ab));
    }
    await fsp.rename(tmpPath, outputPath);
  } catch (error) {
    await fsp.unlink(tmpPath).catch(() => {});
    throw error;
  }
}

async function cacheImageUrls(payload, sender = null) {
  const deckId = toSafeName(payload && payload.deckId ? payload.deckId : "deck");
  const taskId = String(payload && payload.taskId ? payload.taskId : "");
  const urls = Array.isArray(payload && payload.urls) ? [...new Set(payload.urls.map((url) => String(url || "").trim()).filter(Boolean))] : [];
  const userData = app.getPath("userData");
  const root = path.join(userData, "deck-image-cache", deckId);
  await fsp.mkdir(root, { recursive: true });
  const resultMap = {};
  const concurrency = Math.min(8, Math.max(3, Math.ceil(urls.length / 10) || 3));
  let cursor = 0;
  let completed = 0;

  const emitProgress = () => {
    if (!sender || !taskId) {
      return;
    }
    sender.send("cache-image-urls-progress", {
      taskId,
      done: completed,
      total: urls.length
    });
  };

  const processUrl = async (url) => {
    if (!/^https?:\/\//i.test(url)) {
      completed += 1;
      emitProgress();
      return;
    }
    try {
      const u = new URL(url);
      const ext = path.extname(u.pathname) || ".img";
      const fileName = `${toSafeName(path.basename(u.pathname, ext))}_${Buffer.from(url).toString("base64url").slice(0, 10)}${ext}`;
      const out = path.join(root, fileName);
      if (!fs.existsSync(out)) {
        await downloadToFile(url, out);
      }
      resultMap[url] = `file://${out.replace(/\\/g, "/")}`;
    } catch {
      // Ignore individual cache failures and continue.
    } finally {
      completed += 1;
      emitProgress();
    }
  };

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < urls.length) {
      const currentIndex = cursor;
      cursor += 1;
      await processUrl(urls[currentIndex]);
    }
  });

  await Promise.all(workers);

  return { map: resultMap, taskId };
}

function chooseWindowSize() {
  const workArea = screen.getPrimaryDisplay().workAreaSize;
  const margin = 40;
  const maxWidth = Math.max(960, workArea.width - margin);
  const maxHeight = Math.max(600, workArea.height - margin);
  const ratio = BASE_VIEWPORT.width / BASE_VIEWPORT.height;

  let width = Math.min(BASE_VIEWPORT.width, maxWidth);
  let height = Math.round(width / ratio);

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * ratio);
  }

  return {
    width: Math.max(960, width),
    height: Math.max(600, height)
  };
}

function computeZoomFactor(contentWidth, contentHeight) {
  const widthRatio = contentWidth / BASE_VIEWPORT.width;
  const heightRatio = contentHeight / BASE_VIEWPORT.height;
  // 取寬高中較小的比例，確保整個棋盤都能顯示在畫面中
  const zoomFactor = Math.min(widthRatio, heightRatio);
  return Math.max(0.5, Number(zoomFactor.toFixed(3)));
}

function createWindow() {
  const size = chooseWindowSize();
  win = new BrowserWindow({
    width: size.width,
    height: size.height,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: "#5fa35e",
    center: true,
    icon: path.join(__dirname, "assets", "app-icon.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true
    }
  });

  win.loadFile(path.join(__dirname, "index.html"));

  win.webContents.on("did-finish-load", () => {
    const [contentWidth, contentHeight] = win.getContentSize();
    win.webContents.setZoomFactor(computeZoomFactor(contentWidth, contentHeight));
  });

  // 視窗大小改變時自動重新計算縮放
  win.on("resize", () => {
    if (win && !win.isDestroyed()) {
      const [cw, ch] = win.getContentSize();
      win.webContents.setZoomFactor(computeZoomFactor(cw, ch));
    }
  });

  win.webContents.on("render-process-gone", (_event, details) => {
    writeLastDiagnosticState({
      source: "main",
      type: "render-process-gone",
      details
    });
    void appendDiagnosticLog({
      source: "main",
      type: "render-process-gone",
      details
    }).catch(() => {});
    // 渲染進程崩潰時自動重新載入，避免白屏
    if (details && details.reason !== "clean-exit") {
      setTimeout(() => {
        if (win && !win.isDestroyed()) {
          win.webContents.reload();
        }
      }, 800);
    }
  });

  win.webContents.on("unresponsive", () => {
    writeLastDiagnosticState({
      source: "main",
      type: "unresponsive"
    });
    void appendDiagnosticLog({
      source: "main",
      type: "unresponsive"
    }).catch(() => {});
  });

  win.on("close", (event) => {
    const choice = dialog.showMessageBoxSync(win, {
      type: "question",
      buttons: ["取消", "確認離開"],
      defaultId: 1,
      cancelId: 0,
      title: "離開程式",
      message: "確定要關閉 PTCG Simulator 嗎？"
    });

    if (choice === 0) {
      event.preventDefault();
    }
  });
}

function createDeckBuilderWindow() {
  if (deckBuilderWin && !deckBuilderWin.isDestroyed()) {
    if (deckBuilderWin.isMinimized()) {
      deckBuilderWin.restore();
    }
    deckBuilderWin.focus();
    return deckBuilderWin;
  }

  deckBuilderWin = new BrowserWindow({
    width: 1480,
    height: 920,
    frame: false,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    minimizable: true,
    autoHideMenuBar: true,
    backgroundColor: "#0a0f12",
    center: true,
    parent: win || undefined,
    icon: path.join(__dirname, "assets", "app-icon.ico"),
    title: "PTCG 牌組編輯器",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true
    }
  });

  deckBuilderWin.loadFile(path.join(__dirname, "index.html"), {
    query: {
      deckBuilderWindow: "1"
    }
  });

  deckBuilderWin.on("closed", () => {
    deckBuilderWin = null;
  });

  return deckBuilderWin;
}

app.whenReady().then(() => {
  session.defaultSession.setPermissionRequestHandler((_, permission, callback) => {
    if (permission === "media" || permission === "microphone" || permission === "camera") {
      callback(true);
      return;
    }
    callback(true);
  });

  ipcMain.handle("cache-image-urls", async (event, payload) => cacheImageUrls(payload, event.sender));
  ipcMain.handle("show-open-dialog", async (_event, options) => {
    const parentWin = deckBuilderWin && !deckBuilderWin.isDestroyed() ? deckBuilderWin : win;
    return dialog.showOpenDialog(parentWin, options || {});
  });
  ipcMain.handle("open-deck-builder-window", async () => {
    createDeckBuilderWindow();
    return true;
  });
  ipcMain.handle("export-deck-builder-file", async (_event, payload) => {
    const suggestedName = String(payload && payload.name || "未命名牌組").trim() || "未命名牌組";
    const rawText = String(payload && payload.rawText || "");
    const result = await dialog.showSaveDialog(deckBuilderWin && !deckBuilderWin.isDestroyed() ? deckBuilderWin : win, {
      title: "匯出牌組檔案",
      defaultPath: `${suggestedName}.txt`,
      filters: [
        { name: "文字檔", extensions: ["txt"] },
        { name: "所有檔案", extensions: ["*"] }
      ]
    });
    if (result.canceled || !result.filePath) {
      return { ok: false, error: "已取消匯出" };
    }
    await fsp.writeFile(result.filePath, rawText, "utf8");
    return { ok: true, filePath: result.filePath };
  });
  ipcMain.handle("apply-deck-builder-to-owner", async (_event, payload) => {
    if (!win || win.isDestroyed()) {
      return { ok: false, error: "主視窗不存在" };
    }
    try {
      const serialized = JSON.stringify(payload || {}).replace(/</g, "\\u003c");
      const result = await win.webContents.executeJavaScript(`window.__applyDeckBuilderPayload(${serialized})`, true);
      return result || { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : "套用牌組失敗"
      };
    }
  });
  ipcMain.on("deck-library-updated", (event) => {
    for (const target of [win, deckBuilderWin]) {
      if (!target || target.isDestroyed()) {
        continue;
      }
      if (target.webContents.id === event.sender.id) {
        continue;
      }
      target.webContents.send("deck-library-updated");
    }
  });
  ipcMain.on("set-deck-builder-window-title", (_event, title) => {
    if (!deckBuilderWin || deckBuilderWin.isDestroyed()) {
      return;
    }
    deckBuilderWin.setTitle(String(title || "PTCG 牌組編輯器"));
  });
  ipcMain.handle("set-resolution", async (_event, payload) => {
    if (!win || win.isDestroyed()) return { ok: false };
    const { width, height, fullscreen } = payload || {};
    if (fullscreen) {
      win.setResizable(true);
      win.setMaximizable(true);
      win.setFullScreenable(true);
      win.setFullScreen(true);
      // 等全螢幕完成後更新 zoom
      setTimeout(() => {
        if (win && !win.isDestroyed()) {
          const [cw, ch] = win.getContentSize();
          win.webContents.setZoomFactor(computeZoomFactor(cw, ch));
        }
      }, 500);
      return { ok: true, width: 0, height: 0, fullscreen: true };
    }
    // 退出全螢幕
    if (win.isFullScreen()) {
      win.setFullScreen(false);
      await new Promise(r => setTimeout(r, 500));
    }
    const w = Number(width) || 1600;
    const h = Number(height) || 960;
    win.setResizable(true);
    win.setSize(w, h, true);
    win.center();
    win.setResizable(false);
    win.setMaximizable(false);
    win.setFullScreenable(false);
    const [cw, ch] = win.getContentSize();
    win.webContents.setZoomFactor(computeZoomFactor(cw, ch));
    return { ok: true, width: w, height: h, fullscreen: false };
  });

  ipcMain.handle("get-resolution", async () => {
    if (!win || win.isDestroyed()) return { width: 1600, height: 960, fullscreen: false };
    const isFs = win.isFullScreen();
    const [w, h] = win.getSize();
    return { width: w, height: h, fullscreen: isFs };
  });

  ipcMain.on("update-diagnostic-state", (_, payload) => {
    writeLastDiagnosticState({
      source: "renderer",
      ...(payload && typeof payload === "object" ? payload : { payload })
    });
  });
  ipcMain.handle("append-diagnostic-log", async (_, payload) => {
    await appendDiagnosticLog({
      source: "renderer",
      ...(payload && typeof payload === "object" ? payload : { payload })
    });
    return true;
  });
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("child-process-gone", (_event, details) => {
  writeLastDiagnosticState({
    source: "main",
    type: "child-process-gone",
    details
  });
  void appendDiagnosticLog({
    source: "main",
    type: "child-process-gone",
    details
  }).catch(() => {});
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
