<!-- 
This is the default layout that integrates with the user information

(c) 2022 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.  
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  
http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both. 
-->

<script setup>
import { reactive, ref } from "vue";
import { useUserStore } from "../stores/user";
import { getCurrentUser, signOut, fetchAuthSession } from 'aws-amplify/auth';
import axios from "axios"
const userStore = useUserStore();

const buttonSimulate = ref(false)

const alert = reactive({
  title: null,
  type: "warning",
  text: null,
  active: false,
  icon: null
});

async function userSignOut() {
  try {
    await signOut();
    $router.push("/auth");
  } catch (error) {
    console.log("error signing out: ", error);
  }
}

async function simulate() {
  try {
    buttonSimulate.value = false
    const session = await fetchAuthSession();
    const jwt = session.tokens.idToken
    const options = {
      headers: { 'Authorization': jwt }
    };
    await axios.post(import.meta.env.VITE_API_URL + "/launch", {}, options)
      .then(results => {
        if (results.status == 200) {
          alert.active = true;
          alert.title = "Simulate";
          alert.text = results.data.msg;
        } else {
          alert.active = true;
          alert.type = "error";
          alert.title = "Simulate";
          alert.text = results.data.msg;
        }
      });
  }
  catch (error) {
    console.error(error);
    alert.active = true;
    alert.type = "error";
    alert.title = "Simulate";
    alert.text = error.message;
  }
}
</script>

<template>
  <v-card color="grey-lighten-4" flat>
    <v-toolbar density="compact">
      <v-app-bar-nav-icon></v-app-bar-nav-icon>

      <v-btn text>
        <span>Ocktank</span>
      </v-btn>

      <v-toolbar-items>
        <v-tooltip text="Home" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon @click="$router.push('/')">
              <v-icon>mdi-home-circle-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Drivers" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon @click="$router.push('/drivers')">
              <v-icon>mdi-card-account-details-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Trips" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon @click="$router.push('/trips')">
              <v-icon>mdi-map-marker-path</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

        <v-tooltip text="Simulate" location="bottom">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" color="orange" icon @click="buttonSimulate = true">
              <v-icon>mdi-car-multiple</v-icon>
            </v-btn>
          </template>
        </v-tooltip>

      </v-toolbar-items>

      <div class="flex-grow-1"></div>

      <v-tooltip :text="userStore.email" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon>
            <v-icon>mdi-account-circle-outline</v-icon>
          </v-btn>
        </template>
      </v-tooltip>

      <v-divider vertical></v-divider>

      <v-tooltip text="Logout" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon @click="userSignOut">
            <v-icon>mdi-exit-to-app</v-icon>
          </v-btn>
        </template>
      </v-tooltip>


    </v-toolbar>
  </v-card>

  <v-dialog v-model="buttonSimulate" width="500">
    <v-card title="Confirm Simulation">
      <v-card-text>
        Are you sure you want to run the simulation?
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text="Yes" @click="simulate()"></v-btn>

        <v-btn text="No" color="warning" @click="buttonSimulate = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-alert density="compact" v-model="alert.active" :type="alert.type" :title="alert.title" :text="alert.text" closable
    close-label="Close Alert"></v-alert>
</template>
