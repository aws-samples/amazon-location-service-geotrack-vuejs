<template>
  <div class="row justify-center">
    <amplify-authenticator
      class="authenticator__form"
      :authConfig="authConfig">
    </amplify-authenticator>
  </div>
</template>

<script>
// @ts-ignore
import { AmplifyEventBus } from "aws-amplify-vue";
/**
 * Authentication view authenticates a customer and redirects to desired page if successful
 * Non-authenticated users are redirected to this view via Route Guards
 */
export default {
  name: "Authentication",
  /**
   * @param {string} redirectTo - Sets Route one must go once authenticated
   */
  props: {
    redirectTo: String
  },
  mounted() {
    /**
     * At mount lifecycle hook, it listens for `authState` event, and when successfully signed-in it redirects to desired page
     */
    AmplifyEventBus.$on("authState", info => {
      if (info === "signedIn") {
        // return to where we came from
        this.$router.push({ name: this.redirectTo });
      }
    });
  },
  data() {
    return {
      authConfig: {
        signUpConfig: {
          header: 'ParticipationHours - Sign Up',
          hideAllDefaults: true,
          defaultCountryCode: "1",
          signUpFields: [
            {
              label: "First name",
              key: "given_name",
              required: true,
              displayOrder: 0
            },
            {
              label: "Family name",
              key: "family_name",
              required: true,
              displayOrder: 1
            },
            {
              label: 'Email',
              key: 'username',
              required: true,
              displayOrder: 2,
              placeholder: "Email",
              type: 'email'
            },
            {
              label: 'Password',
              key: 'password',
              required: true,
              displayOrder: 3,
              type: 'password'
            }
          ]
        }
      }
    };
  }
};
</script>

<style scoped>
@media only screen and (min-device-width: 700px) {
  .authenticator__form {
    margin: auto;
    padding: 15vmin;
  }
}
@media only screen and (min-device-width: 300px) and (max-device-width: 700px) {
  .authenticator__form .div {
    min-width: 80vw;
    padding: 10vmin;
  }
}
</style>