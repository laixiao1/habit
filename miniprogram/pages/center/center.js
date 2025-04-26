// pages/center/center.js
Page({
  data: {
      userInfo: null,
      canGetUserInfo: true,
      isDarkTheme: false,
  },
  onLoad(options) {
    // 从缓存中获取登录信息
    const loginInfo = wx.getStorageSync('loginInfo')
    if (loginInfo) {
      this.setData({
        userInfo: loginInfo.userInfo
      })
    };
  },
  // 检查授权状态
  checkAuthStatus() {
      wx.getSetting({
          success: (res) => {
              if (res.authSetting['scope.userInfo']) {
                  this.getUserInfo();
              } else {
                  this.setData({ canGetUserInfo: true });
              }
          }
      });
  },
  // 获取用户信息
  getUserInfo() {
      wx.getUserInfo({
          success: (res) => {
              this.setData({
                  userInfo: res.userInfo,
                  canGetUserInfo: false
              });
          }
      });
  },
  getUserProfile() {
      wx.getUserProfile({
          desc: '用于完善会员资料',
          success: (res) => {
              this.setData({
                  userInfo: res.userInfo,
                  canGetUserInfo: false
              });
              wx.setStorageSync('userInfo', res.userInfo);
          }
      });
  },
  // 分享小程序给朋友
  shareMiniProgram() {
      setTimeout(() => {
          wx.showShareMenu({
              withShareTicket: true,
              menus: ['shareAppMessage', 'shareTimeline'],
              success: () => {
                  console.log('分享菜单显示成功');
              },
              fail: (err) => {
                  console.error('显示分享菜单失败:', err);
                  if (err.errMsg.includes('not in page')) {
                      console.error('分享功能不能在非页面的情况下调用，请确保在页面内调用');
                  }
                  wx.showToast({
                      title: '分享功能暂不可用',
                      icon: 'none'
                  });
              },
              complete: () => {
                  console.log('分享菜单操作完成');
              }
          });
      }, 200); // 延迟 200 毫秒
  },
  // 必须实现的分享配置
  onShareAppMessage() {
      return {
          title: '推荐「小习惯」- 你的习惯养成助手',
          path: '/pages/center/center', // 分享后打开的页面路径
          imageUrl: '/images/share-logo.png', // 分享卡片图片(建议尺寸5:4)
          success: (res) => {
              wx.showToast({
                  title: '分享成功',
                  icon: 'success'
              });
          },
          fail: (err) => {
              console.error('分享失败:', err);
          }
      };
  },
  // 朋友圈分享（可选）
  onShareTimeline() {
      return {
          title: '我正在用「小习惯」培养好习惯，你也来试试吧！',
          query: 'from=timeline',
          imageUrl: '/images/share-timeline.png'
      };
  },
  // 跳转到番茄钟页面
  goToTomato() {
      wx.navigateTo({
          url: '/pages/tomato/tomato'
      });
  },
  // 跳转到设置页面
  goToSetting() {
      wx.navigateTo({
          url: '/pages/setting/setting'
      });
  },
  // 跳转到关于页面
  goToAbout() {
      wx.navigateTo({
          url: '/pages/about/about'
      });
  },
  logout: function () {
    wx.removeStorageSync('loginInfo');
    wx.redirectTo({
      url: '/pages/index/index'
    });
  },
  toggleTheme: function (e) {
    const isDark = e.detail.value;
    this.setData({
      isDarkTheme: isDark
    });
    wx.setStorageSync('isDarkTheme', isDark);
    console.log('wx object:', wx); // 打印 wx 对象来检查是否正常
    // 通知 app.js 更新全局样式
    const app = getApp(); // 直接使用 getApp() 方法
    app.updateTheme(isDark);
  }
})