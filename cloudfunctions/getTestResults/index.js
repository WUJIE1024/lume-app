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
    const results = await db.collection('test_results')
      .where({ userId })
      .orderBy('createdAt', 'desc')
      .get()
    
    return {
      code: 200,
      data: results.data.map(item => ({
        ...item,
        result: JSON.parse(item.result)
      }))
    }
  } catch (error) {
    return {
      code: 500,
      message: '获取测评结果失败',
      error: error.message
    }
  }
}