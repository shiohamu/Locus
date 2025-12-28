<script lang="ts">
import {
  deleteLLMSettings,
  getJSONExportUrl,
  getLLMSettings,
  getMarkdownExportUrl,
  saveLLMSettings,
} from "$lib/api";
import { onMount } from "svelte";

let llmProvider: "openai" | "openai-compatible" | "ollama" = "ollama";
let llmModel = "llama3";
let llmApiKey = "";
let llmBaseUrl = "";
let llmMaxTokens = 1000;
let llmTemperature = 0.7;
let llmLoading = true;
let llmSaving = false;
let llmError: string | null = null;
let hasLLMConfig = false;

onMount(async () => {
  await loadLLMSettings();
});

async function loadLLMSettings() {
  llmLoading = true;
  llmError = null;
  try {
    const config = await getLLMSettings();
    llmProvider = config.provider as "openai" | "openai-compatible" | "ollama";
    llmModel = config.model;
    llmBaseUrl = config.baseUrl ?? "";
    llmMaxTokens = config.maxTokens ?? 1000;
    llmTemperature = config.temperature ?? 0.7;
    hasLLMConfig = true;
    // APIキーは既に設定されていることを示すフラグのみ
    // OpenAI互換APIではAPIキーをマスクしない（通常不要なため）
    if (config.apiKey && llmProvider !== "openai-compatible") {
      llmApiKey = "***"; // プレースホルダー
    }
  } catch (e) {
    // 設定がない場合はエラーではない
    if (e instanceof Error && !e.message.includes("404")) {
      llmError = e.message;
    }
  } finally {
    llmLoading = false;
  }
}

async function handleSaveLLMSettings() {
  llmSaving = true;
  llmError = null;
  try {
    const config: {
      provider: "openai" | "openai-compatible" | "ollama";
      model: string;
      apiKey?: string;
      baseUrl?: string;
      maxTokens?: number;
      temperature?: number;
    } = {
      provider: llmProvider,
      model: llmModel,
      maxTokens: llmMaxTokens,
      temperature: llmTemperature,
    };

    // プロバイダーごとの設定
    if (llmProvider === "openai") {
      // OpenAI API: APIキーが必須
      if (!llmApiKey || llmApiKey === "***") {
        llmError = "OpenAI APIキーを入力してください";
        return;
      }
      config.apiKey = llmApiKey;
    } else if (llmProvider === "openai-compatible") {
      // OpenAI互換API: baseUrlが必須、APIキーは任意
      if (!llmBaseUrl || llmBaseUrl.trim() === "") {
        llmError = "ベースURLを入力してください（例: http://localhost:1234/v1）";
        return;
      }
      config.baseUrl = llmBaseUrl.trim();
      // APIキーが入力されている場合のみ設定
      if (llmApiKey && llmApiKey !== "***") {
        config.apiKey = llmApiKey;
      }
    } else {
      // Ollama: baseUrlが必須（デフォルト値を使用）
      config.baseUrl =
        llmBaseUrl && llmBaseUrl.trim() !== "" ? llmBaseUrl.trim() : "http://localhost:11434";
    }

    await saveLLMSettings(config);
    hasLLMConfig = true;
    // 保存後、APIキーをマスク（OpenAI互換APIではマスクしない）
    if (llmProvider === "openai" && llmApiKey) {
      llmApiKey = "***";
    }
    alert("設定を保存しました");
  } catch (e) {
    llmError = e instanceof Error ? e.message : "設定の保存に失敗しました";
  } finally {
    llmSaving = false;
  }
}

async function handleDeleteLLMSettings() {
  if (!confirm("LLM設定を削除しますか？")) {
    return;
  }

  llmSaving = true;
  llmError = null;
  try {
    await deleteLLMSettings();
    hasLLMConfig = false;
    // デフォルト値にリセット
    llmProvider = "ollama";
    llmModel = "llama3";
    llmApiKey = "";
    llmBaseUrl = "";
    llmMaxTokens = 1000;
    llmTemperature = 0.7;
    alert("設定を削除しました");
  } catch (e) {
    llmError = e instanceof Error ? e.message : "設定の削除に失敗しました";
  } finally {
    llmSaving = false;
  }
}

function handleMarkdownExport() {
  const url = getMarkdownExportUrl();
  const link = document.createElement("a");
  link.href = url;
  link.download = "locus-export.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function handleJSONExport() {
  const url = getJSONExportUrl();
  const link = document.createElement("a");
  link.href = url;
  link.download = "locus-export.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

$: isOpenAI = llmProvider === "openai";
$: isOpenAICompatible = llmProvider === "openai-compatible";
$: isOllama = llmProvider === "ollama";
</script>

<h1>設定</h1>

<div class="settings-section">
	<h2>LLM設定</h2>
	<p>AI要約・要点抽出機能で使用するLLMの設定を行います。</p>

	{#if llmLoading}
		<p>読み込み中...</p>
	{:else}
		{#if llmError}
			<p class="error">エラー: {llmError}</p>
		{/if}

		<div class="llm-form">
			<div class="form-group">
				<label for="llm-provider">プロバイダー</label>
				<select id="llm-provider" bind:value={llmProvider}>
					<option value="ollama">Ollama (ローカルLLM)</option>
					<option value="openai">OpenAI API</option>
					<option value="openai-compatible">OpenAI互換API (LM Studioなど)</option>
				</select>
			</div>

			<div class="form-group">
				<label for="llm-model">モデル名</label>
				<input
					id="llm-model"
					type="text"
					bind:value={llmModel}
					placeholder={isOpenAI ? "gpt-3.5-turbo" : isOpenAICompatible ? "モデル名" : "llama3"}
				/>
			</div>

			{#if isOpenAICompatible || isOllama}
				<div class="form-group">
					<label for="llm-base-url">ベースURL</label>
					<input
						id="llm-base-url"
						type="text"
						bind:value={llmBaseUrl}
						placeholder={isOpenAICompatible ? "http://localhost:1234/v1" : "http://localhost:11434"}
					/>
					<small>
						{#if isOpenAICompatible}
							OpenAI互換APIのベースURL（例: LM Studio: http://localhost:1234/v1）
						{:else}
							OllamaのベースURL（デフォルト: http://localhost:11434）。空欄の場合はデフォルト値を使用
						{/if}
					</small>
				</div>
			{/if}

			{#if isOpenAI || isOpenAICompatible}
				<div class="form-group">
					<label for="llm-api-key">APIキー {#if isOpenAICompatible}(オプション){/if}</label>
					<input
						id="llm-api-key"
						type="password"
						bind:value={llmApiKey}
						placeholder={llmApiKey === "***" ? "既に設定されています" : isOpenAI ? "sk-..." : "通常不要"}
					/>
					<small>
						{#if isOpenAI}
							OpenAI APIキー（必須）。APIキーは暗号化されずに保存されます。
						{:else}
							OpenAI互換APIでは通常不要です。APIキーが必要な場合のみ入力してください。APIキーは暗号化されずに保存されます。
						{/if}
					</small>
				</div>
			{/if}

			<div class="form-group">
				<label for="llm-max-tokens">最大トークン数</label>
				<input id="llm-max-tokens" type="number" bind:value={llmMaxTokens} min="1" max="4000" />
			</div>

			<div class="form-group">
				<label for="llm-temperature">温度 (0-2)</label>
				<input
					id="llm-temperature"
					type="number"
					bind:value={llmTemperature}
					min="0"
					max="2"
					step="0.1"
				/>
			</div>

			<div class="form-actions">
				<button on:click={handleSaveLLMSettings} disabled={llmSaving}>
					{llmSaving ? "保存中..." : "保存"}
				</button>
				{#if hasLLMConfig}
					<button on:click={handleDeleteLLMSettings} disabled={llmSaving} class="delete-button">
						削除
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<div class="settings-section">
	<h2>エクスポート</h2>
	<p>データをエクスポートしてバックアップを作成できます。</p>

	<div class="export-options">
		<div class="export-option">
			<h3>Markdown形式</h3>
			<p>すべてのノートをMarkdownファイルとしてZIP形式でエクスポートします。</p>
			<button on:click={handleMarkdownExport}>Markdownエクスポート</button>
		</div>

		<div class="export-option">
			<h3>JSON形式</h3>
			<p>すべてのデータをJSON形式でエクスポートします。</p>
			<button on:click={handleJSONExport}>JSONエクスポート</button>
		</div>
	</div>
</div>

<style>
	h1 {
		margin-bottom: 1.5rem;
	}

	.settings-section {
		background: white;
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		padding: 1.5rem;
		margin-bottom: 1.5rem;
	}

	.settings-section h2 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: #111827;
	}

	.settings-section p {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.error {
		color: #ef4444;
		margin-bottom: 1rem;
	}

	.llm-form {
		margin-top: 1rem;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 500;
		color: #111827;
	}

	.form-group input,
	.form-group select {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.form-group input:focus,
	.form-group select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.form-group small {
		display: block;
		margin-top: 0.25rem;
		color: #6b7280;
		font-size: 0.75rem;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
	}

	.form-actions button {
		padding: 0.75rem 1.5rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.form-actions button:hover:not(:disabled) {
		background: #4f46e5;
	}

	.form-actions button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.form-actions .delete-button {
		background: #ef4444;
	}

	.form-actions .delete-button:hover:not(:disabled) {
		background: #dc2626;
	}

	.export-options {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.export-option {
		padding: 1.5rem;
		background: #f9fafb;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
	}

	.export-option h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		color: #111827;
	}

	.export-option p {
		margin: 0 0 1rem 0;
		color: #6b7280;
		font-size: 0.875rem;
	}

	.export-option button {
		padding: 0.75rem 1.5rem;
		background: #6366f1;
		color: white;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		transition: background 0.2s;
	}

	.export-option button:hover {
		background: #4f46e5;
	}
</style>
