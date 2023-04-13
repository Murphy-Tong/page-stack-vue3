import { createVNode as _createVNode } from "vue";
import { defineComponent, Transition } from "vue";
import { useRouter } from "vue-router";
import { ComponentCache, Props } from "./componentCache";
import "./index.css";
import { PageStackEvaluator } from "./pageStackEvaluator";
export * from "./componentCache";
export * from "./pageStackEvaluator";
const TRANSITION_NAME_IN = "ps-slide-in";
const TRANSITION_NAME_OUT = "ps-slide-out";
export default defineComponent({
  props: Object.assign(Object.assign({}, Props), {
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
    const evaluator = props.componentEvaluator || new PageStackEvaluator(props.router || useRouter(), props.mergeQueryToProps, props.lifeCycleCallback);
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
      return _createVNode(ComponentCache, {
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

          return _createVNode(Transition, {
            "name": transName
          }, {
            default: () => [(_f = (_e = (_d = ctx.slots).default) === null || _e === void 0 ? void 0 : _e.call(_d, data)) === null || _f === void 0 ? void 0 : _f[0]]
          });
        }
      });
    };
  }

});