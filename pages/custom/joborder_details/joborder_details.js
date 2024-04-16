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

      goodsFileList: [],
      docFileList: [],
      installAfterFileList1: [],
      installAfterFileList2: [],
      installCompleteFileList: [],
      repairCompleteFileList: [],

      goodsFilePath: "",
      docFilePath: "",
      installAfterFilePath1: "",
      installAfterFilePath2: "",
      installCompleteFilePath: "",
      repairCompleteFilePath: "",
      
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
      qrcodeText:"https://fsc-sandbox.txscrm.com/TCVFQF2ZTF5",
      isFoucsTextArea: false,
      showImage: false,
      imageUrl: "https://xsybucket.s3.cn-north-1.amazonaws.com.cn/3111628201215021/2024/04/10/21388d66-d746-445d-90ea-bd620eabc04f.png"
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
        path:"/pages/custom/share_service_evaluation/share_service_evaluation?qrcodeText=" + this.data.qrcodeText,
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
                text: that.data.qrcodeText,
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
      this.setData({ showSignIn: false, "currentItem.stage__c": 1 ,"currentItem.location":locationGps});
      this.updateOrder(0);
    },

    async finish(){
      //配送派工
      if(this.data.currentItem["fieldJobType__c"] == "0")
      {
        if(this.data.goodsFileList.length == 0){
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
          let goodsFilePath = [];
          let docFilePath = [];
          await this.upLoadFileAsync(this.data.goodsFileList, goodsFilePath);
          await this.upLoadFileAsync(this.data.docFileList, docFilePath);
          this.setData({
            "currentItem.goodsPicture": goodsFilePath,
            "currentItem.docPicture": docFilePath,
            "currentItem.stage__c": 2
          })
          this.updateOrder(1);
        }
      }
      //安装派工
      else if(this.data.currentItem["fieldJobType__c"] == "1"){
        if(this.data.installAfterFileList1.length == 0 || this.data.installAfterFileList2.length == 0 || this.data.installCompleteFileList.length == 0){
          wx.showToast({
            title: '请上传相关照片!',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        else{
          wx.showLoading({ title: ""  });
          let installAfterFilePaths1 = [];
          let installAfterFilePaths2 = [];
          let installCompleteFilePath = [];
          await this.upLoadFileAsync(this.data.installAfterFileList1, installAfterFilePaths1);
          await this.upLoadFileAsync(this.data.installAfterFileList2, installAfterFilePaths2);
          await this.upLoadFileAsync(this.data.installCompleteFileList, installCompleteFilePath);
          this.setData({
            "currentItem.checkInPicture": installAfterFilePaths1, 
            "currentItem.scenePicture": installAfterFilePaths2,
            "currentItem.afterInstallPicture": installCompleteFilePath,
            "currentItem.stage__c": 2
          })
          this.updateOrder(1);
        }
      }
      //维修派工
      else{
        if(this.data.repairCompleteFileList.length == 0){
          wx.showToast({
            title: '请上传维修完成照片!',
            icon: 'none',
            duration: 2000
          });
          return;
        }
        else{
          wx.showLoading({ title: ""  });
          let repairCompleteFilePath = [];
          await this.upLoadFileAsync(this.data.repairCompleteFileList, repairCompleteFilePath);
          this.setData({
            "currentItem.completePicture": repairCompleteFilePath,
            "currentItem.stage__c": 2
          })
          this.updateOrder(1);
        }
      }
    },

    async upLoadFileAsync(files,paths){
      return new Promise((resolve, reject) => {
        if(files.length > 0){
          files.forEach(file =>{
            wx.uploadFile({
              url: baseUrl + '/md/api/common/file/upload', 
              filePath: file.url,
              name: 'files',
              method: 'POST',
              formData: {
                files: [file],
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
                  paths.push(rtData.data[0]["fileId"]);
                }
                resolve(res);
              },
              fail: (error) => {
                reject(error);
              }
            });
          })
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
        item["completePicture"] = this.data.currentItem.completePicture;
      }
      api.updateJobItem(item).then(res =>{
        if(res.code == "success")
        {
          console.log("更新成功!");
        }
        else{
          console.log("更新失败!");
          Toast({
            context: this,
            selector: '#t-toast',
            message: "操作失败",
          });
          this.setData({
            "currentItem.stage__c": currentStep
          })
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
      const { files } = e.detail;
      let fileList = this.data.goodsFileList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        goodsFileList: files,
      });
    },
    handleRemove1(e) {
      let index  = e.detail;
      let originFiles = this.data.goodsFileList;
      originFiles.splice(index, 1);
      this.setData({
        goodsFileList: originFiles,
      });
    },
    handleClick1(e) {
      console.log(e.detail.file);
    },

    handleSuccess2(e) {
      const { files } = e.detail;
      let fileList = this.data.docFileList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        docFileList: files,
      });
    },
    handleRemove2(e) {
      let index  = e.detail;
      let originFiles = this.data.docFileList;
      originFiles.splice(index, 1);
      this.setData({
        docFileList: originFiles,
      });
    },
    handleClick2(e) {
      console.log(e.detail.file);
    },

    handleSuccess3(e) {
      const { files } = e.detail;
      let fileList = this.data.installAfterFileList1;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        installAfterFileList1: files,
      });
    },
    handleRemove3(e) {
      let index  = e.detail;
      let originFiles = this.data.installAfterFileList1;
      originFiles.splice(index, 1);
      this.setData({
        installAfterFileList1: originFiles,
      });
    },
    handleClick3(e) {
      console.log(e.detail.file);
    },

    handleSuccess4(e) {
      const { files } = e.detail;
      let fileList = this.data.installAfterFileList2;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        installAfterFileList2: files,
      });
    },
    handleRemove4(e) {
      let index  = e.detail;
      let originFiles = this.data.installAfterFileList2;
      originFiles.splice(index, 1);
      this.setData({
        installAfterFileList2: originFiles,
      });
    },
    handleClick4(e) {
      console.log(e.detail.file);
    },

    handleSuccess5(e) {
      const { files } = e.detail;
      let fileList = this.data.installCompleteFileList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        installCompleteFileList: files,
      });
    },
    handleRemove5(e) {
      let index  = e.detail;
      let originFiles = this.data.installCompleteFileList;
      originFiles.splice(index, 1);
      this.setData({
        installCompleteFileList: originFiles,
      });
    },
    handleClick5(e) {
      console.log(e.detail.file);
    },

    handleSuccess6(e) {
      const { files } = e.detail;
      let fileList = this.data.repairCompleteFileList;
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        repairCompleteFileList: files,
      });
    },
    handleRemove6(e) {
      let index  = e.detail;
      let originFiles = this.data.repairCompleteFileList;
      originFiles.splice(index, 1);
      this.setData({
        repairCompleteFileList: originFiles,
      });
    },
    handleClick6(e) {
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

    startTimer(){
      this.data.timer = setInterval(() =>{
        this.conversionDate();
      },10*1000)
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
          this.setData({
            currentItem: item,
          });
          this.conversionDate();
          this.startTimer();
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
    },

    showImageDialog(){
      this.setData({ showImage: true });
    },

    confirmShowImageDialog(){
      this.setData({ showImage: false });
    },

    closeShowImageDialog(){
      this.setData({ showImage: false });
    }

})