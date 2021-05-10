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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import { clamp } from "./utils";
var reactTriggerChange = require("react-trigger-change");
var selectionSymbol = Symbol("selection position");
var rawParser = function (strings) {
    var tags = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        tags[_i - 1] = arguments[_i];
    }
    var hash = String(Date.now());
    var rawStrings = strings.map(function (c, index) {
        var isSelection = tags[index] === selectionSymbol;
        return c + (isSelection ? hash : typeof tags[index] === "string" ? String(tags[index]) : "");
    });
    var prepared = rawStrings.join("");
    var parts = prepared.split(hash);
    var content = parts.join("");
    var selectionsTag = tags.filter(function (x) { return x === selectionSymbol; });
    var selections = parts.reduce(function (_a, text, index) {
        var config = _a[0], totalLength = _a[1];
        var selection = selectionsTag[index];
        if (selection === selectionSymbol) {
            if (config.currentSelectionStart === undefined) {
                config.currentSelectionStart = totalLength + text.length;
            }
            else if (config.currentSelectionEnd === undefined) {
                config.currentSelectionEnd = totalLength + text.length;
            }
        }
        return [config, totalLength + text.length];
    }, [{}, 0])[0];
    return __assign({ content: content }, selections);
};
/**
 * Service for manipulation with textarea content and text selection
 */
var Cursor = /** @class */ (function () {
    function Cursor(element) {
        var _this = this;
        this.element = element;
        this.getLine = function (lineNumber) {
            var ensureLineNumber = lineNumber !== null && lineNumber !== void 0 ? lineNumber : _this.getCurrentPosition().lineNumber;
            var lines = _this.element.value.split("\n");
            var line = lines[ensureLineNumber];
            return (line === null || line === void 0 ? void 0 : line.endsWith("\n")) ? line === null || line === void 0 ? void 0 : line.slice(0, -1) : line;
        };
        this.getIndentSize = function (lineNumber) {
            var _a, _b;
            return (_b = (_a = _this.getLine(lineNumber).match(/^\s*/)) === null || _a === void 0 ? void 0 : _a[0].length) !== null && _b !== void 0 ? _b : 0;
        };
        this.getCurrentPosition = function () {
            var getTextLines = function (tillPosition) {
                return _this.element.value
                    .slice(0, tillPosition)
                    .split("\n")
                    .map(function (x) { return x + "\n"; });
            };
            var clampByLine = function (value, lineNumber) { return clamp(value, 0, _this.getLine(lineNumber).length); };
            var tillStartTextLines = getTextLines(_this.element.selectionStart);
            var tillStartEndLines = getTextLines(_this.element.selectionEnd);
            var lineNumber = tillStartTextLines.length - 1;
            var lineNumberEnd = tillStartEndLines.length - 1;
            var selectionSize = _this.element.selectionEnd - _this.element.selectionStart;
            var lineSelectionStart = clampByLine(_this.element.selectionStart - tillStartTextLines.slice(0, -1).join("").length, lineNumber);
            var lineSelectionEnd = clampByLine(lineSelectionStart + selectionSize, lineNumber);
            return {
                lineNumber: lineNumber,
                lineNumberEnd: lineNumberEnd,
                lineSelectionEnd: lineSelectionEnd,
                lineSelectionStart: lineSelectionStart,
                selectionDirection: _this.element.selectionDirection,
                selectionStart: _this.element.selectionStart,
                selectionEnd: _this.element.selectionEnd,
            };
        };
        this.getValue = function () { return _this.element.value; };
        this.setValue = function (value) {
            if (document.activeElement !== _this.element) {
                _this.element.focus();
            }
            _this.element.value = value;
            reactTriggerChange(_this.element);
        };
        this.getSelected = function () {
            var position = _this.getCurrentPosition();
            return _this.getValue().slice(position.selectionStart, position.selectionEnd);
        };
        this.spliceContent = function (parsedRaw, options) {
            if (options === void 0) { options = {}; }
            var text = _this.getValue();
            var lines = text.split("\n");
            var position = _this.getCurrentPosition();
            var _a = options.replaceCount, replaceCount = _a === void 0 ? 0 : _a, _b = options.startLineNumber, startLineNumber = _b === void 0 ? position.lineNumber : _b;
            var _c = parsedRaw !== null && parsedRaw !== void 0 ? parsedRaw : {}, _d = _c.content, content = _d === void 0 ? "" : _d, _e = _c.currentSelectionStart, currentSelectionStart = _e === void 0 ? 0 : _e, currentSelectionEnd = _c.currentSelectionEnd;
            var linesBefore = lines.slice(0, startLineNumber);
            var linesAfter = lines.slice(startLineNumber + replaceCount);
            var currentLines = content.split("\n");
            var joined = __spreadArrays(linesBefore, currentLines, linesAfter).join("\n");
            _this.setValue(joined);
            var charsBeforeLength = linesBefore.map(function (x) { return x.concat("\n"); }).join("").length;
            var selectionStart = currentSelectionStart + charsBeforeLength;
            var selectionEnd = (currentSelectionEnd !== null && currentSelectionEnd !== void 0 ? currentSelectionEnd : currentSelectionStart) + charsBeforeLength;
            _this.element.setSelectionRange(selectionStart, selectionEnd);
        };
        this.removeLines = function () {
            var lineNumbers = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                lineNumbers[_i] = arguments[_i];
            }
            var text = _this.getValue();
            var lines = text.split("\n").filter(function (_, index) { return !lineNumbers.includes(index); });
            _this.setValue(lines.join("\n"));
        };
    }
    Cursor.$ = selectionSymbol;
    Cursor.raw = rawParser;
    return Cursor;
}());
export { Cursor };
