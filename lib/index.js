"use strict";

import { createVNode as _createVNode } from "vue";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);

  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }

  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

var __exportStar = this && this.__exportStar || function (m, exports) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const vue_1 = require("vue");

const vue_router_1 = require("vue-router");

const componentCache_1 = require("./componentCache");

require("./index.css");

const pageStackEvaluator_1 = require("./pageStackEvaluator");

__exportStar(require("./componentCache"), exports);

__exportStar(require("./pageStackEvaluator"), exports);

const TRANSITION_NAME_IN = "ps-slide-in";
const TRANSITION_NAME_OUT = "ps-slide-out";
exports.default = (0, vue_1.defineComponent)({
  props: Object.assign(Object.assign({}, componentCache_1.Props), {
    debug: {
      type: Boolean,
      default: false
    },
    lifeCycleCallback: {
      type: Object,
      require: false
    },
    router: {
      type: Object,
      require: false
    },
    mergeQueryToProps: {
      type: Boolean,
      default: false
    },
    disableAnimation: {
      type: Boolean,
      default: false
    },
    componentEvaluator: {
      type: Object,
      require: false
    }
  }),

  setup(props, ctx) {
    const evaluator = props.componentEvaluator || new pageStackEvaluator_1.PageStackEvaluator(props.router || (0, vue_router_1.useRouter)(), (0, vue_1.inject)(vue_router_1.viewDepthKey), props.mergeQueryToProps, props.lifeCycleCallback);
    evaluator.debug = props.debug;
    ctx.expose({
      getPageSize: props.componentEvaluator ? () => {
        if (typeof evaluator.size === "function") {
          return evaluator.size();
        }

        throw new Error("自定义的 componentEvaluator 请自己实现size方法");
      } : evaluator.size.bind(evaluator)
    });
    return function () {
      return _createVNode(componentCache_1.ComponentCache, {
        "componentEvaluator": evaluator
      }, {
        default: function (data) {
          var _a, _b, _c, _d, _e, _f;

          if (props.disableAnimation) {
            return (_c = (_b = (_a = ctx.slots).default) === null || _b === void 0 ? void 0 : _b.call(_a, data)) === null || _c === void 0 ? void 0 : _c[0];
          }

          let transName = "";

          if (data.action === "back") {
            transName = TRANSITION_NAME_OUT;
          } else if (data.action === "forword") {
            transName = TRANSITION_NAME_IN;
          }

          return _createVNode(vue_1.Transition, {
            "name": transName
          }, {
            default: () => [(_f = (_e = (_d = ctx.slots).default) === null || _e === void 0 ? void 0 : _e.call(_d, data)) === null || _f === void 0 ? void 0 : _f[0]]
          });
        }
      });
    };
  }

});