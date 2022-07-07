const mongoose = require('mongoose')

const PaymentSchema = new mongoose.Schema({
    "status": String,
    "chain": String,
    "coin": String,
    "toPayUSD": Number,
    "toPayCrypto": Number,
    "fromWallet": String,
    "toWallet": String,
    "dateStart": Date,
    "dateEnd": Date,
    "plan": String,
    "mail": String
})

module.exports = mongoose.models.Payment || mongoose.model('Payment', PaymentSchema)