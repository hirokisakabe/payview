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

- **db.ts**: Dexie（IndexedDB）データベース定義・マイグレーション
- **payments/**: 支払いデータ管理（CSVインポート、クエリ）
- **categories/**: カテゴリ・カテゴリルール管理
- **utils/**: データレイヤー共通ユーティリティ
- **errors.ts**: 共通エラー定義（`DataError`）
- **types.ts**: 共通型定義（`QueryResult`）
- **index.ts**: 全exportsの一元管理（公開API）

外部からのインポートは `src/data` 経由で行う:

```typescript
import { usePayments, useCategories, db } from "@/data";
```

### ルーティング (`src/routes/`)

TanStack Routerのファイルベースルーティング。`routeTree.gen.ts`は自動生成される。

| パス                  | 用途                                          |
| --------------------- | --------------------------------------------- |
| `/`                   | CSVアップロード、月別推移グラフ、ファイル一覧 |
| `/payments/:fileName` | 支払い詳細（3タブ切替）                       |
| `/settings`           | カテゴリ設定管理                              |

### ページ (`src/pages/`)

ページコンポーネントと関連UIコンポーネント。ルートファイルからインポートされる。

## 技術スタック

- **UI**: React 19 + Tailwind CSS + DaisyUI
- **ルーティング**: TanStack Router（自動コード分割）
- **データ**: Dexie（IndexedDB）+ dexie-react-hooks（`useLiveQuery`）
- **エラー処理**: try/catch + カスタムエラークラス
- **ドラッグ&ドロップ**: @dnd-kit（カテゴリ並べ替え）
- **グラフ**: Recharts
- **テスト**: Vitest + Testing Library

## エラーハンドリングパターン

try/catch + カスタムエラークラスを使用:

```typescript
export async function addCategory(input: Input): Promise<string> {
  try {
    // DB操作など
    return id;
  } catch (err) {
    throw new AddCategoryError("カテゴリの追加に失敗しました。", {
      cause: err,
    });
  }
}

// UI側
try {
  await addCategory({ name });
} catch (err) {
  if (err instanceof AddCategoryError) {
    alert(err.message);
  }
}
```

## CI/CD

PRマージには以下すべてのパスが必要:

1. `npm run fmt:check` - Prettierチェック
2. `npm run lint` - ESLintチェック
3. `npm test` - Vitestテスト
4. `npm run build` - ビルド成功
