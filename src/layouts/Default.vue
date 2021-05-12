<template>
  <div class="q-pa-md">
    <q-toolbar class="bg-primary text-white q-my-md shadow-2">
      <q-btn flat round dense icon="menu" class="q-mr-sm" to="/" />
      <q-separator dark vertical inset />
      <q-btn flat label="GeoApp" />
      <q-separator dark vertical />
      <q-btn flat
        icon="person"
      >
      {{ fullName}}
      </q-btn>
  
      <q-separator />
      <q-btn
        round
        color="deep-orange"
        size="sm"
        icon="exit_to_app"
        @click="signOut"
      >
        <q-tooltip
          content-class="bg-grey"
          content-style="font-size: 16px"
          :offset="[10, 10]"
        >
          Log out
        </q-tooltip>
      </q-btn>

      <q-space />

      <!--
        notice shrink property since we are placing it
        as child of QToolbar
      -->
      
      <q-separator dark vertical />
      <div v-for="item of menuItems" :key="item.label">
        <q-btn stretch flat
          :icon="item.icon"
          :label="item.label"
          :to="item.page"
        />
      </div>    
    </q-toolbar>
    <router-view />
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import { Auth } from "aws-amplify";
export default {
  name: "default-layout",
  data() {
    return {
      photo: "",
      drawer: false,
      menuItems: [
        { icon: "house", 
          page: "/", 
          label: "Home" 
        }
      ],
    };
  },
  methods: {
    async signOut() {
      try {
        await Auth.signOut();
        this.$router.push("/auth");
      } catch (error) {
        console.log("error signing out: ", error);
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
