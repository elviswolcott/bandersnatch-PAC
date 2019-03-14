<template>
  <div class="join">
    <div id="topbar">
      <img src="./logo.png" id="logo" />
    </div>
    <div id="scanner" v-if="useCamera">
      <canvas id="video-out" hidden></canvas>
      <p>Scan your code to connect.</p>
    </div>
    <div id="manual-entry" v-if="!useCamera">
      <h1>Enter your code from the extension to connect.</h1>
      <form
        id="code"
        onsubmit="event.preventDefault()"
        @keydown.delete="backDigit"
        @keydown.left="leftDigit"
        @keydown.right="rightDigit"
      >
        <div
          v-for="(digit, index) in digits"
          :key="`digit${index}`"
          style="display: inline-block"
        >
          <input
            :id="`digit${index}`"
            v-model="digits[index]"
            @focus="focus(index)"
            type="text"
            min="0"
            max="9"
            step="1"
            placeholder="0"
            pattern="[0-9]*"
            inputmode="decimal"
            autocomplete="off"
          />
          <span v-if="index % 4 == 3 && index != 11">-</span>
        </div>
        <br />
        <button @click="formCode" id="digit-submit">Connect</button>
      </form>
    </div>
  </div>
</template>

<script>
import jsQR from "jsqr";
const deploy = require("../../../deploy-details.json");
const publicPath = `https://${deploy.publicPath}`;

export default {
  name: "join",
  components: {},
  data: () => {
    return {
      digits: ["", "", "", "", "", "", "", "", "", "", "", ""],
      current: 1,
      useCamera: true
    };
  },
  methods: {
    formCode: function() {
      var path = "/remote/";
      this.$data.digits.forEach((digit, index) => {
        // cut everything down to one digit
        digit = parseInt(digit) % 10;
        // repalce NaN with ""
        if (digit != digit) {
          digit = "";
        }
        // update the model data
        this.$data.digits[index] = digit;
        // add to the path
        path += this.$data.digits[index];
        // add a - every 4 characters
        if (index % 4 === 3 && index != 11) {
          path += "-";
        }
      });
      // naviagte to the remote page
      this.$router.push(path);
    },
    backDigit: function() {
      // delete the current digit
      this.$data[this.$data.current] = "";
      // move back
      this.leftDigit();
    },
    leftDigit: function(e) {
      // go back one digit
      if (this.$data.current > 0) {
        this.$data.current--;
      }
      // focus the DOM element
      document.getElementById(`digit${this.$data.current}`).focus();
      // prevent the event if it was from the keyboard
      if (e !== undefined) {
        e.preventDefault();
      }
    },
    rightDigit: function(e) {
      // go forwards a digit
      if (this.$data.current < 12) {
        this.$data.current++;
      }
      // focus the DOM element
      if (this.$data.current < 12) {
        document.getElementById(`digit${this.$data.current}`).focus();
      }
      // prevent the event if it was from the keyboard
      if (e !== undefined) {
        e.preventDefault();
      }
    },
    focus: function(n) {
      // change the current digit
      this.$data.current = n;
    }
  },
  watch: {
    digits: {
      handler: function(values) {
        // if the item is set to null do nothing
        if (values[this.$data.current] == "") {
          return;
        }
        // input validation
        var digit = parseInt(values[this.$data.current]) % 10;
        // NaN
        if (digit != digit) {
          this.$data.digits[this.$data.current] = "";
          return;
        } else {
          this.$data.digits[this.$data.current] = digit;
        }

        if (this.$data.current == 11) {
          // focus the submit button
          this.$data.current = 12;
          document.getElementById("digit-submit").focus();
        } else {
          // go forwards a digit
          this.rightDigit();
        }
      },
      // observe the values in the array, not just the elements
      deep: true
    }
  },
  mounted: function() {
    // make sure it isn't in darkmode for this page
    document.body.classList.remove("darkmode");
    // elements for taking video from camera
    var video = document.createElement("video");
    var canvasElement = document.getElementById("video-out");
    var canvas = canvasElement.getContext("2d");
    canvasElement.style.display = "none";

    // Use facingMode: environment to attemt to get the front camera on phones
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
        video.play();
        requestAnimationFrame(tick);
      })
      .catch(e => {
        console.log(e);
        // if there is an error use manual entry instead of the camera
        this.$data.useCamera = false;
      });

    var that = this;
    // runs every available frame
    function tick() {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // show the video output
        canvasElement.style.display = "inline-block";
        that.$data.useCamera = true;

        canvasElement.height = video.videoHeight;
        canvasElement.width = video.videoWidth;
        canvas.drawImage(
          video,
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        var imageData = canvas.getImageData(
          0,
          0,
          canvasElement.width,
          canvasElement.height
        );
        // attempt to extract the QR code data
        var code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert"
        });
        if (code) {
          // navigate
          console.log(code.data);
          that.$router.push(code.data.replace(publicPath, ""));
        } else {
          // continue
        }
      }
      // get another frame
      requestAnimationFrame(tick);
    }
  }
};
</script>

<style lang="scss" scoped>
@import "~@/assets/_theme.scss";
// hide the number arrows
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  /* display: none; <- Crashes Chrome on hover */
  -webkit-appearance: none;
  margin: 0; /* <-- Apparently some margin are still there even though it's hidden */
}

.join {
  color: $onlight;
}

#topbar {
  background-color: $primary;
  text-align: left;
  padding: 8px;
}

#logo {
  width: 32px;
}

#video-out {
  width: 100%;
}

#manual-entry {
  h1 {
    font-size: 1.5em;
  }
}

#code {
  font-size: 64px;
  color: $onlight;

  button {
    &:hover {
      background-color: $primary-active;
    }

    font-family: $font-alt;
    background-color: $primary;
    color: $onprimary;
    border: none;
    border-radius: 0.2em;
    font-size: 0.8em;
    padding: 8px 16px;
    margin-top: 8px;
  }

  input[type="text"] {
    &:focus {
      outline: none;
      border-bottom-color: $primary;
      border-radius: 2px;
    }

    font-family: $font-stack;
    font-size: 64px;
    background-color: transparent;
    color: $onlight;
    border: none;
    border-bottom-color: transparent;
    border-bottom-style: solid;
    border-bottom-width: 4px;
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
@media only screen and (max-width: 900px) {
  #code {
    font-size: 40px;

    input[type="text"] {
      border-bottom-width: 2px;
      font-size: 40px;
      padding: 0px;
      width: 28px;
    }
  }
}
@media only screen and (max-width: 600px) {
  #code {
    font-size: 34px;

    input[type="text"] {
      font-size: 34px;
      padding: 0px;
      width: 28px;
    }
  }
}
@media only screen and (max-width: 400px) {
  #code {
    font-size: 32px;

    input[type="text"] {
      font-size: 32px;
      padding: 0px;
      width: 25px;
    }
  }
}
@media only screen and (max-width: 350px) {
  #code {
    font-size: 32px;

    input[type="text"] {
      font-size: 32px;
      padding: 0px;
      width: 24px;
    }
  }
}
</style>
