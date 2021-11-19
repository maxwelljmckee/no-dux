"use strict";
exports.__esModule = true;
exports.useStore = exports.nodux = void 0;
var React = require("react");
var core_1 = require("@no-dux/core");
exports.nodux = core_1.nodux;
var useStore = function (path) {
    var _a = React.useState({}), watchlist = _a[0], setWatchlist = _a[1];
    React.useEffect(function () {
        var onStore = function (e) {
            console.log('store event fired', e);
        };
        document.addEventListener('watch:store-update', onStore);
        return function () { return document.removeEventListener('watch:store-update', function () { return onStore; }); };
    }, []);
    return watchlist;
};
exports.useStore = useStore;
