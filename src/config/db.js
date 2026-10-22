import pg from 'pg';
import { env } from "./env.js";

const { Pool } = pg;
const pool = new Pool({
  host: env.DB_HOST,
  port: Number(env.DB_PORT),
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max:20 ,
  idleTimeoutMillis:30_000,
  connectionTimeoutMillis: 20_000,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err.message);
})

export async function PG_connection(){
  await pool.query("SELECT NOW() AS current_time");
  console.log("Database connected successfully");
}
export default pool;