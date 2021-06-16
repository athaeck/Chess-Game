"use strict";
// / <reference path="DebugTarget.ts"/>
/// <reference path="DebugInterfaces.ts"/>
/// <reference path="DebugConsole.ts"/>
var FudgeCore;
(function (FudgeCore) {
    /**
     * The Debug-Class offers functions known from the console-object and additions,
     * routing the information to various [[DebugTargets]] that can be easily defined by the developers and registerd by users
     * Override functions in subclasses of [[DebugTarget]] and register them as their delegates
     */
    class Debug {
        // TODO: create filter DEBUG_FILTER.FUDGE solely for messages from FUDGE
        /**
         * De- / Activate a filter for the given DebugTarget.
         */
        static setFilter(_target, _filter) {
            for (let filter in Debug.delegates)
                Debug.delegates[filter].delete(_target);
            for (let filter in FudgeCore.DEBUG_FILTER) {
                let parsed = parseInt(filter);
                if (isNaN(parsed))
                    break;
                if ([FudgeCore.DEBUG_FILTER.MESSAGES, FudgeCore.DEBUG_FILTER.FORMAT, FudgeCore.DEBUG_FILTER.ALL].indexOf(parsed) != -1)
                    // dont delegate combos... 
                    continue;
                if (_filter & parsed)
                    Debug.delegates[parsed].set(_target, _target.delegates[parsed]);
            }
        }
        /**
         * Info(...) displays additional information with low priority
         */
        static info(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.INFO, _message, _args);
        }
        /**
         * Displays information with medium priority
         */
        static log(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.LOG, _message, _args);
        }
        /**
         * Displays information about non-conformities in usage, which is emphasized e.g. by color
         */
        static warn(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.WARN, _message, _args);
        }
        /**
         * Displays critical information about failures, which is emphasized e.g. by color
         */
        static error(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.ERROR, _message, _args);
        }
        /**
         * Displays messages from FUDGE
         */
        static fudge(_message, ..._args) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.FUDGE, _message, _args);
        }
        /**
         * Clears the output and removes previous messages if possible
         */
        static clear() {
            Debug.delegate(FudgeCore.DEBUG_FILTER.CLEAR, null, null);
        }
        /**
         * Opens a new group for messages
         */
        static group(_name) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.GROUP, _name, null);
        }
        /**
         * Opens a new group for messages that is collapsed at first
         */
        static groupCollapsed(_name) {
            Debug.delegate(FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED, _name, null);
        }
        /**
         * Closes the youngest group
         */
        static groupEnd() {
            Debug.delegate(FudgeCore.DEBUG_FILTER.GROUPEND, null, null);
        }
        /**
         * Log a branch of the node hierarchy
         */
        static branch(_branch) {
            if (_branch.nChildren > 0)
                Debug.group(_branch.name);
            else
                Debug.fudge(_branch.name);
            for (let child of _branch.getChildren())
                Debug.branch(child);
            if (_branch.nChildren > 0)
                Debug.groupEnd();
        }
        /**
         * Lookup all delegates registered to the filter and call them using the given arguments
         */
        static delegate(_filter, _message, _args) {
            let delegates = Debug.delegates[_filter];
            for (let delegate of delegates.values())
                if (delegate)
                    if (_args && _args.length > 0)
                        delegate(_message, ..._args);
                    else
                        delegate(_message);
        }
        /**
         * setup routing to standard console
         */
        static setupConsole() {
            let result = {};
            let filters = [
                FudgeCore.DEBUG_FILTER.INFO, FudgeCore.DEBUG_FILTER.LOG, FudgeCore.DEBUG_FILTER.WARN, FudgeCore.DEBUG_FILTER.ERROR, FudgeCore.DEBUG_FILTER.FUDGE,
                FudgeCore.DEBUG_FILTER.CLEAR, FudgeCore.DEBUG_FILTER.GROUP, FudgeCore.DEBUG_FILTER.GROUPCOLLAPSED, FudgeCore.DEBUG_FILTER.GROUPEND
            ];
            for (let filter of filters)
                result[filter] = new Map([[FudgeCore.DebugConsole, FudgeCore.DebugConsole.delegates[filter]]]);
            return result;
        }
    }
    /**
     * For each set filter, this associative array keeps references to the registered delegate functions of the chosen [[DebugTargets]]
     */
    Debug.delegates = Debug.setupConsole();
    FudgeCore.Debug = Debug;
})(FudgeCore || (FudgeCore = {}));
//# sourceMappingURL=Debug.js.map