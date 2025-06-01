// Common directive for configure udd
(() => {
  "use strict";

  calculus.controller("ConfigureUddController", ConfigureUddController);

  ConfigureUddController.$inject = [
    "$scope",
    "common",
    "StatusCodes",
    "StatusService",
    "CodeService",
    "LocationTypeService",
    "LocationUDDService",
    "ItemTypeService",
    "HierarchyValuesTreePathService",
    "ItemUDDService",
    "ItemService",
    "VendorTypeService",
    "VendorUDDService",
    "MTOTypeService",
    "MTOUDDService",
    "HierarchyValueService",
    "GlobalRegularExpression",
    "valdr"
  ];

  function ConfigureUddController(
    $scope,
    common,
    StatusCodes,
    StatusService,
    CodeService,
    LocationTypeService,
    LocationUDDService,
    ItemTypeService,
    HierarchyValuesTreePathService,
    ItemUDDService,
    ItemService,
    VendorTypeService,
    VendorUDDService,
    MTOTypeService,
    MTOUDDService,
    HierarchyValueService,
    GlobalRegularExpression,
    valdr
  ) {
    let vm = this;
    vm.common = common;
    vm.timeout = common.$timeout;
    vm.sessionMemory = common.SessionMemory;
    vm.statusCodes = StatusCodes;
    vm.statusService = StatusService;
    vm.codeService = CodeService;
    vm.locationTypeService = LocationTypeService;
    vm.locationUDDService = LocationUDDService;
    vm.itemTypeService = ItemTypeService;
    vm.hierarchyValuesTreePathService = HierarchyValuesTreePathService;
    vm.itemUDDService = ItemUDDService;
    vm.itemService = ItemService;
    vm.vendorTypeService = VendorTypeService;
    vm.vendorUDDService = VendorUDDService;
    vm.mtoTypeService = MTOTypeService;
    vm.mtoUDDService = MTOUDDService;
    vm.globalRegularExpression=GlobalRegularExpression;
    vm.hierarchyValueService = HierarchyValueService;

    vm.sortType = "short_description";
    vm.filterByArray = ["short_description"];

    vm.uddTypeObject = {};
    vm.entityTypeIds = [];
    vm.entityTypeIdsMap = {};
    vm.filteredEntityTypeIds = [];
    vm.filteredEntityTypeIdsMap = {};

    vm.attributeIdAndValuesMap = {};
    vm.attributeHierarchyModel = {};
    vm.selectAttributeHierarchy = {};
    vm.attributeHierarchyValueModel = {
      value: ""
    };

    vm.isBtnDissable = false;

    // flag which controls whether entry_level should be disabeld in update screen
    vm.disableEntryLevelAndType = true;

    $scope.date_format = vm.sessionMemory.API.Get(
      "user.preference.date.format"
    );

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
          vm.uddTypeObject.attribute_or_hierarchy = data.short_description;
          return (
            '<span class="c-black f-13"> ' +
            escape(data.short_description) +
            "</span>"
          );
        }
      }
    };

    vm.initializeUserDefinedDataValuesDropdown = () => {
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
            vm.uddTypeObject.default_value_view = data.short_description;
            return (
              '<span class="c-black f-13"> ' +
              escape(data.short_description) +
              "</span>"
            );
          }
        }
      };
    };

    //get validation rules for mto type by uuid and set rules using valdr in application.context.js
    vm.getModelAndSetValidationRules = () => {
      if ($scope.uddObject.entity_id == 1) {
        vm.common.EntityDetails.API.GetModelAndSetValidationRules(
          vm.common.Identifiers.location_udd
        ).then(model => { });
      } else if ($scope.uddObject.entity_id == 7) {
        vm.common.EntityDetails.API.GetModelAndSetValidationRules(
          vm.common.Identifiers.item_udd
        ).then(model => { });
      } else if ($scope.uddObject.entity_id == 23) {
        vm.common.EntityDetails.API.GetModelAndSetValidationRules(
          vm.common.Identifiers.vendor_udd
        ).then(model => { });
      } else if ($scope.uddObject.entity_id == 314) {
        vm.common.EntityDetails.API.GetModelAndSetValidationRules(
          vm.common.Identifiers.mto_udd
        ).then(model => { });
      }
    };

    vm.getGroupHeadersList = () => {
      vm.itemUDDService.API.FetchGroupHeaders()
        .then(response => {
          vm.allGroupHeaders = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.refineGroupHeader = () => {
      vm.timeout(() => {
        if (
          !vm.addingGroupHeader &&
          vm.uddTypeObject &&
          !vm.uddTypeObject.group_header_id
        ) {
          vm.uddTypeObject.group_header = undefined;
          vm.isNoResult = false;
        }
      }, 100);
    };

    // if no group header text present, remove header id
    vm.toggleSuggestionList = () => {
      vm.uddTypeObject.group_header_id = null;
    };

    //on enter of group_header it will search for entity
    //if group_header is already present, then returns group_headers matching, else show option to add new group_header in UI will be shown
    vm.discoverGroupHeader = data => {
      let payload = {
        group_header: data.group_header
      };
      vm.addingGroupHeader = true;
      //If group_header is created, initialize message and error variable to null
      vm.itemUDDService.API.DiscoverGroupHeader(payload)
        .then(response => {
          //If records exists matching the vendor name, return 200 response, else if it is created, returns 201 response
          if (response.status === 200) {
            vm.uddTypeObject.group_header_id = response.data[0].id;
            vm.uddTypeObject.group_header = response.data[0].group_header;
          } else {
            vm.uddTypeObject.group_header_id = response.data.inserted_id;
            vm.uddTypeObject.group_header = payload.group_header;
            payload.id = vm.uddTypeObject.group_header_id;
            vm.allGroupHeaders.push(payload);
          }
          //After result is returned or created, group_header not found variable is reset to false
          vm.isNoResult = false;
          // After response set adding group header flag to false.
          vm.addingGroupHeader = false;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.getStatuses = () => {
      if (localStorage.getItem($scope.uuid + "_statuses") !== null) {
        $scope.statuses = JSON.parse(
          localStorage.getItem($scope.uuid + "_statuses")
        );
      } else {
        vm.statusService.getStatusList($scope.uuid).then(data => {
          $scope.statuses = data;
        });
      }
    };

    // generic function to get data for drop down from code list table
    vm.loadCodeListData = (uuid, fieldName, model, $q) => {
      var defer = $q.defer();
      vm.codeService.API.MultiSearchCodeList({
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

    // Initialize item type udd module
    vm.loadCodeList = () => {
      if ($scope.uddObject.entity_id == 7) {
        // Loading for All Entry levels
        vm.loadCodeListData(
          vm.common.Identifiers.item_udd,
          "Entry Level",
          "allEntryLevelUdd",
          vm.common.$q
        );
        // Loading for All Entry types
        vm.loadCodeListData(
          vm.common.Identifiers.item_udd,
          "Entry Type",
          "allEntryTypes",
          vm.common.$q
        );
      }
      if ($scope.uddObject.entity_id == 314) {
        // Loading for All Entry levels
        vm.loadCodeListData(
          vm.common.Identifiers.mto_udd,
          "UDD Entry Level",
          "allfieldnames",
          common.$q
        );
      }
      vm.loadCodeListData(
        vm.common.Identifiers.system_level,
        "UDD Required",
        "allRequired",
        vm.common.$q
      );
    };

    /** Get all the visibility options for Item UDD */
    vm.getUddVisibilityOptions = () => {
      vm.uddVisibilities = [];
      vm.itemUDDService.API.GetUDDVisibilityOptions()
        .then(response => {
          vm.isVisibilityOptionsChanged = false;
          vm.uddVisibilities = response;
          vm.visibilityIdMap = {};
          for (let i = 0; i < response.length; i++) {
            if (vm.visibilityIdMap[response[i].id] === undefined) {
              vm.visibilityIdMap[response[i].id] = response[i];
            }
          }
        })
        .catch(() => { });
    };

    vm.save = () => {
      vm.isProcessing = true;
      if (
        vm.uddTypeObject &&
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute" &&
        $scope.uddObject.format &&
        $scope.uddObject.format.toLowerCase() === "multiselect"
      ) {
        vm.uddTypeObject.default_value = vm.uddTypeObject.default_value_ids.join(",");
      } else if (
        vm.uddTypeObject &&
        vm.uddTypeObject.default_value_from &&
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        const toValue = vm.uddTypeObject.default_value_to ? `,${vm.uddTypeObject.default_value_to}` : '';
        vm.uddTypeObject.default_value = `${vm.uddTypeObject.default_value_from}${toValue}`;
      } else if (
        vm.uddTypeObject &&
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute" &&
        $scope.uddObject.format &&
        ($scope.uddObject.format.toLowerCase() === "value list" ||
          $scope.uddObject.format.toLowerCase() === "rating")
      ) {
        if (
          vm.attributeHierarchyValueModel &&
          vm.attributeHierarchyValueModel.value
        ) {
          vm.uddTypeObject.default_value =
            vm.attributeHierarchyValueModel.value;
        } else {
          vm.uddTypeObject.default_value = "";
        }
      }

      /**
       * $scope.uddObject.entity_id - 1 refers to 'Location'
       * $scope.uddObject.entity_id - 7 refers to 'Item'
       * $scope.uddObject.entity_id - 23 refers to 'Vendor'
       * $scope.uddObject.entity_id - 314 refers to 'MTO'
       */
      if ($scope.uddObject.entity_id == 1) {
        vm.uddTypeObject.location_type_ids = vm.entityTypeIds;
        vm.locationUDDService.API.BulkInsertLocationUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else if ($scope.uddObject.entity_id == 7) {
        vm.uddTypeObject.type_ids = vm.entityTypeIds;
        vm.itemUDDService.API.InsertItemUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else if ($scope.uddObject.entity_id == 23) {
        vm.uddTypeObject.vendor_type_ids = vm.entityTypeIds;
        vm.vendorUDDService.API.BulkInsertVendorUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else if ($scope.uddObject.entity_id == 314) {
        vm.uddTypeObject.option_type_ids = vm.entityTypeIds;
        vm.mtoUDDService.API.BulkInsertMTOUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else {
        vm.isProcessing = false;
      }
    };

    vm.update = () => {
      vm.isProcessing = true;
      if (
        vm.uddTypeObject.default_value_ids &&
        vm.uddTypeObject.default_value_ids.length &&
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute" &&
        $scope.uddObject.format &&
        $scope.uddObject.format.toLowerCase() === "multiselect"
      ) {
        vm.uddTypeObject.default_value = vm.uddTypeObject.default_value_ids.join(",");
      } else if (
        vm.uddTypeObject.default_value_from &&
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        const toValue = vm.uddTypeObject.default_value_to ? `,${vm.uddTypeObject.default_value_to}` : '';
        vm.uddTypeObject.default_value = `${vm.uddTypeObject.default_value_from}${toValue}`;
      } else if (
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute" &&
        $scope.uddObject.format &&
        ($scope.uddObject.format.toLowerCase() === "value list" ||
          $scope.uddObject.format.toLowerCase() === "rating")
      ) {
        if (
          vm.attributeHierarchyValueModel &&
          vm.attributeHierarchyValueModel.value
        ) {
          vm.uddTypeObject.default_value =
            vm.attributeHierarchyValueModel.value;
        } else {
          vm.uddTypeObject.default_value = "";
        }
      }

      /**
       * $scope.uddObject.entity_id - 1 refers to 'Location'
       * $scope.uddObject.entity_id - 7 refers to 'Item'
       * $scope.uddObject.entity_id - 23 refers to 'Vendor'
       * $scope.uddObject.entity_id - 314 refers to 'MTO'
       */
      if ($scope.uddObject.entity_id == 1) {
        vm.uddTypeObject.location_type_ids = vm.entityTypeIds;
        vm.locationUDDService.API.BulkUpdateLocationUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else if ($scope.uddObject.entity_id == 7) {
        vm.uddTypeObject.type_ids = vm.entityTypeIds;
        vm.itemUDDService.API.BulkUpdateItemUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else if ($scope.uddObject.entity_id == 23) {
        vm.uddTypeObject.vendor_type_ids = vm.entityTypeIds;
        vm.vendorUDDService.API.BulkUpdateVendorUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else if ($scope.uddObject.entity_id == 314) {
        vm.uddTypeObject.option_type_ids = vm.entityTypeIds;
        vm.mtoUDDService.API.BulkUpdateMTOUDD(vm.uddTypeObject)
          .then(() => {
            vm.isProcessing = false;
            vm.isConfigureSuccess = true;
          })
          .catch(error => {
            vm.errorMessage =
              error.data.error.error ||
              error.data.error.message ||
              error.data.error ||
              error.error ||
              error;
            vm.timeout(() => {
              vm.errorMessage = "";
              vm.isProcessing = false;
            }, 2000);
          });
      } else {
        vm.isProcessing = false;
      }
    };

    vm.configureUdd = () => {
      if (
        !$scope.uddObject.referer ||
        ($scope.uddObject.referer && $scope.uddObject.referer.toLowerCase() === "create")
      ) {
        vm.save();
      } else {
        vm.update();
      }
    };

    /**
     * End function of hierarchy tree view select
     * Assign the id of selected hierarchy value as default value
     */
    vm.end = data => {
      data.hierarchyValueData && data.hierarchyValueData.id
        ? (vm.uddTypeObject.default_value = data.hierarchyValueData.id)
        : "";
    };

    /* Function to reset selected default value */
    vm.resetDefaultValue = uddData => {
      uddData.default_value = "";
      uddData.url_default_value = "";
      uddData.text_default_value = "";
      uddData.default_value_from = "none";
      uddData.default_value_to = "";
      vm.attributeHierarchyValueModel = {
        value: ""
      };
      uddData.default_value_ids = [];
      if (
        uddData &&
        uddData.user_defined_data_type &&
        uddData.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        vm.isResetValue = true;
        vm.primaryHierarchyValueId = undefined;
        common.$timeout(() => {
          vm.isResetValue = false;
        }, 0);
      }
    };

    vm.ConfigureDefaultField = () => {
      common.$timeout(() => {
        angular.element("#maintenance_description").focus();
      }, 1000)
    }

    // add or remove entity type
    vm.toggleAddOrRemoveEntityType = (flagName, entityType, entityId) => {
      /**
       * entityId - 1 refers to 'Location'
       * entityId - 7 refers to 'Item'
       * entityId - 23 refers to 'Vendor'
       * entityId - 314 refers to 'MTO'
       */
      let typeId;
      if (entityId && entityId === 1) {
        typeId = "location_type_id";
      } else if (entityId && entityId === 7) {
        typeId = "type_id";
      } else if (entityId && entityId === 23) {
        typeId = "vendor_type_id";
      } else if (entityId && entityId === 314) {
        typeId = "option_type_id";
      }
      if (
        flagName &&
        flagName.toLowerCase() === "toggleall" &&
        vm.filteredEntityTypes.length === vm.entityTypes.length &&
        vm.entityTypes.length > vm.entityTypeIds.length
      ) {
        vm.entityTypeIds = [];
        vm.entityTypeIdsMap = {};
        vm.filteredEntityTypeIds = [];
        vm.filteredEntityTypeIdsMap = {};
        for (let index = 0; index < vm.entityTypes.length; index++) {
          vm.entityTypeIdsMap[vm.entityTypes[index].id] = {
            [typeId]: vm.entityTypes[index].id
          };
          vm.entityTypeIds.push(vm.entityTypes[index].id);
        }
      } else if (
        flagName &&
        flagName.toLowerCase() === "toggleall" &&
        vm.filteredEntityTypes.length === vm.entityTypes.length
      ) {
        vm.entityTypeIds = [];
        vm.entityTypeIdsMap = {};
        vm.filteredEntityTypeIds = [];
        vm.filteredEntityTypeIdsMap = {};
      } else if (
        flagName &&
        flagName.toLowerCase() === "toggleall" &&
        vm.filteredEntityTypes.length !== vm.entityTypes.length &&
        vm.filteredEntityTypes.length > vm.filteredEntityTypeIds.length
      ) {
        for (let index = 0; index < vm.filteredEntityTypes.length; index++) {
          if (
            vm.filteredEntityTypeIdsMap[vm.filteredEntityTypes[index].id] ===
            undefined
          ) {
            vm.filteredEntityTypeIdsMap[vm.filteredEntityTypes[index].id] = {
              [typeId]: vm.filteredEntityTypes[index].id
            };
            vm.filteredEntityTypeIds.push(vm.filteredEntityTypes[index].id);
            if (
              vm.entityTypeIdsMap[vm.filteredEntityTypes[index].id] ===
              undefined
            ) {
              vm.entityTypeIdsMap[vm.filteredEntityTypes[index].id] = {
                [typeId]: vm.filteredEntityTypes[index].id
              };
              vm.entityTypeIds.push(vm.filteredEntityTypes[index].id);
            }
          }
        }
      } else if (
        flagName &&
        flagName.toLowerCase() === "toggleall" &&
        vm.filteredEntityTypes.length !== vm.entityTypes.length
      ) {
        for (let index = 0; index < vm.filteredEntityTypes.length; index++) {
          if (
            vm.entityTypeIdsMap[vm.filteredEntityTypes[index].id] !== undefined
          ) {
            delete vm.entityTypeIdsMap[vm.filteredEntityTypes[index].id];
            vm.entityTypeIds.splice(
              vm.entityTypeIds.findIndex(
                entityTypeId =>
                  Number(entityTypeId) ===
                  Number(vm.filteredEntityTypes[index].id)
              ),
              1
            );
          }
        }
        vm.filteredEntityTypeIds = [];
        vm.filteredEntityTypeIdsMap = {};
      } else if (entityType) {
        if (vm.entityTypeIdsMap[entityType.id] === undefined) {
          vm.entityTypeIdsMap[entityType.id] = {
            [typeId]: entityType.id
          };
          vm.entityTypeIds.push(entityType.id);
        } else {
          delete vm.entityTypeIdsMap[entityType.id];
          vm.entityTypeIds.splice(
            vm.entityTypeIds.findIndex(
              entityTypeId => Number(entityTypeId) === Number(entityType.id)
            ),
            1
          );
        }
        vm.filteredEntityTypeIds = [];
        vm.filteredEntityTypeIdsMap = {};
      }
      vm.tooltipText = vm.entityTypeIds.length ? "" : "Please selet item types";
    };

    vm.onSearchChange = entityId => {
      /**
       * entityId - 1 refers to 'Location'
       * entityId - 7 refers to 'Item'
       * entityId - 23 refers to 'Vendor'
       * entityId - 314 refers to 'MTO'
       */
      let typeId;
      if (entityId && entityId === 1) {
        typeId = "location_type_id";
      } else if (entityId && entityId === 7) {
        typeId = "type_id";
      } else if (entityId && entityId === 23) {
        typeId = "vendor_type_id";
      } else if (entityId && entityId === 314) {
        typeId = "option_type_id";
      }
      vm.filteredEntityTypeIds = [];
      vm.filteredEntityTypeIdsMap = {};
      if (vm.filteredEntityTypes && vm.filteredEntityTypes.length) {
        for (let index = 0; index < vm.filteredEntityTypes.length; index++) {
          if (
            vm.entityTypeIdsMap[vm.filteredEntityTypes[index].id] !== undefined
          ) {
            vm.filteredEntityTypeIdsMap[vm.filteredEntityTypes[index].id] = {
              [typeId]: vm.filteredEntityTypes[index].id
            };
            vm.filteredEntityTypeIds.push(vm.filteredEntityTypes[index].id);
          }
        }
      }
    };

    // Check for Attribute / Hierarchy Values if Required is Immediate
    vm.checkForAttributeHierarchyValues = requiredValue => {
      if (
        requiredValue !== undefined &&
        requiredValue.toLowerCase() === "immediate" &&
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute" &&
        (!$scope.uddObject.attribute_value_count ||
          $scope.uddObject.attribute_value_count <= 0)
      ) {
        if ($scope.uddObject.has_values === 1) {
          vm.isBtnDissable = true;
          vm.errorMessage =
            "*Please add values for selected Attribute to proceed";
        } else {
          vm.isBtnEnable = true;
          vm.errorMessage = "";
        }
      } else if (
        requiredValue !== undefined &&
        requiredValue.toLowerCase() === "immediate" &&
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "hierarchy" &&
        (!$scope.uddObject.hierarchy_value_count ||
          $scope.uddObject.hierarchy_value_count <= 0)
      ) {
        vm.isBtnDissable = true;
        vm.errorMessage =
          "*Please add values for selected Hierarchy to proceed";
      } else {
        vm.isBtnDissable = false;
        vm.errorMessage = "";
      }
    };

    // get attribute values for selected attribute
    vm.fetchAttributeValuesByAttributeId = uddData => {
      vm.common.EntityDetails.API.GetGraphSet(
        vm.common.Identifiers.attribute_value,
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
          vm.attributeIdAndValuesMap[uddData.user_defined_data_id] = response;
          vm.attributeHierarchyOptionValuesArray =
            vm.attributeIdAndValuesMap[uddData.user_defined_data_id];
          vm.initializeUserDefinedDataValuesDropdown();
        })
        .catch(() => { });
    };

    /*
     * When user select User defined data i.e Attribute/Hierarchy/OptionType/Option
     * Load values and show corresponding fields
     */
    vm.getUserDefinedDataValues = (uddDetails, userDefinedDataId) => {
      vm.addValidationRules();
      vm.filterVisibilityOptionsList();
      uddDetails.user_defined_data_id = userDefinedDataId;
      if (
        uddDetails &&
        uddDetails.user_defined_data_type &&
        uddDetails.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          ($scope.uddObject.format.toLowerCase() === "value list" ||
            $scope.uddObject.format.toLowerCase() === "rating")
        ) {
          // if format is value list or rating type then load values for drop down
          vm.isValueList = true;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isDateRangeSelect = false;
          vm.isTextField = false;
          vm.isUrlField = false;
          vm.fetchAttributeValuesByAttributeId(uddDetails);
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "multiselect"
        ) {
          // if format is multiselect type then load values for drop down
          vm.isValueList = false;
          vm.isMultiselect = true;
          vm.isDateSelect = false;
          vm.isDateRangeSelect = false;
          vm.isTextField = false;
          vm.isUrlField = false;
          vm.fetchAttributeValuesByAttributeId(uddDetails);
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "date"
        ) {
          // if format is date type
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = true;
          vm.isDateRangeSelect = false;
          vm.isTextField = false;
          vm.isUrlField = false;
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "date range"
        ) {
          // if format is date range type
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isDateRangeSelect = true;
          vm.isTextField = false;
          vm.isUrlField = false;
          vm.fromValues = [{ field: "Current Date", value: "current" }, { field: "None", value: "none" }];
          // If given udd is of format date range, then get the default_value_from and default_value_to by splitting it by separator
          if (vm.uddTypeObject.default_value) {
            vm.uddTypeObject.default_value_from = vm.uddTypeObject.default_value.split(",")[0];
            vm.uddTypeObject.default_value_to = Number(vm.uddTypeObject.default_value.split(",")[1]);
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "text"
        ) {
          // if format is text type
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isDateRangeSelect = false;
          vm.isTextField = true;
          vm.isUrlField = false;
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "url"
        ) {
          // if format is text type
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isDateSelect = false;
          vm.isDateRangeSelect = false;
          vm.isTextField = false;
          vm.isUrlField = true;
          // If given udd is of format url, then get the text and url link by splitting it by separator
          if (vm.uddTypeObject.default_value) {
            let urlObject = vm.uddTypeObject.default_value.split("::");
            vm.uddTypeObject.text_default_value = urlObject[0];
            vm.uddTypeObject.url_default_value = urlObject[1];
          }
        } else if (userDefinedDataId) {
          vm.isValueList = false;
          vm.isMultiselect = false;
          vm.isTextField = false;
          vm.isDateSelect = false;
          vm.isDateRangeSelect = false;
          vm.isUrlField = false;
          vm.timeout(() => {
            angular.element("#default_value").focus();
          });
        }
      } else if (
        uddDetails &&
        uddDetails.user_defined_data_type &&
        uddDetails.user_defined_data_type.toLowerCase() === "hierarchy"
      ) {
        vm.isTextField = false;
        vm.isUrlField = false;
        // if user defined data type is hierarchy then load hierarchy values
        vm.isValueList = false;
        vm.primaryHierarchyId = undefined;
        common.$timeout(() => {
          vm.primaryHierarchyId = uddDetails.user_defined_data_id;
          vm.primaryHierarchyValueId = uddDetails.default_value
            ? uddDetails.default_value
            : undefined;
        }, 0);
      }
    };

    vm.fetchHierarchyValuesMappedById = () => {
      let data = vm.hierarchyValuesTreePathService.getMap().then(
        map => {
          vm.hierarchyValuesMap = map;
          vm.isHierarchyValueMap = true;
          return map;
        },
        error => {
          vm.logger.error(error);
        }
      );
      return data;
    };

    vm.getTreePath = (actualHierValId, path) => {
      let trimres = [];
      let tempVar = vm.hierarchyValuesTreePathService.getTreePath(
        vm.hierarchyValuesMap,
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

    // Fetch entity type by entity_id
    vm.fetchEntityTypesById = entityId => {
      /**
       * entityId - 1 refers to 'Location'
       * entityId - 7 refers to 'Item'
       * entityId - 23 refers to 'Vendor'
       * entityId - 314 refers to 'MTO'
       */
      if (entityId && entityId === 1) {
        vm.isEntityLoading = true;
        vm.locationTypeService.API.GetLocationTypes()
          .then(response => {
            vm.entityTypes = response.data;
            vm.isEntityLoading = false;
          })
          .catch(error => {
            vm.logger.error(error);
            vm.isEntityLoading = false;
          });
      } else if (entityId && entityId === 7) {
        vm.isEntityLoading = true;
        vm.itemTypeService.API.GetItemTypes()
          .then(response => {
            vm.entityTypes = response.data;
            /**
             * Load hierarchy values mapped by id for Product explorer hierarchy
             */
            let productExplorerValuesMap = vm.fetchHierarchyValuesMappedById();
            productExplorerValuesMap.then(result => {
              /**
               * For each item type, get tree path by item type id and path
               * Assign the hierarchy value to itemTypePath
               */
              for (let index = 0; index < vm.entityTypes.length; index++) {
                let PEValuesArray = vm.getTreePath(
                  vm.entityTypes[index].item_type_id,
                  vm.entityTypes[index].tree_path
                );
                vm.entityTypes[index].searchItemTypePath = PEValuesArray.join(
                  " "
                );
                vm.entityTypes[index].itemTypePath = PEValuesArray.join(
                  '<span class="p-l-5 p-r-5 zmdi zmdi-long-arrow-right arrow-style c-firebrick"></span>'
                );
              }
              vm.isEntityLoading = false;
            });
          })
          .catch(error => {
            vm.logger.error(error);
            vm.isEntityLoading = false;
          });
      } else if (entityId && entityId === 23) {
        vm.isEntityLoading = true;
        vm.vendorTypeService.API.GetVendorTypes()
          .then(response => {
            vm.entityTypes = response.data;
            vm.isEntityLoading = false;
          })
          .catch(error => {
            vm.logger.error(error);
            vm.isEntityLoading = false;
          });
      } else if (entityId && entityId === 314) {
        vm.mtoTypeService.API.GetMTOTypes()
          .then(response => {
            vm.entityTypes = response.data;
          })
          .catch(error => {
            vm.logger.error(error);
          });
      }
    };

    // Fetch entity udd by id
    vm.fetchEntityUDD = entityId => {
      /**
       * entityId - 1 refers to 'Location'
       * entityId - 7 refers to 'Item'
       * entityId - 23 refers to 'Vendor'
       * entityId - 314 refers to 'MTO'
       */
      if (entityId && entityId === 1) {
        vm.locationUDDService.API.GetLocationUDDByLOV("user_defined_data_id", [
          $scope.uddObject.id
        ])
          .then(response => {
            vm.entityTypeIds = [];
            vm.entityTypeIdsMap = {};
            vm.filteredEntityTypeIds = [];
            vm.filteredEntityTypeIdsMap = {};
            for (let index = 0; index < response.data.length; index++) {
              if (
                vm.entityTypeIdsMap[response.data[index].location_type_id] ===
                undefined
              ) {
                vm.entityTypeIdsMap[response.data[index].location_type_id] =
                  response.data[index];
                vm.entityTypeIds.push(response.data[index].location_type_id);
              }
            }
            if (response.data.length) {
              // assign status_id
              vm.uddTypeObject.status_id = response.data[0].status_id;
              // if user defined data type is 'Attribute' and format is 'Value list' or 'Rating'
              vm.attributeHierarchyValueModel = {
                value: response.data[0].default_value
              };
              // if user defined data type is 'Attribute' and format is 'Multiselect'
              vm.uddTypeObject.default_value_ids =
                response.data &&
                  response.data.length &&
                  response.data[0].default_value
                  ? response.data[0].default_value.split(",")
                  : [];
              // if user defined data type is 'Attribute' and format is not 'Multiselect' or 'Value list' or 'Rating'
              vm.uddTypeObject.default_value =
                response.data &&
                  response.data.length &&
                  response.data[0].default_value
                  ? response.data[0].default_value
                  : "";
              // assign required
              vm.uddTypeObject.required = response.data[0].required;
            }
          })
          .catch(error => {
            vm.logger.error(error);
          });
      } else if (entityId && entityId === 7) {
        vm.itemUDDService.API.GetItemUDDByLOV("user_defined_data_id", [
          $scope.uddObject.id
        ])
          .then(response => {
            vm.entityTypeIds = [];
            vm.entityTypeIdsMap = {};
            vm.filteredEntityTypeIds = [];
            vm.filteredEntityTypeIdsMap = {};
            for (let index = 0; index < response.data.length; index++) {
              // store entity type ids
              if (
                vm.entityTypeIdsMap[response.data[index].type_id] === undefined
              ) {
                vm.entityTypeIdsMap[response.data[index].type_id] =
                  response.data[index];
                vm.entityTypeIds.push(response.data[index].type_id);
              }
            }
            if (response.data.length) {
              vm.disableEntryLevelAndType = true;
              // assign status_id
              vm.uddTypeObject.status_id = response.data[0].status_id;
              // assign entry_level
              vm.uddTypeObject.entry_level = response.data[0].entry_level;
              // assign entry_type
              vm.uddTypeObject.entry_type = response.data[0].entry_type;
              vm.uddTypeObject.entryTypes = response.data[0].entry_type.split(",");
              // if user defined data type is 'Attribute' and format is 'Value list' or 'Rating'
              vm.attributeHierarchyValueModel = {
                value: response.data[0].default_value
              };
              // if user defined data type is 'Attribute' and format is 'Multiselect'
              vm.uddTypeObject.default_value_ids =
                response.data &&
                  response.data.length &&
                  response.data[0].default_value
                  ? response.data[0].default_value.split(",")
                  : [];
              // if user defined data type is 'Attribute' and format is not 'Multiselect' or 'Value list' or 'Rating'
              vm.uddTypeObject.default_value = response.data[0].default_value;
              // assign pe_filter_priority
              vm.uddTypeObject.pe_filter_priority =
                response.data[0].pe_filter_priority;
              // assign required
              vm.uddTypeObject.required = response.data[0].required;
              // assign is_important
              vm.uddTypeObject.is_important = response.data[0].is_important;
              // assign visibility_id
              vm.uddTypeObject.visibility_id = response.data[0].visibility_id;
              vm.uddTypeObject.visibilityIds = response.data[0].visibility_id
                .split(",")
                .map(Number);
              vm.uddTypeObject.group_header = response.data[0].group_header;
              vm.uddTypeObject.group_header_id =
                response.data[0].group_header_id;
            } else {
              vm.disableEntryLevelAndType = false;
            }
          })
          .catch(error => {
            vm.logger.error(error);
          });
      } else if (entityId && entityId === 23) {
        vm.vendorUDDService.API.GetVendorUDDByLOV("user_defined_data_id", [
          $scope.uddObject.id
        ])
          .then(response => {
            vm.entityTypeIds = [];
            vm.entityTypeIdsMap = {};
            vm.filteredEntityTypeIds = [];
            vm.filteredEntityTypeIdsMap = {};
            for (let index = 0; index < response.data.length; index++) {
              if (
                vm.entityTypeIdsMap[response.data[index].vendor_type_id] ===
                undefined
              ) {
                vm.entityTypeIdsMap[response.data[index].vendor_type_id] =
                  response.data[index];
                vm.entityTypeIds.push(response.data[index].vendor_type_id);
              }
            }
            if (response.data.length) {
              // assign status_id
              vm.uddTypeObject.status_id = response.data[0].status_id;
              // if user defined data type is 'Attribute' and format is 'Value list' or 'Rating'
              vm.attributeHierarchyValueModel = {
                value: response.data[0].default_value
              };
              // if user defined data type is 'Attribute' and format is 'Multiselect'
              vm.uddTypeObject.default_value_ids =
                response.data &&
                  response.data.length &&
                  response.data[0].default_value
                  ? response.data[0].default_value.split(",")
                  : [];
              // if user defined data type is 'Attribute' and format is not 'Multiselect' or 'Value list' or 'Rating'
              vm.uddTypeObject.default_value = response.data[0].default_value;
              // assign required
              vm.uddTypeObject.required = response.data[0].required;
            }
          })
          .catch(error => {
            vm.logger.error(error);
          });
      } else if (entityId && entityId === 314) {
        vm.mtoUDDService.API.GetMTOUDDByLOV("user_defined_data_id", [
          $scope.uddObject.id
        ])
          .then(response => {
            vm.entityTypeIds = [];
            vm.entityTypeIdsMap = {};
            vm.filteredEntityTypeIds = [];
            vm.filteredEntityTypeIdsMap = {};
            for (let index = 0; index < response.data.length; index++) {
              if (
                vm.entityTypeIdsMap[response.data[index].option_type_id] ===
                undefined
              ) {
                vm.entityTypeIdsMap[response.data[index].option_type_id] =
                  response.data[index];
                vm.entityTypeIds.push(response.data[index].option_type_id);
              }
            }
            if (response.data.length) {
              // assign status_id
              vm.uddTypeObject.status_id = response.data[0].status_id;
              // if user defined data type is 'Attribute' and format is 'Value list' or 'Rating'
              vm.attributeHierarchyValueModel = {
                value: response.data[0].default_value
              };
              // if user defined data type is 'Attribute' and format is 'Multiselect'
              vm.uddTypeObject.default_value_ids =
                response.data &&
                  response.data.length &&
                  response.data[0].default_value
                  ? response.data[0].default_value.split(",")
                  : [];
              // if user defined data type is 'Attribute' and format is not 'Multiselect' or 'Value list' or 'Rating'
              vm.uddTypeObject.default_value = response.data[0].default_value;
              // assign required
              vm.uddTypeObject.required = response.data[0].required;
              // assign entrylevel
              vm.uddTypeObject.entrylevel = response.data[0].entrylevel;
            }
          })
          .catch(error => {
            vm.logger.error(error);
          });
      }
    };

    /* If user defined data type is 'Attribute' then add validation rules based on selected attribute and its format */
    vm.addValidationRules = () => {
      let obj = {};
      if ($scope.type_udd_form && $scope.type_udd_form.default_value) {
        $scope.type_udd_form.default_value.$setUntouched();
      }
      let getConstraint;
      if ($scope.uddObject.entity_id === 1) {
        getConstraint = valdr.getConstraints()["RULES-11"];
      } else if ($scope.uddObject.entity_id === 7) {
        getConstraint = valdr.getConstraints()["RULES-32"];
      } else if ($scope.uddObject.entity_id === 23) {
        getConstraint = valdr.getConstraints()["RULES-22"];
      } else if ($scope.uddObject.entity_id === 314) {
        getConstraint = valdr.getConstraints()["RULES-41"];
      }
      if (
        vm.uddTypeObject &&
        vm.uddTypeObject.user_defined_data_id &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        // If user defined data type is 'Attribute' then only add validations
        let minimum;
        let maximum;
        $scope.uddObject && $scope.uddObject.max_to_value && $scope.uddObject.min_to_value
          ? (minimum = $scope.uddObject.min_to_value)
          : $scope.uddObject && $scope.uddObject.attribute_from_value
            ? (minimum = $scope.uddObject.attribute_from_value)
            : null;
        $scope.uddObject && $scope.uddObject.max_to_value && $scope.uddObject.min_to_value
          ? (maximum = $scope.uddObject.max_to_value)
          : $scope.uddObject && $scope.uddObject.attribute_to_value
            ? (maximum = $scope.uddObject.attribute_to_value)
            : null;
        if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "integer"
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
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "number select"
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
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          ($scope.uddObject.format.toLowerCase() === "decimal" ||
            $scope.uddObject.format.toLowerCase() === "percentage")
        ) {
          let msg = `Default value must be decimal between ${minimum} and ${maximum}.`;
          // If user defined data type is 'Attribute' and format is 'Decimal' or 'Percentage'
          let format = $scope.uddObject.format.toLowerCase();
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
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "dimension"
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
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "url"
        ) {
          let msg = `URL must be in a valid format.`;
          // If user defined data type is 'Attribute' and format is 'Dimension'
          getConstraint["url_default_value"] = {
            pattern: {
              value: /^((http|https):\/\/)?(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/,
              message: msg
            }
          };
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          ($scope.uddObject.format.toLowerCase() === "date")
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
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          ($scope.uddObject.format.toLowerCase() === "date range")
        ) {
          // If user defined data type is 'Attribute' and format is 'Dimension'
          getConstraint["default_value"] = {
            startAndEndDateCompare: {
              sval: minimum,
              eval: maximum,
              message: `Default value must be between ${minimum} and ${maximum}`
            }
          };
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "text"
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
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        } else {
          // If user defined data type is not 'Attribute' then remove validations
          delete getConstraint.default_value;
          if ($scope.uddObject.entity_id === 1) {
            obj["RULES-11"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 7) {
            obj["RULES-32"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 23) {
            obj["RULES-22"] = getConstraint;
          } else if ($scope.uddObject.entity_id === 314) {
            obj["RULES-41"] = getConstraint;
          }
        }
        valdr.addConstraints(obj);
      }
    };

    /*
     * for multiselect drop down for visibility, change view value based on selected values
     */
    vm.addVisibilityDescriptionOnMultiselect = dataObj => {
      dataObj.visibility = "";
      const selectedOptions = dataObj.visibility_id
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
    };

    // If user selects user defined data 'Attribute' with format as 'Text' then filter out PE Filter visibility option
    vm.filterVisibilityOptionsList = () => {
      if (
        vm.uddTypeObject.user_defined_data_type &&
        vm.uddTypeObject.user_defined_data_type.toLowerCase() === "attribute"
      ) {
        if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "text"
        ) {
          for (let i = vm.uddVisibilities.length - 1; i >= 0; i--) {
            if (
              vm.uddVisibilities[i].visibility.toLowerCase() === "pe filter"
            ) {
              vm.isVisibilityOptionsChanged = true;
              vm.uddVisibilities.splice(i, 1);
            }
          }
          vm.uddTypeObject.visibilityIds = undefined;
        } else if (
          $scope.uddObject &&
          $scope.uddObject.format &&
          $scope.uddObject.format.toLowerCase() === "url"
        ) {
          for (let i = vm.uddVisibilities.length - 1; i >= 0; i--) {
            if (
              vm.uddVisibilities[i].visibility.toLowerCase() === "pe filter"
            ) {
              vm.uddVisibilities.splice(i, 1);
            }
          }
        } else {
          if (vm.isVisibilityOptionsChanged) {
            vm.getUddVisibilityOptions();
          }
        }
      }
    };

    vm.getHierarchyValueCount = () => {
      vm.hierarchyValueService.API.GetHierarchyValueCountById(
        $scope.uddObject.id
      )
        .then(response => {
          $scope.uddObject.hierarchy_value_count =
            response.data.hierarchy_value_count;
        })
        .catch(() => { });
    };

    vm.activate = () => {
      vm.isConfigureSuccess = false;
      vm.entityTypeIds = [];
      vm.entityTypeIdsMap = {};
      vm.filteredEntityTypeIds = [];
      vm.filteredEntityTypeIdsMap = {};
      vm.uddTypeObject = {
        status_id: 200,
        user_defined_data_id: $scope.uddObject.id,
        maintenance_description: $scope.uddObject.description,
        default_value: "",
        required: "No"
      };
      if ($scope.uddObject.entity_id == 7) {
        vm.uddTypeObject.entry_level = "Item";
        vm.sortType = "itemTypePath";
        vm.filterByArray = ["searchItemTypePath"];
      }
      if ($scope.uddObject.entity_id == 314) {
        vm.uddTypeObject.entrylevel = "Choice";
      }
      vm.attributeHierarchyModel = {};
      vm.attributeHierarchyModel.id = vm.uddTypeObject.user_defined_data_id;
      if ($scope.uuid == 21) {
        vm.uddTypeObject.user_defined_data_type = "Attribute";
      } else if ($scope.uuid == 27) {
        vm.uddTypeObject.user_defined_data_type = "Hierarchy";
        vm.getHierarchyValueCount();
      }
      if (
        $scope.uddObject &&
        $scope.uddObject.referer &&
        $scope.uddObject.referer.toLowerCase() === "update"
      ) {
        vm.fetchEntityUDD($scope.uddObject.entity_id);
      } else if (
        $scope.uddObject &&
        $scope.uddObject.referer &&
        $scope.uddObject.referer.toLowerCase() === "create"
      ) {
        if ($scope.uddObject.entity_id == 7) {
          vm.uddTypeObject.is_important = $scope.uddObject.is_important;
        }
        if ($scope.uddObject.format && $scope.uddObject.format.toLowerCase() === "date range") {
          if (
            $scope.uddObject &&
            $scope.uddObject.min_to_value === undefined &&
            $scope.uddObject.max_to_value === undefined &&
            $scope.uddObject.attribute_to_value
          ) {
            $scope.uddObject.min_to_value = Number($scope.uddObject.attribute_to_value.split(",")[0]);
            $scope.uddObject.max_to_value = Number($scope.uddObject.attribute_to_value.split(",")[1]);
          }
        }
      }
      $scope.getStatuses();
      vm.loadCodeList();
      vm.getUddVisibilityOptions();
      vm.fetchEntityTypesById($scope.uddObject.entity_id);
      vm.getModelAndSetValidationRules();
      vm.getGroupHeadersList();
    };

    vm.activate();
  }

  // Directive
  (() => {
    "use strict";
    calculus.directive("configureUdd", configureUdd);

    function configureUdd() {
      var directive = {
        restrict: "E",
        controller: ConfigureUddController,
        controllerAs: "vm",
        scope: {
          uddObject: "=",
          uuid: "=",
          closeFn: "&",
          configureImg: "="
        },
        templateUrl:
          "application/directives/configureUdd/panel.configure.udd.html"
      };
      return directive;
    }
  })();
})();
