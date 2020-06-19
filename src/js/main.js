import "regenerator-runtime/runtime.js";
import AudioRecorder from "./recorder";

const buttonStart = document.querySelector("#buttonStart");
const buttonStop = document.querySelector("#buttonStop");
const buttonDelete = document.querySelector("#buttonDelete");
const player = document.querySelector("#player");
const downloadLink = document.querySelector("#link");
const audioContainer = document.querySelector("#audioContainer");
const timer = document.querySelector("#timer");
const logs = document.querySelector("#logs");

const recorder = new AudioRecorder();

class Recording {
  constructor() {
    this._recordTimer = 0;
    this._recording = false;
    this._audioURL = null;
    this.logs = [];
    this.interval = null;

    Object.defineProperty(this, "recordTimer", {
      get() {
        return this._recordTimer;
      },
      set(value) {
        this._recordTimer = value;
        this.render();
      },
    });

    Object.defineProperty(this, "recording", {
      get() {
        return this._recording;
      },
      set(value) {
        this._recording = value;
        this.render();
      },
    });

    Object.defineProperty(this, "audioURL", {
      get() {
        return this._audioURL;
      },
      set(value) {
        this._audioURL = value;
        this.render();
      },
    });
  }

  async startRecording() {
    try {
      if (this.recording) return;

      this.recording = true;
      await recorder.start();
      this.logger("recording is started");

      this.updateRecordTimer();
    } catch (error) {
      this.logger(error.message);
    }
  }

  async stopRecording() {
    try {
      if (!this.recording) return;

      this.setDefaultProperties();

      const {
        blob,
        percentOfSilenceIOs,
        percentOfSilenceAllDevices,
        samples,
      } = await recorder.stop();

      this.logger(`samples ${samples}`);
      this.logger(`silence for iOs ${percentOfSilenceIOs}%`);
      this.logger(`silence for All devices ${percentOfSilenceAllDevices}%`);

      this.audioURL = window.URL.createObjectURL(blob);

      player.src = this.audioURL;
      downloadLink.href = this.audioURL;
      downloadLink.download = "recording.wav";
    } catch (error) {
      this.logger(error.message);
    }
  }

  deleteRecording() {
    this.audioURL = null;
  }

  updateRecordTimer() {
    this.interval = setInterval(() => {
      this.recordTimer += 1;
    }, 1000);
  }

  setDefaultProperties() {
    this.recording = false;
    this.recordTimer = 0;
    clearInterval(this.interval);
  }

  render() {
    timer.textContent = this.formatTime(this.recordTimer);
    logs.innerHTML = [...this.logs]
      .reverse()
      .map((el) => `<div>${el}</div>`)
      .join("");

    if (this.audioURL) {
      buttonDelete.style.display = "";
      audioContainer.style.display = "";
      buttonStart.style.display = "none";
      buttonStop.style.display = "none";
    } else if (this.recording) {
      buttonStop.style.display = "";
      buttonStart.style.display = "none";
      buttonDelete.style.display = "none";
      audioContainer.style.display = "none";
    } else {
      buttonStart.style.display = "";
      buttonStop.style.display = "none";
      buttonDelete.style.display = "none";
      audioContainer.style.display = "none";
    }
  }

  numToTimeFormat(num) {
    return num < 10 ? `0${num}` : num;
  }

  formatTime(sec) {
    const time = sec > 0 ? sec : 0;
    const hours = Math.floor(time / (60 * 60));
    const minutes = this.numToTimeFormat(
      Math.floor((time - hours * 3600) / 60)
    );
    const seconds = this.numToTimeFormat(
      Math.floor(time - hours * 3600 - minutes * 60)
    );

    if (hours > 0) {
      return `${this.numToTimeFormat(hours)}:${minutes}:${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

  logger(msg) {
    this.logs.push(msg);
    this.render();
  }
}

const obj = new Recording();

obj.render();

buttonStart.addEventListener("click", obj.startRecording.bind(obj));
buttonStop.addEventListener("click", obj.stopRecording.bind(obj));
buttonDelete.addEventListener("click", obj.deleteRecording.bind(obj));
