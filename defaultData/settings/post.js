module.exports = {
  _id: 'post',
  c: {
    postToForum: {
      authLevelMin: 0,
      exam: {
        volumeA: true,
        volumeB: true,
        notPass: {
          status: true,
          countLimit: 5,
          unlimited: true
        }
      },
      anonymous: {
        status: false,
        defaultCertGradesId: [],
        rolesId: [],
        uid: []
      }
    },
    postToThread: {
      authLevelMin: 0,
      exam: {
        volumeA: true,
        volumeB: true,
        notPass: {
          status: true,
          unlimited: true,
          countLimit: 5
        }
      },
      anonymous: {
        status: false,
        defaultCertGradesId: [],
        rolesId: [],
        uid: []
      }
    }
  }
};