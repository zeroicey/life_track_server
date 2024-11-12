import { Hono } from "hono";
import { MemoGroupModel } from "../../models/memo";
import Responder from "../../middlewares/response";
import { z } from "zod";

const router = new Hono();

const memoSchema = z.object({
  group_id: z.string(),
  text: z.string(),
});

// 创建备忘录
router.post("/memos", async (c) => {
  try {
    const body = await c.req.json();
    const result = memoSchema.safeParse(body);

    if (!result.success) {
      return Responder.fail("Parameter validation failed").build(c);
    }

    const { group_id, text } = result.data;
    const group = await MemoGroupModel.findById(group_id);

    if (!group) {
      return Responder.fail("Group not found").build(c);
    }

    group.memos.push({
      text,
      attach: [],
    });

    await group.save();
    const newMemo = group.memos[group.memos.length - 1];

    return Responder.success("Created successfully")
      .setData({
        _id: newMemo._id,
        group_id,
        text: newMemo.text,
        created_at: newMemo.created_at,
        updated_at: newMemo.updated_at,
      })
      .build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "Creation failed"
    ).build(c);
  }
});

// 获取分组下的所有备忘录
router.get("/memos", async (c) => {
  const group_id = c.req.query("group_id");
  if (!group_id) {
    return Responder.fail("Group ID is required").build(c);
  }

  try {
    const group = await MemoGroupModel.findById(group_id);
    if (!group) {
      return Responder.fail("Group not found").build(c);
    }

    const memos = group.memos.map((memo) => ({
      _id: memo._id,
      group_id,
      text: memo.text,
      created_at: memo.created_at,
      updated_at: memo.updated_at,
    }));

    return Responder.success("Retrieved successfully").setData(memos).build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "Retrieval failed"
    ).build(c);
  }
});

// 更新备忘录
router.patch("/memos/:id", async (c) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();
    const result = memoSchema.safeParse(body);

    if (!result.success) {
      return Responder.fail("Parameter validation failed").build(c);
    }

    const { group_id, text } = result.data;
    const group = await MemoGroupModel.findById(group_id);

    if (!group) {
      return Responder.fail("Group not found").build(c);
    }

    const memo = group.memos.id(id);
    if (!memo) {
      return Responder.fail("Memo not found").build(c);
    }

    memo.text = text;
    memo.updated_at = new Date();

    await group.save();

    return Responder.success("Updated successfully")
      .setData({
        _id: memo._id,
        group_id,
        text: memo.text,
        created_at: memo.created_at,
        updated_at: memo.updated_at,
      })
      .build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "Update failed"
    ).build(c);
  }
});

// 删除备忘录
router.delete("/memos/:id", async (c) => {
  const { id } = c.req.param();
  const group_id = c.req.query("group_id");

  if (!group_id) {
    return Responder.fail("Group ID is required").build(c);
  }

  try {
    const group = await MemoGroupModel.findById(group_id);
    if (!group) {
      return Responder.fail("Group not found").build(c);
    }

    const memoIndex = group.memos.findIndex(
      (memo) => memo._id.toString() === id
    );
    if (memoIndex === -1) {
      return Responder.fail("Memo not found").build(c);
    }

    group.memos.splice(memoIndex, 1);
    await group.save();

    return Responder.success("Deleted successfully").build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "Deletion failed"
    ).build(c);
  }
});

export default router;
