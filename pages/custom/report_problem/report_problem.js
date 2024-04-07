// pages/custom/feedback/feedback.js
import Message from 'tdesign-miniprogram/message/index';
import utilTools from "../../../utils/utilTools";
import { baseUrl } from '../../../api/http.js';
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
      provinceList: utilTools.getProvinceList(),
      provinceVisible: false,
      provinceValue: [],
      provinceText: '',
      cityList: [],
      cityVisible: false,
      cityValue: [],
      cityText: '',
      countyList: [],
      countryVisible: false,
      countryValue: [],
      countryText: '',
      mainForm:{
        userName: "",
        phone: "",
        province: "",
        city: "",
        country: "",
        address: "",
        type: "1",
        describe: "",
        orderNo: "",
        fileList: "",
      }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
      let id = options.id;
      var that = this;
      // that.setData({
      //   currentItem: item
      // })
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
      console.log(this.data.mainForm)
      let mainForm = this.data.mainForm;
      for(let key in mainForm){
        if(key != "fileList" && mainForm[key] == ""){
          Message.error({
            context: this,
            offset: [20, 32],
            duration: 5000,
            content: '必填字段不能为空!',
          });
          return;
        }
      }
      if(mainForm.fileList.length > 0){
        mainForm.fileList.forEach(file => {
          wx.uploadFile({
            url: baseUrl + '/md/api/common/file/upload', // 仅为示例，非真实的接口地址
            filePath: file["url"], // that.data.originFiles1[0].url,
            name:  file["name"], //that.data.originFiles1[0].name,
            formData: {
              isImage: "true",
              needFileId: "true"
            },
            success: (res) => {
              console.log(res)
            },
            fail: (err) =>{
              Toast({
                context: this,
                selector: '#t-toast',
                message: err?.errMsg,
              });
            }
          });
        });
      }
      // 调用保存接口
      this.showSuccessMessage()
    },
    showSuccessMessage() {
      Message.success({
        context: this,
        offset: [20, 32],
        duration: 5000,
        content: '问题反馈提交成功',
      });
      setTimeout(() => {
        wx.navigateBack({
          delta: 1 // 返回的页面数，1表示返回上一级页面，依此类推
        });
      }, 500);
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
      let cityList = utilTools.getCityList(value)
      this.setData({
        provinceVisible: false,
        provinceValue: value[0],
        provinceText: label[0],
        cityValue: [],
        cityText: '',
        countryValue: [],
        countryText: '',
        cityList: cityList,
        'mainForm.province':label[0],
        'mainForm.city': "",
        'mainForm.country': "",
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
        countryValue: "",
        countryText: "",
        countyList: utilTools.getCountyList(value[0]),
        'mainForm.city': label[0],
        'mainForm.country': "",
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
        countryVisible: false,
        countryValue: value[0],
        countryText: label[0],
        'mainForm.country': label[0],
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

    onCountyPicker() {
      this.setData({ countryVisible: true });
    },
})


