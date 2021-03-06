const fs = require('fs');
if(!fs.existsSync('./install/install.lock')) {
  return require('./install/server.js')
}


require('./global');

require('colors');
const http = require('http'),
  app = require('./app'),
  elasticSearch = require("./nkcModules/elasticSearch"),
  settings = require('./settings'),
  serverConfig = require('./config/server'),
  cacheForums = require('./redis/cacheForums'),
  socket = require('./socket'),
  {updateDate, upload} = settings,
  {
    RoleModel,
    ForumModel,
    OperationModel
  } = require('./dataModels');

let server;

const dataInit = async () => {
  if(global.NKC.NODE_ENV !== 'production') {
    const defaultData = require('./defaultData');
    await defaultData.init();
  }
  // 运维包含所有的操作权限
  const operations = await OperationModel.find({}, {_id: 1});
  const operationsId = operations.map(o => o._id);
  await RoleModel.update({_id: 'dev'}, {$set: {operationsId: operationsId}});
  await ForumModel.updateMany({}, {$addToSet: {rolesId: 'dev'}});
};

// 定时任务 每天固定时间执行
const jobsInit = async () => {
  const jobs = require('./scheduleJob');
  jobs.updateActiveUsers(updateDate.updateActiveUsersCronStr);
  jobs.updateForums(updateDate.updateForumsCronStr);
  jobs.shop();
  jobs.backupDatabase();
  jobs.checkKcbsRecords();
  jobs.moveRecycleMarkThreads();
};

// 定时任务 隔一段时间执行
const timedTasksInit = async () => {
 const timedTasks = require("./timedTasks");
 await timedTasks.cacheActiveUsers();
 await timedTasks.cacheAds();
 await timedTasks.clearTimeoutPageCache();
};

const start = async () => {
  try {
    if(global.NKC.processId === 0) {
      await dataInit();
      await jobsInit();
      await upload.initFolders();
      // 这里会将缓存数据清空 1号
      await cacheForums();
      await timedTasksInit();
    }
    await elasticSearch.init();
    console.log('ElasticSearch is ready...'.green);

    const port = serverConfig.port + global.NKC.processId;
    const address = serverConfig.address;
    server = http.createServer(app);
    server.listen(port, address, async () => {
      await socket(server);
      console.log(`nkc ${global.NKC.NODE_ENV} server listening on ${port}`.green);
    });
  } catch(err) {
    console.error(`error occured when initialize the server.\n${err.stack}`.red);
    process.exit(-1)
  }
};

start();
