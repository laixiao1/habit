// 云函数 resetHabits
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const db = cloud.database()
  const _ = db.command
  
  try {
    const result = await db.collection('habits')
      .where({
        completed: 1
      })
      .update({
        data: {
          completed: 0,
          updatedAt: db.serverDate()
        }
      })
    
    console.log('重置习惯状态结果:', result)
    return {
      success: true,
      updated: result.stats.updated
    }
  } catch (err) {
    console.error('重置失败:', err)
    return {
      success: false,
      error: err
    }
  }
}