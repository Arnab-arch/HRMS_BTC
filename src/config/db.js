import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();


const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max:20 ,
  idleTimeoutMillis:30_000,
  connectionTimeoutMillis: 20_000,
});

pool.on('error' , (err)=>{
  console.error('Unexpected error on idle client', err.message);
})

export async function PG_connection(){
  const result = await pool.query('SELECT NOW() AS current_time');
  console.log('Database connected successfully at:', result.rows[0].current_time);
}
export default pool;