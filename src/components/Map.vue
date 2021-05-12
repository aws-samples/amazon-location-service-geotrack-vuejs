<template>
  <div>
    <div id="markmap" style="width: 100%;height: 40vw"></div>
  </div>
</template>

<script>
import maplibre from "maplibre-gl";
import { Auth } from "aws-amplify";
import awsconfig from '../aws-exports'
import { Signer } from "@aws-amplify/core";
import location from "aws-sdk/clients/location";

export default {
  name: "Map",
  props: ['row'],
  data() {
    return {
      credentials: null,
      service: null,
      positions: [],
      center: null,
      zoom: null
    };
  },  
  async mounted() {        
    this.credentials = await Auth.currentCredentials();
    this.service = new location({
        credentials: this.credentials,
        region: awsconfig.aws_project_region,
    });
    this.positions = await this.getPositions();
    this.initMap();
  },
  methods: {
    transformRequest(url,resourceType){  
        if (resourceType === "Style" && !url.includes("://")) {
            // resolve to an AWS URL
            url = "https://maps.geo." + awsconfig.aws_project_region + ".amazonaws.com/maps/v0/maps/" + url +"/style-descriptor";            
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

    getPositions() {
      var vm = this
      return new Promise(function (resolve, reject) {
        const msSinceEpoch = (new Date()).getTime();
        const now15minbefore = new Date(msSinceEpoch - (15 * 60 * 1000));

        var params = {
          DeviceId: vm.row.deviceId,
          TrackerName: process.env.VUE_APP_TRACKER_NAME,
          EndTimeExclusive: new Date(),
          StartTimeInclusive: now15minbefore
        };

        vm.service.getDevicePositionHistory(params, function(err, data) {
          if (err) { 
            console.log(err, err.stack);
            reject(err);
          }
          else { 
            console.log(data);
            resolve(data.DevicePositions);
          }        
        });
      })
    },

    async initMap() {

      if (this.positions && this.positions.length != 0) {
        this.center = new maplibre.LngLat(this.positions[0].Position[0], this.positions[0].Position[1])
        this.zoom = 12               
      }
      else {
        this.center = new maplibre.LngLat(0,0)
        this.zoom = 2
      }
  
      let map = new maplibre.Map({
            container: "markmap",
           //Specify the centre of the map when it gets rendered
            center: this.center, 
            zoom: this.zoom, //Adjust the zoom level
            style: process.env.VUE_APP_MAP_NAME,
            transformRequest: this.transformRequest
        });
        //Zoom in and out button
        map.addControl(new maplibre.NavigationControl(), "top-left"); 
        //A button that allows the map to fly to user’s current location when pressed
        map.addControl(
            new maplibre.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
            })
        );
        if (this.positions) {
          for (let i = 0; i < this.positions.length; i++) {
              new maplibre.Marker()
                .setLngLat(this.positions[i].Position)
                .setPopup(new maplibre.Popup().setHTML(this.positions[i].ReceivedTime)) // add popup
                .addTo(map);
          }
        }
    },
  },
};
</script>
