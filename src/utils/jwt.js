import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export  function generateToken(user){
  return jwt.sign({sub: string(user_id)}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
}
export function verifyToken(token){
  try{
    return jwt.verify(token , JWT_SECRET);
  }catch(err){
    throw new Error('Invalid token');
  }
}