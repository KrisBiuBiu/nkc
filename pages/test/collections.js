let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/rescue', {useMongoClient: true});
mongoose.Promise = global.Promise;
let Schema = mongoose.Schema;

db = require('arangojs')();
db.useDatabase('rescue');

let collectionsSchema = new Schema({
  toc: {
    type: Number,
    default: Date.now,
    index: 1
  },
  tid: {
    type: String,
    required: true,
    index: 1
  },
  uid: {
    type: String,
    required: true,
    index: 1
  },
  category: {
    type: String,
    default: ''
  }
});

let Collection = mongoose.model('collections', collectionsSchema);

let t1 = Date.now();
console.log('开始读取数据');

db.query(`
for a in collections
return a
`)
.then(curtor => curtor.all())
.then((res) => {
  console.log('数据读取完成，开始写入数据');
  let n = 0;
  let toMongo = () => {
    let data = res[n];
    let collection = new Collection({
      toc: data.toc,
      tid: data.tid,
      uid: data.uid,
      category: data.category
    });
    collection.save()
    .then(() => {
      n++;
      if(n >= res.length) {
        let t2 = Date.now();
        console.log(`${res.length}条数据写入完成，耗时：${t2-t1}ms`);
        return;
      }else{
        toMongo();
        return;
      }
    })
    .catch((err) => {
      console.log(`存数据出错:${err}`)
    });
  }
  toMongo();
})
.catch((err) => {
  console.log(`出错:${err}`);
})