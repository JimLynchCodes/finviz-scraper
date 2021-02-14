const puppeteer = require('puppeteer');

import { Page, devices } from "puppeteer";
import { handleRequest } from '../handle-request/handle-request'

export async function createPuppeteerStuff(): Promise<Page> {

  console.log('creating puppeteer stuff...')
  const browser = await puppeteer.launch({ headless: false });
  console.log('1')
  const page = await browser.newPage()
  
  console.log('2')
  // page.setUserAgent("")
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4298.0 Safari/537.36');
  
  console.log('3')
  await page.setViewport({ width: 1000, height: 1200 })
  console.log('4')
  await page.setRequestInterception(true)

  page.on('request', handleRequest)

  console.log('created a nice puppeteer page object 👍')

  return page
}
