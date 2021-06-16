"use strict";
// / <reference path="DebugTarget.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * Route to an HTMLTextArea, may be obsolete when using HTMLDialogElement
     */
    class DebugTextArea extends FudgeCore.DebugTarget {
        static clear() {
            DebugTextArea.textArea.textContent = "";
            DebugTextArea.groups = [];
        }
        static group(_name) {
            DebugTextArea.print("▼ " + _name);
            DebugTextArea.groups.push(_name);
        }
        static groupEnd() {
            DebugTextArea.groups.pop();
        }
        static createDelegate(_headline) {
            let delegate = function (_message, ..._args) {
                DebugTextArea.print(_headline + " " + FudgeCore.DebugTarget.mergeArguments(_message, _args));
            };
            return delegate;
        }
        static getIndentation(_level) {
            let result = "";
            for (let i = 0; i < _level; i++)
                result += "| ";
            return result;
        }
        static print(_text) {
            DebugTextArea.textArea.textContent += DebugTextArea.getIndentation(DebugTextArea.groups.length) + _text + "\n";
            if (DebugTextArea.autoScroll)
                DebugTextArea.textArea.scrollTop = DebugTextArea.textArea.scrollHeight;
        }
    }
    DebugTextArea.textArea = document.createElement("textarea");
    DebugTextArea.autoScroll = true;
    DebugTextArea.delegates = {
        [FudgeCore.DEBUG_FILTER.INFO]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.INFO]),
        [FudgeCore.DEBUG_FILTER.LOG]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.LOG]),
        [FudgeCore.DEBUG_FILTER.WARN]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.WARN]),
        [FudgeCore.DEBUG_FILTER.ERROR]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.ERROR]),
        [FudgeCore.DEBUG_FILTER.FUDGE]: DebugTextArea.createDelegate(FudgeCore.DEBUG_SYMBOL[FudgeCore.DEBUG_FILTER.FUDGE]),
        [FudgeCore.DEBUG_FILTER.CLEAR]: DebugTextArea.clear,
        [FudgeCore.DEBUG_FILTER.GROUP]: DebugTextArea.group,
        [FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED]: DebugTextArea.group,
        [FudgeCore.DEBUG_FILTER.GROUPEND]: DebugTextArea.groupEnd
    };
    DebugTextArea.groups = [];
    FudgeCore.DebugTextArea = DebugTextArea;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=DebugTextArea.js.map