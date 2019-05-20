const func = {};

func.UserModel = {};
func.PostModel = {};

const esConfig = require("../config/elasticSearch");
const ES = require("elasticsearch");

const {address, port, analyzer, searchAnalyzer, indexName} = esConfig;
const client = new ES.Client({
  node: address + ":" + port
});

func.client = client;

func.init = async () => {
  let indexExist = await client.indices.exists({
    index: indexName
  });
  if(!indexExist) {
    await client.indices.create({
      index: indexName,
      body: {
        mappings: {
          documents: {
            properties: {
              docType: { // 文档类型：thread，user，post
                type: "keyword"
              },
              uid: {
                type: "keyword"
              },
              username: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              description: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              pid: {
                type: "keyword"
              },
              toc: {
                type: "date"
              },
              title: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              abstractCN: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              abstractEN: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              content: {
                type: "text",
                analyzer: analyzer,
                search_analyzer: searchAnalyzer
              },
              mainForumsId: {
                type: "keyword"
              },
              digest: {
                type: "boolean"
              },
              tid: {
                type: "keyword"
              },
              keywordsCN: {
                type: "keyword"
              },
              keywordsEN: {
                type: "keyword"
              },
              authors: {
                type: "keyword"
              },
              voteUp: {
                type: "long"
              },
              voteDown: {
                type: "long"
              }
            }
          }
        }
      }
    });
  }
};


/*
* 更新数据，若数据不存在则创建
* @param {String} docType 文档类型：user, post, thread
* @param {Object} document 数据
* @author pengxiguaa 2019-5-17
* */
func.save = async (docType, document) => {
  const apiFunction = require("../nkcModules/apiFunction");

  if(!["user", "post", "thread"].includes(docType)) throwErr(500, "docType error");

  const {

    pid = "", toc = new Date(), tid = "", uid = "",
    mainForumsId = [],
    t = "", c = "",
    digest = false,
    abstractEn = "", abstractCn = "", keyWordsEn = [], keyWordsCn = [],
    authorInfos = [],
    voteUp = 0, voteDown = 0,
    description = "",
    username = ""

  } = document;

  // 唯一ID，存在测更新body，不存在则新建数据。
  let id;

  if(docType === "thread") {
    id = `thread_${tid}`;
  } else if(docType === "post") {
    id = `post_${pid}`;
  } else {
    id = `user_${uid}`;
  }

  return await client.index({
    index: indexName,
    type: "documents",
    id,
    body: {
      docType,
      toc,
      pid,
      description,
      username,
      uid,
      tid,
      digest,
      mainForumsId,
      title: t,
      content: apiFunction.obtainPureText(c),
      abstractCN: abstractCn,
      abstractEN: abstractEn,
      keywordsCN: keyWordsCn,
      keywordsEN: keyWordsEn,
      authors: authorInfos.map(a => a.name),
      voteUp,
      voteDown
    }
  });
};

// 搜索
func.search = async (t, c, options) => {
  const SettingModel = require("../dataModels/SettingModel");
  const UserModel = require("../dataModels/UserModel");
  let {
    page=0, sortType,
    timeStart, timeEnd,
    fid, relation, sort,
    author, digest
  } = options;

  // 若只有一个关键词则默认or
  relation = (relation==="or" || c.split(" ").length < 2)?"or":"and";

  let uid;

  if(author) {
    const user = await UserModel.findOne({usernameLowerCase: (author || "").toLowerCase()});
    if(user) uid = user.uid;
  }

  if(timeStart) {
    const {year, month, day} = timeStart;
    timeStart = new Date(`${year}-${month}-${day} 00:00:00`);
  }
  if(timeEnd) {
    const {year, month, day} = timeEnd;
    timeEnd = new Date(`${year}-${month}-${day} 23:59:59`);
  }

  page = Number(page);

  const {
    searchThreadList, searchPostList, searchAllList, searchUserList
  } = (await SettingModel.findById("page")).c;

  let size;
  if(t === "user") {
    size = searchUserList;
  } else if(t === "post") {
    size = searchPostList;
  } else if(t === "thread") {
    size = searchThreadList;
  } else {
    size = searchAllList;
  }
  const body = {
    from: page*searchThreadList,
    size,
    min_score: 10,
    sort: [],
    highlight: {
      pre_tags: ['<span style="color: #e85a71;">'],
      post_tags: ['</span>'],
      fields: {
        title: {},
        content: {},
        username: {},
        description: {}
      }
    },
    query: {
      bool: {
        must: [
          {
            bool: {
              should: [
                // 搜索post, thread
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          should: [
                            {
                              match: {
                                title: {
                                  query: c,
                                  operator: relation,
                                  boost: 2,
                                }
                              }
                            },
                            {
                              match: {
                                content: {
                                  query: c,
                                  operator: relation,
                                  boost: 2,
                                }
                              }
                            }
                          ]
                        }
                      }
                    ]
                  }
                },
                // 搜索用户
                {
                  bool: {
                    should: [
                      {
                        match: {
                          username: {
                            query: c,
                            operator: relation,
                            boost: 5
                          }
                        }
                      },
                      {
                        match: {
                          description: {
                            query: c,
                            operator: relation,
                            boost: 2,
                          }
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  };

  if(t === "post") {
    body.query.bool.must.push({
      match: {
        docType: "post"
      }
    });
  } else if(t === "thread") {
    body.query.bool.must.push({
      match: {
        docType: "thread"
      }
    });
  } else if(t === "user") {
    body.query.bool.must.push({
      match: {
        docType: "user"
      }
    });
  }

  if(fid && fid.length > 0) {
    const fidMatch = {
      bool: {
        should: fid.map(id => {
          return {
            match: {
              mainForumsId: id
            }
          }
        })
      }
    };
    body.query.bool.must[0].bool.should[0].bool.must.push(fidMatch);
  }
  if(uid) {
    body.query.bool.must[0].bool.should[0].bool.must.push({
      match: {
        uid
      }
    })
  }

  if(digest) {
    body.query.bool.must[0].bool.should[0].bool.must.push({
      match: {
        digest: true
      }
    })
  }


  // 时间范围
  if(timeStart  || timeEnd) {
    const range = {
      toc: {}
    };
    if(timeEnd) {
      range.toc.lte = timeEnd;
    }
    if(timeStart) {
      range.toc.gte = timeStart;
    }
    body.query.bool.filter = {range};
  }

  // 按时间排序 升序/降序
  if(sortType === "time") {
    const toc = {
      order: "desc"
    };
    if(sort === "asc") {
      toc.order = "asc";
    }
    body.sort.push({toc});
  } else {
    // 按匹配程度排序 升序/降序
    const _score = {
      order: "desc"
    };
    if(sort === "asc") {
      _score.order = "asc";
    }
    body.sort.push({_score});
  }
  return await client.search({
    index: indexName,
    type: "documents",
    body
  });
};

module.exports = func;

(async () => {
  await func.init();
}) ();