const CODE_LENGTH = 6;
const ICON = '✎';
let currentCode = '';
let currentURL = '';

window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

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

function saveCode(db, url){
  if (db[url]) {
    display(db[url], url);
  } else {
    const code = generateCode();
    display(code, url);
    const obj1 = {};
    const obj2 = {};
    obj1[url] = code;
    obj2[code] = url;

    browser.storage.sync.set(obj1);
    browser.storage.sync.set(obj2, () => { display(code, url); });
  }
}

function shorten(url) {

  let saveCodeFn = res => { saveCode(res, url) };
  browser.storage.sync.get([url], saveCodeFn);
}

function onError(error) {
  display('UOPS', error);
}

function run(tabs){
  const tab = tabs[0];
  display('...', tab.url);
  shorten(tab.url);
}

function display(code, url) {
  currentCode = code;
  currentURL = url;
  document.querySelector('.short .code').value = code;
  document.querySelector('.url').textContent = url;
}

function reportError(error) {
  const msg = `Could not shorten URL: ${error}`;
  alert(msg);
  console.error(msg);
}

function openCode(db, code) {
  const url = db[code];
  if (url) {
    browser.tabs.update({ url: url } );
    display(code, url);
  } else {
    onError('Code not found!')
  }
}

window.onload = () => {
  let inputfield = document.querySelector('.short .code');
  if (!inputfield) return;
  inputfield.addEventListener('click', ev => {
    inputfield.select();
  });
  inputfield.addEventListener('keydown', ev => {
    if (ev.keyCode == 13){
      const code = inputfield.value.trim().toUpperCase();

      let openCodeFn = res => { openCode(res, code); };
      browser.storage.sync.get(code, openCodeFn);

    } else if (ev.keyCode == 27) {
      display(currentCode, currentURL);
    }
  });
}

if (browser && browser.tabs) {
  browser.tabs.query({active: true, currentWindow: true}, run);
}
