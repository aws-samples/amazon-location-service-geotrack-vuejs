<template>
  <v-menu
      offset-y
      left
      nudge-bottom="14"
      min-width="230"
      content-class="user-profile-menu-content"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-badge
          bottom
          color="success"
          overlap
          offset-x="12"
          offset-y="12"
          class="ms-4"
          dot
      >
        <v-avatar
            size="40px"
            v-bind="attrs"
            color="primary"
            class="v-avatar-light-bg primary--text"
            v-on="on"
        >
<!--          <v-img-->
<!--              :src="$auth.user.picture"-->
<!--              alt="User's profile picture"-->
<!--              class="rounded-circle img-fluid profile-picture"></v-img>-->

        </v-avatar>
      </v-badge>
    </template>
    <v-list>
      <div class="pb-3 pt-2">
        <v-badge
            bottom
            color="success"
            overlap
            offset-x="12"
            offset-y="12"
            class="ms-4"
            dot
        >
          <v-avatar
              size="40px"
              color="primary"
              class="v-avatar-light-bg primary--text"
          >
<!--            <v-img-->
<!--                :src="$auth.user.picture"-->
<!--                alt="User's profile picture"-->
<!--                class="rounded-circle img-fluid profile-picture"></v-img>-->
          </v-avatar>
        </v-badge>
        <div
            class="d-inline-flex flex-column justify-center ms-3"
            style="vertical-align:middle"
        >
          <span class="text--primary font-weight-semibold mb-n1">
            Umar
          </span>
          <small class="text--disabled text-capitalize">kkkk</small>
        </div>
      </div>

      <v-divider class="my-2"></v-divider>

      <!-- Profile -->
      <v-list-item href="/profile">
        <v-list-item-icon class="me-2 mt-1">
          <v-icon size="22">
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider class="my-2"></v-divider>

      <!-- Settings -->
      <v-list-item href="#">
        <v-list-item-icon class="me-2">
          <v-icon size="22">
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item-content>
      </v-list-item>


      <v-divider class="my-2"></v-divider>

      <!-- Logout -->
      <v-list-item>
        <v-list-item-icon class="me-2">
          <v-icon size="22">

          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>

import {ref} from 'vue'


export default {
  name: "AppUserMenu",
  setup() {
    return {
      mobileData: ref(false),
      bluetooth: ref(false)
    }
  },
  data() {
    return {
      btnToggle: null,
      items: [
        {title: 'Click Me'},
        {title: 'Click Me'},
        {title: 'Click Me'},
        {title: 'Click Me 2'},
      ],
      closeOnContentClick: true,
    }
  }
}
</script>

<style scoped>

</style>