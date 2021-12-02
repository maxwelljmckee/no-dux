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
exports.nodux = exports.StoreController = exports._omit = void 0;
var _omit = function (object, blacklist) {
    var target;
    if (typeof blacklist === "string") {
        target = Object.keys(object).reduce(function (acc, key) {
            var _a;
            if (key !== blacklist)
                return __assign(__assign({}, acc), (_a = {}, _a[key] = object[key], _a));
            return acc;
        }, {});
    }
    else if (Array.isArray(blacklist)) {
        target = Object.keys(object).reduce(function (acc, key) {
            var _a;
            if (!blacklist.includes(key))
                return __assign(__assign({}, acc), (_a = {}, _a[key] = object[key], _a));
            return acc;
        }, {});
    }
    return target;
};
exports._omit = _omit;
var _get = function (object, path, defaultValue) {
    var pathArray = typeof path === 'string' ? path.split('.') : path;
    var target = object;
    while (pathArray.length) {
        var nextKey = pathArray.shift();
        if (!target.hasOwnProperty(nextKey))
            return defaultValue;
        target = target[nextKey];
    }
    return target;
};
var StoreController = /** @class */ (function () {
    function StoreController() {
        var _this = this;
        // initialize store root on app load
        this.createStore = function (_a) {
            var _b = _a === void 0 ? {} : _a, _c = _b.root, root = _c === void 0 ? 'root' : _c, _d = _b.defaults, defaults = _d === void 0 ? {} : _d, _e = _b.config, config = _e === void 0 ? {} : _e;
            if (root !== 'root')
                _this.root = root;
            if (config)
                _this.config = config;
            var initial = localStorage.getItem(_this.root);
            if (!initial) {
                localStorage.setItem(_this.root, JSON.stringify(defaults));
            }
            ;
        };
        // add actions to the action registry
        this.registerActions = function (newActions) {
            _this.actions = __assign(__assign({}, _this.actions), newActions);
        };
        // add partitioned actions to the action registry
        this.registerPartitionedActions = function (subdomain, newActions) {
            var _a;
            _this.actions = __assign(__assign({}, _this.actions), (_a = {}, _a[subdomain] = newActions, _a));
        };
        // fetch whole store
        this.getStore = function () { return JSON.parse(localStorage.getItem(_this.root) || ''); };
        // fetch item from a path
        this.getItem = function (path) { return _get(JSON.parse(localStorage.getItem(_this.root) || ''), path); };
        // merge or set an item at a path
        this.setItem = function (path, item) {
            var store = _this.getStore();
            var _a = _this._parsePath(path), pathArray = _a.pathArray, pathString = _a.pathString;
            var nextStore = _this._updateNestedItem(store, pathArray, item);
            localStorage.setItem(_this.root, JSON.stringify(nextStore));
            document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
        };
        // silentUpdate sets an item without dispatching an event
        this.silentUpdate = function (path, item) {
            var store = _this.getStore();
            var pathArray = _this._parsePath(path).pathArray;
            var nextStore = _this._updateNestedItem(store, pathArray, item);
            localStorage.setItem(_this.root, JSON.stringify(nextStore));
        };
        // recursively overwrite the value of a nested store item
        this._updateNestedItem = function (parent, pathArray, item) {
            var _a, _b, _c, _d;
            var key = pathArray[0];
            var currentLayer = _get(parent, "" + key, {});
            if (pathArray.length === 1) {
                if (Array.isArray(item) && Array.isArray(currentLayer)) {
                    return __assign(__assign({}, parent), (_a = {}, _a[key] = __spreadArray(__spreadArray([], currentLayer, true), item, true), _a));
                }
                if (typeof item === "object" && !Array.isArray(item)) {
                    return __assign(__assign({}, parent), (_b = {}, _b[key] = __assign(__assign({}, currentLayer), item), _b));
                }
                ;
                return __assign(__assign({}, parent), (_c = {}, _c[key] = item, _c));
            }
            ;
            var child = _this._updateNestedItem(currentLayer, pathArray.slice(1), item);
            return __assign(__assign({}, parent), (_d = {}, _d[key] = __assign({}, child), _d));
        };
        // remove an entire domain, or a particular property from a domain
        this.removeItem = function (path, blacklist) {
            var store = _this.getStore();
            var _a = _this._parsePath(path), pathArray = _a.pathArray, pathString = _a.pathString;
            var nextStore = _this._removeNestedItem(store, pathArray, blacklist);
            localStorage.setItem(_this.root, JSON.stringify(nextStore));
            document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
        };
        // recursively remove a nested store item
        this._removeNestedItem = function (parent, pathArray, blacklist) {
            var _a, _b;
            var key = pathArray[0];
            var currentLayer = _get(parent, "" + key);
            if (!currentLayer)
                throw new Error("KeyError: Invalid keyName \"" + key + "\" in object path");
            if (pathArray.length === 1) {
                if (blacklist) {
                    var rest = (0, exports._omit)(currentLayer, blacklist);
                    return __assign(__assign({}, parent), (_a = {}, _a[key] = rest, _a));
                }
                else {
                    var rest = (0, exports._omit)(parent, key);
                    return rest;
                }
                ;
            }
            ;
            var child = _this._removeNestedItem(currentLayer, pathArray.slice(1), blacklist);
            return __assign(__assign({}, parent), (_b = {}, _b[key] = __assign({}, child), _b));
        };
        // clear all data from store leaving an empty object at root path
        this.clear = function () {
            localStorage.setItem(_this.root, JSON.stringify({}));
            document.dispatchEvent(new CustomEvent('watch:store-update', { detail: 'clear' }));
        };
        this.getSize = function () {
            var store = localStorage.getItem(_this.root) || '{}';
            var spaceUsed = ((store.length * 16) / (8 * 1024));
            alert("\n        Store length:\n          " + (store.length > 2 ? store.length : 0) + " characters\n\n        Approximate space used:\n          " + (store.length > 2 ? spaceUsed.toFixed(2) + " KB" : "Empty (0 KB)") + "\n\n        Approximate space remaining:\n          " + (store.length > 2 ? (5120 - spaceUsed).toFixed(2) + " KB" : "5 MB") + "\n      ");
        };
        this._parsePath = function (path) {
            var pathArray = (typeof path === 'string') ? path.split('.') : path;
            var pathString = (typeof path === 'string') ? path : path.join('.');
            return { pathArray: pathArray, pathString: pathString };
        };
        this.root = "root";
        this.config = {};
        this.actions = {};
    }
    return StoreController;
}());
exports.StoreController = StoreController;
exports.nodux = new StoreController();
