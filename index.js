const app =require('express')()
const { default: axios } = require('axios')
const bodyParser =require('body-parser')
const cors = require('cors')
require('dotenv').config()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false}))
app.use(cors())


app.get('/',async (req,res) =>{
    res.send('ok')
})
// 在确保微信公众账号拥有授权作用域（scope参数）的权限的前提下（服务号获得高级接口后，默认拥有scope参数中的snsapi_base和snsapi_userinfo），引导关注者打开如下页面：
// https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect 若提示“该链接无法访问”，请检查参数是否填写错误，是否拥有scope参数对应的授权作用域权限。
app.get('/getCode',async(req,res) =>{
    let url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.APPID}&redirect_uri=${encodeURIComponent('http://10.168.2.247:8080')}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
    res.send(url)
})

// code说明 ： code作为换取access_token的票据，每次用户授权带上的code将不一样，code只能使用一次，5分钟未被使用自动过期。
// 用户同意授权后获取用户信息
app.post('/getuserinfo',async(req,res) =>{

    const code = req.body.code;
    let access_token_url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${process.env.APPID}&secret=${process.env.APPSECRET}&code=${code}&grant_type=authorization_code`
    // 通过code换取网页授权access_token
    let token = (await axios.get(access_token_url)).data.access_token
    // 拉取用户信息(需scope为 snsapi_userinfo)
    let userinfo = `https://api.weixin.qq.com/sns/userinfo?access_token=${token}&openid=${process.env.APPID}&lang=zh_CN`

    let user = (await axios.get(userinfo)).data
    // 发出数据
    res.send(user)
})

// 自定义监听本地
app.listen(3000,() =>{
    console.log('http://localhost:3000');
})