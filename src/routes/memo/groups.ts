import { Hono } from "hono";
import validater from "../../middlewares/validate";
import { z } from "zod";
import Responder from "../../middlewares/response";
import { db } from "../../db";
import { MemoGroup } from "../../db/models/memo";
import { eq } from "drizzle-orm";

// TODO: Description update controller

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

const postSchema = z.object({
  name: z.string(),
  description: z.string(),
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

MemoGroupRouter.post("/groups", validater("json", postSchema), async (c) => {
  const { name, description } = c.req.valid("json");
  await db.insert(MemoGroup).values({ name, description });
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
