import { log } from "Shared/common.js";
import { startCommunication } from "Shared/cs2cs.js";

// start the port
var port = startCommunication();
// enable the page action
port.send("enable_action", "index");

// converts a DOM node to JSON with the relevant info
const nodeToOption = el => {
  // if there is text the option is a normal text option
  if (el.innerText != "") {
    return {
      type: "text",
      data: el.innerText,
      cmp: el.innerText
    };
  } else {
    // otherwise it is an image option
    // get the inner element which contains the image
    el = el.getElementsByClassName("choiceImage")[0];
    return {
      type: "image",
      // get the background image for displaying in the web app
      data: el.style.backgroundImage,
      // use the label for comparison
      cmp: el.attributes["aria-label"].value
    };
  }
};

// get the currently available choices
const getChoices = () => {
  // convert the elements with the choice selection class into an array
  return Array.from(
    document.getElementsByClassName(
      "BranchingInteractiveScene--choice-selection"
    )
    // replace the elements with the JSON we care about
  ).map(nodeToOption);
};

// compare two options for equality
const optionEquals = (a, b) => {
  return a.cmp === b.cmp;
};

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
  // mouse down gives the highlight, mouseup actually selects it
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


// select a choice
const choose = choices => {
  var arr = choices;
  // if it was a single choice convert to a 1 element array
  if (typeof choices == "string") {
    arr = [choices];
  }
  // loop through each selection to make
  arr.forEach(choice => {
    log(`Selecting ${choice}`);
    // get all the choice selection elements as an array
    Array.from(
      document.getElementsByClassName(
        "BranchingInteractiveScene--choice-selection"
      )
    ).forEach(el => {
      // if the option is the one we want to select, click it
      if (optionEquals({ cmp: choice }, nodeToOption(el))) {
        fakeClick(el);
      }
    });
  });
};

// connect commands from controller script to the functions to interact with the page
port.on("choose", choose);



// ignore any events from the user (marked as trusted by the browser)
// this prevents the popular vote being overridden
const ignoreReal = e => {
  if (e.isTrusted) {
    e.preventDefault();
    e.stopPropagation();
    log("Prevented event");
  }
};

const onPlayerChanged = mutationList => {
  mutationList.forEach(change => {
    // we only care about new nodes being added
    if (change.addedNodes.length == 0) return;

    const relevantNodes = Array.from(change.addedNodes).filter(node => {
      return node.classList.contains("main-hitzone-element-container");
    });

    if (relevantNodes.length > 0) {
      log("New set of choices on the way.");
      // block off user input (so that someone can not override the vote)
      relevantNodes.forEach(el => {
        el.addEventListener("mouseup", ignoreReal);
        el.addEventListener("mousedown", ignoreReal);
        el.addEventListener("click", ignoreReal);
      });

      // send the choices to the background
      port.send("presentChoice_options", {
        options: getChoices()
      });

      // use another mutation observer to figure out when the decision window closes
      var time = document.getElementsByClassName(
        "BranchingInteractiveScene--horizontal-timer-container"
      )[0];
      // instead of looking for element changes look for an attribute change
      var options = {
        childList: false,
        attributes: true,
        subtree: false
      };
      var sent = false;
      var observer = new MutationObserver((mutationList, observer) => {
        mutationList.forEach(mutation => {
          // the time is stored in data-remaining-time
          if (mutation.attributeName === "data-remaining-time") {
            // convert to an int
            const val = parseInt(mutation.target.dataset.remainingTime);
            // at first it is -1, which is a useless value
            if (val > 0 && !sent) {
              // send the calculated end time to the port
              port.send("presentChoice_end", new Date().getTime() + val);
              // prevent the time from being send repeatedly
              sent = true;
              // disconnect the observer to avoid a performance hit
              observer.disconnect();
            }
          }
        });
      });
      // start observing
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

// waits 5s before starting to avoid firing a bunch as the page sets up, intro and first scene is a few minutes so this is fine
setTimeout(() => {
  log("Observing DOM for changes");
  createMainObserver(port);
}, 5e3);