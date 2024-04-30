// pages/custom/joborder/joborder.js
const api = require('../../../api/index');
const app = getApp();
import { baseUrl } from '../../../api/http.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
      searchValue: "",
      tabIndex: 0,
      moreListObj: {
        toBegin: [],
        inProgress: [],
        done: []
      },
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
      timer: null,
      pageSize: 10,
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
      // this.getJobList();
      this.getJobListByPage();
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

    getJobListByPage(){
      var that = this;
      let currentDateRange =  app.globalData.dateRange;
      let params = {
        "from": currentDateRange[0],
        "to": currentDateRange[1],
        "pageNo": 1,
        "pageSize": 100000
      }
      // api.getJobListByPage(params).then(res =>{
      //   console.log(res);
      // })
      wx.showLoading({ title: ""  });
      wx.request({
        url: baseUrl + '/md/api/field-job/page',
        method: 'POST',
        data: params,
        success(res) {
          wx.hideLoading()
          let rtData = res.data;
          if(rtData.code == "success"){
            let list = rtData.data || [];
            list.forEach(item =>{
              if(item["appointmentStartTime"]){
                item["times"] = that.getSecondsFromNow(item["appointmentStartTime"].replace(/-/g, '/'));
              }
              else{
                item["items"] = 0;
              }
            })
            let pageSize = that.data.pageSize;
            let moreToBegin = list.filter(val => val["stage__c"] == "0"); //剩余未加载数据
            let moreInProgress = list.filter(val => val["stage__c"] == "1"); //剩余未加载数据
            let moreDone = list.filter(val => val["stage__c"] == "2"); //剩余未加载数据
            let srcToBegin = moreToBegin.splice(0,pageSize); //已加载数据
            let srcInProgress = moreInProgress.splice(0,pageSize); //已加载数据
            let srcDone = moreDone.splice(0,pageSize); //已加载数据
            // let searchToBegin = srcToBegin; //首次加载，搜索数据=已加载数据
            // let searchInProgress = srcInProgress; //首次加载，搜索数据=已加载数据
            // let searchDone = srcDone; //首次加载，搜索数据=已加载数据
            that.setData({
              moreListObj:{
                toBegin: moreToBegin,
                inProgress: moreInProgress,
                done: moreDone,
              },
              srcListObj: {
                toBegin: srcToBegin,
                inProgress: srcInProgress,
                done: srcDone,
              },
            });
            that.searchList();
          }
          else
          {
            Toast({
              context: this,
              selector: '#t-toast',
              message: res.message,
            });
          }
        },
        fail(res) {
          wx.hideLoading()
          console.log(res.errMsg);
          // 处理请求失败的结果
        }
      });
    },

    onLoadMore1(){
      console.log("加载更多数据。。。");
      let pageSize = this.data.pageSize;
      let moreListObj_toBegin = this.data.moreListObj["toBegin"];
      let srcListObj_toBegin = this.data.srcListObj["toBegin"];
      let addOrderList = moreListObj_toBegin.splice(0,pageSize);
      let newOrderList = srcListObj_toBegin.concat(addOrderList);
      var that = this;
      wx.showLoading({ title: ""  });
      setTimeout(() => {
        that.setData({
          'moreListObj.toBegin': moreListObj_toBegin,
          'srcListObj.toBegin': newOrderList,
        });
        that.searchList();
        wx.hideLoading();
      }, 500);

    },

    onLoadMore2(){
      console.log("加载更多数据。。。");
      let pageSize = this.data.pageSize;
      let moreListObj_inProgress = this.data.moreListObj["inProgress"];
      let srcListObj_inProgress = this.data.srcListObj["inProgress"];
      let addOrderList = moreListObj_inProgress.splice(0,pageSize);
      let newOrderList = srcListObj_inProgress.concat(addOrderList);
      var that = this;
      wx.showLoading({ title: ""  });
      setTimeout(() => {
        that.setData({
          'moreListObj.inProgress': moreListObj_inProgress,
          'srcListObj.inProgress': newOrderList,
        });
        that.searchList();
        wx.hideLoading();
      }, 500);

    },

    onLoadMore3(){
      console.log("加载更多数据。。。");
      let pageSize = this.data.pageSize;
      let moreListObj_done = this.data.moreListObj["done"];
      let srcListObj_done = this.data.srcListObj["done"];
      let addOrderList = moreListObj_done.splice(0,pageSize);
      let newOrderList = srcListObj_done.concat(addOrderList);
      var that = this;
      wx.showLoading({ title: ""  });
      setTimeout(() => {
        that.setData({
          'moreListObj.done': moreListObj_done,
          'srcListObj.done': newOrderList,
        });
        that.searchList();
        wx.hideLoading();
      }, 500);
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {
      console.log("下拉刷新");
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
          data["toBegin"] = this.data.srcListObj["toBegin"].filter(val => val["name"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1 || (val["address"] && val["address"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1));
          data["inProgress"] = this.data.srcListObj["inProgress"].filter(val => val["name"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1 || (val["address"] && val["address"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1))
          data["done"] = this.data.srcListObj["done"].filter(val => val["name"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1 || (val["address"] && val["address"].toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) != -1))
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
    },
    getSecondsFromNow(date){
      const timestamp = Math.floor(new Date(date).getTime() - Date.now());
      return timestamp > 0 ? timestamp : 0;
    }


})