import { createVNode as _createVNode } from "vue";
import { defineComponent } from "vue";
import ComponentCache, { Props } from "./componentCache";
import PageStack from "./pageStack";
export default defineComponent({
  props: { ...Props,
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
  },

  setup(props, ctx) {
    const evaluator = props.componentEvaluator || new PageStack(props.lifeCycleCallback, props.router, props.mergeQueryToProps);
    return function () {
      return _createVNode(ComponentCache, {
        "componentEvaluator": evaluator
      }, {
        default: () => [ctx.slots.default?.()?.[0]]
      });
    };
  }

});