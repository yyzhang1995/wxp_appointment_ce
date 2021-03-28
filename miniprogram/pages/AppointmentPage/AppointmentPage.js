// miniprogram/pages/AppointmentPage/AppointmentPage.js
const app = getApp()
const zone = ['0:00-8:00', '8:00-8:30', '8:30-9:00',
              '9:00-9:30', '9:30-10:00','10:00-10:30', '10:30-11:00',
              '11:00-11:30', '11:30-12:00','12:00-12:30', '12:30-13:00',
              '13:00-13:30', '13:30-14:00','14:00-14:30', '14:30-15:00',
              '15:00-15:30', '15:30-16:00','16:00-16:30', '16:30-17:00',
              '17:00-17:30', '16:30-18:00','18:00-18:30', '18:30-19:00',
              '19:00-19:30', '19:30-20:00','20:00-20:30', '20:30-21:00',
              '21:00-21:30', '21:30-22:00','22:00-22:30', '22:30-23:00',
              '23:00-23:30', '23:30-24:00']
const clicked = 'border:2rpx solid white;color:white;background-color:#2ca9e1'
const unclicked = 'border:1rpx solid gray;'
// details保存了三个日期每个时段的预约信息，用于更新this.data.zone
var details = {}
var today, currentHour, currentMinute, refreshtime // refreshtime记录刷新时间

/*
Appointment 页面逻辑设计
加载 ---> 自动选择第一个日期 ---> 选择时间段 ---> 提交 ---> 成功/失败 ---> 选择进入管理页面
                  |                                          |
                  |             页面已过期  <---       选择留在当前页面 ---> 页面尚未过期
                  |                                                            |
              下拉刷新  ---> 日期尚未过期 ---> 保持日期在当前日期，刷新时间段信息 <-|
                  |
                  |
                  |
              日期已经过期 ---> 自动选择第一个日期
*/

Page({

  /**
   * 页面的初始数据
   */
  data: {
    day1 : '',
    day2 : '',
    day3 : '',
    chosenDay : '',
    chosenTime : {},
    type1 : unclicked,
    type2 : unclicked,
    type3 : unclicked,
    zone : [],
    name : ''
  },

  // 选择预约日期
  onChooseDay(e){
    console.log(e.currentTarget.id)
    if (this.data.chosenDay == e.currentTarget.id) return
    if (this.data.chosenDay){
      this.switchButtonType(this.data.chosenDay, unclicked)
    }
    this.setData({
      chosenDay : e.currentTarget.id,
      zone : details[e.currentTarget.id]
    })
    this.switchButtonType(e.currentTarget.id, clicked)
  },

  // 设置按钮样式
  switchButtonType(id, type){
    switch(id){
      case this.data.day1: 
        this.setData({type1 : type})
        break;
      case this.data.day2: 
        this.setData({type2 : type})
        break
      case this.data.day3: this.setData({type3 : type});
    }
  },

  // 选择时间
  onChooseTime(e){
    var id = e.currentTarget.id
    var zoneid = e.currentTarget.id.split('_')[0]
    console.log(zoneid)
    // var countersid = inf[1]
    // 检查所选择的日期之前是否有被选中过
    if (!this.data.chosenTime[this.data.chosenDay])
      this.data.chosenTime[this.data.chosenDay] = []
    // 如果之前已经选中了该时间，应该取消
    if (this.data.chosenTime[this.data.chosenDay].indexOf(id) >= 0){
      var index = this.data.chosenTime[this.data.chosenDay].indexOf(id)
      this.data.chosenTime[this.data.chosenDay].splice(index, 1)
      var indexInZone = zone.indexOf(zoneid)
      this.data.zone[indexInZone].type = unclicked
    }
    //如果之前没有选中，则添加
    else{
      this.data.chosenTime[this.data.chosenDay].push(id)
      var indexInZone = zone.indexOf(zoneid)
      this.data.zone[indexInZone].type = clicked
    }
    this.setData({
      zone : this.data.zone
    })
    console.log('this.data.chosenTime', this.data.chosenTime)
  },

  // 获取用户输入的姓名
  getInputValue(e){
    // console.log(e.detail.value)
    this.data.name = e.detail.value
  },

  // 提交预约信息
  submit(e){
    wx.showLoading({
      title: '提交ing',
      mask : true
    })
    this._onsubmitdataquery()
  },

  _onsubmitdataquery(){
    // 如果没有选择时间，或者没有写姓名，则不允许提交
    if (Object.keys(this.data.chosenTime).length == 0){
      wx.showToast({
        title: '请选择预约时间段',
        icon : 'none',
        duration : 1000
      })
      return
    }

    if (!this.data.name){
      wx.showToast({
        title : '请填写使用人',
        icon : 'none',
        duration : 1000
      })
      return
    }
    // 对选中的数据进行批量添加
    // 首先构建批量添加信息的列表：
    var addData = [], countersid = []
    var day1Data = this.generateDataFromChosenTime(
      this.data.day1, 
      this.data.chosenTime[this.data.day1]
    )
    var day2Data = this.generateDataFromChosenTime(
      this.data.day2, 
      this.data.chosenTime[this.data.day2]
    )
    var day3Data = this.generateDataFromChosenTime(
      this.data.day3, 
      this.data.chosenTime[this.data.day3]
    )
    addData = addData.concat(day1Data.appointmentdata, day2Data.appointmentdata, day3Data.appointmentdata)
    countersid = countersid.concat(day1Data.countersid, day2Data.countersid, day3Data.countersid)
    console.log(addData, countersid)

    wx.cloud.callFunction({
      name : 'transactionaddDB',
      data : {
        countersid : countersid,
        addData : addData
      },
      success : res =>{
        console.log(res)
        if (res.result && res.result.success){
          console.log("[数据库] [添加] 成功")
          // 如果managePage记录了缓存信息，需要更新
          if (wx.getStorageSync('managePage')){
            wx.clearStorageSync('managePage')
          }
          if(wx.getStorageSync('recordPage')){
            wx.clearStorageSync('recordPage')
          }
          wx.hideLoading({
            success: (res) => {},
          })
          wx.showModal({
            title : '提交成功',
            content : '是否查看预约情况（点击取消可继续预约）？',
            showCancel : true,
            cancelText : '继续预约',
            confirmText : '查看预约',
            success : res => {
              if (res.confirm){
                wx.navigateTo({
                  url: '../ManagePage/ManagePage',
                })
              }
              else {
                // 如果继续留在当前页面，需要刷新页面信息
                refreshtime = new Date()
                this._onquerydatabaseloading()
              }
            } 
          })
        }
        else {
          wx.hideToast({
            success: (res) => {},
          })
          // 如果是由于被他人预约导致的
          if (res.result && res.result.error == -100){
            wx.showModal({
              title : '预约失败',
              content : '部分时间段已被约满',
              confirmText : '重新预约',
              cancelText : '管理预约',
              success : res =>{
                if (res.confirm){
                  // 如果确认要重新预约，则刷新页面
                  refreshtime = new Date()
                  this._onquerydatabaseloading()
                } else {
                  wx.navigateTo({
                    url: '../ManagePage/ManagePage',
                  })
                }
              }
            })
          } 
          else {
            wx.showToast({
              title: '请求失败，请稍后再试',
              icon : 'none',
              duration : 1000
            })
          }
        }
      },
      fail: res =>{
        wx.showToast({
          title: '提交错误，请稍后尝试',
          icon : 'none'
        })
        console.log(res)
      }
    })
  },

  // 更新页面信息
  _renewpageaftersubmit(day){
    if (!this.data.chosenTime[day]) return
    for (var i = 0; i < this.data.chosenTime[day].length; i++){
      var index = zone.indexOf(this.data.chosenTime[day][i].split('_')[0])
      details[day][index].num -= 1
      details[day][index].type = unclicked
      details[day][index].disabled = details[day][index].num == 0
    }
  },

  generateDataFromChosenTime(day, chosenTime){
    // console.log(chosenTime)
    if (!chosenTime) return {
      countersid : [],
      appointmentdata : []
    }
    var appointmentData = [], countersid = []
    for (var i = 0; i < chosenTime.length; i++){
      var s = chosenTime[i].split('_')
      countersid.push(s[1])
      appointmentData.push({
        // 将使用Openid来识别用户
        openid : app.globalData.openID,
        usageName : this.data.name,
        day : day,
        index : zone.indexOf(s[0]),
        timeid : s[1]
      })
    }
    return {
      countersid : countersid,
      appointmentdata : appointmentData
    }
  },

  // 获取今天的日期
  getDateStringFromTime(time){
    var date = new Date(time)
    var year = date.getFullYear()
    var month = date.getUTCMonth() + 1
    var day = date.getDate()
    // console.log(year + '年' + month + '月' + day + '日', date.getTime())
    return year + '-' + month + '-' + day
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  _onquerydatabaseloading(){
    // 加载日期
    var d = new Date()
    var time = d.getTime()
    var daystring1 = this.getDateStringFromTime(time)
    var daystring2 = this.getDateStringFromTime(time + 86400000)
    var daystring3 = this.getDateStringFromTime(time + 86400000 + 86400000)
    today = daystring1
    currentHour = d.getHours()
    currentMinute = d.getMinutes()
    // console.log(currentHour, currentMinute)
    this.setData({
      day1 : daystring1,
      day2 : daystring2,
      day3 : daystring3
    })
    
    // 加载时间
    // 整体查询数据库
    var querydata = []
    wx.cloud.callFunction({
      name : 'queryDB',
      data : {
        databasename : 'counters', 
        option : 'date',
        day1 : daystring1,
        day2 : daystring2,
        day3 : daystring3
      },
      success : res =>{
        console.log("[数据库] [加载] 成功")
        querydata = res.result.data
        console.log(querydata)
        querydata.sort((a, b) => a.index - b.index)
        details[this.data.day1] = this.unpack(querydata, this.data.day1)
        details[this.data.day2] = this.unpack(querydata, this.data.day2)
        details[this.data.day3] = this.unpack(querydata, this.data.day3)
        // console.log(details)
        // 这里还需要解决和下拉刷新设置的重复问题
        this._refreshPage(details)
        wx.showToast({
          title: '加载成功',
          icon : 'success',
          duration : 500
        })
      },
      fail : res => {
        refreshtime = new Date(0)
        wx.showToast({
          title: '加载失败，请下拉刷新',
          icon : 'none',
          duration : 1000
        })
      },
      complete : res => {
        wx.stopPullDownRefresh({
          success: (res) => {},
        })
        wx.hideNavigationBarLoading({
          success: (res) => {},
        })
      }
    })
  },

  // 分解从数据库提取的预约信息
  unpack(querydata, day){
    var detail = [], num = new Array(zone.length), counterid = []
    // 初始化计数器
    for(var i = 0; i < zone.length; i++){
      num[i] = 0;
    }
    // 统计每个时间段已经预约过的次数
    for(var i = 0; i < querydata.length; i++){
      if (querydata[i]['day']==day){
        num[querydata[i]['index']] = querydata[i]['num'];
        counterid.push(querydata[i]['_id'])
      }
    }
    for(var i = 0; i < zone.length; i++){
      var t = {
        interval : zone[i], 
        id : zone[i] + '_' + counterid[i],
        disabled : 2 - num[i] > 0 ? false : true, 
        type : unclicked,
        num : 2 - num[i]
      }
      // 判断是否需要因为时间因素而设为不可选状态
      if (day == today){
        console.log(day, today)
        // 映射逻辑，考虑结束时刻的小时数 0 -> 8, 1 -> 8 .., 
        var endi = (currentHour - 8) * 2
        if (currentMinute >= 30) endi++
        if (i <= endi)
          t['disabled'] = true
      }
      detail.push(t)
    }
    return detail
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if(true){
      wx.showLoading({
        title: '数据加载中...',
        mask : true
      })
      // 如果发现当前页面仍然留有痕迹则需要清除
      if (this.data.chosenTime){
        this.setData({
          chosenDay : '',
          chosenTime : {},
          type1 : unclicked,
          type2 : unclicked,
          type3 : unclicked,
          zone : [],
        })
      }
      // 从数据库请求数据
      refreshtime = new Date()
      this._onquerydatabaseloading()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // 最短刷新时间间隔20s
    if ((new Date()).getTime() - refreshtime.getTime() <= 20000){
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
      wx.showToast({
        title: '刷新过于频繁',
        icon : 'none'
      })
    }
    else {
      refreshtime = new Date()
      wx.showNavigationBarLoading()
      this._onquerydatabaseloading()
    }
  },

  resetPage(){
    this.setData({
      type1 : unclicked,
      type2 : unclicked,
      type3 : unclicked,
      zone : [],
      chosenTime : {}
    })
  },

  // 刷新页面函数
  /*
  @param
    details : 从服务器拿到的每时段的预约信息
  逻辑：重置页面，判断当前选择的页面是否有效（未设置或已过期认定为无效），有效保持，无效则选择第一个日期
  */
  _refreshPage(details){
    this.setData({chosenTime : {}})
    switch (this.data.chosenDay){
      case this.data.day1:
        this.setData({type1 : clicked, zone : details[this.data.day1]})
        break
      case this.data.day2:
        this.setData({type2 : clicked, zone : details[this.data.day2]})
        break
      case this.data.day3:
        this.setData({type3 : clicked, zone : details[this.data.day3]})
        break;
      default:
        this.setData({
          chosenDay : this.data.day1, 
          zone : details[this.data.day1],
          type1 : clicked, 
          chosenTime : {}})
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  // 选择
  ontouch(e){
    // console.log(e)
  },

  // 拖动
  movetouch(e){
    // console.log(e)
  },

  // 松手
  endtouch(e){
    // console.log(e)
  }
})