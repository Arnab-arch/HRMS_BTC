import "dotenv/config";
import {z} from "zod";
const envSchema = z.object({
    PORT: z.string().default("3000"),
    NODE_ENV: z.enum(["development", "production"]).default("development"),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().default("1h"),
    MONGOODB_URL: z.string().min(1),
});

const result = envSchema.safeParse(process.env);
if (!result.success){
  console.error("Invalid environment variables ");
   console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = Object.freeze(result.data); 
