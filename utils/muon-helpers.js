const soliditySha3 = require("../muonapp-utils/utils/soliditySha3");
const crypto = require("../muonapp-utils/utils/crypto");

async function runMounApp(request) {
  console.log(request);
  const { app, method, params = {} } = request;
  //TODO: throw an err if app not exists
  let muonApp = require(`../muon-apps/${app}.js`);

  let newRequest = {
    app,
    method,
    data: { params: params },
  };
  let result = await muonApp.onRequest(newRequest);
  let hash1, hash2, reqId;
  const appSignParams = muonApp.signParams(newRequest, result);

  return appSignParams;
}

async function confirmResponse(requestData, appResponse) {
  // response hash without appId and reqId
  const responseHash = soliditySha3(appResponse.data.signParams.slice(2));
  appResponse.shieldAddress = process.env.SIGN_WALLET_ADDRESS;

  const appSignParams = await runMounApp(requestData);
  const shieldHash = soliditySha3(appSignParams);

  if(shieldHash != responseHash){
    throw {message: `Shield node confirmation failed`}
  }

  // sha3 of all of the parameters
  let hashToBeSigned = soliditySha3(appResponse.data.signParams);
  let cryptoSign = crypto.sign(hashToBeSigned);
  appResponse.shieldSignature = cryptoSign;
  appResponse.nodeSignature = cryptoSign;
}

module.exports = {
  confirmResponse,
};
