"use strict";

import { cloneVNode, getCurrentInstance, isVNode, queuePostFlushCb, defineComponent, onUnmounted, callWithAsyncErrorHandling } from "vue";
const FLAG_NEED_KEEP_ALIVE = 1 << 8;
const FLAG_KEPT_ALIVE = 1 << 9;
const statusMap = /* @__PURE__ */new WeakMap();
const KEY_EL_STATUS = "___ps_s_s";

function saveStatus(node) {
  var _a, _b;

  const el = node.el;

  if (!el || el.nodeType !== 1) {
    return;
  }

  statusMap.set(el, {
    scrollTop: (_a = document.scrollingElement) == null ? void 0 : _a.scrollTop,
    scrollLeft: (_b = document.scrollingElement) == null ? void 0 : _b.scrollLeft
  });
  saveStatusEl(el);
}

function saveStatusEl(el) {
  if (!el || el.nodeType !== 1) {
    return;
  }

  const status = {
    scrollTop: el.scrollTop,
    scrollLeft: el.scrollLeft
  };
  el[KEY_EL_STATUS] = status;

  for (let i = 0; i < el.childElementCount; i++) {
    saveStatusEl(el.children[i]);
  }
}

function restoreStatus(node) {
  const el = node.el;

  if (!el || el.nodeType !== 1) {
    return;
  }

  restoreStatusEl(el);
  const status = statusMap.get(el);

  if (document.scrollingElement) {
    Object.entries(status || {}).forEach(([key, val]) => {
      document.scrollingElement[key] = val;
    });
  }
}

function restoreStatusEl(el) {
  if (!el || el.nodeType !== 1) {
    return;
  }

  for (let i = 0; i < el.childElementCount; i++) {
    restoreStatusEl(el.children[i]);
  }

  const status = el[KEY_EL_STATUS];

  if (!status) {
    return;
  }

  Object.entries(status).forEach(([key, val]) => {
    el[key] = val;
  });
}

function delStatus(node) {
  statusMap.delete(node.el);
}

export const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
export const Props = {
  beforePause: {
    type: Function,
    require: false
  },
  onPause: {
    type: Function,
    require: false
  },
  onResume: {
    type: Function,
    require: false
  },
  beforeResume: {
    type: Function,
    require: false
  },
  saveStatus: {
    type: Boolean,
    default: true
  },
  componentEvaluator: {
    type: Object,
    default: function () {
      return {
        evaluate(node) {
          return node;
        },

        reset() {},

        updateVNode() {},

        onRenderVNode(slot) {
          return slot()[0];
        }

      };
    }
  }
};

function cacheableNode(node) {
  if (!node) {
    return false;
  }

  if (!(node == null ? void 0 : node.type)) {
    return false;
  }

  if (typeof node.type === "string") {
    return false;
  }

  if (typeof node.type === "symbol") {
    return false;
  }

  return true;
}

export default defineComponent({
  __isKeepAlive: true,
  props: Props,

  setup(props, ctx) {
    const beforeDeactive = function (node) {
      if (props.beforePause) {
        props.beforePause(node.component, node);
      }

      if (props.saveStatus) {
        saveStatus(node);
      }
    };

    const afterDeactive = function (node) {
      if (props.onPause) {
        props.onPause(node.component, node);
      }
    };

    const beforeReactive = function (node) {
      if (props.beforeResume) {
        props.beforeResume(node.component, node);
      }
    };

    const afterReactive = function (node) {
      if (props.saveStatus) {
        restoreStatus(node);
      }

      if (props.onResume) {
        props.onResume(node.component, node);
      }
    };

    const instance = getCurrentInstance();

    if (!instance) {
      throw new Error();
    }

    const {
      suspense: parentSuspense,
      proxy: instanceProxy
    } = instance;
    const renderer = instanceProxy == null ? void 0 : instanceProxy.renderer;
    const {
      p: patch,
      m: move,
      um: _unmount,
      o: {
        createElement
      }
    } = renderer;

    if (!instanceProxy) {
      throw new Error();
    }

    const storageContainer = createElement("div");

    const vnodeActive = function (vnode, container, anchor, isSVG, optimized) {
      const instance2 = vnode.component;
      beforeReactive(vnode);
      move(vnode, container, anchor, 0, parentSuspense);
      queuePostFlushCb(() => {
        instance2.isDeactivated = false;
        const activeFn = instance2.a;

        if (activeFn) {
          invokeArrayFns(activeFn);
        }

        const vnodeHook = vnode.props && vnode.props.onVnodeMounted;

        if (vnodeHook) {
          callWithAsyncErrorHandling(vnodeHook, instance2.parent, 7, [vnode, null]);
        }
      });
      queuePostFlushCb(function () {
        afterReactive(vnode);
      });
      patch(instance2.vnode, vnode, container, anchor, instance2, parentSuspense, isSVG, vnode.slotScopeIds, optimized);
    };

    const vnodeDeactive = function (vnode) {
      const instance2 = vnode.component;
      beforeDeactive(vnode);
      move(vnode, storageContainer, null, 1, parentSuspense);
      queuePostFlushCb(() => {
        const deactiveFn = instance2.da;

        if (deactiveFn) {
          invokeArrayFns(deactiveFn);
        }

        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;

        if (vnodeHook) {
          callWithAsyncErrorHandling(vnodeHook, instance2.parent, 7, [vnode, null]);
        }

        instance2.isDeactivated = true;
      });
      afterDeactive(vnode);
    };

    instanceProxy.activate = vnodeActive;
    instanceProxy.deactivate = vnodeDeactive;

    const uncacheNode = function (node) {
      node.shapeFlag &= ~FLAG_KEPT_ALIVE;
      node.shapeFlag &= ~FLAG_NEED_KEEP_ALIVE;
    };

    const destory = function (node) {
      delStatus(node);
      uncacheNode(node);

      _unmount(node, instance, parentSuspense, true);
    };

    const cacheNode = function (node) {
      node.shapeFlag |= FLAG_NEED_KEEP_ALIVE;
      return node;
    };

    const reuseNode = function (node, reuseNode2) {
      if (!reuseNode2.component) {
        return null;
      }

      const retNode = node;
      retNode.el = reuseNode2.el;
      retNode.component = reuseNode2.component;
      retNode.shapeFlag |= FLAG_KEPT_ALIVE;
      retNode.shapeFlag |= FLAG_NEED_KEEP_ALIVE;
      return retNode;
    };

    const cacheContext = {
      cacheNode,
      reuseNode,
      uncacheNode,
      cacheable: cacheableNode,
      destory
    };
    onUnmounted(function () {
      props.componentEvaluator.reset(cacheContext);
    });
    return function () {
      var _a, _b, _c;

      const evaluator = props.componentEvaluator;
      let newComponent = evaluator.onRenderVNode((_a = ctx.slots) == null ? void 0 : _a.default);

      if (!newComponent) {
        return newComponent;
      }

      const originChild = newComponent;
      let shouldOrvewriteChild = false;

      if ((_b = newComponent.type.name) == null ? void 0 : _b.includes("Transition")) {
        const tarnsitionChildSlots = newComponent.children;

        if (!tarnsitionChildSlots) {
          return tarnsitionChildSlots;
        }

        if (isVNode(tarnsitionChildSlots)) {
          newComponent = tarnsitionChildSlots;
          shouldOrvewriteChild = true;
        } else if (Array.isArray(tarnsitionChildSlots)) {
          throw new Error("cannot has array child");
        } else if (typeof tarnsitionChildSlots === "object") {
          newComponent = ((_c = tarnsitionChildSlots.default) == null ? void 0 : _c.call(tarnsitionChildSlots)[0]) || null;
          shouldOrvewriteChild = true;

          if (!newComponent) {
            return originChild;
          }
        } else {
          return originChild;
        }
      }

      let displayComponent = evaluator.evaluate(newComponent, cacheContext);

      if (!displayComponent) {
        return displayComponent;
      }

      if (shouldOrvewriteChild && originChild) {
        const userVNode = displayComponent;
        const child = cloneVNode(displayComponent, {
          onVnodeBeforeMount(vnode) {
            var _a2, _b2;

            evaluator.updateVNode(userVNode, vnode);
            const ctx2 = (_b2 = (_a2 = vnode == null ? void 0 : vnode.component) == null ? void 0 : _a2.parent) == null ? void 0 : _b2.ctx;

            if (ctx2) {
              if (!ctx2.deactivate) {
                ctx2.deactivate = vnodeDeactive;
              }

              if (!ctx2.activate) {
                ctx2.activate = vnodeActive;
              }
            }
          }

        });
        originChild.children = {
          default: () => child
        };
        originChild["__isKeepAlive"] = true;
        displayComponent = originChild;
        child.patchFlag |= userVNode.patchFlag;
        uncacheNode(userVNode);
        cacheNode(displayComponent);
      }

      return displayComponent;
    };
  }

});