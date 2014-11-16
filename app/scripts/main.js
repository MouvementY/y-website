/* global Headroom */

// namespace
var mouvy = mouvy || {};


document.addEventListener('DOMContentLoaded', function() {
    'use strict';

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
                hideNextEventPopover();
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
        learnMoreAction = function(trigger) {
            var targetSelector = trigger.dataset.target,
                targetElement = document.querySelector(targetSelector),
                wrapper = document.createElement('div');

            mouvy.addClassName(wrapper, 'modal-scroll');
            mouvy.addClassName(wrapper, 'container');
            wrapper.innerHTML = targetElement.innerHTML;
            console.log(wrapper);

            window.picoModal({
                content: wrapper.outerHTML,
                overlayStyles: {}, modalStyles: {}, closeStyles: {},
                overlayClass: 'modal-overlay',
                modalClass: 'modal-content',
                closeClass: 'modal-close'
            })
            .afterShow(function(modal){
                mouvy.addClassName(document.body, 'modal-open');
                setTimeout(function(){
                    mouvy.addClassName(modal.overlayElem(), 'modal-overlay--in');
                    mouvy.addClassName(modal.modalElem(), 'modal-content--in');
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
    Array.prototype.forEach.call(learnMoreTriggers, function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();
            learnMoreAction(e.target);
        });
    });

    // next event popover
    var nextEventButton = document.querySelector('.next-event'),
        nextEventPopover = document.querySelector('.events'),
        showNextEventPopover = function() {
            mouvy.removeClassName(nextEventPopover, 'events--unpinned');
            mouvy.addClassName(nextEventPopover, 'events--pinned');
        },
        hideNextEventPopover = function() {
            mouvy.removeClassName(nextEventPopover, 'events--pinned');
            mouvy.addClassName(nextEventPopover, 'events--unpinned');

            resetNextEventFormErrors();
        };
    nextEventButton.addEventListener('click', function(e) {
        e.preventDefault();

        // toggle the popover
        if (mouvy.hasClassName(nextEventPopover, 'events--pinned')) {
            hideNextEventPopover();
        } else {
            showNextEventPopover();
        }
    });

    // events notification form
    var eventsNotificationForm = document.querySelector('.events .form'),
        eventsNotificationFormErrors = eventsNotificationForm.querySelector('.errors-wrapper'),
        nextEventSubmit = eventsNotificationForm.querySelector('[type=submit] .progress-inner'),
        resetNextEventFormSubmit = function() {
            // reset the submit animation
            mouvy.addClassName(nextEventSubmit, 'notransition');
            mouvy.removeClassName(nextEventSubmit, 'state-loading');
            nextEventSubmit.style.width = '0%';
        },
        resetNextEventFormErrors = function() {
            eventsNotificationFormErrors.innerText = '';
            mouvy.addClassName(eventsNotificationFormErrors, 'errors-wrapper--empty');
            // preapre the popover to receive a shaking move in case of an error
            mouvy.removeClassName(nextEventPopover, 'shaking');

            resetNextEventFormSubmit();
        };
    eventsNotificationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // disable the submit button
        eventsNotificationForm.querySelector('[type=submit]').disabled = true;

        var data = {
                'email': eventsNotificationForm.querySelector('[name=email]').value
            },
            urlEncodedData = mouvy.urlEncodeParams(data);

        // prepare and send the request
        var request = mouvy.prepareRequest(eventsNotificationForm.action, 'post');
        request.onload = function() {
            var resp = null;
            if (this.status >= 200 && this.status < 400){
                // Success!
                resp = JSON.parse(this.responseText);
                nextEventPopover.innerText = resp.detail;
            } else {
                // We reached our target server, but it returned an error
                resp = JSON.parse(this.responseText);

                eventsNotificationFormErrors.innerText = resp.detail;
                mouvy.removeClassName(eventsNotificationFormErrors, 'errors-wrapper--empty');

                mouvy.addClassName(nextEventPopover, 'shaking');
            }

            // re-enable the submit button
            eventsNotificationForm.querySelector('[type=submit]').disabled = false;

            // reset the submit animtion
            resetNextEventFormSubmit();
        };

        // reset error state
        resetNextEventFormErrors();

        // fake loader for the user
        mouvy.removeClassName(nextEventSubmit, 'notransition');
        mouvy.addClassName(nextEventSubmit, 'state-loading');
        nextEventSubmit.style.width = '100%';

        mouvy.sendRequest(request, urlEncodedData);
    });
});
