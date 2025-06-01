(function () {
  "use strict";

  angular
    .module("rc.prime.sku")
    .controller("SkuOptionUddController", SkuOptionUddController);

  SkuOptionUddController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "ItemUDDService",
    "ItemUDDValueService",
    "SkuOptionDetailService",
    "SkuOptionHeaderService",
    "valdr",
    "StatusCodes",
    "SKUService",
    "ItemService",
    "GlobalRegularExpression"
  ];

  function SkuOptionUddController(
    $scope,
    $stateParams,
    common,
    ItemUDDService,
    ItemUDDValueService,
    SkuOptionDetailService,
    SkuOptionHeaderService,
    valdr,
    StatusCodes,
    SKUService,
    ItemService,
    GlobalRegularExpression
  ) {
    var vm = this;
    var default_status_id = 200; // ACTIVE for ALL
    var vmCtrl = this;
    vmCtrl.primeVisibilityId = "2"; // prime visibility id
    let $q = common.$q;
    let Notification = common.Notification;
    let logger = common.Logger.getInstance("SkuOptionUddController");
    let isUpdateSku = $stateParams.id ? true : false;

    let apiInstanceToRead = ItemUDDService.API.GetSKUUDDList;
    let apiInstanceToUddInsert = ItemUDDValueService.API.InsertItemUDDValue;
    let apiInstanceToUddRead = ItemUDDValueService.API.MultiSearchItemUDDValue;
    let apiInstanceToUddValueDelete =
      ItemUDDValueService.API.DeleteItemUDDValueById;
    let apiInstanceToUddValueUpdate =
      ItemUDDValueService.API.UpdateItemUDDValue;
    let apiItemUDDValueOptionChoices =
      ItemUDDValueService.API.GetUddValueOptionChoices;
    let apiSearchSkuDetail = SkuOptionDetailService.API.SearchSkuOptionDetail;
    let apiSaveSkuDetail = SkuOptionDetailService.API.InsertSkuOptionDetail;
    let apiUpdateSkuDetail = SkuOptionDetailService.API.UpdateSkuOptionDetail;
    $scope.globalRegularExpression = GlobalRegularExpression;
    $scope.$watch("skuHead.option_list_id", function (n, o) {
      loadInitialDetail();
    });
    $scope.$watch("isEnabled", function (n, o) {
      if (
        ($scope.skuHead && $scope.skuHead.option_list_id) ||
        (
          !isUpdateSku &&
          (
            !$scope.$parent.skuMaintCtrl.skuuddForm ||
            !$scope.$parent.skuMaintCtrl.skuuddForm.$dirty
          )
        )
      ) {
        init();
      }
    });
    $scope.statusCodes = StatusCodes;

    function loadInitialDetail() {
      if ($scope.selected_item) {
        apiItemUDDValueOptionChoices($scope.selected_item.id)
          .then(response => {
            var mapOptChoices = {};
            var ids = [];
            $scope.item_udd_options = [];
            _.each(response.data, function (optChoice) {
              mapOptChoices[optChoice.option_id] = optChoice;
              ids.push(optChoice.option_id);
            });
            if ($scope.skuHead && $scope.skuHead.option_list_id) {
              apiSearchSkuDetail(
                "option_header_id",
                $scope.skuHead.option_list_id
              )
                .then(response => {
                  _.each(response.data, function (optDetail) {
                    if (mapOptChoices[optDetail.option_id] !== undefined) {
                      mapOptChoices[optDetail.option_id]["value_description"] =
                        optDetail.value_description;
                      mapOptChoices[optDetail.option_id]["value_level"] =
                        optDetail.value_level;
                      mapOptChoices[optDetail.option_id]["value_id"] =
                        optDetail.value_id;
                      mapOptChoices[optDetail.option_id]["old_value_id"] =
                        optDetail.value_id;
                      mapOptChoices[optDetail.option_id]["is_created"] = true;
                      mapOptChoices[optDetail.option_id]["id"] = optDetail.id;
                    }
                  });

                  if ($scope.item_udd_options.length !== ids.length) {
                    _.each(ids, function (id) {
                      mapOptChoices[id]["option_header_id"] = Number($scope.skuHead.option_list_id);
                      $scope.item_udd_options.push(mapOptChoices[id]);
                    });
                  }

                  $scope.$parent.udd_options = $scope.item_udd_options;
                })
                .catch(error => {
                  logger.error(error);
                });
            } else if ($scope.skuHead && !$scope.skuHead.option_list_id) {
              apiSearchSkuDetail(
                "sku_id",
                $scope.skuHead.id
              )
                .then(response => {
                  _.each(response.data, function (optDetail) {
                    if (mapOptChoices[optDetail.option_id] !== undefined) {
                      mapOptChoices[optDetail.option_id]["value_description"] =
                        optDetail.value_description;
                      mapOptChoices[optDetail.option_id]["value_level"] =
                        optDetail.value_level;
                      mapOptChoices[optDetail.option_id]["value_id"] =
                        optDetail.value_id;
                      mapOptChoices[optDetail.option_id]["old_value_id"] =
                        optDetail.value_id;
                      mapOptChoices[optDetail.option_id]["is_created"] = true;
                      mapOptChoices[optDetail.option_id]["id"] = optDetail.id;
                    }
                  });

                  if ($scope.item_udd_options.length !== ids.length) {
                    _.each(ids, function (id) {
                      $scope.item_udd_options.push(mapOptChoices[id]);
                    });
                  }

                  $scope.$parent.udd_options = $scope.item_udd_options;
                })
                .catch(error => {
                  logger.error(error);
                });
            } else {
              _.each(ids, function (id) {
                $scope.item_udd_options.push(mapOptChoices[id]);
              });
              $scope.$parent.udd_options = $scope.item_udd_options;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
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

    function updateSkuDetail(obj, show) {
      var deferred = $q.defer();
      apiUpdateSkuDetail(obj)
        .then(response => {
          if (show) {
            Notification.responsenotification(response.data);
          }
          deferred.resolve(response.data);
        })
        .catch(error => {
          deferred.reject(error);
          logger.error(error);
        });
      return deferred.promise;
    }

    function createSkuDetail(obj, show) {
      var deferred = $q.defer();
      apiSaveSkuDetail(obj)
        .then(response => {
          if (show) {
            Notification.responsenotification(response.data);
          }
          deferred.resolve(response.data);
        })
        .catch(error => {
          deferred.reject(error);
          logger.error(error);
        });
      return deferred.promise;
    }
    $scope.update_sku_details = function () {
      var p = [];
      _.each($scope.item_udd_options, function (updateOption) {
        if (updateOption.value_level === "All") {
          updateOption.value_id = 0;
        }
        var show = true;
        if (
          updateOption.is_created !== undefined &&
          updateOption.changed !== undefined &&
          updateOption.old_value_id !== updateOption.value_id
        ) {
          updateOption.option_header_id = $scope.skuHead.option_list_id;
          updateOption.status_id = default_status_id;
          p.push(updateSkuDetail(updateOption, show)); // Updating Sku Details
          show = false;
        }
        if (
          updateOption.is_created === undefined &&
          (updateOption.changed !== undefined ||
            (!updateOption.changed && updateOption.value_level === "All"))
        ) {
          if (updateOption.option_header_id) {
            updateOption.option_header_id = $scope.skuHead.option_list_id;
          } else {
            updateOption.sku_id = $scope.skuHead.id;
          }
          updateOption.status_id = default_status_id;
          p.push(createSkuDetail(updateOption)); //Creating Sku Detail
          show = false;
        }
      });
      Promise.all(p)
        .then(function (results) {
          loadInitialDetail();
          if (!$stateParams.id) {
            $scope.$parent.skuMTOUDDSuccessMessage =
              "SKU MTO option details created successfully";
          } else {
            if (results.length > 0) {
              $scope.$parent.skuMTOUDDSuccessMessage =
                "SKU MTO option details updated successfully";
            } else {
              $scope.$parent.skuMTOUDDSuccessMessage =
                "Nothing to update in SKU MTO option details";
            }
          }
        })
        .catch(function (err) { });
    };
    $scope.setOptionValueLevel = function (each) {
      if (each.value_level === "Choice") {
        each.genericList = each.choices;
        each.value_id = each.old_value_id;
      } else if (each.value_level === "Family") {
        each.genericList = each.families;
        each.value_id = each.old_value_id;
      } else if (each.value_level === "Collection") {
        each.genericList = each.collections;
        each.value_id = each.old_value_id;
      } else if (each.value_level === "All") {
        //each.genericList = each.collections.concat(each.families).concat(each.choices);
        each.value_id = 0;
        each.changed = 1;
      }
      if (each.value_level == undefined) {
        if ($scope.skuHead.sku_type == "Stock") {
          each.value_level = "Choice";
          each.genericList = each.choices;
          each.value_id = each.old_value_id;
        } else {
          each.value_level = "All";
          // each.genericList = each.collections.concat(each.families).concat(each.choices);
          each.value_id = 0;
        }
      }
    };

    /******************************** SKU UDD List Code ********************************************************************/

    function init() {
      vmCtrl.getDimensionalAttributesList();
      vmCtrl.isUddLoaded = false;
      $scope.selectedHierarchyProperty = {};
      $scope.$parent.uddData = [];
      $scope.uddValidationErrors = [];
      $scope.$parent.skuLoadingUDD = true;
      if ($scope.selected_item) {
        apiInstanceToRead($scope.selected_item.type_id, $stateParams.subtype)
          .then(response => {
            vmCtrl.attributesUDDs = response.data.attributes;
            vmCtrl.hierarchyUDDs = response.data.hierarchies;
            vmCtrl.mtoOptionTypeUDDs = response.data.option_types;
            vmCtrl.mtoOptionUDDs = response.data.options;
            if ($scope.edit_sku_master_id) {
              apiInstanceToUddRead({
                entry_id: $scope.edit_sku_master_id,
                entry_level: "SKU"
              })
                .then(response => {
                  dataMapping(response.data);
                  if (
                    $scope.selected_item.old_type_id &&
                    parseInt($scope.selected_item.type_id) !==
                    parseInt($scope.selected_item.old_type_id)
                  ) {
                    assignUddValuesForUdds(response.data);
                  }
                })
                .catch(error => {
                  if ($scope.$parent) {
                    $scope.$parent.skuLoadingUDD = false;
                  }
                  logger.error(error);
                });
            } else {
              if (
                $scope.selected_item.isUpdateItemType &&
                $scope.selected_item.old_type_id &&
                parseInt($scope.selected_item.type_id) !==
                parseInt($scope.selected_item.old_type_id)
              ) {
                SKUService.API.GetSKUByItem($scope.selected_item.id).then(
                  response => {
                    vmCtrl.skus = response.data.data;
                    // fetchSkuHeaders($scope.selected_item.type_id);
                    if (vmCtrl.skus.length > 0) {
                      for (let j = 0; j < vmCtrl.skus.length; j++) {
                        apiInstanceToUddRead({
                          entry_id: vmCtrl.skus[j].id,
                          entry_level: "SKU"
                        }).then(response => {
                          assignUddValuesForUdds(response.data);
                          dataMapping(response.data, vmCtrl.skus[j]);
                        });
                      }
                    } else {
                      //Load true if no skus are present
                      vmCtrl.isLoaded = true;
                    }
                  }
                );
              } else {
                var response = {
                  data: []
                };
                dataMapping(response.data);
              }
            }
          })
          .catch(error => {
            $scope.$parent.skuLoadingUDD = false;
            logger.error(error);
          });
      }
    }
    init();

    $scope.setPropertyFn = function (data) {
      $scope.$parent.selectedHierarchyProperty = data.selectedHierarchyProperty;
    };
    var default_status_id = 200; // ACTIVE for ALL
    function dataMapping(results, sku) {
      vmCtrl.editData = results;
      if ($scope.$parent) {
        $scope.$parent.skuLoadingUDD = false;
      }
      if (results.length > 0) {
        $scope.setdefault = false;
      } else {
        $scope.setdefault = true;
      }
      vmCtrl.isUddLoaded = true;
      var data = {}; // It contains all hierarchies,attributes,options
      $scope.uddValues = {};
      var mapIds = [];
      var hierarchyPropsMap = {};
      for (var i = 0; i < vmCtrl.attributesUDDs.length; i++) {
        var attributeUDD = vmCtrl.attributesUDDs[i];
        attributeUDD.isRequired = false;
        attributeUDD.requiredImgScript = "optionalFieldNotation";
        if (vmCtrl.attributesUDDs[i]["format"].toLowerCase() == "multiselect") {
          const unique = [];
          vmCtrl.attributesUDDs[i].values.map(x => unique.filter(a => a.description == x.description).length > 0 ? null : unique.push(x));
          vmCtrl.attributesUDDs[i].values = unique;
        }
        //If the attribute UDD is  a required udd and if the value List has no values, show an error
        if (
          vmCtrl.attributesUDDs[i].values.length === 1 &&
          (vmCtrl.attributesUDDs[i]["format"] === "Value List" ||
            vmCtrl.attributesUDDs[i]["format"] === "Rating" ||
            vmCtrl.attributesUDDs[i]["format"].toLowerCase() ==
            "multiselect") &&
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
          $scope.skuHead &&
          $scope.skuHead.status_id !== 100 &&
          attributeUDD.required.toLowerCase() === "activation"
        ) {
          if (attributeUDD.value == undefined || null && attributeUDD.udd_value_id == undefined || null && attributeUDD.selectedValueIds == [] && attributeUDD.required.toLowerCase() === "activation") {
            if (attributeUDD.default_value != "") {
              attributeUDD.value = parseInt(attributeUDD.default_value);
              attributeUDD.udd_value_id = parseInt(attributeUDD.default_value);
              if (attributeUDD.format.toLowerCase() == "multiselect") {
                var value = attributeUDD.default_value.split(',');
                for (let i = 0; i < value.length; i++) {
                  value[i] = parseInt(value[i]);
                }
                attributeUDD.selectedValueIds = value;
              }
            } else {
              attributeUDD.value = attributeUDD.default_value;
              attributeUDD.udd_value_id = attributeUDD.default_value;
              if (attributeUDD.format.toLowerCase() == "multiselect") {
                var value = attributeUDD.default_value.split(',');
                for (let i = 0; i < value.length; i++) {
                  value[i] = value[i];
                }
                attributeUDD.selectedValueIds = parseInt(value);
              }
            }
            if (attributeUDD.format.toLowerCase() === "yes/no") {
              attributeUDD.isRequired = false;
            }
            else attributeUDD.isRequired = true;
          } else {
            if (attributeUDD.format.toLowerCase() === "yes/no") {
              attributeUDD.isRequired = false;
            }
            else attributeUDD.isRequired = true;
          }
          attributeUDD.requiredImgScript = "optionalFieldNotation";
        } else if (attributeUDD.required == "Immediate") {
          if (attributeUDD.value == undefined || null && attributeUDD.udd_value_id == undefined || null && attributeUDD.selectedValueIds == [] && attributeUDD.required == "Immediate") {
            if (attributeUDD.default_value != "") {
              attributeUDD.value = parseInt(attributeUDD.default_value);
              attributeUDD.udd_value_id = parseInt(attributeUDD.default_value);
              if (attributeUDD.format.toLowerCase() == "multiselect") {
                if (attributeUDD.default_value != '') {
                  var value = attributeUDD.default_value.split(',');
                  for (let i = 0; i < value.length; i++) {
                    value[i] = parseInt(value[i]);
                  }
                  attributeUDD.selectedValueIds = value;
                }
              }
            } else {
              attributeUDD.value = attributeUDD.default_value;
              attributeUDD.udd_value_id = attributeUDD.default_value;
              if (attributeUDD.format.toLowerCase() == "multiselect") {
                if (attributeUDD.default_value == '') {
                  var value = attributeUDD.default_value.split(',');
                  for (let i = 0; i < value.length; i++) {
                    value[i] = value[i];
                  }
                  attributeUDD.selectedValueIds = parseInt(value);
                }
              }
            }
            if (attributeUDD.format.toLowerCase() === "yes/no") {
              attributeUDD.isRequired = false;
            }
            else attributeUDD.isRequired = true;
          } else {
            if (attributeUDD.format.toLowerCase() === "yes/no") {
              attributeUDD.isRequired = false;
            }
            else attributeUDD.isRequired = true;
          }
          if (attributeUDD.required == "Immediate") {
            attributeUDD.requiredImgScript = "requiredFieldNotation";
          }
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
        } else if (attributeUDD.format && attributeUDD.format.toLowerCase() === "date range") {
          let toValuesRange = attributeUDD.to.split(",");
          // max and min to date required to add validation
          attributeUDD.min_to_date = $scope.getDateBasedOnFormat($scope.addDaysToDate(attributeUDD.from, toValuesRange[0]));
          attributeUDD.max_to_date = $scope.getDateBasedOnFormat($scope.addDaysToDate(attributeUDD.from, toValuesRange[1]));
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
          $scope.skuHead &&
          $scope.skuHead.status_id !== 100 &&
          hierarchyUDD.required.toLowerCase() === "activation"
        ) {
          if (hierarchyUDD.value == undefined || null && hierarchyUDD.udd_value_id == undefined || null && hierarchyUDD.required.toLowerCase() === "activation") {
            hierarchyUDD.value = hierarchyUDD.default_value;
            hierarchyUDD.udd_value_id = hierarchyUDD.default_value;
            hierarchyUDD.isRequired = true;
          } else {
            hierarchyUDD.isRequired = true;
          }
          hierarchyUDD.requiredImgScript = "optionalFieldNotation";
        } else if (hierarchyUDD.required == "Immediate") {

          if (hierarchyUDD.value == undefined || null && hierarchyUDD.udd_value_id == undefined || null && hierarchyUDD.required == "Immediate") {
            hierarchyUDD.value = hierarchyUDD.default_value;
            hierarchyUDD.udd_value_id = hierarchyUDD.default_value;
            hierarchyUDD.isRequired = true;
          }
          hierarchyUDD.isRequired = true;
          hierarchyUDD.requiredImgScript = "requiredFieldNotation";
        } else if (hierarchyUDD.required.toLowerCase() == "no") {
          hierarchyUDD.isRequired = false;
          hierarchyUDD.requiredImgScript = "FieldNotation";
        }
        data[hierarchyUDD.map_id] = hierarchyUDD;
        data[hierarchyUDD.map_id]["user_defined_data_type"] = "Hierarchy";
        hierarchyUDD.maintenance_description.toLowerCase() == "as400 hierarchy" ? $scope.disabledIds = [] : null;

        for (var j = 0; j < hierarchyUDD.props.length; j++) {
          hierarchyPropsMap[hierarchyUDD.props[j]["id"]] =
            hierarchyUDD.props[j];
          if (hierarchyUDD.maintenance_description.toLowerCase() == "as400 hierarchy" && hierarchyUDD.props[j].parent_id == null) {
            $scope.disabledIds.push(hierarchyUDD.props[j].id);
          }
        }
        mapIds.push(hierarchyUDD.map_id);
      }

      for (var i = 0; i < vmCtrl.mtoOptionTypeUDDs.length; i++) {
        var mtoOptionTypeUDD = vmCtrl.mtoOptionTypeUDDs[i];
        mtoOptionTypeUDD.isRequired = false;
        mtoOptionTypeUDD.requiredImgScript = "optionalFieldNotation";
        if (
          $scope.skuHead &&
          $scope.skuHead.status_id !== 100 &&
          mtoOptionTypeUDD.required.toLowerCase() == "activation"
        ) {
          if (mtoOptionTypeUDD.required == "Activation" && mtoOptionTypeUDD.udd_value_id == undefined || null && mtoOptionTypeUDD.value == undefined || null) {
            mtoOptionTypeUDD.value = mtoOptionTypeUDD.default_value;
            mtoOptionTypeUDD.udd_value_id = mtoOptionTypeUDD.default_value;
            mtoOptionTypeUDD.isRequired = true;
          } else {
            mtoOptionTypeUDD.isRequired = true;
          }
          mtoOptionTypeUDD.requiredImgScript = "optionalFieldNotation";
        } else if (mtoOptionTypeUDD.required.toLowerCase() === "immediate") {
          if (mtoOptionTypeUDD.value == undefined || null && mtoOptionTypeUDD.udd_value_id == undefined || null && mtoOptionTypeUDD.required.toLowerCase() === "immediate") {
            mtoOptionTypeUDD.isRequired = true;
            mtoOptionTypeUDD.value = mtoOptionTypeUDD.default_value;
            mtoOptionTypeUDD.udd_value_id = mtoOptionTypeUDD.default_value;
          } else {
            mtoOptionTypeUDD.isRequired = true;
          }
          mtoOptionTypeUDD.requiredImgScript = "requiredFieldNotation";
        } else if (mtoOptionTypeUDD.required.toLowerCase() === "no") {
          mtoOptionTypeUDD.isRequired = false;
          mtoOptionTypeUDD.requiredImgScript = "FieldNotation";
        }
        data[mtoOptionTypeUDD.map_id] = mtoOptionTypeUDD;
        data[mtoOptionTypeUDD.map_id]["user_defined_data_type"] = "OptionType";
        mapIds.push(mtoOptionTypeUDD.map_id);
      }
      for (var i = 0; i < vmCtrl.mtoOptionUDDs.length; i++) {
        var mtoOptionUDD = vmCtrl.mtoOptionUDDs[i];
        mtoOptionUDD.isRequired = false;
        mtoOptionUDD.requiredImgScript = "optionalFieldNotation";
        if (
          $scope.skuHead &&
          $scope.skuHead.status_id !== 100 &&
          mtoOptionUDD.required.toLowerCase() == "activation"
        ) {

          if (mtoOptionUDD.required == "Activation" && mtoOptionUDD.value == undefined || null && mtoOptionUDD.udd_value_id == undefined || null) {
            mtoOptionUDD.value = mtoOptionUDD.default_value;
            mtoOptionUDD.udd_value_id = mtoOptionUDD.default_value;
            mtoOptionUDD.isRequired = true;
          } else {
            mtoOptionUDD.isRequired = true;
          }
          mtoOptionUDD.requiredImgScript = "optionalFieldNotation";
        } else if (mtoOptionUDD.value == undefined || null && mtoOptionUDD.udd_value_id == undefined || null && mtoOptionUDD.required == "Immediate") {
          mtoOptionUDD.isRequired = true;
          mtoOptionUDD.value = mtoOptionUDD.default_value;
          mtoOptionUDD.udd_value_id = mtoOptionUDD.default_value;
          mtoOptionUDD.requiredImgScript = "requiredFieldNotation";
        } else if (mtoOptionUDD.required.toLowerCase() === "no") {
          mtoOptionUDD.isRequired = false;
          mtoOptionUDD.requiredImgScript = "FieldNotation";
        }
        data[mtoOptionUDD.map_id] = mtoOptionUDD;
        data[mtoOptionUDD.map_id]["user_defined_data_type"] = "Option";
        mapIds.push(mtoOptionUDD.map_id);
      }

      let dormantMapIds = _.clone(mapIds);
      /** Edit Data Contains already created user defined data */
      for (var i = 0; i < vmCtrl.editData.length; i++) {
        var ed = vmCtrl.editData[i];
        if (data[ed["item_map_id"]] !== undefined) {
          // if value for udd is set already then remove the id from dromant ids array
          dormantMapIds.splice(
            dormantMapIds.findIndex(mapId => mapId === ed["item_map_id"]),
            1
          );
          if (
            data[ed["item_map_id"]].format &&
            data[ed["item_map_id"]].format.toLowerCase() == "multiselect" &&
            (ed.value)
          ) {
            data[ed["item_map_id"]]["selectedValueIds"] = ed.value
              .split(",")
              .map(Number);
          } else if (
            data[ed["item_map_id"]].format &&
            data[ed["item_map_id"]].format.toLowerCase() == "date range" &&
            (ed.value)
          ) {
            let fromToValue = ed.value.split(",");
            data[ed["item_map_id"]]["value"] = ed.value;
            data[ed["item_map_id"]].from_date_value = $scope.getDateBasedOnFormat(fromToValue[0]);
            data[ed["item_map_id"]].to_date_value = $scope.getDateBasedOnFormat(fromToValue[1]);
          } else {
            data[ed["item_map_id"]]["value"] = ed.value;
          }

          data[ed["item_map_id"]]["old_value"] = ed.udd_value_id
            ? ed.udd_value_id + ""
            : ed.value;
          data[ed["item_map_id"]]["udd_value_id"] = ed.udd_value_id;
          data[ed["item_map_id"]]["udd_bridge_id"] = ed.id;
          data[ed["item_map_id"]]["isCreated"] = true;
        }
      }

      // if Update Item then do not show default values in udd fields
      if (
        (!common.$state.current.name.endsWith(".update") &&
          !common.$stateParams.id) ||
        $scope.selected_item.isUpdateItemType
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
              data[dormantMapIds[i]].default_value
                ? (data[dormantMapIds[i]].udd_value_id =
                  data[dormantMapIds[i]].default_value)
                : null;
            } else if (
              data[dormantMapIds[i]].format.toLowerCase() === "date range" &&
              !data[dormantMapIds[i]].default_value.includes("none")
            ) {
              let toValuesRange = data[dormantMapIds[i]].to.split(",");
              let toDate = $scope.addDaysToDate(data[dormantMapIds[i]].from, data[dormantMapIds[i]].default_value.split(",")[1])

              // from and to date values required to show default value in udd section
              data[dormantMapIds[i]].from_date_value = $scope.getDateBasedOnFormat(data[dormantMapIds[i]].from);
              data[dormantMapIds[i]].to_date_value = $scope.getDateBasedOnFormat(toDate);
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
      vmCtrl.item_udd_data = [];
      sku ? (sku.item_udd_data = []) : null;
      for (var i = 0; i < mapIds.length; i++) {
        var mapId = mapIds[i];
        // Setting validation rules using from and to and required value
        uddRules[mapId] = {};
        if (data[mapId]["isRequired"]) {
          let uddDescription = angular.copy(
            data[mapId]["maintenance_description"]
          );
          if (uddDescription !== undefined) {
            let length = 40;
            let end = "...";
            if (uddDescription && uddDescription.length <= length) {
              uddDescription = uddDescription;
            } else {
              uddDescription = common.$sce.trustAsHtml(
                String(uddDescription).substring(0, length) + end
              ); /* trustAsHtml method to get truncate in ng-bind-html */
            }
          }
          uddRules[mapId]["required"] = {
            message: uddDescription + " is required"
          };
        }
        if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "integer"
        ) {
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
        } else if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "number select"
        ) {
          uddRules[mapId]["digits"] = {
            integer: data[mapId]["to"].length,
            message:
              "Must be number between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"]
          };
          uddRules[mapId]["range"] = {
            from: data[mapId]["from"],
            to: data[mapId]["to"],
            message:
              "Must be number between " +
              data[mapId]["from"] +
              " and " +
              data[mapId]["to"]
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be number between " +
            data[mapId]["from"] +
            " and " +
            data[mapId]["to"];
        } else if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "percentage"
        ) {
          uddRules[mapId]["digits"] = {
            integer: 10,
            fraction: 8,
            message: "Must be Percentage number"
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
            " must be percentage between " +
            data[mapId]["from"] +
            " and " +
            data[mapId]["to"];
        } else if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "decimal"
        ) {
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
        } else if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "date"
        ) {
          uddRules[mapId]["startAndEndDateCompare"] = {
            sval: data[mapId]["from"],
            eval: data[mapId]["to"],
            message:
              "Must be between " +
              moment(data[mapId]["from"]).format($scope.date_format) +
              " and " +
              moment(data[mapId]["to"]).format($scope.date_format)
          };
        } else if (data[mapId]["format"] && data[mapId]["format"].toLowerCase() === "date range") {
          uddRules[mapId + '-1'] = {};
          uddRules[mapId + '-2'] = {};
          uddRules[mapId + '-1']["startAndEndDateCompare"] = {
            sval: data[mapId]["from"],
            eval: data[mapId]["max_to_date"],
            message:
              "From date must be between " +
              moment(data[mapId]["from"]).format($scope.date_format) +
              " and " +
              moment(data[mapId]["max_to_date"]).format($scope.date_format)
          };
          uddRules[mapId + '-2']["startAndEndDateCompare"] = {
            sval: data[mapId]["min_to_date"],
            eval: data[mapId]["max_to_date"],
            message:
              "To date must be between " +
              moment(data[mapId]["min_to_date"]).format($scope.date_format) +
              " and " +
              moment(data[mapId]["max_to_date"]).format($scope.date_format)
          };
        } else if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "dimension"
        ) {
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
        } else if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "text"
        ) {
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
          uddRules[mapId]["pattern"] = {
            value: $scope.globalRegularExpression,
            message: `${data[mapId]["maintenance_description"]} must be a valid string`
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be text between " +
            data[mapId]["from"] +
            " and " +
            data[mapId]["to"] +
            " characters";
        } else if (
          data[mapId]["format"] &&
          data[mapId]["format"].toLowerCase() === "url"
        ) {
          uddRules[mapId]["pattern"] = {
            value: /^((http|https):\/\/)?(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/,
            message:
              "Must be a valid URL formats and Link text should contain alpha-numeric characters."
          };
          data[mapId]["message"] =
            data[mapId]["maintenance_description"] +
            " must be in a valid URL format. And link text should contain alpha-numeric characters.";
        }
        if (
          data[mapId]["entry_level"] === "Choice" &&
          data[mapId]["isCreated"] === undefined
        ) {
          data[mapId]["udd_value"] = null;
          data[mapId]["udd_value_id"] = null;
          data[mapId]["_to_from_val"] = null;
        }
        vmCtrl.item_udd_data.push(data[mapId]);
        sku ? sku.item_udd_data.push(data[mapId]) : null;
      }
      $stateParams["sku_udd_config"] = vmCtrl.item_udd_data;
      valdr.addConstraints({
        UddRules: uddRules
      });
      if ($scope.$parent) {
        $scope.$parent.uddData = vmCtrl.item_udd_data;
      }
      $scope.item_udd_data = vmCtrl.item_udd_data;
    }

    //Function to get link text and url path from URL format value saved
    vm.setLinkTextAndUrlPathModel = urlUdd => {
      //Check if the url udd value exists for the given udd
      if (urlUdd.value && urlUdd.value.length > 0) {
        //Each url value will be saved the forma link_text::url_path, split by ::
        let urlValue = urlUdd.value.split("::");
        urlUdd.link_text_value = urlValue[0];
        urlUdd.url_path_value = urlValue[1];
      }
    };

    function assignUddValuesForUdds(results) {
      if (vmCtrl.skus.length > 0) {
        apiInstanceToRead($scope.selected_item.old_type_id, $stateParams.subtype)
          .then(response => {
            vmCtrl.oldattributesUDDs = response.data.attributes;
            vmCtrl.oldhierarchyUDDs = response.data.hierarchies;
            vmCtrl.oldmtoOptionTypeUDDs = response.data.option_types;
            vmCtrl.oldmtoOptionUDDs = response.data.options;
            for (let i = 0; i < vmCtrl.attributesUDDs.length; i++) {
              for (let j = 0; j < vmCtrl.oldattributesUDDs.length; j++) {
                if (
                  vmCtrl.oldattributesUDDs[j].short_description ===
                  vmCtrl.attributesUDDs[i].short_description
                ) {
                  _.each(results, result => {
                    if (
                      result.user_defined_data_id ===
                      vmCtrl.attributesUDDs[i].id
                    ) {
                      vmCtrl.attributesUDDs[i].udd_value_id =
                        result.udd_value_id;
                      vmCtrl.attributesUDDs[i].value = result.value;
                    }
                  });
                }
              }
              i === vmCtrl.attributesUDDs.length - 1
                ? (vmCtrl.isLoaded = true)
                : null;
            }
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        vmCtrl.isLoaded = true;
      }
    }

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
            if (data.status.toLowerCase() === "inactive") {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.description) +
                " : " +
                data.status +
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
                data.status +
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

    vmCtrl.addValidations = (udd, uddform) => {
      let start = new Date(udd.from_date_value);
      let end = new Date(udd.to_date_value);
      udd.showError = false;
      // check if from date is less than to date and
      // if minimum possible to date is not same as selected to date and selected from date amd to date are same then it is invalid
      if ((start.getTime() > end.getTime()) || (udd.min_to_date !== udd.to_date_value && start.getTime() === end.getTime())) {
        udd.showError = true;
        uddform.$invalid = true;
        uddform.$valid = false;
      } else {
        if (!uddform.$invalid) {
          uddform.$invalid = false;
          uddform.$valid = true;
        }
      }
    }

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
      if (_to_from_val !== null && _to_from_val !== undefined) {
        return _to_from_val;
      } else {
        from = from.replace("%", "");
        return from;
      }
    };

    function updateUddValue(uddValObj, notificationString) {
      return new Promise(function (resolve, reject) {
        apiInstanceToUddValueUpdate(uddValObj)
          .then(response => {
            init();
            if (notificationString == "show_notification") {
              $scope.$parent.$parent.notification.skuUDDSuccessMessage =
                response.data.message;
            }
            resolve(response);
          })
          .catch(error => { });
      });
    }

    function deleteUddValues(valueId) {
      return new Promise(function (resolve, reject) {
        apiInstanceToUddValueDelete(valueId)
          .then(response => {
            // Notification.responsenotification(response.data);
            resolve(response);
          })
          .catch(error => logger.error(error));
      });
    }

    function hasUpdateChanges(object, currentUddData) {
      try {
        let omitKeys = ["id", "item_map_id", "entry_id", "status_id"];
        for (let key in object) {
          if (!omitKeys.includes(key)) {
            if (key === "value" || key === "udd_value_id") {
              if (
                currentUddData.user_defined_data_type.toLowerCase() ===
                "attribute" &&
                (currentUddData["format"].toLowerCase() === "date" ||
                  currentUddData["format"].toLowerCase() === "multiselect" ||
                  currentUddData["format"].toLowerCase() === "date range")
              ) {
                //if the format is not of date then parseFloat the value
                if (object[key] === currentUddData["old_value"]) {
                  vmCtrl.hasUpdateChanges = false;
                } else {
                  return (vmCtrl.hasUpdateChanges = true);
                }
              } else if (
                currentUddData.user_defined_data_type.toLowerCase() ===
                "attribute" &&
                currentUddData["format"].toLowerCase() === "decimal"
              ) {
                //if the format is not of date then parseFloat the value
                if (
                  parseFloat(object[key]) ===
                  parseFloat(currentUddData["old_value"])
                ) {
                  vmCtrl.hasUpdateChanges = false;
                } else {
                  return (vmCtrl.hasUpdateChanges = true);
                }
              }
              else if (
                currentUddData.user_defined_data_type.toLowerCase() ===
                "attribute" &&
                currentUddData["format"].toLowerCase() === "yes/no"
              ) {
                if (object[key] == currentUddData["old_value"] && (object["udd_value_id"] != 1 && object["udd_value_id"] != 0)) {
                  vmCtrl.hasUpdateChanges = false;
                } else {
                  return (vmCtrl.hasUpdateChanges = true);
                }
              } else {
                //if the format is not of date then parseFloat the value
                if (object[key] == currentUddData["old_value"]) {
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
      } catch (error) {
        console.log(error, "Error");
      }
    }

    $scope.update_udd_values = function () {
      var updatePromises = [];
      var createUddValues = [];
      var deletePromises = [];
      var deleteUddValueIds = [];
      let hasChanges = false;
      var notificationString = "show_notification";
      if (vmCtrl.item_udd_data) {
        for (var i = 0; i < vmCtrl.item_udd_data.length; i++) {
          var obj = vmCtrl.item_udd_data[i];
          var udd_obj = {};
          var flag = false;
          udd_obj.id = obj.udd_bridge_id;
          udd_obj["entry_id"] = $scope.inserted_id;
          udd_obj["entry_level"] = "SKU";
          udd_obj["status_id"] = default_status_id;
          udd_obj["item_map_id"] = obj.map_id;
          /* Attribute , MTO Type , MTO Option */

          if (obj.format && obj.format.toLowerCase() === "multiselect") {
            if (obj.selectedValueIds && obj.selectedValueIds.length > 0) {
              udd_obj.value = obj.selectedValueIds.join(",");
              obj.value = obj.selectedValueIds.join(",");
              flag = true;
            }
          } else if (
            obj.format &&
            obj.format.toLowerCase() === "date range" &&
            obj.from_date_value &&
            obj.to_date_value
          ) {
            let fromDate = moment(obj.from_date_value).format("YYYY-MM-DD");
            let toDate = moment(obj.to_date_value).format("YYYY-MM-DD");
            obj.value = udd_obj.value = `${fromDate},${toDate}`;
            flag = true;
          }

          if (
            obj.user_defined_data_type !== "Hierarchy" &&
            obj.udd_value_id !== null &&
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
            obj.value !== null &&
            obj.value !== undefined
          ) {
            udd_obj.value = obj.value.toString();
            flag = true;
            if (obj.format == "Date") {
              udd_obj.value = moment(obj.value).format($scope.date_format);
            }
          }

          if (
            obj.format &&
            obj.format.toLowerCase() === "yes/no" &&
            (!obj.value ||
              obj.value === undefined ||
              obj.value === null ||
              obj.value === "")
          ) {
            udd_obj.value = "0";
            flag = true;
          }

          /* Hierarchy Dropdown */
          if (obj.user_defined_data_type === "Hierarchy") {
            if (
              $scope.selectedHierarchyProperty &&
              $scope.selectedHierarchyProperty[obj.map_id] &&
              $scope.selectedHierarchyProperty[obj.map_id] !== "null" &&
              $scope.selectedHierarchyProperty[obj.map_id] !== "undefined"
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
            (
              (
                obj.user_defined_data_type.toLowerCase() === "attribute" &&
                obj.format.toLowerCase() !== "yes/no" &&
                obj.format.toLowerCase() !== "date range"
              ) || obj.user_defined_data_type.toLowerCase() !== "attribute"
            )
          ) {
            deletePromises.push(deleteUddValues(obj.udd_bridge_id));
            deleteUddValueIds.push(obj.udd_bridge_id);
          }
          if (
            obj.old_value &&
            !obj.from_date_value &&
            !obj.to_date_value &&
            (
              obj.user_defined_data_type.toLowerCase() === "attribute" &&
              obj.format.toLowerCase() === "date range"
            )
          ) {
            deletePromises.push(deleteUddValues(obj.udd_bridge_id));
            deleteUddValueIds.push(obj.udd_bridge_id);
          }

          if (obj.isCreated !== undefined) {
            if (flag) {
              if (hasUpdateChanges(udd_obj, obj)) {
                hasChanges = true;
                updatePromises.push(
                  updateUddValue(udd_obj, notificationString)
                );
                notificationString = "hide_notification";
              }
            }
          } else {
            delete udd_obj.id;
            if (
              flag &&
              (udd_obj.value || udd_obj.value == "0" || udd_obj.udd_value_id)
            ) {
              createUddValues.push(udd_obj);
            }
          }
        }
      } else {
        $scope.$parent.skuUDDSuccessMessage = "Nothing to update in SKU UDD";
      }

      Promise.all(updatePromises)
        .then(res => {
          if (deleteUddValueIds.length === 0 && !hasChanges) {
            $scope.$parent.skuUDDSuccessMessage =
              "Nothing to update in SKU UDD";
          } else if (hasChanges) {
            $scope.$parent.skuUDDSuccessMessage =
              "SKU user defined data updated successfully.";
          }
        })
        .catch(error => { });

      Promise.all(deletePromises)
        .then(response => {
          if (deleteUddValueIds.length > 0) {
            $scope.$parent.skuUDDSuccessMessage =
              "SKU user defined data updated successfully.";
            init();
          }
        })
        .catch(error => { });

      if (createUddValues.length > 0) {
        var uddValuesObj = {};
        uddValuesObj["Objects"] = createUddValues;
        uddValuesObj["action"] = "bulk";
        apiInstanceToUddInsert(uddValuesObj)
          .then(response => {
            $scope.$parent.skuUDDSuccessMessage = response.data.message;
            //$scope.$parent.notification ? $scope.$parent.skuUDDSuccessMessage = response.data.message : $scope.$parent.$parent.skuUDDSuccessMessage = response.data.message;
            $scope.edit_sku_master_id = $scope.inserted_id;
            init();
          })
          .catch(error => {
            logger.error(error);
            $scope.edit_sku_master_id = $scope.inserted_id;
            init();
          });
      }
      if (deleteUddValueIds.length || createUddValues.length || updatePromises.length) {
        common.$timeout(() => {
          if (vm.args_status === 403) {
            ItemService.API.CaptureItemChangeInQueue("44", $scope.edit_sku_master_id)
              .then(result => {
              
              })
              .catch(error => {
                console.log(error);
              })
          }
        }, 3000);
      }
    };

    /** 
     * Commented on Jan 2021
     * could be removed if it is no longer used.
     */
    // function fetchSkuHeaders(itemTypeId) {
    //   vm.option_header_id = undefined;
    //   SkuOptionHeaderService.API.SearchSkuHeaders(
    //     "item_type_id",
    //     itemTypeId
    //   ).then(response => {
    //     if (response.data.data.length > 0) {
    //       if (response.data.data.length === 1) {
    //         vm.option_header_id = response.data.data[0].id;
    //       } else {
    //         _.each(response.data.data, data => {
    //           data.name.toLowerCase() === "none"
    //             ? (vm.option_header_id = data.id)
    //             : null;
    //         });
    //       }
    //     }
    //   });
    // }

    $scope.saveSkuUddValues = skus => {
      common.$timeout(() => {
        let createUddValues = [];
        if (vmCtrl.skus.length > 0) {
          for (let j = 0; j < vmCtrl.skus.length; j++) {
            let object = {
              id: vmCtrl.skus[j].id,
              option_list_id: null
            };
            SKUService.API.UpdateSKU(object).then(response => { });
            for (var i = 0; vmCtrl.skus[j].item_udd_data && i < vmCtrl.skus[j].item_udd_data.length; i++) {
              if (
                vmCtrl.skus[j].item_udd_data[i].entry_level.toLowerCase() !==
                "item"
              ) {
                var obj = vmCtrl.skus[j].item_udd_data[i];
                var udd_obj = {};
                var flag = false;
                udd_obj["entry_id"] = vmCtrl.skus[j].id;
                udd_obj["entry_level"] = "SKU";
                udd_obj["status_id"] = default_status_id;
                udd_obj["item_map_id"] = obj.map_id;
                /* Attribute , MTO Type , MTO Option */

                if (obj.format && obj.format.toLowerCase() === "multiselect") {
                  obj.selectedValueIds
                    ? (udd_obj.value = obj.selectedValueIds.join(","))
                    : null;
                  obj.selectedValueIds
                    ? (obj.value = obj.selectedValueIds.join(","))
                    : null;
                  flag = true;
                } else if (
                  obj.format &&
                  obj.format.toLowerCase() === "date range" &&
                  obj.from_date_value &&
                  obj.to_date_value
                ) {
                  let fromDate = moment(obj.from_date_value).format("YYYY-MM-DD");
                  let toDate = moment(obj.to_date_value).format("YYYY-MM-DD");
                  obj.value = udd_obj.value = `${fromDate},${toDate}`;
                  flag = true;
                }

                if (
                  obj.user_defined_data_type !== "Hierarchy" &&
                  obj.udd_value_id !== null &&
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
                  obj.value !== null &&
                  obj.value !== undefined
                ) {
                  udd_obj.value = obj.value.toString();
                  flag = true;
                  if (obj.format == "Date") {
                    udd_obj.value = moment(obj.value).format($scope.date_format);
                  }
                }
                /* Hierarchy Dropdown */
                if (obj.user_defined_data_type === "Hierarchy") {
                  if (
                    $scope.selectedHierarchyProperty !== undefined &&
                    $scope.selectedHierarchyProperty[obj.map_id] !== undefined
                  ) {
                    udd_obj.udd_value_id =
                      $scope.selectedHierarchyProperty[obj.map_id][
                      "property_id"
                      ];
                  } else {
                    udd_obj.udd_value_id = obj.udd_value_id;
                  }
                  flag = true;
                }
                if (udd_obj.value || udd_obj.udd_value_id) {
                  createUddValues.push(udd_obj);
                }
              }
              if (createUddValues.length > 0) {
                var uddValuesObj = {};
                uddValuesObj["Objects"] = createUddValues;
                uddValuesObj["action"] = "bulk";
                apiInstanceToUddInsert(uddValuesObj)
                  .then(response => {
                    init();
                    $scope.$parent.skuUDDSuccessMessage = response.data.message;
                    //$scope.$parent.notification ? $scope.$parent.skuUDDSuccessMessage = response.data.message : $scope.$parent.$parent.skuUDDSuccessMessage = response.data.message;
                    $scope.edit_sku_master_id = $scope.inserted_id;
                  })
                  .catch(error => {
                    init();
                    logger.error(error);
                    $scope.edit_sku_master_id = $scope.inserted_id;
                  });
              }
            }
          }
        }
      }, 15000);
    };

    // function to reset udd value
    $scope.resetUddValue = udd => {
      if (udd && udd.format && udd.format.toLowerCase() === "yes/no") {
        udd.value = "0";
      } else if (udd && udd.format && udd.format.toLowerCase() === "url") {
        udd.value = "";
        udd.link_text_value = "";
        udd.url_path_value = "";
      } else if (udd && udd.format && udd.format.toLowerCase() === "date range") {
        udd.to_date_value = "";
        udd.from_date_value = "";
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
      vm.args_status = args.response ? args.response.status : null;
      /* variables to reset the Notification message-start */
      $scope.$parent.skuSuccessMessage = null;
      $scope.$parent.skuErrorMessage = null;
      $scope.$parent.skuSetMessage = null;
      $scope.$parent.skuMTOUDDSuccessMessage = null;
      $scope.$parent.skuUDDSuccessMessage = null;
      /* variables to reset the Notification message-end */
      if (
        args.response != undefined &&
        (args.response.status === 200 ||
          args.response.status === 201 ||
          args.response.status === 403)
      ) {
        if (args.response && args.response.inserted_id) {
          $scope.skuSuccessMessage = "SKU is created Successfully";
        } else {
          args.response.status === 403
            ? ($scope.$parent.skuSuccessMessage =
              "Nothing to update in SKU Master")
            : ($scope.$parent.skuSuccessMessage =
              "SKU is updated Successfully");
        }
        $scope.inserted_id = args.inserted_id;
        $scope.update_udd_values();
        $scope.update_sku_details();
      } else if (args.error !== undefined) {
        if (
          args.error &&
          args.error.data &&
          args.error.data.error &&
          args.error.data.error.message
        ) {
          $scope.$parent.skuErrorMessage = [args.error.data.error.message];
        } else {
          $scope.$parent.skuErrorMessage = null;
        }
      } else {
        $scope.$parent.skuErrorMessage = args.response.form_validation_error;
      }
    });
  }

  //Directive
  (function () {
    "use strict";

    angular
      .module("rc.prime.item")
      .directive("skuOptionUddDirective", skuOptionUddDirective);

    function skuOptionUddDirective() {
      // Usage:
      //     <item-userdefined-data-directive> </item-userdefined-data-directive>
      // Creates:
      //
      var directive = {
        restrict: "EA",
        controller: SkuOptionUddController,
        controllerAs: "vmCtrl",
        templateUrl:
          "application/modules/item/sku/sku.option.udd.directive.html"
      };
      return directive;
    }
  })();
})();
