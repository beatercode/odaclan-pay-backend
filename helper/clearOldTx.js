require('dotenv').config()
const logger = require("./_logger")
const Payment = require("../models/Payment");
const fns = require('date-fns')

const clearOldTx = async (payment) => {

    let recordTms = payment._id.getTimestamp()
    let isBefore = fns.isBefore(
        new Date(recordTms),
        fns.add(new Date(), { hours: -1 })
    )

    if (isBefore) {
        const updates = await Payment.updateOne({ _id: payment._id }, { $set: { status: "failed" } })
        if (updates.modifiedCount == 0) {
            logger.info("[ERROR] Weird status while deleting. Check payment ID [" + payment._id + "]")
        }
    }

}

module.exports = clearOldTx