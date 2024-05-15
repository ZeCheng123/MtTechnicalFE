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
      provinceArray:[],
      provinceVisible: false,
      provinceValue: [],
      provinceText: '',
      cityList: [],
      cityArray:[],
      cityVisible: false,
      cityValue: [],
      cityText: '',
      districtList: [],
      districtArray:[],
      districtVisible: false,
      districtValue: [],
      districtText: '',
      fieldJobItem:{},
      orderNoList: [],
      orderNoVisible: false,
      orderNoValue: [],
      orderNoText: '',
      orderNeoId:"",
      LocationList:{
        address:"",
        city:"",
        district:"",
        province:""
      },
      storeText:'',
      store:"",
      storeVisible: false,
      storeValue:[],
      storeList:[],
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
      let orderNeoIdTemp= item["orderNeoId"];
      let Locationitem = item["LocationList"];
      mainForm.orderNo = orderNo;
      mainForm.userName = item["fieldJobContactName"];
      mainForm.phone = item["contactTelephone"];
      mainForm.address = Locationitem.address;
      that.setData({
        mainForm: mainForm,
        orderNoText: orderNo,
        orderNoValue: orderNo,
        orderNeoId:orderNeoIdTemp,
        fieldJobItem:item,
        LocationList:Locationitem
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
            cityList: res.data.map(val => {return {label: val["optionLabel"], value: val["optionCode"],controlLabel:val["controlLabel"]}})
          })
        }
      });
      api.getPickList({apiName: "district"}).then(res =>{
        if(res.code == "success"){
          this.setData({
            districtList: res.data.map(val => {return {label: val["optionLabel"], value: val["optionCode"],controlLabel:val["controlLabel"]}})
          })
        }
        this.getOrderList();
      })
      // this.getOrderList();
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
        this.Location();
      })
    },
    Location(){
      const provinceItem = this.data.provinceList.find(item => item.label === this.data.LocationList["province"]);//省
      const cityItem = this.data.cityList.find(item => item.label === this.data.LocationList["city"]);//市
      const districtItem = this.data.districtList.find(item => item.label === this.data.LocationList["district"]);//区
      api.getStoreValidate({"province":provinceItem.label,"city":cityItem.label}).then(res =>{
      // api.getStoreValidate({"province":"广东省","city":"惠州市"}).then(res =>{
        let storeItem = res?.data
        if(res.code == "success"){
          let matchStore={}          
          storeItem.forEach(val=>{
            if(val.city==cityItem.label){
              matchStore=val
            }
          })
          this.setData({
            storeList:storeItem.map(val => {return {
              label: val["name"],
              value: val["neoId"],
              id:val["id"],
              storeNo:val["storeNo"],
              neoId:val["neoId"],
              phone:val["phone"]
            }}),
            storeText:matchStore["name"]?matchStore["name"]:"",
            storeValue:matchStore["neoId"]?matchStore["neoId"]:""
          })
        }
      })
      this.setData({
        provinceValue:provinceItem.value?provinceItem.value:"",
        provinceText:provinceItem.label?provinceItem.label:"",
        cityArray : this.data.cityList.filter(item => item.controlLabel === provinceItem.label),
        cityValue:cityItem.value?cityItem.value:"",
        cityText:cityItem.label?cityItem.label:"",
        districtValue:districtItem.value?districtItem.value:"",
        districtText:districtItem.label?districtItem.label:"",
        districtArray : this.data.districtList.filter(item => item.controlLabel === cityItem.label),
        "mainForm.province": provinceItem.value?provinceItem.value:"",
        "mainForm.city": cityItem.value?cityItem.value:"",
        "mainForm.district": districtItem.value?districtItem.value:"",
        
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
      console.log("this.data.mainForm",this.data.mainForm)
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
        "name": this.data.mainForm['userName']+"的服务工单",
        "orderNeoId": this.data.orderNeoId,
        "caseSource":"13",
        // "caseAccountId": this.data.mainForm['userName'],
        "caseStatus": "1",
        "picture": this.data.mainForm["filePath"],
        "video": "",
        "lockStatus": "1",
        "province": this.data.mainForm.province,
        "city": this.data.mainForm.city,
        "district": this.data.mainForm.district,
        "address":this.data.mainForm.address,
        "customerName":this.data.mainForm['userName'],
        "caseAccountName":this.data.mainForm['userName'],
        "clientCaseStatusC":"1",
        "purchaseStoreId":this.data.storeValue ? this.data.storeValue : null,
        "purchaseStoreName": this.data.storeText ? this.data.storeText : null
      }
      if(this.data.mainForm['type']=="2"){
        data["complaintChannels"]="3";
        data["complaintType"]="投诉工单";
        data["complaints"]=this.data.mainForm['describe'];
      }
      api.serviceCase(data).then(res =>{
        console.log(res)
         if(res.code == "success"){
           let updateFieldItem={
             id:this.data.fieldJobItem["id"],
             serviceCaseName:res.data.id
           }
           api.updateJobItem(updateFieldItem)
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
        "LocationList.province" : label[0]
      });
      let filteredArray = this.data.cityList.filter(item => item.controlLabel === this.data.provinceText);
      this.setData({
        cityArray:filteredArray
      })
    },
    onStoreChange(e) {
      let value = e.detail.value;
      let label = e.detail.label;
      this.setData({
        orderNeoId:"",
        storeVisible: false,
        storeValue: value[0],
        storeText: label[0]
      });
    },
    onStorePicker() {
      this.setData({ storeVisible: true });
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
        "LocationList.city" : label[0]
      });
      let filteredArray = this.data.districtList.filter(item => item.controlLabel === this.data.cityText);
      this.setData({
        districtArray:filteredArray
      })
      // console.log("cityArray",this.data.cityArray)
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
        "LocationList.district" : label[0]
      });
      this.Location()
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


