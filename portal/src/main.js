// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import firebase from 'firebase';
import App from './App'
import router from './router'
import FireText from '@firebase-me/firetext';

Vue.config.productionTip = false

firebase.initializeApp({
  apiKey: 'AIzaSyDZ3F5wLpXLRv4Xb0g8L6dKeHle_N92Uy4',
  authDomain: 'groundzero-0.firebaseapp.com',
  databaseURL: 'https://groundzero-0.firebaseio.com',
  projectId: 'groundzero-0',
  storageBucket: 'groundzero-0.appspot.com',
  messagingSenderId: '736655001624',
  appId: '1:736655001624:web:aaeb2e7626e81a5ee79b6d'
})

let indexTable = FireText.initiate();
let userRecord;

firebase.auth().onAuthStateChanged(user => userRecord = user);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  firebase:{
    index: indexTable,
    user:userRecord
  },
  router,
  components: { App },
  template: '<App/>'
})
