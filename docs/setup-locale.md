# 日本語ロケールのセットアップ

WSL2環境で日本語ロケールを使用するためのセットアップ手順です。

## 日本語ロケールのインストール

### Ubuntu 24.04の場合

以下のコマンドを実行して日本語ロケールをインストールします：

```bash
# 1. ロケールパッケージをインストール（既にインストールされている場合はスキップ）
sudo apt-get update
sudo apt-get install -y locales

# 2. 日本語ロケールを有効化
sudo locale-gen ja_JP.UTF-8

# 3. ロケールがインストールされたか確認
locale -a | grep ja
```

### 代替方法（Ubuntu 24.04以前の場合）

```bash
# /etc/locale.gen を編集
sudo nano /etc/locale.gen
# 以下の行のコメントを外す:
# ja_JP.UTF-8 UTF-8

# ロケールを生成
sudo locale-gen
```

### ロケールの確認

```bash
# 利用可能なロケールを確認
locale -a | grep ja

# 現在のロケール設定を確認
locale
```

### 環境変数の設定（オプション）

システム全体で日本語ロケールを使用する場合は、`.bashrc` または `.zshrc` に以下を追加：

```bash
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8
```

設定を反映：

```bash
source ~/.bashrc  # または source ~/.zshrc
```

## E2Eテストでの使用

`npm run test:e2e:ui` を実行すると、自動的に日本語ロケールが使用されます。
日本語ロケールがインストールされていない場合は、`C.UTF-8`が自動的に使用されます。

## トラブルシューティング

### 日本語ロケールがインストールできない場合

`C.UTF-8`でもUTF-8エンコーディングをサポートしているため、日本語文字も正しく表示されます。
スクリプトは自動的にフォールバックするため、特別な設定は不要です。

### ロケールが反映されない場合

新しいターミナルセッションを開くか、以下を実行：

```bash
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8
npm run test:e2e:ui
```

