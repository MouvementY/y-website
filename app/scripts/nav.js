/* global mouvy */

(function(window, document, undefined) {
    'use strict';

    window.ResponsiveNav = (function() {

        var _init = false, app = { };

        var inner = document.getElementById('inner-wrap'),
            navButton = document.getElementById('nav-open-btn'),
            navOpen = false,
            navClass = 'js-nav';

        // normalize vendor prefixes

        var doc = document.documentElement;

        var transitionProperty = window.Modernizr.prefixed('transition'),
            transitionEnd = (function() {
                var props = {
                    'WebkitTransition' : 'webkitTransitionEnd',
                    'MozTransition'    : 'transitionend',
                    'OTransition'      : 'oTransitionEnd otransitionend',
                    'msTransition'     : 'MSTransitionEnd',
                    'transition'       : 'transitionend'
                };
                return props.hasOwnProperty(transitionProperty) ? props[transitionProperty] : false;
            })();

        app.init = function() {
            if (_init) {
                return;
            }
            _init = true;

            var closeNavEnd = function(e) {
                if (e && e.target === inner) {
                    document.removeEventListener(transitionEnd, closeNavEnd, false);
                }
                navOpen = false;
            };

            app.closeNav = function() {
                if (navOpen) {
                    // close navigation after transition or immediately
                    var duration = (transitionEnd && transitionProperty) ? parseFloat(window.getComputedStyle(inner, '')[transitionProperty + 'Duration']) : 0;
                    if (duration > 0) {
                        document.addEventListener(transitionEnd, closeNavEnd, false);
                    } else {
                        closeNavEnd(null);
                    }
                }
                mouvy.removeClassName(doc, navClass);
            };

            app.openNav = function() {
                if (navOpen) {
                    return;
                }
                mouvy.addClassName(doc, navClass);
                navOpen = true;
            };

            app.toggleNav = function(e) {
                if (navOpen && mouvy.hasClassName(doc, navClass)) {
                    app.closeNav();
                } else {
                    app.openNav();
                }
                if (e) {
                    e.preventDefault();
                }
            };

            // let the navbar be revealable
            // since now the css styles has been loaded
            document.getElementById('nav-mobile').style.display = '';

            // open nav with main "nav" button
            navButton.addEventListener('click', app.toggleNav, false);

            // close nav by touching the partial off-screen content
            document.addEventListener('click', function(e) {
                if (navOpen && !mouvy.hasParent(e.target, 'nav-mobile')) {
                    e.preventDefault();
                    app.closeNav();
                    return;
                }

                if (navOpen && e.target.dataset.scroll !== undefined) {
                    app.closeNav();
                    return;
                }

            }, true);

            mouvy.addClassName(doc, 'js-ready');
        };

        return app;

    })();
})(window, window.document);