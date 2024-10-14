const electron = require('electron');
const {ipcRenderer } = require('electron/renderer');
const listenerLib = require("node-global-key-listener");


const clipboard = electron.clipboard;
const userInputListener = new listenerLib.GlobalKeyboardListener();

const foundItemParagraph = document.getElementById('found-item');
const closeButton = document.getElementById('close-button');
const minButton = document.getElementById('min-button');
const evaluateButton = document.getElementById('evaluate-button');
const resultParagraph = document.getElementById('result');
const resultDiv = document.getElementById('result-div');
const spinner = document.getElementById('spinner');
const ratingInfoDiv = document.getElementById('rating-info');
const ratingInfoBtn = document.getElementById('additionalInfoBtn');

clipboard.clear();

function getClipboardContent() {
  return clipboard.readText();
}

function isCopyingAnItem() {
  return getClipboardContent().startsWith('Item');
}

function hideSpinner() {
  resultDiv.style.display = 'block';
  foundItemParagraph.style.height = foundItemParagraph.scrollHeight+'px';
  spinner.style.display = "none";
}

function showSpinner() {
  resultDiv.style.display = 'none';
  spinner.style.display = "block";
}

userInputListener.addListener(async function (_, down) {
  const isGameOn = await ipcRenderer.invoke('is-game-on');
  const isClickingCtrlC = down["C"] && (down["LEFT CTRL"] || down["RIGHT CTRL"]);
  setTimeout(() => {
    if(isGameOn && isClickingCtrlC && isCopyingAnItem()) {  
      ipcRenderer.send('open-window');
      foundItemParagraph.value = getClipboardContent();
      evaluateResult(getClipboardContent());
    }
  }, 500);
});

minButton.addEventListener('click',function() {
  foundItemParagraph.value = null;
  resultDiv.style.display = "none";
  clipboard.clear();
  ipcRenderer.send('close-window');
});

closeButton.addEventListener('click',function() {
  ipcRenderer.send('exit-app');
});

evaluateButton.addEventListener('click',function() {
  evaluateResult(foundItemParagraph.value)
});

ratingInfoBtn.addEventListener('click',function() {
  if(ratingInfoDiv.style.display === "block"){
    ratingInfoDiv.style.display = "none";
  } else {
    ratingInfoDiv.style.display = "block";
  }
});


function evaluateResult(item) {
  showSpinner();
  callApi(item).then(res => {
    hideSpinner();
    resultParagraph.value = "Your item rating is " + res;
  }).catch(err => {
    hideSpinner();
    resultParagraph.value = err;
  });
}

async function callApi(item) { 
  const url = 'http://127.0.0.1:8080/evaluate';

  const options = {
      method: 'POST',
      body: item
  };

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error("Could not get result of evaluation !");
    }
    const data = await response.text();
    return data;
  } catch(error){
    throw error;
  }
}
