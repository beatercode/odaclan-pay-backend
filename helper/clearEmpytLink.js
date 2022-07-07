require('dotenv').config()
const logger = require("./_logger")

const clearEmpytLink = async () => {

    const hyperAuthKey = process.env.HYPER_AUTH_KEY

    let linkList = null;
    await fetch('https://api.hyper.co/v6/links', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: hyperAuthKey
        }
    })
        .then(response => response.json())
        .then(response => linkList = response)
        .catch(err => console.error(err));

    linkList = linkList.data
    if (linkList != null) {
        for (let x of linkList) {
            if (x.remaining_stock == 0) {
                let linkID = x.id
                await fetch(`https://api.hyper.co/v6/links/${linkID}`, {
                    method: 'PATCH',
                    headers: {
                        Accept: 'application/json',
                        Authorization: hyperAuthKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ active: false })
                })
                    .then(response => response.json())
                    .catch(err => console.error(err));
            }
        }
    }

}

module.exports = clearEmpytLink