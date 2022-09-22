import PageStack from "page-stack-vue3";

import { cloneVNode, defineComponent, ref, VNode } from "vue";
import { RouteLocation, RouterView } from "vue-router";
export default defineComponent({
  setup() {
    const psRef = ref();
    const onPageResume = function () {
      document.title = `第${psRef.value?.getPageSize() || 1}页`;
    };
    const lifeCb = {
      onResume: onPageResume,
    };
    return function () {
      return (
        <RouterView>
          {function ({
            Component,
            route,
          }: {
            Component: VNode;
            route: RouteLocation;
          }) {
            return (
              <PageStack ref={psRef} lifeCycleCallback={lifeCb}>
                {Component && cloneVNode(Component, { key: route.path })}
              </PageStack>
            );
          }}
        </RouterView>
      );
    };
  },
});
