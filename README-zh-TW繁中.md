## 🧩 Web Clone Lab

把網頁變成可以編輯的前端專案。

Web Clone Lab 是一個以開發者為導向的 Chrome 擴充功能，用來擷取與重建網頁的前端結構，並將結果整理成可以繼續修改的本地專案。

在網路上看到有趣的網站？

抓下來。研究它。理解它。重新混合它。

---

## ✨ 功能

- 擷取目前網頁的 DOM 結構
- 收集網頁中的 CSS
- 收集 JavaScript 資源
- 偵測圖片與其他前端 Assets
- 偵測 Inline CSS 與 Inline JavaScript
- 探索 CSS 與 JavaScript 所引用的其他資源
- 建立前端資源關係圖
- 將資源重建成有組織的專案結構
- 將遠端資源路徑重新映射為本地路徑
- 重新寫入 HTML / CSS / JavaScript 中的資源路徑
- 產生包含擷取資訊與資源資訊的 Clone Manifest
- 將重建後的前端專案輸出成 ZIP
- 不需要專用後端即可進行主要處理

---

## 🧬 它是怎麼運作的？

Web Clone Lab 將一個網頁視為由許多相互連結的前端資源所組成。

網頁
 │
 ▼
Capture
 │
 ├── DOM
 ├── CSS
 ├── JavaScript
 ├── Images
 ├── Media
 ├── Inline CSS
 └── Inline JavaScript
 │
 ▼
Resource Discovery
 │
 ▼
Resource Graph
 │
 ▼
Download
 │
 ▼
Path Mapping
 │
 ▼
HTML / CSS / JS Rewriting
 │
 ▼
Local Project
 │
 ▼
📦 ZIP

它的目標不是重建網站的伺服器端系統，而是針對瀏覽器中可以觀察與擷取的前端層進行重建。

---

## 📁 產生的專案

重建後的網站會被整理成一般的本地前端專案結構。

例如：

web-clone/
├── index.html
├── css/
│   ├── ...
│   └── inline-1.css
├── js/
│   ├── ...
│   └── inline-1.js
├── assets/
│   ├── images/
│   ├── fonts/
│   └── ...
└── clone-manifest.json

資源 URL 會被映射到本地路徑，使輸出的專案更容易被直接檢查、修改與實驗。

---

## 🧪 為實驗而生

Web Clone Lab 不只是用來「複製網站」。

它更像是一個研究現代網頁如何組成的實驗室。

看到一個有趣的效果？

把它抓下來。

看看 HTML 怎麼組。

看看 CSS 怎麼寫。

看看 JavaScript 做了什麼。

然後改掉它。

Capture → Inspect → Remix → Create

---

## 🧬 Random Remix Website Laboratory (Comming Soon 👀)

然後，還有那個完全沒有必要存在的部分。

Random Remix

把一個或多個前端網站 ZIP 丟進實驗室，讓 Remix Engine 隨機混合它們的前端結構、樣式、腳本、元件與 Assets。

可以使用自己的專案。

可以使用 Web Clone Lab 輸出的專案。

也可以一次混合多個來源。

然後按下：

╔══════════════════════╗
║    RANDOM REMIX      ║
╚══════════════════════╝

你可能會得到一個很棒的東西。

也可能得到一個非常糟糕的東西。

甚至可能得到一個不知道為什麼居然能跑的東西。

沒有人知道。

---

## 🤡 PAN﻿DORA

最後的結果會被輸出成一個新的 ZIP 專案。

打開它。

修改它。

把它弄壞。

修好它。

然後再弄壞一次。

«一個 Bug 是問題。
一百個還能跑的 Bug，是實驗。»

---

## 🛠️ 專案架構

Web Clone Lab 採用瀏覽器端的模組化處理流程。

Chrome Extension
│
├── Popup
│   └── 使用者介面與 Clone 流程
│
├── Background
│   ├── Capture 協調
│   └── 資源取得
│
├── Content Capture
│   └── DOM 與前端資源擷取
│
├── Resource Manager
│   └── 資源去重與分類
│
├── CSS Scanner
│   └── CSS 相依資源探索
│
├── JavaScript Scanner
│   └── JavaScript 資源探索
│
├── Builder
│   └── 本地專案與路徑建立
│
├── Rewriter
│   └── 遠端 URL → 本地路徑
│
└── ZIP Engine
    └── 最終專案封裝

各模組保持相對獨立，使 Capture、分析、重建與未來的 Remix 系統可以分開演進。

---

## ⚠️ Web Clone Lab 不會做什麼？

Web Clone Lab 是一個前端重建工具，不是完整的網站伺服器 Clone 系統。

它不會嘗試自動重建：

- Server-side application logic
- Database
- Private API
- Authentication system
- Server-side rendering infrastructure
- WebSocket backend
- 私有或伺服器端狀態
- 無法從前端觀察到的伺服器功能

現代網站也可能包含動態行為、受保護資源、Framework Runtime、外部服務以及其他無法完整重建的機制。

因此，輸出結果應被視為：

«前端 Snapshot / Reconstruction»

而不是保證與原始網站完全一致的複製品。

---

## 🚧 實驗性專案

Web Clone Lab 是一個實驗性工具。

有些網站可能重建得非常接近。

有些網站可能只能部分運作。

有些網站可能會直接壞得很精彩。

這就是 Laboratory 的一部分。

它的目的不是保證每一個網站都能被完美複製，而是讓前端拆解、研究、修改與實驗變得更容易。

---

## ⚖️ 負責任地使用

只有在你擁有適當權利或取得授權的情況下，才應該擷取、重複使用、修改或重新發布網頁程式碼與 Assets。

本專案主要用途包括：

- 學習
- 前端實驗
- 開發
- Prototype
- 經授權的測試
- 個人專案
- 自己作品的 Remix

請勿使用 Web Clone Lab 複製、冒充或未經授權重新發布他人的網站或 Assets。

---

## 📜 License

請參閱本專案的 License 檔案以了解授權資訊。

---

## 🧩 Web Clone Lab

抓下來。

理解它。

重新混合它。

然後做出自己的東西。

---

## 📬 聯繫創作者

- Instagram：[a370373/XRH](https://instagram.com/a370373)
- 本人17歲🤔 做的不好請見諒
- 獨立開發 ＆ AI協作
- 緩慢更新 ＆ 除錯
- 純手機Termux 開發👀
- 持續開發中…

---

## 👀 作品 & 產品 集

- [WCL - Web Clone Lab](https://github.com/a370373/web-clone-lab/)
- [RWM - 1:1 Real World Minecraft](https://github.com/a370373/RWM-Real-World-Minecraft)                               
- [MyAI - offline Personal AI Agent System](https://github.com/a370373/MyAI-Offline-Personal-AI-Agent-System-/tree/main)
- 持續增加中…👀
                                   
---

## 🤖 AI 協作

"Web Clone Lab" 由 a370373/XRH 發起、設計與開發。

開發過程中使用 OpenAI ChatGPT 作為 AI 協作夥伴，協助進行 技術分析、程式碼檢查、除錯 & 文件整理。

產品方向、設計理念 & 最終決策由專案創作者負責。

