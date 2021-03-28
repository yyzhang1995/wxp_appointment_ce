const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const zone = ['0:00-8:00', '8:00-8:30', '8:30-9:00',
              '9:00-9:30', '9:30-10:00','10:00-10:30', '10:30-11:00',
              '11:00-11:30', '11:30-12:00','12:00-12:30', '12:30-13:00',
              '13:00-13:30', '13:30-14:00','14:00-14:30', '14:30-15:00',
              '15:00-15:30', '15:30-16:00','16:00-16:30', '16:30-17:00',
              '17:00-17:30', '16:30-18:00','18:00-18:30', '18:30-19:00',
              '19:00-19:30', '19:30-20:00','20:00-20:30', '20:30-21:00',
              '21:00-21:30', '21:30-22:00','22:00-22:30', '22:30-23:00',
              '23:00-23:30', '23:30-24:00']
// 增加以及删除数据
exports.main = async (event, option) => {
  var date = new Date() // 这里的时区为UTC+0
  var time = date.getTime()  + 86400000 * 3 + 8 * 3600000
  console.log("time", date)
  var newdate = new Date(time)
  var year = newdate.getFullYear()
  var month = newdate.getUTCMonth() + 1
  var day = newdate.getDate()
  var addday = year + '-' + month + '-' + day
  console.log(addday)
  var adddata = []
  for (var i = 0; i < zone.length; i++){
    adddata.push({
      day : addday,
      index : i,
      num : 0
    })
  }
  const result = await db.collection("counters").add({
    data : adddata
  })

  // 删除1年前的数据，如果今天是3月1日，应当尝试删除去年2月29日的数据
  deleteday = (year - 1) + '-' + month + '-' + day
  var deleteresult
  try {
    deleteresult = await db.collection('counters').where({
      day : deleteday
    }).remove()
    if (month == 3 && day == 1){
      deleteday = (year - 1) + '-' + '2-29'
      await db.collection("counters").where({
        day : deleteday
      }).remove()
    }
  } catch(e){
    console.log(e)
  }
  return {
    addresult : result, 
    deleteresult : deleteresult
  }
}