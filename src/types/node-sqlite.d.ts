declare module "node:sqlite" {
  export interface StatementResultingChanges {
    changes: number | bigint;
    lastInsertRowid: number | bigint;
  }

  export class StatementSync {
    run(...params: unknown[]): StatementResultingChanges;
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    iterate(...params: unknown[]): IterableIterator<unknown>;
    setAllowBareNamedParameters(enabled: boolean): void;
    setReadBigInts(enabled: boolean): void;
  }

  export interface DatabaseSyncOptions {
    open?: boolean;
    enableForeignKeyConstraints?: boolean;
    enableDoubleQuotedStringLiterals?: boolean;
    readOnly?: boolean;
  }

  export class DatabaseSync {
    constructor(location: string, options?: DatabaseSyncOptions);

    open(): void;
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): StatementSync;
    createSession(options?: unknown): unknown;
    applyChangeset(changeset: unknown, options?: unknown): boolean;
    enableLoadExtension(enabled: boolean): void;
    loadExtension(path: string): void;
    location(): string | null;

    isOpen: boolean;
    isTransaction: boolean;
  }

  export interface BackupOptions {
    source?: string;
    target?: string;
    rate?: number;
    progress?: (info: {
      totalPages: number;
      remainingPages: number;
    }) => void;
  }

  export function backup(
    sourceDb: DatabaseSync,
    destination: string,
    options?: BackupOptions,
  ): Promise<number>;

  export const constants: Record<string, number>;
}