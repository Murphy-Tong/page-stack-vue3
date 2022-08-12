import { VNode } from 'vue';
import { Router } from 'vue-router';
import { CacheContext, ComponentEvaluator } from './componentCache';
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
    updateState(state: State): void;
    constructor(node?: VNode, tag?: string);
}
export interface LifecycleCallback {
    onCreate(node: VNode): void;
    onPause(node: VNode): void;
    onResume(node: VNode): void;
    beforeDestory(node: VNode): void;
    onDestory(node: VNode): void;
}
export default class PageStack implements ComponentEvaluator {
    private idGen;
    private pageList;
    private lastDisplayPage;
    private mergeQueryToProps;
    router: Router | null;
    lifecycleCallback: LifecycleCallback | null;
    constructor(lifecycleCallback?: LifecycleCallback, router?: Router, mergeQueryToProps?: boolean);
    getLastPageNode(subPage?: PageNode): PageNode;
    findPageNode(tag: string): PageNode;
    createPage(node: VNode, state: any): PageNode;
    copyKeyProps(page: PageNode, newNode: VNode): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    iterPage(start: PageNode | null, callback: (page: PageNode) => void, reverse?: boolean): void;
    destoryPage(fromPage: PageNode | null, ctx: CacheContext): void;
    destoryPageAsync(ctx: CacheContext, page?: PageNode): void;
    debugPageStack(): void;
    updateVNode(oldNode: VNode, newNode: VNode): void;
    removeNode(page?: PageNode): PageNode;
    evaluate(node: VNode, ctx: CacheContext): VNode | null;
    setRouteProps(node: VNode): VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
    _evaluate(n: VNode, ctx: CacheContext): VNode | null;
    reset(ctx: CacheContext): void;
}
export {};
