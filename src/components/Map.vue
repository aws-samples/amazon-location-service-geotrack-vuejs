<template>
  <div class="q-pa-md">
    <div id="markmap" style="width: 100%;height: 40vw"></div>
  </div>
</template>

<script>
import maplibregl from "maplibre-gl";
import { Auth } from "aws-amplify";
import awsconfig from "../../aws-exports";
import { Signer } from "@aws-amplify/core";
import location from "aws-sdk/clients/location";
import { mapState } from "vuex";

export default {
  name: "Map",
  props: {
    action: String,
    params: Object
  },
  data() {
    return {
      map: null,
      showSummary: false,
      destinationPtMarker: new maplibregl.Marker({ color: "#a34a07" }),
      departurePtMarker: new maplibregl.Marker(),
      posInterval: null,
      credentials: null,
      locationService: null,
      center: null,
      zoom: null,
      popUps: {}
    };
  },
  async mounted() {
    this.credentials = await Auth.currentCredentials();
    this.locationService = new location({
      credentials: this.credentials,
      region: awsconfig.aws_project_region,
    });
    await this.initMap();

    if (this.action && this.action === "show_delivery_info" && 
        this.params && this.params != null) {

            console.log(this.params)
            this.$store.dispatch("general/setDepCoord", {
              lnglat: { 'lng': this.params.geoStart.lng, 'lat': this.params.geoStart.lat }
            });
            this.$store.dispatch("general/setDestCoord", {
              lnglat: { 'lng': this.params.geoEnd.lng, 'lat': this.params.geoEnd.lat }
            });
    }

    if (this.action && this.action === "display_routes") {            
       this.posInterval = setInterval(async() => {
            await this.getDeviceIds();
            let trackerInfo = await this.getPositions();
            if (trackerInfo) {
              let today = new Date();
              let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
              let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
              let dateTime = date+' '+time;
              console.log(dateTime + " refreshing " + trackerInfo.length + " devices ")

              for (let i = 0; i < trackerInfo.length; i++) {
                if (!this.popUps[trackerInfo[i].DeviceId]) {
                  this.popUps[trackerInfo[i].DeviceId] = new maplibregl.Popup()
                }
                this.pointOnCircle(trackerInfo[i].Position[0],trackerInfo[i].Position[1],trackerInfo[i].DeviceId,trackerInfo[i].SampleTime)
              }            
            } else {
              console.log("nothing to show!")
            }
        }, 15000)       
    }
    
  },
  beforeDestroy() {
    if (this.posInterval) clearInterval(this.posInterval)
  },
  computed: {
    ...mapState({
      depCoord: (state) => state.general.depCoord,
      destCoord: (state) => state.general.destCoord,
      routeSteps: (state) => state.general.routeSteps,
      routeSummary: (state) => state.general.routeSummary,
      geoFencePolygon: (state) => state.general.geoFencePolygon,
      devicesIdsInRoute: (state) => state.general.devicesIdsInRoute
    }),
  },
  watch: {
    depCoord (newPosition) {
      this.departurePtMarker.setLngLat(newPosition);
      this.departurePtMarker.addTo(this.map);
      this.map.flyTo({
        center: this.departurePtMarker.getLngLat(),
        essential: true,
        zoom: 12,
      });
    },
    destCoord (newPosition) {
      this.destinationPtMarker.setLngLat(newPosition);
      this.destinationPtMarker.addTo(this.map);
      this.map.flyTo({
        center: this.destinationPtMarker.getLngLat(),
        essential: true,
        zoom: 12,
      });
      if (this.geoFencePolygon.length > 0) this.showGeoFence()
    },
    routeSteps (newSteps) {
      this.mapFit()
      this.showRoute(newSteps)
    }
  },
  methods: {
    transformRequest(url, resourceType) {
      if (resourceType === "Style" && !url.includes("://")) {
        // resolve to an AWS URL
        url =
          "https://maps.geo." +
          awsconfig.aws_project_region +
          ".amazonaws.com/maps/v0/maps/" +
          url +
          "/style-descriptor";
      }
      if (url.includes("amazonaws.com")) {
        // only sign AWS requests (with the signature as part of the query string)
        return {
          url: Signer.signUrl(url, {
            access_key: this.credentials.accessKeyId,
            secret_key: this.credentials.secretAccessKey,
            session_token: this.credentials.sessionToken,
          }),
        };
      }
      // Don't sign
      return { url: url || "" };
    },

    pointOnCircle(lng,lat,deviceId,sampleTime) {
      let name = deviceId
      let vm = this
      let color = "#007cbf"

      if (this.map.getLayer(name)) this.map.removeLayer(name);
      if (this.map.getSource(name)) this.map.removeSource(name);
      
      this.map.addSource(name, {
        type: 'geojson',
        data: {
          type: "Point",
          coordinates: [lng, lat]
        }
        });      

      // Add red if timeDiff is X
      //if (mm >= 10) color = '#ff0000'
            
      this.map.addLayer({
        'id': name,
        'source': name,
        'type': 'circle',
        'paint': {
          'circle-radius': 10,
          'circle-color': color
          }
        });      

      this.map.on('click', name, function () {
        vm.popUps[name]
          .setLngLat([lng,lat])
          .setHTML(deviceId + " - " + sampleTime)
          .addTo(vm.map)
      });

      // Change the cursor to a pointer when the mouse is over the states layer.
      this.map.on('mouseenter', name, function () {
        vm.map.getCanvas().style.cursor = 'pointer';
      });
      
      // Change it back to a pointer when it leaves.
      this.map.on('mouseleave', name, function () {
        vm.map.getCanvas().style.cursor = '';
      });

    },

    mapFit() {      
      this.map.fitBounds(
        [this.depCoord, this.destCoord],
        { padding: { top: 100, bottom: 100, left: 100, right: 100 } }
      );      
    },

    showRoute(newSteps) {
      var vmMap = this.map;
      var coordinates = [];
      newSteps.map((item) => {
            coordinates.push(item);
          });
          if (vmMap.getLayer("route")) vmMap.removeLayer("route");
          if (vmMap.getSource("route")) vmMap.removeSource("route");

          vmMap.addSource("route", {
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

          vmMap.addLayer({
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
    },

    showGeoFence() {
      if (this.map.getLayer("destFence")) this.map.removeLayer("destFence");
      if (this.map.getSource("destFence")) this.map.removeSource("destFence");

      this.map.addSource("destFence", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "Polygon",
                coordinates: this.geoFencePolygon,
              },
            },
          });
      
      this.map.addLayer({
            id: "destFence",
            type: "fill",
            source: "destFence",
            'paint': {
              'fill-color': '#565859',
              'fill-opacity': 0.5
              }
          });
    },
    
    async getDeviceIds() {
      try {
        await this.$store.dispatch("general/fetchDevicesIdsInRoute", {filter: {
            status: {
                ne: "completed"
            }
        }});          
      } catch (error) {
        console.error(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          icon: "warning",
          message: "Something went wrong!"
        });
      }
    },

    /**
     * Returns an array with arrays of the given size.
     *
     * @param myArray {Array} Array to split
     * @param chunkSize {Integer} Size of every group
     */
    chunkArray(myArray, chunk_size){
        var results = [];
        
        while (myArray.length) {
            results.push(myArray.splice(0, chunk_size));
        }
        
        return results;
    },

    getTimeDiffFromNow(sampleTime) {
      let currentD = Date.now();
      let dtTimeStamp = Date.parse(sampleTime)
      let dtDiff = currentD - dtTimeStamp
      
      var msec = dtDiff;
      var hh = Math.floor(msec / 1000 / 60 / 60); // hours
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60); // minutes

      return {'hh': hh, 'mm': mm}

    },

    batchGetDevicePosition(params) {
      var vm = this;
      return new Promise(function(resolve, reject) {
        vm.locationService.batchGetDevicePosition(params, function(
            err,
            data
          ) {
            if (err) {
              console.log(err, err.stack);
              reject([]);
            } else {
              resolve(data.DevicePositions)
            }
          })
      })
    },

    async getPositions() {
      
        if (this.devicesIdsInRoute == 0) return [];

        let devicePositionAll = []
        // Breaking into arrays of 10 items as per batchGetDevicePosition limit
        let deviceIdsChunks = this.chunkArray(this.devicesIdsInRoute,10)

        for (let i = 0; i < deviceIdsChunks.length; i++) {
          var params = {
            DeviceIds: deviceIdsChunks[i],
            TrackerName: process.env.VUE_APP_TRACKER,
          };

          let bathPos = await this.batchGetDevicePosition(params)
            
          for (let p = 0; p < bathPos.length; p++) {
            let timeDiff = this.getTimeDiffFromNow(bathPos[p].SampleTime)     
            if (timeDiff.hh <= 24) {
              devicePositionAll.push(bathPos[p])
            }
          }              

        } //for
        return devicePositionAll;       
      
    },

    initMap() {
      var vm = this;
      return new Promise(function(resolve) {
        vm.center = new maplibregl.LngLat(0, 0);
        vm.zoom = 2;
        vm.map = new maplibregl.Map({
          container: "markmap",
          //Specify the centre of the map when it gets rendered
          center: vm.center,
          zoom: vm.zoom, //Adjust the zoom level
          style: process.env.VUE_APP_MAP,
          transformRequest: vm.transformRequest,
        });
        //Zoom in and out button
        vm.map.addControl(new maplibregl.NavigationControl(), "top-left");
        //A button that allows the map to fly to user’s current location when pressed
        vm.map.addControl(
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
  }
}
</script>
