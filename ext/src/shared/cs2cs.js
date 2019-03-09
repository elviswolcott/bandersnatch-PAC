// runs in the background script and echos messages out
function startEcho() {
  var makeListener = (action, f) => {
    return msg => {
      if (msg.action === action && msg.used === false) {
        ports.forEach(port => {
          // return true to avoid marking as used
          msg.used = f(msg.body, port)? false: true;
        });
      }
    };
  };

  var ports = [];
  var listeners = []; // due to how the echo runs listeners can't be added as nicely
  chrome.runtime.onConnect.addListener(port => {
    if (port.name === "cs2cs") {
      ports.push(port);
      port.onMessage.addListener(msg => {
        console.log("Echoing ", msg);
        ports.forEach(port => {
          port.postMessage(msg);
        });
      });
      // adds existing listeners to the new port
      listeners.forEach(listener => {
        port.onMessage.addListener(listener);
      });
      // remove disconnected ports to prevent errors
      port.onDisconnect.addListener(disconnected => {
        ports = ports.filter(
          port => port.sender.tab.id !== disconnected.sender.tab.id
        );
      });
    }
  });

  return {
    // runs for function for all connected tabs
    on: (action, f) => {
      var listener = makeListener(action, f);
      listeners.push(listener);
      // add the listener to the existing ports
      ports.forEach(port => {
        port.onMessage.addListener(listener);
      });
    },
    send: (action, body) => {
      ports.forEach(port => {
        port.postMessage({
          action,
          body,
          used: false
        });
      });
    }
  };
}

// in content script to allow back and forth with other content scripts
function startCommunication() {
  var port = chrome.runtime.connect({ name: "cs2cs" });
  return {
    send: (action, body) => {
      port.postMessage({
        action,
        body,
        used: false
      });
    },
    on: (action, f) => {
      port.onMessage.addListener((msg, port) => {
        if (msg.action === action && msg.used === false) {
          // returning true prevents messages from being marked as used
          msg.used = f(msg.body, port) ? false : true;
        }
      });
    }
  };
}

export { startEcho, startCommunication };
