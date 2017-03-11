# vue-editortable

> A Vue.js editable table component

## Demo

Demo page will coming soon!

## Browser Compatability

Only tested browser by now is Chrome.
Feel free to test and share your results.

## Installation

#### If you use Webpack/Browserify

###npm
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

## Documentation

You will find a complete documentation [here](https://github.com/el-jacko/vue-editortable/wiki).

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

## TODOs

A List of TODOs will coming soon!

## Contributions

All contributions are welcome!

## License

[MIT](http://opensource.org/licenses/MIT)
