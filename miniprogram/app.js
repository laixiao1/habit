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
    };
    const isDark = wx.getStorageSync('isDarkTheme');
    if (isDark!== undefined) {
      this.updateTheme(isDark);
    }
  },
  updateTheme: function (isDark) {
    const app = getApp();
    if (isDark) {
      app.globalData.themeClass = 'dark-theme';
    } else {
      app.globalData.themeClass = 'light-theme';
    }
    // 重新渲染页面
    wx.showToast({
      title: '主题切换成功',
      icon: 'none'
    });
  },
  globalData: {
    themeClass: 'light-theme'
  },
})