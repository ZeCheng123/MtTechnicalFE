Page({
    data: {
      url: ""
    },
    onLoad(options) {
       console.log(options)
       this.setData({
         url: decodeURIComponent(options?.url)
       })
    },
});
