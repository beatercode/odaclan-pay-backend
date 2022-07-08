const express = require("express")
const mongoose = require("mongoose")
const Router = require("./routes/routes")
var cron = require('node-cron');
const cors = require('cors')
const port = 3003
const Payment = require("./models/Payment");
const checkPayment = require("./helper/checkPayments")
const checkAndSendMail = require("./helper/mail")
const clearEmpytLink = require("./helper/clearEmpytLink")
const clearOldTx = require("./helper/clearOldTx")

const app = express();

app.use(cors())
app.use(express.json());

mongoose.connect('mongodb+srv://odaclan:ODAclan1!@odaclan.negcqcl.mongodb.net/odaclan?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("Connected successfully");

    var task_clearEmptyLink = cron.schedule('*/5 * * * *', async () => {
        console.log("RUN [task_clearEmptyLink]")
        try {
            await clearEmpytLink()
        } catch (err) {
            console.log(err)
        }

        console.log("END [task_clearEmptyLink]")
    });

    var task_checkPendingPayments = cron.schedule('*/2 * * * *', async () => {
        console.log("RUN [task_checkPendingPayments]")
        try {
            let _status = "pending";
            let payments = await Payment.find({ status: _status })
            //console.log("payments pending:")
            //console.log(payments)

            console.log("FOR [task_checkPendingPayments] N[" + payments.length + "] payments")
            payments.forEach(async payment => {
                await checkPayment(payment)
            });
        } catch (err) {
            console.log(err)
        }
        console.log("END [task_checkPendingPayments]")
    });

    var task_checkSuccessPayments = cron.schedule('*/2 * * * *', async () => {
        console.log("RUN [task_checkSuccessPayments]")
        try {
            let _status = "success";
            let payments = await Payment.find({ status: _status })
            //console.log("payments success:")
            //console.log(payments)

            console.log("FOR [task_checkSuccessPayments] N[" + payments.length + "] payments")
            payments.forEach(async payment => {
                await checkAndSendMail(payment)
            });
        } catch (err) {
            console.log(err)
        }
        console.log("END [task_checkSuccessPayments]")
    });

    var task_clearOldTx = cron.schedule('*/5 * * * *', async () => {
        console.log("RUN [task_clearOldTx]")
        try {
            let _status = "pending";
            let payments = await Payment.find({ status: _status })

            console.log("FOR [task_clearOldTx] N[" + payments.length + "] payments")
            payments.forEach(async payment => {

                await clearOldTx(payment)
            });
        } catch (err) {
            console.log(err)
        }
        console.log("END [task_clearOldTx]")
    });

    task_clearEmptyLink.start();
    task_checkPendingPayments.start();
    task_checkSuccessPayments.start();
    task_clearOldTx.start();
});

app.use(Router);

app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});