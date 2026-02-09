# RPG Browser MVP

Phaser 3 + TypeScriptで作成した、RPGツクール風2D RPGの探索特化MVPです。

## 機能

- 2Dマップ移動（キーボード）
- NPC会話（分岐）
- クエスト1本（受注・進行・完了）
- セーブ/ロード（localStorage: `slot1`）
- タイトル/マップ/メニューの基本画面

## セットアップ

```bash
npm install
npm run dev
```

## 操作

- 移動: 矢印キー
- 調べる/会話: `E`
- 決定: `Enter`
- メニュー: `Esc`

## テスト

```bash
npm run test
npm run test:e2e
```

E2EテストはPlaywrightのブラウザ実体が必要です。制約環境でローカルブラウザを配置できない場合は、
`PW_TEST_CONNECT_WS_ENDPOINT` に接続先ブラウザの WebSocket エンドポイントを渡すと、
リモートブラウザ経由で実行できます。

```bash
PW_TEST_CONNECT_WS_ENDPOINT=ws://<remote-browser-endpoint> npm run test:e2e
```

## データ構成

- クエスト: `src/data/quests.json`
- 会話: `src/data/dialogues.json`
- マップ(Tiled JSON): `public/assets/maps/town.json`
