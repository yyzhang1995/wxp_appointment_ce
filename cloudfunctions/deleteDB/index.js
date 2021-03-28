const cloud = require('wx-server-sdk')

cloud.init({
  env : cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({
  throwOnNotFound : false,
})

const _ = db.command

exports.main = async(event, option) => {
  // event.id要给出预约和时间段的id号
  var totalid = event.id.split('_')
  var appointmentid = totalid[0]
  var timeid = totalid[1]
  // 删除appointment中的记录
  try{
    const transactionres = await db.runTransaction(async transaction => {
      const countersres = await transaction.collection('counters').doc(timeid).update({
        data : {
          num : _.inc(-1)
        }
      })
      const counterdata = await transaction.collection("counters").doc(timeid).get()
      if (counterdata.data.num < 0) transaction.rollback(-100)
      const appointmentres = await transaction.collection('appointment').doc(appointmentid).remove()
    })
    return {
      success : true
    }
  } catch(e){
    console.log('transaction error in cancel appointment', e)
    return {
      success : false, 
      error : e
    }
  }
  // const deleteappointmentres = await db.collection("appointment").where({
  //   _id : appointmentid,
  //   openid : event.openid
  // }).remove();
  // 接下来采用事件增加counters集合中的计数
}