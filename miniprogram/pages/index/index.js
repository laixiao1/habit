// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0';

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    isProfileCalled: false // 新增标志位，用于记录是否已经调用过 wx.getUserProfile
  },
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    const { nickName } = this.data.userInfo;
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl!== defaultAvatarUrl,
    });
  },
  onInputChange(e) {
    const nickName = e.detail.value;
    const { avatarUrl } = this.data.userInfo;
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl!== defaultAvatarUrl,
    });
  },
  getUserProfile(e) {
    if (!this.data.isProfileCalled) { // 只有当标志位为 false 时才调用
      wx.getUserProfile({
        desc: '展示用户信息',
        success: (res) => {
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true,
            isProfileCalled: true // 调用成功后设置标志位为 true
          });
        },
        fail: (err) => {
          console.error('获取用户信息失败', err);
        }
      });
    } else {
      wx.showToast({
        title: '已获取过头像信息，不能频繁获取',
        icon: 'none',
        duration: 2000
      });
      console.warn('已调用过 wx.getUserProfile，不能频繁调用');
    }
  },
  userreg: function (e) {
    wx.login({
      success: (res) => {
        if (res.code) {
          // 模拟登录成功，将登录信息存储在缓存中
          wx.setStorageSync('loginInfo', {
            code: res.code,
            userInfo: this.data.userInfo
          });
          wx.switchTab({
            url: '/pages/habit/habit',
          });
        } else {
          console.error('登录失败！' + res.errMsg);
        }
      }
    });
  }
});