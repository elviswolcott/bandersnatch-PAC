/* webpack stuff */
import { log } from "./shared/common.js";
import { startEcho } from "./shared/cs2cs.js";
const PubNub = require("pubnub");
const keys = require("../../keys.json");
/* no more webpack stuff */

// generate a unique channel identifier, this is shared through a QR code
if (localStorage.getItem("pac-channel") === null) {
  localStorage.setItem(
    "pac-channel",
    "XXXX-XXXX-XXXX"
      .split("")
      .map(c => {
        return c === "X" ? Math.round(Math.random() * 9) : c;
      })
      .join("")
  );
}
var userChannelId = localStorage.getItem("pac-channel");

/* start script */
log("Taking control.");

var port = startEcho();
// update icon for all connected tabs
port.on("update_icon", (m, p) => {
  chrome.pageAction.setIcon({
    tabId: p.sender.tab.id,
    path: {
      "128": "img/128w/" + m,
      "64": "img/64w/" + m,
      "48": "img/48w/" + m,
      "32": "img/32w/" + m,
      "24": "img/24w/" + m,
      "16": "img/16w/" + m
    }
  });
});

port.on("enable_action", (m, p) => {
  const t = p.sender.tab.id;
  log(`Enabling for tab ${t}`);
  chrome.pageAction.setPopup({
    tabId: t,
    popup: `${m}.html`
  });
  chrome.pageAction.show(t);
});

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

// object for tallying up votes
var votes = {};

// record a single vote
const recordVote = option => {
  votes[option] = votes[option] !== undefined ? votes[option] : 0;
  // add in the vote
  votes[option]++;
  log(`Recorded ${option}`);
};

// find the winner and reset
const tallyVotes = () => {
  log(votes);
  var winner = Object.entries(votes).reduce(
    (max, val) => {
      if (val[1] > max[1]) {
        return val;
      } else {
        return max;
      }
    },
    [0, 0]
  )[0];
  log(`${winner} has won`);
  // reset for next round
  if (votes.PAC_MULTIVOTE) {
    winner = JSON.parse(winner);
  }
  votes = {};
  port.send("choose", winner);
};

/* connect to pubnub and relay commands to the interaction content script */
var pubnub = new PubNub(
  Object.assign(keys, {
    ssl: true
  })
);
pubnub.subscribe({
  channels: [userChannelId]
});
pubnub.addListener({
  message: msg => {
    const payload = msg.message;
    if (payload.type === "choice") {
      recordVote(payload.data);
      votes.PAC_MULTIVOTE = false;
    } else if (payload.type === "multichoice") {
      recordVote(JSON.stringify(payload.data));
      votes.PAC_MULTIVOTE = true;
    }
  }
});

var lastEnd = 0; // used for debounce to prevent extra messages
var lastUnique = 0;
port.on("presentChoice_options", choices => {
  // debounce the port
  if (choices.unique === lastUnique) {
    return;
  }
  lastUnique = choices.unique;
  // make sure votes are reset
  votes = {};
  pubnub.publish({
    channel: userChannelId,
    message: {
      type: "options",
      data: choices.options
    },
    function(status, response) {
      console.log(status, response);
      if (status.error) {
        console.log(error);
      }
    }
  });
});

port.on("presentChoice_end", end => {
  // debounce the port
  if (end === lastEnd) {
    return;
  }
  // tally votes right before time is up
  setTimeout(tallyVotes, end - new Date().getTime() - 100);
  lastEnd = end;
  pubnub.publish({
    channel: userChannelId,
    message: {
      type: "timeout",
      data: end
    },
    function(status, response) {
      console.log(status, response);
      if (status.error) {
        console.log(error);
        fireError("Unable to connect to servers.");
      }
    }
  });
});
