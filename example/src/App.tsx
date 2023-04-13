import PageStack from "../../src";
import { cloneVNode, defineComponent, ref, VNode } from "vue";
import { RouteLocation, RouterView, useRouter } from "vue-router";
import "./index.css";

const Ps = defineComponent({
  setup(props, ctx) {
    const router = useRouter();
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
              <PageStack
                ref="psRef"
                debug={true}
                // @ts-ignore
                router={router}
              >
                {Component && cloneVNode(Component, { key: route.path })}
              </PageStack>
            );
          }}
        </RouterView>
      );
    };
  },
});

export default defineComponent({
  setup() {
    const psRef = ref();
    const onPageResume = function () {
      document.title = `第${psRef.value?.getPageSize() || 1}页`;
    };
    const lifeCb = {
      onResume: onPageResume,
    };
    const countRef = ref(1);
    setInterval(() => {
      // countRef.value += 1;
    }, 1000);
    const router = useRouter();
    return function () {
      return (
        <div>
          <div
            onClick={() => {
              countRef.value += 1;
            }}
          >
            {countRef.value}
          </div>
          <Ps />
          {/* <RouterView>
            {function ({
              Component,
              route,
            }: {
              Component: VNode;
              route: RouteLocation;
            }) {
              return (
                <PageStack
                  ref="psRef"
                  debug={true}
                  // @ts-ignore
                  router={router}
                >
                  {Component && cloneVNode(Component, { key: route.path })}
                </PageStack>
              );
            }}
          </RouterView> */}
        </div>
      );
    };
  },
});
