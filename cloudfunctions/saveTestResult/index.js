exports.main = async (event, context) => {
  const { userId, testType, result } = event
  
  if (!userId || !testType) {
    return {
      code: 400,
      message: '用户ID和测评类型不能为空'
    }
  }
  
  try {
    const db = uniCloud.database()
    
    const testResult = {
      userId,
      testType,
      result: JSON.stringify(result),
      createdAt: new Date().toISOString()
    }
    
    const resultData = await db.collection('test_results').add(testResult)
    
    return {
      code: 200,
      data: {
        id: resultData.id,
        ...testResult
      }
    }
  } catch (error) {
    return {
      code: 500,
      message: '保存测评结果失败',
      error: error.message
    }
  }
}