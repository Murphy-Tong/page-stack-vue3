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
export declare type VNodeCacheStateChangeCallback = (node: VNode) => void;
export declare const Props: {
    beforePause: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onPause: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onResume: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    beforeResume: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    saveStatus: {
        type: BooleanConstructor;
        default: boolean;
    };
};
declare const _default: import("vue").DefineComponent<{
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        default: () => ComponentEvaluator;
    };
    beforePause: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onPause: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onResume: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    beforeResume: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    saveStatus: {
        type: BooleanConstructor;
        default: boolean;
    };
}, () => VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNodeNormalizedChildren, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    componentEvaluator: {
        type: PropType<ComponentEvaluator>;
        default: () => ComponentEvaluator;
    };
    beforePause: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onPause: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    onResume: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    beforeResume: {
        type: PropType<VNodeCacheStateChangeCallback>;
        require: boolean;
    };
    saveStatus: {
        type: BooleanConstructor;
        default: boolean;
    };
}>>, {
    componentEvaluator: ComponentEvaluator;
    saveStatus: boolean;
}>;
export default _default;
