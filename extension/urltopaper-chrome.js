const CODE_INDEX = '_index_';
const CODE_LENGTH = 6;
const ICON = '✎';
let currentCode = '';
let currentURL = '';

const OPTIONS = {
  USE_NUMERIC: '_use_numeric_',
  SHOW_DB: '_show_database_',
};
let options = {
  useNumeric: false,
  showDatabase: false,
};

window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

function loadOptions(){
  browser.storage.sync.get(OPTIONS.USE_NUMERIC, db => {
    options.useNumeric = db[OPTIONS.USE_NUMERIC] && db[OPTIONS.USE_NUMERIC] === true;
    document.getElementById('usenumeric').checked = options.useNumeric;
  });
  browser.storage.sync.get(OPTIONS.SHOW_DB, db => {
    options.showDatabase = db[OPTIONS.SHOW_DB] && db[OPTIONS.SHOW_DB] === true;
    document.getElementById('showdatabase').checked = options.showDatabase;
    updateDB();
  });
}

function useNumericSet(useNumeric){
  options.useNumeric = useNumeric;
  const obj = {};
  obj[OPTIONS.USE_NUMERIC] = options.useNumeric;
  browser.storage.sync.set(obj);
  saveCode({}, currentURL);
}

function showDatabaseSet(showDatabase){
  options.showDatabase = showDatabase;
  const obj = {};
  obj[OPTIONS.SHOW_DB] = options.showDatabase;
  browser.storage.sync.set(obj);
  updateDB();
}

function updateDB(){
  document.getElementById('db').style.display = options.showDatabase ? 'block' : 'none';
  if (!options.showDatabase) { return; }
  const table = document.getElementById('db');
  table.textContent = '';
  browser.storage.sync.get(null, db => {
    for (let item in db){
      if (item.length > 5 || item[0] == '_') { continue; }
      const tr = document.createElement('div');
      const td1 = document.createElement('span');
      const td2 = document.createElement('span');
      const tda = document.createElement('a');

      td1.textContent = item;
      td1.className = 'code';

      td2.className = 'url';
      const link = document.createElement('a');
      link.href = db[item];
      link.textContent = db[item];
      td2.appendChild(link);

      tda.textContent = '✕';
      tda.href = "#";
      tda.addEventListener('click', ev => {
        deleteCode(ev.target, item);
      });

      tr.appendChild(td1);
      tr.appendChild(td2);
      tr.appendChild(tda);
      table.appendChild(tr);
    }
  });
}

function deleteCode(el, code){
  browser.storage.sync.remove(code);
  el.parentNode.parentNode.removeChild(el.parentNode);
}

function generateCode(idx, url){
  const code = options.useNumeric ? '#'+idx : DICT[idx];
  display(code, url);
  const obj1 = {};
  const obj2 = {};
  const obj_idx = {};
  obj1[url] = code;
  obj2[code] = url;
  obj_idx[CODE_INDEX] = (idx + 1) % DICT.length;

  browser.storage.sync.set(obj1);
  browser.storage.sync.set(obj2);
  browser.storage.sync.set(obj_idx, () => {
      display(code, url);
      updateDB();
    }
  );
}


function saveCode(db, url){
  if (db[url]) {
    display(db[url], url);
  } else {
    browser.storage.sync.get(CODE_INDEX, db => {
      if (db[CODE_INDEX]) {
        generateCode(parseInt(db[CODE_INDEX]), url);
      } else {
        generateCode(0, url);
      }
    });
  }
}

function shorten(url) {
  let saveCodeFn = res => { saveCode(res, url) };
  browser.storage.sync.get(url, saveCodeFn);
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
      browser.storage.sync.get(code, openCodeFn);

    } else if (ev.keyCode == 27) {
      display(currentCode, currentURL);
    }
  });
  let useNumericCheck = document.getElementById('usenumeric');
  if (useNumericCheck) {
    useNumericCheck.addEventListener('change', ev => {
      useNumericSet(ev.target.checked);
    });
  }
  let showDatabase = document.getElementById('showdatabase');
  if (showDatabase) {
    showDatabase.addEventListener('change', ev => {
      showDatabaseSet(ev.target.checked);
    });
  }
}


if (browser && browser.tabs) {
  browser.tabs.query({active: true, currentWindow: true}, run);
  //debug
//  browser.storage.sync.get(null, db => {console.log(db);});
}

