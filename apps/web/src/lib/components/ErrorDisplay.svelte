<script lang="ts">
import { handleApiError } from "$lib/utils/error-handling";
import "$lib/styles/errors.css";

/** エラーオブジェクト（Error、unknown、またはstring） */
export let error: unknown | null = null;
/** デフォルトのエラーメッセージ */
export let defaultMessage = "エラーが発生しました";
/** シンプルなスタイルを使用するか */
export let simple = false;
/** エラーメッセージの前に表示するプレフィックス */
export let prefix = "エラー: ";

$: errorMessage = error ? handleApiError(error, defaultMessage) : null;
</script>

{#if errorMessage}
	<p class={simple ? "error-simple" : "error"}>
		{prefix}{errorMessage}
	</p>
{/if}

