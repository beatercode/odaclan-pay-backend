
async function modificaLink(linkID) {
    fetch(`https://api.hyper.co/v6/links/${linkID}`, {
        method: 'PATCH',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${hyper_key}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            active: true,
            expiration_date: "07/15/2022"
        })
    })
        .then(response => response.json())
        //.then(response => console.log(response))
        .catch(err => console.error(err));
}

const hyper_key = "sk_P34fz5LfpsjkroJLseUhptBQcx0ejw4o"
const linkID_SamuraiMemberShip_FIAT_MENSE = "EoRIjkW4OPVsMFv3v0YXj"
const linkID_SamuraiMemberShip_FIAT_ANNO = "m38ikmfLRaBsL93s0G153"
//modificaLink(linkID_SamuraiMemberShip_FIAT_MENSILE)
//modificaLink(linkID_SamuraiMemberShip_FIAT_ANNO)