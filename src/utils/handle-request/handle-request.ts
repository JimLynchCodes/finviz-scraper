
const blockedResources = [
  'quantserve',
  'adzerk',
  'doubleclick',
  'adition',
  'exelator',
  'sharethrough',
  'twitter',
  'google-analytics',
  'fontawesome',
  'facebook',
  'analytics',
  'optimizely',
  'clicktale',
  'mixpanel',
  'zedo',
  'clicksor',
  'tiqcdn',
  'googlesyndication',
  'ads',
  'sync',
  'Pug',
  'Sync',
  'parter',
  'match',
  'adnxs',
  'mookie',
  'uat5',
  'ib.',
];
// (async () => {

//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.setRequestInterception(true);
//   page.on('request', (request) => {
//     // BLOCK IMAGES
//     if (request.url().endsWith('.png') || request.url().endsWith('.jpg'))
//         request.abort();
//     // BLOCK CERTAIN DOMAINS
//     else if (blockedResources.some(resource => request.indexOf(resource) !== -1))
//         request.abort();
//     // ALLOW OTHER REQUESTS
//     else
//         request.continue();
//   });
//   await page.goto('https://www.google.com');

// })()

export function handleRequest(req) {
  // BLOCK IMAGES
  if (req.url().endsWith('.png') ||
    req.url().endsWith('.jpg') ||
    req.resourceType() == 'stylesheet' ||
    // req.resourceType() == 'font' ||
    req.resourceType() == 'image'
  )
    req.abort();
  // BLOCK CERTAIN DOMAINS
  else if (blockedResources.some(resource => req.url().indexOf(resource) !== -1))
    req.abort();
  // ALLOW OTHER reqS
  else
    req.continue();
  // if (
  //   // req.resourceType() == 'script' ||
  //   // req.resourceType() == 'stylesheet' ||
  //   // req.resourceType() == 'font'
  //   // req.resourceType() == 'image'
  //   false
  // )
  //   req.abort()
  // else
  //   req.continue()
}
