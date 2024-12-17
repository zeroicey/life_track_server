import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import Responder from "./middlewares/response";
import { connectMongo } from "./db/mongo";
import memoRouter from "./routes/memo";

const app = new Hono().basePath("/api");

app.use(cors());
app.use(logger());

// Add memo routes
app.route("/memo", memoRouter);

app.onError((err, c) => {
  return Responder.fail(err?.message).build(c);
});

app.notFound((c) => {
  return Responder.fail("Api Not Found").setStatusCode(404).build(c);
});
// 初始化 MongoDB 连接
connectMongo().catch(console.error);

export default {
  port: process.env.PORT || 3000,
  fetch: app.fetch,
};
