import {
  cloneVNode,
  Component,
  getCurrentInstance,
  isVNode,
  queuePostFlushCb,
  SetupContext,
  Slots,
  VNode,
  defineComponent,
  onUnmounted,
  callWithAsyncErrorHandling,
  PropType,
  Slot,
} from "vue";

const FLAG_NEED_KEEP_ALIVE = 1 << 8;
const FLAG_KEPT_ALIVE = 1 << 9;

const statusMap = new WeakMap<Object, any>();

const KEY_EL_STATUS = "___ps_s_s";

function saveStatus(node: VNode) {
  const el = node.el as Element;
  if (!el || el.nodeType !== 1) {
    return;
  }
  statusMap.set(el, {
    scrollTop: document.scrollingElement?.scrollTop,
    scrollLeft: document.scrollingElement?.scrollLeft,
  });
  saveStatusEl(el);
}

function saveStatusEl(el: Element) {
  if (!el || el.nodeType !== 1) {
    return;
  }
  const status = {
    scrollTop: el.scrollTop,
    scrollLeft: el.scrollLeft,
  };
  (el as any)[KEY_EL_STATUS] = status;
  for (let i = 0; i < el.childElementCount; i++) {
    saveStatusEl(el.children[i]);
  }
}

function restoreStatus(node: VNode) {
  const el = node.el as Element;
  if (!el || el.nodeType !== 1) {
    return;
  }
  restoreStatusEl(el);
  const status = statusMap.get(el);
  if (document.scrollingElement) {
    Object.entries(status || {}).forEach(([key, val]) => {
      //@ts-ignore
      document.scrollingElement[key] = val;
    });
  }
}

function restoreStatusEl(el: Element) {
  if (!el || el.nodeType !== 1) {
    return;
  }
  for (let i = 0; i < el.childElementCount; i++) {
    restoreStatusEl(el.children[i]);
  }
  const status = (el as any)[KEY_EL_STATUS];
  if (!status) {
    return;
  }
  Object.entries(status).forEach(([key, val]) => {
    //@ts-ignore
    el[key] = val;
  });
}

function delStatus(node: VNode) {
  statusMap.delete(node.el!);
}

export const invokeArrayFns = (fns: Function[], arg?: any) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};

export interface CacheContext {
  cacheable: (node: VNode) => boolean;
  cacheNode: (node: VNode) => VNode | null;
  reuseNode: (newNode: VNode, resuseNode: VNode) => VNode | null;
  uncacheNode: (node: VNode) => void;
  destory: (node: VNode) => void;
}

export interface ComponentEvaluator {
  evaluate(currentNode: VNode, ctx: CacheContext): VNode | null;
  reset(ctx: CacheContext): void;
  updateVNode(oldNode: VNode, newNode: VNode): void;
  onRenderVNode(slot: Slot): VNode | null;
}

export type VNodeCacheStateChangeCallback = (node: VNode) => void;

export const Props = {
  beforePause: {
    type: Function as PropType<VNodeCacheStateChangeCallback>,
    require: false,
  },
  onPause: {
    type: Function as PropType<VNodeCacheStateChangeCallback>,
    require: false,
  },
  onResume: {
    type: Function as PropType<VNodeCacheStateChangeCallback>,
    require: false,
  },
  beforeResume: {
    type: Function as PropType<VNodeCacheStateChangeCallback>,
    require: false,
  },
  saveStatus: {
    type: Boolean,
    default: true,
  },
};

function cacheableNode(node?: VNode) {
  if (!node) {
    return false;
  }
  if (!node?.type) {
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
  props: {
    ...Props,
    componentEvaluator: {
      type: Object as PropType<ComponentEvaluator>,
      default: function (): ComponentEvaluator {
        return {
          evaluate(node) {
            return node;
          },
          reset() {},
          updateVNode() {},
          onRenderVNode(slot) {
            return slot()[0];
          },
        };
      },
    },
  },
  setup(props: any, ctx: SetupContext) {
    const beforeDeactive = function (node: VNode) {
      if (props.beforePause) {
        props.beforePause(node);
      }
      if (props.saveStatus) {
        saveStatus(node);
      }
    };
    const afterDeactive = function (node: VNode) {
      if (props.onPause) {
        props.onPause(node);
      }
    };
    const beforeReactive = function (node: VNode) {
      if (props.beforeResume) {
        props.beforeResume(node);
      }
    };
    const afterReactive = function (node: VNode) {
      if (props.saveStatus) {
        restoreStatus(node);
      }
      if (props.onResume) {
        props.onResume(node);
      }
    };

    const instance = getCurrentInstance();
    if (!instance) {
      throw new Error("getCurrentInstance return null");
    }
    const { suspense: parentSuspense, proxy: instanceProxy } = instance as any;
    const renderer = instanceProxy?.renderer;
    const {
      p: patch,
      m: move,
      um: _unmount,
      o: { createElement },
    } = renderer;

    if (!instanceProxy) {
      throw new Error("getCurrentInstance().proxy return null");
    }
    const storageContainer = createElement("div");
    const vnodeActive = function (
      vnode: VNode,
      container: Element,
      anchor: Element,
      isSVG: boolean,
      optimized: boolean
    ) {
      const instance = vnode.component!;
      beforeReactive(vnode);
      move(vnode, container, anchor, 0, parentSuspense);
      queuePostFlushCb(() => {
        instance.isDeactivated = false;
        const activeFn = (instance as any).a;
        if (activeFn) {
          invokeArrayFns(activeFn);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeMounted;
        if (vnodeHook) {
          callWithAsyncErrorHandling(vnodeHook, instance.parent, 7, [
            vnode,
            null,
          ]);
        }
      });
      queuePostFlushCb(function () {
        afterReactive(vnode);
      });
      // in case props have changed
      patch(
        instance.vnode,
        vnode,
        container,
        anchor,
        instance,
        parentSuspense,
        isSVG,
        (vnode as any).slotScopeIds,
        optimized
      );
    };

    const vnodeDeactive = function (vnode: VNode) {
      const instance = vnode.component!;
      beforeDeactive(vnode);
      move(vnode, storageContainer, null, 1, parentSuspense);
      queuePostFlushCb(() => {
        const deactiveFn = (instance as any).da;
        if (deactiveFn) {
          invokeArrayFns(deactiveFn);
        }
        const vnodeHook = vnode.props && vnode.props.onVnodeUnmounted;
        if (vnodeHook) {
          callWithAsyncErrorHandling(vnodeHook, instance.parent, 7, [
            vnode,
            null,
          ]);
        }
        instance.isDeactivated = true;
      });
      afterDeactive(vnode);
      // console.log('vnodeDeactive', vnode);
    };
    instanceProxy.activate = vnodeActive;
    instanceProxy.deactivate = vnodeDeactive;

    const uncacheNode = function (node: VNode) {
      node.shapeFlag &= ~FLAG_KEPT_ALIVE;
      node.shapeFlag &= ~FLAG_NEED_KEEP_ALIVE;
    };

    const destory = function (node: VNode) {
      delStatus(node);
      uncacheNode(node);
      _unmount(node, instance, parentSuspense, true);
    };

    const cacheNode = function (node: VNode) {
      node.shapeFlag |= FLAG_NEED_KEEP_ALIVE;
      return node;
    };

    const reuseNode = function (node: VNode, reuseNode: VNode) {
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

    const cacheContext: CacheContext = {
      cacheNode,
      reuseNode,
      uncacheNode,
      cacheable: cacheableNode,
      destory,
    };

    onUnmounted(function () {
      (props.componentEvaluator as ComponentEvaluator).reset(cacheContext);
    });

    return function () {
      const evaluator = props.componentEvaluator as ComponentEvaluator;
      let newComponent: VNode | null = evaluator.onRenderVNode(
        ctx.slots?.default!
      );
      if (!newComponent) {
        return newComponent;
      }
      // other type is: function or object
      const originChild = newComponent;
      let shouldOrvewriteChild = false;
      if ((newComponent.type as any).displayName?.includes("Transition")) {
        // is a transation
        // child slot
        const tarnsitionChildSlots = newComponent.children;
        if (!tarnsitionChildSlots) {
          return tarnsitionChildSlots;
        }
        if (isVNode(tarnsitionChildSlots)) {
          // just vnode
          newComponent = tarnsitionChildSlots;
          shouldOrvewriteChild = true;
        } else if (Array.isArray(tarnsitionChildSlots)) {
          // array child not support
          throw new Error("cannot has array child");
        } else if (typeof tarnsitionChildSlots === "object") {
          // slot child
          newComponent = (tarnsitionChildSlots as Slots).default?.()[0] || null;
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

        const child = cloneVNode(displayComponent, {
          onVnodeBeforeMount(vnode) {
            evaluator.updateVNode(userVNode, vnode);
            const ctx = (vnode?.component?.parent as any)?.ctx;
            if (ctx) {
              if (!ctx.deactivate) {
                ctx.deactivate = vnodeDeactive;
              }
              if (!ctx.activate) {
                ctx.activate = vnodeActive;
              }
            }
          },
        });
        (originChild as VNode).children = {
          default: () => child,
        };

        (originChild as any)["__isKeepAlive"] = true;
        displayComponent = originChild;

        child.patchFlag |= userVNode.patchFlag;

        uncacheNode(userVNode);
        cacheNode(displayComponent);
      }

      return displayComponent;
    };
  },
});
