'use strict';

// String.prototype.trim
if (String.prototype.trim === undefined) {
    String.prototype.trim = function trim() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// Object.keys
if (Object.keys === undefined) {
    (function (hasOwnProperty, objectEnumerables) {
        Object.keys = function keys(object) {
            if (object !== Object(object)) {
                throw new TypeError(object + ' is not an object');
            }

            var buffer = [], key;

            for (key in object) {
                if (hasOwnProperty.call(object, key)) {
                    buffer.push(key);
                }
            }

            for (key in objectEnumerables) {
                if (hasOwnProperty.call(object, key.slice(1))) {
                    buffer.push(key);
                }
            }

            return buffer;
        };
    })(Object.prototype.hasOwnProperty, {
        _constructor: 0,
        _hasOwnProperty: 0,
        _isPrototypeOf: 0,
        _propertyIsEnumerable: 0,
        _toString: 0,
        _toLocaleString: 0,
        _valueOf: 0
    });
}

// Object.prototype.defineProperty
Object.defineProperty = Object.defineProperty || function defineProperty(object, property, descriptor) {
    // handle object
    if (object === null || !(object instanceof Object || typeof object === 'object')) {
        throw new TypeError('Object must be an object');
    }

    // handle descriptor
    if (!(descriptor instanceof Object)) {
        throw new TypeError('Descriptor must be an object');
    }

    var
    propertyString = String(property),
    getterType = 'get' in descriptor && typeof descriptor.get,
    setterType = 'set' in descriptor && typeof descriptor.set;

    // handle descriptor.get
    if (getterType && getterType !== 'function') {
        throw new TypeError('Getter expected a function');
    }

    // handle descriptor.set
    if (setterType && setterType !== 'function') {
        throw new TypeError('Setter expected a function');
    }

    // handle descriptor.get
    if (getterType) {
        object.__defineGetter__(propertyString, descriptor.get);
    }
    // handle descriptor.value
    else {
        object[propertyString] = descriptor.value;
    }

    // handle descriptor.set
    if (setterType) {
        object.__defineSetter__(propertyString, descriptor.set);
    }

    // return object
    return object;
};

// Object.prototype.defineProperty for ie8
(function (nativeDefineProperty) {
    Object.defineProperty = function defineProperty(object, property, descriptor) {
        // handle object
        if (object === null || !(object instanceof Object || typeof object === 'object')) {
            throw new TypeError('Object must be an object');
        }

        // handle descriptor
        if (!(descriptor instanceof Object)) {
            throw new TypeError('Descriptor must be an object');
        }

        var
        propertyString = String(property);

        // handle native support
        if (object === window || object === document || object === Element.prototype || object instanceof Element) {
            return nativeDefineProperty(object, propertyString, descriptor);
        }

        // handle descriptor.get
        if ('get' in descriptor) {
            object[propertyString] = descriptor.get.call(object);
        }
        // handle descriptor.value
        else {
            object[propertyString] = descriptor.value;
        }

        // return object
        return object;
    };
})(Object.defineProperty);

// Array.prototype.forEach
if (Array.prototype.forEach === undefined) {
    Array.prototype.forEach = function forEach(callback) {
        if (this === undefined || this === null) {
            throw new TypeError(this + 'is not an object');
        }

        if (!(callback instanceof Function)) {
            throw new TypeError(callback + ' is not a function');
        }

        var
        object = Object(this),
        scope = arguments[1],
        arraylike = object instanceof String ? object.split('') : object,
        length = Math.max(Math.min(arraylike.length, 9007199254740991), 0) || 0,
        index = -1;

        while (++index < length) {
            if (index in arraylike) {
                callback.call(scope, arraylike[index], index, object);
            }
        }
    };
}

// Function.prototype.bind
if (Function.prototype.bind === undefined) {
    Function.prototype.bind = function bind(scope) {
        var
        callback = this,
        prepend = Array.prototype.slice.call(arguments, 1),
        Constructor = function () {},
        bound = function () {
            return callback.apply(
                this instanceof Constructor && scope ? this : scope,
                prepend.concat(Array.prototype.slice.call(arguments, 0))
            );
        };

        Constructor.prototype = bound.prototype = callback.prototype;

        return bound;
    };
}