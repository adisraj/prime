(() => {
  "use strict";
  angular
    .module("rc.prime.sku")
    .controller("SKUMaintenanceController", SKUMaintenanceController);
  SKUMaintenanceController.$inject = [
    "$rootScope",
    "$scope",
    "$stateParams",
    "$window",
    "AttributeValueService",
    "HierarchyValueService",
    "CodeService",
    "common",
    "DataLakeService",
    "DataLakeAPIService",
    "ItemService",
    "MTOChoiceService",
    "MTOService",
    "SkuOptionHeaderService",
    "SKUService",
    "SkuOptionDetailService",
    "JobsService",
    "UserService",
    "HangTagFactory",
    "$element",
    "StatusCodes",
    "VendorService",
    "EntityService",
    "OrderAdvisorServices",
    "OrderHelpTextService",
    "CloudCartService",
    "SKUSetService",
    "ItemSetService",
    "$location",
    "$interval",
    "GlobalRegularExpression",
    "AS400FieldsRegularExpression",
    "$http"
  ];

  function SKUMaintenanceController(
    $rootScope,
    $scope,
    $stateParams,
    $window,
    AttributeValueService,
    HierarchyValueService,
    CodeService,
    common,
    DataLakeService,
    DataLakeAPIService,
    ItemService,
    MTOChoiceService,
    MTOService,
    SkuOptionHeaderService,
    SKUService,
    SkuOptionDetailService,
    JobsService,
    UserService,
    HangTagFactory,
    $element,
    StatusCodes,
    VendorService,
    EntityService,
    OrderAdvisorServices,
    OrderHelpTextService,
    CloudCartService,
    SKUSetService,
    ItemSetService,
    $location,
    $interval,
    GlobalRegularExpression,
    AS400FieldsRegularExpression,
    $http
  ) {
    let vm = this;
    vm.skuReturnValue = "";
    vm.entityInformation = {};
    vm.error = {};
    vm.previousSKU = {};
    vm.message = null;
    vm.new_sku = null;
    vm.skuPageDetails = {};
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.isShowHistory = false;
    vm.isSKUGrid = true;
    vm.statusCodes = StatusCodes;
    vm.skudataAddToQueueError = null;
    vm.$location = $location;
    vm.OrderAdvisorServices = OrderAdvisorServices.OrderAdvisor;
    vm.globalRegularExpression = GlobalRegularExpression;
    vm.as400FieldsRegularExpression = AS400FieldsRegularExpression;
    this.$showOLDetails = false;
    this.$saveOLBtnText = "Save";
    this.$saveOLBtnError = false;
    this.previousOL = {};
    this.$rootScope = $rootScope;
    vm.roles = JSON.parse(common.SessionMemory.API.Get("user_role"));
    vm.entityInformation = {};
    vm.uuid = "44";
    vm.isAddedToQueue = false;
    vm.attributeValuesMap = {};
    $scope.skuHeadersMap = {};
    vm.mtoOptionsMap = {};
    vm.mtoOptionChoicesMap = {};
    $scope.sku_headers = [];
    $scope.uddValidationErrors = [];
    vm.showTags = false;
    $scope.skuLoadingUDD = false;
    vm.upc_number = "";
    vm.original_upc = "";
    vm.applyFiltersBtnLabel = "Apply Filters";
    $scope.UpdateBtnText = "Update";
    vm.filters = {};
    vm.appliedFilterCount = 0;
    $scope.drop = {};
    vm.isshowEditSku = false;
    vm.productAssortmentValuesMap = {};
    vm.updateAssortmentObject = {
      id: null,
      group_id: null,
      in_inventory: 0,
      on_display: 0,
      sellable: 0,
      viewable: 0
    };
    vm.assortmentObject = {};

    vm.sortType = "id";
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.rowCount = 0;
    vm.isGroupByApplied = false;
    /** Common Modules */
    let $filter = common.$filter;
    let $q = common.$q;
    let $state = common.$state;
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let Identifiers = common.Identifiers;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("SKUMaintenanceController");
    let PreviousState = common.PreviousState;
    let Notification = common.Notification;
    vm.showAdvancedSKU = false;
    vm.editSKUPanel = false;
    vm.isViewAuthorized = true;
    vm.$state = $state;
    vm.groupSkus = [];
    vm.groupSkusMap = [];
    vm.sortByField = "none";
    vm.sortByOrder = "desc";
    vm.selectedGroupHeader = [];
    //Variable is used for assigning in the timeout function.
    let timeout;
    vm.isLoaded = false;
    vm.isAllLoaded = false;
    vm.isUpdatePage = false;
    vm.upcalreadyexists = false;
    vm.isColumnSettingsVisible = false;
    vm.groupByField = null;
    $scope.notification = {};
    vm.showFilter = false; //Variable to hide the Advanced Search panel initially
    vm.advancedSearchPanel = false;
    vm.conditionForEmpty = false;
    vm.showInstallationPanel = false;
    vm.thumbnailActive = false
    vm.numberCannotExeed = false
    vm.oneSequence = false
    vm.sequenceChangeError = false
    vm.firstValue = 0
    vm.arrayList = []
    vm.showgroupByMenu = false; //Used to toggle the right side group by panel
    vm.applyFilterSuccess = true;
    vm.invalidCheckDigit = false;
    //variables used in sku vendor configuration
    vm.linkVendor = {};
    vm.locationValue = {};
    this.labelValue = {};
    vm.vendorsList = [];
    vm.assortmentGroupIds = [];
    vm.assortmentLabelIds = [];
    vm.sku_description = [];
    vm.isVendorBtnEnable = true;
    vm.updateVendorBtnText = "Update";
    vm.currentVendorInList = {};
    vm.isGroupByFilterApplied = false;
    // Variable to show if the Transfer SKU panel is open
    vm.isShowMoveSKUPanel = false;
    vm.vendorPurchaseUUID = 104;
    vm.currentSkuId = 0;
    // Variable to hold the access value for 'sku-clone' from user management
    vm.isCloneAllowed = false;
    vm.isLoadingDelete = false;
    vm.isCloneSkucreate = false;
    // variable to save cover image as thumbnail
    vm.is_thumbnail = 1;
    // variable to call confirmation panel on cover image deletion
    vm.showConfirmDeletion = false;
    vm.showConfirmThumbnailDeletion = false;
    $scope.isDropUploaded = false;
    // On create, variable to call confirmation panel on cover image deletion
    vm.DeletionConfirmation = false;
    vm.DeletionThumbnailConfirmation = false;
    vm.isSaveSuccess = false;
    vm.disableActions = false;
    /**API Endpoint */

    // variable to that helps to navigate to sku view page, when application got refreshed in retail page
    $scope.needToReturnSkuView = false;
    vm.inventory_methods = null;

    this.$rootScope.$on("showeditsku", (e, flag) => {
      this.isshowEditSku = true;
    })

    this.isContinueSkustatus = false;
    this.$rootScope.$on("continueStatus", (e, flag) => {
      if (vm.changingstatus) {
        this.isContinueSkustatus = true;
        vm.reloadUDDs();
      }
      if (vm.changingnextstatus) {
        $scope.changeevent($scope.skuHead)
      }
      vm.changingdate = vm.changingnextdate = vm.changingnextstatus = vm.changingstatus = false;
      vm.LoadingSecndryAuth = false;
    })
    /**variable declaration */
    vm.setPageLimit = () => {
      vm.limit = 100;
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //Set Values valid for sorting
    $scope.sortableFields = [{
      field: "Sort By None",
      value: ""
    },
    {
      field: "Description",
      value: "description"
    },
    {
      field: "SKU Type",
      value: "sku_type"
    },
    {
      field: "SKU Number",
      value: "sku"
    },
    {
      field: "SKU Option",
      value: "option_list_name"
    },
    {
      field: "Status",
      value: "status"
    },
    {
      field: "Next Status",
      value: "next_status"
    }
    ];

    //Searchable options initialization start
    $scope.selectSkuOptionConfiguration = {
      valueField: "id",
      labelField: "name",
      searchField: ["name"],
      sortField: "name",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select SKU Option" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: $scope.sku_headers,
      render: {
        option: (data, escape) => {
          if (data.status_id === vm.statusCodes.Inactive.ID) {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.name) +
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
              escape(data.name) +
              "</span>" +
              "<span>" +
              "</span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.status) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: (data, escape) => {
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.name) +
            "</span>"
          );
        }
      }
    };

    $scope.selectHuntPath = {
      valueField: "id",
      labelField: "type",
      searchField: ["type"],
      sortField: "type",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Hunt Path" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: vm.hunt_path_types,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.type) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
        item: (data, escape) => {
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.type) +
            "</span>" +
            "</div>"
          );
        }
      }
    };
    $scope.selectRule = {
      valueField: "id",
      labelField: "rulename",
      searchField: ["rulename"],
      sortField: "rulename",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Rule" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: vm.rule_types,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.rulename) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
        item: (data, escape) => {
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.rulename) +
            "</span>" +
            "</div>"
          );
        }
      }
    };
    $scope.selectStockPlusPricing = {
      valueField: "id",
      labelField: "description",
      searchField: ["description"],
      sortField: "description",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Stock Plus Pricing SKU" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: $scope.sku_list,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.description) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
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
    //Searchable options intialization end

    vm.focusThreeDotMenu = () => {
      $timeout(() => {
        angular.element("#three_dot_menu").focus();
      }, 1000);
    }

    vm.focusSearchFieldAdvance = () => {
      $timeout(() => {
        angular.element("#sku_drop")[0].children[0].childNodes[0].focus();
      }, 1000)
    }

    vm.loadOrderHelpTextDropdown = () => {
      // Configure Order Help Text select object
      $scope.selectOrderHelpText = {
        valueField: "id",
        labelField: "title",
        searchField: ["title"],
        sortField: "title",
        //Space is added to so that end of the text does not cut off
        placeholder: "Select Order Help Title" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        options: $scope.orderAdvisorHeaders,
        render: {
          option: (data, escape) => {
            return (
              '<div class="p-5">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.title) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          },
          item: (data, escape) => {
            return (
              '<div class="d-flex">' +
              '<span class="title m-r-5">' +
              escape(data.title) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    }

    vm.initSKU = () => {
      //If sku view permission is true then load the skus for the selected item
      if (vm.skuPermissions.view) {
        vm.setPageLimit();
        vm.getallSKUs();
        vm.selected_item_id = $stateParams.item_id;
        LocalMemory.API.Post("MovedItemId", null);
        vm.getItemById(vm.selected_item_id)
          .then(() => {
            vm.reloadSKUCountAndList();
          })
          .catch(() => { });
        vm.getEntityInformation();
        vm.getModelAndSetValidationRules();
        $scope.skuTypes = ["Stock", "Stock Plus", "MTO"];
        vm.loadCodeListData(vm.uuid, "Status", "allSKUStatus", $q); // Loading for All Status
        vm.getAttributeValues();
        vm.getMTOOptions();
        vm.getMTOChoices();
        vm.fetchFeatureAccessDetails();
        $("#skuSelectionModel").modal("hide");
        $scope.getStatuses(common.Identifiers.item); //GET current statuses for item
        $scope.getNextStatuses(common.Identifiers.item); //GET next statuses for item
        vm.hasUserAccessToPE();
      } else {
        vm.isLoaded = true;
        vm.selected_item_id = $stateParams.item_id;
        LocalMemory.API.Post("MovedItemId", null);
        vm.getItemById(vm.selected_item_id).then(() => { }).catch(() => { });
        vm.getEntityInformation();
      }
    };


    // Fetch access for clone
    vm.fetchFeatureAccessDetails = () => {
      UserService.API.IsAllowedFeaturedPassword("sku-clone")
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
      UserService.API.IsAllowedFeaturedPassword("sku-edit")
        .then(result => {
          if (result.data && result.data.length) {
            vm.skueditFeature = result.data;
            vm.isSkueditAllowed = true;
          } else {
            vm.isSkueditAllowed = false;
          }
        })
        .catch(error => {
          console.error(error);
        });
      vm.ChangestatusFeature();
    };

    vm.ChangestatusFeature = () => {
      UserService.API.IsAllowedFeaturedPassword("SKU Status")
        .then(result => {
          if (result.data && result.data.length) {
            vm.editStatusRole = true;
            var feature_pass = result.data.filter(res => res.allow_featured_password == 1);
            if (feature_pass?.length) vm.alloweditstatuspassword = 1;
            else vm.alloweditstatuspassword = 0;
          } else {
            vm.editStatusRole = false;
            vm.alloweditstatuspassword = false;
          }
        })
        .catch(error => {
          console.error(error);
        });
    }

    vm.editskuFeature = () => {
      vm.isshowEditSku = false;
      if (vm.isSkueditAllowed && vm.skueditFeature && vm.skueditFeature.length) {
        if (vm.skueditFeature[0].allow_featured_password) {
          vm.showLockedScreen = true;
        }
        else {
          vm.showLockedScreen = false;
          vm.isshowEditSku = true;
        }
      }
    }

    //Initialize Create and Update Forms
    vm.InitializeCreateUpdateForm = () => {
      if (!$stateParams.id && $scope.skuHead && $scope.skuHead.id && $state.current.name.includes(".new")) {
        $scope.skuSuccessMessage = "SKU is created Successfully";
      }

      vm.assortmentForm = false;
      vm.selected_item_id = $stateParams.item_id;
      vm.inventory_methods = null;
      $scope.getStatuses(common.Identifiers.item); //GET current statuses for item
      $scope.getNextStatuses(common.Identifiers.item); //GET next statuses for item
      vm.getItemById(vm.selected_item_id).then(() => {
        vm.isValuesLoaded = false;
        vm.getInventories($stateParams.skutype).then(() => {
          $timeout(() => {
            vm.fetchItemTypeByGraph();
            vm.getHuntPathTypes();
            vm.getRuleTypes();
          }, 1000)
        }).catch(() => { });
        vm.getSKUPricingChoices().then(() => { }).catch(() => { });
      }).catch(() => { });
    };

    vm.getSKUPricingChoices = () => {
      return new Promise((resolve, reject) => {
        CloudCartService.API.GetSKUPricingChoices()
          .then(response => {
            vm.skuPricingChoices = response.data;
            resolve(true);
          })
          .catch(error => {
            reject(false);
            logger.error(error);
          })
      });
    }

    // Reset not applied filter arrays.
    vm.resetUnusedFilterArrays = refresh => {
      (vm.filters.skuNumbers && !vm.filters.skuNumbers.length) ?
        (delete vm.filters.skuNumbers) :
        "";
      (vm.filters.skuOptionIds && !vm.filters.skuOptionIds.length) ?
        (delete vm.filters.skuOptionIds) :
        "";
      (vm.filters.inventoryMethodIds && !vm.filters.inventoryMethodIds.length) ?
        (delete vm.filters.inventoryMethodIds) :
        "";
      (vm.filters.skuDescription && !vm.filters.skuDescription.length) ?
        (delete vm.filters.skuDescription) :
        "";
      (vm.filters.currentStatusIds && !vm.filters.currentStatusIds.length) ?
        (delete vm.filters.currentStatusIds) :
        "";
      (vm.filters.nextStatusIds && !vm.filters.nextStatusIds.length) ?
        (delete vm.filters.nextStatusIds) :
        "";
      vm.getFilterCount();
    };

    // Calculet filter count.
    vm.getFilterCount = () => {
      vm.appliedFilterCount = 0;
      vm.filters.skuNumbers && vm.filters.skuNumbers.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.skuOptionIds && vm.filters.skuOptionIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.inventoryMethodIds && vm.filters.inventoryMethodIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.skuDescription && vm.filters.skuDescription.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.currentStatusIds && vm.filters.currentStatusIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.nextStatusIds && vm.filters.nextStatusIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.romanic_copy && vm.filters.romanic_copy.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters["skuType"] ? vm.appliedFilterCount++ : "";
      vm.filters["has_error"] ? vm.appliedFilterCount++ : "";
    };

    vm.InitialFilterForm = flag => {
      $timeout(() => {
        vm.message = null;
        $("#advanced-search").collapse("hide");
        vm.old_filters ? (vm.filters = _.clone(vm.old_filters)) : "";
        // First time when the panel is opened reset all the values
        if (!vm.advancedSearchPanel) {
          $("#advanced-search").collapse("show");
          vm.resetFilters();
        } else {
          // When vm.advancedSearchPanel is true, then resetUnusedFilterArrays() will resets the not applied filters.
          // (this is when checks some values and clicks on search button without clicking on apply filter).
          vm.resetUnusedFilterArrays();
          $("#advanced-search").collapse("show");
        }
        vm.getInventories("").then(() => { }).catch(() => { });
        vm.getHuntPathTypes();
        vm.getRuleTypes();
        vm.loadSKUHeaders(1);
        if (flag) vm.showFilter = !vm.showFilter;
        $scope.getStatuses(common.Identifiers.item); //GET current statuses for item
        $scope.getNextStatuses(common.Identifiers.item); //GET next statuses for item
        vm.checkFilterHeight();
      }, 0);
    };

    //Fetch the details of selected item on click on "Maintain SKU" using item ID
    vm.getItemById = selected_item_id => {
      return new Promise((resolve, reject) => {
        ItemService.API.GetItemById(selected_item_id)
          .then(response => {
            $scope.selected_item = response[0];
            if (response && response[0]) {
              vm.getVendorById(response[0].vendor_id);
            }
            resolve(true);
          })
          .catch(error => {
            reject(false);
            logger.error(error);
          });
      });
    };

    vm.fetchItemTypeByGraph = () => {
      $scope.skuHead.inventoryMethod = {};
      $scope.skuHead.huntPath = {};
      $scope.skuHead.rule = {};
      EntityDetails.API
        .GetGraphSet(common.Identifiers.item_type, ["id", "default_pricing_choice", "default_pricing_choice_id", "default_inventory_method_id", "default_hunt_path_id", "default_rule_id"], "id", $scope.selected_item.type_id)
        .then(response => {
          $scope.skuHead.pricing_choice_id = response.data[0].default_pricing_choice_id;
          $scope.skuHead.pricing_choice = response.data[0].default_pricing_choice;
          let index = vm.inventory_methods.findIndex(
            method => method.id == response.data[0].default_inventory_method_id
          );
          if (index >= 0) {
            $scope.skuHead["inventoryMethod"]["id"] = response.data[0].default_inventory_method_id;
            if (response.data[0].default_hunt_path_id) {
              $scope.skuHead.inventory_calculation = 1;
              $scope.skuHead.huntPath.id = response.data[0].default_hunt_path_id;
            }
            if (response.data[0].default_rule_id) {
              $scope.skuHead.inventory_calculation = 0;
              $scope.skuHead.rule.id = response.data[0].default_rule_id;
            }
            vm.isSkuHuntPathAlowed(response.data[0].default_inventory_method_id, true);
          }
          vm.isValuesLoaded = true;
        })
        .catch(error => logger.error(error));
    };

    vm.getVendorById = vendorId => {
      VendorService.API.GetVendorById(vendorId).then(response => {
        vm.is_resale_allowed = response.resale_allowed;
        vm.vendorName = response.name;
      });
    };

    //Get the total count of SKUs created under the selected Item
    vm.getSkuCountByItem = () => {
      vm.isAllLoaded = false;
      SKUService.API.GetSKUCountByItem(vm.selected_item_id)
        .then(totalRecord => {
          $timeout(() => {
            vm.totalSkuCount = totalRecord;
          }, 0);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // On Press of refresh button fetch SKU count and the data
    vm.reloadSKUCountAndList = refresh => {
      return new Promise((resolve, reject) => {
        if (vm.isGroupByApplied) {
          vm.groupByData(vm.groupByField)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        } else {
          if (!Object.keys(vm.filters).length) {
            vm.getSkuCountByItem();
            vm.GetSKUs(refresh)
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            vm.GetSKUs(refresh)
              .then(response => {
                resolve(response);
                vm.totalRecordCount = response.data.filterdRecordCount;
                vm.availableVendorsCount = vm.totalRecordCount - vm.vendorsDataList.length;
              })
              .catch(error => {
                reject(error);
              });
          }
        }
      });
    };

    // Scroll bar will be pointed to (x, y) position
    vm.scrollToPosition = (x, y) => {
      window.scrollTo(x, y);
    };

    // Sets current pagination variables
    vm.pagination = () => {
      vm.resetUnusedFilterArrays();
      if (vm.sortByField === "") {
        vm.sortByField = "none";
        vm.sortByOrder = "asc";
      }
      vm.groupByField === "" ? (vm.groupByValue = null) : "";
    };

    // Get the SKUs created under the selected Item
    vm.GetSKUs = refresh => {
      return new Promise((resolve, reject) => {
        vm.isLoaded = false;
        vm.page = 1;
        vm.isGroupByApplied = false;
        vm.groupByField = "";
        if (refresh !== undefined) {
          // On click of refresh button, a message bar with information will be toggled in UI
          vm.totalTimeText = "";
          vm.isRefreshing = true;
          vm.refreshTableText = "Refreshing list...";
        }

        vm.pagination();
        SKUService.API.GetSKUByItem(
          vm.selected_item_id,
          { page: vm.page, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue },
          { is_deleted: $stateParams.is_deleted }
        )
          .then(response => {
            if (refresh !== undefined) {
              // After successfully refreshed information like time taken for getting response and number of records fetched will be displyed in UI
              vm.totalRecordsText = "record(s) loaded in approximately";
              vm.totalTimeText =
                "<strong>" +
                response.time_taken +
                "</strong><span class='f-14 c-gray'> seconds</span>";
              vm.refreshTableText = "Successfully refreshed";
              $timeout(() => {
                vm.isRefreshing = false;
              }, 3500);
            }

            vm.recordsCount = response.data ? response.data.data.length : 0;
            vm.skus = response.data.data;
            for (let i = 0; vm.skus && i < vm.skus.length; i++) {
              let skuObject = {
                id: vm.skus[i].id,
                description: vm.skus[i].description
              }
              vm.sku_description.push(skuObject);
              if (vm.skus[i].romanic_copy !== null && vm.skus[i].romanic_copy !== "null") {
                vm.skus[i].sku_romanic_copy = vm.skus[i].romanic_copy
                  .replace(/<[^>]*>/g, "")
                  .replace(/&nbsp;*/g, " ");
              }
            }
            vm.originalSkusDataList = JSON.parse(JSON.stringify(vm.skus));
            vm.getItemMetaData(); //send parameter '165x165' to get the desired resolution
            localStorage.removeItem("SkuPageCount");
            //vm.getStockPlusPricing();
            vm.totalRecordCount = response.data.filterdRecordCount;
            vm.availableSKUCount = vm.totalRecordCount - response.data.data.length;
            vm.isLoaded = true;
            vm.createMapList(response.data.data);
            resolve(response);
          })
          .catch(error => {
            vm.isRefreshing = true;
            vm.refreshTableText = "Unsuccessfull!";
            reject(error);
            logger.error(error);
            $timeout(() => {
              vm.isRefreshing = false;
            }, 3500);
          });
        $timeout(() => {
          angular.element("#inlineSearch").focus();
        }, 1000);
        $scope.setEntityScreen = "SKU";
      });
    };

    vm.reactivateSku = (id) => {
      let skuObject = {
        id: id,
        is_deleted: 0
      };
      //API call to update SKUs
      SKUService.API.UpdateSKU(skuObject)
        .then(response => {
          let object = {
            is_deleted: 0,
            entry_id: id
          }
          ItemUDDValueService.API.UpdateItemUDDValue()
        })
    }

    // Create Map List
    vm.createMapList = list => {
      vm.typesMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.typesMap[list[i].id] === undefined) {
          vm.typesMap[list[i].id] = list[i];
        }
      }
      if (!$stateParams.id && $state.current.name.includes(".new")) {
        vm.openForm("SKUMaster", $stateParams.skutype, $stateParams.subtype);
      }
      if ($stateParams.id && $state.current.name.includes(".update")) {
        vm.isUpdatePage = true;
        vm.getSkuByIdtoUpdate();
      }
      if ($stateParams.id && $state.current.name.includes(".sku.retail")) {
        $scope.needToReturnSkuView = true;
      }
    };

    vm.performSKUKeyUpEvent = event => {
      try {
        if (event.keyCode === 27 && vm.$showErrorDetailsData == true) {
          vm.$showErrorDetailsData = false;
          vm.$showErrorDetails = false;
          vm.$confirmdelete = false;
        } else if (event.keyCode === 27 && !vm.$showErrorDetailsData) {
          vm.closeForm("SKUMaster");
        }
      } catch (error) {
        logger.error(error);
      }
    };

    //Fetch SKU details on double click of any created SKU o update details based on SKU ID
    vm.getSkuByIdtoUpdate = () => {
      SKUService.API.GetSKU($stateParams.id)
        .then(response => {
          vm.dblClickAction("SKUMaster", response.data[0]);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getallSKUs = () => {
      // vm.enableUpdatesku = false;
      SKUService.API.GetallskusUPC().then(res => {
        this.allSKUs = res;
      });
      // var query = {};
      // query["status"] = ["'Active'"];
      // SKUService.API.GetSKUsByParameters(query).then(res => {
      //   vm.all_skus = res.data;
      //   vm.enableUpdatesku = true;
      // })
    }

    //Load the next batch of SKUs on click of Load More button
    vm.loadMoreSkus = () => {
      vm.isLoading = true;
      vm.page = parseInt(LocalMemory.API.Get("SkuPageCount")) || 1;
      vm.pagination();
      if (!vm.isFilterApplied) {
        SKUService.API.GetSKUByItem(
          vm.selected_item_id, {
          page: vm.page + 1,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: vm.groupByField,
          value: vm.groupByValue
        }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.skus.push(response.data[i]);
                vm.originalSkusDataList.push(response.data[i]);
              }
              vm.loadThumbNailImages("165x165");
              vm.availableSKUCount =
                vm.totalRecordCount - vm.originalSkusDataList.length;
              vm.setPageLimit();
              LocalMemory.API.Post("SkuPageCount", vm.page + 1);
              vm.isLoading = false;
              if (vm.searchSKUs) {
                $scope.showhistory = false;
                vm.skus = $filter("filter")(
                  vm.originalSkusDataList,
                  vm.searchSKUs
                );
              }
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        SKUService.API.GetSKUByItem(
          vm.selected_item_id, {
          page: vm.page + 1,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: vm.groupByField,
          value: vm.groupByValue
        }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.skus.push(response.data[i]);
              }
              vm.loadThumbNailImages("165x165");
              !vm.isGroupByFilterApplied ?
                (vm.availableSKUCount = vm.totalRecordCount - vm.skus.length) :
                "";
              vm.setPageLimit();
              LocalMemory.API.Post("SkuPageCount", vm.page + 1);
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.watchers = () => {
      /** searching Item Data List */
      $scope.$watch("skuMaintCtrl.searchSKUs", (searchValue, o) => {
        $scope.showhistory = false;
        vm.skus = $filter("filter")(vm.originalSkusDataList, searchValue);
      });
      $scope.$watch('$stateParams.id', function () {

        vm.init();
      });

    };

    vm.thumbnails = [];
    vm.getItemMetaData = () => {
      DataLakeAPIService.API.GetDropsByUuid(vm.uuid)
        .then(res => {
          if (res.data !== undefined) {
            vm.thumbnails = res.data;
            vm.loadThumbNailImages("165x165");
          } else {
            vm.thumbnails = [];
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.loadThumbNailImages = size => {
      if (vm.skus) {
        for (let i = 0; i < vm.skus.length; i++) {
          if (vm.thumbnails) {
            let thumbnail = vm.thumbnails.filter(lake => {
              return lake.instance_id == vm.skus[i].id;
            });
            if (thumbnail[0]) {
              vm.skus[i].drop_id = thumbnail[0].drop_id;
              if (!thumbnail[0].url) {
                vm.skus[
                  i
                ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                  thumbnail[0].drop_id,
                  size,
                  vm.uuid
                );
              } else if (thumbnail[0].url) {
                vm.skus[i].thumbnail = thumbnail[0].url;
              } else if (vm.skus[i].thumbnail && vm.skus[i].drop_id) {
                vm.originalSkusDataList[i].thumbnail = vm.skus[i].thumbnail;
                vm.originalSkusDataList[i].drop_id = vm.skus[i].drop_id;
              }
            } else if (!thumbnail[0]) {
              vm.loadImage(vm.skus[i], "165x165", vm.skus[i].item_id, common.Identifiers.item)
            }
          }
        }
      }
    };

    vm.loadImage = (sku, size, id, uuid) => {
      let entityUUID = uuid ? uuid : vm.uuid;
      let entityId = id ? id : sku.id;
      DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
        entityUUID,
        entityId,
        "cover_image"
      )
        .then(response => {
          if (response && response.length > 0) {
            if (!response[0].url) {
              sku.thumbnail = undefined;
              if (
                response[0].virtual_or_regular &&
                response[0].virtual_or_regular.toLowerCase() === "virtual"
              ) {
                sku.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                  response[0].drop_id,
                  "",
                  entityUUID
                );
              } else {
                sku.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                  response[0].drop_id,
                  size,
                  entityUUID
                );
              }
            } else if (response[0].url) {
              sku.thumbnail = response[0].url;
            }
            sku.drop_id = response[0].drop_id;
          } else {
            sku.thumbnail = undefined;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };
    // function to open the Transfer SKU side panel
    vm.showMoveSKUPanel = (skuId, skuDescription, skuSubType, itemId, sku, skuData) => {
      vm.isSaveSuccess = false;
      vm.skuToBeMoved = undefined;
      $scope.sku_search = undefined;
      vm.selectedSkuId = skuId;
      vm.selectedSkuDescription = skuDescription;
      vm.skuSubType = skuSubType;
      vm.isShowSelectedItem = false;
      vm.isShowMoveSKUPanel = true;
      vm.itemId = itemId;
      vm.skuNumber = sku;
      vm.skuToBeMoved = skuData;
      if (vm.skuSubType.toLowerCase() === 'set') {
        vm.getChildSkusForSetSku(skuId);
      } else {
        vm.getParentSetItemsByChildItemId(itemId);
      }
      // if (LocalMemory.API.Get("MovedItemId") == "null") {
      vm.isListItems = true;
      vm.fetchItemsForItemType();
      angular.element("#item_description").focus();
      // } 
      // else {
      //   vm.fetchItemsForItemType();
      //   ItemService.API.FetchItemGraph(
      //     [
      //       "id",
      //       "description",
      //       "status",
      //       "item_sub_type",
      //       "vendor",
      //       "status_effective_date"
      //     ],
      //     "id",
      //     LocalMemory.API.Get("MovedItemId")
      //   ).then(response => {
      //     vm.ShowSelectedItemDetails(response.data[0]);
      //   });
      // }
    };

    vm.getChildSkusForSetSku = (skuId) => {
      SKUSetService.API.FetchSkuSetsByParentSkuId(skuId)
        .then(response => {
          vm.childItemsToBeAddedToNewItemSet = [];
          if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
              vm.childItemsToBeAddedToNewItemSet.push(response[i].item_id);
            }
          }
        })
        .catch(error => {
          logger.error(error);
        });
    }

    vm.getParentSetItemsByChildItemId = (childItemId) => {
      ItemSetService.API.GetItemSetsByChildItemId(childItemId)
        .then(response => {
          vm.parentsItemIdsToBeAddWithNewChildItemId = [];
          if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
              vm.parentsItemIdsToBeAddWithNewChildItemId.push(response[i].parent_item_id);
            }
          }
        })
        .catch(error => {
          logger.error(error);
        })
    }

    //Function to fetch items falling under current item type of SKU
    vm.fetchItemsForItemType = () => {
      vm.isFetchingItems = true;
      //Get selected columns by searching items by item type id and given item type id value
      ItemService.API.FetchItemGraph(
        [
          "id",
          "description",
          "status",
          "item_sub_type",
          "vendor",
          "status_effective_date"
        ],
        "item_type_id",
        $scope.selected_item.item_type_id
      )
        .then(response => {
          vm.Items = response.data;
          vm.Items = vm.Items.filter(it => {
            return it.vendor == $scope.selected_item.vendor
          })
          vm.Items = vm.Items.filter(it => {
            return it.status == 'Active' || it.status == 'Pending Inactive'
          })
          vm.isFetchingItems = false;
          //remove the Item already part of the selected SKU from the list
          let index = vm.Items.findIndex(
            item => item.id === $scope.selected_item.id
          );
          if (index > -1) {
            vm.Items.splice(index, 1);
          }
          if (vm.skuSubType.toLowerCase() === "set") {
            vm.Items = _.filter(vm.Items, item => {
              return (
                item.item_sub_type.toLowerCase() === vm.skuSubType.toLowerCase()
              );
            });
          } else if (
            vm.skuSubType.toLowerCase() === "component" ||
            vm.skuSubType.toLowerCase() === "sku" ||
            vm.skuSubType.toLowerCase() === "installation_fee"
          ) {
            vm.Items = _.filter(vm.Items, item => {
              return item.item_sub_type.toLowerCase() === "item";
            });
          }
          vm.OldItems = _.clone(vm.Items);
        })
        .catch(error => {
          vm.isFetchingItems = false;
          logger.error(error);
        });
    };

    vm.ClearSearch = () => {
      vm.Items = _.clone(vm.OldItems);
      common.$timeout(() => {
        angular.element("#item_description").focus();
      }, 1000);
    };

    vm.focusMoveSku = () => {
      common.$timeout(() => {
        angular.element("#move_sku").focus();
      }, 1000);
    }

    //Update item id for the selected SKU
    vm.updateItemForSku = (skuId, itemId, isDeleteItem) => {
      vm.isProcessing = true;
      let skuObject = {
        id: skuId,
        item_id: itemId
      };
      //API call to update SKUs
      SKUService.API.UpdateSKU(skuObject)
        .then(response => {
          LocalMemory.API.Post("MovedItemId", skuObject.item_id);
          vm.moveSkuToItem = true;
          vm.isSaveSuccess = true;
          //On timeout close the panel
          common.$timeout(() => {
            vm.moveSkuToItemError = false;
            vm.moveSkuToItem = false;
            // vm.isShowMoveSKUPanel = false;
            vm.isProcessing = false;
            //Find the index for the moved sku and remove the sku from skus list
            let index = vm.skus.findIndex(sku => sku.id === skuId);
            vm.skus.splice(index, 1);
            if (vm.skuSubType.toLowerCase() === "component" || vm.skuSubType.toLowerCase() === "sku") {
              //vm.UpdateItemChildId(itemId);
              if (vm.parentsItemIdsToBeAddWithNewChildItemId.length > 0) {
                vm.parentsItemIdsToBeAddWithNewChildItemId.forEach(parentItemId => {
                  if ((vm.selectedItemParentSetItem.length > 0 && !vm.selectedItemParentSetItem.includes(parentItemId)) || (vm.selectedItemParentSetItem.length == 0)) {
                    let itemSetObj = {
                      status_id: 200,
                      child_item_id: itemId,
                      parent_item_id: parentItemId
                    }
                    vm.saveItemSetValue(itemSetObj);
                  }
                });
                //}
              }
            } else if (vm.skuSubType.toLowerCase() === "set") {
              //vm.UpdateItemParentId(itemId);

              if (vm.childItemsToBeAddedToNewItemSet.length > 0) {
                vm.childItemsToBeAddedToNewItemSet.forEach(childItemId => {
                  let itemSetObj = {
                    status_id: 200,
                    parent_item_id: itemId,
                    child_item_id: childItemId
                  }
                  vm.saveItemSetValue(itemSetObj);
                });
                //}
              }
            }
            $scope.$emit("updateSkuDetails", {
              event: "delete",
              skuDetails: vm.skuToBeMoved,
              item_id: vm.selected_item_id
            });

            $scope.$emit("updateSkuDetails", {
              event: "save",
              skuDetails: vm.skuToBeMoved,
              item_id: itemId
            });
            if (isDeleteItem === true) {
              ItemService.API.DeleteItemSetDependency($scope.selected_item)
                .then(() => {
                  ItemService.API.DeleteItem($scope.selected_item)
                    .then(response => {
                      vm.isDeletingItem = false;
                      if ($state.params.returnUrl) {
                        vm.goToState($state.params.returnUrl, false)
                      } else {
                        vm.goToState("common.prime.itemMaintenance", true)
                      }
                      common.$timeout(() => {
                        vm.isDeletingItem = false;
                      }, 5000);
                    })
                    .catch(error => {
                      common.$timeout(() => {
                        vm.isDeletingItem = false;
                      }, 5000);
                    });
                })
                .catch(error => {
                  common.$timeout(() => {
                    vm.isDeletingItem = false;
                  }, 5000);
                });
              vm.isDeletingItem = true;
            } else {
              if ($state.current.name === "common.prime.itemMaintenance.sku.update") {
                if ($state.params.returnUrl) {
                  $state.go($state.params.returnUrl)
                } else {
                  vm.goToState("common.prime.itemMaintenance.sku", false)
                }
              } else {
                vm.goToState("common.prime.itemMaintenance.sku", false)
              }
            }

            //Update the SKU count
            vm.totalRecordCount = vm.skus.length;
            vm.recordsCount = vm.skus.length;
          }, 5000);
        })
        .catch(error => {
          vm.moveSkuToItemError = true;
          vm.isProcessing = false;
          logger.error(error);
        });
    };

    vm.goToState = (stateName, isReload) => {
      $state.go(stateName, {}, { reload: isReload }).then(() => {
        if (stateName === "common.prime.itemMaintenance.sku") {
          if (Object.keys(vm.filters).length > 0) {
            vm.old_filters = undefined;
            this.applyFilters()
          } else {
            vm.reloadSKUCountAndList();
          }
        }
      })
    }

    vm.saveItemSetValue = function (dataObject) {
      ItemSetService.API
        .InsertItemSet(dataObject)
        .then(response => {
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.transferSkuClose = () => {
      vm.isShowMoveSKUPanel = false;
      vm.isSaveSuccess = false;
    }
    //When asked for move confirmation, on cancel go back to the list items page
    vm.cancelMoveSkuToItem = () => {
      vm.isShowSelectedItem = false;
      vm.isListItems = true;
      vm.moveSkuToItemError = false;
      vm.moveSkuToItem = false;
    };

    //On selecting an item to move the SKU, show the details of the selected item and previous item
    vm.ShowSelectedItemDetails = selectedItem => {
      $scope.sku_search = vm.searchedSkuNumber;
      vm.isShowSelectedItem = true;
      vm.isListItems = false;
      vm.selectedItem = selectedItem;
      vm.moveSkuToItemError = false;
      vm.moveSkuToItem = false;
      ItemSetService.API.GetItemSetsByChildItemId(selectedItem.id)
        .then(response => {
          vm.selectedItemParentSetItem = [];
          if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
              vm.selectedItemParentSetItem.push(response[i].parent_item_id);
            }
          }

        })
        .catch(error => {
          logger.error(error);
        })
    };

    vm.showHistoryDetails = data => {
      if (vm.skuData !== undefined) {
        vm.skuData.showhistory = false;
      }
      vm.skuData = data;
      vm.skuData.showhistory = true;
      vm.isShowHistory = true;
      $scope.instanceName = data.description;
      $scope.isMaintenance = true;
      $scope.loadHistory(data.id);
      $timeout(() => {
        angular.element("#history_close").focus();
      }, 500);
    };

    $scope.loadHistory = instance_id => {
      common.EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        instance_id
      )
        .then(response => {
          $scope.historyList = response.data;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
      $scope.isMaintenance = true;
      $scope.instanceName = null;
      if (vm.skuData !== undefined) {
        vm.skuData.showhistory = false;
      }
      $timeout(() => {
        angular.element("#sku_history").focus();
      }, 1000);
    };

    vm.toggleselectedGroupitem = (gc, index) => {
      if (gc.selected) {
        for (let x = 0; x < vm.selectedGroupHeader.length; x++) {
          if (
            vm.selectedGroupHeader[x][vm.groupByField] === gc[vm.groupByField]
          ) {
            vm.selectedGroupHeader.splice(x, 1);
          }
        }
        gc.items = undefined;
        for (let i = 0; i < vm.groupSkus.length; i++) {
          vm.groupSkus[i].isSkusLoaded = undefined;
        }
      } else {
        vm.selectedGroupHeader.push(gc);
      }
      gc.expanded = false;
    };

    ///Group by Panel: Select or Unselect all the item groups
    vm.toggleAllGroups = isSelectAll => {
      for (let i = 0; i < vm.groupSkus.length; i++) {
        if (isSelectAll) {
          vm.groupSkus[i].selected = 1;
        } else {
          vm.groupSkus[i].expanded = false;
          vm.groupSkus[i].skus = undefined; //remove data from group after Unselect all
          vm.groupSkus[i].selected = 0;
        }
      }
    };

    vm.groupByData = groupByColumn => {
      return new Promise((resolve, reject) => {
        vm.isGroupByApplied = true;
        vm.isGroupHeader = false;
        vm.groupSkus = [];
        vm.isFilterApplied === true ? (vm.isGroupByFilterApplied = true) : "";
        if (groupByColumn.length > 0) {
          /** ---------- Get skus based on page and limit ----------
           * sort by field and order initially none and asc
           * may change according to the user customization
           * No parameter means, get all the records without any conditions.
           *
           * NOTE: First two undefined parameters are for page and limit AND third empty object is for filter
           */
          vm.groupByField = groupByColumn;
          vm.pagination();
          SKUService.API.GetSKUByItem(
            $stateParams.item_id,
            {},
            vm.filters,
            { field: vm.sortByField, order: vm.sortByOrder },
            { field: vm.groupByField }
          )
            .then(response => {
              vm.isGroupHeader = true;
              for (let i = 0; i < response.data.data.length; i++) {
                let groupHidden = false;
                if (vm.selectedGroupHeader.length > 0) {
                  for (let j = 0; j < vm.selectedGroupHeader.length; j++) {
                    if (
                      vm.selectedGroupHeader[j][vm.groupByField] ===
                      response.data.data[i][vm.groupByField]
                    ) {
                      groupHidden = true;
                      response.data.data[i].selected = 0;
                      response.data.data[i].expanded = false;
                    }
                  }
                  if (groupHidden === true) {
                    vm.groupSkus.push(response.data.data[i]);
                  } else {
                    response.data.data[i].selected = 1;
                    response.data.data[i].expanded = false;
                    vm.groupSkus.push(response.data.data[i]);
                  }
                } else {
                  response.data.data[i].selected = 1;
                  response.data.data[i].expanded = false;
                  vm.groupSkus.push(response.data.data[i]);
                }
              }
              resolve(response);
            })
            .catch(error => {
              reject(error);
              logger.error(error);
            });
        } else {
          vm.isGroupByFilterApplied = false;
          vm.getSkuCountByItem();
          vm.scrollToPosition(0, 0);
          vm.GetSKUs()
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        }
      });
    };

    vm.MapGroupSkus = list => {
      for (let i = 0; i < list.length; i++) {
        if (vm.groupSkusMap[list[i].id] === undefined) {
          vm.groupSkusMap[list[i].id] = list[i];
        }
      }
    };

    vm.showSKUData = (groupByField, groupData) => {
      groupData.isSkusLoaded = false;
      groupData.expanded = !groupData.expanded; //toggle group data list
      if (groupData.skus === undefined) {
        vm.groupByValue = groupData[groupByField];
        groupData.groupPage = 1;
        vm.pagination();
        SKUService.API.GetSKUByItem(
          $stateParams.item_id, {
          page: groupData.groupPage,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: groupByField,
          value: vm.groupByValue
        }
        )
          .then(response => {
            groupData.skus = response.data.data;
            groupData.availableGroupSkus =
              groupData.count - response.data.data.length;
            vm.groupSkusMap = [];
            vm.typesMap = [];
            vm.MapGroupSkus(groupData.skus);
            vm.createMapList(groupData.skus);
            vm.loadGroupByThumbNailImages("165x165", groupData.skus); // load sku cover images when skus are grouped by field

            vm.originalSkusDataList = JSON.parse(
              JSON.stringify(groupData.skus)
            );
            groupData.isSkusLoaded = true;
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        groupData.isSkusLoaded = true;
      }
    };

    //when click on expand all in group by panel, data for all group by items should be fetched
    vm.loadGroupDataOnExpandAll = groupByField => {
      let object = {
        [groupByField]: [],
        conditionField: "item_id",
        conditionValue: $stateParams.item_id
      };
      for (let i = 0; i < vm.groupSkus.length; i++) {
        if (vm.groupSkus[i].skus === undefined) {
          object[groupByField].push(vm.groupSkus[i][groupByField]);
        }
      }

      if (object[groupByField].length) {
        vm.groupPage = 1;
        SKUService.API.GroupByFieldAndValues(
          $stateParams.item_id,
          object,
          vm.groupPage,
          vm.limit
        )
          .then(response => {
            for (let i = 0; i < vm.groupSkus.length; i++) {
              if (vm.groupSkus[i].skus === undefined) {
                vm.groupSkus[i].skus = $filter("filter")(
                  response,
                  vm.groupSkus[i][groupByField]
                );
                vm.groupSkus[i].availableGroupSkus =
                  vm.groupSkus[i].count - vm.groupSkus[i].skus.length;
                vm.originalSkusDataList = JSON.parse(
                  JSON.stringify(vm.groupSkus[i].skus)
                );
                vm.groupSkus[i].groupPage = 1;
                vm.groupSkus[i].isSkusLoaded = true;
              }
            }
            vm.loadGroupByThumbNailImages("165x165", response); // load sku cover images when skus are grouped by field
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    //load next batch of records on click of load more button
    vm.loadMoreSkusData = (groupByField, groupData) => {
      vm.groupByValue = groupData[groupByField];
      groupData.isMoreSkusLoaded = false;
      if (groupData[groupByField]) {
        groupData.groupPage = groupData.groupPage + 1;
        vm.pagination();
        SKUService.API.GetSKUByItem(
          $stateParams.item_id, {
          page: groupData.groupPage,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: groupByField,
          value: vm.groupByValue
        }
        )
          .then(response => {
            let data = response.data.data || response.data;
            groupData.isMoreSkusLoaded = true;
            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                if (!vm.groupSkusMap[data[i].id]) {
                  groupData.skus.push(data[i]);
                  vm.groupSkusMap[data[i].id] = data[i];
                  vm.typesMap[data[i].id] = data[i];
                }
              }
              vm.setPageLimit();
              groupData.availableGroupSkus =
                parseInt(groupData.count) - parseInt(groupData.skus.length);
              vm.loadGroupByThumbNailImages("165x165", groupData.skus);
              vm.originalSkusDataList = JSON.parse(
                JSON.stringify(groupData.skus)
              );
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        groupData.isMoreSkusLoaded = true;
        vm.originalSkusDataList = [];
      }
    };

    //Load thumbnail images of SKUs under selected group header
    vm.loadGroupByThumbNailImages = (size, skus) => {
      if (skus) {
        for (let i = 0; i < skus.length; i++) {
          let thumbnail = vm.thumbnails.filter(lake => {
            return lake.instance_id == skus[i].id;
          });
          if (thumbnail[0]) {
            if (!thumbnail[0].url) {
              if (
                thumbnail[0].type &&
                thumbnail[0].type.toLowerCase() === "virtual"
              ) {
                skus[i].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                  thumbnail[0].drop_id,
                  "",
                  vm.uuid
                );
              } else {
                skus[i].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                  thumbnail[0].drop_id,
                  size,
                  vm.uuid
                );
              }
            } else if (thumbnail[0].url) {
              skus[i].thumbnail = thumbnail[0].url;
            }

            skus[i].drop_id = thumbnail[0].drop_id;
          }
        }
      }
    };

    //Assign the stock plus pricing values if the selected SKU is of sku type Stock plus
    vm.getStockPlusPricing = () => {
      $scope.sku_list = [];
      _.each(vm.skus, sku => {
        if (sku.sku_type.toLowerCase() === "stock") {
          $scope.sku_list.push(sku);
        }
      });
    };

    // Get inventories methods based on the the selected SKU type
    vm.getInventories = sku_type => {
      return new Promise((resolve, reject) => {
        // Initial the inventory methods to empty array initially
        vm.inventory_methods = [];
        vm.isLoadingInventoryMethods = true;
        // Get all the the inventories
        $timeout(() => {
          SKUService.API.GetInventories()
            .then(response => {
              VendorService.API.GetVendorProperties($scope.selected_item.vendor_id)
                .then(result => {
                  let inventory_ids;
                  result.data[0].inventory_method_id ? inventory_ids = result.data[0].inventory_method_id.split(",") : inventory_ids = [];
                  inventory_ids.length > 0 ? inventory_ids = inventory_ids.map(Number) : null;
                  // For each inventory method, show based on the sku type selected
                  _.each(response.data, inventory_method => {
                    if (inventory_ids.includes(inventory_method.id)) {
                      // If the selected sku type is stock plus or mto, then return special order inventories
                      if ($stateParams.subtype === "set" || (vm.skuDetails && vm.skuDetails.sku_sub_type == "set")) {
                        if (sku_type &&
                          (sku_type.toLowerCase() === "stock")) {
                          inventory_method.code.toLowerCase() === "srfc" ||
                            inventory_method.code.toLowerCase() === "srfp" ||
                            inventory_method.code.toLowerCase() === "sorfc" ||
                            inventory_method.code.toLowerCase() === "sorfp" ||
                            inventory_method.code.toLowerCase() === "ns" ||
                            inventory_method.code.toLowerCase() === "sods" ?
                            vm.inventory_methods.push(inventory_method) :
                            null;
                        }
                        else {
                          inventory_method.code.toLowerCase() === "sorfc" ||
                            inventory_method.code.toLowerCase() === "sorfp" ||
                            inventory_method.code.toLowerCase() === "sods" ?
                            vm.inventory_methods.push(inventory_method) :
                            null;
                        }
                      }
                      else {
                        if (inventory_method.code.toLowerCase() !== "srfc" &&
                          inventory_method.code.toLowerCase() !== "srfp" &&
                          inventory_method.code.toLowerCase() !== "sorfc" &&
                          inventory_method.code.toLowerCase() !== "sorfp") {
                          if (
                            sku_type &&
                            (sku_type.toLowerCase() === "mto" || sku_type.toLowerCase() === "stock plus")
                          ) {
                            inventory_method.code.toLowerCase() === "sorf" ||
                              inventory_method.code.toLowerCase() === "sods" ?
                              vm.inventory_methods.push(inventory_method) :
                              null;
                          } else if (sku_type && sku_type.toLowerCase() === "stock") {
                            if ($stateParams.subtype === "installation_fee") {
                              inventory_method.code.toLowerCase() === "rf" || inventory_method.code.toLowerCase() === "ns" ?
                                vm.inventory_methods.push(inventory_method) :
                                null;
                            }
                            else {
                              // Else if the selected sku type is stock, then return stock level inventories
                              vm.inventory_methods.push(inventory_method);
                            }
                          } else {
                            vm.inventory_methods = response.data;
                          }
                        }
                      }
                    }
                    vm.isLoadingInventoryMethods = false;
                    vm.initializeInventoryMethodSelectize()
                  });
                  resolve(true);
                })
                .catch(error => {
                  reject(false);
                  logger.error(error);
                });
            })
            .catch(error => {
              reject(false);
              logger.error(error);
            });
        });
      }, 3000)
    };

    vm.initializeInventoryMethodSelectize = () => {
      $scope.selectInventoryMethod = {
        valueField: "id",
        labelField: "name",
        searchField: ["name"],
        sortField: "display_sequence",
        //Space is added to so that end of the text does not cut off
        placeholder: "Select Inventory Method" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        options: vm.inventory_methods,
        render: {
          option: (data, escape) => {
            return (
              '<div class="p-5">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.name) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          },
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.name) +
              "</span>"
            );
          }
        }
      };
    }

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

    vm.loadCodeListData = (uuid, fieldName, model, $q) => {
      let defer = $q.defer();
      CodeService.API.MultiSearchCodeList({
        uuid: uuid,
        field_name: fieldName
      })
        .then(response => {
          $scope[model] = response;
          vm[model] = response;
          defer.resolve(response);
        })
        .catch(error => {
          logger.error(error);
          defer.reject(error);
        });
      return defer.promise;
    };

    vm.createMap = (fromArrayModel, toMapModel, key) => {
      _.each(vm[fromArrayModel], value => {
        vm[toMapModel][value[key]] = value;
      });
    };

    //Fetch all MTO Options and creating a map of MTO Options
    vm.getMTOOptions = () => {
      MTOService.API.GetMTOList()
        .then(response => {
          let model = "allMTOOptions";
          $scope[model] = response.data.data;
          vm[model] = response.data.data;
          vm.createMap(model, "mtoOptionsMap", "id");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Fetch all MTO Choices and creating a map of MTO Choices
    vm.getMTOChoices = () => {
      MTOChoiceService.API.GetChoices()
        .then(response => {
          let model = "allMTOOptionChoices";
          $scope[model] = response.data;
          vm[model] = response.data;
          vm.createMap(model, "mtoOptionChoicesMap", "id");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Fetch all Attribute values and creating a map of Attribute values
    vm.getAttributeValues = () => {
      AttributeValueService.API.GetAttributeValues()
        .then(response => {
          let model = "allAttributeValues";
          $scope[model] = response.data;
          vm[model] = response.data;
          vm.createMap(model, "attributeValuesMap", "id");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Getting the Entity information based on the UUID
    vm.getEntityInformation = () => {
      common.EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid)
        .then(model => {
          vm.getDynamicColumns(model);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get model and set validation for sku option header on open form trigger
    vm.getSKUOptionHeaderModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(Identifiers.sku_header)
        .then(model => { })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getDynamicColumns = model => {
      let supportActions = {
        edit: true,
        delete: true
      };
      let alterTitles = {};
      let drillTo = {
        drillToAvailability: {
          title: "Availability",
          show: true
        }
      };

      let skuMeta = generateDynamicTableColumnsService.getTableColumns(
        model,
        supportActions,
        alterTitles,
        drillTo
      );
      if (LocalMemory.API.Get(vm.entityInformation.tableName)) {
        $scope.skucols = LocalMemory.API.Get(vm.entityInformation.tableName);
      } else {
        $scope.skucols = skuMeta.cols;
      }
      $scope.skuGroupByDropdown = skuMeta.dropdownList;
    };

    //Fetch all the SKU headers created in SKU Option Header during configuration
    vm.loadSKUHeaders = (editMode, value) => {
      $scope.sku_headers = [];
      if ($scope.selected_item) {
        SkuOptionHeaderService.API.SearchSkuHeaders(
          "item_type_id",
          $scope.selected_item.type_id
        )
          .then(response => {
            $scope.sku_headers = response.data.data;
            $scope.sku_headers.unshift({
              id: 0,
              name: "No SKU Option"
            });
            let options = [];
            // temporary map
            var typeToHeadersMap = {};
            //temporary variable
            let selectedSkuType =
              $stateParams.skutype &&
                $stateParams.skutype.toLowerCase() === "stock plus" ?
                "stockplus" :
                $stateParams.skutype;
            // Show only those Option headers which not used for any other item type and sku type OR which are used only for current item type and sku type
            for (let i = 0; i < response.data.length; i++) {
              let header = response.data[i];
              header.tempSkuType =
                header.sku_type &&
                  header.sku_type.toLowerCase() === "stock plus" ?
                  "stockplus" :
                  header.sku_type;
              if (
                header.item_type_id &&
                header.item_type_id == $scope.selected_item.type_id &&
                header.tempSkuType === selectedSkuType &&
                typeToHeadersMap[
                `${$scope.selected_item.type_id}-${selectedSkuType}`
                ] === undefined
              ) {
                typeToHeadersMap[
                  `${$scope.selected_item.type_id}-${selectedSkuType}`
                ] = [header.name];
              } else if (
                header.item_type_id &&
                header.item_type_id == $scope.selected_item.type_id &&
                header.tempSkuType === selectedSkuType &&
                typeToHeadersMap[
                `${$scope.selected_item.type_id}-${selectedSkuType}`
                ]
              ) {
                typeToHeadersMap[
                  `${$scope.selected_item.type_id}-${selectedSkuType}`
                ].push(header.name);
              }
            }

            _.each(response.data.data, sh => {
              $scope.skuHeadersMap[sh.id] = sh;
              sh.tempSkuType =
                sh.sku_type && sh.sku_type.toLowerCase() === "stock plus" ?
                  "stockplus" :
                  sh.sku_type;
              if (
                (sh.item_type_id !== null &&
                  sh.sku_type !== "none" &&
                  (!typeToHeadersMap[
                    `${$scope.selected_item.type_id}-${selectedSkuType}`
                  ] ||
                    (typeToHeadersMap[
                      `${$scope.selected_item.type_id}-${selectedSkuType}`
                    ] &&
                      !typeToHeadersMap[
                        `${$scope.selected_item.type_id}-${selectedSkuType}`
                      ].includes(sh.name)))) ||
                (sh.item_type_id === $scope.selected_item.type_id &&
                  sh.sku_type === $stateParams.skutype)
              ) {
                options.push(sh);
              }
            });

            $scope.sku_headers = options;

            vm.filterSkuOptions();
            // if the value is there (sent after creating a option in SKU maintenance screen) then assign the new value to the sku option
            $timeout(() => {
              if (value && value.inserted_id) {
                $scope.skuHead.option_list_id = value.inserted_id;
              }
            }, 0);
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    //To load the locations to check the availability of the SKU
    vm.loadLocationsBySku = skuId => {
      $state.go("common.prime.itemMaintenance.sku.skuInventory", {
        id: skuId,
        previous_state: "sku"
      });
      $timeout(() => {
        angular.element("#check_avail_close").focus();
      }, 1000);
    };

    /// Open update inventory availibility details panel and get inventory types and qualities
    vm.openUpdateInventoryPanel = (availability, skuId) => {
      //Function to first deselect any previously selected location
      vm.deSelectAllInventoryPanels();
      vm.isShowInventoryUpdate = true;
      vm.inventoryUpdateBtn = "Update";
      vm.inventoryDetails = {};
      availability.selected = true;
      vm.selectedAvailability = availability;
      !vm.qualitiesList ? vm.getAllInventoryQualities() : "";
      !vm.inventoryTypes ? vm.getAllInventoryTypes() : "";
    };

    //Function to deselect all previously selected locations
    vm.deSelectAllInventoryPanels = () => {
      vm.availability.filter(availability => {
        availability.selected = false;
      });
    };

    /// Get all the inventory qualities list
    vm.getAllInventoryQualities = () => {
      SKUService.API.GetInventoryQualityList()
        .then(response => {
          vm.qualitiesList = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    /// Get all the inventory types list
    vm.getAllInventoryTypes = () => {
      SKUService.API.GetInventoryTypes()
        .then(response => {
          vm.inventoryTypes = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Showing the availablity of SKUs on click of locations in the side panel of check availability
    vm.loadAvailability = (availability, SKUId) => {
      let locationId = availability.id;
      availability.isExpanded = !availability.isExpanded;
      SKUService.API.GetSkuAvailabilityForLocation(locationId, SKUId)
        .then(response => {
          availability.skuavailabilityList = response.data;
          response.data.length > 0 ?
            (availability.isSkuAvailable = true) :
            (availability.isSkuAvailable = false);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.updateInventoryAvailibility = availability => {
      availability.inventory_demand = 0;
      availability.inventory_reserve = 0;
      vm.inventoryUpdateBtn = "Updating...";
      vm.updatingInventory = true;
      availability.location_id = vm.selectedAvailability.id;
      availability.sku_id = vm.sku_details.id;
      if (availability.method == 0) {
        availability.inventory_quantity = "-" + availability.inventory_quantity;
      }
      SKUService.API.UpsertInventoryAvailability(availability)
        .then(response => {
          vm.inventoryUpdateBtn = "Update";
          vm.inventoryDetails = {};
          vm.updatingInventory = false;
          vm.inventoryMessage = response.data.message;
          if (
            vm.selectedAvailability &&
            vm.selectedAvailability.skuavailabilityList &&
            vm.selectedAvailability.skuavailabilityList.length > 0
          ) {
            let isAlreadyExist = false;
            let list = vm.selectedAvailability.skuavailabilityList;
            for (let i = 0; i < list.length; i++) {
              if (
                (list[i].location_id =
                  availability.location_id &&
                  list[i].inventory_type_id ===
                  availability.inventory_type_id &&
                  list[i].inventory_quality_id ===
                  availability.inventory_quality_id)
              ) {
                isAlreadyExist = true;
                list[i].inventory_quantity =
                  parseInt(list[i].inventory_quantity) +
                  parseInt(availability.inventory_quantity);
              }
            }
            if (!isAlreadyExist) {
              vm.selectedAvailability.skuavailabilityList.push(availability);
            }
          } else {
            vm.selectedAvailability.isSkuAvailable = true;
            $timeout(() => {
              vm.selectedAvailability.skuavailabilityList = [availability];
            }, 0);
          }
        })
        .catch(error => {
          vm.updatingInventory = false;
          vm.inventoryUpdateBtn = "Update";
          logger.error(error);
        });

      $timeout(() => {
        vm.inventoryMessage = null;
      }, 3000);
    };

    vm.copyToHeadInfo = (entityName, value) => {
      let editMode = 1;
      vm.loadSKUHeaders(editMode, value);
      $scope.skuHead = _.clone(value);
      $scope.edit_sku_master_id = value.id;
      $scope.sku_master_id = value.id;
      $scope.skuHead.createNewOptionName = false;
    };
    $scope.effective_val = true;
    $scope.changeevent = item => {
      if (item.next_status_id === 500) {
        $scope.effective_val = false;
        $scope.skuHead.next_effective_date = '';
      } else {
        $scope.effective_val = true;
      }
    };

    //Get Item Vendors list
    vm.getVendorsList = () => {
      ItemService.API.GetVendorsForAnItem($stateParams.item_id)
        .then(response => {
          vm.isLoadingVendors = false;
          vm.itemVendors = response.data;
        })
        .catch(error => {
          vm.isLoadingVendors = false;
          logger.error(error);
        });
    };

    // get linked vendor details for sku
    vm.getLinkedVendorDetails = vendor => {
      vm.invalidCheckDigit = null;
      vm.validationMessage = null;
      vm.skuVendorSuccessMessage = null;
      vm.skuVendorErrorMessage = null;
      vm.skuVendorErrorMessage = "";
      vm.setInitialState("SKUVendor");
      if (vm.isUpdate) {
        vm.linkVendor = {
          first_cost: null,
          average_cost: null,
          landed_cost: null,
          net_cost: null,
          tariff_percentage: null
        };
        SKUService.API.GetLinkedVendorBySkuAndVendorId(
          $stateParams.id,
          vendor.vendor_id
        )
          .then(response => {
            vm.upc_number = "";
            vm.checkDigit = "";
            vm.calculatedCheckDigit = undefined;
            if (response.length > 0) {
              /// if vendor is already linked to sku, then will get back in response which will be assigned to form model
              vm.isVendorLinkedToSku = true; //flag to show vendor is linked or not to the sku
              vm.linkVendor = response[0];
              vm.linkVendor.vendor = vendor.vendor;
              vm.loadUPCNumberObject(vm.linkVendor.upc_number);
              vm.oldDataVendor = _.clone(response[0]);
            } else {
              /// if vendor is not linked to sku, then store vendor id, sku id and vendor name in to the form model
              vm.linkVendor.vendor = vendor.vendor;
              vm.isVendorLinkedToSku = false; //flag to show vendor is linked or not to the sku
              vm.linkVendor.sku_id = $stateParams.id;
              vm.linkVendor.vendor_id = vendor.vendor_id;
              vm.loadUPCNumberObject();
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        // vm.upc_number = [
        //   "",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0"
        // ];
        vm.upc_number = "";
        angular.element("#upc0").focus();
        vm.checkDigit = undefined;
        vm.calculatedCheckDigit = undefined;
      }
    };

    //// Update vendor purchase details which is already linked
    vm.updateLinkedVendorDetails = (vendorDetails, upcNumber) => {
      // let upc_number = "";
      // if (vm.upc_number && vm.upc_number.length === 11) {
      //   vm.upc_number = '0' + vm.upc_number;
      // }
      // if (upcNumber && upcNumber.length === 11) {
      //   upc_number = '0' + upcNumber;
      // } else {
      //   upc_number = upcNumber;
      // }
      // // vm.invalidCheckDigit = false;
      // if (
      //   upc_number
      // ) {
      //   vendorDetails.upc_number = upc_number ;
      // } else {
      //   vendorDetails.upc_number = "";
      // }
      if (vm.original_upc != vm.upc_number) {
        vm.calculateCheckDigit(vm.upc_number);
      }

      if (!vm.invalidCheckDigit && !vm.upcalreadyexists) {
        if (vm.upc_number && vm.upc_number.length === 11) {
          vm.upc_number = '0' + vm.upc_number;
        }
        if (
          vm.upc_number
        ) {
          vendorDetails.upc_number = vm.upc_number;
        } else {
          vendorDetails.upc_number = "";
        }
        vm.skuVendorSuccessMessage = null;
        vm.skuVendorErrorMessage = null;
        if (
          (vendorDetails.vendor_item_description === undefined ||
            vendorDetails.vendor_item_description === null ||
            vendorDetails.vendor_item_description === "") &&
          (vendorDetails.vendor_item_number === undefined ||
            vendorDetails.vendor_item_number === null ||
            vendorDetails.vendor_item_number === "") &&
          (vendorDetails.first_cost === null ||
            isNaN(vendorDetails.first_cost)) &&
          (vendorDetails.net_cost === null ||
            isNaN(vendorDetails.net_cost)) &&
          (vendorDetails.hts_number === undefined ||
            vendorDetails.hts_number === null ||
            vendorDetails.hts_number === "") &&
          (vendorDetails.purchasing_information === undefined ||
            vendorDetails.purchasing_information === null ||
            vendorDetails.purchasing_information === "") &&
          vm.upc_number.length === 0 &&
          (vendorDetails.tariff_percentage === null ||
            isNaN(vendorDetails.tariff_percentage))
        ) {
          vm.skuVendorErrorMessage = "Please provide information to update";
        } else if (
          /* vm.oldDataVendor.vendor_id !== vendorDetails.vendor_id || */
          (
            vm.oldDataVendor.vendor_item_description !== vendorDetails.vendor_item_description ||
            vm.oldDataVendor.vendor_item_number !== vendorDetails.vendor_item_number ||
            vm.oldDataVendor.first_cost !== vendorDetails.first_cost ||
            vm.oldDataVendor.net_cost !== vendorDetails.net_cost ||
            vm.oldDataVendor.hts_number !== vendorDetails.hts_number ||
            vm.oldDataVendor.upc_number !== vendorDetails.upc_number ||
            vm.oldDataVendor.purchasing_information !== vendorDetails.purchasing_information ||
            vm.oldDataVendor.tariff_percentage !== vendorDetails.tariff_percentage
          )
        ) {
          vm.updateVendorBtnText = "Updating ...";
          vm.isVendorBtnEnable = false;
          vm.getUPCresponse = true;
          SKUService.API.UpdateLinkedVendor(vendorDetails)
            .then(response => {
              vm.skuVendorSuccessMessage =
                "Updated Vendor purchase information successfully!";
              vm.updateVendorBtnText = "Update";
              vm.oldDataVendor = _.clone(vendorDetails);
              if (vm.skus && vm.skus.length > 0 && $scope.selected_item.vendor_id == vendorDetails.vendor_id) {
                let skuIndex = vm.skus.findIndex(sku => sku.sku === $scope.skuHead.sku);
                vm.skus[skuIndex].vendor_item_number = vendorDetails.vendor_item_number;
                $scope.$emit("updateSkuDetails", {
                  event: "update",
                  skuDetails: vm.skus[skuIndex],
                  item_id: vm.selected_item_id
                });
              }
              vm.isVendorBtnEnable = true;
              vm.upcalreadyexists = false;
              SKUService.API.GetallskusUPC().then(res => {
                vm.getUPCresponse = false;
                this.allSKUs = res;
              });
              $timeout(() => {
                vm.showPurchseInfoForm = false;
              }, 2000);
              let object = {
                id: $stateParams.id
              }
              this.pushChangeIndicationToMessageQueue(object);
            })
            .catch(error => {
              vm.skuVendorErrorMessage = error.data.error.message ?
                error.data.error.message :
                error.data.error;
              vm.updateVendorBtnText = "Update";
              logger.error(error);
            });
        } else {
          vm.isVendorBtnEnable = true;
          vm.skuVendorErrorMessage =
            ((vm.oldDataVendor.upc_number === vendorDetails.upc_number)) ?
              "Nothing to update" :
              "UPC number should be of length 12";
          vm.updateVendorBtnText = "Update";
        }
      } else {
        $timeout(() => {
          vm.invalidCheckDigit = false;
          vm.upcalreadyexists = false;
        }, 5000);
      }

      $timeout(() => {
        vm.isVendorBtnEnable = true;
        vm.skuVendorSuccessMessage = null;
        vm.skuVendorErrorMessage = null;
      }, 3500);
    };

    /// Delete linked vendor purchase details for a sku
    vm.deleteLinkedVendorDetails = vendorDetails => {
      vm.skuVendorSuccessMessage = "Deleting...";
      vm.linkVendor = {};
      vm.isVendorBtnEnable = false;
      SKUService.API.DeleteLinkedVendor(vendorDetails)
        .then(response => {
          let idx = this.allSKUs.findIndex(oa => oa.upc_number === vm.upc_number)
          if (idx > -1) this.allSKUs.splice(idx, 1);
          vm.linkVendor.first_cost = null;
          vm.linkVendor.net_cost = null;
          vm.isVendorBtnEnable = true;
          vm.skuVendorSuccessMessage =
            "Unlinked vendor purchase information successfully!";
          vm.upc_number = "";
          vm.oldDataVendor = undefined;
          vm.checkDigit = null;
          vm.calculatedCheckDigit = undefined;
          vm.isVendorLinkedToSku = false;
          if (vm.skus && vm.skus.length > 0 && $scope.selected_item.vendor_id == vendorDetails.vendor_id) {
            let skuIndex = vm.skus.findIndex(sku => sku.sku === $scope.skuHead.sku);
            vm.skus[skuIndex].vendor_item_number = undefined;
            $scope.$emit("updateSkuDetails", {
              event: "update",
              skuDetails: vm.skus[skuIndex],
              item_id: vm.selected_item_id
            });
          }
          $timeout(() => {
            vm.showPurchseInfoForm = false;
          }, 2000);
        })
        .catch(error => {
          vm.skuVendorErrorMessage = error.data.error.message ?
            error.data.error.message :
            error.data.error;
          logger.error(error);
        });

      $timeout(() => {
        vm.isVendorBtnEnable = true;
        vm.skuVendorSuccessMessage = null;
        vm.skuVendorErrorMessage = null;
      }, 2000);
    };

    vm.getCurrentVendorInList = vendor => {
      vm.currentVendorInList = {};
      vm.currentVendorInList.net_cost = null;
      vm.currentVendorInList.tariff_percentage = null;
      vm.skuVendorSuccessMessage = null;
      vm.skuVendorErrorMessage = null;
      vm.setInitialState("SKUVendor");
      vm.currentVendorInList.vendor = vendor.vendor;
      vm.currentVendorInList.vendor_id = vendor.vendor_id;
      vm.isVendorLinkedToSku = false; //flag to show vendor is linked or not to the sku
      for (let i = 0; i < vm.vendorsList.length; i++) {
        if (
          vm.vendorsList[i] &&
          vm.vendorsList[i].vendor_id === vendor.vendor_id
        ) {
          vm.currentVendorInList = vm.vendorsList[i];
          vm.isVendorLinkedToSku = true;
        }
      }
      if (
        vm.currentVendorInList.upc_number === undefined ||
        vm.currentVendorInList.upc_number === "" ||
        vm.currentVendorInList.upc_number.length === 0
      ) {
        vm.upc_number = "";
        vm.checkDigit = "";

      } else {
        vm.upc_number = "";
        for (let i = 0; i <= vm.currentVendorInList.upc_number.length - 1; i++) {
          vm.upc_number = vm.upc_number + vm.currentVendorInList.upc_number.charAt(i);
        }
        vm.checkDigit = String(vm.currentVendorInList.upc_number).substr(
          vm.currentVendorInList.upc_number.length - 1
        );
      }
      vm.calculatedCheckDigit = angular.copy(vm.checkDigit);
      vm.currentVendorInList.first_cost =
        vm.currentVendorInList.first_cost === undefined ||
          vm.currentVendorInList.first_cost === null ||
          vm.currentVendorInList.first_cost === isNaN() ?
          null :
          vm.currentVendorInList.first_cost;
    };

    //// add vendor purchase details to array to be linked to the current skuk
    vm.addVendorToList = (vendor, upc_number) => {

      if (vm.original_upc != vm.upc_number) {
        vm.calculateCheckDigit(vm.upc_number);
      }

      if (!vm.invalidCheckDigit && !vm.upcalreadyexists) {
        vm.validationMessage = null;
        // if (vm.upc_number && vm.upc_number.length === 11) {
        //   vm.upc_number = '0' + vm.upc_number;
        // }
        if (
          !(
            (vendor.vendor_item_description === undefined ||
              vendor.vendor_item_description === null ||
              vendor.vendor_item_description === "") &&
            (vendor.vendor_item_number === undefined ||
              vendor.vendor_item_number === null ||
              vendor.vendor_item_number === "") &&
            (vendor.first_cost === undefined ||
              vendor.first_cost === null ||
              isNaN(vendor.first_cost)) &&
            (vendor.net_cost === undefined ||
              vendor.net_cost === null ||
              isNaN(vendor.net_cost)) &&
            (vendor.hts_number === undefined ||
              vendor.hts_number === null ||
              vendor.hts_number === "") &&
            (vendor.purchasing_information === undefined ||
              vendor.purchasing_information === null ||
              vendor.purchasing_information === "") &&
            vm.upc_number.length === 0 &&
            (vendor.tariff_percentage === undefined ||
              vendor.tariff_percentage === null ||
              isNaN(vendor.tariff_percentage))
          ) || (vm.upc_number && vm.upc_number.length == 12)
        ) {
          //vm.upc_number.length === 13 ? vm.upc_number.pop() : null;
          //  if (vm.upc_number.length === 12 || vm.upc_number.length === 0) {
          if (
            vm.upc_number
          ) {
            vm.skuVendorErrorMessage = "";
            /// if upc number is not undefined then apend it to variable in payload
            //let upc_numbers = Object.values(upc_number).join("");
            vendor.upc_number = vm.upc_number;
          } else {
            /// if upc number is undefined then it should not send undefined value as string
            vendor.upc_number = "";
          }

          let flag;
          for (let i = 0; i < vm.vendorsList.length; i++) {
            /// check purchase info vendor id we are adding to list is exists, then re-assign value and set flag
            if (
              vm.vendorsList[i] &&
              vm.vendorsList[i].vendor_id === vendor.vendor_id
            ) {
              vm.vendorsList[i] = vendor;
              flag = 1;
            }
          }

          ///if flag is not set or list is empty then push object to array
          if (flag !== 1 || vm.vendorsList.length === 0) {
            vm.vendorsList.push(vendor); //push object to array
          }

          vm.linkVendor = {};
          vm.currentVendorInList = {};
          vm.showPurchseInfoForm = false;
          vm.isVendorLinkedToSku = true;
          // } else {
          //   vm.skuVendorErrorMessage = "UPC number should be of length 12";
          //   $timeout(() => {
          //     vm.skuVendorErrorMessage = "";
          //   }, 2000);
          // }
        } else {
          vm.skuVendorErrorMessage =
            "Please provide information to update****";
          $timeout(() => {
            vm.skuVendorErrorMessage = "";
          }, 2000);
        }
      } else {
        $timeout(() => {
          vm.invalidCheckDigit = false;
          vm.upcalreadyexists = false;
        }, 5000);
      }
    };

    //// remove vendor purchase details from arrray
    vm.removeVendorFromList = vendor => {
      let index = vm.vendorsList.indexOf(vendor); //get index of object in array
      vm.vendorsList.splice(index, 1); //remove object from the array
      vm.currentVendorInList = {};
      vm.showPurchseInfoForm = false;
      vm.currentVendorInList.first_cost = null;
      vm.currentVendorInList.net_cost = null;
      vm.currentVendorInList.tariff_percentage = null;
      vm.upc_number = "";
    };

    //Link new vendor purchase info to the SKU
    vm.saveSKUVendor = vendorDetails => {
      vendorDetails.sku_id = $stateParams.id ?
        $stateParams.id :
        vm.inserted_sku_id;
      var deferred = common.$q.defer();
      SKUService.API.LinkNewVendor(vendorDetails)
        .then(response => {
          deferred.resolve("Success");
        })
        .catch(error => {
          if (error) {
            vm.skuVendorErrorMessage = error;
            if (error.data) {
              vm.skuVendorErrorMessage = error.data;
            }
            if (error.data && error.data.error) {
              vm.skuVendorErrorMessage = error.data.error;
            }
            if (error.data && error.data.error && error.data.error.message) {
              vm.skuVendorErrorMessage = error.data.error.message;
            }
            logger.error(error);
            deferred.reject("Error");
          }
        });
      return deferred.promise;
    };

    /// link one or more vendors purchase information to the sku from create/update state

    vm.linkNewVendors = (vendorDetails, upc_number) => {
      if (upc_number) {
        // Reversing the array because UPC number retrived from database is of left to right format, in UI we have to show in right to left format.
        // let upc_numbers = Object.values(upc_number)
        //   .reverse()
        //   .join("");
        // let upc_numbers = upc_number;
        // if (vm.upc_number && vm.upc_number.length === 11) {
        //   vm.upc_number = '0' + vm.upc_number;
        // }

        if (vm.original_upc != vm.upc_number) {
          vm.calculateCheckDigit(vm.upc_number);
        }

      }

      if (!vm.invalidCheckDigit && !vm.upcalreadyexists) {

        if (vm.upc_number && vm.upc_number.length === 11) {
          vm.upc_number = '0' + vm.upc_number;
        }
        vendorDetails.upc_number = vm.upc_number;
        if (vm.skuDetails) {
          this.allSKUs.push({
            sku: vm.skuDetails.sku,
            sku_id: vm.skuDetails.id,
            upc_number: vm.upc_number,
            vendor_id: vendorDetails.id
          })
        }
        if (vendorDetails && vm.vendorsList.length === 0) {
          vm.vendorsList.push(vendorDetails);
        }
        if (
          (vendorDetails.vendor_item_description === undefined ||
            vendorDetails.vendor_item_description === null ||
            vendorDetails.vendor_item_description === "") &&
          (vendorDetails.vendor_item_number === undefined ||
            vendorDetails.vendor_item_number === null ||
            vendorDetails.vendor_item_number === "") &&
          (vendorDetails.first_cost === null ||
            isNaN(vendorDetails.first_cost)) &&
          (vendorDetails.net_cost === null ||
            isNaN(vendorDetails.net_cost)) &&
          (vendorDetails.hts_number === undefined ||
            vendorDetails.hts_number === null ||
            vendorDetails.hts_number === "") &&
          (vendorDetails.purchasing_information === undefined ||
            vendorDetails.purchasing_information === null ||
            vendorDetails.purchasing_information === "") &&
          (vendorDetails.tariff_percentage === null ||
            isNaN(vendorDetails.tariff_percentage)) &&
          (vm.upc_number.length === 0) &&
          vm.isUpdate
        ) {
          vm.skuVendorErrorMessage = "Please provide information to update";
        } else {
          let promises = [];
          vm.isVendorBtnEnable = false;
          _.each(vm.vendorsList, vendor => {
            if (vendor.upc_number && vendor.upc_number.length == 11) {
              vendor.upc_number = '0' + vendor.upc_number;
            }
            promises.push(vm.saveSKUVendor(vendor));
          });
          common.$q
            .all(promises)
            .then(values => {
              vm.vendorsList = [];
              vm.isVendorBtnEnable = true;
              vm.isVendorLinkedToSku = true;
              // call made to getLinkedVendorDetails() for populating oldDataVendor object so that it can be used in update
              vm.getLinkedVendorDetails(vendorDetails);
              vm.skuVendorSuccessMessage =
                "Vendor purchase information linked to sku successfully!";
              vm.oldDataVendor = _.clone(vendorDetails);
              if (vm.skus && vm.skus.length > 0 && $scope.selected_item.vendor_id == vendorDetails.vendor_id) {
                let skuIndex = vm.skus.findIndex(sku => sku.sku === $scope.skuHead.sku);
                vm.skus[skuIndex].vendor_item_number = vendorDetails.vendor_item_number;
                $scope.$emit("updateSkuDetails", {
                  event: "update",
                  skuDetails: vm.skus[skuIndex],
                  item_id: vm.selected_item_id
                });
              }
              $timeout(() => {
                vm.showPurchseInfoForm = false;
              }, 2000);
            })
            .catch(error => {
              logger.error(error);
            });
        }
      }
      $timeout(() => {
        vm.isVendorBtnEnable = true;
        vm.skuVendorSuccessMessage = null;
        vm.skuVendorErrorMessage = null;
        this.upcalreadyexists = false;
        vm.invalidCheckDigit = false;
      }, 4000);
    };

    //Add product assortment value for SKU
    vm.addAssortmentValueForSku = productAssortmentObject => {
      return new Promise((resolve, reject) => {
        SKUService.API.AddAssortmentValueForSku(productAssortmentObject)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            logger.error(error);
            reject(error);
          });
      });
    };

    // Get product assortment status for SKU
    vm.getAssortmentStatusForSku = skuId => {
      return new Promise((resolve, reject) => {
        SKUService.API.GetAssortmentStatusForSku(skuId)
          .then(response => {
            resolve(response);
          })
          .catch(error => {
            logger.error(error);
            reject(error);
          });
      });
    };

    // Create Topic
    vm.createTopic = (queueName, change, id) => {
      SKUService.API.CreateTopic(queueName, change, id)
        .then(() => { })
        .catch(() => { });
    };

    vm.resetInventoryMethod = () => {
      $scope.skuHead.huntPath = {};
      $scope.skuHead.rule = {};
      $scope.skuHead.inventory_method_id = null;
    };

    vm.getInventoriesForSku = isInventoryChanged => {
      return new Promise((resolve, reject) => {
        SKUService.API.GetInventoriesForSKU($scope.sku_master_id)
          .then(response => {
            $scope.skuHead.huntPath = {};
            $scope.skuHead.rule = {};
            if (response && response[0] && response[0].inventory_method_id) {
              $scope.skuHead.inventory_method_id = response[0].inventory_method_id;
              vm.inventory_id = response[0].inventory_method_id;
              $scope.skuHead.inventoryMethod = {
                id: vm.inventory_id
              };
            }
            if (response && response[0] && response[0].hunt_path_id !== null) {
              $scope.skuHead.inventory_calculation = 1;
              $scope.skuHead.huntPath.id = response[0].hunt_path_id;
            } else if (response && response[0] && response[0].rule_id !== null) {
              $scope.skuHead.inventory_calculation = 0;
              $scope.skuHead.rule.id = response[0].rule_id;
            }
            vm.isSkuHuntPathAlowed(vm.inventory_id, isInventoryChanged);
            resolve(true);
          })
          .catch(error => {
            reject(false);
            logger.error(error);
          });
      });
    };

    //check If hunt path is allowed for selected sku inventory
    vm.isSkuHuntPathAlowed = (id, isInventoryChanged) => {
      //Set is hunt path to false initially
      vm.isHuntPath = false;
      $scope.skuHead.old_inventory_method_id = $scope.skuHead.inventory_method_id;

      //For each inventory method, check if the selected inventory can allow hunt path
      _.each(vm.inventory_methods, inventory_method => {
        //If inventory id and selected code can allow SKU hunt path
        if (
          inventory_method.id === parseInt(id) &&
          ((inventory_method.code &&
            (inventory_method.code.toLowerCase() === "rf" || inventory_method.code.toLowerCase() === "srfc" ||
              inventory_method.code.toLowerCase() === "srfp")) ||
            (inventory_method.code &&
              (inventory_method.code.toLowerCase() === "sorf" || inventory_method.code.toLowerCase() === "sorfc" ||
                inventory_method.code.toLowerCase() === "sorfp")))
        ) {
          vm.isHuntPath = true;
        }
      });
      if ($state.current.name.includes(".new")) $scope.skuHead.inventory_calculation = 0;
      if (isInventoryChanged && (vm.isHuntPath === false || !$scope.skuHead.old_inventory_method_id)) {
        SKUService.API.RemoveHuntPathFromSKU($stateParams.id)
          .then(response => {
            $scope.skuHead.inventory_calculation = 0;
            $scope.skuHead.huntPath ? $scope.skuHead.huntPath.id = null : $scope.skuHead.huntPath = {};
            $scope.skuHead.hunt_path_type_id = null;
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.ruleTypeValue = () => {
      if (vm.rule_types && vm.rule_types.length == 1) {
        $scope.skuHead.rule.id = vm.rule_types[0].id
      }
    }

    //Fetch hunt path if the selected Inventory method is "Carried By Retailer" based on Id of Selected SKU
    vm.getHuntPathTypeBySku = () => {
      SKUService.API.GetHuntPathTypeBySku($scope.sku_master_id)
        .then(response => {
          if (response.data.length > 0) {
            $timeout(() => {
              $scope.skuHead.hunt_path_type_id = response.data[0].id;
              vm.hunt_path_type_id = response.data[0].id;
              $scope.skuHead.huntPath = {
                id: vm.hunt_path_type_id
              };
              vm.oldSKU ?
                (vm.oldSKU.hunt_path_type_id = vm.hunt_path_type_id) :
                "";
            }, 0);
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.changeHuntPathType = () => {
      $scope.skuHead.hunt_path_type_id = $scope.skuHead.huntPath.id;
    };

    vm.setStageIndication = currentScreen => {
      if (currentScreen && currentScreen.toLowerCase() === "createform") {
        vm.createStage = true;
        vm.vendorPurchaseStage = false;
        vm.configureStage = false;
        vm.configureScreen = false;
        vm.previewandpublishStage = false;
        vm.skuSetStage = false;
        vm.isCloneSkucreate = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "vendorpurchasescreen"
      ) {
        vm.createStage = true;
        vm.vendorPurchaseStage = true;
        vm.configureStage = false;
        vm.configureScreen = false;
        vm.previewandpublishStage = false;
        vm.skuSetStage = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "configureform"
      ) {
        vm.createStage = true;
        vm.vendorPurchaseStage = true;
        vm.configureStage = true;
        vm.previewandpublishStage = false;
        vm.skuSetStage = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "skusetform"
      ) {
        vm.createStage = true;
        vm.vendorPurchaseStage = true;
        vm.configureStage = true;
        vm.previewandpublishStage = false;
        vm.skuSetStage = true;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "skutemplateform"
      ) {
        vm.createStage = true;
        vm.vendorPurchaseStage = true;
        vm.configureStage = true;
        vm.previewandpublishStage = false;
        vm.skuTemplateStage = true;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "previewandpublish"
      ) {
        vm.createStage = true;
        vm.vendorPurchaseStage = true;
        vm.configureStage = true;
        vm.previewandpublishStage = true;
        vm.skuSetStage = true;
      }
    };

    /** Commented on - June 23, 2020 -> can be revet if any issue occurs */

    // vm.reload = refresh => {
    //   let data = vm.GetSKUs(refresh);
    //   vm.filters = {};
    //   vm.groupByField = "";
    //   $scope.setEntityScreen = "SKU";
    //   //after getting total record count load data
    //   $state.current.name.includes(".new") ?
    //     vm.loadSKUHeaders(0) :
    //     vm.loadSKUHeaders(1);
    //   $timeout(() => {
    //     angular.element("#three_dot_menu").focus();
    //   }, 1000);
    //   return data;
    // };

    vm.filterSkuOptions = () => {
      vm.skuHeaders = [];
      for (let i = 0; i < $scope.sku_headers.length; i++) {
        if ($scope.skuHead && $scope.skuHead.sku_type === $scope.sku_headers[i].sku_type) {
          vm.skuHeaders.push($scope.sku_headers[i]);
        }
      }
    };

    //Read Multiple descriptions of specific SKU
    vm.getMultipleDescription = skuid => {
      return new Promise((resolve, reject) => {
        SKUService.API.GetMultipleDescription(skuid)
          .then(response => {
            if (response.length > 0) {
              this.multipledescriptionisset = true;
              $scope.skuHead.gsa_description = response[0].gsa_description;
              $scope.skuHead.rms_description = response[0].rms_description;
              if (vm.oldSKU) {
                vm.oldSKU.gsa_description = $scope.skuHead.gsa_description;
                vm.oldSKU.rms_description = $scope.skuHead.rms_description;
              }
            } else {
              if (vm.oldSKU) {
                vm.oldSKU.gsa_description = "";
                vm.oldSKU.rms_description = "";
              }
              this.multipledescriptionisset = false;
            }
            resolve(true);
          })
          .catch(error => {
            reject(error);
            logger.error(error);
          });
      });
    };

    //Update Multiple descriptions of specific SKU
    vm.updateMultipleDescription = multipledescription => {
      SKUService.API.UpdateMultipleDescription(multipledescription);
    };

    //Insert Multiple descriptions of specific SKU
    vm.insertMultipleDescription = multipledescription => {
      SKUService.API.InsertMultipleDescription(multipledescription);
    };

    //Delete Multiple descriptions of specific SKU
    vm.deleteMultipleDescription = multipledescription => {
      SKUService.API.DeleteMultipleDescription(multipledescription);
    };

    // vm.setSkuDescription = (optid, val) => {
    //   if (
    //     !vm.skuDetails ||
    //     optid != vm.skuDetails.option_list_id ||
    //     !$scope.skuHead.description
    //   ) {
    //     $scope.skuHead.option_list_id = optid;
    //     vm.skuDetails ? (vm.skuDetails.option_list_id = optid) : "";
    //     if (val === 1) {
    //       if (optid === undefined) {
    //         $scope.skuHead.description = "";
    //       }
    //       let name = $scope.skuHeadersMap[optid]["name"];
    //       $scope.skuHead.description =
    //         $scope.selected_item.description + " - " + name;
    //     } else {
    //       $scope.skuHead.description =
    //         $scope.selected_item.description + " - " + optid;
    //     }
    //   }
    // };


    vm.setSkuDescription = (optid, val) => {
      if (
        !vm.skuDetails ||
        optid != vm.skuDetails.option_list_id ||
        !$scope.skuHead.description
      ) {
        $scope.skuHead.option_list_id = optid;
        vm.skuDetails ? (vm.skuDetails.option_list_id = optid) : "";
        if (val === 1) {
          /** Commented on January 6th 2021 for the issue logged in the ticket #2414 */
          // if (optid === undefined) {
          //   $scope.skuHead.description = "";
          // }
          let name = "";
          if (optid) {
            name = $scope.skuHeadersMap[optid]["name"];
          }
          // $scope.skuHead.description = $scope.selected_item.description + " - " + name;
          $scope.skuHead.option_list_name = name;
        } else {
          // $scope.skuHead.description = $scope.selected_item.description + " - " + optid;
          $scope.skuHead.option_list_name = optid;
        }
      }
    };

    vm.resetNoSKUOprion = () => {
      if ($scope.skuHead.option_list_id) {
        $scope.skuHead.no_sku_option = false;
      }
    }

    vm.publishSKUUddDetails = (skuHead, isPublish) => {
      if (isPublish) {
        vm.assortmentForm = false;
        vm.configureScreen = false;
        vm.createForm = false;
        vm.skuTemplateForm = false;
        vm.skuTemplateStage = false;
        vm.vendorPurchaseScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.showSummaryPanel = false;
        vm.skuSetForm = false;
        vm.skuSetStage = false;
      }
      vm.skuSuccessMessage = null;
      vm.skuErrorMessage = null;
      vm.skuUDDSuccessMessage = null;
      vm.skuMTOUDDSuccessMessage = null;
      vm.skuProductAssortmentSuccessMessage = null;
      $scope.skuSuccessMessage = null;
      $scope.skuErrorMessage = null;
      $scope.skuUDDSuccessMessage = null;
      $scope.skuMTOUDDSuccessMessage = null;
      $scope.skuProductAssortmentSuccessMessage = null;

      $timeout(() => {
        vm.publishResponseMessage = true;
      }, 500);

      if (vm.isUpdate) {
        vm.update(skuHead);
        $timeout(() => {
          angular.element("#finish_publish_sku").focus();
        }, 500);
        if (
          skuHead.description &&
          (skuHead.description.includes("Clone") ||
            skuHead.description.includes("clone"))
        ) {
          vm.isCloneAllowedOnItemPublish = false;
        } else {
          vm.isCloneAllowedOnItemPublish = true;
        }
      } else {
        if (!vm.validateSkuForm()) {
          vm.save("SKUMaster", skuHead);
        } else {
          let response = {
            status: 412,
            form_validation_error: vm.validationError
          };
          $scope.$broadcast("saveOrUpdateUdd", {
            event: "save",
            response: response
          })
        }
      }
    };

    //Create new SKU Option Header
    vm.createSkuHeaderObject = details => {
      let value = 1;
      vm.optionError = null;
      details.sku_type = $stateParams.skutype;
      details.item_type_id = $scope.selected_item.type_id;
      vm.previousOL = details;
      vm.$saveOLBtnText = "Saving Now...";
      return new Promise((resolve, reject) => {
        SkuOptionHeaderService.API.InsertSkuHeader(details)
          .then(response => {
            vm.$savesuccess = true;
            vm.$saveOLBtnText = "Save";
            $timeout(() => {
              $scope.skuHead.option_list_id = undefined;
            }, 0);
            details.inserted_id = response.data.inserted_id;
            vm.setSkuDescription(details.name);
            vm.loadSKUHeaders(value, details);
            resolve({
              option_list_id: response.data.inserted_id
            });
          })
          .catch(error => {
            vm.$saveOLBtnText = "Oops.!! Something went wrong";
            vm.$saveOLBtnError = true;
            vm.optionError = error.data.error.message;
            $timeout(() => {
              vm.optionError = null;
              vm.$saveOLBtnText = "Save";
              vm.$saveOLBtnError = false;
              angular.element("#name").focus();
            }, 2500);
            logger.error(error);
          });
      });
    };

    vm.openHelpTextUpdateForm = (helpTextId) => {
      vm.isShowCreateAdvisorHeaderForm = true;
      vm.showAddhelpText = false;
      vm.$updateOLBtnText = "Update";
      vm.isUpdateHelpTextSuccess = false;
      vm.isSaveHelpTextSuccess = false;
      vm.isDeleteHelpTextSuccess = false;
      vm.isConfirmDeleteHelptext = false;
      vm.showHelpTextErrorDetails = false;
      vm.optionError = null;
      let idx = $scope.orderAdvisorHeaders.findIndex(oa => oa.id === Number(helpTextId));
      if (idx > -1) {
        vm.advisor_text_header = angular.copy($scope.orderAdvisorHeaders[idx]);
        vm.old_advisor_text_header = angular.copy($scope.orderAdvisorHeaders[idx]);
      }
      $timeout(() => {
        angular.element("#title").focus();
      }, 1000);
    }

    //Create new SKU Option Header
    vm.createSkuOrderAdvisorHelpText = details => {
      vm.$saveOLBtnText = "Saving Now...";
      let object = {
        Description: details.description,
        Title: details.title
      };
      vm.optionError = null;
      SKUService.API.CreateOrderAdvisorHeaders(object)
        .then(response => {
          vm.isSaveHelpTextSuccess = true;
          vm.$saveOLBtnText = "Save";
          vm.fetchOrderAdvisorHeaders().then(() => { }).catch(() => { });
          $timeout(() => {
            $scope.skuHead.order_help_text_header_id = response.id;
          }, 0);
        })
        .catch(error => {
          vm.$saveOLBtnText = "Oops.!! Something went wrong";
          vm.$saveOLBtnError = true;
          vm.optionError = error.data.message;
          $timeout(() => {
            vm.optionError = null;
            vm.$saveOLBtnText = "Save";
            vm.$saveOLBtnError = false;
            angular.element("#title").focus();
          }, 2500);
          logger.error(error);
        });
    };

    // check that update form previous data is not same as payload
    vm.hasUpdateChangesHelpText = function (payload) {
      if (
        vm.old_advisor_text_header.description !== payload.description ||
        vm.old_advisor_text_header.title !== payload.title
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.updateOrderAdvisorHelpText = (payload) => {
      if (vm.hasUpdateChangesHelpText(payload) === true) {
        vm.$updateOLBtnText = "Updating Now...";
        let object = {
          ID: parseInt(payload.id),
          Description: payload.description,
          Title: payload.title
        };
        OrderHelpTextService.API.UpdateOrderHelpText(payload)
          .then(() => {
            vm.isUpdateHelpTextSuccess = true;
            vm.$updateeOLBtnText = "Update";
            let idx = $scope.orderAdvisorHeaders.findIndex(oa => oa.id === Number(payload.id))
            if (idx > -1) {
              $scope.orderAdvisorHeaders[idx] = payload;
            }
            vm.old_advisor_text_header = angular.copy(payload);
            vm.fetchOrderAdvisorHeaders().then(() => { }).catch(() => { });
          })
          .catch((error) => {
            vm.optionError = error.data.message;
            vm.$updateOLBtnText = "Oops.!! Something went wrong";
            vm.$updateOLBtnError = true;
            $timeout(() => {
              vm.optionError = null;
              vm.$updateOLBtnText = "Update";
              vm.$updateOLBtnError = false;
              angular.element("#title").focus();
            }, 2500);
          });
      } else {
        vm.$updateOLBtnText = "Nothing to update";
        vm.$updateOLBtnError = true;
        $timeout(() => {
          vm.$updateOLBtnText = "Update";
          vm.$updateOLBtnError = false;
          angular.element("#title").focus();
        }, 1000);
      }
    }

    // fuction to close the dependency panel for order help text
    vm.closeDependencyList = () => {
      $timeout(function () {
        angular.element("#title").focus();
      }, 500);
      vm.showHelpTextErrorDetails = false;
      vm.isConfirmDeleteHelptext = false;
    }

    vm.deleteOrderAdvisorHelpText = (payload) => {
      OrderHelpTextService.API.DeleteOrderHelpText(payload)
        .then(() => {
          vm.isDeleteHelpTextSuccess = true;
          vm.isConfirmDeleteHelptext = false;
          let idx = $scope.orderAdvisorHeaders.findIndex(oa => oa.id === Number(payload.id))
          if (idx > -1) {
            $scope.orderAdvisorHeaders.splice(idx, 1);
          }
          vm.advisor_text_header = {};
          $scope.skuHead.order_help_text_header_id = undefined;
          vm.fetchOrderAdvisorHeaders().then(() => { }).catch(() => { });
        })
        .catch((error) => {
          vm.showHelpTextErrorDetails = true;
          if (error.data && error.data.Data && error.data.Data.length > 0) {
            vm.dependentSkus = error.data.Data;
          }
        });
    }

    /// Function to update sku option header
    vm.updateSkuOptionHeader = () => {
      let option = $scope.skuHeadersMap[$scope.skuHead.option_list_id];
      option.sku_type = $stateParams.skutype;
      option.item_type_id = $scope.selected_item.type_id;
      SkuOptionHeaderService.API.UpdateSkuHeader(option)
        .then(() => { })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.createTaskRequestForSetSKU = (skuId, inventoryMethod) => {
      if ($stateParams.subtype.toLowerCase() === "set") {
        let requestData = {
          task_code: "update-sku-availability",
          title: `Update SKU availability for SKU-${skuId}`
        };
        JobsService.API.InsertTaskRequest(requestData)
          .then(response => {
            let propertyObject = {
              request_id: response.data.data,
              property: `sku id`,
              value: skuId
            };
            JobsService.API.InsertTaskRequestProperty(propertyObject)
              .then(result => {
                // console.log(result);
              })
              .catch(error => {
                this.logger.error(error);
              });
          })
          .catch(error => {
            this.logger.error(error);
          });
      } else {
        for (let i = 0; i < this.inventory_methods.length; i++) {
          if (
            parseInt(inventoryMethod["id"]) === this.inventory_methods[i].id &&
            (this.inventory_methods[i].name.toLowerCase() ===
              "special order - retail fulfillment" ||
              this.inventory_methods[i].name.toLowerCase() ===
              "stock - drop ship" ||
              this.inventory_methods[i].name.toLowerCase() ===
              "special order - drop ship")
          ) {
            let requestData = {
              task_code: "update-sku-availability",
              title: `Update SKU availability for SKU-${skuId}`
            };
            JobsService.API.InsertTaskRequest(requestData)
              .then(response => {
                let propertyObject = {
                  request_id: response.data.data,
                  property: `sku id`,
                  value: skuId
                };
                JobsService.API.InsertTaskRequestProperty(propertyObject)
                  .then(result => { })
                  .catch(error => {
                    this.logger.error(error);
                  });
              })
              .catch(error => {
                this.logger.error(error);
              });
          }
        }
      }
    };

    // vm.gobackItem = () => {
    //   $rootScope.$broadcast("gotoItem", {
    //     value: true
    //   });
    // }

    vm.updateSKUNumber = sku_number => {
      vm.duplciatesku = false;
      vm.isUpdateSKU = true;
      var regex = new RegExp(/^[0-9]+[-]?[0-9]+$/);
      if (!regex.test(sku_number)) {
        vm.invalid_sku = true;
      }
      else {
        vm.invalid_sku = false;
      }
      if (sku_number && !vm.invalid_sku) {
        if (sku_number.length < 8) {
          //Append leading zeros to the existing sku number
          sku_number = "000000" + sku_number;
          //Get the sku number of length 6
          !sku_number.includes("-") ?
            (sku_number = sku_number.substr(
              sku_number.length - 7,
              sku_number.length
            )) :
            (sku_number = sku_number.substr(
              sku_number.length - 8,
              sku_number.length
            ));
          !sku_number.includes("-") ?
            (sku_number =
              sku_number.slice(0, 4) + "-" + sku_number.slice(4, 7)) :
            null;
        } else if (sku_number.length === 8) {
          !sku_number.includes("-") ?
            (sku_number =
              sku_number.slice(0, 4) + "-" + sku_number.slice(4, 7)) :
            null;
        } else if (sku_number.length >= 9) {
          !sku_number.includes("-") ?
            (sku_number =
              sku_number.slice(0, 4) +
              "-" +
              sku_number.slice(4, 7) +
              "-" +
              sku_number.slice(7, sku_number.length)) :
            null;
        }
        vm.new_sku = sku_number;
        if (sku_number === $scope.skuHead.sku) {
          vm.skuDuplicateerror =
            "SKU Number changed refers to the same SKU selected. Please enter a valid SKU#.";
          vm.isUpdateSKU = false;
          vm.invalidsku = true;
        }
        else {
          SKUService.API.CheckSKUExists(vm.new_sku).then(res => {

            if (res.data?.length) {
              vm.duplciatesku = true;
              vm.skuDuplicateerror =
                "SKU Number already exists. Please try with some other combination.";
              vm.isUpdateSKU = false;
              vm.invalidsku = true;
            }
            else {
              var obj = {};
              obj.sku = sku_number;
              obj.id = vm.main_sku.id;
              obj.item_id = vm.main_sku.item_id;
              SKUService.API.UpdateSKU(obj)
                .then(result => {
                  vm.skuUpdatedsuccess = "SKU Number Updated Successfully!";
                  $scope.skuHead.sku = _.clone(result.data.sku.sku);
                  SKUService.API.GetSKUByItem(
                    vm.selected_item_id,
                    { page: vm.page, limit: vm.limit },
                    vm.filters,
                    { field: vm.sortByField, order: vm.sortByOrder },
                    { field: vm.groupByField, value: vm.groupByValue },
                    { is_deleted: $stateParams.is_deleted }
                  )
                    .then(response => {
                      vm.skus = response.data.data;
                    })
                  vm.skuNumbersList = [];
                  vm.skuNumberList();
                  // _.each(vm.all_skus, sku => {
                  //   if (sku.id == result.data.sku.id) {
                  //     sku = result.data.sku;
                  //   }
                  // })
                  vm.getallSKUs();
                  vm.isshowEditSku = false;
                  vm.isUpdateSKU = false;
                })
                .catch(error => console.log(error));
            }
          })
        }
      }
      else {
        if (!vm.enableUpdatesku) {
          vm.skuDuplicateerror = "SKU is Validating. Please try again!"
        }
        else {
          vm.skuDuplicateerror =
            "SKU number only allows integers. Eg.(XXXX-XXX)";
        }
        vm.isUpdateSKU = false;
        vm.invalidsku = true;
      }
      $timeout(() => {
        vm.skuDuplicateerror = null;
        vm.skuUpdatedsuccess = null;
        vm.isUpdateSKU = false;
        vm.invalidsku = false;
      }, 3000)
    }

    vm.getItemBySKUNumber = sku_number => {
      vm.isSearching = true;
      vm.skuTransferError = undefined;
      if (sku_number) {
        if (sku_number.length < 8) {
          //Append leading zeros to the existing sku number
          sku_number = "000000" + sku_number;
          //Get the sku number of length 6
          !sku_number.includes("-") ?
            (sku_number = sku_number.substr(
              sku_number.length - 7,
              sku_number.length
            )) :
            (sku_number = sku_number.substr(
              sku_number.length - 8,
              sku_number.length
            ));
          !sku_number.includes("-") ?
            (sku_number =
              sku_number.slice(0, 4) + "-" + sku_number.slice(4, 7)) :
            null;
        } else if (sku_number.length === 8) {
          !sku_number.includes("-") ?
            (sku_number =
              sku_number.slice(0, 4) + "-" + sku_number.slice(4, 7)) :
            null;
        } else if (sku_number.length >= 9) {
          !sku_number.includes("-") ?
            (sku_number =
              sku_number.slice(0, 4) +
              "-" +
              sku_number.slice(4, 7) +
              "-" +
              sku_number.slice(7, sku_number.length)) :
            null;
        }
        if (sku_number === vm.skuNumber) {
          vm.isSearching = false;
          vm.noSkuFound = true;
          vm.skuTransferError =
            "SKU Number searched refers to the same SKU selected. Please enter a valid SKU#.";
        } else {
          vm.searchedSkuNumber = sku_number;
          ItemService.API.GetItems(undefined, {
            sku_number: sku_number
          })
            .then(response => {
              vm.isSearching = false;
              if (response.data.data.length > 0) {
                if (
                  (response.data.data[0].status_id === 200 ||
                    response.data.data[0].status_id === 400) &&
                  response.data.data[0].item_type_id ===
                  $scope.selected_item.item_type_id &&
                  response.data.data[0].vendor ===
                  $scope.selected_item.vendor &&
                  response.data.data[0].id !== $scope.selected_item.id
                ) {
                  if (
                    $scope.selected_item.item_sub_type.toLowerCase() ===
                    "set" &&
                    response.data.data[0].item_sub_type.toLowerCase() !== "set"
                  ) {
                    vm.noSkuFound = true;
                    vm.skuTransferError =
                      "SKU Number searched does not fall under SET sub type. Please enter a valid SKU#.";
                  } else if (
                    $scope.selected_item.item_sub_type.toLowerCase() ===
                    "item" &&
                    response.data.data[0].item_sub_type.toLowerCase() !== "item"
                  ) {
                    vm.noSkuFound = true;
                    vm.skuTransferError =
                      "SKU Number searched does not fall under Item sub type. Please enter a valid SKU#.";
                  } else {
                    vm.Items = response.data.data;
                    vm.selectedItem = response.data.data[0];
                    vm.isShowSelectedItem = false;
                    vm.isListItems = true;
                    vm.moveSkuToItemError = false;
                    vm.moveSkuToItem = false;
                  }
                } else if (
                  (response.data.data[0].status_id === 200 ||
                    response.data.data[0].status_id === 400) &&
                  response.data.data[0].item_type_id !==
                  $scope.selected_item.item_type_id
                ) {
                  vm.noSkuFound = true;
                  vm.skuTransferError =
                    "SKU does not exist under the item type : " +
                    $scope.selected_item.division +
                    "-" +
                    $scope.selected_item.department +
                    "-" +
                    $scope.selected_item.class_info;
                  $scope.selected_item.class_info.toLowerCase() !== "na" ?
                    vm.skuTransferError +
                    "-" +
                    $scope.selected_item.class_info :
                    null;
                } else if (
                  (response.data.data[0].status_id === 200 ||
                    response.data.data[0].status_id === 400) &&
                  response.data.data[0].item_type_id ===
                  $scope.selected_item.item_type_id &&
                  response.data.data[0].vendor !==
                  $scope.selected_item.vendor &&
                  response.data.data[0].id !== $scope.selected_item.id
                ) {
                  vm.noSkuFound = true;
                  vm.skuTransferError =
                    "Selected SKU falls under same item type but different vendor, please choose sku with same item type and vendor.";
                } else if (
                  (response.data.data[0].status_id === 200 ||
                    response.data.data[0].status_id === 400) &&
                  response.data.data[0].item_type_id ===
                  $scope.selected_item.item_type_id &&
                  response.data.data[0].id === $scope.selected_item.id
                ) {
                  vm.noSkuFound = true;
                  vm.skuTransferError =
                    "Selected SKU falls under same item. Please enter a different SKU#.";
                } else if (response.data.data[0].status_id !== 200 &&
                  response.data.data[0].status_id !== 400) {
                  vm.noSkuFound = true;
                  vm.skuTransferError =
                    "Selected SKU belongs to " +
                    response.data.data[0].status +
                    " Item. Please enter a SKU# under Active and Pending Inactive Item.";
                } else {
                  vm.noSkuFound = true;
                  vm.skuTransferError =
                    "No SKU exists for the given SKU#. Please enter a valid one.";
                }
              } else {
                vm.noSkuFound = true;
                vm.skuTransferError =
                  "No SKU exists for the given SKU#. Please enter a valid one.";
              }
            })
            .catch(error => {
              vm.isSearching = false;
              vm.error = error;
            });
        }
      }
    };

    vm.closeMoveSKUPanel = () => {
      vm.isShowMoveSKUPanel = false;
      vm.noSkuFound = false;
      vm.searchedSkuNumber = undefined;
    };

    //Function to check if AS400 changes are being made to the selected item
    vm.hasAS400Changes = payload => {
      for (let key in payload) {
        let checkKeys = ["status_id", "rms_description", "gsa_description", "vendor_item_number", "vendor_item_description", "upc_number", "first_cost"];
        if (checkKeys.includes(key)) {
          if (payload[key] == vm.oldSKU[key]) {
            vm.hasUpdate = false;
          } else if (payload[key] != vm.oldSKU[key]) {
            return (vm.hasUpdate = true);
          }
        }
      }
      return vm.hasUpdate;
    };

    //Function to push IDs of item into message queue to sync changes to AS400
    vm.pushChangeIndicationToMessageQueue = (updatedPayload) => {
      $timeout(() => {
        ItemService.API.CaptureItemChangeInQueue(vm.uuid, updatedPayload.id)
          .then(result => { })
          .catch(error => console.log(error));
      }, 3000)
    }

    //Save the SKU Master Data
    vm.save = (entityName, payload) => {
      let dataToBeSaved = _.clone(payload);
      vm.$saveBtnText = "Saving Now...";
      if (
        entityName &&
        entityName.toLowerCase() === "skumaster" &&
        !vm.disableActions
      ) {
        if (!payload.option_list_id) {
          dataToBeSaved.option_list_id = null;
          dataToBeSaved.option_list_name = null;
          dataToBeSaved.option_header_id = null;
          dataToBeSaved.option_header = null;
        } else {
          dataToBeSaved.option_list_name = $scope.skuHeadersMap[Number(dataToBeSaved.option_list_id)]["name"];
          dataToBeSaved.option_header = $scope.skuHeadersMap[Number(dataToBeSaved.option_list_id)]["name"];
        }
        vm.isProcessing = true;
        // Variable to show the Published review section.
        vm.publishResponseMessage = true;
        dataToBeSaved.item_id = $scope.selected_item.id;
        dataToBeSaved.status_effective_date = $scope.getFormattedDate(
          payload.status_effective_date
        );
        dataToBeSaved.next_effective_date = $scope.getFormattedDate(
          payload.next_effective_date
        );
        //dataToBeSaved.option_list_id = payload.skuOption.id;
        dataToBeSaved.inventory_method_id = payload.inventoryMethod.id;
        dataToBeSaved.old_status_id = dataToBeSaved.old_status_id ? dataToBeSaved.old_status_id : ''
        dataToBeSaved.sku_as400_type = dataToBeSaved.sku_type.toLowerCase() == 'mto' ? 'mto' : 'stock'
        if (dataToBeSaved.romanic_copy) {
          dataToBeSaved.text_romanic_copy = dataToBeSaved.romanic_copy.replace(/<[^>]*>/g, "")
            .replace(/&nbsp;*/g, " ");
        }
        SKUService.API.InsertSKU(dataToBeSaved)
          .then(response => {
            vm.isProcessing = false;
            vm.totalRecordCount = vm.totalRecordCount + 1;
            vm.savedToSKUMasterList = true;
            payload.id = response.data.inserted_id;
            payload.item_id = vm.selected_item_id;
            vm.inserted_sku_id = response.data.inserted_id;
            $scope.skuHead.id = response.data.inserted_id;
            vm.showsku = false;
            payload.sku = response.data.sku_number;
            if (vm.vendorsList && vm.vendorsList.length > 0) {
              let index = vm.vendorsList.findIndex(vendor => vendor.vendor_id === $scope.selected_item.vendor_id);
              if (vm.vendorsList[index] != undefined && vm.vendorsList[index].vendor_item_number) {
                payload.vendor_item_number = vm.vendorsList[index].vendor_item_number;
              }
            }
            vm.linkNewVendors(vm.vendorsList, vm.upc_number);
            $scope.$emit("updateSkuDetails", {
              event: "save",
              skuDetails: payload,
              item_id: vm.selected_item_id
            });
            // update item status
            vm.updateItemStatusBasedOnAssociatedSUKsStatus();
            // call function to create assortment values
            vm.upsertProductAssortmentValuesAfterCreateSKU();
            // call function to link selected vendors to sku
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              response: response.data,
              skuDetails: payload,
              inserted_id: payload.id
            }); // Calling the function in the UDD controller to save or update the UDD Data
            vm.opdone = true;
            if (
              dataToBeSaved.rms_description ||
              dataToBeSaved.gsa_description
            ) {
              let multipledescription = {
                sku_id: payload.id,
                rms_description: dataToBeSaved.rms_description,
                gsa_description: dataToBeSaved.gsa_description
              };
              vm.insertMultipleDescription(multipledescription);
            }
            // Push to AS400 change indication queue
            vm.pushChangeIndicationToMessageQueue(payload);
            // Inserting inventory
            let sku_inventory = {
              inventory_method_id: payload.inventoryMethod.id,
              old_status_id: payload.old_status_id,
              status_id: payload.status_id
            };
            // Send hunt path id if inventory_calculation is 1 or else send rule id.
            $scope.skuHead.inventory_calculation === 1 ?
              (sku_inventory.hunt_path_id = $scope.skuHead.huntPath.id) :
              (sku_inventory.rule_id = $scope.skuHead.rule.id);
            SKUService.API.InsertSKUInventory(payload.id, sku_inventory)
              .then(response => { })
              .catch(error => {
                logger.error(error);
              });

            let selectedHeader =
              $scope.skuHeadersMap[parseInt(payload.option_list_id)];
            // set upc number
            !payload.upc_number ? (payload.upc_number = null) : "";

            // set next_effective_date as 'None' if next_status is 'None'.
            if (payload.next_status_id == 500) {
              payload.next_effective_date = "None";
            }

            if (payload.stock_plus_pricing_sku_id) {
              let idx = vm.skus.findIndex(sk => sk.id == payload.stock_plus_pricing_sku_id)
              payload.stock_plus_pricing_sku = vm.skus[idx].description;
            }
            //push newly created sku to list of skus
            vm.originalSkusDataList.length > 0 ?
              vm.originalSkusDataList.unshift(payload) :
              (vm.originalSkusDataList[0] = payload);

            vm.skus.length > 0 ?
              vm.skus.unshift(payload) :
              (vm.skus[0] = payload);
            vm.recordsCount = vm.skus.length;

            vm.typesMap[payload.id] = payload;
            //if group by filter is applied then update sku from group array
            if (vm.groupByField) {
              payload.sub_type !== "stock plus" &&
                (payload[vm.groupByField] === null ||
                  payload[vm.groupByField] === undefined) ?
                (payload[vm.groupByField] = "NA") :
                "";
              //find index of group under which current sku exist
              let groupFieldIndex = vm.groupSkus.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );
              if (groupFieldIndex === -1) {
                vm.groupSkus.push({
                  [vm.groupByField]: payload[vm.groupByField],
                  count: 1,
                  expanded: false,
                  selected: 1,
                  skus: [payload]
                });
              } else if (
                groupFieldIndex > -1 &&
                vm.groupSkus[groupFieldIndex].skus
              ) {
                vm.groupSkus[groupFieldIndex].skus.unshift(payload);
                vm.groupSkus[groupFieldIndex].count++;
              } else {
                vm.groupSkus[groupFieldIndex].count++;
              }
              vm.groupSkusMap[payload.id] === undefined ?
                (vm.groupSkusMap[payload.id] = payload) :
                "";
            }
            /// if sku option header has sku type name "none" and option header item type id is null then update it with payload sku type and item type id respectively
            if (
              payload.option_list_id &&
              $scope.selected_item &&
              ((selectedHeader.sku_type !== $stateParams.skutype &&
                selectedHeader.item_type_id !== $scope.selected_item.type_id) ||
                (selectedHeader.sku_type === "none" &&
                  selectedHeader.item_type_id === null))
            ) {
              vm.updateSkuOptionHeader();
            }
            vm.AddOrderAdvisorForSku(undefined, response.data.inserted_id);
            vm.getallSKUs();
            // vm.opdone = true;
            vm.uploadQueuedDrops(response.data.inserted_id);
            if ($scope.queuedDrops && $scope.queuedDrops.length > 0) {
              vm.loadImage(payload, "165x165", payload.id, vm.uuid);
            } else {
              vm.loadImage(payload, "165x165", payload.item_id, common.Identifiers.item);
            }

            vm.createTaskRequestForSetSKU(
              response.data.inserted_id,
              payload.inventoryMethod
            );
          })
          .catch(error => {

            vm.isProcessing = false;
            // Variable to show the Published review section.
            // vm.publishResponseMessage = true;
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              error: error
            });
            vm.pushChangeIndicationToMessageQueue(payload);

            // vm.opdone = false;
          });
      }
    };

    // funcion to check if the payload has changed, if yes returns true else returns false
    vm.hasUpdateChanges = payload => {
      if (vm.oldSKU) {
        for (let key in payload) {
          if (key.toLowerCase() === "status_effective_date") {
            vm.oldSKU[key] = moment(vm.oldSKU[key]).format("YYYY-MM-DD");
          }
          if (key.toLowerCase() === "next_effective_date") {
            vm.oldSKU["next_effective_date"].toLowerCase() === "none" ?
              (vm.oldSKU["next_effective_date"] = "1970-01-01") :
              null;
          }
          // Check if keys are not in the following list, if not compare old sku value with new sku value
          if (
            key !== "rule" &&
            key !== "huntPath" &&
            key !== "inventory_calculation" &&
            key !== "isShowUpdateProcessing" &&
            key !== "inventoryMethod" &&
            key !== "createNewOptionName" &&
            key !== "$$hashKey" &&
            key !== "order_help_text_header" &&
            key !== "force_sell_skus" &&
            key !== "status" &&
            key !== "status_short_code" &&
            key !== "next_status" &&
            key !== "option_list_name" &&
            key !== "order_advisor_ids" &&
            !(key === "sku_romanic_copy" && !payload[key])
          ) {
            if (vm.oldSKU[key] != payload[key]) {
              return true;
            }
          }
        }
      }
      return false;
    };

    //function to go to next stage in create/update form
    vm.validateSkuForm = () => {
      // Variable to show the validation message under the form fields
      vm.validationError = [];
      vm.isInvalidForm = false;
      const set_inv = [6, 7, 8, 9];
      if (
        !$scope.skuHead.description || $scope.skuHead.description.length > 100 ||
        !$scope.skuHead.gsa_description || $scope.skuHead.gsa_description.length > 20 ||
        !$scope.skuHead.rms_description || $scope.skuHead.rms_description.length > 30 ||
        ($scope.skuHead.no_sku_option === false && !$scope.skuHead.option_list_id) ||
        !$scope.skuHead.inventoryMethod || !$scope.skuHead.inventoryMethod.id ||
        (
          $scope.skuHead.sku_sub_type !== "installation_fee" &&
          (!$scope.skuHead.rule || (!$scope.skuHead.rule.id && $scope.skuHead.inventory_calculation == 0) || (!$scope.skuHead.huntPath.id && $scope.skuHead.inventory_calculation == 1))
        ) ||
        (
          $scope.skuHead.sku_sub_type == "set" &&
          ($scope.skuHead.inventoryMethod.id == 1 || $scope.skuHead.inventoryMethod.id == 2)
        ) ||
        $scope.skuHead.sku_sub_type !== "set" && set_inv.includes($scope.skuHead.inventory_method_id) ||
        !$scope.skuHead.status_effective_date ||
        (
          !$scope.skuHead.next_effective_date && $scope.skuHead.next_status_id !== 500
        )
        || ($scope.skuHead.sku_sub_type !== "set" && $scope.skuHead.sku_type.toLowerCase() === "stock plus" && $scope.skuHead.inventoryMethod.id == 1) ||
        (
          $scope.skuHead.next_status_id == $scope.skuHead.status_id
        ) ||
        ($scope.skuHead.sku_type && $scope.skuHead.sku_type.toLowerCase() === "stock plus" && !$scope.skuHead.stock_plus_pricing_sku_id)
      ) {
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in SKU Maintenance."
        );
      }

      if (
        (
          vm.skuuddForm &&
          vm.skuuddForm.$invalid &&
          $stateParams.id &&
          $state.current.name.includes(".update")
        )
        ||
        (
          $state.current.name.includes(".new") && (!vm.skuuddForm || vm.skuuddForm.$invalid) && $stateParams["sku_udd_config"]?.length
        )
      ) {
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in SKU UDD."
        );
      }
      return vm.isInvalidForm;
    };

    // Update the SKU Master data
    vm.update = payload => {
      // variable to controle the loader functionality
      vm.isProcessing = true;
      // Variable to show the Published review section.
      vm.publishResponseMessage = true;
      let multipledescription = {
        sku_id: payload.id,
        rms_description: payload.rms_description,
        gsa_description: payload.gsa_description
      };
      let dataToBeUpdate = _.clone(payload);
      vm.$updateBtnText = "Updating Now...";
      dataToBeUpdate.sku = payload.sku;
      dataToBeUpdate.status_effective_date = $scope.getFormattedDate(
        payload.status_effective_date
      );
      dataToBeUpdate.next_effective_date = $scope.getFormattedDate(
        payload.next_effective_date
      );
      //dataToBeUpdate.option_list_id = payload.option_list_id;
      if ($scope.effective_val === false) {
        dataToBeUpdate.next_effective_date = "1970-01-01";
      }
      if (vm.isHuntPath && payload.inventory_calculation == 0) {
        dataToBeUpdate.rule_id = payload.rule.id;
      } else if (vm.isHuntPath && payload.inventory_calculation == 1) {
        dataToBeUpdate.hunt_path_id = payload.huntPath.id;
      }
      if (vm.oldDataVendor && $scope.selected_item && $scope.selected_item.vendor_id === vm.oldDataVendor.vendor_id) {
        if (vm.oldDataVendor.vendor_item_number !== dataToBeUpdate.vendor_item_number) {
          dataToBeUpdate.vendor_item_number = vm.oldDataVendor.vendor_item_number;
        }
        if (vm.oldDataVendor.vendor_item_description !== dataToBeUpdate.vendor_item_description) {
          dataToBeUpdate.vendor_item_description = vm.oldDataVendor.vendor_item_description;
        }
      }
      if (!payload.option_list_id) {
        dataToBeUpdate.option_list_id = null;
        dataToBeUpdate.option_list_name = null;
        dataToBeUpdate.option_header_id = null;
        dataToBeUpdate.option_header = null;
      } else {
        if ($scope.skuHeadersMap[Number(dataToBeUpdate.option_list_id)]) {
          dataToBeUpdate.option_list_name = $scope.skuHeadersMap[Number(dataToBeUpdate.option_list_id)]["name"];
          dataToBeUpdate.option_header = $scope.skuHeadersMap[Number(dataToBeUpdate.option_list_id)]["name"];
        }
      }
      if (!vm.validateSkuForm()) {
        if (!vm.disableActions && vm.hasUpdateChanges(dataToBeUpdate)) {
          if (dataToBeUpdate.stock_plus_pricing_sku_id === null) {
            delete dataToBeUpdate.stock_plus_pricing_sku_id;
          }
          if (payload.huntPath && payload.huntPath.id) {
            let hunt_path_type = {
              sku_id: payload.id,
              hunt_path_type_id: payload.huntPath.id
            };
            SKUService.API.UpdateSKUHuntPathType(hunt_path_type)
              .then(response => {
                vm.isHuntPath = true;
                vm.getHuntPathTypeBySku();
                Notification.responsenotification(response.data);
              })
              .catch(error => {
                logger.error(error);
              });
          }
          dataToBeUpdate.has_error = 0;
          dataToBeUpdate.text_romanic_copy = dataToBeUpdate.romanic_copy?.replace(/<[^>]*>/g, "")
            .replace(/&nbsp;*/g, " ");
          SKUService.API.UpdateSKU(dataToBeUpdate)
            .then(response => {
              vm.updatedSkuResponse = response.data;
              vm.skuDetails.status_id = response.data.sku.status_id;
              vm.skuDetails.next_status_id = response.data.sku.next_status_id;
              vm.getallSKUs();
              if (payload.status_id != vm.oldSKU.status_id) {
                // update item status
                vm.updateItemStatusBasedOnAssociatedSUKsStatus();
                // SKUService.API.UpdateSKUInventoryAvailability(dataToBeUpdate)
                //     .then(() => { })
                //     .catch(error => {
                //       logger.error(error);
                //     });
              }
              // if (dataToBeUpdate.status_id == 300 && dataToBeUpdate.sku_sub_type != "installation_fee") {
              // }
              vm.getItemMetaData();
              vm.savedToMasterList = false;
              // call function to update assortment values
              vm.upsertProductAssortmentValuesAfterUpdateSKU();
              $scope.$broadcast("saveOrUpdateUdd", {
                event: "update",
                response: response.data,
                skuDetails: dataToBeUpdate,
                inserted_id: payload.id
              });
              if (!this.multipledescriptionisset) {
                vm.insertMultipleDescription(multipledescription);
              } else {
                vm.updateMultipleDescription(multipledescription);
              }
              // Push to AS400 change indication queue
              vm.pushChangeIndicationToMessageQueue(dataToBeUpdate);
              // update inventory
              let sku_inventory = {
                inventory_method_id: payload.inventoryMethod.id,
                old_status_id: payload.old_status_id,
                status_id: payload.status_id
              };
              // Send hunt path id if inventory_calculation is 1 or else send rule id.
              $scope.skuHead.inventory_calculation === 1 ?
                (sku_inventory.hunt_path_id = $scope.skuHead.huntPath.id) :
                (sku_inventory.rule_id = $scope.skuHead.rule.id);
              if (vm.inventory_id == $scope.skuHead.inventory_method_id) $scope.skuHead.old_inventory_method_id = vm.inventory_id;
              if ((payload.old_status_id && payload.old_status_id != payload.status_id
                && (payload.inventory_method_id == 1 || payload.inventory_method_id == 6 || payload.inventory_method_id == 7))
                || ($scope.skuHead.old_inventory_method_id != $scope.skuHead.inventory_method_id) || (sku_inventory.hunt_path_id && $scope.skuHead.hunt_path_id != sku_inventory.hunt_path_id)
                || (sku_inventory.rule_id && $scope.skuHead.rule_id != sku_inventory.rule_id)) {
                SKUService.API.UpdateSKUInventory(payload.id, sku_inventory)
                  .then(() => {
                    payload.old_status_id = payload.status_id;
                    $scope.skuHead.old_inventory_method_id = $scope.skuHead.inventory_method_id;
                    vm.inventory_id = $scope.skuHead.inventory_method_id;
                  })
                  .catch(error => {
                    logger.error(error);
                  });
              }
              let selectedHeader =
                $scope.skuHeadersMap[parseInt(payload.option_list_id)];
              /// if sku option header has sku type name "none" then update it with payload sku type
              if (
                payload.option_list_id &&
                $scope.selected_item &&
                ((selectedHeader &&
                  selectedHeader.sku_type !== $stateParams.skutype &&
                  selectedHeader.item_type_id !==
                  $scope.selected_item.type_id) ||
                  (selectedHeader &&
                    selectedHeader.sku_type === "none" &&
                    selectedHeader.item_type_id === null))
              ) {
                vm.updateSkuOptionHeader();
              }
              vm.opdone = true;
              //if group by filter is applied then update sku from group array
              if (vm.groupByField) {
                vm.groupSkusMap[payload.id].sub_type !== "stock plus" &&
                  response.data.sku[vm.groupByField] === null ?
                  (vm.groupSkusMap[payload.id][
                    vm.groupByField
                  ] = response.data.sku[vm.groupByField] = "NA") :
                  "";
                //find index of group under which current sku exist
                let groupFieldIndex = vm.groupSkus.findIndex(
                  group =>
                    group[vm.groupByField] ===
                    vm.groupSkusMap[payload.id][vm.groupByField]
                );
                //find index of sku from skus list under the selected group
                let groupIndex = vm.groupSkus[groupFieldIndex].skus.findIndex(
                  sku => parseInt(sku.id) === parseInt(payload.id)
                );

                if (groupFieldIndex === -1) {
                  vm.groupSkus.push({
                    [vm.groupByField]: payload[vm.groupByField],
                    count: 1,
                    expanded: false,
                    selected: 1,
                    skus: [payload]
                  });
                } else if (
                  groupFieldIndex > -1 &&
                  vm.groupSkus[groupFieldIndex].skus[groupIndex][
                  vm.groupByField
                  ] !== response.data.sku[vm.groupByField]
                ) {
                  vm.groupSkus[groupFieldIndex].skus.splice(groupIndex, 1);
                  vm.groupSkus[groupFieldIndex].count--;
                  let newGroupFieldIndex = vm.groupSkus.findIndex(
                    group =>
                      group[vm.groupByField] ===
                      response.data.sku[vm.groupByField]
                  );
                  if (newGroupFieldIndex === -1) {
                    vm.groupSkus.push({
                      [vm.groupByField]: response.data.sku[vm.groupByField],
                      count: 1,
                      expanded: false,
                      selected: 1,
                      skus: [response.data.sku]
                    });
                  } else if (
                    newGroupFieldIndex > -1 &&
                    vm.groupSkus[newGroupFieldIndex].skus
                  ) {
                    vm.groupSkus[newGroupFieldIndex].skus.unshift(
                      response.data.sku
                    );
                    vm.groupSkus[newGroupFieldIndex].count++;
                    vm.groupSkusMap[payload.id] = response.data.sku;
                  } else {
                    vm.groupSkus[newGroupFieldIndex].count++;
                  }
                  //update sku from list
                  vm.groupSkusMap[payload.id] = response.data.sku;
                  //vm.groupSkus[groupFieldIndex].count++;
                } else if (
                  groupFieldIndex > -1 &&
                  vm.groupSkus[groupFieldIndex].skus
                ) {
                  //update sku from list
                  vm.groupSkus[groupFieldIndex].skus[groupIndex] =
                    response.data.sku;
                  vm.groupSkusMap[payload.id] = response.data.sku;
                } else {
                  //vm.groupSkus[groupFieldIndex].count++;
                }
              }
              if (vm.oldSKU.sku_sub_type !== payload.sku_sub_type) {
                $timeout(() => {
                  if (vm.previewAndPublish) {
                    $state.transitionTo(
                      'common.prime.itemMaintenance.sku.update',
                      {
                        id: payload.id,
                        skutype: payload.sku_type.toLowerCase(),
                        subtype: payload.sku_sub_type.toLowerCase()
                      },
                      {
                        location: 'replace', // This makes it update URL
                        inherit: true,
                        relative: $state.$current,
                        notify: false // This makes it not reload
                      }
                    )
                  }
                }, 3500);
              }
              let index = this.skus.findIndex(sku => sku.id === payload.id);
              this.skus[index] = response.data.sku;
              vm.oldSKU = this.skus[index];
              vm.oldSKU.inventory_method_id =
                $scope.skuHead.inventory_method_id;
              vm.oldSKU.gsa_description = $scope.skuHead.gsa_description;
              vm.oldSKU.rms_description = $scope.skuHead.rms_description;
              vm.oldSKU.order_advisor_ids = $scope.skuHead.order_advisor_ids;
              vm.isProcessing = false;
            })
            .catch(error => {
              // call function to update assortment values
              vm.upsertProductAssortmentValuesAfterUpdateSKU();
              $scope.$broadcast("saveOrUpdateUdd", {
                event: "update",
                skuDetails: dataToBeUpdate,
                error: error
              });
              $timeout(() => {
                vm.isProcessing = false;
              }, 0);
            });
        } else {
          vm.opdone = true;
          let response = {
            status: 403
          };
          let selectedHeader = $scope.skuHeadersMap[parseInt(payload.option_list_id)];
          // if sku option header has sku type name "none" then update it with payload sku type
          if (
            payload.option_list_id &&
            $scope.selected_item &&
            (
              (
                selectedHeader &&
                selectedHeader.sku_type !== $stateParams.skutype &&
                selectedHeader.item_type_id !== $scope.selected_item.type_id
              ) ||
              (
                selectedHeader &&
                selectedHeader.sku_type === "none" &&
                selectedHeader.item_type_id === null
              )
            )
          ) {
            vm.updateSkuOptionHeader();
          }
          // call function to update assortment values
          vm.upsertProductAssortmentValuesAfterUpdateSKU();
          if (vm.hasProductAssortmentUpdateChanges()) {
            response.status = 201;
          }
          $scope.$broadcast("saveOrUpdateUdd", {
            event: "update",
            response: response,
            skuDetails: dataToBeUpdate,
            inserted_id: payload.id
          });
          dataToBeUpdate.has_error = 0;
          SKUService.API.UpdateSKU(dataToBeUpdate)
            .then(() => {
              vm.isProcessing = false;
              vm.getallSKUs();
            })
            .catch(() => {
              vm.isProcessing = false;
            });
        }
      } else {
        let response = {
          status: 412,
          form_validation_error: vm.validationError
        };
        $scope.$broadcast("saveOrUpdateUdd", {
          event: "update",
          response: response,
          skuDetails: dataToBeUpdate,
          inserted_id: payload.id
        });
        $timeout(() => {
          vm.isProcessing = false;
        }, 0);
      }
    };

    // update item status based on associated skus
    vm.updateItemStatusBasedOnAssociatedSUKsStatus = () => {
      ItemService.API.UpdateItemStatusBasedOnAssociatedSUKsStatus($stateParams.item_id)
        .then(() => {
          $scope.$emit("updateSkuDetails", {
            event: "status_changes",
            item_id: vm.selected_item_id
          });
          $scope.$broadcast("updateSetstatus", {
            event: "sku-update",
            skuDetails: vm.skuDetails
          });
        })
        .catch(() => { });
    };

    vm.showDependencyListDetails = data => {
      vm.$errorDependentData = data;
      vm.$showErrorDetailsData = true;
      vm.$showErrorDetails = true;
    };

    //Delete SKU Master data
    vm.delete = (entityName, payload) => {
      vm.isLoadingDelete = true;
      if (!vm.disableActions) {
        SKUService.API.DeleteSKU(payload)
          .then(response => {
            // update item status
            vm.updateItemStatusBasedOnAssociatedSUKsStatus();
            $scope.$emit("updateSkuDetails", {
              event: "delete",
              skuDetails: payload,
              item_id: vm.selected_item_id
            });

            vm.isLoadingDelete = false;
            vm.opdone = true;
            vm.confirmDelete = false;
            $scope.notification.skuSuccessMessage =
              "SKU is deleted successfully";
            let index = vm.skus.findIndex(sku => sku.id === payload.id);
            vm.skus.splice(index, 1);
            vm.totalRecordCount = vm.totalRecordCount - 1;
            vm.recordsCount = vm.skus.length;
            this.pushChangeIndicationToMessageQueue(payload);
            vm.getallSKUs();

            //if group by filter is applied then delete sku from group array
            if (vm.groupByField) {
              vm.groupSkusMap[payload.id].sub_type !== "stock plus" &&
                payload[vm.groupByField] === null ?
                (vm.groupSkusMap[payload.id][vm.groupByField] = payload[
                  vm.groupByField
                ] = "NA") :
                "";
              //find index of group under which current sku exist
              let groupFieldIndex = vm.groupSkus.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );

              //find index of sku from skus list under the selected group
              let groupIndex = vm.groupSkus[groupFieldIndex].skus.findIndex(
                sku => parseInt(sku.id) === parseInt(payload.id)
              );
              //Delete sku from list
              vm.groupSkus[groupFieldIndex].skus.splice(groupIndex, 1);
              vm.groupSkus[groupFieldIndex].count -= 1; //decrease sku count of the group
              delete vm.groupSkusMap[payload.id];
              vm.limit = vm.groupSkus[groupFieldIndex].skus.length + vm.limit;
              vm.groupSkus[groupFieldIndex].groupPage -= 1;
            }
            /* variables to reset the Notification message-start */
            $scope.skuSuccessMessage = null;
            $scope.skuErrorMessage = null;
            $scope.skuSetMessage = null;
            $scope.skuUDDSuccessMessage = null;
            $scope.skuMTOUDDSuccessMessage = null;
            $scope.skuProductAssortmentSuccessMessage = null;
            /* variables to reset the Notification message-end */
            $timeout(() => {
              $scope.notification.skuSuccessMessage = null;
            }, 2500);
            let multipledescription = {
              sku_id: payload.id,
              rms_description: payload.rms_description,
              gsa_description: payload.gsa_description
            };
            if (payload.rms_description || payload.gsa_description) {
              vm.deleteMultipleDescription(multipledescription);
            }
            // Delete inventory based on sku
            SKUService.API.RemoveSKUInventory(payload.id)
              .then(response => {
                Notification.responsenotification(response.data);
              })
              .catch(error => {
                logger.error(error);
              });
            // Delete inventory based on sku
            SkuOptionDetailService.API.DeleteSkuOptionDetailBySKU(payload.id)
              .then(response => { })
              .catch(error => { });
            vm.closeForm("SKUMaster");
          })
          .catch(error => {
            vm.dependencyList = error.data.dependency;
            vm.$showErrorDetailsData = true;
            $timeout(() => {
              $("#rcrightsidebar").focus();
            }, 0);
          });
      }
    };

    vm.resettoDefault = () => {
      if (vm.changingstatus) {
        $scope.skuHead.status_id = vm.skuDetails?.status_id ? vm.skuDetails.status_id : 100;
        if ($state.current.name.includes(".new")) $scope.skuHead.status = "Pending Active";
      }
      if (vm.changingdate) {
        $scope.skuHead.status_effective_date = (!$state.current.name.includes(".new") && vm.skuDetails?.status_effective_date) ? vm.skuDetails.status_effective_date : moment()
          .utcOffset("0")
          .format($scope.date_format);
      }
      if (vm.changingnextstatus) {
        if ($state.current.name.includes(".new")) $scope.skuHead.next_status = "None";
        $scope.skuHead.next_status_id = vm.skuDetails?.next_status_id ? vm.skuDetails.next_status_id : 500;
        $scope.changeevent($scope.skuHead);
      }
      if (vm.changingnextdate) $scope.skuHead.next_effective_date = (!$state.current.name.includes(".new") && vm.skuDetails?.next_effective_date) ? vm.skuDetails.next_effective_date : '';
      common.$timeout(() => {
        vm.changingdate = vm.changingnextdate = vm.changingnextstatus = vm.changingstatus = false;
      }, 2500);
      vm.LoadingSecndryAuth = false;
    }

    vm.changeStatusFields = () => {
      if (vm.alloweditstatuspassword && !this.isContinueSkustatus && (($scope.skuHead.next_status_id !== $scope.skuHead.status_id) || vm.changingnextdate || vm.changingdate)) {
        vm.showLockedScreenStatus = true;
        vm.LoadingSecndryAuth = true;
      }
      else {
        if (vm.changingnextstatus) $scope.changeevent($scope.skuHead);
      }
    }

    vm.reloadUDDs = () => {
      $scope.isEnabled = false;
      if (vm.alloweditstatuspassword && !this.isContinueSkustatus) {
        vm.showLockedScreenStatus = true;
        vm.LoadingSecndryAuth = true;
      }
      else {
        vm.showLockedScreenStatus = false;
        this.isContinueSkustatus = false;
        $scope.skuHead.old_status_id = vm.skuDetails?.status_id ? vm.skuDetails.status_id : '';
        if ($scope.skuHead.status_id == 300 && ($scope.skuHead.old_status_id != $scope.skuHead.status_id || $state.current.name.includes(".new"))) {
          vm.sortInactiveAssortmentvalues();
        }
        else {
          if (vm.oldAssortmentValues) vm.productAssortmentValues = vm.oldAssortmentValues;
          if (vm.newskuoldAssortmentValues) $scope.head.productAssortmentValue = vm.newskuoldAssortmentValues;
          if (!$state.current.name.includes(".new")) vm.fetchAssortmentValueForSKU($scope.skuHead.id)
        }
        common.$timeout(() => {
          $scope.isEnabled = true;
        }, 1);
      }
    };

    //Add order advisors to the SKU
    vm.addOrderAdvisorsToSKU = orderAdvisorIds => {
      vm.skuOrderAdvisors = [];

      let advisorsToRemove = (vm.orderAdvisors || []).filter(orderAdvisor =>
        !orderAdvisorIds.includes(orderAdvisor.order_advisor_id)
      );
      if ($stateParams.id && $state.current.name.includes(".update")) {
        advisorsToRemove.forEach(orderAdvisor => {
          let objectVal = {
            sku_id: $stateParams.id,
            order_advisor_id: parseInt(orderAdvisor.order_advisor_id)
          };
          SKUService.API.DeleteOrderAdvisorForSku(objectVal).then(result => {
            // vm.oldSKU.order_advisor_ids = $scope.skuHead.order_advisor_ids;
            vm.isIsDeleteSuccess = true;
          });
          SKUService.API.DeleteRetailsOrderAdvisorForSku(objectVal).then(res => { })
        });
      }

      for (let i = 0; i < vm.OrderAdvisors.length; i++) {
        orderAdvisorIds.includes(vm.OrderAdvisors[i].id) ?
          vm.skuOrderAdvisors.push(vm.OrderAdvisors[i]) :
          null;
        if (
          i === vm.OrderAdvisors.length - 1 &&
          $stateParams.id &&
          $state.current.name.includes(".update")
        ) {
          for (let i = 0; i < vm.skuOrderAdvisors.length; i++) {
            let object = {
              sku_id: parseInt($stateParams.id),
              order_advisor_id: parseInt(vm.skuOrderAdvisors[i].id),
              force_sell_skus: $scope.skuHead.force_sell_skus ?
                parseInt($scope.skuHead.force_sell_skus) : 0
            };
            SKUService.API.CreateOrderAdvisorForSku(object).then(result => {
              // vm.oldSKU.order_advisor_ids = $scope.skuHead.order_advisor_ids;
              // console.log(result);
            });
          }
        }
      }
    };

    //Remove the sale order advisors from the selected SKU
    vm.FetchOrderAdvisorsForSku = skuID => {
      return new Promise((resolve, reject) => {
        SKUService.API.FetchOrderAdvisorForSkuData(skuID).then(result => {
          if (result.data) {
            $scope.skuHead.order_advisor_ids = [];
            vm.skuOrderAdvisors = [];
            vm.orderAdvisors = result.data;
            result.data[0] ?
              ($scope.skuHead.force_sell_skus = result.data[0].force_sell_skus) :
              null;
            vm.orderAdvisors.forEach(orderAdvisor => {
              $scope.skuHead.order_advisor_ids.push(orderAdvisor.order_advisor_id);
            });

            // Filter and assign corresponding order advisors from the existing vm.OrderAdvisors
            vm.skuOrderAdvisors = vm.OrderAdvisors.filter(orderAdvisor =>
              $scope.skuHead.order_advisor_ids.includes(orderAdvisor.id)
            );
            resolve(true);
          } else {
            reject(false);
          }
        })
          .catch(() => {
            reject(false);
          })
      });
    };

    //Remove the sale order advisors from the selected SKU
    vm.DeleteOrderAdvisorFromSku = selectorderadvisorId => {
      //Find the order advisor index in the array and remove from the array
      let index = vm.skuOrderAdvisors.findIndex(
        orderAdvisor => orderAdvisor.id === selectorderadvisorId
      );
      index >= 0 ? vm.skuOrderAdvisors.splice(index, 1) : null;
      let idindex = $scope.skuHead.order_advisor_ids.findIndex(
        orderAdvisorId => orderAdvisorId === selectorderadvisorId
      );
      idindex >= 0 ? $scope.skuHead.order_advisor_ids.splice(idindex, 1) : null;
      if ($stateParams.id && $state.current.name.includes(".update")) {
        let object = {
          sku_id: $stateParams.id,
          order_advisor_id: parseInt(selectorderadvisorId)
        };
        SKUService.API.DeleteOrderAdvisorForSku(object).then(result => {
          // vm.oldSKU.order_advisor_ids = $scope.skuHead.order_advisor_ids;
          vm.isIsDeleteSuccess = true;
        });
        SKUService.API.DeleteRetailsOrderAdvisorForSku(object).then(res => { })
      }
    };

    vm.forceSellOrderAdvisorSKU = (skuId, forceSellSkus) => {
      let object = {
        sku_id: skuId,
        force_sell_skus: parseInt(forceSellSkus)
      };
      SKUService.API.UpdateOrderAdvisorSku(object).then(result => {
        vm.isIsOAUpdateSuccess = true;
      });
    };

    //Function to add order order advisors to SKU
    vm.AddOrderAdvisorForSku = (orderadvisorId, skuId) => {
      if (vm.skuOrderAdvisors && vm.skuOrderAdvisors.length) {
        for (let i = 0; i < vm.skuOrderAdvisors.length; i++) {
          let object = {
            sku_id: skuId,
            order_advisor_id: parseInt(vm.skuOrderAdvisors[i].id),
            force_sell_skus: $scope.skuHead.force_sell_skus ?
              parseInt($scope.skuHead.force_sell_skus) : 0
          };
          SKUService.API.CreateOrderAdvisorForSku(object).then(result => {
            vm.isIsAddSuccess = true;
          });
        }
      }
    };

    this.setInitialState = entityName => {
      if (entityName.toLowerCase() === "optionlist" && entityName) {
        $timeout(() => {
          angular.element("#name").focus();
        }, 0);
      } else {

      }
    };

    vm.resetSKUOptionForm = () => {
      vm.optList_details = {};
      vm.optList_details["name"] = null;
    };

    //Unlink SKU Set Component in the Side Panel
    vm.unlinkSetDependency = (dependentSku, event) => {
      $scope.$broadcast("saveOrUpdateUdd", {
        event: "delete",
        response: dependentSku,
        skuDetails: vm.skuDetails,
        inserted_id: dependentSku.id
      });
      $scope.notification.skuSetDeleteMessageSuccess = `SKU Component ${dependentSku.description} has been unlinked from ${dependentSku.sku_description}`;
      let dependentIndex = vm.dependencyList.indexOf(dependentSku);
      vm.dependencyList.splice(dependentIndex, 1);
    };

    //unlink all SKU dependency for a Component
    vm.unlinkAllSetDependency = SkuDependencyList => {
      _.each(SkuDependencyList, setSku => {
        if (setSku.dependent_entity.toLowerCase() === "sku component") {
          $scope.$broadcast("saveOrUpdateUdd", {
            event: "delete",
            response: setSku,
            skuDetails: vm.skuDetails,
            inserted_id: setSku.id
          });
          let dependentIndex = vm.dependencyList.indexOf(setSku);
          vm.dependencyList.splice(dependentIndex, 1);
        }
      });
      $scope.notification.skuSetDeleteMessageSuccess = `SKU Component has been unlinked from all associated SKUs`;
    };

    // Function to get all order advisor headers available
    vm.fetchOrderAdvisorHeaders = () => {
      return new Promise((resolve, reject) => {
        $scope.orderAdvisorHeaders = undefined;
        SKUService.API.GetOrderAdvisorHeaders()
          .then(response => {
            $scope.orderAdvisorHeaders = response;
            // vm.orderAdvisorHeaders = response;
            vm.loadOrderHelpTextDropdown();
            resolve(true);
          })
          .catch(error => {
            reject(false);
            logger.error(error);
          });
      });
    };

    // Function to fetch all the order advisors
    vm.fetchOrderAdvisors = () => {
      return new Promise((resolve, reject) => {
        vm.skuOrderAdvisors = [];
        vm.OrderAdvisorServices.OrderAdvisor.FetchAll()
          .then(response => {
            vm.OrderAdvisors = response.data;
            resolve(true);
          })
          .catch(error => {
            reject(false);
            logger.error(error);
          });
      });
    };

    // Function to get all product assortment labels available
    vm.fetchAssortmentLabels = () => {
      return new Promise((resolve, reject) => {
        SKUService.API.GetAssortmentLabels()
          .then(response => {
            vm.assortmentLabels = response;
            resolve(true);
          })
          .catch(error => {
            logger.error(error);
            reject(error);
          });
      });
    };

    // Function to get all product assortment labels available
    vm.fetchAssortmentHierarchies = () => {
      return new Promise((resolve, reject) => {
        HierarchyValueService.API.SearchHierarchyValue(
          "is_assortment_classification_group",
          1
        )
          .then(response => {
            vm.productAssortments = response;
            resolve(true);
          })
          .catch(error => {
            logger.error(error);
            reject(error);
          });
      })
    };

    // Function to assign default assortment values while create
    vm.assignDefaultProductAssortments = () => {
      vm.productAssortmentValues = [];
      $scope.head.productAssortmentValue = {};
      for (let hierarchyIndex = 0; hierarchyIndex < vm.productAssortments.length; hierarchyIndex++) {
        if (
          (
            vm.productAssortments[hierarchyIndex].short_description.toLowerCase() === "regular store" ||
            vm.productAssortments[hierarchyIndex].short_description.toLowerCase() === "outlet store" ||
            vm.productAssortments[hierarchyIndex].short_description.toLowerCase() === "corporate/dc"
          )
        ) {
          // creating new object with default values assigned
          let defaultProductAssortment = {
            group_id: vm.productAssortments[hierarchyIndex].id,
            in_inventory: 0,
            on_display: 0,
            sellable: 1,
            viewable: 1
          }
          // push defaultProductAssortment to vm.productAssortmentValues
          vm.productAssortmentValues.push(defaultProductAssortment);
          $timeout(() => {
            // change ng model values
            $scope.head.productAssortmentValue[vm.productAssortments[hierarchyIndex].id] = { sellable: 1, viewable: 1 };
          }, 0);
        }
      }
    }

    vm.setAssortmentsForLocation = assortmentId => {
      this.locationValue[assortmentId] =
        this.locationValue[assortmentId] === undefined ?
          1 :
          Number(!this.locationValue[assortmentId]);
      vm.productAssortmentValues === undefined ?
        (vm.productAssortmentValues = []) :
        null;
      $scope.head.productAssortmentValue === undefined ?
        ($scope.head.productAssortmentValue = {}) :
        null;
      $scope.head.productAssortmentValue[assortmentId] === undefined ?
        ($scope.head.productAssortmentValue[assortmentId] = {}) :
        null;
      vm.assortmentObject = {};
      vm.assortmentObject.group_id = assortmentId;
      for (let i = 0; i < vm.assortmentLabels.length; i++) {
        if (vm.productAssortmentValuesMap[assortmentId]) {
          let index = this.productAssortmentValues.findIndex(
            productValue => productValue.group_id === assortmentId
          );
          index > -1 ? vm.productAssortmentValues.splice(index, 1) : null;
        }
        vm.assortmentObject[vm.assortmentLabels[i].Field] = this.locationValue[
          assortmentId
        ];
        $scope.head.productAssortmentValue[assortmentId][
          vm.assortmentLabels[i].Field
        ] = this.locationValue[assortmentId];
        vm.productAssortmentValuesMap[assortmentId] = assortmentId;
        if(vm.assortmentObject.group_id  == 62){
          if (vm.assortmentLabels[i].Field == 'on_display' && this.locationValue[assortmentId] == 1) {
            vm.assortmentObject.sellable = 0;
            vm.assortmentObject.viewable = 0;
          // else if (vm.assortmentLabels[i].Field == 'sellable' && this.locationValue[assortmentId] == 1) {
          //   vm.assortmentObject.on_display = 0;
          //   vm.assortmentObject.viewable = 0;
          // }
          // else if (vm.assortmentLabels[i].Field == 'viewable' && this.locationValue[assortmentId] == 1) {
          //   vm.assortmentObject.on_display = 0;
          //   vm.assortmentObject.sellable = 0;
          // }
          $scope.head.productAssortmentValue[vm.assortmentObject.group_id] = {
            in_inventory: vm.assortmentObject.in_inventory,
            on_display: vm.assortmentObject.on_display,
            sellable: vm.assortmentObject.sellable,
            viewable: vm.assortmentObject.viewable
          };
          break;
        }
        }
      }
      vm.productAssortmentValues.push(vm.assortmentObject);
      vm.assortmentGroupIds.push(assortmentId);
    };

    vm.setAssortmentsForLabel = field => {
      this.labelValue[field] =
        this.labelValue[field] === undefined ?
          1 :
          Number(!this.labelValue[field]);
      vm.productAssortmentValues === undefined ?
        (vm.productAssortmentValues = []) :
        null;
      $scope.head.productAssortmentValue === undefined ?
        ($scope.head.productAssortmentValue = {}) :
        null;
      for (let i = 0; i < vm.productAssortments.length; i++) {
        $scope.head.productAssortmentValue[vm.productAssortments[i].id] ===
          undefined ?
          ($scope.head.productAssortmentValue[
            vm.productAssortments[i].id
          ] = {}) :
          null;
        if (
          vm.productAssortmentValuesMap[vm.productAssortments[i].id] ===
          undefined || !vm.productAssortmentValues.some(item => item.group_id === vm.productAssortments[i].id)
        ) {
          vm.assortmentObject = {};
          vm.assortmentObject.group_id = vm.productAssortments[i].id;
          vm.assortmentObject[field] = this.labelValue[field];
          $scope.head.productAssortmentValue[vm.productAssortments[i].id][
            field
          ] = this.labelValue[field];
          vm.productAssortmentValuesMap[vm.productAssortments[i].id] =
            vm.productAssortments[i].id;
          vm.productAssortmentValues.push(vm.assortmentObject);
        } else {
          _.each(vm.productAssortmentValues, value => {
            if (value.group_id === vm.productAssortments[i].id) {
              $scope.head.productAssortmentValue[vm.productAssortments[i].id][
                field
              ] = this.labelValue[field];
              value[field] = this.labelValue[field];
              if (value.group_id == 62) {
                if (field == 'on_display' && this.labelValue[field] == 1) {
                  value.sellable = 0;
                  value.viewable = 0;
                }
                else if (field == 'sellable' && this.labelValue[field] == 1) {
                  value.on_display = 0;
                  value.viewable = 0;
                }
                else if (field == 'viewable' && this.labelValue[field] == 1) {
                  value.on_display = 0;
                  value.sellable = 0;
                }
                $scope.head.productAssortmentValue[value.group_id] = {
                  in_inventory: value.in_inventory,
                  on_display: value.on_display,
                  sellable: value.sellable,
                  viewable: value.viewable
                };
              }
            }
          });
        }
      }
    };

    vm.updateAssortmentStatus = (assortmentArray, newAssortmentArray) => {
      for (let index = 0; index < assortmentArray.length; index++) {
        if (
          assortmentArray[index].change.sku_change.field ===
          newAssortmentArray[index].change.sku_change.field &&
          assortmentArray[index].change.sku_change.value !==
          newAssortmentArray[index].change.sku_change.value
        ) {
          vm.createTopic(
            "sku-update",
            newAssortmentArray[index],
            parseInt($stateParams.id)
          );
        }
      }
    };

    vm.sortInactiveAssortmentvalues = () => {
      vm.oldAssortmentValues = JSON.parse(JSON.stringify(vm.productAssortmentValues));
      vm.newskuoldAssortmentValues = $scope.head.productAssortmentValue ? JSON.parse(JSON.stringify($scope.head.productAssortmentValue)) : {};
      vm.productAssortmentValues.length = 0;
      vm.skuAssortmentValuesMap = [];
      $scope.head.productAssortmentValue = {};
      _.each(vm.productAssortments, product => {
        if (product.id == 58) {
          vm.regularstore = product;
          var obj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 1
          }
          vm.skuAssortmentValuesMap[product.id] = obj;
          $scope.head.productAssortmentValue[product.id] = obj;
          const retailobj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 1
          }
          vm.productAssortmentValues.push(retailobj);
        }
        else if (product.id == 60) {
          vm.outletstore = product;
          var obj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 1
          }
          vm.skuAssortmentValuesMap[product.id] = obj;
          $scope.head.productAssortmentValue[product.id] = obj;
          const outletobj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 1
          }
          vm.productAssortmentValues.push(outletobj);
        }
        else if (product.id == 62) {
          vm.corporate = product;
          var obj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 0
          }
          vm.skuAssortmentValuesMap[product.id] = obj;
          $scope.head.productAssortmentValue[product.id] = obj;
          const corporateobj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 0
          }
          vm.productAssortmentValues.push(corporateobj);
        }
        else if (product.id == 64) {
          vm.corporate = product;
          var obj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 0
          }
          vm.skuAssortmentValuesMap[product.id] = obj;
          $scope.head.productAssortmentValue[product.id] = obj;
          const corporateobj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 0
          }
          vm.productAssortmentValues.push(corporateobj);
        }
        else if (product.id == 67) {
          vm.corporate = product;
          var obj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 1,
            viewable: 1
          }
          vm.skuAssortmentValuesMap[product.id] = obj;
          $scope.head.productAssortmentValue[product.id] = obj;
          const corporateobj = {
            group_id: product.id,
            in_inventory: 0,
            on_display: 0,
            sellable: 1,
            viewable: 1
          }
          vm.productAssortmentValues.push(corporateobj);
        }
      })
    }

    // set assortment value
    vm.setAssortmentValueWhileSKUUpdate = (group, label, value) => {
      // if vm.productAssortmentValues is undefined
      if (!vm.productAssortmentValues) {
        vm.productAssortmentValues = [];
      }
      let assortmentObjectExists = false;
      for (let i = 0; i < vm.productAssortmentValues.length; i++) {
        if (vm.productAssortmentValues[i].group_id === group.id) {
          vm.productAssortmentValues[i][label] = value;
          assortmentObjectExists = true;
          if (vm.productAssortmentValues[i].group_id == 62) {
            if (label == 'on_display' && value == 1) {
              vm.productAssortmentValues[i].sellable = 0;
              vm.productAssortmentValues[i].viewable = 0;
            }
            else if (label == 'sellable' && value == 1) {
              vm.productAssortmentValues[i].on_display = 0;
              vm.productAssortmentValues[i].viewable = 0;
            }
            else if (label == 'viewable' && value == 1) {
              vm.productAssortmentValues[i].on_display = 0;
              vm.productAssortmentValues[i].sellable = 0;
            }
            vm.skuAssortmentValuesMap[vm.productAssortmentValues[i].group_id] = {
              group_id: vm.productAssortmentValues[i].group_id,
              in_inventory: vm.productAssortmentValues[i].in_inventory,
              on_display: vm.productAssortmentValues[i].on_display,
              sellable: vm.productAssortmentValues[i].sellable,
              viewable: vm.productAssortmentValues[i].viewable
            };
          }
          break;
        }
      }
      // if assortmentObject does not exists, then create new object
      if (assortmentObjectExists === false) {
        vm.assortmentObject = {
          group_id: null,
          in_inventory: 0,
          on_display: 0,
          sellable: 0,
          viewable: 0
        };
        vm.assortmentObject.group_id = group.id;
        vm.assortmentObject[label] = value;
        vm.productAssortmentValues.push(vm.assortmentObject);
      }
      $scope.notification.productAssortmentMessage = `Product assortment of <b class="text-info">${group.short_description
        }</b> for <b class="text-info text-capitalize">${label.replace(
          "_",
          " "
        )}</b> is <b class="text-success">updated</b>`;
      timeout = $timeout(() => {
        $scope.notification.productAssortmentMessage = null;
        $timeout.cancel(timeout);
      }, 2500);
    };

    // set assortment value by location
    vm.setAssortmentForLocationWhileSKUUpdate = assortment => {
      // if vm.productAssortmentValues is undefined
      if (!vm.productAssortmentValues) {
        vm.productAssortmentValues = [];
      }
      // if vm.skuAssortmentValuesMap is undefined
      if (!vm.skuAssortmentValuesMap) {
        vm.skuAssortmentValuesMap = [];
      }
      // construct default object
      vm.assortmentObject = {
        group_id: assortment.id,
        in_inventory: 1,
        on_display: 1,
        sellable: 1,
        viewable: 1
      };

      let exsistanceFlag = false;
      // loop through the vm.productAssortmentValues ...
      // if all the values are set for the assortment group, uncheck it... other wise, check all.
      for (let index = 0; index < vm.productAssortmentValues.length; index++) {
        if (vm.productAssortmentValues[index].group_id === assortment.id) {
          if (
            vm.productAssortmentValues[index].in_inventory &&
            vm.productAssortmentValues[index].on_display &&
            ((vm.productAssortmentValues[index].sellable &&
            vm.productAssortmentValues[index].viewable) || vm.productAssortmentValues[index].group_id == 62)
          ) {
            vm.assortmentObject = {
              group_id: assortment.id,
              in_inventory: 0,
              on_display: 0,
              sellable: 0,
              viewable: 0
            };
          } else {
          if (vm.productAssortmentValues[index].group_id == 62) {
            vm.assortmentObject.on_display = 1;
              vm.assortmentObject.sellable = 0;
              vm.assortmentObject.viewable = 0;
          }
        }
          vm.productAssortmentValues[index] = vm.assortmentObject;
          exsistanceFlag = true;
          break;
        }
      }
      // push default object if no record exists in the array
      if (!exsistanceFlag) {
        vm.productAssortmentValues.push(vm.assortmentObject);
      }
      // updating ng-model variable
      vm.skuAssortmentValuesMap[assortment.id] = {
        group_id: assortment.id,
        in_inventory: vm.assortmentObject.in_inventory,
        on_display: vm.assortmentObject.on_display,
        sellable: vm.assortmentObject.sellable,
        viewable: vm.assortmentObject.viewable
      };
    };

    // set assortment for label
    vm.setAssortmentForLabelWhileSKUUpdate = field => {
      // if vm.productAssortmentValues is undefined
      if (!vm.productAssortmentValues) {
        vm.productAssortmentValues = [];
      }
      // if vm.skuAssortmentValuesMap is undefined
      if (!vm.skuAssortmentValuesMap) {
        vm.skuAssortmentValuesMap = [];
      }
      // since setting the assorment values by the field sent,
      // need to have records with all the locations.
      // adding assortment records if not present in the array.
      if (vm.productAssortmentValues.length != vm.productAssortments.length) {
        for (let assortmentsIndex = 0; assortmentsIndex < vm.productAssortments.length; assortmentsIndex++) {
          let valueIndex = Object.values(vm.productAssortmentValues).findIndex(
            assortmentValue => assortmentValue.group_id === vm.productAssortments[assortmentsIndex].id
          );
          if (valueIndex < 0) {
            vm.assortmentObject = {
              group_id: vm.productAssortments[assortmentsIndex].id,
              in_inventory: 0,
              on_display: 0,
              sellable: 0,
              viewable: 0
            };
            vm.productAssortmentValues.push(vm.assortmentObject);
            vm.skuAssortmentValuesMap[vm.productAssortments[assortmentsIndex].id] = {
              in_inventory: vm.assortmentObject.in_inventory,
              on_display: vm.assortmentObject.on_display,
              sellable: vm.assortmentObject.sellable,
              viewable: vm.assortmentObject.viewable
            };
          }
        }
      }
      // determine if ALL records are present with the value 1
      // if they are, set it to 0; otherwise 1.
      let exsistanceFlag = false;
      for (let index = 0; index < vm.productAssortmentValues.length; index++) {
        if (vm.productAssortmentValues[index][field]) {
          exsistanceFlag = true;
        } else {
          exsistanceFlag = false;
          break;
        }
      }
      for (let index = 0; index < vm.productAssortmentValues.length; index++) {
        if (!vm.skuAssortmentValuesMap[vm.productAssortmentValues[index].group_id]) {
          vm.skuAssortmentValuesMap[vm.productAssortmentValues[index].group_id] = {};
        }
        if (!exsistanceFlag) {
          vm.productAssortmentValues[index][field] = 1;
          vm.skuAssortmentValuesMap[vm.productAssortmentValues[index].group_id][field] = 1;
        } else {
          vm.productAssortmentValues[index][field] = 0;
          vm.skuAssortmentValuesMap[vm.productAssortmentValues[index].group_id][field] = 0;
        }
        if (vm.productAssortmentValues[index].group_id == 62) {
          if (field == 'on_display' && vm.productAssortmentValues[index][field] == 1) {
            vm.productAssortmentValues[index].sellable = 0;
            vm.productAssortmentValues[index].viewable = 0;
          }
          else if (field == 'sellable' && vm.productAssortmentValues[index][field] == 1) {
            vm.productAssortmentValues[index].on_display = 0;
            vm.productAssortmentValues[index].viewable = 0;
          }
          else if (field == 'viewable' && vm.productAssortmentValues[index][field] == 1) {
            vm.productAssortmentValues[index].on_display = 0;
            vm.productAssortmentValues[index].sellable = 0;
          }
          vm.skuAssortmentValuesMap[vm.productAssortmentValues[index].group_id] = {
            in_inventory: vm.productAssortmentValues[index].in_inventory,
            on_display: vm.productAssortmentValues[index].on_display,
            sellable: vm.productAssortmentValues[index].sellable,
            viewable: vm.productAssortmentValues[index].viewable
          };
        }
      }
    };

    //Create an array to save product assortment selected during creation of SKU
    vm.createProductAssortmentObject = (group, label, value) => {
      let assortmentObjectExists = false;
      if (
        vm.productAssortmentValues.length == 0 ||
        vm.productAssortmentValues === undefined
      ) {
        vm.assortmentObject.group_id = group.id;
        vm.assortmentObject[label] = value;
        vm.productAssortmentValues.push(vm.assortmentObject);
      } else {
        for (let i = 0; i < vm.productAssortmentValues.length; i++) {
          if (vm.productAssortmentValues[i].group_id === group.id) {
            vm.productAssortmentValues[i][label] = value;
            assortmentObjectExists = true;
            if (vm.productAssortmentValues[i].group_id == 62) {
              if (label == 'on_display' && value == 1) {
                vm.productAssortmentValues[i].sellable = 0;
                vm.productAssortmentValues[i].viewable = 0;
              }
              else if (label == 'sellable' && value == 1) {
                vm.productAssortmentValues[i].on_display = 0;
                vm.productAssortmentValues[i].viewable = 0;
              }
              else if (label == 'viewable' && value == 1) {
                vm.productAssortmentValues[i].on_display = 0;
                vm.productAssortmentValues[i].sellable = 0;
              }
              $scope.head.productAssortmentValue[vm.productAssortmentValues[i].group_id] = {
                in_inventory: vm.productAssortmentValues[i].in_inventory,
                on_display: vm.productAssortmentValues[i].on_display,
                sellable: vm.productAssortmentValues[i].sellable,
                viewable: vm.productAssortmentValues[i].viewable
              };
            }
            break;
          }
        }
        if (assortmentObjectExists === false) {
          vm.assortmentObject = {
            group_id: null,
            in_inventory: 0,
            on_display: 0,
            sellable: 0,
            viewable: 0
          };
          vm.assortmentObject.group_id = group.id;
          vm.assortmentObject[label] = value;
          vm.productAssortmentValues.push(vm.assortmentObject);
        }
      }
      $scope.notification.productAssortmentMessage = `Product assortment of <b class="text-info">${group.short_description
        }</b> for <b class="text-info text-capitalize">${label.replace(
          "_",
          " "
        )}</b> is <b class="text-success">updated</b>`;
      timeout = $timeout(() => {
        $scope.notification.productAssortmentMessage = null;
        $timeout.cancel(timeout);
      }, 2500);
    };

    vm.removeAssortmentValueForSku = productAssortmentObject => {
      SKUService.API.RemoveAssortmentValueForSku(productAssortmentObject)
        .then(response => { })
        .catch(error => {
          logger.error(error);
        });
    };

    /// Add/Update product assortment values to SKU
    vm.upsertProductAssortmentValuesAfterCreateSKU = () => {
      let promiseArray = [];
      if (vm.productAssortmentValues && vm.productAssortmentValues.length > 0) {
        for (let i = 0; i < vm.productAssortmentValues.length; i++) {
          vm.productAssortmentValues[i].id = vm.inserted_sku_id;
          let promise = vm.addAssortmentValueForSku(
            vm.productAssortmentValues[i]
          );
          promiseArray.push(promise);
        }
      }
      Promise.all(promiseArray)
        .then(() => {
          $scope.skuProductAssortmentSuccessMessage = "SKU Product Assortment created successfully.";
          vm.getAssortmentStatusForSku(vm.inserted_sku_id)
            .then(assortmentArray => {
              for (let index = 0; index < assortmentArray.length; index++) {
                vm.createTopic(
                  "sku-create",
                  assortmentArray[index],
                  parseInt($stateParams.id)
                );
              }
            })
            .catch(() => { });
        })
        .catch(() => { });
    };

    // check if product assortment values needs to be updated
    vm.hasProductAssortmentUpdateChanges = () => {
      if (vm.productAssortmentValues.length != vm.oldProductAssortmentValues.length) {
        return true;
      }
      for (
        let produIndex = 0;
        produIndex < vm.productAssortmentValues.length;
        produIndex++
      ) {
        for (
          let oldProduIndex = 0;
          oldProduIndex < vm.oldProductAssortmentValues.length;
          oldProduIndex++
        ) {
          if (
            vm.productAssortmentValues[produIndex].group_id ==
            vm.oldProductAssortmentValues[oldProduIndex].group_id
          ) {
            if (
              vm.productAssortmentValues[produIndex].in_inventory ==
              vm.oldProductAssortmentValues[oldProduIndex].in_inventory &&
              vm.productAssortmentValues[produIndex].on_display ==
              vm.oldProductAssortmentValues[oldProduIndex].on_display &&
              vm.productAssortmentValues[produIndex].sellable ==
              vm.oldProductAssortmentValues[oldProduIndex].sellable &&
              vm.productAssortmentValues[produIndex].viewable ==
              vm.oldProductAssortmentValues[oldProduIndex].viewable
            ) {
              continue;
            } else {
              return true;
            }
          }
        }
      }
      return false;
    }

    /// Add/Update product assortment values to SKU
    vm.upsertProductAssortmentValuesAfterUpdateSKU = () => {
      if (vm.hasProductAssortmentUpdateChanges()) {
        vm.getAssortmentStatusForSku(parseInt($stateParams.id))
          .then(assortmentArray => {
            let promiseArray = [];
            for (let i = 0; vm.productAssortmentValues && i < vm.productAssortmentValues.length; i++) {
              vm.productAssortmentValues[i].id = $stateParams.id;
              let promise = vm.addAssortmentValueForSku(
                vm.productAssortmentValues[i]
              );
              promiseArray.push(promise);
            }
            Promise.all(promiseArray)
              .then(() => {
                vm.oldProductAssortmentValues = JSON.parse(JSON.stringify(vm.productAssortmentValues));
                $scope.skuProductAssortmentSuccessMessage = "SKU Product Assortment updated successfully.";
                vm.getAssortmentStatusForSku($stateParams.id)
                  .then(newAssortmentArray => {
                    if (!vm.updatedSkuResponse || vm.updatedSkuResponse == undefined) {
                      let object = {
                        id: $stateParams.id
                      }
                      this.pushChangeIndicationToMessageQueue(object);
                    }
                    // vm.updateAssortmentStatus(
                    //   assortmentArray,
                    //   newAssortmentArray
                    // );
                  });
              })
              .catch(() => { });
          })
          .catch(() => { });
      } else {
        $scope.skuProductAssortmentSuccessMessage = "Nothing to update in SKU Product Assortment.";
      }
    };

    // Get the Format Type of the SKU Number, (Automatic or Manual)
    vm.getSkuFormatType = () => {
      SKUService.API.GetSkuFormat()
        .then(response => {
          vm.skuFomatType = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Function to get all product assortment labels available
    vm.fetchAssortmentValueForSKU = skuId => {
      return new Promise((resolve, reject) => {
        vm.productAssortmentValues = [];
        vm.oldProductAssortmentValues = [];
        vm.skuAssortmentValuesMap = [];
        SKUService.API.GetAssortmentValuesForSku(skuId)
          .then(response => {
            for (let i = 0; i < response.length; i++) {
              vm.productAssortmentValues.push(response[i]);
              for (let key in response[i]) {
                if (
                  key !== "id" &&
                  key !== "group_id" &&
                  response[i][key] === 1
                ) {
                  vm.skuAssortmentValuesMap[response[i].group_id] = response[i];
                }
              }
            }
            vm.productAssortmentValues = [...vm.productAssortmentValues.filter((item, index, self) =>
              index === self.findIndex((t) => (t.group_id === item.group_id)))];
            vm.oldProductAssortmentValues = JSON.parse(JSON.stringify(vm.productAssortmentValues));
            resolve(true);
          })
          .catch(error => {
            reject(false);
            logger.error(error);
          });
      });
    };

    vm.getUPCConfiguration = () => {
      if (!vm.upc_configuration) {
        SKUService.API.GetUpcConfiguration()
          .then(response => {
            vm.upc_configuration = response.data[0];
          }).catch(error => {
            logger.error(error);
          });
      }
    }

    vm.openForm = (entityName, skuType, subType) => {
      // vm.editStatusRole = false;
      vm.skuOrderAdvisors = [];
      $scope.needToReturnSkuView = false;
      /* variables to reset the Notification message-start */
      // vm.isCloneSkucreate = true;
      $scope.skuSuccessMessage = null;
      $scope.skuErrorMessage = null;
      $scope.skuSetMessage = null;
      $scope.skuUDDSuccessMessage = null;
      $scope.skuMTOUDDSuccessMessage = null;
      $scope.skuProductAssortmentSuccessMessage = null;
      /* variables to reset the Notification message-end */
      vm.opdone = false;
      vm.vendorPurchaseScreen = false;
      vm.manageDropScreen = false;
      vm.assortmentForm = false;
      vm.vendorsList = [];
      $scope.uddValidationErrors = [];
      vm.showPurchseInfoForm = false;
      vm.productAssortmentValues = [];
      vm.isInvalidForm = false;
      // let statusrole = vm.roles.filter(role => role.role_id == 41);
      // if (statusrole?.length) vm.editStatusRole = true;
      // else vm.editStatusRole = false;
      vm.ChangestatusFeature()
      vm.loadSKUHeaders(1);
      vm.getUPCConfiguration();
      // vm.getallSKUs();
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      // Variable to show the Published review section.
      vm.publishResponseMessage = false;
      vm.fetchOrderAdvisorHeaders().then(() => { }).catch(() => { });
      vm.fetchOrderAdvisors().then(() => { }).catch(() => { });
      let assortmentLabelsPromise = vm.fetchAssortmentLabels().then(() => { }).catch(() => { });
      let assortmentHierarchiesPromise = vm.fetchAssortmentHierarchies().then(() => { }).catch(() => { });
      Promise.all([assortmentLabelsPromise, assortmentHierarchiesPromise])
        .then(() => {
          vm.assignDefaultProductAssortments();
        })
        .catch(() => { });
      vm.getSkuFormatType();
      $("body").removeClass("modal-open");
      vm.goToDashBoard = false;
      $scope.notification = {}; //clear notifications on open of new form
      if (
        entityName &&
        entityName.toLowerCase() === "skumaster" &&
        !vm.disableActions
      ) {
        $scope.head = {
          productAssortmentValue: undefined
        };

        vm.assortmentObject = {
          group_id: null,
          in_inventory: 0,
          on_display: 0,
          sellable: 0,
          viewable: 0
        };

        skuType && subType ?
          $state.go("common.prime.itemMaintenance.sku.new", {
            skutype: skuType.toLowerCase(),
            subtype: subType.toLowerCase()
          }) :
          "";
        skuType == "stock plus" || skuType == "Stock Plus" ?
          vm.getStockPlusPricing() :
          "";
        vm.isUpdate = false;
        $scope.skuHead = {};
        vm.showAdvancedSKU = false;
        vm.editSKUPanel = true;
        vm.createForm = true;
        vm.configureScreen = false;
        vm.previewAndPublish = false;
        vm.skuSetForm = false;
        vm.isSKUGrid = false;
        $scope.effective_val = false;
        vm.deleteSKUMessage = null;
        $scope.parent_id = null;
        $scope.skuHead.sku_sub_type = subType;
        $scope.skuHead.sku_type = skuType;
        $scope.skuHead.no_sku_option = true;
        $scope.skuHead.rule = {};
        $scope.skuHead.status_effective_date = moment()
          .utcOffset("0")
          .format($scope.date_format);
        $scope.skuHead.description = $scope.selected_item.description
        $scope.skuHead.rms_description = $scope.selected_item.description
        $scope.skuHead.gsa_description = $scope.selected_item.description
        $scope.skuHead.romanic_copy = $scope.selected_item.romanic_copy
        if ($scope.selected_item.romanic_copy) {
          $scope.skuHead.text_romanic_copy = $scope.selected_item.romanic_copy.replace(/<[^>]*>/g, "")
            .replace(/&nbsp;*/g, " ");
        }
        $scope.skuHead.item_id = $stateParams.item_id;
        $scope.skuHead.status_id = 100;
        $scope.skuHead.next_status_id = 500;
        $scope.skuHead.status = "Pending Active";
        $scope.skuHead.next_status = "None";
        vm.isHuntPath = false;
        $scope.edit_sku_master_id = "";
        vm.resetModel();
        $scope.queuedDrops = [];
      } else if (entityName && entityName.toLowerCase() === "optionlist") {
        vm.getSKUOptionHeaderModelAndSetValidationRules();
        vm.$showOLDetails = true;
        vm.$savesuccess = false;
        vm.optList_details = {};
        $timeout(() => {
          vm.optList_form.$setPristine();
          vm.setInitialState(entityName);
          vm.resetSKUOptionForm();
        }, 0);
      } else if (
        entityName &&
        entityName.toLowerCase() === "orderadvisorheader"
      ) {
        vm.showHelpTextErrorDetails = false;
        vm.isSaveHelpTextSuccess = false;
        vm.isUpdateHelpTextSuccess = false;
        vm.isDeleteHelpTextSuccess = false;
        vm.isConfirmDeleteHelptext = false;
        vm.advisor_text_header = {};
        vm.isShowCreateAdvisorHeaderForm = true;
        vm.showAddhelpText = true;
        vm.optionError = null;
        $timeout(() => {
          angular.element("#title").focus();
        }, 1000);
      }
    };

    vm.dblClickAction = (entity, sku) => {
      // vm.editStatusRole = false;
      vm.isshowEditSku = false;
      vm.skuDuplicateerror = null;
      vm.skuUpdatedsuccess = null;
      vm.isUpdatePage = true;
      vm.isAllLoaded = false;
      vm.createForm = false;
      $scope.needToReturnSkuView = false;
      vm.LoadingSecndryAuth = false;
      // let statusrole = vm.roles.filter(role => role.role_id == 41);
      // if (statusrole?.length) vm.editStatusRole = true;
      // else vm.editStatusRole = false;
      $timeout(() => {
        // Check if the permission map exists, else get the permissions
        if ($scope.permissionsMap && $scope.permissionsMap.update) {
          vm.assortmentForm = false;
          // To hide clone sku popup by default on sku edit
          vm.isCloneSkucreate = false;
          $scope.sku_headers = [];
          $scope.skuHead = {};
          if (sku) {
            sku ? sku.isShowUpdateProcessing = true : "";
            vm.oldDataVendor = undefined;
            $timeout(() => {
              $state
                .go("common.prime.itemMaintenance.sku.update", {
                  id: sku.id,
                  skutype: sku.sku_type.toLowerCase(),
                  subtype: sku.sku_sub_type.toLowerCase()
                })
                .then(() => {
                  sku.isShowUpdateProcessing = false;
                });
            }, 1000);
          }
          $scope.skuHead = _.clone(sku);
          vm.main_sku = _.clone(sku);
          if ($scope.skuHead) {
            $scope.skuHead.status_effective_date = sku.status_effective_date = $scope.getDateBasedOnFormat(
              $scope.skuHead.status_effective_date
            );
            if ($scope.skuHead.next_effective_date) {
              $scope.skuHead.next_effective_date = sku.next_effective_date = $scope.getDateBasedOnFormat(
                $scope.skuHead.next_effective_date
              );
            }
          }
          vm.vendorsList = [];
          $scope.uddValidationErrors = [];
          let pricingChoicePromise = vm.getSKUPricingChoices().then(() => { }).catch(() => { });
          let assortmentPromise = vm.fetchAssortmentValueForSKU(sku.id).then(() => { }).catch(() => { });
          let descriptionPromise = vm.getMultipleDescription($scope.skuHead.id).then(() => { }).catch(() => { });
          let orderAdvisorHeaderPromise = vm.fetchOrderAdvisorHeaders().then(() => { }).catch(() => { });
          let orderAdvisorPromise = vm.fetchOrderAdvisors().then(() => { }).catch(() => { });
          let skuOrderAdvisorPromise = vm.FetchOrderAdvisorsForSku($scope.skuHead.id).then(() => { }).catch(() => { });
          vm.fetchAssortmentLabels().then(() => { }).catch(() => { });
          vm.fetchAssortmentHierarchies().then(() => { }).catch(() => { });
          vm.showPurchseInfoForm = false;
          vm.manageDropScreen = false;
          $scope.notification = {}; //clear notifications on open of update form
          // Variable to show the validation message under the form fields
          vm.validationMessage = null;
          vm.isSetUpcPanel = false;
          vm.isSKUGrid = false;
          vm.updateDescState = true;
          vm.isUpdate = true;
          vm.opdone = false;
          vm.skuDetails = _.clone(sku);
          $scope.showhistory = false;
          $scope.sku_headers.push($scope.skuHeadersMap[sku.option_list_id]);
          vm.copyToHeadInfo("SKUMaster", sku);
          $scope.changeevent(sku);
          let invetoriesPromise = vm.getInventories(sku.sku_type).then(() => { }).catch(() => { });
          $timeout(() => {
            angular.element("#description").focus();
          }, 0);
          let invetoriesForSkuPromise = vm.getInventoriesForSku(false).then(() => { }).catch(() => { });
          let ruleTypePromise = vm.getRuleTypes();
          let huntPathTypePromise = vm.getHuntPathTypes();
          let huntPathTypeBySkuPromise = vm.getHuntPathTypeBySku();
          let stockPlusPromise = vm.getStockPlusPricing();
          $scope.parent_id = sku.id;
          vm.savedToSKUMasterList = true;
          vm.editSKUPanel = true;
          vm.showAdvancedSKU = false;
          vm.createStage = true;
          vm.configureStage = false;
          vm.previewandpublishStage = false;
          vm.createForm = true;
          vm.configureScreen = false;
          vm.vendorPurchaseScreen = false;
          vm.skuSetForm = false;
          vm.skuTemplateForm = false;
          vm.previewAndPublish = false;
          vm.confirmDelete = false;
          $scope.drop = {};
          $scope.files = undefined;
          $scope.errFiles = undefined;
          // Variable to show the Published review section.
          vm.publishResponseMessage = false;
          vm.loadSKUHeaders(1);
          vm.getUPCConfiguration();

          SKUService.API.GetallskusUPC().then(res => {
            this.allSKUs = res;
          });

          /* variables to reset the Notification message-start */
          $scope.skuSuccessMessage = null;
          $scope.skuErrorMessage = null;
          $scope.skuSetMessage = null;
          $scope.skuUDDSuccessMessage = null;
          $scope.skuMTOUDDSuccessMessage = null;
          $scope.skuProductAssortmentSuccessMessage = null;
          /* variables to reset the Notification message-end */

          // Set Dependency Panel to false
          vm.$showErrorDetailsData = false;
          vm.$showErrorDetails = false;
          vm.resetModel();
          Promise.allSettled([
            pricingChoicePromise,
            assortmentPromise,
            descriptionPromise,
            orderAdvisorHeaderPromise,
            orderAdvisorPromise,
            skuOrderAdvisorPromise,
            invetoriesPromise,
            invetoriesForSkuPromise,
            ruleTypePromise,
            huntPathTypePromise,
            huntPathTypeBySkuPromise,
            stockPlusPromise
          ])
            .then(() => {
              $scope.skuHead.description.includes("Clone") ||
                $scope.skuHead.description.includes("clone") ?
                (vm.isCloned = true) :
                (vm.isCloned = false);
              if (
                $scope.skuHead.romanic_copy === "null" ||
                $scope.skuHead.romanic_copy === "undefined"
              ) {
                // Setting default value to empty string if romanic copy is null.
                $scope.skuHead.romanic_copy = "";
                $scope.skuHead.text_romanic_copy = "";
              }
              // After copying all values into skuHead, save a copy of skuHead into oldSKU
              vm.oldSKU = _.clone($scope.skuHead);
              // if page is loaded after retail maintainence, redirect to publish page
              if (this.$state.params.navigateTo === "publishChanges") {
                vm.publishSKUUddDetails($scope.skuHead, true)
              }
              vm.isAllLoaded = true;
            })
            .catch(() => { });
        }
      }, 0);
    };

    //Calculate Check Digit of UPC Number
    vm.calculateCheckDigit = () => {
      let upc_data = vm.upc_number;
      vm.upcalreadyexists = false;
      if (this.allSKUs && this.allSKUs.length) {
        // if (!this.allSKUs.length) {
        //   vm.disableupc = true;
        // }
        var upc_exists = this.allSKUs.map(upc => upc.upc_number);
      }
      // upc_exists = upc_exists.filter(upc => upc.upc_number);
      for (let i = 0; i < upc_exists.length; i++) {
        if (upc_exists[i] && upc_exists[i].length == 13) {
          upc_exists[i] = upc_exists[i].slice(0, -1)
        }
      }
      let upc_number = "";
      upc_number = upc_data;
      if (upc_exists.includes(upc_number) && vm.original_upc != upc_number) {
        vm.disableSetUPCButton = true;
        vm.upcalreadyexists = true;
        let exisitng_sku_upc = this.allSKUs.filter(x => x.upc_number == upc_number)
        if (exisitng_sku_upc?.length) vm.exisitng_sku_upc = exisitng_sku_upc[0].sku
      }
      else {
        if (upc_number.length == 11 && upc_exists.includes("0" + upc_number) && vm.original_upc != upc_number) {
          vm.disableSetUPCButton = true;
          vm.upcalreadyexists = true;
          let exisitng_sku_upc = this.allSKUs.filter(x => x.upc_number == upc_number || x.upc_number == "0" + upc_number)
          if (exisitng_sku_upc?.length) vm.exisitng_sku_upc = exisitng_sku_upc[0].sku
        }
        else {
          if (upc_number) {

            let _oddsum = 0;
            let _evensum = 0;
            let check_digit = undefined;
            vm.deactivateSet = false;
            for (let i = 0; i < upc_number.length - 1; i++) {
              if (i % 2 !== 0) {
                _oddsum = parseInt(_oddsum) + parseInt(upc_number.charAt(i));
              } else {
                _evensum = _evensum + parseInt(upc_number.charAt(i));
              }
            }
            let result = ((_evensum * 3) + _oddsum) % 10;
            if (result !== 0) {
              check_digit = 10 - result;
            } else {
              check_digit = result;
            }
            vm.calculatedCheckDigit = angular.copy(check_digit);
            // if (upc_data && upc_data.length === 11) {
            //   upc_number = '0' + upc_data;
            // } else {
            //   upc_number = upc_data;
            // }
            vm.CheckDigitValidationD(upc_number);
            // vm.checkDigit = angular.copy(check_digit);
            vm.disableSetUPCButton = false;
          }
        }
      }
      $timeout(() => {
        vm.noerrormsg = false;
      }, 3500);
    };
    vm.CheckDigitValidationD = (upc) => {
      let checkD = null
      //if (upc.length == 12) {
      checkD = String(upc).substr(
        upc.length - 1
      );
      //}
      if (checkD && vm.calculatedCheckDigit != 0 && vm.calculatedCheckDigit != checkD) {
        vm.invalidCheckDigit = true;
      } else if (checkD && vm.calculatedCheckDigit == 0 && checkD != 0) {
        vm.invalidCheckDigit = true;
      } else {
        vm.invalidCheckDigit = false;
      }
    }
    // vm.removeEmptyUpcNumber = index => {
    //   //On each change if the entered upc number is empty, replace with 0
    //   if (!vm.upc_number[index]) {
    //     vm.upc_number[index] = 0;
    //   }
    //   let position = 12;
    //   for (let index = 0; index < 12; index++) {
    //     if (!vm.upc_number[index] || vm.upc_number[index] === undefined) {
    //       position = index;
    //       break;
    //     }
    //   }
    // };

    // vm.removeNextUpcNumberOnChange = index => {
    //   //On entering upc number, if upc number doesnt exist, clear the next focused item
    //   if (
    //     (!vm.isUpdate ||
    //       (vm.isUpdate &&
    //         (vm.oldDataVendor === undefined ||
    //           vm.oldDataVendor.upc_number === ""))) &&
    //     vm.upc_number[index]
    //   ) {
    //     vm.upc_number[index + 1] = "";
    //   }
    // };

    vm.setUpc = (upc_data, skuId) => {
      vm.disableSetUPCButton = true;
      let upc_number = Object.values(upc_data).join("");
      let dropDetail = {
        drop_id: vm.bar_code.drop_id,
        lake_id: vm.bar_code.lake_id,
        stream_id: vm.bar_code.stream_id,
        instance_id: skuId,
        uuid: vm.uuid,
        sequence: vm.bar_code.sequence,
        upc: upc_number
      };
      vm.upc_message = null;
      SKUService.API.UpsertUpc(skuId, dropDetail)
        .then(response => {
          vm.selectedRow.upc_number = upc_number;
          vm.upc_message = "Updated UPC number successfully.";
        })
        .catch(error => {
          vm.upc_error = error.data.message;
          logger.error(error);
        });
      $timeout(() => {
        vm.upc_message = null;
        vm.upc_error = null;
        vm.disableSetUPCButton = false;
      }, 4500);
    };

    vm.showUPCPanel = (skuID, upcNumber) => {
      vm.deactivateSet = true;
      vm.showAdvancedSKU = true;
      $("#upcdataModal").modal("show");
      vm.loadUPCNumberObject(upcNumber);
      vm.selectedSKUId = skuID;
      vm.getSkuBarCodes(vm.uuid, skuID);
    };

    vm.loadUPCNumberObject = upc_number => {
      let upcNumber = "";
      if (upc_number && upc_number.length == 11) {
        upcNumber = "0" + upc_number;
      } else {
        upcNumber = upc_number;
      }
      if (upcNumber) {
        // //Append 13 zeros to the existing upc number
        // upcNumber = "0000000000000" + upcNumber;
        // //From the upcnumber string end, get 13 digits of the existing UPC
        // upcNumber = upcNumber.substr(upcNumber.length - 13, upcNumber.length);
        // for (let i = 0; i < upcNumber.length - 1; i++) {
        //   vm.upc_number[i] = upcNumber[i];
        // }
        // // Reversing the array because UPC number retrived from database is of left to right format, in UI we have to show in right to left format.
        // vm.upc_number = vm.upc_number.reverse();
        // vm.checkDigit = upcNumber[12];
        vm.upc_number = upcNumber;
        vm.original_upc = upcNumber;
        vm.checkDigit = upcNumber.charAt(12);
        vm.calculatedCheckDigit = angular.copy(vm.checkDigit);
        vm.disableSetUPCButton = false;
      } else {
        // vm.upc_number = [
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0",
        //   "0"
        // ];
        vm.upc_number = ""; // 12 digits
        vm.original_upc = "";
        vm.checkDigit = undefined;
        vm.calculatedCheckDigit = undefined;
      }
    };

    // To check whether calculated check digit is equal to check digit.
    vm.CheckDigitValidation = () => {
      if (vm.checkDigit && vm.calculatedCheckDigit != 0 && vm.calculatedCheckDigit != vm.checkDigit) {
        vm.invalidCheckDigit = true;
      } else if (vm.checkDigit && vm.calculatedCheckDigit == 0 && vm.checkDigit != 0) {
        vm.invalidCheckDigit = true;
      } else {
        vm.invalidCheckDigit = false;
      }
    }

    //Initialize Sku vendor purchase information during SKU create
    vm.initializeSkuVendorPuchaseInfo = () => {
      // vm.upc_number = [
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0",
      //   "0"
      // ];
      vm.upc_number = "000000000000"; // 12 digits
      vm.checkDigit = undefined;
      vm.calculatedCheckDigit = undefined;
    };

    vm.closeUPCPanel = () => {
      $("#upcdataModal").modal("hide");
    };

    vm.setClickedRow = data => {
      vm.selectedRow = data;
    };

    vm.getSkuBarCodes = (uuid, sku_id) => {
      vm.codes = [];
      vm.bar_code = {};
      DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
        uuid,
        sku_id,
        "code"
      )
        .then(response => {
          for (let i = 0; i < response.length; i++) {
            response[i].thumbnail = DataLakeAPIService.API.GetDownloadUrl(
              response[i].drop_id,
              vm.uuid
            );
            vm.codes.push(response[i]);
            if (response[i].file_name.startsWith("code128")) {
              vm.bar_code = response[i];
            }
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getDownloadUrl = (url, downloadUrl) => {
      if (!downloadUrl) {
        return DataLakeAPIService.API.GetDownloadUrl(url, vm.uuid);
      } else {
        return downloadUrl;
      }
    };

    vm.createAnotherForm = entityName => {
      if (entityName && entityName.toLowerCase() === "optionlist") {
        vm.$showOLDetails = true;
        vm.$saveOLBtnText = "Save";
        vm.$savesuccess = false;
        vm.optList_details = {};
        vm.optList_details.status_id = vm.previousOL.status_id;
        $timeout(() => {
          angular.element("#name").focus();
        }, 1000);
      } else if (
        entityName &&
        entityName.toLowerCase() === "orderadvisorheader"
      ) {
        vm.isSaveHelpTextSuccess = false;
        vm.advisor_text_header = {};
        vm.isShowCreateAdvisorHeaderForm = true;
        $timeout(() => {
          angular.element("#title").focus();
        }, 1000);
      }
    };

    vm.focusCreateHelpText = () => {
      $timeout(() => {
        angular.element("#order_help_create").focus();
      }, 1000);
    }
    //Storage Functions START

    vm.initializeDropForm = () => {
      $scope.isAllowMultipleDrops = true;
      // variable to call confirmation panel on cover image deletion
      vm.showConfirmDeletion = false;
      vm.showConfirmThumbnailDeletion = false;
      vm.DeletionConfirmation = false;
      vm.DeletionThumbnailConfirmation = false;
      vm.is_thumbnail = 1;
      //Hide the Queued message on load of the drop manage screen
      angular.element("#showQueueMessage").hide();
    };

    vm.getDropStatus = () => {
      try {
        $scope.statusList = DataLakeService.GetDropStatuses();
      } catch (error) {
        logger.error(error);
      }
    };

    //Get available drops by an entity and its uuid
    vm.fetchDropsByUuidAndInstanceId = instanceId => {
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      try {
        DataLakeService.GetDropByUuidAndInstanceId(vm.uuid, instanceId)
          .then(response => {
            //If response array is greater than 0, set the response into drops variable

            if (response.length > 0) {
              for (let index = 0; index < response.length; index++) {
                // if stream is cover image, then insert thumbnail with same url
                if (
                  response[index].stream.toLowerCase() === "cover image" &&
                  response[index].is_thumbnail
                ) {
                  // create an object with response fields and assign values.
                  let obj = {
                    id: response[index].id,
                    file_name: response[index].file_name,
                    stream: "Thumbnail",
                    stream_code: "thumbnail",
                    stream_id: 1,
                    drop_id: response[index].drop_id,
                    drop_type: response[index].drop_type,
                    entity: response[index].entity,
                    status_id: response[index].status_id,
                    sequence: 1,
                    lake: response[index].lake,
                    lake_id: response[index].lake_id,
                    type: response[index].type,
                    type_id: response[index].type_id,
                    size: response[index].size,
                    kind: response[index].kind,
                    url: response[index].url,
                    is_coverImage: true,
                    instance_id: response[index].instance_id
                  };
                  if (response[index].is_thumbnailImage) {
                    obj.is_coverImage = false;
                    obj.is_thumbnailImage = 1;
                  }
                  // push the object to the response
                  response.push(obj);
                }
              }
              // assign the response to drops
              let last_sequence = 0
              for (let i of response) {
                if (i.sequence != null) {
                  last_sequence = i.sequence
                } else {
                  last_sequence = 1
                }
              }
              for (let j of response) {
                if (
                  (j.sequence == 0 || j.sequence == null || $scope.fromsetcoverimage) &&
                  j.stream_id == 1
                ) {
                  if (last_sequence != 0 && (response.filter(x => x.stream_id == 33)[0].drop_id != j.drop_id)) {
                    j.sequence = last_sequence + 1;
                    last_sequence = j.sequence;
                    DataLakeAPIService.API.UpdateDetails(j).then((res) => { $scope.drops = response });
                  }
                }
              }
              $scope.fromsetcoverimage = false;
              $scope.drops = response;
              vm.disableSetCoverImage = false;
              let duplicateDrops = $scope.drops.filter(item => {
                return item.stream_id == 33;
              });
              if (duplicateDrops && duplicateDrops.length == 0) {
                vm.disableSetCoverImage = true;
              }
              if (duplicateDrops && duplicateDrops.length > 0) {
                vm.isDisableSaveCvrImg = false;
              }
            } else {
              // assign the response to drops
              $scope.drops = response;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } catch (error) {
        logger.error(error);
      }
    };

    vm.setDropAsCoverImage = (set_cover_image, drop) => {
      set_cover_image = 1;
      $scope.queuedDrops.sort(function (a, b) {
        return a.display_sequence - b.display_sequence
      })
      let ids = $scope.queuedDrops.map(it => it.unique_id);
      // let index = ids.indexOf(drop.unique_id);
      if (set_cover_image == 1) {
        vm.isAddedToQueue = true;
        let coverImageDrops = $scope.queuedDrops.filter(item => {
          return item.stream_id == 33;
        });
        // let thumbnailDrops = $scope.queuedDrops.filter(item => {
        //   return item.stream_id == 1 && item.drop_id == drop_id;
        // });
        if (coverImageDrops && coverImageDrops.length == 0) {
          vm.uniqueId = vm.uniqueId + 1;
          // drop.stream_id =33;
          // drop.is_thumbnail = 1;
          // drop.is_thumbnailImage = 1;
          // drop.is_coverImage = false; 
          let obj = {
            lake: drop.lake,
            lake_id: drop.lake_id,
            stream_id: 33,
            url: drop.url,
            file_name: drop.file_name,
            files: drop.files,
            status_id: drop.status_id,
            is_save_to_document_store: drop.is_save_to_document_store,
            source: drop.source,
            stream: "Cover Image",
            stream_code: "cover_image",
            is_coverImage: false,
            is_thumbnail: 1,
            is_thumbnailImage: 1,
            unique_id: vm.uniqueId,
            coverImgId: drop.unique_id,
            size: drop.size
          };
          $scope.queuedDrops.push(obj);
          drop.is_thumbnailImage = 1;
          drop.display_sequence = 1
          let adding = 1
          for (let i of $scope.queuedDrops) {
            if (i.unique_id != drop.unique_id) {
              adding += 1
              i.display_sequence = adding
            }
          }
          // set_cover_image = 0;
          // _.each($scope.queuedDrops, value => {
          //   if (value.stream_id == 1) {
          //     value.is_thumbnailImage = 1;
          //     value.set_cover_image
          //   }
          // });
          if ($scope.queuedDrops.length > 0) {
            vm.isUploading = false;
            angular.element("#showQueueMessage").show();
            vm.showSuccessQueueMessage = "Image added to the Queue";

            // if ($scope.drop.source.toLowerCase() === "camera") {
            //   vm.closeCam();
            // } else {
            vm.resetValues();
            // }
            vm.resetModel();

            $timeout(() => {
              angular.element("#showQueueMessage").hide();
              vm.showSuccessQueueMessage = null;
            }, 2500);
          }
          vm.isAddedToQueue = false;
        } else if (coverImageDrops && coverImageDrops.length > 0) {
          let coverDrops = [];
          coverDrops = coverImageDrops[0];
          let index1 = ids.indexOf(coverDrops.unique_id);
          $scope.queuedDrops.splice(index1, 1);
          // update the thumbnail record with is_thumbnailImage 0
          for (let i = 0; i < $scope.queuedDrops.length; i++) {
            if ($scope.queuedDrops[i].is_thumbnailImage) {
              $scope.queuedDrops[i].is_thumbnailImage = 0;
              $scope.queuedDrops[i].is_thumbnail = 0;
              // coverDrops.is_thumbnailImage = 0;

            }
          }
          // angular.element("#showQueueMessage").show();
          // vm.showSuccessQueueMessage = "Image removed from the Queue";
          // let duplicateDrops = $scope.queuedDrops.filter(item => {
          //   return item.stream_id == 33;
          // });
          // if (duplicateDrops && duplicateDrops.length == 0) {
          //   vm.disableSetCoverImage = true;
          // }
          // $timeout(() => {
          //   angular.element("#showQueueMessage").hide();
          //   vm.showSuccessQueueMessage = null;
          // }, 2500);
          vm.uniqueId = vm.uniqueId + 1;
          // drop.stream_id =33;
          // drop.is_thumbnail = 1;
          // drop.is_thumbnailImage = 1;
          // drop.is_coverImage = false; 
          let obj = {
            lake: drop.lake,
            lake_id: drop.lake_id,
            stream_id: 33,
            url: drop.url,
            file_name: drop.file_name,
            files: drop.files,
            status_id: drop.status_id,
            is_save_to_document_store: drop.is_save_to_document_store,
            source: drop.source,
            stream: "Cover Image",
            stream_code: "cover_image",
            is_coverImage: false,
            is_thumbnail: 1,
            is_thumbnailImage: 1,
            unique_id: vm.uniqueId,
            coverImgId: drop.unique_id,
            size: drop.size
          };
          $scope.queuedDrops.push(obj);
          drop.is_thumbnailImage = 1;
          drop.display_sequence = 1
          let adding = 1
          for (let i of $scope.queuedDrops) {
            if (i.unique_id != drop.unique_id) {
              adding += 1
              i.display_sequence = adding
            }
          }
          // set_cover_image = 0;
          // _.each($scope.queuedDrops, value => {
          //   if (value.stream_id == 1) {
          //     value.is_thumbnailImage = 1;
          //     value.set_cover_image
          //   }
          // });
          if ($scope.queuedDrops.length > 0) {
            vm.isUploading = false;
            angular.element("#showQueueMessage").show();
            vm.showSuccessQueueMessage = "Image added to the Queue";

            // if ($scope.drop.source.toLowerCase() === "camera") {
            //   vm.closeCam();
            // } else {
            vm.resetValues();
            // }
            vm.resetModel();

            $timeout(() => {
              angular.element("#showQueueMessage").hide();
              vm.showSuccessQueueMessage = null;
            }, 2500);
          }
          vm.isAddedToQueue = false;
        }
      }
    }

    vm.setCoverImage = (set_cover_image, drop_id) => {
      if (set_cover_image == 1) {
        let coverImageDrops = $scope.drops.filter(item => {
          return item.stream_id == 33;
        });
        let thumbnailDrops = $scope.drops.filter(item => {
          return item.stream_id == 1 && item.drop_id == drop_id;
        });
        let dropThumbnail = [];
        if (coverImageDrops && coverImageDrops.length == 0) {
          $scope.is_thumbnailImage = true;
          dropThumbnail = thumbnailDrops[0];
          dropThumbnail.uuid = vm.uuid;
          dropThumbnail.stream_id = 33;
          dropThumbnail.is_thumbnail = 1;
          dropThumbnail.is_thumbnailImage = null;
          dropThumbnail.sequence = 1
          vm.isDeleting = true;
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Set Cover Image successfully.";
          DataLakeAPIService.API.UpdateDrop(dropThumbnail)
            .then(response => {
              vm.isBtnEnabled = true;
              vm.showConfirm = false;
              vm.$updateBtnText = "Update";
              vm.isDeleting = 1;
              angular.element("#showQueueMessage").show();
              vm.showSuccessQueueMessage = "Set Cover Image successfully.";
              vm.isDropProcessed = true;
              vm.fetchDropsByUuidAndInstanceId(dropThumbnail.instance_id);
              vm.getItemMetaData();
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              $scope.isImage = true;
              $scope.isDropUploaded = true;
              $timeout(() => {
                angular.element("#showQueueMessage").hide();
                vm.showSuccessQueueMessage = null;
                vm.isDeleting = false;
              }, 2500);
            })
            .catch(error => {
              if (error.status === 403) {
                vm.isDropUnauthorized = true;
                vm.isDeleting = false;
              }
              $scope.error = error;
            });
        } else if (coverImageDrops && coverImageDrops.length > 0) {
          let coverDrops = [];
          coverDrops = coverImageDrops[0];
          if (!coverDrops.is_thumbnailImage && !coverDrops.is_thumbnail) {
            coverDrops.uuid = vm.uuid;
            DataLakeService.DeleteDrop(coverDrops)
              .then(() => {
                // delete vm.oldItem.thumbnail;
                // delete $scope.head.thumbnail;
                // resolve(true);
                $timeout(() => {
                  angular.element("#showQueueMessage").hide();
                  vm.showSuccessQueueMessage = null;
                }, 2500);
              })
              .catch(error => {
                vm.isProcessing = false;
                vm.isDeleting = false;
                // reject(false);
                logger.error(error);
              });
          }
          if (coverDrops.is_thumbnailImage || coverDrops.is_thumbnail) {
            coverDrops.uuid = vm.uu_id;
            coverDrops.stream_id = 1;
            coverDrops.is_thumbnail = 1;
            coverDrops.is_thumbnailImage = 0;
            DataLakeAPIService.API.UpdateDrop(coverDrops)
              .then(response => {
                $scope.is_thumbnailImage = true;
                dropThumbnail = thumbnailDrops[0];
                dropThumbnail.uuid = vm.uuid;
                dropThumbnail.stream_id = 33;
                dropThumbnail.is_thumbnail = 1;
                dropThumbnail.is_thumbnailImage = 1;
                dropThumbnail.sequence = 1
                vm.isDeleting = true;
                angular.element("#showQueueMessage").show();
                vm.showSuccessQueueMessage = "Set Cover Image successfully.";
                DataLakeAPIService.API.UpdateDrop(dropThumbnail)
                  .then(response => {
                    $scope.fromsetcoverimage = true;
                    vm.isBtnEnabled = true;
                    vm.showConfirm = false;
                    vm.$updateBtnText = "Update";
                    vm.isDeleting = 1;
                    angular.element("#showQueueMessage").show();
                    vm.showSuccessQueueMessage = "Set Cover Image successfully.";
                    vm.isDropProcessed = true;
                    vm.fetchDropsByUuidAndInstanceId(dropThumbnail.instance_id);
                    vm.getItemMetaData();
                    vm.resetModel();
                    // This function is to remove the confirm box
                    vm.initializeDropForm();
                    $scope.isImage = true;
                    $scope.isDropUploaded = true;
                    $timeout(() => {
                      angular.element("#showQueueMessage").hide();
                      vm.showSuccessQueueMessage = null;
                      vm.isDeleting = false;
                    }, 2500);
                  })
                  .catch(error => {
                    if (error.status === 403) {
                      vm.isDropUnauthorized = true;
                      vm.isDeleting = false;
                    }
                    $scope.error = error;
                  });
              })
              .catch(error => {
                logger.error(error);
                $scope.actionFail = true;
                vm.isDeleting = false;
              });
          }
          $scope.is_thumbnailImage = true;
          dropThumbnail = thumbnailDrops[0];
          dropThumbnail.uuid = vm.uuid;
          dropThumbnail.stream_id = 33;
          dropThumbnail.is_thumbnail = 1;
          dropThumbnail.is_thumbnailImage = 1;
          vm.isDeleting = true;
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Set Cover Image successfully.";
          DataLakeAPIService.API.UpdateDrop(dropThumbnail)
            .then(response => {
              vm.isBtnEnabled = true;
              vm.showConfirm = false;
              vm.$updateBtnText = "Update";
              vm.isDeleting = 1;
              angular.element("#showQueueMessage").show();
              vm.showSuccessQueueMessage = "Set Cover Image successfully.";
              vm.isDropProcessed = true;
              vm.fetchDropsByUuidAndInstanceId(dropThumbnail.instance_id);
              vm.getItemMetaData();
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              $scope.isImage = true;
              $scope.isDropUploaded = true;
              $timeout(() => {
                angular.element("#showQueueMessage").hide();
                vm.showSuccessQueueMessage = null;
                vm.isDeleting = false;
              }, 2500);
            })
            .catch(error => {
              if (error.status === 403) {
                vm.isDropUnauthorized = true;
                vm.isDeleting = false;
              }
              $scope.error = error;
            });
        }
      }
    };

    vm.fetchDropLakesByUuid = () => {
      try {
        DataLakeService.GetDropLakesByUUID(vm.uuid)
          .then(response => {
            $scope.lakes = response;
            if (response.length) {
              $scope.drop.lake_id = response[0].lake_id;
              vm.fetchStreamsByLakeId(response[0].lake_id);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } catch (error) {
        logger.error(error);
      }
    };

    vm.fetchStreamsByLakeId = lakeId => {
      try {
        $scope.loadingStreams = true;
        DataLakeService.GetStreamsByLakeId(lakeId)
          .then(response => {
            $scope.streams = response;
            $scope.loadingStreams = false;
          })
          .catch(error => {
            logger.error(error);
          });
      } catch (error) {
        logger.error(error);
      }
    };

    let checkType = type => {
      $scope.isImage = false;
      if (
        type === "image/jpg" ||
        type === "image/jpeg" ||
        type === "image/png" ||
        type === "image/gif" ||
        type === "image/webp" ||
        type === "image/bmp" ||
        type === "image/svg" ||
        type === "application/octet-stream"
      ) {
        $scope.isImage = true;
      }
    };

    vm.previewDatalake = dropdata => {
      function isValidUrl(string) {
        try {
          new URL(string);
          return true;
        } catch (err) {
          return false;
        }
      }
      if (dropdata["thumbnail"] && !isValidUrl(dropdata.file_name)) {
        common.$window.open(dropdata["thumbnail"]);
      } else if (isValidUrl(dropdata.file_name) || isValidUrl(dropdata.url)) {
        common.$window.open(dropdata.file_name ? dropdata.file_name : dropdata.url);
      }
    };

    vm.selectFiles = (files, errFiles) => {
      $scope.isUpload = false;
      $scope.isDropUploaded = false;
      $scope.files = files;
      $scope.errFiles = errFiles;
      $scope.notImage=false
      $scope.files && $scope.files[0] ? checkType($scope.files[0].type) : null;
      if($scope.files && $scope.files.length>0){
        if (!$scope.isImage && ($scope.drop.stream_id == 33 || $scope.drop.stream_id == 1)) {
          $scope.notImage = true;
        } else {
          $scope.notImage = false;
        }
      }
    };

    vm.getLakeStreamLinkByIds = (lakeId, streamId) => {
      vm.numberCannotExeed = false
      $scope.drop.duplicate = false
      vm.oneSequence = false
      $scope.drop.display_sequence = null
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      if (streamId === 1) {
        vm.conditionForEmpty = true
        vm.thumbnailActive = true
      } else {
        vm.conditionForEmpty = false
        vm.thumbnailActive = false

      }
      vm.skudataUploaderror = false;
      vm.skudataAddToQueueError = false;
      DataLakeService.GetLakeStreamLink(lakeId, streamId)
        .then(response => {
          $scope.isAllowMultipleDrops = true;
          response.length > 0 ?
            ($scope.selectedLakeStream = response[0]) :
            (scope.selectedLakeStream = {});
        })
        .catch(error => {
          logger.error(error);
        });
    };
    vm.changeSequenceNumber = () => {

      if ($scope.drop.display_sequence == null) {
        vm.conditionForEmpty = true
      } else {
        vm.conditionForEmpty = false
      }
      vm.numberCannotExeed = false
      vm.oneSequence = false
      if ($scope.drop.display_sequence > 300) {
        vm.numberCannotExeed = true
      } else {
        vm.numberCannotExeed = false
      }
      if ($scope.drop.display_sequence === 1 || $scope.drop.display_sequence === 0) {
        vm.oneSequence = true
      } else {
        vm.oneSequence = false
      }
      if ($scope.drops?.length > 0 && $scope.drop.display_sequence !== null) {
        for (let i in $scope.drops) {
          const key = $scope.drops[i];
          if ((key.sequence == $scope.drop.display_sequence && key.stream_id !== 33 && $scope.drop.display_sequence <= 300 && $scope.drop.display_sequence >= 2)) {
            $scope.drop.duplicate = true
            break
          } else {
            $scope.drop.duplicate = false
          }
        }

      }
    }
    vm.changeSequenceNumberFor = () => {
      if ($scope.drop.display_sequence == null) {
        vm.conditionForEmpty = true
      } else {
        vm.conditionForEmpty = false
      }
      vm.numberCannotExeed = false
      vm.oneSequence = false
      if ($scope.drop.display_sequence > 300) {
        vm.numberCannotExeed = true
      } else {
        vm.numberCannotExeed = false
      }
      if ($scope.drop.display_sequence === 1 || $scope.drop.display_sequence === 0) {
        vm.oneSequence = true
      } else {
        vm.oneSequence = false
      }
      if ($scope.queuedDrops?.length > 0 && $scope.drop.display_sequence !== null) {
        for (let i in $scope.queuedDrops) {
          const key = $scope.queuedDrops[i];
          if ((key.display_sequence == $scope.drop.display_sequence && key.stream_id !== 33 && $scope.drop.display_sequence <= 300 && $scope.drop.display_sequence >= 2)) {
            $scope.drop.duplicate = true
            break
          } else {
            $scope.drop.duplicate = false
          }
        }

      }
    }
    vm.editItem = (drop) => {
      vm.firstValue = 0
      if ('display_sequence' in drop) {
        vm.firstValue = drop.display_sequence
        if (drop.display_sequence != 1 && !drop.is_coverImage) {
          drop.editDocSequence = true
        }
      } else {
        vm.firstValue = drop.sequence
        if (drop.sequence != 1 && !drop.is_coverImage) {
          drop.editDocSequence = true
        }
      }

    }
    vm.doneEditing = (drop, drops) => {
      if (!vm.sequenceChangeError) {
        if ('sequence' in drop) {
          drop.sequence = parseInt(drop.sequence)
          DataLakeAPIService.API.UpdateDetails(drop).then((res) => {
            vm.firstValue = res.config.data.sequence;
            drop.duplicate = false
            vm.fetchDropsByUuidAndInstanceId(drop.instance_id)
          })
        } else {
          drop.display_sequence = parseInt(drop.display_sequence)
          if (drop.duplicate) {
            $scope.queuedDrops.sort(function (a, b) {
              return a.display_sequence - b.display_sequence;
            });
            for (let i = 0; i < $scope.queuedDrops.length; i++) {
              if (drop.unique_id != $scope.queuedDrops[i].unique_id && $scope.queuedDrops[i].display_sequence >= drop.display_sequence) {
                $scope.queuedDrops[i].display_sequence += 1;
              }


            } drop.duplicate = false
          }

        }

        drop.editDocSequence = false
      } else {
        if ('display_sequence' in drop) {
          drop.display_sequence = vm.firstValue
        }
        else {
          drop.sequence = vm.firstValue
        }
        drop.editDocSequence = false
        vm.sequenceChangeError = false
      }
    }

    vm.validationHandle = (drop, drops) => {
      if (drop.sequence == '') {
        vm.sequenceChangeError = true
        vm.errorInvolve = '*Sequence field is required'
      } else {
        if (drop.sequence == 0 || drop.sequence == 1) {
          vm.sequenceChangeError = true
          vm.errorInvolve = '*Sequence number is reserved for cover_image thumbnail'
        }
        else if (drop.sequence > 300) {
          vm.sequenceChangeError = true
          vm.errorInvolve = '*Sequence number cannot exceed 300'
        } else {
          for (let i of drops) {
            if (i.drop_id != drop.drop_id && i.sequence == drop.sequence) {
              drop.duplicate = true;
              vm.sequenceChangeError = false;
              break
            } else {
              vm.sequenceChangeError = false
            }
          }
        }
      }
    }
    vm.validationHandleFor = (drop, drops) => {
      vm.arrayList = []
      if (drop.display_sequence == '') {
        vm.sequenceChangeError = true
        vm.errorInvolve = '*Sequence field is required'
      } else {
        if (drop.display_sequence == 0 || drop.display_sequence == 1) {
          vm.sequenceChangeError = true
          vm.errorInvolve = '*Sequence number is reserved for cover_image thumbnail'
        }
        else if (drop.display_sequence > 300) {
          vm.sequenceChangeError = true
          vm.errorInvolve = '*Sequence number cannot exceed 300'
        } else {
          for (let i in drops) {
            if (drops[i].unique_id != drop.unique_id && drops[i].display_sequence == drop.display_sequence) {
              drop.duplicate = true;
              vm.sequenceChangeError = false;
              break
            } else {
              vm.sequenceChangeError = false
            }
          }
        }
      }
    }
    vm.downloadFile = (file, fileName, drop) => {
      let file_name = fileName;
      if (file_name.length > 4) {
        var lastFive = file_name.substr(file_name.length - 4);
        if (lastFive) {
          lastFive = lastFive.toLowerCase();
        }
        if (lastFive && lastFive != '.jpg' && lastFive != '.png' && lastFive != 'webp' && lastFive != 'jpeg' && drop.kind.includes("image")) {
          file_name = file_name + '.jpg'
        }
      }
      DataLakeService.DownloadDrop(vm.uuid, file, file_name)
        .then(response => { })
        .catch(error => { });
    };

    vm.AddedForUrl = drops => {
      vm.isUploading = true;
      vm.isAddedToQueue = true;
      vm.showCantGen = false;
      let params = {
        data: {
          url: $scope.drop.url,
          is_save_to_document_store: true
        }
      }
      DataLakeAPIService.API.CheckFileType(params)
        .then(res => {
          $scope.isGivenUrlAnImage($scope.drop, drops);
        })
        .catch(error => {
          vm.isAddedToQueue = false;
          vm.isUploading = false;
          vm.showCantGen = true;
          if (!$scope.isAllowMultipleDrops) {
            $scope.isAllowMultipleDrops = true;
            vm.isProcessing = false;
          }
        });
    }

    $scope.isGivenUrlAnImage = async (drop, drops) => {
      let url = drop.url;
      if (url) {
        url.includes("jpg") ||
          url.includes("jpeg") ||
          url.includes("image/png") ||
          url.includes("image/gif") ||
          url.includes("image/webp") ||
          url.includes("image/bmp") ||
          url.includes("image/svg") ||
          url.includes("images") ||
          url.includes("application/octet-stream") ?
          ($scope.isImage = true) :
          ($scope.isImage = false);
        blobtest()
        async function blobtest() {
          try {
            let blob = await fetch(url).then(r => r.blob())
              .then(blobFile => new File([blobFile], url, { type: "image/jpeg" }))
            let files = [blob];
            vm.selectFiles(files, []);
            if (!$scope.isAllowMultipleDrops && $stateParams.id) {
              vm.replaceExistingDropAndUpload();
            } else {
              $scope.dropsForselectedLakeStream = [];
              vm.skudataUploaderror = false;
              vm.skudataAddToQueueError = false;
              $scope.isAllowMultipleDrops = true;
              if (drops && drops.length > 0) {
                if ($scope.selectedLakeStream.stream_id == 33) {
                  let coverDrops = drops.filter(item => {
                    return item.stream_id == 33;
                  });
                  if (coverDrops && coverDrops.length > 0) {
                    if ($scope.drop.source.toLowerCase() === "camera") {
                      if ($stateParams.id === undefined) {
                        vm.resetValues();
                      }
                    }
                    $scope.isAllowMultipleDrops = false;
                    vm.isUploading = false;
                    vm.isAddedToQueue = false;
                  } else {
                    vm.addToQueueOrUploadDrop();
                  }
                } else {
                  vm.addToQueueOrUploadDrop();
                }

              } else {
                vm.addToQueueOrUploadDrop();
              }
            }
          } catch (err) {
            let blob = await fetch(url, { mode: 'no-cors' }).then(r => r.blob())
              .then(blobFile => new File([blobFile], url, { type: "image/jpeg" }))
            let files = [blob];
            vm.selectFiles(files, []);
            if (!$scope.isAllowMultipleDrops && $stateParams.id) {
              vm.replaceExistingDropAndUpload(drop);
            } else {
              vm.addToQueueOrUploadDrop(drop);
            }
            vm.isUploading = false;
            vm.isAddedToQueue = false;
            // vm.showCantGen = true;
            if (!$scope.isAllowMultipleDrops) {
              $scope.isAllowMultipleDrops = true;
              vm.isProcessing = false;
            }
          }
        }
      } else {
        vm.isUploading = false;
        vm.isAddedToQueue = false;
      }
    };

    vm.validateUrl=(u)=>{
      $scope.invalidUrl = false;
      if(u){
        try {
            new URL(u);
            $scope.invalidUrl = false;
        } catch (e) {
            $scope.invalidUrl = true; 
            $scope.notImageUrl=false
            return; // Exit early if URL is invalid
        }
        if(!$scope.invalidUrl){
          $http({
            method: 'HEAD',
            url: u
          }).then(function(response) {
              // Get the content type from the response headers
              var contentType = response.headers('Content-Type');
              checkType(contentType)
              if (!$scope.isImage && ($scope.drop.stream_id ==1 || $scope.drop.stream_id == 33)) {
                $scope.notImageUrl=true
              }  else {
                $scope.notImageUrl=false
              }
          }).catch(function(error) {
            const fileExtension = u.split('.').pop().toLowerCase();
            const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp','svg',"octet-stream"];
      
            if (imageTypes.includes(fileExtension)) {
              $scope.notImageUrl=false
            } else {
              if(!$scope.invalidUrl && u && u.trim() !== "" && ($scope.drop.stream_id ==1 || $scope.drop.stream_id == 33)){
                $scope.notImageUrl=true
              }else{
                $scope.notImageUrl=false
              }
            }
          });
        }
      }else{
        $scope.notImageUrl=false
      }
    }


    vm.addCoverImg = () => {
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        vm.AddedForUrl($scope.drops);
        vm.isProcessing = true;
      } else {
        vm.replaceExistingDropAndUpload();
      }
    }

    $scope.resetAllconfigData = () => {
      vm.skudataUploaderror = false;
      vm.skudataAddToQueueError = false;
      vm.showCantGen = false;
      $scope.files = [];
      $scope.drop.url = null;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
    }

    vm.uniqueId = 0;
    vm.isAllowedMultipleDropsForSelectedStream = drops => {
      vm.thumbnailActive = false
      vm.sequenceChangeError = false
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        if (drops && drops.length > 0) {
          if ($scope.selectedLakeStream.stream_id == 33) {
            let coverDrops = drops.filter(item => {
              return item.stream_id == 33;
            });
            if (coverDrops && coverDrops.length > 0) {
              if ($scope.drop.source.toLowerCase() === "camera") {
                if ($stateParams.id === undefined) {
                  vm.resetValues();
                }
              }
              $scope.isAllowMultipleDrops = false;
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              vm.thumbnailActive = false
              $scope.notImage=false
              $scope.notImageUrl=false
              $scope.invalidUrl = false;
            } else {
              vm.AddedForUrl(drops);
            }
          } else {
            vm.AddedForUrl(drops);
          }
        } else {
          vm.AddedForUrl(drops);
        }

      } else {
        $scope.dropsForselectedLakeStream = [];
        vm.isUploading = true;
        vm.isAddedToQueue = true;
        vm.skudataUploaderror = false;
        vm.skudataAddToQueueError = false;
        $scope.isAllowMultipleDrops = true;
        if (drops && drops.length > 0) {
          if ($scope.selectedLakeStream.stream_id == 33) {
            let coverDrops = drops.filter(item => {
              return item.stream_id == 33;
            });
            if (coverDrops && coverDrops.length > 0) {
              if ($scope.drop.source.toLowerCase() === "camera") {
                if ($stateParams.id === undefined) {
                  vm.resetValues();
                }
              }
              $scope.isAllowMultipleDrops = false;
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              vm.thumbnailActive = false
              $scope.notImage=false
              $scope.notImageUrl=false
              $scope.invalidUrl = false;
            } else {
              vm.addToQueueOrUploadDrop();
            }
          } else {
            vm.addToQueueOrUploadDrop();
          }

        } else {
          vm.addToQueueOrUploadDrop();
        }
      }
    };

    vm.replaceExistingDropAndUpload = (detai) => {
      let coverDrops = $scope.drops.filter(item => {
        return item.stream_id == 33;
      });
      let drop = []
      if (coverDrops && coverDrops.length > 0) {
        drop = coverDrops[0];
      }
      // let drop = $scope.dropsForselectedLakeStream[0];
      drop.instance_id = parseInt($stateParams.id);
      drop.uuid = vm.uuid;
      vm.isProcessing = true;
      let uploadResponse = vm.uploadDrop(drop, $stateParams.id,detai)
        .then(() => { })
        .catch(() => { });
      let removeResponse = [];
      if (!drop.is_thumbnailImage) {
        removeResponse = vm.removeDrop(drop)
          .then(() => { })
          .catch(() => { });
      }
      if (drop.is_thumbnailImage) {
        vm.isDisableSaveCvrImg = true;
        let thumbnailPresent = $scope.drops.filter((item) => {
          return item.drop_id == drop.drop_id && item.stream_code == "thumbnail";
        });
        if (thumbnailPresent.length > 0) {
          vm.removeDrop(thumbnailPresent[0])
            .then(() => { })
            .catch(() => { });
        }
        removeResponse = vm.updateCoverImageDrop(drop)
          .then(() => { })
          .catch(() => { });
      }
      Promise.allSettled([uploadResponse, removeResponse])
        .then(() => {
          if (drop.source.toLowerCase() === "camera") {
            $scope.drop.source = 'local';
            vm.resetValues();
          }
          $scope.isAllowMultipleDrops = true;
        })
        .catch(() => { });
    };

    vm.updateCoverImageDrop = drop => {
      return new Promise((resolve, reject) => {
        try {
          angular.element("#showQueueMessage").show();
          vm.isDeleting = true;
          drop.uuid = vm.uuid;
          if (vm.dropToDelete) {
            drop = vm.dropToDelete;
          }
          drop.uuid = vm.uuid;
          drop.stream_id = 1;
          drop.is_thumbnail = 1;
          drop.is_thumbnailImage = 0;
          vm.showSuccessQueueMessage = "Deleting drop in progress";
          DataLakeAPIService.API.UpdateDrop(drop)
            .then(() => {
              vm.dropToDelete = undefined;
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the SKU";
              //delete the thumbnail after the image is unlinked
              delete vm.oldSKU.thumbnail;
              delete $scope.skuHead.thumbnail;
              vm.getItemMetaData();
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.resetModel();
              vm.initializeDropForm();
              $scope.isDropUploaded = false;
              resolve(true);
              $timeout(() => {
                vm.showConfirmDeletion = false;
                vm.showConfirmThumbnailDeletion = false;
                vm.showSuccessQueueMessage = null;
                vm.isProcessing = false;
                vm.isDeleting = false;
              }, 4500);
            })
            .catch(error => {
              vm.isProcessing = false;
              vm.isDeleting = false;
              reject(false);
              logger.error(error);
            });
        } catch (error) {
          reject(false);
          logger.error(error);
        }
      });
    };

    vm.addToQueueOrUploadDrop = (del) => {
      if ($stateParams.id === undefined) {
        vm.addDropToQueue(del);

      } else {
        vm.uploadDrop($scope.drop, $stateParams.id,del)
          .then(() => { })
          .catch(() => { });
      }
    };

    // on create location delete drop after confirmation
    // vm.deleteDropFromQueue = () => {
    //   vm.DeletionConfirmation = false;
    //   let index = vm.dropIndex;
    //   $scope.queuedDrops.splice(index, 1);
    //   for (let i = 0; i < $scope.queuedDrops.length; i++) {
    //     if (
    //       $scope.queuedDrops[i].stream.toLowerCase() == "thumbnail" &&
    //       $scope.queuedDrops[i].is_coverImage
    //     ) {
    //       $scope.queuedDrops.splice(i, 1);
    //     }
    //   }
    //   $scope.isAllowMultipleDrops = true;
    // };

    vm.deleteDropFromQueue = () => {
      vm.sequenceChangeError = false
      vm.DeletionConfirmation = false;
      vm.DeletionThumbnailConfirmation = false;
      let index = vm.dropIndex;
      $scope.queuedDrops.splice(index, 1);
      for (let i = 0; i < $scope.queuedDrops.length; i++) {
        if (
          $scope.queuedDrops[i].stream.toLowerCase() == "thumbnail" &&
          $scope.queuedDrops[i].is_coverImage
        ) {
          $scope.queuedDrops.splice(i, 1);
          let duplicateDrops = $scope.queuedDrops.filter(item => {
            return item.stream_id == 33;
          });
          if (duplicateDrops && duplicateDrops.length == 0) {
            vm.disableSetCoverImage = true;
          }
        }
        else if ($scope.queuedDrops[i].stream.toLowerCase() == "cover image" &&
          $scope.queuedDrops[i].is_thumbnailImage) {
          $scope.queuedDrops.splice(i, 1);
          let duplicateDrops = $scope.queuedDrops.filter(item => {
            return item.stream_id == 33;
          });
          if (duplicateDrops && duplicateDrops.length == 0) {
            vm.disableSetCoverImage = true;
          }
        }
      }
      let deletedDropArr = $scope.queuedDrops.filter(item => {
        //  if (item.coverImgId) {
        return item.coverImgId != vm.coverIndexId
        //  }

      })
      $scope.queuedDrops = deletedDropArr;
      // for (let i = 0; i < $scope.queuedDrops.length; i++) {
      //   if (
      //     $scope.queuedDrops[i].stream.toLowerCase() == "thumbnail" &&
      //     $scope.queuedDrops[i].is_coverImage && $scope.queuedDrops[i].coverImgId && $scope.queuedDrops[i].coverImgId == vm.coverIndexId
      //   ) {
      //     $scope.queuedDrops.splice(i, 1);
      //   }
      // }
      let duplicateDrops = $scope.queuedDrops.filter(item => {
        return item.stream_id == 33;
      });
      if (duplicateDrops && duplicateDrops.length == 0) {
        $scope.isAllowMultipleDrops = true;
      }
      $scope.isAllowMultipleDrops = true;
    };

    // To remove the drop from queue
    vm.removeDropsFromQueue = index => {
      let deletedDrop = $scope.queuedDrops[index];
      if (
        deletedDrop.stream.toLowerCase() === "cover image" &&
        deletedDrop.is_thumbnail
      ) {
        // store the value of index
        vm.dropIndex = index;
        vm.DeletionConfirmation = true;
        // if stream is thumbnail and copy of cover image
      } else if (
        deletedDrop.stream.toLowerCase() == "thumbnail" &&
        deletedDrop.is_coverImage
      ) {
        // removing image from thumbnail
        $scope.queuedDrops.splice(index, 1);
        // update the cover image record with is_thumbnail 0
        for (let i = 0; i < $scope.queuedDrops.length; i++) {
          if ($scope.queuedDrops[i].is_thumbnail) {
            $scope.queuedDrops[i].is_thumbnail = 0;
          }
        }
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      } else {
        $scope.queuedDrops.splice(index, 1);
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      if ($scope.queuedDrops.length === 0) {
        $scope.isAllowMultipleDrops = true;
      }
    };
    vm.coverIndexId = null

    vm.deleteThumbnailDropsFromQueue = dropId => {
      let ids = $scope.queuedDrops.map(it => it.unique_id);
      let index = ids.indexOf(dropId.unique_id);
      if (dropId.stream.toLowerCase() === "thumbnail" && dropId.is_thumbnailImage) {

        // store the value of index
        vm.dropIndex = index;
        vm.coverIndexId = dropId.coverImgId;
        vm.DeletionThumbnailConfirmation = true;
        // if stream is cover image and copy of thumbnail
      } else if (dropId.stream.toLowerCase() == "cover image" && dropId.is_thumbnailImage) {
        // removing image from thumbnail
        $scope.queuedDrops.splice(index, 1);
        $scope.queuedDrops.sort(function (a, b) {
          return a.display_sequence - b.display_sequence;
        })
        let adding = 1
        for (let i of $scope.queuedDrops) {
          adding += 1
          i.display_sequence = adding
        }
        // update the thumbnail record with is_thumbnailImage 0
        for (let i = 0; i < $scope.queuedDrops.length; i++) {
          if ($scope.queuedDrops[i].is_thumbnailImage) {
            $scope.queuedDrops[i].is_thumbnailImage = 0;
            $scope.queuedDrops[i].is_thumbnail = 0;
            dropId.is_thumbnailImage = 0;

          }
        }
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        let duplicateDrops = $scope.queuedDrops.filter(item => {
          return item.stream_id == 33;
        });
        if (duplicateDrops && duplicateDrops.length == 0) {
          vm.disableSetCoverImage = true;
        }
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      } else {
        // $scope.queuedDrops.splice(index, 1);
        $scope.queuedDrops.splice(index, 1);
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        let duplicateDrops = $scope.queuedDrops.filter(item => {
          return item.stream_id == 33;
        });
        if (duplicateDrops && duplicateDrops.length == 0) {
          vm.disableSetCoverImage = true;
        }
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      if ($scope.queuedDrops.length === 0) {
        $scope.isAllowMultipleDrops = true;
      }
      let duplicateDrops = $scope.queuedDrops.filter(item => {
        return item.stream_id == 33;
      });
      if (duplicateDrops && duplicateDrops.length == 0) {
        $scope.isAllowMultipleDrops = true;
      }
    };

    vm.deleteDropsFromQueue = dropId => {
      vm.thumbnailActive = false
      vm.resetValues()
      if (dropId.is_thumbnailImage) {
        vm.deleteThumbnailDropsFromQueue(dropId);
      } else {
        let ids = $scope.queuedDrops.map(it => it.unique_id);
        let index = ids.indexOf(dropId.unique_id);
        // let deletedDropArr = $scope.queuedDrops.filter(item => {
        //   return item.unique_id = dropId.unique_id;
        // })
        // let deletedDrop = deletedDropArr[0];
        //let deletedDrop = $scope.queuedDrops[index];
        if (dropId.stream.toLowerCase() === "cover image" && dropId.is_thumbnail) {

          // store the value of index
          vm.dropIndex = index;
          vm.DeletionConfirmation = true;
          vm.coverIndexId = dropId.unique_id;
          // if stream is thumbnail and copy of cover image
        } else if (dropId.stream.toLowerCase() == "thumbnail" && dropId.is_coverImage) {
          // removing image from thumbnail
          $scope.queuedDrops.splice(index, 1);
          // update the cover image record with is_thumbnail 0
          for (let i = 0; i < $scope.queuedDrops.length; i++) {
            if ($scope.queuedDrops[i].is_thumbnail && dropId.coverImgId && $scope.queuedDrops[i].unique_id == dropId.coverImgId) {
              $scope.queuedDrops[i].is_thumbnail = 0;
            }
          }
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Image removed from the Queue";
          let duplicateDrops = $scope.queuedDrops.filter(item => {
            return item.stream_id == 33;
          });
          if (duplicateDrops && duplicateDrops.length == 0) {
            vm.disableSetCoverImage = true;
          }
          $timeout(() => {
            angular.element("#showQueueMessage").hide();
            vm.showSuccessQueueMessage = null;
          }, 2500);
        } else {
          // $scope.queuedDrops.splice(index, 1);
          $scope.queuedDrops.splice(index, 1);
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Image removed from the Queue";
          let duplicateDrops = $scope.queuedDrops.filter(item => {
            return item.stream_id == 33;
          });
          if (duplicateDrops && duplicateDrops.length == 0) {
            vm.disableSetCoverImage = true;
          }
          $timeout(() => {
            angular.element("#showQueueMessage").hide();
            vm.showSuccessQueueMessage = null;
          }, 2500);
        }
        if ($scope.queuedDrops.length === 0) {
          $scope.isAllowMultipleDrops = true;
        }
        let duplicateDrops = $scope.queuedDrops.filter(item => {
          return item.stream_id == 33;
        });
        if (duplicateDrops && duplicateDrops.length == 0) {
          $scope.isAllowMultipleDrops = true;

        }
      }
    };

    vm.resetModel = () => {
      $scope.drop = {
        source: "local"
      };
      $scope.files = undefined;
      $scope.errFiles = undefined;
      vm.fetchDropLakesByUuid();
      vm.getDropStatus();
    };

    // To delete drop
    vm.removeDrop = drop => {
      return new Promise((resolve, reject) => {
        try {
          angular.element("#showQueueMessage").show();
          vm.isDeleting = true;
          drop.uuid = vm.uuid;
          if (vm.dropToDelete) {
            drop = vm.dropToDelete;
          }
          vm.showSuccessQueueMessage = "Deleting drop in progress";
          DataLakeService.DeleteDrop(drop)
            .then(() => {
              vm.dropToDelete = undefined;
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the SKU";
              //delete the thumbnail after the image is unlinked
              delete vm.oldSKU.thumbnail;
              delete $scope.skuHead.thumbnail;
              vm.getItemMetaData();
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.resetModel();
              vm.initializeDropForm();
              $scope.isDropUploaded = false;
              resolve(true);
              $timeout(() => {
                vm.showConfirmDeletion = false;
                vm.showConfirmThumbnailDeletion = false;
                // This function is to remove the confirm box
                vm.initializeDropForm();
                vm.showSuccessQueueMessage = null;
                vm.isProcessing = false;
                vm.isDeleting = false;
              }, 4500);
            })
            .catch(error => {
              vm.isProcessing = false;
              vm.isDeleting = false;
              reject(false);
              logger.error(error);
            });
        } catch (error) {
          reject(false);
          logger.error(error);
        }
      });
    };

    vm.confirmRemoveThumbnailDrop = (drop, flag) => {
      let deletingThumbnailDrops = $scope.drops.filter(item => {
        return (item.stream.toLowerCase() === "thumbnail" && item.instance_id == drop.instance_id);
      });
      let thumbnailCoverDrops = [];
      if (deletingThumbnailDrops && deletingThumbnailDrops.length > 0) {
        thumbnailCoverDrops = deletingThumbnailDrops[0];
      }
      // if stream is thumbnail
      if (drop.stream.toLowerCase() === "thumbnail" && drop.is_thumbnailImage) {
        // show a confirmation panel to ask the permission to delete cover image also.
        vm.showConfirmThumbnailDeletion = true;
        // variable to store drop values
        vm.dropToDelete = drop;
      } else if (
        drop.stream.toLowerCase() === "cover image" &&
        drop.is_thumbnailImage
      ) {
        drop.uuid = vm.uu_id;
        drop.stream_id = 1;
        drop.is_thumbnail = 1;
        drop.is_thumbnailImage = 0;
        vm.dropToDelete = undefined;
        vm.isDeleting = true;
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image unlinked from the item";
        DataLakeAPIService.API.UpdateDrop(drop)
          .then(response => {
            vm.$updateBtnText = "Update";
            vm.isDeleting = 1;
            vm.showSuccessQueueMessage = "Image unlinked from the item";
            vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
            vm.resetModel();
            $scope.isDropUploaded = false;
            // This function is to remove the confirm box
            vm.initializeDropForm();
            $timeout(() => {
              angular.element("#showQueueMessage").hide();
              vm.showSuccessQueueMessage = null;
              vm.isProcessing = false;
              vm.isDeleting = false;
            }, 4500);
          })
          .catch(error => {
            logger.error(error);
            $scope.actionFail = true;
            vm.isDeleting = false;
          });
      } else {
        vm.dropToDelete = undefined;
        vm.removeDrop(drop)
          .then(() => { })
          .catch(() => { });
      }
    };

    // function to get confirmation before delete drop
    vm.confirmRemoveDrop = (drop, flag) => {
      vm.thumbnailActive = false
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.sequenceChangeError = false
      if (drop.is_thumbnailImage) {
        if (drop.stream.toLowerCase() === "cover image" && drop.is_thumbnail) {
          // show a confirmation panel to ask the permission to delete thumbnail also.
          vm.showConfirmDeletion = true;
        } else {
          vm.confirmRemoveThumbnailDrop(drop);
        }
      } else {
        // if stream is cover image
        if (drop.stream.toLowerCase() === "cover image" && drop.is_thumbnail) {
          // show a confirmation panel to ask the permission to delete thumbnail also.
          vm.showConfirmDeletion = true;
          vm.dropToDelete = drop;
        } else if (
          drop.stream.toLowerCase() === "thumbnail" &&
          drop.is_coverImage
        ) {
          vm.dropToDelete = undefined;
          let object = {
            drop_id: drop.drop_id,
            instance_id: drop.instance_id,
            is_thumbnail: 0
          };
          vm.isDeleting = true;
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Image unlinked from the SKU";
          DataLakeAPIService.API.UpdateDetails(object)
            .then(response => {
              vm.$updateBtnText = "Update";
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the SKU";
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.resetModel();
              $scope.isDropUploaded = false;
              // This function is to remove the confirm box
              vm.initializeDropForm();
              $timeout(() => {
                angular.element("#showQueueMessage").hide();
                vm.showSuccessQueueMessage = null;
                vm.isProcessing = false;
                vm.isDeleting = false;
              }, 4500);
            })
            .catch(error => {
              logger.error(error);
              $scope.actionFail = true;
            });
        } else {
          vm.dropToDelete = undefined;
          vm.removeDrop(drop)
            .then(() => { })
            .catch(() => { });
        }
      }
    };

    vm.resetOnCancel = () => {
      if ($scope.drop.source.toLowerCase() === "camera") {
        $scope.drop.source = 'local';
        vm.resetValues()
      }
    }

    vm.resetValues = () => {
      $scope.drop.stream_id = null;
      $scope.files = undefined;
      $scope.errFiles = undefined;
      $scope.drop.url = undefined;
      vm.thumbnailActive = false
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      if (vm.drop_form.ur) {
        vm.drop_form.url.$setPristine();
      }
    }

    vm.imageUrl = null;
    vm.link = null
    vm.onClickSnap = () => {
      vm.snapCk().then(data => {
        let imageName = 'IMG' + Date.now() + '.JPG'
        data.name = imageName;
        // vm.link = URL.createObjectURL(data);
        data.lastModified = new Date();
        const myFile = new File([data], imageName, {
          type: data.type,
        });
        $scope.files = [myFile];
        $scope.files && $scope.files.length
          ? checkType($scope.files[0].type)
          : null;
        vm.clickedSnap = true;
        $scope.isUpload = false;
        $scope.isDropUploaded = false;
      })
    }

    vm.snapCk = () => {
      vm.clickedSnap = true;
      let cvs = document.querySelector("#canvas");
      let ctx = cvs.getContext('2d');
      cvs.width = 640; // set its size to the one of the video
      cvs.height = 480;
      ctx.drawImage(vm.dvideo, 0, 0, 640, 480); // the video
      vm.link = cvs.toDataURL('image/jpeg');
      return new Promise((res, rej) => {
        cvs.toBlob(res, 'image/jpeg'); // request a Blob from the canvas
      });
    }

    vm.clickedSnap = false;
    vm.dvideo = null;
    vm.startCam = () => {
      vm.clickedSnap = false;
      vm.link = null;
      vm.dvideo = document.querySelector("#video");
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then((stream) => {
          vm.dvideo.srcObject = stream;
          vm.dvideo.play();
        })
        $('#mySkuCamModal').modal({
          backdrop: 'static',
          keyboard: true,
          show: true
        });
      }
    }

    vm.closeCam = () => {
      $('#mySkuCamModal').modal('hide');
      vm.link = null;
      vm.stopStreamedVideo(vm.dvideo);
      // vm.resetValues();
      if ($stateParams.id === undefined) {
        $timeout(() => {
          $scope.drop.source = 'local';
        }, 500);
      }
      let cvs = document.querySelector("#canvas");
      const context = cvs.getContext('2d');
      context.clearRect(0, 0, 400, 300);
    }

    vm.stopStreamedVideo = (videoElem) => {
      const stream = videoElem.srcObject;
      const tracks = stream.getTracks();
      tracks.forEach(function (track) {
        track.stop();
      });
      videoElem.srcObject = null;
    }

    vm.addDropToQueue = (del) => {
      vm.isAddedToQueue = true;
      vm.uniqueId = vm.uniqueId + 1;
      $scope.queuedDrops === undefined ? ($scope.queuedDrops = []) : null;
      let queuedDropObject = {
        lake: $scope.selectedLakeStream.lake,
        stream: $scope.selectedLakeStream.stream,
        stream_code: $scope.selectedLakeStream.stream_code,
        lake_id: $scope.drop.lake_id,
        stream_id: $scope.drop.stream_id,
        display_sequence: $scope.drop.display_sequence,
        duplicate: $scope.drop.duplicate,
        uuid: vm.uuid,
        source: 'local',
        url: undefined,
        status_id: $scope.drop.status_id,
        is_save_to_document_store: $scope.drop.is_save_to_document_store,
        unique_id: vm.uniqueId,
        coverImgId: null
      };
      if(del){
        if(del.source==="url" && del.url){
          queuedDropObject.url=del.url
          queuedDropObject.thumbnail=del.url
        }
      }
      // if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
      //   queuedDropObject.url = $scope.drop.url;
      // } else if (
      //   $scope.drop.source &&
      //   ($scope.drop.source.toLowerCase() === "local" || $scope.drop.source.toLowerCase() === "camera")
      // ) {
      if ($scope.files && $scope.files[0]) {
        queuedDropObject.size = $scope.files[0].size;
        queuedDropObject.file_name = $scope.files[0].name;
        queuedDropObject.files = $scope.files;
      }
      // }
      // If is_thumbnail is there
      if (vm.is_thumbnail) {
        queuedDropObject.is_thumbnail = vm.is_thumbnail;
      }

      // if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url" && $scope.drop.is_save_to_document_store) {
      //   let params = {
      //     data: queuedDropObject
      //   }
      //   DataLakeAPIService.API.CheckFileType(params)
      //     .then(res => {
      //       $scope.queuedDrops.push(queuedDropObject);
      //       if (
      //         queuedDropObject &&
      //         queuedDropObject.stream.toLowerCase() === "cover image" &&
      //         vm.is_thumbnail
      //       ) {
      //         vm.uniqueId = vm.uniqueId + 1;
      //         let obj = {
      //           lake: $scope.queuedDrops[0].lake,
      //           lake_id: $scope.queuedDrops[0].lake_id,
      //           stream: "Thumbnail",
      //           stream_code: "thumbnail",
      //           stream_id: 1,
      //           url: $scope.queuedDrops[0].url,
      //           file_name: $scope.queuedDrops[0].file_name,
      //           is_coverImage: true,
      //           unique_id: vm.uniqueId,
      //           coverImgId: queuedDropObject.unique_id
      //         };
      //         $scope.queuedDrops.push(obj);
      //       }
      //       if ($scope.queuedDrops.length > 0) {
      //         vm.isUploading = false;
      //         angular.element("#showQueueMessage").show();
      //         vm.showSuccessQueueMessage = "Image added to the Queue";
      //         vm.resetModel();
      //         $timeout(() => {
      //           angular.element("#showQueueMessage").hide();
      //           vm.showSuccessQueueMessage = null;
      //         }, 2500);
      //       }
      //       vm.isAddedToQueue = false;
      //       vm.resetValues();
      //     })
      //     .catch(error => {
      //       vm.isAddedToQueue = false;
      //       vm.skudataAddToQueueError = "File type is not suitable for physical upload";
      //       // vm.skudataAddToQueueError = error.data;
      //     });
      // } else {
      $scope.queuedDrops.sort(function (a, b) {
        return a.display_sequence - b.display_sequence;
      });
      for (let i = 0; i < $scope.queuedDrops.length; i++) {
        if ($scope.queuedDrops[i].display_sequence == queuedDropObject.display_sequence) {
          for (let j = 0; j < $scope.queuedDrops.length; j++) {
            if (j >= i) {
              $scope.queuedDrops[j].display_sequence += 1
            }
          }
          queuedDropObject.duplicate = false
          break
        }
      }
      $scope.queuedDrops.push(queuedDropObject);
      if (
        queuedDropObject &&
        queuedDropObject.stream.toLowerCase() === "cover image" &&
        vm.is_thumbnail
      ) {
        vm.uniqueId = vm.uniqueId + 1;
        let obj = {
          lake: queuedDropObject.lake,
          lake_id: queuedDropObject.lake_id,
          stream: "Thumbnail",
          stream_code: "thumbnail",
          stream_id: 1,
          url: undefined,
          file_name: queuedDropObject.file_name,
          display_sequence: 1,
          files: queuedDropObject.files,
          status_id: queuedDropObject.status_id,
          is_save_to_document_store: queuedDropObject.is_save_to_document_store,
          source: queuedDropObject.source,
          is_coverImage: true,
          unique_id: vm.uniqueId,
          coverImgId: queuedDropObject.unique_id,
          size: queuedDropObject.size,
          create_thumbnail: true
        };
        $scope.queuedDrops.push(obj);
      }
      if ($scope.queuedDrops.length > 0) {
        vm.isUploading = false;
        vm.thumbnailActive = false
        $scope.notImage=false
        $scope.notImageUrl=false
        $scope.invalidUrl = false;
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image added to the Queue";
        // if ($scope.drop.source.toLowerCase() === "camera") {
        //   vm.closeCam();
        // } else {
        vm.resetValues();
        // }
        vm.resetModel();
        vm.disableSetCoverImage = false;
        let duplicateDrops = $scope.queuedDrops.filter(item => {
          return item.stream_id == 33;
        });
        if (duplicateDrops && duplicateDrops.length == 0) {
          vm.disableSetCoverImage = true;
        }
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      vm.isAddedToQueue = false;
      // vm.resetValues();
      // }

    };

    vm.uploadQueuedDrops = insertedId => {
      if ($scope.queuedDrops) {
        let cover_ImageDrops = $scope.queuedDrops.filter(item => {
          return item.stream_id == 33 && item.is_thumbnailImage == 1;
        });
        if (cover_ImageDrops.length == 0) {
          cover_ImageDrops = $scope.queuedDrops.filter(item => {
            return item.create_thumbnail == true;
          });
        }
        let thumbnail_imageDrops = [];
        if (cover_ImageDrops.length > 0) {
          thumbnail_imageDrops = cover_ImageDrops[0];
          let ids = $scope.queuedDrops.map(it => it.unique_id);
          let index = ids.indexOf(thumbnail_imageDrops.unique_id);
          vm.deleteCoverImageDrop = true;
          _.each($scope.queuedDrops, drop => {
            if (drop.stream.toLowerCase() == "thumbnail" && drop.is_thumbnailImage == 1) {
              drop.stream_id = 33;
              drop.is_thumbnail = 1;
              drop.is_thumbnailImage = 1;
              vm.deleteCoverImageDrop = true;
            }
          });
          if (vm.deleteCoverImageDrop) {
            $scope.queuedDrops.splice(index, 1);
            vm.deleteCoverImageDrop = false;
          }
        }
        for (let i = 0; i < $scope.queuedDrops.length; i++) {
          $scope.queuedDrops[i].instance_id = insertedId;
          $scope.queuedDrops[i].uuid = vm.uuid;
          DataLakeService.UploadDrop($scope.queuedDrops[i])
            .then(res => {
              // After create of drops, it should be shown in the list immidietly
              if (res && res.data && (i === $scope.queuedDrops.length - 1 ||
                ($scope.queuedDrops[i].is_thumbnail && i === ($scope.queuedDrops.length / 2) - 1)
              )) {
                vm.getItemMetaData(); //Load all drops and images after creating new drop
              }
            })
            .catch(error => {
              logger.error(error);
            });
        }
      }
    };

    vm.uploadDrop = (drop, instanceId,del) => {
      return new Promise((resolve, reject) => {
        try {
          vm.isUploading = true;
          drop = angular.copy($scope.drop);
          // drop = $scope.drop;
          drop.source = "local"
          drop.instance_id = instanceId;
          drop.url = undefined;
          drop.is_save_to_document_store = undefined;
          drop.uuid = vm.uuid;
          drop.files = $scope.files;
          drop.is_thumbnail = vm.is_thumbnail;
          if (drop.stream_id == 33) {
            vm.isDisableSaveCvrImg = true;
          }
          if(del){
            if(del.source==="url" && del.url){
              drop.url=del.url
              drop.thumbnail=del.url
            }
          }
          DataLakeService.UploadDrop(drop)
            .then(res => {
              if ($scope.isAllowMultipleDrops) {
                if (drop.source.toLowerCase() === "camera") {
                  $scope.drop.source = 'local';
                  vm.resetValues();
                }
              }

              vm.resetModel();
              //This function call is to update the linked drops table once the drop is uploaded.
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.is_thumbnail = 1;
              vm.isAddedToQueue = false;
              ///After create of drops, it should be shown in the list immediately
              //vm.loadImage(vm.oldSKU, "165x165", vm.oldSKU.id, vm.uuid);

              vm.getItemMetaData(drop);
              resolve(true);
              $timeout(() => {
                vm.isUploading = false;
                vm.thumbnailActive = false
                $scope.notImage=false
                $scope.notImageUrl=false
                $scope.invalidUrl = false;
                $scope.files = null;
                $scope.errFiles = null;
                $scope.drop.stream_id = null;
                vm.validationMessage = null;
              }, 2000);
            })
            .catch(error => {
              reject(false);
              logger.error(error);
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              vm.skudataUploaderror = "File type is not suitable for physical upload";
              // vm.skudataUploaderror = error.data;
            });
        } catch (error) {
          reject(false);
          logger.error(error);
          vm.isUploading = false;
          vm.isAddedToQueue = false;
        }

        $timeout(() => {
          // vm.isUploading = false;
          // vm.skudataUploaderror = false;
        }, 3000)
      })
    };

    //Storage function END

    /**
     * On click of create SKU, bring modal for selection of SKU sub-type
     * If item is a set, then SKU could be set or template
     * If item is not a set, then SKU would be regular
     */
    vm.showSKUSelectionModal = () => {
      $scope.skuHead = {};
      vm.original_upc = "";
      $state.go("common.prime.itemMaintenance.sku");
      $timeout(() => {
        $("#skuSelectionModel").modal("show");
      }, 0);
    };

    vm.hideSKUSelectionModal = () => {
      $("#skuSelectionModel").modal("hide");
    };

    vm.focusAddOption = () => {
      $timeout(() => {
        angular.element("#add_option").focus();
      }, 1000)
    };

    vm.closeForm = entityName => {
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      if (entityName && entityName.toLowerCase() === "skumaster") {
        vm.isUpdatePage = false;
        vm.isShowMoveSKUPanel = false;
        $scope.notification = {}; //clear notifications on close of form
        vm.isSKUGrid = true;
        vm.drillToSKUs = true;
        vm.savedToSKUMasterList = false;
        vm.drillToRetails = false;
        vm.$showErrorDetailsData = false;
        vm.$showErrorDetails = false;
        vm.upcalreadyexists = false;
        $timeout(() => {
          vm.createForm = false;
        }, 0)
        vm.opdone = false;
        vm.previewAndPublish = false;
        $scope.drop = {};
        vm.oldDataVendor = undefined;
        vm.isInvalidForm = false;
        if (this.$state.params.navigateTo || $scope.$location.url().includes("new")) {
          $state.go("common.prime.itemMaintenance.sku");
        } else {
          $window.history.back();
        }
        // To check the height of the header and set the data list margin top accordingly
        vm.showFilter ? vm.InitialFilterForm() : "";
        // vm.reloadSKUCountAndList(true)
      } else if (entityName && entityName.toLowerCase() === "optionlist") {
        vm.$showOLDetails = false;
      } else if (entityName && entityName.toLowerCase() === "orderadvisorheader") {
        vm.isShowCreateAdvisorHeaderForm = false;
        $timeout(() => {
          vm.isSaveHelpTextSuccess = false;
          vm.isUpdateHelpTextSuccess = false;
          vm.isDeleteHelpTextSuccess = false;
          vm.isConfirmDeleteHelptext = false;
          vm.advisor_text_header = {};
          vm.optionError = null;
          angular.element("#order_help_create").focus();
        }, 500)
      } else {
        $window.history.back();
      }
      vm.showLockedScreenStatus = false;
      vm.LoadingSecndryAuth = false;
    };

    vm.goToClonePanel = sku => {
      sku.isLoadingClone = true;
      sku.description.includes("Clone") || sku.description.includes("clone") ?
        "" :
        $state
          .go("common.prime.itemMaintenance.sku.clone", {
            id: sku.id
          })
          .then(() => {
            if (sku.isLoadingClone) {
              $timeout(() => {
                sku.isLoadingClone = false;
              }, 0);
            }
          });
    };

    vm.goToClonePanelFromSkuPublish = skuId => {
      vm.isCloneSkucreate = true;
      SKUService.API.StoreVariable("sku_id", skuId);
    };

    vm.gotoRetailScreen = sku => {
      $state.go("common.prime.itemMaintenance.sku.retail", {
        id: sku,
        returnUrl: common.$state.current.name,
        skutype: $stateParams.skutype,
        subtype: $stateParams.subtype
      });
      $timeout(() => {
        angular.element("#three_dot_menu").focus();
      }, 1000);
    };

    vm.gotoItem = selectedSKUId => {
      selectedSKUId.isLoadingMaintainSku = true;
      $state.go("common.prime.itemMaintenance.update", {
        id: selectedSKUId.item_id,
        type: $scope.selected_item.item_sub_type
      });

      vm.createStage = false;
      vm.createForm = false;
      vm.configureStage = false;
      vm.vendorPurchaseScreen = false;
      vm.vendorPurchaseStage = false;
      vm.previewandpublishStage = false;
      vm.configureScreen = false;
      vm.skuSetForm = false;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
      vm.confirmDelete = false;
    };

    vm.gotoItemFromSkuCreate = selectedSKUId => {
      selectedSKUId.isLoadingMaintainSku = true;
      $state.go("common.prime.itemMaintenance.update", {
        id: vm.selected_item_id,
        type: "item"
      });

      vm.createStage = false;
      vm.createForm = false;
      vm.configureStage = false;
      vm.vendorPurchaseScreen = false;
      vm.vendorPurchaseStage = false;
      vm.previewandpublishStage = false;
      vm.configureScreen = false;
      vm.skuSetForm = false;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
      vm.confirmDelete = false;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    vm.updateTableInformation = currentPage => {
      if (currentPage === 1) {
        vm.rowsInfo =
          "Displaying 1-" +
          (vm.rowCount < vm.pageSize ? vm.rowCount : vm.pageSize) +
          " Of " +
          vm.rowCount +
          " Records";
      } else {
        let start =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          1;
        let end =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          parseInt(vm.pageSize);
        vm.rowsInfo =
          "Displaying " +
          start +
          " -" +
          (end < vm.rowCount ? end : vm.rowCount) +
          " Of " +
          vm.rowCount +
          " Records";
      }
    };

    //function to go to next stage in create/update form
    vm.goToScreen = screen => {
      vm.resetFormField()
      vm.thumbnailActive = false
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      vm.validationError = [];
      vm.publishResponseMessage = false;
      vm.skudataUploaderror = false;
      vm.skudataAddToQueueError = false;
      vm.opdone = false;
      if (screen && screen.toLowerCase() === "skumasterscreen") {
        vm.createForm = true;
        vm.manageDropScreen = false;
        vm.configureScreen = false;
        vm.assortmentForm = false;
        vm.vendorPurchaseScreen = false;
        vm.previewAndPublish = false;
        vm.vendorPurchaseScreen = false;
        vm.skuSetForm = false;
      } else if (screen && screen.toLowerCase() === "assortmentscreen") {
        vm.createForm = false;
        vm.assortmentForm = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.$showOLDetails = false;
        vm.isInvalidForm = false;
        vm.skuSetForm = false;
        vm.skuSetStage = false;
        vm.previewAndPublish = false;
        vm.skuTemplateForm = false;
        vm.skuTemplateStage = false;
        vm.resetSKUOptionForm();
        vm.vendorPurchaseScreen = false;
      } else if (screen && screen.toLowerCase() === "vendorpurchasescreen") {
        //go to configure Udd stage if current stage is create SKU
        ///If current sku sub type is not Set, then show vendor puchase information screen
        vm.vendorPurchaseScreen = true;
        vm.configureScreen = false;
        vm.createForm = false;
        vm.setStageIndication("vendorPurchaseScreen");
        vm.createForm = false;
        vm.skuSetForm = false;
        vm.manageDropScreen = false;
        vm.assortmentForm = false;
        vm.previewAndPublish = false;
      } else if (
        screen &&
        screen.toLowerCase() == "userdefineddataconfigurationscreen"
      ) {
        vm.assortmentForm = false;
        vm.createForm = false;
        vm.vendorPurchaseScreen = false;
        vm.configureScreen = true;
        vm.skuSetForm = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        $scope.isEnabled = !$scope.isEnabled;
      } else if (
        screen &&
        (screen.toLowerCase() === "skusetscreen" ||
          screen.toLowerCase() === "skutemplatescreen")
      ) {
        if (
          $scope.skuHead.sku_sub_type &&
          $scope.skuHead.sku_sub_type.toLowerCase() === "set"
        ) {
          //go to create set stage if current stage is configure udd and sku_sub_type is 'Set'
          vm.skuSetForm = true;
          vm.skuSetStage = true;
          vm.createForm = false;
          vm.manageDropScreen = false;
          vm.configureScreen = false;
          vm.assortmentForm = false;
          vm.vendorPurchaseScreen = false;
          vm.previewAndPublish = false;
          vm.vendorPurchaseScreen = false;
          vm.skuTemplateForm = false;
          vm.skuTemplateStage = false;
        } else if (
          $scope.skuHead.sku_sub_type &&
          $scope.skuHead.sku_sub_type.toLowerCase() === "template"
        ) {
          //go to create template stage if current stage is configure udd and sku_sub_type is 'template'
          vm.skuTemplateForm = true;
          vm.skuTemplateStage = true;
          vm.createForm = false;
          vm.manageDropScreen = false;
          vm.configureScreen = false;
          vm.assortmentForm = false;
          vm.vendorPurchaseScreen = false;
          vm.previewAndPublish = false;
          vm.vendorPurchaseScreen = false;
          vm.skuSetForm = false;
          vm.skuSetStage = false;
        } else {
          //go to preview and publish stage if current stage is configure udd and sku_sub_type is 'Sku'
          vm.previewAndPublish = false;
          vm.manageDropScreen = true;
          vm.showSummaryPanel = false;
          vm.manageDropScreen = false;
        }
        vm.configureScreen = false;
        vm.createStage = true;
        vm.vendorPurchaseScreen = false;
        vm.configureStage = true;
        vm.setStageIndication("skuSetForm");
        vm.isInvalidForm = false;
      } else if (screen && screen.toLowerCase() === "dropconfigurationscreen") {
        //go to manage drop screen if current screen is in template form
        vm.assortmentForm = false;
        vm.configureScreen = false;
        vm.createForm = false;
        vm.skuTemplateForm = false;
        vm.skuTemplateStage = false;
        vm.vendorPurchaseScreen = false;
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        vm.showSummaryPanel = false;
        vm.skuSetForm = false;
        vm.skuSetStage = false;
      } else if (screen && screen.toLowerCase() === "publishscreen") {
        vm.assortmentForm = false;
        vm.configureScreen = false;
        vm.createForm = false;
        vm.skuTemplateForm = false;
        vm.skuTemplateStage = false;
        vm.vendorPurchaseScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.showSummaryPanel = false;
        vm.skuSetForm = false;
        vm.skuSetStage = false;
      }
    };

    vm.resetFormField = () => {
      $scope.drop.stream_id = null;
      $scope.files = undefined;
      $scope.errFiles = undefined;
      $scope.drop.url = undefined;
      vm.thumbnailActive = false
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.sequenceChangeError = false
    }
    //function to go to next stage in create/update form
    vm.continueFn = screen => {
      vm.resetFormField()
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      vm.upcalreadyexists = false;
      if (vm.configureScreen === undefined) {
        vm.createForm = false;
        vm.vendorPurchaseScreen = false;
        vm.previewAndPublish = true;
        vm.skuSetForm = false;
      } else if (screen && screen.toLowerCase() === "createform") {
        if (
          (
            vm.sku_form &&
            !vm.sku_form.$invalid
          ) &&
          !($scope.skuHead && $scope.skuHead.description && $scope.skuHead.description.length > 100) &&
          !($scope.skuHead && $scope.skuHead.gsa_description && $scope.skuHead.gsa_description.length > 20) &&
          !($scope.skuHead && $scope.skuHead.rms_description && $scope.skuHead.rms_description.length > 30) &&
          vm.inventory_methods.length > 0 && ($scope.skuHead.next_status_id != $scope.skuHead.status_id)
        ) {
          vm.createForm = false;
          vm.assortmentForm = true;
          vm.configureScreen = false;
          vm.$showOLDetails = false;
          vm.isInvalidForm = false;
          vm.resetSKUOptionForm();
        } else {
          vm.isInvalidForm = true;
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      } else if (screen && screen.toLowerCase() === "assortmentform") {
        //go to configure Udd stage if current stage is create SKU
        ///If current sku sub type is not Set, then show vendor puchase information screen
        vm.vendorPurchaseScreen = true;
        vm.configureScreen = false;
        vm.setStageIndication("vendorPurchaseScreen");

        vm.createForm = false;
        vm.skuSetForm = false;
        vm.assortmentForm = false;
      } else if (screen == "vendorPurchaseScreen") {
        if (
          (((vm.linkVendor.vendor_item_description === undefined ||
            vm.linkVendor.vendor_item_description === null ||
            vm.linkVendor.vendor_item_description === "") &&
            (vm.linkVendor.vendor_item_number === undefined ||
              vm.linkVendor.vendor_item_number === null ||
              vm.linkVendor.vendor_item_number === "") &&
            (vm.linkVendor.first_cost === undefined ||
              vm.linkVendor.first_cost === null ||
              isNaN(vm.linkVendor.first_cost)) &&
            (vm.linkVendor.hts_number === undefined ||
              vm.linkVendor.hts_number === null ||
              vm.linkVendor.hts_number === "") &&
            (vm.linkVendor.purchasing_information === undefined ||
              vm.linkVendor.purchasing_information === null ||
              vm.linkVendor.purchasing_information === "") &&
            vm.upc_number.length === 0) ||
            !vm.showPurchseInfoForm ||
            vm.isVendorLinkedToSku) &&
          (((vm.currentVendorInList.vendor_item_description === undefined ||
            vm.currentVendorInList.vendor_item_description === null ||
            vm.currentVendorInList.vendor_item_description === "") &&
            (vm.currentVendorInList.vendor_item_number === undefined ||
              vm.currentVendorInList.vendor_item_number === null ||
              vm.currentVendorInList.vendor_item_number === "") &&
            (vm.currentVendorInList.first_cost === undefined ||
              vm.currentVendorInList.first_cost === null ||
              isNaN(vm.currentVendorInList.first_cost)) &&
            (vm.currentVendorInList.hts_number === undefined ||
              vm.currentVendorInList.hts_number === null ||
              vm.currentVendorInList.hts_number === "") &&
            (vm.currentVendorInList.purchasing_information === undefined ||
              vm.currentVendorInList.purchasing_information === null ||
              vm.currentVendorInList.purchasing_information === "") &&
            vm.upc_number.length === 0) ||
            !vm.showPurchseInfoForm ||
            vm.isVendorLinkedToSku)
        ) {
          vm.createForm = false;
          vm.vendorPurchaseScreen = false;
          vm.configureScreen = true;
          $scope.isEnabled = !$scope.isEnabled;
          vm.skuSetForm = false;
        } else {
          vm.validationMessage =
            "Please save the changes. Click on 'Close' button to proceed without saving.";
        }
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        if (vm.skuuddForm && vm.skuuddForm.$invalid) {
          vm.isInvalidForm = true;
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        } else {
          if (
            $scope.skuHead.sku_sub_type &&
            $scope.skuHead.sku_sub_type.toLowerCase() === "set"
          ) {
            //go to create set stage if current stage is configure udd and sku_sub_type is 'Set'
            // common.$state.go('common.prime.sku.set.new');
            vm.skuSetForm = true;
            vm.skuSetStage = true;
          } else if (
            $scope.skuHead.sku_sub_type &&
            $scope.skuHead.sku_sub_type.toLowerCase() === "template"
          ) {
            //go to create template stage if current stage is configure udd and sku_sub_type is 'template'
            vm.skuTemplateForm = true;
            vm.skuTemplateStage = true;
          } else {
            //go to preview and publish stage if current stage is configure udd and sku_sub_type is 'Sku'
            vm.previewAndPublish = false;
            vm.manageDropScreen = true;
            vm.showSummaryPanel = false;
          }
          vm.configureScreen = false;
          vm.createStage = true;
          vm.configureStage = true;
          vm.setStageIndication("skuSetForm");
          vm.isInvalidForm = false;
        }
      } else if (screen && screen.toLowerCase() === "skusetform") {
        //go to manage drop screen if current screen is in set form
        vm.configureScreen = false;
        vm.skuSetForm = false;
        vm.manageDropScreen = true;
        vm.skudataAddToQueueError = false;
        vm.previewAndPublish = false;
        vm.skudataUploaderror = false;
        vm.showSummaryPanel = false;
      } else if (screen && screen.toLowerCase() === "skutemplateform") {
        //go to manage drop screen if current screen is in template form
        vm.configureScreen = false;
        vm.skuTemplateForm = false;
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        vm.showSummaryPanel = false;
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        if ($scope.files && $scope.files.length > 0) {
          let btnLabel = $stateParams.id ? "'Upload Image'" : "'Add to Queue'";
          if (vm.drop_form.$valid) {
            vm.validationMessage = `Please click on ${btnLabel} button to link drop to SKU. Click on 'Skip' button to proceed without uploading.`;
          } else {
            vm.validationMessage = `Please fill in the required fields and click on ${btnLabel} button to link drop to SKU or Click on 'Skip' button to proceed without uploading.`;
          }
        } else {
          vm.configureScreen = false;
          vm.itemSetForm = false;
          vm.manageDropScreen = false;
          vm.previewAndPublish = true;
        }
      } else if (screen && screen.toLowerCase() === "skip") {
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.validationMessage = null;
      } else if (screen && screen.toLowerCase() === "close") {
        vm.invalidCheckDigit = null;
        vm.createForm = false;
        vm.vendorPurchaseScreen = true;
        vm.configureScreen = false;
        vm.skuSetForm = false;
        vm.showPurchseInfoForm = false;
        vm.linkVendor = {};
        vm.currentVendorInList = {};
      }
    };

    //back function to go to previous stage in create/update form
    vm.backFn = screen => {
      vm.resetFormField()
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      if (vm.configureScreen === undefined) {
        vm.refineFn();
      } else if (screen && screen.toLowerCase() === "vendorpurchasescreen") {
        vm.assortmentForm = true;
        vm.vendorPurchaseScreen = false;
        vm.previewAndPublish = false;
        $timeout(() => {
          angular.element("#assort_next").focus();
        }, 1000);
      } else if (screen && screen.toLowerCase() === "assortmentform") {
        vm.createForm = true;
        vm.assortmentForm = false;
        vm.previewAndPublish = false;
        $timeout(() => {
          if ($state.current.name.includes(".new")) {
            !$scope.skuHead.description ? $scope.skuHead.description = $scope.selected_item.description : "";
            !$scope.skuHead.rms_description ? $scope.skuHead.rms_description = $scope.selected_item.description : "";
            !$scope.skuHead.gsa_description ? $scope.skuHead.gsa_description = $scope.selected_item.description : "";

          } else if ($state.current.name.includes(".update") && vm.oldSKU && vm.oldSKU.description) {
            !$scope.skuHead.description ? $scope.skuHead.description = vm.oldSKU.description : "";
            !$scope.skuHead.rms_description ? $scope.skuHead.rms_description = vm.oldSKU.rms_description : "";
            !$scope.skuHead.gsa_description ? $scope.skuHead.gsa_description = vm.oldSKU.gsa_description : "";
          }
          angular.element("#sku_master_next").focus();
        }, 1000);
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        ///If current sku sub type is not Set, then show vendor puchase information screen
        vm.assortmentForm = false;
        vm.vendorPurchaseScreen = true;
        vm.configureStage = false;
        vm.configureScreen = false;
        vm.previewAndPublish = false;
        $timeout(() => {
          angular.element("#ven_purchase").focus();
        }, 1000);
      } else if (screen && screen.toLowerCase() === "skusetform") {
        vm.createForm = false;
        vm.configureScreen = true;
        vm.skuSetForm = false;
        vm.skuSetStage = false;
        vm.previewAndPublish = false;
      } else if (screen && screen.toLowerCase() === "skutemplateform") {
        vm.createForm = false;
        vm.configureScreen = true;
        vm.skuTemplateForm = false;
        vm.skuTemplateStage = false;
        vm.previewAndPublish = false;
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        if ($scope.skuHead.sku_sub_type.toLowerCase() === "set") {
          vm.skuSetForm = true;
          vm.skuSetStage = true;
          $timeout(() => {
            angular.element("#config_next").focus();
          }, 1000);
        } else if ($scope.skuHead.sku_sub_type.toLowerCase() === "template") {
          vm.skuTemplateForm = true;
          vm.skuTemplateStage = true;
          $timeout(() => {
            angular.element("#config_next").focus();
          }, 1000);
        } else {
          vm.configureScreen = true;
          $timeout(() => {
            angular.element("#config_next").focus();
          }, 1000);
        }
        vm.previewAndPublish = false;
        vm.manageDropScreen = false;
      } else if (screen && screen.toLowerCase() === "previewandpublish") {
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        vm.showSummaryPanel = true;
        $timeout(() => {
          angular.element("#drop_next").focus();
        }, 1000);
      }
    };

    vm.focusCloneSkuPublish = () => {
      $timeout(() => {
        angular.element("#clone_sku_publish").focus();
      }, 1000);
    }

    vm.refineFn = () => {
      vm.createForm = true;
      vm.configureScreen = false;
      vm.skuSetForm = false;
      vm.previewAndPublish = false;
    };
    vm.confirmDelete = false;
    vm.confirmDel = () => {
      vm.confirmDelete = !vm.confirmDelete;
    };

    vm.openFiltersPanel = () => {
      if (!vm.isFilterApplied) {
        vm.filters = {};
      }
      $state.go("common.prime.sku.filter");
    };

    vm.skuNumberList = () => {
      if (!vm.skuNumbersList || vm.skuNumberList.length == 0) {
        vm.skuNumbersList = [];
        EntityDetails.API.GetGraphSet(
          common.Identifiers.sku_master,
          ["id", "sku"],
          "item_id",
          $stateParams.item_id
        )
          .then(res => {
            vm.skuNumbersList = res.data;
          })
          .catch(err => logger.error(err));
      }
    };

    vm.resetFilters = refresh => {
      vm.isResetFilter = true;
      vm.message = null;
      vm.errorMessage = null;
      vm.filters["itemId"] = undefined;
      vm.filters["skuType"] = undefined;
      vm.filters.skuNumbers = [];
      vm.filters.skuOptionIds = [];
      vm.filters.inventoryMethodIds = [];
      vm.filters.skuDescription = [];
      vm.filters.currentStatusIds = [];
      vm.filters.nextStatusIds = [];
      vm.filters.romanic_copy = [];
      vm.filters.has_error = undefined;
      vm.applyFiltersBtnLabel = "Apply Filters";
      /*
        Only on click of the reset button in the filter panel the message
        for the reset will be shown by passing -1.
      */
      if (refresh === -1) {
        if (JSON.stringify(vm.old_filters) !== "{}") {
          vm.resetMessage = "Filter reset successfull!";
        }
        $timeout(() => {
          vm.resetMessage = null;
          vm.InitialFilterForm(true);
        }, 500);
      }
      if (vm.isFilterApplied && JSON.stringify(vm.old_filters) !== "{}") {
        vm.reloadSKUCountAndList();
      }
      vm.isFilterApplied = false;
      vm.applyFilterSuccess = true;
      $timeout(() => {
        vm.filters = {};
        vm.advancedSearchPanel = false;
        vm.old_filters = {};
      }, 0);
    };

    vm.focusSearchField = () => {
      angular.element("#inlineSearch").focus();
      // vm.showFilter = true;
    };

    /*
     * This function is used to get the height of the element
     * and move the datalist accordingly.
     */
    vm.checkFilterHeight = () => {
      common.$timeout(() => {
        let headerHeight = angular.element(".rc-module-header").height();
        angular.element(".module-content").css("margin-top", headerHeight);
      }, 500);
    };

    vm.setInitialHeight = () => {
      common.$timeout(() => {
        vm.showFilter ? vm.InitialFilterForm() : "";
      }, 0);
    };

    vm.applyFilters = () => {
      vm.message = null;
      vm.errorMessage = null;
      vm.filters.length > 0 ?
        (vm.applyFilterSuccess = true) :
        (vm.applyFilterSuccess = false);
      for (let property in vm.filters) {
        if (
          vm.filters[property] === undefined ||
          vm.filters[property] === null ||
          vm.filters[property] === "" ||
          (Array.isArray(vm.filters[property]) && vm.filters[property].length === 0)
        ) {
          delete vm.filters[property];
        }
      }

      if (
        Object.keys(vm.filters).length != 0 ||
        (vm.old_filters !== undefined && !angular.equals(vm.old_filters, vm.filters))
      ) {
        vm.applyFilterSuccess = true;
        if (
          "skuType" in vm.filters ||
          "romanic_copy" in vm.filters ||
          "has_error" in vm.filters ||
          ("skuNumbers" in vm.filters && vm.filters.skuNumbers.length > 0) ||
          ("skuOptionIds" in vm.filters && vm.filters.skuOptionIds.length > 0) ||
          ("inventoryMethodIds" in vm.filters && vm.filters.inventoryMethodIds.length > 0) ||
          ("skuDescription" in vm.filters && vm.filters.skuDescription.length > 0) ||
          ("currentStatusIds" in vm.filters && vm.filters.currentStatusIds.length > 0) ||
          ("nextStatusIds" in vm.filters && vm.filters.nextStatusIds.length > 0) ||
          !angular.equals(vm.old_filters, vm.filters)
        ) {
          if (
            !angular.equals(vm.old_filters, vm.filters) ||
            !vm.isFilterApplied ||
            (vm.isGroupByApplied && !vm.isGroupByFilterApplied)
          ) {
            vm.page = 1;
            vm.applyFiltersBtnLabel = "Applying Filters...";
            vm.isProcessing = true;
            vm.reloadSKUCountAndList()
              .then(() => {
                vm.advancedSearchPanel = true;
                if (vm.isGroupByApplied) {
                  vm.isGroupHeader = true;
                  vm.isGroupByFilterApplied = true;
                }
                vm.isFilterApplied = true;
                vm.old_filters = angular.copy(vm.filters);
                vm.message = "Filter applied successfully!";
                vm.applyFiltersBtnLabel = "Apply Filters";
                vm.isProcessing = false;
                $timeout(() => {
                  vm.message = null;
                  vm.errorMessage = null;
                  vm.InitialFilterForm(true);
                  angular.element("#filter_applied").focus();
                }, 1000);
              })
              .catch(error => {
                vm.errorMessage = "Unable to apply filter!";
                vm.showFilter = false;
                vm.applyFiltersBtnLabel = "Apply Filters";
                vm.isProcessing = false;
                logger.error(error);
              });
          } else {
            vm.applyFilterSuccess = false;
            vm.showFilter = false;
            vm.applyFilterMessage = "* Search results already found for selected filters";
          }
        } else {
          vm.applyFilterSuccess = false;
          vm.showFilter = false;
          vm.applyFilterMessage = "* Please select atleast one filter to search relevant SKUs";
        }
      } else {
        vm.applyFilterSuccess = false;
        vm.showFilter = false;
        vm.applyFilterMessage = "* Please select atleast one filter to search relevant SKUs";
      }
    };

    //State change to set installation retail for a SKU
    vm.goToSetInstallationRetail = skuId => {
      $state.go("common.prime.itemMaintenance.sku.installation", {
        id: skuId
      });
    };

    vm.hasUserAccessToPE = () => {
      EntityService.API.GetAccessModulePermissionForUser("2")
        .then(response => {
          if (response.data.length > 0) {
            vm.isViewSKUInPE = response.data[0].access;
          } else {
            vm.isViewSKUInPE = 0;
          }
        })
        .catch(error => {
          console.log(error);
        });
    };

    vm.gotoLink = skuId => {
      EntityService.API.GetModules()
        .then(response => {
          let url;
          _.each(response, packagemodule => {
            if (
              packagemodule.description.toLowerCase() === "product explorer"
            ) {
              if (packagemodule.port) {
                url = "http://" + packagemodule.dns + ":" + packagemodule.port;
              } else {
                url = "http://" + packagemodule.dns;
              }
              url =
                url +
                "/#/login?sku_id=" +
                skuId +
                "&token=" +
                common.SessionMemory.API.Get("user.token") +
                "&sessionId=" +
                common.SessionMemory.API.Get("user.session") + "&moduleid=" + packagemodule.id;
              window.open(url);
            }
          });
        })
        .catch(error => {
          console.log(error);
        });
    };

    vm.focusMasterDelete = () => {
      $timeout(() => {
        angular.element("#sku_master_del").focus();
      }, 1000);
    }

    vm.focusMasterDeleteCancel = () => {
      $timeout(() => {
        angular.element("#del_sku_master").focus();
      }, 1000);
    }

    vm.focusAssortmentCancel = () => {
      $timeout(() => {
        angular.element("#del_assort_sku").focus();
      }, 1000);
    }

    vm.focusAssortmentDelete = () => {
      $timeout(() => {
        angular.element("#sku_assort_del").focus();
      }, 1000);
    }

    vm.focusVendorDelete = () => {
      $timeout(() => {
        angular.element("#del_ven_sku").focus();
      }, 1000);
    }

    vm.focusVendorCancel = () => {
      $timeout(() => {
        angular.element("#sku_ven_del").focus();
      }, 1000);
    }

    vm.focusSkuUddDelete = () => {
      $timeout(() => {
        angular.element("#del_udd_sku").focus();
      }, 1000);
    }

    vm.focusSkuUddCancel = () => {
      $timeout(() => {
        angular.element("#sku_udd_del").focus();
      }, 1000);
    }

    vm.focusSkuDocDelete = () => {
      $timeout(() => {
        angular.element("#del_doc_sku").focus();
      }, 1000);
    }

    vm.focusSkuDocCancel = () => {
      $timeout(() => {
        angular.element("#sku_doc_del").focus();
      }, 1000);
    }

    //Check for the view permissions for the SKU entity
    vm.init = () => {
      $scope
        .getAccessPermissions(vm.uuid)
        .then(result => {
          vm.skuPermissions = result;
          vm.initSKU();
        })
        .catch(error => {
          vm.skuPermissions = error.data;
          vm.initSKU();
          logger.error(error);
        });
    }
    vm.init();
    vm.watchers();
    $scope.dblClickAction = vm.dblClickAction;
  }
})();
