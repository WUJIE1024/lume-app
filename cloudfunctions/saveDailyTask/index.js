exports.main = async (event, context) => {
  const { userId, name, time, date } = event
  
  if (!userId || !name) {
    return {
      code: 400,
      message: '用户ID和任务名称不能为空'
    }
  }
  
  try {
    const db = uniCloud.database()
    
    const task = {
      userId,
      name,
      time: time || '',
      date: date || new Date().toISOString().split('T')[0],
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    const result = await db.collection('daily_tasks').add(task)
    
    return {
      code: 200,
      data: {
        id: result.id,
        ...task
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '保存任务失败',
      error: error.message
    }
  }
}