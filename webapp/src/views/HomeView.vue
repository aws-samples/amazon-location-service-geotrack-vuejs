<script setup>
import Map from "../components/Map.vue";
import Header from "../components/Header.vue";
import Dashboard from "../components/Dashboard.vue";
</script>

<template>
  <v-app>
    <Suspense>
      <Header />
    </Suspense>
    <Suspense>
      <Dashboard />
    </Suspense>
    <Suspense>
      <Map action="display_routes" />
    </Suspense> 
  </v-app>
</template>

