const currentDate = new Date()
const CURRENT_TIME = currentDate.getTime()
const ONE_MONTH_IN_MILISECONDS = 2628000000

const tablehead = document.querySelector('#tablehead')
const pricetable = document.querySelector('#pricetable')
const result = document.querySelector('#finalresult')
const enterprice = document.querySelector('#enterprice')
const backtestBtn = document.querySelector('#backtestBtn')
const currentprice = document.querySelector('#currentprice')

//customizable inputs
let START_TIME = 0 //1492825757 //April 22 2014
let MULTIPLIER = 2
let initialAmt = 1000
let selltiming = 12
let startdate = ''
let enddate = ''

let buyDates = []
let sellDates = []

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

//Using coingecko API to get bitcoin historical price data.
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

//calculation then chart
async function backTest() {
    let data = await getData()
    let pricesData = data.prices
    
    let low = pricesData[0][1]
    let longPosition
    let buyPrice = 0
    let buyDate = START_TIME
    let profitPercent = 0
    let total = initialAmt
    let bought = false

    let prices = []
    let dates = []

    tablehead.innerHTML = '<tr> <th class="w-1/4" scope="col">Date</th scope="col">'
                            + '<th class="w-1/4" scope="col">Price</th scope="col">'
                            + '<th class="w-1/6" scope="col">Buy/Sell</th scope="col">'
                            + '<th class="w-1/4" scope="col">Profit/Loss %</th scope="col"></tr>'

    for (let i = 0; i < pricesData.length; i++){
        let price = pricesData[i][1]
        let date = pricesData[i][0]
        if (!longPosition) {
            if (price >= low * MULTIPLIER){
                longPosition = true
                buyPrice = price
                buyDate = date
                if (date >= startdate && date < enddate){
                    pricetable.innerHTML += '<tr>'
                    + `<td>${convertTime(date)}</td><td>${formatNum(price)}</td><td>Buy</td><td></td><td></td>`
                    + '</tr>'
                    buyDates.push(convertTime(date))
                    bought = true
                }
            }
            else {
                if (price < low){ low = price }
            }
        }
        else {
            if (date == buyDate + ONE_MONTH_IN_MILISECONDS * selltiming){
                longPosition = false
                low = price
                if (date >= startdate && date < enddate && bought){
                    profit = formatNum(price - buyPrice)
                    profitPercent = formatNum((price - buyPrice)/buyPrice * 100)
                    pricetable.innerHTML += '<tr>'
                    + `<td>${convertTime(date)}</td><td>${formatNum(price)}</td><td>Sell</td><td>${profitPercent} %</td>`
                    + '</tr>'
                    total = total * (profitPercent / 100 + 1)
                    sellDates.push(convertTime(date))
                    bought = false
                }
            }
        }
        if (date >= startdate && date < enddate){
            prices.push(price)
            dates.push(convertTime(date))
        }
    }    
    totalPercent = (total - initialAmt)/initialAmt
    finalresult.innerHTML += `Total amount as of ${convertTime(CURRENT_TIME)} is $${formatNum(Number(total))} which is ${formatNum(totalPercent * 100)}% when you start with $${formatNum(Number(initialAmt))}.`
    enterprice.innerHTML = `Enter long position when bitcoin price ($USD) is over <strong>$${formatNum(low * MULTIPLIER)}.</strong>`
    currentprice.innerHTML = `Current bitcoin is <strong>$${formatNum(pricesData.at(-1)[1])}.</strong>`

    chartData(prices, dates)
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
    backTest()
})

//chart function
async function chartData(prices, dates){
    const ctx = document.getElementById('myChart');

    let chartInstance = Chart.getChart("myChart")
    if (chartInstance != undefined){
        chartInstance.destroy()
    }

    let total = 0
    let count = 0
    let buyIndex = []
    let sellIndex = []
    
    //get index of buyDates 
    for (let i = 0; i <dates.length; i ++){
        if (buyDates.includes(dates[i])){
            buyIndex.push(i)
        }
        else if (sellDates.includes(dates[i])){
            sellIndex.push(i)
        }
    }

    prices.forEach((item) => {
        total += item
        count++
    })

    let avg = total/count
    let difUp = Math.max.apply(null, prices) - avg

    let myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: dates,
        datasets: [{
        label: 'BTC/USD price ($)',
        data: prices,
        borderWidth: 1
        }
        ]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: '#ffffff',
                    font: {
                        size: 16,
                        family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
                    }
                }
            },
            subtitle: {
                display: true,
                text: '🟢 BUY         🔴 SELL',
                position: 'bottom',
                color: '#Ffffff'
            },
        },
        elements: {
            line: {
                borderColor: '#Ffffff',
                backgroundColor: 'Ffffff'
            },
            point: {
                radius: function(context){
                    let index = context.dataIndex
                    for (let i=0; i < buyIndex.length; i++){
                        if (index == buyIndex[i]) {
                            return 7
                        }
                    }
                    for (let i=0; i < sellIndex.length; i++){
                        if (index == sellIndex[i]) {
                            return 7
                        }
                    }
                    return 0
                },
                backgroundColor: function(context){
                    let index = context.dataIndex
                    for (let i=0; i < buyIndex.length; i++){
                        if (index == buyIndex[i]) {
                            return '#11b751'
                        }
                    }
                    for (let i=0; i < sellIndex.length; i++){
                        if (index == sellIndex[i]) {
                            return '#F13b3b'
                        }
                    }
                    return '#F1e3e3'
                },
                hitRadius: 10,
                hoverRadius: function(context){
                    let index = context.dataIndex
                    for (let i=0; i < buyIndex.length; i++){
                        if (index == buyIndex[i]) {
                            return 13
                        }
                    }
                    for (let i=0; i < sellIndex.length; i++){
                        if (index == sellIndex[i]) {
                            return 13
                        }
                    }
                    return 3
                }
            }
        },
        scales: {
            y: {
                max: avg + difUp * 1.25,
                min: 0
            }
        }
        }
    });

}
