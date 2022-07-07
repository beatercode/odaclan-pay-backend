const http = require('http');
var cron = require('node-cron');
const Payment = require("./models/Payment");
const checkAndSendMail = require("./helper/mail")
const clearEmpytLink = require("./helper/clearEmpytLink")

const hostname = '127.0.0.1';
const port = 3010;

var task_clearEmptyLink = cron.schedule('*/30 * * * *', async () => {
    console.log("RUN [task_clearEmptyLink]")

    await clearEmpytLink()

    console.log("END [task_clearEmptyLink]")
});
var task_checkPendingPayments = cron.schedule('*/2 * * * *', async () => {
    console.log("RUN [task_checkPendingPayments]")
    let _status = "pending";
    let payments = await Payment.find({ status: _status })

    console.log("FOR [task_checkPendingPayments] N[" + payments.length + "] payments")
    payments.forEach(async payment => {
        await checkPayment(payment)
    });
    console.log("END [task_checkPendingPayments]")
});

var task_checkSuccessPayments = cron.schedule('*/2 * * * *', async () => {
    console.log("RUN [task_checkSuccessPayments]")
    let _status = "success";
    let payments = await Payment.find({ status: _status })

    console.log("FOR [task_checkSuccessPayments] N[" + payments.length + "] payments")
    payments.forEach(async payment => {
        await checkAndSendMail(payment)
    });
    console.log("END [task_checkSuccessPayments]")
});

task_clearEmptyLink.start();
task_checkPendingPayments.start();
task_checkSuccessPayments.start();

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World');
});

server.listen(port, hostname, () => {
    console.log(`Server running at https://${hostname}:${port}/`);
});