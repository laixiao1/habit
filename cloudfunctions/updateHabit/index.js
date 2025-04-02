const cloud = require('wx-server-sdk');
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV});

exports.main = async (event, context) => {
  const db = cloud.database();
  try {
    await db.collection('habits').doc(event._id).update({
      data: {
        completed: event.completed,
        streak: event.streak
      }
    });
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: e.message };
  }
};