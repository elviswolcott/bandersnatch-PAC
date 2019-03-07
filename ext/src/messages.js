import { log, inject, removeEl } from 'Shared/common.js';
import { startCommunication } from 'Shared/cs2cs.js';

log('Message script loaded on page.');



/* start script */
// allows extension to display info and error messages on the presenter tools

// port is used to fire messages from other content scripts
/*var port = chrome.runtime.connect({ name: "messages" });
port.onMessage.addListener(function (msg) {
  if(msg.action === 'display_error') {
    displayError(msg.text);
  } else if(msg.action === 'display_info') {
    displayInfo(msg.text);
  }
});*/

var port = startCommunication();

port.on('display_error', displayError);
port.on('display_info', displayInfo);

// sends a message to the background to inject the stylesheet into the tab
// runs asynchronously
inject('messages.css', 'extension message UI styles');

// displays an error message.
// only use this for BIG errors that should interrupt the user completely
function displayError(msg) {
  port.send('update_icon', 'icon_error.png');
  var id = 'extension_bandersnatch_popup--' + Math.round(Math.random() * 10000);

  var container = document.createElement('div');
  var popup = document.createElement('div');

  container.id = id;

  container.classList.add('extension_bandersnatch_popup-container');
  popup.classList.add('extension_bandersnatch_popup');


  var heading = document.createElement('h1');
  heading.innerText = 'Error';
  popup.appendChild(heading);

  var body = document.createElement('h2');
  body.classList.add('extension_bandersnatch_sub-heading')
  body.innerText = msg;
  popup.appendChild(body);

  var btnContainer = document.createElement('div');
  btnContainer.classList.add('extension_bandersnatch_right');

  var btn = document.createElement('button');
  btn.classList.add('extension_bandersnatch_btn');
  btn.innerText = 'OK';
  btn.onclick = function () {
    removeEl(id);
    port.send('update_icon', 'icon.png');
  }
  btnContainer.appendChild(btn);
  popup.appendChild(btnContainer);


  container.appendChild(popup);

  document.getElementsByTagName('body')[0].appendChild(container);
}

// displays an info message (snackbar)
function displayInfo(msg) {
  log("Showing info message");
  var id = 'extension_bandersnatch_snackbar--' + Math.round(Math.random() * 10000);

  var container = document.createElement('div');
  var content = document.createElement('div');

  container.id = id;

  content.innerText = msg;
  content.onclick = function () {
    removeEl(id);
  }

  container.classList.add('extension_bandersnatch_snackbar' + '-container');
  content.classList.add('extension_bandersnatch_snackbar');

  container.appendChild(content);

  document.getElementsByTagName('body')[0].appendChild(container);

  setTimeout(function () {
    removeEl(id);
  }, 1e3 * 8);

}