"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ComponentCache = exports.Props = exports.invokeArrayFns = void 0;

const vue_1 = require("vue");

const FLAG_NEED_KEEP_ALIVE = 1 << 8;
const FLAG_KEPT_ALIVE = 1 << 9;
const KEY_EL_STATUS = "___ps_s_s";

function saveStatus(node) {
  var _a, _b;

  const el = node.el;

  if (!el || el.nodeType !== 1) {
    return;
  }

  el.___$__PS_st = (_a = document.scrollingElement) === null || _a === void 0 ? void 0 : _a.scrollTop;
  el.___$__PS_sl = (_b = document.scrollingElement) === null || _b === void 0 ? void 0 : _b.scrollLeft;
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

  if (document.scrollingElement && (el.___$__PS_sl || el.___$__PS_st)) {
    document.scrollingElement.scrollLeft = el.___$__PS_sl || 0;
    document.scrollingElement.scrollTop = el.___$__PS_st || 0;
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
    //@ts-ignore
    el[key] = val;
  });
}

const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};

exports.invokeArrayFns = invokeArrayFns;
exports.Props = {
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
  }
};

function cacheableNode(node) {
  if (!node) {
    return false;
  }

  if (!(node === null || node === void 0 ? void 0 : node.type)) {
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

exports.ComponentCache = (0, vue_1.defineComponent)({
  __isKeepAlive: true,
  props: Object.assign(Object.assign({}, exports.Props), {
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
  }),

  setup(props, ctx) {
    const beforeDeactive = function (node) {
      if (props.beforePause) {
        props.beforePause(node);
      }

      if (props.saveStatus) {
        saveStatus(node);
      }
    };

    const afterDeactive = function (node) {
      if (props.onPause) {
        props.onPause(node);
      }
    };

    const beforeReactive = function (node) {
      if (props.beforeResume) {
        props.beforeResume(node);
      }
    };

    const afterReactive = function (node) {
      if (props.saveStatus) {
        restoreStatus(node);
      }

      if (props.onResume) {
        props.onResume(node);
      }
    };

    const instance = (0, vue_1.getCurrentInstance)();

    if (!instance) {
      throw new Error("getCurrentInstance return null");
    }

    const {
      suspense: parentSuspense,
      proxy: instanceProxy
    } = instance;
    const renderer = instanceProxy === null || instanceProxy === void 0 ? void 0 : instanceProxy.renderer;
    const {
      p: patch,
      m: move,
      um: _unmount,
      o: {
        createElement
      }
    } = renderer;

    if (!instanceProxy) {
      throw new Error("getCurrentInstance().proxy return null");
    }

    const storageContainer = createElement("div");

    const vnodeActive = function (vnode, container, anchor, isSVG, optimized) {
      const instance = vnode.component;
      beforeReactive(vnode);
      move(vnode, container, anchor, 0, parentSuspense);
      (0, vue_1.queuePostFlushCb)(() => {
        instance.isDeactivated = false;
        const activeFn = instance.a;

        if (activeFn) {
          (0, exports.invokeArrayFns)(activeFn);
        }

        const vnodeHook = vnode.props && vnode.props.onVnodeMounted;

        if (vnodeHook) {
          (0, vue_1.callWithAsyncErrorHandling)(vnodeHook, instance.parent, 7, [vnode, null]);
        }
      });
      (0, vue_1.queuePostFlushCb)(function () {
        afterReactive(vnode);
      }); // in case props have changed

      patch(instance.vnode, vnode, container, anchor, instance, parentSuspense, isSVG, vnode.slotScopeIds, optimized);
    };

    const vnodeDeactive = function (vnode) {
      const instance = vnode.component;
      beforeDeactive(vnode);
      move(vnode, storageContainer, null, 1, parentSuspense);
      (0, vue_1.queuePostFlushCb)(() => {
        const deactiveFn = instance.da;

        if (deactiveFn) {
          (0, exports.invokeArrayFns)(deactiveFn);
        }

        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;

        if (vnodeHook) {
          (0, vue_1.callWithAsyncErrorHandling)(vnodeHook, instance.parent, 7, [vnode, null]);
        }

        instance.isDeactivated = true;
      });
      afterDeactive(vnode); // console.log('vnodeDeactive', vnode);
    };

    instanceProxy.activate = vnodeActive;
    instanceProxy.deactivate = vnodeDeactive;

    const uncacheNode = function (node) {
      node.shapeFlag &= ~FLAG_KEPT_ALIVE;
      node.shapeFlag &= ~FLAG_NEED_KEEP_ALIVE;
    };

    const destory = function (node) {
      uncacheNode(node);

      _unmount(node, instance, parentSuspense, true);
    };

    const cacheNode = function (node) {
      node.shapeFlag |= FLAG_NEED_KEEP_ALIVE;
      return node;
    };

    const reuseNode = function (node, reuseNode) {
      if (!reuseNode.component) {
        return null;
      }

      const retNode = node;
      retNode.el = reuseNode.el;
      retNode.component = reuseNode.component;
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
    (0, vue_1.onUnmounted)(function () {
      props.componentEvaluator.reset(cacheContext);
    });
    return function () {
      var _a, _b, _c, _d;

      const evaluator = props.componentEvaluator;
      let newComponent = evaluator.onRenderVNode((_a = ctx.slots) === null || _a === void 0 ? void 0 : _a.default);

      if (!newComponent) {
        return newComponent;
      } // other type is: function or object


      const originChild = newComponent;
      let shouldOrvewriteChild = false;

      if ((_b = newComponent.type.displayName) === null || _b === void 0 ? void 0 : _b.includes("Transition")) {
        // is a transation
        // child slot
        const tarnsitionChildSlots = newComponent.children;

        if (!tarnsitionChildSlots) {
          return tarnsitionChildSlots;
        }

        if ((0, vue_1.isVNode)(tarnsitionChildSlots)) {
          // just vnode
          newComponent = tarnsitionChildSlots;
          shouldOrvewriteChild = true;
        } else if (Array.isArray(tarnsitionChildSlots)) {
          // array child not support
          throw new Error("cannot has array child");
        } else if (typeof tarnsitionChildSlots === "object") {
          // slot child
          newComponent = ((_d = (_c = tarnsitionChildSlots).default) === null || _d === void 0 ? void 0 : _d.call(_c)[0]) || null;
          shouldOrvewriteChild = true;

          if (!newComponent) {
            return originChild;
          }
        } else {
          // others like string , null
          return originChild;
        }
      }

      let displayComponent = evaluator.evaluate(newComponent, cacheContext);

      if (!displayComponent) {
        return displayComponent;
      }

      if (shouldOrvewriteChild && originChild) {
        const userVNode = displayComponent;
        const child = (0, vue_1.cloneVNode)(displayComponent, {
          onVnodeBeforeMount(vnode) {
            var _a, _b;

            evaluator.updateVNode(userVNode, vnode);
            const ctx = (_b = (_a = vnode === null || vnode === void 0 ? void 0 : vnode.component) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.ctx;

            if (ctx) {
              if (!ctx.deactivate) {
                ctx.deactivate = vnodeDeactive;
              }

              if (!ctx.activate) {
                ctx.activate = vnodeActive;
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