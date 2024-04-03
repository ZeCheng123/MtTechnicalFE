import gulpError from './utils/gulpError';
App({
    onShow() {
        if (gulpError !== 'gulpErrorPlaceHolder') {
            wx.redirectTo({
                url: `/pages/gulp-error/index?gulpError=${gulpError}`,
            });
        }
    },
    "globalData": {
      "chart": null,
      "mapKey": "2EGBZ-WWYCM-2JV62-6Y3CW-FSHA5-PCBL7",
      "orderList": [
        // {orderNo:"SO#20230720-0001", dispatchNo: "PG232024032701",  type:10, title:"李女士的配送派工单", customerName: "李女士", status: 0, date: "2024/04/8 00:00:00",address:"上海市长宁区江苏路...",userName:"张师傅",postName: "配送司机" },
        // {orderNo:"SO#20230720-0002", dispatchNo: "PG232024032702",  type:20, title:"孙先生的安装派工单", customerName: "孙先生", status: 0, date: "2024/04/8 00:00:00",address:"广州市黄浦区德润路...",userName:"张师傅",postName: "配送司机"}
      ],
      "baseInfo":{
        token: "",
        phone: "",
        name: ""
      }
    }
});
