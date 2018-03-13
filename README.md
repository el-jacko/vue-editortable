## Support on Beerpay
Hey dude! Help me out for a couple of :beers:!

[![Beerpay](https://beerpay.io/el-jacko/vue-editortable/badge.svg?style=beer-square)](https://beerpay.io/el-jacko/vue-editortable)  [![Beerpay](https://beerpay.io/el-jacko/vue-editortable/make-wish.svg?style=flat-square)](https://beerpay.io/el-jacko/vue-editortable?focus=wish)

# vue-editortable

> A Vue.js editable table component
> * Load/Save Data from/to a database
> * Create, Edit, Save, and Delete Data
> * Show/Hide columns
> * Keyboard Navigation & Shortcuts
> * SWIPE Design for wide tables
> * Simple Responsive Design with data attributes
> * Configurable
> * Multisorting
> * Searchfilter
> * dynamic Pagination
> * Validation

---
## Demo

* [Vue-editortable Demo 1 - Vuetify Style](http://vue-editortable-vuetify.eljacko.de/)
* [Vue-editortable Demo 2 - Custom Dark Style](http://vue-editortable-customdark.eljacko.de/)
* The database connection is disabled on the demo pages.

---
## Dependencies

Only Vue.js, no other frameworks/libraries
* Vue.js >= 2.0 (tested with 2.2.2)
* Vue-awesome Icons
* Axios
* validator

---
## Browser compatibility

Only tested browser by now is Chrome.
Feel free to test and share your results.

---
## Installation

#### If you use Webpack/Browserify

### npm
``` sh
npm install --save vue-editortable
```
Import globally in an App:

``` javascript
import VueEditortable from "vue-editortable"
Vue.component('vue-editortable', VueEditortable)
```
Import locally in a component:

``` javascript
import VueEditortable from "vue-editortable"
// ...
components: {
    VueEditortable,
  }
// ...
```

## Usage

``` html
<vue-editortable :data="{ columns, options }"></vue-editortable>
```
``` javascript
// ...
data() {
      return {
        columns: [
          {
            title: 'Id',
            name: 'id',
            editable: false,
          },
          {
            title: 'Firstname',
            name: 'firstname',
            editable: true,
          },
          {
            title: 'Lastname',
            name: 'lastname',
            editable: true,
          },
          {
            title: 'Email',
            name: 'email',
            editable: true,
          },
        ],
        options: {
          showSearchFilter: true,
          requests: {
            allUrl: 'http://api.dev/api/users',
          },
        },
      };
    },
// ...
```

---
## Documentation

You will find a complete documentation [here](https://github.com/el-jacko/vue-editortable/wiki).

---
## Build Setup

``` sh
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

---
## TODOs

Some major TODOs:
* error messages
* implementing Datatypes
* filter per columns
* optional Modal before deleting
* compatibility with CSS Frameworks (Bootstrap, Semantic, Foundation)
* search & replace
* edit multiple fields
* statistics

---
## Contributions

All contributions are welcome!

---
## License

[MIT](http://opensource.org/licenses/MIT)
