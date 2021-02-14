
import { Result } from 'regression'

const regression = require('regression');
const clonedeep = require('lodash.clonedeep')

export function runQuarterlyRegressionsForTicker(latestFirstDataPoints) {

    let chronologicalDataPoints = []
    let chronologicalPointsShiftedToZeroY = []
    let linearModelData: Result | {} = {}
    // let exponentialModelData: Result | {} = {}
    // let logarithmicModelData: Result | {} = {}

    let numberOfColumns = 0

    if (latestFirstDataPoints) {

        chronologicalDataPoints = clonedeep(latestFirstDataPoints)
            .reverse().map((revenueDataPoint, index) => [index, +(revenueDataPoint.replace(/,/g, ''))])

        // shift points up to y=0 if necessary

        let minYValue = 0;

        chronologicalDataPoints.forEach(point => {
            if (point[1] < minYValue)
                minYValue = point[1]
        })

        chronologicalPointsShiftedToZeroY = clonedeep(chronologicalDataPoints).map(point => {
            point[1] -= minYValue
            return point
        })

        // console.log('chronological points: ', chronologicalDataPoints)
        // console.log('chronological points shifted up: ', chronologicalPointsShiftedToZeroY)

        const linearRegModel = regression.linear(chronologicalPointsShiftedToZeroY)
        // const exponentialRegModel = regression.exponential(chronologicalPointsShiftedToZeroY)
        // const logarithmicReg = regression.logarithmic(chronologicalPointsShiftedToZeroY)

        // console.log('lin: ', JSON.stringify(linearRegModel, null, 2))
        // console.log('exp: ', JSON.stringify(exponentialRegModel, null, 2))
        // console.log('log: ', JSON.stringify(logarithmicReg, null, 2))

        linearModelData = linearRegModel
        // exponentialModelData = exponentialRegModel
        // logarithmicModelData = logarithmicReg

        numberOfColumns = chronologicalPointsShiftedToZeroY.length
    }

    let regression_best_fit_line_type = 'NONE'
    let regression_best_fit_line_equation = ''

    const linR2 = (linearModelData as Result).r2
    // const expR2 = (exponentialModelData as Result).r2
    // const logR2 = (logarithmicModelData as Result).r2

    // console.log('linR2 ', linR2, ' expR2: ', expR2, ' logR2: ', logR2)

    const r2s = []

    if (linR2 && !isNaN(linR2))
        r2s.push(linR2)

    // if (expR2 && !isNaN(expR2))
    //     r2s.push(expR2)

    // if (logR2 && !isNaN(logR2))
    //     r2s.push(logR2)

    // console.log('max of ', linR2, expR2, logR2, ' is: ', Math.max(...r2s))

    let next_year_quarterly_revenue_prediction = null;

    if (Math.max(...r2s) === linR2) {
        regression_best_fit_line_type = 'LINEAR'
        regression_best_fit_line_equation = (linearModelData as Result).string
        next_year_quarterly_revenue_prediction = (linearModelData as Result).predict(numberOfColumns + 4 - 1)[1]
    }

    // if (Math.max(...r2s) === expR2) {
    //     regression_best_fit_line_type = 'EXPONENTIAL'
    //     regression_best_fit_line_equation = (exponentialModelData as Result).string
    //     next_year_quarterly_revenue_prediction = (exponentialModelData as Result).predict(numberOfColumns + 4 - 1)[1]
    // }

    // if (Math.max(...r2s) === logR2) {
    //     regression_best_fit_line_type = 'LOGARITHMIC'
    //     regression_best_fit_line_equation = (logarithmicModelData as Result).string
    //     next_year_quarterly_revenue_prediction = (logarithmicModelData as Result).predict(numberOfColumns + 4 - 1)[1]
    // }

    let tPlusDifference = null
    let maxChronologicalYValue = null

    if (next_year_quarterly_revenue_prediction && chronologicalPointsShiftedToZeroY) {
        maxChronologicalYValue = chronologicalPointsShiftedToZeroY.reduce((max, [_xVal, yVal]) => {

            if (yVal > max)
                return yVal

            return max
        }, 0)
        tPlusDifference = +(next_year_quarterly_revenue_prediction - maxChronologicalYValue).toFixed(4)
    }

    delete (linearModelData as Result).predict
    // delete (exponentialModelData as Result).predict
    // delete (logarithmicModelData as Result).predict

    return {
        regression_models: {
            linear: linearModelData,
            // exponential: exponentialModelData,
            // logarithmic: logarithmicModelData
        },
        regression_best_fit_line_type,
        regression_best_fit_line_equation,
        next_year_quarterly_revenue_prediction,
        'max(0_to_t)': maxChronologicalYValue,
        '(t+1y)-max(0_to_t)': tPlusDifference
    }
}

export function runRegressionsForTickers(tickerListPageData) {

    return tickerListPageData
        .filter(tickerObj => tickerObj.income_statements.quarterly !== undefined)
        .map(incomeDataForTicker => {

            // console.log('income data ticker: ', incomeDataForTicker)

            // console.log('rev data: ', incomeDataForTicker.income_statements.quarterly.data['total_revenue'])
            // console.log('gross prof data: ', incomeDataForTicker.income_statements.quarterly.data['gross_profit'])
            // console.log('net prof data: ', incomeDataForTicker.income_statements.quarterly.data['net_income'])

            incomeDataForTicker.growth_calculations = {
                revenue: !incomeDataForTicker.income_statements.quarterly.data ? null :
                    runQuarterlyRegressionsForTicker(incomeDataForTicker.income_statements.quarterly.data['total_revenue']),
                gross_profit: !incomeDataForTicker.income_statements.quarterly.data ? null :
                    runQuarterlyRegressionsForTicker(incomeDataForTicker.income_statements.quarterly.data['gross_profit']),
                net_income: !incomeDataForTicker.income_statements.quarterly.data ? null :
                    runQuarterlyRegressionsForTicker(incomeDataForTicker.income_statements.quarterly.data['net_income'])
            }

            return incomeDataForTicker
        })

}



// db.getCollection('eg_analyzed_results').find({}, { $filter: {"input" : "$stock_list",
//              "as" : "stock",
//              "cond" : {
//                 "$and" : [
//                    { "$gtr" : [ "$$stock.profit_m", "0" ] }
//                 ]
//              } 
//             }}

//              ).sort({_id: -1}).limit(1)