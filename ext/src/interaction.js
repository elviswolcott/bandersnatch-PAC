import { log } from "Shared/common.js";
import { fireError, fireInfo } from "Shared/message.js";
import { startCommunication } from "Shared/cs2cs.js";

/* start script */

// pause the video
const pause = () => {
  document.getElementsByClassName("button-nfplayerPause")[0].click();
};

// play the video
const play = () => {
  document.getElementsByClassName("button-nfplayerPlay")[0].click();
};

// converts a DOM node to JSON with relevant info
const nodeToOption = el => {
  if (el.innerText != "") {
    return {
      type: "text",
      data: el.innerText,
      cmp: el.innerText
    };
  } else {
    el = el.getElementsByClassName("choiceImage")[0];
    return {
      type: "image",
      data: el.style.backgroundImage,
      cmp: el.attributes["aria-label"].value
    };
  }
};

// compare two options for equality
const optionEquals = (a, b) => {
  return a.cmp === b.cmp;
};

// get the currently available choices
const getChoices = () => {
  return Array.from(
    document.getElementsByClassName(
      "BranchingInteractiveScene--choice-selection"
    )
  ).map(nodeToOption);
};

// select a choice
const choose = choices => {
  var arr = choices;
  if (typeof choices == "string") {
    arr = [choices];
  }
  arr.forEach(choice => {
    log(`Selecting ${choice}`);
    Array.from(
      document.getElementsByClassName(
        "BranchingInteractiveScene--choice-selection"
      )
    ).forEach(el => {
      if (optionEquals({ cmp: choice }, nodeToOption(el))) {
        fakeClick(el);
      }
    });
  });
};

var port = startCommunication();
// connect commands from controller script to the functions to interact with the page
port.on("pause", pause);
port.on("play", play);
port.on("choose", choose);

//port.send('update_icon', 'icon.png');
port.send("enable_action", "index");

// ignore any events from the user (browser marks as trusted) so that only the extension can control
const ignoreReal = e => {
  if (e.isTrusted) {
    // the user is trying to gain control!!
    fireInfo(
      "I know that you were planning to make your own selection, and I'm afraid that's something I cannot allow to happen."
    );
    e.preventDefault();
    e.stopPropagation();
    log("Prevented event");
  }
};

const onPlayerChanged = mutationList => {
  mutationList.forEach(change => {
    if (change.addedNodes.length == 0) return;

    const relevantNodes = Array.from(change.addedNodes).filter(node => {
      return node.classList.contains("main-hitzone-element-container");
    });

    if (relevantNodes.length > 0) {
      log("New set of choices on the way.");
      // block off user input (so that someone can override the vote)
      relevantNodes.forEach(el => {
        el.addEventListener("mouseup", ignoreReal);
        el.addEventListener("mousedown", ignoreReal);
        el.addEventListener("click", ignoreReal);
      });

      port.send("presentChoice_options", {
        unique: new Date().getTime(),
        options: getChoices()
      });

      // wait for the time to be added so that the clients are synced with the countdown on screen
      var time = document.getElementsByClassName(
        "BranchingInteractiveScene--horizontal-timer-container"
      )[0];
      var options = {
        childList: false,
        attributes: true,
        subtree: false
      };
      var sent = false;
      var observer = new MutationObserver((mutationList, observer) => {
        mutationList.forEach(mutation => {
          if (mutation.attributeName === "data-remaining-time") {
            const val = parseInt(mutation.target.dataset.remainingTime);
            if (val > 0 && !sent) {
              port.send("presentChoice_end", new Date().getTime() + val);
              sent = true;
              observer.disconnect();
            }
          }
        });
      });
      observer.observe(time, options);
    }
  });
};

// using a mutation observer, watch for changes to the DOM to tell when options are presented
const createMainObserver = port => {
  var player = document.getElementsByClassName("nfp")[0];
  const observerOptions = {
    childList: true,
    attributes: false,
    subtree: true
  };
  var observer = new MutationObserver(onPlayerChanged);
  observer.observe(player, observerOptions);
};

// waits 5s before starting, intro and first scene is a few minutes so this is fine
setTimeout(() => {
  log("Observing DOM for changes");
  fireInfo("Ready");
  createMainObserver(port);
}, 5e3);

// dispatches a mousedown and mouseup to fake a click
function fakeClick(el) {
  var rect = el.getBoundingClientRect();
  var x = rect.left;
  var y = rect.bottom;
  el.dispatchEvent(
    new MouseEvent("mousedown", {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      detail: 1,
      metaKey: false,
      relatedTarget: null,
      screenX: x,
      screenY: y + 100,
      shiftKey: false,
      view: window
    })
  );
  // mouse down gives the highlight, mouseup actually fires it
  el.dispatchEvent(
    new MouseEvent("mouseup", {
      altKey: false,
      bubbles: true,
      button: 0,
      buttons: 1,
      cancelable: true,
      clientX: x,
      clientY: y,
      composed: true,
      ctrlKey: false,
      detail: 1,
      metaKey: false,
      relatedTarget: null,
      screenX: x,
      screenY: y + 100,
      shiftKey: false,
      view: window
    })
  );
}
