// miniprogram/pages/ManagePage/ManagePage.js
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
    inoverdue : [],
    overdue : []
  },

  // 进入预约界面
  appointment(){
    wx.navigateTo({
      url: '../AppointmentPage/AppointmentPage',
    })
  },

  // 进入查看所有预约界面
  onTotal(){
    wx.navigateTo({
      url: '../RecordPage/RecordPage',
    })
  }, 

  // 取消预约逻辑
  onCancel(e){
    console.log(e)
    // 对话框询问，若确定则调用云函数删除预约
    wx.showModal({
      title : '取消预约',
      content : '确定要取消吗',
      cancelText : '不了',
      confirmText : '取消', 
      // cancelColor: 'cancelColor',
      success : res => {
        if (res.confirm){
          wx.showLoading({
            title: '取消中',
            mask : true
          })
          wx.cloud.callFunction({
            name : 'deleteDB',
            data : {
              openid : app.globalData.openID,
              id : e.target.id
            },
            success : res => {
              if (res.result.success){
                wx.showToast({
                  title : '取消成功',
                  icon : 'success',
                  duration : 500
                })
                var index 
                // 取消后需要更新当前列表
                // console.log(e)
                for (var i = 0; i < this.data.inoverdue.length; i++){
                  if (this.data.inoverdue[i].id == e.target.id) {
                    index = i
                    break
                  }
                }
                console.log("取消信息", this.data.inoverdue[index])
                this.data.inoverdue.splice(index, 1)
                this.setData({inoverdue : this.data.inoverdue})

                // 并且如果有缓存也需要分别更新本地和recordPage的缓存
                this.renewRecordPageStorage(e.target.id.split('_')[0])
                var manageRecord = wx.getStorageSync('managePage')
                manageRecord['content']['inoverdue'] = this.data.inoverdue
                wx.setStorageSync('managePage', manageRecord)
              } else{
                wx.hideToast({
                  success: (res) => {},
                })
                if (res.result.err == -100){
                  wx.showModal({
                    title : '取消失败',
                    content : '您的预约可能已经被取消，请尝试下拉刷新页面。',
                    confirmText: '知道了',
                    showCancel : false
                  })
                } else {
                  wx.showToast({
                    title: '请求失败，请稍后尝试',
                    icon : 'none',
                    duration : 1000
                  })
                }
              }
            },
            fail : res =>{
              wx.showToast({
                title: '请求错误，请稍后尝试',
                icon : 'none',
                duration : 1000
              })
              console.log('callFunction deleteDB fail ', res)
            }
          })
        }
      }
    })
  },

  renewRecordPageStorage(id){
    var recordStorage = wx.getStorageSync('recordPage')
    console.log(recordStorage)
    if (recordStorage){
      var record = recordStorage['record']
      for (var i = 0; i < record.length; i++){
        if (record[i]['id'] == id){
          record.splice(i, 1)
          recordStorage['record'] = record
          wx.setStorageSync('recordPage', recordStorage)
          break
        }
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var now = new Date()
    var storagedata = wx.getStorageSync('managePage')
    console.log(storagedata)
    if (storagedata && (now.getTime() - storagedata.getTime <= 600000)) 
      {
        console.log(app.globalData.manageContent)
        this.setData({
          overdue : storagedata.content.overdue,
          inoverdue : storagedata.content.inoverdue
        })
      }
    else {
      wx.showLoading({
        title: '获取数据中...',
      })
      refreshtime = new Date()
      this._onloadquerydatabase()
    }
  },

  _onloadquerydatabase(){
    // 首先确定当前时间
    var d = new Date()
    var time = d.getTime()
    // console.log('time ', d, time)
    // 查询数据库本人所预约的记录
    wx.cloud.callFunction({
      name : 'queryDB',
      data : {
        databasename : 'appointment',
        option : 'user',
        openid : app.globalData.openID
      },
      success : res => {
        console.log('[数据库] [查询] 成功')
        var queryData = res.result.data
        console.log(queryData)
        // 根据当前时间确定哪些记录已经过期，哪些尚未过期
        this._dispatch(queryData, time)
        wx.showToast({
          title: '数据加载成功',
          icon : 'success'
        })

      },
      fail : res =>{
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

  _dispatch(queryData, time){
    console.log(time)
    var overdue = [], inoverdue = []
    for (var i = 0; i < queryData.length; i ++){
      var t = {
        id : queryData[i]['_id'] + '_' + queryData[i]['timeid'],
        content : queryData[i]['day'] +' ' +  zone[queryData[i]['index']],
        millisecond : this._getMillisecondTime(queryData[i]['day'], queryData[i]['index'])
      }
      console.log(t.millisecond)
      if (time > t.millisecond){
        overdue.push(t)
      }
      else
        inoverdue.push(t)
    }
    // 对预约进行排序：已过期预约从晚到早，未过期预约从早到晚
    overdue.sort((a, b) => b.millisecond - a.millisecond)
    inoverdue.sort((a, b) => a.millisecond - b.millisecond)
    this.setData({
      overdue : overdue,
      inoverdue : inoverdue
    })
    // 更新缓存信息
    wx.setStorageSync('managePage',
      {
        getTime : (new Date()).getTime(),
        content : {
          inoverdue : inoverdue,
          overdue : overdue
        }
      }
    )
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

  // 比较一个指定的日期（time）是否比当前的一个记录晚，更晚意味着记录已经过期
  _islaterthan(recordDay, recordIndex, time){
    return time > this._getMillisecondTime(recordDay, recordDay)
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
    if (!refreshtime || (now.getTime() - refreshtime.getTime() >= 20000)) {
      refreshtime = new Date()
      refreshtime = now
      wx.showNavigationBarLoading({
        success: (res) => {
          this._onloadquerydatabase()
        },
      })
    }
    else {
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