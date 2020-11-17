const CODE_LENGTH = 6;
const ICON = '✎';

function generateCode(){
  const letters = [
    'BCDFGHJKLMNPQRSTVWXYZ',
    'AEIOU'
  ];
  let code = '';
  for (var i = 0; i < CODE_LENGTH; i++) {
    const pool = letters[i%2];
    code += pool[Math.floor(Math.random() * pool.length)];
  }
  return code;
}

function shorten(url) {
  browser.storage.local.get(url)
    .then(codes => {
      if (codes[url]) {
        display(codes[url], url);
      } else {
        const code = generateCode();
        display(code, url);
        const obj = {};
        obj[url] = code;
        browser.storage.local.set(obj)
          .then(
            () => { display(code, url); },
            onError);
      }
    },
    onError);
}

function onError(error) {
  display('<ERROR>', error);
}

function run(tabs){
  const tab = tabs[0];
  display('...', tab.url);
  shorten(tab.url);
}

function display(code, url) {
  document.querySelector('.short .code').innerHTML = code;
  document.querySelector('.url').innerHTML = url;
}

function reportError(error) {
  const msg = `Could not shorten URL: ${error}`;
  alert(msg);
  console.error(msg);
}

if (browser && browser.tabs) {
  browser.tabs.query({active: true, currentWindow: true})
    .then(run)
    .catch(reportError);
}

browser.storage.local.get(null).then(
  all => { console.log(all);})


//console.info("Opened UrlToPaper.");
