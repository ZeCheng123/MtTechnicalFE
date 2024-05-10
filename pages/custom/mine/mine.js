Page({
    data: {
      avatarUrl:"/assets/userinfo.png"
    },
    onLoad(options) {
      
    },
        /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      const storedUserInfo = wx.getStorageSync('userInfo');
      this.setData({
        avatarUrl:storedUserInfo.avatarUrl
      })
    },
    toMyJobOrder()
    {
      console.log("跳转。。。");
      wx.switchTab({
        url: '/pages/custom/joborder/joborder' // 目标页面的路径
      });
    },
    toMyAccount()
    {
      console.log("跳转。。。");
      wx.navigateTo({
        url: '/pages/custom/my_account/my_account' // 目标页面的路径
      })
    },
    toMyAuthentication()
    {
      console.log("跳转。。。");
      wx.navigateTo({
        url: '/pages/custom/my_authentication/my_authentication' // 目标页面的路径
      })
    }

});
