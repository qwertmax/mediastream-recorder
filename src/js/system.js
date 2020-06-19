export const userAgent = () => window.navigator.userAgent;

export const userDevice = () => {
  return userAgent()
    .replace(/^.*?\((.+?)\).+$/, "$1")
    .replace(/[^\w\d]/g, " ")
    .trim()
    .replace(/\s+/g, "_");
};

export const timestamp = () => {
  const date = new Date();
  const day = numToTimeFormat(date.getUTCDate());
  const month = numToTimeFormat(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();
  const hours = numToTimeFormat(date.getUTCHours());
  const min = numToTimeFormat(date.getUTCMinutes());
  const sec = numToTimeFormat(date.getUTCSeconds());

  return `${month}-${day}-${year}T${hours}-${min}-${sec}`;
};

export const formatTime = (sec) => {
  const time = sec > 0 ? sec : 0;
  const hours = Math.floor(time / (60 * 60));
  const minutes = numToTimeFormat(Math.floor((time - hours * 3600) / 60));
  const seconds = numToTimeFormat(
    Math.floor(time - hours * 3600 - minutes * 60)
  );

  if (hours > 0) {
    return `${numToTimeFormat(hours)}:${minutes}:${seconds}`;
  }

  return `${minutes}:${seconds}`;
};

export const numToTimeFormat = (num) => (num < 10 ? `0${num}` : num);
