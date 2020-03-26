// 云函数入口文件
const cloud = require('wx-server-sdk');
const {
  ImageClient
} = require('image-node-sdk');

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const fileUrl = event.fileUrl;
  const cardType = event.cardType;
  let AppId = '1301670254'; // 腾讯云 AppId
  let SecretId = 'AKIDSgplSuGH8k6FBsLnBPQCLHyRt78wGt2x'; // 腾讯云 SecretId
  let SecretKey = 'ujKkwtc8QSUJxTkntnKjuufBallW2MTT'; // 腾讯云 SecretKey

  let imgClient = new ImageClient({ AppId, SecretId, SecretKey });

  if (cardType == 0) { // 身份证
    const result = await imgClient.ocrIdCard({
      data: {
        url_list: [fileUrl]
      }
    });

    return JSON.parse(result.body).result_list[0].data;
  } else { // 银行卡
    const result = await imgClient.ocrBankCard({
      data: {
        url: fileUrl
      }
    });

    return JSON.parse(result.body).data.items;
  }
  
}