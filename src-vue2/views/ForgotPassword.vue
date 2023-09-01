<template>
    <div class="column  justify-center items-center q-pa-lg">
      <q-card v-if="formState === 'forgotPassword'" square class="shadow-24">
        <q-card-section class="bg-teal">
          <div class="text-h6">Password Reset</div>
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
          </q-form>
        </q-card-section>
        <q-card-section class="text-center q-pa-sm" v-if="hasPasswordError">
          <q-btn size="sm" color="red" icon="highlight_off" :label="passwordError" @click="hasPasswordError=false" />
        </q-card-section>
        <q-card-actions class="q-px-lg">
          <q-btn unelevated size="lg" @click="forgotPassword" class="bg-teal full-width text-white" label="SUBMIT" />
        </q-card-actions>
        <q-card-section class="text-center q-pa-sm">
          <q-btn flat size="sm" @click="toggleLogin" color="black" label="Back to Sign In page." />
        </q-card-section>
      </q-card>

    <q-card v-if="formState === 'forgotPasswordSubmit'" square class="shadow-24">
       <q-card-section class="bg-grey-8 text-white">
        <div class="text-h6">Confirmation</div>
        <div class="text-subtitle2">A confirmation code was sent to <span class="text-bold"> {{ form.email }}. </span> Please, check your email. </div>
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
            <q-input 
              square clearable 
              v-model="form.password" 
              clear-icon="close"
              type="password" 
              label="New Password"
              >
              <template v-slot:prepend>
                <q-icon name="lock" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>
        <q-card-section class="text-center q-pa-sm" v-if="hasPasswordError">
          <q-btn size="sm" color="red" icon="highlight_off" :label="passwordError" @click="hasPasswordError=false" />
        </q-card-section>
        <q-card-actions class="q-px-lg">
          <q-btn unelevated size="lg" @click="forgotPasswordSubmit" class="bg-teal full-width text-white" label="SUBMIT" />
        </q-card-actions>     
      </q-card>
    </div>
</template>


<script>
import { Auth } from 'aws-amplify'
export default {
  name: 'SignUp',
  data() {
    return {
      formState: 'forgotPassword',
      hasPasswordError: false,
      passwordError: '',
      form: {
        password: '',
        username: '',
        given_name: '',
        family_name: '',
        authCode: ''
      }
    }
  },
  methods: {
    async forgotPassword() {
      try {
        this.form.email = this.form.username;
        const { username } = this.form
        await Auth.forgotPassword({
          username
        })
        this.formState = 'forgotPasswordSubmit'
      } catch (error) {
        this.passwordError = error.message
        this.hasPasswordError = true;
      }
    },
    async forgotPasswordSubmit() {
      try {
        const { username, authCode } = this.form
        await Auth.forgotPasswordSubmit(username, authCode)
        this.$q.notify({
            color: "teal",
            icon: "thumb_up",
            message: "Your password has been reset successfully!",
            position: "right"
        });
        this.$router.push("/auth");
      } catch (error) {
        this.passwordError = error.message
        this.hasPasswordError = true;
      }      
    },
    toggleLogin() {
        this.$router.push("/auth");
    }
  }
}
</script>

<style>
</style>