const app = getApp();

Page({
  data: {
    habitName: '',
    typeIndex: 0,
    frequencyIndex: 0,
    selectedIcon: 1, // 默认选中第一个图标
    types: [
      { id: 1, name: '健康' },
      { id: 2, name: '学习' },
      { id: 3, name: '工作' },
      { id: 4, name: '生活' }
    ],
    frequencies: [
      { id: 1, name: '每日' },
      { id: 2, name: '每周' },
      { id: 3, name: '每月' }
    ],
    icons: [
      { id: 1, path: '/image/宇宙/碎石流星.png' },
      { id: 2, path: '/image/ico/Bell.png' },
      { id: 3, path: '/image/ico/Cross.png' },
      { id: 4, path: '/image/ico/Candle.png' },
      { id: 5, path: '/image/ico/Dove.png' }
    ],
    remindTime: null // 新增提醒时间字段
  },

  onNameInput(e) {
    this.setData({
      habitName: e.detail.value
    });
  },

  onTypeChange(e) {
    this.setData({
      typeIndex: e.detail.value
    });
  },

  onFrequencyChange(e) {
    this.setData({
      frequencyIndex: e.detail.value
    });
  },

  onIconSelect(e) {
    this.setData({
      selectedIcon: parseInt(e.currentTarget.dataset.id)
    });
  },

  onRemindTimeChange(e) {
    this.setData({
      remindTime: e.detail.value
    });
  },

  submitHabit() {
    const { habitName, typeIndex, frequencyIndex, selectedIcon, types, frequencies, remindTime } = this.data;
  
    // 验证输入
    if (!habitName.trim()) {
      wx.showToast({ title: '请输入习惯名称', icon: 'none' });
      return;
    }
  
    // 准备完整数据（严格匹配数据库字段）
    const habitData = {
      name: habitName,
      type: types[typeIndex].id,        // 数字类型，对应数据库的 type:1
      icon: selectedIcon.toString(),    // 字符串类型，对应数据库的 icon:"2"
      streak: 0,                       // 数字，初始连续天数为0
      completedDays: 0,                 // 数字，初始完成天数为0
      completed: 0,                     // 数字，0表示未打卡（数据库中是1/0）
      duration: `打卡时间 ${frequencies[frequencyIndex].name}`, // 字符串
      status: frequencies[frequencyIndex].name, // 字符串，如"每周"
      lastCompletedDate: null,          // 初始为null
      createdAt: new Date(),             // 手动添加创建时间（或由云函数自动生成）
      remindTime: remindTime            // 新增提醒时间
    };
  
    wx.showLoading({ title: '提交中...' });
  
    wx.cloud.callFunction({
      name: 'addHabit',
      data: habitData,
      success: res => {
        wx.hideLoading();
        if (res.result.success) {
          wx.showToast({ title: '添加成功', icon: 'success' });
          // 返回并刷新前一页
          const pages = getCurrentPages();
          if (pages.length > 1) {
            const prevPage = pages[pages.length - 2];
            prevPage.onLoad && prevPage.onLoad(); // 触发重新加载
          }
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          throw new Error(res.result.error || '添加失败');
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('添加失败:', err);
        wx.showToast({ 
          title: '添加失败: ' + (err.errMsg || '未知错误'), 
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});