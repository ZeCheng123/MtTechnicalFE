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

      goodsPictureList: [], //货物  （配送）
      docPictureList: [], //安装示意图、辅料  （配送）
      checkInPictureList: [], //安装前打卡 （安装）
      scenePictureList: [], //安装前墙面保护 （安装）
      afterInstallPictureList: [], //安装完成 （安装）
      afterInstallScenePictureList: [], //安装完成 现场环境 （安装）
      completeBeforePictureList: [], //维修前 （维修）
      completePictureList: [],  //维修完成  （维修）

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
      LocationList:{
        province:"",
        city:"",
        district:"",
        address:""
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
      qrcodeText:"https://fsc-sandbox.txscrm.com/TCVFQF2ZTF5?",
      wxQrCodeText:"https://fsc-sandbox.txscrm.com/TBYGQNY7RGK?",
      isFoucsTextArea: false,
      showImage: false,
      previewList: [],
      previewUrl: "https://sh.mengtian.com.cn:9595/md/api/common/file/direct-download?fileId=",
      orderNo: "",
      currentCaseItem: null,
      orderList: [],
      caseItemList: [],
      showOrderList: false,
      showServiceCase: false,
      showWarnConfirm: false,
      orderId:"",
      orderNeoId:"",
      mergedOrderId:[],
      showInvestigation:false
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(option) {
      let id = option.id;
      var that = this;
      that.getJobItem(id);
      // if(that.data.currentItem!=undefined && that.data.currentItem["fieldJobOrderId"]!=undefined){
      //   this.getOrderById(id)
      // }
      // this.getOrderById(id);
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
              console.log("dingwei:",resp)
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
                LocationList:{
                  province:resp?.data?.result?.address_component?.province,
                  city:resp?.data?.result?.address_component?.city,
                  district:resp?.data?.result?.address_component?.district,
                  address:resp?.data?.result?.address_component?.street_number,
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
      return{
        title:"服务评价",
        path:this.data.currentItem["fieldJobType__c"]!="2"?"/pages/custom/share_service_evaluation/share_service_evaluation?qrcodeText=" + this.data.qrcodeText+"dpR="+this.data.currentItem["neoId"]:"/pages/custom/share_service_evaluation/share_service_evaluation?qrcodeText=" + this.data.wxQrCodeText+"dpR="+this.data.currentItem["neoId"],
        imageUrl:"/assets/share.jpg"//转发展示的图片
      }
    },

    reportProblem(){
      let itemStr = JSON.stringify(this.data.currentItem);
      let item=JSON.parse(itemStr)
      item["orderNo"] = this.data.orderNo;
      item["orderId"] = this.data.orderId;
      item["orderNeoId"]=this.data.orderNeoId;
      item["LocationList"] = this.data.LocationList
      item["fscShortConnection"]=""
      wx.navigateTo({
        url: '/pages/custom/report_problem/report_problem?item=' + JSON.stringify(item) // 跳转到非 TabBar 页面的路径
      });   
    },

    showContextMenu(){
      var that = this;
      wx.showActionSheet({
        itemList: ['保存二维码'],
        success: function (res) {
          if (!res.cancel && res.tapIndex === 0) {
            // Toast({
            //   context: that,
            //   selector: '#t-toast',
            //   message: '识别二维码中...',
            //   duration: 500
            // });
            // setTimeout(() => {
            //   wx.navigateTo({
            //     url: '/pages/custom/web_view/web_view?url=' + that.data.qrcodeText,
            //   });
            // }, 500);
            wx.saveImageToPhotosAlbum({
              filePath: that.data.qrcodeUrl,
              success: function (res) {
                wx.showToast({
                  title: '保存成功',
                  icon: 'success',
                  duration: 2000
                });
              },
              fail: function (res) {
                wx.showToast({
                  title: '保存失败',
                  icon: 'none',
                  duration: 2000
                });
              }
            });
          }
        }
      });
    },

    onStepChange(e) {
      this.setData({ "currentItem.stage__c": e.detail.current });
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
                text: this.data.currentItem["fieldJobType__c"]=="2"? that.data.wxQrCodeText+"dpR="+this.data.currentItem["neoId"]:that.data.qrcodeText+"dpR="+this.data.currentItem["neoId"],
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
                },
                fail(res) {
                    console.error(res)
                }
            })
        })
    },

    closeSignInDialog() {
      this.setData({ showSignIn: false });
    },

    confirmSignInDialog() {
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
      this.setData({ showSignIn: false, "currentItem.stage__c": 1 ,"currentItem.location":locationGps,"currentItem.status":2});
      this.updateOrder(0);
    },

    async finish(){
      this.setData({
        showWarnConfirm: true
      });
      // //配送派工
      // if(this.data.currentItem["fieldJobType__c"] == "0")
      // {
      //   if(this.data.goodsPictureList.length == 0){
      //     wx.showToast({
      //       title: '请上传货物照片!',
      //       icon: 'none',
      //       duration: 2000
      //     });
      //     return;
      //   }
      //   else
      //   {
      //     wx.showLoading({ title: ""  });
      //     let goodsPictureList = this.data.goodsPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     let docPictureList = this.data.docPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     this.setData({
      //       "currentItem.goodsPicture": goodsPictureList,
      //       "currentItem.docPicture": docPictureList,
      //       "currentItem.stage__c": 2,
      //       "currentItem.status": 2
      //     })
      //     this.updateOrder(1)
      //   }
      // }
      // //安装派工
      // else if(this.data.currentItem["fieldJobType__c"] == "1"){
      //   if(this.data.checkInPictureList.length == 0 || this.data.scenePictureList.length == 0 || this.data.afterInstallPictureList.length == 0 || this.data.afterInstallScenePictureList.length == 0){
      //     wx.showToast({
      //       title: '请上传相关照片!',
      //       icon: 'none',
      //       duration: 2000
      //     });
      //     return;
      //   }
      //   else{
      //     wx.showLoading({ title: ""  });
      //     let checkInPictureList = this.data.checkInPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     let scenePictureList = this.data.scenePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     let afterInstallPictureList = this.data.afterInstallPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     let afterInstallScenePictureList = this.data.afterInstallScenePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     this.setData({
      //       "currentItem.checkInPicture": checkInPictureList, 
      //       "currentItem.scenePicture": scenePictureList,
      //       "currentItem.afterInstallPicture": afterInstallPictureList,
      //       "currentItem.afterInstallScenePicture": afterInstallScenePictureList,  //字段待确定
      //       "currentItem.stage__c": 2,
      //       "currentItem.status": 2
      //     })
      //     this.updateOrder(1);
      //   }
      // }
      // //维修派工
      // else{
      //   if(this.data.completePictureList.length == 0 || this.data.completeBeforePictureList.length == 0){
      //     wx.showToast({
      //       title: '请上传相关照片!',
      //       icon: 'none',
      //       duration: 2000
      //     });
      //     return;
      //   }
      //   else{
      //     wx.showLoading({ title: ""  });
      //     let completeBeforePictureList = this.data.completeBeforePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     let completePictureList = this.data.completePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
      //     this.setData({
      //       "currentItem.beforeInstallPicture": completeBeforePictureList, // 字段待确定
      //       "currentItem.completePicture": completePictureList,
      //       "currentItem.stage__c": 2,
      //       "currentItem.status": 2
      //     })
      //     this.updateOrder(1);
      //   }
      // }
    },

    async confirmFinish(){
      //配送派工
      if(this.data.currentItem["fieldJobType__c"] == "0")
      {
        if(this.data.goodsPictureList.length == 0){
          wx.showToast({
            title: '请上传货物照片!',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        else
        {
          wx.showLoading({ title: ""  });
          let goodsPictureList = this.data.goodsPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          let docPictureList = this.data.docPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          this.setData({
            "currentItem.goodsPicture": goodsPictureList,
            "currentItem.docPicture": docPictureList,
            "currentItem.stage__c": 2,
            "currentItem.status": 3
          })
          this.updateOrder(1)
        }
      }
      //安装派工
      else if(this.data.currentItem["fieldJobType__c"] == "1"){
        if(this.data.checkInPictureList.length == 0 || this.data.scenePictureList.length == 0 || this.data.afterInstallPictureList.length == 0 || this.data.afterInstallScenePictureList.length == 0){
          wx.showToast({
            title: '请上传相关照片!',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        else{
          wx.showLoading({ title: ""  });
          let checkInPictureList = this.data.checkInPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          let scenePictureList = this.data.scenePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          let afterInstallPictureList = this.data.afterInstallPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          let afterInstallScenePictureList = this.data.afterInstallScenePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          this.setData({
            "currentItem.checkInPicture": checkInPictureList, 
            "currentItem.scenePicture": scenePictureList,
            "currentItem.afterInstallPicture": afterInstallPictureList,
            "currentItem.afterInstallScenePicture": afterInstallScenePictureList,  //字段待确定
            "currentItem.stage__c": 2,
            "currentItem.status": 3
          })
          this.updateOrder(1);
        }
      }
      //维修派工
      else{
        if(this.data.completePictureList.length == 0 || this.data.completeBeforePictureList.length == 0){
          wx.showToast({
            title: '请上传相关照片!',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        else{
          wx.showLoading({ title: ""  });
          let completeBeforePictureList = this.data.completeBeforePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          let completePictureList = this.data.completePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
          this.setData({
            "currentItem.beforeInstallPicture": completeBeforePictureList, // 字段待确定
            "currentItem.completePicture": completePictureList,
            "currentItem.stage__c": 2,
            "currentItem.status": 3
          })
          this.updateOrder(1);
        }
      }
    },

    async upLoadFileAsync(files){
      var that = this;
      return new Promise((resolve, reject) => {
        if(files.length > 0){
          for(let index = 0; index < files.length; index ++){
            if(!files[index]["isUpload"])
            {
              wx.uploadFile({
                url: baseUrl + '/md/api/common/file/upload', 
                filePath: files[index].url,
                name: 'files',
                method: 'POST',
                formData: {
                  files: [files[index]],
                  isImage: "true",
                  needFileId: "true"
                },
                header: {
                  'Content-Type': 'multipart/form-data',
                  'Authorization': app.globalData.baseInfo.token
                },
                success: (res) => {
                  let rtData = JSON.parse(res.data);
                  if(rtData.code == "success"){
                    files[index]["isUpload"] = true;
                    files[index]["uid"] = rtData.data[0]["fileId"];
                    files[index]["url"] = that.data.previewUrl + rtData.data[0]["fileId"];
                    files[index]["status"] = "done";
                  }
                  if(index == files.length - 1){
                    resolve(res);
                  }
                },
                fail: (error) => {
                  reject(error);
                }
              });
            }
            else if(index < files.length - 1){
              continue;
            }
            else{
              resolve(null);
            }
          }
        }
        else{
          resolve(null);
        }

      });
    },

    updateOrder(currentStep){
      
      let item = {
        id: this.data.currentItem.id,
        stage__c: this.data.currentItem["stage__c"],
        status: this.data.currentItem["status"]
      }
      if(currentStep == 0){
        item["location"] = this.data.currentItem.location
      }
      if(currentStep == 1){
        item["goodsPicture"] = this.data.currentItem.goodsPicture;
        item["docPicture"] = this.data.currentItem.docPicture;
        item["checkInPicture"] = this.data.currentItem.checkInPicture;
        item["scenePicture"] = this.data.currentItem.scenePicture;
        item["afterInstallPicture"] = this.data.currentItem.afterInstallPicture;
        item["completeBeforePicture"] = this.data.currentItem.completeBeforePicture;
        item["completePicture"] = this.data.currentItem.completePicture;
      }
      api.updateJobItem(item).then(res =>{
        if(res.code == "success")
        {
          return true;
        }
        else{          
          Toast({
            context: this,
            selector: '#t-toast',
            message: "操作失败",
          });
          this.setData({
            "currentItem.stage__c": currentStep,
            "currentItem.status": currentStep
          })
          return false;
        }
      })
      if((this.data.currentItem["fieldJobType__c"]=="1" || this.data.currentItem["fieldJobType__c"]=="0") && currentStep==1){
        var updateTaskParams={status:4,orderId:this.data.orderId}
        if(this.data.currentItem["fieldJobType__c"]=="1"){
          updateTaskParams["status"]=5
        }
        api.updateTask(updateTaskParams)
        this.data.mergedOrderId.forEach(orderId=>{
          if(this.data.orderId!=orderId){
            console.log("mergeOrderId:",orderId)
            var newUpdateTaskParams = {
              status: 4,
              orderId: orderId
            }
            if (this.data.currentItem["fieldJobType__c"] == "1") {
              newUpdateTaskParams["status"] = 5
            }
            api.updateTask(newUpdateTaskParams)
          }
        })
      }
      //维修派工单
      if(this.data.currentItem["fieldJobType__c"]=="2" && currentStep == 1 && this.data.currentCaseItem && this.data.currentCaseItem["caseStatus"] != 4){
        // 通过neoid更新status，neoid值取serviceCaseName
        // this.updateServiceCase();
        let currentCaseItem = this.data.currentCaseItem;
        let param = {
          id: currentCaseItem["id"],
          neoid: currentCaseItem["neoid"],
          questionType: currentCaseItem["questionType"],
          name: currentCaseItem["name"],
          processingProcessAndResults: "维修完成",
          dealerCompletionTime: this.dateFormat(new Date()),
          caseStatus: 4
        }
        let token = app?.globalData?.baseInfo?.token;
        wx.request({
          url: baseUrl + '/md/api/service-case',
          method: 'POST',
          data: param,
          header: {
            'Authorization': token, 
            // 'Content-Type': 'application/json'
          },
          success(res) {
            let rtData = res.data;
            if(rtData.code == "success"){
             console.log("更新成功!");
            }
            // 处理请求成功的结果
          },
          fail(res) {
            console.log(res.errMsg);
            // 处理请求失败的结果
          }
        });

      }
      
      
    },

    dateFormat(date, fmt = "yyyy-MM-dd hh:mm:ss") {
      date = new Date(date);
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds(), //毫秒
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      }
      for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
        }
      }
      return fmt;
    },

    async updateOrderWhenUpload(){
      let item = {
        id: this.data.currentItem.id,
        stage__c: this.data.currentItem["stage__c"],
        status: this.data.currentItem["status"],
      }
      //配送派工单
      if(this.data.currentItem["fieldJobType__c"]=="0"){
        let goodsPictureList = this.data.goodsPictureList;
        let docPictureList = this.data.docPictureList;
        await this.upLoadFileAsync(goodsPictureList);
        await this.upLoadFileAsync(docPictureList);
        this.setData({
          goodsPictureList: goodsPictureList,
          docPictureList: docPictureList
        });
        item["goodsPicture"] = goodsPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        item["docPicture"] = docPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        api.updateJobItem(item).then(res =>{
          console.log(res);
        })
      }
      //安装派工单
      if(this.data.currentItem["fieldJobType__c"]=="1"){
        let checkInPictureList = this.data.checkInPictureList;
        let scenePictureList = this.data.scenePictureList;
        let afterInstallPictureList = this.data.afterInstallPictureList;
        let afterInstallScenePictureList = this.data.afterInstallScenePictureList;
        await this.upLoadFileAsync(checkInPictureList);
        await this.upLoadFileAsync(scenePictureList);
        await this.upLoadFileAsync(afterInstallPictureList);
        await this.upLoadFileAsync(afterInstallScenePictureList);
        this.setData({
          checkInPictureList: checkInPictureList,
          scenePictureList: scenePictureList,
          afterInstallPictureList: afterInstallPictureList,
          afterInstallScenePictureList: afterInstallScenePictureList
        });
        item["checkInPicture"] = checkInPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        item["scenePicture"] = scenePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        item["afterInstallPicture"] = afterInstallPictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        item["afterInstallScenePicture"] = afterInstallScenePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        api.updateJobItem(item).then(res =>{
          console.log(res);
        })
      }
      //维修派工单
      if(this.data.currentItem["fieldJobType__c"]=="2"){
        let completeBeforePictureList = this.data.completeBeforePictureList;
        let completePictureList = this.data.completePictureList;
        await this.upLoadFileAsync(completeBeforePictureList);
        await this.upLoadFileAsync(completePictureList);
        this.setData({
          completeBeforePictureList: completeBeforePictureList,
          completePictureList: completePictureList
        });
        item["beforeInstallPicture"] = completeBeforePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        item["completePicture"] = completePictureList.filter(val => val["isUpload"]).map(val => val["uid"]);
        api.updateJobItem(item).then(res =>{
          console.log(res);
        })
      }
    },

    confirmshowServiceEvaluationDialog(){
      this.setData({ showServiceEvaluation: false});
    },

    closeshowServiceEvaluationDialog(){
      this.setData({ showServiceEvaluation: false});
    },

    showOrderListDialog(){
      this.setData({ showOrderList: true});
    },

    confirmshowOrderListDialog(){
      this.setData({ showOrderList: false});
    },

    closeshowOrderListDialog(){
      this.setData({ showOrderList: false});
    },

    showServiceCaseDialog(){
      this.setData({ showServiceCase: true});
    },

    confirmshowServiceCaseDialog(){
      this.setData({ showServiceCase: false});
    },

    closeshowServiceCaseDialog(){
      this.setData({ showServiceCase: false});
    },

    handleSuccess1(e) {
      const { files } = e.detail;
      let fileList = this.data.goodsPictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        goodsPictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove1(e) {
      let index  = e.detail;
      let originFiles = this.data.goodsPictureList;
      originFiles.splice(index, 1);
      this.setData({
        goodsPictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick1(e) {
      console.log(e.detail.file);
    },

    handleSuccess2(e) {
      const { files } = e.detail;
      let fileList = this.data.docPictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        docPictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove2(e) {
      let index  = e.detail;
      let originFiles = this.data.docPictureList;
      originFiles.splice(index, 1);
      this.setData({
        docPictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick2(e) {
      console.log(e.detail.file);
    },

    handleSuccess3(e) {
      const { files } = e.detail;
      let fileList = this.data.checkInPictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        checkInPictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove3(e) {
      let index  = e.detail;
      let originFiles = this.data.checkInPictureList;
      originFiles.splice(index, 1);
      this.setData({
        checkInPictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick3(e) {
      console.log(e.detail.file);
    },

    handleSuccess4(e) {
      const { files } = e.detail;
      let fileList = this.data.scenePictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        scenePictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove4(e) {
      let index  = e.detail;
      let originFiles = this.data.scenePictureList;
      originFiles.splice(index, 1);
      this.setData({
        scenePictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick4(e) {
      console.log(e.detail.file);
    },

    handleSuccess5(e) {
      const { files } = e.detail;
      let fileList = this.data.afterInstallPictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        afterInstallPictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove5(e) {
      let index  = e.detail;
      let originFiles = this.data.afterInstallPictureList;
      originFiles.splice(index, 1);
      this.setData({
        afterInstallPictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick5(e) {
      console.log(e.detail.file);
    },

    handleSuccess6(e) {
      const { files } = e.detail;
      let fileList = this.data.completeBeforePictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        completeBeforePictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove6(e) {
      let index  = e.detail;
      let originFiles = this.data.completeBeforePictureList;
      originFiles.splice(index, 1);
      this.setData({
        completeBeforePictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick6(e) {
      console.log(e.detail.file);
    },

    handleSuccess7(e) {
      const { files } = e.detail;
      let fileList = this.data.completePictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        completePictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove7(e) {
      let index  = e.detail;
      let originFiles = this.data.completePictureList;
      originFiles.splice(index, 1);
      this.setData({
        completePictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick7(e) {
      console.log(e.detail.file);
    },

    handleSuccess8(e) {
      const { files } = e.detail;
      let fileList = this.data.afterInstallScenePictureList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        afterInstallScenePictureList: files,
      });
      this.updateOrderWhenUpload();
    },
    handleRemove8(e) {
      let index  = e.detail;
      let originFiles = this.data.afterInstallScenePictureList;
      originFiles.splice(index, 1);
      this.setData({
        afterInstallScenePictureList: originFiles,
      });
      this.updateOrderWhenUpload();
    },
    handleClick8(e) {
      console.log(e.detail.file);
    },

    showCommentDialog(){
      this.setData({ showComment: true });
      setTimeout(() => {
        this.setData({
          isFoucsTextArea: true
        })
      }, 66);
    },

    handleCommentChange(e){
      this.setData({ text: e.detail.value });
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
        let item = {
          "objectType": "fieldJob",
          "neoId": this.data.currentItem["neoId"],
          "content": this.data.text
        }
        api.comment(item).then(res =>{
          if(res.code == "success"){
            console.log(res);
            Toast({
              context: this,
              selector: '#t-toast',
              message: "评论成功!",
            });
            list.push({
              userName: this.data.currentItem["postName"] + "-" + this.data.currentItem["userName"],
              text: this.data.text,
              date: new Date().toLocaleString()
            });
            this.setData({ showComment: false, commentList: list, isFoucsTextArea: false   });
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

    },

    closeshowCommentDialog(e){
      this.setData({ showComment: false, isFoucsTextArea: false  });
    },

    formatDate(date){
      let newDate = date.replace(/-/g, "/");
      const currentDate = new Date();
      const specifiedDate = new Date(newDate);
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
          if(!item["whetherEvaluation"]){
            item["whetherEvaluation"] = false
          }
          let goodsPicture = item["goodsPicture"] || []; //货物  （配送）
          let docPicture = item["docPicture"] || []; //安装示意图、辅料  （配送）

          let checkInPicture = item["checkInPicture"] || [];  //安装前打卡 （安装）
          let scenePicture = item["scenePicture"] || []; //安装前墙面保护 （安装）
          let afterInstallPicture = item["afterInstallPicture"] || []; //安装完成 （安装）

          let completeBeforePicture = item["beforeInstallPicture"] || []; //维修前 （维修）
          let completePicture = item["completePicture"] || [];    //维修完成  （维修）


          let previewList = [...goodsPicture,...docPicture,...checkInPicture,...scenePicture,...afterInstallPicture,...completeBeforePicture,...completePicture];
          previewList =  previewList.map(val => this.data.previewUrl + val);

          let goodsPictureList = item["goodsPicture"].map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })
          let docPictureList = item["docPicture"].map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })

          let checkInPictureList = item["checkInPicture"].map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })
          let scenePictureList = item["scenePicture"].map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })
          let afterInstallPictureList = item["afterInstallPicture"].map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })
          //字段待确认
          let afterInstallScenePictureList = item["afterInstallScenePicture"]?.map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })


          let completeBeforePictureList = item["beforeInstallPicture"].map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })
          let completePictureList = item["completePicture"].map(val => {
            return {
              name: "",
              url: this.data.previewUrl + val,
              status: "done",
              uid: val,
              isUpload: true
            }
          })

          if(item["appointmentStartTime"]){
            item["times"] = this.getSecondsFromNow(item["appointmentStartTime"].replace(/-/g, '/'))
          }
          else{
            item["items"] = 0;
          }

          this.setData({
            currentItem: item,
            previewList: previewList,
            goodsPictureList: goodsPictureList,
            docPictureList: docPictureList,
            checkInPictureList: checkInPictureList,
            scenePictureList: scenePictureList,
            afterInstallPictureList: afterInstallPictureList,
            afterInstallScenePictureList: afterInstallScenePictureList,
            completeBeforePictureList: completeBeforePictureList,
            completePictureList: completePictureList
          });
          if(item["fieldJobOrderId"]){
            this.getOrderById(item["fieldJobOrderId"],item["mergedOrderNo"]);
          }
          if(item["fieldJobType__c"] == "2" && item["serviceCaseName"]){
            var that = this;
            setTimeout(() =>{
              let token = app?.globalData?.baseInfo?.token;
              wx.request({
                url: baseUrl + '/md/api/service-case',
                method: 'GET',
                header: {
                  'Authorization': token, 
                  // 'Content-Type': 'application/json'
                },
                data: {
                  neoid: item["serviceCaseName"],
                },
                success(res) {
                  let rtData = res.data;
                  if(rtData.code == "success"){
                    that.setData({
                      currentCaseItem: rtData.data
                    })
                  }
                  // console.log(res.data);
                  // 处理请求成功的结果
                },
                fail(res) {
                  console.log(res.errMsg);
                  // 处理请求失败的结果
                }
              });
            },66)
          }else{
            var that = this;
            // console.log(item)
            
            setTimeout(() =>{
              let token = app?.globalData?.baseInfo?.token;
              wx.request({
                url: baseUrl + '/md/api/service-case',
                method: 'GET',
                header: {
                  'Authorization': token, 
                  // 'Content-Type': 'application/json'
                },
                data: {
                  id: item["serviceCaseName"],
                },
                success(res) {
                  let rtData = res.data;
                  if(rtData.code == "success"){
                    that.setData({
                      currentCaseItem:rtData.data,
                      caseItemList: [rtData.data]||[]
                    })
                    // console.log(that.data.currentCaseItem)
                  }
                  // console.log(res.data);
                  // 处理请求成功的结果
                },
                fail(res) {
                  console.log(res.errMsg);
                  // 处理请求失败的结果
                }
              });
            },66)
          }
          if(item["fieldJobType__c"] != "0" && item["stage__c"]=="2"){
            var that = this;
            setTimeout(() =>{
              let token = app?.globalData?.baseInfo?.token;
              wx.request({
                url: baseUrl + '/md/api/common/investigation',
                method: 'POST',
                header: {
                  'Authorization': token, 
                  // 'Content-Type': 'application/json'
                },
                data: {
                  "type": "field_job",
                  "recordId": item["neoId"]
                },
                success(res) {
                  let rtData = res.data;
                  // console.log("investigation",rtData)
                  if(rtData.code == "success"&&rtData.data&&rtData.data.length>0){
                    that.setData({
                      showInvestigation: true
                    })
                  }
                  // console.log(res.data);
                  // 处理请求成功的结果
                },
                fail(res) {
                  console.log(res.errMsg);
                  // 处理请求失败的结果
                }
              });
            },66)
          }
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
    updateServiceCase(){
      let item = this.data.currentCaseItem;
      let param = {
        neoid: item["neoid"],
        questionType: item["questionType"],
        name: item["name"],
        caseStatus: 5
      }
      api.updateServiceCase(param).then(res =>{
        if(res.code == "success"){
          console.log("更新成功");
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
    getOrderById(id,orderNos){
      let param = {
        "id": "",
        "neoid": id,
      }
      api.getOrderById(param).then(res =>{
        if(res.code == "success"){
          let item = res.data;
          if(item){
            this.setData({
              orderId:item["id"],
              orderNeoId:item["neoid"],
              orderNo: item["po"]
            })
            if(orderNos==undefined||orderNos==""){
              const details = item["items"].forEach(element=>{
                element["orderNo"]=item["po"]
              })
              this.setData({
                orderList: item["items"] || []
              })
            }
          }
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
      if(orderNos&&orderNos!=""){
        let listParams={
          "orderNo":orderNos.split(";")
        }
        api.getOrderList(listParams).then(res =>{
          if(res.code == "success"){
            let items = res.data || [];
            
            const otherOrderId2Task=items.map(item=>{
              return item["id"]
            })
            console.log("getOrderList:",otherOrderId2Task)
            let details=[];
            items.forEach(item => {
              item["items"].forEach(product=>{
                product["orderNo"]=item["po"]
                details.push(product)
              })              
            });
            this.setData({
              mergedOrderId: otherOrderId2Task,
              orderList: details || []
            })
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
    },

    showImageDialog(){
      if(this.data.previewUrl)
      this.setData({ showImage: true });
    },

    confirmShowImageDialog(){
      this.setData({ showImage: false });
    },

    closeShowImageDialog(){
      this.setData({ showImage: false });
    },

    getSecondsFromNow(date){
      const timestamp = Math.floor(new Date(date).getTime() - Date.now());
      return timestamp > 0 ? timestamp : 0;
    },

    confirmDialog(){
      this.setData({
        showWarnConfirm: false
      });
      this.confirmFinish();
    },

    closeDialog(){
      this.setData({
        showWarnConfirm: false
      });
    },

    previewImage: function(event) {
      var imageUrl = event.currentTarget.dataset.src;
      wx.previewImage({
        current: "", // 当前显示图片的链接，可不填
        urls: [imageUrl] // 需要预览的图片链接列表
      })
    }
    

})