import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// for query purposes
const POSTGRES_URL = process.env.POSTGRES_URL || "postgresql://postgres:postgres@localhost:5432/life_track";
const queryClient = postgres(POSTGRES_URL);
export const db = drizzle(queryClient);
