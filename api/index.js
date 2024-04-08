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


}
