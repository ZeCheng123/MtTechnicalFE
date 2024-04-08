// pages/custom/share_service_evaluation.js
import drawQrcode from '../../../utils/weapp.qrcode.esm.js';
import Toast from 'tdesign-miniprogram/toast/index';
Page({

    /**
     * 页面的初始数据
     */
    data: {
      qrcodeUrl:"",
      qrcodeText:"https://fsc-sandbox.txscrm.com/TJWKKZIXHHF"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },



    showContextMenu(){
      var that = this;
      wx.showActionSheet({
        itemList: ['识别二维码'],
        success: function (res) {
          if (!res.cancel && res.tapIndex === 0) {
            Toast({
              context: that,
              selector: '#t-toast',
              message: '识别二维码中...',
              duration: 500
            });
            setTimeout(() => {
              wx.navigateTo({
                url: '/pages/custom/web_view/web_view?url=' + that.data.qrcodeText,
              });
            }, 500);

          }
        }
      });
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      var that = this;
      const query = wx.createSelectorQuery();
      query.select('#myQrcode')
        .fields({
            node: true,
            size: true
        })
        .exec((res) => {
            var canvas = res[0].node
            // 调用方法drawQrcode生成二维码
            drawQrcode({
                canvas: canvas,
                canvasId: 'myQrcode',
                width: 160,
                padding: 6,
                background: '#ffffff',
                foreground: '#298ACC',
                text: that.data.qrcodeText,
            })
    
            // 获取临时路径（得到之后，想干嘛就干嘛了）
            wx.canvasToTempFilePath({
                canvasId: 'myQrcode',
                canvas: canvas,
                x: 0,
                y: 0,
                width: 160,
                height: 160,
                destWidth: 160,
                destHeight: 160,
                success(res) {
                    that.setData({
                      qrcodeUrl:  res.tempFilePath
                    })
                    console.log('二维码临时路径：', res.tempFilePath)
                },
                fail(res) {
                    console.error(res)
                }
            })
      })
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

    },

})