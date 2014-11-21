'use strict';

// namespace
var mouvy = mouvy || {};


mouvy.hasClassName = function(el, className) {
    if (el.classList) {
        return el.classList.contains(className);
    } else {
        return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
};

mouvy.addClassName = function(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
};

mouvy.removeClassName = function(el, className) {
    if (el.classList) {
        el.classList.remove(className);
    } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
};

mouvy.urlEncodeParams = function(params) {
    var urlEncodedData = '',
        urlEncodedDataPairs = [];

    // inspired from the Mozilla developer documentation
    // source: https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms/Sending_forms_through_JavaScript
    for (var name in params) {
        urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(params[name]));
    }
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    return urlEncodedData;
};

mouvy.prepareRequest = function(url, method) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    if (method.toLowerCase() === 'post') {
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    // ask for json output
    request.setRequestHeader('Accept', 'application/json');

    return request;
};

mouvy.sendRequest = function(preparedRequest, data) {
    preparedRequest.send(data);
};
