<template>
  <div class="remote">
    <div class="countdown-container">
      <div class="countdown" :style="{width: `${Math.min( (timerPos/timerEnd) * 100, 100)}%`}"></div>
    </div>
    <div class="progress">
      <div class="option selected" v-for="option in chosen" :key="`chosen${option}`">
        <p>{{option}}</p>
      </div>
    </div>
    <div class="option" v-for="option in options" :key="option.cmp" @click="choose(option.cmp)" :class="{ignore: option.ignore, selected: option.selected}">
      <p v-if="option.type === 'text'">{{option.data}}</p>
      <div class="option-image" v-if="option.type === 'image'" :style="{backgroundImage: option.data.replace('webp', 'png')}"></div>
    </div>
  </div>
</template>

<script>
const PubNub = require('pubnub');
const keys = require('../../../keys.json');
var pubnub = new PubNub(Object.assign(keys, {
  ssl: true,
}));

export default {
  data: () => {return {
    options: [],
    timerEnd: 1,
    timerPos: 0,
    chosen: [],
    submitted: false,
  }},
  methods: {
    choose: function(item) {
      if(this.$data.submitted) {
        return;
      }
      if(this.$data.options.length == 10) {
        this.$data.chosen.push(item);
      } else {
        this.$data.submitted = true;
        pubnub.publish({
          channel: this.$route.params.channel,
          message: {
            type: 'choice',
            data: item
          }
        });
        this.options.forEach(option => {
          if(option.cmp === item) {
            option.selected = true;
          } else {
            option.ignore = true;
          }
        });
      }
      
    },
    startTimer: function(t) {
      this.timerEnd = t;
      this.timerPos = 0;
      setTimeout(this.tickTime, 100);
    },
    tickTime: function() {
      this.$data.timerPos += 100;
      if(this.$data.timerPos > this.$data.timerEnd) {
        this.$data.options = [];
        this.$data.timerPos = 0;
        this.$data.timerEnd = 1;
      } else {
        setTimeout(this.tickTime, 100);
      }
    }
  },
  watch: {
    chosen: function(val) {
      if(val.length === 5) {
        pubnub.publish({
          channel: this.$route.params.channel,
          message: {
            type: 'multichoice',
            data: this.$data.chosen
          }
        });
        this.$data.chosen = [];
        this.$data.submitted = true;
      }
    }
  },
  created: function() {
    document.body.classList.add('darkmode');
    pubnub.subscribe({
      channels: [this.$route.params.channel]
    });

    pubnub.addListener({
      message: msg => {
        const payload = msg.message;
        console.log(payload);
        if(payload.type === 'options') {
          this.$data.submitted = false;
          this.$data.options = payload.data.map(option => {
            return Object.assign({ignore: false, selected: false}, option);
          });
        } else if (payload.type === 'timeout') {
          if(this.$data.options.length == 10) {
            payload.data -= 1e3; // submit phone number slightly earlier
          }
          this.startTimer(payload.data - (new Date()).getTime() - 250);
        }
      }
    });
  }
}
</script>


<style lang="scss" scoped>
.remote {
  text-align: center;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  padding-top: calc(50vh - 25px);
}

.countdown-container {
  position: absolute;
  top: 0;
  right: 0;
  display: block;
  width: 100%;
}

.progress {
  position: absolute;
  top: 0;
  text-align: center;
  width: 100%;
  margin: 2px -8px;
}

.countdown {
  height: 10px;
  transition: width 100ms linear;
  background-color: white;
}

.option {
  display: inline-block;
  flex-grow: 1;
  color: white;
  opacity: .6;
  cursor: pointer;
  font-size: 1.2em;
  padding-bottom: 16px;

  &:hover, &.selected {
    opacity: 1;
  }

  &:hover:not(.ignore) {
    background-image: url(https://assets.nflxext.com/ffe/oui/interactive/bs/choicepoint/web/20181116/choice_point_underline_2x.png);
    background-repeat: no-repeat;
    background-position-x: center;
    background-position-y: bottom;
  }

  &.ignore {
    opacity: .4;
  }
}

.option-image {
  height: 50px;
  background-position: center;
  background-size: contain;
  background-repeat: no-repeat;
}

@media only screen and (max-width: 500px) {
  .remote {
    flex-direction: column;
    padding-top: 0px;
  }

  .option {
    padding: 16px 0px;
  }
}
</style>


