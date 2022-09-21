"use strict";

import { createVNode as _createVNode } from "vue";
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
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

var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

import { defineComponent } from "vue";
import ComponentCache, { Props } from "./componentCache";
import PageStack from "./pageStack";
export default defineComponent({
  props: __spreadProps(__spreadValues({}, Props), {
    componentEvaluator: {
      type: Object,
      default: null
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
    }
  }),

  setup(props, ctx) {
    const evaluator = props.componentEvaluator || new PageStack(props.lifeCycleCallback, props.router, props.mergeQueryToProps);
    return function () {
      return _createVNode(ComponentCache, {
        "componentEvaluator": evaluator
      }, {
        default: function (...args) {
          var _a, _b, _c;

          return (_c = (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a, ...(args || []))) == null ? void 0 : _c[0];
        }
      });
    };
  }

});