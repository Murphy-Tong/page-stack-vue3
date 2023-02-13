import { PropType } from "vue";
import { Router } from "vue-router";
import { LifecycleCallback } from "./pageStack";
import "./index.css";
export * from "./componentCache";
export * from "./pageStack";
declare const _default: import("vue").DefineComponent<{
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
    mergeQueryToProps: boolean;
    disableAnimation: boolean;
}>;
export default _default;
