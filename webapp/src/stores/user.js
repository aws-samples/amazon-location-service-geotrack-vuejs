import { defineStore } from "pinia";
import { fetchUserAttributes, getCurrentUser } from 'aws-amplify/auth';
import { ConsoleLogger } from 'aws-amplify/utils';
import { configAmplify } from "../configAmplify";

const logger = new ConsoleLogger('geotrack');
configAmplify();

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    userAttributes: null,
    userTokens: null
  }),

  getters: { 
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.userAttributes?.sub,
    email: (state) => state.userAttributes?.email,
    fullname: (state) => state.userAttributes?.given_name + " " + state.userAttributes?.family_name,
  },
  actions: {
    async getSession() {
        try {
            this.user = await getCurrentUser();
            this.userAttributes = await fetchUserAttributes();
            console.groupEnd();
          } catch (err) {
            console.error(err);
            console.log("isAuthenticated: " + !!this.user);
            throw new Error(err);
          }
    },
  },
});