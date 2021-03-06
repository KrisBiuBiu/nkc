const Router = require('koa-router');
const router = new Router();
router
	.get('/', async (ctx, next) => {
		const {data, db, nkcModules} = ctx;
		const grade = await db.UsersGradeModel.findOne().sort({score: 1});
		if(grade) {
			return ctx.redirect(nkcModules.apiFunction.generateAppLink(ctx.state, `/e/settings/grade/${grade._id}`));
		}
		data.grades = await db.UsersGradeModel.find().sort({score: 1});
		ctx.template = 'experimental/settings/grade.pug';
		await next();
	})
	.post('/', async (ctx, next) => {
		const {data, db, body, redis} = ctx;
		let {displayName, score} = body;
		score = parseInt(score);
		if(isNaN(score) || score < 0) ctx.throw(400, '积分分界点设置错误');
		const sameDisplayNameGrade = await db.UsersGradeModel.findOne({displayName});
		if(sameDisplayNameGrade) ctx.throw(400, '称号已存在');
		const sameScoreGrade = await db.UsersGradeModel.findOne({score});
		if(sameScoreGrade) ctx.throw(400, '积分分界点已存在');
		const newGrade = db.UsersGradeModel({
			displayName,
			score
		});
		const allGrade = await db.UsersGradeModel.find().sort({score: 1});
		let insert = false;
		for(let i = 0; i < allGrade.length; i++) {
			if(score <= allGrade[i].score) {
				allGrade.splice(i, 0, newGrade);
				insert = true;
				break;
			}
		}
		if(!insert) {
			allGrade.push(newGrade);
		}
		await db.UsersGradeModel.remove({});
		for(let i = 0; i < allGrade.length; i++) {
			const grade = allGrade[i].toObject();
			grade._id = i+1;
			const g = db.UsersGradeModel(grade);
			if(g.score === score) {
				data.grade = g;
			}
			await g.save();
		}
    await redis.cacheForums();
		await next();
	})
	.get('/:_id', async (ctx, next) => {
		const {data, db, params, query} = ctx;
		const {t} = query;
		data.t = t || 'base';
		const {_id} = params;
		data.grade = await db.UsersGradeModel.findOnly({_id});
		data.grades = await db.UsersGradeModel.find().sort({score: 1});
		if(t === 'permissions') {
			data.operations = await db.OperationModel.find().sort({toc: 1});
		}
		ctx.template = 'experimental/settings/grade.pug';
		await next();
	})
	.patch('/:_id', async (ctx, next) => {
		const {db, body, params, redis} = ctx;
		const {_id} = params;
		const grade = await db.UsersGradeModel.findOnly({_id});
		const {operation} = body;
		if(operation === 'saveGradePermissions') {
			const {operationsId} = body;
			await grade.update({operationsId});
		} else if(operation === 'saveGrade') {
			let {color, displayName, description, score} = body;
			score = parseInt(score);
			if(isNaN(score) || score < 0) ctx.throw(400, '积分分界点设置错误');
			const sameDisplayNameGrade = await db.UsersGradeModel.findOne({_id: {$ne: grade._id}, displayName});
			if(sameDisplayNameGrade) ctx.throw(400, '称号已存在');
			const sameScoreGrade = await db.UsersGradeModel.findOne({_id: {$ne: grade._id}, score});
			if(sameScoreGrade) ctx.throw(400, '积分分界点已存在');
			await grade.update({color, displayName, description, score});
		}
    await redis.cacheForums();
		await next();
	})
	.del('/:_id', async (ctx, next) => {
		const {params, db} = ctx;
		const {_id} = params;
		const grade = await db.UsersGradeModel.findOnly({_id});
		await grade.remove();
		const grades = await db.UsersGradeModel.find().sort({_id: 1});
		await db.UsersGradeModel.remove();
		for(let i = 0; i < grades.length; i++) {
		  const g_ = grades[i].toObject();
		  g_._id = i;
		  await db.UsersGradeModel(g_).save();
    }
		await next();
	});
module.exports = router;