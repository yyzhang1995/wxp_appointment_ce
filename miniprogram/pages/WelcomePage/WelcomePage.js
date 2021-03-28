// miniprogram/pages/WelcomePage/WelcomePage.js
const app = getApp()
var opinionfeedbacksuccess = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    logged : false,
    userInfo : {},
    avatarUrl : './user-unlogin.png',
    logwords : '点击登录'
  },

  // 获取用户登录信息
  getUserInfo(e){
    if (!this.data.logged){
      wx.showLoading({
        title: '登录ing',
        mask : true
      })
      wx.cloud.callFunction({
        name : 'login',
        data : {},
        success : res=>{
          app.globalData.openID = res.result.openid
          wx.setStorageSync('welcomePage', {openID : res.result.openid})
          this.setData({
            logged : true,
            logwords : '欢迎使用'
          })
          wx.showToast({
            title: '登录成功',
            duration : 1000
          })
        },
        fail : res =>{
          wx.showToast({
            title: '请求错误，请稍后重试',
            icon : 'none',
            duration : 500
          })
        }
      })
    }
    else{
      wx.showToast({
        title: '已经登录',
        icon : 'none'
      })
    }
  },

  // 进行预约
  appointment(){
    if (!this.data.logged){
      wx.showToast({
        title: '请先登录',
        icon : 'none'
      })
    }
    else {
      wx.navigateTo({
        url: '../AppointmentPage/AppointmentPage',
      })
    }
  },

  // 预约管理
  manage(){
    if (!this.data.logged){
      wx.showToast({
        title: '请先登录',
        icon : 'none'
      })
    }
    else 
    wx.navigateTo({
      url: '../ManagePage/ManagePage',
    })
  },

  // 切换回小程序云开发页面
  development(){
    wx.navigateTo({
      url: '../index/index',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!wx.getStorageSync('welcomePage'))
      this.setData({
        logged : false,
        logwords : '点击登录'
      })
    else{
      this.setData({
        logged : true,
        logwords : '已经登录'
      })
      app.globalData.openID = wx.getStorageSync('welcomePage')['openID']
    }
  },

  // 用户登出
  onlogout(){
    if (!this.data.logged){
      wx.showToast({
        title: '尚未登录',
        icon : 'none',
        duration : 500
      })
      return
    }
    wx.showModal({
      title : '提示',
      content: '确认要退出登录吗？',
      success : res =>{
        if (res.confirm) {
          // 删除缓存
          wx.clearStorageSync('welcomePage')
          // 设置页面状态
          this.setData({
            logged : false,
            logwords : '点击登录'
          })
          // 去掉全局变量
          app.globalData.openID = null
          wx.showToast({
            title: '登出成功',
            icon : 'none',
            duration : 1000
          })
        }
      }
    })
  },

  // 意见反馈
  onfeedback(){
    wx.navigateTo({
      url: '../FeedbackPage/FeedbackPage',
      events : {
        acceptDataFromOpenedPage : data => {
          if (data)
            opinionfeedbacksuccess = true
        }
      }
    })
    
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
    if (opinionfeedbacksuccess) {
      wx.showToast({
        title: '提交成功！',
        icon : 'success',
        duration : 1500
      })
      opinionfeedbacksuccess = false
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