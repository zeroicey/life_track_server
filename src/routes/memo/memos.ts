import { Hono } from "hono";
import validater from "../../middlewares/validate";
import { z } from "zod";
import Responder from "../../middlewares/response";
import { MemoModel } from "../../models/memo";
import mongoose from "mongoose";

const MemoRouter = new Hono();

const idSchema = z.object({
  id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid ID format",
  }),
});

const memoSchema = z.object({
  text: z.string().min(1, "Text is required"),
  group_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: "Invalid group ID format",
  }),
  attach: z.array(z.string()).max(9, "Maximum 9 attachments allowed").default([]),
});

// 获取所有备忘录
MemoRouter.get("/memos", async (c) => {
  const memos = await MemoModel.find();
  return Responder.success().setData(memos).build(c);
});

// 获取单个备忘录
MemoRouter.get("/memos/:id", validater("param", idSchema), async (c) => {
  const { id } = c.req.valid("param");
  const memo = await MemoModel.findById(id);
  if (!memo) {
    return Responder.fail("Memo not found").build(c);
  }
  return Responder.success().setData(memo).build(c);
});

// 创建备忘录
MemoRouter.post(
  "/memos",
  validater("json", memoSchema),
  async (c) => {
    const data = c.req.valid("json");
    try {
      const memo = await MemoModel.create(data);
      return Responder.success("Memo created successfully")
        .setData(memo)
        .build(c);
    } catch (error: unknown) {
      if ((error as any).code === 11000) {
        return Responder.fail("Duplicate memo entry").build(c);
      }
      throw error;
    }
  }
);

// 更新备忘录
MemoRouter.put(
  "/memos/:id",
  validater("param", idSchema),
  validater("json", memoSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const data = c.req.valid("json");
    
    try {
      const memo = await MemoModel.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );
      
      if (!memo) {
        return Responder.fail("Memo not found").build(c);
      }
      return Responder.success("Memo updated successfully")
        .setData(memo)
        .build(c);
    } catch (error: unknown) {
      if ((error as any).code === 11000) {
        return Responder.fail("Duplicate memo entry").build(c);
      }
      throw error;
    }
  }
);

// 删除备忘录
MemoRouter.delete("/memos/:id", validater("param", idSchema), async (c) => {
  const { id } = c.req.valid("param");
  const memo = await MemoModel.findByIdAndDelete(id);
  
  if (!memo) {
    return Responder.fail("Memo not found").build(c);
  }
  return Responder.success("Memo deleted successfully")
    .setData(memo)
    .build(c);
});

export default MemoRouter;
