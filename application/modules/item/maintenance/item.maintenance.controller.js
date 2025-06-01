(() => {
  "use strict";
  angular
    .module("rc.prime.item")
    .controller("ItemMaintenanceController", ItemMaintenanceController);
  ItemMaintenanceController.$inject = [
    "$rootScope",
    "$scope",
    "$stateParams",
    "$window",
    "$interval",
    "AttributeValueService",
    "CodeService",
    "common",
    "DataLakeAPIService",
    "DataLakeService",
    "HierarchyValuesTreePathService",
    "HierarchyService",
    "HierarchyValueService",
    "ItemCollectionService",
    "ItemParameterService",
    "ItemService",
    "ItemTypeService",
    "MTOService",
    "MTOChoiceService",
    "SKUService",
    "StatusCodes",
    "VendorService",
    "UserService",
    "$location",
    "TemplateService",
    "GlobalRegularExpression",
    "AS400FieldsRegularExpression",
    "$http"
  ];

  function ItemMaintenanceController(
    $rootScope,
    $scope,
    $stateParams,
    $window,
    $interval,
    AttributeValueService,
    CodeService,
    common,
    DataLakeAPIService,
    DataLakeService,
    HierarchyValuesTreePathService,
    HierarchyService,
    HierarchyValueService,
    ItemCollectionService,
    ItemParameterService,
    ItemService,
    ItemTypeService,
    MTOService,
    MTOChoiceService,
    SKUService,
    StatusCodes,
    VendorService,
    UserService,
    $location,
    TemplateService,
    GlobalRegularExpression,
    AS400FieldsRegularExpression,
    $http
  ) {
    let vm = this;

    vm.uuid = "4";

    /** Common Modules Initialization*/
    let $filter = common.$filter;
    let $q = common.$q;
    let $state = common.$state;
    let $timeout = common.$timeout;

    let EntityDetails = common.EntityDetails;
    let Identifiers = common.Identifiers;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;

    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("ItemMaintenanceController");
    vm.common = common;
    vm.statusCodes = StatusCodes;
    vm.collectionChanged = true;
    vm.selectedVendor = null;
    vm.globalRegularExpression = GlobalRegularExpression;
    vm.as400FieldsRegularExpression = AS400FieldsRegularExpression;
    /**Controller Variable declaration */
    vm.groupItems = [];
    vm.groupItemsMap = [];
    $scope.unique_id = 1;
    vm.selectedGroupHeader = [];
    $scope.uddValidationErrors = [];
    vm.assortmentLabels = [];
    vm.productAssortments = [];
    vm.itemdataAddToQueueError = false;
    vm.isAddedToQueue = false;
    // Initialize Item UDD map variables
    vm.attributeValuesMap = new Map();
    vm.typesMap = new Map();
    vm.collectionsMap = new Map();
    vm.mtoOptionsMap = new Map();
    vm.mtoOptionChoicesMap = new Map();
    vm.ItemGroupData = new Map();
    vm.roles = JSON.parse(common.SessionMemory.API.Get("user_role"));

    // Initialize the object variables
    $scope.head = {};
    $scope.updateScreen = false;
    vm.availableSkus = {};
    vm.filters = {};
    vm.old_filters = {};
    vm.appliedFilterCount = 0;
    vm.dependencyList = {};
    vm.$errorDependentData = {};
    vm.previousC = {};
    vm.entityInformation = {};
    vm.item_type_path = undefined;
    $scope.drop = {};
    $scope.selectedHierarchyProperties = [];
    $scope.$location = $location;
    // variable to save cover image as thumbnail
    vm.is_thumbnail = 1;
    // Instances used to update item vendors priority
    $scope.apiInstanceDisplayValues = ItemService.API.UpdateItemVendor;

    // Set values of display in apply filters button
    vm.applyFiltersBtnLabel = "Apply Filters";
    vm.applyFilterSuccess = true;

    // Set the button name to disp
    vm.$saveCollBtnText = "Save";

    // loading variable
    vm.isLoadingMaintainSku = false;
    vm.isLoadingMaintainRetail = false;
    vm.isLoadingHistory = false;
    vm.isLoadingClone = false;
    vm.isLoadingDelete = false;

    /**Set initial value for the variables */
    vm.showitemmaintenance = true;
    vm.itemmaintenancegrid = true;
    vm.showUpdateItemPanel = false;
    vm.cardView = true;
    vm.isViewAuthorized = true;
    vm.isGroupByApplied = false;
    vm.clearPath = false;
    vm.isGroup = false;
    vm.selectedGroupitem = false;
    vm.disableActions = false;
    // Used to toggle the right side group by panel
    vm.showgroupByMenu = false;
    // Set initial values of success form and error for variables to false
    vm.$savesuccess = false;
    vm.$showCollDetails = false;
    vm.$saveCollBtnError = false;
    vm.$showErrorDetails = false;
    vm.$showErrorDetailsData = false;

    // Variable to hide the Advanced Search panel initially
    vm.showFilter = false;
    vm.isShowFilter = false;
    vm.sortByField = "none";
    vm.sortByOrder = "desc";
    vm.isResetFilter = false;
    vm.isGroupByFilterApplied = false;

    // Variable to hold the access value for 'item-clone' from user management
    vm.isCloneAllowed = false;
    $scope.isDivisionDepartment = true;

    // Flag variable to indicate SKU loading
    vm.skuLoading = false;
    vm.isSkuLoaded = false;

    $scope.isConfirmDelete = false;
    // variable to call confirmation panel on cover image deletion
    vm.showConfirmDeletion = false;
    vm.showConfirmThumbnailDeletion = false;
    // On create, variable to call confirmation panel on cover image deletion
    vm.DeletionConfirmation = false;
    vm.DeletionThumbnailConfirmation = false;
    // variable to keep track of item vendors loading process
    vm.isLoadingAlternativeVendor = false
    vm.isUpdateSuccess = false;
    vm.duplicateItemExist = false;
    vm.showDuplicateItems = false;
    vm.thumbnailActive = false;
    vm.numberCannotExeed = false;
    vm.oneSequence = false;
    vm.sequenceChangeError=false
    vm.firstValue=0
    //variables for SKU filter
    $scope.enableDamagechk = false;

    $rootScope.$on("gotoItem", (e, flag) => {
      vm.Activate();
    })

    $rootScope.$on("continueItemStatus", (e, flag) => {
      // if (vm.changingstatus) {
      //   this.isContinueSkustatus = true;
      //   vm.reloadUDDs();
      // }
      if (vm.changingnextstatus) {
        $scope.changeevent($scope.head)
      }
      vm.changingdate = vm.changingnextdate = vm.changingnextstatus = vm.changingstatus = false;
      vm.LoadingSecndryAuth = false;
    })

    // Configure vendor search select object
    $scope.selectVendorConfiguration = {
      valueField: "id",
      labelField: "name",
      searchField: ["name"],
      sortField: "name",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Vendors" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: $scope.allVendors,
      render: {
        option: (data, escape) => {
          if (data.status.toLowerCase() === "inactive") {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.name) +
              "</span>" +
              "</span>" +
              "<span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.VendorType) +
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
              "</span>" +
              "<span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.VendorType) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: (data, escape) => {
          vm.vendor = data.name;
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.name) +
            "</span>" +
            "-" +
            '<span class="m-l-5 f-12 text-muted">' +
            escape(data.VendorType) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    vm.setVendorData = (vendorId) => {
      if (common.SessionMemory.API.Get("vendorList")) {
        let vendors = JSON.parse(common.SessionMemory.API.Get("vendorList"));
        let filteredVendor = vendors.filter(vendorData => vendorData.id === vendorId);
        if (filteredVendor && filteredVendor[0]) {
          vm.selectedVendor = {
            id: filteredVendor[0].id,
            name: filteredVendor[0].name,
            status: filteredVendor[0].status,
            VendorType: filteredVendor[0].VendorType
          }
        }
      } else {
        VendorService.API.GetVendors()
          .then(response => {
            common.SessionMemory.API.Post("vendorList", JSON.stringify(response.data.data));
            vm.setVendorData(vendorId);
          })
          .catch(error => {
            logger.error(error);
          });
      }
    }

    // Item type select object
    vm.getAllItemTypes = () => {
      if ($state.current.name.includes("itemMaintenance.update")) $scope.updateScreen = true;
      $scope.selectItemType = {
        valueField: "id",
        labelField: "tree_path",
        searchField: ["tree_path"],
        sortField: "tree_path",
        //Space is added to so that end of the text does not cut off
        placeholder: "Select Item Type" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        options: $scope.allTypes,
        onChange: function (value) {
          if (!this.options[value]) {
            $scope.head.type_id = null;
          }
          if (this.options[value]) {
            if (this.options[value].tree_path_id) {
              $scope.head.selectedTreePathId = this.options[
                value
              ].tree_path_id.split(">");
            }
            $scope.isDivisionDepartment = false;
            if (!$scope.updateScreen) {
              $scope.head.primary_item_hierarchy_value_path = this.options[
                value
              ].tree_path_id;
            }
            this.options[value].tree_path ?
              ($scope.head.selectedTreePath = this.options[
                value
              ].tree_path.split(">")) :
              "";
            if (!$scope.updateScreen) {
              this.options[value].item_type_id && !$state.current.name.includes(".update") ?
                ($scope.head.primary_item_hierarchy_value_id = this.options[
                  value
                ].item_type_id) :
                "";
            }
            if ($scope.updateScreen) {
              $scope.head.primary_item_hierarchy_value_id = vm.item_details.primary_item_hierarchy_value_id;
              $scope.head.primary_item_hierarchy_value_path = vm.item_details.primary_item_hierarchy_value_path;
            }
            this.options[value].short_description ?
              ($scope.head.primary_item_hierarchy = this.options[
                value
              ].short_description) :
              "";
            $scope.primary_item_hierarchy_obj = this.options[value];
            // Set the division PE Hierarchy Value For the Selected Item Type
            this.options[value].tree_path_id ?
              ($scope.head.selectedTreePathId = this.options[
                value
              ].tree_path_id.split(">")) :
              null;
            // $scope.head.selectedTreePathId = this.options[value].tree_path_id.split(">");
            $scope.head.selectedTreePath = this.options[value].tree_path.split(
              ">"
            );
            $scope.head.primary_item_hierarchy_value_name = !$state.current.name.includes(".update") ? this.options[
              value
            ].tree_path : $scope.head.primary_item_hierarchy_value_name;
            $scope.primary_item_hierarchy_value_name = !$state.current.name.includes(".update") ? this.options[
              value
            ].tree_path : $scope.primary_item_hierarchy_value_name;
            $scope.head.primary_item_type_path = this.options[value].tree_path;
            $timeout(() => {
              $scope.isDivisionDepartment = true;
            }, 1);
          }
        },
        render: {
          option: (data, escape) => {
            // /** If the status of the item type is inactive, then disable the user from selecting the item type
            //  * Add class cursor not allowed and disable pointer to the div element
            //  **/
            let splitTreePath = data.tree_path.split(">");
            if (data.status_code.toLowerCase() !== "act") {
              // Else if the status of the item type is not inactive, make the item type options selectable
              let treePath = "";
              for (let i = 0; i < splitTreePath.length; i++) {
                if (i !== splitTreePath.length - 1) {
                  treePath +=
                    escape(splitTreePath[i]) +
                    '<span class="p-l-5 p-r-5 zmdi zmdi-long-arrow-right arrow-style c-firebrick"></span>';
                } else {
                  treePath += escape(splitTreePath[i]);
                }
              }
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                treePath +
                " : " +
                data.status +
                "</span>" +
                "</div>" +
                "</div>"
              );
            } else {
              // Else if the status of the item type is not inactive, make the item type options selectable
              let treePath = "";
              for (let i = 0; i < splitTreePath.length; i++) {
                if (i !== splitTreePath.length - 1) {
                  treePath +=
                    escape(splitTreePath[i]) +
                    '<span class="p-l-5 p-r-5 zmdi zmdi-long-arrow-right arrow-style c-firebrick"></span>';
                } else {
                  treePath += escape(splitTreePath[i]);
                }
              }
              return (
                '<div class="p-5">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                treePath +
                " : " +
                data.status +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          item: (data, escape) => {
            $scope.isDivisionDepartment = false;
            vm.selectedItemType = data.tree_path;
            $scope.head.primary_item_hierarchy_value_name = !$state.current.name.includes(".update") ? data.tree_path : $scope.head.primary_item_hierarchy_value_name;
            $scope.primary_item_hierarchy_value_name = !$state.current.name.includes(".update") ? data.tree_path : $scope.primary_item_hierarchy_value_name;
            // replaced this line for now with next line because of the issue in Div/Dept/Class in update form  ticket- #2433
            //$scope.head.primary_item_hierarchy_value_id = $scope.head.primary_item_hierarchy_value_id ? $scope.head.primary_item_hierarchy_value_id : data.item_type_id;
            if (!$scope.updateScreen) $scope.head.primary_item_hierarchy_value_id = data.item_type_id;
            if ($scope.updateScreen) $scope.head.primary_item_hierarchy_value_id = vm.item_details.primary_item_hierarchy_value_id;
            $scope.head.primary_item_hierarchy = data.short_description;
            if (!$scope.updateScreen) $scope.head.primary_item_hierarchy_value_path = data.tree_path_id;
            if ($scope.updateScreen) $scope.head.primary_item_hierarchy_value_path = vm.item_details.primary_item_hierarchy_value_path;
            $scope.primary_item_hierarchy_obj = data;
            $timeout(() => {
              $scope.isDivisionDepartment = true;
            }, 1);
            // Set the division PE Hierarchy Value For the Selected Item Type
            data.tree_path_id ?
              ($scope.head.selectedTreePathId = data.tree_path_id.split(">")) :
              null;
            $scope.head.selectedTreePath = data.tree_path.split(">");
            let splitTreePath = data.tree_path.split(">");
            let treePath = "";
            for (let i = 0; i < splitTreePath.length; i++) {
              if (i !== splitTreePath.length - 1) {
                treePath +=
                  escape(splitTreePath[i]) +
                  '<span class="p-l-5 p-r-5 zmdi zmdi-long-arrow-right arrow-style c-firebrick"></span>';
              } else {
                treePath += escape(splitTreePath[i]);
              }
            }
            return (
              "<div>" +
              "<div>" +
              '<span class="c-black f-13"> ' +
              treePath +
              " : " +
              data.status +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        }
      };
      vm.isAllLoaded = true;
    };

    // Division selectize object initialization
    $scope.selectProductExplorerDivision = {
      valueField: "id",
      labelField: "short_description",
      searchField: ["short_description"],
      sortField: "short_description",
      // Space is added to so that end of the text does not cut off
      placeholder: "Select Division" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: $scope.allDivisions,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.short_description) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
        item: (data, escape) => {
          vm.selectedProductExplorerDivision = data.short_description;
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.short_description) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    // Department selection drop down
    $scope.selectProductExplorerDepartment = {
      valueField: "id",
      labelField: "short_description",
      searchField: ["short_description"],
      sortField: "short_description",
      // Space is added to so that end of the text does not cut off
      placeholder: "Select Department" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: $scope.allDepartments,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.short_description) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
        item: (data, escape) => {
          this.selectedProductExplorerDepartment = data.short_description;
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.short_description) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    // Class selectize object initialization
    $scope.selectProductExplorerClass = {
      valueField: "id",
      labelField: "short_description",
      searchField: ["short_description"],
      sortField: "short_description",
      // Space is added to so that end of the text does not cut off
      placeholder: "Select Classes" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: vm.classes,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.short_description) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
        item: (data, escape) => {
          vm.selectedProductExplorerClasses = data.short_description;
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.short_description) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    // Set Values valid for sorting
    $scope.sortableFields = [{
      field: "Sort By None",
      value: ""
    },
    {
      field: "Description",
      value: "description"
    },
    {
      field: "Primary Hierarchy Item Type",
      value: "item_type"
    },
    {
      field: "PE Division",
      value: "division"
    },
    {
      field: "PE Department",
      value: "department"
    },
    {
      field: "PE Class",
      value: "class"
    },
    {
      field: "Vendor",
      value: "vendor"
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

    $scope.damagefields = [
      {
        field: "Yes",
        value: "selectdamagesku"
      },
      {
        field: "No",
        value: "unselectdamagesku"
      }];

    // Set the number of items to load per page
    vm.setLimit = (limit) => {
      vm.limit = limit ? limit : 100;
    };

    // Activate method to load on controller initialize
    vm.Activate = () => {
      // get details for allow_collection_attributes
      vm.getSystemConfigurationSettings("allow_collection_attributes")
      vm.setLimit();
      vm.getItemParameters();
      // GET current statuses available for item
      $scope.getStatuses(common.Identifiers.item);
      // GET next statuses for item
      $scope.getNextStatuses(common.Identifiers.item);
      if (vm.isFilterApplied && JSON.stringify(vm.old_filters) !== "{}") {
        vm.setLimit(500);
        vm.reloadItemCountAndList();
      } else {
        vm.getItemsCount();
      }

      vm.loadPrimaryHierarchy();
      vm.createHierarchyValuesMap();
      vm.getItemTypes();
      vm.getEntityInformation();
      vm.fetchCollections();
      !vm.assortmentLabels.length ? vm.fetchAssortmentLabels() : "";
      !vm.productAssortments.length ? vm.fetchAssortmentHierarchies() : "";
      vm.itemTypeMaps = JSON.parse(
        common.SessionMemory.API.Get("item_type_maps")
      );
      getVendors();
    };

    // Get permissions of crud permission for item
    vm.getPermissionsForUuid = (model, uuid) => {
      $scope
        .getAccessPermissions(uuid)
        .then(res => {
          vm[model] = res;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.createStatusMap = (statusArray, toMapModel) => {
      vm[toMapModel] = [];
      _.each(statusArray, status => {
        vm[toMapModel][status.code] = status;
      });
    };




    // Fetch access for clone
    vm.fetchFeatureAccessDetails = () => {
      UserService.API.IsAllowedFeaturedPassword("item-clone")
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
      vm.ChangestatusFeature()
    };

    vm.ChangestatusFeature = () => {
      UserService.API.IsAllowedFeaturedPassword("Item Status")
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

    // Get total items available
    vm.getItemsCount = () => {
      ItemService.API.GetItemsCount()
        .then(response => {
          $timeout(() => {
            vm.totalRecordCount = response;
            if (vm.itemsDataList && vm.itemsDataList.length) {
              vm.availableItemsCount = vm.totalRecordCount - vm.itemsDataList.length;
            }
          }, 0);
        })
        .catch(error => logger.error(error));
    };

    // On Press of refresh button fetch item count and the data
    vm.reloadItemCountAndList = refresh => {
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
            vm.getItemsCount();
            vm.reload(refresh)
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            vm.reload(refresh)
              .then(response => {
                resolve(response);
                vm.totalRecordCount = response.data.filterdRecordCount;
                vm.availableItemsCount = vm.totalRecordCount - vm.itemsDataList.length;
              })
              .catch(error => {
                reject(error);
              });
          }
        }
      });
    };

    // Fetch collection for the given item id
    vm.fetchPropertiesForAnItem = item => {
      item.copyText = "Copy to clipboard"; /* by default on hover the title */
      vm.fetchPrimaryHierarchyAndValue(item);
      vm.fetchItemCollections(item);
      vm.fetchVendorById(item);
      item.status = $scope.statusMap[item.status_id];
      item.next_status = $scope.nextStatusMap[item.next_status_id];
      // item.availableSkus = [];
      // Get permissions for sku by item
    };

    // get vendor by id for an item
    vm.fetchVendorById = item => {
      if (!common.SessionMemory.API.Get("vendorList")) {
        // if vendors list does not exist in the session storage then get with API
        VendorService.API.GetVendorById(item.vendor_id)
          .then(response => {
            item.vendor = response.name;
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        // if vendorsMap exist then get vendor without hitting API
        if (vm.vendorsMap && vm.vendorsMap[item.vendor_id]) {
          item.vendor = vm.vendorsMap[item.vendor_id].name;
        } else if ((!vm.vendorsMap || !vm.vendorsMap[item.vendor_id]) && common.SessionMemory.API.Get("vendorList")) {
          let vendors = JSON.parse(common.SessionMemory.API.Get("vendorList"));
          let idx = vendors.findIndex(ven => parseInt(ven.id) === parseInt(item.vendor_id));
          idx > -1 ? item.vendor = vendors[idx].name : ""
        }
      }
    };

    vm.fetchItemCollections = item => {
      if (item.collection_id !== null && item.collection_id !== "null" && item.collection_id !== undefined && item.collection_id !== "undefined") {
        if (!common.SessionMemory.API.Get("collectionList")) {
          ItemCollectionService.API.GetCollectionsByItemCollectionIds(item.collection_id)
            .then(response => {
              item.collection = "";
              for (let index = 0; response && response.data && index < response.data.length; index++) {
                if (index === 0) {
                  item.collection += response.data[index].short_description;
                } else {
                  item.collection += `, ${response.data[index].short_description}`;
                }
              }
              if (!item.collection) {
                item.collection = "N/A";
              }
            })
            .catch(error => {
              console.log(error);
            });
        } else {
          let collections = JSON.parse(common.SessionMemory.API.Get("collectionList"));
          let collectionIds = item.collection_id.split(",").map(Number);
          let itemCollections = collections.filter(coll => collectionIds.includes(coll.id));
          item.collection = itemCollections.map(col => col.short_description).join(",");
        }
      }
    };

    vm.fetchPrimaryHierarchyAndValue = item => {
      if (!common.SessionMemory.API.Get("hierarchyValueList")) {
        HierarchyValueService.API.GetHierarchyValueById(
          item.primary_item_hierarchy_value_id
        )
          .then(response => {
            item.primary_item_hierarchy = response.hierarchy;
            item.primary_item_hierarchy_value_desc = response.short_description;
            item.primary_item_hierarchy_value_path = response.tree_path;
            let pth = [];
            pth = vm.getTreePath(
              item.primary_item_hierarchy_value_id,
              item.primary_item_hierarchy_value_path
            );
            item.path = pth;
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        let hierarchyValues = JSON.parse(common.SessionMemory.API.Get("hierarchyValueList"));
        let idx = hierarchyValues.findIndex(val => val.id === parseInt(item.primary_item_hierarchy_value_id));
        if (idx > -1) {
          item.primary_item_hierarchy = hierarchyValues[idx].hierarchy;
          item.primary_item_hierarchy_value_desc = hierarchyValues[idx].short_description;
          item.primary_item_hierarchy_value_path = hierarchyValues[idx].tree_path;
          let pth = [];
          pth = vm.getTreePath(
            item.primary_item_hierarchy_value_id,
            item.primary_item_hierarchy_value_path
          );
          item.path = pth;
        }
      }
    };

    vm.fetchItemType = item => {
      ItemTypeService.API.getItemTypesById(item.type_id)
        .then(response => {
          if (response.length > 0) {
            item.item_type_id = response[0].item_type_id;
            item.item_type = response[0].item_type;
            item.item_type_path = response[0].item_type_path;
            let deptpath = vm.getTreePath(
              item.item_type_id,
              item.item_type_path
            );
            item.department_tree_path = deptpath ? deptpath.join(">") : "";
            vm.ItemMap[$stateParams.id] = item;
          }
        })
        .catch(error => {
          console.log(error);
        });
    };

    // Get the hierarchy path of Item types
    vm.getItemTypePath = item => {
      let deptpath = vm.getTreePath(item.item_type_id, item.item_type_path);
      item.department_tree_path = deptpath.join(">");
      vm.item_type_path = deptpath.join(
        '<span class="p-l-5 p-r-5 zmdi zmdi-long-arrow-right arrow-style c-firebrick"></span>'
      );
      vm.ItemMap[$stateParams.id] = item;
    };

    vm.performKeyUpEvent = event => {
      if (event.keyCode === 27 && vm.$showErrorDetailsData == true) {
        vm.$showErrorDetailsData = false;
        vm.$showErrorDetails = false;
        vm.$confirmdelete = false;
      } else if (event.keyCode === 27 && !vm.$showErrorDetailsData) {
        vm.exit("update");
      }
    };

    // Get the attribute values to create a map of attribute values
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

    // Get the item types to create a map of Items types
    vm.getItemTypes = () => {
      ItemTypeService.API.GetItemTypes()
        .then(response => {
          let model = "allTypes";
          $scope[model] = response.data;
          vm[model] = response.data;
          vm.createMap(model, "typesMap", "id");
          vm.prepareItemTypesPath();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get the hierarchy path of Item types
    vm.prepareItemTypesPath = () => {
      let pth = [];
      for (let i = 0; $scope.allTypes && i < $scope.allTypes.length; i++) {
        $scope.allTypes[i].tree_path_id === undefined ?
          ($scope.allTypes[i].tree_path_id = $scope.allTypes[i].tree_path) :
          null;
        let tree_path;
        if (
          !$scope.allTypes[i].tree_path ||
          $scope.allTypes[i].tree_path.split(">")[0] === "null" ||
          ($scope.allTypes[i].tree_path &&
            !isNaN(parseFloat($scope.allTypes[i].tree_path.split(">")[0])))
        ) {
          tree_path = vm.getTreePath(
            $scope.allTypes[i].item_type_id,
            $scope.allTypes[i].tree_path
          );
        }
        if (Array.isArray(tree_path) && tree_path.length > 0) {
          $scope.allTypes[i].tree_path = tree_path.join(">");
          vm.typesMap[$scope.allTypes[i].id].tree_path = tree_path.join(">");
        }
        if (i === $scope.allTypes.length - 1) {
          vm.getAllItemTypes();
        }
      }
    };

    // Get the MTO Options to create a map of MTO Options
    vm.getMTOOptions = () => {
      MTOService.API.GetMTOList()
        .then(response => {
          let model = "allMTOOptions";
          vm[model] = response.data.data;
          vm.createMap(model, "mtoOptionsMap", "id");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get the MTO Choices to create a map of MTO Choices
    vm.getMTOChoices = () => {
      MTOChoiceService.API.GetChoices()
        .then(response => {
          let model = "allMTOOptionChoices";
          vm[model] = response;
          vm.createMap(model, "mtoOptionChoicesMap", "id");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get the Vendors to create a map of Vendors
    // let getVendors = () => {
    //       let model = "allVendors";
    //       let vendors =  JSON.parse(common.SessionMemory.API.Get("vendorList"));
    //       $scope[model] = vendors;
    //       vm[model] = vendors;
    //       vm.vendorsMap = [];
    //       for (let i = 0; vendors && i < vendors.length; i++) {
    //         if (vm.vendorsMap[vendors[i].id] === undefined) {
    //           vm.vendorsMap[vendors[i].id] = vendors[i];
    //         }
    //       }
    //     }
    //   } else {
    //     VendorService.API.GetVendors()
    //       .then(response => {
    //         $scope[model] = [];
    //         vm[model] = [];
    //         _.each(response.data.data, response => {
    //           if (response.goods_allowed) {
    //             $scope[model].push(response);
    //             vm[model].push(response);
    //           }
    //         });
    //         common.SessionMemory.API.Post("vendorList", JSON.stringify(vm[model]));
    //       })
    //       .catch(error => {
    //         logger.error(error);
    //       });
    //   }
    // };


    // Get the Vendors to create a map of Vendors
    let getVendors = () => {
      let model = "allVendors";
      if (common.SessionMemory.API.Get("vendorList")) {
        let vendors = JSON.parse(common.SessionMemory.API.Get("vendorList"));
        $scope[model] = vendors;
        vm[model] = vendors;
        vm.vendorsMap = {};
        for (let i = 0; vendors && i < vendors.length; i++) {
          if (vm.vendorsMap[vendors[i].id] === undefined) {
            vm.vendorsMap[vendors[i].id] = vendors[i];
          }
        }
      } else {
        VendorService.API.GetVendors()
          .then(response => {
            $scope[model] = [];
            vm[model] = [];
            _.each(response.data.data, response => {
              if (response.goods_allowed) {
                $scope[model].push(response);
                vm[model].push(response);
              }
            });
            common.SessionMemory.API.Post("vendorList", JSON.stringify(vm[model]));
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

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

    // /*******Treepath Implementation ********/

    // Creating a map of hierarchy values based on id of Division,Department and Class respectively.
    vm.createHierarchyValuesMap = () => {
      vm.getItemTypes();
    };

    // Get the path of the respective Item using hierarchy path and hierarchy value id
    vm.getTreePath = (actualHierValId, path) => {
      let trimres = [];
      if (vm.itemTypeMaps && Object.keys(vm.itemTypeMaps).length > 0) {
        let tempVar = HierarchyValuesTreePathService.getTreePath(
          vm.itemTypeMaps,
          actualHierValId,
          path
        );
        var res = tempVar.split(">");
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
      } else if (!vm.itemTypeMaps) {
        TemplateService.API.GetNodes()
          .then(response => {
            // Key-value map of hierarchy value id and data
            vm.itemTypeMaps = JSON.parse(response.lookup);
            vm.getTreePath(actualHierValId, path);
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    // Checking for collections for Secleted item based on allow collection id
    vm.loadCollectionVal = (type_id, setCollection) => {
      ItemTypeService.API.SearchItemType("id", type_id)
        .then(response => {
          if (response.data.data[0].allow_collection_id === 1) {
            $scope.is_collection = true;
            setCollection === false ? null : ($scope.is_old_collection = true);
          } else {
            $scope.is_collection = false;
            setCollection === false ? null : ($scope.is_old_collection = false);
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // get system configuration settings by code
    vm.getSystemConfigurationSettings = (code) => {
      UserService.API.GetSystemConfigurationSettingsByCode(code)
        .then(response => {
          if (response && response.data) {
            if (code === "allow_collection_attributes") {
              $scope.allowCollectionDetails = JSON.parse(JSON.stringify(response.data[0]));
            }
          }
        })
        .catch(error => {
          console.info(error);
        });
    }

    // Get the Division (level 1) hierarchy values for the selected item type
    vm.setProductExplorerDivision = (typeId, isDepartment) => {
      $scope.uddValidationErrors = [];
      $scope.allDivisions = [];
      vm.isDivisionLoaded = false; //Set the selected item type ID from the given types map object
      $scope.head.item_type_id = vm.typesMap[typeId] ?
        vm.typesMap[typeId]["item_type_id"] :
        null;
      // Set variables for setting the division id and division short description
      let divisionId, division;
      $scope.head.selectedTreePathId === undefined && $scope.head.item_type_path ?
        ($scope.head.selectedTreePathId = $scope.head.item_type_path.split(
          ">"
        )) :
        null;
      $scope.head.selectedTreePath === undefined &&
        $scope.head.department_tree_path ?
        ($scope.head.selectedTreePath = $scope.head.department_tree_path.split(
          ">"
        )) :
        null;
      // If the selected tree path id array exists, the first tree path id in the array the division id
      // Else the selected item type id is the division id
      $scope.head.selectedTreePathId &&
        $scope.head.selectedTreePathId.length > 0 ?
        (divisionId = $scope.head.selectedTreePathId[0]) :
        (divisionId = $scope.head.item_type_id);
      // If the selected tree path array exists, the first tree path in the array the division
      // Else the selected item type is the division
      $scope.head.selectedTreePath && $scope.head.selectedTreePath.length > 0 ?
        (division = $scope.head.selectedTreePath[0]) :
        (division = vm.typesMap[typeId]["short_description"]);
      // Push the division object into the allDivisions array
      $scope.allDivisions = [{
        id: divisionId,
        short_description: division
      }];
      // Set the division model object id default to the divisionId set
      $scope.head.division_id = parseInt(divisionId);
      vm.setProductExplorerDepartment($scope.head.division_id, true);
      $timeout(() => {
        vm.isDivisionLoaded = true;
      }, 0);
    };

    // Get Department (Level 2) Hierarchy values for selected division
    vm.setProductExplorerDepartment = isClass => {
      $scope.head.department_id = null;
      $scope.allDepartments = [];
      vm.isDepartmentLoaded = false;
      vm.classes = [];
      vm.isClassLoaded = false;
      // If selected item is of level 2, then department will be same as selected item type
      if (
        vm.typesMap[$scope.head.type_id] &&
        vm.typesMap[$scope.head.type_id].level === 2
      ) {
        $scope.allDepartments.push({
          id: vm.typesMap[$scope.head.type_id].item_type_id,
          short_description: vm.typesMap[$scope.head.type_id].short_description
        });
        $scope.head.department_id =
          vm.typesMap[$scope.head.type_id].item_type_id;
        $scope.head.class = null;
      } else if (
        vm.typesMap[$scope.head.type_id] &&
        vm.typesMap[$scope.head.type_id].level >= 3
      ) {
        $scope.head.selectedTreePathId === undefined ?
          ($scope.head.selectedTreePathId = $scope.head.item_type_path.split(
            ">"
          )) :
          null;
        $scope.head.selectedTreePath === undefined ?
          ($scope.head.selectedTreePath = $scope.head.department_tree_path.split(
            ">"
          )) :
          null;
        // Else if selected item type is of level 3, department will be the parent of selected item type
        // Set variables for setting the division id and division short description
        let departmentId, department;
        // If the selected tree path id array exists, the first tree path id in the array the division id
        departmentId = $scope.head.selectedTreePathId[1];
        // If the selected tree path array exists, the first tree path in the array the division
        department = $scope.head.selectedTreePath[1];
        // Push the division object into the allDivisions array
        $scope.allDepartments = [{
          id: departmentId,
          short_description: department
        }];
        // Set the division model object id default to the divisionId set
        $scope.head.department_id = parseInt(departmentId);
        vm.setProductExplorerClass();
      } else {
        $scope.head.class = null;
      }
      $timeout(() => {
        vm.isDepartmentLoaded = true;
      }, 0);
    };

    // Get classes (level 3) PE hierarchy values for selected department
    vm.setProductExplorerClass = departmentId => {
      $scope.head.class = null;
      vm.classes = [];
      vm.isClassLoaded = false;
      if (vm.typesMap[$scope.head.type_id].level === 3) {
        // If selected item type is of level 3, class will be same as item type
        vm.classes = [{
          id: vm.typesMap[$scope.head.type_id].item_type_id,
          short_description: vm.typesMap[$scope.head.type_id].short_description
        }];
        $scope.head.class = vm.typesMap[$scope.head.type_id].item_type_id;
      } else if (vm.typesMap[$scope.head.type_id].level > 3) {
        $scope.head.selectedTreePathId === undefined ?
          ($scope.head.selectedTreePathId = $scope.head.item_type_path.split(
            ">"
          )) :
          null;
        $scope.head.selectedTreePath === undefined ?
          ($scope.head.selectedTreePath = $scope.head.department_tree_path.split(
            ">"
          )) :
          null;
        // Push the division object into the allDivisions array
        vm.classes = [{
          id: $scope.head.selectedTreePathId[2],
          short_description: $scope.head.selectedTreePath[2]
        }];
        // Set the division model object id default to the divisionId set
        $scope.head.class = parseInt($scope.head.selectedTreePathId[2]);
      }
      $timeout(() => {
        vm.isClassLoaded = true;
      }, 0);
    };

    // to get required information of code entity
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

    vm.getDynamicColumns = model => {
      let supportActions = {};

      let alterTitles = {
        primary_item_hierarchy_value_id: $scope.itemConfig.primary_item_hierarchy_desc
      };
      let drillTo = {};
      var itmMeta = generateDynamicTableColumnsService.getTableColumns(
        model,
        supportActions,
        alterTitles,
        drillTo
      );
      $scope.itmGroupByDropdown = itmMeta.dropdownList;
    };

    // Get model and set validation for item collection on open form trigger

    vm.getItemCollectionModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(
        Identifiers.item_collection
      )
        .then(model => { })
        .catch(error => {
          logger.error(error);
        });
    };

    // Fetch the image drops of items
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

    // Load thumbnail images using the response from getItemMetaData function.
    vm.loadThumbNailImages = size => {
      try {
        if (vm.itemsDataList) {
          for (let i = 0; i < vm.itemsDataList.length; i++) {
            if (vm.thumbnails) {
              let thumbnail = vm.thumbnails.filter(lake => {
                return lake.instance_id == vm.itemsDataList[i].id;
              });
              if (thumbnail[0]) {
                vm.itemsDataList[i].drop_id = thumbnail[0].drop_id;
                vm.itemsDataList[i].drop_type = thumbnail[0].drop_type;
                if (!thumbnail[0].url) {
                  if (
                    thumbnail[0].type &&
                    thumbnail[0].type.toLowerCase() === "virtual"
                  ) {
                    vm.itemsDataList[
                      i
                    ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                      thumbnail[0].drop_id,
                      "",
                      vm.uuid
                    );
                  } else {
                    vm.itemsDataList[
                      i
                    ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                      thumbnail[0].drop_id,
                      size,
                      vm.uuid
                    );
                  }
                } else if (thumbnail[0].url) {
                  vm.itemsDataList[i].thumbnail = thumbnail[0].url;
                }
              }
            }
          }
        }
      } catch (error) {
        logger.error(error);
      }
    };

    // Load image of the item in update screen
    vm.loadImage = (item, size) => {
      if (!item.drop_id || item.drop_id === undefined) {
        item.summaryThumbnail = undefined;
      } else if (!item.thumbnail) {
        item.summaryThumbnail =
          DataLakeAPIService.API.GetImageDownloadUrl(
            item.drop_id,
            size,
            vm.uuid
          ) || item.thumbnail;
      } else if (item.thumbnail) {
        item.summaryThumbnail = item.thumbnail;
      }
    };

    /** Functions to Show history side panel, load the activity history based on the Selected item id, and close history side panel **/
    vm.showHistoryDetails = data => {
      data.isLoadingHistory = true;
      if (vm.itemData !== undefined) {
        vm.itemData.showhistory = false;
      }
      vm.itemData = data;
      vm.itemData.showhistory = true;
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
          vm.itemData.isLoadingHistory = false;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
      $scope.isMaintenance = true;
      $scope.instanceName = null;
      if (vm.itemData !== undefined) {
        vm.itemData.showhistory = false;
      }
      $timeout(() => {
        angular.element("#item_history").focus();
      }, 1000);
    };

    // Fetch the instances for selected category to create the group headers
    vm.groupByData = groupByColumn => {
      return new Promise((resolve, reject) => {
        vm.isGroupHeader = false;
        vm.groupItems = [];
        vm.isGroupByApplied = true;
        vm.isFilterApplied === true ? (vm.isGroupByFilterApplied = true) : "";
        if (groupByColumn.length > 0) {
          /** ---------- Get items based on page and limit ----------
           * sort by field and order initially none and asc
           * may change according to the user customization
           * No parameter means, get all the records without any conditions.
           *
           * NOTE: First two undefined parameters are for page and limit AND third empty object is for filter
           */
          vm.groupByField = groupByColumn;
          vm.pagination();
          ItemService.API.GetItems(
            {},
            vm.filters,
            { field: vm.sortByField, order: vm.sortByOrder },
            { field: vm.groupByField }
          )
            .then(response => {
              vm.isGroupHeader = true;
              if (vm.groupByField == 'qualifier') {
                if (response.data.data.length > 0 && response.data.data.length == 1) {
                  if (response.data.data[0].qualifier == '') {
                    response.data.data = [];
                  }
                }
              }
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
                    vm.groupItems.push(response.data.data[i]);
                  } else {
                    response.data.data[i].selected = 1;
                    response.data.data[i].expanded = false;
                    vm.groupItems.push(response.data.data[i]);
                  }
                } else {
                  response.data.data[i].selected = 1;
                  response.data.data[i].expanded = false;
                  vm.groupItems.push(response.data.data[i]);
                }
              }
              resolve(response);
            })
            .catch(error => {
              reject(response);
              logger.error(error);
            });
        } else {
          vm.isGroupByFilterApplied = false;
          vm.scrollToPosition(0, 0);

          vm.isGroupByFilterApplied = false;
          vm.scrollToPosition(0, 0);
          vm.reload()
            .then(response => {
              if (vm.isFilterApplied) {
                vm.totalRecordCount = response.data.filterdRecordCount;
              } else {
                this.getItemsCount()
              }

              vm.availableItemsCount = vm.totalRecordCount - vm.itemsDataList.length;
              resolve(response);
            }).catch(error => {
              reject(error);
            });
        }
      });
    };

    vm.MapGroupItems = list => {
      for (let i = 0; i < list.length; i++) {
        if (vm.groupItemsMap[list[i].id] === undefined) {
          vm.groupItemsMap[list[i].id] = list[i];
        }
      }
    };

    // Show items for selected group header
    vm.showItemData = (groupByField, groupData) => {
      groupData.expanded = !groupData.expanded;
      groupData.isItemsLoaded = false;
      if (groupData.items === undefined) {
        vm.groupByValue = groupData[groupByField];
        groupData.groupPage = 1;
        vm.pagination();
        ItemService.API.GetItems(
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: groupByField, value: vm.groupByValue }
        )
          .then(res => {
            groupData.isItemsLoaded = true;
            if (res.data.data.length > 0) {
              groupData.items = res.data.data;
              groupData.availableGroupItems = groupData.count - res.data.data.length;
              vm.groupItemsMap = [];
              for (let i = 0; i < groupData.items.length; i++) {
                vm.fetchPrimaryHierarchyAndValue(groupData.items[i]);
                //vm.fetchFirstSkuByItem(groupData.items[i]);
              }
              vm.MapGroupItems(groupData.items);

              // load item cover images when items are grouped by field
              vm.getItemMetaData();
              vm.loadGroupByThumbNailImages("165x165", groupData.items);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        groupData.isItemsLoaded = true;
      }
    };

    // when click on expand all in group by panel, data for all group by items should be fetched
    vm.loadGroupDataOnExpandAll = groupByField => {
      let object = {
        [groupByField]: []
      };
      for (let i = 0; i < vm.groupItems.length; i++) {
        if (vm.groupItems[i].items === undefined) {
          object[groupByField].push(vm.groupItems[i][groupByField]);
        }
      }

      if (object[groupByField].length) {
        vm.groupPage = 1;
        ItemService.API.GroupByFieldAndValues(object, vm.groupPage, vm.limit)
          .then(response => {
            for (let i = 0; i < vm.groupItems.length; i++) {
              if (vm.groupItems[i].items === undefined) {
                vm.groupItems[i].items = $filter("filter")(
                  response,
                  vm.groupItems[i][groupByField]
                );
                vm.groupItems[i].availablegroupItems =
                  vm.groupItems[i].count - response.length;
                vm.originalItemsDataList = JSON.parse(
                  JSON.stringify(vm.groupItems[i].items)
                );
                vm.groupItems[i].groupPage = 1;
                vm.groupItems[i].isItemsLoaded = true;
              }
            }
            //vm.getItemTypePath(response); //get hierarchy values tree structure when items are grouped by field
            vm.loadGroupByThumbNailImages("165x165", response); // load sku cover images when items are grouped by field
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    // load next batch of records on click of load more button
    vm.loadMoreItemData = (groupByField, groupData) => {
      groupData.isMoreItemsLoaded = false;
      vm.groupByValue = groupData[groupByField];
      if (groupData[groupByField]) {
        groupData.groupPage = groupData.groupPage + 1;
        vm.pagination();
        ItemService.API.GetItems(
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: groupByField, value: vm.groupByValue }
        )
          .then(res => {
            let data = res.data.data || res.data;
            groupData.isMoreItemsLoaded = true;
            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                if (!vm.groupItemsMap[data[i].id]) {
                  vm.fetchPropertiesForAnItem(data[i]);
                  //vm.fetchFirstSkuByItem(data[i]);
                  groupData.items.push(data[i]);
                  vm.groupItemsMap[data[i].id] = data[i];
                }
              }
              groupData.availableGroupItems =
                groupData.count - groupData.items.length;
              vm.loadGroupByThumbNailImages("165x165", groupData.items);
              vm.setLimit();
              //vm.getItemTypePath(groupData.items);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    // Load images for selected group headers
    vm.loadGroupByThumbNailImages = (size, items) => {
      if (items) {
        for (let i = 0; i < items.length; i++) {
          let thumbnail = vm.thumbnails.filter(lake => {
            return lake.instance_id == items[i].id;
          });
          if (thumbnail[0]) {
            items[i].drop_id = thumbnail[0].drop_id;
            items[i].drop_type = thumbnail[0].drop_type;
            if (!thumbnail[0].url) {
              items[i].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                thumbnail[0].drop_id,
                size,
                vm.uuid
              );
            } else if (thumbnail[0].url) {
              items[i].thumbnail = thumbnail[0].url;
            }
          }
        }
      }
    };

    // Function to get preview
    vm.getDownloadUrl = (url, downloadUrl) => {
      if (!downloadUrl) {
        return DataLakeAPIService.API.GetDownloadUrl(url, vm.uuid);
      } else {
        return downloadUrl;
      }
    };
    $scope.getUrlExtension = (url) => {
      return url
        .split(/[#?]/)[0]
        .split(".")
        .pop()
        .trim();
    }

    $scope.$nImageEdit = async () => {
      let imgUrl = ""
      var imgExt = getUrlExtension(imgUrl);

      const response = await fetch(imgUrl);
      const blob = await response.blob();
      cons
      const file = new File([blob], "profileImage." + imgExt, {
        type: blob.type,
      });
    }

    /// Group by Panel: Select or Unselect all the item groups
    vm.toggleAllGroups = isSelectAll => {
      for (let i = 0; i < vm.groupItems.length; i++) {
        if (isSelectAll) {
          vm.groupItems[i].selected = 1;
        } else {
          vm.groupItems[i].expanded = false;
          vm.groupItems[i].items = undefined; //remove data from group after Unselect all
          vm.groupItems[i].selected = 0;
        }
      }
    };

    // Toggle group headers
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
        for (let i = 0; i < vm.groupItems.length; i++) {
          vm.groupItems[i].isItemsLoaded = undefined;
        }
      } else {
        vm.selectedGroupHeader.push(gc);
      }
      gc.expanded = false;
    };

    //// Function to set buyer for item in create/update
    vm.setVendor = () => {
      if (!$scope.updateForm) {
        $scope.head.vendor_id = vm.selectedVendor.id;
        $scope.head.vendor_reorder = vm.selectedVendor.vendor_reorder;
      } else if ($scope.updateForm) {
        if (
          $scope.head.vendor.id &&
          $scope.originalMatser.vendor_id !== $scope.head.vendor_id
        ) {
          $scope.head.vendor_reorder =
            vm.vendorsMap[$scope.head.vendor.id].vendor_reorder;
        }
      }
    };

    // Load collections based on selected vendor id
    vm.loadCollections = vendor_id => {
      vm.isCollectionForDropdownLoaded = false;
      $scope.vendor_id = vendor_id;
      ItemCollectionService.API.SearchVendorCollections("vendor_id", vendor_id)
        .then(res => {
          vm.allCollections = res.data.data;
          // map collection
          vm.createMap("allCollections", "collectionsMap", "collection_id");
          $timeout(() => {
            if ($scope.allowCollectionDetails && $scope.allowCollectionDetails.yes_or_no) {
              $scope.head.collection_id = Number($scope.head.collection_id);
              $scope.head.old_collection_id = $scope.head.collection_id;
              vm.isCollectionForDropdownLoaded = true;
            } else {
              if ($scope.head.collection_id) {
                let collection_ids = String($scope.head.collection_id).split(",").map(Number);
                $scope.head.selectedCollection = [];
                $scope.head.collection = "";
                for (let index = 0; index < collection_ids.length; index++) {
                  if (vm.collectionsMap[collection_ids[index]]) {
                    $scope.head.selectedCollection.push(vm.collectionsMap[collection_ids[index]]);
                    if (index == 0) {
                      $scope.head.collection += vm.collectionsMap[collection_ids[index]].collection;
                    } else {
                      $scope.head.collection += `, ${vm.collectionsMap[collection_ids[index]].collection}`;
                    }
                  }
                }
              }
              vm.isCollectionForDropdownLoaded = true;
            }
          }, 100);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // To show the Item hierarchy like Division/Department/Class
    vm.loadPrimaryHierarchy = () => {
      // Fetch hierarchy based on primary item hierarchy id
      HierarchyService.API.SearchHierarchy("is_primary_item_hierarchy_id", 1)
        .then(res => {
          vm["itemConfig"] = res[0];
          $scope["itemConfig"] = res[0];
          $scope.itemConfig.primary_item_hierarchy_id = res[0].id;
          $scope.itemConfig.primary_item_hierarchy_desc = res[0].description;
          vm.getBuyerHierarchyValues();
          // Fetch the hierarchy values for each item based on the primary item hierarchy id in hierarchy values
          HierarchyValueService.API.SearchHierarchyValue(
            "hierarchy_id",
            $scope.itemConfig.primary_item_hierarchy_id
          )
            .then(res => {
              $scope.primary_item_hierarchy_data = {};
              $scope.primary_item_hierarchy_data[
                $scope.itemConfig.primary_item_hierarchy_id
              ] = res;
              vm.isPrimaryHierarchyLoaded = true;
              vm.reload()
                .then(() => { })
                .catch(error => {
                  logger.error(error);
                });
            })
            .catch(err => { });
          vm.getModelAndSetValidationRules();
        })
        .catch(err => logger.error(err));
    };

    // Fetch buyer hierarchy from hierarchy values based on buyer hierarchy id
    vm.getBuyerHierarchyValues = () => {
      HierarchyValueService.API.SearchHierarchyValue("is_buyer_hierarchy", "1")
        .then(res => {
          vm.buyerValues = res;
          $scope.itemConfig.buyer_hierarchy_id = res[0].hierarchy_id;
          $scope.itemConfig.buyer_hierarchy_desc = res[0].hierarchy;
          vm.buyerIdsMap = {};
          for (let i = 0; i < res.length; i++) {
            if (vm.buyerIdsMap[res[i].id] === undefined) {
              vm.buyerIdsMap[res[i].id] = res[i];
            }
          }
        })
        .catch(err => { });
    };

    // Get item parameters such as Status used to create items,status code,and its relevant id
    vm.getItemParameters = () => {
      // vm.editStatusRole = false;
      ItemParameterService.API.GetItemParameter()
        .then(response => {
          // let statusrole = vm.roles.filter(role => role.role_id == 41);
          // if (statusrole?.length) vm.editStatusRole = true;
          // else vm.editStatusRole = false;
          if (response.data[0].status_id !== 200) {
            vm.disableActions = true;
          } else {
            vm.disableActions = false;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Scroll bar will be pointed to (x, y) position
    vm.scrollToPosition = (x, y) => {
      window.scrollTo(x, y);
    };

    // Sets current pagination variables
    vm.pagination = () => {
      vm.resetUnusedFiltersArrays();
      if (vm.sortByField === "") {
        vm.sortByField = "none";
        vm.sortByOrder = "desc";
      }
      if (vm.groupByField === "") {
        vm.groupByValue = null;
      }
    };

    vm.reload = refresh => {
      return new Promise((resolve, reject) => {
        $scope.selectedRow = null;
        vm.groupByField = "";
        vm.page = 1;
        vm.groupItems = [];
        vm.isLoaded = false;
        vm.isAllLoaded = false;
        vm.isGroupByApplied = false;
        if (refresh !== undefined) {
          //On click of refresh button, a message bar with information will be toggled in UI
          vm.totalTimeText = "";
          vm.isRefreshing = true;
          // vm.getVendors();
          vm.refreshTableText = "Refreshing list...";
        }
        vm.pagination();
        /** ---------- Get items based on page and limit ----------
         * Filter object is undefined (third parameter)
         * sort by field and order initially none and asc
         * may change according to the user customization
         * No parameter means, get all the records without any conditions.
         */
        ItemService.API.GetItems(
          { page: vm.page, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
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
            vm.recordsCount = response.data.data.length;
            vm.itemsDataList = response.data.data;
            vm.isLoaded = true;
            vm.isAllLoaded = true; // To load item data
            vm.availableItemsCount = vm.totalRecordCount - response.data.data.length;
            vm.originalItemsDataList = JSON.parse(JSON.stringify(vm.itemsDataList));
            for (
              let i = 0; vm.itemsDataList && i < vm.itemsDataList.length; i++
            ) {
              vm.fetchPropertiesForAnItem(vm.itemsDataList[i]);
              if (i === vm.itemsDataList.length - 1) {
                //removed for now to reslove load D/D/C issue
                // $stateParams.id && $state.current.name.includes(".update") ?
                //   vm.gotoUpdateState() :
                //   "";

                // for (let j = 0; vm.itemsDataList && j < vm.itemsDataList.length; j++) {
                //   vm.fetchFirstSkuByItem(vm.itemsDataList[j]);
                // }
                vm.getItemMetaData();
                vm.fetchFeatureAccessDetails();
              }
            }
            vm.loadThumbNailImages("165x165");
            localStorage.removeItem("ItemPageCount");
            vm.MapItems(vm.itemsDataList);
            vm.getPermissionsForUuid("skuByItemPermissions", Identifiers.sku_master);
            if (vm.isFilterApplied) {
              vm.totalRecordCount = response.data.filterdRecordCount;
            }
            resolve(response);
          })
          .catch(error => {
            vm.isRefreshing = true;
            vm.refreshTableText = "Unsuccessfull!";
            vm.isLoaded = true;
            vm.isAllLoaded = true;
            reject(error);
            logger.error(error);
            $timeout(() => {
              vm.isRefreshing = false;
            }, 3500);
          });
        $timeout(() => {
          angular.element("#inlineSearch").focus();
        }, 3500);
      });
    };

    /**
     * Create Map of items based on Item id
     * Item of mapped id return the data of item
     */
    vm.MapItems = Items => {
      vm.ItemMap = [];
      for (let i = 0; i < Items.length; i++) {
        if (vm.ItemMap[Items[i].id] === undefined) {
          vm.ItemMap[Items[i].id] = Items[i];
        }
      }
    };

    /**
     * Load more next set of items as per specified limit and page count
     */
    vm.loadMoreItems = () => {
      vm.isLoading = true;
      vm.page = parseInt(LocalMemory.API.Get("ItemPageCount")) || 1;
      vm.pagination();
      // Check if not filters are applied fetch next 20 item records
      if (!vm.isFilterApplied) {
        ItemService.API.GetItems(
          { page: vm.page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            /**
             * If items fetched is greater than 0
             * Get images related to fetched items
             */
            if (response.data.data.length > 0) {
              for (let i = 0; i < response.data.data.length; i++) {
                vm.itemsDataList.push(response.data.data[i]);
                vm.originalItemsDataList.push(response.data.data[i]);
                this.fetchPropertiesForAnItem(response.data.data[i]);
                //vm.fetchFirstSkuByItem(response.data.data[i]);
                vm.ItemMap[response.data.data[i].id] = response.data.data[i];
              }
              vm.availableItemsCount =
                vm.totalRecordCount - vm.originalItemsDataList.length;
              vm.setLimit();
              // If more items are loaded increment the page count by 1 and save in local memory
              LocalMemory.API.Post("ItemPageCount", vm.page + 1);
              // If search filter is applied, return result matching search filter
              if (vm.searchItems) {
                $scope.showhistory = false;
                vm.itemsDataList = $filter("filter")(
                  vm.originalItemsDataList,
                  vm.searchItems
                );
              }
              vm.getItemMetaData();
              vm.isLoading = false;
            } else {
              vm.availableItemsCount = 0;
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        // If filters are applied fetch next 20 item records matching filtered records
        ItemService.API.GetItems(
          { page: vm.page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (response.data.data.length > 0) {
              for (let i = 0; i < response.data.data.length; i++) {
                vm.itemsDataList.push(response.data.data[i]);
                this.fetchPropertiesForAnItem(response.data.data[i]);
                // vm.fetchFirstSkuByItem(response.data.data[i]);
              } !vm.isGroupByFilterApplied ?
                (vm.availableItemsCount =
                  vm.totalRecordCount - vm.itemsDataList.length) :
                "";
              vm.isLoading = false;
              vm.setLimit(500);
              LocalMemory.API.Post("ItemPageCount", vm.page + 1);
              vm.getItemMetaData();
            }
          })
          .catch(error => {
            vm.isLoading = false;
            logger.error(error);
          });
      }
    };

    vm.watchers = () => {
      /** searching Item Data List */
      $scope.$watch("itemMaintCtrl.searchItems", (searchValue, o) => {
        $scope.showhistory = false;
        vm.itemsDataList = $filter("filter")(
          vm.originalItemsDataList,
          searchValue
        );
      });
    };

    // Function to get all product assortment labels available
    vm.fetchAssortmentLabels = () => {
      SKUService.API.GetAssortmentLabels()
        .then(response => {
          vm.assortmentLabels = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Function to get all product assortment labels available
    vm.fetchAssortmentHierarchies = () => {
      HierarchyValueService.API.SearchHierarchyValue(
        "is_assortment_classification_group",
        1
      )
        .then(response => {
          vm.productAssortments = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.gotoEntity = entityName => {
      //todo
      if (entityName && entityName.toLowerCase() === "skumaster") {
        vm.showskugrid = true;
        vm.drillToSKUs = true;
        vm.showitemmaintenance = false;
      } else if (entityName && entityName.toLowerCase() === "retailmaster") {
        vm.drillToSKUs = false;
        vm.drillToRetails = true;
        vm.showitemmaintenance = false;
      } else if (entityName && entityName.toLowerCase() === "itemmaster") {
        vm.drillToSKUs = false;
        vm.drillToRetails = false;
        vm.showitemmaintenance = true;
        $scope.setEntityScreen = "Item";
        vm.initializeItemUserDefinedDataDirective();
      }
    };

    vm.goToClonePanel = item => {
      item.isLoadingClone = true;
      item.description.includes("Clone") || item.description.includes("clone") ?
        "" :
        $state
          .go("common.prime.itemMaintenance.clone", {
            id: item.id
          })
          .then(() => {
            common.$timeout(() => {
              item.isLoadingClone = false;
            }, 0);
          });
    };

    vm.goToClonePanelFromItemPublish = itemId => {
      vm.isCloneItemcreate = true;
      ItemService.API.StoreVariable("item_id", itemId);
    };

    vm.gotoSKU = selectedItem => {
      selectedItem.isLoadingMaintainSku = true;
      $state.go("common.prime.itemMaintenance.sku", {
        item_id: selectedItem.id,
        item: selectedItem
      });

      vm.createStage = false;
      vm.createForm = false;
      vm.configureStage = false;
      vm.configureItemVendorStage = false;
      vm.configureItemVendorScreen = false;
      vm.previewandpublishStage = false;
      vm.configureScreen = false;
      vm.itemSetForm = false;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
      vm.confirmDelete = false;
    };

    vm.viewSkuDetails = sku => {
      $state.go("common.prime.itemMaintenance.sku.update", {
        item_id: sku.item_id,
        id: sku.id,
        skutype: sku.sku_type.toLowerCase(),
        subtype: sku.sku_sub_type.toLowerCase()
      });
    };

    vm.exit = () => {
      // Variable to set the validation to false if the required validation is met
      vm.isInvalidForm = false;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      // $window.history.back();
      // To check the height of the header and set the data list margin top accordingly
      vm.showFilter ? vm.openAdvancedSearchPanel() : null;
      // empty the variable which holds available sku
      vm.availableSkus = {};
      vm.selectedVendor = undefined;
      vm.isSkuLoaded = false;
      vm.configureScreen = false;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
      vm.itemSetForm = false;
      vm.itemdataAddToQueueError = false;
      vm.configureItemVendorScreen = false;
      vm.showLockedScreenStatus = false;
      vm.LoadingSecndryAuth = false;
      $state.go("common.prime.itemMaintenance");
    };

    vm.onReload = () => {
      $timeout(() => {
        vm.reload(true);
      }, 1000);
    }

    // Hidding the code as it is not completely functional for maintain retail //

    // vm.gotoRetail = selectedItem => {
    //   selectedItem.isLoadingMaintainRetail = true;
    //   $state.go("common.prime.itemMaintenance.retail", {
    //     item_id: selectedItem.id,
    //     item: selectedItem
    //   });
    // };

    vm.setInitialState = entityName => {
      // Variable to show the Published review section.
      vm.publishResponseMessage = false;
      if (entityName.toLowerCase() === "itemcollections" && entityName) {
        $timeout(() => {
          angular.element("#short_description").focus();
        }, 0);
      } else if (entityName.toLowerCase() === "optionlist" && entityName) {
        $timeout(() => {
          angular.element("#name").focus();
        }, 0);
      } else {
        // console.log("Entity name is defined", entityName);
      }
    };

    vm.populateDescription = () => {
      $scope.autoPopulate = true;
      vm.setItemDescription($scope.head);
    };

    vm.setItemDescription = record => {
      if ($scope.autoPopulate && !vm.isDescriptionChanged) {
        if (record === undefined) {
          record = _.clone($scope.head);
        }
        var collectionName = "";
        var qualifier = "";
        var primaryInfo = "";
        if (
          record.collection_id !== undefined &&
          record.collection_id !== null
        ) {
          if (vm.collectionsMap[record.collection_id] !== undefined) {
            collectionName =
              vm.collectionsMap[record.collection_id]["collection"] + " ";
          } else {
            collectionName = record.collection;
          }
        }

        if ($scope.primary_item_hierarchy_obj !== undefined) {
          primaryInfo = $scope.primary_item_hierarchy_obj.short_description;
        }

        if (record.qualifier !== undefined && record.qualifier !== null) {
          qualifier = record.qualifier;
        }

        primaryInfo =
          collectionName || qualifier ? ` - ${primaryInfo}` : primaryInfo;

        if (!vm.isDescriptionChanged) {
          if (collectionName && !qualifier) {
            record.description = `${collectionName} ${primaryInfo}`;
          }
          if (!collectionName && qualifier)
            record.description = `${qualifier} ${primaryInfo}`;
        }
        if (!collectionName && !qualifier) {
          record.description = `${primaryInfo}`
        } else {
          record.description = `${collectionName} ${qualifier} ${primaryInfo}`
        }
        vm.duplicateItemCheck($scope.head.type_id, $scope.head.description);
      }
    };

    vm.onCollectionChange = () => {
      $timeout(() => {
        if ($scope.allowCollectionDetails && $scope.allowCollectionDetails.yes_or_no) {
          $scope.head.collection_id = Number($scope.head.collection_id);
          let collectionObject = vm.collectionsMap[$scope.head.collection_id];
          if (collectionObject) {
            $scope.head.collection = collectionObject.collection;
          }
        } else if ($scope.head.selectedCollection) {
          $scope.head.collection_id = "";
          $scope.head.collection = "";
          for (let index = 0; index < $scope.head.selectedCollection.length; index++) {
            if (index < $scope.head.selectedCollection.length - 1) {
              $scope.head.collection_id += `${$scope.head.selectedCollection[index].collection_id},`;
              $scope.head.collection += `${$scope.head.selectedCollection[index].collection}, `;
            } else {
              $scope.head.collection_id += `${$scope.head.selectedCollection[index].collection_id}`;
              $scope.head.collection += `${$scope.head.selectedCollection[index].collection}`;
            }
          }
        }
      }, 500);
    }

    // function to toggle customised dropdown
    vm.toggleCollectionDropdown = () => {
      $timeout(() => {
        if (vm.openCollectionDropdown || vm.openCollectionDropdown == undefined) {
          $('.ui-select-container#collectionDropdown').scope().$select.open = true;
          vm.openCollectionDropdown = false;
        } else {
          $('.ui-select-container#collectionDropdown').scope().$select.open = false;
          vm.openCollectionDropdown = true;
        }
      }, 0);
    }

    vm.createAgain = () => {
      $scope.head = {};
      vm.createStage = true;
      vm.createForm = true;
      vm.configureStage = false;
      vm.configureItemVendorStage = false;
      vm.configureItemVendorScreen = false;
      vm.previewandpublishStage = false;
      vm.configureScreen = false;
      vm.itemSetForm = false;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
      vm.confirmDelete = false;
      vm.initializeForm();
      ItemService.API.StoreVariable("selectedItem", {});
      vm.showitemmaintenance = false;
      $scope.updateForm = false;
      vm.itemmaintenancegrid = false;
      $scope.edit_master_id = "";
      vm.showDetails = true;
      vm.$showAdd = true;
      $scope.parent_id = null;
      $scope.buyer_hierarchy_value_id = null;
      $scope.is_collection = false;
      $scope.autoPopulate = true;
      $scope.effective_val = false;
      $scope.head.status_effective_date = moment()
        .utcOffset("0")
        .format($scope.date_format);
      vm.setDefaultStatuses(); /// function to set status and next status by default on open of new form
      $scope.head.vendor = {};
      $stateParams.type && $stateParams.type.toLowerCase() === "item" ?
        ($scope.head.item_sub_type = "Item") :
        ($scope.head.item_sub_type = "Set");
      // Variable to show the Published review section.
      vm.publishResponseMessage = false;
      /* variables to reset the Notification message-start */
      $scope.itemSuccessMessage = null;
      $scope.itemErrorMessage = null;
      $scope.itemUDDSuccessMessage = null;
      vm.showItemSelectionModal();
    };

    vm.setDefaultStatuses = () => {
      $scope.head.status_id = 100;
      $scope.head.status = "Pending Active";
      $scope.head.next_status_id = 500;
      $scope.head.next_status = "None";
    };

    vm.showItemSelectionModal = () => {
      if ($scope.permissionsMap.create) {
        $scope.updateScreen = false;
        $("#itemSelectionModel").modal("show");
      }
    };

    vm.resetForm = () => {
      vm.itemCol_details = {};
      vm.itemCol_details["short_description"] = null;
    };

    vm.initializeForm = () => {
      vm.getAttributeValues();
      vm.getMTOOptions();
      vm.getMTOChoices();
      vm.createHierarchyValuesMap();
      // Get permissions for item collections screen
      vm.getPermissionsForUuid(
        "itemCollectionPermissions",
        Identifiers.item_collection
      );
    };

    vm.NewItem = subType => {
      // vm.editStatusRole = false;
      vm.selectedVendor = null;
      vm.duplicateVendorMessage = null;
      vm.isPrimaryVendorLinked = undefined;
      $scope.head = {};
      vm.isCloned = false;
      vm.duplicateItemExist = false;
      vm.showDuplicateItems = false;
      // let statusrole = vm.roles.filter(role => role.role_id == 41);
      // if (statusrole?.length) vm.editStatusRole = true;
      // else vm.editStatusRole = false;
      // Variable to show the Published review section.
      if ($stateParams.type && $stateParams.type === subType.toLowerCase()) {
        vm.openForm("itemmaster");
      } else {
        vm.publishResponseMessage = false;
        $state.go("common.prime.itemMaintenance.new", {
          type: subType.toLowerCase()
        });
      }
    };

    vm.duplicateItemCheck = (typeId, description, itemId) => {
      if (typeId && description && this.selectedVendor) {
        ItemService.API.DuplicateItemCheck(typeId, description, this.selectedVendor.id)
          .then(result => {
            if (result && result.length > 0) {
              vm.duplicateItemList = result;
              if (itemId) {
                for (let i = 0; i < vm.duplicateItemList.length; i++) {
                  if (vm.duplicateItemList[i].id === itemId) {
                    vm.duplicateItemList.splice(vm.duplicateItemList[i], 1);
                  }
                }
                if (vm.duplicateItemList.length > 0) {
                  vm.duplicateItemExist = true;
                } else {
                  vm.duplicateItemList = undefined;
                  vm.duplicateItemExist = false;
                  vm.showDuplicateItems = false;
                }
              } else {
                vm.duplicateItemExist = true;
              }
            } else {
              vm.duplicateItemList = result;
              vm.duplicateItemExist = false;
              vm.showDuplicateItems = false;
            }
          })
          .catch(error => logger.error(error));
      }
    };

    vm.fetchItemTypeByGraph = (typeId) => {
      // isBuyerLoaded is used as flag to reload the buyer field.
      vm.isBuyerLoaded = false;
      EntityDetails.API
        .GetGraphSet(common.Identifiers.item_type, ["id", "default_buyer_id"], "id", typeId)
        .then(response => {
          $scope.head.buyer_id = response.data[0].default_buyer_id;
          vm.isBuyerLoaded = true;
        })
        .catch(error => logger.error(error));
    };

    vm.UpdateItem = data => {
      // vm.editStatusRole = false;
      if (vm.itemPermissions.update) {
        vm.item_details = data;
        $scope.updateScreen = true;
        data.isShowUpdateProcessing = true;
        $scope.head = vm.ItemMap[data.id];
        // let statusrole = vm.roles.filter(role => role.role_id == 41);
        // if (statusrole?.length) vm.editStatusRole = true;
        // else vm.editStatusRole = false;
        $timeout(() => {
          $state
            .go("common.prime.itemMaintenance.update", {
              type: data.item_sub_type.toLowerCase(),
              id: data.id
            })
            .then(() => {
              data.isShowUpdateProcessing = false;
            });
        }, 0);
      }
    };

    vm.openForm = (entityName, mode) => {
      vm.$isUpdate = false;
      vm.isDivisionLoaded = true;
      vm.isDepartmentLoaded = true;
      vm.opdone = false;
      vm.message = null;
      vm.itemVendors = [];
      vm.itemVendorIds = [];
      $scope.queuedDrops = [];
      $scope.uddValidationErrors = [];
      vm.duplicateVendorMessage = null;
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      $("#itemSelectionModel").modal("hide");
      if (
        entityName &&
        entityName.toLowerCase() === "itemmaster" &&
        !vm.disableActions
      ) {
        $scope.head = {};
        $scope.allDivisions = [];
        $scope.allDepartments = [];
        vm.classes = [];
        $scope.primary_item_hierarchy_obj = {};
        vm.createStage = true;
        vm.createForm = true;
        vm.configureStage = false;
        vm.configureItemVendorStage = false;
        vm.configureItemVendorScreen = false;
        vm.previewandpublishStage = false;
        vm.configureScreen = false;
        vm.itemSetForm = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.confirmDelete = false;
        vm.initializeForm();
        vm.ChangestatusFeature();
        ItemService.API.StoreVariable("selectedItem", {});
        vm.showitemmaintenance = false;
        $scope.updateForm = false;
        vm.itemmaintenancegrid = false;
        $scope.edit_master_id = "";
        vm.showDetails = true;
        vm.$showAdd = true;
        $scope.parent_id = null;
        $scope.buyer_hierarchy_value_id = null;
        $scope.is_collection = false;
        $scope.autoPopulate = true;
        $scope.effective_val = false;
        $scope.head.status_effective_date = moment()
          .utcOffset("0")
          .format($scope.date_format);
        vm.setDefaultStatuses(); /// function to set status and next status by default on open of new form
        $scope.head.vendor = {};
        $stateParams.type && $stateParams.type.toLowerCase() === "item" ?
          ($scope.head.item_sub_type = "Item") :
          ($scope.head.item_sub_type = "Set");
        // Variable to show the Published review section.
        vm.publishResponseMessage = false;
        /* variables to reset the Notification message-start */
        $scope.itemSuccessMessage = null;
        $scope.itemErrorMessage = null;
        $scope.itemUDDSuccessMessage = null;
        /* variables to reset the Notification message-end */
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
        vm.resetModel();
        $timeout(() => {
          angular.element("#description").focus();
        }, 1000);
      } else if (
        entityName &&
        entityName.toLowerCase() === "itemcollections" &&
        !vm.disableActions
      ) {
        vm.getItemCollectionModelAndSetValidationRules();
        if ($scope.updateForm === true) {
          vm.$isUpdate = true;
        }
        vm.$savesuccess = false;
        vm.$showCollDetails = true;
        vm.itemCol_details = {};
        vm.itemCol_details["short_description"] = null;
        vm.itemCol_form.$setPristine();
        vm.setInitialState(entityName);
        vm.resetForm();
      }
    };

    vm.focusVendorField = () => {
      $timeout(() => {
        angular.element("#selectedVendor").focus();
      }, 2000);
    }

    vm.focusCollection = () => {
      $timeout(() => {
        angular.element("#collection_id").focus();
      }, 2000);
    }

    vm.focusCloneItemPublish = () => {
      $timeout(() => {
        angular.element("#clone_item_publish").focus();
      }, 1000);
    }

    vm.focusMasterNext = () => {
      $timeout(() => {
        angular.element("#master_next").focus();
      }, 1000);
    }

    vm.focusVendorConficNext = () => {
      $timeout(() => {
        angular.element("#ven_conf_next").focus();
      }, 1000);
    }

    vm.focusUddNext = () => {
      $timeout(() => {
        angular.element("#udd_next").focus();
      }, 1000);
    }

    vm.focusDocumentNext = () => {
      $timeout(() => {
        angular.element("#doc_next").focus();
      }, 1000);
    }

    vm.focusDepDetail = () => {
      $timeout(() => {
        angular.element("#dep_detail").focus();
      }, 1000);
    }

    vm.createAnotherForm = entityName => {
      if (
        entityName &&
        entityName.toLowerCase() === "itemcollections" &&
        !vm.disableActions
      ) {
        vm.$savesuccess = false;
        vm.$saveCollBtnText = "Save";
        vm.$showCollDetails = true;
        vm.itemCol_details = {};
        vm.itemCol_details.collection_status_id =
          vm.previousC.collection_status_id;
        $timeout(() => {
          angular.element("#short_description").focus();
        }, 500);
      } else if (entityName && entityName.toLowerCase() === "optionlist") {
        vm.$showOLDetails = true;
        vm.$saveOLBtnText = "Save";
        vm.$savesuccess = false;
        vm.optList_details = {};
        vm.optList_details.status_id = vm.previousOL.status_id;
      }
    };

    vm.closeForm = entityName => {
      if (entityName && entityName.toLowerCase() === "itemmaster") {
        vm.itemmaintenancegrid = true;
        vm.showitemmaintenance = true;
        vm.showDetails = false;
        vm.savedToMasterList = false;
        vm.drillToSKUs = false;
        vm.drillToRetails = false;
        vm.$showErrorDetailsData = false;
        vm.$showErrorDetails = false;
        vm.$updateBtnText = "Update";
        vm.$updatebtnerror = false;
      } else if (entityName && entityName.toLowerCase() === "itemcollections") {
        vm.$showCollDetails = false;
        $timeout(() => {
          angular.element("#add_collection").focus();
        }, 500);
      } else if (entityName && entityName.toLowerCase() === "linkedvendor") {
        vm.$showErrorDetails = false;
        $timeout(() => {
          angular.element("#dep_detail").focus();
        }, 500);
      }
    };

    vm.focusAddCollection = () => {
      $timeout(() => {
        angular.element("#add_collection_panel").focus();
      }, 500);
    }

    vm.focusChangeItemType = () => {
      $timeout(() => {
        angular.element("#close_change_type").focus();
      }, 1000);
    }

    $scope.effective_val = true;
    $scope.changeevent = item => {
      if (item.next_status_id === 500) {
        $scope.effective_val = false;
        $scope.head.next_effective_date = '';
      } else {
        $scope.effective_val = true;
      }
    };

    vm.treeViewPanels = [];
    vm.toggleTreeViewPanel = data => {
      vm.selectedTreeValueData = data.selectedHierarchyValue;
      if (vm.treeViewPanels[data.primaryHierarchyId] === undefined) {
        vm.treeViewPanels[data.primaryHierarchyId] = data;
      }

      for (let i = 0; i < Object.keys(vm.treeViewPanels).length; i++) {
        if (vm.treeViewPanels[data.primaryHierarchyId] && !data.currentFlag) {
          delete vm.treeViewPanels[data.primaryHierarchyId];
        }
      }

      /// Importatnt: if hierarchy value is reset in advance search panel then remove same from filters object
      if (
        !data.isReset &&
        vm.old_filters &&
        "primaryItemHierarchyValueId" in vm.old_filters
      ) {
        vm.filters.primaryItemHierarchyValueId =
          $scope.primary_item_hierarchy_value_id;
      }

      //if filter is applied with primary hierarchy fields
      if (
        data.isReset &&
        !$state.current.name.includes(".new") &&
        !$state.current.name.includes(".update")
      ) {
        /// If primary hierarchy is reset then remove value from filters payload
        if (
          data.primaryHierarchyId ===
          $scope.itemConfig.primary_item_hierarchy_id
        ) {
          delete vm.filters.primaryHierarchyId;
        }
      }

      if (Object.keys(vm.treeViewPanels).length === 0) {
        vm.showTreeViewPanel = false;
      } else {
        vm.showTreeViewPanel = true;
      }
    };

    vm.loadCollectionsForMultipleVendors = () => {
      if (vm.filters.vendorIds.length > 0) {
        ItemCollectionService.API.FetchCollectionsForMultipleVendors(
          vm.filters.vendorIds
        )
          .then(res => {
            let collectionIdMap = new Map();
            for (let i = 0; i < res.data.length; i++) {
              if (collectionIdMap[res.data[i].collection_id] === undefined) {
                res.data[i].id = res.data[i].collection_id;
                res.data[i].short_description = res.data[i].collection;
                collectionIdMap[res.data[i].collection_id] =
                  res.data[i].collection_id;
              }
            }
            vm.itemCollections = res.data;
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        vm.fetchCollections();
      }
    };

    // Fetch all item collections on load of search panel
    vm.fetchCollections = () => {
      ItemCollectionService.API.GetItemCollections()
        .then(response => {
          vm.itemCollections = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.isPrimaryHierarchySearch = () => {
      if (
        vm.filters !== undefined &&
        Object.keys(vm.filters).length > 0 &&
        (vm.filters.primaryItemHierarchyValueId == undefined ||
          vm.filters.primaryItemHierarchyValueId == null)
      ) {
        delete vm.filters.primaryItemHierarchyValueId;
        $scope.head.primary_item_hierarchy_value_id = null;
        $scope.primary_item_hierarchy_value_id = null;
      }
    };

    // To apply filter based on the selected values in a assortment filter using id associated for each assortment group, label and value selected in the column
    vm.applyAssortmentValueFilters = (assortment_group_id, label, value) => {
      if (value === 1) {
        let tempAssortmentFilterArray = _.clone(vm.filters.assortmentFilters);
        tempAssortmentFilterArray === undefined ?
          (tempAssortmentFilterArray = []) :
          null;
        tempAssortmentFilterArray.push({
          assortment_group_id,
          label
        });
        vm.filters.assortmentFilters = _.clone(tempAssortmentFilterArray);
      } else {
        let tempAssortmentFilterArray = _.clone(vm.filters.assortmentFilters);
        tempAssortmentFilterArray = _.filter(
          tempAssortmentFilterArray,
          assortmentFilter => {
            if (
              !(
                assortment_group_id === assortmentFilter.assortment_group_id &&
                label === assortmentFilter.label
              )
            ) {
              return assortmentFilter;
            }
          }
        );
        vm.filters.assortmentFilters = _.clone(tempAssortmentFilterArray);
      }
    };

    // Function keep assorment fields checked after going to skus from item and coming back after applying item assortment filters
    vm.checkAssortmentFilters = (assortment_group_id, label) => {
      if (vm.filters && vm.filters.assortmentFilters) {
        let aFilters = vm.filters.assortmentFilters;
        for (let i = 0; i < aFilters.length; i++) {
          if (
            assortment_group_id === aFilters[i].assortment_group_id &&
            label === aFilters[i].label
          ) {
            //!value ? value = { assortmentValue: 1 } : value.assortmentValue = 1;;
            return 1;
          }
        }
      }
    };

    // To reset the selected filter and reload the entire data
    vm.resetFilters = refresh => {
      // Resetting all the selected filters to null or to their default values
      vm.isResetFilter = true;
      vm.message = null;
      vm.errorMessage = null;
      vm.isPrimaryHierarchyLoaded = false;

      $scope.enableDamagechk = false;
      vm.setLimit();
      delete vm.filters.selectedsku;
      delete vm.filters.description;
      delete vm.filters.sku_number;
      delete vm.filters.deleted_sku_number;
      delete vm.filters.vendorIds;
      delete vm.filters.collectionIds;
      delete vm.filters.currentStatusIds;
      delete vm.filters.nextStatusIds;
      delete vm.filters.vendorItemNumber;
      delete vm.filters.buyerIds;
      delete vm.filters.assortmentFilters;
      delete vm.filters.primaryItemHierarchyValueId;
      delete vm.filters.itemSubType;
      delete vm.filters.setSubType;
      delete vm.filters.has_error;
      delete vm.filters.isVendorItemNumberBlurred;
      $scope.primary_item_hierarchy_value_id = null;
      vm.filtersCount = 0;
      vm.clearPath = true;
      vm.watchResetFilters();
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
          angular.element("#inlineSearch").focus();
          vm.openAdvancedSearchPanel(true);
        }, 500);
      }
      if (vm.isFilterApplied && JSON.stringify(vm.old_filters) !== "{}") {
        vm.reloadItemCountAndList();
      }
      vm.isFilterApplied = false;
      vm.applyFilterSuccess = true;
      $timeout(() => {
        vm.isResetFilter = false;
        vm.isPrimaryHierarchyLoaded = true;
        vm.isShowFilter = false;
        vm.old_filters = {};
      }, 0);
    };

    vm.watchResetFilters = () => {
      /** searching Item Data List */
      $scope.$watch("itemMaintCtrl.isFilterApplied", (searchValue, o) => {
        if (vm.isFilterApplied === false) {
          vm.fetchAssortmentLabels();
        }
      });
    };

    vm.focusSearchField = () => {
      angular.element("#inlineSearch").focus();
      // vm.showFilter = true;
    };

    // Reset not applied filter arrays.
    vm.resetUnusedFiltersArrays = refresh => {
      !(vm.filters.vendorIds && vm.filters.vendorIds.length) ?
        delete vm.filters.vendorIds : "";
      !(vm.filters.collectionIds && vm.filters.collectionIds.length) ?
        delete vm.filters.collectionIds : "";
      !(vm.filters.currentStatusIds && vm.filters.currentStatusIds.length) ?
        delete vm.filters.currentStatusIds : "";
      !(vm.filters.nextStatusIds && vm.filters.nextStatusIds.length) ?
        delete vm.filters.nextStatusIds : "";
      !(vm.filters.vendorItemNumber && vm.filters.vendorItemNumber.length) ?
        delete vm.filters.vendorItemNumber : "";
      !(vm.filters.buyerIds && vm.filters.buyerIds.length) ?
        delete vm.filters.buyerIds : "";
      !(vm.filters.assortmentFilters && vm.filters.assortmentFilters.length) ?
        delete vm.filters.assortmentFilters : "";
      !vm.filters.has_error ? delete vm.filters.has_error : "";
      vm.getFilterCount();
    };

    // Calculet filter count.
    vm.getFilterCount = () => {
      vm.appliedFilterCount = 0;
      vm.filters.vendorIds && vm.filters.vendorIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.collectionIds && vm.filters.collectionIds.length ?
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
      vm.filters.vendorItemNumber && vm.filters.vendorItemNumber.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.buyerIds && vm.filters.buyerIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.assortmentFilters && vm.filters.assortmentFilters.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.primaryItemHierarchyValueId ? vm.appliedFilterCount++ : "";
      vm.filters.itemSubType || vm.filters.setSubType ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.description ? vm.appliedFilterCount++ : "";
      vm.filters.sku_number ? vm.appliedFilterCount++ : "";
      vm.filters.has_error ? vm.appliedFilterCount++ : "";
    };

    vm.reloadHierarchy = true;
    vm.openAdvancedSearchPanel = flag => {
      if (!vm.filters.sku_number) {
        delete vm.filters.selectedsku;
      }
      $("#advanced-search").collapse("hide");
      $timeout(() => {
        vm.old_filters ? (vm.filters = _.clone(vm.old_filters)) : "";
        if (!vm.isShowFilter) {
          vm.resetFilters();
        } else {
          // When vm.isShowFilter is true, then resetUnusedFiltersArrays() will resets the not applied filters.
          // (this is when checks some values and clicks on search button without clicking on apply filter).
          vm.resetUnusedFiltersArrays();
        }
        getVendors();
        flag ? (vm.showFilter = !vm.showFilter) : "";
        if (vm.showFilter) {
          $scope.primary_item_hierarchy_value_id =
            vm.filters.primaryItemHierarchyValueId;
          vm.reloadHierarchy = false;
          $timeout(() => {
            vm.reloadHierarchy = true;
          }, 0);
        } !vm.assortmentLabels.length ? vm.fetchAssortmentLabels() : "";
        !vm.productAssortments.length ? vm.fetchAssortmentHierarchies() : "";
        vm.checkFilterHeight(1);
      }, 200);
    };

    vm.focusAdvanceSearch = () => {
      if (!vm.filters.sku_number) {
        delete vm.filters.selectedsku;
      }
      $timeout(() => {
        angular.element("#description_search").focus();
      }, 1000);
    };

    vm.focusEditItem = () => {
      $timeout(() => {
        angular.element("#edit_item").focus();
      }, 1000);
    };

    /*
     * This function is used to get the height of the element
     * and move the datalist accordingly.
     */
    vm.checkFilterHeight = expandSearch => {
      if (expandSearch == 1) {
        let checkInterval = 0;
        let filterHieghtInterval = $interval(() => {
          let headerHeight = angular.element(".rc-module-header").height();
          angular.element(".module-content").css("margin-top", headerHeight);
          checkInterval++;
          if (checkInterval > 15) {
            $interval.cancel(filterHieghtInterval);
          }
        }, 500);
      } else {
        $timeout(() => {
          let headerHeight = angular.element(".rc-module-header").height();
          angular.element(".module-content").css("margin-top", headerHeight);
        }, 500);
      }
    };

    vm.setInitialHeight = () => {
      $timeout(() => {
        vm.showFilter ? vm.openAdvancedSearchPanel() : null;
      }, 0);
    };

    vm.applyFilters = () => {
      // vm.getItemsCount();
      vm.message = null;
      vm.errorMessage = null;
      vm.prepareFilterData();
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
        Object.keys(vm.old_filters).length !== 0 ||
        Object.keys(vm.filters).length !== 0 ||
        (vm.old_filters !== undefined && !angular.equals(vm.old_filters, vm.filters))
      ) {
        vm.applyFilterSuccess = true;
        if (
          !angular.equals(vm.old_filters, vm.filters) ||
          !vm.isFilterApplied ||
          (vm.isGroupByApplied && !vm.isGroupByFilterApplied)
        ) {
          vm.page = 1;
          vm.setLimit(500);
          vm.applyFiltersBtnLabel = "Applying Filters...";
          vm.isProcessing = true;
          vm.reloadItemCountAndList()
            .then(() => {
              vm.isShowFilter = true;
              vm.isProcessing = false;
              if (vm.isGroupByApplied) {
                vm.isGroupHeader = true;
                vm.isGroupByFilterApplied = true;
              }
              vm.isFilterApplied = true;
              vm.old_filters = angular.copy(vm.filters);
              vm.message = "Filter applied successfully!";
              vm.applyFiltersBtnLabel = "Apply Filters";
              $timeout(() => {
                vm.message = null;
                vm.openAdvancedSearchPanel(true);
                angular.element("#filter_applied").focus();
              }, 1000);
            })
            .catch(error => {
              vm.errorMessage = "Unable to apply filter!";
              vm.applyFiltersBtnLabel = "Apply Filters";
              vm.isProcessing = false;
              logger.error(error);
              $timeout(() => {
                vm.errorMessage = null;
              }, 2500);
            });
        } else {
          vm.applyFilterSuccess = false;
          vm.applyFilterMessage = "* Search results already found for selected filters";
          $timeout(() => {
            angular.element("#description_search").focus();
          }, 1000);
        }
      } else {
        vm.applyFilterSuccess = false;
        vm.applyFilterMessage = "* Please select atleast one filter to search relevant items";
        $timeout(() => {
          vm.reloadItemCountAndList()
          angular.element("#description_search").focus();
        }, 1000);
      }
      if (!vm.filters.sku_number) {
        delete vm.filters.selectedsku;
      }
    };

    vm.focusFilterApplied = () => {
      $timeout(() => {
        angular.element("#reset_btn").focus();
      }, 1000);
    }

    vm.unselecteddamage = () => {
      vm.filters.sku_number = "000000" + vm.filters.sku_number;

      //Get the sku number of length 6
      !vm.filters.sku_number.includes("-") ?
        (vm.filters.sku_number = vm.filters.sku_number.substr(
          vm.filters.sku_number.length - 7,
          vm.filters.sku_number.length
        )) :
        (vm.filters.sku_number = vm.filters.sku_number.substr(
          vm.filters.sku_number.length - 8,
          vm.filters.sku_number.length
        ));
      !vm.filters.sku_number.includes("-") ?
        (vm.filters.sku_number =
          vm.filters.sku_number.slice(0, 4) +
          "-" +
          vm.filters.sku_number.slice(4, 7)) :
        null;
    }

    vm.gobacktomtain = () => {
      if (!vm.isGroupByApplied) {
        vm.onReload();
      }
    }

    // Create an array of objects with key value pairs of selected filters used during apply filter
    vm.prepareFilterData = () => {
      if ($scope.primary_item_hierarchy_value_id) {
        vm.filters.primaryItemHierarchyValueId =
          $scope.primary_item_hierarchy_value_id;
      }
      if (vm.filters.sku_number) {
        if (vm.filters.sku_number.length < 8) {
          //Append leading zeros to the existing sku number
          if (vm.filters.selectedsku == 'selectdamagesku') {
            if (vm.filters.sku_number.length == 7) {
              vm.filters.sku_number = "00000000" + vm.filters.sku_number;
              !vm.filters.sku_number.includes("-") ?
                (vm.filters.sku_number = vm.filters.sku_number.substr(
                  vm.filters.sku_number.length - 9,
                  vm.filters.sku_number.length
                )) :
                (vm.filters.sku_number = vm.filters.sku_number.substr(
                  vm.filters.sku_number.length - 10,
                  vm.filters.sku_number.length
                ));
              !vm.filters.sku_number.includes("-") ?
                (vm.filters.sku_number =
                  vm.filters.sku_number.slice(0, 4) +
                  "-" +
                  vm.filters.sku_number.slice(4, 7) +
                  "-" +
                  vm.filters.sku_number.slice(7, 9)) :
                null;
            }
            else {
              vm.unselecteddamage();
            }
          }
          else {
            vm.unselecteddamage();
          }
        } else if (vm.filters.sku_number.length === 8) {
          !vm.filters.sku_number.includes("-") ?
            (vm.filters.sku_number =
              vm.filters.sku_number.slice(0, 4) +
              "-" +
              vm.filters.sku_number.slice(4, 7)) :
            null;
        } else if (vm.filters.sku_number.length >= 9) {
          !vm.filters.sku_number.includes("-") ?
            (vm.filters.sku_number =
              vm.filters.sku_number.slice(0, 4) +
              "-" +
              vm.filters.sku_number.slice(4, 7) +
              "-" +
              vm.filters.sku_number.slice(7, vm.filters.sku_number.length)) :
            null;
        }
      }
      // else if (vm.filters.deleted_sku_number) {
      //   if (vm.filters.deleted_sku_number.length < 8) {
      //     //Append leading zeros to the existing sku number
      //     vm.filters.deleted_sku_number = "000000" + vm.filters.deleted_sku_number;
      //     //Get the sku number of length 6
      //     !vm.filters.deleted_sku_number.includes("-") ?
      //       (vm.filters.deleted_sku_number = vm.filters.deleted_sku_number.substr(
      //         vm.filters.deleted_sku_number.length - 7,
      //         vm.filters.deleted_sku_number.length
      //       )) :
      //       (vm.filters.deleted_sku_number = vm.filters.deleted_sku_number.substr(
      //         vm.filters.deleted_sku_number.length - 8,
      //         vm.filters.deleted_sku_number.length
      //       ));
      //     !vm.filters.deleted_sku_number.includes("-") ?
      //       (vm.filters.deleted_sku_number =
      //         vm.filters.deleted_sku_number.slice(0, 4) +
      //         "-" +
      //         vm.filters.deleted_sku_number.slice(4, 7)) :
      //       null;
      //   } else if (vm.filters.deleted_sku_number.length === 8) {
      //     !vm.filters.deleted_sku_number.includes("-") ?
      //       (vm.filters.deleted_sku_number =
      //         vm.filters.deleted_sku_number.slice(0, 4) +
      //         "-" +
      //         vm.filters.deleted_sku_number.slice(4, 7)) :
      //       null;
      //   } else if (vm.filters.deleted_sku_number.length >= 9) {
      //     !vm.filters.deleted_sku_number.includes("-") ?
      //       (vm.filters.deleted_sku_number =
      //         vm.filters.deleted_sku_number.slice(0, 4) +
      //         "-" +
      //         vm.filters.deleted_sku_number.slice(4, 7) +
      //         "-" +
      //         vm.filters.deleted_sku_number.slice(7, vm.filters.deleted_sku_number.length)) :
      //       null;
      //   }
      // }
      for (let property in vm.filters) {
        if (
          vm.filters[property] === undefined ||
          vm.filters[property] === null ||
          (Array.isArray(vm.filters[property]) &&
            vm.filters[property].length === 0)
        )
          delete vm.filters[property];
      }
    };

    $scope.selectedTreeItem = false;
    // Directive Send Data back to controller
    $scope.end = data => {
      if (
        (
          $state.current.name.includes(".new") ||
          $state.current.name.includes(".update")
        ) &&
        data.hierarchyValueData
      ) {
        $scope.head.primary_item_hierarchy_value_name = data.path_name;
        $scope.head.primary_item_hierarchy_value_id =
          data.hierarchyValueData.id;
        $scope.head.primary_item_hierarchy = data.hierarchyValueData.hierarchy;
        $scope.head.primary_item_hierarchy_value_path =
          data.hierarchyValueData.tree_path;
        $scope.primary_item_hierarchy_obj = data.hierarchyValueData;
        if (data.formData !== null && data.formData !== undefined) {
          vm.setItemDescription($scope.head);
        } else {
          vm.populateDescription();
        }
      } else if (data.hierarchyValueData) {
        $scope.primary_item_hierarchy_value_path =
          data.hierarchyValueData.tree_path;
        //$scope.primary_item_hierarchy_value_name = data.path_name;
        if (
          Object.keys(data.formData).length === 0 &&
          Object.keys(data.hierarchyValueData).length === 0
        ) {
          delete vm.filters.primaryItemHierarchyValueId;
          $scope.primary_item_hierarchy_value_id = null;
        } else {
          $scope.primary_item_hierarchy_value_id =
            data.hierarchyValueData.id;
        }
      }
      $scope.selectedTreeItem = true;
    };

    $scope.endHierarchy = (data, each) => {
      each.udd_value_id = data.hierarchyValueData.id;
      each.primary_item_hierarchy_value_path =
        data.hierarchyValueData.tree_path;
    };

    // Directive Send Data back to controller once the buyer is selected.
    $scope.getBuyerHierarchyPath = data => {
      if (data.hierarchyValueData) {
        $scope.head.buyer_id = data.hierarchyValueData.id;
        data.path_name = data.path_name ?
          data.path_name.replace("<span>", "") :
          "";
        $scope.head.buyer = data.path_name ?
          data.path_name.replace("</span>", "") :
          "";
        $scope.buyer_hierarchy_value_id = data.hierarchyValueData.id;
        $scope.selectedTreeItem = true;
      }
    };

    $scope.setEntityScreen = "Item";
    $scope.copyToHead = value => {
      vm.showparametervalues = false;
      $scope.head = value;
      $scope.edit_master_id = value.id;
      $scope.master_id = value.id;
    };

    vm.copyToHeadInfo = (entityName, value) => {
      vm.showparametervalues = false;
      $scope.head = _.clone(value);
      $scope.head.vendor = {};
      $scope.master_id = value.id;
      $scope.head.vendor.id = value.vendor_id;
      $scope.edit_master_id = value.id;
    };
    $scope.clearHead = () => {
      $scope.head = {};
      vm.availableSkus = {};
      vm.isSkuLoaded = false;
      $scope.edit_master_id = "";
    };
    $scope.newitemwindow = () => {
      $scope.head.item_sub_type = "Item";
    };

    vm.updateDescState = false;

    vm.changeInfo = type => {
      $scope.head.item_sub_type = type;
      if (type && type.toLowerCase() === "set") {
        vm.showSetScreen = true;
      } else {
        vm.showSetScreen = false;
      }
      vm.reloadUDDs();
    };

    vm.gotoUpdateState = () => {
      vm.duplicateVendorMessage = null;
      vm.validationMessage = null;
      vm.oldItem = undefined;
      $scope.uddValidationErrors = [];
      vm.itemVendors = [];
      //  vm.itemVendorIds = [];
      if (
        $stateParams.id &&
        $state.current.name.includes("itemMaintenance.update")
      ) {
        //if current state is update and selected id is not present in choices map then get by API call
        ItemService.API.GetItemById($stateParams.id)
          .then(response => {
            if (response) {
              if (response.length > 0) {
                response[0].old_type_id = angular.copy(response[0].type_id);
                // if (response[0].next_effective_date == "None") response[0].next_effective_date = "1970-01-01"
                if (response[0].next_effective_date != "None") response[0].next_effective_date = new Date(response[0].next_effective_date).toISOString()
                vm.ItemMap === undefined ? (vm.ItemMap = []) : null;
                vm.ItemMap[$stateParams.id] = response[0];
                vm.fetchItemType(response[0]);
                vm.getItemTypePath(response[0]);
                vm.showLockedScreenStatus = false;
                vm.LoadingSecndryAuth = false;
                vm.dblClickAction("ItemMaster", response[0]);
                vm.oldItem = response[0];
                if (
                  vm.oldItem.romanic_copy === "null" ||
                  vm.oldItem.romanic_copy === "undefined"
                ) {
                  // Setting default value to empty string if romanic copy is null.
                  vm.oldItem.romanic_copy = "";
                }
              }
            } else {
              //if response also don't have id then close form
              vm.closeForm("ItemMaster");
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        vm.closeForm("ItemMaster");
      }
    };

    vm.enableItemTypeChange = () => {
      $scope.isEnabled = false;
      $timeout(() => {
        $scope.isEnabled = true;
      }, 1000);
    };

    vm.closeUpdateItemPanel = () => {
      $scope.head = {};
      vm.isClosingUpdateTypePanel = true;
      vm.gotoUpdateState();
      let obj = {
        isUpdateItemType: true
      };
      $scope.$broadcast("clearUddValues", {
        event: "save",
        response: obj
      });
      $scope.isEnabled = false;
      $timeout(() => {
        vm.isClosingUpdateTypePanel = false;
        vm.showUpdateItemPanel = false;
      }, 0);
      $timeout(() => {
        angular.element("#change_type").focus()
      }, 1000);
    };

    vm.closeupdateTypeForm = () => {
      vm.isUpdateSuccess = false;
      vm.showUpdateItemPanel = false;
      $timeout(() => {
        angular.element("#description").focus();
      }, 500);

    }

    vm.dblClickAction = (entity, eachItemMaster) => {
      //vm.createForm = false;
      vm.showVendor = false;
      $timeout(() => {
        vm.createStage = true;
        // older code do not delete
        // vm.showUpdateItemPanel = false;
        vm.configureItemVendorStage = false;
        vm.configureItemVendorScreen = false;
        vm.configureStage = false;
        vm.previewandpublishStage = false;
        vm.createForm = true;
        vm.itemSetForm = false;
        vm.manageDropScreen = false;
        vm.configureScreen = false;
        vm.previewAndPublish = false;
        vm.confirmDelete = false;
        vm.showSkuPopup = false;
        vm.duplicateItemExist = false;
        vm.showDuplicateItems = false;
        vm.changingdate = vm.changingnextdate = vm.changingnextstatus = vm.changingstatus = false;
        $scope.head = {};
        $scope.head = vm.item_details = _.clone(eachItemMaster);
        $scope.head.old_type_id = $scope.head.type_id;
        $scope.head.old_division_id = $scope.head.division_id;
        $scope.head.old_department_id = $scope.head.department_id;
        $scope.head.old_class = $scope.head.class;
        //Get date based format for effective date on each double click of item record
        $scope.head.status_effective_date = eachItemMaster.status_effective_date = $scope.getDateBasedOnFormat(
          $scope.head.status_effective_date
        );
        $scope.head.next_effective_date = eachItemMaster.next_effective_date = $scope.getDateBasedOnFormat(
          $scope.head.next_effective_date
        );
        $scope.originalMatser = _.clone(eachItemMaster);
        $scope.head.item_sub_type = $stateParams.type;
        vm.enableItemTypeChange();
        vm.initializeForm();
        vm.resetModel();
        vm.prepareItemTypesPath();
        ItemService.API.StoreVariable("selectedItem", eachItemMaster);
        vm.showitemmaintenance = false;
        vm.updateDescState = true;
        vm.$isUpdate = true;
        vm.opdone = false;
        vm.copyToHeadInfo("ItemMaster", eachItemMaster);
        $scope.changeevent(eachItemMaster);
        vm.savedToMasterList = true;
        $scope.updateForm = true;
        vm.showDetails = true;
        $scope.showhistory = false;
        vm.showVendor = true;
        $scope.head.description.includes("Clone") ||
          $scope.head.description.includes("clone") ?
          (vm.isCloned = true) :
          (vm.isCloned = false);
        vm.$showAdd = false;
        vm.showitemmaintenance = false;
        vm.itemCol_details = _.clone(eachItemMaster);
        $scope.parent_id = eachItemMaster.id;
        vm.fetchVendorsForAnItem(eachItemMaster.id);
        vm.loadCollections(eachItemMaster.vendor_id);
        vm.changeInfo(eachItemMaster.item_sub_type);
        vm.setProductExplorerDivision(eachItemMaster.type_id);
        vm.setProductExplorerDepartment();
        vm.setProductExplorerClass(eachItemMaster.department_id);
        vm.loadCollectionVal(eachItemMaster.type_id);
        vm.fetchFirstSkuByItem($scope.head);
        $scope.head.vendor = {};
        $scope.head.vendor.id = eachItemMaster.vendor_id;
        vm.originalVendor = $scope.head.vendor_id;
        if (
          $scope.head.romanic_copy === "null" ||
          $scope.head.romanic_copy === "undefined"
        ) {
          // Setting default value to empty string if romanic copy is null.
          $scope.head.romanic_copy = "";
        }
        $scope.oldItemDetails = _.clone($scope.head);
        $scope.autoPopulate = false;
        // Variable to show the Published review section.
        vm.publishResponseMessage = false;
        /* variables to reset the Notification message-start */
        $scope.itemSuccessMessage = null;
        $scope.itemErrorMessage = null;
        $scope.itemUDDSuccessMessage = null;
        /* variables to reset the Notification message-end */

        // Set Dependency details to false
        vm.$showErrorDetailsData = false;
        vm.$showErrorDetails = false;
        $timeout(() => {
          if (vm.isUpdateSuccess == false) {
            angular.element("#description").focus();
          }
        }, 1000);
      }, 0);
    };

    // To update the sku details
    $scope.$on("updateSkuDetails", function (e, args) {
      let data = {
        id: args.item_id
      };
      let index = vm.itemsDataList.findIndex(
        item => item.id === parseInt(data.id)
      );
      if (args.event === "status_changes") {
        ItemService.API.GetItemById($stateParams.item_id)
          .then(result => {
            vm.itemsDataList[index].status = result[0].status;
            vm.itemsDataList[index].status_id = result[0].status_id;
          })
          .catch(() => { });
      }
      // // if sku is created
      if (args.event === "save") {
        vm.itemsDataList[index].availableSkus.push(args.skuDetails);
      }
      if (args.event === "update") {
        let n = vm.itemsDataList[index].availableSkus.findIndex(
          sku => sku.id === args.skuDetails.id);
        vm.itemsDataList[index].availableSkus[n].vendor_item_number = args.skuDetails.vendor_item_number;
      }
      // if sku is deleted
      if (args.event === "delete") {
        let n = vm.itemsDataList[index].availableSkus.findIndex(
          sku => sku.id === args.skuDetails.id
        );
        vm.itemsDataList[index].availableSkus.splice(n, 1);
      }
    });

    vm.fetchVendorsForAnItem = itemId => {
      vm.isLoadingAlternativeVendor = true;
      if ($stateParams.id && $state.current.name.includes(".update")) {
        ItemService.API.GetVendorsForAnItem(itemId)
          .then(response => {
            vm.itemVendors = response.data;
            vm.itemVendorsLength = response.data.length;
            vm.itemVendorIds ? null : vm.itemVendorIds = [];
            if (vm.itemVendors) {
              for (let i = 0; i < vm.itemVendors.length; i++) {
                if (
                  vm.itemVendors[i].vendor_id === parseInt($scope.head.vendor.id)
                ) {
                  vm.isPrimaryVendorLinked = vm.itemVendors[i];
                }
                vm.itemVendorIds.push(vm.itemVendors[i].vendor_id)
              }
            }
            vm.isLoadingAlternativeVendor = false;
          })
          .catch(error => {
            logger.error(error);
            vm.isLoadingAlternativeVendor = false;
          });
      } else {
        if (vm.itemVendorIds) {
          vm.itemVendorIds.push(parseInt($scope.head.vendor.id));
        }
        $scope.head.Vendor = {};
        vm.isLoadingAlternativeVendor = false;
      }
    };

    vm.updateVendorItemPriority = (vendorItemObject, action) => {
      vm.isProcessingAlternativeVendor = true;
      ItemService.API.UpdateVendorItemPriority(vendorItemObject, action)
        .then(() => {
          // change priority according to Up/Down
          if (action && action.toLowerCase() === "up") {
            // index for vm.itemVendors which has priority as vendorItemObject
            let vendorIndex = vm.itemVendors.findIndex(vendor => vendor.priority === vendorItemObject.priority)
            // index for vm.itemVendors which has priority - 1 as vendorItemObject
            let vendorIndexMinusOne = vm.itemVendors.findIndex(vendor => vendor.priority === vendorItemObject.priority - 1)
            // if vendorIndexMinusOne is valid change the priorities
            if (vendorIndexMinusOne >= 0) {
              vm.itemVendors[vendorIndex].priority--;
              vm.itemVendors[vendorIndexMinusOne].priority++;
            }
          } else if (action && action.toLowerCase() === "down") {
            // index for vm.itemVendors which has priority as vendorItemObject
            let vendorIndex = vm.itemVendors.findIndex(vendor => vendor.priority === vendorItemObject.priority)
            // index for vm.itemVendors which has priority + 1 as vendorItemObject
            let vendorIndexPlusOne = vm.itemVendors.findIndex(vendor => vendor.priority === vendorItemObject.priority + 1)
            // if vendorIndexPlusOne is valid change the priorities
            if (vendorIndexPlusOne < vm.itemVendors.length) {
              vm.itemVendors[vendorIndex].priority++;
              vm.itemVendors[vendorIndexPlusOne].priority--;
            }
          }
          vm.isProcessingAlternativeVendor = false;
        })
        .catch(error => {
          console.log(error);
        });
    };

    vm.setStageIndication = currentScreen => {
      if (currentScreen && currentScreen.toLowerCase() === "createform") {
        vm.configureVendorStage = false;
        vm.hideIsLoading = true;
        vm.createStage = true;
        vm.configureStage = false;
        vm.itemSetStage = false;
        vm.previewandpublishStage = false;
        vm.isCloneItemcreate = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "configureitemvendorform"
      ) {
        vm.configureVendorStage = true;
        vm.createStage = true;
        vm.configureStage = false;
        vm.itemSetStage = false;
        vm.previewandpublishStage = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "configureform"
      ) {
        vm.configureVendorStage = false;
        vm.createStage = true;
        vm.configureStage = true;
        vm.configureVendorStage = false;
        vm.itemSetStage = false;
        vm.previewandpublishStage = false;
        $scope.isEnabled = true;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "itemsetform"
      ) {
        vm.createStage = true;
        vm.configureStage = true;
        vm.itemSetStage = true;
        vm.previewandpublishStage = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "dropscreen"
      ) {
        vm.createStage = true;
        vm.configureStage = true;
        vm.manageDropStage = true;
        vm.previewandpublishStage = false;
        // Hide the Queued message on load of the drop manage screen
        angular.element("#showQueueMessage").hide();
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "previewandpublish"
      ) {
        vm.createStage = true;
        vm.configureStage = true;
        vm.itemSetStage = true;
        vm.previewandpublishStage = true;
      }
    };

    vm.clearHeadInfo = entityName => {
      $scope.head = {};
      vm.availableSkus = {};
      vm.isSkuLoaded = false;
      $scope.edit_master_id = "";
    };

    vm.publishItemUdd = (head, isPublish) => {
      if (isPublish) {
        vm.createForm = false;
        vm.configureScreen = false;
        vm.itemSetForm = false;
        vm.configureItemVendorScreen = false;
        vm.configureItemVendorStage = false;
        vm.previewAndPublish = true;
        vm.manageDropScreen = false;
        vm.back = true;
      }
      vm.publishResponseMessage = true;
      if (vm.$isUpdate) {
        vm.update("ItemMaster", head);
        $timeout(() => {
          angular.element("#finish_publish").focus();
        }, 1000);
      } else {
        if (!vm.validateItemForm()) {
          vm.save("ItemMaster", head);
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

    // Storage Functions START
    vm.initializeDropForm = () => {
      $scope.isAllowMultipleDrops = true;
      vm.showConfirmDeletion = false;
      vm.showConfirmThumbnailDeletion = false;
      vm.DeletionConfirmation = false;
      vm.DeletionThumbnailConfirmation = false;
      vm.is_thumbnail = 1;
    };

    vm.getDropStatus = () => {
      try {
        $scope.statusList = DataLakeService.GetDropStatuses();
      } catch (error) {
        logger.error(error);
      }
    };

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
                  response[index].stream?.toLowerCase() === "cover image" &&
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
                    sequence:1,
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
              let last_sequence=0
              for(let i of response){
                if(i.sequence!=null){
                  last_sequence=i.sequence
                }else{
                  last_sequence=1
                }
              }
              for (let j of response) {
                if (
                  (j.sequence == 0 || j.sequence == null || $scope.fromsetcoverimage) &&
                  j.stream_id == 1
                ) {
                  if (last_sequence != 0 && (response.filter(x=>x.stream_id == 33)[0].drop_id != j.drop_id)) {
                    j.sequence = last_sequence + 1;
                    last_sequence = j.sequence;
                    DataLakeAPIService.API.UpdateDetails(j).then((res) => {$scope.drops=response});
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
      $scope.queuedDrops.sort(function(a, b) {
        return a.display_sequence - b.display_sequence})
      let ids = $scope.queuedDrops.map(it => it.unique_id);
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
          drop.display_sequence=1
          let adding=1
          for(let i of $scope.queuedDrops){
            if(i.unique_id != drop.unique_id){
              adding+=1
              i.display_sequence=adding
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
          drop.display_sequence=1
          let adding=1
          for(let i of $scope.queuedDrops){
            if(i.unique_id != drop.unique_id){
              adding+=1
              i.display_sequence=adding
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
          dropThumbnail.is_thumbnailImage = 0;
          dropThumbnail.sequence=1
          vm.isDeleting = true;
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Set Cover Image successfully.";
          DataLakeAPIService.API.UpdateDrop(dropThumbnail)
            .then(response => {
              vm.isBtnEnabled = true;
              vm.showConfirm = false;
              vm.showSuccessQueueMessage = "Set Cover Image successfully.";
              vm.isDropProcessed = true;
              vm.fetchDropsByUuidAndInstanceId(dropThumbnail.instance_id);
              vm.getItemMetaData();
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              $scope.isImage = true;
              $scope.isDropUploaded = true;
              $scope.panelloader = true;
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
            // if (vm.dropToDelete) {
            //   drop = coverDrops;
            // }
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
                dropThumbnail.sequence=1
                vm.isDeleting = true;
                angular.element("#showQueueMessage").show();
                vm.showSuccessQueueMessage = "Set Cover Image successfully.";
                DataLakeAPIService.API.UpdateDrop(dropThumbnail)
                  .then(response => {
                    $scope.fromsetcoverimage = true;
                    vm.isBtnEnabled = true;
                    vm.showConfirm = false;
                    vm.showSuccessQueueMessage = "Set Cover Image successfully.";
                    vm.isDropProcessed = true;
                    vm.fetchDropsByUuidAndInstanceId(dropThumbnail.instance_id);
                    vm.getItemMetaData();
                    vm.resetModel();
                    // This function is to remove the confirm box
                    vm.initializeDropForm();
                    $scope.isImage = true;
                    $scope.isDropUploaded = true;
                    $scope.panelloader = true;
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
              vm.showSuccessQueueMessage = "Set Cover Image successfully.";
              vm.isDropProcessed = true;
              vm.fetchDropsByUuidAndInstanceId(dropThumbnail.instance_id);
              vm.getItemMetaData();
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              $scope.isImage = true;
              $scope.isDropUploaded = true;
              $scope.panelloader = true;
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
        type === "application/octet-stream"||
        type === "binary/octet-stream"
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
      $scope.notImage=false;
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
      vm.numberCannotExeed = false;
      vm.oneSequence = false;
      $scope.drop.duplicate=false
      $scope.drop.display_sequence = null;
      $scope.notImage=false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      if (streamId === 1) {
        vm.conditionForEmpty = true;
        vm.thumbnailActive = true;
      } else {
        vm.conditionForEmpty = false;
        vm.thumbnailActive = false;
      }

      vm.itemdataUploaderror = false;
      vm.itemdataAddToQueueError = false;
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
        vm.conditionForEmpty = true;
      } else {
        vm.conditionForEmpty = false;
      }
      vm.numberCannotExeed = false;
      vm.oneSequence = false;
      if ($scope.drop.display_sequence > 300) {
        vm.numberCannotExeed = true;
      } else {
        vm.numberCannotExeed = false;
      }
      if (
        $scope.drop.display_sequence === 1 ||
        $scope.drop.display_sequence == 0
      ) {
        vm.oneSequence = true;
      } else {
        vm.oneSequence = false;
      }
      if ($scope.drops?.length > 0 && $scope.drop.display_sequence !== null) {
        for (let i in $scope.drops) {
          const key = $scope.drops[i];
          if (
            key.sequence === $scope.drop.display_sequence &&
            key.stream_id !== 33 &&
            $scope.drop.display_sequence <= 300 &&
            $scope.drop.display_sequence >= 2
          ) {
            $scope.drop.duplicate=true
            break;
          } else {
            $scope.drop.duplicate=false
          }
        }
      }
    };
    vm.changeSequenceNumberFor = () => {
      if ($scope.drop.display_sequence == null) {
        vm.conditionForEmpty = true;
      } else {
        vm.conditionForEmpty = false;
      }
      vm.numberCannotExeed = false;
      vm.oneSequence = false;
      if ($scope.drop.display_sequence > 300) {
        vm.numberCannotExeed = true;
      } else {
        vm.numberCannotExeed = false;
      }
      if (
        $scope.drop.display_sequence === 1 ||
        $scope.drop.display_sequence === 0
      ) {
        vm.oneSequence = true;
      } else {
        vm.oneSequence = false;
      }
      if (
        $scope.queuedDrops?.length > 0 &&
        $scope.drop.display_sequence !== null
      ) {
        for (let i in $scope.queuedDrops) {
          const key = $scope.queuedDrops[i];
          if (
            key.display_sequence == $scope.drop.display_sequence &&
            key.stream_id !== 33 &&
            $scope.drop.display_sequence <= 300 &&
            $scope.drop.display_sequence >= 2
          ) {
            $scope.drop.duplicate=true
            break;
          } else {
            $scope.drop.duplicate=false
          }
        }
      }
    };
    vm.editItem=(drop)=>{
      vm.firstValue=0
      if('display_sequence' in drop){
        vm.firstValue=drop.display_sequence
        if(drop.display_sequence != 1 && !drop.is_coverImage){
          drop.editDocSequence=true
        }
      }else{
        vm.firstValue=drop.sequence
        if(drop.sequence != 1 && !drop.is_coverImage){
          drop.editDocSequence=true
        }
      }
    }
    vm.doneEditing=(drop)=>{
      if(!vm.sequenceChangeError){
        if('sequence' in drop){
          drop.sequence=parseInt(drop.sequence)
          DataLakeAPIService.API.UpdateDetails(drop).then((res)=>{
            vm.firstValue=res.config.data.sequence
            drop.duplicate=false
            vm.fetchDropsByUuidAndInstanceId(drop.instance_id)
  
          })
        }else{
          drop.display_sequence=parseInt(drop.display_sequence)
          if(drop.duplicate){
            $scope.queuedDrops.sort(function(a, b) {
              return a.display_sequence - b.display_sequence;
            });
            for (let i = 0; i < $scope.queuedDrops.length; i++){
              if(drop.unique_id!=$scope.queuedDrops[i].unique_id && $scope.queuedDrops[i].display_sequence>=drop.display_sequence){
                $scope.queuedDrops[i].display_sequence+=1;
              }
              
              
            }
            drop.duplicate=false
          }
        }
        drop.editDocSequence=false
        
      }else{
        if('display_sequence' in drop){
          drop.display_sequence=vm.firstValue
        }else {
          drop.sequence=vm.firstValue
        }
        drop.editDocSequence=false
        vm.sequenceChangeError=false
      }
    }
    
    vm.validationHandle=(drop,drops)=>{
      if(drop.sequence==''){
        vm.sequenceChangeError=true
        vm.errorInvolve='*Sequence field is required'
      }else{
        if( drop.sequence==0 || drop.sequence==1){
          vm.sequenceChangeError=true
          vm.errorInvolve='*Sequence number is reserved for cover_image thumbnail'
        } 
        else if(drop.sequence>300){
          vm.sequenceChangeError=true
          vm.errorInvolve='*Sequence number cannot exceed 300'
        }else{
          for (let i of drops){
            if(i.drop_id!=drop.drop_id && i.sequence ==drop.sequence){
              drop.duplicate=true;
              vm.sequenceChangeError=false;
              break
            }else{
              vm.sequenceChangeError=false
            }
          }
        }
      }
    }
    vm.validationHandleFor=(drop,drops)=>{
      if(drop.display_sequence==''){
        vm.sequenceChangeError=true
        vm.errorInvolve='*Sequence field is required'
      }else{
        if( drop.display_sequence==0 || drop.display_sequence==1){
          vm.sequenceChangeError=true
          vm.errorInvolve='*Sequence number is reserved for cover_image thumbnail'
        } 
        else if(drop.display_sequence>300){
          vm.sequenceChangeError=true
          vm.errorInvolve='*Sequence number cannot exceed 300'
        }else{
          for (let i of drops){
            if(i.unique_id!=drop.unique_id && i.display_sequence ==drop.display_sequence){
              drop.duplicate=true;
              vm.sequenceChangeError=false;
              break
            }else{
              vm.sequenceChangeError=false
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
        .then(() => { })
        .catch(() => { });
    };
    vm.uniqueId = 0;

    $scope.resetData = () => {
      vm.itemdataUploaderror = false;
      vm.itemdataAddToQueueError = false;
      vm.showCantGen = false;
      $scope.files = [];
      $scope.drop.url = null;
      $scope.notImage=false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
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
              vm.itemdataUploaderror = false;
              $scope.dropsForselectedLakeStream = [];
              vm.itemdataAddToQueueError = false;
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

    vm.addCoverImg = () => {
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        vm.AddedForUrl($scope.drops);
        vm.isProcessing = true;
      } else {
        vm.replaceExistingDropAndUpload();
      }
    }

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

    vm.isAllowedMultipleDropsForSelectedStream = drops => {
      vm.thumbnailActive = false;
      $scope.notImage=false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.sequenceChangeError=false
      vm.showCantGen = false;
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        // vm.AddedForUrl(drops);
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
              vm.AddedForUrl(drops);
            }
          } else {
            vm.AddedForUrl(drops);
          }
        } else {
          vm.AddedForUrl(drops);
        }
      } else {
        vm.itemdataUploaderror = false;
        $scope.dropsForselectedLakeStream = [];
        vm.isUploading = true;
        vm.isAddedToQueue = true;
        vm.itemdataAddToQueueError = false;

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

    };

    vm.replaceExistingDropAndUpload = (detai) => {
      let coverDrops = $scope.drops.filter(item => {
        return item.stream_id == 33;
      });
      let drop = []
      if (coverDrops && coverDrops.length > 0) {
        drop = coverDrops[0];
      }

      drop.instance_id = $stateParams.id;
      drop.uuid = vm.uuid;
      vm.isProcessing = true;
      let uploadResponse = vm.uploadDrop(drop, $stateParams.id,detai)
        .then(() => { })
        .catch(() => { });
      if (!drop.is_thumbnailImage) {
        var removeResponse = vm.removeDrop(drop)
          .then(() => { })
          .catch(() => { });
      }
      if (drop.is_thumbnailImage) {
        vm.isDisableSaveCvrImg = true;
        let thumbnailPresent=$scope.drops.filter((item) => {
          return item.drop_id == drop.drop_id && item.stream_code=="thumbnail";
        });
        if(thumbnailPresent.length>0){
          vm.removeDrop(thumbnailPresent[0])
          .then(() => { })
          .catch(() => { });
        }
        var removeResponse = vm.updateCoverImageDrop(drop)
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
          vm.isDeleting = true;
          drop.uuid = vm.uuid;
          if (vm.dropToDelete) {
            drop = vm.dropToDelete;
          }
          drop.uuid = vm.uuid;
          drop.stream_id = 1;
          drop.is_thumbnail = 1;
          drop.is_thumbnailImage = 0;
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Deleting drop in progress";
          DataLakeAPIService.API.UpdateDrop(drop)
            .then(() => {
              vm.dropToDelete = undefined;
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the item";
              delete vm.oldItem.thumbnail;
              delete $scope.head.thumbnail; //delete the thumbnail property
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.getItemMetaData();
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              $scope.isDropUploaded = false;
              resolve(true);
              $timeout(() => {
                vm.showConfirmDeletion = false;
                vm.showConfirmThumbnailDeletion = false;
                angular.element("#showQueueMessage").hide();
                vm.showSuccessQueueMessage = null;
                vm.isProcessing = false;
                vm.isDeleting = false;
              }, 2500);
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
    }

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
      vm.thumbnailActive = false;
      $scope.notImage=false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      if (vm.drop_form.ur) {
        vm.drop_form.url.$setPristine();
      }
    }
    vm.resetFormField = () => {
      $scope.drop.stream_id = null;
      $scope.files = undefined;
      $scope.errFiles = undefined;
      $scope.drop.url = undefined;
      vm.thumbnailActive = false;
      $scope.notImage=false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.sequenceChangeError=false
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
    vm.deleteDropFromQueue = () => {
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
      $scope.isAllowMultipleDrops = true;
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
        $scope.queuedDrops.sort(function(a, b) {
          return a.display_sequence - b.display_sequence;})
          let adding=1
          for(let i of $scope.queuedDrops){
            adding+=1
            i.display_sequence=adding
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
      vm.thumbnailActive = false;
      $scope.notImage=false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.sequenceChangeError=false
      vm.resetValues();
      if (dropId.is_thumbnailImage) {
        vm.deleteThumbnailDropsFromQueue(dropId);
      } else {
        // let deletedDropArr = $scope.queuedDrops.filter(item => {
        //   return item.unique_id = dropId.unique_id;
        // })
        // let deletedDrop = deletedDropArr[0];
        //let deletedDrop = $scope.queuedDrops[index];

        let ids = $scope.queuedDrops.map(it => it.unique_id);
        let index = ids.indexOf(dropId.unique_id);
        if (dropId.stream.toLowerCase() === "cover image" && dropId.is_thumbnail) {

          // store the value of index
          vm.dropIndex = index;
          vm.coverIndexId = dropId.coverImgId;
          vm.DeletionConfirmation = true;
          // if stream is thumbnail and copy of cover image
        } else if (dropId.stream.toLowerCase() == "thumbnail" && dropId.is_coverImage) {
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

    vm.resetModel = () => {
      $scope.drop = {
        source: "local"
      };
      $scope.files = undefined;
      $scope.errFiles = undefined;
      vm.fetchDropLakesByUuid();
      vm.getDropStatus();
    };

    // to delete drop
    vm.removeDrop = drop => {
      return new Promise((resolve, reject) => {
        try {
          vm.isDeleting = true;
          drop.uuid = vm.uuid;
          if (vm.dropToDelete) {
            drop = vm.dropToDelete;
          }
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Deleting drop in progress";
          DataLakeService.DeleteDrop(drop)
            .then(() => {
              vm.dropToDelete = undefined;
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the item";
              delete vm.oldItem.thumbnail;
              delete $scope.head.thumbnail; //delete the thumbnail property
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.getItemMetaData();
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              $scope.isDropUploaded = false;
              resolve(true);
              $timeout(() => {
                vm.showConfirmDeletion = false;
                vm.showConfirmThumbnailDeletion = false;
                angular.element("#showQueueMessage").hide();
                vm.showSuccessQueueMessage = null;
                vm.isProcessing = false;
                vm.isDeleting = false;
              }, 2500);
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
        // let object = {
        //   drop_id: drop.drop_id,
        //   instance_id: drop.instace_id,
        //   is_thumbnail: 0
        // };
        vm.isDeleting = true;
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image unlinked from the item";
        DataLakeAPIService.API.UpdateDrop(drop)
          .then(response => {
            vm.isDeleting = 1;
            vm.$updateBtnText = "Update";
            angular.element("#showQueueMessage").show();
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
      vm.thumbnailActive = false;
      $scope.notImage=false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.sequenceChangeError=false
      if (drop.is_thumbnailImage) {
        if (drop.stream.toLowerCase() === "cover image" && drop.is_thumbnail) {
          // show a confirmation panel to ask the permission to delete thumbnail also.
          vm.showConfirmDeletion = true;
        }else{
          vm.confirmRemoveThumbnailDrop(drop);
        }
      } else {
        // if stream is cover image
        if (drop.stream.toLowerCase() === "cover image" && drop.is_thumbnail) {
          // show a confirmation panel to ask the permission to delete thumbnail also.
          vm.showConfirmDeletion = true;
          // variable to store drop values
          vm.dropToDelete = drop;
        } else if (
          drop.stream.toLowerCase() === "thumbnail" &&
          drop.is_coverImage
        ) {
          vm.dropToDelete = undefined;
          let object = {
            drop_id: drop.drop_id,
            instance_id: drop.instace_id,
            is_thumbnail: 0
          };
          vm.isDeleting = true;
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Image unlinked from the item";
          DataLakeAPIService.API.UpdateDetails(object)
            .then(response => {
              vm.isDeleting = 1;
              vm.$updateBtnText = "Update";
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
            });
        } else {
          vm.dropToDelete = undefined;
          vm.removeDrop(drop)
            .then(() => { })
            .catch(() => { });
        }
      }
    };

    vm.addDropToQueue = (del) => {
      vm.isAddedToQueue = true;
      $scope.queuedDrops === undefined ? ($scope.queuedDrops = []) : null;
      vm.uniqueId = vm.uniqueId + 1;
      let queuedDropObject = {
        lake: $scope.selectedLakeStream?.lake,
        stream: $scope.selectedLakeStream.stream,
        stream_code: $scope.selectedLakeStream.stream_code,
        lake_id: $scope.drop.lake_id,
        stream_id: $scope.drop.stream_id,
        display_sequence: $scope.drop.display_sequence,
        duplicate:$scope.drop.duplicate,
        uuid: vm.uuid,
        source: 'local',
        url: undefined,
        // source: $scope.drop.source,
        status_id: $scope.drop.status_id,
        is_save_to_document_store: $scope.drop.is_save_to_document_store,
        // is_save_to_document_store: true,
        unique_id: vm.uniqueId,
        coverImgId: null
      };
      if(del){
        if(del.source==="url" && del.url){
          queuedDropObject.url=del.url
          queuedDropObject.thumbnail=del.url
        }
      }
      // if ($scope.drop.url) {
      //   queuedDropObject.url = $scope.drop.url;
      // } else if (!$scope.drop.url) {
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
      //           lake: queuedDropObject.lake,
      //           lake_id: queuedDropObject.lake_id,
      //           stream: "Thumbnail",
      //           stream_code: "thumbnail",
      //           stream_id: 1,
      //           url: queuedDropObject.url,
      //           file_name: queuedDropObject.file_name,
      //           is_coverImage: true,
      //           coverImgId: queuedDropObject.unique_id,
      //           unique_id: vm.uniqueId
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
      //       vm.resetValues();
      //       vm.isAddedToQueue = false;

      //     })
      //     .catch(error => {
      //       vm.isAddedToQueue = false;
      //       // vm.itemdataAddToQueueError = error.data;
      //       vm.itemdataAddToQueueError = "File type is not suitable for physical upload";
      //     });
      // } else {
        $scope.queuedDrops.sort(function(a, b) {
          return a.display_sequence - b.display_sequence;
        });
        for (let i = 0; i < $scope.queuedDrops.length; i++){
        if($scope.queuedDrops[i].display_sequence==queuedDropObject.display_sequence){
          for (let j = 0; j < $scope.queuedDrops.length; j++){
            if(j>=i){
              $scope.queuedDrops[j].display_sequence+=1
            }
          }
          queuedDropObject.duplicate=false
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
          url: queuedDropObject.url,
          file_name: queuedDropObject.file_name,
          files: queuedDropObject.files,
          status_id: queuedDropObject.status_id,
          display_sequence: 1,
          is_save_to_document_store: queuedDropObject.is_save_to_document_store,
          source: queuedDropObject.source,
          is_coverImage: true,
          coverImgId: queuedDropObject.unique_id,
          unique_id: vm.uniqueId,
          size: queuedDropObject.size,
          create_thumbnail: true
          // files: queuedDropObject.files
        };
        $scope.queuedDrops.push(obj);
      }

      if ($scope.queuedDrops.length > 0) {
        vm.isUploading = false;
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image added to the Queue";
        vm.resetValues();
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

    vm.imageUrl = null;
    vm.link = null
    vm.onClickSnap = () => {
      vm.snapCk().then(data => {
        let imageName = 'IMG' + Date.now() + '.JPG';
        data.name = imageName;
        // vm.link = URL.createObjectURL(data);
        data.lastModified = new Date();
        const myFile = new File([data], imageName, {
          type: data.type,
        });
        $scope.files = [myFile];
        // $scope.files.push(myFile);
        $scope.files && $scope.files.length
          ? checkType($scope.files[0].type)
          : null;
        vm.clickedSnap = true;
        $scope.isUpload = false;
        $scope.isDropUploaded = false;
      })

    }

    vm.OnchangeSubtype = (sku_sub_type) => {
      if ((vm.item_details && sku_sub_type != vm.item_details.item_sub_type) || sku_sub_type != $stateParams.type) {
        vm.sku_subtypechange = true;
      }
      else {
        vm.sku_subtypechange = false;
      }
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
      vm.link = null;
      vm.clickedSnap = false;
      vm.dvideo = document.querySelector("#video");
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }).then((stream) => {
          vm.dvideo.srcObject = stream;
          vm.dvideo.play();
        })
      }
    }

    vm.closeCam = () => {
      $('#myModal').modal('hide');
      vm.link = null;
      vm.stopStreamedVideo(vm.dvideo);
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

    vm.uploadQueuedDrops = insertedId => {
      if ($scope.queuedDrops) {
        let cover_ImageDrops = $scope.queuedDrops.filter(item => {
          return item.stream_id == 33 && item.is_thumbnailImage == 1;
        });
        if(cover_ImageDrops.length == 0) {
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
          // if ($scope.queuedDrops[i].is_thumbnailImage) {

          // }
          $scope.queuedDrops[i].instance_id = insertedId;
          $scope.queuedDrops[i].uuid = vm.uuid;
          DataLakeService.UploadDrop($scope.queuedDrops[i])
            .then(res => {
              /// After create of drops, it should be shown in the list immidietly
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
          drop.url = undefined;
          drop.is_save_to_document_store = undefined;
          // drop = $scope.drop;
          drop.source = "local"
          drop.instance_id = instanceId;
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
            .then(() => {
              vm.is_thumbnail = 1;
              if ($scope.isAllowMultipleDrops) {
                if (drop.source.toLowerCase() === "camera") {
                  $scope.drop.source = 'local';
                  vm.resetValues();
                }

              }
              /// After create of drops, it should be shown in the list immidietly
              vm.getItemMetaData();
              // reset manage drops page to initial state
              vm.resetModel();

              resolve(true);
              $timeout(() => {
                vm.isUploading = false;
                vm.isAddedToQueue = false;
                vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
                $scope.files = null;
                $scope.errFiles = null;
                vm.validationMessage = null;
              }, 2000);
            })
            .catch(error => {
              reject(false);
              logger.error(error);
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              // vm.itemdataUploaderror = error.data;
              vm.itemdataUploaderror = "File type is not suitable for physical upload";
            });
        } catch (error) {
          reject(false);
          logger.error(error);
        }
        $timeout(() => {
          // vm.isUploading = false;
          vm.isAddedToQueue = false;
          // vm.skudataUploaderror = false;
        }, 3000)
      });
    };

    // Storage function END

    // To insert the new Item with using the payload data entered in create new form
    vm.save = (entityName, payload) => {
      var dataToBeSaved = _.clone(payload);
      vm.$saveBtnText = "Saving Now...";
      var item_details = payload;
      if (
        entityName &&
        entityName.toLowerCase() === "itemmaster" &&
        !vm.disableActions
      ) {
        vm.isProcessing = true;
        vm.publishResponseMessage = true;
        dataToBeSaved.status_effective_date = $scope.getFormattedDate(
          payload.status_effective_date
        );
        dataToBeSaved.next_effective_date = $scope.getFormattedDate(
          payload.next_effective_date
        );
        dataToBeSaved.primary_item_hierarchy_id =
          $scope.itemConfig.primary_item_hierarchy_id;
        dataToBeSaved.primary_item_hierarchy_value_id =
          $scope.head.primary_item_hierarchy_value_id;
        // get division from primary_item_hierarchy_value_name --- it should be there for create new item when group by division is applied
        let item_path = payload.primary_item_hierarchy_value_name.split(">");
        payload.division = item_path[0];
        // get division/division/class from primary_item_hierarchy_value_name --- it should be there for create new item when group by division/division/class is applied
        payload.primary_item_hierarchy_value_desc =
          item_path[item_path.length - 1];
        // get item_type from $scope.allTypes --- it should be there for create new item when group by type is applied
        let typeIndex = $scope.allTypes.findIndex(
          type => type.item_type_id === Number(payload.item_type_id)
        );
        payload.item_type = $scope.allTypes[typeIndex].short_description;
        // if collection is not there then assign N/A
        if (!payload.collection) payload.collection = "N/A";
        dataToBeSaved.class = parseInt(payload.class);
        ItemService.API.InsertItem(dataToBeSaved)
          .then(response => {
            $scope.head.id = response.data.inserted_id;
            vm.isProcessing = false;
            vm.savedToMasterList = true;
            vm.showparametervalues = false;
            // assigning next_effective_date --- it should be there for create new item when group by any field is applied
            payload.next_status && payload.next_status.toLowerCase() === "none" ?
              (payload.next_effective_date = "1970-01-01") :
              "";
            // Variable to show the Published review section.
            payload.id = dataToBeSaved.id = response.data.inserted_id;
            vm.inserted_item_id = response.data.inserted_id;
            vm.insertedData = payload;
            vm.uploadQueuedDrops(response.data.inserted_id);
            // After creating item, updalod drops which are in queue
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              response: response.data,
              inserted_id: response.data.inserted_id
            }); // Calling saveOrUpdateUdd function which is in user defined data controller to update the UDD details of item going to be created
            vm.opdone = true;
            vm.insertItemVendors(payload.id);
            // reset vendors that are override in dblClick()
            let vendorIndex = $scope.allVendors.findIndex(
              vendor => vendor.id === Number(payload.vendor_id)
            );
            dataToBeSaved.vendor = $scope.allVendors[vendorIndex].name;
            // push newly created item to list of items
            dataToBeSaved.collection_id === undefined ||
              dataToBeSaved.collection_id === null ?
              (dataToBeSaved.collection = "NA") :
              null;
            vm.itemsDataList.length > 0 ?
              vm.itemsDataList.unshift(dataToBeSaved) :
              (vm.itemsDataList = dataToBeSaved);
            vm.ItemMap[dataToBeSaved.id] = dataToBeSaved;
            vm.fetchPropertiesForAnItem(vm.ItemMap[dataToBeSaved.id]);
            // if group by filter is applied then update item from group array
            if (vm.groupByField) {
              // find index of group under which current item exist
              let groupFieldIndex = vm.groupItems.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );
              if (groupFieldIndex === -1) {
                vm.groupItems.push({
                  [vm.groupByField]: dataToBeSaved[vm.groupByField],
                  count: 1,
                  expanded: false,
                  selected: 1,
                  items: [dataToBeSaved]
                });
              } else if (
                groupFieldIndex > -1 &&
                vm.groupItems[groupFieldIndex].items
              ) {
                vm.groupItems[groupFieldIndex].items.unshift(dataToBeSaved);
                vm.groupItems[groupFieldIndex].count++;
              } else {
                vm.groupItems[groupFieldIndex].count++;
              }
              vm.groupItemsMap[dataToBeSaved.id] === undefined ?
                (vm.groupItemsMap[dataToBeSaved.id] = dataToBeSaved) :
                "";
            }

            vm.loadImage(vm.insertedData, "165x165");
          })
          .catch(error => {
            vm.isProcessing = false;
            $scope.itemErrorMessage =
              error.data.error?.message ||
              error.data.message ||
              error.data.error;
          });
      } else if (
        entityName &&
        entityName.toLowerCase() === "itemcollections" &&
        !vm.disableActions
      ) {
        vm.$saveCollBtnText = "Saving Now...";
        vm.previousC = payload;
        ItemCollectionService.API.InsertItemCollection(payload)
          .then(response => {
            vm.$savesuccess = true;
            vm.$saveCollBtnText = "Save";
            let pay = {};
            pay.collection_id = response.data.inserted_id;
            if ($scope.vendor_id) {
              pay.vendor_id = $scope.vendor_id;
            } else {
              pay.vendor_id = $scope.head.vendor_id;
              // goto update state if id exists in data map
            }
            ItemCollectionService.API.LinkVendorToCollection(pay)
              .then(response => {
                vm.loadCollections(pay.vendor_id);
                if ($scope.allowCollectionDetails && $scope.allowCollectionDetails.yes_or_no) {
                  $scope.head.collection_id = pay.collection_id;
                } else if ($scope.head.selectedCollection && $scope.head.selectedCollection.length) {
                  $scope.head.selectedCollection.push(
                    { collection_id: pay.collection_id, collection: payload.short_description }
                  )
                } else {
                  $scope.head.selectedCollection = [
                    { collection_id: pay.collection_id, collection: payload.short_description }
                  ]
                }
                vm.onCollectionChange();
              })
              .catch(error => {
                logger.error(error);
              });
            vm.$saveCollBtnText = "Save";
            vm.$savesuccess = true;
          })
          .catch(error => {
            if (error.status === 412) {
              let pay = {};
              let collection = _.filter(vm.itemCollections, collection => {
                return collection.short_description.toLowerCase() ===
                  vm.itemCol_details.short_description.toLowerCase() ?
                  collection.id :
                  null;
              });
              if ($scope.vendor_id) {
                pay.vendor_id = $scope.vendor_id;
              } else {
                pay.vendor_id = $scope.head.vendor.id;
                // goto update state if id exists in data map
              }
              // if collection is there, then assign collection.id to pay.collection_id
              if (collection && collection[0]) {
                pay.collection_id = collection[0].id;
                ItemCollectionService.API.LinkVendorToCollection(pay)
                  .then(response => {
                    vm.loadCollections(pay.vendor_id);
                    vm.$savesuccess = true;
                    vm.$saveCollBtnText = "Save";
                    vm.fetchItemUdds();
                    if ($scope.allowCollectionDetails && $scope.allowCollectionDetails.yes_or_no) {
                      $scope.head.collection_id = pay.collection_id;
                    } else if ($scope.head.selectedCollection && $scope.head.selectedCollection.length) {
                      $scope.head.selectedCollection.push(
                        { collection_id: collection[0].id, collection: collection[0].short_description }
                      )
                    } else {
                      $scope.head.selectedCollection = [
                        { collection_id: collection[0].id, collection: collection[0].short_description }
                      ]
                    }
                    vm.onCollectionChange();
                  })
                  .catch(error => {
                    vm.$saveCollBtnError = true;
                    vm.$saveCollBtnText = "Oops.!! Something went wrong";
                    vm.itemErrorMessage = "Record already exists";
                    $timeout(() => {
                      vm.message = null;
                      vm.$saveCollBtnText = "Save";
                      vm.$saveCollBtnError = false;
                      vm.itemErrorMessage = null;
                      angular.element("#short_description").focus();
                    }, 2500);
                  });
              } else {
                vm.$saveCollBtnError = true;
                vm.$saveCollBtnText = "Oops.!! Something went wrong";
                vm.itemErrorMessage = error.data.error.message;
                $timeout(() => {
                  vm.message = null;
                  vm.$saveCollBtnText = "Save";
                  vm.$saveCollBtnError = false;
                  vm.itemErrorMessage = null;
                  angular.element("#short_description").focus();
                }, 2500);
              }
            }
          });
      }
    };

    // On add button push the vendors into an array
    vm.addVendorsToItem = () => {
      vm.duplicateVendorMessage = undefined;
      vm.itemVendors === undefined ? (vm.itemVendors = []) : null;
      vm.itemVendorIds === undefined ? (vm.itemVendorIds = []) : null;
      // Auto increment the priority on each vendor addition to item
      vm.itemVendors.length > 0 ?
        (vm.priority =
          vm.itemVendors[vm.itemVendors.length - 1]["priority"] + 1) :
        (vm.priority = 1);
      let vendorObject = {
        // vendor: vm.vendorsMap[$scope.head.Vendor.id]["name"],
        vendor: $scope.head.Vendor.id.name,
        vendor_id: $scope.head.Vendor.id.id,
        type_id: $scope.head.Vendor.id.type_id,
        priority: vm.priority,
        // VendorType: vm.vendorsMap[$scope.head.Vendor.id]["VendorType"],
        VendorType: $scope.head.Vendor.id.VendorType,
        isQueuedVendor: true
      };
      if (vm.itemVendorIds.includes(vendorObject.vendor_id) || parseInt($scope.head.vendor_id) === vendorObject.vendor_id) {
        vm.duplicateVendorMessage = "Vendor already linked to item.";
      } else {
        vm.itemVendorIds.push(vendorObject.vendor_id);
        vm.itemVendors.push(vendorObject);
      }
      $timeout(() => {
        $scope.head.Vendor = {};
      }, 0);
    };

    // Check for alternative vendor while changing it to primary vendor
    vm.checkForAlternativeVendor = primary_vendor_id => {
      for (let i = 0; i < vm.itemVendors.length; i++) {
        if (vm.itemVendors[i].vendor_id === parseInt(primary_vendor_id)) {
          vm.alternativeVendorDetails = vm.itemVendors[i];
          $("#primaryVendorChange").modal("show");
        }
      }
    };

    // Assign the primary vendor value
    vm.assignPrimaryVendorOnChange = confirmChange => {
      if (confirmChange === 0) {
        $("#primaryVendorChange").modal("hide");
        $scope.head.vendor.id = vm.originalVendor;
      } else {
        $("#primaryVendorChange").modal("hide");
        vm.removeVendorFromItem(vm.alternativeVendorDetails);
      }
    };

    vm.changeVendor = vendorId => {
      $scope.head.vendor = {}
      if (
        vm.itemVendors.some(v => v.vendor_id === parseInt(vendorId)) ||
        parseInt($scope.head.vendor.id) === parseInt(vendorId)
      ) {
        vm.isPrimaryVendorLinked = vm.selectedVendor;
        vm.duplicateVendorMessage = "Vendor already linked to item.";
        vm.itemErrorMessage = vm.duplicateVendorMessage;
      } else {
        vm.duplicateVendorMessage = undefined;
      }
    };

    // Loop through added item vendor objects and insert
    vm.insertItemVendors = insertedItemId => {
      return new Promise((resolve, reject) => {
        if (vm.itemVendors.length > 0) {
          for (let i = 0; i < vm.itemVendors.length; i++) {
            vm.itemVendors[i].item_id = insertedItemId;
            vm.addVendorToItem(vm.itemVendors[i]);
            i === vm.itemVendors.length - 1 ? resolve(true) : null;
          }
        }
      })
    };

    // Add vendors to an item
    vm.addVendorToItem = itemVendor => {
      // If item it is undefined then set the item selected to update as item id
      itemVendor.item_id === undefined ?
        (itemVendor.item_id = $stateParams.id) :
        null;
      ItemService.API.LinkVendorToItem(itemVendor)
        .then(response => {
          vm.fetchVendorsForAnItem(itemVendor.item_id);
          $scope.itemSuccessMessage = "Vendor linked to item successfully!";
        })
        .catch(error => {
          logger.error(error);
        });
      $timeout(() => {
        $scope.itemErrorMessage = null;
        $scope.itemSuccessMessage = null;
      }, 2500);
    };

    // Remove vendor linked to an item
    vm.removeVendorFromItem = (itemVendor, $index) => {
      if ($stateParams.id && itemVendor.isQueuedVendor !== true) {
        ItemService.API.UnlinkVendorFromItem(itemVendor, itemVendor.priority)
          .then(response => {
            $scope.itemSuccessMessage = "Vendor unlinked successfully!";
            vm.itemVendors.splice($index, 1);
            for (let i = 0; i < vm.itemVendorIds.length; i++) {
              if (vm.itemVendorIds[i] == itemVendor.vendor_id) { vm.itemVendorIds.splice(i, 1) }
            }
          })
          .catch(error => {
            $scope.itemErrorMessage = error.data.error;
            logger.error(error);
          });
      } else {
        vm.itemVendors.splice($index, 1);
        let index = this.itemVendorIds.findIndex(
          itemVendorId => itemVendorId === itemVendor.vendor_id
        );
        vm.itemVendorIds.splice(index, 1);
      }
      if (itemVendor.vendor_id == parseInt(vm.selectedVendor.id)) {
        vm.duplicateVendorMessage = null;
        vm.isPrimaryVendorLinked = undefined;
      }
      $timeout(() => {
        $scope.itemErrorMessage = null;
        $scope.itemSuccessMessage = null;
      }, 2500);
    };

    vm.hasUpdateChanges = payload => {
      vm.oldItem["status_effective_date"] = moment(
        vm.oldItem["status_effective_date"]
      ).format("YYYY-MM-DD");
      vm.oldItem["next_effective_date"].toLowerCase() === "none" ?
        (vm.oldItem["next_effective_date"] = "1970-01-01") :
        null;
      let omitKeys = [
        "thumbnail",
        "status",
        "next_status",
        "department_tree_path",
        "summaryThumbnail",
        "drop_id",
        "primary_item_hierarchy_value_name",
        "vendor",
        "selectedTreePathId",
        "selectedTreePath",
        "Vendor",
        "isShowUpdateProcessing",
        "department_id",
        "old_division_id",
        "old_department_id",
        "old_class",
        "old_type_id",
        "old_collection_id",
        "primary_item_hierarchy",
        "has_error",
        "individual_id_or_company_id"
      ];
      for (let key in payload) {
        if (!omitKeys.includes(key)) {
          if (payload[key] == vm.oldItem[key]) {
            vm.hasUpdate = false;
          } else if (payload[key] != vm.oldItem[key]) {
            return (vm.hasUpdate = true);
          }
        }
      }
      return vm.hasUpdate;
    };

    vm.update = (entityName, payload) => {
      var dataToBeUpdate = _.clone(payload);
      vm.$updateBtnText = "Updating Now...";
      dataToBeUpdate.status_effective_date = $scope.getFormattedDate(
        payload.status_effective_date
      );
      dataToBeUpdate.next_effective_date = $scope.getFormattedDate(
        payload.next_effective_date
      );
      if (dataToBeUpdate.next_status_id === 500) {
        dataToBeUpdate.next_effective_date = "1970-01-01";
      }
      if (
        entityName &&
        entityName.toLowerCase() === "itemmaster" &&
        !vm.disableActions
      ) {
        // variable to controle the loader functionality
        vm.isProcessing = true;
        // Variable to show the Published review section.
        vm.publishResponseMessage = true;
        if (dataToBeUpdate.class === null) {
          delete dataToBeUpdate.class;
        }

        if (dataToBeUpdate.set_pricing_method === null) {
          delete dataToBeUpdate.set_pricing_method;
        }
        dataToBeUpdate.primary_item_hierarchy_id =
          $scope.itemConfig.primary_item_hierarchy_id;
        dataToBeUpdate.primary_item_hierarchy_value_id =
          $scope.head.primary_item_hierarchy_value_id;
        dataToBeUpdate.buyer_id = $scope.buyer_hierarchy_value_id;
        dataToBeUpdate.vendor_id = vm.selectedVendor.id;
        dataToBeUpdate.next_status = $scope.head.next_status = $scope.nextStatusMap[$scope.head.next_status_id];
        if (!vm.validateItemForm()) {
          if (vm.hasUpdateChanges(dataToBeUpdate)) {
            dataToBeUpdate.has_error = 0;
            dataToBeUpdate.sku_subtypechange = vm.sku_subtypechange;
            ItemService.API.UpdateItem(dataToBeUpdate)
              .then(response => {
                response.data.data.collection = dataToBeUpdate.collection;
                if (!response.data.data.collection) response.data.data.collection = "N/A";
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "update",
                  response: response.data,
                  inserted_id: payload.id
                });
                vm.item_details = $scope.head;
                vm.opdone = true;
                vm.isProcessing = false;
                response.data.data.thumbnail = payload.thumbnail;
                vm.getItemMetaData();
                let index = this.itemsDataList.findIndex(
                  item => item.id === payload.id
                );
                if (this.itemsDataList[index] && dataToBeUpdate.romanic_copy != this.itemsDataList[index].romanic_copy) {
                  ItemService.API.UpdateItemSkusFieldByItemId(
                    {
                      item_id: dataToBeUpdate.id,
                      field_name: 'romanic_copy',
                      field_value: dataToBeUpdate.romanic_copy
                    }
                  )
                    .then(() => { })
                    .catch(() => { });
                  ItemService.API.UpdateItemSkusFieldByItemId(
                    {
                      item_id: dataToBeUpdate.id,
                      field_name: 'text_romanic_copy',
                      field_value: dataToBeUpdate.romanic_copy.replace(/<[^>]*>/g, "")
                        .replace(/&nbsp;*/g, " ")
                    }
                  )
                    .then(() => { })
                    .catch(() => { });
                }
                if (vm.selectedVendor && this.itemsDataList[index] && this.itemsDataList[index].vendor_id !== vm.selectedVendor.id) {
                  for (let i = 0; i < this.itemsDataList[index].availableSkus.length; i++) {
                    this.itemsDataList[index].availableSkus[i].vendor_item_number = null;
                  }
                }
                // vm.selectedVendor = {};
                // if group by filter is applied then delete item from group array
                if (vm.groupByField) {
                  if (vm.groupByField === "vendor") {
                    // find index of group under which current item exist
                    let groupFieldIndex = vm.groupItems.findIndex(
                      group =>
                        group[vm.groupByField] ===
                        vm.vendorsMap[vm.groupItemsMap[payload.id].vendor_id]
                          .name
                    );
                    // find index of item from item list under the selected group
                    let groupIndex = vm.groupItems[
                      groupFieldIndex
                    ].items.findIndex(
                      item => parseInt(item.id) === parseInt(payload.id)
                    );
                    if (groupFieldIndex === -1) {
                      vm.groupItems.push({
                        [vm.groupByField]: payload[vm.groupByField],
                        count: 1,
                        expanded: false,
                        selected: 1,
                        items: [payload]
                      });
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupItems[groupFieldIndex].items[groupIndex][
                      vm.groupByField
                      ] !== response.data.data[vm.groupByField]
                    ) {
                      vm.groupItems[groupFieldIndex].items.splice(
                        groupIndex,
                        1
                      );
                      vm.groupItems[groupFieldIndex].count--;
                      let newGroupFieldIndex = vm.groupItems.findIndex(
                        group =>
                          group[vm.groupByField] ===
                          response.data.data[vm.groupByField]
                      );
                      if (newGroupFieldIndex === -1) {
                        vm.groupItems.push({
                          [vm.groupByField]: response.data.data[vm.groupByField],
                          count: 1,
                          expanded: false,
                          selected: 1,
                          items: [response.data.data]
                        });
                      } else if (
                        newGroupFieldIndex > -1 &&
                        vm.groupItems[newGroupFieldIndex].items
                      ) {
                        vm.groupItems[newGroupFieldIndex].items.unshift(
                          response.data.data
                        );
                        vm.groupItems[newGroupFieldIndex].count++;
                        vm.groupItemsMap[payload.id] = response.data.data;
                      } else {
                        vm.groupItems[newGroupFieldIndex].count++;
                      }
                      // Update item to Map
                      vm.groupItemsMap[payload.id] = response.data.data;
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupItems[groupFieldIndex].items
                    ) {
                      // Update item to list
                      vm.groupItems[groupFieldIndex].items[groupIndex] =
                        response.data.data;
                      vm.groupItemsMap[payload.id] = response.data.data;
                    } else {
                      //vm.groupItems[groupFieldIndex].count++;
                    }
                  } else {
                    // find index of group under which current item exist
                    let groupFieldIndex = vm.groupItems.findIndex(
                      group =>
                        group[vm.groupByField] ===
                        vm.groupItemsMap[payload.id][vm.groupByField]
                    );
                    // find index of item from item list under the selected group
                    let groupIndex = vm.groupItems[
                      groupFieldIndex
                    ].items.findIndex(
                      item => parseInt(item.id) === parseInt(payload.id)
                    );
                    if (groupFieldIndex === -1) {
                      vm.groupItems.push({
                        [vm.groupByField]: payload[vm.groupByField],
                        count: 1,
                        expanded: false,
                        selected: 1,
                        items: [payload]
                      });
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupItems[groupFieldIndex].items[groupIndex][
                      vm.groupByField
                      ] !== response.data.data[vm.groupByField]
                    ) {
                      vm.groupItems[groupFieldIndex].items.splice(
                        groupIndex,
                        1
                      );
                      vm.groupItems[groupFieldIndex].count--;
                      let newGroupFieldIndex = vm.groupItems.findIndex(
                        group =>
                          group[vm.groupByField] ===
                          response.data.data[vm.groupByField]
                      );
                      if (newGroupFieldIndex === -1) {
                        vm.groupItems.push({
                          [vm.groupByField]: response.data.data[vm.groupByField],
                          count: 1,
                          expanded: false,
                          selected: 1,
                          items: [response.data.data]
                        });
                      } else if (
                        newGroupFieldIndex > -1 &&
                        vm.groupItems[newGroupFieldIndex].items
                      ) {
                        vm.groupItems[newGroupFieldIndex].items.unshift(
                          response.data.data
                        );
                        vm.groupItems[newGroupFieldIndex].count++;
                        vm.groupItemsMap[payload.id] = response.data.data;
                      } else {
                        vm.groupItems[newGroupFieldIndex].count++;
                      }
                      // Update item to Map
                      vm.groupItemsMap[payload.id] = response.data.data;
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupItems[groupFieldIndex].items
                    ) {
                      // Update item to list
                      vm.groupItems[groupFieldIndex].items[groupIndex] =
                        response.data.data;
                      vm.groupItemsMap[payload.id] = response.data.data;
                    } else {
                      //vm.groupItems[groupFieldIndex].count++;
                    }
                  }
                }
                vm.fetchPrimaryHierarchyAndValue(response.data.data);
                if (index >= 0) {
                  // Store the path created into a response variable
                  //response.data.data.path = this.itemsDataList[index].path;

                  response.data.data.availableSkus = this.itemsDataList[
                    index
                  ].availableSkus;
                  this.itemsDataList[index] = response.data.data;
                }
                vm.ItemMap[payload.id] = response.data.data;
                vm.oldItem = response.data.data;
                common.$timeout(() => {
                  vm.showUpdateItemPanel = false;
                }, 2000);
                //vm.getItemTypePath(this.itemsDataList);
                vm.insertItemVendors(payload.id);
                vm.pushChangeIndicationToMessageQueue(payload);
              })
              .catch(error => {
                vm.isProcessing = false;
                if (error.status === 505) {
                  $scope.itemErrorMessage = error.data.error.message;
                } else {
                  $scope.itemErrorMessage = error.data.error.message;
                }
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "update",
                  response: error
                });
                vm.pushChangeIndicationToMessageQueue(payload);
              });
          } else {
            vm.isProcessing = false;
            let index = this.itemsDataList.findIndex(
              item => item.id === payload.id
            );
            vm.insertItemVendors(payload.id);
            vm.opdone = true;
            let response = {
              status: 403,
              message: "Nothing to update in master details."
            };
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "update",
              response: response,
              inserted_id: payload.id
            });
            // dataToBeUpdate.has_error = 0;
            // ItemService.API.UpdateItem(dataToBeUpdate).then(response => { });
          }
        } else {
          vm.isProcessing = false;
          let response = {
            status: 412,
            form_validation_error: vm.validationError
          };
          $scope.$broadcast("saveOrUpdateUdd", {
            event: "update",
            response: response,
            inserted_id: payload.id
          });
        }
      }
    };

    vm.showDependencyListDetails = data => {
      vm.$errorDependentData = data;
      vm.$showErrorDetailsData = true;
      vm.$showErrorDetails = true;
      common.$timeout(() => {
        angular.element("#dep_det_close").focus();
      }, 1000);
    };

    vm.checkCancelScreen = null;
    vm.delete = (payload, screen) => {
      vm.checkCancelScreen = screen;
      vm.isLoadingDelete = true;
      if (!vm.disableActions) {
        ItemService.API.DeleteItem(payload)
          .then(() => {
            vm.isLoadingDelete = false;
            vm.opdone = true;
            let index = this.itemsDataList.findIndex(
              item => item.id === payload.id
            );

            // if group by filter is applied then delete item from group array
            if (vm.groupByField) {
              if (vm.groupByField === "vendor") {
                // find index of group under which current item exist
                let groupFieldIndex = vm.groupItems.findIndex(
                  group =>
                    group[vm.groupByField] ===
                    vm.vendorsMap[Number(payload[vm.groupByField].id)].name
                );
                // find index of item from item list under the selected group
                let groupIndex = vm.groupItems[groupFieldIndex].items.findIndex(
                  item => parseInt(item.id) === parseInt(payload.id)
                );
                // Delete item from list
                vm.groupItems[groupFieldIndex].items.splice(groupIndex, 1);
                vm.groupItems[groupFieldIndex].count -= 1; //decrease item count of the group
                delete vm.groupItemsMap[payload.id];
                vm.limit =
                  vm.groupItems[groupFieldIndex].items.length + vm.limit;
                vm.groupItems[groupFieldIndex].groupPage -= 1;
              } else {
                // find index of group under which current item exist
                let groupFieldIndex = vm.groupItems.findIndex(
                  group => group[vm.groupByField] === payload[vm.groupByField]
                );
                // find index of item from item list under the selected group
                let groupIndex = vm.groupItems[groupFieldIndex].items.findIndex(
                  item => parseInt(item.id) === parseInt(payload.id)
                );
                // Delete item from list
                vm.groupItems[groupFieldIndex].items.splice(groupIndex, 1);
                vm.groupItems[groupFieldIndex].count -= 1; //decrease item count of the group
                delete vm.groupItemsMap[payload.id];
                vm.limit =
                  vm.groupItems[groupFieldIndex].items.length + vm.limit;
                vm.groupItems[groupFieldIndex].groupPage -= 1;
              }
            }
            this.itemsDataList.splice(index, 1);
            vm.ItemMap.splice(payload.id, 1);
            vm.totalRecordCount = vm.totalRecordCount - 1;
            /* variables to reset the Notification message-start */
            $scope.itemSuccessMessage = null;
            $scope.itemErrorMessage = null;
            $scope.itemUDDSuccessMessage = null;
            /* variables to reset the Notification message-end */
            // vm.reload();
            vm.exit();
          })
          .catch(error => {
            vm.dependencyList = error.data.dependency;
            vm.$showErrorDetailsData = true;
            $("#rcrightsidebar").focus();
            if (error.status === 412) {
              vm.dependencyList = error.data.dependency;
              vm.$showErrorDetailsData = true;
            } else {
              vm.deleteItemMessage = "Error while deleting Item";
              common.$timeout(() => {
                vm.deleteItemMessage = null;
                vm.confirmDelete = false;
              }, 2500);
            }
          });
      }
    };

    //Function to check if AS400 changes are being made to the selected item
    vm.hasAS400Changes = payload => {
      for (let key in payload) {
        let checkKeys = ["status_id", "vendor_id", "buyer_id"];
        if (checkKeys.includes(key)) {
          if (payload[key] == vm.oldItem[key]) {
            vm.hasUpdate = false;
          } else if (payload[key] != vm.oldItem[key]) {
            return (vm.hasUpdate = true);
          }
        }
      }
      return vm.hasUpdate;
    };

    //Function to push IDs of item into message queue to sync changes to AS400
    vm.pushChangeIndicationToMessageQueue = (updatedPayload) => {
      if (vm.hasAS400Changes) {
        ItemService.API.CaptureItemChangeInQueue(vm.uuid, updatedPayload.id)
          .then(result => {

          })
          .catch(error => {
            console.log(error);
          })
      }
    }

    vm.initializeItemUserDefinedDataDirective = head => {
      if (head !== null) {
        $scope.head = head;
      } else {
        $scope.head = {};
        vm.availableSkus = {};
        vm.isSkuLoaded = false;
      }
      $scope.uddData = [];
    };

    // Get permissions of crud permission for item
    $scope.getAccessPermissions(vm.uuid)
      .then(result => {
        vm.itemPermissions = result;
        vm.Activate();
      })
      .catch(error => {
        vm.itemPermissions = error.data;
        vm.Activate();
      });
    vm.watchers();
    $scope.isEnabled = false;

    vm.reloadUDDs = () => {
      if (vm.alloweditstatuspassword && (vm.changingdate || vm.changingstatus || vm.changingnextdate || vm.changingnextstatus)) {
        vm.showLockedScreenStatus = true;
        vm.LoadingSecndryAuth = true;
      }
      $scope.isEnabled = false;
      common.$timeout(() => {
        $scope.isEnabled = true;
      }, 1);
    };

    vm.resettoDefault = () => {
      if (vm.changingstatus) {
        $scope.head.status_id = (!$state.current.name.includes(".new") && vm.oldItem?.status_id) ? vm.oldItem.status_id : 100;
        if ($state.current.name.includes(".new")) $scope.head.status = "Pending Active";
      }
      if (vm.changingdate) $scope.head.status_effective_date = vm.oldItem?.status_effective_date ? vm.oldItem.status_effective_date.includes("/") ? vm.oldItem.status_effective_date : $scope.getFormattedDate(vm.oldItem.status_effective_date) : moment()
        .utcOffset("0")
        .format($scope.date_format);
      if (vm.changingnextstatus) {
        if ($state.current.name.includes(".new")) $scope.head.next_status = "None";
        $scope.head.next_status_id = vm.oldItem?.next_status_id ? vm.oldItem.next_status_id : 500;
        $scope.changeevent($scope.head);
      }
      if (vm.changingnextdate) $scope.head.next_effective_date = vm.oldItem?.next_effective_date ? vm.oldItem.next_effective_date.includes("/") ? vm.oldItem.next_effective_date : $scope.getFormattedDate(vm.oldItem.next_effective_date) : '';
      common.$timeout(() => {
        vm.changingdate = vm.changingnextdate = vm.changingnextstatus = vm.changingstatus = false;
      }, 2500);
      vm.LoadingSecndryAuth = false;
    }

    vm.changeStatusFields = () => {
      if (vm.alloweditstatuspassword && (($scope.head.next_status_id !== $scope.head.status_id) || vm.changingnextdate || vm.changingdate)) {
        vm.showLockedScreenStatus = true;
        vm.LoadingSecndryAuth = true;
      }
      else {
        if (vm.changingnextstatus) $scope.changeevent($scope.head)
      }
    }

    // This function will be called when click event happens on Next button taking screen name as parameter to move forward
    vm.goToScreen = screen => {
      vm.resetFormField();
      vm.validationMessage = null;
      vm.validationError = [];
      vm.publishResponseMessage = false;
      vm.itemdataUploaderror = false;
      vm.opdone = false;
      if (screen && screen.toLowerCase() === "itemmasterscreen") {
        vm.createStage = true;
        vm.configureItemVendorStage = false;
        vm.configureItemVendorScreen = false;
        vm.configureStage = false;
        vm.previewandpublishStage = false;
        vm.createForm = true;
        vm.itemSetForm = false;
        vm.manageDropScreen = false;
        vm.configureScreen = false;
        vm.previewAndPublish = false;
        vm.confirmDelete = false;
        // Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      } else if (
        screen &&
        screen.toLowerCase() === "itemvendorconfigurationscreen"
      ) {
        // if current screen is create/update master data form and form data
        vm.createStage = true;
        vm.configureStage = false;
        vm.configureItemVendorStage = true;
        vm.configureItemVendorScreen = true;
        vm.createForm = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.itemSetForm = false;
        vm.previewAndPublish = false;
        vm.back = true;
        vm.showUpdateItemPanel = false;
        // Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      } else if (
        screen &&
        screen.toLowerCase() === "userdefineddataconfigurationscreen"
      ) {
        vm.showUpdateItemPanel = false;
        vm.createStage = false;
        vm.configureItemVendorScreen = false;
        vm.configureStage = true;
        vm.createForm = false;
        vm.configureScreen = true;
        vm.manageDropScreen = false;
        vm.itemSetForm = false;
        vm.previewAndPublish = false;
        vm.back = true;
        $scope.isEnabled = true;
        // Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      } else if (screen && screen.toLowerCase() === "setconfigurationscreen") {
        vm.configureItemVendorScreen = false;
        vm.showUpdateItemPanel = false;
        vm.configureScreen = false;
        vm.itemSetForm = true;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.createForm = false;
        vm.back = true;
        // Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      } else if (screen && screen.toLowerCase() === "dropconfigurationscreen") {
        vm.showUpdateItemPanel = false;
        vm.createForm = false;
        vm.configureScreen = false;
        vm.itemSetForm = false;
        vm.configureItemVendorScreen = false;
        vm.configureItemVendorStage = false;
        vm.previewAndPublish = false;
        vm.manageDropScreen = true;
        vm.back = true;
      } else if (screen && screen.toLowerCase() === "publishscreen") {
        vm.showUpdateItemPanel = false;
        vm.createForm = false;
        vm.configureScreen = false;
        vm.itemSetForm = false;
        vm.configureItemVendorScreen = false;
        vm.configureItemVendorStage = false;
        vm.previewAndPublish = true;
        vm.manageDropScreen = false;
        vm.back = true;
      }
    };

    // This function will be called when click event happens on Next button taking screen name as parameter to move forward
    vm.validateItemForm = () => {
      vm.validationError = [];
      vm.isInvalidForm = false;
      // if current screen is create/update master data form and form data
      // is valid and all mandatory fields are filled then go to next stage
      if (
        $scope.head.type_id &&
        $scope.head.description &&
        $scope.head.status_effective_date &&
        $scope.head.vendor_id &&
        $scope.head.primary_item_hierarchy_value_id &&
        $scope.head.buyer_id && ($scope.head.next_status_id != $scope.head.status_id)
      ) {
        vm.isInvalidForm = false;
      } else {
        // Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in Item Master Screen."
        );
      }

      if (
        (
          vm.uddForm &&
          vm.uddForm.$invalid &&
          $state.current.name.includes(".update")
        )
        ||
        (
          $state.current.name.includes(".new") && (!vm.uddForm || vm.uddForm.$invalid) && $stateParams["UDD_config"]?.length
        )
      ) {
        // Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in UDD Configuration Screen."
        );
      } else {
        vm.isInvalidForm !== true ? (vm.isInvalidForm = false) : null;
      }
      if (vm.duplicateVendorMessage) {
        // Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors in Item Vendor Configuration Screen."
        );
      }
      return vm.isInvalidForm;
    };

    // This function will be called when click event happens on Next button taking screen name as parameter to move forward
    vm.continueFn = screen => {
      vm.resetFormField();
      $scope.itemErrorMessage = null;
      $scope.itemSuccessMessage = null;
      vm.showUpdateItemPanel = false;
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      if (vm.configureScreen === undefined) {
        vm.createForm = false;
        vm.previewAndPublish = true;
        vm.itemSetForm = false;
        vm.back = false;
      } else if (screen && screen.toLowerCase() === "createform") {
        if (!vm.duplicateVendorMessage) {
          vm.createStage = true;
          vm.configureItemVendorScreen = false;
          vm.configureStage = true;
          vm.createForm = false;
          vm.configureScreen = true;
          vm.manageDropScreen = false;
          vm.itemSetForm = false;
          vm.previewAndPublish = false;
          vm.back = true;
          $scope.isEnabled = true;
          // Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
        }
      } else if (
        screen &&
        screen.toLowerCase() === "configureitemvendorscreen"
      ) {
        // if current screen is create/update master data form and form data
        // is valid and all mandatory fields are filled then go to next stage
        if (
          vm.item_maint_form &&
          !vm.item_maint_form.$invalid &&
          $scope.head.primary_item_hierarchy_value_id !== undefined &&
          $scope.head.primary_item_hierarchy_value_id !== null &&
          $scope.head.buyer_id !== undefined &&
          $scope.head.buyer_id !== null && ($scope.head.next_status_id != $scope.head.status_id)
        ) {
          vm.createStage = true;
          vm.configureStage = false;
          vm.configureItemVendorStage = true;
          vm.configureItemVendorScreen = true;
          vm.createForm = false;
          vm.configureScreen = false;
          vm.manageDropScreen = false;
          vm.itemSetForm = false;
          vm.previewAndPublish = false;
          vm.back = true;
          //  $scope.isEnabled = false;
          // common.$timeout(() => {
          //   $scope.isEnabled = true;
          // }, 100);

          // Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
        } else {
          // Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        if (vm.uddForm && vm.uddForm.$invalid) {
          // Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        } else {
          vm.createStage = true;
          vm.configureStage = true;
          vm.configureItemVendorStage = true;
          vm.configureItemVendorScreen = false;
          vm.itemSetStage = true;
          vm.configureScreen = false;
          vm.itemSetForm = true;
          vm.previewAndPublish = false;
          vm.back = true;
          // Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
        }
      } else if (screen && screen.toLowerCase() === "itemsetform") {
        if (vm.uddForm && vm.uddForm.$invalid) {
          // Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        } else {
          vm.configureScreen = false;
          vm.itemSetForm = false;
          vm.manageDropScreen = true;
          vm.back = true;
          // Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
        }
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        if ($scope.files && $scope.files.length > 0) {
          let btnLabel = $stateParams.id ? "'Upload Image'" : "'Add to Queue'";
          if (vm.drop_form.$valid) {
            vm.validationMessage = `Please click on ${btnLabel} button to link drop to Item. Click on 'Skip' button to proceed without uploading.`;
          } else {
            vm.validationMessage = `Please fill in the required fields and click on ${btnLabel} button to link drop to Item or Click on 'Skip' button to proceed without uploading.`;
          }
        } else {
          vm.configureScreen = false;
          vm.itemSetForm = false;
          vm.manageDropScreen = false;
          vm.previewAndPublish = true;
          vm.back = true;
        }
      } else if (screen && screen.toLowerCase() === "skip") {
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.back = true;
        vm.validationMessage = null;
      }
    };

    // This function will be called when click event happens on Back button taking screen name as parameter to move backward
    vm.backFn = screen => {
      vm.resetFormField();
      vm.validationMessage = null;
      // $scope.head.vendor = {};
      $scope.head.vendor.id = $scope.head.vendor_id;
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      if (vm.configureScreen === undefined) {
        vm.back = false;
        vm.refineFn();
      } else if (
        screen &&
        screen.toLowerCase() === "itemvendorconfigurationscreen"
      ) {
        vm.createForm = true;
        vm.configureItemVendorScreen = false;
        vm.previewAndPublish = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        vm.createForm = false;
        vm.configureItemVendorScreen = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        $timeout(() => {
          angular.element("#config_item_next").focus();
        }, 1000);
      } else if (screen && screen.toLowerCase() === "itemsetform") {
        vm.configureScreen = true;
        vm.itemSetForm = false;
        vm.itemSetStage = false;
        vm.previewAndPublish = false;
        vm.back = true;
        vm.manageDropScreen = false;
        $scope.isEnabled = true;
        vm.itemdataAddToQueueError = false;
        $timeout(() => {
          angular.element("#item_set_next").focus();
        }, 1000);
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        vm.configureScreen = false;
        vm.itemSetForm = true;
        vm.previewAndPublish = false;
        vm.manageDropScreen = false;
        vm.itemdataAddToQueueError = false;
      } else if (screen && screen.toLowerCase() === "previewandpublish") {
        vm.itemSetForm = false;
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        $timeout(() => {
          angular.element("#drop_item_next").focus();
        }, 1000);
      }
    };

    vm.refineFn = () => {
      vm.createForm = true;
      vm.configureScreen = false;
      vm.itemSetForm = false;
      vm.isSetScreen = false;
      vm.previewAndPublish = false;
    };
    vm.confirmDelete = false;
    vm.confirmDel = () => {
      vm.confirmDelete = !vm.confirmDelete;
    };

    vm.focusYesDeleteMaster = () => {
      $timeout(() => {
        angular.element("#yes_del_master").focus();
      }, 500);
    }

    vm.focusDeleteBtnVendor = () => {
      $timeout(() => {
        angular.element("#del_ven_screen").focus();
      }, 500);
    }

    vm.focusYesDeleteVend = () => {
      $timeout(() => {
        angular.element("#yes_del_ven").focus();
      }, 500);
    }

    vm.focusYesDelete = () => {
      $timeout(() => {
        angular.element("#yes_del_udd").focus();
      }, 500);
    }

    vm.focusYesDeleteDoc = () => {
      $timeout(() => {
        angular.element("#yes_del_doc").focus();
      }, 500);
    }

    vm.focusDeleteBtn = () => {
      $timeout(() => {
        angular.element("#del_master").focus();
      }, 500);
    }

    vm.focusDeleteBtnUdd = () => {
      $timeout(() => {
        angular.element("#del_doc_screen").focus();
      }, 500);
    }

    vm.focusYesDeleteUdd = () => {
      $timeout(() => {
        angular.element("#yes_del_udd").focus();
      }, 500);
    }

    vm.focusDeleteBtnDoc = () => {
      $timeout(() => {
        angular.element("#del_doc_main").focus();
      }, 500);
    }

    vm.focusSetDirDelete = () => {
      $timeout(() => {
        angular.element("#yes_del_set").focus();
      }, 500);
    }

    vm.focusSetDirDeleteBtn = () => {
      $timeout(() => {
        angular.element("#del_set_dir").focus();
      }, 500);
    }

    vm.timeOutfocusOnCancel = (cancelId) => {
      $timeout(() => {
        angular.element(cancelId).focus();
        vm.checkCancelScreen = null;
      }, 500);
    }

    vm.focusCancelDelete = () => {
      switch (vm.checkCancelScreen) {
        case "itemMasterScreen":
          vm.timeOutfocusOnCancel("#cancel_del_master");
          break;
        case "itemVendorConfigurationScreen":
          vm.timeOutfocusOnCancel("#cancel_del_vendor");
          break;
        case "userDefinedDataConfigurationScreen":
          vm.timeOutfocusOnCancel("#cancel_del_udd");
          break;
        case "dropConfigurationScreen":
          vm.timeOutfocusOnCancel("#cancel_del_drop");
          break;
        case "setconfigurationscreen":
          vm.timeOutfocusOnCancel("#cancel_del_set");
          break;
        default:
          // console.log("unknow screen on cancel");
          break;
      }
      // console.log("screen", vm.checkCancelScreen)
    }

    // Fetch SKUs for selected Item to update
    vm.fetchFirstSkuByItem = itemData => {
      vm.skuLoading = true;
      itemData.skuLoading = true;
      vm.isSkuLoaded = false;
      ItemService.API.FetchFirstSkuByItem(itemData.id)
        .then(response => {
          vm.skuLoading = false;
          itemData.skuLoading = false;
          vm.availableSkus = response.data;
          itemData.availableSkus = response.data;
          vm.isSkuLoaded = true;
        })
        .catch(error => {
          vm.skuLoading = false;
          vm.isSkuLoaded = true;
          logger.error(error);
        });
    };

    vm.closeSkuPopup = () => {
      vm.showSkuPopup = false;
    };

    vm.previewPublish = () => {
      vm.previewAndPublish = true;
      vm.createForm = false;
      vm.configureItemVendorScreen = false;
      vm.configureScreen = false;
      vm.manageDropScreen = false;
    };

    /**Update Item Type START */
    vm.fetchItemUdds = () => {
      if ($scope.head.old_type_id !== $scope.head.new_type_id) {
        $scope.isEnabled = false;
        vm.validationMessage = null;
        vm.isInvalidForm = false;
        vm.udd_form = {};
        vm.commonuddForm = {};
        common.$timeout(() => {
          $scope.isNewItemType = false;
        }, 0);
        vm.isShowCommonUdds = false;
        if ($scope.head.new_type_id) {
          $scope.head.type_id = $scope.head.new_type_id;
        }
        vm.setProductExplorerDivision($scope.head.type_id);
        common.$timeout(() => {
          $scope.isNewItemType = true;
        }, 1);
        vm.isShowCommonUdds = true;
        vm.isShowItemUdds = false;
        vm.isShowItemSkus = false;
        vm.isShowItemSkuUdds = false;
      }
    };

    vm.showScreen = screen => {
      common.$timeout(() => {
        angular.element("#go_back").focus();
      }, 1000);
      if (screen.toLowerCase() === "itemudds") {
        if (
          !vm.commonupdateuddForm ||
          (vm.commonupdateuddForm && !vm.commonupdateuddForm.$invalid)
        ) {
          vm.isInvalidForm = false;
          vm.commonvalidationMessage = null;
          vm.validationMessage = null;
          vm.isPublish = false;
          vm.isShowItemUdds = true;
          vm.isShowCommonUdds = false;
          vm.skuDetails = [];
        } else {
          // Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.commonvalidationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      } else if (screen.toLowerCase() === "skus") {
        if (vm.updateuddForm && !vm.updateuddForm.$invalid) {
          $scope.head.isUpdateItemType = true;
          $scope.selected_item = $scope.head;
          vm.isShowItemUdds = false;
          vm.isShowCommonUdds = false;
          vm.isShowItemSkus = true;
          vm.validationMessage = null;
          vm.isInvalidForm = false;
        } else {
          // Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          // if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      }
    };

    vm.updateItemUdd = (entityName, payload) => {
      var dataToBeUpdate = _.clone(payload);
      vm.$updateBtnText = "Updating Now...";
      vm.isSavingItemSku = true;
      dataToBeUpdate.status_effective_date = $scope.getFormattedDate(
        payload.status_effective_date
      );
      dataToBeUpdate.next_effective_date = $scope.getFormattedDate(
        payload.next_effective_date
      );
      if ($scope.effective_val === false) {
        dataToBeUpdate.next_effective_date = "1970-01-01";
      }
      delete payload.udds;
      delete payload.old_class;
      delete payload.old_department_id;
      delete payload.old_division_id;
      delete payload.old_type_id;
      delete payload.selectedTreePath;
      delete payload.selectedTreePathId;
      delete payload.old_primary_item_hierarchy_value_id;
      if (
        entityName &&
        entityName.toLowerCase() === "itemmaster" &&
        !vm.disableActions
      ) {
        // variable to controle the loader functionality
        vm.isProcessing = true;
        // Variable to show the Published review section.
        vm.publishResponseMessage = true;
        if (dataToBeUpdate.class === null) {
          delete dataToBeUpdate.class;
        }

        if (dataToBeUpdate.set_pricing_method === null) {
          delete dataToBeUpdate.set_pricing_method;
        }
        $scope.isInsertUdd = false;
        ItemService.API.DeleteItemUddBridge(payload.id)
          .then(() => {
            $scope.head.primary_item_hierarchy_value_id = payload.item_type_id;
            dataToBeUpdate.primary_item_hierarchy_value_id = payload.item_type_id
            dataToBeUpdate.buyer_id = $scope.buyer_hierarchy_value_id;
            dataToBeUpdate.vendor_id = $scope.head.vendor.id;
            ItemService.API.UpdateItem(dataToBeUpdate)
              .then(response => {
                response.data.isUpdateItemType = true;
                $scope.$broadcast("saveOrUpdateItemUdds", {
                  event: "update",
                  response: response.data,
                  inserted_id: payload.id
                });
                vm.opdone = true;
                vm.isProcessing = false;
                $scope.head.primary_item_hierarchy_value_id = payload.item_type_id;
                response.data.data.thumbnail = payload.thumbnail;
                vm.fetchPrimaryHierarchyAndValue(response.data.data);
                vm.getItemMetaData();
                let index = this.itemsDataList.findIndex(
                  item => item.id === payload.id
                );
                if (index >= 0) {
                  // Store the path created into a response variable
                  response.data.data.path = this.itemsDataList[index].path;
                  response.data.data.availableSkus = this.itemsDataList[
                    index
                  ].availableSkus;
                  this.itemsDataList[index] = response.data.data;
                }
                vm.ItemMap[payload.id] = response.data.data;

                common.$timeout(() => {
                  vm.isSavingItemSku = false;
                  //older code do not delete
                  // vm.showUpdateItemPanel = false;
                  vm.isUpdateSuccess = true;
                  angular.element("#done_btn").focus();
                  vm.gotoUpdateState();
                }, 10000);
                // vm.getItemTypePath(this.itemsDataList);
              })
              .catch(error => {
                vm.isSavingItemSku = false;
                vm.isProcessing = false;
                $scope.itemErrorMessage = error.data.error.message;
              });
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.showSkuUdds = sku => {
      common.$timeout(() => {
        vm.isShowItemSkuUdds = false;
      }, 0);
      $scope.head.isUpdateItemType = true;
      $scope.selected_item = $scope.head;
      $scope.edit_sku_master_id = sku.id;
      vm.isShowItemSkus = true;
      common.$timeout(() => {
        vm.isShowItemSkuUdds = true;
      }, 0);
      vm.isShowCommonUdds = false;
      $scope.skuHead = sku;
      vm.selectedSku = sku;
      vm.isPublish = false;
    };

    vm.saveSkuUdds = skuUdds => {
      vm.showSkus = false;
      vm.selectedSku.udds = {};
      vm.selectedSku.udds = skuUdds;
      vm.skuDetails.push(vm.selectedSku);
      vm.selectedSku.changesStored = true;
      vm.isPublish = true;
    };

    vm.goToPreviousTab = () => {
      if (vm.isShowItemUdds) {
        vm.isShowCommonUdds = true;
        vm.isShowItemUdds = false;
        vm.isShowItemSkus = false;
        vm.isShowItemSkuUdds = false;
      } else if (vm.isShowItemSkus || vm.isShowItemSkuUdds) {
        vm.isShowCommonUdds = false;
        vm.isShowItemUdds = true;
        vm.isShowItemSkus = false;
        vm.isShowItemSkuUdds = false;
      }
      common.$timeout(() => {
        angular.element("#collection_id").focus();
      }, 2500);
    };

    vm.initializeUpdateItemForm = () => {
      vm.isShowCommonUdds = false;
      vm.isShowItemUdds = false;
      vm.isShowItemSkus = false;
      vm.isShowItemSkuUdds = false;
    };

    /* changing text while copy sku number */
    vm.copyText = item => {
      item.copyText = "Copied to clipboard";
      common.$timeout(() => {
        item.copyText = "Copy to clipboard";
      }, 2500);
    };

    // SKU Search for Suffixed values

    $scope.enableDamagedcheck = () => {
      vm.filters.selectedsku = 'unselectdamagesku';
      if (vm.filters.sku_number == '') {
        delete vm.filters.selectedsku;
        $scope.enableDamagechk = false;
      }
      else {
        $scope.enableDamagechk = true;
      }
    }

    /**Update Item type END */

    $scope.reloadMethodDisplayValues = vm.fetchVendorsForAnItem;
  }
})();
