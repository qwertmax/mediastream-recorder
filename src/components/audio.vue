<template>
  <div class="audio">
    <div class="audio__container">
      <div class="audio__player">
        <div class="audio__row">
          <div
            v-if="!playing"
            @click.once="play"
            key="btn-play"
            class="audio__button btn-play"
          >
            <img src="@/assets/play.svg" alt="play" class="audio__icon" />
            <span>Review audio</span>
          </div>
          <div
            v-else
            @click.once="pause"
            key="btn-pause"
            class="audio__button btn-pause"
          >
            <img src="@/assets/pause.svg" alt="play" class="audio__icon" />
            <span>Pause</span>
          </div>
          <div
            class="audio__button delete btn-delete"
            @click.once="deleteTrack"
          >
            <img src="@/assets/delete.svg" alt="play" class="audio__icon" />
            <span>Delete</span>
          </div>
        </div>
        <div class="audio__row">
          <input
            type="range"
            :value="current"
            :max="100"
            @change="changeCurrent"
            class="audio__input"
          />
        </div>
        <div class="audio__row">
          <div class="audio__time">{{ currentFormatted }}</div>
          <div class="audio__time">{{ durationFormatted }}</div>
        </div>
      </div>
      <slot />
    </div>
  </div>
</template>

<script>
import { formatTime } from "../services/system";

export default {
  props: {
    src: { type: String, required: true },
  },

  data() {
    return {
      audio: new Audio(this.src),
      current: 0,
      duration: 0,
      playing: false,
    };
  },

  computed: {
    currentFormatted() {
      const intTime = parseInt((this.current * this.duration) / 100, 10);
      return formatTime(intTime);
    },

    durationFormatted() {
      const intTime = parseInt(this.duration, 10);
      return formatTime(intTime);
    },
  },

  mounted() {
    this.audio.addEventListener("loadedmetadata", this.setData);
    this.audio.addEventListener("timeupdate", this.updateData);
    this.audio.addEventListener("pause", this.pause);
  },

  beforeDestroy() {
    this.audio?.pause();
    this.audio.removeEventListener("loadedmetadata", this.setData);
    this.audio.removeEventListener("timeupdate", this.updateData);
    this.audio.addEventListener("pause", this.pause);
    this.audio = null;
  },

  methods: {
    setData() {
      this.duration = this.audio.duration;
      this.$emit("set-duration", this.duration);
    },

    updateData() {
      this.current = (+this.audio.currentTime * 100) / +this.duration;
    },

    async play() {
      this.audio.volume = 1;
      this.audio.play();
      this.playing = true;
    },

    pause() {
      this.audio?.pause();
      this.playing = false;
    },

    deleteTrack() {
      this.$emit("delete");
    },

    changeCurrent(e) {
      this.current = +e.target.value;
      this.audio.currentTime = (+e.target.value * +this.duration) / 100;
    },
  },
};
</script>

<style lang="scss" scoped>
.audio {
  width: 100%;
  padding: 2rem;
  background-color: #eee;

  &__container {
    display: flex;
    align-items: center;
    max-width: 640px;
    margin: 0 auto;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  &__player {
    width: 260px;
  }

  &__input {
    -webkit-appearance: none;
    flex: 1;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    background-color: #bbb;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 6px;
      height: 6px;
      cursor: pointer;

      border-radius: 50%;
      background: #0967d2;
      box-shadow: -1000px 0 0 997px #0967d2;
    }
  }

  &__button {
    display: flex;
    align-items: center;
    color: #0967d2;
    text-transform: uppercase;
    font-weight: bold;
    cursor: pointer;

    &.delete {
      color: #fa575c;
    }
  }

  &__icon {
    margin-right: 0.4rem;
  }

  &__time {
    font-size: 14px;
    color: #aaa;
  }
}
</style>
