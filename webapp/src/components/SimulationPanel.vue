<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGeoStore } from '../stores/geo';
import { fetchAuthSession } from 'aws-amplify/auth';
import axios from 'axios';

const emit = defineEmits(['close']);
const geoStore = useGeoStore();

const trips = ref([]);
const selectedTrips = ref([]);
const loading = ref(false);
const simulating = ref(false);
const alert = ref({ show: false, type: 'info', message: '' });

const conflicts = computed(() => {
  const deviceMap = {};
  const conflictList = [];
  
  selectedTrips.value.forEach(tripId => {
    const trip = trips.value.find(t => t.id === tripId);
    if (trip?.driver?.deviceId) {
      const deviceId = trip.driver.deviceId;
      if (!deviceMap[deviceId]) {
        deviceMap[deviceId] = [];
      }
      deviceMap[deviceId].push(trip);
    }
  });
  
  Object.entries(deviceMap).forEach(([deviceId, tripList]) => {
    if (tripList.length > 1) {
      conflictList.push({
        deviceId,
        trips: tripList.map(t => ({ id: t.id, driver: t.driver.fullName, route: `${t.labelStart} → ${t.labelEnd}` }))
      });
    }
  });
  
  return conflictList;
});

const hasConflicts = computed(() => conflicts.value.length > 0);

onMounted(async () => {
  loading.value = true;
  try {
    const result = await geoStore.listTrips();
    trips.value = result || [];
    console.log('Loaded trips:', trips.value.length);
  } catch (error) {
    console.error('Failed to load trips:', error);
    alert.value = { show: true, type: 'error', message: `Failed to load trips: ${error.message}` };
  } finally {
    loading.value = false;
  }
});

async function startSimulation() {
  if (selectedTrips.value.length === 0) {
    alert.value = { show: true, type: 'warning', message: 'Please select at least one route' };
    return;
  }
  
  simulating.value = true;
  try {
    const session = await fetchAuthSession();
    const jwt = session.tokens.idToken;
    const options = { headers: { 'Authorization': jwt } };
    
    const payload = selectedTrips.value.length === trips.value.length 
      ? {} 
      : { tripIds: selectedTrips.value };
    
    const response = await axios.post(import.meta.env.VITE_API_URL + "/launch", payload, options);
    
    if (response.status === 200) {
      alert.value = { show: true, type: 'success', message: response.data.msg || 'Simulation started' };
      setTimeout(() => emit('close'), 2000);
    } else {
      alert.value = { show: true, type: 'error', message: response.data.msg || 'Simulation failed' };
    }
  } catch (error) {
    alert.value = { show: true, type: 'error', message: error.message };
  } finally {
    simulating.value = false;
  }
}

function selectAll() {
  selectedTrips.value = trips.value.map(t => t.id);
}

function clearAll() {
  selectedTrips.value = [];
}
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Simulation Control Panel</span>
      <v-btn icon="mdi-close" variant="text" @click="emit('close')"></v-btn>
    </v-card-title>

    <v-card-text>
      <v-alert v-if="alert.show" :type="alert.type" density="compact" closable @click:close="alert.show = false">
        {{ alert.message }}
      </v-alert>

      <v-alert v-if="hasConflicts" type="warning" density="compact" class="mb-4">
        <div class="text-subtitle-2">IoT Device Conflicts Detected:</div>
        <div v-for="conflict in conflicts" :key="conflict.deviceId" class="text-caption mt-1">
          Device {{ conflict.deviceId }}: {{ conflict.trips.length }} routes
        </div>
      </v-alert>

      <div class="d-flex justify-space-between mb-2">
        <div>
          <v-btn size="small" @click="selectAll" class="mr-2">Select All</v-btn>
          <v-btn size="small" @click="clearAll">Clear All</v-btn>
        </div>
        <div class="text-caption">{{ selectedTrips.length }} / {{ trips.length }} selected</div>
      </div>

      <v-progress-linear v-if="loading" indeterminate></v-progress-linear>

      <v-alert v-else-if="trips.length === 0" type="info" density="compact">
        No trips available. Create some delivery routes first.
      </v-alert>

      <v-list v-else density="compact" max-height="400" class="overflow-y-auto">
        <v-list-item v-for="trip in trips" :key="trip.id" :value="trip.id">
          <template v-slot:prepend>
            <v-checkbox-btn v-model="selectedTrips" :value="trip.id"></v-checkbox-btn>
          </template>
          <v-list-item-title>{{ trip.driver.fullName }}</v-list-item-title>
          <v-list-item-subtitle>
            {{ trip.labelStart }} → {{ trip.labelEnd }}
          </v-list-item-subtitle>
          <template v-slot:append>
            <v-chip size="x-small" :color="trip.status === 'inroute' ? 'green' : 'grey'">
              {{ trip.status }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn @click="emit('close')" :disabled="simulating">Cancel</v-btn>
      <v-btn 
        color="orange" 
        @click="startSimulation" 
        :loading="simulating"
        :disabled="selectedTrips.length === 0"
      >
        Start Simulation
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
