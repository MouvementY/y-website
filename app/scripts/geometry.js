'use strict';

// namespace
var mouvy = mouvy || {};
mouvy.geometry = mouvy.geometry || {};

mouvy.geometry.viewPortHeight = function(win, doc) {
    var de = doc.documentElement;

    if (!!win.innerWidth) {
        return win.innerHeight;
    } else if (de && !isNaN(de.clientHeight)) {
        return de.clientHeight;
    }

    return 0;
};

mouvy.geometry.scrollTop = function(win, doc) {
    if (win.pageYOffset !== undefined) {
        return win.pageYOffset;
    } else {
        return Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
    }
};

mouvy.geometry.posY = function(elm) {
    var test = elm, top = 0;

    while (!!test && test.tagName.toLowerCase() !== 'body') {
        top += test.offsetTop;
        test = test.offsetParent;
    }

    return top;
};

mouvy.geometry.isElementInViewport = function(win, doc, elm) {
    var viewHeight = mouvy.geometry.viewPortHeight(win, doc),
        scrollTop = mouvy.geometry.scrollTop(win, doc),
        y = mouvy.geometry.posY(elm);

    return (y < (viewHeight + scrollTop) && y > scrollTop);
};
