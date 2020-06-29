<template>
  <div id="app">
    <div class="uploading" v-if="uploading">
      <loader container />
    </div>
    <record-shared v-else @send-voice="sendVoice" :save-log="saveLog" />
    <div class="logs">
      <div v-for="(log, i) in logs" :key="i">
        <div>{{ log.event }}</div>
        <pre v-if="log.parameters">{{ log.parameters }}</pre>
      </div>
    </div>
  </div>
</template>

<script>
import RecordShared from "./components/record";
import Loader from "./components/loader";
import { sendVoiceToAWS } from "./services/aws";
import { timestamp, userDevice } from "./services/system";

export default {
  components: { RecordShared, Loader },

  data: () => ({
    type: "record",
    logs: [],
    uploading: false,
  }),

  computed: {
    fileName() {
      return `r.tellingai.com/${timestamp()}-device_${userDevice()}.wav`;
    },
  },

  methods: {
    saveLog(event, params = null) {
      this.logs = [
        {
          event,
          parameters: params ? JSON.stringify(params, null, 2) : "",
        },
        ...this.logs,
      ];
    },

    sendVoice(blob) {
      const size = (blob.size / (1024 * 1024)).toFixed(2);

      this.saveLog("record-save", {
        name: this.fileName,
        size: `${size} MB`,
      });

      const payload = { blob, name: this.fileName };

      this.uploading = true;

      sendVoiceToAWS(payload)
        .then(() => this.saveLog("record-save-successful"))
        .catch(({ message }) => this.saveLog("record-save-error", { message }))
        .finally(() => {
          this.uploading = false;
        });
    },
  },
};
</script>

<style lang="scss">
pre {
  background: #eee;
  border-radius: 10px;
  padding: 10px;
  margin: 5px 0;
}

.uploading {
  position: relative;
  height: 160px;
}

.logs {
  margin: 20px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 46px;
  padding: 0 3.5em;
  font-size: 16px;
  border: 0;
  border-radius: 5px;
  color: inherit;
  cursor: pointer;
  line-height: 2;

  &_secondary {
    color: #fff;
    background-color: #27ab83;

    &:hover,
    &:focus {
      background-color: lighten(#27ab83, 5%);
    }
  }
}
</style>
