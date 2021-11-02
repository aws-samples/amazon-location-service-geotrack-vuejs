<template>
  <div class="q-pa-md">
    <q-btn-toggle
      v-model="btnToggle"
      @click.native="tableBtn()"
      toggle-color="primary"
      inline
      class="q-mb-md"
      :options="[
        {label: 'Add', value: 'add'},
        {label: 'Remove', value: 'remove'},
      ]"
    />

    <q-table
      :visible-columns="visibleColumns"
      title="Manage Agents"
      :data="data"
      :columns="columns"
      row-key="agentId"
      selection="multiple"
      :selected.sync="selected"
    />

    <q-dialog v-model="b_addrow" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">New/agent Device</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            label="Full Name"
            hint="Name"
            v-model="fullName"
            autofocus
            @keyup.enter="prompt = false"
          />

          <q-select 
            v-model="deliveryType" 
            :options="optionsDelivery" 
            label="Delivery Type" />

          <q-select 
            v-model="deviceType" 
            :options="optionsDevice" 
            label="Device Type" />

          <q-input
            label="Device Id"
            hint="The tracker device Id"
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
          <span class="q-ml-sm">Delete {{ selected.length }} agents?</span>
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

export default {
  name: "Home",
  data() {
    return {
      btnToggle: null,
      optionsDelivery: [
        'Motorcycle', 'Car'
      ],
      optionsDevice: [
        'iPhone', 'Android', 'IoT'
      ],
      visibleColumns: [ 'fullname', 'deliveryType',  'deviceType', 'deviceId' ],
      selected: [],
      b_addrow: false,
      b_removerow: false,
      b_map: false,
      tabledata: null,
      credentials: null,
      agentId: "",
      fullName: "",
      email: "",
      location: "",
      isNewDevice: true,
      deviceType: "",
      deviceId: "",
      deliveryType: "",
      deviceUpdatedAt: "",
      columns: [
        {
          name: "agentId",
          label: "agentId",
          field: "agentId"
        },
        {
          name: "fullname",
          align: "left",
          label: "Full Name",
          field: "fullName",
          sortable: true,
        },
        {
          name: "deliveryType",
          label: "Delivery Type",
          field: "deliveryType",
          sortable: true,
        },
        {
          name: "deviceType",
          label: "Device Type",
          field: "deviceType",
          sortable: true,
        },
        {
          name: "deviceId",
          label: "Device Id",
          field: "deviceId",
          sortable: true,
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
      agentList: (state) => state.general.agentList,
      locationList: (state) => state.general.locationList,
      paginationToken: (state) => state.general.paginationToken,
      agentRec: (state) => state.general.agentRec,
      deviceRec: (state) => state.general.deviceRec
    }),
    ...mapGetters({
      isAuthenticated: "profile/isAuthenticated",
    }),
  },
  methods: {
    // emulate fetching data from server

    tableBtn() {    
      if (this.btnToggle && this.btnToggle == "add") {
        this.b_addrow = !this.b_addrow;
      }
      else if (this.btnToggle && this.btnToggle == "remove") {
        this.b_removerow = !this.b_removerow;
      }
    },

    toggleShowMap(param) {
        this.fullName = param.row.fullName;
        this.tabledata = param.row;
        this.b_map = !this.b_map;                   
    },

    resetVariables() {
      this.agentId = ""
      this.fullName = ""
      this.deliveryType = ""
      this.deviceId = ""
    },

    async loadTable() {
      try {
        await this.$store.dispatch("general/fetchDeliveryAgents", {});
        this.data = []
        if (this.agentList && this.agentList.length > 0) {        
          for (let i=0; i < this.agentList.length; i++) { 
            this.data.push({
              agentId: this.agentList[i].id,
              fullName: this.agentList[i].fullName,
              deliveryType: this.agentList[i].deliveryType,
              deviceId: this.agentList[i].device.id,     
              deviceType: this.agentList[i].device.deviceType,
              deviceUpdatedAt: this.agentList[i].device.updatedAt,
            })
          }        
        }             
      } catch (error) {
        console.error(error);
        this.$q.notify({
          color: "negative",
          position: "top",
          icon: "warning",
          message: "something went wrong!"
        });
      }
    },

    async saveRow() {
      // Check for deviceId
      try {
        await this.$store.dispatch("general/saveAgent", {
          id: this.agentId,
          fullName: this.fullName,
          deliveryType: this.deliveryType,
          agentDeviceId: this.deviceId,
        });
        console.log("Agent Saved " + this.agentRec.id);        

        await this.$store.dispatch("general/saveDevice", {
          isNewDevice: this.isNewDevice,
          id: this.deviceId,
          deviceType: this.deviceType,
          agentId: this.agentRec.id
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
          await this.$store.dispatch("general/delAgent", {
            id: this.selected[i].agentId
          });
          console.log("Agent Deleted ");        

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
