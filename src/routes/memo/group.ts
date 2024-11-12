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
    const groups = await MemoGroupModel.aggregate([
      {
        $lookup: {
          from: "memos",
          localField: "memos",
          foreignField: "_id",
          as: "memos",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          created_at: 1,
          updated_at: 1,
          memo_count: { $size: "$memos" },
        },
      },
    ]);
    return Responder.success().setData(groups).build(c);
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
    const [group] = await MemoGroupModel.aggregate([
      {
        $match: { _id: mongoose.Types.ObjectId.createFromHexString(id) },
      },
      {
        $lookup: {
          from: "memos",
          localField: "memos",
          foreignField: "_id",
          as: "memos",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          created_at: 1,
          updated_at: 1,
          memo_count: { $size: "$memos" },
        },
      },
    ]);

    if (!group) {
      return Responder.fail("Group not found").build(c);
    }
    return Responder.success().setData(group).build(c);
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
          memo_count: 0,
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
