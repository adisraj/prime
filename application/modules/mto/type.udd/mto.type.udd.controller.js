(function () {
  "use strict";

  angular
    .module("rc.prime.mto.type.udd")
    .controller("MTOTypeUDDController", MTOTypeUDDController);
  MTOTypeUDDController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "AttributeService",
    "CodeService",
    "EntityService",
    "HierarchyService",
    "MTOTypeService",
    "MTOUDDService",
    "HierarchyValueService",
    "AttributeValueService",
    "AttributeValueFactory",
    "StatusCodes",
    "valdr",
    "GlobalRegularExpression"
  ];

  function MTOTypeUDDController(
    $scope,
    $stateParams,
    common,
    AttributeService,
    CodeService,
    EntityService,
    HierarchyService,
    MTOTypeService,
    MTOUDDService,
    HierarchyValueService,
    AttributeValueService,
    AttributeValueFactory,
    StatusCodes,
    valdr,
    GlobalRegularExpression
  ) {
    var vm = this;
    vm.statusCodes = StatusCodes;
    let $timeout = common.$timeout;
    let $filter = common.$filter;
    let logger = common.Logger.getInstance("MTOTypeUDDController");
    let $state = common.$state;
    let Notification = common.Notification;
    vm.common = common;
    vm.$stateParams = $stateParams;
    vm.globalRegularExpression = GlobalRegularExpression;

    vm.entityInformation = {};
    vm.mto_master_info = {};
    vm.uuid = "41";
    vm.uddtypes = [];

    //variables used in create/update/delete forms
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isDeleteSuccess = false;
    vm.isBtnEnable = true;

    vm.message = null;
    vm.isShowHistory = false;
    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;

    // variables used to map values for parent udd id
    vm.attributeIdAndValuesMap = {};
    vm.hierarchyIdAndValuesMap = {};
    vm.hierarachyValueIdsMapList = {};

    //variables used to map data by user defined data type(attribute/hirarchy)
    vm.attributeListDropDown = {};
    vm.hierarchyListDropDown = {};
    vm.mtoUddMap = {};
    vm.statusMap = {};
    vm.enableGoToAllTypeUDD = false;
    vm.attributeHierarchyModel = {};
    vm.attributeHierarchyoption = {};
    vm.attributeHierarchyoptionArray = [];
    vm.attributeListMap = {};
    vm.hierarchyListMap = {};

    //pagination and sorting variables
    vm.sortType = "display_sequence";
    vm.currentPage = 1;
    vm.pageSize = 100;
    vm.isColumnSettingsVisible = false;

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.mtoUddGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          optionType: {
            visible: false
          },
          userDefinedDataType: {
            visible: true
          },
          attributesFacts: {
            visible: true
          },
          displaySequence: {
            visible: true
          },
          description: {
            visible: true
          },
          default_value: {
            visible: true
          },
          entryLevel: {
            visible: true
          },
          required: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    // Initialising object for Selcetise dropdown
    $scope.selectAttributeHierarchy = {
      valueField: "id",
      labelField: "short_description",
      searchField: ["short_description"],
      sortField: "short_description",
      placeholder: "Select",
      allowEmptyOption: true,
      create: false,
      hideSelected: true,
      highlight: false,
      searchConjunction: "or",
      render: {
        option: (data, escape) => {
          if (data.status_id === vm.statusCodes.Inactive.ID) {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.short_description) +
              "</span>" +
              "<span>" +
              "</span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.status) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          } else {
            return (
              '<div class="p-5">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.short_description) +
              "</span>" +
              "</span>" +
              "<span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.status) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: function (data, escape) {
          vm.new_type_udd.attribute_or_hierarchy = data.short_description;
          return (
            '<div class="c-black f-13"> ' +
            escape(data.short_description) +
            "</div>"
          );
        }
      }
    };

    //on page load initializing module
    vm.initializeMTOUDD = function () {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      $scope.getAccessPermissions(vm.uuid);
      vm.loadCodeListData(
        common.Identifiers.system_level,
        "UDD Required",
        "allRequired",
        common.$q
      ); // Loading for All Required options
      vm.loadCodeListData(
        vm.uuid,
        "UDD Entry Level",
        "allfieldnames",
        common.$q
      ); // Loading for All Entry levels
      vm.getMTOMasterInfoAndSetTypes();

      let promise = vm.reload();

      promise.then(res => {
        $stateParams.mto_type_udd_id &&
          common.$state.current.name.includes("mtotypeudd.update") ?
          vm.gotoUpdateStateIfIdExist() :
          "";
      });
    };

    //If upadte/delete form is open, on refresh page get mto type user defined data for selected type udd
    vm.getMTOTypeUDDById = () => {
      MTOUDDService.API.GetMTOUDDById($stateParams.mto_type_udd_id)
        .then(response => {
          vm.dblClickAction(response);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.createListMap = function (selectedUDDRecord) {
      selectedUDDRecord.genericListMap = new Object();
      angular.forEach(selectedUDDRecord.genericList, function (value, key) {
        selectedUDDRecord.genericListMap[parseInt(value.id)] =
          value.description;
      });
    };
    vm.createMap = function (fromArrayModel, toMapModel, key) {
      _.each(vm[fromArrayModel], function (value) {
        vm[toMapModel][value[key]] = value;
      });
    };
    //create attribute and hierarchies data mapping
    vm.createTypeListMap = function () {
      vm.getAttributeList();
      vm.getHierarchyList();
    };

    //Get list of attributes with only required fields by the entity id
    vm.getAttributeList = () => {
      common.EntityDetails.API.GetGraphSet(
          common.Identifiers.attribute,
          [
            "id",
            "status_id",
            "status",
            "description",
            "short_description",
            "has_values",
            "format",
            "attribute_from_value",
            "attribute_to_value",
            "dimension_class",
            "dimension_unit"
          ],
          "entity_id",
          vm.mto_master_info.id
        )
        .then(res => {
          vm.attributeListDropDown = res;
          vm.AttributeListMap(res);
          //if current state is update udd state, then for selected user defined data type load values in drop down
          $state.current.name.includes(".update") &&
            vm.new_type_udd &&
            vm.new_type_udd.user_defined_data_type.toLowerCase() === "attribute" ?
            vm.loadRespectiveEntity(vm.new_type_udd) :
            null;
        })
        .catch(err => logger.error(err));
    };

    vm.AttributeListMap = listData => {
      for (let i = 0; i < listData.length; i++) {
        if (vm.attributeListMap[i] === undefined) {
          vm.attributeListMap[listData[i].id] = listData[i];
        }
      }

      if (vm.mtostypeudd_data && vm.mtostypeudd_data.length) {
        vm.showValueforDefaultValueField();
      }
    };
    //Get list of hierarchies with only required fields by the entity id
    vm.getHierarchyList = () => {
      common.EntityDetails.API.GetGraphSet(
          common.Identifiers.hierarchy,
          ["id", "status_id", "status", "description", "short_description"],
          "entity_id",
          vm.mto_master_info.id
        )
        .then(res => {
          vm.hierarchyListDropDown = res;
          vm.HierarchyListMap(res);
          //if current state is update udd state, then for selected user defined data type load values in drop down
          $state.current.name.includes(".update") &&
            vm.new_type_udd &&
            vm.new_type_udd.user_defined_data_type.toLowerCase() === "hierarchy" ?
            vm.loadRespectiveEntity(vm.new_type_udd) :
            null;
        })
        .catch(err => logger.error(err));
    };

    vm.HierarchyListMap = listData => {
      for (let i = 0; i < listData.length; i++) {
        if (vm.hierarchyListMap[i] === undefined) {
          vm.hierarchyListMap[listData[i].id] = listData[i];
        }
      }
    };

    //Focus
    vm.focusSearchField = () => {
      this.common.$timeout(() => {
        angular.element("#inlineSearch").focus();
        },1000)
      this.showFilter = 1;
    };

    //Get information required for mto type udd entity, statically stored in application.context.js file
    vm.getEntityInformation = function () {
      common.EntityDetails.API.GetEntityInformation(vm.uuid).then(
        _information => {
          vm.entityInformation = _information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.mto_option); // GET statuses for MTO module
        }
      );
    };

    //get validation rules for mto type by uuid and set rules using valdr in application.context.js
    vm.getModelAndSetValidationRules = function () {
      common.EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    //get MTO entity information from entity table
    vm.getMTOMasterInfoAndSetTypes = function () {
      // Getting entity detail for mto
      EntityService.API.GetEntityByUUID(common.Identifiers.mto_option).then(
        res => {
          vm.mto_master_info = res[0];
          vm.createTypeListMap();
        }
      );
    };

    //Load data based on selected user defined data in create/update form
    vm.loadRespectiveEntity = function (selectedUDDRecord) {
      vm.typeIdsMap = [];
      vm.loadedselecize = false;
      //assign selected values for selected user defined data type to a common model to show in UI drop down
      if (
        selectedUDDRecord &&
        selectedUDDRecord.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        vm.attributeHierarchyoptionArray = vm.attributeListDropDown; // Attribute drop down list has been assigned to an array which used in dropdown list for selectise
        $scope.selectAttributeHierarchy.placeholder = "Select Attribute"; //Assigning the placeholder based on the user defined data type selected.
        $timeout(() => {
          vm.loadedselecize = true;
        }, 0);
      } else if (
        selectedUDDRecord &&
        selectedUDDRecord.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        vm.attributeHierarchyoptionArray = vm.hierarchyListDropDown; //Hierarchy drop down list has been assigned to an array which used in dropdown list for selectise
        $scope.selectAttributeHierarchy.placeholder = "Select Hierarchy"; //Assigning the placeholder based on the user defined data type selected.
        $timeout(() => {
          vm.loadedselecize = true;
        }, 0);
      }

      //check if all selected type ids are present in map, if not then push type id to map
      for (let i = 0; i < $scope.selectedIDs.length; i++) {
        if (vm.typeIdsMap[parseInt($scope.selectedIDs[i])] === undefined) {
          vm.typeIdsMap[parseInt($scope.selectedIDs[i])] = {
            option_type: "",
            attributeIds: [],
            hierarchyIds: []
          };
        }
      }

      ///creating map with option type id as key and option type and user defined data id as value Iterating through udds for selected option type ids.
      for (let i = 0; i < vm.mtostypeudd_data.length; i++) {
        let udd = vm.mtostypeudd_data[i];
        //this will add user defined data id to the corresponding array and option type for every option type id.
        if (
          vm.typeIdsMap[udd.option_type_id] &&
          vm.typeIdsMap[udd.option_type_id]["option_type"] == "" &&
          !vm.typeIdsMap[udd.option_type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].includes(udd.user_defined_data_id)
        ) {
          vm.typeIdsMap[udd.option_type_id]["option_type"] = udd.option_type;
          vm.typeIdsMap[udd.option_type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].push(udd.user_defined_data_id);
        } else if (
          vm.typeIdsMap[udd.option_type_id] &&
          !vm.typeIdsMap[udd.option_type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].includes(udd.user_defined_data_id)
        ) {
          vm.typeIdsMap[udd.option_type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].push(udd.user_defined_data_id);
        }
      }
    };

    /**
     * @param {Boolean} refresh true/false
     * @description On page load or on "Refresh" button click this will be called.
     * If refresh value is true the message with record number, response time take will be shown in UI
     */
    vm.reload = function (refresh) {
      vm.typeLimit = 10;
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      vm.isLoaded = false;
      $scope.selectedIDs = $stateParams.mto_type_id.split(",");
      let data = MTOUDDService.API.GetMTOUDDByLOV(
          "option_type_id",
          $scope.selectedIDs
        )
        .then(response => {
          response.data = $filter("orderBy")(response.data, [
            "option_type",
            "display_sequence"
          ]);
          vm.rowsCount = response.data.length;
          vm.mtostypeudd_data = response.data;
          $scope.refreshed = true;
          vm.enableGoToAllTypeUDD = false;
          vm.selectedDescription = vm.mtostypeudd_data
            .map(e => e["option_type_id"])
            .map((e, i, final) => final.indexOf(e) === i && i)
            .filter(e => vm.mtostypeudd_data[e])
            .map(e => vm.mtostypeudd_data[e]);
          _.each(response.data, function (mtoUdd) {
            vm.mtoUddMap[mtoUdd.user_defined_data_id] = mtoUdd;
          });
          if (vm.selectedDescription.length > 1) {
            vm.mtoUddGrid.columns.optionType.visible = true;
            vm.sortType = "option_type";
          }
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
          }
          Object.keys(vm.attributeListMap).length > 0 ?
            vm.showValueforDefaultValueField() :
            "";
          vm.createMapListMtoUddTypes(response.data);
          vm.isLoaded = true;
          vm.updateTableInformation(1);
          return response.data;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true; // isLoaded variable true after api call
            vm.isViewAuthorized = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
      return data;
    };

    //Create map list for udd data
    vm.createMapListMtoUddTypes = list => {
      vm.typesMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.typesMap[list[i].id] === undefined) {
          vm.typesMap[list[i].id] = list[i];
        }
      }
    };

    //generic function to get data for drop down from code list table
    vm.loadCodeListData = function (uuid, fieldName, model, $q) {
      var defer = $q.defer();
      let query = {
        uuid: uuid,
        field_name: fieldName
      };
      CodeService.API.MultiSearchCodeList(query)
        .then(response => {
          $scope[model] = response;
          vm[model] = response;
          defer.resolve(response);
        })
        .catch(error => defer.reject(error));
      return defer.promise;
    };

    // toggle Hide/Show Columns panel
    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    /////// save, update,delete implementation

    //save udd data for all selected mto type ids
    vm.saveUDD = function (payload) {
      vm.messagesList = [];
      var deferred = common.$q.defer();
      MTOUDDService.API.InsertMTOUDD(payload)
        .then(response => {
          vm.previousLT = payload;
          vm.saveBtnText = "Done";
          vm.isBtnEnable = true;
          vm.isSaveSuccess = true;
          deferred.resolve("Success");
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (!error.data.flag) {
            vm.message = Notification.errorNotification(error);
          }

          if (error.data.flag && error.data.flag.udd_exists) {
            //if record with selected user defined data type value and item type id is already exist then notify user
            vm.messagesList.push({
              exists: true,
              uddType: payload.user_defined_data_type.toLowerCase(),
              optionType: vm.typeIdsMap[payload.option_type_id].option_type,
              maintenanceDescription: payload.maintenance_description,
              attribute_or_hierarchy: payload.attribute_or_hierarchy
            });
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          common.$timeout(function () {
            vm.isBtnEnable = true;
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
          deferred.reject("Error");
        });
      // The promise of the deferred task
      return deferred.promise;
    };
    vm.save = function (payload) {
      vm.isBtnEnable = false;
      vm.saveBtnText = "Saving now...";
      let promises = [];
      vm.messagesList = [];
      payload.user_defined_data_id = parseInt(vm.attributeHierarchyModel.id);
      if (
        payload.user_defined_data_type.toLowerCase() === "attribute" &&
        vm.attributeListMap[
          payload.user_defined_data_id
        ].format.toLowerCase() === "multiselect"
      ) {
        payload.default_value = payload.default_value_ids.join(",");
      } else {
        payload.default_value = !payload.default_value ?
          vm.attributeHierarchyValueModel.value :
          payload.default_value;
      }
      _.each($scope.selectedIDs, id => {
        // iterate over all selected option type ids to create used defined data for those ids
        //if record with selected user defined data type value and option type id is does not exist then only allowed to create
        if (
          !vm.typeIdsMap[id][
            payload.user_defined_data_type.toLowerCase() + "Ids"
          ].includes(payload.user_defined_data_id)
        ) {
          let newPayload = _.extend({}, payload);
          newPayload.option_type_id = id;
          promises.push(vm.saveUDD(newPayload));
        } else {
          //if record with selected user defined data type value and option type id is already exist then notify user
          vm.messagesList.push({
            exists: true,
            uddType: payload.user_defined_data_type.toLowerCase(),
            optionType: vm.typeIdsMap[id].option_type,
            maintenanceDescription: payload.maintenance_description,
            attribute_or_hierarchy: payload.attribute_or_hierarchy
          });
        }
      });

      common.$q
        .all(promises)
        .then(values => {
          vm.reload();
        })
        .then(response => {
          vm.isBtnEnable = true;
          vm.saveBtnText = "Save";
        })
        .catch(error => {
          common.$timeout(function () {
            vm.isBtnEnable = true;
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
          logger.error(error);
        });
    };

    //Check for Attribute / Hierarchy Values if Required is Immediate
    vm.checkForAttributeHierarchyValues = (
      requiredValue,
      attributeHierachyId
    ) => {
      if (
        requiredValue !== undefined &&
        requiredValue.toLowerCase() === "immediate"
      ) {
        if (
          vm.new_type_udd.user_defined_data_type.toLowerCase() === "attribute"
        ) {
          AttributeValueService.API.GetAttributeValuesByAttributeId(
            attributeHierachyId
          ).then(response => {
            if (
              vm.attributeListMap[attributeHierachyId].has_values === 1 &&
              response.length === 0
            ) {
              vm.isBtnEnable = false;
              vm.showUddValueMessage =
                "*Please add values for selected Attribute/Hierarchy to proceed";
            } else {
              vm.isBtnEnable = true;
              vm.showUddValueMessage = "";
            }
          });
        } else {
          vm.isBtnEnable = true;
          vm.showUddValueMessage = "";
        }

        if (
          vm.new_type_udd.user_defined_data_type.toLowerCase() === "hierarchy"
        ) {
          HierarchyValueService.API.GetHierarchyValueByHierarchyId(
            attributeHierachyId
          ).then(response => {
            if (response.data.length === 0) {
              vm.isBtnEnable = false;
              vm.showUddValueMessage =
                "*Please add values for selected Attribute/Hierarchy to proceed";
            } else {
              vm.isBtnEnable = true;
              vm.showUddValueMessage = "";
            }
          });
        } else {
          vm.isBtnEnable = true;
          vm.showUddValueMessage = "";
        }
      } else {
        vm.isBtnEnable = true;
        vm.showUddValueMessage = "";
      }
    };

    //comapres if old form data is same as current payload. If yes returns false.
    vm.hasUpdateChanges = function (payload) {
      if (
        vm.oldMTOUDDDetails.maintenance_description !==
        payload.maintenance_description ||
        vm.oldMTOUDDDetails.display_sequence !== payload.display_sequence ||
        vm.oldMTOUDDDetails.required !== payload.required ||
        vm.oldMTOUDDDetails.user_defined_data_id !==
        payload.user_defined_data_id ||
        vm.oldMTOUDDDetails.status_id !== payload.status_id ||
        vm.oldMTOUDDDetails.entrylevel !== payload.entrylevel ||
        vm.oldMTOUDDDetails.default_value != payload.default_value
      ) {
        return true;
      } else {
        return false;
      }
    };

    //Set the default percentage value in the dependency panel
    vm.setPercentValue = function (to_from_val, from, value) {
      if (value !== undefined && value !== null) {
        //If the value is set then return the value itself
        return value;
      } else {
        //Else If the value is not set then return the from_value.
        return from;
      }
    };

    vm.getValuesAvailableForSelectedUDD = (uddType, uddId) => {
      if (uddType.toLowerCase() === "attribute") {
        AttributeValueFactory.FetchAttributeValueByAttributeId(uddId)
          .then(result => {
            vm.userDefinedData = result.data;
            if (result.data.length === 0) {
              AttributeService.API.GetAttributeById(uddId)
                .then(response => {
                  vm.AttributeDetail = response;
                  if (
                    vm.AttributeDetail["format"].toLowerCase() === "percentage"
                  ) {
                    vm.AttributeDetail.attribute_to_value = parseInt(
                      vm.AttributeDetail.attribute_to_value.replace("%", "")
                    );
                    vm.AttributeDetail.attribute_from_value = parseInt(
                      vm.AttributeDetail.attribute_from_value.replace("%", "")
                    );
                  }
                })
                .catch(error => {});
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else if (uddType.toLowerCase() === "hierarchy") {
        HierarchyValueService.API.GetHierarchyValueByHierarchyId(uddId)
          .then(result => {
            vm.userDefinedData = result.data;
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    //If the value attribute has from and to range then validate or else pass the control to update function
    vm.confirmUpdate = (payload, alterMtoUdds) => {
      if (
        vm.AttributeDetail &&
        vm.AttributeDetail.attribute_from_value &&
        vm.AttributeDetail.attribute_to_value &&
        payload.value
      ) {
        if (vm.AttributeDetail.format.toLowerCase() == "date") {
          vm.AttributeDetail.attribute_from_value = $filter("FormatDate")(
            vm.AttributeDetail.attribute_from_value
          );
          vm.AttributeDetail.attribute_to_value = $filter("FormatDate")(
            vm.AttributeDetail.attribute_to_value
          );
        }
        if (
          vm.AttributeDetail.format.toLowerCase() == "integer" ||
          vm.AttributeDetail.format.toLowerCase() == "decimal"
        ) {
          vm.AttributeDetail.attribute_from_value = parseFloat(
            vm.AttributeDetail.attribute_from_value
          );
          vm.AttributeDetail.attribute_to_value = parseFloat(
            vm.AttributeDetail.attribute_to_value
          );
        }
        if (
          vm.AttributeDetail.attribute_from_value ===
          vm.AttributeDetail.attribute_to_value
        ) {
          if (vm.AttributeDetail.attribute_from_value === payload.value) {
            vm.validationMessage = null;
            vm.update(payload, alterMtoUdds);
          } else {
            vm.validationMessage = `${vm.AttributeDetail.format} should be between ${vm.AttributeDetail.attribute_from_value} and ${vm.AttributeDetail.attribute_to_value}`;
          }
        } else if (
          vm.AttributeDetail.attribute_from_value <= payload.value &&
          vm.AttributeDetail.attribute_to_value >= payload.value
        ) {
          vm.validationMessage = null;
          vm.update(payload, alterMtoUdds);
        } else {
          if (vm.AttributeDetail.format.toLowerCase() == "date") {
            vm.AttributeDetail.attribute_from_value = $filter("FormatDate")(
              vm.AttributeDetail.attribute_from_value
            );
            vm.AttributeDetail.attribute_to_value = $filter("FormatDate")(
              vm.AttributeDetail.attribute_to_value
            );
          }
          vm.validationMessage = `${vm.AttributeDetail.format} should be between ${vm.AttributeDetail.attribute_from_value} and ${vm.AttributeDetail.attribute_to_value}`;
        }
      } else {
        vm.update(payload, alterMtoUdds);
      }
    };

    // Directive Send Data back to controller
    vm.end = function (data) {
      $scope.primary_item_hierarchy_value_name = data.path_name;
      $scope.primary_item_hierarchy_obj = data.hierarchyValueData;
      vm.new_type_udd.udd_value_id = data.hierarchyValueData.id;
      $scope.primary_item_hierarchy_value_id = data.hierarchyValueData.id;
      $scope.selectedTreeItem = true;
    };

    vm.arrangeDisplaySequence = (
      uddData,
      payload,
      newSequence,
      oldSequence
    ) => {
      for (let index = 0; index < uddData.length; index++) {
        if (uddData[index].option_type_id == payload.option_type_id) {
          if (
            uddData[index].id != payload.id &&
            ((uddData[index].display_sequence <= newSequence &&
                uddData[index].display_sequence >= oldSequence) ||
              (uddData[index].display_sequence <= oldSequence &&
                uddData[index].display_sequence >= newSequence))
          ) {
            if (oldSequence <= newSequence) {
              uddData[index].display_sequence =
                Number(uddData[index].display_sequence) - 1;
            } else {
              uddData[index].display_sequence =
                Number(uddData[index].display_sequence) + 1;
            }
          }
        }
      }
    };

    //Update mto type udd
    vm.update = function (payload, alterMtoUdds) {
      vm.messagesList = [];
      payload.user_defined_data_id = parseInt(vm.attributeHierarchyModel.id);
      vm.isProcessing = true;
      if (vm.hasUpdateChanges(payload) === true) {
        payload.old_default_value_view = vm.oldMTOUDDDetails.default_value_view;
        vm.isBtnEnable = false;
        vm.updateBtnText = "Updating Now...";
        payload.alter_mto_udd_values = alterMtoUdds;
        payload.alter_mto_udd_values ?
          (payload.ids = vm.mtoUddError.data.error.ids) :
          null;
        //if record with selected user defined data type value and option type id is does not exist then only allowed to update
        MTOUDDService.API.UpdateMTOUDD(payload)
          .then(response => {
            payload.$edit = false;
            vm.isProcessing = false;
            vm.isBtnEnable = true;
            let index = vm.mtostypeudd_data.findIndex(
              mtostypeudd_data => mtostypeudd_data.id === payload.id
            );
            vm.isShowUDDDependencyPanel = false;
            vm.arrangeDisplaySequence(
              vm.mtostypeudd_data,
              payload,
              payload.display_sequence,
              vm.mtostypeudd_data[index].display_sequence
            );
            vm.mtostypeudd_data[index] = response.data.data;
            vm.typesMap[payload.id] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldMTOUDDDetails = null;
            vm.fetchDefaultValueForUdd(vm.mtostypeudd_data[index]);
            $scope.closeShowHistory();
          })
          .catch(error => {
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.isProcessing = false;
            vm.isLoaded = true;
            vm.updateBtnError = true;
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else if (error.data.flag && error.data.flag.udd_exists) {
              //if record with selected user defined data type value and item type id is already exist then notify user
              vm.messagesList.push({
                exists: true,
                uddType: payload.user_defined_data_type.toLowerCase(),
                optionType: vm.typeIdsMap[payload.option_type_id].option_type,
                maintenanceDescription: payload.maintenance_description,
                attribute_or_hierarchy: payload.attribute_or_hierarchy
              });
            } else if (error.data.flag && error.data.flag.description_exists) {
              vm.message = Notification.errorNotification(error);
            } else {
              if (
                error.status === 412 &&
                error.data.error.is_udd_referred_in_mtos &&
                error.data.error.is_udd_referred_in_mtos === true
              ) {
                vm.isShowUDDDependencyPanel = true;
                delete vm.new_type_udd.udd_value_id;
                delete vm.new_type_udd.value;
              } else {
                vm.isShowUDDDependencyPanel = false;
              }
              vm.mtoUddError = error;
              vm.message = Notification.errorNotification(error);
            }
            if (
              error.status === 403 ||
              (error.data.flag && error.data.flag.udd_exists) ||
              (error.data.flag && error.data.flag.description_exists)
            ) {
              vm.updateBtnText = "Oops.!! Something went wrong";
              vm.updateBtnError = true;
            }
            common.$timeout(function () {
              vm.isBtnEnable = true;
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 3500);
          });
      } else {
        vm.isProcessing = false;
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        common.$timeout(function () {
          vm.isBtnEnable = true;
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.arrangeDisplaySequenceAfterDelete = (uddData, sequence, typeId) => {
      uddData.filter(udd => {
        if (
          Number(udd.option_type_id) === Number(typeId) &&
          Number(udd.display_sequence) > Number(sequence)
        ) {
          udd.display_sequence = Number(udd.display_sequence) - 1;
        }
      });
    };

    //delete mto type udd
    vm.delete = function (payload) {
      MTOUDDService.API.DeleteMTOUDD(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.$confirmAttrValDelete = false;
          let index = vm.mtostypeudd_data.findIndex(
            mtostypeudd_data => mtostypeudd_data.id === payload.id
          );
          vm.mtostypeudd_data.splice(index, 1);
          delete vm.typesMap[payload.id];
          vm.arrangeDisplaySequenceAfterDelete(
            vm.mtostypeudd_data,
            payload.display_sequence,
            payload.option_type_id
          );
          vm.rowsCount--;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            if (error.data.type.toLowerCase() === "dependency check") {
              vm.isDependent = true;
              vm.isConfirmDelete = false;
            } else {
              vm.isDependent = false;
              vm.message = Notification.errorNotification(error);
            }
          }
        });
    };

    //delete itemtype udd
    vm.deleteUDDDependencies = payload => {
      vm.isProcessing = true;
      MTOUDDService.API.DeleteMtoUDDAndDependencies(payload)
        .then(response => {
          vm.isDependent = false;
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.isProcessing = false;
          let index = vm.mtostypeudd_data.findIndex(
            mtoTypeUdd => mtoTypeUdd.id === payload.id
          );
          vm.mtostypeudd_data.splice(index, 1);
          delete vm.mtostypeudd_data[$stateParams.mto_type_udd_id];
          vm.arrangeDisplaySequenceAfterDelete(
            vm.mtostypeudd_data,
            payload.display_sequence,
            payload.option_type_id
          );
          vm.rowsCount--;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.isProcessing = false;
          error.data.type.toLowerCase() === "dependency check" ?
            (vm.isDependent = true) :
            (vm.isDependent = false);
          vm.message = NotificationService.errorNotification(error);
        });
    };

    //on click of delete button in update form, delete confirmation panel should be shown
    vm.showconfirm = function () {
      vm.messagesList = [];
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
      vm.isShowUDDDependencyPanel = false;
    };

    //focus will be set to the first field of form
    vm.setInitialState = function () {
      common.$timeout(function () {
        angular.element("#maintenance_description").focus();
      });
    };

    vm.addSequenceValidation = typeId => {
      let obj = {};
      if ($scope.type_udd_form && $scope.type_udd_form.display_sequence) {
        $scope.type_udd_form.display_sequence.$setUntouched();
      }
      let getConstraint = valdr.getConstraints()["RULES-41"];
      let minimum = 1;
      let maximum = vm.mtostypeudd_data.filter(
        udd => Number(udd.option_type_id) === Number(typeId)
      ).length;
      if (vm.new_type_udd && vm.new_type_udd.display_sequence) {
        let msg = `Sequence must be an integer between ${minimum} and ${maximum}.`;
        getConstraint["display_sequence"] = {
          digits: {
            integer: 10,
            message: msg
          },
          min: {
            value: Number(minimum),
            message: msg
          },
          max: {
            value: Number(maximum),
            message: msg
          },
          required: {
            message: "Sequence is required !"
          }
        };
        obj["RULES-41"] = getConstraint;
      } else if (!typeId) {
        let msg = `Sequence must be greater than 0.`;
        getConstraint["display_sequence"] = {
          digits: {
            integer: 10,
            message: msg
          },
          min: {
            value: Number(minimum),
            message: msg
          }
        };
        obj["RULES-41"] = getConstraint;
      } else {
        getConstraint ? delete getConstraint.display_sequence : null;
        obj["RULES-41"] = getConstraint;
      }
      valdr.addConstraints(obj);
    };

    vm.setSuggestedSequence = () => {
      vm.new_type_udd.display_sequence = vm.mtostypeudd_data.length + 1;
    };

    //Open create new mto type udd form
    vm.openForm = function () {
      vm.showUddValueMessage = "";
      vm.new_type_udd = {};
      vm.saveBtnText = "Save";
      $state.go("common.prime.mtotypeudd.new");
      vm.setInitialState();
      vm.messagesList = [];
      vm.addSequenceValidation();
      if (
        vm.selectedDescription &&
        (vm.selectedDescription.length === 0 ||
          vm.selectedDescription.length === 1)
      ) {
        vm.setSuggestedSequence();
      }
    };

    //show create new mto type udd form on click of create another button after a new record created.
    vm.createAnotherForm = function () {
      vm.saveBtnText = "Save";
      vm.isSaveSuccess = false;
      vm.new_type_udd = {};
      //Setting Previously entered data to the new context
      vm.new_type_udd.status_id = vm.previousLT.status_id;
      vm.setInitialState();
      vm.addSequenceValidation();
      if (
        vm.selectedDescription &&
        (vm.selectedDescription.length === 0 ||
          vm.selectedDescription.length === 1)
      ) {
        vm.setSuggestedSequence();
      }
    };

    //Close form and success/error messages in the form
    vm.closeForm = function () {
      $state.go("common.prime.mtotypeudd");
      vm.message = null;
      vm.updateBtnError = false;
      vm.messagesList = [];
      common.$timeout(function () {
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
      }, 500);
    };

    vm.closeDependencyForm = () => {
      vm.isShowUDDDependencyPanel = false;
      vm.isRequired = false;
      vm.validationMessage = null;
      vm.AttributeDetail = {};
    };

    //highlight the clicked row in table
    vm.setClickedRow = function (index) {
      $scope.selectedRow = index;
    };
    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    //update table information like no of records found with/without search filter
    vm.updateTableInformation = currentPage => {
      let initalCount;
      if (!vm.rowsCount || vm.rowsCount === 0) {
        initalCount = 0;
      } else {
        initalCount = 1;
      }
      if (currentPage === 1) {
        vm.rowsInfo =
          "Displaying " +
          initalCount +
          "-" +
          (vm.rowsCount < vm.pageSize ? vm.rowsCount : vm.pageSize) +
          " Of " +
          vm.rowsCount +
          " Records";
      } else {
        var start =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          1;
        var end =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          parseInt(vm.pageSize);
        vm.rowsInfo =
          "Displaying " +
          start +
          " -" +
          (end < vm.rowsCount ? end : vm.rowsCount) +
          " Of " +
          vm.rowsCount +
          " Records";
      }
    };

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/meesage in the form will be closed.
    vm.dblClickAction = function (MTOUDD) {
      vm.messagesList = [];
      vm.isDependent = false;
      vm.showUddValueMessage = "";
      vm.message = null;
      vm.isShowUDDDependencyPanel = false;
      $state.go("common.prime.mtotypeudd.update", {
        mto_type_udd_id: MTOUDD.id
      });
      vm.isUnauthorized = false;
      vm.isShowHistory = true;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;
      vm.updateBtnText = "Update";
      vm.new_type_udd = _.clone(MTOUDD);
      vm.oldMTOUDDDetails = _.clone(MTOUDD);
      vm.attributeHierarchyModel = {};
      vm.attributeHierarchyModel.id = vm.new_type_udd.user_defined_data_id; // Binding user defined data id with selectise model id
      // if user defined data type is 'Attribute' and format is 'Value list'
      vm.attributeHierarchyValueModel = {
        value: vm.new_type_udd.default_value
      };
      // if user defined data type is 'Attribute' and format is 'Multiselect'
      vm.new_type_udd.default_value_ids = vm.new_type_udd.default_value ?
        vm.new_type_udd.default_value.split(",").map(Number) :
        [];
      vm.getUserDefinedDataValues(vm.new_type_udd, MTOUDD.user_defined_data_id);
      vm.loadRespectiveEntity(vm.new_type_udd);
      vm.setInitialState();
      vm.addSequenceValidation(MTOUDD.option_type_id);
      $scope.closeShowHistory();
    };
    vm.gotoUpdateStateIfIdExist = () => {
      if (vm.typesMap[$stateParams.mto_type_udd_id]) {
        vm.dblClickAction(vm.typesMap[$stateParams.mto_type_udd_id]);
      } else {
        vm.closeForm();
      }
    };

    /**
     * End function of hierarchy tree view select
     * Assign the id of selected hierarchy value as default value
     */
    $scope.end = function (data) {
      vm.new_type_udd.default_value = data.hierarchyValueData.id ?
        data.hierarchyValueData.id :
        "";
      vm.new_type_udd.default_value_path = data.path_name ?
        data.path_name :
        undefined;
      vm.new_type_udd.default_value_view = data.hierarchyValueData
        .short_description ?
        data.hierarchyValueData.short_description :
        "";
    };

    /*
     * for multiselect drop down for default value, change view value based on selected values
     * view value is used to save change history as well
     */
    vm.addOptionsDescriptionOnMultiselect = selectedOptions => {
      vm.new_type_udd.default_value_view = "";
      for (let i = 0; i < selectedOptions.length; i++) {
        if (vm.attributeValueIdsMap[selectedOptions[i]]) {
          vm.new_type_udd.default_value_view +=
            vm.attributeValueIdsMap[selectedOptions[i]].short_description;
        }

        if (selectedOptions.length > 1 && i !== selectedOptions.length - 1) {
          vm.new_type_udd.default_value_view += ", ";
        }
      }
    };

    /*
     * When user select User defined data i.e Attribute/Hierarchy/OptionType/Option
     * Load values and show corresponding fields in create/update form
     */
    vm.getUserDefinedDataValues = (uddDetails, userDefinedDataId) => {
      uddDetails.user_defined_data_id = userDefinedDataId;
      vm.addValidationRules();
      vm.attributeHierarchyOptionValuesArray = [];
      if (
        uddDetails &&
        uddDetails.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        if (
          vm.attributeListMap[userDefinedDataId] &&
          (vm.attributeListMap[userDefinedDataId].format.toLowerCase() ===
            "value list" ||
            vm.attributeListMap[userDefinedDataId].format.toLowerCase() ===
            "rating")
        ) {
          // if format is value list or rating type then load values for drop down
          vm.isValueList = true;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isTextField = false;
          vm.isUrlField = false;
          vm.fetchAttributeValuesByAttributeId(uddDetails);
        } else if (
          vm.attributeListMap[userDefinedDataId] &&
          vm.attributeListMap[userDefinedDataId].format.toLowerCase() ===
          "multiselect"
        ) {
          // if format is multiselect type then load values for drop down
          vm.isValueList = false;
          vm.isMultiselect = true;
          vm.isDateSelect = false;
          vm.isTextField = false;
          vm.isUrlField = false;
          vm.fetchAttributeValuesByAttributeId(uddDetails);
        } else if (
          vm.attributeListMap[userDefinedDataId] &&
          vm.attributeListMap[userDefinedDataId].format.toLowerCase() === "date"
        ) {
          // if format is date type
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = true;
          vm.isTextField = false;
          vm.isUrlField = false;
        } else if (
          vm.attributeListMap[userDefinedDataId] &&
          vm.attributeListMap[userDefinedDataId].format.toLowerCase() === "text"
        ) {
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isTextField = true;
          vm.isUrlField = false;
        } else if (
          vm.attributeListMap[userDefinedDataId] &&
          vm.attributeListMap[userDefinedDataId].format.toLowerCase() === "url"
        ) {
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isTextField = false;
          vm.isUrlField = true;
          if (vm.new_type_udd.default_value) {
            let defaultValue = vm.new_type_udd.default_value.split("::");
            vm.new_type_udd.text_default_value = defaultValue[0];
            vm.new_type_udd.url_default_value = defaultValue[1];
          }
        } else if (userDefinedDataId) {
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isTextField = false;
          vm.isUrlField = false;
        }
      } else if (
        uddDetails &&
        uddDetails.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        // if user defined data type is hierarchy then load hierarchy values
        vm.isValueList = false;
        vm.primaryHierarchyId = undefined;
        vm.isUrlField = false;
        common.$timeout(() => {
          vm.primaryHierarchyId = uddDetails.user_defined_data_id;
          vm.primaryHierarchyValueId = uddDetails.default_value ?
            uddDetails.default_value :
            undefined;
        }, 0);
      }
    };

    // get attribute values for selected attribute
    vm.fetchAttributeValuesByAttributeId = uddData => {
      if (!vm.attributeIdAndValuesMap[uddData.user_defined_data_id]) {
        vm.isReloadingList = true;
        common.EntityDetails.API.GetGraphSet(
            common.Identifiers.attribute_value,
            [
              "id",
              "status_id",
              "status",
              "short_description",
              "attribute",
              "attribute_id"
            ],
            "attribute_id",
            uddData.user_defined_data_id
          )
          .then(response => {
            // saving attribute values for attribute id in map
            vm.attributeIdAndValuesMap[uddData.user_defined_data_id] = response;
            vm.attributeHierarchyOptionValuesArray =
              vm.attributeIdAndValuesMap[uddData.user_defined_data_id];
            !vm.attributeValueIdsMap ? (vm.attributeValueIdsMap = {}) : "";
            for (let i = 0; i < response.length; i++) {
              if (vm.attributeValueIdsMap[response[i].id] === undefined) {
                vm.attributeValueIdsMap[response[i].id] = response[i];
              }
            }
            vm.initializeUserDefinedDataValuesDropdown();
          })
          .catch(error => {
            vm.isReloadingList = false;
            logger.error(error);
          });
      } else {
        vm.attributeHierarchyOptionValuesArray =
          vm.attributeIdAndValuesMap[uddData.user_defined_data_id];
        vm.initializeUserDefinedDataValuesDropdown();
      }
    };

    /*
     * Function to get default values set for udd based on user defined data type
     */
    vm.showValueforDefaultValueField = () => {
      for (let i = 0; i < vm.mtostypeudd_data.length; i++) {
        vm.fetchDefaultValueForUdd(vm.mtostypeudd_data[i]);
      }
    };

    vm.fetchDefaultValueForUdd = uddData => {
      if (
        uddData &&
        uddData.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        if (
          vm.attributeListMap &&
          vm.attributeListMap[uddData.user_defined_data_id] &&
          (vm.attributeListMap[
              uddData.user_defined_data_id
            ].format.toLowerCase() === "value list" ||
            vm.attributeListMap[
              uddData.user_defined_data_id
            ].format.toLowerCase() === "rating")
        ) {
          vm.getAttributeValueById(uddData);
        } else if (
          vm.attributeListMap[uddData.user_defined_data_id] &&
          vm.attributeListMap[
            uddData.user_defined_data_id
          ].format.toLowerCase() === "multiselect"
        ) {
          // if format is multiselectect then to get selected attribute values loop through all value ids
          let valueIds = uddData.default_value.split(",");
          uddData.default_value_view = "";
          for (let i = 0; i < valueIds.length; i++) {
            vm.getAttributeValueById(uddData, valueIds[i]);
          }
        } else if (
          vm.attributeListMap &&
          vm.attributeListMap[uddData.user_defined_data_id] &&
          vm.attributeListMap[
            uddData.user_defined_data_id
          ].format.toLowerCase() === "yes/no"
        ) {
          uddData.default_value_view =
            uddData.default_value === "1" ?
            "Yes" :
            uddData.default_value === "0" ?
            "No" :
            "";
          // send old and new default view values to save in update history
          vm.oldMTOUDDDetails && uddData.id == vm.oldMTOUDDDetails.id ?
            (vm.oldMTOUDDDetails.default_value_view =
              uddData.default_value_view) :
            "";
        }
      } else if (
        uddData &&
        uddData.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        vm.getHierarchyValueById(uddData);
      }
    };

    vm.getAttributeValueById = (uddData, valueId) => {
      // valueId: for multiselect, sending individual id from array of ids
      let attributeValueId = valueId ? valueId : uddData.default_value;
      if (attributeValueId) {
        AttributeValueFactory.FetchAttributeValueById(attributeValueId)
          .then(response => {
            if (valueId && uddData.default_value_view) {
              // if mulitselect then join values
              uddData.default_value_view +=
                ", " + response.data.short_description;
            } else {
              uddData.default_value_view = response.data.short_description;
            }
            // send old and new default view values to save in update history
            vm.oldMTOUDDDetails && uddData.id == vm.oldMTOUDDDetails.id ?
              (vm.oldMTOUDDDetails.default_value_view =
                uddData.default_value_view) :
              "";
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.getHierarchyValueById = uddData => {
      if (uddData.default_value) {
        HierarchyValueService.API.GetHierarchyValueById(uddData.default_value)
          .then(response => {
            uddData.default_value_view = response.short_description;
            // send old and new default view values to save in update history
            vm.oldMTOUDDDetails && uddData.id == vm.oldMTOUDDDetails.id ?
              (vm.oldMTOUDDDetails.default_value_view =
                uddData.default_value_view) :
              "";
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.initializeUserDefinedDataValuesDropdown = () => {
      vm.isReloadingList = false;
      // Initialising object for Selcetise dropdown
      vm.selectAttributeHierarchyValue = {
        valueField: "id",
        labelField: "short_description",
        searchField: ["short_description"],
        sortField: "short_description",
        placeholder: "Select value",
        allowEmptyOption: true,
        create: false,
        hideSelected: true,
        highlight: false,
        searchConjunction: "or",
        render: {
          option: (data, escape) => {
            if (data.status_id === vm.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.short_description) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            } else {
              return (
                '<div class="p-5">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.short_description) +
                "</span>" +
                "</span>" +
                "<span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          item: function (data, escape) {
            vm.new_type_udd.default_value_view = data.short_description;
            return (
              '<span class="c-black f-13"> ' +
              escape(data.short_description) +
              "</span>"
            );
          }
        }
      };
    };

    // get hierarchy values for selected hierarchy
    vm.fetchHierarchyValuesByHierarchyId = uddData => {
      if (!vm.hierarchyIdAndValuesMap[uddData.user_defined_data_id]) {
        common.EntityDetails.API.GetGraphSet(
            common.Identifiers.hierarchy_values,
            [
              "id",
              "status_id",
              "status",
              "short_description",
              "hierarchy",
              "hierarchy_id",
              "tree_path"
            ],
            "hierarchy_id",
            uddData.user_defined_data_id
          )
          .then(response => {
            vm.hierarchyIdAndValuesMap[uddData.user_defined_data_id] = response;
            for (let i = 0; i < response.length; i++) {
              if (vm.hierarachyValueIdsMapList[response[i].id] === undefined) {
                vm.hierarachyValueIdsMapList[response[i].id] = response[i];
              }
            }
            vm.createHierarchyValuePath(uddData);
          })
          .catch(error => {
            vm.isReloadingList = false;
            logger.error(error);
          });
      } else {
        vm.createHierarchyValuePath(uddData);
      }
    };

    vm.createHierarchyValuePath = uddData => {
      let values;
      if (uddData.default_value) {
        // create path of hierarchy values description
        values =
          vm.hierarachyValueIdsMapList[uddData.default_value].tree_path !== null ?
          vm.hierarachyValueIdsMapList[
            uddData.default_value
          ].tree_path.split(">") :
          [
            vm.hierarachyValueIdsMapList[uddData.default_value]
            .short_description
          ];
        values.push(uddData.default_value);
        let pathList = [];

        for (let i = 0; i < values.length; i++) {
          if (vm.hierarachyValueIdsMapList[values[i]]) {
            pathList.push(
              vm.hierarachyValueIdsMapList[values[i]].short_description
            );
          }
        }
        uddData.default_value_path = pathList.join(
          '<span class="p-l-5 p-r-5 c-red zmdi zmdi-long-arrow-right arrow-style"></span>'
        );
      }
    };

    /* If user defined data type is 'Attribute' then add validation rules based on selected attribute and its format */
    vm.addValidationRules = () => {
      let obj = {};
      if ($scope.type_udd_form && $scope.type_udd_form.default_value) {
        $scope.type_udd_form.default_value.$setUntouched();
      }
      let getConstraint = valdr.getConstraints()["RULES-41"];
      if (
        vm.new_type_udd &&
        vm.new_type_udd.user_defined_data_id &&
        vm.new_type_udd.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        // If user defined data type is 'Attribute' then only add validations
        let minimum =
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id]
          .attribute_from_value;
        let maximum =
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id]
          .attribute_to_value;
        if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "integer"
        ) {
          let msg = `Default value must be an integer between ${minimum} and ${maximum}.`;
          // If user defined data type is 'Attribute' and format is 'Integer'
          getConstraint["default_value"] = {
            digits: {
              integer: 10,
              message: msg
            },
            min: {
              value: Number(minimum),
              message: msg
            },
            max: {
              value: Number(maximum),
              message: msg
            }
          };
          obj["RULES-41"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          (vm.attributeListMap[
              vm.new_type_udd.user_defined_data_id
            ].format.toLowerCase() === "decimal" ||
            vm.attributeListMap[
              vm.new_type_udd.user_defined_data_id
            ].format.toLowerCase() === "percentage")
        ) {
          let msg = `Default value must be decimal between ${minimum} and ${maximum}.`;
          // If user defined data type is 'Attribute' and format is 'Decimal' or 'Percentage'
          let format = vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase();
          getConstraint["default_value"] = {
            digits: {
              integer: 10,
              fraction: 10,
              message: msg
            },
            min: {
              value: format === "percentage" && minimum.endsWith("%") ?
                minimum.substring(0, minimum.length - 1) :
                parseFloat(minimum),
              message: msg
            },
            max: {
              value: format === "percentage" && maximum.endsWith("%") ?
                maximum.substring(0, maximum.length - 1) :
                parseFloat(maximum),
              message: msg
            }
          };
          obj["RULES-41"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "dimension"
        ) {
          let msg = `Default value must be a number between ${minimum} and ${maximum} with upto 8 decimal digits.`;
          // If user defined data type is 'Attribute' and format is 'Dimension'
          getConstraint["default_value"] = {
            digits: {
              integer: 10,
              fraction: 8,
              message: msg
            },
            min: {
              value: Number(minimum),
              message: msg
            },
            max: {
              value: Number(maximum),
              message: msg
            }
          };
          obj["RULES-41"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "date"
        ) {
          // If user defined data type is 'Attribute' and format is 'Dimension'
          getConstraint["default_value"] = {
            startAndEndDateCompare: {
              sval: minimum,
              eval: maximum,
              message: `Defualt value must be between ${moment(minimum).format(
                $scope.date_format
              )} and ${moment(maximum).format($scope.date_format)}`
            }
          };
          obj["RULES-41"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "text"
        ) {
          let msg = `Default value must be text between ${minimum} and ${maximum} characters.`;
          // If user defined data type is 'Attribute' and format is 'Text'
          getConstraint["default_value"] = {
            minLength: {
              number: Number(minimum),
              message: msg
            },
            maxLength: {
              number: Number(maximum),
              message: msg
            }
          };
          obj["RULES-41"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "url"
        ) {
          getConstraint["url_default_value"] = {};
          // If user defined data type is 'Attribute' and format is 'Text'
          getConstraint["url_default_value"]["pattern"] = {
            value: /^((http|https):\/\/)?(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/,
            message: "Default URL should be valid."
          };
          obj["RULES-41"] = getConstraint;
        } else {
          delete getConstraint.default_value;
          obj["RULES-41"] = getConstraint;
        }
      } else {
        // If user defined data type is not 'Attribute' then remove validations
        delete getConstraint.default_value;
        obj["RULES-41"] = getConstraint;
      }

      valdr.addConstraints(obj);
    };

    /* Function to reset selected default value */
    vm.resetDefaultValue = uddData => {
      uddData.default_value = "";
      uddData.default_value_view = "";
      uddData.text_default_value = "";
      uddData.url_default_value = "";
      vm.attributeHierarchyValueModel = {
        value: ""
      };
      uddData.default_value_ids = [];
      if (
        uddData &&
        uddData.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        vm.isResetValue = true;
        vm.primaryHierarchyValueId = undefined;
        common.$timeout(() => {
          vm.isResetValue = false;
        }, 0);
      }
    };

    //shows all update history for selected record
    $scope.loadHistory = function () {
      $scope.showhistoryloading = true; // Loading history until get the response
      common.EntityDetails.API.GetHistoryData(
          vm.entityInformation.uuid,
          vm.new_type_udd.id
        )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
          $scope.showhistoryloading = false;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // close the show update history panel
    $scope.closeShowHistory = function () {
      common.$timeout(function() {
      angular.element("#maintenance_description").focus();
    },0);
      $scope.showhistory = false;
      $scope.showhistoryloading = false;
    };

    activate();

    function activate() {
      vm.initializeMTOUDD();
      $scope.reloadMethodDisplayValues = vm.reload;
      $scope.setClickedRow = vm.setClickedRow;
      $scope.dblClickAction = vm.dblClickAction;
    }
  }
})();