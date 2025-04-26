// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 云函数入口函数
exports.main = async (event, context) => {
  const db = cloud.database()

  // 修改后的数据结构（与前端和数据库严格一致）
  const habitData = {
    _id: Date.now(), 
    name: event.name || '',
    type: Number(event.type) || 1,
    icon: event.icon ? event.icon.toString() : "1", // 改为字符串类型
    streak: 0,
    completedDays: 0,
    completed: 0, // 新增字段，初始化未打卡
    duration: event.duration || '打卡时间 每日',
    status: event.status || '每日',
    lastCompletedDate: null, // 新增字段
    createdAt: db.serverDate(), // 使用服务器时间
    remindTime: event.remindTime || null // 新增提醒时间字段
  }

  try {
    const res = await db.collection('habits').add({
      data: habitData
    })
    
    return {
      success: true,
      data: habitData // 返回完整数据
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}