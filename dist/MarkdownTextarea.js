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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
import * as reactTriggerChange from "react-trigger-change";
import { WELL_KNOWN_COMMANDS, defaultMarkdownTextareaOptions, isRefObject, } from "./types";
import Mousetrap from "mousetrap";
import React, { Fragment, forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { findLastIndex } from "./utils";
import { wellKnownCommands } from "./commands";
var CHILDREN_ERROR_MSG = "MarkdownTextarea: child element must be instance of HTMLTextAreaElement";
export var MarkdownTextarea = forwardRef(function (props, ref) {
    var userCommands = props.commands, userOptions = props.options, textareaProps = __rest(props, ["commands", "options"]);
    var textareaNodeRef = useRef(null);
    useBootstrap({
        props: props,
        ref: ref,
        textareaRef: textareaNodeRef,
    });
    return React.createElement("textarea", __assign({ ref: textareaNodeRef }, textareaProps));
});
MarkdownTextarea.Wrapper = forwardRef(function (props, ref) {
    var children = props.children;
    var textareaNodeRef = useRef();
    var domHolderElementRef = useRef(null);
    useEffect(function () {
        if (React.Children.count(children) !== 1) {
            throw new TypeError(CHILDREN_ERROR_MSG);
        }
        if (children && domHolderElementRef.current && !textareaNodeRef.current) {
            var node = domHolderElementRef.current.previousSibling;
            if (node instanceof HTMLTextAreaElement) {
                textareaNodeRef.current = node;
            }
            else {
                throw new TypeError(CHILDREN_ERROR_MSG);
            }
            domHolderElementRef.current.remove();
        }
    }, [children]);
    useBootstrap({
        props: props,
        ref: ref,
        textareaRef: textareaNodeRef,
    });
    return (React.createElement(Fragment, null,
        children,
        React.createElement("div", { style: { display: "none" }, ref: domHolderElementRef })));
});
var useBootstrap = function (_a) {
    var props = _a.props, ref = _a.ref, textareaRef = _a.textareaRef;
    var userCommands = props.commands, userOptions = props.options;
    var markdownTextareaRef = ref;
    var commands = useMemo(function () { return getCommandsList(userCommands !== null && userCommands !== void 0 ? userCommands : []); }, [userCommands]);
    var options = useMemo(function () { return Object.assign({}, defaultMarkdownTextareaOptions, userOptions); }, [userOptions]);
    var trigger = useCallback(function (name, _a) {
        var _b = _a.__internal, element = _b.element, keyEvent = _b.keyEvent;
        return __awaiter(void 0, void 0, void 0, function () {
            var index, command, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        index = findLastIndex(commands, function (c) { return c.name === name; });
                        if (!element)
                            return [2 /*return*/];
                        if (index === -1) {
                            throw new TypeError("Command with name \"" + name + "\" is not defined");
                        }
                        command = commands[index];
                        if (command.enable === false) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, command.handler({ element: element, keyEvent: keyEvent, options: options })];
                    case 1:
                        result = _c.sent();
                        if (result) {
                            element.value = result;
                            reactTriggerChange(element);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }, [commands, options]);
    var refTrigger = useCallback(function (command) { return trigger(command, { __internal: { element: textareaRef.current } }); }, [
        textareaRef,
        trigger,
    ]);
    useEffect(function () {
        if (isRefObject(markdownTextareaRef) && textareaRef.current) {
            markdownTextareaRef.current = Object.assign(textareaRef.current, {
                trigger: refTrigger,
            });
        }
    }, [textareaRef, markdownTextareaRef, refTrigger]);
    var mtInstanceRef = useRef();
    useEffect(function () {
        var _a;
        if (!textareaRef.current)
            return;
        (_a = mtInstanceRef.current) === null || _a === void 0 ? void 0 : _a.reset();
        mtInstanceRef.current = Mousetrap(textareaRef.current);
        commands.forEach(function (command) {
            var _a;
            if (command.shortcut) {
                (_a = mtInstanceRef.current) === null || _a === void 0 ? void 0 : _a.bind(command.shortcut, function (keyEvent) {
                    if (command.shortcutPreventDefault) {
                        keyEvent.preventDefault();
                    }
                    trigger(command.name, { __internal: { element: textareaRef.current, keyEvent: keyEvent } });
                });
            }
        });
        return function () {
            var _a;
            (_a = mtInstanceRef.current) === null || _a === void 0 ? void 0 : _a.reset();
            mtInstanceRef.current = undefined;
        };
    }, [commands, textareaRef, trigger]);
    return {
        commands: commands,
        options: options,
    };
};
var getCommandsList = function (userCommands) {
    var resultCommands = __spreadArrays(wellKnownCommands);
    userCommands === null || userCommands === void 0 ? void 0 : userCommands.forEach(function (command) {
        if (WELL_KNOWN_COMMANDS.includes(command.name)) {
            var commandIndex = wellKnownCommands.findIndex(function (x) { return x.name === command.name; });
            var overrides = {
                name: resultCommands[commandIndex].name,
                handler: resultCommands[commandIndex].handler,
                enable: command.enable,
                shortcut: command.shortcut,
            };
            resultCommands[commandIndex] = overrides;
        }
        else {
            if (!command.handler || !(command.handler instanceof Function)) {
                throw new TypeError("Custom command should have a handler function");
            }
            resultCommands.push(command);
        }
    });
    return resultCommands;
};
