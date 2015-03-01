/* global Modernizr */
/* global skrollr */
/* global Tooltip */
/* global io */

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

    // remove the hint scroll on mobile and tablet
    if (Modernizr.touch) {
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
        signaturePadHeight = Math.floor(signaturePadWidth * 9 / 16);

    signatureCanvas.width = '' + signaturePadWidth;
    signatureCanvas.height = '' + signaturePadHeight;

    // ensure it has been initialized for excanvas.js
    /* jshint ignore:start */
    if (typeof G_vmlCanvasManager !== 'undefined') {
        signatureCanvas = G_vmlCanvasManager.initElement(signatureCanvas);
    }
    /* jshint ignore:end */

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
                checkboxGroups = signatureForm.querySelectorAll('.checkbox-group'),
                successWrapper = modal.modalElem().querySelector('.success-wrapper'),
                errorWrapper = modal.modalElem().querySelector('.error-wrapper');

            // show/hide checkbox groups
            Array.prototype.forEach.call(checkboxGroups, function(el) {
                var checkbox = el.querySelector('[type=checkbox]'),
                    uncheckedMessage = el.querySelector('.checkbox-label--unchecked'),
                    checkedMessage = el.querySelector('.checkbox-label--checked');

                checkbox.addEventListener('click', function() {
                    if (checkbox.checked) {
                        checkedMessage.style.display = null;
                        uncheckedMessage.style.display = 'none';
                    } else {
                        checkedMessage.style.display = 'none';
                        uncheckedMessage.style.display = null;
                    }
                });
            });

            // THE form
            signatureForm.addEventListener('submit', function(e) {
                e.preventDefault();

                // retrieve fields data
                // var data = new FormData(signatureForm);

                var data = {
                        'first_name': signatureForm.querySelector('[name=first_name]').value,
                        'last_name': signatureForm.querySelector('[name=last_name]').value,
                        'email': signatureForm.querySelector('[name=email]').value,
                        'optin': signatureForm.querySelector('[name=optin]').checked,
                        'signature_image_data_url': signatureForm.querySelector('[name=signature_image]').value,
                    },
                    urlEncodedData = mouvy.urlEncodeParams(data);

                // prepare and send the request
                var request = mouvy.prepareRequest(signatureForm.action, 'post');
                request.onreadystatechange = function() {
                    var resp = null;
                    if (this.readyState === 4 && this.status >= 200 && this.status < 400){
                        // Success!
                        resp = JSON.parse(this.responseText);

                        // hide the form
                        signatureForm.style.display = 'none';

                        // show the success message
                        successWrapper.style.display = 'block';

                        // clear the signature
                        signaturePad.clear();

                    } else if (this.readyState === 4) {
                        // We reached our target server, but it returned an error
                        resp = JSON.parse(this.responseText);

                        // clean previous errors
                        var errors = signatureForm.querySelectorAll('.field-error');
                        Array.prototype.forEach.call(errors, function(el) {
                            el.parentNode.removeChild(el);
                        });
                        errorWrapper.innerHTML = '';

                        // check if the error is general or specific to some fields
                        if (resp.hasOwnProperty && resp.hasOwnProperty('detail')) {
                            errorWrapper.innerHTML = '<span class="field-error">' + resp.detail + '</span>';
                        } else {
                            Object.keys(resp).forEach(function(name) {
                                var error = resp[name],
                                    field = signatureForm.querySelector('[name='+name+']'),
                                    errorElement = document.createElement('div');

                                mouvy.addClassName(errorElement, 'field-error');
                                errorElement.innerText = error;
                                field.insertAdjacentHTML('afterend', errorElement.outerHTML);
                            });
                        }
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

    var signatureWrapper = document.querySelector('#signature-wall-wrapper'),
        signatureCounter = document.querySelector('.signature-counter'),
        signatureWall = document.querySelector('#signature-wall'),
        signatureMoreTrigger = document.querySelector('.more-signatures');

    // API Calls
    var loadTracker = {
            signatureFirstBatchLoaded: false,
        },
        updateSignatureCount = function(newCount) {
            signatureCounter.querySelector('span').innerHTML = newCount;
        },
        generateSignatureElement = function(signatureDataURL, signatureAlt) {
            var signImage;

            // alternative when there is no signature
            if (!signatureDataURL) {
                signImage = '<span>'+ signatureAlt +'</span>';
            } else {
                signImage = '<img src="'+ signatureDataURL +'" alt="'+ signatureAlt +'">';
            }

            var signElement = document.createElement('div');
            mouvy.addClassName(signElement, 'signature');
            signElement.innerHTML = signImage;
            return signElement;
        },
        configureTooltipForSignatureElement = function(signatureElement, name) {
            new Tooltip({
                target: signatureElement,
                position: 'top center',
                content: name,
                openOn: 'hover'
            });
        },
        loadSignatures = function(pageURL, successCallback) {
            var requestURL = pageURL,
                signatureListRequest = mouvy.prepareRequest(requestURL, 'get');

            signatureListRequest.onreadystatechange = function() {
                if (this.readyState === 4 && this.status >= 200 && this.status < 400){
                    // Success!
                    var data = JSON.parse(this.responseText),
                        nextPageURL = data.next,
                        count = data.count,
                        signatures = data.results;

                    // first update the count (may be necessary)
                    updateSignatureCount(count);

                    signatures.forEach(function(sign) {
                        var signElement = generateSignatureElement(sign['signature_image_data_url'], sign['first_name']);
                        signatureWall.appendChild(signElement);
                        configureTooltipForSignatureElement(signElement, sign['first_name']);
                    });

                    if (successCallback) {
                        successCallback(signatureWall, nextPageURL);
                    }
                } else {
                    // We reached our target server, but it returned an error
                    // TODO handle errors
                }
            };
            mouvy.sendRequest(signatureListRequest);
        };

    // delay the calls until needed
    var delay = 50,
        timeout = null,
        loadNextBatchOfSignatures = function(callback) {
            var url = signatureMoreTrigger.dataset.nextPageUrl;
            loadSignatures(url, function(signatureBatchWrapper, nextPageURL) {
                if (!nextPageURL) {
                    // no more page, we remove the button
                    signatureMoreTrigger.parentNode.removeChild(signatureMoreTrigger);
                } else {
                    signatureMoreTrigger.dataset.nextPageUrl = nextPageURL;
                }

                if (callback) {
                    callback(signatureBatchWrapper);
                }
            });
        },
        didScroll = function() {
            // if the signature wall is visible load the first batch of signatures automatically
            // and update the counter
            if (mouvy.geometry.isElementInViewport(window, document, signatureMoreTrigger)) {
                if (loadTracker.signatureFirstBatchLoaded !== true) {
                    // avoid multiple calls from being made
                    // by setting to the `true` the tracker right away
                    loadTracker.signatureFirstBatchLoaded = true;
                    loadNextBatchOfSignatures();
                }
            }
        };

    signatureMoreTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        loadNextBatchOfSignatures(function(signatureBatchWrapper) {
            // focus on the next batch without loosing the current scroll position
            var sx = window.scrollX, sy = window.scrollY;
            signatureBatchWrapper.focus();
            window.scrollTo(sx, sy);
        });
    });

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

    // realtime push notification
    // connect to the sockets
    var socket = io(signatureWrapper.dataset.pusherUrl);
        socket.on('signatures', function(msg) {
            // only add the signature if the first batch has been loaded
            if (loadTracker.signatureFirstBatchLoaded !== true) {
                return;
            }

            var data = JSON.parse(msg);

            updateSignatureCount(data.count);

            var signElement = generateSignatureElement(data.signature);
            signatureWall.insertBefore(signElement, signatureWall.firstChild);
            configureTooltipForSignatureElement(signElement, data.name);
        });
});
