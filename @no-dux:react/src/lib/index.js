"use strict";
exports.__esModule = true;
exports.useStore = exports.nodux = void 0;
var react_1 = require("react");
var core_1 = require("@no-dux/core");
exports.nodux = core_1.nodux;
var useStore = function (path) {
    var _a = react_1["default"].useState({}), watchlist = _a[0], setWatchlist = _a[1];
    react_1["default"].useEffect(function () {
        var onStore = function (e) {
            console.log('store event fired', e);
        };
        document.addEventListener('watch:store-update', onStore);
        return function () { return document.removeEventListener('watch:store-update', function () { return onStore; }); };
    }, []);
};
exports.useStore = useStore;
