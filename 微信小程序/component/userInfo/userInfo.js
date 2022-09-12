// component/userInfo/userInfo.js
import {storeBindingsBehavior} from 'mobx-miniprogram-bindings'
import {store} from '../../store/store'
Component({
    behaviors:[storeBindingsBehavior],
    storeBindings:{
        store,
        fields:{
            userInfo:"userInfo"
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
        logout(){
            var that = this
            wx.showModal({
                title: '提示',
                content: '确定退出登录吗？',
                success (res) {
                  if (res.confirm) {
                    that.updateLoginState(false)
                    that.updateUserInfo({
                        nickName:"",
                        code:undefined,
                        encryptedData:undefined,
                        iv:undefined,
                        rawData:undefined,
                        signature:undefined
                    })
                    wx.showToast({
                      title: '退出成功',
                    })
                    
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
            
        },
        inSubscribeShop(){
            wx.navigateTo({
              url: '/pages/subscribeShop/subscribeShop',
            })
        },
        inMyShop(){
            wx.navigateTo({
                url: '/pages/myShop/myShop',
              })
        }
    }
})
