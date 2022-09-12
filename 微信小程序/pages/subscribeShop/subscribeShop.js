// pages/subscribeShop/subscribeShop.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {store} from '../../store/store'
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.storeBindings = createStoreBindings(this,{
            store,
            fields:["favoriteShop","shopList","favoriteShopIDList"],
            actions:["updateFavoriteShopIDList"]
        })
    },
    goToShop(e){
       let array = this.data.shopList
        for (let index = 0; index < array.length; index++) {
            if(array[index].id===e.currentTarget.dataset.id){
                wx.navigateTo({
                  url: '/pages/shop/shop?obj='+JSON.stringify(array[index]),
                })
                break
            }
        }
    },
    cancleSub(e){
        let that = this
        wx.showModal({
            title: '提示',
            content: '确定要将该店铺从你的收藏中移除吗？',
            success (res) {
              if (res.confirm) {
                let array = that.data.favoriteShopIDList
                for (let index = 0; index < array.length; index++) {
                    if(array[index]===e.currentTarget.dataset.id){
                        array.splice(index,1)
                        break
                    }
                    
                }
                that.updateFavoriteShopIDList(array)
                  //删除收藏的店铺中指定id的店铺
                  that.onLoad()
                  wx.showToast({
                    title: '移除成功',
                  })
                  
              } 
            }
          })
          
        
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.onLoad()
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