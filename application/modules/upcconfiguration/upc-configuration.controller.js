(() => {
  "use strict";
  angular.module("rc.prime.upcconfigurations")
    .controller("UpcConfigurationController", UpcConfigurationController);
  UpcConfigurationController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "CodeService",
    "HierarchyService",
    "HierarchyValueService",
    "HierarchyValuesTreePathService",
    "ItemTypeService",
    "StatusCodes",
    "UserService",
    "TemplateService",
    "CloudCartService",
    "VendorService",
    "SKUService",
    "SkuOptionHeaderService"
  ];

  function UpcConfigurationController(
    $scope,
    $stateParams,
    common,
    CodeService,
    HierarchyService,
    HierarchyValueService,
    HierarchyValuesTreePathService,
    ItemTypeService,
    StatusCodes,
    UserService,
    TemplateService,
    CloudCartService,
    VendorService,
    SKUService,
    SkuOptionHeaderService
  ) {
    var vm = this;
    let $state = common.$state;
    let $timeout = common.$timeout;
    let logger = common.Logger.getInstance("UpcConfigurationController");
    let NotificationService = common.Notification;
    vm.common = common;
    vm.$stateParams = $stateParams;

    vm.uuid = "30";
    vm.entityInformation = {};
    $scope.productExplorerHierarchyValues = [];
    vm.itemTypesMap = {};

    //variables used for create/update/delete forms
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isDeleteSuccess = false;
    vm.isConfirmDelete = false;

    vm.isHierarchyValueMap = false;

    vm.message = null;
    vm.isShowHistory = false;
    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;
    vm.isBtnEnable = true;

    //variables used for delete dependencies
    vm.dependencyList = [];
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;

    //variables used for pagination/sorting
    vm.isColumnSettingsVisible = false;
    vm.sortType = "itemTypePath";
    vm.currentPage = 1;
    vm.pageSize = 100;

    //variable to toggle the sku list side panel
    vm.showSKUList = false;

    // variable to hold one of the details of system configuration settings
    vm.allowCollectionDetails

    vm.setGridProperties = function () {
      vm.itemTypeGrid = {
        columns: {
          sku_id: {
            visible: true
          },
          sku_number:{
            visible: true
          },
          vendor_id: {
            visible: true
          },
          vendor_item_description: {
            visible: true
          },
          upc_number: {
            visible: true
          }
        }
      };
    };

    //Fetch permission to clone item type for the logged in user by code
    vm.fetchFeatureAccessPermission = () => {
      UserService.API.IsAllowedFeaturedPassword("item-type-clone")
        .then(result => {
          if (result.data && result.data.length) {
            vm.isCloneAllowed = true;
          } else {
            vm.isCloneAllowed = false;
          }
        })
        .catch(error => {
          console.error(error);
        });
    };

    // get system configuration settings by code
    vm.getSystemConfigurationSettings = (code) => {
      UserService.API.GetSystemConfigurationSettingsByCode(code)
        .then(response => {
          if (response && response.data) {
            if (code === "allow_collection_attributes") {
              vm.allowCollectionDetails = JSON.parse(JSON.stringify(response.data[0]));
            }
          }
        })
        .catch(error => {
          console.info(error);
        });
    }

    vm.openClonePanel = type => {
      this.cloneMessage = null;
      this.cloneError = null;
      this.type = type;
      this.showLockedScreen = true;
      this.isShowClonePanel = true;
      vm.new_type = {};
      vm.new_type.status_id = 100;
      vm.fetchExistingTypeIds();
    };

    vm.fetchExistingTypeIds = () => {
      vm.itemTypeIds = [];
      _.each(vm.itemTypes, itemType => {
        vm.itemTypeIds.push(itemType.item_type_id);
      });
    };

    vm.cloneItemType = () => {
      vm.isCloning = true;
      ItemTypeService.API.CloneItemType({
        id: vm.type.id,
        item_type_id: vm.new_type.item_type_id,
        is_clone_udd: vm.isCloneUdds,
        status_id: vm.new_type.status_id
      })
        .then(validatedResult => {
          if (validatedResult.status === 201) {
            this.showLockedScreen = false;
            this.secondaryPassword = "";
            this.isSaveSuccess = true;
            vm.reload();
            $timeout(() => {
              vm.fetchExistingTypeIds();
              vm.cloneError = null;
              vm.new_type.item_type_id = undefined;
            }, 2500);
          }
          vm.isCloning = false;
        })
        .catch(error => {
          vm.cloneError = error.data.error.message;
          $timeout(() => {
            vm.cloneError = null;
            vm.isCloning = false;
          }, 3000);
        });
    };

    // initializing Item type module
    vm.initializeItemType = () => {
      this.statusCodes = StatusCodes;
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.GetProductExplorerHierarchy();
      vm.fetchFeatureAccessPermission();
      // get details for allow_collection_attributes
      vm.getSystemConfigurationSettings("allow_collection_attributes")

      // vm.getupcdata();
      let promise = vm.reload();
      promise.then(response => {
        $stateParams.item_type_id &&
          $state.current.name.includes("itemtype.update")
          ? vm.gotoUpdateStateIfIdExist()
          : null;
      });
    };

    vm.getupcdata = () => {
      ItemTypeService.API.GetUPCdata()
        .then(response => {
          vm.itemTypes = response;
        })
    }

    //Get information required for item type entity by uuid , statically stored in application.context.js file
    vm.getEntityInformation = () => {
      common.EntityDetails.API.GetEntityInformation(vm.uuid).then(
        lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.item);
          vm.getSKUPricingChoices();
        }
      );
    };

    //get validation rules for item type by uuid and set rules using valdr in application.context.js
    vm.getModelAndSetValidationRules = () => {
      common.EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => { });
    };

    vm.getSKUPricingChoices = () => {
      CloudCartService.API.GetSKUPricingChoices()
        .then(response => {
          vm.skuPricingChoices = response.data;
        })
        .catch(error => {
          logger.error(error);
        })
    }

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

    /**
     * @param {Boolean} refresh true/false
     * @description On page load or on "Refresh" button click this will be called.
     * If refresh value is true the message with record number, response time take will be shown in UI
     */
    vm.reload = refresh => {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.checkAll = false;
      $scope.selectedRow = null;
      vm.isLoaded = false;
      let data = ItemTypeService.API.GetUPCdata()
        .then(response => {
          vm.isDisabled = false; // On click of "Refresh" button, make the "Maintain UDD" button disabled.
          vm.rowsCount = response.length;
          vm.itemTypes = response;
          vm.isLoaded = true;
          /**
           * Load hierarchy values mapped by id for Product explorer hierarchy
           */
          let productExplorerValuesMap = vm.FetchHierarchyValuesMappedById();
          productExplorerValuesMap.then(result => {
            /**
             * For each item type, get tree path by item type id and path
             * Assign the hierarchy value to itemTypePath variable for search ,sort and display by path
             */
            // for (let i = 0; i < vm.itemTypes.length; i++) {
            //   let PEValuesArray = vm.getTreePath(
            //     vm.itemTypes[i].item_type_id,
            //     vm.itemTypes[i].tree_path
            //   );
            //   vm.itemTypes[i].searchItemTypePath = PEValuesArray.join(" ");
            //   vm.itemTypes[i].itemTypePath = PEValuesArray.join(
            //     '<span class="p-l-5 p-r-5 zmdi zmdi-long-arrow-right arrow-style c-firebrick"></span>'
            //   );
            // }
          });

          vm.enableGoToAllTypeUDD = true;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
            this.focusSearchField();
          }
          // vm.createTypesListMap(response.data);
          vm.updateTableInformation(1); // show table information like no. of records
          return response;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = false;
            vm.isViewAuthorized = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          vm.isLoaded = true;
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
      return data;
    };

    //Focus
    vm.focusSearchField = () => {
      this.common.$timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000)
    };

    vm.GetProductExplorerHierarchy = function () {
      if (vm.productExplorerId === undefined) {
        HierarchyService.API.SearchHierarchy(
          "is_product_explorer_hierarchy_id",
          1
        )
          .then(result => {
            vm.isPrimaryHierarchyLoaded = true;
            if (result.length > 0) {
              vm.productExplorerId = result[0].id;
            }
          })
          .catch(error => {
            vm.error = error;
            logger.error(error);
          });
      }
    };

    //mapping all data into key-value pair
    vm.createTypesListMap = list => {
      vm.typesMap = [];
      for (let i = 0; i < list.length; i++) {
        let vt = list[i];
        if (vm.typesMap[vt.id] === undefined) {
          vm.typesMap[vt.id] = vt;
        }
      }
    };

    ////////// check all select box implementation
    // vm.enableDisable = () => {
    //   for (let i = 0; i < vm.itemTypes.length; i++) {
    //     // Underscore Library function
    //     if (vm.itemTypes[i].check) {
    //       vm.isDisabled = true;
    //       vm.enableGoToAllTypeUDD = true;
    //     } else {
    //       vm.isDisabled = false;
    //     }
    //   }
    // };

    vm.enableDisable = function () {
      _.some(vm.itemTypes, function (itemtp, i) {
        // Underscore Library function
        if (itemtp.check) {
          vm.enableGoToAllTypeUDD = true;
          vm.isDisabled = true;
          return true;
        } else {
          vm.isDisabled = false;
        }
      });
    };

    vm.enableOrDisableCheckboxes = flag => {
      _.each(vm.itemTypes, function (d) {
        d.check = flag;
      });
      vm.enableDisable();
      if (flag == 1) {
        vm.showmoveupdown = true;
      } else {
        vm.showmoveupdown = false;
      }
    };

    //navigate to item type pricing class groups list for selected type id
    vm.showPriceClassificationList = (typeId, desc) => {
      $state.go("common.prime.itemtypepricegroup", {
        item_type_id: typeId,
        item_type_description: desc
      });
    };

    //get buyer hierarchy values
    vm.getBuyerHierarchyValues = () => {
      HierarchyValueService.API.SearchHierarchyValue("is_buyer_hierarchy", "1")
        .then(res => {
          vm.buyerValues = res;
          vm.buyer_hierarchy_id = res[0].hierarchy_id;
          vm.buyer_hierarchy_desc = res[0].hierarchy;
        })
        .catch(err => { });
    };

    // Directive Send Data back to controller
    $scope.getBuyerHierarchyPath = data => {
      vm.buyer_id = data.hierarchyValueData.id;
      vm.buyer = data.path_name;
      vm.buyer_hierarchy_value_id = data.hierarchyValueData.id;
      $scope.checkBuyerId(vm.buyer_id);
    };

    $scope.checkBuyerId = currentBuyerId => {
      if (vm.previousBuyerId != currentBuyerId) {
        vm.IsupdateVendorReorder = false;
        vm.IsupdateBuyer = true;

        $("#vendorChangeModal").modal("show");
      }
    };

    vm.fetchInventoryMethods = () => {
      VendorService.API.FetchInventoryMethods()
        .then(response => {
          vm.inventoryMethods = response;
        })
        .catch(error => {
          console.log(error);
        })
    }

    //check If hunt path is allowed for selected sku inventory
    vm.isSkuHuntPathAlowed = (id) => {
      //Set is hunt path to false initially
      vm.isHuntPath = false;

      //For each inventory method, check if the selected inventory can allow hunt path
      _.each(vm.inventoryMethods, inventory_method => {
        //If inventory id and selected code can allow SKU hunt path
        if (
          inventory_method.id === parseInt(id) &&
          ((inventory_method.code &&
            inventory_method.code.toLowerCase() === "rf") ||
            (inventory_method.code &&
              inventory_method.code.toLowerCase() === "sorf"))
        ) {
          vm.isHuntPath = true;
        }
      });
      if (vm.new_type && vm.new_type.default_hunt_path_id) {
        vm.new_type.inventory_calculation = 1;
      } else {
        vm.new_type.inventory_calculation = 0;
      }
      vm.getRuleTypes();
      vm.getHuntPathTypes();
    };

    //Fetch rule type when the selected inventory is Carried by retailer
    vm.getRuleTypes = () => {
      SKUService.API.GetRuleTypes()
        .then(response => {
          vm.rule_types = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Fetch hunt path type when the selected inventory is Carried by retailer
    vm.getHuntPathTypes = () => {
      SKUService.API.GetHuntPathTypes()
        .then(response => {
          vm.hunt_path_types = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getSKUOptions = () => {
      SkuOptionHeaderService.API.SearchSkuHeaders(
        "item_type_id",
        vm.new_type.item_type_id)
        .then(response => {
          vm.skuOptions = response.data.data;
        }).catch(error => {
          console.log(error);
        })
    }


    vm.FetchHierarchyValuesMappedById = function () {
      let data = HierarchyValuesTreePathService.getMap().then(
        map => {
          vm.hierarachyValuesMap = map;
          vm.isHierarchyValueMap = true;
          return map;
        },
        error => {
          logger.error(error);
        }
      );

      return data;
    };

    vm.getTreePath = function (actualHierValId, path) {
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

    ///// Entity save update delete implementation

    //prepare data to create/update new item type
    vm.prepareData = data => {
      data.allow_sales =
        data.allow_sales_id === undefined ? 0 : parseInt(data.allow_sales_id);
      data.allow_MTOs =
        data.allow_MTOs_id === undefined ? 0 : parseInt(data.allow_MTOs_id);
      data.inventory_control =
        data.inventory_control_id === undefined
          ? 0
          : parseInt(data.inventory_control_id);
      data.allow_purchasing =
        data.allow_purchasing_id === undefined
          ? 0
          : parseInt(data.allow_purchasing_id);
      data.allow_collection =
        data.allow_collection_id === undefined
          ? 0
          : parseInt(data.allow_collection_id);
      data.multiple_skus =
        data.multiple_skus_id === undefined
          ? 0
          : parseInt(data.multiple_skus_id);
      data.no_inventory_check =
        data.no_inventory_check === undefined
          ? 0
          : parseInt(data.no_inventory_check);
      return data;
    };



    //save new item type
    vm.save = payload => {
      vm.saveBtnText = "Saving now...";
      payload = vm.prepareData(payload);
      vm.isBtnEnable = false;
      payload.default_buyer_id = (vm.buyer_id && vm.buyer_id != undefined) ? vm.buyer_id : null;
      ItemTypeService.API.InsertItemType(payload)
        .then(response => {
          vm.previousLT = payload;
          vm.saveBtnText = "Done";
          vm.isSaveSuccess = true;
          vm.isBtnEnable = true;
          vm.reload();
          vm.storePEHierarchyValueTree();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.message = NotificationService.errorNotification(error);
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          common.$timeout(() => {
            vm.isBtnEnable = true;
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    //check if the payload is different from old form data. if it is then return true.
    vm.hasUpdateChanges = payload => {
      if (
        vm.oldItemTypeDetails.item_type_id !== payload.item_type_id ||
        vm.oldItemTypeDetails.status_id !== payload.status_id ||
        vm.oldItemTypeDetails.allow_sales_id !== payload.allow_sales_id ||
        vm.oldItemTypeDetails.allow_MTOs_id !== payload.allow_MTOs_id ||
        vm.oldItemTypeDetails.inventory_control_id !==
        payload.inventory_control_id ||
        vm.oldItemTypeDetails.allow_purchasing_id !==
        payload.allow_purchasing_id ||
        vm.oldItemTypeDetails.allow_collection_id !==
        payload.allow_collection_id ||
        vm.oldItemTypeDetails.multiple_skus_id !== payload.multiple_skus_id ||
        vm.oldItemTypeDetails.no_inventory_check !== payload.no_inventory_check ||
        vm.oldItemTypeDetails.default_pricing_choice_id !== payload.default_pricing_choice_id ||
        vm.oldItemTypeDetails.default_buyer_id !== payload.default_buyer_id ||
        vm.oldItemTypeDetails.default_inventory_method_id !== payload.default_inventory_method_id ||
        vm.oldItemTypeDetails.default_hunt_path_id !== payload.default_hunt_path_id ||
        vm.oldItemTypeDetails.default_rule_id !== payload.default_rule_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    // check if the default fields are different from old form data. if it is then return true.
    vm.isDefaultFieldsUpdated = payload => {
      vm.isDefaultFieldUpdated = false;
      vm.isDefaultPricingChoiceUpdated = false;
      vm.isDefaultBuyerUpdated = false;
      vm.isDefaultInventoryMethodUpdated = false;
      if (vm.oldItemTypeDetails.default_pricing_choice_id !== payload.default_pricing_choice_id) {
        vm.isDefaultFieldUpdated = true;
        vm.isDefaultPricingChoiceUpdated = true;
      }
      if (vm.oldItemTypeDetails.default_buyer_id !== payload.default_buyer_id) {
        vm.isDefaultFieldUpdated = true;
        vm.isDefaultBuyerUpdated = true;
      }
      if (
        vm.oldItemTypeDetails.default_inventory_method_id !== payload.default_inventory_method_id ||
        vm.oldItemTypeDetails.default_hunt_path_id !== payload.default_hunt_path_id ||
        vm.oldItemTypeDetails.default_rule_id !== payload.default_rule_id
      ) {
        vm.isDefaultFieldUpdated = true;
        vm.isDefaultInventoryMethodUpdated = true;
      }
      if (vm.isDefaultFieldUpdated) {
        return true;
      }
      return false;
    };

    //update item type
    vm.update = (payload, isConfirmDefaultFieldsChange) => {
      payload = vm.prepareData(payload);
      payload.default_buyer_id = (vm.buyer_id && vm.buyer_id != undefined) ? vm.buyer_id : null;
      if (payload.default_inventory_method_id == 5) { // Inventory method - Not Stocked
        payload.default_rule_id = null;
        payload.default_rule = null;
        payload.default_hunt_path_id = null;
        payload.default_hunt_path = null;
      } else if (vm.isHuntPath && payload.default_hunt_path_id) {
        payload.default_rule_id = null;
        payload.default_rule = null;
        payload.default_hunt_path = vm.hunt_path_types.find(
          huntPath => huntPath.id == payload.default_hunt_path_id
        ).type;
      } else if (payload.default_inventory_method_id != null) {
        payload.default_hunt_path_id = null;
        payload.default_hunt_path = null;
        payload.default_rule = vm.rule_types.find(
          rule => rule.id == payload.default_rule_id
        ).rulename;
      }
      if (vm.hasUpdateChanges(payload) === true) {
        if (isConfirmDefaultFieldsChange || !vm.isDefaultFieldsUpdated(payload)) {
          if (isConfirmDefaultFieldsChange) {
            if (vm.isDefaultPricingChoiceUpdated) {
              payload.defaultPricingChoiceChanged = vm.defaultPricingChoiceChanged
            }
            if (vm.isDefaultBuyerUpdated) {
              payload.defaultBuyerChanged = vm.defaultBuyerChanged
            }
            if (vm.isDefaultInventoryMethodUpdated) {
              payload.defaultInventoryMethodChanged = vm.defaultInventoryMethodChanged
            }
          }
          vm.isBtnEnable = false;
          vm.updateBtnText = "Updating Now...";
          ItemTypeService.API.UpdateItemType(payload)
            .then(response => {
              let index = vm.itemTypes.findIndex(
                itemType => itemType.id === payload.id
              );
              vm.itemTypes[index] = response.data.data;
              vm.typesMap[$stateParams.item_type_id] = response.data.data;
              let PEValuesArray = vm.getTreePath(
                response.data.data.item_type_id,
                response.data.data.tree_path
              );
           
              vm.itemTypes[index].itemTypePath = PEValuesArray.join(
                '<span class="p-l-5 p-r-5 zmdi zmdi-long-arrow-right arrow-style c-firebrick"></span>'
              );
              vm.itemTypes[index].searchItemTypePath = PEValuesArray.join(" ");
              $scope.closeShowHistory();
              payload.$edit = false;
              vm.isShowHistory = false;
              vm.updateBtnText = "Done";
              vm.isUpdateSuccess = true;
              vm.isDisabled = false; // on update after selecting an entity type, disable Maintain UDD button.
              vm.enableOrDisableCheckboxes(0); // Remove entity type selection when maintain udd button is disabled.
              vm.oldItemTypeDetails = null;
              vm.isBtnEnable = true;
              vm.storePEHierarchyValueTree();
              vm.isDefaultFieldUpdated = false;
              vm.isDefaultPricingChoiceUpdated = false;
              vm.isDefaultBuyerUpdated = false;
              vm.isDefaultInventoryMethodUpdated = false;
            })
            .catch(error => {
              if (error.status === 403) {
                vm.isUnauthorized = true;
              } else if (
                error.status === 412 &&
                error.data.type === "_check_dependency"
              ) {
                vm.isUpdateDependencyError = true;
                vm.dependencyList = NotificationService.errorNotification(error);
                vm.isUpdateSuccess = false;
                vm.showDependencyDetails = true;
              } else {
                vm.message = NotificationService.errorNotification(error);
                vm.isUpdateSuccess = false;
                //vm.showDependencyDetails = true;
              }
              vm.updateBtnText = "Oops.!! Something went wrong";
              vm.updateBtnError = true;
              common.$timeout(() => {
                vm.isBtnEnable = true;
                vm.message = null;
                vm.updateBtnText = "Update";
                vm.updateBtnError = false;
              }, 2500);
            });
        }
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        common.$timeout(function () {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
          vm.isUpdateDependencyError = false;
        }, 1000);
      }
    };

    //delete item type
    vm.delete = payload => {
      ItemTypeService.API.DeleteItemType(payload)
        .then(() => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.itemTypes.findIndex(
            itemType => itemType.id === payload.id
          );
          vm.itemTypes.splice(index, 1);
          delete vm.typesMap[$stateParams.item_type_id];
          vm.rowsCount--;
          vm.updateTableInformation(1);
          $scope.lastPageTableRecordDeleteAction($scope.setinstance);
          vm.storePEHierarchyValueTree();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (error.status === 412) {
            vm.isDeleteDependencyError = true;
            vm.dependencyList = NotificationService.errorNotification(error);
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          } else {
            vm.message = NotificationService.errorNotification(error);
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          }
        });
    };

    /* Get product explorer hierarchy values list */
    vm.storePEHierarchyValueTree = () => {
      TemplateService.API.GetNodes()
        .then(response => {
          // Key-value map of hierarchy value id and data
          vm.hierarchyValuesMap = JSON.parse(response.lookup);
          // Division/Department/Class tree structure
          vm.nodesDetails = response.results;
          common.SessionMemory.API.Post("item_types", JSON.stringify(vm.nodesDetails));
          common.SessionMemory.API.Post(
            "item_type_maps",
            JSON.stringify(vm.hierarchyValuesMap)
          );
        })
        .catch(error => {
          logger.error(error);
        });
    };

    ////////// view manipaulation ////////
    //on click of delete button in update form, delete confirmation panel should be shown
    vm.showconfirm = () => {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    //show dependency details in side panel for selected dependent entity
    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    //for navigation to the udd page, creates array of ids of selected item types
    vm.goToAllTypeUDD = () => {
      let typeIds = [];
      _.each(vm.itemTypes, function (loc) {
        if (loc.check) {
          typeIds.push(loc.id);
        }
      });
      $state.go("common.prime.itemtypeudd", {
        item_type_id: typeIds.join(",")
      });
    };

    //focus will be set to the first field of form
    vm.setInitialState = entityName => {
      common.$timeout(function () {
        angular.element("#productExplorerId").focus();
      }, 1000);
    };

    //Open create new item type form
    vm.openForm = () => {
      vm.showTreeViewPanel = false;
      vm.GetProductExplorerHierarchy();
      vm.getBuyerHierarchyValues(); // get buyer hierarchy values
      vm.fetchInventoryMethods();
      vm.buyer_id = undefined;
      $state.go("common.prime.itemtype.new");
      vm.saveBtnText = "Save";
      vm.new_type = {};
      vm.setInitialState();
    };

    //toggle Hide/Show column panel
    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //show create new item type form on click of create another button after a new record created.
    vm.createAnotherForm = () => {
      vm.saveBtnText = "Save";
      vm.isSaveSuccess = false;
      vm.new_type = {};
      //Setting Previously entered data to the new context
      vm.new_type.status_id = vm.previousLT.status_id;
      vm.buyer_id = null;
      vm.buyer = null;
      vm.buyer_hierarchy_value_id = null;
      vm.setInitialState();
    };

    //Close form and success/error messages in the form
    vm.closeForm = () => {
      vm.isSaveSuccess = false;
      vm.isShowClonePanel = false;
      $state.go("common.prime.itemtype");
      vm.message = null;
      vm.showDependencyDetailsData = false;
      common.$timeout(() => {
        vm.isUnauthorized = false;
        vm.showDependencyDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    //close dependency details panel only
    vm.closeDependencyDetails = () => {
      vm.showDependencyDetailsData = false;
    };

    //close dependency list panel and show update form
    vm.closeDependencyList = () => {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isShowHistory = true;
      vm.isConfirmDelete = false;
    };

    //highlight the clicked row in table
    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/meesage in the form will be closed.
    vm.dblClickAction = itemType => {
      vm.showTreeViewPanel = false;
      vm.GetProductExplorerHierarchy();
      vm.getBuyerHierarchyValues(); // get buyer hierarchy values
      vm.fetchInventoryMethods();
      $state.go("common.prime.itemtype.update", {
        item_type_id: itemType.id
      });

      /* On open of update form close clear dependencies and close dependency panel */
      vm.dependencyList = [];
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;

      vm.isDeleteDependencyError = false;
      vm.isUpdateDependencyError = false;

      vm.isUnauthorized = false;
      vm.isShowHistory = true; //show View History link in update form
      vm.isUpdateSuccess = false; //close success page on opening of update form

      ///close delete page/success message and show update form when double clicked on any record
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;

      vm.isBtnEnable = true; //enable update button
      vm.updateBtnText = "Update";
      vm.new_type = _.clone(itemType);
      vm.buyer_id = vm.new_type.default_buyer_id
      vm.oldItemTypeDetails = _.clone(itemType);
      vm.setInitialState(); //set focus in first field  of update form
      $scope.closeShowHistory(); //close view update history panel
      vm.isDefaultFieldUpdated = false;
      vm.isDefaultPricingChoiceUpdated = false;
      vm.isDefaultBuyerUpdated = false;
      vm.isDefaultInventoryMethodUpdated = false;
    };

    //check if selected id is present in data. if yes, goto update state
    vm.gotoUpdateStateIfIdExist = () => {
      if (vm.typesMap[$stateParams.item_type_id]) {
        vm.dblClickAction(vm.typesMap[$stateParams.item_type_id]);
      } else {
        vm.closeForm();
      }
    };

    vm.toggleSKUListPanel = itemTypeData => {
      vm.selectedItemTypeData = itemTypeData;
      vm.showSKUList = !vm.showSKUList;
      vm.fetchItemTypeInsights(itemTypeData);
    };

    vm.openGenerateReportPanel = itemType => {
      vm.selectedItemTypeData = itemType;
      vm.selectedItemTypeData.divisionDepartmentClass = itemType.searchItemTypePath.split(
        " "
      );
      vm.showGenerateReportPanel = true;
      vm.errorMessage = null;
      vm.exportSkusCount = undefined;
      vm.getSkuCountByItemType(itemType.id);
    };

    vm.exportDataForType = typeId => {
      if (vm.exportSkusCount) {
        let payload = { type_id: typeId }
        SKUService.API.ExportSKUData(payload)
          .then(response => {
            vm.isButtonDisabled = true;
            vm.message =
              "Request created to generate item export report successfully. You will be notified once the report generation is successful.";
            common.$timeout(() => {
              vm.message = null;
              vm.isButtonDisabled = false;
              vm.showGenerateReportPanel = false;
            }, 3000);
          })
          .catch(error => {
            vm.isButtonDisabled = false;
          });
      } else {
        vm.errorMessage = "Can not be exported! SKUs does not exist for selected Item type";
        common.$timeout(() => {
          vm.errorMessage = null;
        }, 5000)
      }
    };

    vm.getSkuCountByItemType = (typeId) => {
      let query = {
        item_type_id: typeId,
        status_id: [100, 200, 400, 500]
      }
      vm.isButtonDisabled = true;
      SKUService.API.GetSKUCountToBeExported(query)
        .then(response => {
          vm.isButtonDisabled = false;
          vm.exportSkusCount = response[0].sku_count;
        })
        .catch(error => {
          logger.error(error)
        });
    }

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    // fetch sku count information(insights) for item type
    vm.fetchItemTypeInsights = itemType => {
      if (!itemType.insights) {
        vm.loadingInsights = true;
        vm.groupWiseSkuCount = {};
        ItemTypeService.API.GetInsightsByTypeId(itemType.id)
          .then(response => {
            itemType.insights = response.data;
            itemType.totalSkuCount = 0;
            for (let i = 0; i < itemType.insights.length; i++) {
              itemType.totalSkuCount += itemType.insights[i].sku_count;
              if (
                vm.groupWiseSkuCount[itemType.insights[i].sku_sub_type] ===
                undefined
              ) {
                vm.groupWiseSkuCount[itemType.insights[i].sku_sub_type] =
                  itemType.insights[i].sku_count;
              } else {
                vm.groupWiseSkuCount[itemType.insights[i].sku_sub_type] +=
                  itemType.insights[i].sku_count;
              }
            }
            vm.loadingInsights = false;
          })
          .catch(error => {
            vm.loadingInsights = false;
            logger.error(error);
          });
      }
    };

    // show table information like no. of records with or without search filter.
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
          " - " +
          (end < vm.rowsCount ? end : vm.rowsCount) +
          " Of " +
          vm.rowsCount +
          " Records";
      }
    };

    /**
     * Hierarchy tree view panel show or close
     * Based on the value selected in the hierarchy tree view panel
     */
    vm.toggleTreeViewPanel = flag => {
      vm.showTreeViewPanel = flag.currentFlag;
    };

    /**
     * End function of hierarchy tree view select for item type
     * Assign the id of selected hierarchy value as item type id
     */
    $scope.end = data => {
      if (data.hierarchyValueData) {
        vm.new_type === undefined ? (vm.new_type = {}) : null;
        vm.new_type.item_type_id = data.hierarchyValueData.id;
        vm.getSKUOptions();
        $scope.selectedTreeItem = true;
      }
    };

    // close the show update history panel
    $scope.closeShowHistory = () => {
      this.common.$timeout(() => {
        angular.element("#istatus_id").focus();
      }, 1000)
      $scope.showhistory = false;
      $scope.showhistoryloading = false;
    };

    //shows all update history for selected record
    $scope.loadHistory = () => {
      $scope.showhistoryloading = true; // Loading history until get the response
      common.EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.new_type.id
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

    $scope.getAccessPermissions(vm.uuid)
      .then(() => {
        activate();
      })
      .catch(() => {
        activate();
      });

    function activate() {
      vm.setGridProperties();
      vm.initializeItemType();
      // Move-UP Down Arrow functions
      $scope.reloadMethodDisplayValues = vm.goToAllTypeUDD;
      $scope.setClickedRow = vm.setClickedRow;
      $scope.dblClickAction = vm.dblClickAction;
    }
  }
})();