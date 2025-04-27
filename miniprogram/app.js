App({
  globalData: {
    userInfo: null,
    // 可以在这里添加其他全局数据
  },
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-3gd4jgszb2f4813b',
      traceUser: true,
    });
    const loginInfo = wx.getStorageSync('loginInfo');
    if (loginInfo) {
      wx.switchTab({
        url: '/pages/habit/habit'
      });
    }
  },
})