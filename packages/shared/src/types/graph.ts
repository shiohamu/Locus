import type { NoteType, Tag } from "./index.js";

/**
 * グラフノード（ノート）
 */
export interface GraphNode {
  /** ノートID */
  id: string;
  /** ノートタイトル */
  label: string;
  /** ノートタイプ */
  type: NoteType;
  /** タグ一覧 */
  tags: string[];
}

/**
 * グラフエッジ（リンク）
 */
export interface GraphEdge {
  /** リンク元ノートID */
  from: string;
  /** リンク先ノートID */
  to: string;
}

/**
 * グラフデータ
 */
export interface GraphData {
  /** ノード一覧 */
  nodes: GraphNode[];
  /** エッジ一覧 */
  edges: GraphEdge[];
}

