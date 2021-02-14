
const MAXIMUM_NET_PROFIT_RATIO = 20;
const MINIMUM_NET_PROFIT_RATIO = -1;

const MAXIMUM_GROSS_PROFIT_RATIO = 20;
const MINIMUM_GROSS_PROFIT_RATIO = -1;

const MAXIMUM_REVENUE_RATIO = 20;
const MINIMUM_REVENUE_RATIO = -1;

/**
 * @param { Array<TtStats> } tickerDataWithGrowthCalcs - calc'd growth raios object with arrays of pre-ranking'ed stats objects
 * 
 * @returns { Array<TtStats | RankingsMaxesAndMins> } 
 * 
 * maxesAndMins and straight up mathematical comparison maxes and mins
 *
 * rankings takes into account upwards or downwards
 */
export function calculateRankings(tickerDataWithGrowthCalcs) {

    console.log(`Calculating rankings for ${tickerDataWithGrowthCalcs.length} objects.`)

    const rankingsMaxMinsHolder = {
        revenue: {
            max: -Infinity,
            min: Infinity
        },
        gross_profit: {
            max: -Infinity,
            min: Infinity

        },
        net_income: {
            max: -Infinity,
            min: Infinity
        }
    }

    const filterdDataWithGrowthCalcs = tickerDataWithGrowthCalcs.filter(tickerObj => {

        if (!tickerObj || !tickerObj.growth_calculations ||
            !tickerObj.growth_calculations.revenue ||
            !tickerObj.growth_calculations.gross_profit ||
            !tickerObj.growth_calculations.net_income
        ) {

            console.log('filtering out 1 (no calcs): ', tickerObj.ticker)
            // console.log('filtering out 1 (no calcs): ', tickerObj)
            return false
        }

        if (+tickerObj.growth_calculations.revenue['t+1y_quarterly_PGpD'] === Infinity ||
            +tickerObj.growth_calculations.revenue['t+1y_quarterly_PGpD'] === -Infinity ||
            +tickerObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD'] === Infinity ||
            +tickerObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD'] === -Infinity ||
            +tickerObj.growth_calculations.net_income['t+1y_quarterly_PGpD'] === Infinity ||
            +tickerObj.growth_calculations.net_income['t+1y_quarterly_PGpD'] === -Infinity) {
            console.log('filtering out 2 (infinite PGpD): ', tickerObj.ticker)
            // console.log('filtering out 2 (infinite PGpD): ', tickerObj)
            return false
        }
        // else {
        //     // console.log('filtering out symbol: ', tickerObj.symbol)
        //     return false
        // }

        if (isNaN(+tickerObj.growth_calculations.revenue['t+1y_quarterly_PGpD']) ||
            isNaN(+tickerObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD']) ||
            isNaN(+tickerObj.growth_calculations.net_income['t+1y_quarterly_PGpD'])) {
            // console.log('filtering out 3 (NaN PGpD): ', tickerObj)
            console.log('filtering out 3 (NaN PGpD): ', tickerObj.ticker)
            return false
        }


        // +tickerObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD'] === 0 &&
        // +tickerObj.growth_calculations.net_income['t+1y_quarterly_PGpD'] === 0)
        // ) {
        //     // console.log('symbol ', tickerObj.symbol, ' is ok!')
        return true
        // }
        // else {
        //     // console.log('filtering out symbol: ', tickerObj.symbol)
        //     console.log('filtering out 2: ', tickerObj)
        //     return false
        // }
    })

    // 'AAAU', 'AACQ', 'AAU', 'AAXJ', 'AADR
    // console.log('ticker data with ', tickerDataWithGrowthCalcs)

    filterdDataWithGrowthCalcs
        .forEach(stockObj => {

            let revenue_quarterly_1y_PGdP = stockObj.growth_calculations.revenue['t+1y_quarterly_PGpD']
            let gross_profit_quarterly_1y_PGdP = stockObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD']
            let net_income_quarterly_1y_PGdP = stockObj.growth_calculations.net_income['t+1y_quarterly_PGpD']

            // console.log('filling rankings for ', stockObj.symbol, ' ', revenue_quarterly_1y_PGdP, ', ', gross_profit_quarterly_1y_PGdP, ', ', net_income_quarterly_1y_PGdP, ', ')

            // revenue
            if (revenue_quarterly_1y_PGdP &&
                !isNaN(revenue_quarterly_1y_PGdP) &&
                revenue_quarterly_1y_PGdP !== Infinity &&
                revenue_quarterly_1y_PGdP !== -Infinity) {

                if (revenue_quarterly_1y_PGdP === "-0.00")
                    revenue_quarterly_1y_PGdP = 0

                if (+revenue_quarterly_1y_PGdP > +rankingsMaxMinsHolder.revenue.max)
                    rankingsMaxMinsHolder.revenue.max = revenue_quarterly_1y_PGdP

                // console.log('comparing 2: ', +revenue_quarterly_1y_PGdP, ' and ', +rankingsMaxMinsHolder.revenue.min)
                // console.log('comparing 2: ', Number(revenue_quarterly_1y_PGdP) < Number(rankingsMaxMinsHolder.revenue.min))

                if (Number(revenue_quarterly_1y_PGdP) < Number(rankingsMaxMinsHolder.revenue.min))
                    rankingsMaxMinsHolder.revenue.min = revenue_quarterly_1y_PGdP

                if (+rankingsMaxMinsHolder.revenue.max > +MAXIMUM_REVENUE_RATIO)
                    rankingsMaxMinsHolder.revenue.max = MAXIMUM_REVENUE_RATIO

                if (+rankingsMaxMinsHolder.revenue.min < +MINIMUM_REVENUE_RATIO)
                    rankingsMaxMinsHolder.revenue.min = MINIMUM_REVENUE_RATIO

                // console.log('min rev now: ', rankingsMaxMinsHolder.revenue.min)
                // console.log('max rev now: ', rankingsMaxMinsHolder.revenue.max)
            }

            // gross profit
            if (gross_profit_quarterly_1y_PGdP &&
                !isNaN(gross_profit_quarterly_1y_PGdP) &&
                gross_profit_quarterly_1y_PGdP !== Infinity &&
                gross_profit_quarterly_1y_PGdP !== -Infinity) {

                // if (gross_profit_quarterly_1y_PGdP === "-0.00") {
                //     console.log('it\'s negative zero?')
                //     gross_profit_quarterly_1y_PGdP = '0'
                // }

                if (+gross_profit_quarterly_1y_PGdP > +rankingsMaxMinsHolder.gross_profit.max)
                    rankingsMaxMinsHolder.gross_profit.max = gross_profit_quarterly_1y_PGdP

                if (+gross_profit_quarterly_1y_PGdP < +rankingsMaxMinsHolder.gross_profit.min)
                    rankingsMaxMinsHolder.gross_profit.min = gross_profit_quarterly_1y_PGdP

                if (+rankingsMaxMinsHolder.gross_profit.max > MAXIMUM_GROSS_PROFIT_RATIO)
                    rankingsMaxMinsHolder.gross_profit.max = MAXIMUM_GROSS_PROFIT_RATIO

                if (+rankingsMaxMinsHolder.gross_profit.min < MINIMUM_GROSS_PROFIT_RATIO)
                    rankingsMaxMinsHolder.gross_profit.min = MINIMUM_GROSS_PROFIT_RATIO

                // console.log('min gross profit now: ', rankingsMaxMinsHolder.gross_profit.min)
                // console.log('max gross profit now: ', rankingsMaxMinsHolder.gross_profit.max)
            }

            // net_income 
            if (net_income_quarterly_1y_PGdP &&
                !isNaN(net_income_quarterly_1y_PGdP) &&
                net_income_quarterly_1y_PGdP !== Infinity &&
                net_income_quarterly_1y_PGdP !== -Infinity) {

                if (net_income_quarterly_1y_PGdP === "-0.00")
                    net_income_quarterly_1y_PGdP = 0

                if (+net_income_quarterly_1y_PGdP > +rankingsMaxMinsHolder.net_income.max)
                    rankingsMaxMinsHolder.net_income.max = net_income_quarterly_1y_PGdP

                if (+net_income_quarterly_1y_PGdP < +rankingsMaxMinsHolder.net_income.min)
                    rankingsMaxMinsHolder.net_income.min = net_income_quarterly_1y_PGdP

                if (+rankingsMaxMinsHolder.net_income.max > +MAXIMUM_NET_PROFIT_RATIO)
                    rankingsMaxMinsHolder.net_income.max = MAXIMUM_NET_PROFIT_RATIO

                if (+rankingsMaxMinsHolder.net_income.min < +MINIMUM_NET_PROFIT_RATIO)
                    rankingsMaxMinsHolder.net_income.min = MINIMUM_NET_PROFIT_RATIO

                // console.log('min net_income now: ', rankingsMaxMinsHolder.net_income.min)
                // console.log('max net_income now: ', rankingsMaxMinsHolder.net_income.max)
            }

        });

    // console.log(`mins and maxes: `, rankingsMaxMinsHolder)

    const rankedStatsArray = filterdDataWithGrowthCalcs
        .map(stockObj => {

            const revenue_quarterly_1y_PGdP = stockObj.growth_calculations.revenue['t+1y_quarterly_PGpD']
            const gross_profit_quarterly_1y_PGdP = stockObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD']
            const net_income_quarterly_1y_PGdP = stockObj.growth_calculations.net_income['t+1y_quarterly_PGpD']

            let revenueRanking = 0
            let grossProfitRanking = 0
            let netProfitRanking = 0

            // console.log(`calculating rankings for: ${stockObj.symbol}`)

            if (revenue_quarterly_1y_PGdP &&
                !isNaN(revenue_quarterly_1y_PGdP) &&
                revenue_quarterly_1y_PGdP !== Infinity &&
                revenue_quarterly_1y_PGdP !== -Infinity) {

                const revenueDistFromMin = revenue_quarterly_1y_PGdP - rankingsMaxMinsHolder.revenue.min
                const revenueDistFromMax = rankingsMaxMinsHolder.revenue.max - revenue_quarterly_1y_PGdP

                revenueRanking = (revenueDistFromMin === revenueDistFromMax) ?
                    1 : revenueDistFromMin / (revenueDistFromMin + revenueDistFromMax)

                if (!revenueRanking || revenueRanking < 0)
                    revenueRanking = 0

                if (revenueRanking > 1)
                    revenueRanking = 1

                // console.log('caculating rev ranking: ', stockObj.symbol, ' ', revenueDistFromMin, ' ', revenueDistFromMax)
                // console.log('caculating rev ranking: ', revenue_quarterly_1y_PGdP, 'h  max: ', rankingsMaxMinsHolder.revenue.max, 'min: ', rankingsMaxMinsHolder.revenue.min, ' ', stockObj.symbol, ' ', revenueDistFromMax, ' ', revenueDistFromMin)
            }

            if (gross_profit_quarterly_1y_PGdP &&
                !isNaN(gross_profit_quarterly_1y_PGdP) &&
                gross_profit_quarterly_1y_PGdP !== Infinity &&
                gross_profit_quarterly_1y_PGdP !== -Infinity) {
                const grossProfitDistFromMin = gross_profit_quarterly_1y_PGdP - rankingsMaxMinsHolder.gross_profit.min
                const grossProfitDistFromMax = rankingsMaxMinsHolder.gross_profit.max - gross_profit_quarterly_1y_PGdP

                grossProfitRanking = (grossProfitDistFromMin === grossProfitDistFromMax) ?
                    1 : grossProfitDistFromMin / (grossProfitDistFromMin + grossProfitDistFromMax)

                if (!grossProfitRanking || grossProfitRanking < 0)
                    grossProfitRanking = 0

                if (grossProfitRanking > 1)
                    grossProfitRanking = 1

                // console.log('caculating gross p ranking: ', gross_profit_quarterly_1y_PGdP, ' ', stockObj.symbol, ' ', grossProfitDistFromMin, ' ', grossProfitDistFromMax)
                // console.log('caculating gross p ranking: ', gross_profit_quarterly_1y_PGdP, 'h  max: ', rankingsMaxMinsHolder.gross_profit.max, 'min: ', rankingsMaxMinsHolder.gross_profit.min, ' ', stockObj.symbol, ' ', grossProfitDistFromMax, ' ', grossProfitDistFromMin)
            }


            if (net_income_quarterly_1y_PGdP &&
                !isNaN(net_income_quarterly_1y_PGdP) &&
                net_income_quarterly_1y_PGdP !== Infinity &&
                net_income_quarterly_1y_PGdP !== -Infinity) {
                const netProfitDistFromMin = net_income_quarterly_1y_PGdP - rankingsMaxMinsHolder.net_income.min
                const netProfitDistFromMax = rankingsMaxMinsHolder.net_income.max - net_income_quarterly_1y_PGdP

                netProfitRanking = (netProfitDistFromMin === netProfitDistFromMax) ?
                    1 : netProfitDistFromMin / (netProfitDistFromMin + netProfitDistFromMax)

                // console.log('caculating net p ranking: ', net_income_quarterly_1y_PGdP, 'h  max: ', rankingsMaxMinsHolder.net_income.max, 'min: ', rankingsMaxMinsHolder.net_income.min, ' ', stockObj.symbol, ' ', netProfitDistFromMax, ' ', netProfitDistFromMin)
                // console.log('net p ranking: ', netProfitRanking)

                if (!netProfitRanking || netProfitRanking < 0) {
                    // console.log('setting to zero...')
                    netProfitRanking = 0
                }

                if (netProfitRanking > 1)
                    netProfitRanking = 1
            }

            // console.table(rankingsMaxMinsHolder)

            // console.table({
            //     raw_revenue: stockObj.growth_calculations.revenue['t+1y_quarterly_PGpD'],
            //     raw_gross_profit: stockObj.growth_calculations.gross_profit['t+1y_quarterly_PGpD'],
            //     raw_net_income: stockObj.growth_calculations.net_income['t+1y_quarterly_PGpD'],
            // })
            // console.table({
            //     revenue: +revenueRanking.toFixed(2),
            //     gross_profit: +grossProfitRanking.toFixed(2),
            //     net_income: +netProfitRanking.toFixed(2),
            // })

            stockObj.rankings = {
                revenue: +revenueRanking.toFixed(2),
                gross_profit: +grossProfitRanking.toFixed(2),
                net_income: +netProfitRanking.toFixed(2),
            }

            return stockObj
        })

    return [rankedStatsArray, rankingsMaxMinsHolder]
}
