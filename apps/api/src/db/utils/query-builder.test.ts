import { describe, expect, test } from "bun:test";
import { createQueryBuilder, QueryBuilder } from "./query-builder.js";

describe("QueryBuilder", () => {
  describe("basic query building", () => {
    test("should build simple SELECT query", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("users")
        .where("deleted_at IS NULL");

      const sql = query.toSQL();
      expect(sql).toBe("SELECT id, name FROM users WHERE deleted_at IS NULL");
      expect(query.getArgs()).toEqual([]);
    });

    test("should build query with WHERE parameter", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("users")
        .where("id = ?", "123");

      const sql = query.toSQL();
      expect(sql).toBe("SELECT id, name FROM users WHERE id = ?");
      expect(query.getArgs()).toEqual(["123"]);
    });

    test("should build query with multiple WHERE conditions", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("users")
        .where("deleted_at IS NULL")
        .andWhere("active = ?", 1)
        .andWhere("type = ?", "admin");

      const sql = query.toSQL();
      expect(sql).toBe(
        "SELECT id, name FROM users WHERE deleted_at IS NULL AND active = ? AND type = ?"
      );
      expect(query.getArgs()).toEqual([1, "admin"]);
    });
  });

  describe("JOIN", () => {
    test("should build query with INNER JOIN", () => {
      const query = createQueryBuilder()
        .select(["u.id", "u.name", "p.title"])
        .from("users", "u")
        .join("posts", "p", "u.id = p.user_id")
        .where("u.deleted_at IS NULL");

      const sql = query.toSQL();
      expect(sql).toBe(
        "SELECT u.id, u.name, p.title FROM users u INNER JOIN posts p ON u.id = p.user_id WHERE u.deleted_at IS NULL"
      );
    });

    test("should build query with LEFT JOIN", () => {
      const query = createQueryBuilder()
        .select(["u.id", "u.name"])
        .from("users", "u")
        .join("posts", "p", "u.id = p.user_id", "LEFT")
        .where("u.deleted_at IS NULL");

      const sql = query.toSQL();
      expect(sql).toContain("LEFT JOIN");
    });
  });

  describe("WHERE IN", () => {
    test("should build query with WHERE IN", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("tags")
        .whereIn("id", ["tag1", "tag2", "tag3"]);

      const sql = query.toSQL();
      expect(sql).toBe("SELECT id, name FROM tags WHERE id IN (?, ?, ?)");
      expect(query.getArgs()).toEqual(["tag1", "tag2", "tag3"]);
    });

    test("should handle empty WHERE IN array", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("tags")
        .whereIn("id", []);

      const sql = query.toSQL();
      expect(sql).not.toContain("WHERE");
      expect(query.getArgs()).toEqual([]);
    });
  });

  describe("ORDER BY", () => {
    test("should build query with ORDER BY ASC", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("users")
        .orderBy("name", "ASC");

      const sql = query.toSQL();
      expect(sql).toBe("SELECT id, name FROM users ORDER BY name ASC");
    });

    test("should build query with ORDER BY DESC", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("users")
        .orderBy("name", "DESC");

      const sql = query.toSQL();
      expect(sql).toBe("SELECT id, name FROM users ORDER BY name DESC");
    });
  });

  describe("LIMIT and OFFSET", () => {
    test("should build query with LIMIT", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("users")
        .limit(10);

      const sql = query.toSQL();
      expect(sql).toBe("SELECT id, name FROM users LIMIT ?");
      expect(query.getArgs()).toEqual([10]);
    });

    test("should build query with LIMIT and OFFSET", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .from("users")
        .limit(10, 20);

      const sql = query.toSQL();
      expect(sql).toBe("SELECT id, name FROM users LIMIT ? OFFSET ?");
      expect(query.getArgs()).toEqual([10, 20]);
    });
  });

  describe("DISTINCT", () => {
    test("should build query with DISTINCT", () => {
      const query = createQueryBuilder()
        .select(["id", "name"])
        .distinct()
        .from("users");

      const sql = query.toSQL();
      expect(sql).toBe("SELECT DISTINCT id, name FROM users");
    });
  });

  describe("complex query", () => {
    test("should build complex query with all features", () => {
      const query = createQueryBuilder()
        .select(["u.id", "u.name", "p.title"])
        .distinct()
        .from("users", "u")
        .join("posts", "p", "u.id = p.user_id")
        .where("u.deleted_at IS NULL")
        .andWhere("u.active = ?", 1)
        .whereIn("u.type", ["admin", "user"])
        .orderBy("u.created_at", "DESC")
        .limit(10, 20);

      const sql = query.toSQL();
      expect(sql).toContain("SELECT DISTINCT");
      expect(sql).toContain("FROM users u");
      expect(sql).toContain("INNER JOIN");
      expect(sql).toContain("WHERE");
      expect(sql).toContain("ORDER BY");
      expect(sql).toContain("LIMIT");
      expect(sql).toContain("OFFSET");

      const args = query.getArgs();
      expect(args).toContain(1);
      expect(args).toContain("admin");
      expect(args).toContain("user");
      expect(args).toContain(10);
      expect(args).toContain(20);
    });
  });

  describe("reset", () => {
    test("should reset query builder", () => {
      const query = createQueryBuilder()
        .select(["id"])
        .from("users")
        .where("id = ?", "123");

      query.reset();

      const sql = query.toSQL();
      expect(sql).toBe("");
      expect(query.getArgs()).toEqual([]);
    });
  });
});

