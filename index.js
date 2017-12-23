// put your twitter creds in secure-config.js
const secrets = require('./secure-config')
const Twitter = require('twitter')
const client = new Twitter(secrets)
const _ = require('lodash')
const request = require('request-promise')

const id = '961445378'
const stream = client.stream('statuses/filter', { follow: id })
const regex = /Coin of the day:(\s\w+)+/i

request('https://bittrex.com/api/v1.1/public/getmarkets', { json: true }).then(res => res.result)
  .then((markets) => {
    const dictionary = {}
    _.forEach(markets, (val) => {
      if (val.IsActive) {
        const obj = {
          symbol: val.MarketCurrency,
          ticker: val.MarketName,
          long: val.MarketCurrencyLong.toLowerCase(),
          min: val.MinTradeSize
        }
        if (dictionary[val.MarketCurrency.toLowerCase()] === undefined) {
          dictionary[val.MarketCurrency.toLowerCase()] = {}
        }
        if (dictionary[val.MarketCurrencyLong.toLowerCase()] === undefined) {
          dictionary[val.MarketCurrencyLong.toLowerCase()] = {}
        }
        dictionary[val.MarketCurrency.toLowerCase()][val.BaseCurrency] = obj
        dictionary[val.MarketCurrencyLong.toLowerCase()][val.BaseCurrency] = obj
      }
    })
    return dictionary
  })
  .then((dictionary) => {
    stream.on('data', (event) => {
      // uncomment the commented bit below to ensure only McAfee's daily tweet is used
      // (i.e. commented = retweets included; helpful for testing)
      if (/*event.user.id_str === id && */regex.test(event.text)) {
        console.log(event.text.match(regex)[1].trim().toLowerCase())
        const coin = dictionary[event.text.match(regex)[1].trim().toLowerCase()]
        console.log(coin)

        // trade logic here
      }
    })

    stream.on('error', (err) => {
      throw err
    })
  })
