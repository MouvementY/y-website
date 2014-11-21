/* global Modernizr */
/* global skrollr */
/* global Tooltip */

// namespace
var mouvy = mouvy || {};


document.addEventListener('DOMContentLoaded', function() {
    'use strict';

    // reveal the Y :)
    setTimeout(function() {
        var logoWrapper = document.getElementById('logo-full-screen');

        // dynamically resize the wrapper to fix a mobile bug with relative size viewports
        logoWrapper.style.height = '' + window.innerHeight + 'px';

        logoWrapper.style.opacity = 1;
    }, 300);

    // remove the hint scroll on mobile
    if (Modernizr.mq('only all and (max-width: 480px)')) {
        skrollr.init().destroy();
    } else {
        skrollr.init();
    }

    // scale the clock
    var clock = document.querySelector('.clock'),
        frame = clock.querySelector('.clock__frame'),
        frameOriginalWidth = frame.dataset.initialWidth,
        frameOriginalHeight = frame.dataset.initialHeight,
        frameOriginalRatio = frameOriginalHeight / frameOriginalWidth;

    clock.style.height = frameOriginalRatio * clock.offsetWidth + 'px';

    // animate the clock second hand
    var clockSecondHand = document.querySelector('.clock__second-hand'),
        numberOfStepPerSecond = 5.0,
        angleIntervalPerStep = 360.0 / (60 * numberOfStepPerSecond),
        seconds = 0;
    setInterval(function() {
        clockSecondHand.style.transform = 'rotate(' + (seconds++)*angleIntervalPerStep + 'deg)';
    }, 1000.0 / numberOfStepPerSecond);

    // signature pad
    var signatureCanvas = document.querySelector('.sign-block'),
        signatureForm = document.querySelector('.signature-form'),
        signatureFormField = signatureForm.querySelector('input[name=signature_image]'),
        signatureCanvasClearButton = document.querySelector('.clear-sign-canvas'),
        signatureHelper = document.querySelector('.sign-help-text'),
        signaturePadWidth = Math.min(400, window.innerWidth - 2*10),
        signaturePadHeight = signaturePadWidth * 9 / 16;

    signatureCanvas.width = '' + signaturePadWidth;
    signatureCanvas.height = '' + signaturePadHeight;

    var signaturePad = new window.SignaturePad(signatureCanvas, {
            minWidth: 1,
            maxWidth: 3,
            penColor: 'rgb(0, 0, 0)',
            onEnd: function() {
                signatureFormField.value = signaturePad.toDataURL();

                // show clear button
                signatureHelper.style.display = 'none';
                signatureCanvasClearButton.style.display = 'inline-block';
            }
        });

    signatureCanvasClearButton.addEventListener('click', function(e) {
        e.preventDefault();

        // hide clear button
        signatureCanvasClearButton.style.display = 'none';

        signaturePad.clear();
    });

    var signTriggers = document.querySelectorAll('.sign-action'),
        bindAdditionalForm = function(modal) {
            var signatureForm = modal.modalElem().querySelector('.signature-form'),
                successWrapper = modal.modalElem().querySelector('.success-wrapper');

            // THE form
            signatureForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // retrieve fields data
                // var data = new FormData(signatureForm);

                var data = {
                        'first_name': signatureForm.querySelector('[name=first_name]').value,
                        'last_name': signatureForm.querySelector('[name=last_name]').value,
                        'email': signatureForm.querySelector('[name=email]').value,
                        'signature_image_data_url': signatureForm.querySelector('[name=signature_image]').value,
                    },
                    urlEncodedData = mouvy.urlEncodeParams(data);

                // prepare and send the request
                var request = mouvy.prepareRequest(signatureForm.action, 'post');
                request.onload = function() {
                    var resp = null;
                    if (this.status >= 200 && this.status < 400){
                        // Success!
                        resp = JSON.parse(this.responseText);

                        // hide the form
                        signatureForm.style.display = 'none';

                        // show the success message
                        successWrapper.style.display = 'block';

                    } else {
                        // We reached our target server, but it returned an error
                        resp = JSON.parse(this.responseText);

                        // clean previous errors
                        var errors = signatureForm.querySelectorAll('.field-error');
                        Array.prototype.forEach.call(errors, function(el) {
                            el.parentNode.removeChild(el);
                        });

                        Object.keys(resp).forEach(function(name) {
                            var error = resp[name],
                                field = signatureForm.querySelector('[name='+name+']'),
                                errorElement = document.createElement('div');

                            mouvy.addClassName(errorElement, 'field-error');
                            errorElement.innerText = error;
                            field.insertAdjacentHTML('afterend', errorElement.outerHTML);
                        });
                    }
                };
                mouvy.sendRequest(request, urlEncodedData);
            });
        };
    Array.prototype.forEach.call(signTriggers, function(el) {
        el.addEventListener('click', function(e) {
            e.preventDefault();

            // check to see if the signature is not empty
            if (signaturePad.isEmpty()) {
                signatureHelper.style.display = 'block';
                return;
            }

            mouvy.showModal(e.target, function(modal) {
                bindAdditionalForm(modal);
                mouvy.bindSocialTriggers();
            });
        });
    });

    var signatureCounter = document.querySelector('.signature-counter'),
        signatureWall = document.querySelector('#signature-wall'),
        signatureMoreTrigger = document.querySelector('.more-signatures');

    // API Calls
    var loadTracker = {
            signatureCount: false,
            signatureAllLoaded: false,
        },
        updateSignatureCount = function(newCount) {
            signatureCounter.querySelector('span').innerHTML = newCount;
        },
        loadSignatureCount = function() {
            var signatureCountRequest = mouvy.prepareRequest(signatureCounter.dataset.url, 'get');
            signatureCountRequest.onload = function() {
                if (signatureCountRequest.status >= 200 && signatureCountRequest.status < 400){
                    // Success!
                    var data = JSON.parse(signatureCountRequest.responseText);
                    updateSignatureCount(data);
                } else {
                    // We reached our target server, but it returned an error
                    // TODO handle errors

                    // reset the tracker
                    // TODO improve the reseting part
                    loadTracker.signatureCount = false;
                }
            };
            mouvy.sendRequest(signatureCountRequest);
        },
        loadSignatures = function(pageURL, successCallback) {
            var requestURL = pageURL,
                signatureListRequest = mouvy.prepareRequest(requestURL, 'get');
            signatureListRequest.onload = function() {
                if (signatureListRequest.status >= 200 && signatureListRequest.status < 400){
                    // Success!
                    var data = JSON.parse(signatureListRequest.responseText),
                        nextPageURL = data.next,
                        count = data.count,
                        signatures = data.results;

                    // first update the count (maybe necessary)
                    updateSignatureCount(count);

                    signatures.forEach(function(sign) {
                        var signImage = '<img src="'+ sign['signature_image_data_url'] +'">',
                            signElement = document.createElement('div');
                        mouvy.addClassName(signElement, 'signature');
                        signElement.innerHTML = signImage;
                        signatureWall.appendChild(signElement);

                        // add the tooltip
                        new Tooltip({
                            target: signElement,
                            position: 'top center',
                            content: sign['first_name'],
                            openOn: 'hover'
                        });
                    });

                    if (successCallback) {
                        successCallback(nextPageURL);
                    }
                } else {
                    // We reached our target server, but it returned an error
                    // TODO handle errors
                }
            };
            mouvy.sendRequest(signatureListRequest);
        };

    // delay the calls until needed
    var delay = 300,
        timeout = null,
        didScroll = function() {
            // if the signature wall is visible load the next part
            if (mouvy.geometry.isElementInViewport(window, document, signatureCounter)) {
                if (loadTracker.signatureCount !== true) {
                    loadTracker.signatureCount = true;
                    loadSignatureCount();
                }
            }

            if (mouvy.geometry.isElementInViewport(window, document, signatureMoreTrigger)) {
                if (loadTracker.signatureAllLoaded !== true) {
                    var url = signatureWall.dataset.url;

                    if (signatureWall.dataset.nextPageURL !== undefined) {
                        url = signatureWall.dataset.nextPageURL;
                    }

                    loadSignatures(url, function(nextPageURL) {
                        // no more pages
                        if (!nextPageURL) {
                            loadTracker.signatureAllLoaded = true;
                        } else {
                            signatureWall.dataset.nextPageURL = nextPageURL;
                        }
                    });
                }
            }
        };

    window.onscroll = function() {
        // first thing first we detect the end of scrolling
        clearTimeout(timeout);
        timeout = setTimeout(function(){
            // now that the end of scrolling has been reached
            // we can work
            didScroll();
        },delay);
    };

    // initialize in the case the user was automatically scrolled down
    didScroll();
});
