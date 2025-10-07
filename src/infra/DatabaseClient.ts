// infra/DatabaseClient.ts
import mysql from 'mysql2/promise';
import type { Connection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export class DatabaseClient {
  private connection: Connection | any = null;

  private readonly config = {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  };

  public async connect(): Promise<Connection> {
    if (!this.connection) {
      this.connection = await mysql.createConnection(this.config);
    }
    return this.connection;
  }

  public async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }
}