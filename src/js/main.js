import "regenerator-runtime/runtime.js";
import AudioRecorder from "./recorder";
import { sendVoiceToAWS } from "./aws";
import { timestamp, formatTime, userDevice } from "./system";

const buttonStart = document.querySelector("#buttonStart");
const buttonStop = document.querySelector("#buttonStop");
const buttonDelete = document.querySelector("#buttonDelete");
const buttonUpload = document.querySelector("#buttonUpload");
const uploadedKey = document.querySelector("#uploadedKey");
const uploading = document.querySelector("#uploading");
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
    this._uploading = false;
    this._audioURL = null;
    this.logs = [];
    this.interval = null;
    this.blob = null;
    this.key = "";

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
    Object.defineProperty(this, "uploading", {
      get() {
        return this._uploading;
      },
      set(value) {
        this._uploading = value;
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
      this.setDefaultProperties();
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

      this.blob = blob;
      this.audioURL = window.URL.createObjectURL(blob);

      player.src = this.audioURL;
      downloadLink.href = this.audioURL;
      downloadLink.download = "recording.wav";
    } catch (error) {
      this.logger(error.message);
    }
  }

  sendVoice() {
    const name = `r.tellingai.com/${
      this.key
    }_${timestamp()}-device_${userDevice()}.wav`;
    const payload = {
      blob: this.blob,
      name,
    };

    this.uploading = true;

    sendVoiceToAWS(payload)
      .then(() => {
        this.logger(`uploaded: ${name}`);
      })
      .finally(() => {
        this.uploading = false;
      });
  }

  changeKey(e) {
    this.key = e.target.value;
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
    clearInterval(this.interval);
    this.recording = false;
    this.recordTimer = 0;
  }

  render() {
    timer.textContent = formatTime(this.recordTimer);
    logs.innerHTML = [...this.logs]
      .reverse()
      .map((el) => `<div>${el}</div>`)
      .join("");

    if (this.uploading) {
      uploading.textContent = "uploading";
    } else {
      uploading.textContent = "";
    }

    if (this.audioURL) {
      buttonDelete.style.display = "";
      buttonUpload.style.display = "";
      uploadedKey.style.display = "";
      audioContainer.style.display = "";
      buttonStart.style.display = "none";
      buttonStop.style.display = "none";
    } else if (this.recording) {
      buttonStop.style.display = "";
      buttonStart.style.display = "none";
      buttonDelete.style.display = "none";
      audioContainer.style.display = "none";
      buttonUpload.style.display = "none";
      uploadedKey.style.display = "none";
    } else {
      buttonStart.style.display = "";
      buttonStop.style.display = "none";
      buttonDelete.style.display = "none";
      audioContainer.style.display = "none";
      buttonUpload.style.display = "none";
      uploadedKey.style.display = "none";
    }
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
buttonUpload.addEventListener("click", obj.sendVoice.bind(obj));
uploadedKey.addEventListener("input", obj.changeKey.bind(obj));
