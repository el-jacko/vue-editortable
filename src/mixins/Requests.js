import axios from 'axios';

export default {
  methods: {
    getData(url, cb, errorCb) {
      axios.get(url).then(cb).catch(errorCb);
    },
    postData(url, data, cb, errorCb) {
      axios.post(url, data).then(cb).catch(errorCb);
    },
    putData(url, data, cb, errorCb) {
      axios.put(url, data).then(cb).catch(errorCb);
    },
    patchData(url, data, cb, errorCb) {
      axios.patch(url, data).then(cb).catch(errorCb);
    },
    deleteData(url, cb, errorCb) {
      axios.delete(url).then(cb).catch(errorCb);
    },
  },
};
