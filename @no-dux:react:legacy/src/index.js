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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.useAutosave = exports.useStore = void 0;
var react_1 = require("react");
var core_1 = require("@no-dux/core");
var useStore = function (path) {
    var _a = (0, react_1.useState)({}), watchlist = _a[0], setWatchlist = _a[1];
    var pathList = (0, react_1.useMemo)(function () { return (typeof path === "string" ? [path] : path); }, 
    // eslint-disable-next-line
    []);
    (0, react_1.useEffect)(function () {
        var initializeWatchlist = function () {
            var _a;
            if (!path)
                return setWatchlist((_a = {}, _a[core_1.nodux.root] = core_1.nodux.getStore(), _a));
            setWatchlist(pathList.reduce(function (acc, key) {
                var _a;
                return __assign(__assign({}, acc), (_a = {}, _a[key] = core_1.nodux.getItem(key), _a));
            }, {}));
        };
        initializeWatchlist();
        // eslint-disable-next-line
    }, []);
    (0, react_1.useEffect)(function () {
        var onStoreUpdate = function (event) {
            var _a;
            if (!path)
                return setWatchlist((_a = {}, _a[core_1.nodux.root] = core_1.nodux.getStore(), _a));
            Object.keys(watchlist).forEach(function (key) {
                var _a;
                var targetValue = core_1.nodux.getItem(key);
                if (watchlist[key] !== targetValue) {
                    setWatchlist(__assign(__assign({}, watchlist), (_a = {}, _a[key] = targetValue, _a)));
                }
            });
        };
        document.addEventListener("watch:store-update", onStoreUpdate);
        return function () {
            document.removeEventListener("watch:store-update", onStoreUpdate);
        };
        // eslint-disable-next-line
    }, [watchlist]);
    return Object.keys(watchlist).reduce(function (acc, key) {
        var _a;
        var trimmed = key.split(".").pop();
        return __assign(__assign({}, acc), (_a = {}, _a[trimmed] = watchlist[key], _a));
    }, {});
};
exports.useStore = useStore;
var useAutosave = function (path, whitelist, blacklist) {
    if (blacklist === void 0) { blacklist = []; }
    var watchlist = (0, react_1.useMemo)(function () { return (0, core_1._omit)(whitelist, blacklist); }, 
    // eslint-disable-next-line
    [whitelist]);
    (0, react_1.useEffect)(function () { return core_1.nodux.silentUpdate(path, watchlist); }, __spreadArray([], Object.values(watchlist), true));
};
exports.useAutosave = useAutosave;
