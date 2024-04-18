// pages/custom/feedback/feedback.js
import Message from 'tdesign-miniprogram/message/index';
import { baseUrl } from '../../../api/http.js';
import Toast from 'tdesign-miniprogram/toast/index';
const api = require('../../../api/index');
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
      value: '',
      visible: false,
      gridConfig: {
        column: 5,
        width: 80,
        height: 80,
      },
      config: {
        count: 1,
      },
      currentItem:{},
      provinceList: [],
      provinceVisible: false,
      provinceValue: [],
      provinceText: '',
      cityList: [],
      cityVisible: false,
      cityValue: [],
      cityText: '',
      districtList: [],
      districtVisible: false,
      districtValue: [],
      districtText: '',
      
      orderNoList: [],
      orderNoVisible: false,
      orderNoValue: [],
      orderNoText: '',

      mainForm:{
        userName: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        address: "",
        type: "1",
        describe: "",
        orderNo: "",
        fileList: [],
        filePath: [],
      },
      
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      var that = this;
      let item = JSON.parse(options.item);
      let mainForm = this.data.mainForm;
      let orderNo = item["orderNo"];
      mainForm.orderNo = orderNo;
      mainForm.userName = item["fieldJobContactName"];
      mainForm.phone = item["contactTelephone"];
      that.setData({
        mainForm: mainForm,
        orderNoText: orderNo,
        orderNoValue: orderNo
      });
      api.getPickList({apiName: "province"}).then(res =>{
        if(res.code == "success"){
          this.setData({
            provinceList: res.data.map(val => {return {label: val["optionLabel"], value: val["optionCode"]}})
          })
        }
      });
      api.getPickList({apiName: "city"}).then(res =>{
        if(res.code == "success"){
          this.setData({
            cityList: res.data.map(val => {return {label: val["optionLabel"], value: val["optionCode"]}})
          })
        }
      });
      api.getPickList({apiName: "district"}).then(res =>{
        if(res.code == "success"){
          this.setData({
            districtList: res.data.map(val => {return {label: val["optionLabel"], value: val["optionCode"]}})
          })
        }
      })
      this.getOrderList();
    },

    getOrderList(){
      api.getOrderList({}).then(res =>{
        let orderList = [];
        if(res.code == "success"){
          orderList = res.data.map(val => { return { label: val["po"], value: val["po"] } })
        }
        this.setData({
          orderNoList: orderList
        })
      })
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

    inputChange(e){
      let key = e.target.dataset.key;
      let value = e.detail.value;
      let mainForm = this.data.mainForm;
      mainForm[key] = value;
      this.setData({
        mainForm: mainForm
      })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    },
    handleTap(){
      let mainForm = this.data.mainForm;
      let phonePattern = /^1\d{10}$/;
      for(let key in mainForm){
        if(key != "filePath" && key != "fileList" && key != "orderNo" && mainForm[key] == ""){
          Message.error({
            context: this,
            offset: [20, 32],
            duration: 5000,
            content: '必填字段不能为空!',
          });
          return;
        }
        if(key == "phone" && !phonePattern.test(mainForm["phone"])){
          Message.error({
            context: this,
            offset: [20, 32],
            duration: 5000,
            content: '联系方式格式不正确!',
          });
          return;
        }
      }
      if(mainForm.fileList.length > 0){
        var that = this;
        let filePathArray = [];
        for(let index = 0; index < mainForm.fileList.length; index ++){
          let file = mainForm.fileList[index];
          wx.uploadFile({
            url: baseUrl + '/md/api/common/file/upload', // 仅为示例，非真实的接口地址
            filePath: file["url"],
            name:  "files", 
            method: 'POST',
            formData: {
              files: [file],
              // isImage: "true",
              needFileId: "true"
            },
            header: {
              'Content-Type': 'multipart/form-data',
              'Authorization': app.globalData.baseInfo.token
            },
            success: (res) => {
              let rtData = JSON.parse(res.data);
              if(rtData.code == "success"){
                filePathArray.push(rtData.data[0]["fileId"]);
                if(index == mainForm.fileList.length - 1){
                  that.setData({
                    "mainForm.filePath": filePathArray
                  })
                  that.showSuccessMessage()
                }
              }
            },
            fail: (err) =>{
              Toast({
                context: this,
                selector: '#t-toast',
                message: err?.errMsg,
              });
            }
          });
        }
      }
      else{
        // 调用保存接口
        this.showSuccessMessage()
      }

    },
    showSuccessMessage() {
      let data = {
        "phone": this.data.mainForm['phone'],
        "questionType": this.data.mainForm['type'],
        "problemDescription": this.data.mainForm['describe'],
        "name": this.data.mainForm['userName'],
        "caseNo": this.data.mainForm['orderNo'],
        // "caseAccountId": this.data.mainForm['userName'],
        "caseStatus": "2",
        "picture": this.data.mainForm["filePath"],
        "video": "",
        "lockStatus": "1",
        "province": this.data.mainForm.province,
        "city": this.data.mainForm.city,
        "district": this.data.mainForm.district
      }
      api.serviceCase(data).then(res =>{
        console.log(res)
         if(res.code == "success"){
            Toast({
              context: this,
              selector: '#t-toast',
              message: "问题反馈提交成功",
              duration: 2000
            });
            setTimeout(() => {
              wx.navigateBack({
                delta: 1 // 返回的页面数，1表示返回上一级页面，依此类推
              });
            }, 1000);

         }
         else{
          Message.error({
            context: this,
            offset: [20, 32],
            duration: 5000,
            content: '问题反馈提交失败',
          });
         }
      })

    },
    handleClick() {
      this.setData({ visible: true });
    },
    handleOverlayClick(e) {
      this.setData({
        visible: e.detail.visible,
      });
    },
    handleSuccess(e) {
      const { files } = e.detail;
      let fileList = this.data.mainForm.fileList
      if (fileList.length > 2) {
        wx.showToast({
          title: '最多只能上传3张图片',
          icon: 'none',
          duration: 2000
        });
        return; // 不执行文件更新操作
      }
      this.setData({
        'mainForm.fileList': files,
      });
    },
    
    handleRemove(e) {
      const { index } = e.detail;
      let fileList = this.data.mainForm.fileList;
      fileList.splice(index, 1);
      this.setData({
        'mainForm.fileList': fileList,
      });
    },
    handleClick(e) {
      console.log(e.detail.file);
    },

    returnTap(){
      wx.navigateBack({
        delta: 1 // 返回的页面数，1表示返回上一级页面，依此类推
      });
    },

    ///////////////////////
    onPickerChange(e) {
      let value = e.detail.value;
      let label = e.detail.label;
      this.setData({
        provinceVisible: false,
        provinceValue: value[0],
        provinceText: label[0],
        cityValue: [],
        cityText: '',
        districtValue: [],
        districtText: '',
        'mainForm.province':value[0],
        'mainForm.city': "",
        'mainForm.district': "",
      });
    },

    onPickerCancel(e) {
      const { key } = e.currentTarget.dataset;
      console.log(e, '取消');
      console.log('picker1 cancel:');
      this.setData({
        [`${key}Visible`]: false,
      });
    },

    onProvincePicker() {
      this.setData({ provinceVisible: true });
    },

    //////////////////////

    onPickerChange2(e) {
      let value = e.detail.value;
      let label = e.detail.label;
      this.setData({
        cityVisible: false,
        cityValue: value[0],
        cityText: label[0],
        districtValue: "",
        districtText: "",
        'mainForm.city': value[0],
        'mainForm.district': "",
      });
      console.log(value[0])
    },

    onPickerCancel2(e) {
      const { key } = e.currentTarget.dataset;
      console.log(e, '取消');
      console.log('picker1 cancel:');
      this.setData({
        [`${key}Visible`]: false,
      });
    },

    onCityPicker() {
      this.setData({ cityVisible: true });
    },

    ///////
    onPickerChange3(e) {
      let value = e.detail.value;
      let label = e.detail.label;
      this.setData({
        districtVisible: false,
        districtValue: value[0],
        districtText: label[0],
        'mainForm.district': value[0],
      });
    },

    onPickerCancel3(e) {
      const { key } = e.currentTarget.dataset;
      console.log(e, '取消');
      console.log('picker1 cancel:');
      this.setData({
        [`${key}Visible`]: false,
      });
    },

    onDistrictPicker() {
      this.setData({ districtVisible: true });
    },

    ////
    onPickerOrderNoChange(e) {
      let value = e.detail.value;
      this.setData({
        orderNoVisible: false,
        orderNoValue: value[0],
        orderNoText: value[0],
        'mainForm.orderNo': value[0],
      });
    },

    onPickerOrderNoCancel(e) {
      const { key } = e.currentTarget.dataset;
      console.log(e, '取消');
      this.setData({
        [`${key}Visible`]: false,
      });
    },

    onOrderNoPicker() {
      this.setData({ orderNoVisible: true });
    },
})


