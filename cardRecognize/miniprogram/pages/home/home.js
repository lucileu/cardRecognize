// miniprogram/pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardItems: [
      {
        title: "身份证",
        icon: "/assets/zhengjian.png"
      },
      {
        title: "银行卡",
        icon: "/assets/yhk.png"
      },
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  slectedCard: function (event) {
    const type = event.detail.value;
    wx.navigateTo({
      url: `/pages/recognize/recognize?type=${type}`,
    })
  }
})