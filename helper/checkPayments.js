const sendMail = require("../helper/mail")
const fns = require('date-fns')
const Web3 = require('web3')
require('dotenv').config()

const checkPayment = async (payment) => {

    switch (payment.chain) {
        case "TEST":
            switch (payment.coin) {
                case "ETH":
                    checkEVM(payment, process.env.ENDPOINT_RINKEBY)
                    break;
                case "BUSD":
                    checkEVMToken(payment, process.env.ENDPOINT_RINKEBY, process.env.ETH_BUSD_TEST_CONTRACT)
                    break;
            }
            break;
        case "ETHEREUM":
            switch (payment.coin) {
                case "ETH":
                    checkEVM(payment, process.env.ENDPOINT_ETHEREUM)
                    break;
                case "USDC":
                    checkEVMToken(payment, process.env.ENDPOINT_ETHEREUM, process.env.ETH_USDC_CONTRACT)
                    break;
                case "USDT":
                    checkEVMToken(payment, process.env.ENDPOINT_ETHEREUM, process.env.ETH_USDT_CONTRACT)
                    break;
                case "BUSD":
                    checkEVMToken(payment, process.env.ENDPOINT_ETHEREUM, process.env.ETH_BUSD_CONTRACT)
                    break;
            }
            break;
        case "BSC":
            switch (payment.coin) {
                case "BNB":
                    checkEVM(payment, process.env.ENDPOINT_BSC)
                    break;
                case "USDT":
                    checkEVMToken(payment, process.env.ENDPOINT_BSC, process.env.BSC_USDT_CONTRACT)
                    break;
                case "BUSD":
                    checkEVMToken(payment, process.env.ENDPOINT_BSC, process.env.BSC_BUSD_CONTRACT)
                    break;
            }
            break;
        case "SOLANA":
            checkSolTransfer(payment, process.env.ENDPOINT_SOLANA)
            break;
    }
}

const checkSolTransfer = async (payment, endpoint) => {
    let finalUrl = endpoint
        + "?account=" + payment.toWallet
        + "&offset=0&limit=10"

    console.log(finalUrl)

    let txList = []
    await fetch(finalUrl)
        .then(res => res.json())
        //.then(res => txList = res.result)
        .then(res => txList = res.data)

    if (txList == []) return
    for await (let x of txList) {
        if (x.src.toLowerCase() == payment.fromWallet.toLowerCase()) {

            let txStatus = x.status == 'Success'
            if (!txStatus) return
            let txValue = x.lamport * Number(process.env.LAMPORT_PER_SOL)
            let txDate = x.blockTime

            /*
            console.log("Value:"); console.log(txValue)
            console.log("Sent:"); console.log(new Date(txDate * 1000))
            console.log("Max:"); console.log(fns.add(new Date(txDate * 1000), { hours: 3 }))
            console.log("Now:"); console.log(fns.add(new Date(), { hours: 2 }))
            */

            let isEnught = parseFloat(txValue) >= payment.toPayCrypto
            let isBefore = fns.isBefore(
                fns.add(new Date(), { hours: 2 }),
                fns.add(new Date(txDate * 1000), { hours: 3 })
            )
            if (isBefore && isEnught) {
                console.log("TX DONE")
                const updates = await Payment.updateOne({ _id: payment._id }, { $set: { status: "success" } })
                if (updates.modifiedCount == 0) return
                checkAndSendMail(payment);
            }
            break;
        }
    }
}

const checkEVMToken = async (payment, endpoint, tokenContract) => {
    const eth_api = process.env.ETHEREUM_API

    let finalUrl = endpoint + "?module=account&action=tokentx"
        + "&contractaddress=" + tokenContract
        + "&address=" + payment.toWallet
        + "&startblock=0&endblock=99999999&sort=desc"
        + "&apikey=" + eth_api

    let txList = []
    await fetch(finalUrl)
        .then(res => res.json())
        .then(res => txList = res.result)

    if (txList == []) return
    for await (let x of txList) {
        if (x.from.toLowerCase() == payment.fromWallet.toLowerCase()) {

            let txStatus = x.confirmations > 1
            if (!txStatus) return
            let txValue = Web3.utils.fromWei(x.value, 'ether')
            let txDate = x.timeStamp

            //console.log("Value:"); console.log(txValue)
            //console.log("Sent:"); console.log(new Date(txDate * 1000))
            //console.log("Max:"); console.log(fns.add(new Date(txDate * 1000), { hours: 3 }))
            //console.log("Now:"); console.log(new Date())

            let isEnught = parseFloat(txValue) >= payment.toPayCrypto
            let isBefore = fns.isBefore(
                new Date(),
                fns.add(new Date(txDate * 1000), { hours: 3 })
            )
            if (isBefore && isEnught) {
                console.log("TX DONE")
                const updates = await Payment.updateOne({ _id: payment._id }, { $set: { status: "success" } })
                if (updates.modifiedCount == 0) return
                checkAndSendMail(payment);
            }
            break;
        }
    }
}

const checkEVM = async (payment, endpoint) => {
    const eth_api = process.env.ETHEREUM_API

    let finalUrl = endpoint + "?module=account&action=txlist&"
        + "address=" + payment.toWallet + "&"
        + "startblock=0&endblock=99999999&sort=desc&"
        + "apikey=" + eth_api

    let txList = []
    try {
        await fetch(finalUrl)
            .then(res => res.json())
            .then(res => txList = res.result)

        if (txList == []) return
        for await (let x of txList) {
            if (x.from.toLowerCase() == payment.fromWallet.toLowerCase()) {

                let txStatus = x.txreceipt_status
                if (!txStatus) return
                let txValue = Web3.utils.fromWei(x.value, 'ether')
                let txDate = x.timeStamp
                /*
                console.log("Sent:"); console.log(new Date(txDate * 1000))
                console.log("Max:"); console.log(fns.add(new Date(txDate * 1000), { hours: 3 }))
                console.log("Now:"); console.log(fns.add(new Date(), { hours: 2 }))
                */
                let isEnught = parseFloat(txValue) >= payment.toPayCrypto
                let isBefore = fns.isBefore(
                    fns.add(new Date(), { hours: 2 }),
                    fns.add(new Date(txDate * 1000), { hours: 3 })
                )
                if (isBefore && isEnught) {
                    console.log("TX DONE")
                    const updates = await Payment.updateOne({ _id: payment._id }, { $set: { status: "success" } })
                    if (updates.modifiedCount == 0) return
                    checkAndSendMail(payment);
                }
                break;
            }
        }
    } catch (err) {
        console.log("[ERR] errore in checkPayments --->")
        console.log(err)
    }
}

module.exports = checkPayment