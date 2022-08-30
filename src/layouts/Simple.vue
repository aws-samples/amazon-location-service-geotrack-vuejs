<template>
  <q-layout>
    <q-page-container>
      <q-banner v-if="!$q.platform.is.mobile" inline-actions class="bg-grey-3">
        <p style="font-size: 30px; padding-top: 15px; font-weight: bold; float: left">TOMSHAW</p>
        <q-btn class="homeBtn">
          Home
        </q-btn>
        <p class="topBtns">
          Contact Us
        </p>
        <p class="topBtns">Pricing</p>
        <p class="topBtns">Feature</p>

      </q-banner>
      <q-space/>
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "default-layout",
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      isAuthenticated: "profile/isAuthenticated",
    }),
  }
};
</script>


<style scoped>
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

.homeBtn {
  float: right;
  background-color: grey;
  color: white;
  margin-left: 20px;
  margin-top: 7px;
  border-radius: 50px
}

.topBtns {
  float: right;
  cursor: pointer;
  padding-left: 20px;
  padding-right: 20px;
  font-size: 18px;
  margin-left: 20px;
  margin-top: 17px
}
</style>