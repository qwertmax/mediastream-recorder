<template functional>
  <div
    class="lds-wrapper"
    :class="{
      abs: props.abs,
      container: props.container,
      info: props.info,
      small: props.small,
    }"
  >
    <div class="lds-ring">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    abs: { type: Boolean, default: true },
    container: { type: Boolean, default: false },
    info: { type: Boolean, default: false },
    small: { type: Boolean, default: false },
  },
};
</script>

<style lang="scss" scoped>
.lds-wrapper {
  $loader-width: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  &.abs,
  &.container {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
  }

  &.abs {
    position: fixed;
    z-index: 1000;
  }

  &.container {
    position: absolute;
    z-index: 1;
    padding: 0;
    margin: 0;
  }

  &.white .lds-ring div {
    border-right-color: #fff;
  }

  &.info .lds-ring div {
    border-right-color: #b44d12;
  }

  &.small .lds-ring {
    max-width: 40px;
    max-height: 40px;

    div {
      margin: 4px;
      border-width: 4px;
    }
  }

  .lds-ring {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 100%;
    max-width: 80px;
    max-height: 80px;

    div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 75%;
      height: 75%;
      margin: $loader-width / 2;
      border: $loader-width solid transparent;
      border-radius: 50%;
      animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-right-color: #bbb;

      &:nth-child(1) {
        animation-delay: -0.45s;
      }

      &:nth-child(2) {
        animation-delay: -0.3s;
      }

      &:nth-child(3) {
        animation-delay: -0.15s;
      }
    }
  }
}

@keyframes lds-ring {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
