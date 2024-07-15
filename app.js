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
      "mapKey": "WIIBZ-TT6RA-O56KR-CJB56-K4FLV-P4BWV",
      "baseInfo":{
        token: "",
        phone: "",
        name: ""
      },
      "dateRange": []
    }
});
