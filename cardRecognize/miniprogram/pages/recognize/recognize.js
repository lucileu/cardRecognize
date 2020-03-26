// pages/recognize/recognize.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    type: "",
    categories: ["身份证", "银行卡"],
    infos: null,
    cardsCollection: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      type: options.type,
      cardsCollection: wx.cloud.database().collection(options.type == 0 ? "idcards" : "bankcards")
    })
  },

  // 1.选择证件
  selectClick: function() {
    wx.chooseImage({
      success: (res) => {
        wx.showLoading({
          title: `${this.data.categories[this.data.type]}识别中`,
        })
        this.uploadFile(res.tempFilePaths[0])
      },
    })
  },

  // 2.上传证件
  uploadFile: function(filePath) {
    const timeStamp = new Date().getTime();
    wx.cloud.uploadFile({
      filePath,
      cloudPath: `images/${timeStamp}.png`
    }).then(res => {
      this.getTempUrl(res.fileID);
    })
  },

  // 3.获取临时链接
  getTempUrl: function (fileID) {
    wx.cloud.getTempFileURL({
      fileList: [fileID]
    }).then(res => {
      this.recognizeCard(res.fileList[0].tempFileURL, fileID)
    })
  },

  // 4.云函数识别
  recognizeCard: function (fileUrl, fileID) {
    wx.cloud.callFunction({
      name: "recognizeCard",
      data: {
        fileUrl,
        cardType: this.data.type
      }
    }).then(res => {
      this.data.type == 0 ? this.handldIdInfo(res, fileID) : this.handldBankInfo(res, fileID)

      wx.hideLoading();
    })
  },

  handldIdInfo: function (res, fileID) {
    if (!res.result.id) {
      this.deleteCardFile(fileID);
      wx.showToast({
        title: '卡证识别失败',
      })
      return;
    }

    this.setData({
      infos: {
        address: res.result.address,
        birth: res.result.birth,
        id: res.result.id,
        name: res.result.name,
        nation: res.result.nation,
        sex: res.result.sex,
        fileID
      }
    })

    this.saveClick();
  },

  handldBankInfo: function (res, fileID) {
    console.log(res.result)
    if (res.result.length < 5) {
      this.deleteCardFile(fileID);
      wx.showToast({
        title: '卡证识别失败',
      })
      return;
    }

    let objs = []
    res.result.forEach((item, index) => {
      let obj = {}
      obj[item.item] = item.itemstring
      objs.push(obj)
    })
    console.log(objs)

    this.setData({
      infos: {
        id: res.result[0].itemstring,
        type: res.result[1].itemstring,
        cardName: res.result[2].itemstring,
        bankName: res.result[3].itemstring,
        time: res.result[4].itemstring,
        fileID
      }
    })

    this.saveClick();
  },

  saveClick: function () {
    wx.showLoading({
      title: '保存信息中',
    });
    // 查询是否已经保存
    this.data.cardsCollection.where({
      id: this.data.infos.id
    }).get()
      .then(res => {
        if (res.data.length > 0) {
          // 覆盖
          const _id = res.data[0]._id;
          const fileID = res.data[0].fileID;
          this.coverInfo(_id);
          if (this.data.infos.fileID != fileID) {
            this.deleteCardFile(fileID);
          }
        } else {
          // 保存
          this.saveInfo();
        }
      }) 
  },

  deleteCardFile: function (fileID) {
    wx.cloud.deleteFile({
      fileList: [fileID]
    })
  },

  coverInfo: function (_id) {
    this.data.cardsCollection
      .doc(_id)
      .set({
        data: this.data.infos
      })
      .then(this.saveSuccess)
      .catch(this.saveFail)
  },

  saveInfo: function () {

    this.data.cardsCollection.add({
      data: this.data.infos
    }).then(this.saveSuccess)
      .catch(this.saveFail)
  },

  saveSuccess: function () {
    wx.showToast({
      title: '保存成功',
    })
  },

  saveFail: function () {
    wx.showToast({
      title: '保存失败',
    })
  },

  copyClick: function () {
    wx.setClipboardData({
      data: this.data.infos.id,
    })
  }
})