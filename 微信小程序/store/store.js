//专门创建store对象
import {observable,action} from 'mobx-miniprogram'

export const store = observable({
    uid:"0c90e6e868154d44b6b3df9e90b24543",
    // uid:"b63e4480f3604a25b3a73e05e17b3639",
    SubTopic:{
        EspSendShopList: "6",
        EspSendMyShopList: "7",
        EspSendFavoriteShopList: "8",
        RPiSendSlamMapUrl:"a",
        RPiWantPoint:"c"
    },
    PubTopic:{
        WechatNeedShopList:"0",
        WechatNeedMyShopList:"1",
        WechatNeedFavoriteShopList:"2",
        WechatUpdateShopList:"3",
        WechatUpdateMyShopList:"4",
        WechatUpdateFavoriteShopList:"5",
        WechatNeedSlamMapUrl:"9",
        WechatSendPoint:"b"//小程序发送地图坐标
    },
    islogin:false,
    userInfo:{
        nickName:"",
        code:undefined,
        encryptedData:undefined,
        iv:undefined,
        rawData:undefined,
        signature:undefined
    }, 
    nowInKitchen:{},
    client:null,//用于发布话题
    myShop:[],//我的店铺
    favoriteShop:[],//我收藏的店铺
    shopList:[],//总的店铺
    myShopIDList:[],
    favoriteShopIDList:[],
    AllMyShopID:[],
    AllFavoriteShopID:[],
    AllShopSlamMapList:[],//[{id:1,url:"..."},{}]
    MyPageButtonType:"primary",
    todayFoodOrders:[
    ],
    kitchenPoint:{
        x:null,
        y:null
    },
    updateMyShopIDList:action(function(List,updateAll=true){
        
        //不管是创建还是删除，都要先更新所有店铺，然后再更新我的店铺
        //更新存放我的店铺ID的列表中
        this.myShopIDList = List //[1,2,3,4]
        let array = this.shopList//[{},{}]
        let myShop = []
        
        for (let index = 0; index < array.length; index++) {
            if(List.indexOf(array[index].id)!==-1){
                myShop.push(array[index])
            }
        }
        //更新存放我的店铺完整对象的列表
        this.setMyShop(myShop)
        //更新存放所有人的我的店铺的id的列表
        if(updateAll){
            let array1 = this.AllMyShopID
            for (let index = 0; index < array1.length; index++) {
                if(array1[index].nickName===this.userInfo.nickName){
                    this.AllMyShopID[index].id = List
                    this.sendToEsp8266(this.PubTopic.WechatUpdateMyShopList,JSON.stringify(this.AllMyShopID))
                    console.log("以",this.PubTopic.WechatUpdateMyShopList,"话题发送了",JSON.stringify(this.AllMyShopID))
                    return
                }
            }
            //如果走到这里表示，列表里面还没有这个人，就要自己添加
            let myShopIdObj = {nickName:this.userInfo.nickName,id:List}
            this.AllMyShopID.push(myShopIdObj)
            this.sendToEsp8266(this.PubTopic.WechatUpdateMyShopList,JSON.stringify(this.AllMyShopID))
            console.log("以",this.PubTopic.WechatUpdateMyShopList,"话题发送了",JSON.stringify(this.AllMyShopID))
        }
    }),
    updateFavoriteShopIDList:action(function(List,updateAll=true){
        this.favoriteShopIDList = List
        let array = this.shopList//[{},{}]
        let favoriteShop = []
        for (let index = 0; index < array.length; index++) {
            if(List.indexOf(array[index].id)!==-1){
                favoriteShop.push(array[index])
                
            }
        }
        this.setFavoriteShop(favoriteShop)
        if(updateAll){
        let array1 = this.AllFavoriteShopID
        for (let index = 0; index < array1.length; index++) {
            if(array1[index].nickName===this.userInfo.nickName){
                this.AllFavoriteShopID[index].id = List
                this.sendToEsp8266(this.PubTopic.WechatUpdateFavoriteShopList,JSON.stringify(this.AllFavoriteShopID))
                console.log("以",this.PubTopic.WechatUpdateFavoriteShopList,"话题发送了",JSON.stringify(this.AllFavoriteShopID))
                return
            }
        }
            //如果走到这里表示，列表里面还没有这个人，就要自己添加
        let favoriteShopIdObj = {nickName:this.userInfo.nickName,id:List}
        this.AllFavoriteShopID.push(favoriteShopIdObj)
        this.sendToEsp8266(this.PubTopic.WechatUpdateFavoriteShopList,JSON.stringify(this.AllFavoriteShopID))
        console.log("以",this.PubTopic.WechatUpdateFavoriteShopList,"话题发送了",JSON.stringify(this.AllFavoriteShopID))
    }

    }),
    updateAllMyShopID:action(function(List){
        this.AllMyShopID = List//[{nickName:"tomoya",id:[1,2,3]},{}]
        for (let index = 0; index < List.length; index++) {
            if(List[index].nickName===this.userInfo.nickName){
                this.updateMyShopIDList(List[index].id,false)
            }       
        }
    }),
    updateAllFavoriteShopID:action(function(List){
        this.AllFavoriteShopID = List
        for (let index = 0; index < List.length; index++) {
            if(List[index].nickName===this.userInfo.nickName){
                this.updateFavoriteShopIDList(List[index].id,false)
            }       
        }
    }),
    setClient:action(function(newClient){
        this.client = newClient
    }),
    updateUserInfo:action(function(obj){
        this.userInfo = Object.assign(this.userInfo,obj)
    }),
    updateLoginState:action(function(newstate){
        this.islogin = newstate
    }),
    updateMyPageButtonType:action(function(newType){
        this.MyPageButtonType = newType
    }),
    updateShopList:action(function(obj,del=false,delId=undefined){
        //[{id:"",...,foodList:[...]},{},{}]
        if(del){
            for (let index = 0; index < this.shopList.length; index++) {
                if(this.shopList[index].id===delId){
                    this.shopList.splice(index,1)
                    break
                }
                    
            }
        }
        else{
            this.shopList.push(obj)
        }
        this.sendToEsp8266(this.PubTopic.WechatUpdateShopList,JSON.stringify(this.shopList))
        console.log("以",this.PubTopic.WechatUpdateShopList,"话题发送了",JSON.stringify(this.shopList))
    }),
    setMyShop:action(function(newList){
        this.myShop = newList
    }),
    setFavoriteShop:action(function(newList){
        this.favoriteShop = newList
    }),
    setShopList:action(function(newList,update=false){
        this.shopList = newList
        if(update){
            this.sendToEsp8266(this.PubTopic.WechatUpdateShopList,JSON.stringify(newList))
            console.log("以",this.PubTopic.WechatUpdateShopList,"话题发送了",JSON.stringify(newList))
        }
    }),
    deleteAllFavo:action(function(id){
        //如果是删除了我的店铺，那么收藏会被一起删除，但是其他人收藏了你的店铺，他们的也应该被是删除
        //这个函数就是通过传进来要被删除的店铺id，然后把其所有这个id的收藏店铺删掉
        let array = this.AllFavoriteShopID
        for (let index = 0; index < array.length; index++) {
            if(array[index].id.indexOf(id)!==-1){
                array[index].id.splice(index,1)
            } 
        }
    }),
    sendToEsp8266:action(function(topic,AllContent){
        if(AllContent.length===0) return
        let lengthOfStr = 250//每个子串长度
        let batchNum = Math.ceil(AllContent.length/lengthOfStr)
        let start = 0
        //起始标志
        this.client.publish(topic,"beginSend")
        for (let index = 0; index < batchNum-1; index++) {
            this.client.publish(topic,AllContent.slice(start,start+lengthOfStr))
            start += lengthOfStr
        }
        this.client.publish(topic,AllContent.slice(start))
        //终止标志
        this.client.publish(topic,"endSend")
    }),
    getSlamMap:action(function(shopId){
        //发布话题跟esp8266说我要地图，然后esp8266通过驱动板让树莓派把地图用request库直接发送过来
        this.client.publish(this.PubTopic.WechatNeedSlamMapUrl,shopId)
        console.log("以",this.PubTopic.WechatNeedSlamMapUrl,"话题发送了",shopId)
        
    }),
    updateTodayFoodOrders:action(function(newList){
        this.todayFoodOrders = newList
    }),
    updateAllShopMapUrl:action(function(obj){
        let array = this.shopList
        for (let index = 0; index < array.length; index++) {
            if(array[index].id===obj.id){
                array[index].slamMapImgUrl = obj.slamMapImgUrl
                array[index].flagMsgObj = {desk:[],kitchen:[]}
                this.setShopList(array)
                this.updateNowInKitchen(array[index])
                break
            }
            
        }
    }),
    updateNowInKitchen:action(function(obj,update=true){
        this.nowInKitchen = obj
        if(update){
            let array = this.shopList
                for (let index = 0; index < array.length; index++) {
                    if(array[index].id===obj.id){
                        if(JSON.stringify({...array[index],...obj})===JSON.stringify(array[index])) return //如果没有变化，就不上传
                        array[index] = obj
                        this.setShopList(array,true)
                        break
                    }   
                }
        }
        
    }),
    sendPoint:action(function(msg){
        //这里的x和y都必须是计算好的
        this.client.publish(this.PubTopic.WechatSendPoint,msg)
    }),
    updateKitchenPoint:action(function(obj){
        this.kitchenPoint = obj
    })
    
})