
export function calculateGrowthStatsForTickers(tickersWithQuoteAndGrowthCalcs) {

    return tickersWithQuoteAndGrowthCalcs.map(tickerObj => {

        const millOrBillMarketCapCharacter = tickerObj.fundamentals['market_cap'].slice(tickerObj.fundamentals['market_cap'].length - 1)
        
        let marketCapMillionsNumber = +tickerObj.fundamentals['market_cap'].slice(0, tickerObj.fundamentals['market_cap'].length - 2)


        if (millOrBillMarketCapCharacter === 'M') {
            // (already in millions)
        }

        if (millOrBillMarketCapCharacter === 'B')
            marketCapMillionsNumber *= 1000

        // console.log(`market cap number for ${tickerObj.ticker}: ${marketCapMillionsNumber}`)

        if (tickerObj.growth_calculations.revenue &&
        tickerObj.growth_calculations.gross_profit &&
        tickerObj.growth_calculations.net_income
        ) {

            tickerObj.growth_calculations.revenue['t+1y_quarterly_PGpD'] = (tickerObj.growth_calculations.revenue['(t+1y)-max(0_to_t)'] / marketCapMillionsNumber).toFixed(2)
            tickerObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD'] = (tickerObj.growth_calculations.gross_profit['(t+1y)-max(0_to_t)'] / marketCapMillionsNumber).toFixed(2)
            tickerObj.growth_calculations.net_income['t+1y_quarterly_PGpD'] = (tickerObj.growth_calculations.net_income['(t+1y)-max(0_to_t)'] / marketCapMillionsNumber).toFixed(2)
        }
        else
            tickerObj.growth_calculations = { revenue: null, gross_profit: null, net_income: null }

        return tickerObj
    })

}