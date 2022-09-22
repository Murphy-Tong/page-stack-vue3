import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/page1.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'p1',
    component: HomeView
  },
  {
    path: '/p1',
    name: 'p1-1',
    component: HomeView
  },
  {
    path: '/p2',
    name: 'p2',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/page2.vue')
  },
  {
    path: '/p3',
    name: 'p3',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/page3.vue')
  }, {
    path: '/scroll',
    name: 'scroll',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/scroll.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
