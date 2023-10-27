<script setup>
import { reactive, ref } from "vue";
import { onBeforeMount } from "vue";
import Header from "../components/Header.vue";
import { useUserStore } from "../stores/user";
import { useGeoStore } from "../stores/geo";
import { VDataTable } from "vuetify/labs/VDataTable";

const userStore = useUserStore();
const geoStore = useGeoStore();

const driver = reactive({
  id: "",
  fullName: "",
  email: "",
  deliveryType: "",
  deviceType: "",
  deviceId: "",
  status: "",
});

const driversData = ref([])
const optionsDelivery = ["Motorcycle", "Car"];
const optionsDevice = ["iPhone", "Android", "IoT"];
const selected = ref([])
const buttonAddRow = ref(false);
const buttonRemoveRow = ref(false);

const dataHeaders = [
  {
    align: " d-none",
    key: "id",
  },
  {
    title: "Full Name",
    key: "fullName",
  },
  {
    title: "Delivery Type",
    key: "deliveryType",
  },
  {
    title: "Device Type",
    key: "deviceType",
  },
  {
    title: "Device Id",
    key: "deviceId",
  },
];

onBeforeMount(() => {
  loadTable();
});

async function loadTable() {
  try {
    driversData.value = await geoStore.listDrivers();
    // The data gets loaded into geoStore.driversList
  } catch (error) {
    console.error(error);
  }
}

function toggleShowMap(param) {
  this.fullName = param.row.fullName;
  this.tableContent = param.row;
  this.b_map = !this.b_map;
}

function onReset() {
  driver.id = null;
  driver.fullName = null;
  driver.email = null;
  driver.deliveryType = null;
  driver.deviceType = null;
  driver.deviceId = null;
  driver.status = null;
}

async function onSubmit() {
  // Check for deviceId
  try {
    let driverRec = await geoStore.saveDriver({
      id: driver.driverId,
      fullName: driver.fullName,
      email: driver.email,
      deliveryType: driver.deliveryType,
      deviceType: driver.deviceType,
      deviceId: driver.deviceId,
      status: driver.status,
    });
    console.log("Driver Saved " + driverRec);

    buttonAddRow.value = false;
    onReset();
    loadTable();
  } catch (error) {
    console.error(error);
  }
}

async function removeRow() {
  try {
    for (let i = 0; i < selected.value.length; i++) {
      console.log(selected.value[i])
      let driverRec = await geoStore.delDriver(selected.value[i])
      console.log("Delete: " + driverRec.id)      
    }
    buttonRemoveRow.value = false

    loadTable();

  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <div>
    <Header />
    <v-container>
      <v-btn-toggle>
      <v-btn size="small" variant="outlined" prepend-icon="mdi-plus-circle-outline" @click="buttonAddRow = true">
        Add User
      </v-btn>
      <v-btn size="small" variant="outlined" prepend-icon="mdi-delete-circle-outline" @click="(selected.length > 0) ? buttonRemoveRow = true : buttonRemoveRow = false">
        Del User
      </v-btn>
    </v-btn-toggle>
      <v-card>
        <v-data-table 
          :headers="dataHeaders" 
          :items="driversData" 
          select-strategy="single" 
          item-value="id" 
          class="elevation-1" 
          show-select
          density="compact"
          v-model="selected"
        ></v-data-table>
      </v-card>
    </v-container>

    <v-row justify="center">
      <v-dialog v-model="buttonAddRow" width="500">
        <v-card>
          <v-form @submit.prevent="onSubmit">
            <v-card-title>
              <span class="text-h5">New/agent Device</span>
            </v-card-title>
              <v-container>
                <v-text-field label="Full Name" :rules="[
                  () => !!driver.fullName || 'This field is required',
                  () =>
                    (!!driver.fullName && driver.fullName.length >= 5) ||
                    'Full Name must contain 5 or more characters',
                ]" v-model="driver.fullName" ref="fullName" @keyup.enter="prompt = false" />

                <v-text-field label="Email" :rules="[
                  () => !!driver.email || 'This field is required',
                  () =>
                    (!!driver.email && driver.email.length >= 5) ||
                    'Full Name must contain 5 or more characters',
                  () =>
                    /^[^@]+@\w+(\.\w+)+\w$/.test(driver.email) ||
                    'Invalid Email',
                ]" v-model="driver.email" ref="email" @keyup.enter="prompt = false" />

                <v-select v-model="driver.deliveryType" ref="deliveryType" :rules="[
                  (val) =>
                    (val !== null && val !== '') ||
                    'Please select a delivery type',
                ]" :items="optionsDelivery" label="Delivery Type" />

                <v-select v-model="driver.deviceType" ref="deviceType" :rules="[
                  (val) =>
                    (val !== null && val !== '') ||
                    'Please select a device type',
                ]" :items="optionsDevice" label="Device Type" />

                <v-text-field label="Device Id" v-model="driver.deviceId" ref="deviceId" :rules="[
                  () => !!driver.deviceId || 'This field is required',
                  () =>
                    (!!driver.deviceId && driver.deviceId.length >= 5) ||
                    'Full Name must contain 5 or more characters',
                  () =>
                    (driver.deviceId || '').indexOf(' ') < 0 ||
                    'No spaces are allowed',
                  // () => !(this.data.includes(deviceId)) || 'DeviceId is not unique',
                ]" @keyup.enter="prompt = false" />
              </v-container>

            <v-card-actions align="right" class="text-primary">
              <v-btn class="text-none" color="#4f545c" prepend-icon="mdi-check" variant="flat" type="submit">
                Submit
              </v-btn>

              <v-btn border class="text-none" color="#2f3136" prepend-icon="mdi-cancel" variant="outlined"
                @click="buttonAddRow = false">
                Cancel
              </v-btn>
              <v-btn type="reset" border class="text-none" color="#2f3136" prepend-icon="mdi-autorenew" variant="outlined">
                Reset
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-row>

    <v-row justify="center">
      <v-dialog v-model="buttonRemoveRow" width="500">
        <v-card>
          <v-form @submit.prevent="onSubmit">
            <v-card-title>
              <span class="text-h6">Confirm deleting Driver?</span>
            </v-card-title>

            <v-card-actions align="right" class="text-primary">
              <v-btn class="text-none" color="#4f545c" prepend-icon="mdi-check" variant="flat" @click="removeRow">
                Yes
              </v-btn>

              <v-btn border class="text-none" color="#2f3136" prepend-icon="mdi-cancel" variant="outlined"
                @click="buttonRemoveRow = false">
                No
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>
