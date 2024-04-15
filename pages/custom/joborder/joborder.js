// pages/custom/joborder/joborder.js
const api = require('../../../api/index')
Page({

    /**
     * 页面的初始数据
     */
    data: {
      searchValue: "",
      tabIndex: 0,
      srcListObj: {
        toBegin: [],
        inProgress: [],
        done: []
      },
      searchListObj: {
        toBegin: [],
        inProgress: [],
        done: []
      },
      timer: null
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
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
      this.getJobList();
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

    getJobList(){
      let param = {
        "fieldJobType__c": "",
        "appointmentEndTime": "",
        "stage__c": ""
      }
      api.getJobList(param).then(res =>{
        if(res.code == "success"){
          let list = res.data || [];
          let toBegin = list.filter(val => val["stage__c"] == "0");
          let inProgress = list.filter(val => val["stage__c"] == "1");
          let done = list.filter(val => val["stage__c"] == "2");
          this.setData({
            srcListObj: {
              toBegin: toBegin,
              inProgress: inProgress,
              done: done,
            },
            searchListObj:{
              toBegin: toBegin,
              inProgress: inProgress,
              done: done,
            }
          });
          this.searchList();
          this.conversionDate();
          this.startTimer();
        }
        else
        {
          this.setData({
            srcListObj: []
          })
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message,
          });
        }
      })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
      console.log("下拉刷新");
      this.getJobList();
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
    onTabsChange(event) {
      this.setData({
        tabIndex: event.detail.value
      });
    },

    onTabsClick(event) {
      this.setData({
        tabIndex: event.detail.value
      });
    },

    searchList(event){
      setTimeout(() =>{
        let data = {toBegin:[],inProgress:[],done:[]};
        let index = 0;
        if(event)
        {
          let keyword = event.detail.value;
          data["toBegin"] = this.data.srcListObj["toBegin"].filter(val => val["title"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1 || val["address"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1);
          data["inProgress"] = this.data.srcListObj["inProgress"].filter(val => val["title"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1 || val["address"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1)
          data["done"] = this.data.srcListObj["done"].filter(val => val["title"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1 || val["address"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1)
          if(data["toBegin"].length>0){
            index = 0;
          }
          if(data["inProgress"].length>0){
            index = 1;
          }
          if(data["done"].length>0){
            index = 2;
          }
          this.setData({
            tabIndex: index
          });
        }
        else
        {
          data = this.data.srcListObj;
        }
        this.setData({
          searchListObj: data,
          // tabIndex: index
        });
      },66)
      

    },
    startTimer(){
      this.data.timer = setInterval(() =>{
        this.conversionDate();
      },10*1000)
    },
    conversionDate()
    {
        let toBegin = this.data.searchListObj["toBegin"];
        let inProgress = this.data.searchListObj["inProgress"];
        let done = this.data.searchListObj["done"];
        for (let index = 0; index < toBegin.length; index++) {
          let element = toBegin[index];
          if(element["appointmentStartTime"]){
            element["dateObj"] = this.formatDate(element["appointmentStartTime"])
          }
        }
        for (let index = 0; index < inProgress.length; index++) {
          let element = inProgress[index];
          if(element["appointmentStartTime"]){
            element["dateObj"] = this.formatDate(element["appointmentStartTime"])
          }
        }
        for (let index = 0; index < done.length; index++) {
          let element = done[index];
          if(element["appointmentStartTime"]){
            element["dateObj"] = this.formatDate(element["appointmentStartTime"])
          }
        }
        let obj = {
          toBegin: toBegin,
          inProgress: inProgress,
          done: done
        }
        this.setData({
          searchListObj: obj
        }); 
    },
    onClickListItem(event){
      let item = event.currentTarget.dataset.item;
      // 在当前 TabBar 页面的事件处理函数中进行跳转操作
      wx.navigateTo({
        url: '/pages/custom/joborder_details/joborder_details?id=' + item.id  // 跳转到非 TabBar 页面的路径
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
    }

})