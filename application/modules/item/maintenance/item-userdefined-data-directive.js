(function () {
  "use strict";

  angular
    .module("rc.prime.item")
    .controller("ItemUserDefinedDataController", ItemUserDefinedDataController);

  ItemUserDefinedDataController.$inject = [
    "$scope",
    "common",
    "ItemService",
    "ItemUDDService",
    "ItemUDDValueService",
    "valdr",
    "StatusCodes",
    "GlobalRegularExpression"
  ];

  function ItemUserDefinedDataController(
    $scope,
    common,
    ItemService,
    ItemUDDService,
    ItemUDDValueService,
    valdr,
    StatusCodes,
    GlobalRegularExpression
  ) {
    var vm = this;
    var vmCtrl = this;
    vmCtrl.statusCodes = StatusCodes;
    vmCtrl.primeVisibilityId = "2"; // prime visibility id for udd
    let logger = common.Logger.getInstance("ItemUserDefinedDataController");
    let Notification = common.Notification;
    let apiInstanceToRead = ItemUDDService.API.GetItemUDDList;
    let apiInstanceToUddInsert = ItemUDDValueService.API.InsertItemUDDValue;
    let apiInstanceToUddRead = ItemUDDValueService.API.MultiSearchItemUDDValue;
    let apiInstanceToUddValueUpdate =
      ItemUDDValueService.API.UpdateItemUDDValue;
    $scope.selectedHierarchyProperty = {};
    $scope.$parent.itemSuccessMessage = null;
    $scope.$parent.itemUDDSuccessMessage = null;
    $scope.$parent.itemLoadingUDD = true;
    $scope.globalRegularExpression = GlobalRegularExpression;
    function init() {
      vmCtrl.getDimensionalAttributesList();
      if ($scope.allowCollectionDetails && $scope.allowCollectionDetails.yes_or_no) {
        getCollectionLevelUdds();
      }
      vmCtrl.isUddLoaded = false;
      $scope.uddValidationErrors = [];
      vmCtrl.allBridgeValues = [];
      apiInstanceToRead(
        $scope.head.type_id,
        $scope.head.collection_id,
        $scope.head.item_sub_type
      )
        .then(response => {
          vmCtrl.attributesUDDs = response.data.attributes;
          vmCtrl.hierarchyUDDs = response.data.hierarchies;
          vmCtrl.mtoOptionTypeUDDs = response.data.option_types;
          vmCtrl.mtoOptionUDDs = response.data.options;
          if (vmCtrl.selected_item && vmCtrl.selected_item.id) {
            apiInstanceToUddRead({
              entry_id: vmCtrl.selected_item.id,
              entry_level: "Item"
            })
              .then(response => {
                vmCtrl.allBridgeValues = response.data;
                dataMapping(response.data);
                if (
                  $scope.head.old_type_id &&
                  parseInt($scope.head.type_id) !==
                  parseInt($scope.head.old_type_id)
                ) {
                  assignUddValuesForUdds(response.data);
                }
                $scope.$parent.itemLoadingUDD = false;
              })
              .catch(error => {
                $scope.$parent.itemLoadingUDD = false;
                logger.error(error);
              });
          } else {
            $scope.$parent.itemLoadingUDD = false;
            var response = {
              data: []
            };
            dataMapping(response.data);
          }
        })
        .catch(error => {
          $scope.$parent.itemLoadingUDD = false;
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
      vmCtrl.noItemTypeSelected = false;
      if (n === true && o === false && $scope.head.type_id) {
        vmCtrl.setDefaultValues = false;
        vmCtrl.selected_item = ItemService.API.GetVariable("selectedItem");
        vmCtrl.init();
      } else {
        // if create item form is open and user navigates to udd configuration page directly without selecting item type
        vmCtrl.isUddLoaded = true;
        vmCtrl.noItemTypeSelected = true;
        vmCtrl.item_udd_data = [];
      }
    });

    $scope.$watch("isNewItemType", (n, o) => {
      if (n === true && $scope.head.old_type_id && $scope.isNewItemType) {
        vmCtrl.commonAttributes = [];
        vmCtrl.item_udd_data = [];
        vmCtrl.setDefaultValues = true;
        vmCtrl.selected_item = ItemService.API.GetVariable("selectedItem");
        vmCtrl.init();
      }
    });

    // watcher to watch collection id of master item
    // when collection is set or reset prepare udds to show in maintenance screen
    $scope.$watch("head.collection_id", (n, old) => {
      if ((!n && old) || (n && !old) || n !== old) {
        dataMapping(vmCtrl.allBridgeValues);
      }
    });

    $scope.setPropertyFn = function (data) {
      $scope.selectedHierarchyProperty = data.selectedHierarchyProperty;
    };

    // function to check entry level of udd before pushing map id to an array
    // if entry level of an udd is "Collection" then check the item type flag "Allow collection" and also master collection field has value
    // If flag is not 'true' or maaster collection field does not have value then do show collection level udds in udd maintenance screen
    vmCtrl.checkEntryLevelToShowUdds = (mapIds, udd, mapID, uddData) => {
      if (
        udd.entry_level &&
        (udd.entry_level.toLowerCase() !== "collection" ||
          (udd.entry_level.toLowerCase() === "collection" &&
            $scope.is_collection &&
            $scope.head.collection_id))
      ) {
        uddData[mapID].isShowUdd = true;
        mapIds.push(mapID);
      } else {
        uddData[mapID].isShowUdd = false;
        if (udd.description == "Delivery 905 call to schedule") vmCtrl.delCollUdd = mapID;
        if (udd.description == "White Glove Fee") vmCtrl.delCollWhiteGloveUdd = mapID;
      }
    };

    var default_status_id = 200; // ACTIVE for ALL
    function dataMapping(results) {
      common.$timeout(() => {
        vmCtrl.isUddLoaded = true
      }, 3000);
      $scope.$parent ? ($scope.$parent.itemLoadingUDD = false) : null;
      vmCtrl.editData = results;
      if (results && results.length > 0) {
        $scope.setdefault = false;
      } else {
        $scope.setdefault = true;
      }
      var data = {}; // It contains all hierarchies,attributes,options
      $scope.uddValues = {};
      var mapIds = [];
      var hierarchyPropsMap = [];
      for (
        var i = 0;
        vmCtrl.attributesUDDs && i < vmCtrl.attributesUDDs.length;
        i++
      ) {
        var attributeUDD = vmCtrl.attributesUDDs[i];
        attributeUDD.isRequired = false;
        attributeUDD.requiredImgScript = "optionalFieldNotation";
        if (vmCtrl.attributesUDDs[i]["format"].toLowerCase() == "multiselect") {
          const unique = [];
          vmCtrl.attributesUDDs[i].values.map(x => unique.filter(a => a.description == x.description).length > 0 ? null : unique.push(x));
          vmCtrl.attributesUDDs[i].values = unique;
        }
        // If the attribute UDD is  a required udd and if the value List has no values, show an error
        if (
          vmCtrl.attributesUDDs[i].values.length === 1 &&
          (vmCtrl.attributesUDDs[i]["format"] === "Value List" ||
            vmCtrl.attributesUDDs[i]["format"] === "Rating" ||
            vmCtrl.attributesUDDs[i]["format"] === "Decimal" ||
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
          } 
          // else {
          //   $scope.uddValidationErrors.push({
          //     user_defined_data_type: "Attribute",
          //     udd_description: vmCtrl.attributesUDDs[i]["short_description"]
          //   });
          // }
        }
        if (
          $scope.head.status_id !== 100 &&
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
          }
          else {
            if (attributeUDD.format.toLowerCase() === "yes/no") {
              attributeUDD.isRequired = false;
            }
            else attributeUDD.isRequired = true;
          }
          attributeUDD.requiredImgScript = "optionalFieldNotation";
        } else if (attributeUDD.required.toLowerCase() === "immediate") {
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
        } else if (attributeUDD.format && attributeUDD.format.toLowerCase() === "date range") {
          let toValuesRange = attributeUDD.to.split(",");
          // max and min to date required to add validation
          attributeUDD.min_to_date = $scope.getDateBasedOnFormat($scope.addDaysToDate(attributeUDD.from, toValuesRange[0]));
          attributeUDD.max_to_date = $scope.getDateBasedOnFormat($scope.addDaysToDate(attributeUDD.from, toValuesRange[1]));
        }
        data[attributeUDD.map_id] = attributeUDD;
        data[attributeUDD.map_id]["user_defined_data_type"] = "Attribute";
        // mapIds.push(attributeUDD.map_id);
        vmCtrl.checkEntryLevelToShowUdds(
          mapIds,
          attributeUDD,
          attributeUDD.map_id,
          data
        );
        if (
          !isCollectionLevelUddValueHasBeenCreated(attributeUDD.map_id) &&
          !vmCtrl.setDefaultValues &&
          vmCtrl.collectionLevelUddValuesMap &&
          vmCtrl.collectionLevelUddValuesMap[
          attributeUDD.user_defined_data_type
          ] &&
          vmCtrl.collectionLevelUddValuesMap[
          attributeUDD.user_defined_data_type
          ][attributeUDD.id]
        ) {
          // set to true if udd value for the collection level udd is not created and udd value is there in collectionLevelUddsMap
          vmCtrl.setDefaultValues = true;
        }
      }
      var hierarchyUDD = undefined;
      for (
        var i = 0;
        vmCtrl.hierarchyUDDs && i < vmCtrl.hierarchyUDDs.length;
        i++
      ) {
        hierarchyUDD = vmCtrl.hierarchyUDDs[i];
        hierarchyUDD.isRequired = false;
        hierarchyUDD.requiredImgScript = "optionalFieldNotation";
        // If the attribute UDD is  a required udd and if the value List has no values, show an error
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
          if (hierarchyUDD.value == undefined || null && hierarchyUDD.udd_value_id == undefined || null && hierarchyUDD.selectedValueIds == [] && hierarchyUDD.required.toLowerCase() === "activation") {
            hierarchyUDD.value = hierarchyUDD.default_value;
            hierarchyUDD.udd_value_id = hierarchyUDD.default_value;
            attributeUDD.selectedValueIds = attributeUDD.default_value;
            hierarchyUDD.isRequired = true;
          } else {
            hierarchyUDD.isRequired = true;
          }
          hierarchyUDD.requiredImgScript = "optionalFieldNotation";
        } else if (hierarchyUDD.required.toLowerCase() === "immediate") {
          if (hierarchyUDD.value == undefined || null && hierarchyUDD.udd_value_id == undefined || null && hierarchyUDD.selectedValueIds == [] && hierarchyUDD.required.toLowerCase() === "immediate") {
            hierarchyUDD.value = hierarchyUDD.default_value;
            hierarchyUDD.udd_value_id = hierarchyUDD.default_value;
            hierarchyUDD.selectedValueIds = hierarchyUDD.default_value;
            hierarchyUDD.isRequired = true;
          } else {
            hierarchyUDD.isRequired = true;
            hierarchyUDD.value = hierarchyUDD.value;
            hierarchyUDD.udd_value_id = hierarchyUDD.udd_value_id;
            attributeUDD.selectedValueIds = attributeUDD.default_value;
          }
          hierarchyUDD.requiredImgScript = "requiredFieldNotation";
        } else if (hierarchyUDD.required.toLowerCase() === "no") {
          hierarchyUDD.isRequired = false;
          hierarchyUDD.requiredImgScript = "FieldNotation";
        }
        data[hierarchyUDD.map_id] = hierarchyUDD;
        data[hierarchyUDD.map_id]["user_defined_data_type"] = "Hierarchy";

        hierarchyUDD.maintenance_description.toLowerCase() == "as400 hierarchy" ? $scope.disabledIds = [] : null;

        for (var j = 0; j < hierarchyUDD.props.length; j++) {
          hierarchyPropsMap[hierarchyUDD.props[j]["id"]] = hierarchyUDD.props[j];
          if (hierarchyUDD.maintenance_description.toLowerCase() == "as400 hierarchy" && hierarchyUDD.props[j].parent_id == null) {
            $scope.disabledIds.push(hierarchyUDD.props[j].id);
          }
        }
        // mapIds.push(hierarchyUDD.map_id);
        vmCtrl.checkEntryLevelToShowUdds(
          mapIds,
          hierarchyUDD,
          hierarchyUDD.map_id,
          data
        );
        if (
          !isCollectionLevelUddValueHasBeenCreated(hierarchyUDD.map_id) &&
          !vmCtrl.setDefaultValues &&
          vmCtrl.collectionLevelUddValuesMap &&
          vmCtrl.collectionLevelUddValuesMap[
          hierarchyUDD.user_defined_data_type
          ] &&
          vmCtrl.collectionLevelUddValuesMap[
          hierarchyUDD.user_defined_data_type
          ][hierarchyUDD.id]
        ) {
          // set to true if udd value for the collection level udd is not created and udd value is there in collectionLevelUddsMap
          vmCtrl.setDefaultValues = true;
        }
      }

      for (
        var i = 0;
        vmCtrl.mtoOptionTypeUDDs && i < vmCtrl.mtoOptionTypeUDDs.length;
        i++
      ) {
        var mtoOptionTypeUDD = vmCtrl.mtoOptionTypeUDDs[i];
        mtoOptionTypeUDD.isRequired = false;
        mtoOptionTypeUDD.requiredImgScript = "optionalFieldNotation";
        if (
          mtoOptionTypeUDD.required == "Activation" &&
          $scope.head.status_id !== 100
        ) {
          if (mtoOptionTypeUDD.required == "Activation" && mtoOptionTypeUDD.udd_value_id == undefined || null && mtoOptionTypeUDD.value == undefined || null) {
            mtoOptionTypeUDD.value = mtoOptionTypeUDD.default_value;
            mtoOptionTypeUDD.udd_value_id = mtoOptionTypeUDD.default_value;
            mtoOptionTypeUDD.isRequired = true;
          } else {
            mtoOptionTypeUDD.isRequired = true;
          }
          mtoOptionTypeUDD.requiredImgScript = "optionalFieldNotation";
        } else if (mtoOptionTypeUDD.required == "Immediate") {
          if (mtoOptionTypeUDD.value == undefined || null && mtoOptionTypeUDD.udd_value_id == undefined || null && mtoOptionTypeUDD.required == "Immediate") {
            mtoOptionTypeUDD.value = mtoOptionTypeUDD.default_value;
            mtoOptionTypeUDD.udd_value_id = mtoOptionTypeUDD.default_value;
            mtoOptionTypeUDD.isRequired = true;
          } else {
            mtoOptionTypeUDD.isRequired = true;
          }
          mtoOptionTypeUDD.requiredImgScript = "requiredFieldNotation";
        } else if (mtoOptionTypeUDD.required.toLowerCase() == "no") {
          mtoOptionTypeUDD.isRequired = false;
          mtoOptionTypeUDD.requiredImgScript = "FieldNotation";
        }
        data[mtoOptionTypeUDD.map_id] = mtoOptionTypeUDD;
        data[mtoOptionTypeUDD.map_id]["user_defined_data_type"] = "OptionType";
        // mapIds.push(mtoOptionTypeUDD.map_id);
        vmCtrl.checkEntryLevelToShowUdds(
          mapIds,
          mtoOptionTypeUDD,
          mtoOptionTypeUDD.map_id,
          data
        );
        if (
          !isCollectionLevelUddValueHasBeenCreated(mtoOptionTypeUDD.map_id) &&
          !vmCtrl.setDefaultValues &&
          vmCtrl.collectionLevelUddValuesMap &&
          vmCtrl.collectionLevelUddValuesMap[
          mtoOptionTypeUDD.user_defined_data_type
          ] &&
          vmCtrl.collectionLevelUddValuesMap[
          mtoOptionTypeUDD.user_defined_data_type
          ][mtoOptionTypeUDD.id]
        ) {
          // set to true if udd value for the collection level udd is not created and udd value is there in collectionLevelUddsMap
          vmCtrl.setDefaultValues = true;
        }
      }
      for (
        var i = 0;
        vmCtrl.mtoOptionUDDs && i < vmCtrl.mtoOptionUDDs.length;
        i++
      ) {
        var mtoOptionUDD = vmCtrl.mtoOptionUDDs[i];
        mtoOptionUDD.isRequired = false;
        mtoOptionUDD.requiredImgScript = "optionalFieldNotation";
        if (
          mtoOptionUDD.required == "Activation" &&
          $scope.head.status_id !== 100
        ) {
          if (mtoOptionUDD.required == "Activation" && mtoOptionUDD.value == undefined || null && mtoOptionUDD.udd_value_id == undefined || null) {
            mtoOptionUDD.value = mtoOptionUDD.default_value;
            mtoOptionUDD.udd_value_id = mtoOptionUDD.default_value;
            mtoOptionUDD.isRequired = true;
          } else {
            mtoOptionUDD.isRequired = true;
          }
          mtoOptionUDD.requiredImgScript = "optionalFieldNotation";
        } else if (mtoOptionUDD.required == "Immediate") {
          if (mtoOptionUDD.value == undefined || null && mtoOptionUDD.udd_value_id == undefined || null && mtoOptionUDD.required == "Immediate") {
            mtoOptionUDD.value = mtoOptionUDD.default_value;
            mtoOptionUDD.udd_value_id = mtoOptionUDD.default_value;
            mtoOptionUDD.isRequired = true;
          } else {
            mtoOptionUDD.isRequired = true;
          }
          mtoOptionUDD.requiredImgScript = "requiredFieldNotation";
        } else if (mtoOptionUDD.required.toLowerCase() == "no") {
          mtoOptionUDD.isRequired = false;
          mtoOptionUDD.requiredImgScript = "FieldNotation";
        }
        data[mtoOptionUDD.map_id] = mtoOptionUDD;
        data[mtoOptionUDD.map_id]["user_defined_data_type"] = "Option";
        // mapIds.push(mtoOptionUDD.map_id);
        vmCtrl.checkEntryLevelToShowUdds(
          mapIds,
          mtoOptionUDD,
          mtoOptionUDD.map_id,
          data
        );
        if (
          !isCollectionLevelUddValueHasBeenCreated(mtoOptionUDD.map_id) &&
          !vmCtrl.setDefaultValues &&
          vmCtrl.collectionLevelUddValuesMap &&
          vmCtrl.collectionLevelUddValuesMap[
          mtoOptionUDD.user_defined_data_type
          ] &&
          vmCtrl.collectionLevelUddValuesMap[
          mtoOptionUDD.user_defined_data_type
          ][mtoOptionUDD.id]
        ) {
          // set to true if udd value for the collection level udd is not created and udd value is there in collectionLevelUddsMap
          vmCtrl.setDefaultValues = true;
        }
      }

      let dormantMapIds = _.clone(mapIds);
      /** Edit Data Contains already created user defined data */
      for (var i = 0; vmCtrl.editData && i < vmCtrl.editData.length; i++) {
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
            ed.value !== null &&
            ed.value !== undefined &&
            ed.value !== "" &&
            ed.value !== "null"
          ) {
            data[ed["item_map_id"]]["selectedValueIds"] = ed.value
              .split(",")
              .map(Number);
          } else if (
            data[ed["item_map_id"]].format &&
            data[ed["item_map_id"]].format.toLowerCase() == "date" &&
            (ed.value !== null || ed.value !== undefined || ed.value !== "")
          ) {
            let formatedDate;
            formatedDate = $scope.getDateBasedOnFormat(ed.value);
            data[ed["item_map_id"]]["value"] = angular.copy(formatedDate);
          } else if (
            data[ed["item_map_id"]].format &&
            data[ed["item_map_id"]].format.toLowerCase() == "date range" &&
            (ed.value !== null || ed.value !== undefined || ed.value !== "")
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

          // if udd is collection level udd
          // then assign value provided in collectionLevelUddsMap when collection is changed for master data
          // if collection is not changed then collectionLevelUddsMap should have same value as current value
          if (
            vmCtrl.collectionLevelUddValuesMap &&
            vmCtrl.collectionLevelUddValuesMap[ed.user_defined_data_type] &&
            vmCtrl.collectionLevelUddValuesMap[ed.user_defined_data_type][
            ed.user_defined_data_id
            ]
          ) {
            let mapIdData =
              vmCtrl.collectionLevelUddValuesMap[ed.user_defined_data_type][
              ed.user_defined_data_id
              ];
            if (
              data[ed["item_map_id"]].format &&
              data[ed["item_map_id"]].format.toLowerCase() == "multiselect" &&
              ed.value !== null &&
              ed.value !== undefined &&
              ed.value !== "" &&
              ed.value !== "null"
            ) {
              data[ed["item_map_id"]][
                "selectedValueIds"
              ] = mapIdData.value.split(",").map(Number);
            } else if (
              data[ed["item_map_id"]].format &&
              data[ed["item_map_id"]].format.toLowerCase() == "date" &&
              (ed.value !== null || ed.value !== undefined || ed.value !== "")
            ) {
              let formatedDate = $scope.getDateBasedOnFormat(mapIdData.value);
              data[ed["item_map_id"]]["value"] = angular.copy(formatedDate);
            } else if (
              data[ed["item_map_id"]].format &&
              data[ed["item_map_id"]].format.toLowerCase() == "date range" &&
              (ed.value !== null || ed.value !== undefined || ed.value !== "")
            ) {
              data[ed["item_map_id"]].from_date_value = $scope.getDateBasedOnFormat(mapIdData.value.split(",")[0]);
              data[ed["item_map_id"]].to_date_value = $scope.getDateBasedOnFormat(mapIdData.value.split(",")[1]);
            } else {
              data[ed["item_map_id"]]["value"] = mapIdData.value;
            }
            data[ed["item_map_id"]]["udd_value_id"] = mapIdData.udd_value_id;
            data[ed["item_map_id"]]["old_value"] = mapIdData.udd_value_id
              ? mapIdData.udd_value_id + ""
              : mapIdData.value;
          } else {
            if (
              data[ed["item_map_id"]].entry_level &&
              data[ed["item_map_id"]].entry_level.toLowerCase() === "collection"
            ) {
              data[ed["item_map_id"]].value = null;
              data[ed["item_map_id"]].udd_value_id = null;
            }
          }
        }
      }

      // if Update Item then do not show default values in udd fields
      if (
        (!common.$state.current.name.endsWith(".update") &&
          !common.$stateParams.id) ||
        vmCtrl.setDefaultValues === true
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
            } else if (data[dormantMapIds[i]].format.toLowerCase() === "url") {
              if (data[dormantMapIds[i]].default_value) {
                data[dormantMapIds[i]].value =
                  data[dormantMapIds[i]].default_value;
                let default_value = data[dormantMapIds[i]].default_value.split(
                  "::"
                );
                data[dormantMapIds[i]].link_text_value = default_value[0];
                data[dormantMapIds[i]].url_path_value = default_value[1];
              }
            } else if (data[dormantMapIds[i]].format.toLowerCase() === "date range" && !data[dormantMapIds[i]].default_value.includes("none")) {
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

          // if collection udds are there for selected item type
          // then assign defualt values as value assigned to same udd previously for same collection id and item type
          if (
            data[dormantMapIds[i]] &&
            vmCtrl.collectionLevelUddValuesMap &&
            vmCtrl.collectionLevelUddValuesMap[
            data[dormantMapIds[i]].user_defined_data_type
            ] &&
            vmCtrl.collectionLevelUddValuesMap[
            data[dormantMapIds[i]].user_defined_data_type
            ][data[dormantMapIds[i]].id]
          ) {
            let mapIdData =
              vmCtrl.collectionLevelUddValuesMap[
              data[dormantMapIds[i]].user_defined_data_type
              ][data[dormantMapIds[i]].id];
            if (
              data[dormantMapIds[i]].user_defined_data_type.toLowerCase() ===
              "attribute"
            ) {
              // if udd is of attribute type then check format as well to set default value
              if (
                data[dormantMapIds[i]].format.toLowerCase() === "multiselect"
              ) {
                data[dormantMapIds[i]].selectedValueIds = mapIdData.value
                  .split(",")
                  .map(Number);
              } else if (
                data[dormantMapIds[i]].format.toLowerCase() === "value list" ||
                data[dormantMapIds[i]].format.toLowerCase() === "rating"
              ) {
                data[dormantMapIds[i]].udd_value_id = mapIdData.udd_value_id;
              } else if (
                data[dormantMapIds[i]].format.toLowerCase() === "url"
              ) {
                if (mapIdData.value) {
                  data[dormantMapIds[i]].value = mapIdData.value;
                  let default_value = mapIdData.value.split("::");
                  data[dormantMapIds[i]].link_text_value = default_value[0];
                  data[dormantMapIds[i]].url_path_value = default_value[1];
                }
              } else {
                data[dormantMapIds[i]].value = mapIdData.value;
              }
            } else {
              data[dormantMapIds[i]].udd_value_id = mapIdData.udd_value_id;
            }

            data[dormantMapIds[i]]["old_value"] = mapIdData.udd_value_id
              ? mapIdData.udd_value_id + ""
              : mapIdData.value;
          } else {
            if (
              data[dormantMapIds[i]].entry_level &&
              data[dormantMapIds[i]].entry_level.toLowerCase() === "collection"
            ) {
              data[dormantMapIds[i]].value = null;
              data[dormantMapIds[i]].udd_value_id = null;
            }
          }
        }
      }

      var uddRules = {};
      vmCtrl.item_udd_data = [];
      for (var i = 0; i < mapIds.length; i++) {
        vmCtrl.isUddLoaded = false;
        var mapId = mapIds[i];
        // Setting validation rules using from and to and required value
        uddRules[mapId] = {};
        // Set validation rules for each of the udds set for item
        if (data[mapId]) {
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
          if (data[mapId]["format"]) {
            if (data[mapId]["format"].toLowerCase() === "integer") {
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
            } else if (data[mapId]["format"].toLowerCase() === "number select") {
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
            } else if (data[mapId]["format"].toLowerCase() === "decimal") {
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
            } else if (data[mapId]["format"].toLowerCase() === "percentage") {
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
            } else if (data[mapId]["format"].toLowerCase() === "date") {
              uddRules[mapId]["startAndEndDateCompare"] = {
                sval: data[mapId]["from"],
                eval: data[mapId]["to"],
                message:
                  "Must be between " +
                  moment(data[mapId]["from"]).format($scope.date_format) +
                  " and " +
                  moment(data[mapId]["to"]).format($scope.date_format)
              };
            } else if (data[mapId]["format"].toLowerCase() === "date range") {
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
            } else if (data[mapId]["format"].toLowerCase() === "dimension") {
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
            } else if (data[mapId]["format"].toLowerCase() === "text") {
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
            } else if (data[mapId]["format"].toLowerCase() === "url") {
              uddRules[mapId]["pattern"] = {
                value: /^((http|https):\/\/)?(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/,
                message:
                  "Must be a valid URL and Link text should contain alpha-numeric characters."
              };
              data[mapId]["message"] =
                data[mapId]["maintenance_description"] +
                " must be in a valid URL format. And Link text should contain alpha-numeric characters.";
            }
          }
          if (
            data[mapId]["entry_level"] === "Choice" &&
            data[mapId]["isCreated"] === undefined
          ) {
            data[mapId]["udd_value"] = null;
            data[mapId]["udd_value_id"] = null;
            data[mapId]["to_from_val"] = null;
          }
          vmCtrl.item_udd_data.push(data[mapId]);
          vmCtrl.isUddLoaded = true;
        }
      }
      common.$stateParams["UDD_config"] = vmCtrl.item_udd_data;
      valdr.addConstraints({
        UddRules: uddRules
      });
      $scope.item_udd_data = vmCtrl.item_udd_data;
      $scope.$parent ? ($scope.$parent.uddData = vmCtrl.item_udd_data) : null;
    }

    // function to check if the udd is collection level and udd value is created
    function isCollectionLevelUddValueHasBeenCreated(mapId) {
      let idx = vmCtrl.editData.findIndex(
        udd => Number(udd.item_map_id) === Number(mapId)
      );
      if (idx > -1) {
        return true;
      }
      return false;
    }

    function assignUddValuesForUdds(results) {
      vmCtrl.isLoadingCommonUdds = true;
      apiInstanceToRead(
        $scope.head.old_type_id,
        $scope.head.collection_id,
        $scope.head.item_sub_type
      )
        .then(response => {
          vmCtrl.oldattributesUDDs = response.data.attributes;
          vmCtrl.oldhierarchyUDDs = response.data.hierarchies;
          vmCtrl.oldmtoOptionTypeUDDs = response.data.option_types;
          vmCtrl.oldmtoOptionUDDs = response.data.options;
          vmCtrl.commonAttributes = [];
          // Array to save the common Hierarchy UDDs
          vmCtrl.commonHierarchyUDDs = [];
          vmCtrl.commonAttributesIds = [];
          // Array to find the common hierarchy UDDs id, to not include the same in the UDD section
          vmCtrl.commonHierarchyIds = [];
          // Find the common attributes available between previous item type and new item type set
          for (let i = 0; i < vmCtrl.attributesUDDs.length; i++) {
            // Loop through the old attribute UDDs
            for (let j = 0; j < vmCtrl.oldattributesUDDs.length; j++) {
              if (
                vmCtrl.oldattributesUDDs[j].short_description ===
                vmCtrl.attributesUDDs[i].short_description
              ) {
                _.each(results, result => {
                  if (
                    result.user_defined_data_id ===
                    vmCtrl.attributesUDDs[i].id &&
                    vmCtrl.attributesUDDs[i].entry_level &&
                    vmCtrl.attributesUDDs[i].entry_level.toLowerCase() !==
                    "collection"
                  ) {
                    vmCtrl.attributesUDDs[i].udd_value_id = result.udd_value_id;
                    if (
                      vmCtrl.attributesUDDs[i].format.toLowerCase() === "date"
                    ) {
                      result.value = moment(result.value).format($scope.date_format);
                    }

                    if (
                      vmCtrl.attributesUDDs[i].format.toLowerCase() === "date range" && result.value
                    ) {
                      vmCtrl.attributesUDDs[i].from_date_value = $scope.getDateBasedOnFormat(result.value.split(",")[0]);
                      vmCtrl.attributesUDDs[i].to_date_value = $scope.getDateBasedOnFormat(result.value.split(",")[1]);
                    }
                    vmCtrl.attributesUDDs[i].value = result.value;
                    vmCtrl.commonAttributes.push(vmCtrl.attributesUDDs[i]);
                    vm.commonAttributesIds.push(vmCtrl.attributesUDDs[i].id);
                  } else if (
                    vmCtrl.attributesUDDs[i].entry_level &&
                    vmCtrl.attributesUDDs[i].entry_level.toLowerCase() ==
                    "collection"
                  ) {
                    if (
                      result.user_defined_data_id ===
                      vmCtrl.attributesUDDs[i].id &&
                      !vmCtrl.attributesUDDs[i].value &&
                      !vmCtrl.attributesUDDs[i].udd_value_id
                    ) {
                      if (
                        vmCtrl.attributesUDDs[i].format.toLowerCase() === "date range" && result.value
                      ) {
                        vmCtrl.attributesUDDs[i].from_date_value = $scope.getDateBasedOnFormat(result.value.split(",")[0]);
                        vmCtrl.attributesUDDs[i].to_date_value = $scope.getDateBasedOnFormat(result.value.split(",")[1]);
                      }
                      vmCtrl.attributesUDDs[i].value = result.value;
                      vmCtrl.attributesUDDs[i].udd_value_id =
                        result.udd_value_id;
                    }
                  }
                });
              }
            }
            i === vmCtrl.attributesUDDs.length - 1
              ? (vmCtrl.isLoadingCommonUdds = false)
              : null;
          }
          if (vmCtrl.attributesUDDs.length === 0) {
            vmCtrl.isLoadingCommonUdds = false;
          }
          // Find the common hierarchies avaiable between previous item type and new item type set
          for (let i = 0; i < vmCtrl.hierarchyUDDs.length; i++) {
            // Loop through the old hierarchy UDDs
            for (let j = 0; j < vmCtrl.oldhierarchyUDDs.length; j++) {
              // If hierarchy short description matching with the old hierarchy short description, set the value of old hierarchy value to new UDD
              if (
                vmCtrl.oldhierarchyUDDs[j].short_description ===
                vmCtrl.hierarchyUDDs[i].short_description
              ) {
                _.each(results, result => {
                  if (
                    result.user_defined_data_id === vmCtrl.hierarchyUDDs[i].id
                  ) {
                    vmCtrl.hierarchyUDDs[i].udd_value_id = result.udd_value_id;
                    vmCtrl.hierarchyUDDs[i].value = result.value;
                    vmCtrl.commonHierarchyUDDs.push(vmCtrl.hierarchyUDDs[i]);
                    vmCtrl.commonHierarchyIds.push(vmCtrl.hierarchyUDDs[i].id);
                  }
                });
              }
            }
          }
        })
        .catch(error => {
          vmCtrl.isLoadingCommonUdds = false;
          logger.log(error);
        });
    }

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

    $scope.setValue = (to_from_val, value) => {
      if (value) {
        return value;
      }
      if (to_from_val) {
        return to_from_val;
      }
    };


    $scope.setDateValue = (to_from_val, value) => {
      if (value) {
        return $scope.getDateBasedOnFormat(value);
      }
      if (to_from_val) {
        return $scope.getDateBasedOnFormat(to_from_val);
      }
    };

    $scope.setPercentValue = (to_from_val, from, value) => {
      if (value) {
        return value;
      }
      if (to_from_val) {
        return to_from_val;
      } else {
        from = from.replace("%", "");
        return from;
      }
    };

    $scope.setLinkTextValue = (to_from_val, value) => {
      if (value) {
        return value.split("::")[0];
      }
      if (to_from_val) {
        return to_from_val.split("::")[0];
      }
    };

    $scope.setUrlPathValue = (to_from_val, value) => {
      if (value) {
        return value.split("::")[1];
      }
      if (to_from_val) {
        return to_from_val.split("::")[1];
      }
    };

    $scope.setMultiselectValue = (to_from_val, value) => {
      if (value) {
        return String(value)
          .split(",")
          .map(Number);
      }
      if (to_from_val) {
        return String(to_from_val)
          .split(",")
          .map(Number);
      }
    };

    function updateUddValue(uddValObj, notificationString) {
      return new Promise(function (resolve, reject) {
        apiInstanceToUddValueUpdate(uddValObj)
          .then(response => {
            vmCtrl.init();
            if (notificationString == "show_notification") {
              $scope.$parent.itemUDDSuccessMessage = response.data.message;
              Notification.responsenotification(response.data);
            }

            resolve(response);
          })
          .catch(error => logger.error(error));
      });
    }

    function deleteUddValues(valueId) {
      return new Promise(function (resolve, reject) {
        let object = {
          id: valueId,
          udd_value_id: null,
          value: null
        }
        apiInstanceToUddValueUpdate(object)
          .then(response => {
            resolve(response);
          })
          .catch(error => logger.error(error));
      });
    }

    // delete udd values by muliple item map ids and a collection id
    function deleteUddValuesByMapIds(mapIds, entryID) {
      let query = {
        item_map_ids: mapIds,
        collection_id: $scope.head.collection_id
      };
      if (entryID) query.entry_id = entryID;
      ItemService.API.DeleteBridgeValuesByMapIds(query)
        .then(() => { })
        .catch(error => logger.error(error));
    }
    // This variable is to initialize the dropdown object used in selectize
    $scope.selectUddDropDown = {};
    // This is called in the selectize on each dropdown which is created in the ng-repeat
    vmCtrl.initDropDown = current_udd_data => {
      // Configure select UDD dropdown object
      $scope.selectUddDropDown[current_udd_data.maintenance_description] = {
        valueField: "id",
        labelField: "description",
        searchField: ["description"],
        sortField: "description",
        // Space is concatinated so that end of the text does not cut off
        placeholder: "Select " + current_udd_data.maintenance_description + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        // Adding the data to the options, so as to show the data in the dropdown
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
          // The selected option is sent to the item object
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

    // This variable is to initialize the dropdown object used in selectize
    $scope.selectMTOUddDropDown = {};
    vmCtrl.initOptionTypeDropDown = current_udd_data => {
      // Configure select UDD dropdown object
      $scope.selectMTOUddDropDown[current_udd_data.maintenance_description] = {
        valueField: "id",
        labelField: "mto_description",
        searchField: ["mto_description"],
        sortField: "mto_description",
        // Space is concatinated so that end of the text does not cut off
        placeholder: "Select MTO Option" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        // Adding the data to the options, so as to show the data in the dropdown
        options: current_udd_data.values,
        render: {
          option: (data, escape) => {
            if (data.status_id === vmCtrl.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.mto_description) +
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
                escape(data.mto_description) +
                " : " +
                data.status +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          // The selected option is sent to the item object
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.mto_description) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vmCtrl.isLinkValid = each => {
      let regex = $scope.globalRegularExpression;
      if (regex.test(each.link_text_value)) {
        each.is_valid_link_text = true;
      } else {
        each.is_valid_link_text = false;
      }
    };

    // This variable is to initialize the dropdown object used in selectize
    $scope.selectMTOChoiceUddDropDown = {};
    vmCtrl.initChoiceDropDown = current_udd_data => {
      // Configure select UDD dropdown object
      $scope.selectMTOChoiceUddDropDown[
        current_udd_data.maintenance_description
      ] = {
        valueField: "id",
        labelField: "choice_description",
        searchField: ["choice_description"],
        sortField: "choice_description",
        // Space is concatinated so that end of the text does not cut off
        placeholder: "Select MTO Option - Choice" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        // Adding the data to the options, so as to show the data in the dropdown
        options: current_udd_data.values,
        render: {
          option: (data, escape) => {
            if (data.status_id === vmCtrl.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.choice_description) +
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
                escape(data.choice_description) +
                " : " +
                data.status +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          // The selected option is sent to the item object
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.choice_description) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    function hasUpdateChanges(object, currentUddData) {
      let omitKeys = [
        "id",
        "item_map_id",
        "entry_id",
        "entry_level",
        "status_id"
      ];
      for (let key in object) {
        if (!omitKeys.includes(key)) {
          if (key === "value" || key === "udd_value_id") {
            if (
              currentUddData.user_defined_data_type.toLowerCase() ===
              "attribute" &&
              (
                currentUddData["format"].toLowerCase() === "date" ||
                currentUddData["format"].toLowerCase() === "multiselect" ||
                currentUddData["format"].toLowerCase() === "date range"
              )
            ) {
              // if the format is not of date then parseFloat the value
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
              // if the format is not of date then parseFloat the value
              if (
                parseFloat(object[key]) ===
                parseFloat(currentUddData["old_value"])
              ) {
                vmCtrl.hasUpdateChanges = false;
              } else {
                return (vmCtrl.hasUpdateChanges = true);
              }
            } else {
              // if the format is not of date then parseFloat the value
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
    }

    vm.resetFilters = function () {
      vm.isResetFilter = true;
    };

    vm.update_udd_values = function () {
      var updatePromises = [];
      var createUddValues = [];
      var deletePromises = [];
      var deleteUddValueIds = [];
      var deleteUddValueMapIds = [];
      let hasChanges = false;
      var collectionObj;
      var notificationString = "show_notification";
      // _.each(vmCtrl.item_udd_data, item => {
      //   if (item.description === "Delivery 905 call to schedule" && $scope.head.collection_id == null) {
      //     item.value = 0;
      //     item.has_values = 0;
      //     item.to_from_val = 1;
      //   }
      // });
      if (vmCtrl.item_udd_data && vmCtrl.item_udd_data.length > 0) {
        for (var i = 0; i < vmCtrl.item_udd_data.length; i++) {
          var obj = vmCtrl.item_udd_data[i];
          var udd_obj = {};
          var flag = false;

          udd_obj.id = obj.udd_bridge_id;
          udd_obj["entry_id"] = vmCtrl.selected_item.id;
          udd_obj["entry_level"] = "Item";
          udd_obj["status_id"] = default_status_id;
          udd_obj["item_map_id"] = obj.map_id;
          udd_obj["format"] = obj.format;

          /* Attribute , MTO Type , MTO Option */
          if (
            obj.user_defined_data_type !== "Hierarchy" &&
            obj.format &&
            obj.format.toLowerCase() === "multiselect"
          ) {
            if (obj.selectedValueIds && obj.selectedValueIds.length > 0) {
              udd_obj.value = obj.selectedValueIds.join(",");
              obj.value = obj.selectedValueIds.join(",");
              flag = true;
            }
          }

          if (
            obj.user_defined_data_type !== "Hierarchy" &&
            obj.udd_value_id &&
            obj.udd_value_id !== null &&
            obj.udd_value_id !== undefined &&
            obj.udd_value_id !== ""
          ) {
            udd_obj.udd_value_id = Number(obj.udd_value_id);
            flag = true;
          } else if (
            obj.format &&
            obj.format.toLowerCase() === "yes/no" &&
            (obj.value === undefined || obj.value === null || obj.value === "")
          ) {
            udd_obj.value = "0";
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
          /* Attribute has no dropdown - integer,decimal,date,percentage,yes/no etc.*/
          if (
            obj.user_defined_data_type !== "Hierarchy" &&
            typeof obj.has_values !== "undefined" &&
            obj.has_values == 0 &&
            obj.value !== null &&
            obj.value !== undefined &&
            obj.value !== ""
          ) {
            udd_obj.value = obj.value.toString();
            flag = true;
            if (obj.format.toLowerCase() === "date") {
              udd_obj.value = moment(obj.value).format($scope.date_format);
            }
          }
          /* Hierarchy Dropdown */
          if (obj.user_defined_data_type === "Hierarchy") {
            if (
              $scope.selectedHierarchyProperty !== undefined &&
              $scope.selectedHierarchyProperty[obj.map_id] !== undefined &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !==
              null &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !==
              undefined &&
              $scope.selectedHierarchyProperty[obj.map_id]["property_id"] !== ""
            ) {
              udd_obj.udd_value_id =
                $scope.selectedHierarchyProperty[obj.map_id]["property_id"];
              collectionObj = {
                item_map_id: obj.map_id,
                type_id: $scope.head.type_id,
                id: obj.id,
                entry_level: obj.entry_level,
                entry_type: obj.entry_type,
                user_defined_data_type: obj.user_defined_data_type,
                value: obj.value,
                old_udd_value_id: obj.udd_value_id,
                udd_value_id: udd_obj.udd_value_id ? udd_obj.udd_value_id : obj.udd_value_id,
                collection_id: $scope.head.collection_id,
                entry_id: udd_obj.entry_id
              };
            }
            flag = true;
          }
          if (
            obj.udd_bridge_id &&
            obj.old_value &&
            !obj.value &&
            !obj.udd_value_id &&
            (
              (
                obj.user_defined_data_type.toLowerCase() === "attribute" &&
                obj.format.toLowerCase() !== "yes/no" &&
                obj.format.toLowerCase() !== "date range"
              ) ||
              obj.user_defined_data_type.toLowerCase() !== "attribute"
            )
          ) {
            deletePromises.push(deleteUddValues(obj.udd_bridge_id));
            deleteUddValueIds.push(obj.udd_bridge_id);
          }
          if (
            obj.udd_bridge_id &&
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

          // object prepared to update udd values for collection level udds of same item type and collection combination

          if (
            obj.entry_level &&
            obj.entry_level.toLowerCase() === "collection"
          ) {
            if (
              obj.udd_bridge_id &&
              deleteUddValueIds.includes(obj.udd_bridge_id) &&
              !deleteUddValueMapIds.includes(obj.map_id)
            ) {
              // create array of map ids with entry level as collection
              deleteUddValueMapIds.push(obj.map_id);
            } else {
              collectionObj = {
                item_map_id: obj.map_id,
                type_id: $scope.head.type_id,
                id: obj.id,
                entry_level: obj.entry_level,
                entry_type: obj.entry_type,
                user_defined_data_type: obj.user_defined_data_type,
                value: obj.value,
                udd_value_id: obj.udd_value_id,
                collection_id: $scope.head.collection_id
              };
            }
          }

          if (obj.isCreated !== undefined) {
            if (flag) {
              if (hasUpdateChanges(udd_obj, obj)) {
                updatePromises.push(
                  updateUddValue(udd_obj, notificationString)
                );
                notificationString = "hide_notification";
                hasChanges = true;
                vmCtrl.init();
                if (collectionObj) {
                  updateCollectionUddValues(collectionObj);
                }
              }
            }
          } else {
            delete udd_obj.id;
            if (flag) {
              if (udd_obj.value || udd_obj.udd_value_id) {
                createUddValues.push(udd_obj);
                if (collectionObj) {
                  updateCollectionUddValues(collectionObj);
                }
              }
            }
          }
        }
        // if collection level udd value is deleted
        // then delete all values for same map ids and collection
        if (deleteUddValueIds.length > 0) {
          deleteUddValuesByMapIds(deleteUddValueMapIds);
        }
      }

      Promise.all(updatePromises)
        .then(() => {
          if (deleteUddValueIds.length === 0 && !hasChanges) {
            $scope.$parent.itemUDDSuccessMessage =
              "Nothing to update in Item/SKU UDD";
          }
        })
        .catch(() => { });

      Promise.all(deletePromises)
        .then(() => {
          if (deleteUddValueIds.length > 0) {
            $scope.$parent.itemUDDSuccessMessage =
              "Item/SKU user defined data updated successfully.";
            vmCtrl.init();
          }
        })
        .catch(() => { });

      if (createUddValues.length > 0) {
        var uddValuesObj = {};
        uddValuesObj["Objects"] = createUddValues;
        uddValuesObj["action"] = "bulk";
        apiInstanceToUddInsert(uddValuesObj)
          .then(response => {
            vmCtrl.init();
            $scope.$parent.itemUDDSuccessMessage = response.data.message;
          })
          .catch(error => logger.error(error));
      }

      if (deleteUddValueIds.length || createUddValues.length || updatePromises.length) {
        common.$timeout(() => {
          if (vm.args_status === 403) {
            ItemService.API.CaptureItemChangeInQueue("4", vmCtrl.selected_item.id)
              .then(result => {
                console.log(result);
              })
              .catch(error => {
                console.log(error);
              })
          }
        }, 3000);
      }
      if(vmCtrl.delCollUdd){
        deleteUddValuesByMapIds(vmCtrl.delCollUdd,this.selected_item.id);
      }
      if(vmCtrl.delCollWhiteGloveUdd){
        deleteUddValuesByMapIds(vmCtrl.delCollWhiteGloveUdd,this.selected_item.id);
      }
    };

    function updateCollectionUddValues(dataObject) {
      ItemUDDValueService.API.UpdateCollectionLevelUDDValues(dataObject)
        .then(() => { })
        .catch(error => {
          console.log(error);
        });
    }

    function getCollectionLevelUdds() {
      if ($scope.head.collection_id) {
        let query = {
          entry_level: "Collection",
          collection_id: $scope.head.collection_id
        };
        // vmCtrl.collectionLevelUddValuesMap = undefined;
        ItemUDDValueService.API.GetCollectionLevelUddValuesForItemType(query)
          .then(response => {
            vmCtrl.collectionLevelUddValuesMap = response.data;
          })
          .catch(error => {
            console.log(error);
          });
      }
    }

    vm.setOldValueForEachUdd = uddIdsMap => {
      for (let i = 0; i < vmCtrl.item_udd_data.length; i++) {
        let udd = vmCtrl.item_udd_data[i];
        if (uddIdsMap[udd.map_id]) {
          vmCtrl.item_udd_data[i].old_value = uddIdsMap[udd.map_id].udd_value_id
            ? uddIdsMap[udd.map_id].udd_value_id
            : uddIdsMap[udd.map_id].value;
          vmCtrl.item_udd_data[i].isCreated = true;
        }
      }
    };

    // Function to get link text and url path from URL format value saved
    vm.setLinkTextAndUrlPathModel = urlUdd => {
      // Check if the url udd value exists for the given udd
      if (urlUdd.value && urlUdd.value.length) {
        // Each url value will be saved the forma link_text::url_path, split by ::
        let urlValue = urlUdd.value.split("::");
        urlUdd.link_text_value = urlValue[0];
        urlUdd.url_path_value = urlValue[1];
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

    vm.createItemUdds = () => {
      var createUddValues = [];
      var deletePromises = [];
      var deleteUddValueIds = [];
      var mapIds = [];
      for (var i = 0; i < vmCtrl.item_udd_data.length; i++) {
        if (vmCtrl.item_udd_data[i].entry_level.toLowerCase() !== "sku") {
          var obj = vmCtrl.item_udd_data[i];
          var udd_obj = {};
          var flag = false;
          udd_obj.id = obj.udd_bridge_id;
          udd_obj["entry_id"] = vmCtrl.selected_item.id;
          udd_obj["entry_level"] = "Item";
          udd_obj["status_id"] = default_status_id;
          udd_obj["item_map_id"] = obj.map_id;
          udd_obj["format"] = obj.format;

          /* Attribute , MTO Type , MTO Option */
          if (obj.format && obj.format.toLowerCase() === "multiselect") {
            if (obj.selectedValueIds && obj.selectedValueIds.length > 0) {
              udd_obj.value = obj.selectedValueIds.join(",");
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
            obj.udd_value_id &&
            obj.udd_value_id !== null &&
            obj.udd_value_id !== undefined &&
            obj.udd_value_id !== ""
          ) {
            udd_obj.udd_value_id = Number(obj.udd_value_id);
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
                $scope.selectedHierarchyProperty[obj.map_id]["property_id"];
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
              ) ||
              obj.user_defined_data_type.toLowerCase() !== "attribute"
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
          if (
            !mapIds.includes(udd_obj.item_map_id) &&
            (udd_obj.value || udd_obj.udd_value_id)
          ) {
            mapIds.push(udd_obj.item_map_id);
            createUddValues.push(udd_obj);
          }
        }
      }
      if (createUddValues.length > 0) {
        var uddValuesObj = {};
        uddValuesObj["Objects"] = createUddValues;
        uddValuesObj["action"] = "bulk";
        apiInstanceToUddInsert(uddValuesObj)
          .then(response => {
            vmCtrl.insertedItemId = vmCtrl.selected_item.id;
            $scope.$parent.itemUDDSuccessMessage = response.data.message;
            vmCtrl.item_udd_data = [];
            if (vm.args_status === 403) {
              ItemService.API.CaptureItemChangeInQueue("4", vmCtrl.selected_item.id)
                .then(result => {
                  // console.log(result);
                })
                .catch(error => {
                  console.log(error);
                })
            }
          })
          .catch(error => logger.error(error));
      }
    };

    $scope.$on("clearUddValues", (e, args) => {
      if (args.response.isUpdateItemType == true) {
        vmCtrl.item_udd_data = [];
        vmCtrl.commonAttributes = [];
        vmCtrl.commonAttributesIds = [];
      }
    });

    $scope.$on("saveOrUpdateItemUdds", (e, args) => {
      if (args.response.isUpdateItemType == true) {
        vmCtrl.selected_item = {
          id: args.inserted_id
        };
        vmCtrl.selected_item.id = args.inserted_id;
        vmCtrl.createItemUdds();
      }
    });

    $scope.$on("saveOrUpdateUdd", function (e, args) {
      vm.args_status = args.response ? args.response.status : null;
      $scope.$parent.itemErrorMessage = null;
      $scope.$parent.itemUDDSuccessMessage = null;
      if (
        args.response != undefined &&
        (args.response.status == 200 ||
          args.response.status === 201 ||
          args.response.status === 403)
      ) {
        if (args.inserted_id) {
          $scope.$parent.itemSuccessMessage = args.response.message;
        } else {
          $scope.$parent.itemSuccessMessage = args.response.message;
        }
        //  Notification.responsenotification(args.response);
        vmCtrl.selected_item.id = args.inserted_id;
        vmCtrl.selected_item = {
          id: args.inserted_id
        };
        vmCtrl.update_udd_values();
        common.$timeout(() => {
          $scope.$parent.itemErrorMessage = null;
        }, 3000);
      } else if (
        args.error !== undefined ||
        (args.response &&
          args.response.data &&
          args.response.data.error !== undefined)
      ) {
        //  Notification.errornotification(args.error);
        $scope.$parent.itemErrorMessage = args.error
          ? [args.error.message]
          : [args.response.data.error.message];
      } else {
        $scope.$parent.itemErrorMessage = args.response.form_validation_error;
      }
    });
  }
  // Directive
  (function () {
    "use strict";

    angular
      .module("rc.prime.item")
      .directive("itemUserdefinedDataDirective", itemUserdefinedDataDirective);

    function itemUserdefinedDataDirective() {
      // Usage:
      //     <item-userdefined-data-directive> </item-userdefined-data-directive>
      // Creates:
      //
      var directive = {
        restrict: "EA",
        controller: ItemUserDefinedDataController,
        controllerAs: "vmCtrl",
        templateUrl:
          "application/modules/item/maintenance/item.udd.directive.html"
      };
      return directive;
    }
  })();
})();
