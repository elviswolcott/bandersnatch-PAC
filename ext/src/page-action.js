import QRCode from 'qrcode'
const deploy = require('../../deploy-details.json');
const basepath = deploy.publicPath;
const channel = localStorage.getItem('pac-channel');

document.getElementById('public-path').innerText = basepath;
var target = document.getElementById('qr-code');
QRCode.toCanvas(target, `https://${basepath}/remote/${channel}`, {
  errorCorrectionLevel: "H",
  version: 10,
});
document.getElementById('code').innerText = channel;