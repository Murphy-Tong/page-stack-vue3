import { defineComponent, VNode } from "vue";
import PageStack from "page-stack-vue3";
import { RouterView } from "vue-router";

export default defineComponent({
  setup() {
    return function () {
      return (
        <RouterView>
          {function ({ Component }: { Component: VNode }) {
            return <PageStack>{Component}</PageStack>;
          }}
        </RouterView>
      );
    };
  },
});
