exports.main = async (event, context) => {
  const { userId, date } = event
  
  if (!userId) {
    return {
      code: 400,
      message: '用户ID不能为空'
    }
  }
  
  const queryDate = date || new Date().toISOString().split('T')[0]
  
  try {
    const db = uniCloud.database()
    const tasks = await db.collection('daily_tasks')
      .where({ userId, date: queryDate })
      .orderBy('time', 'asc')
      .get()
    
    return {
      code: 200,
      data: tasks.data
    }
  } catch (error) {
    return {
      code: 500,
      message: '获取任务失败',
      error: error.message
    }
  }
}