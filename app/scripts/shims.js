// Viewport size
(function (window, document) {

  var ObjectDefineProperty = Object.defineProperty;
  var html = document.documentElement;
  var body = document.body;

  function define(object, property, getter) {
    if (!(property in object)) {
      ObjectDefineProperty(object, property, { get: getter });
    }
  }

  define(window, 'innerWidth', function () { return html.clientWidth; });
  define(window, 'innerHeight', function () { return html.clientHeight; });

  define(window, 'scrollX', function () { return window.pageXOffset || html.scrollLeft; });
  define(window, 'scrollY', function () { return window.pageYOffset || html.scrollTop; });

  define(document, 'width', function () { return Math.max(body.scrollWidth, html.scrollWidth, body.offsetWidth, html.offsetWidth, body.clientWidth, html.clientWidth); });
  define(document, 'height', function () { return Math.max(body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight, body.clientHeight, html.clientHeight); });

  return define;

}(window, document));
