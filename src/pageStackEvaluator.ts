import { cloneVNode, queuePostFlushCb, Ref, Slot, VNode } from "vue";
import { RouteLocationNormalized, Router } from "vue-router";
import { CacheContext, ComponentEvaluator } from "./componentCache";

export type RouteAction = "init" | "forword" | "back" | "replace" | "unknown";

export type RenderSlotProps = { action: RouteAction };
interface State {
  position: number;
  curNode: string | null;
}

class PageNode {
  node: VNode | null;
  next: PageNode | null;
  pre: PageNode | null;
  tag: string | null;
  state: State | null;
  lifeState: keyof LifecycleCallback | null;
  lifecycleCallback: LifecycleCallback | null;

  moveTo(life: keyof LifecycleCallback, async = false) {
    if (!life || this.lifeState === life || !this.node) {
      return;
    }
    this.lifeState = life;
    if (!this.lifecycleCallback) {
      return;
    }
    const { node, lifecycleCallback } = this;
    if (async) {
      queuePostFlushCb(() => {
        lifecycleCallback[life]?.(node);
      });
    } else {
      lifecycleCallback[life]?.(node);
    }
  }

  updateState(state: State) {
    state.curNode = this.tag;
    this.state = state;
  }

  constructor(
    node?: VNode,
    lifecycleCallback?: LifecycleCallback,
    tag?: string
  ) {
    this.node = node || null;
    this.tag = tag || null;
    this.lifecycleCallback = lifecycleCallback || null;
    this.next = null;
    this.pre = null;
    this.state = null;
    this.lifeState = null;
  }
}

function same(n1?: VNode | null, n2?: VNode | null) {
  if (n1 === n2) {
    return true;
  }
  return n1?.type === n2?.type;
}

export interface LifecycleCallback {
  onCreate?(node: VNode): void;
  onPause?(node: VNode): void;
  onResume?(node: VNode): void;
  beforeDestory?(node: VNode): void;
  onDestory?(node: VNode): void;
}

export class PageStackEvaluator implements ComponentEvaluator {
  protected idGen = new Date().valueOf();
  protected pageList = new PageNode();
  protected lastDisplayPage: PageNode | null = null;
  protected mergeQueryToProps = false;
  private routerChanged = false;
  public router: Router;
  public lifecycleCallback: LifecycleCallback | null;
  protected depthRef: Ref<number>;

  debug = false;

  constructor(
    router: Router,
    depthRef: Ref<number>,
    mergeQueryToProps = false,
    lifecycleCallback: LifecycleCallback | undefined
  ) {
    this.depthRef = depthRef;
    this.lifecycleCallback = lifecycleCallback || null;
    this.router = router;
    this.mergeQueryToProps = mergeQueryToProps;
    this.setListener();
  }

  protected setListener() {
    if (this.router) {
      this.router.beforeEach(
        (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
          const rootRouterViewDepth = Math.max(
            this.depthRef?.value || 1 - 1,
            0
          );
          if (to.matched[rootRouterViewDepth + 1]) {
            const toFirstMatched = to.matched[rootRouterViewDepth];
            const fromFirstMatched = from.matched[rootRouterViewDepth];
            this.setRouterChanged(
              toFirstMatched !== fromFirstMatched || !toFirstMatched
            );
          } else {
            this.setRouterChanged(true);
          }
        }
      );
    } else {
      console.warn("传入router以便组件判断页面跳转");
    }
  }

  isRouterChanged() {
    if (!this.router) {
      return true;
    }
    return this.routerChanged;
  }

  setRouterChanged(routerChanged: boolean) {
    this.routerChanged = routerChanged;
  }

  protected getLastPageNode(subPage?: PageNode) {
    let tail = subPage || this.pageList;
    while (tail.next) {
      tail = tail.next;
    }
    return tail;
  }

  protected findPageNode(tag: string) {
    let cur = this.pageList.next;
    while (cur && cur.tag !== tag) {
      cur = cur.next;
    }
    return cur;
  }

  protected createPage(node: VNode, state: State, link = true) {
    const tag = String(this.idGen++);
    const pn = new PageNode(
      cloneVNode(node, {
        key:
          node.props?.key && typeof node.props?.key === "string"
            ? `${node.props?.key}-${tag}`
            : tag,
      }),
      this.lifecycleCallback || undefined,
      tag
    );

    if (link) {
      const lp = this.getLastPageNode();
      lp.next = pn;
      pn.pre = lp;
    }

    state.curNode = tag;

    pn.state = state;
    pn.moveTo("onCreate");
    pn.moveTo("onResume", true);
    return pn;
  }

  protected copyKeyProps(page: PageNode, newNode: VNode) {
    return cloneVNode(newNode, { key: page.node!.key as string });
  }

  protected iterPage(
    start: PageNode | null,
    callback: (page: PageNode) => void,
    reverse = false
  ) {
    let cur = start || this.pageList.next;
    if (!cur) {
      return;
    }
    if (reverse) {
      cur = this.getLastPageNode(cur);
      while (cur && cur !== this.pageList) {
        callback(cur);
        cur = cur.pre;
      }
      return;
    }
    while (cur) {
      callback(cur);
      cur = cur.next;
    }
  }

  protected destoryPage(fromPage: PageNode | null, ctx: CacheContext) {
    if (!fromPage || fromPage === this.pageList) {
      return;
    }
    this.iterPage(
      fromPage,
      (p) => {
        if (p.node) {
          p.moveTo("beforeDestory");
          ctx.destory(p.node);
          p.moveTo("onDestory");
        }
      },
      true
    );

    if (!fromPage.pre) {
      return;
    }
    fromPage.pre.next = null;
  }

  protected destoryPageAsync(ctx: CacheContext, page?: PageNode) {
    if (!page) {
      return;
    }
    queuePostFlushCb(() => {
      this.destoryPage(page, ctx);
    });
  }

  private debugPageStack(msg: string) {
    if (!this.debug) {
      return;
    }
    let str = "";
    this.iterPage(this.pageList.next, function (p) {
      if (str) {
        str += " | ";
      }
      str += `${p.node ? `${p.node.key as string}-${p.lifeState}` : ""}`;
    });
    console.log(msg, str);
  }

  updateVNode(oldNode: VNode, newNode: VNode): void {
    this.iterPage(null, function (p) {
      if (p.node === oldNode) {
        p.node = newNode;
      }
    });
  }

  public size() {
    let count = 0;
    this.iterPage(null, function () {
      count++;
    });
    return count;
  }

  protected removeNode(page?: PageNode) {
    if (!page) {
      return page;
    }
    if (page.pre) {
      page.pre.next = null;
    }
    page.pre = null;
    return page;
  }

  evaluate(node: VNode, ctx: CacheContext): VNode | null {
    if (this.debug) {
      console.log("-----------------");
    }
    this.debugPageStack("页面切换前 routerChanged : " + this.isRouterChanged());
    const n = this._evaluate(node, ctx);
    this.debugPageStack("页面切换后 routerChanged: " + this.isRouterChanged());
    setTimeout(() => {
      this.debugPageStack("页面切换并渲染后");
      if (this.debug) {
        console.log("-----------------");
      }
    }, 0);
    return n;
  }

  protected setRouteProps(node: VNode) {
    const query = this.router?.currentRoute.value.query;
    if (!this.mergeQueryToProps || !query) {
      return node;
    }
    return cloneVNode(node, { ...query });
  }

  public getAction(): RouteAction {
    const state = history.state;
    if (
      !state ||
      typeof state !== "object" ||
      !Reflect.has(state, "position")
    ) {
      return "unknown";
    }

    if (!this.lastDisplayPage) {
      return "init";
    }

    if (!this.lastDisplayPage.state) {
      return "unknown";
    }

    const { position: targetPosition } = state;
    const { position: curPosition } = this.lastDisplayPage.state;
    if (targetPosition > curPosition) {
      return "forword";
    }
    if (targetPosition < curPosition) {
      return "back";
    }
    return "replace";
  }

  onRenderVNode(slot: Slot) {
    const action = this.getAction();
    return slot({ action })?.[0];
  }

  protected onForward(newNode: VNode, state: any, ctx: CacheContext) {
    this.lastDisplayPage!.moveTo("onPause");
    const pn = this.createPage(newNode, state);
    this.lastDisplayPage = pn;
    ctx.cacheNode(pn.node!);
    return pn.node!;
  }

  protected onUpdateWithRouterNoChange(
    newNode: VNode,
    state: any,
    ctx: CacheContext
  ) {
    // 当前显示的页面
    const oldPage = this.findPageNode(this.lastDisplayPage!.tag!);
    if (!oldPage?.node || !same(newNode, oldPage?.node)) {
      return this.onUnknown(newNode, state, ctx);
    }
    const oldNode = oldPage.node;
    oldPage.node = ctx.reuseNode(
      this.copyKeyProps(oldPage, newNode),
      oldPage.node
    );
    if (oldPage.node) {
      return oldPage.node!;
    }
    // 返回失败
    oldPage.node = oldNode;
    return this.onUpdateWithRouterNoChangeFailed(newNode, state, ctx);
  }

  protected onUpdateWithRouterNoChangeFailed(
    newNode: VNode,
    state: any,
    ctx: CacheContext
  ) {
    return this.onUnknown(newNode, state, ctx);
  }

  private _evaluate(n: VNode, ctx: CacheContext): VNode | null {
    if (!ctx.cacheable(n)) {
      return n;
    }
    const state = history.state;
    if (
      !state ||
      typeof state !== "object" ||
      !Reflect.has(state, "position")
    ) {
      return n;
    }
    const node = this.setRouteProps(n);
    if (!this.lastDisplayPage) {
      this.setRouterChanged(false);
      return this.onInitPage(node, state, ctx);
    }
    if (!this.isRouterChanged()) {
      return this.onUpdateWithRouterNoChange(node, state, ctx);
    }
    this.setRouterChanged(false);
    const action = this.getAction();
    if (action === "init") {
      return this.onInitPage(node, state, ctx);
    }
    if (this.lastDisplayPage && this.lastDisplayPage.state) {
      if (action === "forword") {
        return this.onForward(node, state, ctx);
      }
      if (action === "back") {
        return this.onBack(node, state, ctx);
      }
      if (action === "replace") {
        return this.onReplace(node, state, ctx);
      }
    }
    // unknown 清除掉所有缓存的数据
    return this.onUnknown(node, state, ctx);
  }

  /**
   * 回退，旧页面可以复用。可以复用的条件是node的类型相同，不比较key
   */
  protected onBack(newNode: VNode, state: any, ctx: CacheContext) {
    const { curNode } = state;
    // 找到返回的页面
    const oldPage = this.findPageNode(curNode);
    // 可以复用的条件是node的类型相同，不比较key
    if (oldPage && oldPage.node && same(oldPage.node, newNode)) {
      const oldNode = oldPage.node;
      oldPage.node = ctx.reuseNode(
        this.copyKeyProps(oldPage, newNode),
        oldPage.node
      );
      if (oldPage.node) {
        // 销毁新页面之后的页面
        const dp = this.removeNode(oldPage.next!);
        this.destoryPageAsync(ctx, dp!);
        this.lastDisplayPage = oldPage;
        oldPage.updateState(state);
        oldPage.moveTo("onResume", true);
        return oldPage.node!;
      }
      // 返回失败
      oldPage.node = oldNode;
    }
    return this.onBackFailed(newNode, state, ctx);
  }

  protected onBackFailed(newNode: VNode, state: any, ctx: CacheContext) {
    return this.onUnknown(newNode, state, ctx);
  }

  protected onReplace(newNode: VNode, state: any, ctx: CacheContext) {
    // 当前显示的页面
    const oldPage = this.findPageNode(this.lastDisplayPage!.tag!);
    // 从链表中断开
    const dp = this.removeNode(oldPage || this.lastDisplayPage!);
    // 销毁当前页面以及之后的页面
    this.destoryPageAsync(ctx, dp || this.lastDisplayPage!);
    // 创建新的页面节点
    this.lastDisplayPage = this.createPage(newNode, state);
    ctx.cacheNode(this.lastDisplayPage.node!);
    return this.lastDisplayPage.node!;
  }

  protected onUnknown(node: VNode, state: any, ctx: CacheContext) {
    // 销毁所有的页面
    const destoryPage = this.removeNode(this.pageList.next!);
    this.destoryPageAsync(ctx, destoryPage!);
    // 创建新的
    this.pageList.next = this.createPage(node, state);
    ctx.cacheNode(this.pageList.next.node!);
    this.lastDisplayPage = this.pageList.next;
    return this.lastDisplayPage.node!;
  }

  protected onInitPage(node: VNode, state: any, ctx: CacheContext) {
    return this.onUnknown(node, state, ctx);
  }

  reset(ctx: CacheContext): void {
    this.onReset(ctx);
    this.lastDisplayPage = null;
    this.destoryPage(this.pageList, ctx);
  }

  protected onReset(ctx: CacheContext) {}
}
