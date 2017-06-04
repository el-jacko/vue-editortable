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
        case 'int':
          res = validator.isInt(value);
          break;
        case 'float':
          res = validator.isFloat(value);
          break;
        case 'min':
          if (validator.isInt(value)) {
            res = validator.isInt(value, { min: parseInt(paraOne, 10) });
          } else if (validator.isFloat(value)) {
            res = validator.isFloat(value, { min: parseFloat(paraOne, 10) });
          }
          break;
        case 'max':
          if (validator.isInt(value)) {
            res = validator.isInt(value, { max: parseInt(paraOne, 10) });
          } else if (validator.isFloat(value)) {
            res = validator.isFloat(value, { max: parseFloat(paraOne, 10) });
          }
          break;
        case 'between':
          if (validator.isInt(value)) {
            res = validator.isInt(value, { min: parseInt(paraOne, 10),
              max: parseInt(paraTwo, 10) });
          } else if (validator.isFloat(value)) {
            res = validator.isFloat(value, { min: parseFloat(paraOne, 10),
              max: parseFloat(paraTwo, 10) });
          }
          break;
        case 'gt':
          if (validator.isInt(value)) {
            res = validator.isInt(value, { gt: parseInt(paraOne, 10) });
          } else if (validator.isFloat(value)) {
            res = validator.isFloat(value, { gt: parseFloat(paraOne, 10) });
          }
          break;
        case 'lt':
          if (validator.isInt(value)) {
            res = validator.isInt(value, { lt: parseInt(paraOne, 10) });
          } else if (validator.isFloat(value)) {
            res = validator.isFloat(value, { lt: parseFloat(paraOne, 10) });
          }
          break;
        case 'alpha':
          res = validator.isAlpha(value, paraOne);
          break;
        case 'alphaNum':
          res = validator.isAlphanumeric(value, paraOne);
          break;
        case 'bool':
          res = validator.isBoolean(value);
          break;
        case 'url':
          res = validator.isURL(value);
          break;
        case 'fqdn':
          res = validator.isFQDN(value);
          break;
        case 'hexColor':
          res = validator.isHexColor(value);
          break;
        case 'ip4':
          res = validator.isIP(value, 4);
          break;
        case 'ip6':
          res = validator.isIP(value, 6);
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
