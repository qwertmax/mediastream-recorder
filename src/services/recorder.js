import Recorder from "../lib/Recorder";
import { timestamp, isIOS } from "./system";

const RECORD_CONSTRAINS = {
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

const audio = Boolean(isIOS) || RECORD_CONSTRAINS;
let audioCtx;

class AudioRecorder {
  constructor(saveLog) {
    if (AudioRecorder.instance) {
      return AudioRecorder.instance;
    }

    AudioRecorder.instance = this;

    this.saveLog = saveLog;
  }

  async initialUserMedia() {
    this.logs = {};

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      window.audioCtx = audioCtx;

      this.setAudioCtxEventHandler();
    }

    if (!this.stream) {
      this.saveLog("mic-request");

      this.stream = await navigator.mediaDevices.getUserMedia({ audio });
      this.tracks = this.stream.getAudioTracks();

      this.saveLog("mic-granted");

      window.stream = this.stream;
      window.tracks = this.tracks;

      this.setStreamEventHandler();
      this.setTrackEventHandler();
      this.removeDefaultAudioSettings();
    }

    this.input = audioCtx.createMediaStreamSource(this.stream);

    if (audioCtx.state !== "running") {
      await audioCtx.resume();
    }
  }

  setStreamEventHandler() {
    this.stream.onaddtrack = (event) => {
      this.logs.stream_track_add = {
        timestamp: timestamp(),
        kind: event.track.kind,
      };
    };

    this.stream.onremovetrack = (event) => {
      this.logs.stream_track_remove = {
        timestamp: timestamp(),
        kind: event.track.kind,
      };
    };
  }

  setAudioCtxEventHandler() {
    audioCtx.onstatechange = () => {
      this.logs[`audio_context_state_${audioCtx.state}`] = {
        timestamp: timestamp(),
      };
    };
  }

  setTrackEventHandler() {
    this.tracks.forEach((track) => {
      this.logTrackState(track);

      track.onended = () => {
        this.logs.stream_track_end = {
          timestamp: timestamp(),
        };
      };

      track.onmute = () => {
        this.logs.stream_track_mute = {
          timestamp: timestamp(),
        };
      };

      track.onunmute = () => {
        this.logs.stream_track_unmute = {
          timestamp: timestamp(),
        };
      };
    });
  }

  logTrackState(track) {
    this.logs[`stream_track_state_${track.readyState}`] = {
      timestamp: timestamp(),
      enabled: track.enabled,
    };
  }

  removeDefaultAudioSettings() {
    this.tracks.forEach((track) => {
      track.applyConstraints(
        Object.assign(track.getSettings(), RECORD_CONSTRAINS)
      );
    });
  }

  async start() {
    await this.initialUserMedia();

    this.recorder = new Recorder(this.input);

    return this.recorder.record();
  }

  async stop() {
    this.recorder.stop();
    this.tracks.forEach((track) => {
      track.stop();
      this.logTrackState(track);
    });

    const data = await this.exportWAV();
    const logs = { ...this.logs };

    this.clear();

    return { ...data, logs };
  }

  exportWAV() {
    return new Promise((resolve) => this.recorder.exportWAV(resolve));
  }

  clear() {
    this.recorder.clear();
    this.stream = null;
    this.recorder = null;
    this.input = null;
    this.logs = null;
  }
}

export default AudioRecorder;
