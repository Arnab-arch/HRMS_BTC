import pool from "../config/db.js";

export async function getUserByEmail(email){
  try{
    const result = await pool.query(`SELECT id , name , email , password_hash , role FROM users WHERE email = $1` , [email]);
    return result.rows[0]?? null;
  }catch(err){
    console.error('Error fetching user by email:', err);
    throw err;
  }
}

export async function getUserById(id){
  try{
      const result = await pool.query(`SELECT id , name , email , password_hash , role FROM users WHERE id = $1` , [id]);
  return result.rows[0]?? null;

  }catch(err){
    console.error('Error fetching user by ID:', err);
    throw err;  
  }

}

export async function createUser(name , email , password_hash , role){
  try{
    const result = await pool.query(`INSERT INTO users (name ,email,password_hash , role) VALUES ($1 , $2 , $3 , $4) RETURNING id , name , email , role` , [name , email , password_hash , role]);
    return result.rows[0];    
  }catch(err){
    console.error('Error creating user:', err);
    throw err;  
  }
}

