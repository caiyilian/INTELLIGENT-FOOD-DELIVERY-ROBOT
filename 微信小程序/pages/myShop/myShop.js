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
            fields:["myShop","shopList","myShopIDList","favoriteShopIDList"],
            actions:["updateMyShopIDList","updateFavoriteShopIDList","setMyShop","deleteAllFavo"]
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
            content: '确定要删除该店铺吗？',
            success (res) {
              if (res.confirm) {
                let array = that.data.myShopIDList
                for (let index = 0; index < array.length; index++) {
                    if(array[index]===e.currentTarget.dataset.id){
                        array.splice(index,1)
                        break
                    }
                    
                }
                //删除我的店铺中指定id的店铺
                that.updateMyShopIDList(array)
                  
                that.onLoad()
                  wx.showToast({
                    title: '删除成功',
                  })
                  //同时如果收藏里面有这个店铺，也删掉，
                  //原本收藏，然后取消收藏
                let array1 = that.data.favoriteShopIDList
                for (let index = 0; index < array1.length; index++) {
                    if(array1[index]===e.currentTarget.dataset.id){
                        array1.splice(index,1)
                        break
                    }
                    
                }
                that.updateFavoriteShopIDList(array)
                //删除其他收藏了你这个店铺的人的收藏中的这个店铺
                that.deleteAllFavo(e.currentTarget.dataset.id)
                //所有店铺中这家店也要删掉
                let array2 = that.data.shopList
                for (let index = 0; index < array2.length; index++) {
                    if(array2[index].id===e.currentTarget.dataset.id){
                        array2.splice(index,1)
                        break
                    }
                }
                that.setMyShop(array2)
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