/**
 * APIクライアント - すべてのAPIを再エクスポート
 */

// 共通処理
export { getApiBaseUrl, apiRequest } from "./base.js";

// ノート関連
export {
  getNotes,
  getNotesByTags,
  getNotesWithTags,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  deleteNotesBatch,
  createNoteMD,
  getNoteMD,
  updateNoteMD,
  getNoteLinks,
} from "./notes.js";

// タグ関連
export {
  getTags,
  createTag,
  addTagToNote,
  getTagsByNote,
  removeTagFromNote,
  deleteTag,
  generateTagSuggestions,
} from "./tags.js";

// RSS関連
export {
  getRSSFeeds,
  createRSSFeed,
  deleteRSSFeed,
  fetchRSSFeed,
  getRSSItem,
  updateRSSItem,
} from "./rss.js";

// Webクリップ関連
export {
  createWebClip,
  getWebClips,
  getWebClip,
  refetchWebClip,
  deleteWebClip,
} from "./web-clips.js";

// ファイル関連
export {
  uploadFile,
  getFiles,
  getFile,
  getFileDownloadUrl,
  deleteFile,
  linkFileToNote,
  unlinkFileFromNote,
  getFilesByNote,
  updateFile,
} from "./files.js";

// 検索関連
export { searchNotes } from "./search.js";

// LLM関連
export {
  getLLMConfig,
  getLLMSettings,
  saveLLMSettings,
  deleteLLMSettings,
  summarizeNote,
  summarizeRSSArticle,
  extractKeyPoints,
} from "./llm.js";

// 同期関連
export { syncPull, syncPush } from "./sync.js";

// エクスポート関連
export { getMarkdownExportUrl, getJSONExportUrl } from "./export.js";

// グラフ関連
export { getGraphData } from "./graph.js";
