(function(window, document) {
  const docEl = document.documentElement;
  const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';

  function setBodyFontSize() {
    const bodyFontSize = '16px';

    if (document.body) {
      document.body.style.fontSize = bodyFontSize;
    } else {
      document.addEventListener('DOMContentLoaded', setBodyFontSize);
    }
  }
  setBodyFontSize();

  function setRemUnit() {
    const rem = docEl.clientWidth / 7.5; // 1rem = 50px
    docEl.style.fontSize = rem + 'px';
  }
  setRemUnit();

  window.addEventListener(resizeEvt, setRemUnit);
  window.addEventListener('pageshow', function(e) {
    if (e.persisted) {
      setRemUnit();
    }
  });
})(window, document);
