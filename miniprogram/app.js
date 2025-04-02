App({
  globalData: {
    userInfo: null,
    // 可以在这里添加其他全局数据
  },
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-3gd4jgszb2f4813b',
      traceUser: true
    })
    
    // 检查云初始化状态
    wx.cloud.callFunction({
      name: 'test', // 创建一个简单的测试云函数
      success: () => console.log('云开发初始化成功'),
      fail: err => console.error('云开发初始化失败:', err)
    })
  }
})