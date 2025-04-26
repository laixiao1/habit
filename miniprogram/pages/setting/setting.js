Page({
  data: {
    notificationSwitch: false,
    cacheSize: '0KB',
    isLoading: false
  },

  onLoad() {
    // 从缓存加载通知开关状态
    this.loadNotificationSetting();
    // 计算缓存大小
    this.calculateCacheSize();
  },

  // 加载通知设置
  loadNotificationSetting() {
    const setting = wx.getStorageSync('notificationSetting');
    if (setting !== '') {
      this.setData({ notificationSwitch: setting });
    }
  },

  // 通知开关变化
  onNotificationSwitchChange(e) {
    const value = e.detail.value;
    this.setData({ notificationSwitch: value });
    wx.setStorageSync('notificationSetting', value);
    
    // 根据开关状态执行操作
    if (value) {
      wx.showToast({ title: '通知已开启', icon: 'success' });
      // 添加订阅消息的逻辑
      this.requestSubscribeMessage();
    } else {
      wx.showToast({ title: '通知已关闭', icon: 'none' });
    }
  },

  // 请求订阅消息
  requestSubscribeMessage() {
    // 这里填写你需要的订阅消息模板ID
    const tmplIds = [
      'your_template_id_1',  // 替换为你的实际模板ID
      'your_template_id_2'   // 可以添加多个模板ID
    ];
    
    wx.requestSubscribeMessage({
      tmplIds: tmplIds,
      success: (res) => {
        console.log('订阅成功', res);
        // 可以根据不同的模板ID处理订阅结果
        for (let tmplId of tmplIds) {
          if (res[tmplId] === 'accept') {
            console.log(`用户同意了模板 ${tmplId}`);
            // 这里可以存储用户的订阅状态
          }
        }
      },
      fail: (err) => {
        console.error('订阅失败', err);
        wx.showToast({
          title: '订阅失败',
          icon: 'none'
        });
      }
    });
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