const electron = require('electron');
const {ipcRenderer } = require('electron/renderer');
const listenerLib = require("node-global-key-listener");


const clipboard = electron.clipboard;
const listener = new listenerLib.GlobalKeyboardListener();

var foundItemParagraph = document.getElementById('found-item');
var closeButton = document.getElementById('close-button');
var evaluateButton = document.getElementById('evaluate-button');
var resultParagraph = document.getElementById('result');
var mainApp = document.getElementById('mainApp');

clipboard.clear();

function checkClipboard() {
  let clipboardContent = clipboard.readText();
  console.log('clipboard content : ',clipboardContent);
  if(clipboardContent.startsWith('Item')){
    ipcRenderer.send('open-window');
    foundItemParagraph.textContent = formatText(clipboardContent);
    foundItemParagraph.style.height = foundItemParagraph.scrollHeight+'px';
  }
}

function formatText(text) {
  text = text.replace(/--------/g, '\n');

  text = text.trim();

  return text;
}


function listenToCtrlC(e, down) {
  if (e.state === "DOWN" &&
    e.name === "C" &&
    (down["LEFT CTRL"] || down["RIGHT CTRL"])) {
    setTimeout(() => {
      checkClipboard();
    }, 500);
  }
}

function evaluate(item) {
  const url = 'http://127.0.0.1:8080/evaluate';

  const options = {
      method: 'POST',
      body: item
  };

  fetch(url, options)
      .then(response => {
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
      })
      .then(data => {
          resultParagraph.textContent = "Your Item is in rating : " + data;
      })
      .catch(error => {
          console.error('There was a problem with the fetch operation:', error);
      });
}


listener.addListener(async function (e, down) {
  const isGameOn = await ipcRenderer.invoke('is-game-on');
  if(isGameOn){
    listenToCtrlC(e, down);
  } else {
    ipcRenderer.send('close-window');
  }
});

closeButton.addEventListener('click',function() {
  foundItemParagraph.textContent = null;
  resultParagraph.textContent = null;
  clipboard.clear();
  ipcRenderer.send('close-window');
});

evaluateButton.addEventListener('click',function() {
  evaluate(foundItemParagraph.textContent);
});

