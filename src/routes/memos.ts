import { Hono } from "hono";
import validater from "../middlewares/validate";
import { z } from "zod";
import Responder from "../middlewares/response";
import { db } from "../db";
import { Memo, MemoGroup } from "../db/models/memo";
import { eq } from "drizzle-orm";

export const MemoRouter = new Hono();
export const MemoGroupRouter = new Hono();

const idSchema = z.object({
  id: z
    .string()
    .transform(Number)
    .refine((val) => !isNaN(val), {
      message: "Invalid ID format",
    }),
});

const nameSchema = z.object({
  name: z.string(),
});

MemoRouter.get("/memos/:id", validater("param", idSchema), async (c) => {
  const { id } = c.req.valid("param");
  const memo = await db.select().from(Memo).where(eq(Memo.id, id)).limit(1);
  if (!memo.length) {
    return Responder.fail("Memo not found").build(c);
  }
  return Responder.success().setData(memo[0]).build(c);
});

MemoRouter.post(
  "/memos",
  validater(
    "json",
    z.object({
      text: z.string(),
      group_id: z
        .string()
        .transform(Number)
        .refine((val) => !isNaN(val), {
          message: "Invalid ID format",
        }),
    })
  ),
  async (c) => {
    const { text, group_id } = c.req.valid("json");
    const memo = await db.insert(Memo).values({ text, group_id }).returning();
    return Responder.success("Memo created successfully")
      .setData(memo)
      .build(c);
  }
);

MemoRouter.patch(
  "/memos/:id",
  validater("param", idSchema),
  validater(
    "json",
    z.object({
      group_id: z
        .string()
        .transform(Number)
        .refine((val) => !isNaN(val), {
          message: "Invalid ID format",
        }),
      text: z.string(),
    })
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { group_id, text } = c.req.valid("json");
    const [memo] = await db
      .update(Memo)
      .set({ group_id, text })
      .where(eq(Memo.id, id))
      .returning({ id: Memo.id });
    if (!memo) {
      return Responder.fail("Memo not found").build(c);
    }
    return Responder.success(`Memo ${memo.id} updated successfully`).build(c);
  }
);

MemoRouter.delete("/memos/:id", validater("param", idSchema), async (c) => {
  const { id } = c.req.valid("param");
  const memo = await db
    .delete(Memo)
    .where(eq(Memo.id, id))
    .returning({ id: Memo.id });
  if (!memo.length) {
    return Responder.fail("Memo not found").build(c);
  }
  return Responder.success(`Memo ${memo[0].id} deleted successfully`).build(c);
});

MemoGroupRouter.get("/groups", async (c) => {
  const groups = await db.select().from(MemoGroup);
  return Responder.success().setData(groups).build(c);
});

MemoGroupRouter.get("/groups/:id", validater("param", idSchema), async (c) => {
  const { id } = c.req.valid("param");
  const group = await db
    .select()
    .from(MemoGroup)
    .limit(1)
    .where(eq(MemoGroup.id, id));
  if (!group.length) {
    return Responder.fail("Group not found").build(c);
  }
  return Responder.success().setData(group[0]).build(c);
});

MemoGroupRouter.post("/groups", validater("query", nameSchema), async (c) => {
  const { name } = c.req.valid("query");
  await db.insert(MemoGroup).values({ name });
  return Responder.success("Group created successfully").build(c);
});

MemoGroupRouter.patch(
  "/groups/:id",
  validater("param", idSchema),
  validater("query", nameSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { name } = c.req.valid("query");
    const [group] = await db
      .update(MemoGroup)
      .set({ name })
      .where(eq(MemoGroup.id, id))
      .returning({ id: MemoGroup.id });
    if (!group) {
      return Responder.fail("Group not found").build(c);
    }
    return Responder.success(`Group ${group.id} updated successfully`).build(c);
  }
);

MemoGroupRouter.delete(
  "/groups/:id",
  validater("param", idSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const [group] = await db
      .delete(MemoGroup)
      .where(eq(MemoGroup.id, id))
      .returning({ id: MemoGroup.id });
    if (!group) {
      return Responder.fail("Group not found").build(c);
    }
    return Responder.success(`Group ${group.id} deleted successfully`).build(c);
  }
);
