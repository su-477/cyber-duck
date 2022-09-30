// Avoid `console` errors in browsers that lack a console.
(function () {
    var method;
    var noop = function () { };
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/* jQuery Tiny Pub/Sub - v0.7 - 10/27/2011
 * http://benalman.com/
 * Copyright (c) 2011 "Cowboy" Ben Alman; Licensed MIT, GPL */
(function ($) {
    var o = $({});

    $.subscribe = function () {
        o.on.apply(o, arguments);
    };

    $.unsubscribe = function () {
        o.off.apply(o, arguments);
    };

    $.publish = function () {
        o.trigger.apply(o, arguments);
    };
}(jQuery));


//utils
var Utils = {
    getURLParameter: function (name) {
        return decodeURI(
            (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
        );
    },

    cantSave: function () {
        if (PRODUCTION) {
            $.msgBox({
                title: "LMS CONNECTION",
                content: "The course was not able to connect to your LMS for some reason, this will mean if you continue your scores/progress will not be recorded and you may be reset to the start of the course.  Please close the course and open again to attempt to connect to the LMS",
                afterShow: function (result) { $('.msgButton').focus(); }
            });
        }
    },
    addEvent: function (el, type, fn) {
        if (document.addEventListener) return el.addEventListener(type, fn, false);
        return el.attachEvent("on" + type, fn);
    },

    removeEvent: function (el, type, fn) {
        if (document.removeEventListener) return el.removeEventListener(type, fn);
        return el.detachEvent("on" + type, fn);
    },

    storageAvailable: function(type) {
        try {
            var storage = window[type],
            x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        } catch (e) { return false;}
    },

    subscribe: $.subscribe,
    unsubscribe: $.unsubscribe
};
