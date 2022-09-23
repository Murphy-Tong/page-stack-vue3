import { defineComponent, PropType, Transition } from "vue";
import { Router } from "vue-router";
import ComponentCache, { Props } from "./componentCache";
import PageStack, { LifecycleCallback, RenderSlotProps } from "./pageStack";
import "./index.css";

export * from "./componentCache";
export * from "./pageStack";

const TRANSITION_NAME_IN = "ps-slide-in";
const TRANSITION_NAME_OUT = "ps-slide-out";
// const TRANSITION_CONTAINER = "ps-page-container";

export default defineComponent({
  props: {
    ...Props,
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
    disableAnimation: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, ctx) {
    const evaluator = new PageStack(
      props.lifeCycleCallback,
      props.router,
      props.mergeQueryToProps
    );
    ctx.expose({
      getPageSize: evaluator.size.bind(evaluator),
    });
    return function () {
      return (
        <ComponentCache componentEvaluator={evaluator}>
          {function (data: RenderSlotProps) {
            if (props.disableAnimation) {
              return ctx.slots.default?.(data)?.[0];
            }
            let transName = "";
            if (data.action === "back") {
              transName = TRANSITION_NAME_OUT;
            } else if (data.action === "forword") {
              transName = TRANSITION_NAME_IN;
            }
            return (
              <Transition name={transName}>
                {ctx.slots.default?.(data)?.[0]}
              </Transition>
            );
          }}
        </ComponentCache>
      );
    };
  },
});
