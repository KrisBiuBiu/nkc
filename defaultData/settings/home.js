module.exports = {
  _id: 'home',
  c: {
    ads: [],
    logos: [],
    logo: "",
    smallLogo: "",
    noticeThreadsId: [],
    list: {
      topic: true,
      discipline: true
    },
    // 游客默认显示 推荐、最新
    visitorThreadList: "recommend",
    // 人们文章 条件
    hotThreads: {
      postCount: 50,
      postUserCount: 20
    },
    recommend: {
      featuredThreads: true, // 精选文章
      hotThreads: true, // 热门文章
      voteUpTotal: 20, // 总点赞数
      voteUpMax: 10, // 最高点赞数
      encourageTotal: 10 // 总鼓励数
    }
  }
};