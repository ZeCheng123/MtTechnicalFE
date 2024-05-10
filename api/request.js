import { baseUrl } from './http.js';
const app = getApp();
module.exports = {
  request : function(url, methodType, data){
    let fullUrl = `${baseUrl}${url}`
    let token = app?.globalData?.baseInfo?.token;
    console.log(token);
    //(wx.showLoading)显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
    wx.showLoading({ title: ""  });
    return new Promise((resolve,reject)=>{
      wx.request({
        url: fullUrl,    
        data: data,
        method: methodType,
        header: {
          'Authorization': token, 
          // 'Content-Type': 'application/json'
        },
        success(res){
          if (res.statusCode == 200) {
            if(res?.data?.code == "invalid_token"){
              wx.navigateTo({
                url: '/pages/custom/login2/login',
              })
            }
            resolve(res.data)
            wx.hideLoading()
          }else{
          //手动关闭loading提示框
            wx.hideLoading()
            wx.showToast({
              title: res.data.msg,
              icon:'none'
            })
            reject(res.data.message)
          }
        },
        fail(){
          wx.showToast({
            title: '接口请求错误',
            icon:'none'
          })
          reject('接口请求错误')
        }
      })
    })
  }
}
