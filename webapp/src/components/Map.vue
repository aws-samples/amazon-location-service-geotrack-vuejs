<template>
  <div>
    <div id="markmap" style="width: 100%;height: 40vw"></div>
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

const logger = new ConsoleLogger('geotrack');
const authHelper = await withIdentityPoolId(import.meta.env.VITE_IDENTITY_POOL_ID); // use Cognito pool id for credentials
const geoStore = useGeoStore();
const { depCoord, destCoord, routeSteps } = storeToRefs(geoStore)

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
const popUps = ref({})

onMounted(async () => {
  await initMap();
});

onUnmounted(() => {
  if (posInterval && posInterval.value > 0) { 
    clearInterval(posInterval.value) 
  }
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
        if (!popUps[trackerInfo[i].DeviceId]) {
          popUps[trackerInfo[i].DeviceId] = new maplibregl.Popup()
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

  // Add red if timeDiff is X
  //if (mm >= 10) color = '#ff0000'

  map.map.addLayer({
    'id': name,
    'source': name,
    'type': 'circle',
    'paint': {
      'circle-radius': 10,
      'circle-color': color
    }
  });

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
        let route = await geoStore.calculateRoute(props.routeParams.geoStart,props.routeParams.geoEnd)  
        const markerDep = new maplibregl.Marker().setLngLat(props.routeParams.geoStart).addTo(map.map);
        const markerDest = new maplibregl.Marker({ color: "#a34a07" }).setLngLat(props.routeParams.geoEnd).addTo(map.map);
        mapFit()
        showRoute(route.steps)
      }

      if (props.action && props.action === "display_routes") {
        await readAndShowTracker()
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