require("dotenv").config();
const express = require("express");
const axios = require("axios");
axios.defaults.headers.post['accept-encoding'] = "";
const bodyParser = require("body-parser");
const PORT = process.env.SERVER_PORT || 3000;
const SHIELD_FORWARD_URLS = process.env.SHIELD_FORWARD_URLS;
const { confirmResponse } = require("./utils/muon-helpers");
global.MuonAppUtils = require("./muonapp-utils");

const originalForwardUrls = SHIELD_FORWARD_URLS.split(",");
let forwardUrls = originalForwardUrls;

const router = express();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/", (req, res) => {
  res.json({ message: "Muon Light Shield Node" });
});

router.use("*", async (req, res, next) => {
  let mixed = {
    ...req.query,
    ...req.body,
  };
  let { app, method, params = {}, nSign, mode = "sign", gwSign } = mixed;

  if (!["sign", "view"].includes(mode)) {
    return res.json({
      success: false,
      error: { message: "Request mode is invalid" },
    });
  }

  gwSign = false; // do not allow gwSign for shiled nodes
  const requestData = { app, method, params, nSign, mode, gwSign };

    if (forwardUrls.length == 0)
        forwardUrls = originalForwardUrls;

    let forwardUrl = forwardUrls[0];

  const result = await axios
    .post(forwardUrl, requestData)
    .then(({ data }) => data)
      .catch(error=>{
          if (error.code === 'ECONNREFUSED'||error.code === 'ECONNABORTED')
              forwardUrls.shift();
          return res.json({
              success: false,
              error
          });
      });

  if (result.success) {
    try {
      await confirmResponse(requestData, result.result);
    } catch (ex) {
      console.log(ex);
      return res.json({
        success: false,
        error: ex
      });
    }
  }
  return res.json(result);
});

router.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
