// import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';

await connectToDb();

const sql = `SELECT * FROM department`;
const result = await pool.query(sql);

console.table(result.rows);