import { RouteAction } from "../lib/pageStack";
import {
  cloneVNode,
  defineComponent,
  queuePostFlushCb,
  Transition,
  VNode,
} from "vue";
import { RouteLocation, RouterView } from "vue-router";
import PageStack from "../lib/index";
import "./index.less";
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
              <div class="page-container">
                <PageStack>
                  {function ({ action }: { action: RouteAction }) {
                    console.log(action);
                    let transName = "";
                    if (action === "back") {
                      transName = "slide-out";
                    } else if (action === "forword") {
                      transName = "slide-in";
                    }
                    return (
                      <Transition name={transName}>
                        {Component &&
                          cloneVNode(Component, { key: route.path })}
                      </Transition>
                    );
                  }}
                </PageStack>
              </div>
            );
          }}
        </RouterView>
      );
    };
  },
});
