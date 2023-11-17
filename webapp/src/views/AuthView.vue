<script setup>
  import { Authenticator } from '@aws-amplify/ui-vue';
  import '@aws-amplify/ui-vue/styles.css';
  import { Hub, ConsoleLogger } from 'aws-amplify/utils';
  import { useRouter } from 'vue-router'

  const router = useRouter();

  const logger = new ConsoleLogger('geotrack');

  function listenToAutoSignInEvent() {
    Hub.listen('auth', async ({ payload }) => {
      const { event } = payload;
      if (event === 'autoSignIn' || event === 'signIn') {
        const user = payload.data;
        logger.info(user)    
        router.push("/")      
      } 
    })
  }

</script>

<template>
  <authenticator 
    :login-mechanisms="['email']"
    :sign-up-attributes="['email','given_name','family_name']"
    ></authenticator>
</template>