# easy-mindmap
![demo](./demo.gif)

## 🧠 Mindmap デモの紹介 | Mindmap Demo Overview

このプロジェクトは、軽量でシンプルな **Mindmap レンダリング機能** を備えた Vue アプリケーションです。  
他の重い Mindmap ライブラリとは異なり、**再帰処理や座標計算に依存しない構造**のため、非常に高速で軽量です。

> This project is a Vue application that provides a **lightweight and simple mindmap rendering** feature.  
> Unlike other heavy mindmap libraries, it does **not rely on recursive data structures or coordinate-based layout**, making it fast and lightweight.

### 🔧 主な機能 | Key Features

- ノードの編集 | Edit nodes  
- ノードの新規作成 | Create new nodes  
- ノードの移動 | Move nodes  
- ノードの削除 | Delete nodes  
- 画面全体の拡大・縮小 | Zoom in/out of the entire view  

### 🌿 軽量さの理由 | Why It's Lightweight

本アプリの特徴は以下の通りです：

> The following features make this app lightweight:

- データ構造は単純なオブジェクト配列で、再帰的な構造を必要としません。  
  > Uses a flat array of node objects—**no need for recursive processing**.
- ノードの位置はすべて HTML/CSS によって制御され、JavaScript で座標を指定する必要がありません。  
  > All node positioning is handled with **HTML/CSS**, **no JavaScript coordinate calculations** needed.

#### 💾 データ構造例 | Example Node Structure

```json
[
  {
    "id": 0,
    "text": "ch0",
    "url": "",
    "parent": "title",
    "direction": ""
  },
  {
    "id": 1,
    "text": "ch1",
    "url": "",
    "parent": "title",
    "direction": ""
  },
  {
    "id": 2,
    "text": "ch2",
    "url": "",
    "parent": "title",
    "direction": ""
  },
  {
    "id": 3,
    "text": "ch3",
    "url": "",
    "parent": "title",
    "direction": ""
  }
]
