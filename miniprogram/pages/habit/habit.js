var util = require('../../utils/util');
Page({
  data: {
    // 类型映射表
    typeMap: {
      1: '健康',
      2: '学习',
      3: '工作',
      4: '生活'
    },
    iconsMap: [
      { id: 1, path: '/image/宇宙/碎石流星.png' },
      { id: 2, path: '/image/ico/Bell.png' },
      { id: 3, path: '/image/ico/Cross.png' },
      { id: 4, path: '/image/ico/Candle.png' },
      { id: 5, path: '/image/ico/Dove.png' }
    ],
    date: '2025年1月11日 星期六',
    completed: 0, // 初始化为0，将从数据库计算
    total: 0, // 初始化为0，将从数据库计算
    habits: [], // 初始化为空数组，将从数据库加载
    weatherInfo: null,
    imageList: [
      '/image/motovational/1.jpg',
      '/image/motovational/2.jpg',
      '/image/motovational/3.jpg',
      '/image/motovational/4.jpg',
      '/image/motovational/5.jpg'
    ],
    randomImage: '',
    location: '',
    showAddHabitModal: false,
    myTime: ''
  },

  onLoad(options) {
    // 获取当前时间
    setInterval(() => {
      var DATE = util.formatTime(new Date());
      this.setData({
        myTime: DATE
      })
    }, 1000);
    
    this.chooseRandomImage();
    this.fetchWeatherData();
    this.getUserLocation();
    
    // 加载数据库中的习惯数据
    this.loadHabitsFromDB();
  },

  // 修改 loadHabitsFromDB 方法，添加图标路径
  loadHabitsFromDB() {
    const db = wx.cloud.database();
    db.collection('habits').get({
      success: res => {
        const habits = res.data.map(habit => {
          // 添加图标路径
          const iconPath = this.data.iconsMap.find(icon => icon.id == habit.icon)?.path || '/image/ico/default.png';
          return {
            ...habit,
            iconPath: iconPath
          };
        });
        
        const completed = habits.filter(habit => habit.completed).length;
        
        this.setData({
          habits: habits,
          completed: completed,
          total: habits.length
        });
      },
      fail: err => {
        console.error('获取习惯数据失败', err);
        wx.showToast({
          title: '加载习惯失败',
          icon: 'none'
        });
      }
    });
  },

  // 获取城市坐标
  getUserLocation: function() {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude;
        const longitude = res.longitude;
        that.setData({
          location: `${longitude},${latitude}`
        }, () => {
          that.fetchWeatherData();
        });
      },
      fail(err) {
        if (err.errMsg === "getLocation:fail auth deny") {
          wx.showModal({
            title: '提示',
            content: '需要您的位置权限来获取当前城市天气，请在设置中打开位置权限。',
            success(res) {
              if (res.confirm) {
                console.log('用户点击确定');
                wx.openSetting({
                  success(settingData) {
                    console.log(settingData.authSetting);
                  }
                });
              } else if (res.cancel) {
                console.log('用户点击取消');
              }
            }
          });
        } else {
          console.error('获取地理位置失败', err);
        }
      }
    });
  },

  // 获取天气信息
  fetchWeatherData() {
    const API_KEY = "14708a51f2df4d9895bf3f71ed4b69f8";
    const { location } = this.data;
    
    if (!location) return;

    wx.request({
      url: `https://devapi.qweather.com/v7/weather/now?location=${location}&key=${API_KEY}`,
      method: 'GET',
      success: res => {
        if (res.statusCode === 200 && res.data.code === '200') {
          this.setData({
            weatherInfo: res.data.now
          });
        } else {
          console.error('获取天气数据失败', res.data);
        }
      },
      fail: err => {
        console.error('请求失败', err);
      }
    });
  },

  // 随机图片选择方法
  chooseRandomImage() {
    const { imageList } = this.data;
    const randomImageIndex = Math.floor(Math.random() * imageList.length);
    console.log('Selected image path:', imageList[randomImageIndex]);
    this.setData({
      randomImage: imageList[randomImageIndex]
    });
  },

  // 点击按钮重新选择
  refreshImage() {
    this.chooseRandomImage();
  },

   // 添加新习惯
   addNewHabit(newHabit) {
    const db = wx.cloud.database();
    db.collection('habits').add({
      data: {
        name: newHabit.name,
        type: Number(newHabit.type),
        icon: Number(newHabit.icon),
        streak: 0,
        completedDays: 0,
        duration: `打卡时间 ${newHabit.frequency}`,
        status: newHabit.frequency,
        createdAt: new Date().toISOString()
      },
      success: res => {
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
        this.loadHabitsFromDB();
        this.setData({ showAddHabitModal: false });
      },
      fail: err => {
        console.error('添加失败:', err);
        wx.showToast({
          title: '添加失败',
          icon: 'none'
        });
      }
    });
  },

  // 更健壮的跳转实现
  navigateToAddHabit() {
    // 先检查页面是否存在
    const pages = getCurrentPages();
    const pageRoute = 'pages/addHabit/addHabit';
    
    wx.navigateTo({
      url: '/pages/addHabit/addHabit',
      success: (res) => {
        console.log('跳转成功', res);
      },
      fail: (err) => {
        console.error('跳转失败', err);
        wx.showToast({
          title: '无法打开添加页面',
          icon: 'none'
        });
        
        // 调试用 - 打印所有已注册页面
        wx.getApp().getRegisteredPages().then(pages => {
          console.log('已注册页面:', pages);
        });
      }
    });
  },

  // 显示删除确认对话框
  showDeleteConfirm(e) {
    const habitId = e.currentTarget.dataset.id;
    this.setData({
      currentDeleteId: habitId,
      showDeleteModal: true
    });
  },

  // 取消删除
  cancelDelete() {
    this.setData({
      currentDeleteId: null,
      showDeleteModal: false
    });
  },

  // 确认删除习惯
  confirmDelete() {
    const habitId = this.data.currentDeleteId;
    if (!habitId) return;
  
    const db = wx.cloud.database();
    // 先检查文档是否存在
    db.collection('habits').doc(habitId).get({
      success: res => {
        if (res.data) {
          // 文档存在，执行删除
          db.collection('habits').doc(habitId).remove({
            success: res => {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              });
              this.loadHabitsFromDB();
            },
            fail: err => {
              console.error('删除失败:', err);
              wx.showToast({
                title: '删除失败: 无权限',
                icon: 'none'
              });
            }
          });
        } else {
          wx.showToast({
            title: '习惯不存在',
            icon: 'none'
          });
        }
      },
      fail: err => {
        console.error('检查文档失败:', err);
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        });
      },
      complete: () => {
        this.setData({
          currentDeleteId: null,
          showDeleteModal: false
        });
      }
    });
  },

   // 查看习惯详情
  navigateToDetail(e) {
    const habitId = e.currentTarget.dataset.id; // 确保这是数字类型的_id
    wx.navigateTo({
      url: `/pages/habitDetail/habitDetail?id=${habitId}`
    });
  },
   // 空函数用于阻止冒泡
   noop() {},
  
   // 阻止事件冒泡
   stopPropagation(e) {
     e.stopPropagation();
   },
   
   // 修改后的toggleCompletion方法
   toggleCompletion(e) {
     const habitId = Number(e.detail.value[0]); // 获取checkbox选中的值
     if (!habitId) return;
     
     const isChecked = e.detail.value.length > 0;
     this.updateHabitStatus(habitId, isChecked);
   },
   
   // 提取出的更新逻辑
   updateHabitStatus(habitId, isChecked) {
     const db = wx.cloud.database();
     const habitRef = db.collection('habits').doc(habitId);
     
     wx.showLoading({ title: '处理中...', mask: true });
     
     habitRef.get({
       success: (res) => {
         if (!res.data) {
           wx.hideLoading();
           return wx.showToast({ title: '习惯不存在', icon: 'none' });
         }
         
         const habit = res.data;
         const updateData = {
           completed: isChecked ? 1 : 0,
           lastCompletedDate: isChecked ? db.serverDate() : habit.lastCompletedDate,
           completedDays: Math.max(0, isChecked ? habit.completedDays + 1 : habit.completedDays - 1),
           streak: this.calculateStreak(habit, isChecked)
         };
         
         habitRef.update({
           data: updateData,
           success: () => {
             wx.hideLoading();
             wx.showToast({
               title: isChecked ? '打卡成功' : '已取消',
               icon: 'success'
             });
             this.loadHabitsFromDB && this.loadHabitsFromDB();
           },
           fail: (err) => {
             wx.hideLoading();
             wx.showToast({
               title: '更新失败',
               icon: 'none'
             });
           }
         });
       },
       fail: (err) => {
         wx.hideLoading();
         wx.showToast({
           title: '查询失败',
           icon: 'none'
         });
       }
     });
   },
   
   // 计算连续打卡天数
   calculateStreak(habit, isChecked) {
     if (!isChecked) return habit.streak;
     
     const now = new Date();
     const today = now.toDateString();
     const lastDate = habit.lastCompletedDate ? 
       new Date(habit.lastCompletedDate).toDateString() : null;
     
     if (!lastDate) return 1;
     
     const yesterday = new Date(now);
     yesterday.setDate(yesterday.getDate() - 1);
     
     if (lastDate === yesterday.toDateString()) {
       return habit.streak + 1;
     } else if (lastDate !== today) {
       return 1;
     }
     return habit.streak;
   }
})