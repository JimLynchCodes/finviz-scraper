const { Cluster } = require('puppeteer-cluster');

export async function scrapeAllTickersWithCluster(page) {

    await page.goto(`https://elite.finviz.com/screener.ashx?`, { waitUntil: 'networkidle0', timeout: 50000 })

    await page.keyboard.press('Escape');

    // await page.goto(`https://finviz.com/screener.ashx?v=152&c=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,57,58,59,60,61,62,63,64,65,66,67,68,69,70`,
    //     { waitUntil: 'load' })

    let symbols = []

    const numberOfPages = await page.evaluate(() => {
        const pageNumberLinks = document.querySelectorAll('.screener-pages')
        return pageNumberLinks[pageNumberLinks.length - 1].textContent
    })

    const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ?
        Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages;

    console.log('number of pages: ', numberOfPages);
    console.log('MAX_PAGES_TO_SCRAPE: ', process.env.MAX_PAGES_TO_SCRAPE);
    console.log('capped number of pages: ', cappedNumberOfPages);

    const _console = console

    return await (async () => {
        const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1);

        console.log('Scraping tickers with cluster max concurrency set to: ', process.env.TICKER_SCRAPER_CLUSTER_MAX_CONCURRENCY)
        const cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_CONTEXT,
            maxConcurrency: +process.env.TICKER_SCRAPER_CLUSTER_MAX_CONCURRENCY,
        });


        await cluster.task(async ({ page, data: url }) => {

            try {
                _console.log('running task for: ', url)
                await page.goto(url, {

                    // networkIdleTimeout: 5000,
                    waitUntil: 'networkidle2',
                    timeout: 17000
                })


                // await page.goto(url, { waitUntil: 'load', timeout: 10000 })

                // const presentsDropdownSelector = 'select[id="screenerPresetsSelect"]';



                // <style="width: 100%; visibility: visible;" class="body-combo-text" onchange="ScreenerPresetsChange(value,&quot;v=111&quot;)">
                // <option>My Presets</option>
                // <option value="__save_screen">-Save Screen</option>
                // <option value="__edit_screens">-Edit Screens</option>
                // <option value="v=152&amp;f=sec_healthcare">s: Fundamentals</option>
                // </select>

                // await page.type(emailInputSelector, process.env.FINVIZ_EMAIL)
                // await page.type(pwInputSelector, process.env.FINVIZ_PW)
                // await page.click(presentsDropdownSelector)

                // const stringToLookFor = '?r='
                // const indexOfCharsBeforeNum = url.indexOf(stringToLookFor)

                // const urlNum = url.substr(indexOfCharsBeforeNum + stringToLookFor.length) * 10

                // _console.log('sleeping for: ', urlNum)

                // await page.waitForTimeout(urlNum)
                // await page.waitForTimeout(50)

                // _console.log('done sleepin...', urlNum)

                // await page.screenshot({ path: `img/${url.slice(url.length - 5)}.png` });

                // await page.goto(url)

                // await page.waitForSelector(, {
                //     waitForSelector: true,
                //     timeout: 1000
                // });


                // const loginBtnSelector = 'input[type="submit"]';

                // await page.type(emailInputSelector, process.env.FINVIZ_EMAIL)
                // await page.type(pwInputSelector, process.env.FINVIZ_PW)
                // await page.click(loginBtnSelector)





                const tableHeaderCells: string[] = (await page.evaluate(() => {
                    const headerCells = Array.from(document.querySelectorAll('tr[valign="middle"] td'))
                        .map(cell => cell.textContent)
                    return headerCells
                }))
                    .map(headerCell => headerCell.toLowerCase().replace(/[.]/g, '').replace(/[ ]/g, '_'))

                const darkSymbolsData: string[] = await page.evaluate(() => {
                    const symbolData = Array.from(document.querySelectorAll('tr.table-dark-row-cp td'))
                        .map(cell => cell.textContent)
                    return symbolData
                })
                const lightSymbolsData: string[] = await page.evaluate(() => {
                    const symbolData = Array.from(document.querySelectorAll('tr.table-light-row-cp td'))
                        .map(cell => cell.textContent)
                    return symbolData
                })

                const symbolsData = [...darkSymbolsData, ...lightSymbolsData]

                // console.log('symbols with data: ', symbolsData);

                const someSymbols = [];
                let currentObj = { ticker: '', fundamentals: {} }

                symbolsData.map((symbolDataCellText, index) => {

                    // if (index % tableHeaderCells.length === 0)

                    if (index % tableHeaderCells.length === tableHeaderCells.length - 1) {
                        someSymbols.push(currentObj);
                        currentObj = { ticker: '', fundamentals: {} }
                    }

                    if (tableHeaderCells[index % tableHeaderCells.length] === 'ticker' ||
                        tableHeaderCells[index % tableHeaderCells.length] === 'Ticker') {
                        // console.log('it\'s a ticker! ', tableHeaderCells[index % tableHeaderCells.length], ' ', symbolDataCellText)
                        currentObj[tableHeaderCells[index % tableHeaderCells.length]] = symbolDataCellText
                    }
                    else
                        currentObj.fundamentals[tableHeaderCells[index % tableHeaderCells.length]] = symbolDataCellText
                })

                // console.log('mapped symbols data: ', symbolsData.length);

                symbols = [...symbols, ...someSymbols]
                console.log('total symbols now: ', symbols.length);
            }
            catch (err) {
                console.log('errr', err)
                console.log('errored so requeuing: ', url)
                await page.screenshot({ path: `img/${url.slice(url.length - 5)}.png` });

                cluster.queue(url);


            }

        });

        console.log(`scraping ${pageNumbers.length} pages`)

        for (const pageNumber of pageNumbers) {
            const firstRowIndex = 1 + 20 * (pageNumber - 1)
            cluster.queue(`https://finviz.com/screener.ashx?v=152&c=0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,57,58,59,60,61,62,63,64,65,66,67,68,69,70&r=${firstRowIndex}`);

            console.log('queueing ', pageNumber, ' index: ', firstRowIndex)
        }

        console.log('idling...')

        await cluster.idle();
        await cluster.close();

        // console.log('scraped symbols: ', symbols)

        return Promise.resolve(symbols)
    })();
}

/**
 *  Deprecated, son.
 */

// async function getSymbolsForPage(page, pageNumber): Promise<string[]> {

//     return new Promise(async resolve => {

//         const firstRowIndex = 1 + 20 * (pageNumber - 1)
//         console.log('firstRowIndex: ', firstRowIndex)


//         await page.goto(`https://finviz.com/screener.ashx?r=${firstRowIndex}`, { waitUntil: 'networkidle2' })
//         // await page.waitForNavigation()

//         const symbolsOnPage: string[] = await page.evaluate(() => {
//             const symbols = Array.from(document.querySelectorAll('.screener-link-primary'))
//                 .map(cell => cell.textContent)

//             return symbols
//         })

//         resolve(symbolsOnPage)
//     })

// }

// export async function scrapeAllTickers(page): Promise<string[]> {
//     return new Promise(async resolve => {

//         await page.goto(`https://finviz.com/screener.ashx`)

//         const results = []
//         let symbols = []

//         const numberOfPages = await page.evaluate(() => {
//             const pageNumberLinks = document.querySelectorAll('.screener-pages')
//             return pageNumberLinks[pageNumberLinks.length - 1].textContent
//         })

//         console.log('number of pages: ', numberOfPages);

//         const cappedNumberOfPages = process.env.MAX_PAGES_TO_SCRAPE ? Math.min(+process.env.MAX_PAGES_TO_SCRAPE, numberOfPages) : numberOfPages

//         const pageNumbers = (new Array(cappedNumberOfPages)).fill(0).map((_, indx) => indx + 1)

//         console.log('scraping data for: ', pageNumbers.length, ' pages.')

//         for (const pageNumber of pageNumbers) {

//             console.log('pageNumber is: ', pageNumber)

//             const symbolsInPage = await getSymbolsForPage(page, pageNumber);

//             console.log('symbolsInPage: ', symbolsInPage)

//             symbols = [...symbols, ...symbolsInPage]

//         }

//         console.log(`Scraped ${symbols.length} symbols.`)

//         resolve(symbols)
//     })

// }

