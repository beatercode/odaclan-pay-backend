const Payment = require("../models/Payment");
const nodemailer = require("nodemailer")
const logger = require("./_logger")
require('dotenv').config()

const checkAndSendMail = async (payment) => {

    const senderEmailUser = process.env.SENDER_EMAIL_USR
    const senderEmailPass = process.env.SENDER_EMAIL_PASS
    const samuraiHyperProductID = process.env.SAMURAI_HYPER_PRODUCT_ID
    const samuraiYearHyperProductID = process.env.SAMURAI_YEAR_HYPER_PRODUCT_ID
    const hyperAuthKey = process.env.HYPER_AUTH_KEY
    const emailSubject = 'ODA Clan DAO Payments Review'

    logger.info("[START] - Send Mail - Payment ID [" + payment._id + "]")

    let samuraiHyperLink = null
    let selectedPlan = payment.plan == "yearly" ? samuraiYearHyperProductID : samuraiHyperProductID

    let linkId = ""
    await fetch('https://api.hyper.co/v6/links', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            Authorization: hyperAuthKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ max_usages: 1, nickname: "Samurai Membership", plan: selectedPlan })
    })
        .then(response => response.json())
        .then(response => { linkId = response.id; /* logger.info(response) */ })
        .catch(err => console.error(err));

    const finalLinkUrl = `https://hpr.co/${linkId}`
    //logger.info("finalLinkUrl -> ")
    //logger.info(finalLinkUrl)


    console.log("user [" + senderEmailUser + "] pass [" + senderEmailPass + "]")
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmailUser,
            pass: senderEmailPass
        }
    });

    let textPlan = payment.plan == "yearly" ? "yearly plan" : "monthly plan"

    const mailOptions = {
        from: "ODA Clan",
        to: payment.mail,
        subject: emailSubject,
        text: 'Hi Kyodai! \nWe are happy to say we reviewd your payment application and you fullified the transaction! \n\n'
            + 'Following is your personal link to get Samurai licence for " + textPlan + ": ' + finalLinkUrl + ' \n\n'
            + 'Sincerely,\nODA Clan'
    };

    logger.debug("Im gonna send the EMAIL")
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });

    logger.debug("Will update DB record to completed")
    const updates = await Payment.updateOne({ _id: payment._id }, { $set: { status: "completed" } })
    //logger.debug(updates)

    logger.info("[END] - Send Mail - Payment ID [" + payment._id + "]")
}

module.exports = checkAndSendMail