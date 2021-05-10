var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
import { clamp, escapeRegExp, getClipboardText } from "./utils";
import { Cursor } from "./Cursor";
// eslint-disable-next-line no-useless-escape
var ANY_URL_RE = /(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$/i;
var ANY_LIST_RE = /^(\s*(-|\*|(\d\.){1,2})\s+)(.+)/;
var ANY_BLANK_LIST_RE = /^(\s*(-|\*|(\d\.){1,2})\s{0,1})$/;
var INDENT_SPACE_SIZE = 4;
export var mapCurrentLine = function (element, mapper) {
    var cursor = new Cursor(element);
    var currentLine = cursor.getLine();
    var mappedLine = mapper(currentLine);
    cursor.spliceContent(Cursor.raw(templateObject_1 || (templateObject_1 = __makeTemplateObject(["", "", ""], ["", "", ""])), mappedLine, Cursor.$), { replaceCount: 1 });
};
/**
 * Wraps the current selection in markup within the current line
 * or removes markup if target is already wrapped (with useUnwrapping = true)
 */
export var singleLineWrapper = function (_a) {
    var element = _a.element, markup = _a.markup, _b = _a.useUnwrapping, useUnwrapping = _b === void 0 ? true : _b, _c = _a.placeholder, placeholder = _c === void 0 ? "" : _c;
    var cursor = new Cursor(element);
    var position = cursor.getCurrentPosition();
    var selected = cursor.getSelected().split("\n")[0];
    var currentLine = cursor.getLine();
    if (!selected) {
        var before_1 = currentLine.slice(0, position.lineSelectionStart);
        var after_1 = currentLine.slice(position.lineSelectionStart);
        var raw_1 = Cursor.raw(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""])), before_1, markup, Cursor.$, placeholder, Cursor.$, markup, after_1);
        cursor.spliceContent(raw_1, { replaceCount: 1 });
        return;
    }
    var clumpLine = function (value) { return clamp(value, 0, currentLine.length); };
    var start = position.lineSelectionStart;
    var end = position.lineSelectionEnd;
    var needUnwrap = useUnwrapping && currentLine && isTargetAlreadyWrapped(element, markup);
    var before = currentLine.slice(0, clumpLine(start + (needUnwrap ? -markup.length : 0)));
    var after = currentLine.slice(clumpLine(end + (needUnwrap ? markup.length : 0)));
    var onDemandMarkup = needUnwrap ? "" : markup;
    var content = selected || placeholder;
    var raw = Cursor.raw(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", "", "", "", "", "", "", ""], ["", "", "", "", "", "", "", ""])), before, onDemandMarkup, Cursor.$, content, Cursor.$, onDemandMarkup, after);
    cursor.spliceContent(raw, { replaceCount: 1 });
};
export var linkCommandHandler = function (ctx) {
    // Create a cursor instance it will be the our
    // core-service for manipulations with textarea
    var cursor = new Cursor(ctx.element);
    // Getting range of selection for current line
    var _a = cursor.getCurrentPosition(), lineSelectionStart = _a.lineSelectionStart, lineSelectionEnd = _a.lineSelectionEnd;
    // Getting the current line
    var currentLine = cursor.getLine();
    // Getting the current selected text
    var selected = currentLine.slice(lineSelectionStart, lineSelectionEnd);
    // Slice text before and after selection
    var after = currentLine.slice(0, lineSelectionStart);
    var before = currentLine.slice(lineSelectionEnd);
    var linkPlaceholder = "example";
    var urlPlaceholder = "url";
    var linkText = selected || linkPlaceholder;
    // Now we can build text for current line. in this tagged bellow template just a
    // bunch of concatenated strings except "Cursor.$" - it is a special marker for
    // showing selection range declarative, in this case we want to select the "linkText"
    var raw = Cursor.raw(templateObject_4 || (templateObject_4 = __makeTemplateObject(["", "[", "", "", "](", ")", ""], ["", "[", "", "", "](", ")", ""])), before, Cursor.$, linkText, Cursor.$, urlPlaceholder, after);
    // Finally we can make "spliceContent" - this function receive "raw" result and
    // options object, where you can specify start lineNumber and how many lines
    // you need to replace (similar to Array.prototype.splice mechanic)
    // in this case we need to start from current line (default) and replace 1 line
    // which means just replace the current line
    cursor.spliceContent(raw, { replaceCount: 1 });
    // -------------------------------------- PS ----------------------------------------
    // You can use one or two "Cursor.$". One will show the position of the cursor
    // with two you specify a selection range
    // ----------------------------------------------------------------------------------
};
/**
 * Checks if target is wrapped in markup
 */
var isTargetAlreadyWrapped = function (element, markup) {
    var cursor = new Cursor(element);
    var currentLine = cursor.getLine();
    var position = cursor.getCurrentPosition();
    var clumpLine = function (value) { return clamp(value, 0, currentLine.length); };
    var escapedMarkup = escapeRegExp(markup);
    var offsettedTarget = currentLine.slice(clumpLine(position.lineSelectionStart - markup.length), clumpLine(position.lineSelectionEnd + markup.length));
    var re = new RegExp(escapedMarkup + ".+" + escapedMarkup, "gi");
    return re.test(offsettedTarget);
};
export var nextLineCommandHandler = function (ctx) {
    var cursor = new Cursor(ctx.element);
    var insertListPrefixOnDemand = function () {
        var position = cursor.getCurrentPosition();
        var prevLine = cursor.getLine(position.lineNumber - 1) || "";
        var currentLine = cursor.getLine();
        var listMatch = ANY_LIST_RE.exec(prevLine);
        if (listMatch === null) {
            return;
        }
        var prefix = listMatch[2];
        var getNewLinePrefix = function () {
            var increaseOrder = function () {
                var splited = prefix.split(".");
                splited[splited.length - 2] = String(parseInt(splited[splited.length - 2]) + 1);
                return splited.join(".");
            };
            return (isNaN(parseFloat(prefix)) ? prefix : increaseOrder()).trimStart();
        };
        var indent = " ".repeat(cursor.getIndentSize(position.lineNumber - 1));
        var raw = Cursor.raw(templateObject_5 || (templateObject_5 = __makeTemplateObject(["", "", " ", "", ""], ["", "", " ", "", ""])), indent, getNewLinePrefix(), currentLine, Cursor.$);
        cursor.spliceContent(raw, {
            startLineNumber: position.lineNumber,
            replaceCount: 1,
        });
    };
    // waiting enter default behaver will be handled
    setTimeout(insertListPrefixOnDemand, 0);
};
export var indentCommandHandler = function (_a) {
    var element = _a.element, keyEvent = _a.keyEvent, options = _a.options;
    var cursor = new Cursor(element);
    if (!options.useIndentTabulation) {
        return;
    }
    keyEvent === null || keyEvent === void 0 ? void 0 : keyEvent.preventDefault();
    var currentLine = cursor.getLine();
    var listMatch = ANY_BLANK_LIST_RE.exec(currentLine);
    var indent = " ".repeat(INDENT_SPACE_SIZE + cursor.getIndentSize());
    if (options.useIndentListPrefixTabulation && listMatch) {
        var prefix = listMatch[2];
        var newPrefix = !isNaN(parseFloat(prefix)) && prefix.split(".").length <= 2 ? prefix + "1." : prefix;
        cursor.spliceContent(Cursor.raw(templateObject_6 || (templateObject_6 = __makeTemplateObject(["", "", " ", ""], ["", "", " ", ""])), indent, newPrefix, Cursor.$), { replaceCount: 1 });
        return;
    }
    cursor.spliceContent(Cursor.raw(templateObject_7 || (templateObject_7 = __makeTemplateObject(["", "", "", ""], ["", "", "", ""])), currentLine, indent, Cursor.$), { replaceCount: 1 });
};
export var linkPasteCommandHandler = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var cursor, position, currentLine, isSelectedUrl, selected, isSelectedInLinkMarkup, pastedValue, before, after, raw;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cursor = new Cursor(ctx.element);
                position = cursor.getCurrentPosition();
                currentLine = cursor.getLine(position.lineNumber);
                isSelectedUrl = ANY_URL_RE.test(currentLine.slice(position.lineSelectionStart, position.lineSelectionEnd));
                selected = cursor.getSelected();
                isSelectedInLinkMarkup = (function () {
                    var before = currentLine.slice(0, position.lineSelectionStart);
                    var after = currentLine.slice(position.lineSelectionEnd);
                    return /\[.*\]\($/gi.test(before) && /^\)/gi.test(after);
                })();
                if (!selected || !ctx.options.useLinkMarkupOnSelectionPasteUrl || isSelectedInLinkMarkup || isSelectedUrl) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, getClipboardText().then(function (x) { return x === null || x === void 0 ? void 0 : x.trim(); })];
            case 1:
                pastedValue = _a.sent();
                if (!pastedValue || !ANY_URL_RE.test(pastedValue)) {
                    return [2 /*return*/];
                }
                before = currentLine.slice(0, position.lineSelectionStart);
                after = currentLine.slice(position.lineSelectionEnd);
                raw = Cursor.raw(templateObject_8 || (templateObject_8 = __makeTemplateObject(["", "[", "", "", "](", ")", ""], ["", "[", "", "", "](", ")", ""])), after, Cursor.$, selected, Cursor.$, pastedValue, before);
                cursor.spliceContent(raw, { replaceCount: 1 });
                return [2 /*return*/];
        }
    });
}); };
export var codeBlockCommandHandler = function (ctx) {
    var cursor = new Cursor(ctx.element);
    var position = cursor.getCurrentPosition();
    var selected = cursor.getSelected();
    var currentLine = cursor.getLine();
    var markup = "```";
    var isAlreadyWrapper = function () {
        var beforeLine = cursor.getLine(position.lineNumber - 1);
        var afterLine = cursor.getLine(position.lineNumberEnd + 1);
        return selected && beforeLine === markup && afterLine === markup;
    };
    if (isAlreadyWrapper()) {
        cursor.removeLines(position.lineNumber - 1, position.lineNumberEnd + 1);
        return;
    }
    var prefix = currentLine && !selected ? "\n" : "";
    var content = selected || "code block";
    var raw = Cursor.raw(templateObject_9 || (templateObject_9 = __makeTemplateObject(["", "", "\n", "", "", "\n", ""], ["", "", "\\n", "", "", "\\n", ""])), prefix, markup, Cursor.$, content, Cursor.$, markup);
    cursor.spliceContent(raw, {
        replaceCount: selected.split("\n").length,
        startLineNumber: position.lineNumber,
    });
};
export var codeSelectedCommandHandler = function (ctx) {
    var cursor = new Cursor(ctx.element);
    var selected = cursor.getSelected();
    if (selected === "") {
        codeInlineCommandHandler(ctx);
        return;
    }
    if (selected.includes("\n")) {
        codeBlockCommandHandler(ctx);
    }
    else {
        codeInlineCommandHandler(ctx);
    }
};
export var boldCommandHandler = function (ctx) {
    singleLineWrapper(__assign(__assign({}, ctx), { placeholder: "bold", markup: ctx.options.boldSyntax }));
};
export var italicCommandHandler = function (ctx) {
    singleLineWrapper(__assign(__assign({}, ctx), { placeholder: "italic", markup: ctx.options.italicSyntax }));
};
export var createHeadlineCommandHandler = function (level) { return function (ctx) {
    var prefix = "#".repeat(clamp(level, 1, 6)) + " ";
    mapCurrentLine(ctx.element, function (line) { return prefix + line.replace(/^#{0,6}\s+/g, ""); });
}; };
export var orderedListCommandHandler = function (ctx) {
    mapCurrentLine(ctx.element, function (line) { return "1. " + line; });
};
export var unorderedListCommandHandler = function (ctx) {
    mapCurrentLine(ctx.element, function (line) { return ctx.options.unorderedListSyntax + " " + line; });
};
export var blockQuotesCommandHandler = function (ctx) {
    mapCurrentLine(ctx.element, function (line) { return "> " + line; });
};
export var codeInlineCommandHandler = function (ctx) {
    singleLineWrapper(__assign(__assign({}, ctx), { placeholder: "code", markup: "`" }));
};
export var strikeThroughCommandHandler = function (ctx) {
    singleLineWrapper(__assign(__assign({}, ctx), { placeholder: "strike-through", markup: "~~" }));
};
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7, templateObject_8, templateObject_9;
