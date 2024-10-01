import { Hono } from "hono";
import { logger } from "hono/logger";
import Responder from "./middlewares/response";
import { MemoRouter, MemoGroupRouter } from "./routes/memos";

const app = new Hono().basePath("/api");

app.use(logger());

app.route("/memo", MemoRouter);
app.route("/memo", MemoGroupRouter);

app.onError((err, c) => {
  return Responder.fail(err?.message).build(c);
});

app.notFound((c) => {
  return Responder.fail("Not Found").setStatusCode(404).build(c);
});

export default {
  port: 3000,
  fetch: app.fetch,
};
