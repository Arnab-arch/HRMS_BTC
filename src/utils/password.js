import bcrypt  from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
export async function hashPassword(password){
  return bcrypt.hashSync(password, salt);
}
export async function VerifyPassword(password , hashPassword){
  return bcrypt.compare(password , hashPassword)
}
