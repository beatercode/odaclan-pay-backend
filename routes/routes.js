const express = require("express");
const Payment = require("../models/Payment");
const app = express();
const checkAndSendMail = require("../helper/mail")
const checkPayment = require("../helper/checkPayments")
const clearEmpytLink = require("../helper/clearEmpytLink")

app.get("/payments", async (request, response) => {
    const payments = await Payment.find({})

    try {
        response.status(200).json({ success: true, data: payments })
    } catch (error) {
        response.status(400).json({ success: false })
    }
});

app.get("/pending-payments", async (request, response) => {
    let _status = request.query.status;
    const payments = await Payment.find({ status: _status })

    try {
        response.status(200).json({ success: true, data: payments })
    } catch (error) {
        response.status(400).json({ success: false })
    }
});

app.get("/check-pending-payments", async (request, response) => {
    let _status = "pending";
    const payments = await Payment.find({ status: _status })

    payments.forEach(async payment => {
        await checkPayment(payment)
    });

    try {
        response.status(200).json({ success: true })
    } catch (error) {
        response.status(400).json({ success: false })
    }
});

app.get("/check-success-payments", async (request, response) => {
    let _status = "success";
    const payments = await Payment.find({ status: _status })

    payments.forEach(async payment => {
        await checkAndSendMail(payment)
    });

    try {
        response.status(200).json({ success: true })
    } catch (error) {
        response.status(400).json({ success: false })
    }
});

app.get("/clear-empty-link", async (request, response) => {

    await clearEmpytLink()

    try {
        response.status(200).json({ success: true })
    } catch (error) {
        response.status(400).json({ success: false })
    }
});

module.exports = app;