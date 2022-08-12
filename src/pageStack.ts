import { cloneVNode, queuePostFlushCb, VNode } from 'vue';
import { Router } from 'vue-router';
import { CacheContext, ComponentEvaluator } from './componentCache';

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
  onCreate(node: VNode): void;
  onPause(node: VNode): void;
  onResume(node: VNode): void;
  beforeDestory(node: VNode): void;
  onDestory(node: VNode): void;
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

  getLastPageNode(subPage?: PageNode) {
    let tail = subPage || this.pageList;
    while (tail.next) {
      tail = tail.next;
    }
    return tail;
  }

  findPageNode(tag: string) {
    let cur = this.pageList.next;
    while (cur && cur.tag !== tag) {
      cur = cur.next;
    }
    return cur;
  }

  createPage(node: VNode, state: any) {
    const tag = String(this.idGen++);
    const pn = new PageNode(cloneVNode(node, { key: node.props?.key?.toString() + tag }), tag);

    const lp = this.getLastPageNode();
    lp.next = pn;
    pn.pre = lp;

    state.curNode = tag;

    pn.state = state;
    this.lifecycleCallback?.onCreate?.(pn.node!);
    return pn;
  }

  copyKeyProps(page: PageNode, newNode: VNode) {
    return cloneVNode(newNode, { key: page.node!.key as string });
  }

  iterPage(start: PageNode | null, callback: (page: PageNode) => void, reverse = false) {
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

  destoryPage(fromPage: PageNode | null, ctx: CacheContext) {
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

  destoryPageAsync(ctx: CacheContext, page?: PageNode) {
    if (!page) {
      return;
    }
    queuePostFlushCb(() => {
      this.destoryPage(page, ctx);
    });
  }

  debugPageStack() {
    let str = '';
    this.iterPage(this.pageList.next, function (p) {
      if (str) {
        str += ' | ';
      }
      str += `${p.node ? (p.node.key as string) : ''}`;
    });
    console.log(str);
  }

  updateVNode(oldNode: VNode, newNode: VNode): void {
    this.iterPage(null, function (p) {
      if (p.node === oldNode) {
        p.node = newNode;
      }
    });
  }

  removeNode(page?: PageNode) {
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
    console.log('-before-');
    this.debugPageStack();
    const n = this._evaluate(node, ctx);
    console.log('-after-');
    this.debugPageStack();
    setTimeout(() => {
      console.log('-post-');
      this.debugPageStack();
    }, 0);
    return n;
  }

  setRouteProps(node: VNode) {
    const query = this.router?.currentRoute.value.query;
    if (!this.mergeQueryToProps || !query) {
      return node;
    }
    return cloneVNode(node, { ...query });
  }

  _evaluate(n: VNode, ctx: CacheContext): VNode | null {
    if (!ctx.cacheable(n)) {
      return n;
    }
    const node = this.setRouteProps(n);
    const state = history.state;
    if (!state || typeof state !== 'object' || !Reflect.has(state, 'position')) {
      return n;
    }

    if (this.lastDisplayPage && this.lastDisplayPage.state) {
      const { position: targetPosition, curNode } = state; //4
      const { position: curPosition } = this.lastDisplayPage.state; //6

      if (targetPosition > curPosition) {
        if (this.lastDisplayPage) {
          this.lifecycleCallback?.onPause?.(this.lastDisplayPage.node!);
        }
        const pn = this.createPage(node, state);
        this.lastDisplayPage = pn;
        ctx.cacheNode(pn.node!);
        return pn.node!;
      }

      const oldPage = this.findPageNode(curNode);
      if (targetPosition < curPosition && oldPage && oldPage.node && same(oldPage.node, node)) {
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

      if (targetPosition === curPosition) {
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

    const destoryPage = this.removeNode(this.pageList.next!);
    this.destoryPageAsync(ctx, destoryPage!);
    this.pageList.next = this.createPage(node, state);
    ctx.cacheNode(this.pageList.next.node!);
    this.lastDisplayPage = this.pageList.next;
    return this.lastDisplayPage.node!;
  }

  reset(ctx: CacheContext): void {
    this.lastDisplayPage = null;
    this.destoryPage(this.pageList, ctx);
  }
}
