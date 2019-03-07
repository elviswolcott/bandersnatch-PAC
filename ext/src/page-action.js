import QRCode from 'qrcode'

const basepath = "pac.elviswolcott.com"
const channel = localStorage.getItem('pac-channel');

document.getElementById('public-path').innerText = basepath;
var target = document.getElementById('qr-code');
QRCode.toCanvas(target, `https://${basepath}/remote/${channel}`, {
  errorCorrectionLevel: "H",
  version: 10,
});
document.getElementById('code').innerText = channel;