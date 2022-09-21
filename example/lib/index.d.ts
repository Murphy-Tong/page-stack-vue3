import { PropType } from "vue";
import { Router } from "vue-router";
import { ComponentEvaluator } from "./componentCache";
import { LifecycleCallback } from "./pageStack";
export type { ComponentEvaluator } from "./componentCache";
export type { LifecycleCallback } from "./pageStack";
declare const _default: import("vue").DefineComponent<{
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        default: any;
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
    beforePause: {
        type: FunctionConstructor;
        require: boolean;
    };
    onPause: {
        type: FunctionConstructor;
        require: boolean;
    };
    onResume: {
        type: FunctionConstructor;
        require: boolean;
    };
    beforeResume: {
        type: FunctionConstructor;
        require: boolean;
    };
    saveStatus: {
        type: BooleanConstructor;
        default: boolean;
    };
}, () => JSX.Element, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        default: any;
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
    beforePause: {
        type: FunctionConstructor;
        require: boolean;
    };
    onPause: {
        type: FunctionConstructor;
        require: boolean;
    };
    onResume: {
        type: FunctionConstructor;
        require: boolean;
    };
    beforeResume: {
        type: FunctionConstructor;
        require: boolean;
    };
    saveStatus: {
        type: BooleanConstructor;
        default: boolean;
    };
}>>, {
    saveStatus: boolean;
    componentEvaluator: ComponentEvaluator;
    mergeQueryToProps: boolean;
}>;
export default _default;
