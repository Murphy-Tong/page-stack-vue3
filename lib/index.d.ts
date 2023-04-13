import { PropType } from "vue";
import { Router } from "vue-router";
import { ComponentEvaluator } from "./componentCache";
import "./index.css";
import { LifecycleCallback } from "./pageStackEvaluator";
export * from "./componentCache";
export * from "./pageStackEvaluator";
declare const _default: import("vue").DefineComponent<{
    debug: {
        type: BooleanConstructor;
        default: boolean;
    };
    lifeCycleCallback: {
        type: PropType<LifecycleCallback>;
        require: boolean;
    };
    router: {
        type: PropType<Router>;
        require: boolean;
    };
    mergeQueryToProps: {
        type: BooleanConstructor;
        default: boolean;
    };
    disableAnimation: {
        type: BooleanConstructor;
        default: boolean;
    };
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        require: boolean;
    };
    beforePause: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onPause: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onResume: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    beforeResume: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    saveStatus: {
        type: BooleanConstructor;
        default: boolean;
    };
}, () => JSX.Element, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    debug: {
        type: BooleanConstructor;
        default: boolean;
    };
    lifeCycleCallback: {
        type: PropType<LifecycleCallback>;
        require: boolean;
    };
    router: {
        type: PropType<Router>;
        require: boolean;
    };
    mergeQueryToProps: {
        type: BooleanConstructor;
        default: boolean;
    };
    disableAnimation: {
        type: BooleanConstructor;
        default: boolean;
    };
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        require: boolean;
    };
    beforePause: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onPause: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onResume: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    beforeResume: {
        type: PropType<import("./componentCache").VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    saveStatus: {
        type: BooleanConstructor;
        default: boolean;
    };
}>>, {
    saveStatus: boolean;
    debug: boolean;
    mergeQueryToProps: boolean;
    disableAnimation: boolean;
}>;
export default _default;
