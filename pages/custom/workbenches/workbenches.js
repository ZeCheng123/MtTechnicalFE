import * as echarts from "../../../components/ec-canvas/echarts";
import Toast from 'tdesign-miniprogram/toast/index';
const api = require('../../../api/index');
import { baseUrl } from '../../../api/http.js';
let glo_chart = null;
const app = getApp();
Page({
    data: {
      dateRangeText: '这个月',
      dateRangeValue: ['这个月'],
      dateRangeTitle: '',
      dateRange: [
        { label: '这个月', value: [] },
        { label: '近两个月', value: []  },
        { label: '近三个月', value: []  },
      ],
      chartData: [ 
        { value: 0, name: '待开始' },
        { value: 0, name: '进行中' },
        { value: 0, name: '已完成' }
      ],
      chartColor: ["#FFC327","#0256FF","#189208"],
      ec: {
        onInit: null
      },
      orderList: [],
      moreOrderList: [],
      defaultText: "",
      defaultColor: "",
      pageSize: 10
    },
    onLoad() {
    },
    onShow(){
      this.initDate();
      this.setData({
        "ec.onInit": this.initChart
      })
      //this.getJobList();
      this.getJobListByPage();
      this.initDate();
    },
    onHide(){

    },
    onColumnChange(e) {
      console.log('picker pick:', e);
    },
    onPickerChange(e) {
      const { key } = e.currentTarget.dataset;
      const label = e.detail.label;
      const value = e.detail.value;
      console.log('picker change:', e.detail);
      this.setData({
        [`${key}Visible`]: false,
        [`${key}Value`]: label[0],
        [`${key}Text`]: label[0]
      });
      app.globalData.dateRange =  value[0];
      this.getJobListByPage();
    },
    onPickerCancel(e) {
      const { key } = e.currentTarget.dataset;
      console.log(e, '取消');
      console.log('picker1 cancel:');
      this.setData({
        [`${key}Visible`]: false,
      });
    },
    onTitlePicker() {
      this.setData({ cityVisible: true, cityTitle: '选择城市' });
    },

    getJobList(){
      let param = {
        "fieldJobType__c": "",
        "appointmentEndTime": "",
        "stage__c": ""
      }
      api.getJobList(param).then(async res =>{
        if(res.code == "success"){
          let list = res.data || [];
          let toBeginCount = list.filter(val => val["stage__c"] == "0").length;
          let toInProgressCount = list.filter(val => val["stage__c"] == "1").length;
          let toDoneCount = list.filter(val => val["stage__c"] == "2").length;
          let chartData = [
            { value: toBeginCount, name: '待开始' },
            { value: toInProgressCount, name: '进行中' },
            { value: toDoneCount, name: '已完成' }
          ];
          let text = "";
          let color = "";
          if(toBeginCount>0)
          {
            text = toBeginCount;
            color = "#FFC327";
          }
          else if(toInProgressCount>0)
          {
            text = toInProgressCount;
            color = "#0256FF";
          }
          else if(toDoneCount>0)
          {
            text = toDoneCount;
            color = "#189208";
          }
          let orderList = list.filter(val => val["stage__c"] == "0");
          this.setData({
            orderList: orderList,
            chartData: chartData,
            defaultText: text,
            defaultColor: color
          });
          if(glo_chart){
            let options = glo_chart.getOption();
            options.series[0]["data"] = chartData;
            options.title[0]["text"] = text;
            options.title[0]["textStyle"]["color"] = color
            glo_chart.setOption(options);
          }

        }
        else
        {
          let chartData = [
            { value: 0, name: '待开始' },
            { value: 0, name: '进行中' },
            { value: 0, name: '已完成' }
          ];
          this.setData({
            orderList: [],
            chartData: chartData
          });
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message,
          });
        }
      })
    },

    toJobList(){
      wx.switchTab({
        url: '/pages/custom/joborder/joborder'
      }); 
    },

    onWithoutTitlePicker() {
      this.setData({ dateRangeVisible: true, dateRangeTitle: '' });
    },


    initChart(canvas, width, height, dpr) {
      console.log("初始化图表");
      var that = this;
      glo_chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      canvas.setChart(glo_chart);
    
      var option = {
        title: {
          text: that.data.defaultText,  
          left: "25%",//对齐方式居中
          top: "42%",//距离顶部
          textStyle: {//文字配置
            color: that.data.defaultColor,//文字颜色
            fontSize: 15,//字号
            align: "center"//对齐方式
          }
        },
        grid: {
          containLabel: true // 包含标题在内，确保标题始终在环形最中间
       },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '45',
          right: '2',
          orient: 'vertical',
          data: [
            { name: '待开始', icon: 'circle'},
            { name: '进行中', icon: 'circle'},
            { name: '已完成', icon: 'circle'}
          ],
          itemWidth: 15,
          itemHeight: 15,
          textStyle: {
            color: '#000000'
          },

        },
        series: [
          {
            name: '工单分布',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['30%', '48%'],
            avoidLabelOverlap: false,
            label: {
              show: true,
              position: 'inside', // 文本显示在环形图内部
              formatter: '{d}%' // 自定义显示的文本，例如显示数据占比
            },
            itemStyle: {
              emphasis: {
                show: false // 禁用默认的高亮效果
              }
            },
            labelLine: {
              show: false
            },
            label: {
              position: 'center',
              show: false,
              formatter:function(params){
               
              },
            },
            color: ["#FFC327","#0256FF","#189208"],
            data: that.data.chartData,
          }
        ]
      };
      glo_chart.setOption(option);
      setTimeout(() => {
        glo_chart.on('legendselectchanged', function(params) {
          let name = "";
          let value = "";
          let color = "";
          if(params.selected[params.name]){
            name = params.name;
          }
          else{
            let allType = that.data.chartData.map(item => item["name"]);
            for(let index = 0; index < allType.length; index ++){
              if(params.selected[allType[index]]){
                name = allType[index];
                break;
              }
            }
          }
          if(name){
            value = that.data.chartData.find(val => val["name"] == name)?.value;
            color = that.data.chartColor[that.data.chartData.map(item => item["name"]).indexOf(name)]
          }
          option.title.text = value;
          option.title.textStyle.color = color;
          glo_chart.setOption(option);
        });
      }, 0);
      return glo_chart;
    },

    // initChart(canvas, width, height, dpr) {
    //   var that = this;
    //   app.globalData.chart = echarts.init(canvas, null, {
    //     width: width,
    //     height: height,
    //     devicePixelRatio: dpr // new
    //   });
    //   canvas.setChart(app.globalData.chart);
    
    //   var option = {
    //     title: {
    //       text: that.data.defaultText,  
    //       left: "25%",//对齐方式居中
    //       top: "42%",//距离顶部
    //       textStyle: {//文字配置
    //         color: that.data.defaultColor,//文字颜色
    //         fontSize: 15,//字号
    //         align: "center"//对齐方式
    //       }
    //     },
    //     grid: {
    //       containLabel: true // 包含标题在内，确保标题始终在环形最中间
    //    },
    //     tooltip: {
    //       trigger: 'item',
    //     },
    //     legend: {
    //       top: '45',
    //       right: '2',
    //       orient: 'vertical',
    //       data: [
    //         { name: '待开始', icon: 'circle'},
    //         { name: '进行中', icon: 'circle'},
    //         { name: '已完成', icon: 'circle'}
    //       ],
    //       itemWidth: 15,
    //       itemHeight: 15,
    //       textStyle: {
    //         color: '#000000'
    //       },

    //     },
    //     series: [
    //       {
    //         name: '工单分布',
    //         type: 'pie',
    //         radius: ['40%', '70%'],
    //         center: ['30%', '48%'],
    //         avoidLabelOverlap: false,
    //         label: {
    //           show: true,
    //           position: 'inside', // 文本显示在环形图内部
    //           formatter: '{d}%' // 自定义显示的文本，例如显示数据占比
    //         },
    //         itemStyle: {
    //           emphasis: {
    //             show: false // 禁用默认的高亮效果
    //           }
    //         },
    //         labelLine: {
    //           show: false
    //         },
    //         label: {
    //           position: 'center',
    //           show: false,
    //           formatter:function(params){
               
    //           },
    //         },
    //         color: ["#FFC327","#0256FF","#189208"],
    //         data: that.data.chartData,
    //       }
    //     ]
    //   };
    //   app.globalData.chart.setOption(option);
    //   setTimeout(() => {
    //     app.globalData.chart.on('legendselectchanged', function(params) {
    //       let name = "";
    //       let value = "";
    //       let color = "";
    //       if(params.selected[params.name]){
    //         name = params.name;
    //       }
    //       else{
    //         let allType = that.data.chartData.map(item => item["name"]);
    //         for(let index = 0; index < allType.length; index ++){
    //           if(params.selected[allType[index]]){
    //             name = allType[index];
    //             break;
    //           }
    //         }
    //       }
    //       if(name){
    //         value = that.data.chartData.find(val => val["name"] == name)?.value;
    //         color = that.data.chartColor[that.data.chartData.map(item => item["name"]).indexOf(name)]
    //       }
    //       option.title.text = value;
    //       option.title.textStyle.color = color;
    //       app.globalData.chart.setOption(option);
    //     });
    //   }, 0);
    //   return app.globalData.chart;
    // },



    onClickListItem(event){
      let item = event.currentTarget.dataset.item;
      // 在当前 TabBar 页面的事件处理函数中进行跳转操作
      wx.navigateTo({
        url: '/pages/custom/joborder_details/joborder_details?id=' + item.id   // 跳转到非 TabBar 页面的路径
      });      
    },

    onPullDownRefresh(){
      console.log("下拉刷新");
    },

    onLoadMore(){
      console.log("加载更多数据。。。");
      let pageSize = this.data.pageSize;
      let moreOrderList = this.data.moreOrderList;
      let orderList = this.data.orderList;
      let addOrderList = moreOrderList.splice(0,pageSize);
      let newOrderList = orderList.concat(addOrderList);
      var that = this;
      wx.showLoading({ title: ""  });
      setTimeout(() => {
        this.setData({
          moreOrderList: moreOrderList,
          orderList: newOrderList,
        });
        wx.hideLoading();
      }, 500);

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
      api.getJobListByPage(params).then(res =>{
        if(res.code == "success"){
          let rtData = res.data;
          let list = rtData || [];
          let toBeginCount = list.filter(val => val["stage__c"] == "0").length;
          let toInProgressCount = list.filter(val => val["stage__c"] == "1").length;
          let toDoneCount = list.filter(val => val["stage__c"] == "2").length;
          let chartData = [
            { value: toBeginCount, name: '待开始' },
            { value: toInProgressCount, name: '进行中' },
            { value: toDoneCount, name: '已完成' }
          ];
          let text = "";
          let color = "";
          if(toBeginCount>0)
          {
            text = toBeginCount;
            color = "#FFC327";
          }
          else if(toInProgressCount>0)
          {
            text = toInProgressCount;
            color = "#0256FF";
          }
          else if(toDoneCount>0)
          {
            text = toDoneCount;
            color = "#189208";
          }
          let allOrderList = list.filter(val => val["stage__c"] == "0");
          let pageSize = that.data.pageSize;
          let moreOrderList = allOrderList;
          let orderList = moreOrderList.splice(0,pageSize);
          that.setData({
            moreOrderList: moreOrderList,
            orderList: orderList,
            chartData: chartData,
            defaultText: text,
            defaultColor: color
          });
          if(glo_chart){
            let options = glo_chart.getOption();
            options.series[0]["data"] = chartData;
            options.title[0]["text"] = text;
            options.title[0]["textStyle"]["color"] = color
            glo_chart.setOption(options);
          }

        }
        else
        {
          let chartData = [
            { value: 0, name: '待开始' },
            { value: 0, name: '进行中' },
            { value: 0, name: '已完成' }
          ];
          that.setData({
            orderList: [],
            chartData: chartData
          });
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message,
          });
        }
      })
      // wx.showLoading({ title: ""  });
      // wx.request({
      //   url: baseUrl + '/md/api/field-job/page',
      //   method: 'POST',
      //   data: params,
      //   header:{
      //     'Authorization': app?.globalData?.baseInfo?.token, 
      //   },
      //   success(res) {
      //     wx.hideLoading()
      //     let rtData = res.data;
      //     if(rtData.code == "success"){
      //       let list = rtData.data || [];
      //       let toBeginCount = list.filter(val => val["stage__c"] == "0").length;
      //       let toInProgressCount = list.filter(val => val["stage__c"] == "1").length;
      //       let toDoneCount = list.filter(val => val["stage__c"] == "2").length;
      //       let chartData = [
      //         { value: toBeginCount, name: '待开始' },
      //         { value: toInProgressCount, name: '进行中' },
      //         { value: toDoneCount, name: '已完成' }
      //       ];
      //       let text = "";
      //       let color = "";
      //       if(toBeginCount>0)
      //       {
      //         text = toBeginCount;
      //         color = "#FFC327";
      //       }
      //       else if(toInProgressCount>0)
      //       {
      //         text = toInProgressCount;
      //         color = "#0256FF";
      //       }
      //       else if(toDoneCount>0)
      //       {
      //         text = toDoneCount;
      //         color = "#189208";
      //       }
      //       let allOrderList = list.filter(val => val["stage__c"] == "0");
      //       let pageSize = that.data.pageSize;
      //       let moreOrderList = allOrderList;
      //       let orderList = moreOrderList.splice(0,pageSize);
      //       that.setData({
      //         moreOrderList: moreOrderList,
      //         orderList: orderList,
      //         chartData: chartData,
      //         defaultText: text,
      //         defaultColor: color
      //       });
      //       if(glo_chart){
      //         let options = glo_chart.getOption();
      //         options.series[0]["data"] = chartData;
      //         options.title[0]["text"] = text;
      //         options.title[0]["textStyle"]["color"] = color
      //         glo_chart.setOption(options);
      //       }
  
      //     }
      //     else
      //     {
      //       let chartData = [
      //         { value: 0, name: '待开始' },
      //         { value: 0, name: '进行中' },
      //         { value: 0, name: '已完成' }
      //       ];
      //       that.setData({
      //         orderList: [],
      //         chartData: chartData
      //       });
      //       Toast({
      //         context: this,
      //         selector: '#t-toast',
      //         message: res.message,
      //       });
      //     }
      //   },
      //   fail(res) {
      //     wx.hideLoading()
      //     console.log(res.errMsg);
      //     // 处理请求失败的结果
      //   }
      // });
    },

    initDate(){
       // 获取当前日期
      const today = new Date();

      // 近一个月的日期范围（包含今天）
      const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      const oneMonthRange = [this.dateFormat(oneMonthAgo), this.dateFormat(today)];

      // 近两个月的日期范围（包含今天）
      const twoMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, today.getDate());
      const twoMonthsRange = [this.dateFormat(twoMonthsAgo), this.dateFormat(today)];

      // 近三个月的日期范围（包含今天）
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
      const threeMonthsRange = [this.dateFormat(threeMonthsAgo), this.dateFormat(today)];

      let dateRange = [
        { label: '这个月', value: oneMonthRange },
        { label: '近两个月', value: twoMonthsRange },
        { label: '近三个月', value: threeMonthsRange },
      ];
      app.globalData.dateRange = oneMonthRange;
      this.setData({
        dateRange: dateRange
      });
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
    }

});
