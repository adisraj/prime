(function () {
  "use strict";
  angular
    .module("rc.prime.location")
    .controller(
      "LocationUserDefinedDataController",
      LocationUserDefinedDataController
    );
  LocationUserDefinedDataController.$inject = [
    "$scope",
    "common",
    "valdr",
    "LocationUDDService",
    "LocationUDDValueService",
    "GlobalRegularExpression"
  ];

  function LocationUserDefinedDataController(
    $scope,
    common,
    valdr,
    LocationUDDService,
    LocationUDDValueService,
    GlobalRegularExpression
  ) {
    let vmCtrl = this;
    var vm = this;
    let logger = common.Logger.getInstance("LocationUserDefinedDataController");
    let Notification = common.Notification;
    let map_key = "location_map_id";
    let map_id_key = "location_id";
    let apiInstanceToRead = LocationUDDService.API.GetLocationUDDList;
    let apiInstanceToUddRead =
      LocationUDDValueService.API.SearchLocationUDDValues;
    let apiInstanceToUddInsert =
      LocationUDDValueService.API.InsertLocationUDDValue;
    let apiInstanceToUddValueUpdate =
      LocationUDDValueService.API.UpdateLocationUDDValue;
    let apiInstanceToUddValueDelete =
      LocationUDDValueService.API.DeleteLocationUDDValueById;
    $scope.isUddImmediate = true;
    $scope.isUddActivation = true;
    $scope.$parent.locationLoadingUDD = false;
    $scope.globalRegularExpression = GlobalRegularExpression;

    function init() {
      vm.getDimensionalAttributesList();
      vmCtrl.isUddLoaded = false;
      $scope.$parent.locationLoadingUDD = true;
      $scope.selectedHierarchyProperty = {};
      $scope.uddValidationErrors = [];
      apiInstanceToRead($scope.head.type_id)
        .then(function (response) {
          vmCtrl.attributesUDDs = response.attributes;
          vmCtrl.hierarchyUDDs = response.hierarchies;
          if ($scope.edit_master_id) {
            apiInstanceToUddRead("location_id", $scope.edit_master_id)
              .then(response => {
                dataMapping(response);
              })
              .catch(error => {
                $scope.$parent.locationLoadingUDD = false;
                logger.error(error);
              });
          } else {
            let response = {
              data: []
            };
            dataMapping(response.data);
          }
        })
        .catch(error => {
          $scope.$parent.locationLoadingUDD = false;
          logger.error(error);
        });
    }

    vmCtrl.getDimensionalAttributesList = () => {
      if (!common.LocalMemory.API.Get("DimensionAttributesMap")) {
        common.EntityDetails.API.GetGraphSet(
            common.Identifiers.attribute,
            ["id", "description", "format", "dimension_class", "dimension_unit"],

            "format_id",
            9
          )
          .then(res => {
            let attributeListMap = {};
            for (let i = 0; i < res.length; i++) {
              if (attributeListMap[res[i].id] === undefined) {
                attributeListMap[res[i].id] = res[i];
              }
            }
            common.LocalMemory.API.Post(
              "DimensionAttributesMap",
              attributeListMap
            );
            vmCtrl.dimensionAttributesMap = attributeListMap;
          })
          .catch(err => logger.error(err));
      } else {
        vmCtrl.dimensionAttributesMap = JSON.parse(
          common.LocalMemory.API.Get("DimensionAttributesMap")
        );
      }
    };

    vmCtrl.init = init;
    vmCtrl.init();

    $scope.$watch("isEnabled", function (n, o) {
      if (n && $scope.head.type_id) {
        vmCtrl.result_udd_data = [];
        vmCtrl.setDefaultValues = false;
        vmCtrl.init();
      }
    });

    $scope.$watch("isTypeUpdated", (n, o) => {
      if (n && $scope.head.type_id && $scope.head.isTypeUpdate === true) {
        vmCtrl.setDefaultValues = false;
        vmCtrl.init();
      }
    });

    // $scope.$on("initUserDefinedData", function(e, args) {
    //   vmCtrl.init();
    // });

    $scope.setPropertyFn = function (data) {
      $scope.selectedHierarchyProperty = data.selectedHierarchyProperty;
    };
    var default_status_id = 200; // ACTIVE for ALL
    function dataMapping(results) {
      vmCtrl.editData = results;
      $scope.$parent.locationLoadingUDD = false;
      vmCtrl.isUddLoaded = true;
      if (results.length > 0) {
        $scope.setdefault = false;
      } else {
        $scope.setdefault = true;
      }
      var data = {}; // It contains all hierarchies,attributes,options
      $scope.uddValues = {};
      var mapIds = [];
      var hierarchyPropsMap = {};
      for (var i = 0; i < vmCtrl.attributesUDDs.length; i++) {
        var attributeUDD = vmCtrl.attributesUDDs[i];
        attributeUDD.isRequired = false;
        attributeUDD.requiredImgScript = "optionalFieldNotation";
        //If the attribute UDD is  a required udd and if the value List has no values, show an error
        if (
          vmCtrl.attributesUDDs[i].values.length === 1 &&
          (vmCtrl.attributesUDDs[i]["format"] === "Value List" ||
            vmCtrl.attributesUDDs[i]["format"] === "Rating" ||
            vmCtrl.attributesUDDs[i].format.toLowerCase() == "multiselect") &&
          vmCtrl.attributesUDDs[i].values[0]["id"] === null
        ) {
          if ($scope.uddValidationErrors.length > 0) {
            if (
              $scope.uddValidationErrors.filter(
                uddValidationError =>
                uddValidationError.user_defined_data_type.toLowerCase() ===
                "attribute"
              ).length > 0
            ) {
              $scope.uddValidationErrors.filter(uddValidationError => {
                if (
                  uddValidationError.user_defined_data_type.toLowerCase() ===
                  "attribute" &&
                  !uddValidationError.udd_description.includes(
                    vmCtrl.attributesUDDs[i]["short_description"]
                  )
                ) {
                  uddValidationError.udd_description +=
                    " , " + vmCtrl.attributesUDDs[i]["short_description"];
                }
              });
            } else {
              $scope.uddValidationErrors.push({
                user_defined_data_type: "Attribute",
                udd_description: vmCtrl.attributesUDDs[i]["short_description"]
              });
            }
          } else {
            $scope.uddValidationErrors.push({
              user_defined_data_type: "Attribute",
              udd_description: vmCtrl.attributesUDDs[i]["short_description"]
            });
          }
        }
        if (
          $scope.head.status_id !== 100 &&
          attributeUDD.required.toLowerCase() === "activation"
        ) {
          if (attributeUDD.format.toLowerCase() === "yes/no") {
            attributeUDD.isRequired = false;
        }
        else attributeUDD.isRequired = true;
          attributeUDD.requiredImgScript = "optionalFieldNotation";
        } else if (attributeUDD.required.toLowerCase() === "immediate") {
          if (attributeUDD.format.toLowerCase() === "yes/no") {
            attributeUDD.isRequired = false;
        }
        else attributeUDD.isRequired = true;
          attributeUDD.requiredImgScript = "requiredFieldNotation";
        } else if (attributeUDD.required.toLowerCase() == "no") {
          attributeUDD.isRequired = false;
          attributeUDD.requiredImgScript = "FieldNotation";
        }
        if (
          attributeUDD.format &&
          attributeUDD.format.toLowerCase() == "multiselect"
        ) {
          let valuesMap = [];
          for (let i = 0; i < attributeUDD.values.length; i++) {
            if (valuesMap[attributeUDD.values[i].id] === undefined) {
              valuesMap[attributeUDD.values[i].id] = attributeUDD.values[i];
            }
          }
          attributeUDD.valuesMap = valuesMap;
        }
        data[attributeUDD.map_id] = attributeUDD;
        data[attributeUDD.map_id]["user_defined_data_type"] = "Attribute";
        mapIds.push(attributeUDD.map_id);
      }
      for (var i = 0; i < vmCtrl.hierarchyUDDs.length; i++) {
        var hierarchyUDD = vmCtrl.hierarchyUDDs[i];
        hierarchyUDD.isRequired = false;
        hierarchyUDD.requiredImgScript = "optionalFieldNotation";
        //If the hierarchy UDD is a activation udd and if it has no values, show an error
        if (
          vmCtrl.hierarchyUDDs[i].props.length === 1 &&
          vmCtrl.hierarchyUDDs[i].props[0]["id"] === null
        ) {
          if ($scope.uddValidationErrors.length > 0) {
            if (
              $scope.uddValidationErrors.filter(
                uddValidationError =>
                uddValidationError.user_defined_data_type.toLowerCase() ===
                "hierarchy"
              ).length > 0
            ) {
              $scope.uddValidationErrors.filter(uddValidationError => {
                if (
                  uddValidationError.user_defined_data_type.toLowerCase() ===
                  "hierarchy" &&
                  !uddValidationError.udd_description.includes(
                    vmCtrl.hierarchyUDDs[i]["short_description"]
                  )
                ) {
                  uddValidationError.udd_description +=
                    " , " + vmCtrl.hierarchyUDDs[i]["short_description"];
                }
              });
            } else {
              $scope.uddValidationErrors.push({
                user_defined_data_type: "Hierarchy",
                udd_description: vmCtrl.hierarchyUDDs[i]["short_description"]
              });
            }
          } else {
            $scope.uddValidationErrors.push({
              user_defined_data_type: "Hierarchy",
              udd_description: vmCtrl.hierarchyUDDs[i]["short_description"]
            });
          }
        }
        if (
          $scope.head.status_id !== 100 &&
          hierarchyUDD.required.toLowerCase() === "activation"
        ) {
          hierarchyUDD.isRequired = true;
          hierarchyUDD.requiredImgScript = "optionalFieldNotation";
        } else if (hierarchyUDD.required.toLowerCase() == "immediate") {
          hierarchyUDD.isRequired = true;
          hierarchyUDD.requiredImgScript = "requiredFieldNotation";
        } else if (hierarchyUDD.required.toLowerCase() == "no") {
          hierarchyUDD.isRequired = false;
          hierarchyUDD.requiredImgScript = "FieldNotation";
        }
        data[hierarchyUDD.map_id] = hierarchyUDD;
        data[hierarchyUDD.map_id]["user_defined_data_type"] = "Hierarchy";
        for (var j = 0; j < hierarchyUDD.props.length; j++) {
          hierarchyPropsMap[hierarchyUDD.props[j]["id"]] =
            hierarchyUDD.props[j];
        }
        mapIds.push(hierarchyUDD.map_id);
      }

      let dormantMapIds = _.clone(mapIds);
      /** Edit Data Contains already created user defined data */
      for (var i = 0; i < vmCtrl.editData.length; i++) {
        var ed = vmCtrl.editData[i];
        if (data[ed[map_key]] !== undefined) {
          // if value for udd is set already then remove the id from dromant ids array
          dormantMapIds.splice(
            dormantMapIds.findIndex(mapId => mapId === ed[map_key]),
            1
          );
          if (
            data[ed[map_key]].format &&
            data[ed[map_key]].format.toLowerCase() == "multiselect" &&
            (ed.value !== null || ed.value !== undefined || ed.value !== "")
          ) {
            data[ed[map_key]]["selectedValueIds"] = ed.value
              .split(",")
              .map(Number);
          } else {
            data[ed[map_key]]["value"] = ed.value;
          }
          data[ed[map_key]]["old_value"] = ed.udd_value_id || ed.value;
          data[ed[map_key]]["udd_value_id"] = ed.udd_value_id;
          data[ed[map_key]]["udd_bridge_id"] = ed.id;
          data[ed[map_key]]["isCreated"] = true;
        }
      }

      // if Update Item then do not show default values in udd fields
      if (
        !common.$state.current.name.endsWith(".update") &&
        !common.$stateParams.id
      ) {
        // Assign defualt value to the fields for udds which does not have any values
        for (let i = 0; i < dormantMapIds.length; i++) {
          if (
            data[dormantMapIds[i]].user_defined_data_type.toLowerCase() ===
            "attribute"
          ) {
            // if udd is of attribute type then check format as well to set default value
            if (data[dormantMapIds[i]].format.toLowerCase() === "multiselect") {
              if (data[dormantMapIds[i]].default_value) {
                data[dormantMapIds[i]].selectedValueIds = data[
                    dormantMapIds[i]
                  ].default_value
                  .split(",")
                  .map(Number);
              }
            } else if (
              data[dormantMapIds[i]].format.toLowerCase() === "value list" ||
              data[dormantMapIds[i]].format.toLowerCase() === "rating"
            ) {
              data[dormantMapIds[i]].default_value ?
                (data[dormantMapIds[i]].udd_value_id =
                  data[dormantMapIds[i]].default_value) :
                null;
            } else {
              data[dormantMapIds[i]].value =
                data[dormantMapIds[i]].default_value;
            }
          } else {
            data[dormantMapIds[i]].udd_value_id =
              data[dormantMapIds[i]].default_value;
          }
        }
      }
      var uddRules = {};
      vmCtrl.result_udd_data = [];
      for (var i = 0; i < mapIds.length; i++) {
        var mapId = mapIds[i];
        // Setting validation rules using from and to and required value
        uddRules[mapId] = {};
        if (data[mapId]["isRequired"]) {
          let uddDescription = angular.copy(data[mapId]["maintenance_description"]);
          if (uddDescription !== undefined) {
            let length = 40;
            let end = "...";
            if (uddDescription && uddDescription.length <= length) {
              uddDescription = uddDescription;
            } else {
              uddDescription = common.$sce.trustAsHtml(String(uddDescription).substring(0, length) + end); /* trustAsHtml method to get truncate in ng-bind-html */
            }
          }
          uddRules[mapId]["required"] = {
            message: uddDescription + " is required"
          };
        }
        if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "integer") {
          uddRules[mapId]["digits"] = {
            integer: data[mapId]["to"].length,
            message: "Must be integer between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"]
          };
          uddRules[mapId]["range"] = {
            from: data[mapId]["from"],
            to: data[mapId]["to"],
            message: "Must be integer between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"]
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be integer between " +
            data[mapId]["from"] +
            " and " +
            data[mapId]["to"];
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "percentage") {
          uddRules[mapId]["digits"] = {
            integer: 10,
            fraction: 8,
            message: "Must be percentage number"
          };
          uddRules[mapId]["range"] = {
            from: parseInt(data[mapId]["from"].replace("%", "")),
            to: parseInt(data[mapId]["to"].replace("%", "")),
            message: "Must be percentage between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"]
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be decimal between " +
            data[mapId]["from"] +
            " and " +
            data[mapId]["to"];
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "date") {
          uddRules[mapId]["startAndEndDateCompare"] = {
            sval: data[mapId]["from"],
            eval: data[mapId]["to"],
            message: "Must be between " +
              moment(data[mapId]["from"]).format($scope.date_format) +
              " and " +
              moment(data[mapId]["to"]).format($scope.date_format)
          };
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "decimal") {
          uddRules[mapId]["digits"] = {
            integer: 10,
            fraction: 8,
            message: "Must be Decimal number"
          };
          uddRules[mapId]["range"] = {
            from: data[mapId]["from"],
            to: data[mapId]["to"],
            message: "Must be decimal between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"]
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be decimal between " +
            data[mapId]["from"] +
            " and " +
            data[mapId]["to"];
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "dimension") {
          uddRules[mapId]["digits"] = {
            integer: data[mapId]["to"].length,
            fraction: 8,
            message: "Must be number between " +
              data[mapId]["from"] +
              " " +
              vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
              " and " +
              data[mapId]["to"] +
              " " +
              vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
              " with upto 8 decimal digits."
          };
          uddRules[mapId]["range"] = {
            from: data[mapId]["from"],
            to: data[mapId]["to"],
            message: "Must be number between " +
              data[mapId]["from"] +
              " " +
              vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
              " and " +
              data[mapId]["to"] +
              " " +
              vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be number between " +
            data[mapId]["from"] +
            " " +
            vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit +
            " and " +
            data[mapId]["to"] +
            " " +
            vmCtrl.dimensionAttributesMap[data[mapId].id].dimension_unit;
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "text") {
          uddRules[mapId]["minLength"] = {
            number: data[mapId]["from"],
            message: "Must be text between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"] +
              " characters"
          };
          uddRules[mapId]["maxLength"] = {
            number: data[mapId]["to"],
            message: "Must be text between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"] +
              " characters"
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be text between " +
            data[mapId]["from"] +
            " and " +
            data[mapId]["to"] +
            " characters";
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "url") {
          uddRules[mapId]["pattern"] = {
            value: /^((http|https):\/\/)?(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/,
            message: "Must be a valid URL and Link text should contain alpha-numeric characters."
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be in a valid URL format. And link text should contain alpha-numeric characters.";
        }
        vmCtrl.result_udd_data.push(data[mapId]);
      }
      valdr.addConstraints({
        UddRules: uddRules
      });
      $scope.$parent.uddData = vmCtrl.result_udd_data;
      $scope.result_udd_data = vmCtrl.result_udd_data;
    }

    //Function to get link text and url path from URL format value saved
    vm.setLinkTextAndUrlPathModel = urlUdd => {
      //Check if the url udd value exists for the given udd
      if (urlUdd.value && urlUdd.value.length) {
        //Each url value will be saved the forma link_text::url_path, split by ::
        let urlValue = urlUdd.value.split("::");
        urlUdd.link_text_value = urlValue[0];
        urlUdd.url_path_value = urlValue[1];
      }
    };

    //This variable is to initialize the dropdown object used in selectize
    $scope.selectUddDropDown = {};
    //This is called in the selectize on each dropdown which is created in the ng-repeat
    vmCtrl.initDropDown = current_udd_data => {
      //Configure select UDD dropdown object
      $scope.selectUddDropDown[current_udd_data.maintenance_description] = {
        valueField: "id",
        labelField: "description",
        searchField: ["description"],
        sortField: "description",
        //Space is concatinated so that end of the text does not cut off
        placeholder: "Select " + current_udd_data.maintenance_description + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        //Adding the data to the options, so as to show the data in the dropdown
        options: current_udd_data.values,
        render: {
          option: (data, escape) => {
            if (data.value_status.toLowerCase() === "inactive") {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.description) +
                " : " +
                data.value_status +
                "</span>" +
                "</div>" +
                "</div>"
              );
            } else {
              return (
                '<div class="p-5">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.description) +
                " : " +
                data.value_status +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          //The selected option is sent to the item object
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.description) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    //If the udd date format is DATE, set the date to the selected user preference date
    vmCtrl.setDateFormat = data => {
      if (data.format && data.format.toLowerCase() === "date") {
        data.value = $scope.getDateBasedOnFormat(data.value);
      }
    };

    function updateUddValue(uddValObj, notificationString) {
      return new Promise(function (resolve, reject) {
        apiInstanceToUddValueUpdate(uddValObj)
          .then(res => {
            init();
            // body...
            $scope.locationUDDSuccessMessage =
              "Location User Defined data updated Successfully";
            resolve(res);
          })
          .catch(error => {});
      });
    }

    function deleteUddValues(valueId) {
      return new Promise(function (resolve, reject) {
        apiInstanceToUddValueDelete(valueId)
          .then(response => {
            resolve(response);
          })
          .catch(error => logger.error(error));
      });
    }

    function hasUpdateChanges(object, currentUddData) {
      let omitKeys = ["id", "location_id", "location_map_id", "status_id"];
      for (let key in object) {
        if (!omitKeys.includes(key)) {
          if (key === "value" || key === "udd_value_id") {
            if (
              currentUddData.user_defined_data_type.toLowerCase() ===
              "attribute" &&
              (currentUddData["format"].toLowerCase() === "date" ||
                currentUddData["format"].toLowerCase() === "multiselect")
            ) {
              if (!object[key] || object[key] === currentUddData["old_value"]) {
                vmCtrl.hasUpdateChanges = false;
              } else {
                return (vmCtrl.hasUpdateChanges = true);
              }
            } else if (
              currentUddData.user_defined_data_type.toLowerCase() ===
              "attribute" &&
              currentUddData["format"].toLowerCase() === "decimal"
            ) {
              if (
                !object[key] ||
                parseFloat(object[key]) ===
                parseFloat(currentUddData["old_value"])
              ) {
                vmCtrl.hasUpdateChanges = false;
              } else {
                return (vmCtrl.hasUpdateChanges = true);
              }
            } else {
              if (!object[key] || object[key] == currentUddData["old_value"]) {
                vmCtrl.hasUpdateChanges = false;
              } else {
                return (vmCtrl.hasUpdateChanges = true);
              }
            }
          } else {
            if (object[key] === currentUddData[key]) {
              vmCtrl.hasUpdateChanges = false;
            } else {
              return (vmCtrl.hasUpdateChanges = true);
            }
          }
        }
      }
      return vmCtrl.hasUpdateChanges;
    }
    $scope.update_udd_values = function () {
      var updatePromises = [];
      var createUddValues = [];
      var deletePromises = [];
      var deleteUddValueIds = [];
      let hasChanges = false;
      var notificationString = "show_notification";
      if (vmCtrl.result_udd_data && vmCtrl.result_udd_data.length > 0) {
        for (var i = 0; i < vmCtrl.result_udd_data.length; i++) {
          var obj = vmCtrl.result_udd_data[i];
          var udd_obj = {};
          var flag = false;
          udd_obj["status_id"] = default_status_id;
          udd_obj[map_key] = obj.map_id;

          /* Attribute , MTO Type , MTO Option  */
          if (
            obj.format &&
            obj.selectedValueIds &&
            obj.selectedValueIds.length > 0 &&
            obj.format.toLowerCase() === "multiselect"
          ) {
            udd_obj.value = obj.selectedValueIds.join(",");
            obj.value = obj.selectedValueIds.join(",");
            flag = true;
          }

          if (
            obj.user_defined_data_type !== "Hierarchy" &&
            obj.udd_value_id !== null &&
            obj.udd_value_id !== undefined &&
            obj.udd_value_id !== "" &&
            obj.udd_value_id !== 0 &&
            obj.udd_value_id !== "0"
          ) {
            udd_obj.udd_value_id = obj.udd_value_id;
            flag = true;
          }
          /* Attribute has no dropdown - integer,decimal,date,percentage,yes/no etc.*/
          if (
            typeof obj.has_values !== "undefined" &&
            obj.has_values == 0 &&
            obj.value !== null &&
            obj.value !== undefined &&
            obj.value !== ""
          ) {
            udd_obj.value = obj.value.toString();
            flag = true;
            /* Code commented for the issue mentioned in gitlab ticket #1717 - start */
            /* May revert if any issue occurs */
            // if (obj.format == "Date") {
            //   udd_obj.value = moment(obj.value, $scope.date_format).format(
            //     "YYYY-MM-DD"
            //   );
            // }
            /* Code commented for the issue mentioned in gitlab ticket #1717 - end */
          } else if (
            obj.format &&
            obj.format.toLowerCase() === "yes/no" &&
            (obj.value === undefined || obj.value === null || obj.value === "")
          ) {
            udd_obj.value = "0";
            flag = true;
          }
          /* Hierarchy Dropdown */
          if (obj.user_defined_data_type === "Hierarchy") {
            if (
              $scope.selectedHierarchyProperty !== undefined &&
              $scope.selectedHierarchyProperty[obj.map_id] !== undefined &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !==
              "" &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !==
              null &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !==
              undefined
            ) {
              udd_obj.udd_value_id =
                $scope.selectedHierarchyProperty[obj.map_id]["property_id"];
            } else {
              if (
                obj.udd_value_id !== null &&
                obj.udd_value_id !== "null" &&
                obj.udd_value_id !== undefined &&
                obj.udd_value_id !== ""
              ) {
                udd_obj.udd_value_id = obj.udd_value_id;
              }
            }
            flag = true;
          }

          if (
            obj.old_value &&
            !obj.value &&
            !obj.udd_value_id &&
            ((obj.user_defined_data_type.toLowerCase() === "attribute" &&
                obj.format.toLowerCase() !== "yes/no") ||
              obj.user_defined_data_type.toLowerCase() !== "attribute")
          ) {
            deletePromises.push(deleteUddValues(obj.udd_bridge_id));
            deleteUddValueIds.push(obj.udd_bridge_id);
          }

          if (obj.isCreated !== undefined) {
            udd_obj.id = obj.udd_bridge_id;
            udd_obj[map_id_key] = $scope.head.id;
            if (hasUpdateChanges(udd_obj, obj)) {
              hasChanges = true;
              updatePromises.push(updateUddValue(udd_obj, notificationString));
              notificationString = "hide_notification";
            }
          } else {
            udd_obj[map_id_key] = $scope.inserted_id;
            if (flag && (udd_obj.value || udd_obj.udd_value_id)) {
              createUddValues.push(udd_obj);
            }
          }
        }
      }

      Promise.all(updatePromises)
        .then(res => {
          if (deleteUddValueIds.length === 0 && !hasChanges) {
            $scope.locationUDDSuccessMessage =
              "Nothing to update in Location UDD";
          }
        })
        .catch(error => {});

      Promise.all(deletePromises)
        .then(response => {
          if (deleteUddValueIds.length > 0) {
            $scope.locationUDDSuccessMessage =
              "Location user defined data updated successfully.";
            init();
          }
        })
        .catch(error => {});
      if (createUddValues.length > 0) {
        let uddValuesObj = {};
        uddValuesObj["Objects"] = createUddValues;
        uddValuesObj["action"] = "bulk";
        apiInstanceToUddInsert(uddValuesObj)
          .then(response => {
            $scope.locationUDDSuccessMessage =
              "Location User Defined data created Successfully";
            $scope.edit_master_id = $scope.inserted_id;
            init();
          })
          .catch(error => {
            logger.error(error);
            $scope.edit_master_id = $scope.inserted_id;
            init();
          });
      }
    };

    $scope.setPercentValue = function (to_from_val, from, value) {
      if (value) {
        return value;
      }
      if (to_from_val !== null) {
        return to_from_val;
      } else {
        return from;
      }
    };

    // function to reset udd value
    $scope.resetUddValue = udd => {
      if (udd && udd.format && udd.format.toLowerCase() === "yes/no") {
        udd.value = "0";
      } else if (udd && udd.format && udd.format.toLowerCase() === "url") {
        udd.value = "";
        udd.link_text_value = "";
        udd.url_path_value = "";
      } else {
        udd.value = "";
      }
      if (
        udd.user_defined_data_type.toLowerCase() === "hierarchy" &&
        $scope.selectedHierarchyProperty[udd.map_id]
      ) {
        $scope.selectedHierarchyProperty[udd.map_id] = undefined;
      }
      udd.udd_value_id = undefined;
      udd.selectedValueIds = [];
    };

    $scope.$on("saveOrUpdateUdd", function (e, args) {
      /* variables to reset the Notification message-start */
      $scope.locationSuccessMessage = null;
      $scope.locationErrorMessage = null;
      $scope.locationUDDSuccessMessage = null;
      /* variables to reset the Notification message-end */
      if (
        args.response != undefined &&
        (args.response.status === 200 ||
          args.response.status === 201 ||
          args.response.status === 403)
      ) {
        if (args.response.data && args.response.data.inserted_id) {
          $scope.locationSuccessMessage = "Location is created Successfully";
        } else {
          args.response.status === 403 ?
            ($scope.locationSuccessMessage =
              "Nothing to update in Location Master") :
            ($scope.locationSuccessMessage =
              "Location is updated Successfully");
        }
        $scope.inserted_id = args.inserted_id;
        $scope.update_udd_values();
      } else if (args.error !== undefined) {
        if (args.error.data.status === 412) {
          $scope.locationErrorMessage = [args.error.data.error.message];
        } else if (args.error.data.status === 505) {
          $scope.locationErrorMessage = [args.error.data.error];
        }
      } else {
        $scope.locationErrorMessage = args.response.form_validation_error;
      }
    });
  }
  //Directive
  (function () {
    "use strict";

    angular
      .module("rc.prime.location")
      .directive(
        "locationUserdefinedDataDirective",
        locationUserdefinedDataDirective
      );

    function locationUserdefinedDataDirective() {
      // Usage:
      //     <location-userdefined-data-directive> </location-userdefined-data-directive>
      // Creates:
      //
      let directive = {
        restrict: "EA",
        controller: LocationUserDefinedDataController,
        controllerAs: "vmCtrl",
        templateUrl: "application/modules/location/maintenance/location.udd.directive.html"
      };
      return directive;
    }
  })();
})();