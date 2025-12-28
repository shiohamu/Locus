<script lang="ts">
	import { getGraphData, getTags } from "$lib/api";
	import type { GraphData } from "@locus/shared";
	import { browser } from "$app/environment";
	import { onMount, onDestroy, tick } from "svelte";

	let graphData: GraphData | null = null;
	let loading = true;
	let error: string | null = null;
	let network: any = null;
	let networkContainer: HTMLDivElement | null = null;
	let visNetworkLoaded = false;
	let isRendering = false;
	let lastRenderedDataHash: string | null = null;
	let renderTimeout: ReturnType<typeof setTimeout> | null = null;

	// フィルタリング設定
	let filterType: "all" | "md" | "rss" | "web_clip" = "all";
	let selectedTags: string[] = [];
	let availableTags: Array<{ id: string; name: string }> = [];

	// グラフデータのハッシュを計算（簡易版）
	function calculateDataHash(data: GraphData | null): string {
		if (!data) return "";
		// ノードとエッジのIDをソートして結合し、ハッシュとして使用
		const nodeIds = data.nodes.map((n) => n.id).sort().join(",");
		const edgeIds = data.edges.map((e) => `${e.from}-${e.to}`).sort().join(",");
		return `${nodeIds}|${edgeIds}`;
	}

	// グラフデータを読み込む
	async function loadGraphData(forceRefresh = false) {
		// 既存のレンダリングタイムアウトをクリア
		if (renderTimeout) {
			clearTimeout(renderTimeout);
			renderTimeout = null;
		}

		loading = true;
		error = null;
		// loading中はレンダリングを防ぐため、isRenderingをリセット
		isRendering = false;

		// 強制更新の場合は、ハッシュをリセットして再レンダリングを強制
		if (forceRefresh) {
			lastRenderedDataHash = null;
		}

		try {
			// availableTagsが空の場合は、タグの読み込みを待つ
			if (availableTags.length === 0 && selectedTags.length > 0) {
				await loadTags();
			}

			// タグIDをタグ名に変換
			let tagNames: string[] | undefined = undefined;
			if (selectedTags.length > 0) {
				const mappedNames = selectedTags
					.map((tagId) => availableTags.find((tag) => tag.id === tagId)?.name)
					.filter((name): name is string => name !== undefined);

				// 空配列の場合はundefinedを送信（フィルタリングしない）
				tagNames = mappedNames.length > 0 ? mappedNames : undefined;

				// デバッグログ
				if (mappedNames.length !== selectedTags.length) {
					console.warn(
						`Some tags could not be found. Selected: ${selectedTags.length}, Found: ${mappedNames.length}`
					);
				}
			}

			const data = await getGraphData({
				type: filterType === "all" ? undefined : filterType,
				tags: tagNames,
			});

			// データを更新（リアクティブステートメントが自動的に実行される）
			graphData = data;
			console.log("Graph data loaded:", data.nodes.length, "nodes,", data.edges.length, "edges");
		} catch (e) {
			error = e instanceof Error ? e.message : "グラフデータの読み込みに失敗しました";
			console.error("Failed to load graph data:", e);
			// エラーが発生した場合でも、空のグラフデータを設定して表示を維持
			graphData = { nodes: [], edges: [] };
		} finally {
			loading = false;
		}
	}

	// タグ一覧を読み込む
	async function loadTags() {
		try {
			const tags = await getTags();
			availableTags = tags;
			console.log("Tags loaded:", tags.length, "tags");
		} catch (e) {
			console.error("Failed to load tags:", e);
			// タグの読み込み失敗は無視（空配列のまま）
			availableTags = [];
		}
	}

	// vis-networkを動的に読み込む
	let visNetworkModule: any = null;
	async function loadVisNetwork() {
		if (!browser) return null;

		if (visNetworkModule) {
			return visNetworkModule;
		}

		try {
			const visNetwork = await import("vis-network/standalone");
			visNetworkModule = visNetwork;
			visNetworkLoaded = true;
			return visNetwork;
		} catch (e) {
			console.error("Failed to load vis-network:", e);
			error = "グラフライブラリの読み込みに失敗しました: " + (e instanceof Error ? e.message : String(e));
			return null;
		}
	}

	// グラフをレンダリング
	async function renderGraph() {
		if (!browser) {
			return;
		}

		if (!networkContainer) {
			console.warn("Network container not available");
			return;
		}

		if (!graphData) {
			console.warn("Graph data not available");
			// 既存のネットワークをクリア
			if (network) {
				try {
					network.off("click");
					network.off("doubleClick");
					network.off("stabilizationEnd");
					network.destroy();
				} catch (e) {
					console.warn("Error destroying network:", e);
				}
				network = null;
			}
			return;
		}

		if (graphData.nodes.length === 0) {
			console.log("No nodes to render - clearing network");
			// 既存のネットワークをクリア
			if (network) {
				try {
					network.off("click");
					network.off("doubleClick");
					network.off("stabilizationEnd");
					network.destroy();
				} catch (e) {
					console.warn("Error destroying network:", e);
				}
				network = null;
			}
			// ハッシュを更新して、次回の再レンダリングを防ぐ
			// 注意: この関数は呼び出し元でlastRenderedDataHashを更新するため、ここでは更新しない
			return;
		}

		// vis-networkを読み込む
		const visNetwork = await loadVisNetwork();
		if (!visNetwork) {
			console.error("Failed to load vis-network");
			error = "グラフライブラリの読み込みに失敗しました";
			return;
		}

		const { Network, DataSet } = visNetwork;
		console.log("Vis-network loaded, creating network with", graphData.nodes.length, "nodes");

		// 既存のネットワークを破棄（レンダリング中に変更されないように）
		if (network) {
			try {
				// イベントリスナーを削除してから破棄
				network.off("click");
				network.off("doubleClick");
				network.off("stabilizationEnd");
				network.destroy();
			} catch (e) {
				console.warn("Error destroying network:", e);
			}
			network = null;
		}

		// ノードをvis-network形式に変換
		const nodes = graphData.nodes.map((node) => {
			const color = getNodeColor(node.type);
			return {
				id: node.id,
				label: node.label.length > 30 ? node.label.substring(0, 30) + "..." : node.label,
				title: `${node.label}\nタイプ: ${node.type}\nタグ: ${node.tags.join(", ") || "なし"}`,
				color: {
					background: color.background,
					border: color.border,
					highlight: {
						background: color.highlight,
						border: color.border,
					},
				},
				font: {
					size: 14,
					color: "#1a1a1a",
				},
				shape: "box",
				margin: 10,
			};
		});

		// エッジをvis-network形式に変換
		const edges = graphData.edges.map((edge) => ({
			from: edge.from,
			to: edge.to,
			arrows: "to",
			color: {
				color: "#6366f1",
				highlight: "#8b5cf6",
			},
			width: 2,
		}));

		// データセットを作成
		const nodesDataSet = new DataSet(nodes);
		const edgesDataSet = new DataSet(edges);
		const data = { nodes: nodesDataSet, edges: edgesDataSet };

		// ネットワークオプション
		const options = {
			layout: {
				improvedLayout: true,
				randomSeed: 42, // 固定シードで同じ配置を保証
				hierarchical: {
					enabled: false,
				},
			},
			physics: {
				enabled: true,
				stabilization: {
					enabled: true,
					// ノード数に応じて反復回数を調整
					iterations: graphData.nodes.length > 50 ? 100 : 200,
					fit: true,
				},
				barnesHut: {
					gravitationalConstant: graphData.nodes.length > 50 ? -3000 : -2000,
					centralGravity: 0.1,
					springLength: graphData.nodes.length > 50 ? 150 : 200,
					springConstant: 0.04,
					damping: graphData.nodes.length > 50 ? 0.12 : 0.09,
				},
			},
			interaction: {
				hover: true,
				tooltipDelay: 200,
				zoomView: true,
				dragView: true,
			},
			nodes: {
				borderWidth: 2,
				shadow: true,
			},
			edges: {
				// ノード数が多い場合は滑らかなエッジを無効化（パフォーマンス向上）
				smooth: graphData.nodes.length > 50 ? false : {
					type: "continuous",
					roundness: 0.5,
				},
				shadow: graphData.nodes.length <= 50,
			},
		};

		// ネットワークを作成
		try {
			console.log("Creating network instance...");
			network = new Network(networkContainer, data, options);
			console.log("Network created successfully");

			// ノードクリック時のイベント
			network.on("click", (params: any) => {
				if (params.nodes.length > 0) {
					const nodeId = params.nodes[0] as string;
					// ノートページに遷移
					window.location.href = `/notes/${nodeId}`;
				}
			});

			// ダブルクリックでズーム
			network.on("doubleClick", (params: any) => {
				if (params.nodes.length > 0) {
					const nodeId = params.nodes[0] as string;
					network?.focus(nodeId, {
						scale: 1.5,
						animation: true,
					});
				}
			});

			// 安定化完了後に物理エンジンを無効化して位置を固定
			network.on("stabilizationEnd", () => {
				if (network) {
					network.setOptions({ physics: { enabled: false } });
					console.log("Stabilization complete, physics disabled");
				}
			});
		} catch (e) {
			console.error("Failed to create network:", e);
			error = "グラフの作成に失敗しました: " + (e instanceof Error ? e.message : String(e));
		}
	}

	// ノードタイプに応じた色を取得
	function getNodeColor(type: string) {
		switch (type) {
			case "md":
				return {
					background: "#e0e7ff",
					border: "#6366f1",
					highlight: "#c7d2fe",
				};
			case "rss":
				return {
					background: "#fef3c7",
					border: "#f59e0b",
					highlight: "#fde68a",
				};
			case "web_clip":
				return {
					background: "#d1fae5",
					border: "#10b981",
					highlight: "#a7f3d0",
				};
			default:
				return {
					background: "#f3f4f6",
					border: "#6b7280",
					highlight: "#e5e7eb",
				};
		}
	}

	// フィルタ変更時にグラフを再読み込み
	function handleFilterChange() {
		loadGraphData();
	}

	// タグの選択/解除
	function toggleTag(tagId: string) {
		if (selectedTags.includes(tagId)) {
			selectedTags = selectedTags.filter((id) => id !== tagId);
		} else {
			selectedTags = [...selectedTags, tagId];
		}
		handleFilterChange();
	}

	// networkContainerが設定されたらグラフをレンダリング
	$: if (networkContainer && graphData !== null && browser && !loading && !isRendering) {
		// データが実際に変更されたかチェック
		const currentHash = calculateDataHash(graphData);

		// lastRenderedDataHashがnullの場合は、初回レンダリングとして扱う
		if (lastRenderedDataHash === null || currentHash !== lastRenderedDataHash) {
			// 既存のタイムアウトをクリア
			if (renderTimeout) {
				clearTimeout(renderTimeout);
				renderTimeout = null;
			}

			// デバウンス処理：短時間内の複数の更新を防ぐ
			renderTimeout = setTimeout(async () => {
				// graphDataがnullでないこと、loadingが完了していることを再確認
				if (networkContainer && graphData !== null && !loading && !isRendering) {
					// DOMの更新を確実に待つ
					await tick();

					// 再度データが変更されていないかチェック
					if (graphData !== null && !loading) {
						const hash = calculateDataHash(graphData);
						// ハッシュが変更されている、または初回レンダリングの場合
						if (lastRenderedDataHash === null || hash !== lastRenderedDataHash) {
							isRendering = true;
							try {
								await renderGraph();
								// レンダリングが成功した場合のみハッシュを更新
								// renderGraph()が早期リターンした場合でも、ハッシュを更新して無限ループを防ぐ
								lastRenderedDataHash = hash;
							} catch (e) {
								console.error("Error in renderGraph:", e);
								// エラーが発生した場合でも、ハッシュを更新して無限ループを防ぐ
								lastRenderedDataHash = hash;
							} finally {
								isRendering = false;
							}
						}
					}
				}
				renderTimeout = null;
			}, 100);
		}
	}

	onMount(async () => {
		if (browser) {
			await loadTags();
			await loadGraphData();
		}
	});

	// クリーンアップ
	onDestroy(() => {
		if (renderTimeout) {
			clearTimeout(renderTimeout);
			renderTimeout = null;
		}
		if (network) {
			try {
				network.destroy();
			} catch (e) {
				console.warn("Error destroying network on cleanup:", e);
			}
			network = null;
		}
	});
</script>

<div class="graph-page">
	<div class="page-header">
		<h1>知識グラフ</h1>
		<button on:click={() => loadGraphData(true)} class="refresh-button" disabled={loading}>
			{loading ? "読み込み中..." : "更新"}
		</button>
	</div>

	<div class="filters-section">
		<div class="filter-group">
			<label for="filter-type">タイプ:</label>
			<select id="filter-type" bind:value={filterType} on:change={handleFilterChange}>
				<option value="all">すべて</option>
				<option value="md">Markdown</option>
				<option value="rss">RSS</option>
				<option value="web_clip">Webクリップ</option>
			</select>
		</div>

		<div class="filter-group">
			<span class="filter-label">タグ:</span>
			<div class="tags-list" role="group" aria-label="タグフィルター">
				{#each availableTags as tag}
					<button
						class="tag-button"
						class:active={selectedTags.includes(tag.id)}
						on:click={() => toggleTag(tag.id)}
						type="button"
						aria-pressed={selectedTags.includes(tag.id)}
					>
						{tag.name}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if loading}
		<div class="loading">読み込み中...</div>
	{:else if error}
		<div class="error-section">
			<p class="error">エラー: {error}</p>
			{#if graphData}
				<div class="graph-info">
					<p>ノード数: {graphData.nodes.length} | エッジ数: {graphData.edges.length}</p>
				</div>
			{/if}
		</div>
	{:else if graphData}
		<div class="graph-info">
			<p>ノード数: {graphData.nodes.length} | エッジ数: {graphData.edges.length}</p>
			{#if graphData.nodes.length === 0}
				<p class="empty-message">
					フィルター条件に一致するノードが見つかりませんでした。フィルターを変更してください。
				</p>
			{:else if graphData.nodes.length >= 100}
				<p class="performance-warning">
					⚠️ ノード数が多いため、表示が重くなる可能性があります。フィルターを使用してノード数を減らすことをお勧めします。
				</p>
			{/if}
		</div>
		<div class="graph-container" bind:this={networkContainer}></div>
	{/if}
</div>

<style>
	.graph-page {
		display: flex;
		flex-direction: column;
		height: calc(100vh - 200px);
		min-height: 600px;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.refresh-button {
		padding: 0.75rem 1.5rem;
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		font-weight: 600;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
	}

	.refresh-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
	}

	.refresh-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.filters-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	}

	.filter-group {
		display: flex;
		gap: 0.75rem;
		align-items: center;
		flex-wrap: wrap;
	}

	.filter-group label,
	.filter-group .filter-label {
		font-weight: 600;
		font-size: 0.9375rem;
		color: #1a1a1a;
		min-width: 60px;
	}

	.filter-group select {
		padding: 0.5rem 1rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 8px;
		font-size: 0.9375rem;
		color: #1a1a1a;
		background: rgba(255, 255, 255, 0.9);
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-group select:focus {
		outline: none;
		border-color: #6366f1;
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.tags-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.tag-button {
		padding: 0.5rem 1rem;
		border: 2px solid rgba(99, 102, 241, 0.2);
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.9);
		color: #1a1a1a;
		cursor: pointer;
		font-size: 0.875rem;
		transition: all 0.2s;
	}

	.tag-button:hover {
		border-color: #6366f1;
		background: rgba(99, 102, 241, 0.1);
	}

	.tag-button.active {
		background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
		color: white;
		border-color: #6366f1;
	}

	.graph-info {
		margin-bottom: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		border-radius: 8px;
		font-size: 0.875rem;
		color: #6b7280;
	}

	.performance-warning {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: #fef3c7;
		border-left: 3px solid #f59e0b;
		border-radius: 4px;
		color: #92400e;
		font-size: 0.8125rem;
	}

	.empty-message {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: #e0e7ff;
		border-left: 3px solid #6366f1;
		border-radius: 4px;
		color: #4338ca;
		font-size: 0.875rem;
	}

	.graph-container {
		flex: 1;
		background: rgba(255, 255, 255, 0.9);
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		min-height: 500px;
		height: 100%;
		width: 100%;
		border: 2px solid rgba(99, 102, 241, 0.1);
		position: relative;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 500px;
		font-size: 1.125rem;
		color: #6b7280;
	}

	.error-section {
		padding: 1rem;
	}

	.error {
		color: #dc2626;
		font-weight: 600;
		margin-bottom: 1rem;
	}
</style>

