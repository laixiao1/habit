Page({
  data: {
      timeOptions: [
          { value: 15, label: '15分钟' },
          { value: 25, label: '25分钟' },
          { value: 45, label: '45分钟' },
          { value: 60, label: '60分钟' }
      ],
      currentDuration: { value: 25, label: '25分钟' },
      remainingSeconds: 25 * 60,
      displayTime: '25:00',
      isRunning: false,
      statusText: '准备开始',
      timerInterval: null,
      hasUnfinishedTimer: false,
      musicPlayer: null,
      isMusicPlaying: false
  },

  onLoad() {
      this.setData({
          musicPlayer: wx.createInnerAudioContext()
      });
      const musicPlayer = this.data.musicPlayer;
      musicPlayer.src = '/music/asmr-pink-noise-rain-fire-waterfall-mix-229779.mp3'; 
      musicPlayer.loop = true; 
      musicPlayer.onError((res) => {
          console.error('音乐播放出错:', res.errMsg);
      });
  },

  changeDuration(e) {
      const selected = this.data.timeOptions[e.detail.value];
      this.setData({
          currentDuration: selected,
          remainingSeconds: selected.value * 60,
          displayTime: this.formatTime(selected.value * 60)
      });
      this.resetTimer();
  },

  startTimer() {
      if (this.data.isRunning) return;
      this.setData({
          isRunning: true,
          statusText: '专注中...',
          hasUnfinishedTimer: true
      });
      wx.vibrateShort();
      this.data.timerInterval = setInterval(() => {
          let seconds = this.data.remainingSeconds - 1;
          if (seconds <= 0) {
              this.timerComplete();
              return;
          }
          this.setData({
              remainingSeconds: seconds,
              displayTime: this.formatTime(seconds)
          });
      }, 1000);
  },

  pauseTimer() {
      if (!this.data.isRunning) return;
      clearInterval(this.data.timerInterval);
      this.setData({
          isRunning: false,
          statusText: '已暂停'
      });
  },

  resetTimer() {
      clearInterval(this.data.timerInterval);
      this.setData({
          isRunning: false,
          remainingSeconds: this.data.currentDuration.value * 60,
          displayTime: this.formatTime(this.data.currentDuration.value * 60),
          statusText: '已复位',
          hasUnfinishedTimer: false
      });
  },

  timerComplete() {
      clearInterval(this.data.timerInterval);
      this.setData({
          isRunning: false,
          statusText: '已完成!',
          hasUnfinishedTimer: false
      });
      wx.playBackgroundAudio({
          dataUrl: 'https://example.com/complete.mp3'
      });
      wx.vibrateLong();
  },

  formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  },

  // 页面卸载逻辑
  onUnload() {
    // 如果有未完成的计时
    if (this.data.hasUnfinishedTimer) {
      // 阻止页面直接卸载
      this.showExitConfirm();
      return;
    }
    
    // 正常卸载逻辑
    this.cleanUpResources();
  },

  // 返回键拦截
  onBackPress() {
    // 如果有未完成的计时
    if (this.data.hasUnfinishedTimer) {
      this.showExitConfirm();
      return true; // 阻止默认返回行为
    }
    
    // 没有计时任务时，直接清理资源
    this.cleanUpResources();
    return false;
  },

  // 显示退出确认对话框
  showExitConfirm() {
    wx.showModal({
      title: '提示',
      content: '专注时间未结束，确定要退出吗？',
      success: (res) => {
        if (res.confirm) {
          // 用户确认退出
          this.cleanUpResources();
          
          // 如果是返回键触发的，需要手动执行返回
          if (this.isFromBackPress) {
            wx.navigateBack();
          }
        } else {
          // 用户取消退出，重新加载页面
          this.reloadPage();
        }
      }
    });
  },

  // 清理资源（计时器和音乐）
  cleanUpResources() {
    // 停止计时器
    clearInterval(this.data.timerInterval);
    
    // 停止音乐
    const musicPlayer = this.data.musicPlayer;
    if (musicPlayer && this.data.isMusicPlaying) {
      musicPlayer.pause();
    }
  },

  // 重新加载页面
  reloadPage() {
    const pages = getCurrentPages();
    const currentRoute = pages[pages.length - 1].route;
    wx.redirectTo({
      url: '/' + currentRoute
    });
  },

  // 音乐切换方法
  toggleMusic() {
    const musicPlayer = this.data.musicPlayer;
    if (this.data.isMusicPlaying) {
      musicPlayer.pause();
      this.setData({ isMusicPlaying: false });
    } else {
      musicPlayer.play();
      this.setData({ isMusicPlaying: true });
    }
  },

});    