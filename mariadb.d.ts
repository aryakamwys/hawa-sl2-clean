declare module 'mariadb' {
  export interface PoolConfig {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    database?: string;
    connectionLimit?: number;
  }

  export interface Pool {
    query<T = any>(sql: string, values?: any[]): Promise<T>;
    end(): Promise<void>;
    on(event: string, callback: Function): void;
  }

  export function createPool(config: PoolConfig): Pool;
}
