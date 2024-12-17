import { Hono } from "hono";
import { z } from "zod";
import { MemoService } from "../services/memo";
import Responder from "../middlewares/response";
import validater from "../middlewares/validate";

const memoRouter = new Hono();

const memoSchema = z.object({
  text: z.string().min(1, "Text is required"),
});

// Create memo
memoRouter.post("/memos", validater("json", memoSchema), async (c) => {
  const data = c.req.valid("json");
  const memo = await MemoService.createMemo(data);
  return Responder.success("Memo created successfully").setData(memo).build(c);
});

// Get all memos
memoRouter.get("/memos", async (c) => {
  const memos = await MemoService.getAllMemos();
  return Responder.success("Memos retrieved successfully")
    .setData(memos)
    .build(c);
});

// Get memo by id
memoRouter.get("/memos/:id", async (c) => {
  const id = c.req.param("id");
  const memo = await MemoService.getMemoById(id);
  return Responder.success("Memo retrieved successfully")
    .setData(memo)
    .build(c);
});

// Update memo
memoRouter.put("/memos/:id", validater("json", memoSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const memo = await MemoService.updateMemo(id, data);
  return Responder.success("Memo updated successfully").setData(memo).build(c);
});

// Delete memo
memoRouter.delete("/memos/:id", async (c) => {
  const id = c.req.param("id");
  await MemoService.deleteMemo(id);
  return Responder.success("Memo deleted successfully").build(c);
});

// Get memos by tag
memoRouter.get("/tags/:tag", async (c) => {
  const tag = c.req.param("tag");
  const memos = await MemoService.getMemosByTag(tag);
  return Responder.success("Memos retrieved successfully")
    .setData(memos)
    .build(c);
});

// Get all tags
memoRouter.get("/tags", async (c) => {
  const tags = await MemoService.getAllTags();
  return Responder.success("Tags retrieved successfully")
    .setData(tags)
    .build(c);
});

// Get memos by date range
memoRouter.get("/memos/date-range", async (c) => {
  const { startDate, endDate } = c.req.query();
  
  if (!startDate || !endDate) {
    return Responder.fail("Start date and end date are required")
      .setStatusCode(400)
      .build(c);
  }
  
  try {
    const memos = await MemoService.getMemosByDateRange(startDate, endDate);
    return Responder.success("Memos retrieved successfully")
      .setData(memos)
      .build(c);
  } catch (error) {
    return Responder.fail("Invalid date format")
      .setStatusCode(400)
      .build(c);
  }
});

export default memoRouter;
