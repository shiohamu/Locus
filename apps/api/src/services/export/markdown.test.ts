import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import JSZip from "jszip";
import type { Client } from "@libsql/client";
import { cleanupTestDbFile, createTestDbFile, createTestNoteCore } from "../../test/helpers.js";
import * as linksDb from "../../db/links.js";
import * as notesDb from "../../db/notes.js";
import * as notesMDDb from "../../db/notes_md.js";
import * as tagsDb from "../../db/tags.js";
import { exportMarkdown } from "./markdown.js";

describe("export markdown", () => {
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

  test("exportMarkdown - 全ノートをMarkdown形式でエクスポートできる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await notesMDDb.createNoteMD({ note_id: note1.id, content: "Content 1" });
    await notesMDDb.createNoteMD({ note_id: note2.id, content: "Content 2" });

    const zipBuffer = await exportMarkdown({});

    // ZIPファイルとして解析できることを確認
    const zip = await JSZip.loadAsync(zipBuffer);
    expect(Object.keys(zip.files).length).toBe(2);

    // ファイル名が正しいことを確認
    const file1 = zip.files[`${note1.id}.md`];
    const file2 = zip.files[`${note2.id}.md`];
    expect(file1).toBeDefined();
    expect(file2).toBeDefined();

    // コンテンツが正しいことを確認
    const content1 = await file1.async("string");
    expect(content1).toContain("Note 1");
    expect(content1).toContain("Content 1");
    expect(content1).toContain("---"); // frontmatter

    const content2 = await file2.async("string");
    expect(content2).toContain("Note 2");
    expect(content2).toContain("Content 2");
  });

  test("exportMarkdown - タイプでフィルタリングできる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "rss" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await notesMDDb.createNoteMD({ note_id: note1.id, content: "Content 1" });

    const zipBuffer = await exportMarkdown({ type: "md" });

    const zip = await JSZip.loadAsync(zipBuffer);
    expect(Object.keys(zip.files).length).toBe(1);
    expect(zip.files[`${note1.id}.md`]).toBeDefined();
  });

  test("exportMarkdown - タグとリンクがfrontmatterに含まれる", async () => {
    const note1 = createTestNoteCore({ title: "Note 1", type: "md" });
    const note2 = createTestNoteCore({ title: "Note 2", type: "md" });
    await notesDb.createNote(note1);
    await notesDb.createNote(note2);

    await notesMDDb.createNoteMD({ note_id: note1.id, content: "Content 1" });

    // タグを作成
    const tag = await tagsDb.createTag({ id: crypto.randomUUID(), name: "test-tag" });
    await tagsDb.addTagToNote({ note_id: note1.id, tag_id: tag.id });

    // リンクを作成
    await linksDb.createLink({ from_note_id: note1.id, to_note_id: note2.id });

    const zipBuffer = await exportMarkdown({});

    const zip = await JSZip.loadAsync(zipBuffer);
    const file1 = zip.files[`${note1.id}.md`];
    const content1 = await file1.async("string");

    // タグが含まれていることを確認
    expect(content1).toContain("test-tag");
    expect(content1).toContain("tags:");

    // リンクが含まれていることを確認
    expect(content1).toContain("links:");
    expect(content1).toContain(note2.id);
  });

  test("exportMarkdown - 空のノートでもエクスポートできる", async () => {
    const note = createTestNoteCore({ title: "Empty Note", type: "md" });
    await notesDb.createNote(note);

    const zipBuffer = await exportMarkdown({});

    const zip = await JSZip.loadAsync(zipBuffer);
    expect(Object.keys(zip.files).length).toBe(1);

    const file = zip.files[`${note.id}.md`];
    const content = await file.async("string");
    expect(content).toContain("Empty Note");
    expect(content).toContain("---"); // frontmatter
  });
});

