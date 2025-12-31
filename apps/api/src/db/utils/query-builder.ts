/**
 * シンプルなSQLクエリビルダー
 * 型安全性を確保し、SQLインジェクションを防ぐ
 */

/**
 * クエリビルダークラス
 */
export class QueryBuilder {
  private selectClause = "";
  private fromClause = "";
  private whereClauses: string[] = [];
  private orderByClause = "";
  private limitClause = "";
  private args: unknown[] = [];

  /**
   * SELECT句を設定
   * @param columns カラム名（配列または文字列）
   * @returns QueryBuilderインスタンス
   */
  select(columns: string | string[]): this {
    if (Array.isArray(columns)) {
      this.selectClause = `SELECT ${columns.join(", ")}`;
    } else {
      this.selectClause = `SELECT ${columns}`;
    }
    return this;
  }

  /**
   * FROM句を設定
   * @param table テーブル名
   * @param alias エイリアス（オプション）
   * @returns QueryBuilderインスタンス
   */
  from(table: string, alias?: string): this {
    if (alias) {
      this.fromClause = `FROM ${table} ${alias}`;
    } else {
      this.fromClause = `FROM ${table}`;
    }
    return this;
  }

  /**
   * WHERE句を追加
   * @param condition 条件（プレースホルダー付き）
   * @param value 値（オプション、条件にプレースホルダーがある場合）
   * @returns QueryBuilderインスタンス
   */
  where(condition: string, value?: unknown): this {
    this.whereClauses.push(condition);
    if (value !== undefined) {
      this.args.push(value);
    }
    return this;
  }

  /**
   * AND条件を追加
   * @param condition 条件（プレースホルダー付き）
   * @param value 値（オプション、条件にプレースホルダーがある場合）
   * @returns QueryBuilderインスタンス
   */
  andWhere(condition: string, value?: unknown): this {
    return this.where(condition, value);
  }

  /**
   * IN条件を追加
   * @param column カラム名
   * @param values 値の配列
   * @returns QueryBuilderインスタンス
   */
  whereIn(column: string, values: unknown[]): this {
    if (values.length === 0) {
      return this;
    }
    const placeholders = values.map(() => "?").join(", ");
    this.whereClauses.push(`${column} IN (${placeholders})`);
    this.args.push(...values);
    return this;
  }

  /**
   * JOIN句を追加
   * @param table テーブル名
   * @param alias エイリアス
   * @param condition JOIN条件
   * @param joinType JOINタイプ（INNER, LEFT, RIGHTなど）
   * @returns QueryBuilderインスタンス
   */
  join(
    table: string,
    alias: string,
    condition: string,
    joinType: "INNER" | "LEFT" | "RIGHT" = "INNER"
  ): this {
    this.fromClause += ` ${joinType} JOIN ${table} ${alias} ON ${condition}`;
    return this;
  }

  /**
   * ORDER BY句を設定
   * @param column カラム名
   * @param direction ソート方向（ASC または DESC）
   * @returns QueryBuilderインスタンス
   */
  orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.orderByClause = `ORDER BY ${column} ${direction}`;
    return this;
  }

  /**
   * LIMIT句を設定
   * @param limit 制限数
   * @param offset オフセット（オプション）
   * @returns QueryBuilderインスタンス
   */
  limit(limit: number, offset?: number): this {
    this.limitClause = `LIMIT ?`;
    this.args.push(limit);
    if (offset !== undefined) {
      this.limitClause += " OFFSET ?";
      this.args.push(offset);
    }
    return this;
  }

  /**
   * DISTINCTを追加
   * @returns QueryBuilderインスタンス
   */
  distinct(): this {
    this.selectClause = this.selectClause.replace("SELECT", "SELECT DISTINCT");
    return this;
  }

  /**
   * SQLクエリを構築
   * @returns SQLクエリ文字列
   */
  toSQL(): string {
    const parts: string[] = [];

    if (this.selectClause) {
      parts.push(this.selectClause);
    }

    if (this.fromClause) {
      parts.push(this.fromClause);
    }

    if (this.whereClauses.length > 0) {
      parts.push(`WHERE ${this.whereClauses.join(" AND ")}`);
    }

    if (this.orderByClause) {
      parts.push(this.orderByClause);
    }

    if (this.limitClause) {
      parts.push(this.limitClause);
    }

    return parts.join(" ");
  }

  /**
   * クエリパラメータを取得
   * @returns パラメータの配列
   */
  getArgs(): unknown[] {
    return [...this.args];
  }

  /**
   * クエリをリセット
   * @returns QueryBuilderインスタンス
   */
  reset(): this {
    this.selectClause = "";
    this.fromClause = "";
    this.whereClauses = [];
    this.orderByClause = "";
    this.limitClause = "";
    this.args = [];
    return this;
  }
}

/**
 * 新しいQueryBuilderインスタンスを作成
 * @returns QueryBuilderインスタンス
 */
export function createQueryBuilder(): QueryBuilder {
  return new QueryBuilder();
}
