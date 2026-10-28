import mongoose from "mongoose";

main().catch(err => console.log(err)) ; 

async function main(){
  await mongoose.connect('mongodb+srv://arnabsheoran801_db_user:<db_password>@cluster0.7bozuyk.mongodb.net/')
}