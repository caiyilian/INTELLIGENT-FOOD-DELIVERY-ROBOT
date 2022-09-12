// pages/searchShopPage/searchShopPage.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {store} from '../../store/store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        searchType:"名称",
        inputValue:"",
        findList:[]
        
    },
    listen(e){
        this.setData({
            inputValue:e.detail.value
        })
        this.search({
            detail:{value:e.detail.value}
        })
    },
    search(e){
        let value
        let Type
        if(e.detail.value===undefined)
        value=this.data.inputValue
        else 
        value = e.detail.value
        if(value===""){
            //如果没有任何输入，就不应该往下执行了
            this.setData({
                findList:[]
            })
            return
        }
        if(this.data.searchType==="名称") Type="shopName"
        else Type="id"
        let newList = []
        let array = this.data.shopList
        for (let index = 0; index < array.length; index++) {
            if(String(array[index][Type])===value)
            {
                //如果完全匹配，那就放在第一位
                newList.unshift(array[index])
            }

            else if(String(array[index][Type]).indexOf(value)!==-1)
            {
                //如果部分匹配，就放在后面
                newList.push(array[index])
            }
        }
        this.setData({
            findList:newList
        })
    },
    changeSearchType(){
        this.setData({
            searchType:this.data.searchType==="名称"?"ID":"名称"
        })
        this.search({
            detail:{value:this.data.inputValue}
        })
    },
    goToShop(e){
        if(this.data.islogin===false)
        return wx.showToast({
          title: '请先登录',
          icon:"error"
        })
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
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.storeBindings = createStoreBindings(this,{
            store,
            fields:["shopList","islogin"],
            actions:["updateFavoriteShop"]
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