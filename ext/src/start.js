import { log, inject } from "Shared/common.js";

log("Extension loaded on page.");

if (window.location.pathname === "/watch/80988062") {
  // injects all the necessary contents scrips and css

  // navigator handles interacting with the DOM of the window
  inject("interaction.js", "page interaction script");
}
