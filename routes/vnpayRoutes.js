const express = require("express")
const router = express.Router()
const { createVNPAYOder, callbackVNPAY } = require("../controllers/vnpayController")

router.post("/create_payment", createVNPAYOder)
router.get("/vnpay_return", callbackVNPAY)

module.exports = router