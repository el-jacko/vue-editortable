export default {
  methods: {
    getData(url, options, cb, errorCb) {
      this.$http.get(url, options).then(cb, errorCb);
    },
    postData(url, body, options, cb, errorCb) {
      this.$http.post(url, body, options).then(cb, errorCb);
    },
    deleteData(url, options, cb, errorCb) {
      this.$http.delete(url, options).then(cb, errorCb);
    },
  },
};
