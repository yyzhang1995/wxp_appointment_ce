// miniprogram/FeedbackPage/FeedbackPage.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    subject : '',
    opinion : ''
  },

  // 主题输入失去焦点时触发
  subblur(e){
    console.log(e.detail.value)
    this.setData({subject : e.detail.value})
  },

  // 意见输入框失去焦点时触发
  opinionblur(e){
    console.log(e.detail.value)
    this.setData({opinion : e.detail.value})
  },

  // 提交意见反馈
  submitopinion(){
    if (!this.data.subject){
      wx.showToast({
        title: '请填写主题',
        icon : 'none',
        duration : 1000
      })
      return
    }
    if (!this.data.opinion){
      wx.showToast({
        title: '请填写意见内容',
        icon : 'none',
        duration : 1000
      })
      return
    }
    wx.showToast({
      title: '提交中',
      icon : 'loading',
      mask : true
    })
    var opiniondata = {}
    opiniondata['subject'] = this.data.subject
    opiniondata['opinion'] = this.data.opinion
    opiniondata['time'] = new Date()
    opiniondata['openid'] = app.globalData.openID ?  app.globalData.openID : ''
    wx.cloud.callFunction({
      name : 'submitopinion',
      data : {
        opiniondata : opiniondata
      },
      success : res =>{
        wx.hideToast({
          success: (res) => {},
        })
        const channel = this.getOpenerEventChannel()
        channel.emit('acceptDataFromOpenedPage', {data : true})
        wx.navigateBack({
          delta: 0,
        })
      },
      fail : res => {
        wx.showToast({
          title: '提交失败，请稍后再试',
          icon : 'none',
          duration : 1000
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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