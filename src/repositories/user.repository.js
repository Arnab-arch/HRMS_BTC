import mongoose from "mongoose";
import User from "../models/user.model.js";

export async function getUserByEmail(email) {
  return User.findOne({ email })
    .select("name email password_hash role")
    .exec();
}

export async function getUserById(id) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    return null;
  }

  return User.findById(id)
    .select("name email role")
    .exec();
}

export async function createUser(name, email, password_hash, role) {
  return User.create({ name, email, password_hash, role });
}
