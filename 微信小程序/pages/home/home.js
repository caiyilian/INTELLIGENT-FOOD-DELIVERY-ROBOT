// pages/home/home.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import mqtt from "../../utils/js/mqtt.min.js"
import {store} from '../../store/store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        count:0, //如果点击创建店铺但没有登录，会跳到登录界面并闪烁那个按钮，count就是闪烁时要用的
        isreadingShopList : false,
        isreadingMyShopList : false,
        isreadingFavoriteShopList : false,
        isreadingAllShopSlamMap:false,
        ShopListStr:"",
        myShopStr:"",
        favoriteShopStr:"",
        AllShopSlamMapStr:""//所有商铺的slam地图
    },
    createShop(){
        if(!this.data.islogin){
            clearInterval(clock)
            this.data.count = 0
            wx.switchTab({
                url: '/pages/contact/contact',
            })
            wx.showToast({
              title: '登录后才能创建店铺！',
              duration:500,
              icon:"none" 
            })
            var clock = setInterval(() => {
                if(this.data.MyPageButtonType==="primary") this.updateMyPageButtonType("warn")
                else this.updateMyPageButtonType("primary")
                this.data.count += 1
                if (this.data.count===6) clearInterval(clock)
            }, 200);
            return 
        }
        wx.navigateTo({
          url: '/pages/createShopPage/createShopPage',
        })
    },
    searchShop(){
        wx.navigateTo({
            url: '/pages/searchShopPage/searchShopPage',
          })
    },
    readFromEsp8266(msg){

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.storeBindings = createStoreBindings(this,{
            store,
            fields:[
                "uid","SubTopic","PubTopic",'islogin',"MyPageButtonType","nowInKitchen",
            "myShop","favoriteShop","shopList","client","kitchenPoint"],
            actions:["updateMyPageButtonType","setMyShop","setFavoriteShop","setShopList","setClient","updateMyShopIDList","updateFavoriteShopIDList","updateAllMyShopID","updateAllFavoriteShopID","updateNowInKitchen"]
        })
    },
    scanCode() {
        console.log("--")
        wx.scanCode({
          success(res) {

                wx.redirectTo({
                  url: "/pages/shop/shop?shopId="+res.result.split("*")[0]+"&DeskId="+res.result.split("*")[1],
                })
            
          }
        })
      },
    mqttConnect(){
        var that = this
        //MQTT连接的配置
        var options= {
          keepalive: 60, //60s ，表示心跳间隔
          clean: true, //cleanSession不保持持久会话
          protocolVersion: 4, //MQTT v3.1.1
          clientId:this.data.uid
        }
        //初始化mqtt连接
         this.data.client = mqtt.connect('wxs://bemfa.com:9504/wss',options)
         this.setClient(this.data.client)
        
         // 连接mqtt服务器
         this.data.client.on('connect', function () {
          console.log('连接服务器成功')
          //发送信息告诉esp8266我已经进入小程序，让他把所有店铺信息给我
          that.data.client.publish(that.data.PubTopic.WechatNeedShopList,"0")
          //订阅所有主题
          that.data.client.subscribe(that.data.SubTopic.EspSendShopList, function (err) {
            if (err) {
                console.log(err)
            }
          })
          that.data.client.subscribe(that.data.SubTopic.EspSendMyShopList, function (err) {
            if (err) {
                console.log(err)
            }
          })
          that.data.client.subscribe(that.data.SubTopic.EspSendFavoriteShopList, function (err) {
            if (err) {
                console.log(err)
            }
          })
          that.data.client.subscribe(that.data.SubTopic.RPiSendSlamMapUrl, function (err) {
            if (err) {
                console.log(err)
            }
          })
          that.data.client.subscribe(that.data.SubTopic.RPiWantPoint, function (err) {
            if (err) {
                console.log(err)
            }
          })
          
        })
        //接收消息
        that.data.client.on('message', function (topic, message) {
            var  msg = message.toString()
            if(topic===that.data.SubTopic.EspSendShopList){
                if(msg==="beginSend"){
                    that.setData({
                        isreadingShopList:true,
                        ShopListStr:""
                    })
                }
                else if(msg==="endSend"){
                    console.log(that.data.ShopListStr)
                    let msgObj = JSON.parse(that.data.ShopListStr)
                    
                    that.setShopList(msgObj)
                    that.setData({
                        isreadingShopList:false
                    })
                }
                else if(that.data.isreadingShopList===true){
                    that.setData({
                        ShopListStr:that.data.ShopListStr+msg
                    })
                }
                
            }
            else if(topic===that.data.SubTopic.EspSendMyShopList){
                if(msg==="beginSend"){
                    that.setData({
                        isreadingMyShopList:true,
                        myShopStr:""
                    })
                }
                else if(msg==="endSend"){
                    let msgObj = JSON.parse(that.data.myShopStr)
                    that.updateAllMyShopID(msgObj)
                    console.log(msgObj)
                    that.setData({
                        isreadingMyShopList:false
                    })
                }
                else if(that.data.isreadingMyShopList===true){
                    that.setData({
                        myShopStr:that.data.myShopStr+msg
                    })
                }
            }
            else if(topic===that.data.SubTopic.EspSendFavoriteShopList){
                if(msg==="beginSend"){
                    that.setData({
                        isreadingFavoriteShopList:true,
                        favoriteShopStr:""
                    })
                }
                else if(msg==="endSend"){
                    let msgObj = JSON.parse(that.data.favoriteShopStr)
                    console.log('msgObj',msgObj)
                    that.updateAllFavoriteShopID(msgObj)
                    that.setData({
                        isreadingFavoriteShopList:false
                    })
                }
                else if(that.data.isreadingFavoriteShopList===true){
                    that.setData({
                        favoriteShopStr:that.data.favoriteShopStr+msg
                    })
                }
            }
            else if(topic===that.data.SubTopic.RPiSendSlamMapUrl){
                let param = "{\""+""+msg.split("?")[1].replace(/&/g,",\"").replace(/=/g,"\":")+"}"
                console.log("msg",msg)
                console.log("param=",param)
                let msgObj = JSON.parse(param) //得到{"x":71,"y":118,"id":4232}
                console.log("msgObj=",msgObj)
                msgObj.url = msg
                
                //接下来要更新所有店铺的这个信息
                if(msgObj.id===that.data.nowInKitchen.id){
                    that.data.nowInKitchen.slamMapImgUrl = msgObj.url
                    that.updateNowInKitchen(that.data.nowInKitchen,false)
                }
                
            }
            else if(topic===that.data.SubTopic.RPiWantPoint){
                if(msg==='1'){
                    that.data.client.publish("d",JSON.stringify(that.data.kitchenPoint))
                }
                
            }
        })
    
        //断线重连
        this.data.client.on("reconnect", function () {
          console.log("重新连接")
        });
      },
    
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        this.mqttConnect()
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