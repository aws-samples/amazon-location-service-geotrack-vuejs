import Vue from 'vue'
import VueRouter from 'vue-router'
import store from "../store";

import DefaultLayout from '../layouts/Default.vue'
import SimpleLayout from '../layouts/Simple.vue'
import Home from '../views/Home.vue'
import Agent from '../views/Agent.vue'
import Delivery from '../views/Delivery.vue'
import SignIn from '../views/SignIn.vue'
import SignUp from '../views/SignUp.vue'
import ForgotPassword from '../views/ForgotPassword.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: "/",
      component: DefaultLayout,
      children: [
        {
          path: "/",
          component: Home,
          meta: { requiresAuth: false }
        },
        {
          path: "agent",
          component: Agent,
          meta: { requiresAuth: true }
        },
        {
          path: "delivery",
          component: Delivery,
          meta: { requiresAuth: true }
        }      
      ]
    },
    {
      path: "/simplelayout",
      component: SimpleLayout,
      children: [
        {
          path: "/auth",
          name: "auth",
          component: SignIn,
          props: route => ({ ...route.params, ...route.query }), // converts query strings and params to props
          meta: { name: 'Auth' }
        },
        {
          path: "/signup",
          name: "signup",
          component: SignUp,
          meta: { name: 'SignUp' }
        },
        {
          path: "/forgotpassword",
          name: "forgotpassword",
          component: ForgotPassword,
          meta: { name: 'ForgotPassword' }
        }
      ]
    }
  ]
})

/**
 * Authentication Guard for routes with requiresAuth metadata
 *
 * @param {Object} to - Intended route navigation
 * @param {Object} from - Previous route navigation
 * @param {Object} next - Next route navigation
 * @returns {Object} next - Next route
 */


router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.getters["profile/isAuthenticated"]) {
      try {
        console.log("dispatch profile/getSession");
        await store.dispatch("profile/getSession");
        next();
      } catch (err) {
        //console.log("router beforeEach Error: " + err);
        next({ name: "auth", query: { redirectTo: to.name } });
      }
    }
  }
  next();
});

export default router;