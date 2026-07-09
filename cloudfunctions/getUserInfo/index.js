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
    const user = await db.collection('users').doc(userId).get()
    
    if (user.data.length === 0) {
      return {
        code: 404,
        message: '用户不存在'
      }
    }
    
    const profile = await db.collection('profiles').where({ userId }).get()
    
    return {
      code: 200,
      data: {
        user: user.data[0],
        profile: profile.data[0] || null
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '获取用户信息失败',
      error: error.message
    }
  }
}