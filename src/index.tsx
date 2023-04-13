import { defineComponent, inject, PropType, Ref, Transition } from "vue";
import { Router, viewDepthKey, useRouter } from "vue-router";
import { ComponentCache, ComponentEvaluator, Props } from "./componentCache";
import "./index.css";
import {
  LifecycleCallback,
  PageStackEvaluator,
  RenderSlotProps,
} from "./pageStackEvaluator";

export * from "./componentCache";
export * from "./pageStackEvaluator";

const TRANSITION_NAME_IN = "ps-slide-in";
const TRANSITION_NAME_OUT = "ps-slide-out";

export default defineComponent({
  props: {
    ...Props,
    debug: {
      type: Boolean,
      default: false,
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
    disableAnimation: {
      type: Boolean,
      default: false,
    },
    componentEvaluator: {
      type: Object as PropType<ComponentEvaluator>,
      require: false,
    },
  },
  setup(props, ctx) {
    const evaluator =
      props.componentEvaluator ||
      new PageStackEvaluator(
        props.router || useRouter(),
        inject(viewDepthKey) as Ref<number>,
        props.mergeQueryToProps,
        props.lifeCycleCallback
      );
    evaluator.debug = props.debug;
    ctx.expose({
      getPageSize: props.componentEvaluator
        ? () => {
            if (typeof (evaluator as any).size === "function") {
              return (evaluator as any).size();
            }
            throw new Error("自定义的 componentEvaluator 请自己实现size方法");
          }
        : (evaluator as PageStackEvaluator).size.bind(evaluator),
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
