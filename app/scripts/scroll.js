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
        signaturePad = new window.SignaturePad(signatureCanvas, {
            minWidth: 1,
            maxWidth: 3,
            penColor: 'rgb(0, 0, 0)',
            onEnd: function() {
                signatureFormField.value = signaturePad.toDataURL();
            }
        });

    document.querySelector('.clear-sign-canvas').addEventListener('click', function(e) {
        e.preventDefault();
        signaturePad.clear();
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
                'signature_image_data_url': signatureForm.querySelector('[name=signature_image]').value,
            },
            urlEncodedData = mouvy.urlEncodeParams(data);

        // prepare and send the request
        var request = mouvy.prepareRequest(signatureForm.action, 'post');
        mouvy.sendRequest(request, urlEncodedData);
    });

    // load the signature wall content
    var signatureWall = document.querySelector('#signature-wall');
    var request = mouvy.prepareRequest(signatureWall.dataset.url, 'get');
    request.onload = function() {
        if (request.status >= 200 && request.status < 400){
            // Success!
            var data = JSON.parse(request.responseText);
            data.forEach(function(sign) {
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
        } else {
            // We reached our target server, but it returned an error
            // TODO handle errors
        }
    };
    mouvy.sendRequest(request);
});
