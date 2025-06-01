(() => {
  "use strict";
  angular
    .module("rc.prime.hierarchy")
    .controller("HierarchyController", HierarchyController);
  HierarchyController.$inject = [
    "$scope",
    "$stateParams",
    "valdr",
    "$window",
    "common",
    "EntityService",
    "HierarchyService",
    "LocationUDDService",
    "VendorUDDService",
    "MTOUDDService",
    "ItemUDDService",
    "paginationService",
    "StatusCodes"
  ];

  function HierarchyController(
    $scope,
    $stateParams,
    valdr,
    $window,
    common,
    EntityService,
    HierarchyService,
    LocationUDDService,
    VendorUDDService,
    MTOUDDService,
    ItemUDDService,
    paginationService,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    /** Common Modules */
    let $state = common.$state;
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("HierarchyController");

    vm.pagedetails = {};
    vm.returnValue = "";
    vm.showHierarchyForm = false;
    vm.isShowAdd = false;
    vm.isPrimaryItem = false;
    vm.isProductExplorer = false;
    vm.isBuyerHierarchy = false;
    vm.isPrimaryLocation = false;
    vm.isPricingClassification = false;
    vm.isAssortmentClassification = false;
    vm.isItemEntity = false;
    vm.isLocationEntity = false;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;

    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.isShowHistory = false;
    vm.showConfigureUdd = false;
    vm.uuid = "27";
    vm.hierarchy_value_uuid = "26";
    vm.item_uuid = "4";
    vm.location_uuid = "1";
    vm.isLoading = false;

    vm.sortType = "entity";
    vm.currentPage = 1;
    vm.pageSize = 100;

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.hierarchyGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          entity: {
            visible: true
          },
          description: {
            visible: true
          },
          shortDescription: {
            visible: true
          },
          as400_data_tag: {
            visible: true
          },
          specialHierarchy: {
            visible: true
          },
          hierarchyGroups: {
            visible: true
          },
          values: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.getEntityInformation = () => {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(_information => {
        vm.entityInformation = _information;
        $scope.name = vm.entityInformation.name;
        vm.getEntities();
        vm.getUddStatuses();
      });
    };

    vm.getUddStatuses = () => {
      $scope.statuses = JSON.parse(
        LocalMemory.API.Get(common.Identifiers.hierarchy + "_statuses")
      );
      if (!$scope.statuses || $scope.statuses.length === 0) {
        HierarchyService.API.FetchStatus()
          .then(response => {
            $scope.statuses = response.data;
            vm.mapStatuses(response.data);
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        vm.mapStatuses($scope.statuses);
      }
    };

    vm.mapStatuses = statuses => {
      vm.statusIdsMap = {};
      for (let i = 0; i < statuses.length; i++) {
        if (vm.statusIdsMap[statuses[i].code] === undefined) {
          vm.statusIdsMap[statuses[i].code] = statuses[i];
        }
      }
    };

    vm.ShowHideColumnSettings = () => {
      $timeout(() => {
        angular.element("#hideShowColumn").focus();
      }, 1000);      
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.initializeHierarchy = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.getPermissionsForUuid("hierarchyPermissions", vm.uuid);
    };

    // Get permissions of crud oprations for hierarchy
    vm.getPermissionsForUuid = (model, uuid) => {
      $scope
        .getAccessPermissions(uuid)
        .then(res => {
          vm.reload(); // Reloading once we have the crud permission loaded
          vm[model] = res;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //get JSON model and set validation rules for hierarchy
    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    vm.getEntities = () => {
      vm.allEntities = [];
      let entity_data = JSON.parse(LocalMemory.API.Get("entity_data"));
      if (entity_data && entity_data.length > 0) {
        for (let i = 0; i < entity_data.length; i++) {
          if (entity_data[i].master_data === 1) {
            vm.allEntities.push(entity_data[i]);
          }
        }
        vm.mapEntities(entity_data);
      } else {
        EntityService.API.GetMasterEntities()
          .then(response => {
            vm.allEntities = response;
            vm.mapEntities(response);
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.mapEntities = entities => {
      vm.entityIdsMap = {};
      for (let i = 0; i < entities.length; i++) {
        if (vm.entityIdsMap[entities[i].id] === undefined) {
          vm.entityIdsMap[entities[i].id] = entities[i];
        }
      }
    };

    vm.watchers = () => {
      $scope.$watch(
        angular.bind(vm.returnValue, () => {
          return vm.returnValue;
        }),
        function(value) {}
      );
    };

    vm.initializePayload = payload => {
      if (payload.is_primary_item_hierarchy_id === undefined) {
        payload.is_primary_item_hierarchy_id = 0;
      }
      if (payload.is_product_explorer_hierarchy_id === undefined) {
        payload.is_product_explorer_hierarchy_id = 0;
      }
      if (payload.is_buyer_hierarchy_id === undefined) {
        payload.is_buyer_hierarchy_id = 0;
      }
      if (payload.is_pricing_classification_group_id === undefined) {
        payload.is_pricing_classification_group_id = 0;
      }
      if (payload.is_primary_location_hierarchy_id === undefined) {
        payload.is_primary_location_hierarchy_id = 0;
      }
      if (payload.is_assortment_classification_group_id === undefined) {
        payload.is_assortment_classification_group_id = 0;
      }
      payload.is_primary_item_hierarchy = payload.is_primary_item_hierarchy_id;
      payload.is_product_explorer_hierarchy =
        payload.is_product_explorer_hierarchy_id;
      payload.is_pricing_classification_group =
        payload.is_pricing_classification_group_id;
      payload.is_primary_location_hierarchy =
        payload.is_primary_location_hierarchy_id;
      payload.is_assortment_classification_group =
        payload.is_assortment_classification_group_id;
      payload.is_buyer_hierarchy = payload.is_buyer_hierarchy;
    };

    vm.save = payload => {
      vm.initializePayload(payload);
      vm.saveBtnText = "Saving now...";
      HierarchyService.API.InsertHierarchy(payload)
        .then(response => {
          vm.openForm();
          payload.id = response.data.inserted_id;
          vm.rowsCount += 1;
          vm.Hierarchies.push(payload);
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          vm.previousH = payload;
        })
        .catch(error => {
          if (error.data.status === 505) {
            vm.error = true;
            vm.message = error.data.error;
          } else if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            vm.message = error.data.error.message;
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          $timeout(() => {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    //Focus
    vm.focusSearchField = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 2500);
    };

    vm.hasUpdateChanges = payload => {
      console.log(payload.is_group, $scope.old_details.is_group);
      if (
        $scope.old_details.description !== payload.description ||
        $scope.old_details.short_description !== payload.short_description ||
        $scope.old_details.entity_id !== payload.entity_id ||
        $scope.old_details.status_id !== payload.status_id ||
        payload.is_group !== $scope.old_details.is_group ||
        $scope.old_details.is_primary_location_hierarchy_id !==
          payload.is_primary_location_hierarchy_id ||
        $scope.old_details.is_pricing_classification_group_id !==
          payload.is_pricing_classification_group_id ||
        $scope.old_details.is_assortment_classification_group_id !==
          payload.is_assortment_classification_group_id ||
        $scope.old_details.is_primary_item_hierarchy_id !==
          payload.is_primary_item_hierarchy_id ||
        $scope.old_details.is_product_explorer_hierarchy_id !==
          payload.is_product_explorer_hierarchy_id ||
        $scope.old_details.is_buyer_hierarchy_id !==
          payload.is_buyer_hierarchy_id
      ) {
        if (
          $scope.old_details.is_product_explorer_hierarchy_id ==
          payload.is_product_explorer_hierarchy_id
        ) {
          delete payload.is_product_explorer_hierarchy;
        }
        if (
          $scope.old_details.is_primary_item_hierarchy_id ==
          payload.is_primary_item_hierarchy_id
        ) {
          delete payload.is_primary_item_hierarchy;
        }
        if (
          $scope.old_details.is_buyer_hierarchy_id ==
          payload.is_buyer_hierarchy_id
        ) {
          delete payload.is_buyer_hierarchy;
        }
        if (
          $scope.old_details.is_primary_location_hierarchy_id ==
          payload.is_primary_location_hierarchy_id
        ) {
          delete payload.is_primary_location_hierarchy;
        }
        if (
          $scope.old_details.is_pricing_classification_group_id ==
          payload.is_pricing_classification_group_id
        ) {
          delete payload.is_pricing_classification_group;
        }
        if (
          $scope.old_details.is_assortment_classification_group_id ==
          payload.is_assortment_classification_group_id
        ) {
          delete payload.is_assortment_classification_group;
        }
      } else {
        return false;
      }
    };

    vm.update = payload => {
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) !== false) {
        $scope.showhistory = false;
        HierarchyService.API.UpdateHierarchy(payload)
          .then(response => {
            vm.isShowHistory = false;
            payload.$edit = false;
            vm.Hierarchies[
              vm.Hierarchies.findIndex(hierarchy => hierarchy.id === payload.id)
            ] = payload;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              vm.message = error.data.error.message;
            }
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(() => {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(() => {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.delete = payload => {
      if (
        payload.is_primary_location_hierarchy_id === 1 ||
        payload.is_pricing_classification_group_id === 1 ||
        payload.is_assortment_classification_group_id === 1 ||
        payload.is_primary_item_hierarchy_id === 1 ||
        payload.is_product_explorer_hierarchy_id === 1 ||
        payload.is_buyer_hierarchy_id === 1
      ) {
        vm.error = true;
        vm.message = "Cannot delete special hierarchies.";
      } else {
        HierarchyService.API.DeleteHierarchy(payload)
          .then(response => {
            vm.isDeleteSuccess = true;
            vm.isConfirmDelete = false;
            vm.isDeleteConfirmation = false;
            vm.Hierarchies.splice(
              vm.Hierarchies.findIndex(
                hierarchy => hierarchy.id === payload.id
              ),
              1
            );
            vm.rowsCount -= 1;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              if (error.data.type.toLowerCase() === "dependency check") {
                vm.isDeleteConfirmation = true;
                vm.isDeleteSuccess = false;
                vm.isConfirmDelete = false;
              } else {
                vm.error = true;
                vm.message = error.data.error;
              }
            }
          });
      }
      $timeout(() => {
        vm.message = null;
      }, 2500);
    };

    vm.DeleteHierarchyAndItsDependencies = Hierarchy => {
      HierarchyService.API.DeleteHierarchyAndDependencies(Hierarchy.id)
        .then(result => {
          vm.isDeleteConfirmation = false;
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.isDeleteConfirmation = false;
          vm.isProcessing = false;
          vm.Hierarchies.splice(
            vm.Hierarchies.findIndex(
              hierarchy => hierarchy.id === Hierarchy.id
            ),
            1
          );
          vm.rowsCount -= 1;
        })
        .catch(error => {
          vm.isProcessing = false;
          vm.message = error.data.error;
        });
    };

    vm.ProceedHierarchyDeletion = hierarchy => {
      vm.isProcessing = true;
      if (hierarchy.entity.toLowerCase() === "item") {
        ItemUDDService.API.DeleteItemUDDAndBridgeValuesByHierarchy(hierarchy.id)
          .then(response => {
            vm.DeleteHierarchyAndItsDependencies(hierarchy);
          })
          .catch(error => {
            console.log(error);
          });
      } else if (hierarchy.entity.toLowerCase() === "location") {
        LocationUDDService.API.DeleteLocationUDDAndBridgeValuesByHierarchy(
          hierarchy.id
        )
          .then(response => {
            vm.DeleteHierarchyAndItsDependencies(hierarchy);
          })
          .catch(error => {
            console.log(error);
          });
      } else if (hierarchy.entity.toLowerCase() === "vendor") {
        VendorUDDService.API.DeleteVendorUDDAndBridgeValuesByHierarchy(
          hierarchy.id
        )
          .then(response => {
            vm.DeleteHierarchyAndItsDependencies(hierarchy);
          })
          .catch(error => {
            console.log(error);
          });
      } else if (hierarchy.entity.toLowerCase() === "made to orders") {
        MTOUDDService.API.DeleteMtoUDDAndBridgeValuesByHierarchy(hierarchy.id)
          .then(response => {
            vm.DeleteHierarchyAndItsDependencies(hierarchy);
          })
          .catch(error => {
            console.log(error);
          });
      }
    };

    vm.showconfirm = nodeForValue => {
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isDeleteConfirmation = false;
      vm.isUnauthorized = false;
    };

    vm.isLocationOrItemEntity = entity_id => {
      EntityService.API.GetEntityById(entity_id)
        .then(response => {
          if (response.uuid === parseInt(vm.item_uuid)) {
            vm.isItemEntity = true;
            vm.isLocationEntity = false;
          } else if (response.uuid === parseInt(vm.location_uuid)) {
            vm.isItemEntity = false;
            vm.isLocationEntity = true;
          } else {
            vm.isItemEntity = false;
            vm.isLocationEntity = false;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.isSpecialHierarchy = () => {
      HierarchyService.API.SearchHierarchy(
        "is_primary_item_hierarchy_id",
        1
      ).then(response => {
        if (response.length > 0) {
          vm.primary_item_id = response[0].id;
          vm.isPrimaryItem = false;
        } else {
          vm.isPrimaryItem = true;
        }
      });
      HierarchyService.API.SearchHierarchy(
        "is_product_explorer_hierarchy_id",
        1
      ).then(response => {
        if (response.length > 0) {
          vm.isProductExplorer = false;
          vm.product_explorer_id = response[0].id;
        } else {
          vm.isProductExplorer = true;
        }
      });
      HierarchyService.API.SearchHierarchy("is_buyer_hierarchy_id", 1).then(
        response => {
          if (response.length > 0) {
            vm.buyer_id = response[0].id;
            vm.isBuyerHierarchy = false;
          } else {
            vm.isBuyerHierarchy = true;
          }
        }
      );
      HierarchyService.API.SearchHierarchy(
        "is_primary_location_hierarchy_id",
        1
      ).then(response => {
        if (response.length > 0) {
          vm.isPrimaryLocation = false;
          vm.primary_location_id = response[0].id;
        } else {
          vm.isPrimaryLocation = true;
        }
      });
      HierarchyService.API.SearchHierarchy(
        "is_pricing_classification_group_id",
        1
      ).then(response => {
        if (response.length > 0) {
          vm.isPricingClassification = false;
          vm.pricing_group_id = response[0].id;
        } else {
          vm.isPricingClassification = true;
        }
      });
      HierarchyService.API.SearchHierarchy(
        "is_assortment_classification_group_id",
        1
      ).then(response => {
        if (response.length > 0) {
          vm.isAssortmentClassification = false;
          vm.assortment_classification_id = response[0].id;
        } else {
          vm.isAssortmentClassification = true;
        }
      });
    };

    vm.reload = refresh => {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.isLoading = true;
      $scope.selectedRow = null;
      HierarchyService.API.GetHierarchy()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.Hierarchies = response.data;
          if (
            $state.params.create !== undefined &&
            $state.params.create === true
          ) {
            vm.openForm();
          }
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.data.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
          }
          vm.isLoading = false;
          vm.paginationHandler(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoading = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    vm.gotoHierarchyValues = hierarchy => {
      $timeout(() => {
        angular.element("#hierarchy_back").focus();
      }, 1000);
      $scope.refreshed = true;
      $state.go("common.prime.hierarchy.value", {
        hierarchy_id: hierarchy.id
      });
    };

    vm.showHideFollowingArray = groupArray => {
      for (let i = 0; i < groupArray.length; i++) {
        groupArray[i].hideRows = !groupArray[i].hideRows;
      }
    };

    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#hierarchy_description").focus();
      }, 0);
    };

    vm.resetForm = () => {
      $scope.hierarchy_details = {};
      $scope.hierarchy_details["description"] = null;
      $scope.hierarchy_details["short_description"] = null;
      vm.setInitialState();
    };

    vm.goToCreateHierarchy = () => {
      vm.message = null;
      vm.showHierarchyForm = true;
      vm.isShowAdd = true;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;
      vm.isDeleteConfirmation = false;
      // Once we go to the new hierarchy screen set the isLocationEntity and isItemEntity values to false
      vm.isItemEntity = false;
      vm.isLocationEntity = false;
      vm.resetForm();
      $scope.hierarchy_details = {};
      vm.hierarchydetails_form = {};
      $scope.hierarchy_details.status_id = 200;
      $scope.hierarchy_details.status = "Active";
      vm.isSpecialHierarchy();
      $state.go("common.prime.hierarchy.new");
    };

    vm.goToUpdateHierarchyForm = hierarchy => {
      $scope.hierarchy_details = hierarchy;
      vm.dblClickAction($scope.hierarchy_details);
      $state.go("common.prime.hierarchy.update", { id: hierarchy.id });
    };

    vm.getHierarchyById = () => {
      HierarchyService.API.GetHierarchyById($stateParams.id)
        .then(response => {
          $scope.hierarchy_details = response;
          vm.dblClickAction($scope.hierarchy_details);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.openForm = () => {
      vm.message = null;
      vm.showHierarchyForm = true;
      vm.isShowAdd = true;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;
      vm.isDeleteConfirmation = false;
      // vm.hierarchydetails_form.$setPristine();
      vm.resetForm();
      vm.isSpecialHierarchy();
    };

    //Create after save
    vm.createAnotherForm = () => {
      vm.saveBtnText = "Save";
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.hierarchy_details = {};
      //Setting previously entered data to the new context
      $scope.hierarchy_details.status_id = vm.previousH.status_id;
      $scope.hierarchy_details.entity_id = vm.previousH.entity_id;
      vm.setInitialState();
    };

    vm.closeForm = () => {
      vm.showHierarchyForm = false;
      vm.saveBtnText = "Save";
      vm.updateBtnText = "Update";
      vm.updateBtnError = false;
      $state.go("common.prime.hierarchy");
      $timeout(() => {
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        vm.isDeleteConfirmation = false;
        vm.message = null;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    // Function for open configure udd panel
    vm.openConfigureUddPanel = (referedPage, hierarchyObject) => {
      if (hierarchyObject && hierarchyObject.id) {
        vm.hierarchyUdd = hierarchyObject;
        vm.hierarchyUdd.referer = referedPage;
        vm.showConfigureUdd = true;
            $timeout(() => {
          angular.element("#select_item_type").focus();
        }, 1000);
      } else if (vm.previousH) {
        HierarchyService.API.GetHierarchyById(vm.previousH.id)
          .then(response => {
            vm.hierarchyUdd = response;
            vm.hierarchyUdd.referer = referedPage;
            vm.showConfigureUdd = true;
                $timeout(() => {
              angular.element("#select_item_type").focus();
            }, 1000);
          })
          .catch(error => {
            logger.error(error);
          });
              $timeout(() => {
          angular.element("#select_item_type").focus();
        }, 1000);
      }
      vm.exit();
    };

    // Function for close configure udd panel
    vm.closeConfigureUddPanel = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 500);
      vm.showConfigureUdd = false;
      vm.hierarchyUdd = {};
    };

    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = hierarchy => {
      $scope.hierarchy_details = _.clone(hierarchy);
      $scope.old_details = _.clone(hierarchy);
      vm.message = null;
      vm.isUnauthorized = false;
      vm.showHierarchyForm = true;
      vm.isShowAdd = false;
      vm.isShowHistory = true;
      vm.isConfirmDelete = false;
      vm.isDeleteConfirmation = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.showConfigureUdd = false;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.showHierarchyForm = true;
      vm.isLocationOrItemEntity(hierarchy.entity_id);
      vm.isSpecialHierarchy();
      //vm.setHierarchyOrGroup();
    };

    /*  vm.setHierarchyOrGroup = () => {
      console.info($scope.hierarchy_details,$scope.hierarchy_details.group_or_hierarchy)
      if ($scope.hierarchy_details.group_or_hierarchy === "hierarchy") {
        vm.is_hierarchy = true;
        $scope.hierarchy_details.is_group = 0;
      } else if ($scope.hierarchy_details.group_or_hierarchy === "group") {
        vm.is_group = false;
        $scope.hierarchy_details.is_group = 1;
      }
    }; */

    //Get history details for hierarchy
    $scope.loadHistory = () => {
      $scope.showhistoryloading = true; // Loading history until get the response
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        $scope.hierarchy_details.id
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

    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
      $scope.showhistoryloading = false;
      $timeout(() => {
        angular.element("#hierarchy_description").focus();
        },1000)
    };

    //Set default values if not entered
    vm.setDefaultShortDescription = () => {
      if (
        $scope.hierarchy_details.short_description === undefined ||
        $scope.hierarchy_details.short_description === null ||
        $scope.hierarchy_details.short_description.length === 0
      ) {
        $scope.hierarchy_details.short_description = $scope.hierarchy_details
          .description
          ? $scope.hierarchy_details.description
          : $scope.hierarchy_details.short_description; //short description set default as description
        vm.hierarchydetails_form.short_description.$setDirty(); //after setting short description, field is set as dirty
      }
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.paginationHandler(num);
    };

    //Get the hierarchy indexes to show number of hierarchy displayed per page
    vm.paginationHandler = page => {
      page !== undefined ? (vm.currentPage = page) : null;
      if (page === 1) {
        vm.rowsFound =
          "Displaying " +
          (vm.Hierarchies.length === 0 ? 0 : 1) +
          " - " +
          (vm.Hierarchies.length < vm.pageSize
            ? vm.Hierarchies.length
            : vm.pageSize) +
          " Of " +
          vm.Hierarchies.length +
          " Records";
      } else {
        let start =
          parseInt(page) * parseInt(vm.pageSize) - parseInt(vm.pageSize) + 1;
        let end =
          parseInt(page) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          parseInt(vm.pageSize);
        vm.rowsFound =
          "Displaying " +
          start +
          " -" +
          (end < vm.Hierarchies.length ? end : vm.Hierarchies.length) +
          " Of " +
          vm.Hierarchies.length +
          " Records";
      }
    };

    vm.exit = () => {
      $state.go("common.prime.hierarchy");
    };

    let MainClass = () => {
      vm.getColumns = selectedEntity => {
        return { model: "hiercols", values: $scope.hiercols };
      };
    };

    $scope.MainClass = MainClass();
    vm.initializeHierarchy();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
    $scope.dblClickAction = vm.dblClickAction;
  }
})();
