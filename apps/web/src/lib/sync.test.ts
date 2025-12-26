import { beforeEach, describe, expect, spyOn, test } from "bun:test";
import type { SyncPullResponse } from "@locus/shared";
import * as api from "./api.js";
import * as storage from "./storage.js";
import * as sync from "./sync.js";

// APIとストレージをモック
const mockSyncPull = spyOn(api, "syncPull");
const mockSyncPush = spyOn(api, "syncPush");
const mockGetLastSync = spyOn(storage, "getLastSync");
const mockSaveLastSync = spyOn(storage, "saveLastSync");
const mockGetNote = spyOn(storage, "getNote");
const mockSaveNote = spyOn(storage, "saveNote");
const mockSaveNoteMD = spyOn(storage, "saveNoteMD");
const mockSaveRSSItem = spyOn(storage, "saveRSSItem");
const mockSaveTag = spyOn(storage, "saveTag");
const mockSaveLink = spyOn(storage, "saveLink");
const mockSaveFeed = spyOn(storage, "saveFeed");
const mockGetAllNotes = spyOn(storage, "getAllNotes");
const mockGetAllTags = spyOn(storage, "getAllTags");
const mockGetAllLinks = spyOn(storage, "getAllLinks");
const mockGetAllFeeds = spyOn(storage, "getAllFeeds");
const mockGetNoteMD = spyOn(storage, "getNoteMD");
const mockGetRSSItem = spyOn(storage, "getRSSItem");

describe("sync", () => {
  beforeEach(() => {
    mockSyncPull.mockClear();
    mockSyncPush.mockClear();
    mockGetLastSync.mockClear();
    mockSaveLastSync.mockClear();
    mockGetNote.mockClear();
    mockSaveNote.mockClear();
    mockSaveNoteMD.mockClear();
    mockSaveRSSItem.mockClear();
    mockSaveTag.mockClear();
    mockSaveLink.mockClear();
    mockSaveFeed.mockClear();
    mockGetAllNotes.mockClear();
    mockGetAllTags.mockClear();
    mockGetAllLinks.mockClear();
    mockGetAllFeeds.mockClear();
    mockGetNoteMD.mockClear();
    mockGetRSSItem.mockClear();
  });

  test("pullSync - サーバーから差分を取得してローカルストレージに保存できる", async () => {
    const mockResponse: SyncPullResponse = {
      notes: [
        {
          core: {
            id: "1",
            type: "md",
            title: "Test Note",
            created_at: 1609459200,
            updated_at: 1609459200,
            deleted_at: null,
          },
          md: {
            note_id: "1",
            content: "Test content",
          },
        },
      ],
      tags: [
        {
          id: "tag1",
          name: "test-tag",
        },
      ],
      links: [],
      feeds: [],
    };

    mockGetLastSync.mockResolvedValue(null);
    mockSyncPull.mockResolvedValue(mockResponse as any);
    mockGetNote.mockResolvedValue(null);
    mockSaveNote.mockResolvedValue();
    mockSaveNoteMD.mockResolvedValue();
    mockSaveTag.mockResolvedValue();
    mockSaveLastSync.mockResolvedValue();

    const result = await sync.pullSync();

    expect(mockSyncPull).toHaveBeenCalledWith(0);
    expect(mockSaveNote).toHaveBeenCalledWith(mockResponse.notes[0].core);
    expect(mockSaveNoteMD).toHaveBeenCalledWith(mockResponse.notes[0].md);
    expect(mockSaveTag).toHaveBeenCalledWith(mockResponse.tags[0]);
    expect(result.notes).toBe(1);
    expect(result.tags).toBe(1);
    expect(result.links).toBe(0);
    expect(result.feeds).toBe(0);
  });

  test("pullSync - LWW（Last Write Wins）でマージされる", async () => {
    const existingNote = {
      id: "1",
      type: "md",
      title: "Old Title",
      created_at: 1609459200,
      updated_at: 1609459200,
      deleted_at: null,
    };

    const newNote = {
      id: "1",
      type: "md",
      title: "New Title",
      created_at: 1609459200,
      updated_at: 1609459200 + 100, // より新しい
      deleted_at: null,
    };

    const mockResponse: SyncPullResponse = {
      notes: [
        {
          core: newNote,
        },
      ],
      tags: [],
      links: [],
      feeds: [],
    };

    mockGetLastSync.mockResolvedValue(null);
    mockSyncPull.mockResolvedValue(mockResponse as any);
    mockGetNote.mockResolvedValue(existingNote);
    mockSaveNote.mockResolvedValue();
    mockSaveLastSync.mockResolvedValue();

    await sync.pullSync();

    // より新しいノートが保存される
    expect(mockSaveNote).toHaveBeenCalledWith(newNote);
  });

  test("pullSync - 古いノートは無視される", async () => {
    const existingNote = {
      id: "1",
      type: "md",
      title: "New Title",
      created_at: 1609459200,
      updated_at: 1609459200 + 100, // より新しい
      deleted_at: null,
    };

    const oldNote = {
      id: "1",
      type: "md",
      title: "Old Title",
      created_at: 1609459200,
      updated_at: 1609459200, // より古い
      deleted_at: null,
    };

    const mockResponse: SyncPullResponse = {
      notes: [
        {
          core: oldNote,
        },
      ],
      tags: [],
      links: [],
      feeds: [],
    };

    mockGetLastSync.mockResolvedValue(null);
    mockSyncPull.mockResolvedValue(mockResponse as any);
    mockGetNote.mockResolvedValue(existingNote);
    mockSaveLastSync.mockResolvedValue();

    await sync.pullSync();

    // 古いノートは保存されない
    expect(mockSaveNote).not.toHaveBeenCalled();
  });

  test("pushSync - ローカルストレージから差分を取得してサーバーに送信できる", async () => {
    const localNotes = [
      {
        id: "1",
        type: "md",
        title: "Test Note",
        created_at: 1609459200,
        updated_at: 1609459200 + 100,
        deleted_at: null,
      },
    ];

    mockGetLastSync.mockResolvedValue(1609459200);
    mockGetAllNotes.mockResolvedValue(localNotes);
    mockGetAllTags.mockResolvedValue([]);
    mockGetAllLinks.mockResolvedValue([]);
    mockGetAllFeeds.mockResolvedValue([]);
    mockGetNoteMD.mockResolvedValue({
      note_id: "1",
      content: "Test content",
    });
    mockSyncPush.mockResolvedValue({} as any);
    mockSaveLastSync.mockResolvedValue();

    await sync.pushSync();

    expect(mockGetAllNotes).toHaveBeenCalled();
    expect(mockSyncPush).toHaveBeenCalled();
    expect(mockSaveLastSync).toHaveBeenCalled();
  });

  test("sync - 双方向同期が機能する", async () => {
    const mockPullResponse: SyncPullResponse = {
      notes: [],
      tags: [],
      links: [],
      feeds: [],
    };

    mockGetLastSync.mockResolvedValue(null);
    mockSyncPull.mockResolvedValue(mockPullResponse as any);
    mockGetNote.mockResolvedValue(null);
    mockGetAllNotes.mockResolvedValue([]);
    mockGetAllTags.mockResolvedValue([]);
    mockGetAllLinks.mockResolvedValue([]);
    mockGetAllFeeds.mockResolvedValue([]);
    mockSyncPush.mockResolvedValue({} as any);
    mockSaveLastSync.mockResolvedValue();

    const result = await sync.sync();

    expect(mockSyncPull).toHaveBeenCalled();
    expect(mockSyncPush).toHaveBeenCalled();
    expect(result.pull).toBeDefined();
  });
});
