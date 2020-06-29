<template>
  <v-audio
    :src="audioSource"
    @delete="setDefaultProperties"
    v-if="audioSource"
    ref="audio"
    class="record-player"
  >
    <button
      class="button button_secondary button_md record__send-button"
      @click.once="sendRecordedVoice"
    >
      <span>upload</span>
      <span class="icon icon__arrow icon__arrow_right" />
    </button>
  </v-audio>

  <div class="record" v-else>
    <div class="record__not-allowed" v-if="!allowed">
      Grant permission to access the microphone and reload this page
    </div>

    <div class="record__body" v-else>
      <transition name="scale" mode="out-in" appear>
        <div v-if="loading" class="record__loader">
          <loader container info small />
        </div>
        <button
          class="record__record-button scale btn-record"
          v-else-if="!recording"
          @click.once="startRecording"
          key="btn-record"
        >
          <img
            src="@/assets/microphone.svg"
            alt="microphone"
            width="16"
            height="25"
            class="record__record-button-icon"
          />
          <span>{{ type }}</span>
        </button>

        <div v-else-if="isCalibration" class="record__calibration scale">
          <div class="record__calibration-title">Please Wait</div>
          <div class="record__calibration-text">calibrating...</div>
          <div class="record__calibration-counter">{{ calibrationTimer }}</div>
        </div>

        <button
          v-else
          class="record__record-button stop scale btn-stop"
          @click.once="stopRecording"
          key="btn-stop"
        >
          <span>stop</span>
          <span class="record__record-timer">{{ recordTimeFormatted }}</span>
        </button>
      </transition>
    </div>
  </div>
</template>

<script>
import Loader from "./loader";
import vAudio from "./audio";
import { formatTime } from "../services/system";
import AudioRecorder from "../services/recorder";

export default {
  components: { vAudio, Loader },

  props: {
    type: { type: String, default: "record" },
    saveLog: { type: Function, default: () => {} },
  },

  data() {
    return {
      recording: false,
      audioSource: null,
      voiceBlob: null,
      calibrationTimer: 5,
      recordTimer: 0,
      allowed: true,
      interval: null,
      loading: false,
      recorder: new AudioRecorder(this.saveLog),
    };
  },

  computed: {
    isCalibration() {
      return this.type === "calibrate";
    },

    recordTimeFormatted() {
      return formatTime(this.recordTimer);
    },
  },

  beforeDestroy() {
    this.setDefaultProperties();
  },

  methods: {
    async startRecording() {
      this.$emit("start");
      this.saveLog("record-button-start");

      try {
        this.loading = true;
        this.recording = true;

        await this.recorder.start();

        this.saveLog("record-start");

        this.loading = false;

        if (this.isCalibration) {
          this.calibrationTimer = 5;
          return this.updateCalibrationTimer();
        }

        this.recordTimer = 0;
        return this.updateRecordTimer();
      } catch ({ message }) {
        if (message === "Permission denied") {
          this.allowed = false;
        }
        this.setDefaultProperties();
        this.saveLog("record-error-start", { message });
      }
    },

    async stopRecording() {
      this.saveLog("record-button-stop");

      try {
        this.loading = true;
        this.recording = false;
        clearInterval(this.interval);

        this.$emit("stop");

        const {
          blob,
          percentOfSilenceIOs,
          percentOfSilenceAllDevices,
          samples,
          logs,
        } = await this.recorder.stop();

        this.saveLog("record-stop", {
          ...logs,
          silenceAll: percentOfSilenceAllDevices,
          silenceIOs: percentOfSilenceIOs,
          samples,
        });

        this.setAudioSource(blob);
        this.loading = false;
      } catch ({ message }) {
        this.setDefaultProperties();
        this.saveLog("record-error-stop", { message });
      }
    },

    updateCalibrationTimer() {
      this.interval = setInterval(() => {
        if (this.calibrationTimer <= 0) {
          return this.stopRecording();
        }

        this.calibrationTimer -= 1;
      }, 1000);
    },

    updateRecordTimer() {
      this.interval = setInterval(() => {
        this.recordTimer += 1;
      }, 1000);
    },

    setDefaultProperties() {
      clearInterval(this.interval);
      this.setAudioSource(null);
      this.calibrationTimer = 5;
      this.recordTimer = 0;
      this.recording = false;
      this.loading = false;

      if (this.recorder.recording) {
        this.stopRecording();
      }
    },

    sendRecordedVoice() {
      this.$emit("send-voice", this.voiceBlob);
      this.setDefaultProperties();
    },

    setAudioSource(blob = null) {
      const str = blob ? window.URL.createObjectURL(blob) : null;
      this.voiceBlob = blob;
      this.audioSource = str;
    },
  },
};
</script>

<style lang="scss" scoped>
.record {
  &__send-button {
    margin-left: auto;
  }

  &__body {
    display: flex;
    justify-content: center;
    padding-bottom: 2rem;
  }

  &__record-button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex-shrink: 0;
    flex-grow: 0;
    width: 130px;
    height: 130px;
    margin: 0 auto;
    outline: none;
    border-radius: 50%;
    background-color: #27ab83;
    box-shadow: 0px 6px 12px rgba(1, 51, 42, 0.24);
    border: 0;
    cursor: pointer;
    color: #fff;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 16px;
    transition: all 0.1s;

    &:hover,
    &:focus {
      background-color: lighten(#27ab83, 5%);
    }

    &.stop {
      background-color: #e12d39;

      &:hover,
      &:focus {
        background-color: lighten(#e12d39, 5%);
      }
    }
  }

  &__not-allowed {
    padding: 2rem;
    text-align: center;
    color: #e12d39;
    background-color: #fff;
  }

  &__record-timer {
    margin-top: 0.1rem;
    font-size: 14px;
  }

  &__record-button-icon {
    margin-top: -1rem;
    margin-bottom: 0.5rem;
  }

  &__calibration {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-weight: bold;
  }

  &__calibration-text,
  &__calibration-title {
    color: #b44d12;
    text-transform: capitalize;
  }

  &__calibration-title {
    text-transform: uppercase;
  }

  &__calibration-counter {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    margin-top: 1.5rem;
    color: #444;
    background-color: #e9b949;
    border-radius: 50%;
    font-size: 1.2rem;
  }

  &__loader {
    position: relative;
    width: 40px;
    height: 40px;
  }
}
</style>
