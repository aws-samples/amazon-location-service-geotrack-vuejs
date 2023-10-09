<script setup>
import { computed, reactive, ref, watch } from "vue";
import { onBeforeMount } from "vue";
import Location from "aws-sdk/clients/location";
import { Auth } from "aws-amplify";
import Map from "../components/Map.vue";
import circle from '@turf/circle'
import Header from "../components/Header.vue";
import { useGeoStore } from "../stores/geo";
import { VDataTable } from "vuetify/labs/VDataTable";

const geoStore = useGeoStore();
const showRoute = ref(false);
const isLoadingDep = ref(false);
const isLoadingDest = ref(false);
const tripsData = ref([])
const driversData = ref([])
const selected = [];
const buttonAddRow = ref(false);
const buttonRemoveRow = ref(false);
const routeParams = ref([]);
const destSearch = ref();
const depSearch = ref();
const items = reactive({
  departure: [],
  destination: []
});
const visibleColumns = [
  "deliveryAgentFullName",
  "status",
  "createAt",
  "duration",
  "distance",
  "mapPosition",
];

const dataHeaders = [
  {
    align: " d-none",
    key: "id",
  },
  {
    align: " d-none",
    key: "geoFenceId",
  },
  {
    align: " d-none",
    key: "driver.id",
  },
  {
    title: "Driver Name",
    key: "driver.fullName",
    sortable: true,
  },
  {
    title: "Distance (Km)",
    key: "distance",
  },
  {
    title: "Duration (Min)",
    key: "duration",
  },
  {
    title: "geoStart",
    key: "geoStart",
  },
  {
    title: "geoEnd",
    key: "geoEnd",
  },
  {
    title: "Status",
    key: "status",
  },
  {
    title: "created At",
    key: "createdAt",
  },
  {
    title:  "View in Map",
    value: "delete",
  },
]

onBeforeMount(async () => {
  await loadTable();
  driversData.value = await geoStore.listDrivers();
});

async function loadTable() {
  try {
    tripsData.value = await geoStore.listTrips();
  } catch (error) {
    console.error(error);
  }
}

const trip = reactive({
  driver: null,
  labelStart: null,
  geoStart: null,
  labelEnd: null,
  geoEnd: null,
  clientPhone: null,
})

async function onSubmit() {
  try {

    let tripRec = await geoStore.createTrip({ trip });

    console.log("Trip saved " + tripRec);

    buttonAddRow.value = false;
    await loadTable();
  } catch (error) {
    console.error(error);
  }
  buttonAddRow.value = false;
}

function onReset() {
  items.departure = null
  items.destination = null
}

async function toggleShowMap(item) {
  geoStore.depCoord = item.geoStart;
  geoStore.destCoord = item.geoEnd;
  await calculateRoute()
  routeParams.value = item
  showRoute.value = true
}

watch(depSearch, async (newValue) => {
  await searchCoords(newValue, "departure");
});

watch(destSearch, async (newValue) => {
  await searchCoords(newValue, "destination");
});

async function searchCoords(val, category) {
  const locationService = new Location({
    credentials: await Auth.currentUserCredentials(),
    region: import.meta.env.VITE_AWS_REGION,
  });
  return new Promise(function (resolve, reject) {
    let placeOptions = []
    if (val && val.lat) {
      locationService.searchPlaceIndexForPosition(
        {
          IndexName: import.meta.env.VITE_GEOPLACE_INDEX,
          MaxResults: 1,
          Position: [val.lng, val.lat],
        },
        (err, response) => {
          if (err) {
            console.error(err);
            reject(err);
          } else if (response && response.Results.length > 0) {
            resolve(response.Results[0].Place.Label);
          }
        }
      );
    } else if (val && val.length > 3) {
      if (category == "departure") {
        isLoadingDep.value = true;
      }
      else {
        isLoadingDest.value = true
      }
      let longitude = -123.11335999999994;
      let latitude = 49.260380000000055;
      locationService.searchPlaceIndexForText(
        {
          IndexName: import.meta.env.VITE_GEOPLACE_INDEX,
          Text: val,
          MaxResults: 8,
          BiasPosition: [longitude, latitude],
        },
        (err, response) => {
          if (err) {
            console.error(err);
            reject(placeOptions);
          } else if (response && response.Results.length > 0) {
            for (var i = 0; i < response.Results.length; i++) {
              placeOptions.push({
                title: response.Results[i].Place.Label,
                value: response.Results[i].Place.Geometry.Point,
              });
            }
          }
          if (category == "departure") {
            items.departure = [...placeOptions]
            isLoadingDep.value = true;
          } else {
            items.destination = [...placeOptions]
            isLoadingDest.value = true;
          }
        }
      );
      resolve();
    }
  });
}

async function calculateRoute() {
  const locationService = new Location({
    credentials: await Auth.currentUserCredentials(),
    region: import.meta.env.VITE_AWS_REGION,
  });
  // Create geofence
  calculateGeoFence([geoStore.destCoord.lng, geoStore.destCoord.lat]);
  return new Promise((resolve, reject) => {
    console.group("calculateRoute");
    var params = {
      CalculatorName: import.meta.env.VITE_GEOROUTE_CALCULATION,
      DeparturePosition: [
        geoStore.depCoord.lng,
        geoStore.depCoord.lat,
      ],
      DestinationPosition: [
        geoStore.destCoord.lng,
        geoStore.destCoord.lat,
      ],
      DepartNow: false,
      IncludeLegGeometry: true,
      TravelMode: 'Car'
    };

    locationService.calculateRoute(params, function (err, data) {
      if (err) {
        console.error(err, err.stack);
        console.groupEnd();
        reject("Rejected");
      }
      else {
        geoStore.routeSteps = [...data.Legs[0].Geometry.LineString];
        geoStore.routeSummary = data.Summary;
        console.groupEnd();
        resolve("Resolved");
      }
    })
  });
}

function calculateGeoFence(center) {
  var options = {
    steps: 10,
    units: "kilometers",
    options: {},
  };
  var radius = 1;
  var polygon = circle(center, radius, options);
  geoStore.geoFencePolygon = polygon.geometry.coordinates
}

function setDestCoord(val) {
  if (val && val.title) {
    let lng = val.value[0];
    let lat = val.value[1];
    geoStore.destCoord = { 'lng': lng, 'lat': lat }
    trip.labelEnd = val.title
  }
}

function setDepCoord(val) {
  if (val && val.title) {
    let lng = val.value[0];
    let lat = val.value[1];
    geoStore.depCoord = { 'lng': lng, 'lat': lat }
    trip.labelStart = val.title
  }
}

function resetVariables() {
  this.departure = [];
  this.destination = [];
  this.agent = "";
  this.userPhone = "";
  this.deviceId = "";
  this.params = "";
}
</script>

<template>
  <div>
    <Header />

    <v-container>
      <v-btn-toggle>
        <v-btn size="small" variant="outlined" prepend-icon="mdi-plus-circle-outline" @click="buttonAddRow = true">
          Add Trip
        </v-btn>
        <v-btn size="small" variant="outlined" prepend-icon="mdi-delete-circle-outline" @click="buttonRemoveRow">
          Del Trip
        </v-btn>
      </v-btn-toggle>

      <v-card>
        <v-data-table :headers="dataHeaders" :items="tripsData" item-value="name" class="elevation-1" show-select
          density="compact">
        
          <template v-slot:item.delete="{ item }">
            <v-btn variant="plain" icon="mdi-map-legend" @click="toggleShowMap(item)"></v-btn>               
          </template>
        
        </v-data-table>
      </v-card>
    </v-container>

    <v-dialog v-model="buttonAddRow" width="600" height="800">
      <v-card>
        <v-form @submit.prevent="onSubmit">
          <v-card-title>
            <span class="text-h5">New Trip</span>
          </v-card-title>

         <v-text-field
              v-model="clientPhone"
              label="Client's mobile phone"
              :maxlength="20"              
            />

          <v-autocomplete v-model="trip.geoStart" :items="items.departure" v-model:search="depSearch"
            @update:modelValue="setDepCoord" clearable hide-details no-filter return-object
            label="Search for departure"></v-autocomplete>

          <v-autocomplete v-model="trip.geoEnd" :items="items.destination" v-model:search="destSearch"
            @update:modelValue="setDestCoord" clearable hide-details no-filter return-object
            label="Search for destination"></v-autocomplete>

          <v-autocomplete v-model="trip.driver" :items="driversData" item-title="fullName" item-value="id" clearable
            return-object label="Pick a driver"></v-autocomplete>

          <div>
            <v-btn-group push>
              <v-btn @click="calculateRoute">Route</v-btn>
              <v-btn type="submit">Save</v-btn>
              <v-btn type="reset">Reset</v-btn>
            </v-btn-group>
          </div>
          <Map />
        </v-form>
      </v-card>
    </v-dialog>



    <v-dialog v-model="showRoute" width="600" height="800">
      <v-card>
        <v-card-title>
            <span class="text-h5">Route Summary</span>
          </v-card-title>

        <v-list>
          <v-list-item>
            <v-list-item-subtitle>Estimate Distance</v-list-item-subtitle>
            <div>{{ Math.round(geoStore.routeSummary.Distance) }} Km</div>
          </v-list-item>

          <v-list-item>


            <v-list-item-subtitle>Estimate Duration</v-list-item-subtitle>
            <div>{{ Math.round(geoStore.routeSummary.DurationSeconds / 60) }} min</div>
          </v-list-item>
        </v-list>

        <Map action="show_route" :routeParams="routeParams"/>

        <v-card-actions>
            <v-btn>Close</v-btn>      
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="buttonRemoveRow" persistent>
      <v-card>
        <v-card-text class="row items-center">
          <v-icon name="error_outline" size="xl" color="warning" />
          <span class="v-ml-sm">Delete {{ selected.length }} deliveries?</span>
        </v-card-text>

        <v-card-actions align="right">
          <v-btn flat>NO</v-btn>
          <v-btn flat label="Yes" @click="removeRow" />
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
