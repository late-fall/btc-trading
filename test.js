// fetch('https://api4.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d')
//     .then(res => {
//         console.log(res.json())
//     })

// let url = 'https://api4.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1w';

// fetch(url).then((resp) => resp.json()).then(data =>{
//     console.log(data);
// })

// 86400000 ms is 1 day.


// fetch(url+ new URLSearchParams({
//     vs_currency: 'usd',
//     from: START_TIME,
//     to: CURRENT_TIME
// }))
// .then(response => {
//     if (!response.ok) {
//         throw new Error('Request failed with status ${response.status}')
//     }
//     return response.json()
// })
// .then(data => {
//     let pricesData = data.prices
//     console.log(pricesData)
    
// })
// .catch(error => console.log)