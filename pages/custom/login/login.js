import Toast from 'tdesign-miniprogram/toast/index';
const api = require('../../../api/index')
const app = getApp();
Page({
    data: {
      checkboxValue: false,
      phoneNumber: "",
      code: "",
      phoneError: false,
      timer: null,
      countdown: 0
    },
    onLoad(options) {
       
    },
    onPhoneInput(e){
      let isPhoneNumber = /^[1][3,4,5,7,8,9][0-9]{9}$/.test(e.detail.value);
      if (isPhoneNumber) {
        this.setData({
          phoneNumber: e.detail.value,
          phoneError: false
        });
      }
      else{
        this.setData({
          phoneNumber: e.detail.value,
          phoneError: true,
        });
      }
    },
    onCodeInput(e){
      this.setData({
        code: e.detail.value
      });
    },
    checkboxBtn(e)
    {
      let lastValue = this.data.checkboxValue;
      this.setData({checkboxValue: !lastValue});
    },
    loginBtn(e){
      if(!this.data.phoneNumber){
        Toast({
          context: this,
          selector: '#t-toast',
          message: '手机号不能为空!',
        });
        return;
      }
      if(!this.data.code){
        Toast({
          context: this,
          selector: '#t-toast',
          message: '短信验证码不能为空!',
        });
        return;
      }
      if(!this.data.checkboxValue){
        Toast({
          context: this,
          selector: '#t-toast',
          message: '请勾选必填项',
        });
        return;
      }
      api.loginByPhone({phone:this.data.phoneNumber, captcha: this.data.code,userType:1}).then(res =>{
        if(res.code == "success"){
          let data = res.data;
          let baseInfo = {
            token: data.token,
            phone: data.phone,
            name: data.name
          }
          app.globalData.baseInfo = baseInfo;
          wx.switchTab({
            url: '/pages/custom/workbenches/workbenches'
          });
        }
        else
        {
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message,
          });
        }
      })
    },
    sendVerificationCode(e){
      console.log(this.data.phoneNumber);
      if(this.data.phoneNumber == ""){
        Toast({
          context: this,
          selector: '#t-toast',
          message: '手机号码不能为空!',
        });
        return;
      }
      if(this.data.phoneError){
        Toast({
          context: this,
          selector: '#t-toast',
          message: '手机号码格式不正确!',
        });
        return;
      }
      this.setData({
        countdown: 60,
        code: ""
      })
      api.getCaptcha({phone: this.data.phoneNumber}).then(res =>{
        if(res.code == "success"){
          this.setData({
            code: res.data?.captcha
          })
        }
        else{
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message,
          });
          return;
        }
      })

      this.countDown();
    },
    getPhone(){
      this.setData({
        phoneNumber: "18172438042"
      })
    },
    countDown(){
      let countdown = this.data.countdown;
      let timer = this.data.timer;
      timer = setTimeout(() =>{
        if(countdown > 0)
        {
          countdown -= 1;
          this.setData({
            timer: timer,
            countdown: countdown
          })
          this.countDown();
        }
        else{
          this.setData({
            timer: null,
          })
        }
      },1000)
    },
    onShareAppMessage() {
      return{
        title:"MT技工服务",
        path:"/pages/custom/login/login",
        imageUrl:"/assets/userinfo.png"//转发展示的图片
      }
    },
});
