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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.nodux = exports.StoreController = void 0;
var _ = require('lodash');
var StoreController = /** @class */ (function () {
    function StoreController() {
        var _this = this;
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
        this._parsePath = function (path) {
            var pathArray = (typeof path === 'string') ? path.split('.') : path;
            var pathString = (typeof path === 'string') ? path : path.join('.');
            return { pathArray: pathArray, pathString: pathString };
        };
        this.createActions = function (newActions) {
            _this.actions = __assign(__assign({}, _this.actions), newActions);
        };
        // fetch whole store
        this.getStore = function () { return JSON.parse(localStorage.getItem(_this.root) || ''); };
        this.getStoreAsync = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve().then(this.getStore)];
        }); }); };
        // fetch a particular item from store
        this.getItem = function (path) { return _.get(JSON.parse(localStorage.getItem(_this.root) || ''), path); };
        this.getItemAsync = function (path) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve().then(function () { return _this.getItem(path); })
                    // spread an object into a particular path
                ];
            });
        }); };
        // spread an object into a particular path
        this.setItem = function (path, item) {
            var store = _this.getStore();
            var _a = _this._parsePath(path), pathArray = _a.pathArray, pathString = _a.pathString;
            var nextStore = _this._updateNestedItem(store, pathArray, item);
            localStorage.setItem(_this.root, JSON.stringify(nextStore));
            document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
        };
        this.setItemAsync = function (path, item) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve().then(function () { return _this.setItem(path, item); })];
            });
        }); };
        // silentUpdate is same as setItem without the event dispatch
        this.silentUpdate = function (path, item) {
            var store = _this.getStore();
            var _a = _this._parsePath(path), pathArray = _a.pathArray, pathString = _a.pathString;
            var nextStore = _this._updateNestedItem(store, pathArray, item);
            localStorage.setItem(_this.root, JSON.stringify(nextStore));
        };
        // recursively overwrite the value of a nested store item
        this._updateNestedItem = function (parent, pathArray, item) {
            var _a, _b, _c;
            var key = pathArray[0];
            var currentLayer = _.get(parent, "" + key, {});
            if (pathArray.length === 1) {
                if (typeof item === "object" && !Array.isArray(item)) {
                    return __assign(__assign({}, parent), (_a = {}, _a[key] = __assign(__assign({}, currentLayer), item), _a));
                }
                ;
                return __assign(__assign({}, parent), (_b = {}, _b[key] = item, _b));
            }
            ;
            var child = _this._updateNestedItem(currentLayer, pathArray.slice(1), item);
            return __assign(__assign({}, parent), (_c = {}, _c[key] = __assign({}, child), _c));
        };
        // remove an entire domain, or a particular property from a domain
        this.removeItem = function (path, blacklist) {
            var store = _this.getStore();
            var _a = _this._parsePath(path), pathArray = _a.pathArray, pathString = _a.pathString;
            var nextStore = _this._removeNestedItem(store, pathArray, blacklist);
            localStorage.setItem(_this.root, JSON.stringify(nextStore));
            document.dispatchEvent(new CustomEvent('watch:store-update', { detail: pathString }));
        };
        this.removeItemAsync = function (path, blacklist) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve().then(function () { return _this.removeItem(path, blacklist); })];
            });
        }); };
        // recursively remove a nested store item
        this._removeNestedItem = function (parent, pathArray, blacklist) {
            var _a, _b;
            var key = pathArray[0];
            var currentLayer = _.get(parent, "" + key);
            if (!currentLayer)
                throw new Error("KeyError: key-name \"" + key + "\" not found");
            if (pathArray.length === 1) {
                if (blacklist) {
                    var rest = _.omit(currentLayer, blacklist);
                    return __assign(__assign({}, parent), (_a = {}, _a[key] = rest, _a));
                }
                else {
                    var rest = _.omit(parent, key);
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
        this.clearAsync = function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, Promise.resolve().then(this.clear)];
        }); }); };
        this.getSize = function () {
            var store = localStorage.getItem(_this.root) || '{}';
            var spaceUsed = ((store.length * 16) / (8 * 1024));
            alert("\n        Store length:\n          " + (store.length > 2 ? store.length : 0) + " characters\n\n        Approximate space used:\n          " + (store.length > 2 ? spaceUsed.toFixed(2) + " KB" : "Empty (0 KB)") + "\n\n        Approximate space remaining:\n          " + (store.length > 2 ? (5120 - spaceUsed).toFixed(2) + " KB" : "5 MB") + "\n      ");
        };
        this.root = "root";
        this.config = {};
        this.actions = {};
    }
    return StoreController;
}());
exports.StoreController = StoreController;
exports.nodux = new StoreController();
