// 云函数入口
const cloud = require('wx-server-sdk')

// 初始化
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async(event, context) => {
  console.log(event.addData, event.option)
  const wxContext = cloud.getWXContext()

  const db = cloud.database()
  
  if (event.option == 'add'){
    return await db.collection('appointment').add({
      data : event.addData
    })
  }
}