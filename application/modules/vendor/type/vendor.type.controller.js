(function() {
  "use strict";

  angular
    .module("rc.prime.vendor.type")
    .controller("VendorTypeController", VendorTypeController);
  VendorTypeController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "CodeService",
    "VendorTypeService",
    "StatusCodes",
    "UserService"
  ];

  function VendorTypeController(
    $scope,
    $stateParams,
    common,
    CodeService,
    VendorTypeService,
    StatusCodes,
    UserService
  ) {
    var vm = this;
    let $timeout = common.$timeout;
    let $state = common.$state;
    let logger = common.Logger.getInstance("VendorTypeController");
    vm.common = common;
    vm.$stateParams = $stateParams;
    vm.statusCodes = StatusCodes;
    vm.entityInformation = {};
    vm.uuid = "3";

    //Variable used in save/update/delete form
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isDeleteSuccess = false;
    vm.isConfirmDelete = false;

    vm.isBtnEnable = true;
    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;
    vm.message = null;
    vm.isShowHistory = false;

    //Variable used to show delete dependencies
    vm.dependencyList = {};
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;
    vm.$errorDependentData = {};

    //pagination and sorting variables
    vm.isColumnSettingsVisible = false;
    vm.sortType = "short_description";
    vm.currentPage = 1;
    vm.pageSize = 100;

    vm.issideMenuVisible = false;

    //Set vendor type grid properties for show-hide  columns
    vm.setGridProperties = function() {
      this.vendorTypeGrid = {
        columns: {
          id: {
            visible: false
          },
          select: {
            visible: true
          },
          status: {
            visible: true
          },
          vendorType: {
            visible: true
          },
          goodsAllowded: {
            visible: true
          },
          servicesAllowded: {
            visible: true
          },
          resaleAllowded: {
            visible: true
          },
          busDepartmentInfo: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.expandMinimizeSidebar = () => {
      vm.issideMenuVisible = !vm.issideMenuVisible;
    };

    ///////// activating Vendor type module
    //on page load get all required data
    vm.initializeVendorType = function() {
      vm.getEntityInformation();
      vm.fetchFeatureAccessPermission();
      vm.getModelAndSetValidationRules();
      let promise = vm.reload();
      vm.loadCodeListData(
        vm.uuid,
        "Business Department Information",
        "allBusinessDeptCodes",
        common.$q
      ); // Loading Business Department Information drop down options in type udd

      //executes after reload function returns data
      promise.then(response => {
        $stateParams.vendor_type_id &&
        $state.current.name.includes("vendortype.update")
          ? vm.gotoUpdateStateIfIdExist()
          : "";
      });
      $scope.getAccessPermissions(vm.uuid);
    };

    //Fetch permission to clone item type for the logged in user by code
    vm.fetchFeatureAccessPermission = () => {
      UserService.API.IsAllowedFeaturedPassword("vendor-type-clone")
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

    vm.cloneVendorType = () => {
      VendorTypeService.API.CloneVendorType({
        id: vm.type.id,
        is_clone_udd: vm.isCloneUdds,
        description: vm.new_type.description,
        status_id: vm.new_type.status_id
      })
        .then(validatedResult => {
          if (validatedResult.status === 201) {
            this.showLockedScreen = false;
            this.secondaryPassword = "";
            this.isSaveSuccess = true;
            vm.new_type.description = undefined;
            vm.reload();
            $timeout(() => {
              vm.cloneError = null;
            }, 2500);
          }
        })
        .catch(error => {
          vm.cloneError = error.data.message;
          $timeout(() => {
            vm.cloneError = null;
          }, 3000);
        });
    };

    vm.openClonePanel = type => {
      this.isSaveSuccess = false;
      this.cloneError = null;
      this.type = type;
      this.showLockedScreen = true;
      this.isShowClonePanel = true;
      vm.new_type = {};
      vm.new_type.status_id = 100;
    };

    //Get information required for location type entity, statically stored in application.context.js file
    vm.getEntityInformation = function() {
      common.EntityDetails.API.GetEntityInformation(vm.uuid).then(
        lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.vendor); // Getting Vendor Module status
        }
      );
    };

    //get validation rules for location type by uuid and set rules using valdr in application.context.js
    vm.getModelAndSetValidationRules = function() {
      common.EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(
        model => {}
      );
    };

    //generic function to get data for drop down from code list table
    vm.loadCodeListData = function(uuid, fieldName, model, $q) {
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
    vm.reload = function(refresh) {
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
      let data = VendorTypeService.API.GetVendorTypes()
        .then(response => {
          vm.isDisabled = false // On click of "Refresh" button, make the "Maintain UDD" button disabled. 
          vm.rowsCount = response.data.length;
          vm.vendortype_data = response.data;
          $scope.refreshed = true;
          vm.enableGoToAllTypeUDD = true;
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
            this.focusSearchField();
          }
          vm.isLoaded = true;
          vm.createTypesListMap(response.data);
          vm.updateTableInformation(1);
          return response.data;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true;
            vm.isViewAuthorized = false;
          }
          logger.error(error);
        });

      return data;
    };

    vm.createTypesListMap = list => {
      vm.typesMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.typesMap[list[i].id] === undefined) {
          vm.typesMap[list[i].id] = list[i];
        }
      }
    };

    //toggle Show/Hide Columns panel
    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    ////////// check all select box implementation
    vm.enableDisable = function() {
      _.some(vm.vendortype_data, function(loc, i) {
        // Underscore Library function
        if (loc.check) {
          vm.isDisabled = true;
          vm.enableGoToAllTypeUDD = true;
          return true;
        } else {
          vm.isDisabled = false;
        }
      });
    };
    vm.enableOrDisableCheckboxes = function(flag) {
      _.each(vm.vendortype_data, function(d) {
        d.check = flag;
      });
      vm.enableDisable();
    };

    ///// Entity save update delete implementation

    //prepare data to create/update
    vm.prepareData = function(data) {
      data.goods_allowed =
        data.goods_allowed_id === undefined
          ? 0
          : parseInt(data.goods_allowed_id);
      data.services_allowed =
        data.services_allowed_id === undefined
          ? 0
          : parseInt(data.services_allowed_id);
      data.resale_allowed =
        data.resale_allowed_id === undefined
          ? 0
          : parseInt(data.resale_allowed_id);
      return data;
    };

    //Save Vendor Type
    vm.save = function(payload) {
      vm.saveBtnText = "Saving now...";
      payload = vm.prepareData(payload);
      vm.isBtnEnable = false;
      VendorTypeService.API.InsertVendorType(payload)
        .then(response => {
          vm.previousVT = payload;
          vm.saveBtnText = "Done";
          vm.isSaveSuccess = true;
          vm.isBtnEnable = true;
          vm.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.message = vm.common.Notification.errorNotification(error);
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          common.$timeout(function() {
            vm.message = null;
            vm.isBtnEnable = true;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    //check if the payload is different from old form data. if it is then return true.
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldVendorTypeDetails.business_department_information !==
          payload.business_department_information ||
        vm.oldVendorTypeDetails.goods_allowed_id !== payload.goods_allowed_id ||
        vm.oldVendorTypeDetails.services_allowed_id !==
          payload.services_allowed_id ||
        vm.oldVendorTypeDetails.resale_allowed_id !==
          payload.resale_allowed_id ||
        vm.oldVendorTypeDetails.short_description !==
          payload.short_description ||
        vm.oldVendorTypeDetails.status_id !== payload.status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    //Update vendor type
    vm.update = function(payload) {
      payload = vm.prepareData(payload);
      if (vm.hasUpdateChanges(payload) === true) {
        vm.isBtnEnable = false;
        vm.updateBtnText = "Updating Now...";
        VendorTypeService.API.UpdateVendorType(payload)
          .then(response => {
            payload.$edit = false;
            let index = vm.vendortype_data.findIndex(
              vendortype_data => vendortype_data.id === payload.id
            );
            vm.vendortype_data[index] = response.data.data;
            vm.typesMap[$stateParams.vendor_type_id] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.isDisabled = false; // on update after selecting an entity type, disable Maintain UDD button.
            vm.enableOrDisableCheckboxes(0); // Remove entity type selection when maintain udd button is disabled.
            vm.oldVendorTypeDetails = null;
            vm.isBtnEnable = true;
            $scope.closeShowHistory();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.message = vm.common.Notification.errorNotification(error);
            }
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            common.$timeout(function() {
              vm.isBtnEnable = true;
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        // if current form data is not changed and user click on update button then show message in UI.
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        common.$timeout(function() {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    //delete vendor type
    vm.delete = function(payload) {
      VendorTypeService.API.DeleteVendorType(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.vendortype_data.findIndex(
            vendortype_data => vendortype_data.id === payload.id
          );
          vm.vendortype_data.splice(index, 1);
          delete vm.typesMap[$stateParams.vendor_type_id];
          vm.rowsCount--;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (error.status === 412) {
            vm.dependencyList = vm.common.Notification.errorNotification(error);
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          } else {
            vm.message = vm.common.Notification.errorNotification(error);
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          }
        });
    };

    //// view manipaulation

    //on click of delete button in update form, delete confirmation panel should be shown
    vm.showconfirm = function() {
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
    };

    //show details in side panel for selected dependent entity
    vm.showDependencyListDetails = function(data) {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    //for navigation to the udd page, creates array of ids of selected vendor types
    vm.goToAllTypeUDD = function() {
      let typeIds = [];
      _.each(vm.vendortype_data, function(loc) {
        if (loc.check) {
          typeIds.push(loc.id);
        }
      });
      //vm.disableCheckboxes = true;
      $state.go("common.prime.vendortypeudd", {
        vendor_type_id: typeIds.join(",")
      });
    };

    //focus will be set to the first field of form
    vm.setInitialState = function(entityName) {
      common.$timeout(function() {
        angular.element("#short_description").focus();
      });
    };

    //Focus
    vm.focusSearchField = () => {
      this.common.$timeout(() => {
        angular.element("#inlineSearch").focus();
        },1000)
    };

    //Open create new vendor type form
    vm.openForm = function() {
      vm.new_vendor = {};
      $state.go("common.prime.vendortype.new");
      vm.saveBtnText = "Save";
      vm.setInitialState();
    };

    //show create new location type form on click of create another button after a new record created.
    vm.createAnotherForm = function() {
      vm.saveBtnText = "Save";
      vm.isSaveSuccess = false;
      vm.new_vendor = {};
      //Setting Previously entered data to the new context
      vm.new_vendor.status_id = vm.previousVT.status_id;
      vm.setInitialState();
    };

    //Close form and success/error messages in the form
    vm.closeForm = function() {
      vm.message = null;
      vm.isSaveSuccess = false
      vm.isShowClonePanel = false;
      vm.showDependencyDetailsData = false;
      common.$timeout(function() {
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
      $state.go("common.prime.vendortype");
    };

    //close dependency details panel only
    vm.closeDependencyDetails = function() {
      vm.showDependencyDetailsData = false;
    };

    //close dependency list panel and show update form
    vm.closeDependencyList = function() {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isShowHistory = true;
      vm.isConfirmDelete = false;
    };

    //highlight the clocked row in table
    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

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

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/meesage in the form will be closed.
    vm.dblClickAction = function(vendorType, index) {
      vm.message = null;
      $state.go("common.prime.vendortype.update", {
        vendor_type_id: vendorType.id
      });

      /* On open of update form close clear dependencies and close dependency panel */
      vm.dependencyList = [];
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;

      vm.isUnauthorized = false;
      vm.isShowHistory = true; //show View History link in update form
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;
      vm.updateBtnText = "Update";
      vm.new_vendor = _.clone(vendorType);
      vm.oldVendorTypeDetails = _.clone(vendorType);
      vm.setInitialState(); //set focus in first field  of update form
      $scope.closeShowHistory(); //close view update history panel
    };

    //check if data list have data with selected id, if yes, goto update state
    vm.gotoUpdateStateIfIdExist = () => {
      if (vm.typesMap[$stateParams.vendor_type_id]) {
        vm.dblClickAction(vm.typesMap[$stateParams.vendor_type_id]);
      } else {
        vm.closeForm();
      }
    };

    // close the show update history panel
    $scope.closeShowHistory = function() {
      common.$timeout(function() {
      angular.element("#short_description").focus();
    });
      $scope.showhistory = false;
      $scope.showhistoryloading = false;
    };

    //shows all update history for selected record
    $scope.loadHistory = function() {
      $scope.showhistoryloading = true; // Loading history until get the response
      common.EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.new_vendor.id
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

    activate();
    ///// activating vendor type module
    function activate() {
      vm.setGridProperties();
      vm.initializeVendorType();
      // Move-UP Down Arrow functions
      $scope.reloadMethodDisplayValues = vm.goToAllTypeUDD;
      $scope.setClickedRow = vm.setClickedRow;
      $scope.dblClickAction = vm.dblClickAction;
    }
  }
})();
