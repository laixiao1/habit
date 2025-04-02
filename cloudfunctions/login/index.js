// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk');
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV});

exports.main = async (event, context) => {
  const { code } = event;

  try {
    // 调用微信接口换取 openId 和 sessionKey
    const result = await cloud.auth.getOpenId({ code });

    return {
      success: true,
      openId: result.openid
    };
  } catch (e) {
    console.error(e);
    return {
      success: false,
      error: e.message
    };
  }
};