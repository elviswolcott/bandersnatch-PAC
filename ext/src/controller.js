import { log, handleInjections } from "./shared/common.js";
import { startEcho } from "./shared/cs2cs.js";
const PubNub = require("pubnub");
const keys = require("../../keys.json");

// check if there is already a code
if (localStorage.getItem("pac-channel") === null) {
  // if not, set it to a random number of the form XXXX-XXXX-XXXX where Xs are digits 0-9
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
// now that we have a channel code, store it in a variable for later use
const userChannelId = localStorage.getItem("pac-channel");

// start a port for communicating with tabs
var port = startEcho();
// handle injecting any files when requested
handleInjections();

// when the enable_action command is received get which tab requested to be
// enabled and enable the page action for it
port.on("enable_action", (m, p) => {
  // get the tab which sent the message
  const t = p.sender.tab.id;
  log(`Enabling for tab ${t}`);
  // set the popup to be the requested file
  chrome.pageAction.setPopup({
    tabId: t,
    popup: `${m}.html`
  });
  // enable the page action so the popup will show when the icon is clicked
  chrome.pageAction.show(t);
});

// object for tallying up votes
var votes = {};

// record a single vote
const recordVote = option => {
  // if there are no votes yet set the votes to 0
  votes[option] = votes[option] !== undefined ? votes[option] : 0;
  // increment the number of votes
  votes[option]++;
  log(`Recorded ${option}`);
};

// find the winner and reset
const tallyVotes = () => {
  log(votes);
  // iterate through each key/value pair in the object
  var winner = Object.entries(votes).reduce(
    // takes the current max and a value to compare
    (max, val) => {
      // values are of the form [key, votes]
      if (val[1] > max[1]) {
        // if the new value has more votes it becomes the new max
        return val;
      } else {
        // otherwise the max does not change
        return max;
      }
    },
    // the initial value is 0
    [0, 0]
    // take the key for the winner
  )[0];
  log(`${winner} has won`);
  // reset for next round
  if (votes.PAC_MULTIVOTE) {
    // if it is a multivote the options are string encoded JSON, decode it
    winner = JSON.parse(winner);
  }
  // reset the votes to empty
  votes = {};
  // send the winner to the content script
  port.send("choose", winner);
};

// connect to pubnub and relay commands to the interaction content script
var pubnub = new PubNub(
  // combine the keys from keys.json with ssl: true (other settings can go here too)
  Object.assign(keys, {
    ssl: true
  })
);

// subscribe to the unique channel with PubNub
pubnub.subscribe({
  channels: [userChannelId]
});

// add a listener to incoming messages
pubnub.addListener({
  message: msg => {
    const payload = msg.message;
    if (payload.type === "choice") {
      // for normal choices just record the vote
      recordVote(payload.data);
      votes.PAC_MULTIVOTE = false;
    } else if (payload.type === "multichoice") {
      // if it is a multiple choice (the phone number scene) string encode the different choices
      recordVote(JSON.stringify(payload.data));
      votes.PAC_MULTIVOTE = true;
    }
  }
});


// add a listener for when the options are detected
port.on("presentChoice_options", choices => {
  // make sure votes are reset now that there are new options
  votes = {};
  // publish the choices to the unique channel with PubNub
  pubnub.publish({
    channel: userChannelId,
    message: {
      type: "options",
      data: choices.options
    },
    // if there is an error just log it
    function(status, response) {
      console.log(status, response);
      if (status.error) {
        console.log(error);
      }
    }
  });
});

// add a listener for when the decision duration is computer
port.on("presentChoice_end", end => {
  // tally votes right before time is up
  setTimeout(tallyVotes, end - new Date().getTime() - 100);
  // publish the timeout for casting votes to the unique channel with PunNub
  pubnub.publish({
    channel: userChannelId,
    message: {
      type: "timeout",
      data: end
    },
    // if there is an error just log it
    function(status, response) {
      console.log(status, response);
      if (status.error) {
        console.log(error);
      }
    }
  });
});
