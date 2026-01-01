# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

クレジットカード利用明細CSVをブラウザ内で可視化するSPAアプリ。データは外部サーバーに送信されず、IndexedDB（Dexie）にローカル保存される。

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド（型チェック + Viteビルド）
npm run build

# リント
npm run lint

# フォーマット
npm run fmt:fix      # 修正
npm run fmt:check    # チェックのみ

# テスト
npm test                        # 全テスト実行
npm test -- path/to/file.test.ts  # 単一ファイル実行
```

## アーキテクチャ

### データレイヤー (`src/data/`)

- **db.ts**: Dexie（IndexedDB）データベース定義
- **payments/**: 支払いデータ管理（CSVインポート、クエリ）
- **tags/**: タグ・タグルール管理
- **index.ts**: 全exportsの一元管理（公開API）

外部からのインポートは `src/data` 経由で行う:

```typescript
import { usePayments, useTags, db } from "@/data";
```

### ルーティング (`src/routes/`)

TanStack Routerのファイルベースルーティング。`routeTree.gen.ts`は自動生成される。

| パス                  | 用途                          |
| --------------------- | ----------------------------- |
| `/`                   | CSVアップロード、ファイル一覧 |
| `/payments/:fileName` | 支払い詳細（3タブ切替）       |
| `/settings`           | タグ設定管理                  |

### ページ (`src/pages/`)

ページコンポーネントと関連UIコンポーネント。ルートファイルからインポートされる。

## 技術スタック

- **UI**: React 19 + Tailwind CSS + DaisyUI
- **ルーティング**: TanStack Router（自動コード分割）
- **データ**: Dexie（IndexedDB）+ dexie-react-hooks（`useLiveQuery`）
- **エラー処理**: neverthrow（`Result`/`ResultAsync`型）
- **グラフ**: Recharts
- **テスト**: Vitest + Testing Library

## エラーハンドリングパターン

neverthrowを使用した型安全なエラー処理:

```typescript
import { ResultAsync } from "neverthrow";
import { createErr } from "@/utils/createErr";

// エラー時は createErr() でログ出力 + Err返却
return createErr(new SomeError("message"));
```

## CI/CD

PRマージには以下すべてのパスが必要:

1. `npm run fmt:check` - Prettierチェック
2. `npm run lint` - ESLintチェック
3. `npm test` - Vitestテスト
4. `npm run build` - ビルド成功
