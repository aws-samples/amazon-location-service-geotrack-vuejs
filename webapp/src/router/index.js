import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import SimpleLayout from '../layouts/SimpleLayout.vue'
import HomeView from '../views/HomeView.vue'
import AuthView from '../views/AuthView.vue'
import DriversView from '../views/DriversView.vue'
import TripsView from '../views/TripsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
    path: "/",
      component: SimpleLayout,
      children: [
        {
          path: '/',
          name: 'home',
          component: HomeView,
          meta: { requiresAuth: true }
        },
        {
          path: "drivers",
          component: DriversView,
          meta: { requiresAuth: true }
        },
        {
          path: "trips",
          component: TripsView,
          meta: { requiresAuth: true }
        }     
      ]
    },
    {
      path: "/auth",
      component: SimpleLayout,
      children: [
        {
          path: "",
          name: "auth",
          component: AuthView,
          props: route => ({ ...route.params, ...route.query }), // converts query strings and params to props
          meta: { name: 'AuthView' }
        }
      ]
    }

  ]
})


router.beforeEach(async (to) => {
  const store = useUserStore()
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!store.isAuthenticated) {
      try {
        console.log("dispatch getSession");
        await store.getSession();
        return to.fullPath;
      } catch (err) {
        //console.log("router beforeEach Error: " + err);
        return '/auth'
      }
    }
  }
});

export default router
