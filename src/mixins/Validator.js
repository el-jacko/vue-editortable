import validator from 'validator';

export default {
  methods: {
    validate(rules, messages, value) {
      const res = [];
      rules.forEach((rule, key) => {
        if (!this.makeValidation(rule, value)) {
          res.push(messages[key]);
        }
      });
      return res;
    },
    makeValidation(str, value) {
      let res = false;
      const arr = this.checkIfParameter(str);
      const l = arr.length;
      const string = arr[0];
      let paraOne;
      let paraTwo;
      if (l > 0) paraOne = arr[1];
      if (l > 1) paraTwo = arr[2];
      switch (string) {
        case 'required':
          res = !validator.isEmpty(value);
          break;
        case 'email':
          res = validator.isEmail(value);
          break;
        case 'contains':
          res = validator.contains(value, paraOne);
          break;
        case 'min':
          res = validator.isInt(value, { min: paraOne });
          break;
        case 'max':
          res = validator.isInt(value, { max: paraOne });
          break;
        case 'between':
          res = validator.isInt(value, { min: paraOne, max: paraTwo });
          break;
        default:
          res = false;
      }
      return res;
    },
    checkIfParameter(str) {
      let i = 0;
      let res;
      i = str.indexOf(':');
      if (i > -1) {
        res = str.split(':');
      } else {
        res = [str];
      }
      return res;
    },
  },
};
