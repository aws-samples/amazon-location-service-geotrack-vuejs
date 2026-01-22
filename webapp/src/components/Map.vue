<template>
  <div id="markmap" style="width: 100%;height: 40vw"></div>
  <div class="map-overlay top" v-show="showSearch">
    <div class="map-overlay-inner">
      <fieldset>
        <input id="map-search-input" list="map-search-results" placeholder="Search" style="width: 250px;">
        <datalist id="map-search-results">
        </datalist>
      </fieldset>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { fetchAuthSession } from 'aws-amplify/auth';
import maplibregl from "maplibre-gl";
import { LocationClient, BatchGetDevicePositionCommand } from '@aws-sdk/client-location';
import { useGeoStore } from "../stores/geo";
import { ConsoleLogger } from 'aws-amplify/utils';
import { withIdentityPoolId } from '@aws/amazon-location-utilities-auth-helper';
import { generateClient } from 'aws-amplify/api';
import * as subscriptions from '../graphql/subscriptions';

const api_client = generateClient();

const logger = new ConsoleLogger('geotrack');
const authHelper = await withIdentityPoolId(import.meta.env.VITE_IDENTITY_POOL_ID); // use Cognito pool id for credentials
const geoStore = useGeoStore();
const { depCoord, destCoord, routeSteps } = storeToRefs(geoStore)
const showSearch = ref(false);

const locationClient = async () => {
  const session = await fetchAuthSession();
  const client = new LocationClient({
    credentials: session.credentials,
    region: import.meta.env.VITE_AWS_REGION,
  });
  return client;
};

const props = defineProps({
  action: {
    type: String,
    required: true,
  },
  routeParams: {
    type: Object
  }
})

const map = reactive({
  map: null,
  center: [],
  zoom: 0
})

const showSummary = ref(false);
const posInterval = ref(null);
const popUps = ref({});
const subscriptionHandlers = ref([]);

onMounted(async () => {
  await initMap();
});

onUnmounted(() => {
  if (posInterval && posInterval.value > 0) {
    clearInterval(posInterval.value)
  }
  // Unsubscribe from all subscriptions
  subscriptionHandlers.value.forEach(sub => sub.unsubscribe());
});

function flyToMap(position, color = null) {
  let marker = null
  if (color) {
    marker = new maplibregl.Marker({ color: color }).setLngLat(position).addTo(map.map);
  } else {
    marker = new maplibregl.Marker().setLngLat(position).addTo(map.map);
  }
  map.map.flyTo({
    center: marker.getLngLat(),
    essential: true,
    zoom: 14,
  });
};

watch(depCoord, (newPosition) => {
  flyToMap(newPosition)
});

watch(destCoord, (newPosition) => {
  flyToMap(newPosition, "#a34a07")
  showGeoFence(geoStore.calculateGeoFence([newPosition.lng, newPosition.lat]));
});

// watch(geoFencePolygon, (newGeoFencePolygon) => {
//   showGeoFence(newGeoFencePolygon)
// });

// Used to render the route during TripView route creation
watch(routeSteps, (newSteps) => {
  mapFit()
  showRoute(newSteps)
});

async function subscribeToDeviceUpdates() {
  try {
    // Get devices that are in route
    let devicesIds = await geoStore.fetchDevicesIdsInRoute();
    logger.info(`Subscribing to ${devicesIds.length} devices: ${devicesIds.join(', ')}`);
    
    // Subscribe to each device
    devicesIds.forEach(deviceId => {
      logger.info(`Setting up subscription for device: ${deviceId}`);
      
      const subscription = api_client.graphql({
        query: subscriptions.onDevicePositionUpdate,
        variables: { deviceId }
      }).subscribe({
        next: ({ data }) => {
          const update = data.onDevicePositionUpdate;
          console.log(`🔥 SUBSCRIPTION RECEIVED - Device: ${update.deviceId}, Position: [${update.position.lng}, ${update.position.lat}], Time: ${update.timestamp}`);
          logger.info(`🔥 SUBSCRIPTION UPDATE for ${update.deviceId}:`, update.position);
          
          if (!popUps.value[update.deviceId]) {
            popUps.value[update.deviceId] = new maplibregl.Popup();
          }
          
          pointOnCircle(
            update.position.lng,
            update.position.lat,
            update.deviceId,
            update.timestamp
          );
        },
        error: (error) => {
          logger.error(`Subscription error for ${deviceId}:`, error);
        }
      });
      
      subscriptionHandlers.value.push(subscription);
      logger.info(`Subscription active for device: ${deviceId}`);
    });
    
    logger.info(`Total active subscriptions: ${subscriptionHandlers.value.length}`);
    
  } catch (error) {
    logger.error('Error setting up subscriptions:', error);
  }
}

async function readAndShowTracker() {
  posInterval.value = setInterval(async () => {
    // Getting deviceIds from trips that contains status == inroute
    let devicesIds = []
    try {
      devicesIds = await geoStore.fetchDevicesIdsInRoute();
    } catch (error) {
      console.error(error);
    }

    // get the position from Amazon Location Service Tracker 
    let trackerInfo = await getPositions(devicesIds);
    if (trackerInfo) {
      let today = new Date();
      let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
      let dateTime = date + ' ' + time;
      logger.info(dateTime + " refreshing " + trackerInfo.length + " devices ")

      for (let i = 0; i < trackerInfo.length; i++) {
        if (!popUps.value[trackerInfo[i].DeviceId]) {
          popUps.value[trackerInfo[i].DeviceId] = new maplibregl.Popup()
        }
        pointOnCircle(trackerInfo[i].Position[0], trackerInfo[i].Position[1], trackerInfo[i].DeviceId, trackerInfo[i].SampleTime)
      }
    } else {
      logger.info("nothing to show!")
    }
  }, 5000)
}

function pointOnCircle(lng, lat, deviceId, sampleTime) {
  let name = deviceId
  let color = "#007cbf"

  if (map.map.getLayer(name)) map.map.removeLayer(name);
  if (map.map.getSource(name)) map.map.removeSource(name);

  map.map.addSource(name, {
    type: 'geojson',
    data: {
      type: "Point",
      coordinates: [lng, lat]
    }
  });

  map.map.addLayer({
    'id': name,
    'source': name,
    'type': 'circle',
    'paint': {
      'circle-radius': 10,
      'circle-color': color
    }
  });

  // Animate to new position
  const source = map.map.getSource(name);
  if (source) {
    const newCoords = [lng, lat];
    const oldCoords = source._data.coordinates;
    
    if (oldCoords && (oldCoords[0] !== newCoords[0] || oldCoords[1] !== newCoords[1])) {
      let start = null;
      const duration = 4000; // 4 seconds animation
      
      function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        
        const currentLng = oldCoords[0] + (newCoords[0] - oldCoords[0]) * progress;
        const currentLat = oldCoords[1] + (newCoords[1] - oldCoords[1]) * progress;
        
        source.setData({
          type: "Point",
          coordinates: [currentLng, currentLat]
        });
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      
      requestAnimationFrame(animate);
    }
  }

  map.map.on('click', deviceId, function () {
    popUps[name]
      .setLngLat([lng, lat])
      .setHTML(deviceId + " - " + sampleTime)
      .addTo(map.map)
  });
}

function mapFit() {
  map.map.fitBounds(
    [geoStore.depCoord, geoStore.destCoord],
    { padding: { top: 100, bottom: 100, left: 100, right: 100 } }
  );
}

async function showRoute(steps) {
  var coordinates = [];
  steps.map((item) => {
    coordinates.push(item);
  });
  if (map.map.getLayer("route")) map.map.removeLayer("route");
  if (map.map.getLayer("symbols")) map.map.removeLayer("symbols");
  if (map.map.getSource("route")) map.map.removeSource("route");

  map.map.addSource("route", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    },
  });

  map.map.addLayer({
    id: "route",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#009dff",
      "line-width": 8,
      "line-opacity": 0.5,
    },
  });

}

function showGeoFence(geoFencePolygon) {
  if (map.map.getLayer("destFence")) map.map.removeLayer("destFence");
  if (map.map.getSource("destFence")) map.map.removeSource("destFence");

  map.map.addSource("destFence", {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: geoFencePolygon,
      },
    },
  });

  map.map.addLayer({
    id: "destFence",
    type: "fill",
    source: "destFence",
    'paint': {
      'fill-color': '#565859',
      'fill-opacity': 0.5
    }
  });
}



/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
function chunkArray(myArray, chunk_size) {
  var results = [];

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size));
  }

  return results;
}

function getTimeDiffFromNow(sampleTime) {
  let currentD = Date.now();
  let dtTimeStamp = Date.parse(sampleTime)
  let dtDiff = currentD - dtTimeStamp

  var msec = dtDiff;
  var hh = Math.floor(msec / 1000 / 60 / 60); // hours
  msec -= hh * 1000 * 60 * 60;
  var mm = Math.floor(msec / 1000 / 60); // minutes

  return { 'hh': hh, 'mm': mm }
}


async function batchGetDevicePosition(params) {
  const locationService = await locationClient();
  const command = new BatchGetDevicePositionCommand(params);
  const data = await locationService.send(command);
  if (data && data.DevicePositions) {
    return data.DevicePositions
  }
  else {
    console.log(data)
    return []
  }
};

async function getPositions(devicesIdsInRoute) {

  if (devicesIdsInRoute == 0) return [];
  let devicePositionAll = []
  // Breaking into arrays of 10 items as per batchGetDevicePosition limit
  let deviceIdsChunks = chunkArray(devicesIdsInRoute, 10)

  for (let i = 0; i < deviceIdsChunks.length; i++) {
    var params = {
      DeviceIds: deviceIdsChunks[i],
      TrackerName: import.meta.env.VITE_GEOTRACKER,
    };

    let bathPos = await batchGetDevicePosition(params)

    if (bathPos) {
      for (let p = 0; p < bathPos.length; p++) {
        let timeDiff = getTimeDiffFromNow(bathPos[p].SampleTime)
        if (timeDiff.hh <= 24) {
          devicePositionAll.push(bathPos[p])
        }
      }
    }
  }
  return devicePositionAll;
}

async function initMap() {
  logger.info("initMap")
  let url = "https://maps.geo." + import.meta.env.VITE_AWS_REGION + ".amazonaws.com/maps/v0/maps/" + import.meta.env.VITE_GEOMAP + "/style-descriptor";
  logger.info(url)
  return new Promise(function (resolve) {
    map.center = new maplibregl.LngLat(0, 0);
    map.zoom = 5;
    map.map = new maplibregl.Map({
      container: "markmap",
      //Specify the centre of the map when it gets rendered
      center: map.center,
      zoom: map.zoom, //Adjust the zoom level
      style: url, // Defines the appearance of the map
      ...authHelper.getMapAuthenticationOptions(),
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.map.on('mouseenter', function () {
      map.map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.map.on('mouseleave', function () {
      map.map.getCanvas().style.cursor = '';
    });

    map.map.on('load', async function () {
      if (props.action && props.action === "show_route") {
        let route = await geoStore.calculateRoute(props.routeParams.geoStart, props.routeParams.geoEnd)
        const markerDep = new maplibregl.Marker().setLngLat(props.routeParams.geoStart).addTo(map.map);
        const markerDest = new maplibregl.Marker({ color: "#a34a07" }).setLngLat(props.routeParams.geoEnd).addTo(map.map);
        mapFit()
        showRoute(route.steps)
      }

      if (props.action && props.action === "display_routes") {
        showSearch.value = true
        document.getElementById("map-search-input").addEventListener("keypress", async function (e) {
          if (e.key === 'Enter') {
            var input = document.getElementById("map-search-input");
            var option = Array.prototype.find.call(input.list.options, function(option) {
                return option.value === e.target.value;
            });
            if (option) {
              map.map.flyTo({
                center: [option.getAttribute("data-lng"),option.getAttribute("data-lat")],
                essential: true,
                zoom: 12,
              });
            }
          }

          else {
            let longitude = -123.11335999999994;
            let latitude = 49.260380000000055;
            let params = {
              IndexName: import.meta.env.VITE_GEOPLACE_INDEX,
              Text: e.target.value + e.key,
              MaxResults: 8,
              BiasPosition: [longitude, latitude],
            }
            let results = await geoStore.searchPlaceIndexForText(params);
            let options = ''

            results.forEach(function (item) {
              options += '<option data-lng="' + item.value[0] + '" data-lat="' + item.value[1] + '" value="' + item.title + '"></option>';
              document.getElementById('map-search-results').innerHTML = options;
            });
          }
        })
        // Set up real-time subscriptions
        await subscribeToDeviceUpdates()
      }

    });

    //Zoom in and out button
    map.map.addControl(new maplibregl.NavigationControl(), "top-left");
    //A button that allows the map to fly to user’s current location when pressed
    map.map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      })
    );
    resolve();
  });
}
</script>

<style>
.map-overlay {
  font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
  position: absolute;
  width: 400px;
  top: 30px;
  left: 0;
  padding: 50px;
}

.map-overlay .map-overlay-inner {
  background-color: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding: 10px;
  margin-bottom: 10px;
}

.map-overlay-inner fieldset {
  border: none;
  padding: 0;
  margin: 0 0 10px;
}

.map-overlay-inner fieldset:last-child {
  margin: 0;
}

.map-overlay-inner select {
  width: 100%;
}

.map-overlay-inner label {
  display: block;
  font-weight: bold;
  margin: 0 0 5px;
}

.map-overlay-inner button {
  display: inline-block;
  width: 36px;
  height: 20px;
  border: none;
  cursor: pointer;
}

.map-overlay-inner button:focus {
  outline: none;
}

.map-overlay-inner button:hover {
  box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.1);
}


.map-select {
  border: 1px solid;
}
</style>