<template>
  <div class="q-pa-md">

    <q-toolbar class="bg-primary text-white q-my-md shadow-2" style="background-color: grey !important;">

      <q-btn flat @click="drawers()" round dense icon="menu"/>

      <q-separator dark vertical inset/>

      <q-btn flat label="Stealth Connect" @click="mainPage()"/>
      <q-btn icon="local_fire_department"
             class="q-mr-sm"
             color="orange"
             flat round dense
             @click="launchFleet"
             size="xs"
      >
        <q-tooltip
            content-class="bg-grey"
            content-style="font-size: 16px"
            :offset="[10, 10]"
        >
          Enable Drones
        </q-tooltip>
      </q-btn>

      <q-separator dark vertical/>
      <div v-for="item of menuItems" :key="item.label">
        <q-btn stretch flat
               :icon="item.icon"
               :label="item.label"
               :to="item.page"
        />
      </div>

      <q-space/>

      <!--
        notice shrink property since we are placing it
        as child of QToolbar
      -->

      <q-separator dark vertical inset/>

      <q-btn-dropdown
          color="grey"
          push
          no-caps>
        <template v-slot:label>
          <div class="row items-center no-wrap">
            <q-icon left name="person"/>
            <div class="text-center">
              {{ fullName }}
            </div>
          </div>
        </template>
        <q-list>
          <q-item clickable v-close-popup>
            <q-item-section @click="profileClick()">
              <q-icon left name="person"/>
              <q-item-label>Profile</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup>
            <q-item-section>
              <q-icon left name="settings"/>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup @click="signOut()">
            <q-item-section>
              <q-icon left name="exit_to_app"/>
              <q-item-label>Logout</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
    <q-layout view="hHh Lpr lff" container style="height: 850px" class="shadow-2 rounded-borders">
      <q-header elevated class="bg-black">
        <q-drawer
            v-model="drawer"
            show-if-above
            :width="200"
            :breakpoint="500"
            bordered
            content-class="bg-grey-3"
        >
          <q-scroll-area class="fit">
            <q-list>

              <template v-for="(menuItem, index) in menuList">
                <q-item :key="index" clickable :active="menuItem.label === 'Outbox'" v-ripple>
                  <q-item-section avatar>
                    <q-icon :name="menuItem.icon"></q-icon>
                  </q-item-section>
                  <q-item-section>
                    {{ menuItem.label }}
                  </q-item-section>
                </q-item>
                <q-separator :key="'sep' + index" v-if="menuItem.separator"></q-separator>
              </template>

            </q-list>
          </q-scroll-area>
        </q-drawer>
      </q-header>
      <q-page-container>

        <router-view/>
      </q-page-container>
    </q-layout>
  </div>
</template>

<script>
import {mapState, mapGetters} from "vuex";
import {Auth} from "aws-amplify";
import {ref} from 'vue'
// import leftDrawer from "@/components/LeftDrawer";

export default {
  name: "default-layout",
  components: {
    // leftDrawer
  },

  data() {
    return {
      photo: "",
      menuList: [
        {
          icon: '',
          label: 'Item 1',
          separator: true
        },
        {
          icon: '',
          label: 'Item 2',
          separator: false
        },
        {
          icon: '',
          label: 'Item 3',
          separator: false
        },
        {
          icon: '',
          label: 'Item 4',
          separator: true
        },
        {
          icon: '',
          label: 'Item 5',
          separator: false
        },
        {
          icon: '',
          label: 'Item 5',
          separator: false
        },
        {
          icon: '',
          iconColor: 'primary',
          label: 'Item 6',
          separator: false
        }
      ],
      drawer: false,
      menuItems: [
        {
          icon: "house",
          page: "/",
          label: "Home"
        },
        {
          icon: "person_add",
          page: "agent",
          label: "Drone"
        },
        {
          icon: "local_shipping",
          page: "delivery",
          label: "Track"
        }
      ],
    };
  },
  setup() {
    return {
      drawerLeft: ref(false),
      drawerRight: ref(false)
    }
  },
  methods: {
    mainPage() {
      this.$router.push('/')
    },
    drawers() {
      console.log(this.drawer, "drawer Before")

      this.drawer = !this.drawer
      console.log(this.drawer, "drawer After")
    },
    profileClick() {
      this.$router.push('/profile')
    },
    async signOut() {
      try {
        await Auth.signOut();
        this.$router.push("/auth");
      } catch (error) {
        console.log("error signing out: ", error);
      }
    },
    async launchFleet() {

      let url = process.env.VUE_APP_APIURL

      const currentSession = await Auth.currentSession();
      this.jwt = currentSession.getIdToken().getJwtToken();
      const options = {
        headers: {
          'authorization': this.jwt
        }
      };

      console.log(url + "launch_fleet")
      let results = await this.$http.post(url + "launch_fleet", {}, options);

      if (results.status === 200) {
        this.$q.notify({
          color: "orange",
          position: "top",
          timeout: 5000,
          icon: "local_fire_department",
          message: results.data.msg,
        })
      } else {
        this.$q.notify({
          color: "orange",
          position: "top",
          timeout: 5000,
          icon: "warning",
          message: results.data.msg,
        })
      }

    },
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
    }),
    fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
};
</script>

<style scoped>
.toolbar {
  min-height: 60px;
}

#profile {
  height: 130px;
  background-color: #808080;
}

#menu-collapse {
  margin-top: 5%;
}

.right-itens a,
.right-itens button {
  margin-right: 10px;
}

.fixed-bottom {
  margin-bottom: 1%;
}

.fixed-bottom a img {
  width: 25px;
  height: 25px;
}

#menu-collapse {
  margin-top: 5%;
}

.layout-padding {
  padding: 1em 4em;
}

@media screen and (max-width: 600px) {
  .layout-padding {
    padding: 1.5em 0.5em;
  }
}

.menu-enter-active,
.scale-enter {
  -webkit-animation: moveFromLeftFade 0.9s ease both;
  animation: moveFromLeftFade 0.9s ease both;
}

.menu-leave-to,
.scale-leave-active {
  -webkit-animation: moveToLeft 0.9s ease both;
  animation: moveToLeft 0.9s ease both;
}

@-webkit-keyframes moveFromLeftFade {
  from {
    opacity: 0.3;
    -webkit-transform: translateX(-100%);
  }
}

@keyframes moveFromLeftFade {
  from {
    opacity: 0.3;
    -webkit-transform: translateX(-100%);
    transform: translateX(-100%);
  }
}

@-webkit-keyframes moveToRight {
  from {
  }
  to {
    -webkit-transform: translateX(100%);
  }
}

@keyframes cartOut {
  from {
    transform: translate(0px, 0px);
  }
  to {
    transform: translate(1200px, 0px);
    animation-timing-function: ease-out;
  }
}

@-webkit-keyframes moveToLeft {
  from {
  }
  to {
    opacity: 0.5;
    -webkit-transform: translateX(-100%);
  }
}

@keyframes moveToLeft {
  from {
  }
  to {
    opacity: 0.5;
    -webkit-transform: translateX(-100%);
    transform: translateX(-100%);
  }
}

@-webkit-keyframes moveFromRight {
  from {
    opacity: 0.7;
    -webkit-transform: translateX(100%);
  }
}

@keyframes moveFromRight {
  from {
    opacity: 0.7;
    -webkit-transform: translateX(100%);
    transform: translateX(100%);
  }
}

.drawer-closer .item-content {
  margin-left: 50px !important;
}

.drawer-content .list-label {
  line-height: 45px;
}

.drawer-content .item {
  height: 45px;
}

.router-link-active .item-primary {
  color: #027be3;
}

@media only screen and (min-width: 601px) {
  .adv-form-one .timeline-badge {
    right: auto !important;
    left: auto !important;
  }

  .adv-form-one .timeline-content {
    margin-left: 3.9rem;
  }

  .adv-form-one .timeline-item {
    width: 100% !important;
  }

  .adv-form-one .timeline-title {
    text-align: inherit !important;
    margin-left: 3.9rem;
  }

  .timeline:before {
    left: 1.6rem;
  }
}

.adv-form-one .timeline-content .group .primary {
  display: none !important;
}

.underline {
  text-decoration: underline;
}
</style>
