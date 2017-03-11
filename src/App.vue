<template>
  <div id="app">
  <meta name="viewport" content="width=device-width">
    <vue-editortable :data="{ columns, options }"></vue-editortable>
  </div>
</template>

<script>
  import VueEditortable from './components/VueEditortable';

  // const values = require('../json/sample1.json');

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
          {
            title: 'Titel',
            name: 'title',
            editable: true,
          },
          {
            title: 'Kommentar',
            name: 'post',
            editable: true,
          },
        ],
        options: {
          showSearchFilter: true,
          requests: {
            // getUrl: 'http://api.dev/api/users',
            // postUrl: 'http://api.dev/api/users',
            // deleteUrl: 'http://api.dev/api/users',
            allUrl: 'http://api.dev/api/users',
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
      };
    },
  };
</script>
