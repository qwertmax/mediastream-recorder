import Recorder from "./lib/Recorder";

const isIOS = /iPad|iPhone|iPod/i.test(window.navigator.userAgent);

const RECORD_CONSTRAINS = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

const audio = Boolean(isIOS) || RECORD_CONSTRAINS;
let audioCtx;

class AudioRecorder {
  constructor() {
    if (!AudioRecorder.instance) {
      AudioRecorder.instance = this;
    }

    return AudioRecorder.instance;
  }

  async initialUserMedia() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!this.stream) {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio });
      window.stream = this.stream;
    }

    this.input = audioCtx.createMediaStreamSource(this.stream);

    if (audioCtx.state !== "running") {
      await audioCtx.resume();
    }

    this.removeDefaultAudioSettings(this.stream);
  }

  removeDefaultAudioSettings(gumStream) {
    return gumStream.getAudioTracks().forEach((track) =>
      track.applyConstraints(
        Object.assign(track.getSettings(), {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        })
      )
    );
  }

  async start() {
    await this.initialUserMedia();

    this.recorder = new Recorder(this.input);

    return this.recorder.record();
  }

  async stop() {
    this.recorder.stop();
    const data = await this.exportWAV();

    this.clear();
    return data;
  }

  exportWAV() {
    return new Promise((resolve) => this.recorder.exportWAV(resolve));
  }

  clear() {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.recorder.clear();
    this.stream = null;
    this.recorder = null;
    this.input = null;
  }
}

export default AudioRecorder;
