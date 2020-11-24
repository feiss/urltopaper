const CODE_INDEX = '_index_';
const CODE_LENGTH = 6;
const ICON = '✎';
let currentCode = '';
let currentURL = '';

const OPTIONS = {
  USE_NUMERIC: '_use_numeric_',
};
let options = {
  useNumeric: false,
};

function loadOptions(){
  browser.storage.sync.get(OPTIONS.USE_NUMERIC).then(db => {
    options.useNumeric = db[OPTIONS.USE_NUMERIC] && db[OPTIONS.USE_NUMERIC] === true;
    document.getElementById('usenumeric').checked = options.useNumeric;
  });
}

function useNumericSet(useNumeric){
  options.useNumeric = useNumeric;
  const obj = {};
  obj[OPTIONS.USE_NUMERIC] = options.useNumeric;
  browser.storage.sync.set(obj);
  saveCode({}, currentURL);
}

function generateCode(idx, url){
  const code = options.useNumeric ? '#'+idx : DICT[idx];
  display(code, url);
  const obj1 = {};
  const obj2 = {};
  const obj_idx = {};
  obj1[url] = code;
  obj2[code] = url;
  obj_idx[CODE_INDEX] = idx + 1;

  browser.storage.sync.set(obj1);
  browser.storage.sync.set(obj2);
  browser.storage.sync.set(obj_idx)
    .then(() => { display(code, url); }, onError);
}

function saveCode(db, url){
  if (db[url]) {
    display(db[url], url);
  } else {
    browser.storage.sync.get(CODE_INDEX).then(db => {
      if (db[CODE_INDEX]) {
        generateCode(parseInt(db[CODE_INDEX]), url);
      } else {
        generateCode(0, url);
      }
    }, onError);
  }
}

function shorten(url) {
  let saveCodeFn = res => { saveCode(res, url) };
  browser.storage.sync.get(url).then(saveCodeFn, onError);
}

function onError(error) {
  display('UOPS!', error);
}

function run(tabs){
  const tab = tabs[0];
  display('...', tab.url);
  shorten(tab.url);
  loadOptions();
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
      let code = inputfield.value.trim().toUpperCase();
      if (!isNaN(parseInt(code))) {
        code = '#' + code;
      }

      let openCodeFn = res => { openCode(res, code); };
      browser.storage.sync.get(code).then(openCodeFn, onError);

    } else if (ev.keyCode == 27) {
      display(currentCode, currentURL);
    }
  });
  let useNumericCheck = document.getElementById('usenumeric');
  if (useNumericCheck) {
    useNumericCheck.addEventListener('change', ev => {
      console.log(ev.target, ev.target.checked)
      useNumericSet(ev.target.checked);
    });
  }
}

if (browser && browser.tabs) {
  browser.tabs.query({active: true, currentWindow: true})
    .then(run)
    .catch(reportError);

  //debug
  browser.storage.sync.get().then(db => {console.log(db);}, onError);
}
