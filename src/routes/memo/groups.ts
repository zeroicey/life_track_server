import { Hono } from "hono";
import validater from "../../middlewares/validate";
import { z } from "zod";
import Responder from "../../middlewares/response";
import { db } from "../../db";
import { Memo, MemoGroup } from "../../db/models/memo";
import { count, desc, eq } from "drizzle-orm";

// TODO: Description update controller

const MemoGroupRouter = new Hono();

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

const postSchema = z.object({
  name: z.string(),
  description: z.string(),
});

MemoGroupRouter.get("/groups", async (c) => {
  const groups = await db
    .select({
      id: MemoGroup.id,
      name: MemoGroup.name,
      description: MemoGroup.description,
      created_at: MemoGroup.created_at,
      updated_at: MemoGroup.updated_at,
      memo_number: count(Memo.id).as("memo_number"), // 计算每个 group 的 memo 数量
    })
    .from(MemoGroup)
    .leftJoin(Memo, eq(Memo.group_id, MemoGroup.id))
    .groupBy(
      MemoGroup.id,
      MemoGroup.name,
      MemoGroup.description,
      MemoGroup.created_at,
      MemoGroup.updated_at
    ) // 所有选择的字段都需要在这里列出
    .orderBy(desc(MemoGroup.updated_at)); // 按照 updated_at 字段降序排序

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

MemoGroupRouter.post("/groups", validater("json", postSchema), async (c) => {
  const { name, description } = c.req.valid("json");
  const [group] = await db
    .insert(MemoGroup)
    .values({ name, description })
    .returning();
  return Responder.success("Group created successfully")
    .setData(group)
    .build(c);
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

export default MemoGroupRouter;
