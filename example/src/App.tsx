import { cloneVNode, defineComponent, VNode } from "vue";
import PageStack from "page-stack-vue3";
import { RouteLocation, Router, RouterView } from "vue-router";

export default defineComponent({
  setup() {
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
              <PageStack>
                {Component && cloneVNode(Component, { key: route.path })}
              </PageStack>
            );
          }}
        </RouterView>
      );
    };
  },
});
