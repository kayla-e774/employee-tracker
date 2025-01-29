// import { QueryResult } from 'pg';
import { pool, connectToDb } from './connection.js';
import Cli from './cli.js'

await connectToDb();

const sql = `SELECT * FROM department`;
const result = await pool.query(sql);

console.table(result.rows);

const cli = new Cli();
cli.performActions();


// pool.end() not finishing, and neither does the program w/o Ctrl+C
/*
console.log('calling end')
await pool.end()
console.log('pool has drained')
*/