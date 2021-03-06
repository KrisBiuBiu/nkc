const Router = require("koa-router");
const router = new Router();
router
  .get("/", async (ctx, next) => {
    const {db, data} = ctx;
    data.usernameSettings = await db.SettingModel.getSettings("username");
    ctx.template = "experimental/settings/username/username.pug";
    await next();
  })
  .patch("/", async (ctx, next) => {
    const {db, body} = ctx;
    let {maxKcb, freeCount, onceKcb, free} = body;
    maxKcb = parseInt(maxKcb);
    freeCount = parseInt(freeCount);
    onceKcb = parseInt(onceKcb);
    if(freeCount < 0) ctx.throw(400, "免费修改次数不能小于0");
    if(maxKcb < 0) ctx.throw(400, "花费科创币最大值不能小于0");
    if(onceKcb < 0) ctx.throw(400, "花费科创币增量不能小于0");
    await db.SettingModel.updateOne({_id: "username"}, {
      $set: {
        "c.maxKcb": maxKcb,
        "c.freeCount": freeCount,
        "c.onceKcb": onceKcb,
        "c.free": !!free
      }
    });
    await db.SettingModel.saveSettingsToRedis("username");
    await next();
  });
module.exports = router;