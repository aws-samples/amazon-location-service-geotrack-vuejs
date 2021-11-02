<template>
  <div class="q-pa-md">
    <q-btn-toggle
      v-model="btnToggle"
      @click.native="tableBtn()"
      toggle-color="primary"
      inline
      class="q-mb-md"
      :options="[
        { label: 'Add', value: 'add' },
        { label: 'Remove', value: 'remove' },
      ]"
    />

    <q-table
      :visible-columns="visibleColumns"
      title="Manage Delivery"
      :data="data"
      :columns="columns"
      row-key="id"
      selection="multiple"
      :selected.sync="selected"
    >
      <template v-slot:body-cell-mapPosition="props">
        <q-td :props="props">
          <q-btn
            dense
            round
            flat
            color="black"
            @click="toggleShowMap(props)"
            icon="map"
          ></q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="b_addrow" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-bar>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <div class="text-h6">Adding DeliveryInfo</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="onSubmit" @reset="onReset" class="q-gutter-md">
            <q-input
              v-model="userPhone"
              label="Client's mobile phone"
              :maxlength="20"
              unmasked-value
              :mask="phoneMask"
            />

            <q-select
              v-model="agent"
              :options="agentOptions"
              label="Delivery Agent"
            />

            <q-select
              v-model="departure"
              :options="departureOptions"
              use-input
              emit-value
              map-options
              input-debounce="0"
              @filter="filterDep"
              @input="setPlaceCoord"
              label="Departure"
            />

            <q-select
              v-model="destination"
              :options="destinationOptions"
              use-input
              emit-value
              map-options
              input-debounce="0"
              @filter="filterDest"
              @input="setPlaceCoord"
              label="Destination"
            />
            <div>
              <q-btn-group push>
                <q-btn
                  push
                  color="white"
                  text-color="black"
                  @click="calculateRoute"
                  icon="directions"
                  label="Calculate route"
                />
                <q-btn
                  push
                  label="Save"
                  type="Save Route"
                  color="primary"
                  icon="save"
                />
                <q-btn
                  push
                  label="Reset"
                  type="Reset"
                  color="orange"
                  icon="restart_alt"
                />
              </q-btn-group>
            </div>
          </q-form>
        </q-card-section>
        <Map action="show_delivery_info" :params="params" />
      </q-card>
    </q-dialog>

    <q-dialog v-model="showSummary">
      <q-card>
        <q-card-section class="bg-primary text-white">
        <div class="text-h6">Route Summary</div>
      </q-card-section>

        <q-list>
          <q-item>
          <q-item-section avatar>
            <q-icon color="blue" name="add_road" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Estimate Distance</q-item-label>
            <q-item-label caption>{{ Math.round(routeSummary.Distance ) }} Km</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section avatar>
            <q-icon color="blue" name="schedule" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Estimate Duration</q-item-label>
            <q-item-label caption>{{ Math.round(routeSummary.DurationSeconds / 60) }} min</q-item-label>
          </q-item-section>
        </q-item>
        </q-list>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="b_removerow" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="error_outline" size="xl" color="warning" />
          <span class="q-ml-sm">Delete {{ selected.length }} deliveries?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No" color="black" v-close-popup />
          <q-btn
            flat
            label="Yes"
            color="black"
            v-close-popup
            @click="removeRow"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import { Auth } from "aws-amplify";
import awsconfig from "../aws-exports";
import location from "aws-sdk/clients/location";
import Map from "../components/Map";
import * as turf from "@turf/turf";

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

export default {
  name: "Delivery",
  components: {
    Map,
  },
  data() {
    return {
      showSummary: false,
      summaryData: "",
      routeLegs: [],
      userPhone: "",
      agent: null,
      agentOptions: [],
      showSearch: false,
      destination: null,
      destLocation: {},
      departure: null,
      depLocation: {},
      destinationOptions: [],
      departureOptions: [],
      btnToggle: null,
      visibleColumns: [
        "deliveryAgentFullName",
        "status",
        "createAt",
        "duration",
        "distance",
        "mapPosition",
      ],
      selected: [],
      b_addrow: false,
      b_removerow: false,
      b_map: false,
      params: null,
      credentials: null,
      isNewDevice: true,
      deviceType: "",
      deviceId: "",
      deviceUpdatedAt: "",
      columns: [
        {
          name: "userPhone",
          label: "userPhone",
          field: "userPhone",
        },
        {
          name: "id",
          label: "id",
          field: "id",
        },
        {
          name: "geoFenceId",
          label: "geoFenceId",
          field: "geoFenceId",
        },
        {
          name: "deliveryAgentId",
          label: "AgentId",
          field: "deliveryAgentId",
        },
        {
          name: "deliveryAgentFullName",
          align: "left",
          label: "Agent Name",
          field: "deliveryAgentFullName",
          sortable: true,
        },
        {
          name: "distance",
          label: "Distance (Km)",
          field: "distance",
        },
        {
          name: "duration",
          label: "Duration (Min)",
          field: "duration",
        },
        {
          name: "geoStart",
          label: "geoStart",
          field: "geoStart",
        },
        {
          name: "geoEnd",
          label: "geoEnd",
          field: "geoEnd",
        },
        {
          name: "status",
          label: "Status",
          field: "status",
          sortable: true,
        },
        {
          name: "createdAt",
          label: "created At",
          field: "createdAt",
          sortable: true,
        },
        {
          name: "mapPosition",
          label: "View in Map",
          field: "",
          align: "center",
        },
      ],
      data: [],
    };
  },
  async beforeMount() {
    this.credentials = await Auth.currentCredentials();
    this.locationService = new location({
      credentials: this.credentials,
      region: awsconfig.aws_project_region,
    });
    await this.loadTable();
    await this.loadAgentList();
    this.agentOptions = [];
    for (let i = 0; i < this.agentList.length; i++) {
      this.agentOptions.push({
        label: this.agentList[i].fullName,
        value: this.agentList[i].id,
      });
    }
  },
  computed: {
    phoneMask: {
      get() {
        return this.userPhone.length <= 15
          ? "(###) ###-####"
          : "(##) #####-#####";
      },
    },
    ...mapState({
      deliveryList: (state) => state.general.deliveryList,
      agentList: (state) => state.general.agentList,
      routeSummary: (state) => state.general.routeSummary,
      geoFenceId: (state) => state.general.geoFenceId,
      geoFencePolygon: (state) => state.general.geoFencePolygon,
    }),
    ...mapGetters({
      isAuthenticated: "profile/isAuthenticated",
    }),
  },
  methods: {
    uniqueId() {
      const dateString = Date.now().toString(36);
      const randomness = Math.random()
        .toString(36)
        .substr(2);
      return dateString + randomness;
    },

    tableBtn() {
      if (this.btnToggle && this.btnToggle == "add") {
        this.b_addrow = !this.b_addrow;
      } else if (this.btnToggle && this.btnToggle == "remove") {
        this.b_removerow = !this.b_removerow;
      }
    },

    async onSubmit() {
      try {
        await this.$store.dispatch("general/saveGeoFence", {
          credentials: this.credentials,
          name: this.uniqueId(),
          polygonVertices: this.geoFencePolygon[0],
        });

        var expiredAt = new Date();

        await this.$store.dispatch("general/saveDeliveryInfo", {
          deliveryInfoDeliveryAgentId: this.agent.value,
          geoStart: this.depLocation,
          geoEnd: this.destLocation,
          distance: Math.round(this.routeSummary.Distance).toString(),
          duration: Math.round(
            this.routeSummary.DurationSeconds / 60
          ).toString(),
          geoFenceId: this.geoFenceId,
          userPhone: this.userPhone,
          expireAt: Math.round(expiredAt.addDays(7).getTime()), // Expire the date 7 days from today - DynamoDb Expire
          routeStatus: "initialized",
        });

        this.resetVariables();
        this.loadTable();
      } catch (error) {
        console.error(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          timeout: 5000,
          icon: "warning",
          message: "Error: " + error,
        });
      }
      this.b_addrow = false;
    },

    onReset() {},

    async toggleShowMap(props) {
      this.params = props.row;
      this.userPhone = props.row.userPhone;
      this.agent = props.row.deliveryAgentFullName;
      this.depLocation = props.row.geoStart;
      this.destLocation = props.row.geoEnd;
      this.departure = await this.searchCoords(props.row.geoStart, null);
      this.destination = await this.searchCoords(props.row.geoEnd, null);
      this.b_addrow = true;
    },

    setPlaceCoord(val) {
      var longitude = val[0];
      var latitude = val[1];
      var category = val[2];

      if (category === "destination") {
        this.$store.dispatch("general/setDestCoord", {
          lnglat: { lng: longitude, lat: latitude },
        });
        this.destLocation = { lng: longitude, lat: latitude };
        this.calculateGeoFence([longitude, latitude]);
      }
      if (category === "departure") {
        this.$store.dispatch("general/setDepCoord", {
          lnglat: { lng: longitude, lat: latitude },
        });
        this.depLocation = { lng: longitude, lat: latitude };
      }
    },

    filterDep(val, update, abort) {
      update(async () => {
        if (!val || val.length < 3) {
          this.departureOptions = [];
          abort()
          return
        }
        else { 
          await this.searchCoords(val, "departure");
          return
        }        
      });
    },
    filterDest(val, update, abort) {
      update(async () => {
        if (!val || val.length < 3) { 
          this.destinationOptions = [];
          abort()
          return
        }
        else {
          await this.searchCoords(val, "destination");
          return
        }        
      });
    },

    searchCoords(val, category) {
      let vm=this;
      return new Promise(function(resolve, reject) {
        if (val && val.lat) {          
          vm.locationService.searchPlaceIndexForPosition(
            {
              IndexName: process.env.VUE_APP_PLACE,
              MaxResults: 1,
              Position: [val.lng, val.lat],
            },
            (err, response) => {
              if (err) {
                console.error(err);
                reject (err);
              } else if (response && response.Results.length > 0) {
                resolve (response.Results[0].Place.Label);
              }
            }
          );
        } else {
          let catArray = [category];
          let longitude = -123.11335999999994;
          let latitude = 49.260380000000055;
          vm.locationService.searchPlaceIndexForText(
            {
              IndexName: process.env.VUE_APP_PLACE,
              Text: val,
              MaxResults: 5,
              BiasPosition: [longitude, latitude],
            },
            (err, response) => {
              if (err) {
                console.error(err);
                reject(false);
              } else if (response && response.Results.length > 0) {
                if (category == "departure") vm.departureOptions = [];
                else if (category == "destination") vm.destinationOptions = [];                 
                for (var i = 0; i < response.Results.length; i++) {
                  let coordArray = response.Results[i].Place.Geometry.Point.concat(catArray);
                  if (category == "departure") {
                    vm.departureOptions.push({
                      label: response.Results[i].Place.Label,
                      value: coordArray,
                    });
                  }
                  else if (category == "destination") {
                    vm.destinationOptions.push({
                      label: response.Results[i].Place.Label,
                      value: coordArray,
                    });
                  }                  
                }
              }
            }
          );          
          resolve(true);
        }
      });
    },

    calculateRoute() {
      this.$store.dispatch("general/calculateRoute", {
        credentials: this.credentials,
        depLngLat: this.depLocation,
        destLngLat: this.destLocation,
      });
      this.showSummary = true
    },

    calculateGeoFence(center) {
      var options = {
        steps: 10,
        units: "kilometers",
        options: {},
      };
      var radius = 1;
      var polygon = turf.circle(center, radius, options);

      this.$store.dispatch("general/setGeoFencePolygon", {
        vertices: polygon.geometry.coordinates,
      });
    },

    async loadTable() {
      try {
        await this.$store.dispatch("general/fetchDeliveryInfoList", {});
        this.data = [];
        if (this.deliveryList && this.deliveryList.length > 0) {          
          for (let i = 0; i < this.deliveryList.length; i++) {
            this.data.push({
              id: this.deliveryList[i].id,
              createdAt: this.deliveryList[i].createdAt,
              distance: this.deliveryList[i].distance,
              duration: this.deliveryList[i].duration,
              expireAt: this.deliveryList[i].expiredAt,
              geoStart: this.deliveryList[i].geoStart,
              geoEnd: this.deliveryList[i].geoEnd,
              geoFenceId: this.deliveryList[i].geoFenceId,
              status: this.deliveryList[i].status,
              userPhone: this.deliveryList[i].userPhone,
              deliveryAgentId: this.deliveryList[i].deliveryAgent.id,
              deliveryAgentFullName: this.deliveryList[i].deliveryAgent.fullName            
              });
          }
        }
      } catch (error) {
        console.error(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          icon: "warning",
          message: "Somethine went wrong!",
        });
      }
    },

    async loadAgentList() {
      try {
        await this.$store.dispatch("general/fetchDeliveryAgents", {});
      } catch (error) {
        console.error(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          icon: "warning",
          message: "Something went wrong!",
        });
      }
    },

    resetVariables() {
      this.departure = [];
      this.destination = [];
      this.agent = "";
      this.userPhone = "";
      this.deviceId = "";
      this.params = "";
    },

    async removeRow() {
      try {
        for (let i = 0; i < this.selected.length; i++) {
          await this.$store.dispatch("general/delDelivery", {
            id: this.selected[i].id,
          });
        }

        this.loadTable();

        console.log("Device Deleted");
      } catch (error) {
        console.error(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          timeout: 5000,
          icon: "warning",
          message: "Error: " + error,
        });
      }
    },
  },
};
</script>
