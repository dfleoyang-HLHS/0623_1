# 貪吃蛇 Snake 🐍

網頁版經典貪吃蛇遊戲，使用純 HTML / CSS / JavaScript 製作，無需任何框架或後端，可直接部署至 GitHub Pages。

**[▶ 線上遊玩 Demo](https://your-username.github.io/snake/)**

---

## 功能特色

| 功能 | 說明 |
|------|------|
| 🎮 四種速度 | 慢速 / 普通 / 快速 / 極速 |
| 📈 等級系統 | 每吃 5 個食物升一級，速度自動提升 |
| ⭐ 獎勵食物 | 每吃 7 個食物出現限時金色獎勵（5 秒）|
| 🏆 最高分 | 儲存於 localStorage，關閉後不流失 |
| ⌨️ 多種操控 | 方向鍵、WASD、螢幕方向鍵、滑動手勢 |
| 📱 響應式 | 手機與桌面均可遊玩 |
| ⏸ 暫停 | 按 P 鍵或螢幕中間暫停按鈕 |

---

## 計分規則

- **一般食物（紅）**：`10 × 等級` 分
- **獎勵食物（金）**：`50 × 等級` 分，5 秒限時

---

## 操控方式

| 輸入 | 動作 |
|------|------|
| ← ↑ → ↓ 方向鍵 | 移動 |
| W A S D | 移動 |
| 螢幕方向鍵 | 移動（手機）|
| 滑動畫面 | 移動（手機）|
| P | 暫停 / 繼續 |
| Esc | 結束遊戲 |

---

## 部署至 GitHub Pages

### 方法一：直接上傳（適合新手）

1. 在 GitHub 建立新 repository（例如 `snake`）
2. 上傳所有檔案（`index.html`、`css/`、`js/`、`assets/`）
3. 進入 **Settings → Pages**
4. Source 選擇 **Deploy from a branch**，Branch 選 `main`，資料夾選 `/ (root)`
5. 儲存後等待約 1 分鐘，即可透過 `https://your-username.github.io/snake/` 遊玩

### 方法二：使用 Git 指令

```bash
git clone https://github.com/your-username/snake.git
cd snake

# 複製遊戲檔案進此目錄
git add .
git commit -m "feat: add snake game"
git push origin main
```

---

## 檔案結構

```
snake/
├── index.html          # 主頁面
├── css/
│   └── style.css       # 樣式（霓虹賽博龐克風）
├── js/
│   └── game.js         # 遊戲邏輯
├── assets/
│   └── favicon.svg     # 網站圖示
└── README.md
```

---

## 技術細節

- **語言**：原生 HTML5 / CSS3 / ES6+ JavaScript
- **繪圖**：Canvas 2D API（`roundRect`、`shadowBlur`）
- **儲存**：`localStorage`（最高分）
- **動畫**：`setTimeout` 遊戲迴圈
- **字體**：Google Fonts（Share Tech Mono、Noto Sans TC）
- **相依套件**：無

---

## 授權

MIT License — 自由使用、修改、散佈。
