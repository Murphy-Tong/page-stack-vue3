"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const vue_1 = require("vue");
const componentCache_1 = tslib_1.__importStar(require("./componentCache"));
const pageStack_1 = tslib_1.__importDefault(require("./pageStack"));
exports.default = (0, vue_1.defineComponent)({
    props: {
        ...componentCache_1.Props,
        componentEvaluator: {
            type: Object,
            default: null,
        },
        lifeCycleCallback: {
            type: Object,
            require: false,
        },
        router: {
            type: Object,
            require: false,
        },
        mergeQueryToProps: {
            type: Boolean,
            default: false,
        },
    },
    setup(props, ctx) {
        const evaluator = props.componentEvaluator ||
            new pageStack_1.default(props.lifeCycleCallback, props.router, props.mergeQueryToProps);
        return function () {
            return (<componentCache_1.default componentEvaluator={evaluator}>
          {function (...args) {
                    return ctx.slots.default?.(...(args || []))?.[0];
                }}
        </componentCache_1.default>);
        };
    },
});
