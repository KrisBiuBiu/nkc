const Router = require('koa-router');
const historyRouter = new Router();
historyRouter
	.get('/', async (ctx, next) => {
		const {data, db} = ctx;
		data.funds = await db.FundModel.find({history: true, disabled: false});
		ctx.template = 'interface_fund_list.pug';
		data.type = 'history';
		await next();
	});
module.exports = historyRouter;