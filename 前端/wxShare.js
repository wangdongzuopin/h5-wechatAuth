import wx from 'weixin-js-sdk'
import store from '../store'
import axios from 'axios';
import router from '../router';
import {
  Toast
} from 'vant';
import {
  getSignature,getwxdata
} from "@/until/api/wxconfig"

export default {
  isCode(){
     return window.location.search.includes('code=')
  },
  wchatscope(){
    console.log(this.isCode());
    if(this.isCode()){
      this.getuserinfo()
    }else{
      console.log('getCode');
      this.getCode()
    }
  },
  getuserinfo(){
    const url_params = Object.fromEntries(window.location.search.slice(1).split('&').map( v => v.split('=')))
    console.log(url_params);
    axios.post('http://localhost:3000/getuserinfo',{code:url_params.code}).then((res) => {
      console.log(res);
    })
  },
  getCode(){
    axios.get('http://localhost:3000/getCode').then((res) => {
      console.log(res)
      if(res.status == 200){
        window.location.href = res.data
      }
    })
  },
  initConfig (url) {
    console.log(url);
    if (!/micromessenger/i.test(navigator.userAgent)) {
      return
    }
    //如果是 iOS 设备，则使用第一次进入App时的 URL 去请求 wxConfig，不然的话会导致 iOS 中分享的链接不对
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
      //记录第一次进入时的链接，iOS 分享时需要用到
      if (!store.state.theFirstLink) {
        store.commit('SETFIRSTLINK', url)
      } else {
        url = store.state.theFirstLink
      }
    }
    // 将 url 传给后台请求微信签名配置
    // todo 注意修改后台接口地址以及后台返回的数据结构
    getSignature(url).then(res => {
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，
      if (res) {
        var wxdata = res.data
        console.log(wxdata);
        wx.config({
          debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: wxdata.appid,   // 必填，公众号的唯一标识
          nonceStr: wxdata.noncestr,   // 必填，生成签名的随机串
          signature: wxdata.signature, // 必填，签名，见附录1
          timestamp: wxdata.timestamp, // 必填，生成签名的时间戳
          jsApiList: ["updateAppMessageShareData", "updateTimelineShareData", "onMenuShareAppMessage", "onMenuShareTimeline"], // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        })
      }
    })
  },

  share (url, title, desc, imgUrl) {
    if (!/micromessenger/i.test(navigator.userAgent)) {
      return
    }
    //默认分享链接，比如说应用首页
    //todo 注意修改默认的分享参数
    let shareUrl = location.origin + '/'
    if (url) {
      shareUrl = url
    }
    let shareTitle = '默认分享标题'
    if (title) {
      shareTitle = title
    }
    let shareDesc = '默认分享内容'
    if (desc) {
      shareDesc = desc
    }
    let shareImg = '默认分享图片地址'
    if (imgUrl) {
      shareImg = imgUrl
    }

    wx.ready(() => {
      // 如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行
      // 在 weixin-js-sdk 1.4 之后，分享到朋友和朋友圈要分别使用 updateAppMessageShareData，updateTimelineShareData
      // 这里为了兼容老版本的微信，所以把以前的老版本的方法也写上
      wx.updateAppMessageShareData({
        title: shareTitle, // 分享标题
        desc: shareDesc, // 分享描述
        link: shareUrl, // 分享链接 默认以当前链接
        imgUrl: shareImg, // 分享图标
        success: ()=>{
          //分享成功回调，分享成功后要做的事情可以写在这里，比如说上传分享成功信息给服务器，方便做统计
        }
      })
      wx.updateTimelineShareData({
        title: shareTitle,
        link: shareUrl,
        imgUrl: shareImg
      })
      wx.onMenuShareAppMessage({ // 分享给朋友，此方法即将被废弃，改用 updateAppMessageShareData
        title: shareTitle,
        desc: shareDesc,
        link: shareUrl,
        imgUrl: shareImg
      })
      wx.onMenuShareTimeline({ //分享到朋友圈，此方法即将被废弃，改用 updateTimelineShareData
        title: shareTitle,
        link: shareUrl,
        imgUrl: shareImg
      })
      wx.error(res => {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，
        // 具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        console.log(res)
      })
    })
  },
}



