## Page Stack for Vue3
#### [Github](https://github.com/Murphy-Tong/page-stack-vue3) / [Npm](https://www.npmjs.com/package/page-stack-vue3)

### 简介：
按照app页面栈的方式，控制路由跳转，打开新页面时保存旧页面的状态，返回时销毁页面，适合移动端H5项目

[在线预览](https://cloud.yotako.cn/ps/#/)

### Usage：

1.  安装依赖

    ```shell
    yarn add page-stack-vue3
    ```
2.  在view-router中使用
    ```javascript

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
                    {Component && cloneVNode(Component, { key: route.path })}//key 不必须
                </PageStack>
                );
            }}
            </RouterView>
        );
        };
    },
    });

    ```
3.  Component Optios
    ```javascript
    {
        //vue router实例
         router: {
            type: Object as PropType<Router>,
            require: false,
        },
        //是否将路由query参数填充到页面组件的props中，router不传则此参数无效
        mergeQueryToProps: {
            type: Boolean,
            default: false,
        },
    }
    
    ```

### 注意事项

1.  如果要跟transition一起使用，请将transition作为子组件使用
    ```javascript
    <page-stack>
        <transition ...props>
            <component is="xxx">
            </component>
        </transition>
    </page-stack>
    ```
2.  本组件会重写page的key
3.  生命周期同[keep-alive](https://cn.vuejs.org/)组件




