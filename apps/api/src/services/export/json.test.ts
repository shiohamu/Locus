import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Client } from "@libsql/client";
import { cleanupTestDbFile, createTestDbFile, createTestFile, createTestNoteCore, createTestWebClip } from "../../test/helpers.js";
import * as filesDb from "../../db/files.js";
import * as linksDb from "../../db/links.js";
import * as notesDb from "../../db/notes.js";
import * as notesMDDb from "../../db/notes_md.js";
import * as tagsDb from "../../db/tags.js";
import * as webClipsDb from "../../db/web-clips.js";
import { exportJSON } from "./json.js";

describe("export json", () => {
  let testDb: Client;
  let dbPath: string;
  let originalEnv: string | undefined;

  beforeEach(async () => {
    const result = await createTestDbFile();
    testDb = result.db;
    dbPath = result.path;

    originalEnv = process.env.DATABASE_URL;
    process.env.DATABASE_URL = `file:${dbPath}`;
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      process.env.DATABASE_URL = undefined;
    }

    await cleanupTestDbFile(testDb, dbPath);
  });

  test("exportJSON - 全データをJSON形式でエクスポートできる", async () => {
    // ノートを作成
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "web_clip" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await notesMDDb.createNoteMD({ note_id: note1.id, content: "Content 1" });

    const webClip = createTestWebClip({ note_id: note2.id });
    await webClipsDb.createWebClip(webClip);

    // タグを作成
    const tag = await tagsDb.createTag({ id: crypto.randomUUID(), name: "test-tag" });
    await tagsDb.addTagToNote({ note_id: note1.id, tag_id: tag.id });

    // リンクを作成
    await linksDb.createLink({ from_note_id: note1.id, to_note_id: note2.id });

    // ファイルを作成
    const file = createTestFile();
    await filesDb.createFile(file);

    const data = await exportJSON();

    expect(data.version).toBe("1.0");
    expect(data.exported_at).toBeGreaterThan(0);
    expect(data.notes.length).toBe(2);
    expect(data.notes_md.length).toBe(1);
    expect(data.tags.length).toBe(1);
    expect(data.links.length).toBe(1);
    expect(data.web_clips.length).toBe(1);
    expect(data.files.length).toBe(1);
  });

  test("exportJSON - データの整合性が保たれる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    await notesDb.createNote(note1);

    await notesMDDb.createNoteMD({ note_id: note1.id, content: "Content 1" });

    const tag = await tagsDb.createTag({ id: crypto.randomUUID(), name: "test-tag" });
    await tagsDb.linkTagToNote(tag.id, note1.id);

    const data = await exportJSON();

    // ノートとノートMDの関連が正しいことを確認
    const exportedNote = data.notes.find((n) => n.id === note1.id);
    expect(exportedNote).toBeDefined();
    expect(exportedNote?.title).toBe("Note 1");

    const exportedNoteMD = data.notes_md.find((n) => n.note_id === note1.id);
    expect(exportedNoteMD).toBeDefined();
    expect(exportedNoteMD?.content).toBe("Content 1");

    // タグの関連が正しいことを確認
    const exportedTag = data.tags.find((t) => t.id === tag.id);
    expect(exportedTag).toBeDefined();
    expect(exportedTag?.name).toBe("test-tag");
  });

  test("exportJSON - リンクの重複が除去される", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    // 同じリンクを複数回取得しても重複しない
    await linksDb.createLink({ from_note_id: note1.id, to_note_id: note2.id });

    const data = await exportJSON();

    // リンクが1つだけであることを確認
    const links = data.links.filter(
      (l) => l.from_note_id === note1.id && l.to_note_id === note2.id
    );
    expect(links.length).toBe(1);
  });

  test("exportJSON - 空のデータベースでもエクスポートできる", async () => {
    const data = await exportJSON();

    expect(data.version).toBe("1.0");
    expect(data.exported_at).toBeGreaterThan(0);
    expect(data.notes).toEqual([]);
    expect(data.notes_md).toEqual([]);
    expect(data.tags).toEqual([]);
    expect(data.links).toEqual([]);
    expect(data.rss_feeds).toEqual([]);
    expect(data.rss_items).toEqual([]);
    expect(data.web_clips).toEqual([]);
    expect(data.files).toEqual([]);
  });

  test("exportJSON - エクスポートされたJSONが有効な形式である", async () => {
    const note = createTestNoteCore({ title: "Test Note", type: "md" });
    await notesDb.createNote(note);

    const data = await exportJSON();
    const jsonString = JSON.stringify(data);

    // JSONとしてパースできることを確認
    const parsed = JSON.parse(jsonString);
    expect(parsed.version).toBe("1.0");
    expect(parsed.notes.length).toBe(1);
  });
});

