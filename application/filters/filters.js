String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, "g"), replacement);
};

function titleCase() {
  return function(input) {
    if (typeof input === "string" || input instanceof String) {
      input = input || "";
      return input.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    } else {
      return input;
    }
  };
}

function replace() {
  return function(input, search, replace) {
    return input.replaceAll(search, replace);
  };
}

function formatDate() {
  return function(input) {
    if (input == null) {
      return "";
    }
    var _date = $filter("date")(new Date(input), "MM dd yyyy");
    return _date.toUpperCase();
  };
}

function elapsedTime() {
  return function(inputDate) {
    return moment(inputDate, "MMMM Do, YYYY : h:mm a").fromNow();
  };
}

function spaceless() {
  return function(input) {
    if (input) {
      return input.replace(" ", "_");
    }
  };
}

function typeoffn() {
  return function(obj) {
    return typeof obj;
  };
}

calculus.filter("extension", function() {
  return function(input) {
    return input.split(".").pop();
  };
});

calculus.filter("propercasing", function() {
  return function(input) {
    return input.charAt(0).toUpperCase() + input.substr(1).toLowerCase();
  };
});

calculus.filter("truncate", [
  "common",
  function(common) {
    return function(text, length, end) {
      if (text !== undefined) {
        if (isNaN(length)) length = 10;

        if (end === undefined) end = "...";
        if (text && text.length <= length) {
          return text;
        } else {
          return common.$sce.trustAsHtml(
            String(text).substring(0, length) + end
          ); /* trustAsHtml method to get truncate in ng-bind-html */
        }
      }
    };
  }
]);

calculus.filter("acronym", function() {
  return function filter(input) {
    if (input !== null) {
      var initial = input.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0);
      });
      return initial.replace(/\s/g, "");
    }
  };
});
calculus.filter("capitalize", function() {
  return function(input) {
    return !!input
      ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase()
      : "";
  };
});

calculus.filter("formatsku", () => {
  return input => {
    if (input !== undefined && input !== null) {
      let position = 1;
      let character = "-";
      let sku_length = 6;
      let zero = sku_length - input.toString().length + 1;
      input = Array(+(zero > 0 && zero)).join("0") + input;
      return input.substr(0, position) + character + input.substr(position);
    }
  };
});

calculus.filter("roundIntegerValue", () => {
  return input => {
    if (input !== undefined && input !== null) {
      return input.toLocaleString("en-US", {
        minimumIntegerDigits: 4,
        useGrouping: false
      });
    }
  };
});

/* Customized filter to get number in formatted manner to show in UI */
calculus.filter("ThousandSeparator", [
  "SessionMemory",
  function(SessionMemory) {
    return function(input, inputSymbol, inputPlaces) {
      if ((input || parseFloat(input) === 0) && !isNaN(parseFloat(input))) {
        typeof input === "string" ? (input = parseFloat(input)) : "";
        // symbol to append input to it for e.g - "$"
        let symbol =
          inputSymbol === ""
            ? ""
            : !inputSymbol && inputSymbol !== ""
            ? "$"
            : inputSymbol;
        // number decimal places in number output
        let places = inputPlaces
          ? inputPlaces
          : parseInt(
              SessionMemory.API.Get("user.preference.decimal.precision")
            );
        let inputArr = input.toFixed(places).split(".");
        let newInput =
          inputArr[0]
            .split("")
            .reverse()
            .reduce((acc, num, i, orig) => {
              return num + (i && !(i % 3) ? "," : "") + acc;
            }, "") +
          "." +
          inputArr[1];

        return `${symbol}${newInput}`;
      } else {
        return inputSymbol + "NA";
      }
    };
  }
]);

// Filter to format the phone number Automatically
calculus.filter("telephone", function() {
  return function(tel) {
    if (!tel) {
      return "";
    }
    var value = tel
      .toString()
      .trim()
      .replace(/^\+/, "");

    if (value.match(/[^0-9]/)) {
      return tel;
    }

    var country, city, number;

    switch (value.length) {
      case 1:
      case 2:
      case 3:
        city = value;
        break;

      default:
        city = value.slice(0, 3);
        number = value.slice(3);
    }

    if (number) {
      if (number.length > 3) {
        number = number.slice(0, 3) + "-" + number.slice(3, 7);
      } else {
        number = number;
      }

      return (city + "-" + number).trim();
    } else {
      return city;
    }
  };
});

calculus.filter("titleCase", titleCase);
calculus.filter("replace", replace);
calculus.filter("formatDate", titleCase);
calculus.filter("elapsedTime", elapsedTime);
calculus.filter("spaceless", spaceless);
calculus.filter("typeof", typeoffn);
