// pages/test/test.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {store} from '../../store/store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loading:false,
        option1: [
            { text: '全部商品', value: 0 },
            { text: '新款商品', value: 1 },
            { text: '活动商品', value: 2 },
          ],
          oriX : 167,
          oriY : 82,
          value1: 0,
        hiddenActionsheet:true,
        canvaHeight:0,
        groups: [
            {name:'标记为餐桌',id:1},
            {name:'标记为厨房',id:2}
          ],
        longTouchGrid:{
            x:null,
            y:null
        },
        addingItem:{
            itemName:"",
            id:null
        },
        orderList:[
    ]
    },
    ready(e){
        let that = this
        wx.showModal({
            title: '提示',
            content: '确认完成？',
            success (res) {
              if (res.confirm) {
                let oriList = that.data.orderList
                oriList[e.currentTarget.dataset.index].isReady = true
                that.setData({
                    orderList:oriList
                })
                //更新所有店铺的订单信息
                for (let index = 0; index < that.data.todayFoodOrders.length; index++) {
                    if(that.data.todayFoodOrders[index].id===that.data.shopInfo.id){
                        that.data.todayFoodOrders[index].orders = oriList
                        that.updateTodayFoodOrders(that.data.todayFoodOrders)
                        break
                    }
                    
                }
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
            fields:["todayFoodOrders","shopList","nowInKitchen","kitchenPoint"],
            actions:["getSlamMap","updateTodayFoodOrders","setShopList","updateNowInKitchen","updateAllShopMapUrl","sendPoint","updateKitchenPoint"]
        })
        if(options!==undefined)
        {
            let shopInfo = JSON.parse(decodeURIComponent(options.obj))
            this.setData({
                shopInfo:shopInfo
            })
        }
    },
    touchLong(e){
        if(this.data.longTouchGrid.x!==null) return
        
        this.setData({hiddenActionsheet:false});
        //保存坐标
        this.setData({
            ["longTouchGrid.x"]:e.touches[0].x,
            ["longTouchGrid.y"]:e.touches[0].y,
        })
    },
    actionsheetChange:function(){
        //点击模糊的地方或者取消之后，隐藏弹窗
      this.setData({hiddenActionsheet:true});
      
      //清楚点击的坐标
      this.setData({
        longTouchGrid:{
            x:null,
            y:null,
        }
    })
    },
    itemTap(e){
        this.setData({hiddenActionsheet:true});
        if(e.currentTarget.dataset.id==1){
            //标记为餐桌
            this.setData({['addingItem.itemName']:"餐桌"})
        }
        else{
            //标记为厨房
            this.setData({["addingItem.itemName"]:"厨房"})
        }
    },
    clickButton(e){
        if(e.currentTarget.dataset.create){
            if(isNaN(Number(this.data.addingItem.id))||this.data.addingItem.id===""||this.data.addingItem.id===null) return wx.showToast({
                title: 'id必须为数字',
                icon:"error"
              })
                if(this.data.addingItem.itemName==="餐桌"){
                    let isRepeat = false
                    for (let index = 0; index < this.data.shopInfo.flagMsgObj.desk.length; index++) {
                        console.log("来了for循环")
                        if(this.data.shopInfo.flagMsgObj.desk[index].id===this.data.addingItem.id){
                            isRepeat = true
                            break
                        }
                    }
                    if(isRepeat) return wx.showToast({
                      title: '该餐桌号已存在',
                      icon:"error"
                    })
                    wx.showToast({
                      title: '添加成功',
                    })
                    let deskList = this.data.shopInfo.flagMsgObj.desk
                    deskList.push({
                        id:this.data.addingItem.id,
                        x:this.data.longTouchGrid.x,
                        y:this.data.longTouchGrid.y
                    })
                    
                    this.setData({
                        ["shopInfo.flagMsgObj.desk"]:deskList
                    })
                    this.updateNowInKitchen(this.data.shopInfo)
                }
                else{
                    let isRepeat = false
                    for (let index = 0; index < this.data.shopInfo.flagMsgObj.kitchen.length; index++) {
                        if(this.data.shopInfo.flagMsgObj.kitchen[index].id===this.data.addingItem.id){
                            isRepeat = true
                            break
                        }
                    }
                    if(isRepeat) return wx.showToast({
                      title: '该厨房号已存在',
                      icon:"error"
                    })
                    wx.showToast({
                        title: '添加成功',
                      })
                    let kitchenList = this.data.shopInfo.flagMsgObj.kitchen
                    let that = this
                    let x = that.data.longTouchGrid.x
                    let y = that.data.longTouchGrid.y
                    wx.getImageInfo({
                        src: that.data.nowInKitchen.slamMapImgUrl,
                        success:function(res){
                            let rate =   that.data.screenWidth_px/res.width //渲染的宽度和实际宽度的比值
                            let param = "{\""+""+that.data.nowInKitchen.slamMapImgUrl.split("?")[1].replace(/&/g,",\"").replace(/=/g,"\":")+"}"
                            
                            let msgObj = JSON.parse(param) //得到{"x":71,"y":118,"id":4232}
                          
                            let last_x = (x/rate-msgObj.x)*0.05
                            let last_y = -(y/rate-msgObj.y)*0.05
                            let obj = {"x":last_x,"y":last_y}
                            that.updateKitchenPoint(obj)
                        }
                      })

                    kitchenList.push({
                        id:this.data.addingItem.id,
                        x:this.data.longTouchGrid.x,
                        y:this.data.longTouchGrid.y
                    })
                    this.setData({
                        ["shopInfo.flagMsgObj.kitchen"]:kitchenList
                    })
                    this.updateNowInKitchen(this.data.shopInfo)
                    
                }
        }
        this.setData({
            addingItem:{
                itemName:"",
                id:null
            },
            longTouchGrid:{
                x:null,
                y:null
            }
        })
    },
    addIDInput(e){
        this.setData({
            ["addingItem.id"]:e.detail.value
        })
    },
    clickKitchenFlag(e){
        let that = this
        wx.showModal({
            title: '提示',
            content: '是否前往'+e.currentTarget.dataset.id+'号厨房',
            success (res) {
              if (res.confirm) {
                  wx.getImageInfo({
                    src: that.data.nowInKitchen.slamMapImgUrl,
                    success:function(res){
                        let rate =   that.data.screenWidth_px/res.width //渲染的宽度和实际宽度的比值
                        
                        let param = "{\""+""+that.data.nowInKitchen.slamMapImgUrl.split("?")[1].replace(/&/g,",\"").replace(/=/g,"\":")+"}"
                        
                        let msgObj = JSON.parse(param) //得到{"x":71,"y":118,"id":4232}
                        let last_x = (e.currentTarget.dataset.x/rate-msgObj.x)*0.05
                        let last_y = -(e.currentTarget.dataset.y/rate-msgObj.y)*0.05
                        let obj = {"x":last_x,"y":last_y,"shopId":that.data.nowInKitchen.id}
                        console.log("2",e.currentTarget.dataset.x)
                        that.sendPoint(JSON.stringify(obj))
                    }
                  })
                  
              } 
            },
            
          })
    },
    longClickFlag(e){
        //长按某个标志
        wx.showModal({
            title: '提示',
            content: '是否删除'+e.currentTarget.dataset.id+'号'+e.currentTarget.dataset.name,
            success (res) {
              if (res.confirm) {
                
                console.log('前往'+e.currentTarget.dataset.id+'号'+e.currentTarget.dataset.name)
              } 
            }
          })
        
    },
    clickDeskFlag(e){
        let that = this
        wx.showModal({
            title: '提示',
            content: '是否前往'+e.currentTarget.dataset.id+'号餐桌',
            success (res) {
              if (res.confirm) {
                wx.getImageInfo({
                    src: that.data.nowInKitchen.slamMapImgUrl,
                    success:function(res){
                        let rate =   that.data.screenWidth_px/res.width //渲染的宽度和实际宽度的比值
                        let param = "{\""+""+that.data.nowInKitchen.slamMapImgUrl.split("?")[1].replace(/&/g,",\"").replace(/=/g,"\":")+"}"
                        let msgObj = JSON.parse(param) //得到{"x":71,"y":118,"id":4232}
                        let last_x = (e.currentTarget.dataset.x/rate-msgObj.x)*0.05
                        let last_y = -(e.currentTarget.dataset.y/rate-msgObj.y)*0.05
                        let obj = {"x":last_x,"y":last_y,"shopId":that.data.nowInKitchen.id}
                        that.sendPoint(JSON.stringify(obj))
                    }
                  })
              } 
            }
          })
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        let that = this
        wx.getImageInfo({
          src: this.data.shopInfo.slamMapImgUrl,
          success:function(res){
              let nowHeight = (res.height/res.width)*750
              that.setData({
                  canvaHeight:nowHeight
              })
              //初始化画布
              wx.createSelectorQuery()
              .select('#myCanvas') // 在 WXML 中填入的 id
              .fields({ node: true, size: true })
              .exec((res) => {
                  // Canvas 对象
                  const canvas = res[0].node
                  // 渲染上下文
                  const ctx = canvas.getContext('2d')
                  that.setData({
                    canvas:canvas,
                    ctx:ctx
                  })
                  // Canvas 画布的实际绘制宽高
                  const width = res[0].width
                  const height = res[0].height
          
                  // 初始化画布大小
                  wx.getSystemInfo({
                    success (res) {
                        const dpr = res.pixelRatio
                        that.setData({
                            px2rpx:dpr,
                            screenWidth_px:res.screenWidth
                        })
                        canvas.width = width * dpr
                        canvas.height = height * dpr
                        ctx.scale(dpr, dpr)
                    }
                  })
                  

              })
          }
        })
        let myShopId = this.data.shopInfo.id
        console.log("this.data.todayFoodOrders=",this.data.todayFoodOrders)
        console.log("this.data.todayFoodOrders[0]=",this.data.todayFoodOrders[0])
        console.log("this.data.todayFoodOrders=[1]",this.data.todayFoodOrders[1])
        for (let index = 0; index < this.data.todayFoodOrders.length; index++) {
            if(this.data.todayFoodOrders[index].id===myShopId){
                this.setData({
            //从所有店铺的订单列表里面找到自己那一张订单
                    orderList:this.data.todayFoodOrders[index].orders
                })
            }
        console.log("出来了")   
        }

    },
    getMap(e){
        this.getSlamMap(this.data.shopInfo.id)
        clearInterval(clock)
        this.setData({
            originMapUrl:this.data.nowInKitchen.slamMapImgUrl,
            loading:true
        })
        var clock = setInterval(() => {
            if(this.data.nowInKitchen.slamMapImgUrl!==this.data.originMapUrl){
                console.log("1")
                clearInterval(clock)
                this.setData({
                    ["shopInfo.slamMapImgUrl"]:this.data.nowInKitchen.slamMapImgUrl,
                    ["shopInfo.flagMsgObj"]:{desk:[],kitchen:[]},
                    loading:false
                })
                this.updateNowInKitchen(this.data.shopInfo)
                let that = this
                wx.getImageInfo({
                  src: this.data.nowInKitchen.slamMapImgUrl,
                  success:function(res){
                      let nowHeight = (res.height/res.width)*750
                      that.setData({
                          canvaHeight:nowHeight
                      })   
                  }
                })
                console.log(2)
                this.onLoad()
            }
        }, 500);
    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        this.updateNowInKitchen(this.data.shopInfo)
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
        console.log("onHide")
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