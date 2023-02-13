import { Slot, VNode } from 'vue';
import { Router } from 'vue-router';
import { CacheContext, ComponentEvaluator } from './componentCache';
export declare type RouteAction = 'init' | 'forword' | 'back' | 'replace' | 'unknown';
export declare type RenderSlotProps = {
    action: RouteAction;
};
interface State {
    position: number;
    curNode: string | null;
}
declare class PageNode {
    node: VNode | null;
    next: PageNode | null;
    pre: PageNode | null;
    tag: string | null;
    state: State | null;
    lifeState: keyof LifecycleCallback | null;
    lifecycleCallback: LifecycleCallback | null;
    moveTo(life: keyof LifecycleCallback, async?: boolean): void;
    updateState(state: State): void;
    constructor(node?: VNode, lifecycleCallback?: LifecycleCallback, tag?: string);
}
export interface LifecycleCallback {
    onCreate?(node: VNode): void;
    onPause?(node: VNode): void;
    onResume?(node: VNode): void;
    beforeDestory?(node: VNode): void;
    onDestory?(node: VNode): void;
}
export default class PageStack implements ComponentEvaluator {
    private idGen;
    private pageList;
    private lastDisplayPage;
    private mergeQueryToProps;
    router: Router | null;
    lifecycleCallback: LifecycleCallback | null;
    constructor(lifecycleCallback?: LifecycleCallback, router?: Router, mergeQueryToProps?: boolean);
    protected getLastPageNode(subPage?: PageNode): PageNode;
    protected findPageNode(tag: string): PageNode;
    protected createPage(node: VNode, state: State, link?: boolean): PageNode;
    protected copyKeyProps(page: PageNode, newNode: VNode): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    protected iterPage(start: PageNode | null, callback: (page: PageNode) => void, reverse?: boolean): void;
    protected destoryPage(fromPage: PageNode | null, ctx: CacheContext): void;
    protected destoryPageAsync(ctx: CacheContext, page?: PageNode): void;
    private debugPageStack;
    updateVNode(oldNode: VNode, newNode: VNode): void;
    size(): number;
    protected removeNode(page?: PageNode): PageNode;
    evaluate(node: VNode, ctx: CacheContext): VNode | null;
    protected setRouteProps(node: VNode): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    getAction(): RouteAction;
    onRenderVNode(slot: Slot): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    private _evaluate;
    reset(ctx: CacheContext): void;
    onReset(ctx: CacheContext): void;
}
export {};
