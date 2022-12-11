require("dotenv").config();
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const PORT = process.env.SERVER_PORT || 3000;
const SHIELD_FORWARD_URL = process.env.SHIELD_FORWARD_URL;
const { confirmResponse } = require("./utils/muon-helpers");
global.MuonAppUtils = require("./muonapp-utils");

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

  // console.log(`forwarding request to ${SHIELD_FORWARD_URL}`, requestData);
  const result = await axios
    .post(SHIELD_FORWARD_URL, requestData)
    .then(({ data }) => data);

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
