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
      "baseInfo":{
        token: "",
        phone: "",
        name: ""
      },
      "dateRange": []
    }
});
