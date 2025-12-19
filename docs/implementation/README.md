# 実装計画

このディレクトリには、PKM Webアプリケーションの実装計画を格納しています。

## ドキュメント構成

### Phase1 実装計画
- [`phase1_implementation_plan.md`](./phase1_implementation_plan.md)
  - Phase1（MVP）の詳細な実装計画
  - データベーススキーマ、API、フロントエンドの実装項目
  - 実装順序とチェックリスト

### Phase2 実装計画
- [`phase2_implementation_plan.md`](./phase2_implementation_plan.md)
  - Phase2の実装計画
  - Webクリップ、PDF/File管理、エクスポート機能の実装項目

### Phase3/Phase4 実装概要
- [`phase3_phase4_overview.md`](./phase3_phase4_overview.md)
  - Phase3/Phase4の実装概要
  - LLM機能、自動タグ付け、知識グラフ、公開/Wiki機能の計画

## 実装方針

### 基本原則
1. **ローカルファースト** - オフライン動作を前提とする
2. **シンプルさ** - 個人開発で破綻しない複雑度に制限
3. **段階的実装** - Phase1の安定化を優先し、段階的に拡張
4. **後方互換性** - 既存機能への影響を最小限に抑える

### 実装順序
1. **Phase1（MVP）** - 基盤機能の実装
2. **Phase2** - 拡張機能の追加
3. **Phase3/Phase4** - 将来の拡張（必要に応じて）

## 参照ドキュメント

- [仕様書](../pkm_web_application_specification.md) - Phase1の詳細仕様
- [Phase2以降仕様書](../pkm_web_application_phase_2_specification.md) - Phase2以降の仕様

## 進捗管理

各実装計画ドキュメントにはチェックリストが含まれています。実装進捗は各ドキュメントのチェックリストで管理してください。

## 注意事項

- 実装計画は仕様書に基づいていますが、実装中に発見された課題に応じて更新される可能性があります
- 各Phaseは独立して実装可能な設計を前提としています
- 実装前に必ず仕様書を確認し、設計の整合性を保ってください




