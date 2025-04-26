Page({
  data: {
    habitsList: [],
    colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'],
    chartType: 'completion' // 默认显示完成情况图表
  },

  onLoad() {
    this.loadHabitsData();
  },

  loadHabitsData() {
    wx.showLoading({ title: '加载数据中...' });
    
    const db = wx.cloud.database();
    db.collection('habits').get({
      success: res => {
        wx.hideLoading();
        this.setData({
          habitsList: res.data
        }, () => {
          // 数据设置完成后绘制图表
          this.drawChart();
        });
      },
      fail: err => {
        wx.hideLoading();
        wx.showToast({
          title: '获取数据失败',
          icon: 'none'
        });
        console.error('数据库查询失败:', err);
      }
    });
  },

  drawChart() {
    if (this.data.habitsList.length === 0) {
      console.warn('没有可用的习惯数据');
      return;
    }

    // 添加延迟确保canvas已渲染
    setTimeout(() => {
      if (this.data.chartType === 'completion') {
        this.showCompletionPieChart();
      } else {
        this.showTypeCompletionPieChart();
      }
    }, 300);
  },

  // 绘制完成情况饼图
  showCompletionPieChart() {
    const query = wx.createSelectorQuery();
    query.select('#completedHabitsChart')
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res[0] || !res[0].node) {
          console.error('获取Canvas节点失败');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        
        // 适配高清屏
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        
        // 清空画布
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const habitsList = this.data.habitsList;
        const completedCount = habitsList.filter(item => item.completed).length;
        const uncompletedCount = habitsList.length - completedCount;
        
        if (habitsList.length === 0) {
          this.drawNoDataText(ctx, canvas);
          return;
        }

        const centerX = res[0].width / 2;
        const centerY = res[0].height / 2;
        const radius = Math.min(centerX, centerY) * 0.7;
        const total = completedCount + uncompletedCount;
        let startAngle = 0;

        // 绘制已完成部分
        if (completedCount > 0) {
          const angle = (completedCount / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
          ctx.closePath();
          ctx.fillStyle = this.data.colors[0];
          ctx.fill();
          startAngle += angle;
        }

        // 绘制未完成部分
        if (uncompletedCount > 0) {
          const angle = (uncompletedCount / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
          ctx.closePath();
          ctx.fillStyle = this.data.colors[1];
          ctx.fill();
        }

        // 添加中心文字
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('完成率', centerX, centerY - 10);
        ctx.fillText(`${((completedCount / total) * 100).toFixed(1)}%`, centerX, centerY + 15);

        // 添加图例
        this.drawLegend(ctx, res[0].width, [
          { label: `已完成 (${completedCount})`, color: this.data.colors[0] },
          { label: `未完成 (${uncompletedCount})`, color: this.data.colors[1] }
        ]);
      });
  },

  // 绘制类型分布饼图
  showTypeCompletionPieChart() {
    const query = wx.createSelectorQuery();
    query.select('#completedHabitsChart')
      .fields({ node: true, size: true })
      .exec(res => {
        if (!res[0] || !res[0].node) {
          console.error('获取Canvas节点失败');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const habitsList = this.data.habitsList;
        const completedHabits = habitsList.filter(item => item.completed);
        
        if (completedHabits.length === 0) {
          this.drawNoDataText(ctx, canvas);
          return;
        }

        // 按类型统计
        const typeStats = {};
        completedHabits.forEach(item => {
          typeStats[item.type] = (typeStats[item.type] || 0) + 1;
        });

        const types = Object.keys(typeStats);
        const counts = Object.values(typeStats);
        const total = counts.reduce((sum, count) => sum + count, 0);
        
        const centerX = res[0].width / 2;
        const centerY = res[0].height / 2;
        const radius = Math.min(centerX, centerY) * 0.7;
        let startAngle = 0;

        // 绘制每个类型的扇形
        types.forEach((type, index) => {
          const angle = (counts[index] / total) * 2 * Math.PI;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
          ctx.closePath();
          ctx.fillStyle = this.data.colors[index % this.data.colors.length];
          ctx.fill();
          startAngle += angle;
        });

        // 添加中心文字
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('类型分布', centerX, centerY - 10);
        ctx.fillText(`${completedHabits.length}个习惯`, centerX, centerY + 15);

        // 添加图例
        const legendItems = types.map((type, index) => ({
          label: `${this.getTypeLabel(type)} (${counts[index]})`,
          color: this.data.colors[index % this.data.colors.length]
        }));
        this.drawLegend(ctx, res[0].width, legendItems);
      });
  },

  // 绘制图例通用方法
  drawLegend(ctx, canvasWidth, items) {
    const legendX = canvasWidth - 120;
    const legendY = 30;
    
    items.forEach((item, index) => {
      ctx.fillStyle = item.color;
      ctx.fillRect(legendX, legendY + index * 25, 15, 15);
      ctx.fillStyle = '#333';
      ctx.font = '14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, legendX + 20, legendY + index * 25 + 12);
    });
  },

  // 无数据提示
  drawNoDataText(ctx, canvas) {
    const centerX = canvas.width / 2 / (wx.getSystemInfoSync().pixelRatio || 1);
    const centerY = canvas.height / 2 / (wx.getSystemInfoSync().pixelRatio || 1);
    
    ctx.font = '16px Arial';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('暂无数据', centerX, centerY);
  },

  getTypeLabel(type) {
    const typeMap = {
      1: '健康',
      2: '学习',
      3: '工作',
      4: '生活'
    };
    return typeMap[type] || `类型${type}`;
  },

  // 切换图表类型
  switchChartType() {
    this.setData({
      chartType: this.data.chartType === 'completion' ? 'type' : 'completion'
    }, () => {
      this.drawChart();
    });
  },

  //下载总览图片
  download() {
    wx.showLoading({ title: '生成截图中...' });
    
    // 先滚动到顶部确保完整页面可见
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300,
      success: () => {
        // 添加短暂延迟确保滚动完成
        setTimeout(() => {
          this.captureScreen();
        }, 500);
      },
      fail: (err) => {
        console.error('滚动失败:', err);
        // 即使滚动失败也尝试截图
        this.captureScreen();
      }
    });
  },

  // 核心截图方法
  captureScreen() {
    wx.captureScreen({
      success: (res) => {
        wx.hideLoading();
        this.handleImageResult(res.tempFilePath);
      },
      fail: (err) => {
        console.error('截图失败:', err);
        wx.hideLoading();
        
        // 提供备用方案
        this.showAlternativeOptions();
      }
    });
  },

  // 处理截图结果
  handleImageResult(tempFilePath) {
    wx.showActionSheet({
      itemList: ['保存到相册', '分享图片', '查看截图'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: // 保存
            this.saveToAlbum(tempFilePath);
            break;
          case 1: // 分享
            this.shareImage(tempFilePath);
            break;
          case 2: // 查看
            wx.previewImage({
              urls: [tempFilePath],
              current: tempFilePath
            });
            break;
        }
      }
    });
  },

  // 保存到相册
  saveToAlbum(tempFilePath) {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success: () => {
        wx.showToast({ title: '保存成功', icon: 'success' });
      },
      fail: (err) => {
        console.error('保存失败:', err);
        wx.showToast({ title: '保存失败', icon: 'none' });
        
        // 引导用户授权
        if (err.errMsg.includes('auth deny')) {
          this.showAuthGuide();
        }
      }
    });
  },

  // 分享图片
  shareImage(tempFilePath) {
    wx.shareFileMessage({
      filePath: tempFilePath,
      success: () => {
        console.log('分享成功');
      },
      fail: (err) => {
        console.error('分享失败:', err);
        wx.showToast({ title: '分享失败', icon: 'none' });
      }
    });
  },

  // 显示授权引导
  showAuthGuide() {
    wx.showModal({
      title: '需要相册权限',
      content: '请允许访问相册以保存图片',
      confirmText: '去设置',
      success: (res) => {
        if (res.confirm) {
          wx.openSetting();
        }
      }
    });
  },

  // 备用方案
  showAlternativeOptions() {
    wx.showModal({
      title: '截图失败',
      content: '请尝试手动截图（电源键+音量下键）或使用下方按钮单独保存图表',
      confirmText: '保存图表',
      cancelText: '我知道了',
      success: (res) => {
        if (res.confirm) {
          // 单独保存图表
          this.saveChartOnly();
        }
      }
    });
  },

  // 单独保存图表
  saveChartOnly() {
    const query = wx.createSelectorQuery();
    query.select('#completedHabitsChart').fields({
      node: true,
      size: true
    }).exec(res => {
      if (res[0] && res[0].node) {
        wx.canvasToTempFilePath({
          canvas: res[0].node,
          success: (res) => {
            this.handleImageResult(res.tempFilePath);
          },
          fail: (err) => {
            console.error('保存图表失败:', err);
            wx.showToast({ title: '保存图表失败', icon: 'none' });
          }
        });
      }
    });
  }
});