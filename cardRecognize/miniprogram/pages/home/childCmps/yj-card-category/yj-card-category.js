// pages/home/childCmps/yj-card-category/yj-card-category.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    cardItems: {
      type: Array,
      value: []
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickItem: function (evt) {
      const type = evt.currentTarget.dataset.index
      wx.navigateTo({
        url: `/pages/cardlist/cardlist?type=${type}`,
      })
    }
  }
})
