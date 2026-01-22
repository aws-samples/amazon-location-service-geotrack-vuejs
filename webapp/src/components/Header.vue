<!-- 
This is the default layout that integrates with the user information

(c) 2022 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.  
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  
http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both. 
-->

<script setup>
import { ref } from "vue";
import { useUserStore } from "../stores/user";
import { signOut } from 'aws-amplify/auth';
import SimulationPanel from "./SimulationPanel.vue";

const userStore = useUserStore();
const showSimulation = ref(false);

async function userSignOut() {
  try {
    await signOut();
    $router.push("/auth");
  } catch (error) {
    console.log("error signing out: ", error);
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
            <v-btn v-bind="props" color="orange" icon @click="showSimulation = true">
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

  <v-dialog v-model="showSimulation" max-width="700">
    <SimulationPanel @close="showSimulation = false" />
  </v-dialog>
</template>
