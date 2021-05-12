<template>
  <div class="column justify-center items-center q-pa-lg">
    <!-- <q-card square class="shadow-24" style="width:300px;height:485px;"> -->
    <q-card square class="shadow-24">
      <q-card-section class="bg-primary">
        <h4 class="text-h6 text-white q-my-sm">Login</h4>
      </q-card-section>
      <q-card-section>
        <q-form>
          <q-input
            square 
            clearable 
            v-model.trim="form.username" 
            label="Email"
            @blur="$v.form.username.$touch"
            error-message="Please use a valid email"
            :error="$v.form.username.$error"
            >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>
          <q-input 
            square 
            clearable 
            v-model="form.password" 
            type="password" 
            label="Password"
            error-message="Password Invalid"
            @blur="$v.form.password.$touch"
            :error="$v.form.password.$error"
            >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>
        </q-form>
      </q-card-section>
      <q-card-section class="text-center q-pa-sm" v-if="hasLoginError">
        <q-btn size="sm" color="red" icon="highlight_off" :label="loginError" @click="hasLoginError=false" />
      </q-card-section>
      <q-card-actions class="q-px-lg">
        <q-btn
          unelevated
          size="lg"
          @click="onSubmit"
          class="bg-primary full-width text-white"
          label="Log In"
        />
      </q-card-actions>
      <q-card-section class="text-center q-pa-sm">
        <q-btn flat size="sm" @click="forgotPassword" color="black" label="Forgot you password?" />
        <q-separator />
        <q-btn flat size="sm" @click="signUp" color="black" label="Don't have an account? Sign Up here!" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { Auth } from "aws-amplify";
import { AmplifyEventBus } from "aws-amplify-vue";
import { required, email } from 'vuelidate/lib/validators';
export default {
  name: "SignIn",
  /**
   * @param {string} redirectTo - Sets Route one must go once authenticated
   */
  props: {
    redirectTo: String
  },
  data() {
    return {
      hasLoginError: false,
      loginError: '',
      form: {
        username: "",
        password: ""
      }
    };
  },
  validations: {
    form: {
      username: { required, email },
      password: { required },
    }    
  },
  methods: {
    async onSubmit() {
      this.loginError = '';
      this.hasLoginError = false;
      this.$v.form.$touch()
      if (this.$v.form.$pending || this.$v.form.$error) {        
        return
      }
      const { username, password } = this.form;
      try {
        const user = await Auth.signIn(username, password);
        console.log(user.username)
        AmplifyEventBus.$emit("authState", "signedIn");
        this.$router.push("/");
      } catch (error) {
        this.loginError = error.message
        this.hasLoginError = true;
      }      
    },
    signUp() {
      this.$router.push("/signup");
    },
    forgotPassword() {
      this.$router.push("/forgotpassword");
    }
  }
};
</script>