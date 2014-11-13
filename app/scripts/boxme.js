'use strict';

(function() {
    var defaultOptions;

    defaultOptions = {
        strokeColor: 'black',
        strokeWith: 2.0,
        offsetPadding: {
            x: 15,
            y: 15
        }
    };

    // expose the class
    if (window.Boxme === null) {
        window.Boxme = {};
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function renderBox(ctx, frame, style) {
        var updatedFrame = frame;

        // NB: 0.5 offset to avoid antialiasing
        //     http://stackoverflow.com/a/7607321/1886070
        //     so we diminish the size with the stroke width
        updatedFrame.x += style.strokeWidth/2;
        updatedFrame.y += style.strokeWidth/2;
        updatedFrame.width -= style.strokeWidth;
        updatedFrame.height -= style.strokeWidth;

        // add some randomness to the rect
        var points = [
            {
                x: updatedFrame.x + getRandomInt(0, style.randomVariability),
                y: updatedFrame.y + getRandomInt(0, style.randomVariability)
            },
            {
                x: updatedFrame.x + updatedFrame.width - getRandomInt(0, style.randomVariability),
                y: updatedFrame.y + getRandomInt(0, style.randomVariability)
            },
            {
                x: updatedFrame.x + updatedFrame.width - getRandomInt(0, style.randomVariability),
                y: updatedFrame.y + updatedFrame.height - getRandomInt(0, style.randomVariability)
            },
            {
                x: updatedFrame.x + getRandomInt(0, style.randomVariability),
                y: updatedFrame.y + updatedFrame.height - getRandomInt(0, style.randomVariability)
            }
        ];

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach(function(p){
            ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();

        ctx.strokeStyle = style.strokeColor;
        ctx.lineWidth = style.strokeWidth;
        ctx.stroke();
    }

    // expose public methods
    window.Boxme.draw = function(element) {
        var options = defaultOptions;

        var canvas = document.createElement('canvas'),
            boxRect = {
                x: 0,
                y: 0,
                width: element.offsetWidth + 2*options.offsetPadding.x,
                height: element.offsetHeight + 2*options.offsetPadding.y
            };

        // add a <canvas> underneath the `element`
        element.style.position = 'relative';
        canvas.style.position = 'absolute';
        canvas.style.top = '' + (element.offsetHeight/2 - boxRect.height/2) + 'px';
        canvas.style.left = '' + (element.offsetWidth/2 - boxRect.width/2) + 'px';
        canvas.width = boxRect.width;
        canvas.height = boxRect.height;

        // add the element to the DOM
        element.appendChild(canvas);

        // draw the box
        renderBox(canvas.getContext('2d'),
            boxRect,
            {
                strokeColor: options.strokeColor,
                strokeWidth: options.strokeWith,
                randomVariability: 6.0,
            });
    };

})();