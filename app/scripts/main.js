/* global Headroom */
/* global Drop */
/* global smoothScroll */
/* global moment */

// namespace
var mouvy = mouvy || {};


document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // initialize the responsive nav
    window.ResponsiveNav.init();

    // first clean up data-scroll attributes for elements that aren't in the DOM
    var dataScrollElements = document.querySelectorAll('[data-scroll]');
    Array.prototype.forEach.call(dataScrollElements, function(el) {
        var anchor = el.hash.substr(1);
        if (document.getElementById(anchor) === null) {
            el.removeAttribute('data-scroll');
        }
    });

    // smooth scrolling for anchors
    smoothScroll.init({
        speed: 500,
        easing: 'easeOutQuint',
        updateURL: true,
        offset: 40
    });

    // box each titles
    var titleElements = document.querySelectorAll('.title--boxed');
    Array.prototype.forEach.call(titleElements, function(el) {
        mouvy.Boxme.draw(el);
    });

    // make some room by hidding the header
    var mainHead = document.querySelector('.main-head'),
        headroom = new Headroom(mainHead, {
            // vertical offset in px before element is first unpinned
            offset : 60,
            // scroll tolerance in px before state changes
            tolerance : {
                up : 10,
                down : 5
            },
            onUnpin: function() {
                nextEventDrop.close();
            }
        });
    headroom.init();

    // learn more
    // NB: hide the blocks with javascript so that robots index the content
    var learnMoreElements = document.querySelectorAll('.learn-more');
    Array.prototype.forEach.call(learnMoreElements, function(el) {
        el.style.display = 'none';
    });

    var learnMoreTriggers = document.querySelectorAll('.learn-more-trigger'),
        _showModal = function(trigger, afterShowCallback) {
            var targetSelector = trigger.dataset.target,
                targetElement = document.querySelector(targetSelector),
                wrapper = document.createElement('div');
            wrapper.setAttribute('role', 'dialog');
            wrapper.setAttribute('tabindex', '-1');
            wrapper.setAttribute('id', 'modal-dialog');
            mouvy.addClassName(wrapper, 'modal-scroll');
            mouvy.addClassName(wrapper, 'container');
            wrapper.innerHTML = targetElement.innerHTML;

            window.picoModal({
                content: wrapper.outerHTML,
                overlayStyles: {}, modalStyles: {}, closeStyles: {},
                overlayClass: 'modal-overlay',
                modalClass: 'modal-content',
                closeClass: 'modal-close'
            })
            .afterShow(function(modal){
                mouvy.addClassName(document.body, 'modal-open');
                var targetFocus = document.querySelector('#modal-dialog');
                targetFocus.focus();
                setTimeout(function(){
                    mouvy.addClassName(modal.overlayElem(), 'modal-overlay--in');
                    mouvy.addClassName(modal.modalElem(), 'modal-content--in');

                    if (afterShowCallback !== undefined) {
                        afterShowCallback(modal);
                    }
                }, 10);
            })
            .beforeClose(function(modal, e) {
                e.preventDefault();

                mouvy.removeClassName(modal.overlayElem(), 'modal-overlay--in');
                mouvy.removeClassName(modal.modalElem(), 'modal-content--in');

                setTimeout(function() {
                    modal.overlayElem().remove();
                    modal.modalElem().remove();
                }, 1000);

                mouvy.removeClassName(document.body, 'modal-open');
            })
            .afterClose(function() {
                mouvy.removeClassName(document.body, 'modal-open');

            })
            .show();
        };
    mouvy.showModal = _showModal;
    Array.prototype.forEach.call(learnMoreTriggers, function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            _showModal(e.target);
        });
    });

    // we assume that the css has been loaded
    document.querySelector('.news').style.display = '';

    // next event popover
    var nextEventDrop = new Drop({
            target: document.querySelector('.last-news'),
            content: document.querySelector('.news'),
            position: 'bottom right',
            classes: 'drop-theme-blue',
            openOn: 'click',
            constrainToWindow: true,
            tetherOptions: {
                offset: '-5px 0'
            }
        }),
        generatePostElement = function(post) {
            var postElement = document.createElement('div');
            mouvy.addClassName(postElement, 'news-post');
            var html = '<h3 class="news-post__title">' + post.title + '<span>' + moment(post['date_published']).format('DD/MM/YYYY') + '</span></h3>' +
                       '<p>' + post.text + '</p>';
            if (post.link) {
                html += '<p><a href="' + post.link + '">' + post.link + '</a></p>';
            }
            postElement.innerHTML = html;
            return postElement;
        },
        loadLastNews = function(successCallback) {
            var lastNewsContent = document.querySelector('.news-content'),
                requestURL = lastNewsContent.dataset.url,
                newsListRequest = mouvy.prepareRequest(requestURL, 'get');

            newsListRequest.onreadystatechange = function() {
                if (this.readyState === 4 && this.status >= 200 && this.status < 400){
                    // Success!
                    var data = JSON.parse(this.responseText),
                        lastPosts = data.results;

                    // empty the container
                    lastNewsContent.innerHTML = '';

                    lastPosts.forEach(function(post) {
                        var postElement = generatePostElement(post);
                        lastNewsContent.appendChild(postElement);
                    });

                    if (successCallback) {
                        successCallback();
                    }
                } else {
                    // We reached our target server, but it returned an error
                    // TODO handle errors
                }
            };
            mouvy.sendRequest(newsListRequest);
        };

    // bind the event form once
    nextEventDrop.once('open', function() {
        loadLastNews();
    });

    // social
    var urlEncode = function(str) {
            var tmp;
            tmp = encodeURIComponent(str);
            return tmp.replace(/[!'()*]/g, function(c) {
                return '%' + c.charCodeAt(0).toString(16);
            });
        },
        openPopup = function(url, params) {
            var popup, qs, v;
            if (params === null) {
                params = {};
            }
            popup = {
                width: 500,
                height: 350
            };
            popup.top = (screen.height / 2) - (popup.height / 2);
            popup.left = (screen.width / 2) - (popup.width / 2);
            qs = ((function() {
                var _results;
                _results = [];
                for (var k in params) {
                    v = params[k];
                    _results.push('' + k + '=' + (urlEncode(v)));
                }
                return _results;
            }).call(this)).join('&');
            if (qs) {
                qs = '?' + qs;
            }
            return window.open(url + qs, 'targetWindow', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,left=' + popup.left + ',top=' + popup.top + ',width=' + popup.width + ',height=' + popup.height);
        },
        _bindSocialTriggers = function() {
            var triggers = document.querySelectorAll('[data-social]');
            Array.prototype.forEach.call(triggers, function(el) {
                var triggerAction = function(e) {
                    e.preventDefault();

                    if (el.dataset.social == 'twitter') {  // jshint ignore:line
                        openPopup('https://twitter.com/intent/tweet', {
                            text: el.dataset.socialText,
                            url: el.dataset.socialUrl
                        });
                    } else if (el.dataset.social == 'facebook') {  // jshint ignore:line
                        openPopup('https://www.facebook.com/sharer/sharer.php', {
                            u: el.dataset.socialUrl
                        });
                    }
                };
                el.removeEventListener('click', triggerAction);
                el.addEventListener('click', triggerAction);
            });
        };
    mouvy.bindSocialTriggers = _bindSocialTriggers;

    // bind events
    mouvy.bindSocialTriggers();
});
