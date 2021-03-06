const mongoose = require("../settings/database");
const Schema = mongoose.Schema;
const schema = new Schema({
  _id: Number,
  columnId: {
    type: String,
    required: true,
    index: 1
  },
  hidden: {
    type: Boolean,
    default: false
  },
  l: {
    type: String,
    default: "html"
  },
  t: {
    type: String,
    default: ""
  },
  c: {
    type: String,
    required: true
  },
  toc: {
    type: Date,
    default: Date.now,
    index: 1
  },
  tlm: {
    type: Date,
    default: null
  }
}, {
  collection: "columnPages"
});

/*
* 更新搜索数据库中的数据
* */
schema.statics.toSearch = async (pageId) => {
  const page = await mongoose.model("columnPages").findOne({_id: pageId});
  if(!page) throwErr(404, `未找到ID为${pageId}的专栏自定义页`);
  const data = {
    tid: page._id,
    t: page.t,
    c: page.c,
    toc: page.toc
  };
  const es = require("../nkcModules/elasticSearch");
  await es.save("columnPage", data);
};
module.exports = mongoose.model("columnPages", schema);