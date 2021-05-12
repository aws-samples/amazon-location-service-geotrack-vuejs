<template>
  <div class="q-pa-md">
    <q-table
      :visible-columns="visibleColumns"
      title="User/Devices"
      :data="data"
      :columns="columns"
      row-key="userId"
      selection="multiple"
      :selected.sync="selected"
    >
    
      <template v-slot:body-cell-mapPosition="props">
        <q-td :props="props">
          <q-btn dense round flat color="black" @click="toggleShowMap(props)" icon="map"></q-btn>
        </q-td>          
      </template>

      <template v-slot:top>
        <q-btn
          class="bg-primary text-white q-my-md"
          label="Add"
          @click="toggleAddRow"
        />
        <q-separator dark vertical />
        <q-btn
          class="bg-primary text-white q-my-md"
          label="Remove"
          @click="toggleRemoveRow"
        />
        <q-space />
      </template>
    </q-table>

    <q-dialog v-model="b_map" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Last Position</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle2">Resident: {{ fullName }}</div>
        </q-card-section>
        <q-card-section>
          <Map :row="tabledata"/>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="b_addrow" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">New/User Device</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            label="First Name"
            hint="Name"
            v-model="fullName"
            autofocus
            @keyup.enter="prompt = false"
          />

          <q-input
            label="Device Type"
            hint="Vendor and Model"
            v-model="deviceType"
            autofocus
            @keyup.enter="prompt = false"
          />

          <q-input
            label="Device Id"
            hint="The Device Id"
            v-model="deviceId"
            autofocus
            @keyup.enter="prompt = false"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn flat label="Add Record" v-close-popup @click="saveRow" />
        </q-card-actions>
      </q-card>
    </q-dialog>


    <q-dialog v-model="b_removerow" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-icon name="error_outline" size="xl" color="warning" />
          <span class="q-ml-sm">Delete {{ selected.length }} users?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No" color="black" v-close-popup />
          <q-btn flat label="Yes" color="black" v-close-popup @click="removeRow"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>
<script>
import { mapState, mapGetters } from "vuex";
import { Auth } from "aws-amplify";
import Map from '../components/Map'

export default {
  name: "Home",
  components: {
    Map
  },
  data() {
    return {
      visibleColumns: [ 'fullname', 'email', 'deviceType', 'deviceId', 'action', 'mapPosition' ],
      selected: [],
      b_addrow: false,
      b_removerow: false,
      b_map: false,
      tabledata: null,
      credentials: null,
      userID: "",
      fullName: "",
      email: "",
      location: "",
      isNewDevice: true,
      deviceType: "",
      deviceId: "",
      deviceUpdatedAt: "",
      columns: [
        {
          name: "userId",
          label: "userId",
          field: "userId"
        },
        {
          name: "fullname",
          align: "left",
          label: "Full Name",
          field: "fullName",
          sortable: true,
        },
        {
          name: "deviceType",
          label: "deviceType",
          field: "deviceType",
          sortable: true,
        },
        {
          name: "deviceId",
          label: "deviceId",
          field: "deviceId",
          sortable: true,
        },        
        { name: 'mapPosition', 
          label: 'LastPositions', 
          field: '', 
          align:'center' 
        },
        {
          name: "deviceUpdatedAt",
          label: "deviceUpdatedAt",
          field: "deviceUpdatedAt",
        }
      ],
      data: [],
    };
  },  
  async beforeMount() {
    this.credentials = await Auth.currentCredentials();
    await this.loadTable();    
  },
  computed: {
    ...mapState({
      userDeviceList: (state) => state.general.userDeviceList,
      locationList: (state) => state.general.locationList,
      paginationToken: (state) => state.general.paginationToken,
      userRec: (state) => state.general.userRec,
      deviceRec: (state) => state.general.deviceRec
    }),
    ...mapGetters({
      isAuthenticated: "profile/isAuthenticated",
    }),
  },
  methods: {
    // emulate fetching data from server

    toggleAddRow() {
      this.b_addrow = !this.b_addrow;
    },
    toggleRemoveRow() {
      this.b_removerow = !this.b_removerow;
    },

    toggleShowMap(param) {
        this.fullName = param.row.fullName;
        this.tabledata = param.row;
        this.b_map = !this.b_map;                   
    },

    resetVariables() {
      this.userID = "";
      this.fullName = "";
      this.location = "";
      this.deviceId = "";
    },

    async loadTable() {
      try {
        await this.$store.dispatch("general/fetchUsers", {});
        this.data = []
        if (this.userDeviceList && this.userDeviceList.length > 0) {          
          for (let i=0; i < this.userDeviceList.length; i++) { 
            this.data.push({
              userId: this.userDeviceList[i].id,
              fullName: this.userDeviceList[i].fullName,
              deviceId: this.userDeviceList[i].device.id,     
              deviceType: this.userDeviceList[i].device.deviceType,
              deviceUpdatedAt: this.userDeviceList[i].device.updatedAt,
            })
          }        
        }             
      } catch (error) {
        console.error(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          icon: "warning",
          message: "Somethine went wrong!"
        });
      }
    },

    async saveRow() {
      // Check for deviceId

      try {
        await this.$store.dispatch("general/saveUser", {
          id: this.userID,
          fullName: this.fullName,
          userDeviceId: this.deviceId,
        });
        console.log("User Saved " + this.userRec.id);        

        await this.$store.dispatch("general/saveDevice", {
          isNewDevice: this.isNewDevice,
          id: this.deviceId,
          deviceType: this.deviceType,
          userID: this.userRec.id,
          deviceGeoFenceId: this.location //from select
        });

        this.resetVariables();
        this.loadTable();
        
        console.log("Device Saved");
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

    async removeRow() {
      try {
        for (let i = 0; i < this.selected.length; i++) { 
          await this.$store.dispatch("general/delUser", {
            id: this.selected[i].userId
          });
          console.log("User Deleted ");        

          await this.$store.dispatch("general/delDevice", {
            id: this.selected[i].deviceId,
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
    }
  },
};

</script>
