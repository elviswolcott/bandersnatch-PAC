// makes things cleaner in the top level log
function log(m) {
  console.log("Bandersnatch PAC: ", m);
}
// removes an element from the DOM by id
function removeEl(id) {
  try {
    document.getElementById(id).parentElement.removeChild(document.getElementById(id));
  } catch (e) {
    log(id + ' already removed');
  }
}
// attempts to inject a resource
// runs asynchronously
function inject(file, logString) {
  log('Asking to inject ' + logString + '.');
  var split = file.split('.');
  var ext = split[split.length-1];
  chrome.runtime.sendMessage({
    action: 'inject_' + ext,
    details: {
      file: file
    }
  }, function(error) {
    log('Injecting ' + logString + ' ' + (error? 'failed with error:\n ' + error.message : 'succeeded.'));
  });
}
function nodeListToArray(nodeList) {
  var array = [];
  for(let i = 0; i<nodeList.length; i++) {
    array.push(nodeList[i]);
  }
  return array
}

export {log, removeEl, inject, nodeListToArray}