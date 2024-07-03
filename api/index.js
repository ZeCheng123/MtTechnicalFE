import { request } from './request'
 
module.exports = {
  // 获取请求接口
  loginByPhone: (data) => request('/md/api/auth/login/phone', 'POST', data),

  //获取派工单列表
  getJobList: (data) => request('/md/api/field-job/list', 'POST', data),

  //获取派工单详情
  getJobItem: (data) => request('/md/api/field-job', 'GET', data),

  //更新派工单
  updateJobItem: (data) => request('/md/api/field-job', 'POST', data),


  //获取验证码
  getCaptcha: (data) => request('/md/api/common/captcha', 'POST', data),

  //问题提报
  serviceCase: (data) => request('/md/api/service-case', 'POST', data),


  //获取省市区数据源
  getPickList: (data) => request('/md/api/common/pick-list', 'GET', data),

  //获取订单列表
  getOrderList: (data) => request('/md/api/order/list', 'POST', data),

  //用订单Id获取订单
  getOrderById: (data) => request('/md/api/order', 'GET', data),

  //更新交付任务数据
  updateTask: (data) => request('/md/api/task/update', 'POST', data),

  //动态评论
  comment: (data) => request('/md/api/common/comment', 'POST', data),

  //获取服务工单详情
  getServiceCase: (data) => request('/md/api/service-case', 'GET', data),

  //更新服务工单详情
  updateServiceCase: (data) => request('/md/api/service-case', 'POST', data),

  //获取派工单列表
  getJobListByPage: (data) => request('/md/api/field-job/page', 'POST', data),

  //微信登录授权
  postWechat:(data) => request('/md/api/auth/login/wechat', 'POST', data),

  //验证微信手机号并登录
  postPhoneValidate:(data) => request('/md/api/auth/login/phone-validate', 'POST', data),

  //根据定位获取专卖店
  getStoreValidate:(data) => request('/md/api/common/store', 'GET', data),

  //发货单接口
  postDispatchNote: (data) => request('/md/api/dispatch-note/list', 'POST', data)
}
