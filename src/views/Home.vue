<template>
<div>
  <Map action="display_routes" />
<!--  <app-user-menu></app-user-menu>-->
</div>  
</template>
<script>
import { mapGetters } from "vuex";
import { Auth } from "aws-amplify";
import Map from '../components/Map'
// import AppUserMenu from "@/components/AppUserMenu";

export default {
  name: "Home",
  components: {
    Map,
    // AppUserMenu
  },
  data() {
    return {
      credentials: null,
      currentDeliveries: null
    }
  },
  async beforeMount() {
    this.credentials = await Auth.currentCredentials(); 
  },
  computed: {    
    ...mapGetters({
      isAuthenticated: "profile/isAuthenticated",
    }),
  }
}

</script>