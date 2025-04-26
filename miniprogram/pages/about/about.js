Page({
  data: {
    version: 'v1.0.0'
  },

  // 跳转到反馈页面
  goToFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    });
  },

  // 跳转到用户协议
  goToAgreement() {
    wx.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent('https://yourdomain.com/agreement')
    });
  },

  // 跳转到隐私政策
  goToPrivacy() {
    wx.navigateTo({
      url: '/pages/webview/webview?url=' + encodeURIComponent('https://yourdomain.com/privacy')
    });
  },

  // 检查新版本
  checkUpdate() {
    const updateManager = wx.getUpdateManager();
    
    updateManager.onCheckForUpdate(function(res) {
      // 请求完新版本信息的回调
      console.log('是否有新版本:', res.hasUpdate);
    });
    
    updateManager.onUpdateReady(function() {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate();
          }
        }
      });
    });
    
    updateManager.onUpdateFailed(function() {
      // 新版本下载失败
      wx.showToast({
        title: '更新失败',
        icon: 'none'
      });
    });
  },

  onLoad() {
    // 页面加载时检查更新
    this.checkUpdate();
  }
});