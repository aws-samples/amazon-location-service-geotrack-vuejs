<script setup>
  import { Authenticator } from '@aws-amplify/ui-vue';
  import '@aws-amplify/ui-vue/styles.css';
  import { ConsoleLogger } from 'aws-amplify/utils';
  import { useRouter } from 'vue-router'
  import { useUserStore } from '../stores/user'
  import { onMounted, defineComponent, h } from 'vue'

  const router = useRouter();
  const store = useUserStore();
  const logger = new ConsoleLogger('geotrack');

  // If the user already has a valid session when landing on /auth, redirect immediately.
  onMounted(async () => {
    try {
      await store.getSession();
      if (store.isAuthenticated) {
        router.replace("/");
      }
    } catch (e) {
      // Not authenticated yet, show the login form
    }
  });

  // A small inline component that redirects when mounted (i.e., when the slot renders)
  const RedirectOnAuth = defineComponent({
    setup() {
      onMounted(async () => {
        logger.info('User authenticated via Authenticator, redirecting to home');
        await store.getSession();
        router.replace("/");
      });
      return () => h('p', 'Redirecting...');
    }
  });
</script>

<template>
  <authenticator 
    :login-mechanisms="['email']"
    :sign-up-attributes="['email','given_name','family_name']"
  >
    <template v-slot="{ user }">
      <RedirectOnAuth />
    </template>
  </authenticator>
</template>
