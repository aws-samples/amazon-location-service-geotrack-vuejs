<script setup>
import Map from "../components/Map.vue";
import Header from "../components/Header.vue";
// import { ref } from "vue";
// import { Auth } from "aws-amplify";
// import { useBotStore } from "../stores/bot";
// const store = useBotStore();

</script>

<template>
  <v-app>
    <Header />    
    <Map action="display_routes" />
  </v-app>
</template>

