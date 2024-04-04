import * as echarts from "../../../components/ec-canvas/echarts"
const api = require('../../../api/index')
const app = getApp();
Page({
    data: {
      city2Text: '这个月',
      city2Value: ['这个月'],
      city2Title: '',
      citys: [
        { label: '这个月', value: '这个月' },
        { label: '近两个月', value: '近两个月' },
        { label: '近三个月', value: '近三个月' },
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
      orderList: []
    },
    onLoad(options) {
      // var that = this;
      // setTimeout(() => {
      //   that.setData({
      //     "ec.onInit":  that.initChart,
      //   });
      // }, 66);
    },
    onShow(){
      this.getJobList();
    },
    onColumnChange(e) {
      console.log('picker pick:', e);
    },
    onPickerChange(e) {
      const { key } = e.currentTarget.dataset;
      const { value } = e.detail;
      console.log('picker change:', e.detail);
      this.setData({
        [`${key}Visible`]: false,
        [`${key}Value`]: value,
        [`${key}Text`]: value.join(' '),
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
    onTitlePicker() {
      this.setData({ cityVisible: true, cityTitle: '选择城市' });
    },

    getJobList(){
      let param = {
        "fieldJobType__c": "",
        "appointmentEndTime": "",
        "status": ""
      }
      api.getJobList(param).then(res =>{
        if(res.code == "success"){
          let list = res.data || [];
          let toBeginCount = list.filter(val => val["status"] == "0").length;
          let toInProgressCount = list.filter(val => val["status"] == "1").length;
          let toDoneCount = list.filter(val => val["status"] == "2").length;
          let chartData = [
            { value: toBeginCount, name: '待开始' },
            { value: toInProgressCount, name: '进行中' },
            { value: toDoneCount, name: '已完成' }
          ];
          this.setData({
            orderList: list.filter(val => val["status"] == "0"),
            "ec.onInit":  this.initChart,
            chartData: chartData
          });
          console.log(chartData)
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
          })
          Toast({
            context: this,
            selector: '#t-toast',
            message: res.message,
          });
        }
      })
    },

    onWithoutTitlePicker() {
      this.setData({ city2Visible: true, city2Title: '' });
    },

    initChart(canvas, width, height, dpr) {
      var that = this;
      app.globalData.chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr // new
      });
      canvas.setChart(app.globalData.chart);
    
      var option = {
        title: {
          text: that.data.chartData.find(val => val.name == "待开始")?.value,  
          left: "25%",//对齐方式居中
          top: "42%",//距离顶部
          textStyle: {//文字配置
            color: "#FFC327",//文字颜色
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
      app.globalData.chart.setOption(option);
      setTimeout(() => {
        app.globalData.chart.on('legendselectchanged', function(params) {
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
          app.globalData.chart.setOption(option);
        });
      }, 0);
      return app.globalData.chart;
    },

    onClickListItem(event){
      let item = event.currentTarget.dataset.item;
      // 在当前 TabBar 页面的事件处理函数中进行跳转操作
      wx.navigateTo({
        url: '/pages/custom/joborder_details/joborder_details?id=' + item.id   // 跳转到非 TabBar 页面的路径
      });      
    },

});
