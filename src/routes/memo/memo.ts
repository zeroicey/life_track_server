import { Hono } from "hono";
import { MemoGroupModel } from "../../models/memo";
import Responder from "../../middlewares/response";
import { z } from "zod";

const router = new Hono();

const memoSchema = z.object({
  group_id: z.string(),
  text: z.string(),
  attach: z.array(z.string()).optional(),
});

// 创建备忘录
router.post("/memos", async (c) => {
  try {
    const body = await c.req.json();
    const result = memoSchema.safeParse(body);

    if (!result.success) {
      return Responder.fail("参数验证失败").build(c);
    }

    const { group_id, text, attach } = result.data;
    const group = await MemoGroupModel.findById(group_id);

    if (!group) {
      return Responder.fail("分组不存在").build(c);
    }

    group.memos.push({
      text,
      attach: attach || [],
    });

    await group.save();
    const newMemo = group.memos[group.memos.length - 1];

    return Responder.success("创建成功")
      .setData({
        _id: newMemo._id,
        group_id,
        text: newMemo.text,
        attach: newMemo.attach,
        created_at: newMemo.created_at,
        updated_at: newMemo.updated_at,
      })
      .build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "创建失败"
    ).build(c);
  }
});

// 获取分组下的所有备忘录
router.get("/memos", async (c) => {
  const group_id = c.req.query("group_id");
  if (!group_id) {
    return Responder.fail("分组ID不能为空").build(c);
  }

  try {
    const group = await MemoGroupModel.findById(group_id);
    if (!group) {
      return Responder.fail("分组不存在").build(c);
    }

    const memos = group.memos.map((memo) => ({
      _id: memo._id,
      group_id,
      text: memo.text,
      attach: memo.attach,
      created_at: memo.created_at,
      updated_at: memo.updated_at,
    }));

    return Responder.success("获取成功").setData(memos).build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "获取失败"
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
      return Responder.fail("参数验证失败").build(c);
    }

    const { group_id, text, attach } = result.data;
    const group = await MemoGroupModel.findById(group_id);

    if (!group) {
      return Responder.fail("分组不存在").build(c);
    }

    const memo = group.memos.id(id);
    if (!memo) {
      return Responder.fail("备忘录不存在").build(c);
    }

    memo.text = text;
    memo.attach = attach || [];
    memo.updated_at = new Date();

    await group.save();

    return Responder.success("更新成功")
      .setData({
        _id: memo._id,
        group_id,
        text: memo.text,
        attach: memo.attach,
        created_at: memo.created_at,
        updated_at: memo.updated_at,
      })
      .build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "更新失败"
    ).build(c);
  }
});

// 删除备忘录
router.delete("/memos/:id", async (c) => {
  const { id } = c.req.param();
  const group_id = c.req.query("group_id");

  if (!group_id) {
    return Responder.fail("分组ID不能为空").build(c);
  }

  try {
    const group = await MemoGroupModel.findById(group_id);
    if (!group) {
      return Responder.fail("分组不存在").build(c);
    }

    const memoIndex = group.memos.findIndex(
      (memo) => memo._id.toString() === id
    );
    if (memoIndex === -1) {
      return Responder.fail("备忘录不存在").build(c);
    }

    group.memos.splice(memoIndex, 1);
    await group.save();

    return Responder.success("删除成功").build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "删除失败"
    ).build(c);
  }
});

export default router;
