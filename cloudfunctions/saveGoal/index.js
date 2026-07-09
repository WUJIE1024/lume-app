exports.main = async (event, context) => {
  const { userId, name, desc, deadline } = event
  
  if (!userId || !name) {
    return {
      code: 400,
      message: '用户ID和目标名称不能为空'
    }
  }
  
  try {
    const db = uniCloud.database()
    
    const goal = {
      userId,
      name,
      desc: desc || '',
      deadline: deadline || '',
      progress: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await db.collection('goals').add(goal)
    
    return {
      code: 200,
      data: {
        id: result.id,
        ...goal
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '保存目标失败',
      error: error.message
    }
  }
}