# Phase 4: アーキテクチャの改善 実装計画

作成日: 2025-12-28

## 1. 概要

Phase 4では、コードの保守性向上と拡張性の向上を目的として、アーキテクチャの改善を実施します。状態管理の改善、関心の分離、エラーハンドリングの強化を中心に行います。

## 2. 現状分析

### 2.1 状態管理の現状

- **問題点**:
  - Svelteストアが使用されていない
  - 各コンポーネントでローカル状態として管理されている
  - 複数のコンポーネント間で状態を共有する必要がある場合、propsのバケツリレーが発生する可能性
  - `+page.svelte`では`allNotes`, `notes`, `tags`などがローカル変数として管理されている

- **影響範囲**:
  - `apps/web/src/routes/+page.svelte` - ノート一覧の状態管理
  - `apps/web/src/routes/notes/[id]/+page.svelte` - ノート詳細の状態管理
  - `apps/web/src/routes/graph/+page.svelte` - グラフデータの状態管理
  - その他のルートコンポーネント

### 2.2 ビジネスロジックの現状

- **問題点**:
  - フィルタリング、ソート、ページネーションなどのロジックがコンポーネント内に直接書かれている
  - `applyFilters()`のような関数がコンポーネント内に定義されている
  - ビジネスロジックとUIロジックが混在している

- **良い点**:
  - `hooks/useNote.ts`のようなカスタムフックが存在する
  - `lib/api/`にAPIクライアントが分割されている
  - `lib/storage.ts`にIndexedDBの操作が分離されている

### 2.3 エラーハンドリングの現状

- **良い点**:
  - `ErrorDisplay.svelte`コンポーネントが存在
  - `handleApiError`関数が`apps/web/src/lib/utils/error-handling.ts`に実装されている
  - エラーの種類を判定する`getErrorType`関数が存在

- **改善の余地**:
  - エラー境界（Error Boundary）が実装されていない
  - エラーログの改善の余地がある
  - ユーザーフレンドリーなエラーメッセージの統一化

## 3. 実装計画

### 3.1 状態管理の改善

#### 3.1.1 Svelteストアの導入

**目的**: グローバル状態を適切に管理し、コンポーネント間での状態共有を容易にする

**実装内容**:

1. **ノートストアの作成** (`apps/web/src/lib/stores/notes.ts`)
   - ノート一覧の状態管理
   - ノートの読み込み、更新、削除のアクション
   - フィルタリング、ソート、ページネーションの状態管理

2. **タグストアの作成** (`apps/web/src/lib/stores/tags.ts`)
   - タグ一覧の状態管理
   - タグの読み込み、更新、削除のアクション

3. **UIストアの作成** (`apps/web/src/lib/stores/ui.ts`)
   - ローディング状態の管理
   - エラー状態の管理
   - モーダル、ダイアログの状態管理

**実装例**:

```typescript
// apps/web/src/lib/stores/notes.ts
import { writable, derived } from 'svelte/store';
import type { NoteCore } from '$lib/types';
import { getNotes } from '$lib/api';

export type FilterType = 'all' | 'md' | 'rss' | 'web_clip';
export type SortBy = 'updated_at' | 'created_at' | 'title';
export type SortOrder = 'desc' | 'asc';

interface NotesState {
  allNotes: NoteCore[];
  loading: boolean;
  error: unknown | null;
  filterType: FilterType;
  sortBy: SortBy;
  sortOrder: SortOrder;
  currentPage: number;
  itemsPerPage: number;
}

const initialState: NotesState = {
  allNotes: [],
  loading: false,
  error: null,
  filterType: 'all',
  sortBy: 'updated_at',
  sortOrder: 'desc',
  currentPage: 1,
  itemsPerPage: 20,
};

function createNotesStore() {
  const { subscribe, set, update } = writable<NotesState>(initialState);

  return {
    subscribe,
    // ノートを読み込む
    async loadNotes() {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const notes = await getNotes({ limit: 10000 });
        update((state) => ({ ...state, allNotes: notes, loading: false }));
      } catch (error) {
        update((state) => ({ ...state, error, loading: false }));
      }
    },
    // フィルタを設定
    setFilter(filterType: FilterType) {
      update((state) => ({ ...state, filterType, currentPage: 1 }));
    },
    // ソートを設定
    setSort(sortBy: SortBy, sortOrder: SortOrder) {
      update((state) => ({ ...state, sortBy, sortOrder }));
    },
    // ページを設定
    setPage(page: number) {
      update((state) => ({ ...state, currentPage: page }));
    },
    // リセット
    reset() {
      set(initialState);
    },
  };
}

export const notesStore = createNotesStore();

// フィルタリング・ソート・ページネーションされたノートを導出
export const filteredNotes = derived(notesStore, ($store) => {
  let filtered = [...$store.allNotes];

  // タイプフィルタ
  if ($store.filterType !== 'all') {
    filtered = filtered.filter((note) => note.type === $store.filterType);
  }

  // ソート
  filtered.sort((a, b) => {
    let comparison = 0;
    if ($store.sortBy === 'title') {
      comparison = a.title.localeCompare(b.title, 'ja');
    } else if ($store.sortBy === 'updated_at') {
      comparison = a.updated_at - b.updated_at;
    } else if ($store.sortBy === 'created_at') {
      comparison = a.created_at - b.created_at;
    }
    return $store.sortOrder === 'desc' ? -comparison : comparison;
  });

  // ページネーション
  const startIndex = ($store.currentPage - 1) * $store.itemsPerPage;
  const endIndex = startIndex + $store.itemsPerPage;
  return filtered.slice(startIndex, endIndex);
});

// 総ページ数を導出
export const totalPages = derived(notesStore, ($store) => {
  const filteredCount =
    $store.filterType === 'all'
      ? $store.allNotes.length
      : $store.allNotes.filter((n) => n.type === $store.filterType).length;
  return Math.ceil(filteredCount / $store.itemsPerPage);
});
```

**影響範囲**:
- `apps/web/src/routes/+page.svelte` - ノート一覧ページ
- その他のノート一覧を使用するコンポーネント

**推定工数**: 3-4時間

#### 3.1.2 状態の局所化

**目的**: グローバル状態が必要ない場合は、ローカル状態として管理する

**実装内容**:
- 各コンポーネントで使用する状態が本当にグローバルであるかを確認
- ローカル状態で十分な場合は、ストアを使用しない
- コンポーネント間で共有する必要がある場合のみストアを使用

**推定工数**: 1-2時間

### 3.2 関心の分離

#### 3.2.1 ビジネスロジックの抽出

**目的**: ビジネスロジックをコンポーネントから分離し、再利用可能にする

**実装内容**:

1. **フィルタリング・ソート・ページネーションロジックの抽出**
   - `apps/web/src/lib/services/filtering.ts` - フィルタリングロジック
   - `apps/web/src/lib/services/sorting.ts` - ソートロジック
   - `apps/web/src/lib/services/pagination.ts` - ページネーションロジック

2. **カスタムフックの拡充**
   - `apps/web/src/lib/hooks/useNotes.ts` - ノート一覧の管理
   - `apps/web/src/lib/hooks/useFilters.ts` - フィルタリングの管理
   - `apps/web/src/lib/hooks/usePagination.ts` - ページネーションの管理

**実装例**:

```typescript
// apps/web/src/lib/services/filtering.ts
import type { NoteCore } from '$lib/types';

export type FilterType = 'all' | 'md' | 'rss' | 'web_clip';

/**
 * ノートをフィルタリングする
 */
export function filterNotes(notes: NoteCore[], filterType: FilterType): NoteCore[] {
  if (filterType === 'all') {
    return notes;
  }
  return notes.filter((note) => note.type === filterType);
}
```

```typescript
// apps/web/src/lib/services/sorting.ts
import type { NoteCore } from '$lib/types';

export type SortBy = 'updated_at' | 'created_at' | 'title';
export type SortOrder = 'desc' | 'asc';

/**
 * ノートをソートする
 */
export function sortNotes(notes: NoteCore[], sortBy: SortBy, sortOrder: SortOrder): NoteCore[] {
  const sorted = [...notes];
  sorted.sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title, 'ja');
    } else if (sortBy === 'updated_at') {
      comparison = a.updated_at - b.updated_at;
    } else if (sortBy === 'created_at') {
      comparison = a.created_at - b.created_at;
    }
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  return sorted;
}
```

```typescript
// apps/web/src/lib/services/pagination.ts
/**
 * 配列をページネーションする
 */
export function paginate<T>(items: T[], currentPage: number, itemsPerPage: number): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

/**
 * 総ページ数を計算する
 */
export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}
```

**影響範囲**:
- `apps/web/src/routes/+page.svelte` - ノート一覧ページ
- その他のフィルタリング・ソート・ページネーションを使用するコンポーネント

**推定工数**: 2-3時間

#### 3.2.2 サービス層の明確化

**目的**: ビジネスロジックをサービス層に集約し、コンポーネントから分離する

**実装内容**:

1. **ノートサービスの作成** (`apps/web/src/lib/services/notes.ts`)
   - ノートのCRUD操作
   - ノートの検索、フィルタリング、ソート

2. **タグサービスの作成** (`apps/web/src/lib/services/tags.ts`)
   - タグのCRUD操作
   - タグの検索、フィルタリング

**実装例**:

```typescript
// apps/web/src/lib/services/notes.ts
import { getNotes, getNote, createNote, updateNote, deleteNote } from '$lib/api';
import type { NoteCore } from '$lib/types';
import { filterNotes } from './filtering';
import { sortNotes } from './sorting';
import { paginate } from './pagination';
import type { FilterType } from './filtering';
import type { SortBy, SortOrder } from './sorting';

export interface NotesServiceOptions {
  filterType?: FilterType;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  currentPage?: number;
  itemsPerPage?: number;
}

export class NotesService {
  /**
   * ノート一覧を取得する（フィルタリング・ソート・ページネーション適用）
   */
  async getNotes(options: NotesServiceOptions = {}) {
    const allNotes = await getNotes({ limit: 10000 });

    let filtered = filterNotes(allNotes, options.filterType || 'all');
    filtered = sortNotes(filtered, options.sortBy || 'updated_at', options.sortOrder || 'desc');

    if (options.currentPage && options.itemsPerPage) {
      filtered = paginate(filtered, options.currentPage, options.itemsPerPage);
    }

    return {
      notes: filtered,
      total: allNotes.length,
    };
  }

  /**
   * ノートを取得する
   */
  async getNote(id: string): Promise<NoteCore> {
    return getNote(id);
  }

  /**
   * ノートを作成する
   */
  async createNote(title: string, content: string): Promise<NoteCore> {
    return createNote({ title, content });
  }

  /**
   * ノートを更新する
   */
  async updateNote(id: string, updates: Partial<NoteCore>): Promise<NoteCore> {
    return updateNote(id, updates);
  }

  /**
   * ノートを削除する
   */
  async deleteNote(id: string): Promise<void> {
    return deleteNote(id);
  }
}

export const notesService = new NotesService();
```

**影響範囲**:
- すべてのノート関連のコンポーネント
- APIクライアントを使用しているコンポーネント

**推定工数**: 3-4時間

### 3.3 エラーハンドリングの強化

#### 3.3.1 エラー境界の実装

**目的**: コンポーネントツリーの任意の場所でエラーをキャッチし、適切に処理する

**実装内容**:

1. **ErrorBoundaryコンポーネントの作成** (`apps/web/src/lib/components/ErrorBoundary.svelte`)
   - Svelteのエラーハンドリング機能を使用
   - エラーが発生した場合、フォールバックUIを表示
   - エラーログの記録

**実装例**:

```svelte
<!-- apps/web/src/lib/components/ErrorBoundary.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import ErrorDisplay from './ErrorDisplay.svelte';
  import { logError } from '$lib/utils/error-handling';

  export let fallback: string = 'エラーが発生しました';
  export let showDetails: boolean = false;

  let error: Error | null = null;

  onMount(() => {
    // グローバルエラーハンドラーを設定
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  });

  function handleError(event: ErrorEvent) {
    error = event.error;
    logError(event.error, { context: 'ErrorBoundary' });
  }

  function handleRejection(event: PromiseRejectionEvent) {
    error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    logError(error, { context: 'ErrorBoundary' });
  }
</script>

{#if error}
  <div class="error-boundary">
    <ErrorDisplay error={error} defaultMessage={fallback} />
    {#if showDetails}
      <details>
        <summary>エラー詳細</summary>
        <pre>{error.stack}</pre>
      </details>
    {/if}
    <button on:click={() => window.location.reload()}>ページを再読み込み</button>
  </div>
{:else}
  <slot />
{/if}

<style>
  .error-boundary {
    padding: 2rem;
    text-align: center;
  }
</style>
```

**影響範囲**:
- `apps/web/src/routes/+layout.svelte` - ルートレイアウト
- 各ルートコンポーネント

**推定工数**: 2-3時間

#### 3.3.2 エラーログの改善

**目的**: エラーログを構造化し、デバッグを容易にする

**実装内容**:

1. **ロガーユーティリティの作成** (`apps/web/src/lib/utils/logger.ts`)
   - エラーログの記録
   - 開発環境と本番環境で異なるログレベル
   - エラーのコンテキスト情報の記録

**実装例**:

```typescript
// apps/web/src/lib/utils/logger.ts
import { dev } from '$app/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    if (!dev && level === 'debug') {
      return;
    }

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...context,
    };

    switch (level) {
      case 'error':
        console.error(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
        break;
      case 'warn':
        console.warn(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
        break;
      default:
        console.log(`[${timestamp}] ${level.toUpperCase()}:`, message, context);
    }

    // 本番環境では、エラーログを外部サービスに送信する可能性がある
    if (!dev && level === 'error') {
      // TODO: エラートラッキングサービスへの送信
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: LogContext) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
    };
    this.log('error', errorMessage, errorContext);
  }
}

export const logger = new Logger();

/**
 * エラーをログに記録する
 */
export function logError(error: unknown, context?: LogContext) {
  logger.error('Error occurred', error, context);
}
```

2. **エラーハンドリングユーティリティの拡張**
   - `apps/web/src/lib/utils/error-handling.ts`に`logError`関数を追加
   - 既存のエラーハンドリング関数を拡張

**影響範囲**:
- すべてのエラーハンドリング箇所
- `apps/web/src/lib/utils/error-handling.ts`

**推定工数**: 2-3時間

#### 3.3.3 ユーザーフレンドリーなエラーメッセージの統一化

**目的**: エラーメッセージを統一し、ユーザーにとって理解しやすくする

**実装内容**:

1. **エラーメッセージマッピングの作成** (`apps/web/src/lib/utils/error-messages.ts`)
   - エラーの種類に応じたメッセージのマッピング
   - 多言語対応の準備（将来拡張）

**実装例**:

```typescript
// apps/web/src/lib/utils/error-messages.ts
import type { ErrorType } from './error-handling';

export interface ErrorMessageMap {
  [key: string]: string;
}

const errorMessages: Record<ErrorType, ErrorMessageMap> = {
  network: {
    default: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    timeout: 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。',
    offline: 'オフラインです。インターネット接続を確認してください。',
  },
  api: {
    default: 'サーバーエラーが発生しました。しばらくしてから再度お試しください。',
    notFound: 'リソースが見つかりませんでした。',
    unauthorized: '認証が必要です。ログインしてください。',
    forbidden: 'この操作を実行する権限がありません。',
  },
  validation: {
    default: '入力内容に誤りがあります。確認してください。',
    required: '必須項目が入力されていません。',
    invalid: '無効な値が入力されています。',
  },
  unknown: {
    default: '予期しないエラーが発生しました。',
  },
};

/**
 * エラーメッセージを取得する
 */
export function getErrorMessage(error: unknown, errorType: ErrorType): string {
  if (error instanceof Error) {
    const messageMap = errorMessages[errorType];
    const message = messageMap[error.message] || messageMap.default;
    return message;
  }
  return errorMessages[errorType].default;
}
```

2. **エラーハンドリングユーティリティの更新**
   - `handleApiError`関数を更新し、エラーメッセージマッピングを使用

**影響範囲**:
- `apps/web/src/lib/utils/error-handling.ts`
- `apps/web/src/lib/components/ErrorDisplay.svelte`

**推定工数**: 1-2時間

## 4. 実装順序

推奨される実装順序：

1. **エラーハンドリングの強化** (3.3)
   - 影響範囲が明確で、他の実装に依存しない
   - エラー境界とロガーを先に実装することで、後続の実装でのエラーを適切に記録できる

2. **ビジネスロジックの抽出** (3.2.1)
   - フィルタリング・ソート・ページネーションロジックを抽出
   - 状態管理の改善の前に実施することで、ストアの実装が簡潔になる

3. **状態管理の改善** (3.1)
   - ビジネスロジックの抽出後に実施することで、ストアの実装が簡潔になる

4. **サービス層の明確化** (3.2.2)
   - 状態管理の改善後に実施することで、サービス層とストアの連携が明確になる

## 5. テスト戦略

各タスクの完了後、以下を実施：

1. **ユニットテスト**
   - 新規作成したストア、サービス、ユーティリティのテスト
   - 既存のテストが通ることを確認

2. **統合テスト**
   - コンポーネントとストアの連携テスト
   - エラーハンドリングのテスト

3. **手動テスト**
   - 主要なユーザーフローをテスト
   - エラーが発生した場合の動作を確認
   - UIの見た目が変わっていないことを確認

## 6. リスク管理

### 6.1 潜在的なリスク

1. **状態管理の複雑化**
   - ストアの導入により、状態管理が複雑になる可能性
   - **対策**: 必要最小限のストアのみを作成し、ローカル状態を優先する

2. **パフォーマンスの劣化**
   - ストアの導入により、不要な再レンダリングが発生する可能性
   - **対策**: `derived`ストアを適切に使用し、不要な再計算を避ける

3. **既存機能の回帰**
   - リファクタリングにより、既存の機能が動作しなくなる可能性
   - **対策**: 段階的に実装し、各ステップでテストを実施

### 6.2 ロールバック計画

各タスクは独立して実装できるため、問題が発生した場合は該当タスクのみをロールバック可能。

## 7. 成功基準

Phase 4が成功したと判断する基準：

1. **状態管理の改善**
   - グローバル状態が必要な場合にのみストアを使用している
   - ストアのテストが実装されている
   - コンポーネント間での状態共有が容易になっている

2. **関心の分離**
   - ビジネスロジックがコンポーネントから分離されている
   - サービス層が明確に定義されている
   - カスタムフックが適切に使用されている

3. **エラーハンドリングの強化**
   - エラー境界が実装されている
   - エラーログが適切に記録されている
   - ユーザーフレンドリーなエラーメッセージが表示されている

4. **テストの通過**
   - すべての既存テストが通過
   - 新規テストが追加されている

5. **コードの品質**
   - Biomeのlintエラーが0件
   - 型エラーが0件

## 8. 次のステップ

この計画に同意いただけた場合、実装順序に従って順次実装を開始します。

各タスクの実装前に、詳細な実装内容を確認し、承認を得てから実装を進めます。

