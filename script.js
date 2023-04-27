const currentDate = new Date()
const CURRENT_TIME = currentDate.getTime()
const ONE_YEAR_IN_MILISECONDS = 31536000000
const ONE_MONTH_IN_MILISECONDS = 2628000000

const tablehead = document.querySelector('#tablehead')
const pricetable = document.querySelector('#pricetable')
const result = document.querySelector('#finalresult')
const enterprice = document.querySelector('#enterprice')
const backtestBtn = document.querySelector('#backtestBtn')

//customizable
let START_TIME = 0 //1492825757 //April 22 2014
let MULTIPLIER = 2
let initialAmt = 1000
let selltiming = 12
let startdate = ''
let enddate = ''

function convertTime(UNIX_timestamp) {
    let d = new Date(UNIX_timestamp);
    let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let year = d.getFullYear();
    let month = months[d.getMonth()];
    let date = d.getDate();
    let time = month + ' ' + date + ' ' + year;
    return time;
}

function formatNum(n) {
    return Number(Number(n.toFixed(2))).toLocaleString("en-US")
}

async function getData() {
    let url = 'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?'
    try {
        let res = await fetch(url+ new URLSearchParams({
            vs_currency: 'usd',
            from: START_TIME,
            to: CURRENT_TIME
        }))
        return await res.json()
    } catch (error) {
        console.log(error)
    }
}

async function getPrice() {
    let data = await getData()
    let pricesData = data.prices
    
    let low = pricesData[0][1]
    let longPosition = false
    let buyPrice = 0
    let buyDate = START_TIME
    let profit = 0
    let profitPercent = 0
    let total = initialAmt

    tablehead.innerHTML = '<tr> <th scope="col">Date</th scope="col">'
                            + '<th scope="col">Price</th scope="col">'
                            + '<th scope="col">Buy/Sell</th scope="col">'
                            + '<th scope="col">Profit/Loss $</th scope="col">'
                            + '<th scope="col">Profit/Loss %</th scope="col"></tr>'

    for (let i = 0; i < pricesData.length; i++){
        // pricetable.innerHTML += "<tr><td>" + convertTime(pricesData[i][0]) + "</td><td>" + pricesData[i][1] + "</td></tr>" //display all data
        let price = pricesData[i][1]
        let date = pricesData[i][0]
        if (date > enddate){break}
        if (date < startdate){continue}
        if (!longPosition) {
            if (price >= low * MULTIPLIER){
                longPosition = true
                buyPrice = price
                buyDate = date
                pricetable.innerHTML += '<tr>'
                + `<td>${convertTime(date)}</td><td>${formatNum(price)}</td><td>Buy</td><td></td><td></td>`
                + '</tr>'
            }
            else {
                if (price < low){ low = price }
            }
        }
        else {
            if (date == buyDate + ONE_MONTH_IN_MILISECONDS * selltiming){
                longPosition = false
                low = price
                profit = formatNum(price - buyPrice)
                profitPercent = formatNum((price - buyPrice)/buyPrice * 100)
                pricetable.innerHTML += '<tr>'
                + `<td>${convertTime(date)}</td><td>${formatNum(price)}</td><td>Sell</td><td>${profit}</td><td>${profitPercent}</td>`
                + '</tr>'
                total = total * (profitPercent / 100 + 1)
            }
        }
    }    
    totalPercent = formatNum((total - initialAmt)/initialAmt)
    finalresult.innerHTML += `Total amount as of ${convertTime(CURRENT_TIME)} is $${formatNum(total)} which is ${totalPercent * 100}% when you start with $${formatNum(Number(initialAmt))}.`
    enterprice.innerHTML = `Enter long position when bitcoin is over $${formatNum(low * MULTIPLIER)}.`
}

//backtest Btn
backtestBtn.addEventListener('click', function() {
    
    tablehead.innerHTML = ''
    pricetable.innerHTML = ''
    finalresult.innerHTML = ''
    enterprice.innerHTML = ''

    initialAmt = document.querySelector('#initial').value
    MULTIPLIER = document.querySelector('#multiplier').value
    selltiming = document.querySelector('#selltiming').value
    startdate = document.querySelector('#startdate').value
    enddate = document.querySelector('#enddate').value
    startdate = new Date(startdate).getTime()
    enddate = new Date(enddate).getTime()
    getPrice()
})