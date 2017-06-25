<template>
  <div id="app">
  <meta name="viewport" content="width=device-width">
    <vue-editortable :data="{ columns, options, styling }"></vue-editortable>
  </div>
</template>

<script>
  import VueEditortable from './components/VueEditortable';

  // const values = require('../json/sample3.json');

  export default {
    name: 'app',
    components: {
      VueEditortable,
    },
    data() {
      return {
        // values,
        columns: [
          {
            title: 'Id',
            name: 'id',
            editable: false,
          },
          {
            title: 'Vorname',
            name: 'firstname',
            editable: true,
            validator: {
              rules: [
                'alpha',
              ],
              messages: [
                'Must be alpha',
              ],
            },
          },
          {
            title: 'Nachname',
            name: 'lastname',
            editable: true,
          },
          {
            title: 'Email',
            name: 'email',
            editable: true,
          },
          {
            title: 'Alter',
            name: 'age',
            editable: true,
          },
          {
            title: 'Geschlecht',
            name: 'gender',
            editable: true,
            // show: false,
          },
          {
            title: 'Verheiratet',
            name: 'married',
            editable: true,
          },
        ],
        options: {
          showSearchFilter: true,
          requests: {
            getUrl: 'http://api.dev/api/users',
            postUrl: 'http://api.dev/api/users/save',
            putUrl: 'http://api.dev/api/users/put',
            patchUrl: 'http://api.dev/api/users/patch',
            deleteUrl: 'http://api.dev/api/users/delete',
          },
          // pagination: {
            // itemsPerPage: 100,
            // itemsPerPageValues: [
              // { text: 10, value: 15 },
              // { text: 50, value: 50 },
              // { text: 100, value: 100 },
            // ],
          // },
        },
        styling: 'vuetify',
        // styling: 'customdark',
      };
    },
  };
</script>

<style>
  @import "https://unpkg.com/vuetify/dist/vuetify.min.css";
  @import "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons";
</style>
