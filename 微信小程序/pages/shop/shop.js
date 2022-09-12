// pages/shop/shop.js
import {createStoreBindings} from 'mobx-miniprogram-bindings'
import {store} from '../../store/store'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showActionsheet:true,
        groups: [
          {name:'增加菜品',id:1},
          {name:'删除菜品',id:2},
          {name:'进入厨房',id:3},
          {name:'生成二维码',id:4}
        ],
        beginDelete:false,//删除菜品
        moreOperate:false,//控制最底部的样式
        beginAdd:false,
        addFoodObj:{
            title:"",
            desc:"",
            price:0,
            thumb: "/images/noImg.png",//增加菜品的时候的图片
        },
        shopInfo:{
            emailNum:1,
            foodList:[],
            headImg:"/images/noImg.png",
            id:"0219441",
            name:1,
            passwordNum:1,
            phoneNum:1,
            shopName:1
        },
        totalNum:"",//顾客已经购买的食物的总数量
        totalPrice:0,//单位是分，100才是一块钱
        isLike:true,//这家店铺是否被收藏
        isMyShop:true,
        myShopIDList:['0219441',],
        shopOrders:[//该用户点击结算之后会出现订单
            
        ],
        DeskId:0,
        addCode:false,
        showCode:false,
        wechatCode:"",
        DeskNumInput:""
    },
    moreMsg(){
        //点击了那三个点之后，显示出弹窗
        this.setData({showActionsheet:false});
    },
   
     actionsheetChange:function(){
         //点击模糊的地方或者取消之后，隐藏弹窗
       this.setData({showActionsheet:true});
     },
   
     itemTap:function(e){
        
        let evenName = e.currentTarget.dataset.name
        if(evenName==="增加菜品"){
            this.setData({moreOperate:true})
            this.setData({beginAdd:true})
        }
        else if(evenName==="删除菜品"){
            this.setData({moreOperate:true})
            if(this.data.shopInfo.foodList===undefined||this.data.shopInfo.foodList.length===0) return wx.showToast({
              title: '没有菜品可以删除',
              icon:'none'
            })
            this.setData({
                beginDelete:true,
            })
            this.clearAllNum()
        
        }
        else if(evenName==='进入厨房'){
            wx.navigateTo({
              url: '/pages/kitchen/kitchen?obj='+encodeURIComponent(JSON.stringify(this.data.shopInfo)),
            })
        }
        else{
            this.setData({
                addCode:true
            })
        }
        //隐藏弹窗
        this.actionsheetChange()
     },
     addCodeInput(e){
        this.setData({
            addCodeDeskNum:String(e.detail.value)
        })
     },
     addCodeButton(){
        this.setData({
            addCode:false,
            showCode:true,
            wechatCode:"http://api.qrserver.com/v1/create-qr-code/?data="+String(this.data.shopInfo.id)+"*"+this.data.addCodeDeskNum,
            DeskNumInput:""
        })
     },
     cancelCodeButton(){
        this.setData({
            addCode:false,
            wechatCode:"",
            DeskNumInput:""
        })
     },
     endShow(){
        this.setData({
            showCode:false
        })
     },
     deleteFood(e){
         let that = this         
        wx.showModal({
            title: '提示',
            content: '确定要删除这个菜品吗',
            success (res) {
              if (res.confirm) {
                let oriList = that.data.shopInfo.foodList
                let flag = 0
                for (let i = 0; i < oriList.length; i++) {
                    if(oriList[i].index===e.currentTarget.dataset.index&&flag===0)
                    {
                       oriList.splice(i,1)
                       flag = 1
                    }
                    if(flag===1){
                        if(oriList.length===0||i===oriList.length) break
                        oriList[i].index -= 1
                     }
                    
                }
                that.setData({
                    ["shopInfo.foodList"]:oriList
                })
                //先把这个店铺删掉，然后再重新加入修改后的店铺
                let shopInfo = this.data.shopInfo
                //删除旧的
                this.updateShopList({},true,this.data.shopInfo.id)
                //增加新的
                this.updateShopList(shopInfo)
              } 
            }
          })
          
     },
     addFoodInput(e){
        this.setData({
            ["addFoodObj."+e.currentTarget.dataset.name]:e.detail.value
        })
     },
     operateDone(e){
         
        if(this.data.beginAdd===true&&e.currentTarget.dataset.mode==='finish'){
            if(isNaN(Number(this.data.addFoodObj.price)))
            return wx.showToast({
              title: '价格必须为数字类型',
              icon:"error"
            })
            let obj = this.data.shopInfo
            obj.foodList.push({
                ...this.data.addFoodObj,
                num:0,
                index:obj.foodList.length,
            })
            this.setData({
              shopInfo:obj,
            })
            //先把这个店铺删掉，然后再重新加入修改后的店铺
            //删除旧的
            this.updateShopList({},true,obj.id)
            //增加新的
            this.updateShopList(obj)
        }
        this.setData({
            beginDelete:false,
            moreOperate:false,
            beginAdd:false,
            addFoodObj:{
            title:"",
            desc:"",
            price:0,
            thumb: "/images/noImg.png",//增加菜品的时候的图片
        },
        })
     },
     //将所有涉及数字的都删除
     clearAllNum(){
         console.log(this)
        let array = this.data.shopInfo.foodList
        for (let index = 0; index < array.length; index++) array[index].num=0
        this.setData({
            totalNum:0,
            totalPrice:0,
            ["shopInfo.foodList"]:array
        })
            
     },
     //增加菜品的时候，输入的图片处理函数
     afterRead(e){
        this.setData({
            ["addFoodObj.ImgUrl"]:e.detail.file.url
        })
     },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.storeBindings = createStoreBindings(this,{
            store,
            fields:["favoriteShop","favoriteShopIDList","myShopIDList","todayFoodOrders","shopList"],
            actions:["updateFavoriteShopIDList","updateShopList","updateTodayFoodOrders"]
        })
        if(options!==undefined){
            if(options.new==="true"){
                //提示用户创建成功  
                wx.showToast({
                  title: '创建成功',
                })
            }
        //当前显示的这家店的对象
        if(options.obj!==undefined){
            let thisShopObj = JSON.parse(options.obj)
            this.setData({
                shopInfo:thisShopObj,
            })
        }
        else if(options.shopId!==undefined){
            this.setData({shopId:options.shopId})
            
        }
        if (options.DeskId!==undefined){
            this.setData({DeskId:options.DeskId})
        }
        
    }
    },
    updateFootNum(e){
        let index = e.currentTarget.dataset.flag//获取食物的索引
        let dir = e.currentTarget.dataset.dir//判断是要增加还是减少
        //得到要修改的那个食物的num的属性名，便于后面修改
        let numName = `shopInfo.foodList[${index}].num`
        let newNum = this.data.shopInfo.foodList[index].num+dir//修改后的num值
        let newtotalPrice = this.data.totalPrice + this.data.shopInfo.foodList[index].price*100*dir
        
        
        if(newNum>=0){//保持食物数量、价格等大于等于0
            let oriShopOrdersList = this.data.shopOrders
            if(dir>0){
                //增加一个食物到订单中
                oriShopOrdersList.push({
                    foodName:this.data.shopInfo.foodList[index].title,
                    index:this.data.shopOrders.length,
                    DeskId:this.data.DeskId,
                    isReady:false
                })
            }
            else{
                //从订单中删除这个食物，并把索引整理一下
                for (let i = 0; i < oriShopOrdersList.length; i++) {
                    if(oriShopOrdersList[i].foodName===this.data.shopInfo.foodList[index].title){
                        oriShopOrdersList.splice(i,1)
                        break
                    }      
                }
                for (let i = 0; i < oriShopOrdersList.length; i++) {
                        oriShopOrdersList[i].index = i
                    }      
                
            }
            

            this.setData({
                [numName]:newNum,
                totalPrice:newtotalPrice,
                totalNum:(this.data.totalNum===''?0:this.data.totalNum)+dir,
                shopOrders:oriShopOrdersList
            })
        }
        
    },
    getMap(e){
        this.getSlamMap()
    },
    onClickButton(){
        let totalPrice = this.data.totalPrice/100
        if(totalPrice===0) return
        let that = this
        wx.showModal({
            title: '提示',
            content: '总计'+String(totalPrice)+"元,确认以支付",
            success (res) {
              if (res.confirm) {
                let array = that.data.todayFoodOrders//这个是所有的店铺的今天订单
                let flag = 0
                for (let index = 0; index < array.length; index++) {
                    if(array[index].id===that.data.shopInfo.id){
                        array.concat(that.data.shopOrders)
                        falg = 1
                        break
                    }
                }
                if(flag===0){
                    array.push({
                        id:that.data.shopInfo.id,
                        orders:that.data.shopOrders
                    })
                }

                //更新所有今日订单
                that.updateTodayFoodOrders(array)
                wx.showToast({
                  title: '支付成功',
                })
                that.clearAllNum()
              } 

            }
          })
          
    },
    subscribe(){
        
        this.setData({
            isLike:!this.data.isLike
        })
        if(this.data.isLike==true){
            
            //拿到我的收藏的店铺的id
            let array = this.data.favoriteShopIDList
            array.push(this.data.shopInfo.id)
            this.updateFavoriteShopIDList(array)
        }
            
        else{
            //原本收藏，然后取消收藏
            let array = this.data.favoriteShopIDList
            for (let index = 0; index < array.length; index++) {
                if(array[index]===this.data.shopInfo.id){
                    array.splice(index,1)
                    break
                }
                
            }
            this.updateFavoriteShopIDList(array)
        }
            
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
        let array = this.data.favoriteShop
        let flag=0
        for (let index = 0; index < array.length; index++) {
            if(array[index].id===this.data.shopInfo.id){
                flag=1
                break
            }       
        }
        if(flag===1) {
            this.setData({
                isLike:true
            })
        }
        else{
            this.setData({
                isLike:false
            })
        }
        if(this.data.shopId!==undefined){
            let array = this.data.shopList
            console.log("进来了")
            for (let index = 0; index < array.length; index++) {
                if(array[index].id===this.data.shopId){
                    console.log('来了')
                    this.setData({
                        shopInfo:array[index],
                    })
                }
                
            }
        }
        this.setData({
             //如果我的店铺的id列表里面有这家店的id，这家店就是我的
            isMyShop:this.data.myShopIDList.indexOf(this.data.shopInfo.id)!==-1?true:false
        })
        
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
        //从厨房返回到店铺页面需要更新店铺信息
        if(this.data.shopList!==undefined){
            let array = this.data.shopList
            console.log(this.data)
            for (let index = 0; index < array.length; index++) {
                if(array[index].id===this.data.shopInfo.id){
                    this.setData({
                        shopInfo:array[index]
                    })
                    break
                }
                
            }
        }
        this.clearAllNum()
        
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
        this.clearAllNum()
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