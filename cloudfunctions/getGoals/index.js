exports.main = async (event, context) => {
  const { userId } = event
  
  if (!userId) {
    return {
      code: 400,
      message: '用户ID不能为空'
    }
  }
  
  try {
    const db = uniCloud.database()
    const goals = await db.collection('goals')
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get()
    
    return {
      code: 200,
      data: goals.data
    }
  } catch (error) {
    return {
      code: 500,
      message: '获取目标失败',
      error: error.message
    }
  }
}