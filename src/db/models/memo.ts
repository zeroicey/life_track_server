import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { array } from "zod";

export const Memo = pgTable("memos", {
  id: serial("id").primaryKey(),
  group_id: serial("group_id")
    .notNull()
    .references(() => MemoGroup.id, {
      onDelete: "cascade",
    }),
  text: text("text").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const MemoGroup = pgTable("memo_groups", {
  id: serial("id").primaryKey(),
  name: text("text").notNull().unique(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});
