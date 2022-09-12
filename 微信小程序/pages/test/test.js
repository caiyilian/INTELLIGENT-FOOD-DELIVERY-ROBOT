// pages/test/test.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        left:0,
        loading:false,
        addCode:false,
        showCode:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },
    scanCode() {
        wx.scanCode({
          success(res) {
            if(res.result.startsWith("pages")){
                console.log(res.result)
                wx.redirectTo({
                  url: "/"+res.result,
                })
            }
          }
        })
      },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },
    test(e){
        console.log(e.touches[0].pageX)
        // this.setData({
        //     left:e.touches[0].pageX
        // })
    },
    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})