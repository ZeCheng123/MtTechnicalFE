import Toast from 'tdesign-miniprogram/toast/index';
const api = require('../../../api/index')
const app = getApp();

Page({
    data: {
      checkboxValue: false,
      btnColor: '#bbd3fb', // 初始按钮颜色
      isTrue:false,
      isPhone:false,
      dynamicCode: "",
      code: ""
    },
    onLoad(options) {

    },
    //勾选协议
    checkboxBtn(e)
    {
      var that = this;
      let lastValue = this.data.checkboxValue;
      if(!lastValue){
        that.authorizedLogin()
      }else{
        that.setData({
          isTrue:false
        })
      }
      this.setData({
        checkboxValue: !lastValue,
        btnColor: !lastValue ? '#007bff' : '#bbd3fb', // 改变按钮颜色
      });
    },
    authorizedLogin(){
      var that = this;
      wx.login({
        success: (res) => {
          const code = res.code;
          api.postWechat({"code": code,"userType": 1}).then(res => {
            if(res?.code === "success"){
              wx.setStorageSync('UserName', res);
              if (res && res.data && res.data?.token){
                app.globalData.baseInfo.token = res.data?.token;
                wx.setStorage({
                  key:"token",
                  data: res?.token
                })
              }else{
                that.setData({
                  isTrue:true,
                  isPhone:true
                })
              }
            }else{
              wx.showToast({
                title: '登录失败:'+res?.message,
                icon:'none'
              })
            }
          });
        },
      }) 
    },
    getPhoneNumber(e){
      // console.log("动态令牌",e.detail)  // 动态令牌
      if (e.detail.errMsg.includes("deny")){
        wx.showToast({
          title: '获取电话号码失败，请授权',
          icon: 'none',
          duration:2000
        });
      } else {
        // 用户授权提供电话号码，可以在这里处理获取到的电话号码
        // console.log("Phone number obtained:", e.detail);
        wx.login({
          success: (res) => {
            const code = res.code;
            this.setData(
              {
                dynamicCode: e.detail.code,
                code: code
              })
            this.postWechat()
          },
        })  
      }  
    },
    postWechat(){
      api.postWechat({"code": this.data.code,"userType": 1}).then(res => {
        if(res?.code === "success"){
          // console.log("ressss",res)
          wx.setStorageSync('UserName', res);
          if (res && res.data && res.data?.token){
            app.globalData.baseInfo.token = res.data?.token;
            wx.setStorage({
              key:"token",
              data: res?.token
            })
            wx.switchTab({
              url: '/pages/custom/workbenches/workbenches'
            });
          }else{
            // console.log("this.data.dynamicCode",this.data.dynamicCode)
            api.postPhoneValidate({
              "code": this.data.dynamicCode,
              "unionid": res.data?.unionid ? res.data?.unionid : "",
              "openid": res.data?.openid ? res.data?.openid : "",
              "userType": 1
            }).then(res => {
              // console.log("postPhoneValidate",res)
              if(res?.code === "success"){
                app.globalData.baseInfo.token = res.data?.token;
                wx.setStorage({
                  key:"token",
                  data: res.data?.token
                })
                wx.switchTab({
                  url: '/pages/custom/workbenches/workbenches'
                });
              }else{
                wx.showToast({
                  title: '登录失败:'+res?.message,
                  icon:'none'
                })
              }
            })
          }
        }else{
          wx.showToast({
            title: '登录失败:'+res?.message,
            icon:'none'
          })
        }
      });
    },
   //获取头像+名称方法
   getUserProfile(e) {
    var that = this;
    if (this.data.checkboxValue) {
      const storedUserInfo = wx.getStorageSync('userInfo');
      if(storedUserInfo){
        console.log("本地已存在用户信息，不需要再次获取。");
        this.setData({
          userInfo: storedUserInfo,
          hasUserInfo: true,
          // PhoneNumber:"getPhoneNumber"
        });
      } else{
        wx.getUserProfile({
          desc: '获取你的昵称、头像、地区及性别', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
          success: (res) => {
            // console.log("res",res)
            this.setData({
              userInfo: res.userInfo,
              hasUserInfo: true,
            });
            wx.setStorageSync('userInfo', res.userInfo);
          }
        })
      } 
      if(!that.isPhone){
        wx.switchTab({
          url: '/pages/custom/workbenches/workbenches'
        });
      }
    } else {
      // 在需要弹出提示框的地方调用该方法
      wx.showToast({
        title: '请先勾选同意条例',
        icon: 'none', // 提示框图标，可选值：'success', 'loading', 'none'
        duration: 2000 // 提示框持续时间，单位为毫秒
      });
      // console.log('请先勾选同意条例');
    }
  }
});
