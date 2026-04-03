/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */

const config = (function () {
  var customBackendUrl = localStorage.getItem('backendUrl') || '';

  var defaultUrl =
    location.protocol === 'https:'
      ? 'wss://' +
        location.hostname +
        (location.port !== 80 ? ':' + location.port : '')
      : 'ws://' +
        location.hostname +
        (location.port !== 80 ? ':' + location.port : '');

  return {
    webSocketUrl: customBackendUrl || defaultUrl
  };
})();
