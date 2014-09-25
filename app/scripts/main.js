$(document).ready(function() {
    'use strict';

    // box each titles
    var titleElements = document.querySelectorAll('.title--boxed');
    Array.prototype.forEach.call(titleElements, function(el) {
        Boxme.draw(el);
    });

    // make the logo full screen on page loading
    setTimeout(function() {
        var logoWrapper = document.getElementById('logo-full-screen'),
            logo = logoWrapper.querySelector('img'),
            header = document.querySelector('.main-head');

        var wrapperHeight = window.innerHeight - header.offsetHeight;
        logoWrapper.style.height = (wrapperHeight + header.offsetHeight) + "px";
        logoWrapper.style.paddingTop = (wrapperHeight/2 - logo.height/2 + header.offsetHeight) + "px";

        // reveal the logo
        logoWrapper.style.opacity = 1;
    }, 500);

});