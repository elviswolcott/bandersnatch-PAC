import { log, inject } from "Shared/common.js";

log("Extension loaded on page.");

// check if it is actually Bandersnatch
if (window.location.pathname === "/watch/80988062") {
  // handles interacting with the DOM of the window
  inject("interaction.js", "page interaction script");
}
