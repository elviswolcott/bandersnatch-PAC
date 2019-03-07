import Vue from "vue";
import Router from "vue-router";
import Join from "./views/Join.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "join",
      component: Join
    },
    {
      path: "/remote/:channel",
      name: "remote",
      // route level code-splitting
      // this generates a separate chunk (remote.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "remote" */ "./views/Remote.vue")
    }
  ]
});
