import { defineStore } from "pinia";
import { Auth } from "aws-amplify";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
  }),

  getters: { 
    isAuthenticated: (state) => !!state.user,
    token: (state) => state.user?.signInUserSession.idToken.jwtToken,
    userId: (state) => state.user?.attributes.sub,
    email: (state) => state.user?.attributes.email,
    fullname: (state) => state.user?.attributes.given_name + " " + state.user?.attributes.family_name,
  },
  actions: {
    async getSession() {
        try {
            this.user = await Auth.currentAuthenticatedUser();
            console.groupEnd();
          } catch (err) {
            console.error(err);
            console.log("isAuthenticated: " + !!this.user);
            throw new Error(err);
          }
    },
  },
});