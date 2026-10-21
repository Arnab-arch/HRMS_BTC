import {verifytoken} from '../utils/jwt.js'
import {getUserById} from '../repositories/user.repository.js'

export async function Authmiddleware(req , res , next){
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith('Bearer ')){
    return res.status(401).json({error:"Unauthorized"});
  }
  const token = authHeader.split(' ')[1];
  try{
    const decoded = verifytoken(token);
    const user = await getUserById(decoded.sub);
    if(!user){
      return res.status(401).json({error:"Unauthorized"});
    }
    req.user = user;
    next(); 
  }catch(err){
    console.error('Error in authentication middleware:', err);
    return res.status(401).json({error:"Unauthorized"});  
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin privileges are required",
    });
  }

  next();
}