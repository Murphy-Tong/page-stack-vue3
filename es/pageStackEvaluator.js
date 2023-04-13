import { cloneVNode, queuePostFlushCb } from "vue";

class PageNode {
  constructor(node, lifecycleCallback, tag) {
    this.node = node || null;
    this.tag = tag || null;
    this.lifecycleCallback = lifecycleCallback || null;
    this.next = null;
    this.pre = null;
    this.state = null;
    this.lifeState = null;
  }

  moveTo(life, async = false) {
    var _a;

    if (!life || this.lifeState === life || !this.node) {
      return;
    }

    this.lifeState = life;

    if (!this.lifecycleCallback) {
      return;
    }

    const {
      node,
      lifecycleCallback
    } = this;

    if (async) {
      queuePostFlushCb(() => {
        var _a;

        (_a = lifecycleCallback[life]) === null || _a === void 0 ? void 0 : _a.call(lifecycleCallback, node);
      });
    } else {
      (_a = lifecycleCallback[life]) === null || _a === void 0 ? void 0 : _a.call(lifecycleCallback, node);
    }
  }

  updateState(state) {
    state.curNode = this.tag;
    this.state = state;
  }

}

function same(n1, n2) {
  if (n1 === n2) {
    return true;
  }

  return (n1 === null || n1 === void 0 ? void 0 : n1.type) === (n2 === null || n2 === void 0 ? void 0 : n2.type);
}

export class PageStackEvaluator {
  constructor(router, mergeQueryToProps = false, lifecycleCallback) {
    this.idGen = new Date().valueOf();
    this.pageList = new PageNode();
    this.lastDisplayPage = null;
    this.mergeQueryToProps = false;
    this.routerChanged = false;
    this.debug = false;
    this.lifecycleCallback = lifecycleCallback || null;
    this.router = router;
    this.mergeQueryToProps = mergeQueryToProps;
    this.setListener();
  }

  setListener() {
    if (this.router) {
      this.router.beforeEach(() => {
        this.setRouterChanged(true);
      });
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

  setRouterChanged(routerChanged) {
    this.routerChanged = routerChanged;
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

  createPage(node, state, link = true) {
    var _a, _b;

    const tag = String(this.idGen++);
    const pn = new PageNode(cloneVNode(node, {
      key: (((_b = (_a = node.props) === null || _a === void 0 ? void 0 : _a.key) === null || _b === void 0 ? void 0 : _b.toString()) || "") + tag
    }), this.lifecycleCallback || undefined, tag);

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
        p.moveTo("beforeDestory");
        ctx.destory(p.node);
        p.moveTo("onDestory");
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

  debugPageStack(msg) {
    if (!this.debug) {
      return;
    }

    let str = "";
    this.iterPage(this.pageList.next, function (p) {
      if (str) {
        str += " | ";
      }

      str += `${p.node ? `${p.node.key}-${p.lifeState}` : ""}`;
    });
    console.log(msg, str);
  }

  updateVNode(oldNode, newNode) {
    this.iterPage(null, function (p) {
      if (p.node === oldNode) {
        p.node = newNode;
      }
    });
  }

  size() {
    let count = 0;
    this.iterPage(null, function () {
      count++;
    });
    return count;
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

  setRouteProps(node) {
    var _a;

    const query = (_a = this.router) === null || _a === void 0 ? void 0 : _a.currentRoute.value.query;

    if (!this.mergeQueryToProps || !query) {
      return node;
    }

    return cloneVNode(node, Object.assign({}, query));
  }

  getAction() {
    const state = history.state;

    if (!state || typeof state !== "object" || !Reflect.has(state, "position")) {
      return "unknown";
    }

    if (!this.lastDisplayPage) {
      return "init";
    }

    if (!this.lastDisplayPage.state) {
      return "unknown";
    }

    const {
      position: targetPosition
    } = state;
    const {
      position: curPosition
    } = this.lastDisplayPage.state;

    if (targetPosition > curPosition) {
      return "forword";
    }

    if (targetPosition < curPosition) {
      return "back";
    }

    return "replace";
  }

  onRenderVNode(slot) {
    var _a;

    const action = this.getAction();
    return (_a = slot({
      action
    })) === null || _a === void 0 ? void 0 : _a[0];
  }

  onForward(newNode, state, ctx) {
    this.lastDisplayPage.moveTo("onPause");
    const pn = this.createPage(newNode, state);
    this.lastDisplayPage = pn;
    ctx.cacheNode(pn.node);
    return pn.node;
  }

  onUpdateWithRouterNoChange(newNode, state, ctx) {
    // 当前显示的页面
    const oldPage = this.findPageNode(this.lastDisplayPage.tag);

    if (!(oldPage === null || oldPage === void 0 ? void 0 : oldPage.node) || !same(newNode, oldPage === null || oldPage === void 0 ? void 0 : oldPage.node)) {
      return this.onUnknown(newNode, state, ctx);
    }

    const oldNode = oldPage.node;
    oldPage.node = ctx.reuseNode(this.copyKeyProps(oldPage, newNode), oldPage.node);

    if (oldPage.node) {
      return oldPage.node;
    } // 返回失败


    oldPage.node = oldNode;
    return this.onUpdateWithRouterNoChangeFailed(newNode, state, ctx);
  }

  onUpdateWithRouterNoChangeFailed(newNode, state, ctx) {
    return this.onUnknown(newNode, state, ctx);
  }

  _evaluate(n, ctx) {
    if (!ctx.cacheable(n)) {
      return n;
    }

    const state = history.state;

    if (!state || typeof state !== "object" || !Reflect.has(state, "position")) {
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
    } // unknown 清除掉所有缓存的数据


    return this.onUnknown(node, state, ctx);
  }
  /**
   * 回退，旧页面可以复用。可以复用的条件是node的类型相同，不比较key
   */


  onBack(newNode, state, ctx) {
    const {
      curNode
    } = state; // 找到返回的页面

    const oldPage = this.findPageNode(curNode); // 可以复用的条件是node的类型相同，不比较key

    if (oldPage && oldPage.node && same(oldPage.node, newNode)) {
      const oldNode = oldPage.node;
      oldPage.node = ctx.reuseNode(this.copyKeyProps(oldPage, newNode), oldPage.node);

      if (oldPage.node) {
        // 销毁新页面之后的页面
        const dp = this.removeNode(oldPage.next);
        this.destoryPageAsync(ctx, dp);
        this.lastDisplayPage = oldPage;
        oldPage.updateState(state);
        oldPage.moveTo("onResume", true);
        return oldPage.node;
      } // 返回失败


      oldPage.node = oldNode;
    }

    return this.onBackFailed(newNode, state, ctx);
  }

  onBackFailed(newNode, state, ctx) {
    return this.onUnknown(newNode, state, ctx);
  }

  onReplace(newNode, state, ctx) {
    // 当前显示的页面
    const oldPage = this.findPageNode(this.lastDisplayPage.tag); // 从链表中断开

    const dp = this.removeNode(oldPage || this.lastDisplayPage); // 销毁当前页面以及之后的页面

    this.destoryPageAsync(ctx, dp || this.lastDisplayPage); // 创建新的页面节点

    this.lastDisplayPage = this.createPage(newNode, state);
    ctx.cacheNode(this.lastDisplayPage.node);
    return this.lastDisplayPage.node;
  }

  onUnknown(node, state, ctx) {
    // 销毁所有的页面
    const destoryPage = this.removeNode(this.pageList.next);
    this.destoryPageAsync(ctx, destoryPage); // 创建新的

    this.pageList.next = this.createPage(node, state);
    ctx.cacheNode(this.pageList.next.node);
    this.lastDisplayPage = this.pageList.next;
    return this.lastDisplayPage.node;
  }

  onInitPage(node, state, ctx) {
    return this.onUnknown(node, state, ctx);
  }

  reset(ctx) {
    this.onReset(ctx);
    this.lastDisplayPage = null;
    this.destoryPage(this.pageList, ctx);
  }

  onReset(ctx) {}

}