(() => {
  "use strict";

  angular
    .module("rc.prime.item.type.udd")
    .controller("ItemTypeUDDController", ItemTypeUDDController);
  ItemTypeUDDController.$inject = [
    "$scope",
    "$stateParams",
    "$q",
    "common",
    "AttributeService",
    "CodeService",
    "EntityService",
    "HierarchyService",
    "HierarchyValuesTreePathService",
    "ItemTypeService",
    "ItemUDDService",
    "MTOTypeService",
    "ItemService",
    "MTOService",
    "MTOChoiceService",
    "HierarchyValueService",
    "AttributeValueService",
    "AttributeValueFactory",
    "StatusCodes",
    "valdr",
    "GlobalRegularExpression"
  ];

  function ItemTypeUDDController(
    $scope,
    $stateParams,
    $q,
    common,
    AttributeService,
    CodeService,
    EntityService,
    HierarchyService,
    HierarchyValuesTreePathService,
    ItemTypeService,
    ItemUDDService,
    MTOTypeService,
    ItemService,
    MTOService,
    MTOChoiceService,
    HierarchyValueService,
    AttributeValueService,
    AttributeValueFactory,
    StatusCodes,
    valdr,
    GlobalRegularExpression
  ) {
    var vm = this;
    let $timeout = common.$timeout;
    let $filter = common.$filter;
    let $state = common.$state;
    let logger = common.Logger.getInstance("ItemTypeUDDController");
    let NotificationService = common.Notification;
    vm.common = common;
    vm.$stateParams = $stateParams;
    vm.statusCodes = StatusCodes;
    vm.globalRegularExpression = GlobalRegularExpression;

    vm.uuid = "32";
    vm.uddtypes = [];
    vm.itemudd_data = [];
    vm.entityInformation = {};
    vm.item_master_info = {};
    vm.enableGoToAllTypeUDD = false;
    vm.isColumnSettingsVisible = false;
    vm.entry_level = {};
    vm.allEntryLevelUdd = {};
    vm.showSignificantFlag = false; // variable to indicate that significant is checked
    vm.isDependent = false;

    //variables used in create/update/delete forms
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;

    vm.isBtnEnable = true;
    //Enable the yes, update button in the dependency panel
    vm.isUpdateBtnEnable = true;
    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;
    vm.isValidationProcessing = false;
    vm.message = null;
    vm.isShowHistory = false;
    vm.isItemDependent = false;
    vm.isReassignValues = false;
   // vm.copyItemToSKU = false;
    vm.attributeListMap = {};
    vm.hierarchyListMap = {};
    vm.isAllowMTO = true;
    vm.isVisibilityOptionsChanged = false;

    //pagination and sorting variables
    vm.sortType = "pe_filter_priority";
    vm.currentPage = 1;
    vm.pageSize = 100;

    vm.fromValues = [{
      field: "Current Date",
      value: "current"
    },
    {
      field: "None",
      value: "none"
    }];
    //Set Grid Properties for hide and show Item Type UDD table columns
    vm.setGridProperties = () => {
      vm.itemTypeUDDGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          itemType: {
            visible: false
          },
          uddType: {
            visible: true
          },
          uddName: {
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
          group_header: {
            visible: true
          },
          entryLevel: {
            visible: true
          },
          entry_type: {
            visible: true
          },
          required: {
            visible: true
          },
          filterPriority: {
            visible: true
          },
          visibility: {
            visible: false
          },
          inItemTypeReport: {
            visible: true
          },
          inMercuryReport: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    //variables used to map data by user defined data type(attribute/hirarchy)
    vm.attributeListDropDown = {};
    vm.hierarchyListDropDown = {};
    vm.optionListDropDown = [];
    vm.optionsDropDown = [];
    vm.hierarchyListMap = {};
    vm.itemUddMap = {};
    vm.itemTypeMap = {};
    vm.statusMap = {};

    // variables used to map values for parent udd id
    vm.attributeIdAndValuesMap = {};
    vm.optionIdAndChoicesMap = {};
    vm.optionTypeIdAndOptionsMap = {};
    vm.hierarchyIdAndValuesMap = {};
    vm.hierarachyValueIdsMapList = {};

    vm.attributeHierarchyModel = {};
    vm.attributeHierarchyoption = {};
    vm.attributeHierarchyoptionArray = [];

    // Initialising object for Selcetise dropdown
    $scope.selectAttributeHierarchy = {
      valueField: "id",
      labelField: "short_description",
      searchField: ["short_description"],
      sortField: "short_description",
      //placeholder: 'Select Attribute, Select Hierarchy, Select Option Type, Select Option',
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
        item: (data, escape) => {
          vm.new_type_udd.attribute_or_hierarchy = data.short_description;
          return (
            '<span class="c-black f-13"> ' +
            escape(data.short_description) +
            "</span>"
          );
        }
      }
    };

    //Initialize item type udd module
    vm.initializeItemUDD = () => {
      vm.getEntityInformation();
      vm.getUddVisibilityOptions();
      vm.getModelAndSetValidationRules();
      vm.getItemTypeById();
      vm.getGroupHeadersList();
      $scope.getAccessPermissions(vm.uuid);
      let promise = vm.reload();
      vm.loadCodeListData(
        vm.uuid,
        "Entry Level",
        "allEntryLevelUdd",
        common.$q
      );
      vm.loadCodeListData(
        vm.uuid,
        "Entry Type",
        "allEntryTypes",
        common.$q
      ); // Loading for Entry Types
      vm.loadCodeListData(
        common.Identifiers.system_level,
        "UDD Required",
        "allRequired",
        common.$q
      ); // Loading for All Required
      vm.getItemMasterInfoAndSetTypes();
      promise.then(res => {
        $stateParams.item_type_udd_id &&
          $state.current.name.includes("itemtypeudd.update")
          ? vm.gotoUpdateStateIfIdExist()
          : "";
      });
    };

    vm.getGroupHeadersList = () => {
      ItemUDDService.API.FetchGroupHeaders()
        .then(response => {
          vm.allGroupHeaders = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getItemTypeById = () => {
      if ($stateParams.item_type_id.split(",").length === 1) {
        ItemTypeService.API.getItemTypesById($stateParams.item_type_id)
          .then(response => {
            vm.itemTypeDetails = response[0];
            response[0].allow_MTOs_id
              ? (vm.isAllowMTO = true)
              : (vm.isAllowMTO = false);
          })
          .catch(error => { });
      }
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
          "is_important",
          "dimension_class",
          "dimension_unit",
          "format_id"
        ],

        "entity_id",
        vm.item_master_info.id
      )
        .then(res => {
          vm.attributeListDropDown = res;
          vm.AttributeListMap(res);
          //if current state is update udd state, then for selected user defined data type load values in drop down
          $state.current.name.includes(".update") &&
            vm.new_type_udd &&
            vm.new_type_udd.user_defined_data_type.toLowerCase() === "attribute"
            ? vm.loadRespectiveEntity(vm.new_type_udd)
            : null;
        })
        .catch(err => logger.error(err));
    };

    vm.AttributeListMap = listData => {
      for (let i = 0; listData.length && i < listData.length; i++) {
        if (vm.attributeListMap[listData[i].id] === undefined) {
          vm.attributeListMap[listData[i].id] = listData[i];
        }
      }
      if (vm.itemudd_data && vm.itemudd_data.length) {
        vm.showValueforDefaultValueField();
      }
      $state.current.name.includes(".update") &&
        vm.new_type_udd
        ? vm.dblClickAction(vm.new_type_udd)
        : null;
    };

    //Get list of hierarchies which are not part of special hierarchy and linked to item entity
    vm.getHierarchyList = () => {
      let searchCondition = {
        is_primary_item_hierarchy_id: 0,
        is_product_explorer_hierarchy_id: 0,
        is_buyer_hierarchy_id: 0,
        entity_id: vm.item_master_info.id
      };
      //API call to search hierarchies
      HierarchyService.API.MultiSearchHierarchy(searchCondition)
        .then(response => {
          vm.hierarchyListDropDown = response;
          vm.HierarchyListMap(response);
          //if current state is update udd state, then for selected user defined data type load values in drop down
          $state.current.name.includes(".update") &&
            vm.new_type_udd &&
            vm.new_type_udd.user_defined_data_type.toLowerCase() === "hierarchy"
            ? vm.loadRespectiveEntity(vm.new_type_udd)
            : null;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.HierarchyListMap = listData => {
      for (let i = 0; i < listData.length; i++) {
        if (vm.hierarchyListMap[i] === undefined) {
          vm.hierarchyListMap[listData[i].id] = listData[i];
        }
      }
    };

    //Get list of MTO option types with only required fields
    vm.getMTOTypeList = () => {
      common.EntityDetails.API.GetGraphSet(common.Identifiers.mto_type, [
        "id",
        "status",
        "status_id",
        "short_description"
      ])
        .then(res => {
          vm.optionListDropDown = res;
          //if current state is update udd state, then for selected user defined data type load values in drop down
          $state.current.name.includes(".update") &&
            vm.new_type_udd &&
            vm.new_type_udd.user_defined_data_type.toLowerCase() === "optiontype"
            ? vm.loadRespectiveEntity(vm.new_type_udd)
            : null;
        })
        .catch(err => logger.error(err));
    };

    //Get list of MTO options with only required fields
    vm.getMTOOptionsList = uddData => {
      let field =
        uddData && uddData.user_defined_data_id ? "type_id" : undefined;
      let value =
        uddData && uddData.user_defined_data_id
          ? uddData.user_defined_data_id
          : undefined;
      if (
        !uddData ||
        !vm.optionTypeIdAndOptionsMap[uddData.user_defined_data_id]
      ) {
        vm.isReloadingList = true;
        common.EntityDetails.API.GetGraphSet(
          common.Identifiers.mto_option,
          ["id", "status_id", "status", "description"],
          field,
          value
        )
          .then(res => {
            for (var i = 0; i < res.length; i++) {
              vm.optionsDropDown.push({
                id: res[i]["id"],
                short_description: res[i]["description"]
              });
            }

            if (uddData) {
              // saving options for type id in map
              vm.optionTypeIdAndOptionsMap[uddData.user_defined_data_id] =
                vm.optionsDropDown;
              vm.attributeHierarchyOptionValuesArray =
                vm.optionTypeIdAndOptionsMap[uddData.user_defined_data_id];
              vm.initializeUserDefinedDataValuesDropdown();
            } else {
              //if current state is update udd state, then for selected user defined data type load values in drop down
              $state.current.name.includes(".update") &&
                vm.new_type_udd &&
                vm.new_type_udd.user_defined_data_type.toLowerCase() === "option"
                ? vm.loadRespectiveEntity(vm.new_type_udd)
                : null;
              vm.isReloadingList = false;
            }
          })
          .catch(err => {
            vm.isReloadingList = false;
            logger.error(err);
          });
      } else {
        vm.attributeHierarchyOptionValuesArray =
          vm.optionTypeIdAndOptionsMap[uddData.user_defined_data_id];
        vm.initializeUserDefinedDataValuesDropdown();
      }
    };

    //Get list of MTO option choice with only required fields
    vm.getOptionChoiceList = uddData => {
      let field =
        uddData && uddData.user_defined_data_id ? "option_id" : undefined;
      let value =
        uddData && uddData.user_defined_data_id
          ? uddData.user_defined_data_id
          : undefined;
      vm.isReloadingList = true;
      if (!vm.optionIdAndChoicesMap[uddData.user_defined_data_id]) {
        common.EntityDetails.API.GetGraphSet(
          common.Identifiers.mto_choice,
          ["id", "status_id", "status", "choice_description"],
          field,
          value
        )
          .then(response => {
            let optionChoicesDropDown = [];
            for (var i = 0; i < response.length; i++) {
              optionChoicesDropDown.push({
                id: response[i]["id"],
                short_description: response[i]["choice_description"],
                status: response[i].status,
                status_id: response[i].status_id
              });
            }
            // saving choices for option id in map
            vm.optionIdAndChoicesMap[
              uddData.user_defined_data_id
            ] = optionChoicesDropDown;
            vm.attributeHierarchyOptionValuesArray =
              vm.optionIdAndChoicesMap[uddData.user_defined_data_id];
            vm.initializeUserDefinedDataValuesDropdown();
          })
          .catch(err => {
            vm.isReloadingList = false;
            logger.error(err);
          });
      } else {
        vm.attributeHierarchyOptionValuesArray =
          vm.optionIdAndChoicesMap[uddData.user_defined_data_id];
        vm.initializeUserDefinedDataValuesDropdown();
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

    // get attribute values for selected attribute
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
          vm.hierarachyValueIdsMapList[uddData.default_value].tree_path !== null
            ? vm.hierarachyValueIdsMapList[
              uddData.default_value
            ].tree_path.split(">")
            : [
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

    //generic function to get data for drop down from code list table
    vm.loadCodeListData = (uuid, fieldName, model, $q) => {
      var defer = $q.defer();
      CodeService.API.MultiSearchCodeList({
        uuid: uuid,
        field_name: fieldName
      })
        .then(response => {
          $scope[model] = response;
          vm[model] = response;
          defer.resolve(response);
        })
        .catch(error => defer.reject(error));
      return defer.promise;
    };

    //get product explorer hierarchy id and primary item hierarchy id
    vm.setProductExplorerIdAndPrimaryItemId = () => {
      HierarchyService.API.SearchHierarchy(
        "is_product_explorer_hierarchy_id",
        1
      )
        .then(res => {
          HierarchyService.API.SearchHierarchy(
            "is_primary_item_hierarchy_id",
            1
          )
            .then(prim_res => {
              $scope.product_explorer_id = res[0].id;
              $scope.primary_item_id = prim_res[0].id;
            })
            .catch(err => { });
        })
        .catch(err => logger.error(err));
    };

    //get attributes, hierarchies, mtp option types and options. Create data map.
    vm.createTypeListMap = () => {
      vm.getAttributeList();
      vm.getHierarchyList();
      vm.getMTOTypeList();
      vm.getMTOOptionsList();
      vm.setProductExplorerIdAndPrimaryItemId();
    };

    //toggle Hide/Show Columns panel
    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //Get information required for item type udd entity, statically stored in application.context.js file
    vm.getEntityInformation = () => {
      common.EntityDetails.API.GetEntityInformation(vm.uuid).then(
        lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.item);
        }
      );
    };

    //get validation rules for mto type by uuid and set rules using valdr in application.context.js
    vm.getModelAndSetValidationRules = () => {
      common.EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => { });
    };

    //get Item master entity information from entity data in local memory
    vm.getItemMasterInfoAndSetTypes = () => {
      let entityData = JSON.parse(common.LocalMemory.API.Get("entity_data"));
      for (let i = 0; i < entityData.length; i++) {
        if (entityData[i].uuid === common.Identifiers.item) {
          vm.item_master_info = entityData[i];
          vm.createTypeListMap();
        }
      }
    };

    /**
     * @param {Boolean} refresh true/false
     * @description On page load or on "Refresh" button click this will be called.
     * If refresh value is true the message with record number, response time take will be shown in UI
     */
    vm.reload = refresh => {
      vm.typeLimit = 10;
      vm.setGridProperties(); // Calling set grid properties on reload.
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      vm.isLoaded = false;
      $scope.selectedIDs = $stateParams.item_type_id.split(",");
      let data = ItemUDDService.API.GetItemUDDByLOV(
        "type_id",
        $scope.selectedIDs
      )
        .then(response => {
          // filter data based on pe_filter_priority and maintenance_description
          response.data = $filter("orderBy")(response.data, [
            "item_type_name",
            "pe_filter_priority",
            "maintenance_description"
          ]);
          vm.rowsCount = response.data.length;
          vm.itemudd_data = response.data;
          vm.originalItemuddData = angular.copy(vm.itemudd_data);
          vm.createUddsMap(response.data);
          $scope.refreshed = true;
          vm.enableGoToAllTypeUDD = false;
          vm.selectedDescription = vm.itemudd_data
            .map(e => e["type_id"])
            .map((e, i, final) => final.indexOf(e) === i && i)
            .filter(e => vm.itemudd_data[e])
            .map(e => vm.itemudd_data[e]);
          if (vm.selectedDescription.length > 1) {
            vm.itemTypeUDDGrid.columns.itemType.visible = true;
            vm.sortType = "item_type_path_search";
          }
          _.each(response.data, itemUdd => {
            vm.itemUddMap[itemUdd.user_defined_data_id] = itemUdd;
            vm.itemTypeMap[itemUdd.type_id] = itemUdd;
          });
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
          Object.keys(vm.attributeListMap).length > 0
            ? vm.showValueforDefaultValueField()
            : "";
          vm.updateTableInformation(1); // on load update table records information
          vm.FetchHierarchyValuesMappedById();
          return response.data;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true;
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

    vm.FetchHierarchyValuesMappedById = () => {
      HierarchyValuesTreePathService.getMap().then(
        map => {
          vm.hierarachyValuesMap = map;
          for (let i = 0; i < $scope.selectedIDs.length; i++) {
            if (vm.itemTypeMap[$scope.selectedIDs[i]]) {
              let itemTypePath = vm.getTreePath(
                vm.itemTypeMap[$scope.selectedIDs[i]].item_type_id,
                vm.itemTypeMap[$scope.selectedIDs[i]].tree_path
              );
              vm.itemTypeMap[
                $scope.selectedIDs[i]
              ].item_type_path = itemTypePath.join(
                '<span class="p-l-5 p-r-5 c-red zmdi zmdi-long-arrow-right arrow-style"></span>'
              );
              vm.itemTypeMap[
                $scope.selectedIDs[i]
              ].item_type_path_search = itemTypePath.join(" ");
            }
          }
          for (let i = 0; i < vm.itemudd_data.length; i++) {
            vm.itemudd_data[i].item_type_path_search =
              vm.itemTypeMap[vm.itemudd_data[i].type_id].item_type_path_search;
          }
          vm.itemudd_data = $filter("orderBy")(vm.itemudd_data, [
            "item_type_path_search",
            "pe_filter_priority",
            "maintenance_description"
          ]);
          vm.isLoaded = true;
        },
        error => {
          logger.error(error);
          vm.isLoaded = true;
        }
      );
    };

    vm.getTreePath = (actualHierValId, path) => {
      let trimres = [];
      let tempVar = HierarchyValuesTreePathService.getTreePath(
        vm.hierarachyValuesMap,
        actualHierValId,
        path
      );
      let res = tempVar.split(">");
      if (res.length >= 5) {
        trimres[0] = res[0];
        trimres[1] = res[1];
        trimres[2] = "...";
        trimres[3] = res[res.length - 2];
        trimres[4] = res[res.length - 1];
        return trimres;
      } else {
        return res;
      }
    };

    //mapping all data into key-value pair
    vm.createUddsMap = list => {
      vm.typeUddsMap = [];
      for (let i = 0; i < list.length; i++) {
        let vt = list[i];
        if (vm.typeUddsMap[vt.id] === undefined) {
          vm.typeUddsMap[vt.id] = vt;
        }
      }
    };

    //set entry level drop down values based on selected user defined data type in form
    vm.set_entry_level = user_defined_data_type => {
      if (
        !vm.itemTypeDetails ||
        (vm.itemTypeDetails && vm.itemTypeDetails.allow_collection_id)
      ) {
        // if allow collection flag is true for item type
        if (
          user_defined_data_type &&
          user_defined_data_type.toLowerCase() === "optiontype"
        ) {
          vm.entry_levels = _.filter($scope.allEntryLevelUdd, entry_level => {
            if (entry_level.code.toLowerCase() !== "sku") {
              return entry_level;
            }
          });
        } else {
          vm.entry_levels = $scope.allEntryLevelUdd;
        }
      } else {
        vm.entry_levels = _.filter($scope.allEntryLevelUdd, entry_level => {
          if (
            !vm.itemTypeDetails.allow_collection_id &&
            entry_level.code.toLowerCase() !== "collection"
          ) {
            return entry_level;
          }
        });
      }
      vm.allEntryLevelUdd = vm.entry_levels;
    };

    //check if selected attribute is significant
    vm.isImportantUDD = (uddId, type) => {
      if (type === "Attribute") {
        AttributeService.API.GetAttributeById(uddId)
          .then(data => {
            vm.new_type_udd.is_important = data["is_important"];
          })
          .catch(error => { });
      }
    };

    //Load data based on selected user defined data in create/update form
    vm.loadRespectiveEntity = selectedUDDRecord => {
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
      } else if (
        selectedUDDRecord &&
        selectedUDDRecord.user_defined_data_type.toLowerCase() === "optiontype"
      ) {
        vm.attributeHierarchyoptionArray = vm.optionListDropDown; //OptionType drop down list has been assigned to an array which used in dropdown list for selectise
        $scope.selectAttributeHierarchy.placeholder = "Select OptionType"; //Assigning the placeholder based on the user defined data type selected.
        $timeout(() => {
          vm.loadedselecize = true;
        }, 0);
      } else if (
        selectedUDDRecord &&
        selectedUDDRecord.user_defined_data_type.toLowerCase() === "option"
      ) {
        vm.attributeHierarchyoptionArray = vm.optionsDropDown; //Option drop down list has been assigned to an array which used in dropdown list for selectise
        $scope.selectAttributeHierarchy.placeholder = "Select Option"; //Assigning the placeholder based on the user defined data type selected.
        $timeout(() => {
          vm.loadedselecize = true;
        }, 0);
      }

      vm.typeIdsMap = {};

      //check if all selected type ids are present in map, if not then push type id to map
      for (let i = 0; i < $scope.selectedIDs.length; i++) {
        if (vm.typeIdsMap[parseInt($scope.selectedIDs[i])] === undefined) {
          vm.typeIdsMap[parseInt($scope.selectedIDs[i])] = {
            item_type_name: "",
            allow_MTOs: "",
            attributeIds: [],
            hierarchyIds: [],
            optionIds: [],
            optiontypeIds: []
          };
        }
      }

      ///creating map with item type id as key and item type name and user defined data id as value Iterating through udds for selected item type ids.
      for (let i = 0; i < vm.itemudd_data.length; i++) {
        let udd = vm.itemudd_data[i];
        //this will add user defined data id to the corresponding array and item type name for every item type id.
        if (
          vm.typeIdsMap[udd.type_id] &&
          vm.typeIdsMap[udd.type_id]["item_type_name"] == "" &&
          !vm.typeIdsMap[udd.type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].includes(udd.user_defined_data_id)
        ) {
          vm.typeIdsMap[udd.type_id]["item_type_name"] = udd.item_type_name;
          vm.typeIdsMap[udd.type_id]["allow_MTOs"] = udd.allow_MTOs;
          vm.typeIdsMap[udd.type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].push(udd.user_defined_data_id);
        } else if (
          vm.typeIdsMap[udd.type_id] &&
          !vm.typeIdsMap[udd.type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].includes(udd.user_defined_data_id)
        ) {
          vm.typeIdsMap[udd.type_id][
            udd.user_defined_data_type.toLowerCase() + "Ids"
          ].push(udd.user_defined_data_id);
        }
      }
    };

    /////// save, update,delete implementation

    //save user defined data for all selected item type ids
    vm.saveUDD = payload => {
      vm.messagesList = [];
      var deferred = common.$q.defer();
      ItemUDDService.API.InsertItemUDD(payload)
        .then(response => {
          payload.id = response.data.data[0].id;
          vm.checkUpdateDefaultValueOptions(payload, false);
          vm.previousLT = payload;
          vm.saveBtnText = "Done";
          vm.isDefaultValueUpdated = false;
          vm.isSaveSuccess = true;
          vm.isBtnEnable = true;
          vm.reload();
          deferred.resolve("Success");
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (!error.data.flag) {
            vm.message = NotificationService.errorNotification(error);
          }

          if (error.data.flag && error.data.flag.udd_exists) {
            //if record with selected user defined data type value and item type id is already exist then notify user
            vm.messagesList.push({
              exists: true,
              uddType: payload.user_defined_data_type.toLowerCase(),
              itemType: vm.typeIdsMap[payload.type_id].item_type_name,
              maintenanceDescription: payload.maintenance_description,
              attribute_or_hierarchy: payload.attribute_or_hierarchy
            });
            if (vm.messagesList.length > 0) {
              vm.isDefaultValueUpdated = false;
            }
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          common.$timeout(() => {
            vm.isBtnEnable = true;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
            vm.message = null;
          }, 2500);
        });
      // The promise of the deferred task
      return deferred.promise;
    };

    function prepareData(payload) {
      if (payload.is_important === null || payload.is_important === undefined) {
        payload.is_important = 0;
      }
    }

    vm.save = (payload, isConfirmDefaultValueChange) => {
      let promises = [];
      vm.messagesList = [];
      let typeIds = [];
      let isDateRange = false;
      prepareData(payload);
      payload.user_defined_data_id = parseInt(vm.attributeHierarchyModel.id);
      if (
        payload.default_value_ids &&
        payload.user_defined_data_type.toLowerCase() === "attribute" &&
        vm.attributeListMap[
          payload.user_defined_data_id
        ].format.toLowerCase() === "multiselect"
      ) {
        payload.default_value = payload.default_value_ids.join(",");
      } else if (
        payload.user_defined_data_type &&
        payload.user_defined_data_type.toLowerCase() === "attribute" &&
        vm.attributeListMap[
          payload.user_defined_data_id
        ].format.toLowerCase() === "date range"
      ) {
        isDateRange = true;
        let toValue = payload.default_value_to ? `,${payload.default_value_to}` : '';
        payload.default_value = `${payload.default_value_from}${toValue}`;
      } else {
        payload.default_value = !payload.default_value
          ? vm.attributeHierarchyValueModel.value
          : payload.default_value;
      }

      if (payload.default_value && isConfirmDefaultValueChange !== true) {
        vm.isDefaultValueUpdated = true;
      }

      if (isConfirmDefaultValueChange || !payload.default_value || (isDateRange && payload.default_value === "none")) {
        vm.isBtnEnable = false;
        vm.saveBtnText = "Saving now...";
        //iterate over all selected item type ids to create used defined data for those ids
        //if record with selected user defined data type value and item type id is does not exist then only allowed to create
        _.each($scope.selectedIDs, id => {
          payload.type_id = id;
          if (
            !vm.typeIdsMap[id][
              payload.user_defined_data_type.toLowerCase() + "Ids"
            ].includes(payload.user_defined_data_id) &&
            !(
              vm.typeIdsMap[id].allow_MTOs === 0 &&
              (payload.user_defined_data_type.toLowerCase() === "option" ||
                payload.user_defined_data_type.toLowerCase() === "optiontype")
            )
          ) {
            let newPayload = _.extend({}, payload); //prepare payload
            newPayload.type_id = parseInt(id);
            typeIds.push(parseInt(id));
          } else if (
            vm.typeIdsMap[id].allow_MTOs === 0 &&
            (payload.user_defined_data_type.toLowerCase() === "option" ||
              payload.user_defined_data_type.toLowerCase() === "optiontype")
          ) {
            vm.messagesList.push({
              exists: true,
              message: `Item Type - ${vm.typeIdsMap[id].item_type_name} does not allow Option/Option Type UDD. Change allow MTOs flag to true to add options/option types.`
            });
          } else {
            //if record with selected user defined data type value and item type id is already exist then notify user
            vm.messagesList.push({
              exists: true,
              uddType: payload.user_defined_data_type.toLowerCase(),
              itemType: vm.typeIdsMap[id].item_type_name,
              maintenanceDescription: payload.maintenance_description,
              attribute_or_hierarchy: payload.attribute_or_hierarchy
            });
          }
        });

        if (vm.messagesList.length > 0) {
          vm.isDefaultValueUpdated = false;
        }
        if (typeIds.length > 0) {
          payload.type_ids = typeIds;
          vm.saveUDD(payload);
        } else {
          vm.isBtnEnable = false;
          vm.saveBtnText = "Oops.!! Something went wrong";
          common.$timeout(() => {
            vm.saveBtnText = "Save";
            vm.isBtnEnable = true;
            vm.saveBtnError = false;
            vm.isSaveSuccess = false;
            vm.setInitialState();
          }, 3000);
        }
      }
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
            $scope.disableIds = [];
            for(let i=0;i<response.data.length;i++) {
              if(response.data[0].hierarchy_id == 514) {
                if(response.data[i].level == 1) {
                  $scope.disableIds.push(response.data[i].id);
                }
              }

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

    vm.disableDepartmentLevelHierarchies = (attributeHierachyId) => {
      HierarchyValueService.API.GetHierarchyValueByHierarchyId(
        attributeHierachyId
      ).then(response => {
        $scope.disableIds = [];
        if(response.data[0].hierarchy_id == 514) {
          for(let i=0;i<response.data.length;i++) {
            if(response.data[i].level == 1) {
              $scope.disableIds.push(response.data[i].id);
            }
          }
        }
      });
    }

    vm.checkForIsSignificant = attributeId => {
      if (attributeId && vm.attributeListMap[attributeId]) {
        vm.new_type_udd.is_important =
          vm.attributeListMap[attributeId].is_important;
      }
    };

    //comapres if old form data is same as current payload. If yes returns false.
    vm.hasUpdateChanges = payload => {
      if (
        vm.oldItemUDDDetails.maintenance_description !==
        payload.maintenance_description ||
        vm.oldItemUDDDetails.status_id !== payload.status_id ||
        vm.oldItemUDDDetails.user_defined_data_type !==
        payload.user_defined_data_type ||
        vm.oldItemUDDDetails.user_defined_data_id !==
        payload.user_defined_data_id ||
        vm.oldItemUDDDetails.display_sequence !== payload.display_sequence ||
        vm.oldItemUDDDetails.entry_level !== payload.entry_level ||
        vm.oldItemUDDDetails.entry_type !== payload.entry_type ||
        vm.oldItemUDDDetails.required !== payload.required ||
        vm.oldItemUDDDetails.is_important !== payload.is_important ||
        vm.oldItemUDDDetails.visibility_id !== payload.visibility_id ||
        vm.oldItemUDDDetails.pe_filter_priority !==
        payload.pe_filter_priority ||
        vm.oldItemUDDDetails.default_value != payload.default_value ||
        vm.oldItemUDDDetails.group_header_id !== payload.group_header_id ||
        vm.oldItemUDDDetails.include_in_type_report !== payload.include_in_type_report ||
        vm.oldItemUDDDetails.include_in_mercury_report !== payload.include_in_mercury_report
      ) {
        return true;
      } else {
        return false;
      }
    };

    //in update form on change of entry level this function is called
    vm.validateEntryLevel = (entry_level, id) => {
      vm.isValidationProcessing = false;
      vm.isEntrylevelvalidate = true;
      if (
        vm.oldItemUDDDetails &&
        vm.oldItemUDDDetails.entry_level.toLowerCase() === "item" &&
        entry_level.toLowerCase() === "sku" &&
        id && vm.update_progress == false
      ) {
        ItemUDDService.API.GetBridgeDependency(id)
          .then(response => {
            vm.isValidationProcessing = false;
            vm.itemDependentCount = response[0].count;
            vm.isReassignValues = false;
            vm.isEntrylevelvalidate = false;
          })
          .catch(error => {
            vm.isValidationProcessing = false;
            vm.isEntrylevelvalidate = false;
            logger.error(error);
          });
      } else {
        vm.isItemDependent = false;
        vm.itemDependentCount = undefined;
        if(vm.update_progress == true){
          vm.isValidationProcessing = true;
        }
        else{
          vm.isValidationProcessing = false;
        }
        vm.isEntrylevelvalidate = false;
      }
    };

    //if entry level for an udd is updated from 'Item' to 'Set', Item udd bridge for the udd will be deleted
    vm.deleteItemUddBridge = payload => {
      vm.isDeleted = 0;
      ItemUDDService.API.DeleteBridgeUddLink(payload.id)
        .then(response => {
          vm.itemDependentCount = 0;
          if (response.status === 200) {
            vm.isDeleted = 1;
            common.$timeout(() => {
              vm.isDeleteBridge = false;
              vm.validateUpdate(payload);
            }, 300);
          } else {
            vm.message = "Error while removing Item Udd Values.";
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Focus
    vm.focusSearchField = () => {
      this.common.$timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000)
    };

    vm.validateUpdate = payload => {
      if (vm.itemDependentCount === 0 || vm.itemDependentCount === undefined) {
        vm.update(payload);
      } else if (
        vm.oldItemUDDDetails &&
        vm.oldItemUDDDetails.entry_type.toLowerCase() != payload.entry_type.toLowerCase()
      ) {
        vm.isItemDependent = false;
        vm.isEntryTypeUpdated = true;
      } else {
        vm.isItemDependent = true;
      }
    };

    // copy from item udd values to set values
    vm.reassignValues = (id, entry_level) => {
      let udd_properties = {
        from_entry_level: vm.oldItemUDDDetails.entry_level,
        to_entry_level: entry_level,
        udd_id: id
      };
      ItemUDDService.API.TriggerCopyItemUDD(udd_properties)
        .then(response => {
          vm.triggerResponse = response;
      _.each(vm.itemudd_data,data=>{
        if(data.id==response.config.data.udd_id){
          vm.updateBtnError = true;
        }
      })
          vm.isReassignValues = true;
          vm.isItemDependent = false;
          vm.job_id = response.data.job_id;
          vm.reload();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Set the default percentage value in the dependency panel
    vm.setPercentValue = (to_from_val, from, value) => {
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
                    //vm.isPercentageLoaded = false;
                    vm.AttributeDetail.attribute_to_value = parseInt(
                      vm.AttributeDetail.attribute_to_value.replace("%", "")
                    );
                    vm.AttributeDetail.attribute_from_value = parseInt(
                      vm.AttributeDetail.attribute_from_value.replace("%", "")
                    );
                    //vm.isPercentageLoaded = true;
                  }
                })
                .catch(error => { });
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
      } else if (uddType.toLowerCase() === "option") {
        MTOChoiceService.API.FetchChoicesByOptionId(uddId)
          .then(result => {
            vm.userDefinedData = result;
          })
          .catch(error => {
            logger.error(error);
          });
      } else if (uddType.toLowerCase() === "optiontype") {
        MTOService.API.SearchMTO("option_type_id", uddId)
          .then(result => {
            vm.userDefinedData = result.data;
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    // Directive Send Data back to controller
    $scope.end = data => {
      $scope.primary_item_hierarchy_value_name = data.path_name;
      $scope.primary_item_hierarchy_obj = data.hierarchyValueData;
      vm.new_type_udd.udd_value_id = data.hierarchyValueData.id;
      $scope.primary_item_hierarchy_value_id = data.hierarchyValueData.id;
      $scope.selectedTreeItem = true;
    };

    //If the value attribute has from and to range then validate or else pass the control to update function
    vm.confirmUpdate = (payload, isUpdateItemUdds) => {
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
          vm.AttributeDetail.format.toLowerCase() == "number select" ||
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
            vm.update(payload, isUpdateItemUdds);
          } else {
            vm.validationMessage = `${vm.AttributeDetail.format} should be between ${vm.AttributeDetail.attribute_from_value} and ${vm.AttributeDetail.attribute_to_value}`;
          }
        } else if (
          vm.AttributeDetail.attribute_from_value <= payload.value &&
          vm.AttributeDetail.attribute_to_value >= payload.value
        ) {
          vm.validationMessage = null;
          vm.update(payload, isUpdateItemUdds);
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
        vm.update(payload, isUpdateItemUdds);
      }
    };

    vm.arrangeDisplaySequence = (
      uddData,
      payload,
      newSequence,
      oldSequence
    ) => {
      for (let index = 0; index < uddData.length; index++) {
        if (uddData[index].type_id == payload.type_id) {
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

    //update item type udd
    vm.update = (payload, isUpdateItemUdds, isConfirm, isConfirmDefaultValueChange) => {
      vm.isProcessing = true;
      let isDateRange = false;
      vm.messagesList = [];
      if (
        payload.user_defined_data_type &&
        payload.user_defined_data_type.toLowerCase() === "attribute" &&
        vm.attributeListMap[
          payload.user_defined_data_id
        ].format.toLowerCase() === "date range"
      ) {
        isDateRange = true;
        let toValue = payload.default_value_to ? `,${payload.default_value_to}` : '';
        payload.default_value = `${payload.default_value_from}${toValue}`;
      }
      payload.user_defined_data_id = parseInt(vm.attributeHierarchyModel.id);
      let removeEntryType = "";
      if (vm.hasUpdateChanges(payload) === true) {
        if (
          vm.oldItemUDDDetails &&
          vm.oldItemUDDDetails.entry_type &&
          vm.oldItemUDDDetails.entry_type.toLowerCase() != payload.entry_type.toLowerCase() &&
          !vm.isEntryTypeUpdated &&
          (
            vm.oldItemUDDDetails.entry_type === "Regular,Set" ||
            vm.oldItemUDDDetails.entry_type === "Regular" && payload.entry_type === "Set" ||
            vm.oldItemUDDDetails.entry_type === "Set" && payload.entry_type === "Regular"
          ) &&
          isConfirm !== true
        ) {
          vm.isProcessing = false;
          vm.isEntryTypeUpdated = true;
          if (vm.oldItemUDDDetails.entry_type === "Regular,Set" && payload.entry_type === "Regular") {
            removeEntryType = "Set";
          } else if (vm.oldItemUDDDetails.entry_type === "Regular,Set" && payload.entry_type === "Set") {
            removeEntryType = "Regular";
          } else if (vm.oldItemUDDDetails.entry_type === "Regular" && payload.entry_type === "Set") {
            removeEntryType = "Regular";
          } else if (vm.oldItemUDDDetails.entry_type === "Set" && payload.entry_type === "Regular") {
            removeEntryType = "Set";
          }
          vm.removeEntryType = removeEntryType;
        } else if (
          vm.oldItemUDDDetails &&
          !vm.oldItemUDDDetails.entry_type &&
          !vm.isEntryTypeUpdated &&
          isConfirm !== true
        ) {
          vm.isProcessing = false;
          vm.isEntryTypeUpdated = true;
          vm.removeEntryType = removeEntryType;
        } else if (
          vm.oldItemUDDDetails &&
          vm.oldItemUDDDetails.entry_level.toLowerCase() === "sku" &&
          payload.entry_level.toLowerCase() === "item" &&
          !vm.isEntryTypeUpdated &&
          isConfirm !== true
        ) {
          vm.addValidationRulesForSelectedValue();
          vm.isProcessing = false;
          vm.isEntryLevelUpdatedFromSKuToItem = true;
        } else if (
          isConfirmDefaultValueChange !== true &&
          vm.oldItemUDDDetails &&
          payload.entry_level && // updated on August 31, 2020
          payload.entry_level.toLowerCase() !== "collection" && // Need clarification for collection level UDDs.
          payload.default_value &&
          vm.oldItemUDDDetails.default_value != payload.default_value && //  strict comparison not required
          (!isDateRange || (isDateRange && payload.default_value !== "none")) &&
          !vm.isEntryTypeUpdated &&
          !vm.isEntryLevelUpdatedFromSKuToItem
        ) {
          vm.isProcessing = false;
          vm.isDefaultValueUpdated = true;
        } else {
          if (vm.isEntryTypeUpdated && vm.removeEntryType) {
            ItemService.API.DeleteBridgeValuesByMapId(payload.id, vm.removeEntryType)
              .then(() => { })
              .catch(() => { });
          } else if (vm.isEntryLevelUpdatedFromSKuToItem === true) {
            if (
              payload.user_defined_data_type &&
              payload.user_defined_data_type.toLowerCase() === "attribute" &&
              vm.attributeListMap[
                payload.user_defined_data_id
              ].format.toLowerCase() === "date range"
            ) {
              // put 'value' to insert item bridge value when entry level changed from SKU to Item
              payload.value = payload.udd_value_from && payload.udd_value_to ? `${moment(payload.udd_value_from).format('YYYY-MM-DD')},${moment(payload.udd_value_to).format('YYYY-MM-DD')}` : undefined;
            }
            ItemService.API.DeleteBridgeValuesByMapId(payload.id)
              .then(() => {
                vm.insertUddValuesToItem(payload);
              })
              .catch(() => { });
          }
          // send old and new default view values to save in update history
          payload.old_default_value_view =
            vm.oldItemUDDDetails.default_value_view;
          payload.old_visibility = vm.oldItemUDDDetails.visibility;
          payload.is_delete_item_udd_values = isUpdateItemUdds;
          payload.is_delete_item_udd_values
            ? (payload.ids = vm.itemUddError.data.error.ids)
            : null;
          // check if current data is changed. if yes then only send request.
          vm.isBtnEnable = false;
          vm.updateBtnText = "Updating Now...";
          ItemUDDService.API.UpdateItemUDD(payload)
            .then(response => {
              let index = vm.itemudd_data.findIndex(
                itemudd_data => itemudd_data.id === payload.id
              );
              vm.arrangeDisplaySequence(
                vm.itemudd_data,
                payload,
                payload.display_sequence,
                vm.itemudd_data[index].display_sequence
              );
              vm.isShowUDDDependencyPanel = false;
              vm.isShowUDDDependencyPanel = false;
              vm.itemudd_data[index] = response.data.data;
              vm.typeUddsMap[$stateParams.item_type_udd_id] =
                response.data.data;
              vm.fetchDefaultValueForUdd(vm.itemudd_data[index]);
              vm.isItemDependent = false;
              $scope.closeShowHistory();
              vm.isShowHistory = false;
              vm.updateBtnText = "Done";
              vm.isUpdateSuccess = true;
              vm.isDefaultValueUpdated = false;
              vm.isEntryTypeUpdated = false;
              vm.isBtnEnable = true;
              vm.isProcessing = false;
              if (
                vm.oldItemUDDDetails &&
                vm.oldItemUDDDetails.default_value !== payload.default_value
              ) {
                vm.checkUpdateDefaultValueOptions(payload, true);
              }
            })
            .catch(error => {
              vm.isProcessing = false;
              vm.updateBtnError = true;
              if (error.status === 403) {
                vm.isUnauthorized = true;
              } else if (
                error.data &&
                error.data.error &&
                error.data.error.flag &&
                error.data.error.flag.udd_exists
              ) {
                //if record with selected user defined data type value and item type id is already exist then notify user
                vm.messagesList.push({
                  exists: true,
                  uddType: payload.user_defined_data_type.toLowerCase(),
                  itemType: vm.typeIdsMap[payload.type_id].item_type_name,
                  maintenanceDescription: payload.maintenance_description,
                  attribute_or_hierarchy: payload.attribute_or_hierarchy
                });
              } else if (
                error.data.flag &&
                error.data.error.flag.description_exists
              ) {
                vm.message = NotificationService.errorNotification(error);
              } else {
                if (
                  error.status === 412 &&
                  error.data.error.is_udd_referred_in_items &&
                  error.data.error.is_udd_referred_in_items === true
                ) {
                  vm.isShowUDDDependencyPanel = true;
                  delete vm.new_type_udd.udd_value_id;
                  delete vm.new_type_udd.value;
                } else {
                  vm.isShowUDDDependencyPanel = false;
                }
                vm.itemUddError = error;
                vm.message = NotificationService.errorNotification(error);
                vm.updateBtnText = "Update";
              }
              if (
                error.status === 403 ||
                (error.data.error &&
                  error.data.error.flag &&
                  error.data.error.flag.udd_exists) ||
                (error.data.error &&
                  error.data.error.flag &&
                  error.data.error.flag.description_exists)
              ) {
                vm.updateBtnText = "Oops.!! Something went wrong";
                vm.updateBtnError = true;
              }
              common.$timeout(() => {
                vm.isBtnEnable = true;
                vm.updateBtnText = "Update";
                vm.updateBtnError = false;
                vm.message = null;
              }, 3500);
            });
        }
      } else {
        vm.isProcessing = true;
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        vm.isProcessing = false;
        common.$timeout(() => {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.checkUpdateDefaultValueOptions = (payload, isUpdate) => {
      let data = {
        item_map_id: payload.id,
        item_type_id: payload.type_id,
        oldValue: vm.oldItemUDDDetails && vm.oldItemUDDDetails.default_value ? vm.oldItemUDDDetails.default_value : null,
        entry_level: payload.entry_level.toLowerCase() === "sku" ? "SKU" : "Item",
        entry_type: payload.entry_type,
        defaultValueChanged: vm.defaultValueChanged,
        user_defined_data_type: payload.user_defined_data_type
      }

      if (payload.user_defined_data_type && payload.user_defined_data_type.toLowerCase() === "attribute") {
        if (vm.attributeListMap && vm.attributeListMap[payload.user_defined_data_id]) {
          if (
            vm.attributeListMap[payload.user_defined_data_id].format.toLowerCase() === "value list" ||
            vm.attributeListMap[payload.user_defined_data_id].format.toLowerCase() === "rating"
          ) {
            data.udd_value_id = payload.default_value
          } else if (
            vm.attributeListMap[payload.user_defined_data_id].format.toLowerCase() === "date range" &&
            payload.default_value_from !== "none"
          ) {
            let toDate = $scope.addDaysToDate(vm.attributeListMap[payload.user_defined_data_id].attribute_from_value, payload.default_value_to);
            let formattedToDate = moment(toDate).format('YYYY-MM-DD');
            data.value = `${moment(vm.attributeListMap[payload.user_defined_data_id].attribute_from_value).format('YYYY-MM-DD')},${formattedToDate}`;
            if (vm.oldItemUDDDetails && vm.oldItemUDDDetails.id) {
              vm.oldItemUDDDetails.default_value_from = vm.oldItemUDDDetails.default_value.split(",")[0];
              vm.oldItemUDDDetails.default_value_to = Number(vm.oldItemUDDDetails.default_value.split(",")[1]);
              let oldToDate = $scope.addDaysToDate(vm.attributeListMap[vm.oldItemUDDDetails.user_defined_data_id].attribute_from_value, vm.oldItemUDDDetails.default_value_to);
              let formattedOldToDate = moment(oldToDate).format('YYYY-MM-DD');
              data.oldValue = `${moment(vm.attributeListMap[vm.oldItemUDDDetails.user_defined_data_id].attribute_from_value).format('YYYY-MM-DD')},${formattedOldToDate}`;
            }
          } else {
            data.value = payload.default_value
          }
        }
      } else {
        data.udd_value_id = payload.default_value
      }
      if (vm.defaultValueChanged && vm.defaultValueChanged !== "none" && !(vm.oldItemUDDDetails.default_value && !data.value && !data.udd_value_id)) {
        vm.updateItemSkuUddBridgeValuesToDefault(data);
      }
    }

    vm.updateItemSkuUddBridgeValuesToDefault = (payload) => {
      ItemUDDService.API.UpsertUddBridgeValues(payload)
        .then(response => { })
        .catch(() => { });
    }

    vm.insertUddValuesToItem = object => {
      if (object.value || object.udd_value_id) {
        let uddObject = {
          status_id: 200,
          entry_level: "Item",
          entry_type: object.entry_type,
          type_id: object.type_id,
          item_map_id: object.id,
          value: object.value,
          udd_value_id: object.udd_value_id
        };
        ItemUDDService.API.InsertItemUDDs(uddObject)
          .then(() => {
            vm.isItemDependent = false;
            $scope.closeShowHistory();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.isBtnEnable = true;
            vm.isProcessing = false;
            vm.isEntryLevelUpdatedFromSKuToItem = false;
          })
          .catch(() => { });
      }
    };

    vm.arrangeDisplaySequenceAfterDelete = (uddData, sequence, typeId) => {
      uddData.filter(udd => {
        if (
          Number(udd.type_id) === Number(typeId) &&
          Number(udd.display_sequence) > Number(sequence)
        ) {
          udd.display_sequence = Number(udd.display_sequence) - 1;
        }
      });
    };

    //delete itemtype udd
    vm.delete = payload => {
      ItemUDDService.API.DeleteItemUDD(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.itemudd_data.findIndex(
            itemTypeUdd => itemTypeUdd.id === payload.id
          );
          vm.itemudd_data.splice(index, 1);
          delete vm.typeUddsMap[$stateParams.item_type_udd_id];
          vm.arrangeDisplaySequenceAfterDelete(
            vm.itemudd_data,
            payload.display_sequence,
            payload.type_id
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
              vm.message = NotificationService.errorNotification(error);
            }
          }
        });
    };

    //delete itemtype udd
    vm.deleteUDDDependencies = payload => {
      vm.isProcessing = true;
      ItemUDDService.API.DeleteItemUDDAndDependencies(payload)
        .then(response => {
          vm.isDependent = false;
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.isProcessing = false;
          let index = vm.itemudd_data.findIndex(
            itemTypeUdd => itemTypeUdd.id === payload.id
          );
          vm.itemudd_data.splice(index, 1);
          delete vm.typeUddsMap[$stateParams.item_type_udd_id];
          vm.arrangeDisplaySequenceAfterDelete(
            vm.itemudd_data,
            payload.display_sequence,
            payload.type_id
          );
          vm.rowsCount--;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.isProcessing = false;
          vm.message = NotificationService.errorNotification(error);
        });
    };

    //show message asking for delete confirmation
    vm.showconfirm = () => {
      vm.messagesList = [];
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
      vm.isShowUDDDependencyPanel = false;
    };

    ////focus will be set to the first field of form
    vm.setInitialState = () => {
      common.$timeout(() => {
        angular.element("#maintenance_description").focus();
      });
    };

    /**Get all the visibility options for Item UDD */
    vm.getUddVisibilityOptions = () => {
      vm.uddVisibilities = [];
      // Once the response is returned the getUserDefinedDataValues() is then called!
      return $q((resolve, reject) => {
        ItemUDDService.API.GetUDDVisibilityOptions()
          .then(response => {
            vm.uddVisibilities = response;
            vm.visibilityIdMap = {};
            vm.isVisibilityOptionsChanged = false;
            for (let i = 0; i < response.length; i++) {
              if (vm.visibilityIdMap[response[i].id] === undefined) {
                vm.visibilityIdMap[response[i].id] = response[i];
              }
            }
            resolve(response);
          })
          .catch(error => {
            logger.error(error);
            reject(error);
          });
      });
    };

    vm.addPESequenceValidation = () => {
      let obj = {};
      if ($scope.type_udd_form && $scope.type_udd_form.pe_filter_priority) {
        $scope.type_udd_form.pe_filter_priority.$setUntouched();
      }
      let getConstraint = valdr.getConstraints()["RULES-32"];
      let minimum = 1;
      let maximum = 1000;
      let msg = `PE Sequence must be an integer between ${minimum} and ${maximum}.`;
      getConstraint
        ? (getConstraint["pe_filter_priority"] = {
          digits: {
            integer: 10,
            message: msg
          },
          min: {
            value: minimum,
            message: msg
          },
          max: {
            value: maximum,
            message: msg
          },
          required: {
            message: "PE Sequence is required !"
          }
        })
        : null;
      getConstraint ? (obj["RULES-32"] = getConstraint) : null;
      valdr.addConstraints(obj);
    };

    vm.addSequenceValidation = typeId => {
      let obj = {};
      if ($scope.type_udd_form && $scope.type_udd_form.display_sequence) {
        $scope.type_udd_form.display_sequence.$setUntouched();
      }
      let getConstraint = valdr.getConstraints()["RULES-32"];
      let minimum = 1;
      let maximum = vm.itemudd_data.filter(
        udd => Number(udd.type_id) === Number(typeId)
      ).length;
      if (
        getConstraint &&
        vm.new_type_udd &&
        vm.new_type_udd.display_sequence
      ) {
        let msg = `Prime Sequence must be an integer between ${minimum} and ${maximum}.`;
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
            message: "Prime Sequence is required !"
          }
        };
        obj["RULES-32"] = getConstraint;
      } else if (!typeId && getConstraint) {
        let msg = `Prime Sequence must be greater than 0.`;
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
        obj["RULES-32"] = getConstraint;
      } else {
        getConstraint ? delete getConstraint.display_sequence : null;
        obj["RULES-32"] = getConstraint;
      }
      valdr.addConstraints(obj);
    };

    vm.setSuggestedSequence = () => {
      vm.new_type_udd.display_sequence = vm.itemudd_data.length + 1;
    };

    //Open create new item type udd form
    vm.openForm = () => {
      $state.go("common.prime.itemtypeudd.new");
      vm.saveBtnText = "Save";
      vm.oldItemUDDDetails = {};
      vm.new_type_udd = {};
      vm.isSaveSuccess = false;
      vm.showUddValueMessage = "";
      vm.messagesList = [];
      vm.set_entry_level();
      vm.setInitialState();
      vm.addSequenceValidation();
      vm.addPESequenceValidation();
      if (
        vm.selectedDescription &&
        (vm.selectedDescription.length === 0 ||
          vm.selectedDescription.length === 1)
      ) {
        vm.setSuggestedSequence();
      }
    };

    // get group header property list
    vm.fetchGroupHeaderPropertiesByItemTypeId = () => {
      vm.isgroupHeaderShow = vm.isgroupHeaderShow ? false : true;
      ItemUDDService.API.GetGroupHeaderPropertiesByItemTypeId(
        $stateParams.item_type_id
      )
        .then(result => {
          vm.groupHeaderPropertyList = result;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // update group header property filed
    // 'propertyField' can be any field in 'rcp_udd_group_header_properties_tbl'.
    vm.updateGroupHeaderPropertyField = (groupHederProperty, propertyField) => {
      ItemUDDService.API.UpdatePropertyFieldByItemTypeIdAndHeaderId(
        $stateParams.item_type_id,
        groupHederProperty.header_id,
        propertyField,
        groupHederProperty[propertyField]
      )
        .then(result => {
          groupHederProperty.message = result.message;
          common.$timeout(() => {
            delete groupHederProperty.message;
          }, 500);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // update group header sequence
    vm.updateSequence = groupHederProperty => {
      if (
        Number(groupHederProperty.newSequence) !=
        Number(groupHederProperty.sequence) &&
        groupHederProperty.newSequence !== 0 &&
        groupHederProperty.newSequence <= vm.groupHeaderPropertyList.length
      ) {
        ItemUDDService.API.UpdateSequenceByItemTypeIdAndHeaderId(
          $stateParams.item_type_id,
          groupHederProperty.header_id,
          groupHederProperty.newSequence
        )
          .then(result => {
            groupHederProperty.message = result.message;
            // arrange sequence
            vm.arrangeGroupHeaderSequence(
              groupHederProperty.header_id,
              groupHederProperty.newSequence,
              groupHederProperty.sequence
            );
            groupHederProperty.sequence = groupHederProperty.newSequence;
            common.$timeout(() => {
              delete groupHederProperty.message;
            }, 500);
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };
    // Update group header name
    vm.updateHeader = groupHeaderProperty => {
      if (
        groupHeaderProperty.newHeader != groupHeaderProperty.group_header &&
        groupHeaderProperty.newHeader !== "" &&
        groupHeaderProperty.newHeader.length <= 200
      ) {
        ItemUDDService.API.UpdateHeaderByHeaderId(
          groupHeaderProperty.header_id,
          groupHeaderProperty.newHeader
        )
          .then(result => {
            groupHeaderProperty.message = result.message;
            groupHeaderProperty.group_header = groupHeaderProperty.newHeader;
            common.$timeout(() => {
              delete groupHeaderProperty.message;
            }, 2500);
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    // arrange sequence
    vm.arrangeGroupHeaderSequence = (headerId, newSequence, oldSequence) => {
      for (let index = 0; index < vm.groupHeaderPropertyList.length; index++) {
        if (
          vm.groupHeaderPropertyList[index].header_id != headerId &&
          ((vm.groupHeaderPropertyList[index].sequence <= newSequence &&
            vm.groupHeaderPropertyList[index].sequence >= oldSequence) ||
            (vm.groupHeaderPropertyList[index].sequence <= oldSequence &&
              vm.groupHeaderPropertyList[index].sequence >= newSequence))
        ) {
          if (oldSequence <= newSequence) {
            vm.groupHeaderPropertyList[index].sequence =
              Number(vm.groupHeaderPropertyList[index].sequence) - 1;
          } else {
            vm.groupHeaderPropertyList[index].sequence =
              Number(vm.groupHeaderPropertyList[index].sequence) + 1;
          }
        }
      }
    };

    vm.setFocus = headerId => {
      common.$timeout(() => {
        angular.element(`#groupHeader-${headerId}`).focus();
      }, 0);
    };

    //set create new item type udd form to new context on click of create another button after a new record created.
    vm.createAnotherForm = () => {
      vm.saveBtnText = "Save";
      vm.isSaveSuccess = false;
      vm.new_type_udd = {};
      //Setting Previously entered data to the new context
      vm.new_type_udd.status_id = vm.previousLT.status_id;
      vm.messagesList = [];
      vm.setInitialState();
      vm.addSequenceValidation();
      vm.addPESequenceValidation();
      if (
        vm.selectedDescription &&
        (vm.selectedDescription.length === 0 ||
          vm.selectedDescription.length === 1)
      ) {
        vm.setSuggestedSequence();
      }
    };

    //Close form and success/error messages in the form
    vm.closeForm = () => {
      $state.go("common.prime.itemtypeudd");
      vm.isShowDetails = false;
      vm.itemDependentCount = undefined;
      vm.message = null;
      vm.updateBtnError = false;
      common.$timeout(() => {
        vm.isItemDependent = false;
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        vm.messagesList = [];
      }, 500);
    };

    vm.closeDependencyForm = () => {
      vm.isShowUDDDependencyPanel = false;
      vm.isRequired = false;
      vm.validationMessage = null;
      vm.AttributeDetail = {};
    };

    //highlight the clicked row in table
    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    //update table information like no of records found with/without search filter
    vm.updateTableInformation = currentPage => {
      let initalCount;
      if (vm.rowsCount === 0) {
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

    vm.roundOffIntergerValue = value => {
      return value.toLocaleString("en-US", {
        minimumIntegerDigits: 4,
        useGrouping: false
      });
    };

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/meesage in the form will be closed.
    vm.dblClickAction = payload => {
      vm.isValidationProcessing = true;
      vm.message = null;
      vm.isDependent = false;
      vm.isDefaultValueUpdated = false;
      vm.isShowUDDDependencyPanel = false;
      vm.isEntryLevelUpdatedFromSKuToItem = false;
      vm.isEntryTypeUpdated = false;
      vm.isRequired = false;
      vm.showUddValueMessage = "";
      $state.go("common.prime.itemtypeudd.update", {
        item_type_udd_id: payload.id
      });
      vm.new_type_udd = _.clone(payload);
      vm.oldItemUDDDetails = _.clone(payload);
      vm.new_type_udd.pe_filter_priority = vm.roundOffIntergerValue(
        vm.new_type_udd.pe_filter_priority
      );
      vm.oldItemUDDDetails.pe_filter_priority = vm.roundOffIntergerValue(
        vm.oldItemUDDDetails.pe_filter_priority
      );
      payload.allow_MTOs === 0
        ? (vm.isAllowMTO = false)
        : (vm.isAllowMTO = true);
      vm.attributeHierarchyModel = {};
      vm.attributeHierarchyModel.id = vm.new_type_udd.user_defined_data_id; // Binding user defined data id with selectise model id
      // if user defined data type is 'Attribute' and format is 'Value list'
      vm.attributeHierarchyValueModel = {
        value: vm.new_type_udd.default_value
      };

      // entry type drop down needs array of selected typess as ng-model
      vm.new_type_udd.entryTypes = vm.new_type_udd.entry_type
        ? vm.new_type_udd.entry_type.split(",")
        : null;

      // visiblity drop down needs array of selected ids as ng-model
      vm.new_type_udd.visibilityIds = vm.new_type_udd.visibility_id && vm.new_type_udd.visibility_id !== 'null'
        ? vm.new_type_udd.visibility_id.split(",").map(Number)
        : [];

      if (
        payload.user_defined_data_type &&
        payload.user_defined_data_id &&
        vm.attributeListMap &&
        vm.attributeListMap[payload.user_defined_data_id] &&
        payload.user_defined_data_type.toLowerCase() === "attribute" &&
        vm.attributeListMap[payload.user_defined_data_id].format.toLowerCase() === 'date range'
      ) {
        vm.new_type_udd.default_value_from = payload.default_value.split(",")[0];
        if (payload.default_value.split(",")[1]) {
          vm.new_type_udd.default_value_to = Number(payload.default_value.split(",")[1]);
        }
      } else {
        // if user defined data type is 'Attribute' and format is 'Multiselect'
        vm.new_type_udd.default_value_ids = vm.new_type_udd.default_value
          ? vm.new_type_udd.default_value.split(",").map(Number)
          : [];
      }
      vm.set_entry_level(payload.user_defined_data_type);
      vm.loadRespectiveEntity(payload);
      // Once the response is returned the getUserDefinedDataValues() is then called!
      let uddPromise = vm.getUddVisibilityOptions();
      uddPromise
        .then(() => {
          vm.getUserDefinedDataValues(payload, payload.user_defined_data_id);
        })
        .catch(() => { });
      vm.addSequenceValidation(payload.type_id);
      vm.addPESequenceValidation();
      vm.messagesList = [];
      vm.isUnauthorized = false;
      vm.isReassignValues = false;
      vm.isShowHistory = true;
      vm.isConfirmDelete = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.validationItemtoSKU(payload);
    };

    vm.validationItemtoSKU = (payload) => {
      if (payload.taskid && payload.taskid != 0) {
        ItemUDDService.API.GetTaskIDUDD(payload.taskid)
          .then(response => {
            var current_stage = response.data[0].current_state;
            if (current_stage == 2 || current_stage == 10) {
              vm.isValidationProcessing = false;
              vm.update_progress = false;
            }
            else{
              vm.isValidationProcessing = true;
              vm.update_progress = true;
            }
          });
      }
      else{
        vm.isValidationProcessing = false;
        vm.update_progress = false;
      }
    }

    //check if selected id is present in data. if yes, goto update state
    vm.gotoUpdateStateIfIdExist = () => {
      if (vm.typeUddsMap[$stateParams.item_type_udd_id]) {
        vm.dblClickAction(vm.typeUddsMap[$stateParams.item_type_udd_id]);
      } else {
        vm.closeForm();
      }
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
     * for multiselect drop down for visibility, change view value based on selected values
     * view value is used to save change history as well
     */
    vm.addVisibilityDescriptionOnMultiselect = dataObj => {
      dataObj.visibility = "";
      common.$timeout(() => {
        let selectedOptions = dataObj.visibility_id
          ? dataObj.visibility_id.split(",")
          : [];
        for (let i = 0; i < selectedOptions.length; i++) {
          if (vm.visibilityIdMap[selectedOptions[i]]) {
            dataObj.visibility +=
              vm.visibilityIdMap[selectedOptions[i]].visibility;
          }

          if (
            selectedOptions[i] &&
            selectedOptions.length > 1 &&
            i !== selectedOptions.length - 1
          ) {
            dataObj.visibility += ", ";
          }
        }
      }, 0);
    };

    vm.setDefaultValueToUddBridge = () => {
      if (
        vm.new_type_udd &&
        vm.new_type_udd.user_defined_data_id &&
        vm.new_type_udd.user_defined_data_type.toLowerCase() === "attribute" &&
        vm.new_type_udd.default_value
      ) {
        if (
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "multiselect"
        ) {
          vm.new_type_udd.value = vm.new_type_udd.default_value;
          vm.new_type_udd.udd_value_ids = vm.new_type_udd.default_value
            .split(",")
            .map(Number);
        } else if (
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "value list" ||
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "rating"
        ) {
          vm.new_type_udd.udd_value_id = vm.new_type_udd.default_value;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format.toLowerCase() === 'date range' &&
          vm.new_type_udd.default_value &&
          vm.new_type_udd.default_value.toLowerCase() !== "none"
        ) {
          vm.new_type_udd.udd_value_from = vm.new_type_udd.from;
          vm.new_type_udd.udd_value_to = $scope.getDateBasedOnFormat(
            $scope.addDaysToDate(vm.new_type_udd.from, vm.new_type_udd.default_value.split(",")[1])
          );
        } else {
          vm.new_type_udd.value = vm.new_type_udd.default_value;
        }
      }
    };

    /* Function to reset selected udd value */
    vm.resetUddValue = uddData => {
      delete uddData.udd_value_id;
      delete uddData.udd_value_ids;
      delete uddData.value;
      delete uddData.value_view;
      vm.attributeHierarchyValueModel = {
        value: ""
      };
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

    vm.onCancelUpdateUddValue = () => {
      vm.isEntryLevelUpdatedFromSKuToItem = false;
      vm.isDefaultValueUpdated = false;
      if (
        vm.new_type_udd &&
        vm.new_type_udd.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        // if user defined data type is 'Attribute' and format is 'Value list' or 'Rating'
        vm.attributeHierarchyValueModel = {
          value: vm.new_type_udd.default_value
        };
      } else if (
        vm.new_type_udd &&
        vm.new_type_udd.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        vm.primaryHierarchyValueId = vm.new_type_udd.default_value;
      }
    };

    // check Date range from value is not greater than to value
    vm.validationFromTo = (udd) => {
      let fromDate = new Date(udd.udd_value_from).getTime();
      let toDate = new Date(udd.udd_value_to).getTime();
      vm.isFromToDateError = false;
      if (fromDate > toDate) {
        vm.isFromToDateError = true;
      } else if (udd.to) {
        let toValues = udd.to.split(",")
        if (Number(toValues[0]) !== 0 && fromDate === toDate) {
          vm.isFromToDateError = true;
        }
      }
    }

    /* If user defined data type is 'Attribute' then add validation rules based on selected attribute and its format */
    vm.addValidationRulesForSelectedValue = () => {
      let obj = {};
      let getConstraint = valdr.getConstraints()["RULES-32"];
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
          (vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "integer" ||
            vm.attributeListMap[
              vm.new_type_udd.user_defined_data_id
            ].format.toLowerCase() === "number select")
        ) {
          let msg = `Value must be an integer between ${minimum} and ${maximum}.`;
          // If user defined data type is 'Attribute' and format is 'Integer'
          getConstraint["value"] = {
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
          obj["RULES-32"] = getConstraint;
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
          let msg = `Value must be decimal between ${minimum} and ${maximum}.`;
          // If user defined data type is 'Attribute' and format is 'Decimal' or 'Percentage'
          let format = vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase();
          getConstraint["value"] = {
            digits: {
              integer: 10,
              fraction: 10,
              message: msg
            },
            min: {
              value:
              format === "percentage" && minimum.endsWith("%")
                ? minimum.substring(0, minimum.length - 1)
                : parseFloat(minimum),
              message: msg
            },
            max: {
              value:
              format === "percentage" && maximum.endsWith("%")
                ? maximum.substring(0, maximum.length - 1)
                : parseFloat(maximum),
              message: msg
            }
          };
          obj["RULES-32"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "dimension"
        ) {
          let msg = `Value must be a number between ${minimum} and ${maximum} with upto 8 decimal digits.`;
          // If user defined data type is 'Attribute' and format is 'Dimension'
          getConstraint["value"] = {
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
          obj["RULES-32"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "date"
        ) {
          // If user defined data type is 'Attribute' and format is 'Dimension'
          getConstraint["value"] = {
            startAndEndDateCompare: {
              sval: minimum,
              eval: maximum,
              message: `Value must be between ${moment(minimum).format(
                $scope.date_format
              )} and ${moment(maximum).format($scope.date_format)}`
            }
          };
          obj["RULES-32"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "date range"
        ) {
          vm.new_type_udd.from = minimum;
          vm.new_type_udd.to = maximum;
          let toValuesRange = vm.new_type_udd.to.split(",");
          // max and min to date required to add validation
          vm.new_type_udd.min_to_date = $scope.getDateBasedOnFormat($scope.addDaysToDate(vm.new_type_udd.from, toValuesRange[0]));
          vm.new_type_udd.max_to_date = $scope.getDateBasedOnFormat($scope.addDaysToDate(vm.new_type_udd.from, toValuesRange[1]));
          // If user defined data type is 'Attribute' and format is 'Date Range'
          getConstraint["udd_value_from"] = {
            startAndEndDateCompare: {
              sval: vm.new_type_udd.from,
              eval: vm.new_type_udd.max_to_date,
              message: `From date must be between ${moment(vm.new_type_udd.from).format(
                $scope.date_format
              )} and ${moment(vm.new_type_udd.max_to_date).format($scope.date_format)}`
            }
          };
          // If user defined data type is 'Attribute' and format is 'Date Range'
          getConstraint["udd_value_to"] = {
            startAndEndDateCompare: {
              sval: vm.new_type_udd.min_to_date,
              eval: vm.new_type_udd.max_to_date,
              message: `To date must be between ${moment(vm.new_type_udd.min_to_date).format(
                $scope.date_format
              )} and ${moment(vm.new_type_udd.max_to_date).format($scope.date_format)}`
            }
          };
          obj["RULES-32"] = getConstraint;
        } else if (
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
          vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "text"
        ) {
          let msg = `Value must be text between ${minimum} and ${maximum} characters.`;
          // If user defined data type is 'Attribute' and format is 'Text'
          getConstraint["value"] = {
            minLength: {
              number: Number(minimum),
              message: msg
            },
            maxLength: {
              number: Number(maximum),
              message: msg
            }, 
            pattern:{
              value: $scope.globalRegularExpression,
              message: `Value must be a valid string`
            }
          };
          obj["RULES-32"] = getConstraint;
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
          obj["RULES-32"] = getConstraint;
        } else {
          delete getConstraint.value;
          obj["RULES-32"] = getConstraint;
        }
      } else {
        // If user defined data type is not 'Attribute' then remove validations
        delete getConstraint.value;
        obj["RULES-32"] = getConstraint;
      }
      valdr.addConstraints(obj);
    };

    /* If user defined data type is 'Attribute' then add validation rules based on selected attribute and its format */
    vm.addValidationRules = () => {
      let obj = {};
      if ($scope.type_udd_form && $scope.type_udd_form.default_value) {
        $scope.type_udd_form.default_value.$setUntouched();
      }
      let getConstraint = valdr.getConstraints()["RULES-32"];
      if (
        vm.new_type_udd &&
        vm.new_type_udd.user_defined_data_id &&
        vm.attributeListMap &&
        vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
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
          (vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "integer" ||
            vm.attributeListMap[vm.new_type_udd.user_defined_data_id].format &&
            vm.attributeListMap[
              vm.new_type_udd.user_defined_data_id
            ].format.toLowerCase() === "number select")
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
          obj["RULES-32"] = getConstraint;
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
              value:
              format === "percentage" && minimum.endsWith("%")
                ? minimum.substring(0, minimum.length - 1)
                : parseFloat(minimum),
              message: msg
            },
            max: {
              value:
              format === "percentage" && maximum.endsWith("%")
                ? maximum.substring(0, maximum.length - 1)
                : parseFloat(maximum),
              message: msg
            }
          };
          obj["RULES-32"] = getConstraint;
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
          obj["RULES-32"] = getConstraint;
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
              message: `Default value must be between ${moment(minimum).format(
                $scope.date_format
              )} and ${moment(maximum).format($scope.date_format)}`
            }
          };
          obj["RULES-32"] = getConstraint;
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
            },
            pattern:{
              value: vm.globalRegularExpression,
              message: `Value must be a valid string`
            }
          };
          obj["RULES-32"] = getConstraint;
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
            message: "Default value must be a valid URL."
          };
          obj["RULES-32"] = getConstraint;
        } else {
          delete getConstraint.default_value;
          obj["RULES-32"] = getConstraint;
        }
      } else {
        // If user defined data type is not 'Attribute' then remove validations
        delete getConstraint.default_value;
        obj["RULES-32"] = getConstraint;
      }
      valdr.addConstraints(obj);
    };

    /**
     * End function of hierarchy tree view select
     * Assign the id of selected hierarchy value as default value
     */
    $scope.endDefaultValue = data => {
      vm.new_type_udd.default_value = data.hierarchyValueData.id
        ? data.hierarchyValueData.id
        : "";
      vm.new_type_udd.default_value_path = data.path_name
        ? data.path_name
        : undefined;
      vm.new_type_udd.default_value_view = data.hierarchyValueData
        .short_description
        ? data.hierarchyValueData.short_description
        : "";
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

    // If user selects user defined data 'Attribute' with format as 'Text' then filter out PE Filter visibility option
    vm.filterVisibilityOptionsList = () => {
      if (
        vm.new_type_udd.user_defined_data_type &&
        vm.new_type_udd.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        if (
          vm.attributeListMap &&
          vm.new_type_udd.user_defined_data_id &&
          vm.attributeListMap[vm.new_type_udd.user_defined_data_id] &&
          (vm.attributeListMap[
            vm.new_type_udd.user_defined_data_id
          ].format.toLowerCase() === "text" ||
            vm.attributeListMap[
              vm.new_type_udd.user_defined_data_id
            ].format.toLowerCase() === "url")
        ) {
          for (let i = vm.uddVisibilities.length - 1; i >= 0; i--) {
            if (
              vm.uddVisibilities[i].visibility.toLowerCase() === "pe filter"
            ) {
              vm.isVisibilityOptionsChanged = true;
              vm.uddVisibilities.splice(i, 1);
            }
          }
          // if visibility has set already then reset if attribute format is "Text" because we can not allow to "PE Filter" visibility
        } else {
          if (vm.isVisibilityOptionsChanged) {
            vm.getUddVisibilityOptions();
          }
        }
      }

      // if new form is there
      if (
        (!vm.oldItemUDDDetails && vm.isVisibilityOptionsChanged) ||
        (vm.oldItemUDDDetails &&
          vm.oldItemUDDDetails.user_defined_data_id &&
          parseInt(vm.oldItemUDDDetails.user_defined_data_id) !==
          parseInt(vm.new_type_udd.user_defined_data_id) &&
          vm.attributeListMap &&
          vm.attributeListMap[vm.oldItemUDDDetails.user_defined_data_id] &&
          (vm.attributeListMap[
            vm.oldItemUDDDetails.user_defined_data_id
          ].format.toLowerCase() === "text" ||
            vm.attributeListMap[
              vm.new_type_udd.user_defined_data_id
            ].format.toLowerCase() === "text"))
      ) {
        // if visibility has set already then reset if attribute format is "Text" because we can not allow to select "PE Filter" visibility
        vm.new_type_udd.visibilityIds = [];
      }
    };

    /*
     * When user select User defined data i.e Attribute/Hierarchy/OptionType/Option
     * Load values and show corresponding fields in create/update form
     */
    vm.getUserDefinedDataValues = (uddDetails, userDefinedDataId) => {
      uddDetails.user_defined_data_id = userDefinedDataId;
      vm.addValidationRules();
      vm.filterVisibilityOptionsList();
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
          vm.isTextField = false;
          vm.isDateSelect = false;
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
        vm.isMultiselect = false;
        vm.isDateSelect = false;
        vm.isTextField = false;
        vm.isUrlField = false;
        vm.primaryHierarchyId = undefined;
        common.$timeout(() => {
          vm.primaryHierarchyId = uddDetails.user_defined_data_id;
          vm.primaryHierarchyValueId = uddDetails.default_value
            ? uddDetails.default_value
            : undefined;
        }, 0);
      } else if (
        uddDetails &&
        uddDetails.user_defined_data_type.toLowerCase() === "option"
      ) {
        vm.isValueList = true;
        vm.getOptionChoiceList(uddDetails);
      } else if (
        uddDetails &&
        uddDetails.user_defined_data_type.toLowerCase() === "optiontype"
      ) {
        vm.isValueList = true;
        vm.getMTOOptionsList(uddDetails);
      }
    };

    /*
     * Function to get default values set for udd based on user defined data type
     */
    vm.showValueforDefaultValueField = () => {
      for (let i = 0; i < vm.itemudd_data.length; i++) {
        vm.fetchDefaultValueForUdd(vm.itemudd_data[i]);
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
            uddData.default_value === "1"
              ? "Yes"
              : uddData.default_value === "0"
                ? "No"
                : "";
          // send old and new default view values to save in update history
          vm.oldItemUDDDetails && uddData.id == vm.oldItemUDDDetails.id
            ? (vm.oldItemUDDDetails.default_value_view =
              uddData.default_value_view)
            : "";
        }
      } else if (
        uddData &&
        uddData.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        vm.getHierarchyValueById(uddData);
      } else if (
        uddData &&
        uddData.user_defined_data_type.toLowerCase() === "option"
      ) {
        vm.getOptionChoiceById(uddData);
      } else if (
        uddData &&
        uddData.user_defined_data_type.toLowerCase() === "optiontype"
      ) {
        vm.getMTOOptionById(uddData);
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
            vm.oldItemUDDDetails && uddData.id == vm.oldItemUDDDetails.id
              ? (vm.oldItemUDDDetails.default_value_view =
                uddData.default_value_view)
              : "";
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
            vm.oldItemUDDDetails && uddData.id == vm.oldItemUDDDetails.id
              ? (vm.oldItemUDDDetails.default_value_view =
                uddData.default_value_view)
              : "";
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.getMTOOptionById = uddData => {
      if (uddData.default_value) {
        MTOService.API.FetchMto(uddData.default_value)
          .then(response => {
            uddData.default_value_view = response.data.description;
            // send old and new default view values to save in update history
            vm.oldItemUDDDetails && uddData.id == vm.oldItemUDDDetails.id
              ? (vm.oldItemUDDDetails.default_value_view =
                uddData.default_value_view)
              : "";
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.getOptionChoiceById = uddData => {
      if (uddData.default_value) {
        MTOChoiceService.API.GetChoiceById(uddData.default_value)
          .then(response => {
            uddData.default_value_view = response.choice_description;
            // send old and new default view values to save in update history
            vm.oldItemUDDDetails && uddData.id == vm.oldItemUDDDetails.id
              ? (vm.oldItemUDDDetails.default_value_view =
                uddData.default_value_view)
              : "";
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
          item: (data, escape) => {
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

    //shows all update history for selected record
    $scope.loadHistory = () => {
      $scope.showhistoryloading = true; // Loading history until get the response

      common.EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.new_type_udd.id
      )
        .then(response => {
          $scope.historyList = response.data;
          $scope.showhistory = true;
          $scope.showhistoryloading = false;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //on enter of group_header it will search for entity
    //if group_header is already present, then returns group_headers matching, else show option to add new group_header in UI will be shown
    vm.discoverGroupHeader = data => {
      vm.isProcessing = true;
      let payload = {
        group_header: data.group_header
      };
      //If group_header is created, initialize message and error variable to null
      ItemUDDService.API.DiscoverGroupHeader(payload)
        .then(response => {
          vm.isProcessing = false;
          //If records exists matching the vendor name, return 200 response, else if it is created, returns 201 response
          if (response.status === 200) {
            vm.new_type_udd.group_header_id = response.data[0].id;
            vm.new_type_udd.group_header = response.data[0].group_header;
          } else {
            vm.new_type_udd.group_header_id = response.data.inserted_id;
            vm.new_type_udd.group_header = payload.group_header;
            vm.sucessMessage = response.data.message;
            payload.id = vm.new_type_udd.group_header_id;
            vm.allGroupHeaders.push(payload);
          }
          //after adding group header successfully close the dropdown
          vm.showSuggestedList = false;
          //After result is returned or created, group_header not found variable is reset to false
          vm.isNoResult = false;
        })
        .catch(error => {
          vm.isProcessing = false;
          logger.error(error);
        });
    };

    vm.toggleSuggestionList = flag => {
      if (vm.new_type_udd.group_header.length >= 1) {
        vm.showSuggestedList = flag;
      } else if (vm.new_type_udd.group_header.length == 0) {
        vm.showSuggestedList = false;
      } else {
        //if group header text is less than 2 then hide the dropdown
        vm.showSuggestedList = false;
      }
      vm.new_type_udd.group_header_id = null;
    };

    //on enter of group_header it will search for entity
    //if group_header is already present, then returns group_headers matching, else show option to add new group_header in UI will be shown
    vm.deleteGroupHeader = data => {
      vm.isProcessing = true;
      let payload = {
        group_header_id: data.id
      };
      //If group_header is created, initialize message and error variable to null
      ItemUDDService.API.DeleteGroupHeader(payload)
        .then(response => {
          vm.isProcessing = false;
          let index = vm.allGroupHeaders.findIndex(
            groupHeader => groupHeader.id === data.id
          );
          vm.allGroupHeaders.splice(index, 1);

          // As delete functionality is there in update udd panel, there may be a chance of 'groupHeaderPropertyList' has undefined value.
          // If groupHeaderPropertyList is exists, then only splice the deleted record.
          if (vm.groupHeaderPropertyList && vm.groupHeaderPropertyList.length) {
            index = vm.groupHeaderPropertyList.findIndex(
              groupHeader => groupHeader.id === data.id
            );
            vm.groupHeaderPropertyList.splice(index, 1);
          }

          for (let i = 0; i < vm.itemudd_data.length; i++) {
            if (
              vm.itemudd_data[i].group_header_id &&
              vm.itemudd_data[i].group_header_id === data.id
            ) {
              vm.itemudd_data[i].group_header_id = undefined;
              vm.itemudd_data[i].group_header = undefined;
            }
          }
        })
        .catch(error => {
          vm.isProcessing = false;
          logger.error(error);
        });
    };

    // close the show update history panel
    $scope.closeShowHistory = () => {
      common.$timeout(function () {
        angular.element("#maintenance_description").focus();
      }, 0);
      $scope.showhistory = false;
      $scope.showhistoryloading = false;
    };

    activate();

    function activate() {
      vm.initializeItemUDD();
      $scope.reloadMethodDisplayValues = vm.reload;
      $scope.setClickedRow = vm.setClickedRow;
      $scope.dblClickAction = vm.dblClickAction;
    }
  }
})();
