// miniprogram/pages/RecordPage/RecordPage.js
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
var refreshtime

Page({

  /**
   * 页面的初始数据
   */
  data: {
    record : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var now = new  Date()
    var storagedata = wx.getStorageSync('recordPage')
    if (storagedata && 
      (now.getTime() - storagedata.getTime <= 600000)) 
    {
      this.setData({
          record : storagedata.record
        })
    }
    else{
      wx.showLoading({
        title: '数据查询中...',
      })
      refreshtime = new Date()
      this._onquerydatabase()
    }
    console.log(this.data.record)
  },

  _onquerydatabase(){
    // 首先要获取近三天的日期
    var d = new Date()
    var time = d.getTime()
    var daystring1 = this.getDateStringFromTime(time)
    var daystring2 = this.getDateStringFromTime(time + 86400000)
    var daystring3 = this.getDateStringFromTime(time + 86400000 + 86400000)
    // 数据库查询
    wx.cloud.callFunction({
      name : 'queryDB',
      data : {
        databasename : 'appointment',
        option : 'date',
        day1 : daystring1,
        day2 : daystring2,
        day3 : daystring3
      },
      success : res => {
        console.log(res.result)
        this.setData({
          record : this._unpack(res.result.data)
        })
        wx.setStorageSync('recordPage', 
        {
          getTime : (new Date()).getTime(),
          record : this.data.record
        })
        wx.showToast({
          title: '数据查询成功',
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
      complete : res =>{
        wx.hideNavigationBarLoading({
          success: (res) => {},
        })
        wx.stopPullDownRefresh({
          success: (res) => {},
        })
      }
    })
  },

  // 查询数据的拆分
  _unpack(querydata){
    var record = []
    for(var i = 0; i < querydata.length; i++){
      var t = {}
      t['name'] = querydata[i]['usageName']
      t['millisecond'] = this._getMillisecondTime(querydata[i]['day'], querydata[i]['index'])
      t['time'] = querydata[i]['day'] + ' ' + zone[querydata[i]['index']]
      t['id'] = querydata[i]['_id']
      record.push(t)
    }
    record.sort((a,b) => a.millisecond - b.millisecond)
    return record
  },

  _getMillisecondTime(recordDay, recordIndex){
    var minute = recordIndex % 2 == 0 ? 0 : 30
    var hour = (recordIndex - (recordIndex % 2)) / 2 + 8
    var year = recordDay.substring(0, 4)
    var month = recordDay.substring(recordDay.indexOf('-') + 1, recordDay.indexOf('-', 5))
    var day = recordDay.substring(recordDay.indexOf('-', 5) + 1, recordDay.length)
    // console.log(year + month + day + hour + minute)
    var date = new Date(year, month -  1, day, hour, minute)
    // console.log(date, date.getTime())
    return date.getTime()
  },

  // 合并连续的预约时间段
  _mergeIndex(queryData){

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
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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
    var now = new Date()
    if (!refreshtime || (now.getTime() - refreshtime.getTime() >= 20000)){
      refreshtime = now
      wx.showNavigationBarLoading({
        success: (res) => {},
      })
      this._onquerydatabase()
    }
    else{
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
      wx.showToast({
        title: '刷新过于频繁',
        icon : 'none'
      })
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

  }
})