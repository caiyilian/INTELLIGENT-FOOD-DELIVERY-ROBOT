// pages/createShopPage/createShopPage.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {store} from '../../store/store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        name: '',
        phoneNum:"",
        shopName:"",
        emailNum:"",
        passwordNum:"",
        passwordType:"password",
        passwordIconUrl:"/images/unvis.png",
        headImg:"/images/noImg.png"
    },
    onChange(e){
        let obj = {}
        obj[e.currentTarget.id] = e.detail
        this.setData(obj)
   },
   afterRead(event) {
    const { file } = event.detail;
    this.setData({
        headImg:file.url
    })
  },
   seePassword(){
       if(this.data.passwordIconUrl==="/images/vis.png")
       {
           clearTimeout(timeoutClock)
            this.setData({
                passwordType:"password",
                passwordIconUrl:"/images/unvis.png"
            })
       }
       else{
        this.setData({
            passwordType:"text",
            passwordIconUrl:"/images/vis.png"

        })
        clearTimeout(timeoutClock)
        var timeoutClock = setTimeout(() => {
            this.setData({
                passwordType:"password",
                passwordIconUrl:"/images/unvis.png"
            })
        }, 3000);
       }
        
   },
   createShop(){
       let that = this
       if(this.data.name==='') return wx.showToast({
         title: '请输入姓名',
         icon:"none"
       })
       if(this.data.phoneNum==='') return wx.showToast({
        title: '请输入联系电话',
        icon:"none"
      })
      if(this.data.shopName==='') return wx.showToast({
        title: '请输入店铺名称',
        icon:"none"
      })
      if(this.data.passwordNum==='') return wx.showToast({
        title: '请输入密码',
        icon:"none"
      })
      wx.showModal({
        title: '提示',
        content: '确定要创建新店铺吗？',
        success (res) {
          if (res.confirm) {
              //构造店铺对象
                let obj = {
                    id:String(Date.parse(new Date())/1000).slice(3),
                    name:that.data.name,//店主名字
                    phoneNum:that.data.phoneNum,
                    shopName:that.data.shopName,
                    emailNum:that.data.emailNum,
                    passwordNum:that.data.passwordNum,
                    headImg:that.data.headImg,
                    foodList:[],
                    slamMapImgUrl:"/images/noImg.png",
                    // slamMapImgUrl:"/images/test2.jpg",
                    flagMsgObj:{
                        desk:[],
                        kitchen:[]
                    }
                }
                
                
                //将新创建的店铺加入到所有店铺列表中
                that.updateShopList(obj)
                that.data.myShopIDList.push(obj.id)
                //更新我的店铺，我的店铺（仅id）、所有我的店铺仅id
                that.updateMyShopIDList(that.data.myShopIDList)
                wx.redirectTo({
                    url: '/pages/shop/shop?new=true&obj='+JSON.stringify(obj),
                })
          }
        }
      })
   },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.storeBindings = createStoreBindings(this,{
            store,
            fields:["favoriteShop","myShop","shopList","myShopIDList"],
            actions:['updateFavoriteShop','updateShopList',"updateMyShopIDList"]
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