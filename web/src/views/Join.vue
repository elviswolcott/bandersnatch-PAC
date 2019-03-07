<template>
  <div class="join">
    <h1>Scan</h1>
    <div id="no-video" v-if="msg">
      <h2 id="no-video-msg">{{msg}}</h2>
    </div>
    <canvas id="video-out" hidden></canvas>
    <h1>or enter your code:</h1>
    <form id="code" onsubmit="event.preventDefault()" @keydown.delete="backDigit" @keydown.left="leftDigit" @keydown.right="rightDigit">
      <input type="text" min="0" max="9" step="1" id="digit1" v-model="digit1" placeholder="0" pattern="[0-9]*" inputmode="decimal"  @focus="focus(1)">
      <input type="text" min="0" max="9" step="1" id="digit2" v-model="digit2" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(2)">
      <input type="text" min="0" max="9" step="1" id="digit3" v-model="digit3" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(3)">
      <input type="text" min="0" max="9" step="1" id="digit4" v-model="digit4" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(4)">
      <span>-</span>
      <input type="text" min="0" max="9" step="1" id="digit5" v-model="digit5" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(5)">
      <input type="text" min="0" max="9" step="1" id="digit6" v-model="digit6" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(6)">
      <input type="text" min="0" max="9" step="1" id="digit7" v-model="digit7" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(7)">
      <input type="text" min="0" max="9" step="1" id="digit8" v-model="digit8" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(8)">
      <span>-</span>
      <input type="text" min="0" max="9" step="1" id="digit9" v-model="digit9" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(9)">
      <input type="text" min="0" max="9" step="1" id="digit10" v-model="digit10" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(10)">
      <input type="text" min="0" max="9" step="1" id="digit11" v-model="digit11" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(11)">
      <input type="text" min="0" max="9" step="1" id="digit12" v-model="digit12" placeholder="0" pattern="[0-9]*" inputmode="decimal" @focus="focus(12)">
      <br>
      <br>
      <button @click="formCode" id="digit-submit">Connect</button>
    </form>
  </div>
</template>

<script>
import jsQR from "jsqr";

const publicPath = 'https://pac.elviswolcott.com';

// watcher for various input fields
function makeWatcher(num, end) {
  return function(val) {
    if(val === null || typeof val == "number") {
      return;
    }
    val = parseInt(val[val.length-1]);
    if(val !== val || typeof val != "number") {
      this.$data[`digit${num}`] = null;
      return;
    }
    this.$data[`digit${num}`] = val % 10;
    this.$data.current = num+1;
    var next;
    if(end === true) {
      next = '-submit';
    } else {
      next = num+1;
    }
    document.getElementById(`digit${next}`).focus();
  }
}


export default {
  name: "join",
  components: {
  },
  data: () => { return  {
    digit1: null,
    digit2: null,
    digit3: null,
    digit4: null,
    digit5: null,
    digit6: null,
    digit7: null,
    digit8: null,
    digit9: null,
    digit10: null,
    digit11: null,
    digit12: null,
    msg: 'Unable to access video stream. Allow camera access or enter the code manually.',
    current: 1
  }},
  methods: {
    formCode: function() {
      const d1 = this.$data.digit1 % 10;
      const d2 = this.$data.digit2 % 10;
      const d3 = this.$data.digit3 % 10;
      const d4 = this.$data.digit4 % 10;
      const d5 = this.$data.digit5 % 10;
      const d6 = this.$data.digit6 % 10;
      const d7 = this.$data.digit7 % 10;
      const d8 = this.$data.digit8 % 10;
      const d9 = this.$data.digit9 % 10;
      const d10 = this.$data.digit10 % 10;
      const d11 = this.$data.digit11 % 10;
      const d12 = this.$data.digit12 % 10;
      this.$router.push(`/remote/${d1}${d2}${d3}${d4}-${d5}${d6}${d7}${d8}-${d9}${d10}${d11}${d12}`);
    },
    backDigit: function() {
      this.$data[`digit${this.$data.current}`] = null;
      if(this.$data.current > 1) {
        this.$data.current--;
      }
      document.getElementById(`digit${this.$data.current}`).focus();
    },
    leftDigit: function(e) {
      if(this.$data.current > 1) {
        this.$data.current--;
      }
      document.getElementById(`digit${this.$data.current}`).focus();
      e.preventDefault();
    },
    rightDigit: function(e) {
      if(this.$data.current < 13) {
        this.$data.current++;
      }
      if(this.$data.current < 13) {
        document.getElementById(`digit${this.$data.current}`).focus();
      }
      
      e.preventDefault();
    },
    focus: function(n) {
      this.$data.current = n;
    }
  },
  watch: {
    digit1: makeWatcher(1),
    digit2: makeWatcher(2),
    digit3: makeWatcher(3),
    digit4: makeWatcher(4),
    digit5: makeWatcher(5),
    digit6: makeWatcher(6),
    digit7: makeWatcher(7),
    digit8: makeWatcher(8),
    digit9: makeWatcher(9),
    digit10: makeWatcher(10),
    digit11: makeWatcher(11),
    digit12: makeWatcher(12, true),
  },
  mounted: function() {
    document.body.classList.remove('darkmode');
    
    var video = document.createElement("video");
    var canvasElement = document.getElementById("video-out");
    var canvas = canvasElement.getContext("2d");

    canvasElement.style.display = 'none';


    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(stream => {
      this.$data.msg = 'Getting video from camera...';
      video.srcObject = stream;
      video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
      video.play();
      requestAnimationFrame(tick);
    }).catch(e => {
      this.$data.msg = e.toString();
    });
    var that = this;

    function tick() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvasElement.style.display = 'inherit';
        that.$data.msg = null;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
        var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code) {
          // navigate
          console.log(code.data);
          that.$router.push(code.data.replace(publicPath, ''));
        } else {
          // continue
        }
      } else {
        that.$data.msg= 'Camera is not providing video.';
      }
      requestAnimationFrame(tick);
    }
  }
};
</script>

<style lang="scss" scoped>
$primary: #af1414;
$onprimary: white;
$secondary: black;
// hide the number arrows
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    /* display: none; <- Crashes Chrome on hover */
    -webkit-appearance: none;
    margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

input[type=number] {
    -moz-appearance:textfield; /* Firefox */
}

#no-video {
  width: 400px;
  max-width: calc(100% - 64px);
  display: inline-block;
  padding: 16px;
  background-color: rgba(0, 0, 0, 0.2);
  margin: 16px;
  word-wrap: break-word;
}

#video-out {
  width: 400px;
  max-width: calc(100% - 32px);
  display: inline-block;
  margin: 16px;
}

#code {
  font-size: 2em;

  button {
    &:hover {
      background-color: lighten($primary, 10%);
    }

    background-color: $primary;
    color: $onprimary;
    border: none;
    border-radius: 4px;
    font-size: 1em;
    padding: 8px;
  }

  input[type="text"] {
    &:focus {
      outline: none;
      border-bottom: 2px $primary solid;
      background-color: lighten($primary, 60%);
      border-radius: 2px;
    }

    background-color: transparent;
    color: $secondary;
    border: none;
    font-size: .8em;
    text-align: center;
    width: 1em;
  }

  #digit-extra {
    color: transparent !important;
    &:focus {
      border: none !important;
    }
  }
}

@media only screen and (max-width: 600px) {
  input[type="text"] {
    padding: 0px;
    width: 20px !important;
  }
}
</style>

