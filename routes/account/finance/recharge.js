const Router = require('koa-router');
const router = new Router();
const serverConfig = require('../../../config/server.json');
router
  .get('/', async (ctx, next) => {
    const {query, data, nkcModules, db} = ctx;
    const {user} = data;
    let {type, money} = query;
    if(type === 'get_url') {
      money = Number(money);
      money = money * 100;
      if(global.NKC.NODE_ENV === "production") {
        if(money < 100) ctx.throw(400, "科创币充值数量不能小于1");
      }
      if(money > 5000000) ctx.throw(400, "单笔充值金额不能超过50000");
      money = Number(money.toFixed(0));
      data.url = await db.KcbsRecordModel.getAlipayUrl({
        uid: user.uid,
        money,
        ip: ctx.address,
        port: ctx.port,
        title: '科创币充值',
        notes: `科创币充值`,
        backParams: {
          type: 'recharge'
        }
      });
    } else if(type === 'back') {
      let backParams = query.extra_common_param;
      backParams = JSON.parse(backParams);
      if(backParams.type === "pay") {
        data.pay = true;
      }
      delete query.type;
      await nkcModules.alipay2.verifySign(query);
      data.kcbsRecordId = query.out_trade_no;
      ctx.template = 'account/finance/rechargeBack.pug';
    } else if(type === 'verify') {
      const {rid} = query;
      const record = await db.KcbsRecordModel.findOne({_id: Number(rid), to: user.uid, type: 'recharge'});
      if(!record) ctx.throw(404, '账单未找到');
      if(record.verify) {
        data.verify = true;
        data.money = record.num;
      }
    } else {
      user.kcb = await db.UserModel.updateUserKcb(user.uid);
      ctx.template = 'account/finance/recharge.pug';
    }
    await next();
  })
  // 支付宝访问服务器，返回支付结果
  .post('/', async (ctx) => {
    const {nkcModules, db, body} = ctx;
    const {out_trade_no, trade_status} = body;
    // 验证信息是否来自支付宝
    await nkcModules.alipay2.verifySign(body);
    // 查询科创币充值记录
    const record = await db.KcbsRecordModel.findOne({_id: out_trade_no});
    if(!record) return ctx.body = 'success';
    const totalAmount = Number(body.total_fee)*100;
    if(trade_status === 'TRADE_SUCCESS') {
      let backParams = body.extra_common_param;
      backParams = JSON.parse(backParams);
      if(record.verify) return ctx.body = 'success';
      if(backParams.type === 'recharge') {
        const updateObj = {
          verify: true,
          c: body
        };
        if(record.num !== totalAmount) {
          updateObj.error = '系统账单金额与支付宝账单金额不相等';
        }
        await record.update(updateObj);
        await db.UserModel.updateUserKcb(record.to);
      } else {
        const updateObj = {
          verify: true,
          c: body
        };
        const ordersId = backParams.ordersId;
        let orders = [];
        let totalMoney = 0;
        for(const id of ordersId) {
          const order = await db.ShopOrdersModel.findOne({orderId: id});
          if(!order) {
            updateObj.error = `支付宝回调信息中的订单ID(${id})不存在`;
            await record.update(updateObj);
            return ctx.body = 'success';
          }
          orders.push(order);
          totalMoney += (order.orderPrice + order.orderFreightPrice);
        }
        if(totalMoney !== totalAmount) {
          updateObj.error = '系统账单金额与支付宝账单金额不相等';
          await record.update(updateObj);
          return ctx.body = 'success';
        }
        orders = await db.ShopOrdersModel.userExtendOrdersInfo(orders);
        const ordersInfo = await db.ShopOrdersModel.getOrdersInfo(orders);
        for(const order of orders) {
          const r = db.KcbsRecordModel({
            _id: await db.SettingModel.operateSystemID('kcbsRecords', 1),
            from: record.to,
            to: record.from,
            type: 'pay',
            ordersId: [order.orderId],
            num: order.orderPrice + order.orderFreightPrice,
            description: ordersInfo.description,
            ip: ctx.address,
            port: ctx.port,
            verify: true
          });
          await r.save();
          // 更改订单状态为已付款，添加付款时间。
          await db.ShopOrdersModel.updateOne({orderId: order.orderId}, {$set: {
            orderStatus: 'unShip',
            payToc: r.toc
          }});
          // 给卖家发送付款成功消息
          await db.MessageModel.sendShopMessage({
            type: "shopBuyerPay",
            r: order.sellUid,
            orderId: order.orderId
          });
        }

        await record.update(updateObj);
        await db.ShopProductsParamModel.productParamReduceStock(orders,'payReduceStock');
        await db.UserModel.updateUserKcb(record.from);

      }
      return ctx.body = 'success';
    }
  });
module.exports = router;