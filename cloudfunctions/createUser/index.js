exports.main = async (event, context) => {
  const { nickname, avatar } = event
  
  try {
    const db = uniCloud.database()
    
    const userData = {
      nickname: nickname || '用户',
      avatar: avatar || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const result = await db.collection('users').add(userData)
    
    await db.collection('profiles').add({
      userId: result.id,
      age: null,
      education: '',
      interests: [],
      goals: '',
      createdAt: new Date().toISOString()
    })
    
    return {
      code: 200,
      data: {
        userId: result.id,
        ...userData
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '创建用户失败',
      error: error.message
    }
  }
}