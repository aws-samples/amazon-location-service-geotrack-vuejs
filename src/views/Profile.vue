<template>
  <div class="q-pa-md">
    <div style="margin-left: 30px">
      <h2>User Info</h2>
      <p>{{ this.user.attributes.email }}</p>
      <p>{{ this.user.attributes.given_name }}</p>
      <p>{{ this.user.attributes.family_name }}</p>
      <p>{{ this.user.attributes.sub }}</p>
    </div>
  </div>
</template>

<script>
import {mapGetters, mapState} from "vuex";

export default {
  name: "Profile",
  created() {
    console.log(this.user, "this.user")
  },
  computed: {
    ...mapState({
      user: (state) => state.profile.user,
    }),
    ...mapGetters({
      isAuthenticated: "profile/isAuthenticated",
      firstName: "profile/firstName",
      lastName: "profile/lastName",
      email: "profile/email",
      user: "profile/userAttributes"
    }),
    fullName() {
      return `${this.firstName} ${this.lastName} ${this.user}`;
    },
  },
}
</script>

<style scoped>

</style>