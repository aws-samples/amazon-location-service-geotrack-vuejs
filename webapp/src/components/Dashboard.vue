<script setup>
import { ref, onMounted, computed } from 'vue';
import { useGeoStore } from '../stores/geo';

const geoStore = useGeoStore();
const trips = ref([]);
const loading = ref(true);

onMounted(async () => {
  await loadData();
  setInterval(loadData, 30000); // Refresh every 30 seconds
});

async function loadData() {
  try {
    trips.value = await geoStore.listTrips();
  } catch (error) {
    console.error('Error loading trips:', error);
  } finally {
    loading.value = false;
  }
}

const activeDeliveries = computed(() => {
  return trips.value.filter(t => t.status === 'inroute').length;
});

const completedToday = computed(() => {
  const today = new Date().toDateString();
  return trips.value.filter(t => {
    if (t.status === 'completed' && t.updatedAt) {
      return new Date(t.updatedAt).toDateString() === today;
    }
    return false;
  }).length;
});

const averageTime = computed(() => {
  const completed = trips.value.filter(t => t.status === 'completed' && t.duration);
  if (completed.length === 0) return 0;
  const total = completed.reduce((sum, t) => sum + (t.duration || 0), 0);
  return Math.round(total / completed.length);
});

const totalDistance = computed(() => {
  const active = trips.value.filter(t => t.status === 'inroute');
  return active.reduce((sum, t) => sum + (t.distance || 0), 0).toFixed(1);
});

const pendingTrips = computed(() => {
  return trips.value.filter(t => t.status === 'accepted').length;
});
</script>

<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <h2 class="text-h5 mb-4">Delivery Dashboard</h2>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col cols="12" sm="6" md="3">
        <v-card color="blue-darken-2" dark>
          <v-card-text>
            <div class="text-overline">Active Deliveries</div>
            <div class="text-h3">{{ activeDeliveries }}</div>
            <v-icon size="48" class="float-right mt-n8">mdi-truck-delivery</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="green-darken-2" dark>
          <v-card-text>
            <div class="text-overline">Completed Today</div>
            <div class="text-h3">{{ completedToday }}</div>
            <v-icon size="48" class="float-right mt-n8">mdi-check-circle</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="orange-darken-2" dark>
          <v-card-text>
            <div class="text-overline">Avg Time (min)</div>
            <div class="text-h3">{{ averageTime }}</div>
            <v-icon size="48" class="float-right mt-n8">mdi-clock-outline</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card color="purple-darken-2" dark>
          <v-card-text>
            <div class="text-overline">Pending Routes</div>
            <div class="text-h3">{{ pendingTrips }}</div>
            <v-icon size="48" class="float-right mt-n8">mdi-map-marker-path</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Active Routes</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="trip in trips.filter(t => t.status === 'inroute')"
                :key="trip.id"
              >
                <template v-slot:prepend>
                  <v-icon color="blue">mdi-map-marker</v-icon>
                </template>
                <v-list-item-title>{{ trip.driver?.fullName || 'Unknown' }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ trip.labelStart }} → {{ trip.labelEnd }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip size="small" color="blue">{{ trip.distance }} km</v-chip>
                </template>
              </v-list-item>
              <v-list-item v-if="activeDeliveries === 0">
                <v-list-item-title class="text-grey">No active deliveries</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Recent Completions</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item
                v-for="trip in trips.filter(t => t.status === 'completed').slice(0, 5)"
                :key="trip.id"
              >
                <template v-slot:prepend>
                  <v-icon color="green">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>{{ trip.driver?.fullName || 'Unknown' }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ trip.labelEnd }}
                </v-list-item-subtitle>
                <template v-slot:append>
                  <v-chip size="small" color="green">{{ trip.duration }} min</v-chip>
                </template>
              </v-list-item>
              <v-list-item v-if="completedToday === 0">
                <v-list-item-title class="text-grey">No completions today</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
