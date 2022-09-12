// component/My/My.js
import {storeBindingsBehavior} from 'mobx-miniprogram-bindings'
import {store} from '../../store/store'
Component({
    behaviors:[storeBindingsBehavior],
    storeBindings:{
        store,
        fields:{
            userInfo:"userInfo",
            MyPageButtonType:"MyPageButtonType",
            client:"client",
            WechatNeedMyShopList:"WechatNeedMyShopList",
            WechatNeedFavoriteShopList:"WechatNeedFavoriteShopList",
            PubTopic:"PubTopic",
        },
        actions:{
            updateUserInfo:'updateUserInfo',
            updateLoginState:"updateLoginState"
        }
    },
    /**
     * 组件的属性列表
     */
    properties: {

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
        getUserProfile(e){
            wx.getUserProfile({
                desc: '授权登录',
                success: (res) => {
                    this.updateUserInfo({
                        nickName:res.userInfo.nickName,
                        encryptedData:res.encryptedData,
                        iv:res.iv,
                        rawData:res.rawData,
                        signature:res.signature
                    })
                    //需要请求得到我的店铺和我收藏的店铺
                    this.data.client.publish(this.data.PubTopic.WechatNeedMyShopList,"0")
                    this.data.client.publish(this.data.PubTopic.WechatNeedFavoriteShopList,"0")
                    this.updateLoginState(true)
                    wx.showToast({
                      title: '登录成功',
                    })
                },
                fail:()=>{
                    wx.showToast({
                      title: '已取消授权',
                    })
                }
              })
            new Promise((resolve)=>{
                wx.login({
                  success:(res)=>{
                    this.updateUserInfo({
                        code:res.code     
                    })
                  }
                })
            })
        }
        
    }
})
