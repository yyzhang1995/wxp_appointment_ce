const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async(event, option) => {
  const db = cloud.database()
  /*
   * 提交时间
   * 主题
   * 内容
   * 用户openid
   */
  return await db.collection('opinions').add({
    data : event.opiniondata
  })
}