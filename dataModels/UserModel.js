const settings = require('../settings');
const {certificates} = settings.permission;
const mongoose = settings.database;
const Schema = mongoose.Schema;
const {indexUser, updateUser} = settings.elastic;

const userSchema = new Schema({
  kcb: {
    type: Number,
    default: 0
  },
  oldKcb: {
    type: Number,
    default: 0
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  xsf: {
    type: Number,
    default: 0
  },
  tlv: {
    type: Date,
    index: 1,
    default: Date.now,
  },
  disabledPostsCount: {
    type: Number,
    default: 0
  },
  disabledThreadsCount: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
  },
  threadCount: {
    type: Number,
    default: 0
  },
  recCount: {
    type: Number,
    default: 0
  },
  toppedThreadsCount: {
    type: Number,
    default: 0
  },
  digestThreadsCount: {
    type: Number,
    default: 0,
  },
	digestPostsCount: {
  	type: Number,
		default: 0
	},
	// 在线天数
	dailyLoginCount: {
  	type: Number,
		default: 0,
	},
	// 违规数
	violationCount: {
		type: Number,
		default: 0
	},
  score: {
    default: 0,
    type: Number
  },
  lastVisitSelf: {
    type: Date,
    default: Date.now
  },
  username: {
    type: String,
	  index: 1,
	  default: '',
    // unique: true,
    // required: true,
    // minlength: 1,
    maxlength: 30,
    trim: true
  },
  usernameLowerCase: {
    type: String,
    // unique: true,
	  index: 1,
	  default: '',
    trim: true,
    lowercase: true
  },
  uid: {
    type: String,
    unique: true,
    required: true,
  },
  cart: [String],
  description: {
    type: String,
    default: ""
  },
  color: {
    type: String,
    default: ""
  },
  certs: {
    type: [String],
    default: [],
    index: 1
  },
  postSign: String,
	volumeA: {
  	type: Boolean,
		default: false
	},
	volumeB: {
  	type: Boolean,
		default: false
	},
	online: {
  	type: Boolean,
		default: false,
		index: 1
	},
  onlineType: {
    type: String,
    default: '',
    index: 1
  },
  // 头像文件hash
  avatar: {
    type: String,
    default: ""
  },
  // 背景文件名hash
  banner: {
    type: String,
    default: ""
  }
},
{toObject: {
  getters: true,
  virtuals: true
}});

userSchema.pre('save', function(next) {
  try {
  	this.usernameLowerCase = this.username;
	  const arr = ['default', 'scholar'];
  	const certs = [];
  	for(let cert of this.certs) {
  		if(!arr.includes(cert) && !certs.includes(cert)) {
				certs.push(cert);
		  }
	  }
	  this.certs = certs;
	  return next()
  } catch(e) {
    return next(e)
  }
});

userSchema.virtual('operations')
  .get(function() {
    return this._operations;
  })
  .set(function(operations) {
    this._operations = operations;
  });

userSchema.virtual('setPassword')
  .get(function() {
    return this._setPassword;
  })
  .set(function(setPassword) {
    this._setPassword = setPassword;
  });

userSchema.virtual('boundMobile')
  .get(function() {
    return this._boundMobile;
  })
  .set(function(boundMobile) {
    this._boundMobile = boundMobile;
  });

userSchema.virtual('boundEmail')
  .get(function() {
    return this._boundEmail;
  })
  .set(function(boundEmail) {
    this._boundEmail = boundEmail;
  });



userSchema.virtual('')
  .get(function() {
    return this._havePassword;
  })
  .set(function(havePassword) {
    this._havePassword = havePassword;
  });

userSchema.virtual('subUid')
  .get(function() {
    return this._subUid;
  })
  .set(function(subUid) {
    this._subUid = subUid;
  });

userSchema.virtual('registerType')
	.get(function() {
		return this._registerType;
	})
	.set(function(registerType) {
		this._registerType = registerType;
	});

userSchema.virtual('paperA')
	.get(function() {
		return this._paperA;
	})
	.set(function(paperA) {
		this._paperA = paperA;
	});

userSchema.virtual('paperB')
	.get(function() {
		return this._paperB;
	})
	.set(function(paperB) {
		this._paperB = paperB;
	});


userSchema.virtual('regPort')
	.get(function() {
		return this._regPort;
	})
	.set(function(p) {
		this._regPort = p;
	});

userSchema.virtual('draftCount')
	.get(function() {
		return this._draftCount;
	})
	.set(function(draftCount) {
		this._draftCount = draftCount;
	});

userSchema.virtual('subscribeUsers')
	.get(function() {
		return this._subscribeUsers;
	})
	.set(function(subscribeUsers) {
		this._subscribeUsers = subscribeUsers;
	});

userSchema.virtual('regIP')
  .get(function() {
    return this._regIP;
  })
  .set(function(ip) {
    this._regIP = ip;
  });

userSchema.virtual('mobile')
	.get(function() {
		return this._mobile;
	})
	.set(function(m) {
		this._mobile = m;
	});

userSchema.virtual('nationCode')
	.get(function() {
		return this._nationCode;
	})
	.set(function(m) {
		this._nationCode = m;
	});

userSchema.virtual('email')
	.get(function() {
		return this._email;
	})
	.set(function(e) {
		this._email = e;
	});

userSchema.virtual('roles')
	.get(function() {
		return this._roles;
	})
	.set(function(e) {
		this._roles = e;
	});

userSchema.virtual('group')
  .get(function() {
    return this._group;
  })
  .set(function(g) {
    this._group = g;
  });

userSchema.virtual('column')
  .get(function() {
    return this._column;
  })
  .set(function(g) {
    this._column = g;
  });

userSchema.virtual('threads')
  .get(function() {
    return this._threads;
  })
  .set(function(t) {
    this._threads = t;
  });

userSchema.virtual('generalSettings')
  .get(function() {
    return this._generalSettings;
  })
  .set(function(s) {
    this._generalSettings = s;
  });

userSchema.virtual('newMessage')
	.get(function() {
		return this._newMessage;
	})
	.set(function(newMessage) {
		this._newMessage = newMessage;
	});

userSchema.virtual('grade')
	.get(function() {
		return this._grade;
	})
	.set(function(grade) {
		this._grade = grade;
	});

userSchema.virtual('authLevel')
  .get(function() {
    return this._authLevel;
  })
  .set(function(authLevel) {
    this._authLevel = authLevel;
  });
userSchema.virtual('newVoteUp')
  .get(function() {
    return this._newVoteUp;
  })
  .set(function(newVoteUp) {
    this._newVoteUp = newVoteUp;
  });
userSchema.virtual('info')
  .get(function() {
    return this._info;
  })
  .set(function(info) {
    this._info = info;
  });
userSchema.virtual('user')
  .get(function() {
    return this._user;
  })
  .set(function(user) {
    this._user = user;
  });

userSchema.methods.extendThreads = async function() {
  const ThreadModel = mongoose.model('threads');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}}).sort({toc: -1}).limit(8);
  return this.threads = threads;
};

userSchema.methods.getUsersThreads = async function() {
  const ThreadModel = mongoose.model('threads');
  let threads = await ThreadModel.find({uid: this.uid, fid: {$ne: 'recycle'}, recycleMark: {"$nin":[true]}}).sort({toc: -1}).limit(8);
  return await ThreadModel.extendThreads(threads);
};

userSchema.methods.extend = async function(options) {
  const ExamsCategoryModel = mongoose.model('examsCategories');
  let proExamsCategoriesId, pubExamsCategoriesId;
  if(options) {
    proExamsCategoriesId = options.proExamsCategoriesId;
    pubExamsCategoriesId = options.pubExamsCategoriesId;
  } else {
    let categories = await ExamsCategoryModel.find({volume: 'B'}, {_id: 1});
    proExamsCategoriesId = categories.map(c => c._id);
    categories = await ExamsCategoryModel.find({volume: 'A'}, {_id: 1});
    pubExamsCategoriesId = categories.map(c => c._id);
  }
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const SecretBehaviorModel = mongoose.model('secretBehaviors');
  const ExamsPaperModel = mongoose.model('examsPapers');
  const userPersonal = await UsersPersonalModel.findOnly({uid: this.uid});
  this.regPort = userPersonal.regPort;
  this.regIP = userPersonal.regIP;
  this.mobile = userPersonal.mobile;
  this.nationCode = userPersonal.nationCode;
  this.email = userPersonal.email;
  // 判断注册类型
  if(this.email) {
	  const behavior = await SecretBehaviorModel.findOne({uid: this.uid, operationId: 'bindEmail'});
	  if(behavior) {
		  this.registerType = 'mobile';
	  } else {
		  this.registerType = 'email';
	  }
  } else {
  	this.registerType = 'mobile';
  }
  // 获取b卷考试科目
  const paperB = await ExamsPaperModel.findOne({uid: this.uid, passed: true, cid: {$in: proExamsCategoriesId}}).sort({toc: 1});
  const paperA = await ExamsPaperModel.findOne({uid: this.uid, passed: true, cid: {$in: pubExamsCategoriesId}}).sort({toc: 1});

  if(paperB) {
    this.paperB = await ExamsCategoryModel.findOne({_id: paperB.cid});
  }
	if(paperA) {
    this.paperA = await ExamsCategoryModel.findOne({_id: paperA.cid});
  }
};

userSchema.methods.extendRoles = async function() {
  const RoleModel = mongoose.model('roles');
  let certs = [].concat(this.certs);
  if(!certs.includes('default')) {
    certs.push('default');
  }
  if(this.xsf > 0 && !certs.includes('scholar')) {
    certs.push('scholar');
  }
  if(certs.includes('banned')) {
    certs = ['banned'];
  }
  const roles = [];
	for(let cert of certs) {
		const role = await RoleModel.findOne({_id: cert});
		if(role) roles.push(role);
	}
	return this.roles = roles;
};


// 用户数据更新
userSchema.methods.updateUserMessage = async function() {
  const PostModel = mongoose.model('posts');
  const ThreadModel = mongoose.model('threads');
  const UsersScoreLogModel = mongoose.model('usersScoreLogs');

  const {uid} = this;
	// 发帖回帖统计
  const threads = await ThreadModel.find({uid}, {oc: 1, _id: 0});
  const threadsOc = threads.map(t => t.oc);
  const threadCount = threads.length;
  const disabledThreadsCount = await ThreadModel.count({uid, disabled: true});
  const digestThreadsCount = await ThreadModel.count({uid, digest: true});
  const toppedThreadsCount = await ThreadModel.count({uid, topped: true});
	const allDigestPostsCount = await PostModel.count({uid, digest: true});
	const digestPostsCount = allDigestPostsCount - digestThreadsCount;
  const postCount = await PostModel.count({pid: {$nin: threadsOc}, uid});
  const disabledPostsCount = await PostModel.count({pid: {$nin: threadsOc}, uid, disabled: true});
	// 日常登录统计
  const dailyLoginCount = await UsersScoreLogModel.count({
	  uid,
	  type: 'score',
	  operationId: 'dailyLogin'
  });
	// 被赞统计
	/*const recommendCount = await UsersScoreLogModel.count({
		targetUid: uid,
		type: 'score',
		operationId: 'recommendPost'
	});
	const unRecommendCount = await UsersScoreLogModel.count({
		targetUid: uid,
		type: 'score',
		operationId: 'UNRecommendPost'
	});
	const recCount = recommendCount - unRecommendCount;*/
	const results = await PostModel.aggregate([
		{
			$match: {
				uid,
				disabled: false,
				'recUsers.0': {$exists: 1}
			}
		},
		{
			$unwind: '$recUsers'
		},
		{
			$count: 'recCount'
		}
	]);
	let recCount = 0;
	if(results.length !== 0) {
		recCount = results[0].recCount;
	}
	// 违规统计
	const violationCount = await UsersScoreLogModel.count({
		uid,
		type: 'score',
		operationId: 'violation'
	});

	const updateObj = {
		threadCount,
		postCount,
		digestPostsCount,
		disabledPostsCount,
		disabledThreadsCount,
		digestThreadsCount,
		toppedThreadsCount,
		recCount,
		dailyLoginCount,
		violationCount
	};

  await this.update(updateObj);
  for(const key in updateObj) {
  	if(!updateObj.hasOwnProperty(key)) continue;
  	this[key] = updateObj[key];
  }
  await this.calculateScore();
};

// 积分计算
userSchema.methods.calculateScore = async function() {
	const SettingModel = mongoose.model('settings');
	// 积分设置
	const scoreSettings = await SettingModel.findOnly({_id: 'score'});
	const {coefficients} = scoreSettings.c;

	const {xsf, postCount, threadCount, disabledPostsCount, disabledThreadsCount, violationCount, dailyLoginCount, digestThreadsCount, digestPostsCount, recCount} = this;
	// 积分计算
	const scoreOfPostToThread = coefficients.postToThread*(postCount - disabledPostsCount);
	const scoreOfPostToForum = coefficients.postToForum*(threadCount - disabledThreadsCount);
	const scoreOfDigestThreadCount = coefficients.digest*digestThreadsCount;
	const scoreOfDigestPostCount = coefficients.digestPost*digestPostsCount;
	const scoreOfXsf = coefficients.xsf*xsf;
	const scoreOfDailyLogin = coefficients.dailyLogin*dailyLoginCount;
	const scoreOfViolation = coefficients.violation*violationCount;
	let scoreOfRecommend = 0;
	if(recCount >= 0) {
		scoreOfRecommend = coefficients.thumbsUp*Math.sqrt(recCount);
	}
	const score = scoreOfDailyLogin + scoreOfDigestThreadCount + scoreOfDigestPostCount + scoreOfPostToForum + scoreOfPostToThread + scoreOfXsf + scoreOfRecommend + scoreOfViolation;
	await this.update({score});
};

/*
* 保存用户时向搜索数据库存入用户数据
* @author pengxiguaa 2019-8-16
* */
userSchema.pre('save', async function(next) {
  const elasticSearch = require("../nkcModules/elasticSearch");
  try {
    await elasticSearch.save("user", this);
    await next();
  } catch(e) {
    return next(e)
  }
});



/*
* 创建用户
* @param {Object} option 三张表（users, usersPersonal, usersGenera）的属性
* @return {Object} user对象
* @author pengxiguaa 2019-8-16
* */
userSchema.statics.createUser = async (option) => {
	const UserModel = mongoose.model('users');
	const UsersPersonalModel = mongoose.model('usersPersonal');
	const SubscribeModel = mongoose.model("subscribes");
	const SettingModel = mongoose.model('settings');
	const UsersGeneraModel = mongoose.model('usersGeneral');
	const MessageModel = mongoose.model('messages');
	const SubscribeTypeModel = mongoose.model("subscribeTypes");
	const SystemInfoLogModel = mongoose.model('systemInfoLogs');

	const userObj = Object.assign({}, option);

	const toc = Date.now();

	const uid = await SettingModel.operateSystemID('users', 1);
	userObj.uid = uid;
	userObj.toc = toc;
	userObj.tlv = toc;
	userObj.tlm = toc;
	userObj.certs = [];
	// 生成默认用户名，符号"-"和uid保证此用户名全局唯一
	if(!userObj.username) {
	  userObj.username = `kc-${uid}`;
    userObj.usernameLowerCase = userObj.username;
  }

	const user = UserModel(userObj);
	const userPersonal = UsersPersonalModel(userObj);
	const userGeneral = UsersGeneraModel({uid});

	// 生成关注专业记录
  const {defaultSubscribeForumsId} = await SettingModel.getSettings("register");
	try {
		await user.save();
		await userPersonal.save();
		await userGeneral.save();
		// 创建默认关注分类
    await SubscribeModel.createDefaultType("post", uid);
    await SubscribeModel.createDefaultType("replay", uid);
    // 创建默认数据 关注专业
		for(const fid of defaultSubscribeForumsId) {
		  const sub = SubscribeModel({
        _id: await SettingModel.operateSystemID("subscribes", 1),
        uid,
        type: "forum",
        fid
      });
		  await sub.save();
    }
		// 创建默认数据 查看系统通知的记录
    const systemInfo = await MessageModel.find({ty: 'STE'}, {_id: 1});
		for(const s of systemInfo) {
      const log = SystemInfoLogModel({
        mid: s._id,
        uid
      });
      await log.save();
    }
	} catch (error) {
		await UserModel.remove({uid});
		await UsersPersonalModel.remove({uid});
		await UsersGeneraModel.remove({uid});
		await SystemInfoLogModel.remove({uid});
		await SubscribeModel.remove({
      uid,
      type: "forum",
      fid: {$in: defaultSubscribeForumsId}
    });
		await SubscribeTypeModel.remove({uid});
		throwErr(500, `创建用户出错:${error.message || error}`);
	}
	return user;
};


userSchema.methods.extendGrade = async function() {
	const UsersGradeModel = mongoose.model('usersGrades');
	if(!this.score || this.score < 0) {
		this.score = 0
	}
	const grade = await UsersGradeModel.findOne({score: {$lte: this.score}}).sort({score: -1});
	return this.grade = grade;
};
/* 
  拓展全局设置
  @author pengxiguaa 2019/3/6
*/
userSchema.methods.extendGeneralSettings = async function() {
  return this.generalSettings = await mongoose.model('usersGeneral').findOnly({uid: this.uid});
}
/* 
  验证用户是否完善资料，包括：用户名、密码
  未完善则会抛出错误
  @author pengxiguaa 2019/3/7
*/
userSchema.methods.ensureUserInfo = async function() {
  if(!this.username) throwErr(403, '您的账号还未完善资料，请前往资料设置页完善必要资料。');
};

userSchema.methods.getNewMessagesCount = async function() {
	const MessageModel = mongoose.model('messages');
	const SystemInfoLogModel = mongoose.model('systemInfoLogs');
	// 系统通知
  const allSystemInfoCount = await MessageModel.count({ty: 'STE'});
  const viewedSystemInfoCount = await SystemInfoLogModel.count({uid: this.uid});
  const newSystemInfoCount = allSystemInfoCount - viewedSystemInfoCount;
  // 可能会生成多条相同的阅读记录 以下判断用于消除重复的数据
  if(newSystemInfoCount < 0) {
    const systemInfoLog = await SystemInfoLogModel.aggregate([
      {
        $match: {
          uid: this.uid
        }
      },
      {
        $group: {
          _id: "$mid",
          count: {
            $sum: 1
          }
        }
      }
    ]);
    for(const log of systemInfoLog) {
      if(log.count <= 1) continue;
      const logs = await SystemInfoLogModel.find({mid: log._id, uid: this.uid});
      for(let i = 0; i < logs.length; i++) {
        if(i > 0) {
          await logs[i].remove();
        }
      }
    }
  }
	// 系统提醒
  const newReminderCount = await MessageModel.count({ty: 'STU', r: this.uid, vd: false});
	// 用户信息
  const newUsersMessagesCount = await MessageModel.count({ty: 'UTU', s: {$ne: this.uid}, r: this.uid, vd: false});
	return {
		newSystemInfoCount,
		newReminderCount,
		newUsersMessagesCount
	}
};

userSchema.methods.getMessageLimit = async function() {
	const grade = await this.extendGrade();
	const roles = await this.extendRoles();
	let {messagePersonCountLimit, messageCountLimit} = grade;
	for(const role of roles) {
		const personLimit = role.messagePersonCountLimit;
		const messageLimit = role.messageCountLimit;
		if(personLimit > messagePersonCountLimit) {
			messagePersonCountLimit = personLimit;
		}
		if(messageLimit > messageCountLimit) {
			messageCountLimit = messageLimit;
		}
	}
	return {
		messagePersonCountLimit,
		messageCountLimit
	}
};
/* 
  获取用户发表文章、发表回复的时间和次数限制
  @author pengxiguaa 2019/2/27
*/
userSchema.methods.getPostLimit = async function() {

	const grade = await this.extendGrade();
	const roles = await this.extendRoles();

	const arr = [grade].concat(roles);

	let postToForumCountLimit = 0, postToForumTimeLimit = 9999999999,
    postToThreadCountLimit = 0, postToThreadTimeLimit = 9999999999;

	for(const item of arr) {
	  // 读取"发表文章次数"最大值。
	  if(item.postToForum.countLimit.unlimited) {
      postToForumCountLimit = 9999999999;
    } else if(postToForumCountLimit < item.postToForum.countLimit.num) {
      postToForumCountLimit = item.postToForum.countLimit.num;
    }
    // 读取"发表回复次数"最大值。
    if(item.postToThread.countLimit.unlimited) {
      postToThreadCountLimit = 9999999999;
    } else if(postToThreadCountLimit < item.postToThread.countLimit.num) {
      postToThreadCountLimit = item.postToThread.countLimit.num;
    }
    // 读取"发表文章间隔时间"最小值。
    if(item.postToForum.timeLimit.unlimited) {
      postToForumTimeLimit = 0;
    } else if(postToForumTimeLimit > item.postToForum.timeLimit.num) {
      postToForumTimeLimit = item.postToForum.timeLimit.num;
    }
    // 读取"发表回复间隔时间"最小值。
    if(item.postToThread.timeLimit.unlimited) {
      postToThreadTimeLimit = 0;
    } else if(postToThreadTimeLimit > item.postToThread.timeLimit.num) {
      postToThreadTimeLimit = item.postToThread.timeLimit.num;
    }
  }

	return {
		postToForumTimeLimit,
		postToForumCountLimit,
		postToThreadCountLimit,
		postToThreadTimeLimit
	}

};

/* 
  拓展用户基本信息，显示在用户面板中，任何人可见的内容
  @param users: 用户对象数组
  @author pengxiguaa 2019/2/27
*/
userSchema.statics.extendUsersInfo = async (users) => {
  const RoleModel = mongoose.model('roles');
  const UserModel = mongoose.model('users');
  const UsersPersonalModel = mongoose.model('usersPersonal');
  const uid = new Set(), personalObj = {};
  for(const user of users) {
    uid.add(user.uid);
  }
  const usersPersonal = await UsersPersonalModel.find({uid: {$in: [...uid]}}, {uid: 1, mobile: 1, nationCode: 1, email: 1});
  for(const personal of usersPersonal) {
    personalObj[personal.uid] = personal;
  }

  const users_ = []; // 普通对象

  for(const user of users) {
    let certs = user.certs.concat([]);
    // 若用户拥有“banned”证书，则忽略其他证书
    if(certs.includes('banned')) {
      certs = ['banned'];
    } else {
      if(!certs.includes('default')) {
        certs.unshift('default');
      }
      // 若用户的学术分大于0，则临时添加“scholar”证书
      if(!certs.includes('scholar') && user.xsf > 0){
        certs.push('scholar');
      }
    }
    const info = {};
    info.certsName = [];
    const column = await UserModel.getUserColumn(user.uid);
    if(column) {
      user.column = {
        _id: column._id,
        name: column.name
      }
    }
    for(const cert of certs) {
      const role = await RoleModel.extendRole(cert);
      if(role.displayName && !role.hidden) {
        info.certsName.push(role.displayName);
      }
    }
    if(!certs.includes('banned')) {
      const userPersonal = personalObj[user.uid];
      // 若用户绑定了手机号，则临时添加“机友”标志
      if(userPersonal.mobile && userPersonal.nationCode) info.certsName.push('机友');
      // 若用户绑定了邮箱，则临时添加“笔友”标志
      if(userPersonal.email) info.certsName.push('笔友');
    }
    info.certsName = info.certsName.join(' ');
    user.info = info;
    users_.push(user.toObject());
  }
  return users_;
};

userSchema.statics.extendUserInfo = async function(user) {
  const UserModel = mongoose.model("users");
  const users = await UserModel.extendUsersInfo([user]);
  return users[0];
};

/*
* 拓展并返回用户的身份认证等级
* @return {Number} 身份认证等级
* @author pengxiguaa 2019-8-16
* */
userSchema.methods.extendAuthLevel = async function() {
  const userPersonal = await mongoose.model('usersPersonal').findUsersPersonalById(this.uid);
  return this.authLevel = await userPersonal.getAuthLevel();
};

/* 
  通过uid查找单一用户
  @param uid: 用户ID
  @author pengxiguaa 2019/3/7 
*/
userSchema.statics.findById = async (uid) => {
  const UserModel = mongoose.model('users');
  const user = await UserModel.findOne({uid});
  if(!user) throwErr(404, `未找到ID为【${uid}】的用户`);
  return user;
};

/*
* 根据用户的kcb转账记录 计算用户的科创币总量 并将计算结果写到user.kcb
* @param {String} uid 用户ID
* @author pengxiguaa 2019-4-4
* */
userSchema.statics.updateUserKcb= async (uid) => {
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const KcbsRecordModel = mongoose.model("kcbsRecords");
  const fromRecords = await KcbsRecordModel.aggregate([
    {
      $match: {
        from: uid,
        verify: true
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$num"
        }
      }
    }
  ]);
  const toRecords = await KcbsRecordModel.aggregate([
    {
      $match: {
        to: uid,
        verify: true
      }
    },
    {
      $group: {
        _id: null,
        total: {
          $sum: "$num"
        }
      }
    }
  ]);
  const expenses = fromRecords.length? fromRecords[0].total: 0;
  const income = toRecords.length? toRecords[0].total: 0;
  const total = income - expenses;
  if(uid === "bank") {
    await SettingModel.update({_id: "kcb"}, {
      $set: {
        "c.totalMoney": total
      }
    });
  } else {
    await UserModel.update({
      uid
    }, {
      $set: {
        kcb: total
      }
    });
  }
  return total;
};
/*
* 更新用户的kcb
* 该方法位于user对象
* @author pengxiguaa 2019-4-15
* */
userSchema.methods.updateKcb = async function() {
  const UserModel = mongoose.model("users");
  this.kcb = await UserModel.updateUserKcb(this.uid);
};
/*
* 验证用户是否还能关注相应的内容
* @param {String} type 关注的类型 user: 关注用户, forum: 关注专业, thread: 关注文章
* @author pengxiguaa 2019-4-24
* */
userSchema.methods.ensureSubLimit = async function(type) {
  const SubscribeModel = mongoose.model("subscribes");
  const SettingModel = mongoose.model("settings");
  const subSettings = await SettingModel.findById("subscribe");
  const {subUserCountLimit, subForumCountLimit, subThreadCountLimit,
    subColumnCountLimit
  } = subSettings.c;
  if(type === "user") {
    if(subUserCountLimit <= 0) throwErr(400, "关注用户功能已关闭");
    const userCount = await SubscribeModel.count({
      uid: this.uid,
      type: "user"
    });
    if(userCount >= subUserCountLimit) throwErr(400, "关注用户数量已达上限");
  } else if(type === "forum") {
    if(subForumCountLimit <= 0) throwErr(400, "关注专业已关闭");
    const forumCount = await SubscribeModel.count({
      uid: this.uid,
      type: "forum"
    });
    if(forumCount >= subForumCountLimit) throwErr(400, "关注专业数量已达上限");
  } else if(type === "thread") {
    if (subThreadCountLimit <= 0) throwErr(400, "关注文章功能已关闭");
    const threadCount = await SubscribeModel.count({
      uid: this.uid,
      type: "thread"
    });
    if (threadCount >= subThreadCountLimit) throwErr(400, "关注文章数量已达上限");
  } else if(type === "column") {
    if(subColumnCountLimit <= 0) throwErr(400, "关注专栏功能已关闭");
    const columnCount = await SubscribeModel.count({
      uid: this.uid,
      type: "column"
    });
    if(columnCount >= subColumnCountLimit) throwErr(400, "关注专栏数量已达上限");
  } else {
    throwErr(500, `未知的type类型：${type}`);
  }
};

userSchema.statics.getUserPostSummary = async (uid) => {
  const PostModel = mongoose.model("posts");
  const data = await PostModel.aggregate([
    {
      $match: {
        mainForumsId: {
          $nin: ["recycle"]
        },
        uid,
        disabled: false
      }
    },
    {
      $unwind: "$mainForumsId"
    },
    {
      $group: {
        _id: "$mainForumsId",
        count: {
          $sum: 1
        }
      }
    },
    {
      $sort: {
        count: -1
      }
    }
  ]);
  const forumsId = data.map(d => d._id);
  const forums = await mongoose.model("forums").find({fid: {$in: forumsId}}, {
    displayName: 1,
    fid: 1,
    color: 1
  });
  const forumsObj = {};
  for(const forum of forums) {
    forumsObj[forum.fid] = forum;
  }
  const results = [];
  let otherCount = 0;
  for(const d of data) {
    const forum = forumsObj[d._id];
    if(!forum) continue;
    // 超过10 则归为"其他"分类
    if(results.length >= 20) {
      otherCount += d.count;
    } else {
      results.push({
        forumName: forum.displayName,
        fid: forum.fid,
        count: d.count,
        color: forum.color || "#aaa"
      });
    }
  }
  if(otherCount > 0) {
    results.push({
      forumName: "其他",
      fid: "",
      count: otherCount,
      color: "#aaa"
    });
  }
  return results;
};
/*
* 获取用户的信息好友ID
* @param {String} uid 用户ID
* @return {[String]} 好友ID数组
* @author pengxiguaa 2019-5-9
* */
userSchema.statics.getUsersFriendsId = async (uid) => {
  const FriendModel = mongoose.model("friends");
  const friends = await FriendModel.find({uid});
  return friends.map(c => c.tUid);
};

/*
* 判断用户是否上传了头像
* @param {String} uid 用户id
* @author pengxiguaa 2019-5-13
* @return {Boolean} 是否上传
* */
userSchema.statics.uploadedAvatar = async (avatar) => {
  if(!avatar) return false;
  let {avatarPath} = require("../settings/upload");
  const {existsSync} = require("../tools/fsSync");
  avatarPath += `/${avatar}.jpg`;
  return existsSync(avatarPath);
};
/*
* 判断用户是否上传了背景
* @param {String} uid 用户id
* @author pengxiguaa 2019-5-13
* @return {Boolean} 是否上传
* */
userSchema.statics.uploadedBanner = async (banner) => {
  if(!banner) throwErr(500, "userModel.uploadedBanner: banner is required");
  let {userBannerPath} = require("../settings/upload");
  const {existsSync} = require("../tools/fsSync");
  userBannerPath += `/${banner}.jpg`;
  return existsSync(userBannerPath);
};

/*
* 验证用户是否已完善基本信息
* 信息种类：用户名、头像、绑定手机号
* @param {String/Object} uid 用户id/用户对象
* @author pengxiguaa 2019-5-13
* */
userSchema.statics.checkUserBaseInfo = async (uid, singleError) => {
  const UserModel = mongoose.model("users");
  const baseInfoStatus = await UserModel.getUserBaseInfoStatus(uid);
  if(!baseInfoStatus.status) {
    if(singleError) {
      let errorInfo = "";
      if(!baseInfoStatus.avatar) errorInfo = "未上传头像";
      if(!baseInfoStatus.username) errorInfo = "未设置用户名";
      if(!baseInfoStatus.mobile) errorInfo = "未绑定手机号";
      throwErr(403, errorInfo);
    } else {
      const TE = require("../nkcModules/throwError");
      TE(403, baseInfoStatus, "userBaseInfo");
    }
  }
};
/*
* 检测用户基本信息的完善状态
* @param {String/Object} uid 用户id/用户对象
* @return {Object} 各种信息的状态
* @author pengxiguaa 2019-8-21
* */
userSchema.statics.getUserBaseInfoStatus = async (uid) => {
  let user;
  const UserModel = mongoose.model("users");
  if(uid instanceof String) {
    user = await UserModel.findById(uid);
  } else {
    user = uid;
  }
  const userPersonal = await mongoose.model("usersPersonal").findOnly({uid: user.uid});
  const result = {
    username: !!user.username,
    // description: !!user.description,
    avatar: await UserModel.uploadedAvatar(user.avatar),
    // banner: await UserModel.uploadedBanner(user.banner),
    mobile: !!(userPersonal.mobile && userPersonal.nationCode),
    // email: !!userPersonal.email,
    // password: !!(userPersonal.password.hash && userPersonal.password.salt)
  };
  result.status = result.username && result.avatar && result.mobile;
  return result
};

/*
* 获取用户能修改post的最大时间
* @param {String/Object} uid 用户ID或用户对象
* @return {Number} 最大时间（-1为不限制）
* @author pengxiguaa 2019-6-10
* */
userSchema.statics.getModifyPostTimeLimit = async (uid) => {
  if(!uid) return 0;
  let user;
  if(uid instanceof String) {
    user = await mongoose.model("users").findById(uid);
  } else {
    user = uid;
  }
  if(!user.roles) await user.extendRoles();
  if(!user.grade) await user.extendGrade();
  let modifyPostTimeLimit = 0;
  for(const role of user.roles) {
    if(role.modifyPostTimeLimit === -1) {
      return -1;
    } else if(role.modifyPostTimeLimit > modifyPostTimeLimit) {
      modifyPostTimeLimit = role.modifyPostTimeLimit;
    }
  }
  return modifyPostTimeLimit;
};

/*
* 判断用户发表的文章或回复是否需要审核
* @param {String} uid 用户ID
* @param {String} type 内容类型 post: 回复，thread: 文章
* @return {Boolean} 是否需要审核
* @author pengxiguaa 2019-5-31
* */
userSchema.statics.contentNeedReview = async (uid, type) => {
  if(!["post", "thread"].includes(type)) throwErr(500, `未知的审核类型: ${type}`);
  const UserModel = mongoose.model("users");
  const ThreadModel = mongoose.model("threads");
  const PostModel = mongoose.model("posts");
  const UsersPersonalModel = mongoose.model("usersPersonal");
  const SettingModel = mongoose.model("settings");

  const user = await UserModel.findOne({uid});
  if(!user) throwErr(500, "在判断内容是否需要审核的时候，发现未知的uid");
  const reviewSettings = (await SettingModel.findById("review")).c;
  const review = reviewSettings[type];

  // 一、特殊限制
  const {whitelistUid, blacklistUid} = review.special;
  // 1. 白名单
  if(whitelistUid.includes(uid)) {
    return false
  }
  // 2. 黑名单
  if(blacklistUid.includes(uid)) {
    return true
  }

  // 二、白名单（用户证书和用户等级）
  const {gradesId, certsId} = review.whitelist;
  await user.extendGrade();
  if(gradesId.includes(user.grade._id)) {
    return false
  }
  await user.extendRoles();
  for(const role of user.roles) {
    if(certsId.includes(role._id)) {
      return false
    }
  }

  // 三、黑名单（海外手机号、未通过A卷和用户等级）
  let passedCount = 0;
  if(type === "post") {
    passedCount = await PostModel.count({
      disabled: false,
      reviewed: true,
      uid
    });
  } else {
    passedCount = await ThreadModel.count({
      disabled: false,
      reviewed: true,
      mainForumsId: {$ne: "recycle"},
      uid
    });
  }
  const {grades, notPassedA, foreign} = review.blacklist;
  const userPersonal = await UsersPersonalModel.findOnly({uid});

  // 开启了海外手机号用户发表需审核
  // 用户绑定了海外手机号
  // 用户通过审核的数量小于设置的数量
  // 满足的用户所发表的文章 需要审核
  if(foreign.status && userPersonal.nationCode !== "86") {
    if(foreign.type === "all" || foreign.count > passedCount) return true;
  }

  // 开启了未通过A卷考试的用户发表需审核
  // 用户没有通过A卷考试
  // 用户通过审核的数量小于设置的数量
  // 满足以上的用户所发表的文章 需要审核
  if(notPassedA.status && !user.volumeA) {
    if(notPassedA.type === "all" || notPassedA.count > passedCount) return true
  }

  let grade;
  for(const g of grades) {
    if(g.gradeId === user.grade._id) {
      grade = g;
    }
  }
  if(!grade) throwErr(500, "系统无法确定您账号的等级信息，请点击页脚下的报告问题，告知网站管理员。");
  if(grade.status) {
    // 目前调取的地方都在发表相应内容之后，所以用户已发表内容的数量需要-1
    if(grade.type === "all" || grade.count > passedCount - 1) return true
  }
  return false
};

/**
 * 发表限制检测
 * @param {Object} user 用户Id
 */
userSchema.statics.publishingCheck = async (user) => {
  const SettingModel = mongoose.model("settings");
  const ThreadModel = mongoose.model("threads");
  const postSettings = await SettingModel.findOnly({_id: 'post'});
  const {authLevelMin, exam} = postSettings.c.postToForum;
  const {volumeA, volumeB, notPass} = exam;
  const {status, countLimit, unlimited} = notPass;
  const apiFunction = require('../nkcModules/apiFunction');
  const today = apiFunction.today();
  const todayThreadCount = await ThreadModel.count({toc: {$gt: today}, uid: user.uid});
  if(authLevelMin > user.authLevel) throwErr(403, `身份认证等级未达要求，发表文章至少需要完成身份认证 ${authLevelMin}`);
  // ab卷考试是否开启或通过
  if((!volumeB || !user.authLevel) && (!volumeA || !user.volumeA)) {
    if(!status) throwErr(403, "权限不足，请提升账号等级");
    if(!unlimited && countLimit <= todayThreadCount) throwErr(403, `今日发表文章次数已用完，请明天再试。`)
  }
  // 发表回复时间、条数限制检查
  const {postToForumCountLimit, postToForumTimeLimit} = await user.getPostLimit();
  if(todayThreadCount >= postToForumCountLimit) throwErr(400, `您当前的账号等级每天最多只能发表${postToForumCountLimit}篇文章，请明天再试。`);
  const latestThread = await ThreadModel.findOne({uid: user.uid, toc: {$gt: (Date.now() - postToForumTimeLimit * 60 * 1000)}});
  if(latestThread) throwErr(400, `您当前的账号等级限定发表文章间隔时间不能小于${postToForumTimeLimit}分钟，请稍后再试。`);
};

/*
* 验证用户是否有权限开设专栏
* @param {String/Object} uid 用户ID/用户对象
* @return {Boolean} 是否有权限
* @author pengxiguaa 2019-6-26
* */
userSchema.statics.ensureApplyColumnPermission = async (uid) => {
  let user;
  if(typeof uid === "string") {
    user = await mongoose.model("users").findOne({uid});
  } else {
    user = uid;
  }
  if(!user) return false;
  const columnSettings = await mongoose.model("settings").getSettings("column");
  const {xsfCount, digestCount, userGrade, threadCount} = columnSettings;
  if(user.xsf < xsfCount) return false;
  if(!user.grade) await user.extendGrade();
  if(!userGrade.includes(user.grade._id)) return false;
  const userThreadCount = await mongoose.model("threads").count({
    uid: user.uid,
    disabled: false,
    recycleMark: {$ne: true},
    reviewed: true
  });
  if(userThreadCount < threadCount) return false;
  const count = await mongoose.model("threads").count({uid: user.uid, digest: true, disabled: false, recycleMark: {$ne: true}, reviewed: true});
  return count >= digestCount;
};
/*
* 验证用户是否有权限发表匿名内容
* @param {String} uid 用户ID
* @param {String} type thread: 发表文章, post: 发表回复
* @param {[String]} forumsId 专业ID组成的数组, 若不传该参数则默认全部专业都允许发表匿名内容
* @return {Boolean} 是否有权
* @author pengxiguaa 2019-8-8
* */
userSchema.statics.havePermissionToSendAnonymousPost = async (type, userId, forumsId) => {
  if(!["postToForum", "postToThread"].includes(type)) return false;
  const UserModel = mongoose.model("users");
  const SettingModel = mongoose.model("settings");
  const ForumModel = mongoose.model("forums");
  const postSettings = await SettingModel.getSettings("post");
  const {uid, status, defaultCertGradesId, rolesId} = postSettings[type].anonymous;
  if(!status) return false;
  if(forumsId) {
    const forumCount = await ForumModel.count({fid: {$in: forumsId}, allowedAnonymousPost: true});
    if(forumCount === 0) return false;
  }
  const user = await UserModel.findOne({uid: userId});
  if(!user) return false;
  if(uid.includes(userId)) return true;
  for(const certId of user.certs) {
    if(certId !== "default" && rolesId.includes(certId)) {
      return true;
    }
  }
  if(rolesId.includes("default")) {
    await user.extendGrade();
    return defaultCertGradesId.includes(user.grade._id);
  } else {
    return false;
  }
};

/*
* 获取用户的专栏
* @param {String} uid 用户ID
* @return {Object} 专栏对象
* */
userSchema.statics.getUserColumn = async (uid) => {
  return await mongoose.model("columns").findOne({uid, closed: false});
};

/*
* 检查用户名
* @param {String} username 待检测用户名
* @return {Boolean} 是否复核规范
* @author pengxiguaa 2019-8-16
* */
userSchema.statics.checkUsername = async (username = "") => {
  const {contentLength} = require("../tools/checkString");
  const length = contentLength(username);
  if (!length) throwErr(400, "用户名不能为空");
  let reg = /\s/;
  if(reg.test(username)) ctx.throw(400, '用户名不允许有空格');
  if (length > 30) throwErr(400, "用户名不能超过30字节");
  reg = /^(?!_)(?!.*?_$)[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!reg.test(username))
    throwErr(400, "用户名只能由汉字、英文、阿拉伯数字和下划线组成，且不能以下划线开始");
};
/*
* 判断用户是否有足够的科创币修改用户名
* @param {String} uid 用户ID
* @return {Number} 花费的科创币
* @author pengxiguaa 2019-8-21
* */
userSchema.statics.checkModifyUsername = async (uid) => {
  const user = await mongoose.model("users").findOnly({uid});
  user.kcb = await mongoose.model("users").updateUserKcb(uid);
  const usersGeneral = await mongoose.model("usersGeneral").findOnly({uid});
  const usernameSettings = await mongoose.model("settings").getSettings("username");
  if(usernameSettings.free) return 0;
  const reduce = usersGeneral.modifyUsernameCount + 1 - usernameSettings.freeCount;
  if(reduce <= 0) return 0;
  let kcb;
  if(reduce*usernameSettings.onceKcb < usernameSettings.maxKcb) {
    kcb = reduce*usernameSettings.onceKcb;
  } else {
    kcb = usernameSettings.maxKcb;
  }
  if(user.kcb < kcb)
    throwErr(400, "科创币不足");
  return kcb;
};
module.exports = mongoose.model('users', userSchema);
