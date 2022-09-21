import { VNode, PropType, Slot } from "vue";
export declare const invokeArrayFns: (fns: Function[], arg?: any) => void;
export interface CacheContext {
    cacheable: (node: VNode) => boolean;
    cacheNode: (node: VNode) => VNode | null;
    reuseNode: (newNode: VNode, resuseNode: VNode) => VNode | null;
    uncacheNode: (node: VNode) => void;
    destory: (node: VNode) => void;
}
export interface ComponentEvaluator {
    evaluate(currentNode: VNode, ctx: CacheContext): VNode | null;
    reset(ctx: CacheContext): void;
    updateVNode(oldNode: VNode, newNode: VNode): void;
    onRenderVNode(slot: Slot): VNode | null;
}
export declare const Props: {
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
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        default: () => ComponentEvaluator;
    };
};
declare const _default: import("vue").DefineComponent<{
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
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        default: () => ComponentEvaluator;
    };
}, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNodeNormalizedChildren, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, import("vue").EmitsOptions, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
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
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        default: () => ComponentEvaluator;
    };
}>>, {
    saveStatus: boolean;
    componentEvaluator: ComponentEvaluator;
}>;
export default _default;
