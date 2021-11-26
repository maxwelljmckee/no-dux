"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.nodux = exports.useStore = void 0;
var ReactFromModule = require("react");
var core_1 = require("@no-dux/core");
exports["default"] = ReactFromModule;
var useStore = function (path) {
    var _a = ReactFromModule.useState({}), watchlist = _a[0], setWatchlist = _a[1];
    var pathList = ReactFromModule.useMemo(function () { return (typeof path === "string" ? [path] : path); }, 
    // eslint-disable-next-line
    []);
    ReactFromModule.useEffect(function () {
        var initializeWatchlist = function () {
            if (!path)
                return setWatchlist(core_1.nodux.getStore());
            setWatchlist(pathList.reduce(function (acc, key) {
                var _a;
                return __assign(__assign({}, acc), (_a = {}, _a[key] = core_1.nodux.getItem(key), _a));
            }, {}));
        };
        initializeWatchlist();
        // eslint-disable-next-line
    }, []);
    ReactFromModule.useEffect(function () {
        var onStoreUpdate = function (event) {
            if (!path || event.detail === 'clear')
                return setWatchlist(core_1.nodux.getStore());
            var modified = event.detail;
            Object.keys(watchlist).forEach(function (key) {
                var _a;
                if (modified.startsWith(key)) {
                    setWatchlist(__assign(__assign({}, watchlist), (_a = {}, _a[key] = core_1.nodux.getItem(key), _a)));
                }
            });
        };
        document.addEventListener("watch:store-update", onStoreUpdate);
        return function () {
            document.removeEventListener("watch:store-update", onStoreUpdate);
        };
        // eslint-disable-next-line
    }, [watchlist]);
    return !path
        ? watchlist
        : Object.keys(watchlist).reduce(function (acc, key) {
            var _a;
            var trimmed = key.split(".").pop();
            return __assign(__assign({}, acc), (_a = {}, _a[trimmed] = watchlist[key], _a));
        }, {});
};
exports.useStore = useStore;
exports.nodux = core_1.nodux;
