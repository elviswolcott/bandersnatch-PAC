import { startCommunication } from "Shared/cs2cs.js";

var port = startCommunication();

function fireError(msg) {
  port.send("display_error", msg);
}

function fireInfo(msg) {
  port.send("display_info", msg);
}

export { fireError, fireInfo };
