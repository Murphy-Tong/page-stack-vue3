"use strict";

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;

var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
  enumerable: true,
  configurable: true,
  writable: true,
  value
}) : obj[key] = value;

var __spreadValues = (a, b) => {
  for (var prop in b || (b = {})) if (__hasOwnProp.call(b, prop)) __defNormalProp(a, prop, b[prop]);

  if (__getOwnPropSymbols) for (var prop of __getOwnPropSymbols(b)) {
    if (__propIsEnum.call(b, prop)) __defNormalProp(a, prop, b[prop]);
  }
  return a;
};

var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  return value;
};

import { cloneVNode, queuePostFlushCb } from "vue";

class PageNode {
  constructor(node, lifecycleCallback, tag) {
    __publicField(this, "node");

    __publicField(this, "next");

    __publicField(this, "pre");

    __publicField(this, "tag");

    __publicField(this, "state");

    __publicField(this, "lifeState");

    __publicField(this, "lifecycleCallback");

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

    if (!life || this.lifeState === life || !this.node || !this.lifecycleCallback) {
      return;
    }

    this.lifeState = life;
    const {
      node,
      lifecycleCallback
    } = this;

    if (async) {
      queuePostFlushCb(() => {
        var _a2;

        (_a2 = lifecycleCallback[life]) == null ? void 0 : _a2.call(lifecycleCallback, node);
      });
    } else {
      (_a = lifecycleCallback[life]) == null ? void 0 : _a.call(lifecycleCallback, node);
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

  return n1.type === n2.type;
}

export default class PageStack {
  constructor(lifecycleCallback, router, mergeQueryToProps = false) {
    __publicField(this, "idGen", new Date().valueOf());

    __publicField(this, "pageList", new PageNode());

    __publicField(this, "lastDisplayPage", null);

    __publicField(this, "mergeQueryToProps", false);

    __publicField(this, "router");

    __publicField(this, "lifecycleCallback");

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

  createPage(node, state, link = true) {
    var _a, _b;

    const tag = String(this.idGen++);
    const pn = new PageNode(cloneVNode(node, {
      key: (((_b = (_a = node.props) == null ? void 0 : _a.key) == null ? void 0 : _b.toString()) || "") + tag
    }), this.lifecycleCallback || void 0, tag);

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

  debugPageStack(msg) {}

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
    this.debugPageStack("before");

    const n = this._evaluate(node, ctx);

    this.debugPageStack("after evaluate");
    setTimeout(() => {
      this.debugPageStack("post evaluate");
    }, 0);
    return n;
  }

  setRouteProps(node) {
    var _a;

    const query = (_a = this.router) == null ? void 0 : _a.currentRoute.value.query;

    if (!this.mergeQueryToProps || !query) {
      return node;
    }

    return cloneVNode(node, __spreadValues({}, query));
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
    })) == null ? void 0 : _a[0];
  }

  _evaluate(n, ctx) {
    if (!ctx.cacheable(n)) {
      return n;
    }

    const node = this.setRouteProps(n);
    const state = history.state;

    if (!state || typeof state !== "object" || !Reflect.has(state, "position")) {
      return n;
    }

    const action = this.getAction();

    if (this.lastDisplayPage && this.lastDisplayPage.state) {
      const {
        curNode
      } = state;

      if (action === "forword") {
        this.lastDisplayPage.moveTo("onPause");
        const pn = this.createPage(node, state);
        this.lastDisplayPage = pn;
        ctx.cacheNode(pn.node);
        return pn.node;
      }

      const oldPage = this.findPageNode(curNode);

      if (action === "back" && oldPage && oldPage.node && same(oldPage.node, node)) {
        const oldNode = oldPage.node;
        oldPage.node = ctx.reuseNode(this.copyKeyProps(oldPage, node), oldPage.node);

        if (oldPage.node) {
          const dp = this.removeNode(oldPage.next);
          this.destoryPageAsync(ctx, dp);
          this.lastDisplayPage = oldPage;
          oldPage.updateState(state);
          oldPage.moveTo("onResume", true);
          return oldPage.node;
        }

        oldPage.node = oldNode;
      }

      if (action === "replace") {
        const oldPage2 = this.findPageNode(this.lastDisplayPage.tag);

        if (oldPage2 && oldPage2.node && same(oldPage2.node, node)) {
          const oldNode = oldPage2.node;
          oldPage2.node = ctx.reuseNode(this.copyKeyProps(oldPage2, node), oldPage2.node);

          if (oldPage2.node) {
            const dp2 = this.removeNode(oldPage2.next);
            this.destoryPageAsync(ctx, dp2);
            this.lastDisplayPage = oldPage2;
            oldPage2.updateState(state);
            oldPage2.moveTo("onResume", true);
            return oldPage2.node;
          }

          oldPage2.node = oldNode;
          const dp = this.removeNode(oldPage2);
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
    this.onReset(ctx);
    this.lastDisplayPage = null;
    this.destoryPage(this.pageList, ctx);
  }

  onReset(ctx) {}

}