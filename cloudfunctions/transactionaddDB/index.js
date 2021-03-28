const cloud = require("wx-server-sdk")

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database({
  throwOnNotFound: false,
})

const _ = db.command

exports.main = async(event) => {
  var countersid = event.countersid
  var addData = event.addData
  // console.log(countersid, addData)
  try {
    const result = await db.runTransaction(async transaction => {
      // 向数据库逐一进行请求
      for (var i = 0; i < countersid.length; i++){
        const updateres = await transaction.collection('counters').doc(countersid[i]).update({
          data : {
          num : _.inc(1)
          }
        })
        const res = await transaction.collection("counters").doc(countersid[i]).get()
        console.log('updateres : ', updateres, 'res : ', res)
        // 如果超过了则回滚
        if (res.data.num > 2) await transaction.rollback(-100)
      }
      const addres = await transaction.collection("appointment").add({
        data : addData
      })
      console.log("addres : ", addres)
      return {addres : addres}
    })
    return { success : true}
  } catch(e){
    console.log('transction error', e)
    return {
      success : false,
      error : e
    }
  }
}