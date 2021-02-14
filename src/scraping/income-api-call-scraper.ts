import * as fetch from 'node-fetch';
const clonedeep = require('lodash.clonedeep')

const quarterlyIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?s=IQ&t='
const annualIncomeStatementsBaseUrl = 'https://elite.finviz.com/api/statement.ashx?t='

export async function getTickerListWithIncomeDataApiCalls(tickersWithQuoteData) {

    const tickersWithNoIncomeData = []

    // const annualIncomeStatementApiCalls = tickersWithQuoteData.map((tickerObj, index) => {
    //     const annualUrl = annualIncomeStatementsBaseUrl + tickerObj['ticker']
    //     return new Promise(resolve => setTimeout(resolve, 70 * index)).then(() => fetch(annualUrl)
    //         .then(response => response.json())
    //         .catch(err => {
    //             console.log('uh oh, error calling for annual statements: ', err)
    //         }));
    // })

    const quarterlyIncomeStatementApiCalls = tickersWithQuoteData.map((tickerObj, index) => {
        const quarterlyUrl = quarterlyIncomeStatementsBaseUrl + tickerObj['ticker']

        console.log('built a new quarterly url: ', quarterlyUrl)
        return new Promise(resolve => setTimeout(resolve, 75 * index)).then(() => fetch(quarterlyUrl)
            .then(response => response.json())
            .catch(err => {
                console.log('uh oh, error calling for quarterly statements: ', err)
            }));

    })

    console.log('calling for annual income Statements...')
    // const annualIncomeStatements = await Promise.all(annualIncomeStatementApiCalls)
    // console.log('calling for quarterly income Statements...')
    // const quarterlyIncomeStatements = await Promise.all(quarterlyIncomeStatementApiCalls)


    // const annualIncomeStatements = annualIncomeStatementApiCalls.forEach(async (apiCall) => {
    // const annualIncomeStatements = 

    // const annualIncomeHolder = {}

    // for await (let [index, apiCall] of annualIncomeStatementApiCalls.entries()) {

    //     const result = await apiCall;
    //     const niceResult = makeObjectKeysNice(result)

    //     // console.log('got annual income data for: ', index, ' ', tickersWithQuoteData[index].ticker, ' ', niceResult)

    //     annualIncomeHolder[tickersWithQuoteData[index].ticker] = niceResult;

    //     if (index % 100 === 0)
    //         console.log('got annual income data, on index: ', index);
    // }

    const quarterlyIncomeHolder = {}

    for await (let [index, apiCall] of quarterlyIncomeStatementApiCalls.entries()) {

        const result = await apiCall;
        const niceResult = makeObjectKeysNice(result, tickersWithQuoteData[index].ticker)

        // console.log('got some income data for ', tickersWithQuoteData[index].ticker, ' ', niceResult);
        
        quarterlyIncomeHolder[tickersWithQuoteData[index].ticker] = niceResult;

        if (index % 100 === 0)
            console.log('got quarterly income data: ', index);
        // console.log('got quarterly income data for: ', index, ' ', tickersWithQuoteData[index].ticker, ' ', niceResult);
    }

    const tickersWithIncomeData = tickersWithQuoteData.map((tickerObj, currentIndex) => {

       if (!quarterlyIncomeHolder[tickerObj.ticker].data)
            tickersWithNoIncomeData.push(tickerObj.ticker)

        return {
            ...clonedeep(tickerObj),
            income_statements: {
                ticker: tickersWithQuoteData[currentIndex].ticker,
                quarterly: quarterlyIncomeHolder[tickerObj.ticker],
                // annual: annualIncomeHolder[tickerObj.ticker]
            }
        }
    })

    return [tickersWithIncomeData, tickersWithNoIncomeData]

}

function makeObjectKeysNice(obj, ticker) {

    if (!obj || obj.error) {

        console.log('no income statements for: ', ticker)
        return {
            currency: null,
            data: null
        }
    }

    return {
        currency: obj.currency,
        data: Object.entries(obj.data).reduce((finalObj, [key, val]) => {
            const validKey = key.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_')
            finalObj[validKey] = val
            return finalObj
        }, {})
    }
}
