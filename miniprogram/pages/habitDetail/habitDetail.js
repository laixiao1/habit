Page({
  data: {
    habit: null,
    typeMap: {
      1: '健康',
      2: '学习',
      3: '工作',
      4: '生活'
    },
    frequencyMap: {
      '每日': '每天执行',
      '每周': '每周执行',
      '每月': '每月执行'
    },
    iconsMap: [
      { id: "1", path: '/image/宇宙/碎石流星.png' },
      { id: "2", path: '/image/ico/Bell.png' },
      { id: "3", path: '/image/ico/Cross.png' },
      { id: "4", path: '/image/ico/Candle.png' },
      { id: "5", path: '/image/ico/Dove.png' }
    ]
  },

  onLoad(options) {
    if (!options.id) {
      wx.showToast({ title: '缺少习惯ID', icon: 'none' });
      return wx.navigateBack();
    }
    // 将字符串ID转为数字（因为数据库_id是数字类型）
    const habitId = Number(options.id);
    if (isNaN(habitId)) {
      wx.showToast({ title: 'ID格式错误', icon: 'none' });
      return wx.navigateBack();
    }
    this.loadHabitDetail(habitId);
  },

  loadHabitDetail(habitId) {
    wx.showLoading({ title: '加载中...' });
    
    const db = wx.cloud.database();
    db.collection('habits').doc(habitId).get({
      success: res => {
        wx.hideLoading();
        const habit = res.data;
        if (!habit) {
          this.showError('习惯不存在');
          return;
        }
        
        // 处理图标路径（注意habit.icon是字符串类型）
        const iconPath = this.data.iconsMap.find(icon => icon.id === habit.icon)?.path 
                        || '/image/ico/default.png';
        
        this.setData({
          habit: {
            ...habit,
            iconPath,
            typeName: this.data.typeMap[habit.type] || '未知类型',
            frequencyDesc: this.data.frequencyMap[habit.status] || habit.status,
            createdAt: this.formatDate(habit.createdAt),
            lastCompletedDate: habit.lastCompletedDate 
                              ? this.formatDate(habit.lastCompletedDate)
                              : '从未打卡',
            // 添加数字ID显示（可选）
            id: habit._id 
          }
        });
      },
      fail: err => {
        wx.hideLoading();
        console.error('加载失败:', err);
        this.showError(this.getErrorMessage(err));
      }
    });
  },

  // 错误信息处理（增强版）
  getErrorMessage(err) {
    if (err.errMsg.includes('cannot find document')) {
      return '习惯不存在或ID错误';
    } else if (err.errMsg.includes('permission')) {
      return '无权限查看该习惯';
    }
    return '加载失败，请重试';
  },

  // 兼容多种日期格式
  formatDate(date) {
    if (!date) return '无记录';
    try {
      const d = date instanceof Date ? date : new Date(date);
      return isNaN(d.getTime()) ? '无效日期' : 
             `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日`;
    } catch (e) {
      return '日期格式异常';
    }
  },

  showError(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2500
    });
    setTimeout(() => wx.navigateBack(), 2500);
  },

  goBack() {
    wx.navigateBack();
  }
});