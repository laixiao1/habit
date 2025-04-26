Page({
  data: {
      loading: true,
      error: null,
      habit: null,
      showEditModal: false,
      selectingIcon: false,
      editForm: {
          name: '',
          icon: '',
          type: 1,
          status: '每日'
      },
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
      completedMap: {
          1: '已完成',
          0: '未完成'
      },
      iconsMap: [
          { id: "1", path: '/image/宇宙/碎石流星.png' },
          { id: "2", path: '/image/ico/Bell.png' },
          { id: "3", path: '/image/ico/Cross.png' },
          { id: "4", path: '/image/ico/Candle.png' },
          { id: "5", path: '/image/ico/Dove.png' }
      ],
      statusOptions: [
          { value: '每日', name: '每日打卡' },
          { value: '每周', name: '每周打卡' },
          { value: '每月', name: '每月打卡' }
      ],
      currentIconIndex: 0,
      currentTypeIndex: 0,
      currentStatusIndex: 0
  },

  onLoad(options) {
      if (!options.id) {
          this.showError('缺少习惯ID');
          return;
      }

      const habitId = Number(options.id);
      if (isNaN(habitId)) {
          this.showError('ID格式错误');
          return;
      }

      this.loadHabitDetail(habitId);
  },

  onShow() {
      if (this.data.habit && this.data.habit._id) {
          this.loadHabitDetail(this.data.habit._id);
      }
  },

  loadHabitDetail(habitId) {
      this.setData({ loading: true, error: null });
      wx.showLoading({ title: '加载中...', mask: true });

      const db = wx.cloud.database();
      db.collection('habits').doc(habitId).get({
          success: res => {
              wx.hideLoading();
              if (!res.data) {
                  this.showError('习惯不存在');
                  return;
              }

              const habit = res.data;
              const iconPath = this.data.iconsMap.find(icon => icon.id === habit.icon)?.path
                  || '/image/ico/default.png';

              // 设置当前选择的索引
              const currentIconIndex = this.data.iconsMap.findIndex(icon => icon.id === habit.icon);
              const currentTypeIndex = Object.keys(this.data.typeMap).findIndex(key => key == habit.type);
              const currentStatusIndex = this.data.statusOptions.findIndex(item => item.value === habit.status);

              this.setData({
                  habit: {
                      ...habit,
                      iconPath,
                      typeName: this.data.typeMap[habit.type] || '未知类型',
                      frequencyDesc: this.data.frequencyMap[habit.status] || habit.status,
                      createdAt: this.formatDate(habit.createdAt),
                      lastCompletedDate: habit.lastCompletedDate
                          ? this.formatDate(habit.lastCompletedDate)
                          : '从未打卡'
                  },
                  'editForm.name': habit.name,
                  'editForm.icon': habit.icon,
                  'editForm.type': habit.type,
                  'editForm.status': habit.status,
                  currentIconIndex: Math.max(currentIconIndex, 0),
                  currentTypeIndex: Math.max(currentTypeIndex, 0),
                  currentStatusIndex: Math.max(currentStatusIndex, 0)
              });
          },
          fail: err => {
              wx.hideLoading();
              console.error('加载失败:', err);
              this.showError(this.getErrorMessage(err));
          },
          complete: () => {
              this.setData({ loading: false });
          }
      });
  },

  // 编辑相关方法
  onEdit() {
      this.setData({ showEditModal: true });
  },

  onEditIcon() {
      this.setData({ selectingIcon: true });
  },

  onCancelEdit() {
      this.setData({ showEditModal: false });
  },

  onCancelEditIcon() {
      this.setData({ selectingIcon: false });
  },

  onSelectIcon(e) {
      const index = e.currentTarget.dataset.index;
      this.setData({
          currentIconIndex: index,
          'editForm.icon': this.data.iconsMap[index].id
      });
  },

  onConfirmEditIcon() {
      this.setData({ selectingIcon: false });
  },

  onNameInput(e) {
      this.setData({
          'editForm.name': e.detail.value
      });
  },

  onTypeChange(e) {
    const index = e.detail.value;
    const typeKeys = Object.keys(this.data.typeMap);
    const selectedType = typeKeys[index];
    
    this.setData({
      currentTypeIndex: index,
      'editForm.type': Number(selectedType)
    });
  },

  onStatusChange(e) {
      const index = e.detail.value;
      const selectedStatus = this.data.statusOptions[index].value;
      this.setData({
          currentStatusIndex: index,
          'editForm.status': selectedStatus
      });
  },

  onConfirmEdit() {
      if (!this.data.editForm.name.trim()) {
          wx.showToast({ title: '请输入习惯名称', icon: 'none' });
          return;
      }

      this.setData({ loading: true });
      wx.showLoading({ title: '保存中...', mask: true });

      const db = wx.cloud.database();
      db.collection('habits').doc(this.data.habit._id).update({
          data: {
              name: this.data.editForm.name,
              icon: this.data.editForm.icon,
              type: this.data.editForm.type,
              status: this.data.editForm.status,
              updatedAt: db.serverDate()
          },
          success: () => {
              wx.hideLoading();
              wx.showToast({ title: '更新成功', icon: 'success' });
              this.loadHabitDetail(this.data.habit._id);
              this.setData({ showEditModal: false });
          },
          fail: err => {
              wx.hideLoading();
              console.error('更新失败:', err);
              wx.showToast({
                  title: '更新失败: ' + this.getErrorMessage(err),
                  icon: 'none'
              });
          }
      });
  },

  // 打卡功能
  onComplete() {
      if (this.data.habit.completed) {
          wx.showToast({ title: '今日已完成打卡', icon: 'none' });
          return;
      }

      wx.showLoading({ title: '打卡中...', mask: true });

      const db = wx.cloud.database();
      const now = new Date();
      db.collection('habits').doc(this.data.habit._id).update({
          data: {
              completed: true,
              lastCompletedDate: db.serverDate(),
              totalCompletions: db.command.inc(1)
          },
          success: () => {
              wx.hideLoading();
              wx.showToast({ title: '打卡成功', icon: 'success' });
              this.loadHabitDetail(this.data.habit._id);
          },
          fail: err => {
              wx.hideLoading();
              console.error('打卡失败:', err);
              wx.showToast({
                  title: '打卡失败: ' + this.getErrorMessage(err),
                  icon: 'none'
              });
          }
      });
  },

  // 删除功能
  onDelete() {
      wx.showModal({
          title: '确认删除',
          content: '确定要删除这个习惯吗？',
          confirmColor: '#ff4d4f',
          success: res => {
              if (res.confirm) {
                  wx.showLoading({ title: '删除中...', mask: true });
                  const db = wx.cloud.database();
                  db.collection('habits').doc(this.data.habit._id).remove({
                      success: () => {
                          wx.hideLoading();
                          wx.showToast({ title: '删除成功', icon: 'success' });
                          wx.navigateBack({ delta: 1 });
                      },
                      fail: err => {
                          wx.hideLoading();
                          console.error('删除失败:', err);
                          wx.showToast({
                              title: '删除失败: ' + this.getErrorMessage(err),
                              icon: 'none'
                          });
                      }
                  });
              }
          }
      });
  },

  // 错误显示方法
  showError(message) {
      this.setData({ error: message, loading: false });
  },

  // 获取错误信息
  getErrorMessage(err) {
      if (err.errMsg) {
          return err.errMsg.split(':')[1].trim();
      }
      return '未知错误';
  },

  // 日期格式化方法
  formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }
})