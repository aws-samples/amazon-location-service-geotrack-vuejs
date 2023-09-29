<!-- 
This is the default layout that integrates with the user information

(c) 2022 Amazon Web Services, Inc. or its affiliates. All Rights Reserved.  
This AWS Content is provided subject to the terms of the AWS Customer Agreement available at  
http://aws.amazon.com/agreement or other written agreement between Customer and either
Amazon Web Services, Inc. or Amazon Web Services EMEA SARL or both. 
-->
<template>
    <div>
      <v-card color="grey lighten-4" flat tile>
        <v-toolbar tile dark color="blue">
  
          <v-toolbar-title>Oktank Shipment</v-toolbar-title>
  
          <v-spacer></v-spacer>
  
          <v-btn icon @click="$router.push('/trips')">
              <v-icon>mdi-security</v-icon>
          </v-btn> 
  
          <span>{{ userStore.fullname }}</span>
  
          <v-btn icon>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon @click="signOut" v-bind="attrs" v-on="on">
                  <v-icon>mdi-export</v-icon>
                </v-btn>
              </template>
              <span>logout</span>
            </v-tooltip>
          </v-btn>
        </v-toolbar>
      </v-card>
  
      <v-main>
        <v-container>
          <router-view></router-view>
        </v-container>
      </v-main>
    </div>
  
  </template>    
  <script>
  import { Auth } from "aws-amplify";
  import { useUserStore } from "../stores/user";
  
  export default {
    name: "default-layout",
    data: () => ({
        userStore: useUserStore()
    }),
    computed: {
      isMobile() {
        return this.$vuetify.breakpoint.xsOnly;
      },
    },
    methods: {
      async signOut() {
        try {
          await Auth.signOut();
          this.$router.push("/auth");
        } catch (error) {
          console.log("error signing out: ", error);
        }
      },
    }
  };
  </script>
  