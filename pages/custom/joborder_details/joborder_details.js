// pages/custom/joborder/joborder.js
import drawQrcode from '../../../utils/weapp.qrcode.esm.js';
import Toast from 'tdesign-miniprogram/toast/index';
const app = getApp();
const api = require('../../../api/index');
import { baseUrl } from '../../../api/http.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
      step1_icon: "../../../assets/step1.png",
      step1_1_icon: "../../../assets/step1_1.png",
      step2_icon: "../../../assets/step2.png",
      step2_2_icon: "../../../assets/step2_2.png",
      step3_icon: "../../../assets/step3.png",
      step3_3_icon: "../../../assets/step3_3.png",
      showSignIn: false,
      showComment: false,
      showServiceEvaluation: false,
      originFiles1: [],
      originFiles2: [],
      originFiles3: [],
      originFiles4: [],
      originFiles5: [],
      type: 1,
      gridConfig: {
        column: 4,
        width: 92,
        height: 92,
      },
      location: {
        latitude: 40.040415,
        longitude: 116.273511,
        address: "",
        district: "",
        markerLongitude: 0,
        markerLatitude: 0,
        markerX: 0,
        markerY: 0
      },
      marker: {
        id: new Date().getTime(),
        width: 30,
        height: 30,
        iconPath: "/assets/marker.png",
        title: "",
        longitude: "",
        latitude: ""
      },
      currentItem: {
      },
      app: getApp(),
      timer: null,
      text: "",
      commentList: [],
      qrcodeUrl:"",
      qrcodeText:"https://fsc-sandbox.txscrm.com/TJWKKZIXHHF"
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(option) {
      let id = option.id;
      var that = this;
      that.getJobItem(id);
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const { latitude, longitude } = res;
          // 调用逆地理编码接口，将经纬度转换为地点信息
          wx.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/',
            data: {
              location: `${latitude},${longitude}`,
              key: that.data.app.globalData.mapKey, // 替换为您自己的腾讯地图API密钥
              get_poi: 1 // 请求返回附近的 POI 信息
            },
            success(resp) {
              let address = resp?.data?.result?.address || "";
              if(resp.data && resp.data.result && resp.data.result.pois && resp.data.result.pois.length > 0)
              {
                address = resp.data.result.pois[0]["address"];
              }
              let district = resp?.data?.result?.address_component?.city + resp?.data?.result?.address_component?.district;
              that.setData({
                location: {
                  latitude: latitude,
                  longitude: longitude,
                  address: address,
                  district: district || "",
                  markerLongitude: longitude,
                  markerLatitude: latitude,
                },
                "marker.latitude": latitude,
                "marker.longitude": longitude,
                "marker.title": address
              });
            },
            fail(err) {
              Toast({
                context: this,
                selector: '#t-toast',
                message: err?.errMsg || "地址解析错误!",
              });
              console.error('逆地理编码失败', err);
            }
          });
        }
      });    
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {
      
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {
      this.startTimer();
      this.conversionDate();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {
      this.setData({
        timer: null
      })
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
      console.log("分享");
      return{
        title:"服务评价",
        path:"/pages/custom/share_service_evaluation/share_service_evaluation",
        imageUrl:"/assets/userinfo.png"//转发展示的图片
      }
    },

    reportProblem(){
      wx.navigateTo({
        url: '/pages/custom/report_problem/report_problem?item=' + JSON.stringify(this.data.currentItem) // 跳转到非 TabBar 页面的路径
      });   
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


    onStepChange(e) {
      this.setData({ "currentItem.status": e.detail.current });
    },

    showSignInDialog() {
      this.setData({ showSignIn: true });  
    },

    showServiceEvaluationDialog(){
      var that = this;
      that.setData({ showServiceEvaluation: true});
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
                width: 142,
                padding: 6,
                background: '#ffffff',
                foreground: '#298ACC',
                text: '123456',
            })
    
            // 获取临时路径（得到之后，想干嘛就干嘛了）
            wx.canvasToTempFilePath({
                canvasId: 'myQrcode',
                canvas: canvas,
                x: 0,
                y: 0,
                width: 142,
                height: 142,
                destWidth: 142,
                destHeight: 142,
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

    closeSignInDialog() {
      console.log("取消");
      this.setData({ showSignIn: false });
    },

    confirmSignInDialog() {
      console.log("签到");
      var that = this;
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const { latitude, longitude } = res;
          // 调用逆地理编码接口，将经纬度转换为地点信息
          wx.request({
            url: 'https://apis.map.qq.com/ws/geocoder/v1/',
            data: {
              location: `${latitude},${longitude}`,
              key: that.data.app.globalData.mapKey, // 替换为您自己的腾讯地图API密钥
              get_poi: 1 // 请求返回附近的 POI 信息
            },
            success(resp) {
              let address = resp?.data?.result?.address || "";
              if(resp.data && resp.data.result && resp.data.result.pois && resp.data.result.pois.length > 0)
              {
                address = resp.data.result.pois[0]["address"];
              }
              let district = resp?.data?.result?.address_component?.city + resp?.data?.result?.address_component?.district;
              that.setData({
                location: {
                  latitude: latitude,
                  longitude: longitude,
                  address: address,
                  district: district || "",
                  markerLongitude: longitude,
                  markerLatitude: latitude,
                },
                "marker.latitude": latitude,
                "marker.longitude": longitude,
                "marker.title": address
              });
            },
            fail(err) {
              Toast({
                context: this,
                selector: '#t-toast',
                message: err?.errMsg || "地址解析错误!",
              });
              console.error('逆地理编码失败', err);
            }
          });
        }
      }); 
      var locationGps=this.data.location.latitude+","+this.data.location.longitude;
      console.log(locationGps);
      this.setData({ showSignIn: false, "currentItem.status": 1 ,"currentItem.location":locationGps});
      this.updateOrder();
    },

    finish(){
      this.setData({"currentItem.status": 2 });
      this.updateOrder();
    },

    updateOrder(){
      let item = this.data.currentItem;
      // 传此字段会导致程序报错,暂时移除
      delete item["whetherEvaluation"];
      api.updateJobItem(item).then(res =>{
        if(res.code == "success")
        {
          console.log("更新成功!");
        }
        else{
          console.log("更新失败!");
        }
      })
    },

    confirmshowServiceEvaluationDialog(){
      this.setData({ showServiceEvaluation: false});
    },

    closeshowServiceEvaluationDialog(){
      this.setData({ showServiceEvaluation: false});
    },

    handleSuccess1(e) {
      var that = this;
      let  files  = e.detail;
      that.setData({
        originFiles1: files,
      });
      // wx.uploadFile({
      //   url: baseUrl + '/md/api/common/file/upload', // 仅为示例，非真实的接口地址
      //   filePath: e.detail.files[0]["url"], // that.data.originFiles1[0].url,
      //   name:  e.detail.files[0]["name"], //that.data.originFiles1[0].name,
      //   formData: {
      //     isImage: "true",
      //     needFileId: "true"
      //   },
      //   success: (res) => {
      //     console.log(res)
      //   },
      //   fail: (err) =>{
      //     Toast({
      //       context: this,
      //       selector: '#t-toast',
      //       message: err?.errMsg,
      //     });
      //   }
      // });
    },
    handleRemove1(e) {
      let index  = e.detail;
      let originFiles = this.data.originFiles1;
      originFiles.splice(index, 1);
      this.setData({
        originFiles1: originFiles,
      });
    },
    handleClick1(e) {
      console.log(e.detail.file);
    },

    handleSuccess2(e) {
      const { files } = e.detail;
      this.setData({
        originFiles2: files,
      });
    },
    handleRemove2(e) {
      let index  = e.detail;
      let originFiles = this.data.originFiles2;
      originFiles.splice(index, 1);
      this.setData({
        originFiles2: originFiles,
      });
    },
    handleClick2(e) {
      console.log(e.detail.file);
    },

    handleSuccess3(e) {
      const { files } = e.detail;
      this.setData({
        originFiles3: files,
      });
    },
    handleRemove3(e) {
      let index  = e.detail;
      let originFiles = this.data.originFiles3;
      originFiles.splice(index, 1);
      this.setData({
        originFiles3: originFiles,
      });
    },
    handleClick3(e) {
      console.log(e.detail.file);
    },

    handleSuccess4(e) {
      const { files } = e.detail;
      this.setData({
        originFiles4: files,
      });
    },
    handleRemove4(e) {
      let index  = e.detail;
      let originFiles = this.data.originFiles4;
      originFiles.splice(index, 1);
      this.setData({
        originFiles4: originFiles,
      });
    },
    handleClick4(e) {
      console.log(e.detail.file);
    },

    handleSuccess5(e) {
      const { files } = e.detail;
      this.setData({
        originFiles5: files,
      });
    },
    handleRemove5(e) {
      let index  = e.detail;
      let originFiles = this.data.originFiles5;
      originFiles.splice(index, 1);
      this.setData({
        originFiles5: originFiles,
      });
    },
    handleClick5(e) {
      console.log(e.detail.file);
    },

    showCommentDialog(){
      this.setData({ showComment: true });
    },

    handleCommentChange(e){
      this.setData({ text: e.detail.value});
    },

    confirmshowCommentDialog(e){
      if(this.data.text == "")
      {
        Toast({
          context: this,
          selector: '#t-toast',
          message: "评论不能为空!",
        });
      }
      else
      {
        let list = this.data.commentList;
        list.push({
          userName: this.data.currentItem["postName"] + "-" + this.data.currentItem["userName"],
          text: this.data.text,
          date: new Date().toLocaleString()
        });
        this.setData({ showComment: false, commentList: list  });
      }

    },

    closeshowCommentDialog(e){
      this.setData({ showComment: false });
    },

    startTimer(){
      this.data.timer = setTimeout(() =>{
        this.conversionDate();
        this.startTimer();
      },5000)
    },
    conversionDate()
    {
        let date = this.data.currentItem["appointmentStartTime"];
        let dateObj = {
          days: 0,
          hours: 0,
          minutes: 0
        }
        if(date){
          dateObj = this.formatDate(date)
        }
        this.setData({
          "currentItem.dateObj": dateObj
        }); 
    },

    formatDate(date){
      const currentDate = new Date();
      const specifiedDate = new Date(date);
      const timeDifference = specifiedDate.getTime() - currentDate.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      const hoursDifference = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutesDifference = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
      return {
        days: daysDifference > 0 ? (daysDifference > 9 ? daysDifference : ("0" + daysDifference)) : 0,
        hours: hoursDifference > 0 ? (hoursDifference > 9 ? hoursDifference : ("0" + hoursDifference)) : 0,
        minutes: minutesDifference > 0 ? (minutesDifference > 9 ? minutesDifference : ("0" + minutesDifference)) : 0,
      }
    },

    getJobItem(id){
      let param = {
        "id": id,
        "neoid": "",
      }
      api.getJobItem(param).then(res =>{
        if(res.code == "success"){
          let item = res.data || {};
          this.setData({
            currentItem: item,
          });
          console.log(item);
        }
        else
        {
          this.setData({
            currentItem: {},
          })
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message,
          });
        }
      })
    },

    updateJobItem(item){
      api.updateJobItem(item).then(res =>{
        if(res.code == "success"){
          console.log(res);
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
    }

})