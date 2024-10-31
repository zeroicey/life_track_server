import { Hono } from "hono";
import validater from "../../middlewares/validate";
import { z } from "zod";
import Responder from "../../middlewares/response";
import { MemoGroupModel } from "../../models/memo";
import mongoose from "mongoose";

const MemoGroupRouter = new Hono();

const idSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  }),
});

const groupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
});

// 获取所有分组
MemoGroupRouter.get("/groups", async (c) => {
  try {
    const groups = await MemoGroupModel.find().lean();
    const formattedGroups = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      description: group.description,
      memo_count: group.memo_count || 0,
      created_at: group.created_at,
      updated_at: group.updated_at,
    }));
    return Responder.success().setData(formattedGroups).build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "获取失败"
    ).build(c);
  }
});

// 获取单个分组
MemoGroupRouter.get("/groups/:id", validater("param", idSchema), async (c) => {
  const { id } = c.req.valid("param");
  try {
    const group = await MemoGroupModel.findById(id).lean();
    if (!group) {
      return Responder.fail("Group not found").build(c);
    }
    return Responder.success()
      .setData({
        _id: group._id,
        name: group.name,
        description: group.description,
        memo_count: group.memo_count || 0,
        created_at: group.created_at,
        updated_at: group.updated_at,
      })
      .build(c);
  } catch (error) {
    return Responder.fail(
      error instanceof Error ? error.message : "获取失败"
    ).build(c);
  }
});

// 创建分组
MemoGroupRouter.post("/groups", validater("json", groupSchema), async (c) => {
  const data = c.req.valid("json");
  try {
    const now = new Date();
    const group = await MemoGroupModel.create({
      ...data,
      memo_count: 0,
      created_at: now,
      updated_at: now,
      memos: [],
    });

    return Responder.success("Group created successfully")
      .setData({
        _id: group._id,
        name: group.name,
        description: group.description,
        memo_count: 0,
        created_at: group.created_at,
        updated_at: group.updated_at,
      })
      .build(c);
  } catch (error: unknown) {
    if ((error as any).code === 11000) {
      return Responder.fail("Group name already exists").build(c);
    }
    throw error;
  }
});

// 更新分组
MemoGroupRouter.patch(
  "/groups/:id",
  validater("param", idSchema),
  validater("json", groupSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");

    try {
      const group = await MemoGroupModel.findByIdAndUpdate(
        id,
        {
          ...data,
          updated_at: new Date(),
        },
        {
          new: true,
          runValidators: true,
        }
      ).lean();

      if (!group) {
        return Responder.fail("Group not found").build(c);
      }

      return Responder.success("Group updated successfully")
        .setData({
          _id: group._id,
          name: group.name,
          description: group.description,
          memo_count: group.memo_count || 0,
          created_at: group.created_at,
          updated_at: group.updated_at,
        })
        .build(c);
    } catch (error: unknown) {
      if ((error as any).code === 11000) {
        return Responder.fail("Group name already exists").build(c);
      }
      throw error;
    }
  }
);

// 删除分组
MemoGroupRouter.delete(
  "/groups/:id",
  validater("param", idSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    try {
      const group = await MemoGroupModel.findByIdAndDelete(id);

      if (!group) {
        return Responder.fail("Group not found").build(c);
      }
      return Responder.success("Group deleted successfully")
        .setData({
          _id: group._id,
          name: group.name,
          description: group.description,
          memo_count: group.memo_count || 0,
          created_at: group.created_at,
          updated_at: group.updated_at,
        })
        .build(c);
    } catch (error) {
      return Responder.fail(
        error instanceof Error ? error.message : "删除失败"
      ).build(c);
    }
  }
);

export default MemoGroupRouter;
