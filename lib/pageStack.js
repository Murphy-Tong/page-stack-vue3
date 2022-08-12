import { cloneVNode, queuePostFlushCb } from 'vue';

class PageNode {
  node;
  next;
  pre;
  tag;
  state;

  updateState(state) {
    state.curNode = this.tag;
    this.state = state;
  }

  constructor(node, tag) {
    this.node = node || null;
    this.tag = tag || null;
    this.next = null;
    this.pre = null;
    this.state = null;
  }

}

function same(n1, n2) {
  if (n1 === n2) {
    return true;
  }

  return n1.type === n2.type;
}

export default class PageStack {
  idGen = new Date().valueOf();
  pageList = new PageNode();
  lastDisplayPage = null;
  mergeQueryToProps = false;
  router;
  lifecycleCallback;

  constructor(lifecycleCallback, router, mergeQueryToProps = false) {
    this.lifecycleCallback = lifecycleCallback || null;
    this.router = router || null;
    this.mergeQueryToProps = mergeQueryToProps;
  }

  getLastPageNode(subPage) {
    let tail = subPage || this.pageList;

    while (tail.next) {
      tail = tail.next;
    }

    return tail;
  }

  findPageNode(tag) {
    let cur = this.pageList.next;

    while (cur && cur.tag !== tag) {
      cur = cur.next;
    }

    return cur;
  }

  createPage(node, state) {
    const tag = String(this.idGen++);
    const pn = new PageNode(cloneVNode(node, {
      key: node.props?.key?.toString() + tag
    }), tag);
    const lp = this.getLastPageNode();
    lp.next = pn;
    pn.pre = lp;
    state.curNode = tag;
    pn.state = state;
    this.lifecycleCallback?.onCreate?.(pn.node);
    return pn;
  }

  copyKeyProps(page, newNode) {
    return cloneVNode(newNode, {
      key: page.node.key
    });
  }

  iterPage(start, callback, reverse = false) {
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

  destoryPage(fromPage, ctx) {
    if (!fromPage || fromPage === this.pageList) {
      return;
    }

    this.iterPage(fromPage, p => {
      if (p.node) {
        this.lifecycleCallback?.beforeDestory?.(p.node);
        ctx.destory(p.node);
        this.lifecycleCallback?.onDestory?.(p.node);
      }
    }, true);

    if (!fromPage.pre) {
      return;
    }

    fromPage.pre.next = null;
  }

  destoryPageAsync(ctx, page) {
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

      str += `${p.node ? p.node.key : ''}`;
    });
    console.log(str);
  }

  updateVNode(oldNode, newNode) {
    this.iterPage(null, function (p) {
      if (p.node === oldNode) {
        p.node = newNode;
      }
    });
  }

  removeNode(page) {
    if (!page) {
      return page;
    }

    if (page.pre) {
      page.pre.next = null;
    }

    page.pre = null;
    return page;
  }

  evaluate(node, ctx) {
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

  setRouteProps(node) {
    const query = this.router?.currentRoute.value.query;

    if (!this.mergeQueryToProps || !query) {
      return node;
    }

    return cloneVNode(node, { ...query
    });
  }

  _evaluate(n, ctx) {
    if (!ctx.cacheable(n)) {
      return n;
    }

    const node = this.setRouteProps(n);
    const state = history.state;

    if (!state || typeof state !== 'object' || !Reflect.has(state, 'position')) {
      return n;
    }

    if (this.lastDisplayPage && this.lastDisplayPage.state) {
      const {
        position: targetPosition,
        curNode
      } = state; //4

      const {
        position: curPosition
      } = this.lastDisplayPage.state; //6

      if (targetPosition > curPosition) {
        if (this.lastDisplayPage) {
          this.lifecycleCallback?.onPause?.(this.lastDisplayPage.node);
        }

        const pn = this.createPage(node, state);
        this.lastDisplayPage = pn;
        ctx.cacheNode(pn.node);
        return pn.node;
      }

      const oldPage = this.findPageNode(curNode);

      if (targetPosition < curPosition && oldPage && oldPage.node && same(oldPage.node, node)) {
        const oldNode = oldPage.node;
        oldPage.node = ctx.reuseNode(this.copyKeyProps(oldPage, node), oldPage.node);

        if (oldPage.node) {
          const dp = this.removeNode(oldPage.next);
          this.destoryPageAsync(ctx, dp);
          this.lastDisplayPage = oldPage;
          oldPage.updateState(state);
          this.lifecycleCallback?.onResume?.(oldPage.node);
          return oldPage.node;
        }

        oldPage.node = oldNode;
      }

      if (targetPosition === curPosition) {
        // replace
        const oldPage = this.findPageNode(this.lastDisplayPage.tag);

        if (oldPage && oldPage.node && same(oldPage.node, node)) {
          const oldNode = oldPage.node;
          oldPage.node = ctx.reuseNode(this.copyKeyProps(oldPage, node), oldPage.node);

          if (oldPage.node) {
            const dp = this.removeNode(oldPage.next);
            this.destoryPageAsync(ctx, dp);
            oldPage.updateState(state);
            this.lastDisplayPage = oldPage;
            this.lifecycleCallback?.onResume?.(oldPage.node);
            return oldPage.node;
          }

          oldPage.node = oldNode;
          const dp = this.removeNode(oldPage);
          this.destoryPageAsync(ctx, dp);
          this.lastDisplayPage = this.createPage(node, state);
          this.lastDisplayPage.node = ctx.cacheNode(this.lastDisplayPage.node);
          return this.lastDisplayPage.node;
        }

        this.destoryPageAsync(ctx, this.removeNode(this.lastDisplayPage));
        this.lastDisplayPage = this.createPage(node, state);
        ctx.cacheNode(this.lastDisplayPage.node);
        return this.lastDisplayPage.node;
      }
    }

    const destoryPage = this.removeNode(this.pageList.next);
    this.destoryPageAsync(ctx, destoryPage);
    this.pageList.next = this.createPage(node, state);
    ctx.cacheNode(this.pageList.next.node);
    this.lastDisplayPage = this.pageList.next;
    return this.lastDisplayPage.node;
  }

  reset(ctx) {
    this.lastDisplayPage = null;
    this.destoryPage(this.pageList, ctx);
  }

}