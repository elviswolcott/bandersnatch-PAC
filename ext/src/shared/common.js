// makes things cleaner in the top level log
function log(m) {
  console.log("Bandersnatch PAC: ", m);
}
// removes an element from the DOM by id
function removeEl(id) {
  try {
    document
      .getElementById(id)
      .parentElement.removeChild(document.getElementById(id));
  } catch (e) {
    log(id + " already removed");
  }
}
// attempts to inject a resource
// runs asynchronously
function inject(file, logString) {
  log("Asking to inject " + logString + ".");
  var split = file.split(".");
  var ext = split[split.length - 1];
  chrome.runtime.sendMessage(
    {
      action: "inject_" + ext,
      details: {
        file: file
      }
    },
    function(error) {
      log(
        "Injecting " +
          logString +
          " " +
          (error ? "failed with error:\n " + error.message : "succeeded.")
      );
    }
  );
}

// runs on messages sent with the chrome.runtime.sendMessage API
// this listener manages injecting files when requested through inject()
function handleInjections() {
  chrome.runtime.onMessage.addListener(function(msg, sender, respondWith) {
    var tab = sender.tab.id;
    log(msg.action + " fired by " + tab + ".");
    if (msg.action === "echo_tab_id") {
      respondWith(tab);
      return true;
    } else if (msg.action === "inject_css" && msg.details.file) {
      // a tab wants css injected
      chrome.tabs.insertCSS(
        tab,
        {
          file: msg.details.file
        },
        function() {
          respondWith(chrome.runtime.lastError);
        }
      );
      return true;
    } else if (msg.action === "inject_js" && msg.details.file) {
      // a tab wants js run
      chrome.tabs.executeScript(
        tab,
        {
          file: msg.details.file
        },
        function() {
          respondWith(chrome.runtime.lastError);
        }
      );
      return true;
    }
  });
}

export { log, removeEl, inject, handleInjections };
