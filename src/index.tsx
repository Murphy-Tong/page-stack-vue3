import { defineComponent, PropType } from "vue";
import { Router } from "vue-router";
import ComponentCache, { ComponentEvaluator, Props } from "./componentCache";
import PageStack, { LifecycleCallback } from "./pageStack";

export type { ComponentEvaluator } from "./componentCache";
export type { LifecycleCallback } from "./pageStack";

export default defineComponent({
  props: {
    ...Props,
    componentEvaluator: {
      type: Object as PropType<ComponentEvaluator>,
      default: null,
    },
    lifeCycleCallback: {
      type: Object as PropType<LifecycleCallback>,
      require: false,
    },
    router: {
      type: Object as PropType<Router>,
      require: false,
    },
    mergeQueryToProps: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, ctx) {
    const evaluator =
      props.componentEvaluator ||
      new PageStack(
        props.lifeCycleCallback,
        props.router,
        props.mergeQueryToProps
      );
    return function () {
      return (
        <ComponentCache componentEvaluator={evaluator}>
          {ctx.slots.default?.()?.[0]}
        </ComponentCache>
      );
    };
  },
});
