App({
  globalData: {
    userInfo: null,
    // 可以在这里添加其他全局数据
  },
  onLaunch() {
    this.checkAndResetHabits(),
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
  // 检查并重置习惯状态
  checkAndResetHabits() {
    const lastResetDate = wx.getStorageSync('lastResetDate');
    const today = new Date().toDateString();
    
    // 如果今天已经重置过，则不再执行
    if (lastResetDate === today) return;

    // 重置所有习惯的打卡状态
    this.resetAllHabitsStatus(() => {
      wx.setStorageSync('lastResetDate', today);
    });
  },

  // 重置所有习惯状态
  resetAllHabitsStatus(callback) {
    const db = wx.cloud.database();
    db.collection('habits').where({
      completed: 1
    }).get({
      success: res => {
        if (res.data.length === 0) {
          callback && callback();
          return;
        }

        const batchUpdates = res.data.map(habit => {
          return db.collection('habits').doc(habit._id).update({
            data: {
              completed: 0,
              updatedAt: db.serverDate()
            }
          });
        });

        Promise.all(batchUpdates)
          .then(() => {
            console.log('所有习惯打卡状态已重置');
            callback && callback();
          })
          .catch(err => {
            console.error('重置习惯状态失败:', err);
            callback && callback();
          });
      },
      fail: err => {
        console.error('获取习惯列表失败:', err);
        callback && callback();
      }
    });
  }
})