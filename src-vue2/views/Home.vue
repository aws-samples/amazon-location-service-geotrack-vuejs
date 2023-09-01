<template>
<div>
  <Map action="display_routes" /> 
</div>  
</template>
<script>
import { mapGetters } from "vuex";
import { Auth } from "aws-amplify";
import Map from '../components/Map'

export default {
  name: "Home",
  components: {
    Map
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