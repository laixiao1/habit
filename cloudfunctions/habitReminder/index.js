// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  const now = new Date();
  const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

  // 获取所有用户的设置
  const users = await db.collection('users').get();
  for (const user of users.data) {
    const { openid, messageNotification } = user;
    if (!messageNotification) {
      continue; // 如果消息通知开关关闭，跳过该用户
    }

    // 获取该用户需要提醒的习惯
    const habits = await db.collection('habits').where({
      _openid: openid,
      remindTime: currentTime
    }).get();

    for (const habit of habits.data) {
      // 发送消息提醒
      try {
        await cloud.openapi.subscribeMessage.send({
          touser: openid,
          page: 'pages/habit/habit',
          data: {
            thing1: {
              value: habit.name
            },
            time2: {
              value: habit.remindTime
            }
          },
          templateId: 'al1k8f3BOFR48ZQrgP6wAff0jPkW_TJkmEt0-QTLl98' // 替换为你的消息模板 ID
        });
      } catch (error) {
        console.error('发送消息提醒失败', error);
      }
    }
  }
  return {
    success: true
  };
}