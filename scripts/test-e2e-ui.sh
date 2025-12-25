#!/bin/bash
# E2EテストUIモード実行スクリプト
# 文字化け対策のため、環境変数を明示的に設定

# 日本語ロケールを優先的に使用、利用できない場合はC.UTF-8を使用
if locale -a | grep -q "ja_JP.utf8\|ja_JP.UTF-8"; then
	export LANG=ja_JP.UTF-8
	export LC_ALL=ja_JP.UTF-8
else
	export LANG=C.UTF-8
	export LC_ALL=C.UTF-8
fi

# PlaywrightのUIモードを実行
exec playwright test --ui

