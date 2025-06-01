(function () {
  "use strict";

  angular
    .module("rc.prime.vendor")
    .controller(
      "VendorUserDefinedDataController",
      VendorUserDefinedDataController
    );

  VendorUserDefinedDataController.$inject = [
    "$scope",
    "common",
    "VendorUDDService",
    "VendorUDDValueService",
    "valdr",
    "GlobalRegularExpression",
    "ItemService"
  ];

  function VendorUserDefinedDataController(
    $scope,
    common,
    VendorUDDService,
    VendorUDDValueService,
    valdr,
    GlobalRegularExpression,
    ItemService
  ) {
    let vm = this;
    let vmCtrl = this;
    let map_key = "vendor_map_id";
    let map_id_key = "vendor_id";
    let logger = common.Logger.getInstance("VendorUserDefinedDataController");
    let Notification = common.Notification;
    $scope.globalRegularExpression = GlobalRegularExpression;

    let apiInstanceToRead = VendorUDDService.API.GetVendorUDDList;
    let apiInstanceToUddInsert = VendorUDDValueService.API.InsertVendorUDDValue;
    let apiInstanceToUddRead = VendorUDDValueService.API.SearchVendorUDDValue;
    let apiInstanceToUddValueUpdate =
      VendorUDDValueService.API.UpdateVendorUDDValue;
    let apiInstanceToUddValueDelete =
      VendorUDDValueService.API.DeleteVendorUDDValueById;

    $scope.$parent.vendorLoadingUDD = false;
    function init() {
      vmCtrl.getDimensionalAttributesList();
      vmCtrl.isUddLoaded = false;
      $scope.$parent.vendorLoadingUDD = true;
      $scope.selectedHierarchyProperty = {};
      $scope.uddValidationErrors = [];
      apiInstanceToRead($scope.head.type_id)
        .then(response => {
          vmCtrl.attributesUDDs = response.data.attributes;
          vmCtrl.hierarchyUDDs = response.data.hierarchies;
          $scope.udd_data = [];
          if ($scope.edit_master_id) {
            apiInstanceToUddRead(map_id_key, $scope.edit_master_id)
              .then(response => {
                dataMapping(response);
              })
              .catch(error => {
                $scope.$parent.vendorLoadingUDD = false;
                logger.error(error);
              });
          } else {
            var response = {
              data: []
            };
            dataMapping(response);
          }
        })
        .catch(error => {
          $scope.$parent.vendorLoadingUDD = false;
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
    $scope.$watch("isEnabled", function (n, o) {
      if (n && $scope.head.type_id) {
        vmCtrl.result_udd_data = [];
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
      $scope.$parent.vendorLoadingUDD = false;
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
          let valuesMap = {};
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
        //If the attribute UDD is  a required udd and if the value List has no values, show an error
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
        } else if (hierarchyUDD.required.toLowerCase() === "immediate") {
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
              data[dormantMapIds[i]].default_value
                ? (data[dormantMapIds[i]].selectedValueIds = data[
                  dormantMapIds[i]
                ].default_value
                  .split(",")
                  .map(Number))
                : null;
            } else if (
              data[dormantMapIds[i]].format.toLowerCase() === "value list" ||
              data[dormantMapIds[i]].format.toLowerCase() === "rating"
            ) {
              data[dormantMapIds[i]].default_value
                ? (data[dormantMapIds[i]].udd_value_id =
                  data[dormantMapIds[i]].default_value)
                : null;
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
            message:
              "Must be integer between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"]
          };
          uddRules[mapId]["range"] = {
            from: data[mapId]["from"],
            to: data[mapId]["to"],
            message:
              "Must be integer between " +
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
            message:
              "Must be percentage between " +
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
        } else if (data[mapId]["format"] === "Date") {
          uddRules[mapId]["startAndEndDateCompare"] = {
            sval: data[mapId]["from"],
            eval: data[mapId]["to"],
            message:
              "Must be between " +
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
            message:
              "Must be decimal between " +
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
            message:
              "Must be between " +
              moment(data[mapId]["from"]).format($scope.date_format) +
              " and " +
              moment(data[mapId]["to"]).format($scope.date_format)
          };
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "dimension") {
          uddRules[mapId]["digits"] = {
            integer: data[mapId]["to"].length,
            fraction: 8,
            message:
              "Must be number between " +
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
            message:
              "Must be number between " +
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
            message:
              "Must be text between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"] +
              " characters"
          };
          uddRules[mapId]["maxLength"] = {
            number: data[mapId]["to"],
            message:
              "Must be text between " +
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
            message:
              "Must be a valid URL and link text should contain alpha-numeric characters."
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

    $scope.setDateValue = function (_to_from_val, value) {
      if (value !== null && value !== undefined) {
        return $scope.getDateBasedOnFormat(value);
      } else if (_to_from_val !== null && _to_from_val !== undefined) {
        return $scope.getDateBasedOnFormat(_to_from_val);
      }
    };
    $scope.setValue = function (_to_from_val, value) {
      if (value !== undefined && value !== null) {
        return value;
      }
      if (_to_from_val !== null) {
        return _to_from_val;
      }
    };
    $scope.setPercentValue = function (_to_from_val, from, value) {
      if (value) {
        return value;
      }
      if (_to_from_val !== null) {
        return _to_from_val;
      } else {
        return from;
      }
    };

    function hasUpdateChanges(object, currentUddData) {
      let omitKeys = ["id", "status_id", "vendor_id", "vendor_map_id"];
      for (let key in object) {
        if (!omitKeys.includes(key)) {
          if (key === "value" || key === "udd_value_id") {
            if (
              currentUddData.user_defined_data_type.toLowerCase() ===
              "attribute" &&
              (currentUddData["format"].toLowerCase() === "date" ||
                currentUddData["format"].toLowerCase() === "yes/no" ||
                currentUddData["format"].toLowerCase() === "multiselect")
            ) {
              if (object[key] == currentUddData["old_value"]) {
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
                parseFloat(object[key]) ===
                parseFloat(currentUddData["old_value"])
              ) {
                vmCtrl.hasUpdateChanges = false;
              } else {
                return (vmCtrl.hasUpdateChanges = true);
              }
            } else {
              if (object[key] == currentUddData["old_value"]) {
                vmCtrl.hasUpdateChanges = false;
              } else {
                return (vmCtrl.hasUpdateChanges = true);
              }
            }
          } else {
            if (object[key] == currentUddData[key]) {
              vmCtrl.hasUpdateChanges = false;
            } else {
              return (vmCtrl.hasUpdateChanges = true);
            }
          }
        }
      }
      return vmCtrl.hasUpdateChanges;
    }

    function updateUddValue(uddValObj, notificationString, isVendorRMSNumber) {
      return new Promise(function (resolve, reject) {
        apiInstanceToUddValueUpdate(uddValObj)
          .then(response => {
            vmCtrl.init();
            $scope.$parent.vendorUDDSuccessMessage =
              "Vendor User defined data updated Successfully";
            resolve(response);
            if (isVendorRMSNumber) {
              ItemService.API.CaptureSKUChangesInVendorUDD($scope.head.id);
            }
          })
          .catch(error => { });
      });
    }

    function deleteUddValues(valueId, isVendorRMSNumber) {
      return new Promise(function (resolve, reject) {
        apiInstanceToUddValueDelete(valueId)
          .then(response => {
            resolve(response);
            vmCtrl.init();
            if (isVendorRMSNumber) {
              ItemService.API.CaptureSKUChangesInVendorUDD($scope.head.id);
            }
          })
          .catch(error => logger.error(error));
      });
    }

    $scope.update_udd_values = function () {
      var updatePromises = [];
      var createUddValues = [];
      var deletePromises = [];
      var deleteUddValueIds = [];
      let hasChanges = false;
      var notificationString = "show_notification";
      let isVendorRMSNumber = false;
      if (vmCtrl.result_udd_data) {
        for (var i = 0; i < vmCtrl.result_udd_data.length; i++) {
          var obj = vmCtrl.result_udd_data[i];
          var udd_obj = {};
          var flag = false;
          udd_obj["status_id"] = default_status_id; // code 200 Always ACTIVE
          udd_obj[map_key] = obj.map_id;

          /* Attribute , MTO Type , MTO Option */

          if (
            obj.format &&
            obj.format.toLowerCase() === "multiselect" &&
            obj.selectedValueIds &&
            obj.selectedValueIds.length > 0
          ) {
            udd_obj.value = obj.selectedValueIds.join(",");
            obj.value = obj.selectedValueIds.join(",");
            flag = true;
          }
          if (
            obj.user_defined_data_type !== "Hierarchy" &&
            obj.udd_value_id !== null &&
            obj.udd_value_id !== "null" &&
            obj.udd_value_id !== undefined &&
            obj.udd_value_id !== ""
          ) {
            udd_obj.udd_value_id = obj.udd_value_id;
            flag = true;
          }
          /* Attribute has no dropdown - integer,decimal,date,percentage,yes/no etc.*/
          if (
            typeof obj.has_values !== "undefined" &&
            obj.has_values == 0 &&
            obj.value &&
            obj.value !== null &&
            obj.value !== undefined &&
            obj.value !== ""
          ) {
            udd_obj.value = obj.value.toString();
            flag = true;
            if (obj.format && obj.format == "Date") {
              udd_obj.value = moment(obj.value, $scope.date_format).format(
                "YYYY-MM-DD"
              );
            }
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
            deletePromises.push(deleteUddValues(obj.udd_bridge_id, obj.description === "RMS Vendor Number"));
            deleteUddValueIds.push(obj.udd_bridge_id);
          }

          if (obj.isCreated !== undefined) {
            udd_obj.id = obj.udd_bridge_id;
            udd_obj[map_id_key] = $scope.head.id;
            if (hasUpdateChanges(udd_obj, obj)) {
              if (udd_obj.udd_value_id || udd_obj.value) {
                hasChanges = true;
                updatePromises.push(
                  updateUddValue(udd_obj, notificationString, obj.description === "RMS Vendor Number")
                );
                notificationString = "hide_notification";
              }
            }
          } else {
            if (obj.description === "RMS Vendor Number") {
              isVendorRMSNumber = true;
            }
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
            $scope.$parent.vendorUDDSuccessMessage =
              "Nothing to update in Vendor UDD";
          }
        })
        .catch(error => { });

      Promise.all(deletePromises)
        .then(response => {
          if (deleteUddValueIds.length > 0) {
            $scope.$parent.vendorUDDSuccessMessage =
              "Vendor user defined data updated successfully.";
          }
        })
        .catch(error => { });
      if (createUddValues.length > 0) {
        var uddValuesObj = {};
        uddValuesObj["Objects"] = createUddValues;
        uddValuesObj["action"] = "bulk";
        apiInstanceToUddInsert(uddValuesObj)
          .then(response => {
            $scope.$parent.vendorUDDSuccessMessage =
              "Vendor User defined data created Successfully";
            $scope.edit_master_id = $scope.inserted_id;
            init();
            if (isVendorRMSNumber) {
              ItemService.API.CaptureSKUChangesInVendorUDD($scope.head.id);
            }
          })
          .catch(error => {
            logger.error(error);
            $scope.$parent.vendorErrorMessage = error.message;
            $scope.edit_master_id = $scope.inserted_id;
            init();
          });
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

      // for(let i=0;i<vmCtrl.editData.length;i++) {
      //   let ed = vmCtrl.editData[i];
      //   if(udd.udd_bridge_id === ed.id) {
      //     ed.value = "";
      //     ed.udd_value_id = undefined;
      //   }
      // }
    };

    $scope.$on("saveOrUpdateUdd", function (e, args) {
      /* variables to reset the Notification message-start */
      $scope.$parent.vendorSuccessMessage = null;
      $scope.$parent.vendorErrorMessage = null;
      $scope.$parent.vendorUDDSuccessMessage = null;
      /* variables to reset the Notification message-end */
      if (
        args.response != undefined &&
        (args.response.status == 200 ||
          args.response.status === 201 ||
          args.response.status === 403)
      ) {
        if (args.response.data && args.response.data.inserted_id) {
          //while creating UDD
          $scope.vendorSuccessMessage = args.response.data.message;
        } else {
          //while updating UDD
          args.response.status === 403
            ? ($scope.$parent.vendorSuccessMessage =
              "Nothing to update in Vendor Master")
            : ($scope.$parent.vendorSuccessMessage =
              "Vendor is updated Successfully");
        }
        $scope.inserted_id = args.inserted_id;
        $scope.update_udd_values();
      } else if (
        args.response.data !== undefined &&
        args.response.data.error !== undefined
      ) {
        $scope.$parent.vendorErrorMessage = args.response.data.error.message;
      } else {
        $scope.vendorErrorMessage = args.response.form_validation_error;
      }
    });
  }
  //Directive
  (function () {
    "use strict";

    angular
      .module("rc.prime.vendor")
      .directive(
        "vendorUserdefinedDataDirective",
        vendorUserdefinedDataDirective
      );

    function vendorUserdefinedDataDirective() {
      // Usage:
      //     <vendor-userdefined-data-directive> </vendor-userdefined-data-directive>
      // Creates:
      //
      var directive = {
        restrict: "EA",
        controller: VendorUserDefinedDataController,
        controllerAs: "vmCtrl",
        templateUrl:
          "application/modules/vendor/maintenance/vendor.udd.directive.html"
      };
      return directive;
    }
  })();
})();
