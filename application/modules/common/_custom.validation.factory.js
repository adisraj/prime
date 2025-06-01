(function() {
  "use strict";
  angular
    .module("calculus.application")
    .factory("booleanValidation", [
      "valdrUtil",
      function(valdrUtil) {
        /**
         * Custom Validation -  Using Valdr Module
         */
        return {
          name: "boolean",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */
          validate: function(value) {
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            if (
              value == 0 ||
              value == 1 ||
              value == "yes" ||
              value == "no" ||
              value == true ||
              value == false ||
              value == "true" ||
              value == "false"
            ) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("as400StringValidation", [
      "valdrUtil",
      function (valdrUtil) {
        return {
          name: "as400string",
          
          validate: function (value) {
            const regExp = /^[a-zA-Z0-9`\-\\=[\]\;?:\",./~!@#$%^&*()_+'{}|“\n<> ]+$/;
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            if (
              String(value).match(regExp)
            ) {
              return true;
            } else {
              return false;
            }

          }
        };
      }
    ])
    .factory("stringValidation", [
      "valdrUtil",
      function (valdrUtil) {
        return {
          name: "string",
          
          validate: function (value) {
            const regExp = /^[a-zA-Z0-9`\-\\=[\]\;?:‘\",./~!@#$%^&*()_+'{}|“\n<> \u00e4\u00f6\u00eb\u00ef\u00fc\u00e1\u00e9\u00ed\u00f3\u00fa ]+$/;
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            // if (isNaN(value)) {
            //   return true;
            //  } else {
            //   return false;
            // }
            
            if (
              String(value).match(regExp)
            ) {
              return true;
            } else {
              return false;
            }

          }
        };
      }
    ])
    .factory("startAndEndDateCompareValidation", [
      "valdrUtil",
      "SessionMemory",
      function(valdrUtil, SessionMemory) {
        return {
          name: "startAndEndDateCompare",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */
          validate: function(value, arg) {
            var format = SessionMemory.API.Get("user.preference.date.format");
            if (valdrUtil.isEmpty(value)) {
              return true;
            } else if (
              parseInt(moment(value, format).format("YYYYMMDD")) >=
                parseInt(moment(arg.sval).format("YYYYMMDD")) &&
              parseInt(moment(value, format).format("YYYYMMDD")) <=
                parseInt(moment(arg.eval).format("YYYYMMDD"))
            ) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("rangeValidation", [
      "valdrUtil",
      function(valdrUtil) {
        return {
          name: "range",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */
          validate: function(value, arg) {
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            if (
              Number(arg.from) <= Number(value) &&
              Number(arg.to) >= Number(value)
            ) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("nextEffectiveDateValidator", [
      "valdrUtil",
      "SessionMemory",
      function(valdrUtil, SessionMemory) {
        return {
          name: "nextEffectiveDate",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */

          validate: function(value) {
            var format = SessionMemory.API.Get("user.preference.date.format");
            var now = Number(moment().format("YYYYMMDD")),
              valueAsMoment;

            if (valdrUtil.isEmpty(value)) {
              return true;
            }

            valueAsMoment = Number(moment(value, format).format("YYYYMMDD"));

            if (valueAsMoment >= now) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("effectiveDateValidator", [
      "valdrUtil",
      "SessionMemory",
      function(valdrUtil, SessionMemory) {
        return {
          name: "effectiveDate",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */

          validate: function(value) {
            var format = SessionMemory.API.Get("user.preference.date.format");
            var now = Number(moment().format("YYYYMMDD")),
              valueAsMoment;

            if (valdrUtil.isEmpty(value)) {
              return true;
            }

            valueAsMoment = Number(moment(value, format).format("YYYYMMDD"));

            if (valueAsMoment <= now) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("fromAndToDateCompareValidation", [
      "valdrUtil",
      "SessionMemory",
      function(valdrUtil, SessionMemory) {
        return {
          name: "fromAndToDateCompare",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */
          validate: function(value, arg) {
            var format = SessionMemory.API.Get("user.preference.date.format");
            /*if (valdrUtil.isEmpty(value)) {
                        return true;
                    } else*/
            if (
              value &&
              parseInt(moment(value, format).format("YYYYMMDD")) >=
                parseInt(
                  moment(arg.sval.attribute_from_value).format("YYYYMMDD")
                )
            ) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("alphaValidator", [
      "valdrUtil",
      function(valdrUtil) {
        return {
          name: "alpha",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */
          validate: function(value) {
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            if (value.match(/^[A-Za-z]+$/)) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("alphaNumValidator", [
      "valdrUtil",
      function(valdrUtil) {
        return {
          name: "alpha_num",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */
          validate: function(value) {
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            if (value.match(/^[0-9a-zA-Z]+$/)) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .factory("retailDateValidator", [
      "valdrUtil",
      "SessionMemory",
      function(valdrUtil, SessionMemory) {
        return {
          name: "retailDate",

          /**
           * Checks if the value is a date in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a date in the future, false otherwise
           */
          validate: function(value, arg) {
            var format = SessionMemory.API.Get("user.preference.date.format");
            let today = Number(moment().format("YYYYMMDD"));
            if (
              value &&
              parseInt(moment(value, format).format("YYYYMMDD")) > today
            ) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])

    .factory("phoneNumberValidator", [
      "valdrUtil",
      function(valdrUtil) {
        return {
          name: "phone_number",

          /**
           * Checks if the value is a phone_number in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a phone_number in the future, false otherwise
           */
          validate: function(value) {
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            if (
              String(value).match(/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/)
            ) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])

    .factory("alphabetsOrNumericStringValidator", [
      "valdrUtil",
      function(valdrUtil) {
        return {
          name: "alphaNumericString",

          /**
           * Checks if the value is a alphaNumericString in the future.
           *
           * @param value the value to validate
           * @returns {boolean} true if empty, null, undefined or a alphaNumericString in the future, false otherwise
           */
          validate: function(value) {
            if (valdrUtil.isEmpty(value)) {
              return true;
            }
            if (
              String(value).match(
                /^(?=.*[A-Za-z0-9])([a-zA-Z0-9 -@&$#!%&()*\+,\/;\[\\\]\^\_\:-`"'={|}~]*)?$/
              )
            ) {
              return true;
            } else {
              return false;
            }
          }
        };
      }
    ])
    .config(function(valdrProvider) {
      valdrProvider.addValidator("booleanValidation");
      valdrProvider.addValidator("stringValidation");
      valdrProvider.addValidator("as400StringValidation");
      valdrProvider.addValidator("startAndEndDateCompareValidation");
      valdrProvider.addValidator("fromAndToDateCompareValidation");
      valdrProvider.addValidator("rangeValidation");
      valdrProvider.addValidator("nextEffectiveDateValidator");
      valdrProvider.addValidator("effectiveDateValidator");
      valdrProvider.addValidator("alphaValidator");
      valdrProvider.addValidator("alphaNumValidator");
      valdrProvider.addValidator("retailDateValidator");
      valdrProvider.addValidator("phoneNumberValidator");
      valdrProvider.addValidator("alphabetsOrNumericStringValidator");
    });
})();
