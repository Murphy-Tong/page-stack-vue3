import { cloneVNode, queuePostFlushCb, Slot, VNode } from 'vue';
import { Router } from 'vue-router';
import { CacheContext, ComponentEvaluator } from './componentCache';

export type RouteAction = 'init' | 'forword' | 'back' | 'replace' | 'unknown'
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

  updateState(state: State) {
    state.curNode = this.tag;
    this.state = state;
  }

  constructor(node?: VNode, tag?: string) {
    this.node = node || null;
    this.tag = tag || null;
    this.next = null;
    this.pre = null;
    this.state = null;
  }
}

function same(n1: VNode, n2: VNode) {
  if (n1 === n2) {
    return true;
  }
  return n1.type === n2.type;
}

export interface LifecycleCallback {
  onCreate?(node: VNode): void;
  onPause?(node: VNode): void;
  onResume?(node: VNode): void;
  beforeDestory?(node: VNode): void;
  onDestory?(node: VNode): void;
}

export default class PageStack implements ComponentEvaluator {
  private idGen = new Date().valueOf();
  private pageList = new PageNode();
  private lastDisplayPage: PageNode | null = null;
  private mergeQueryToProps = false;

  public router: Router | null;

  public lifecycleCallback: LifecycleCallback | null;

  constructor(lifecycleCallback?: LifecycleCallback, router?: Router, mergeQueryToProps = false) {
    this.lifecycleCallback = lifecycleCallback || null;
    this.router = router || null;
    this.mergeQueryToProps = mergeQueryToProps;
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
    const pn = new PageNode(cloneVNode(node, { key: node.props?.key?.toString() + tag }), tag);

    if (link) {
      const lp = this.getLastPageNode();
      lp.next = pn;
      pn.pre = lp;
    }

    state.curNode = tag;

    pn.state = state;
    this.lifecycleCallback?.onCreate?.(pn.node!);
    return pn;
  }

  protected copyKeyProps(page: PageNode, newNode: VNode) {
    return cloneVNode(newNode, { key: page.node!.key as string });
  }

  protected iterPage(start: PageNode | null, callback: (page: PageNode) => void, reverse = false) {
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
          this.lifecycleCallback?.beforeDestory?.(p.node);
          ctx.destory(p.node);
          this.lifecycleCallback?.onDestory?.(p.node);
        }
      },
      true,
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
    let str = '';
    this.iterPage(this.pageList.next, function (p) {
      if (str) {
        str += ' | ';
      }
      str += `${p.node ? (p.node.key as string) : ''}`;
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
    this.debugPageStack('before');
    const n = this._evaluate(node, ctx);
    this.debugPageStack('after evaluate');
    setTimeout(() => {
      this.debugPageStack('post evaluate');
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
    if (!state || typeof state !== 'object' || !Reflect.has(state, 'position')) {
      return 'unknown'
    }

    if (!this.lastDisplayPage) {
      return 'init'
    }

    if (!this.lastDisplayPage.state) {
      return 'unknown'
    }

    const { position: targetPosition } = state; //4
    const { position: curPosition } = this.lastDisplayPage.state; //6
    if (targetPosition > curPosition) {
      return 'forword'
    }
    if (targetPosition < curPosition) {
      return 'back'
    }
    return 'replace'
  }

  onRenderVNode(slot: Slot) {
    const action = this.getAction()
    return slot({ action })?.[0]
  }

  private _evaluate(n: VNode, ctx: CacheContext): VNode | null {
    if (!ctx.cacheable(n)) {
      return n;
    }
    const node = this.setRouteProps(n);
    const state = history.state;
    if (!state || typeof state !== 'object' || !Reflect.has(state, 'position')) {
      return n;
    }

    const action = this.getAction()
    if (this.lastDisplayPage && this.lastDisplayPage.state) {
      const { curNode } = state;

      if (action === 'forword') {
        if (this.lastDisplayPage) {
          this.lifecycleCallback?.onPause?.(this.lastDisplayPage.node!);
        }
        const pn = this.createPage(node, state);
        this.lastDisplayPage = pn;
        ctx.cacheNode(pn.node!);
        return pn.node!;
      }

      const oldPage = this.findPageNode(curNode);
      if (action === 'back' && oldPage && oldPage.node && same(oldPage.node, node)) {
        const oldNode = oldPage.node;
        oldPage.node = ctx.reuseNode(this.copyKeyProps(oldPage, node), oldPage.node);
        if (oldPage.node) {
          const dp = this.removeNode(oldPage.next!);
          this.destoryPageAsync(ctx, dp!);
          this.lastDisplayPage = oldPage;
          oldPage.updateState(state);
          this.lifecycleCallback?.onResume?.(oldPage.node!);
          return oldPage.node!;
        }
        oldPage.node = oldNode;
      }

      if (action === 'replace') {
        // replace
        const oldPage = this.findPageNode(this.lastDisplayPage.tag!);
        if (oldPage && oldPage.node && same(oldPage.node, node)) {
          const oldNode = oldPage.node;
          oldPage.node = ctx.reuseNode(this.copyKeyProps(oldPage, node), oldPage.node);
          if (oldPage.node) {
            const dp = this.removeNode(oldPage.next!);
            this.destoryPageAsync(ctx, dp!);
            oldPage.updateState(state);
            this.lastDisplayPage = oldPage;
            this.lifecycleCallback?.onResume?.(oldPage.node!);
            return oldPage.node;
          }
          oldPage.node = oldNode;
          const dp = this.removeNode(oldPage);
          this.destoryPageAsync(ctx, dp);
          this.lastDisplayPage = this.createPage(node, state);
          this.lastDisplayPage.node = ctx.cacheNode(this.lastDisplayPage.node!);
          return this.lastDisplayPage.node;
        }

        this.destoryPageAsync(ctx, this.removeNode(this.lastDisplayPage));
        this.lastDisplayPage = this.createPage(node, state);
        ctx.cacheNode(this.lastDisplayPage.node!);
        return this.lastDisplayPage.node!;
      }
    }

    // unknown
    const destoryPage = this.removeNode(this.pageList.next!);
    this.destoryPageAsync(ctx, destoryPage!);
    this.pageList.next = this.createPage(node, state);
    ctx.cacheNode(this.pageList.next.node!);
    this.lastDisplayPage = this.pageList.next;
    return this.lastDisplayPage.node!;
  }

  reset(ctx: CacheContext): void {
    this.onReset(ctx)
    this.lastDisplayPage = null;
    this.destoryPage(this.pageList, ctx);
  }

  public onReset(ctx: CacheContext) { }
}
