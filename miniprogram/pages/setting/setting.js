Page({
  data: {
    notificationSwitch: false,
    cacheSize: '0KB',
    isLoading: false,
    messageNotification: false // 消息通知开关状态
  },

  onLoad() {
    // 从缓存加载通知开关状态
    this.loadNotificationSetting();
    // 计算缓存大小
    this.calculateCacheSize();
    const messageNotification = wx.getStorageSync('messageNotification') || false;
    this.setData({
      messageNotification
    });
  },
  onMessageNotificationChange(e) {
    const messageNotification = e.detail.value;
    this.setData({
      messageNotification
    });
    wx.setStorageSync('messageNotification', messageNotification);
  },

  // 数据备份
  backupData() {
    this.setData({ isLoading: true });
    
    wx.showLoading({ title: '备份中...', mask: true });
    
    // 模拟备份操作
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ isLoading: false });
      wx.showToast({
        title: '备份成功',
        icon: 'success',
        duration: 2000
      });
    }, 1500);
  },

  // 清理缓存
  clearCache() {
    wx.showModal({
      title: '提示',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          this.setData({ cacheSize: '0KB' });
          wx.showToast({
            title: '缓存已清除',
            icon: 'success'
          });
        }
      }
    });
  },

  // 计算缓存大小
  calculateCacheSize() {
    const res = wx.getStorageInfoSync();
    const size = (res.currentSize / 1024).toFixed(2);
    this.setData({ cacheSize: size + 'KB' });
  },

  // 关于我们
  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    });
  }
});