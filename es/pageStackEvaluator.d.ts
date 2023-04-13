import { Ref, Slot, VNode } from "vue";
import { Router } from "vue-router";
import { CacheContext, ComponentEvaluator } from "./componentCache";
export declare type RouteAction = "init" | "forword" | "back" | "replace" | "unknown";
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
export declare class PageStackEvaluator implements ComponentEvaluator {
    protected idGen: number;
    protected pageList: PageNode;
    protected lastDisplayPage: PageNode | null;
    protected mergeQueryToProps: boolean;
    private routerChanged;
    router: Router;
    lifecycleCallback: LifecycleCallback | null;
    protected depthRef: Ref<number>;
    debug: boolean;
    constructor(router: Router, depthRef: Ref<number>, mergeQueryToProps: boolean, lifecycleCallback: LifecycleCallback | undefined);
    protected setListener(): void;
    isRouterChanged(): boolean;
    setRouterChanged(routerChanged: boolean): void;
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
    protected onForward(newNode: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    protected onUpdateWithRouterNoChange(newNode: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    protected onUpdateWithRouterNoChangeFailed(newNode: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    private _evaluate;
    /**
     * 回退，旧页面可以复用。可以复用的条件是node的类型相同，不比较key
     */
    protected onBack(newNode: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    protected onBackFailed(newNode: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    protected onReplace(newNode: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    protected onUnknown(node: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    protected onInitPage(node: VNode, state: any, ctx: CacheContext): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    reset(ctx: CacheContext): void;
    protected onReset(ctx: CacheContext): void;
}
export {};
