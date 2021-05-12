<template>
    <div class="column  justify-center items-center q-pa-lg">
      <q-card v-if="formState === 'signUp'" square class="shadow-24">
        <q-card-section class="bg-primary">
          <div class="text-h6">New User Creation</div>
        </q-card-section>
        <q-card-section>
          <q-form>
            <q-input 
              square clearable 
              v-model="form.username" 
              clear-icon="close"
              type="email" 
              label="Email">
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
            </q-input>
            <q-input 
              square clearable 
              v-model="form.password" 
              clear-icon="close"
              type="password" 
              label="Password">
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
            <q-input 
              square clearable 
              clear-icon="close"
              v-model="form.given_name" 
              label="Name">
              <template v-slot:prepend>
                <q-icon name="subject" />
              </template>
            </q-input>
            <q-input 
              square clearable 
              clear-icon="close"
              v-model="form.family_name" 
              label="LastName">
              <template v-slot:prepend>
                <q-icon name="subject" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
        <q-card-actions class="q-px-lg">
          <q-btn unelevated size="lg" @click="signUp" class="bg-primary full-width text-white" label="Create" />
        </q-card-actions>
        <q-card-section class="text-center q-pa-sm">
          <q-btn flat size="sm" @click="toggleLogin" color="black" label="Already a User? Click here!" />
        </q-card-section>
      </q-card>

    <q-card v-if="formState === 'confirmSignUp'" square class="shadow-24">
       <q-card-section class="bg-grey-8 text-white">
        <div class="text-h6">Confirmation</div>
        <div class="text-subtitle2">A confirmation code was sent to <span class="text-bold"> {{ form.email }}. </span> Please, check your email.  </div>
       </q-card-section>
        <q-card-section>
          <q-form>
            <q-input 
              square clearable 
              v-model="form.authCode" 
              clear-icon="close"
              label="Authentication Code">
              <template v-slot:prepend>
                <q-icon name="input" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
        <q-card-actions class="q-px-lg">
          <q-btn unelevated size="lg" @click="confirmSignUp" class="bg-primary full-width text-white" label="Submit" />
        </q-card-actions>     
        <q-card-section class="text-center q-pa-sm">
          <q-btn flat size="sm" @click="resendSignUp" color="black" label="Send another code" />
        </q-card-section>   
      </q-card>
    </div>
</template>


<script>
import { Auth } from 'aws-amplify'
export default {
  name: 'SignUp',
  data() {
    return {
      formState: 'signUp',
      form: {
        password: '',
        username: '',
        email: '',
        given_name: '',
        family_name: '',
        authCode: ''
      }
    }
  },
  methods: {
    async signUp() {
      this.form.email = this.form.username;
      const { username, password, email, given_name, family_name } = this.form
      await Auth.signUp({
        username, password, attributes: { email, given_name, family_name }
      })
      this.formState = 'confirmSignUp'
    },
    async confirmSignUp() {
      const { username, authCode } = this.form
      await Auth.confirmSignUp(username, authCode)
      this.$q.notify({
          color: "teal",
          icon: "thumb_up",
          message: "User Successfully created!! ",
          position: "right"
      });
      this.$router.push("/auth");
    },
    toggleLogin() {
        this.$router.push("/auth");
    },
    async resendSignUp() {
      const { username, authCode } = this.form
      await Auth.resendSignUp(username, authCode);
      this.$q.notify({
          color: "teal",
          icon: "thumb_up",
          message: "Auth code re-enviado",
          position: "right"
      });
    }
  }
}
</script>

<style>
</style>