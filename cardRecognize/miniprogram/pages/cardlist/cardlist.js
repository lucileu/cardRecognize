// pages/cardlist/cardlist.js

const LIMIT = 10;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "",
    lists: [],
    cardsCollection: null,
    cardName: "",
    page: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      cardsCollection: wx.cloud.database().collection(options.type == 0 ? "idcards" : "bankcards"),
      cardName: options.type == 0 ? "身份证" : "银行卡"
    })

    wx.setNavigationBarTitle({
      title: options.type == 0 ? "身份证信息" : "银行卡信息",
    })

    this.getCardInfoFromDB();
  },

  // 获取数据库信息
  getCardInfoFromDB: function () {
    this.data.cardsCollection
      .skip(this.data.page * LIMIT).limit(LIMIT)
      .get()
      .then(res => {
        this.data.page += 1;
        let oldLists = this.data.lists;
        oldLists.push(...res.data)
        this.setData({
          lists: oldLists
        })
    })
  },

  clickCopy: function (evt) {
    const index = evt.currentTarget.dataset.index;
    wx.setClipboardData({
      data: this.data.lists[index].id,
    })
  },

  clickDelete: function (evt) {
    const index = evt.currentTarget.dataset.index;
    const info = this.data.lists[index];
    this.data.cardsCollection.doc(info._id)
                    .remove()
                    .then(res => {
                      let oldLists = this.data.lists;
                      oldLists.splice(index, 1);
                      this.setData({
                        lists: oldLists
                      })
                      this.deleteImage(info.fileID);
                      wx.showToast({
                        title: '删除信息成功',
                      })
                    })
  },

  deleteImage: function (fileID) {
    wx.cloud.deleteFile({
      fileList: [fileID]
    })
  }
})