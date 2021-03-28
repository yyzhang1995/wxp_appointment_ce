const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async(event, option) => {
  console.log(event)
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  if (event.option == 'user'){
    return await db.collection(event.databasename).where({
      openid : event.openid
    }).get({
      success : res =>{
        return res
      } 
    })
  }
  // 如果使用日期进行查找
  const _ = db.command
  if (event.option == 'date'){
    return await db.collection(event.databasename).where(_.or([{
      day : event.day1
    },
    {
      day : event.day2
    },
    {
      day : event.day3
    }]
    )).get({
      success : res =>{
        return res
      } 
    })
  }
  
}