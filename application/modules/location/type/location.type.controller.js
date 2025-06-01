(function() {
  "use strict";

  angular
    .module("rc.prime.location.type")
    .controller("LocationTypeController", LocationTypeController);
  LocationTypeController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "CodeService",
    "LocationTypeService",
    "StatusCodes",
    "UserService"
  ];

  function LocationTypeController(
    $scope,
    $stateParams,
    common,
    CodeService,
    LocationTypeService,
    StatusCodes,
    UserService
  ) {
    let vm = this;
    let logger = common.Logger.getInstance("LocationTypeController");
    let $state = common.$state;
    let NotificationService = common.Notification;

    vm.common = common;
    vm.$stateParams = $stateParams;
    vm.uuid = "7";
    vm.entityInformation = {};
    vm.message = null;
    vm.error = {};
    vm.isShowHistory = false;
    vm.statusCodes = StatusCodes;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;
    vm.isBtnEnable = true;
    vm.issideMenuVisible = false;

    //Variable used in save/update/delete form
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isDeleteSuccess = false;
    vm.isConfirmDelete = false;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.message = null;
    vm.isShowHistory = false;

    //Variable used to show delete dependencies
    vm.dependencyList = {};
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;

    //pagination and sorting variables
    vm.isColumnSettingsVisible = false;
    vm.sortType = "short_description";
    vm.currentPage = 1;
    vm.pageSize = 100;

    //Set attribute grid properties for show-hide location type columns
    vm.setGridProperties = function() {
      vm.locationTypesGrid = {
        columns: {
          select: {
            visible: true
          },
          type_id: {
            visible: false
          },
          status: {
            visible: true
          },
          locationType: {
            visible: true
          },
          inventoryControl: {
            visible: true
          },
          allowSales: {
            visible: true
          },
          licencePlating: {
            visible: true
          },
          allowPurchasing: {
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
        .catch(error => {
          logger.error(error);
          defer.reject(error);
        });
      return defer.promise;
    };

    //on page load get all required data
    vm.initializeLocationType = function() {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.fetchFeatureAccessPermission();
      vm.loadCodeListData(
        vm.uuid,
        "Inventory Control",
        "allinventorycontrol",
        common.$q
      ); // Loading Inventory control
      let promise = vm.reload();

      promise.then(res => {
        $stateParams.location_type_id &&
        common.$state.current.name.includes("locationtype.update")
          ? vm.gotoUpdateStateIfIdExist()
          : "";
      });
      $scope.getAccessPermissions(vm.uuid);
    };

    //Fetch permission to clone item type for the logged in user by code
    vm.fetchFeatureAccessPermission = () => {
      UserService.API.IsAllowedFeaturedPassword("location-type-clone")
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

    vm.cloneLocationType = () => {
      vm.isCloning = true;
      LocationTypeService.API.CloneLocationType({
        id: vm.type.id,
        is_clone_udd: vm.isCloneUdds,
        description: vm.new_type.description,
        status_id: vm.new_type.status_id
      })
        .then(validatedResult => {
          this.showLockedScreen = false;
          this.secondaryPassword = "";
          // this.cloneMessage = "Cloned location type successfully.";
          this.isSaveSuccess = true;
          vm.new_type.description = undefined;
          vm.reload();
          common.$timeout(() => {
            vm.isCloning = false;
            vm.cloneError = null;
            // vm.isShowClonePanel = false;
          }, 2500);
        })
        .catch(error => {
          vm.cloneError = error.data.message;
          common.$timeout(() => {
            vm.isCloning = false;
            vm.cloneError = null;
          }, 2500);
        });
    };

    vm.openClonePanel = type => {
      this.cloneMessage = null;
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
          $scope.getStatuses(common.Identifiers.location); // Getting Location Module status
        }
      );
    };

    //get validation rules for location type by uuid and set rules using valdr in application.context.js
    vm.getModelAndSetValidationRules = function() {
      common.EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
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
      let data = LocationTypeService.API.GetLocationTypes()
        .then(response => {
          vm.isDisabled = false; // On click of "Refresh" button, make the "Maintain UDD" button disabled.
          vm.rowsCount = response.data.length;
          vm.locationType_Data = response.data;
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
            common.$timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
            this.focusSearchField();
          }
          vm.createTypesListMap(response.data);
          vm.isLoaded = true;
          vm.updateTableInformation(1);
          return response.data;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true;
            vm.isViewAuthorized = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          common.$timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
      return data;
    };

    //Create Map List
    vm.createTypesListMap = list => {
      vm.typesMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.typesMap[list[i].id] === undefined) {
          vm.typesMap[list[i].id] = list[i];
        }
      }
    };

    vm.focusSearchField = () => {
      this.common.$timeout(() => {
        angular.element("#inlineSearch").focus();
        },1000)
      vm.showFilter = 1;
    };

    ////////// check all select box implementation
    vm.enableDisable = function() {
      _.some(vm.locationType_Data, function(loc, i) {
        // Underscore Library function
        if (loc.check) {
          vm.enableGoToAllTypeUDD = true;
          vm.isDisabled = true;
          return true;
        } else {
          vm.isDisabled = false;
        }
      });
    };

    vm.enableOrDisableCheckboxes = function(flag) {
      _.each(vm.locationType_Data, function(d) {
        d.check = flag;
      });
      vm.enableDisable();
    };

    ///// Entity save update delete implementation /////////

    //prepare data to create/update
    vm.prepareData = function(data) {
      data.sale_allowed =
        data.sale_allowed_id === undefined ? 0 : parseInt(data.sale_allowed_id);
      data.license_plating =
        data.license_plating_id === undefined
          ? 0
          : parseInt(data.license_plating_id);
      data.allow_purchasing =
        data.allow_purchasing_id === undefined
          ? 0
          : parseInt(data.allow_purchasing_id);
      return data;
    };

    vm.save = function(payload) {
      vm.isLoaded = false;
      vm.saveBtnText = "Saving now...";
      payload = vm.prepareData(payload);
      vm.isBtnEnable = false;
      LocationTypeService.API.InsertLocationType(payload)
        .then(response => {
          vm.previousLT = payload;
          vm.saveBtnText = "Done";
          vm.isSaveSuccess = true;
          vm.isBtnEnable = true;
          vm.reload();
        })
        .catch(error => {
          vm.isLoaded = true;
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.message = NotificationService.errorNotification(error);
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          common.$timeout(function() {
            vm.isBtnEnable = true;
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    //check if the payload is different from old form data. if it is then return true.
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldLocationTypeDetails.allow_purchasing_id !==
          payload.allow_purchasing_id ||
        vm.oldLocationTypeDetails.inventory_control !==
          payload.inventory_control ||
        vm.oldLocationTypeDetails.license_plating_id !==
          payload.license_plating_id ||
        vm.oldLocationTypeDetails.sale_allowed_id !== payload.sale_allowed_id ||
        vm.oldLocationTypeDetails.short_description !==
          payload.short_description ||
        vm.oldLocationTypeDetails.status_id !== payload.status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //update the location type.
    vm.update = payload => {
      payload = vm.prepareData(payload); //prepare payload before save/update
      vm.isBtnEnable = false;
      if (vm.hasUpdateChanges(payload) === true) {
        //if the current form data is changed then update.
        vm.updateBtnText = "Updating Now...";
        LocationTypeService.API.UpdateLocationType(payload)
          .then(response => {
            payload.$edit = false;
            //get index of current location by id
            let index = vm.locationType_Data.findIndex(
              locationType => locationType.id === payload.id
            );

            //update location in list present at the index
            vm.locationType_Data[index] = response.data.data;
            vm.typesMap[$stateParams.location_type_id] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isBtnEnable = true;
            vm.isUpdateSuccess = true;
            vm.isDisabled = false; // on update after selecting an entity type, disable Maintain UDD button.
            vm.enableOrDisableCheckboxes(0); // Remove entity type selection when maintain udd button is disabled.
            $scope.closeShowHistory();
          })
          .catch(error => {
            vm.isLoaded = true;
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.message = NotificationService.errorNotification(error);
            }
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            common.$timeout(() => {
              vm.isBtnEnable = true;
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
              vm.isUnauthorized = false;
            }, 2500);
          });
      } else {
        // if current form data is not changed and user click on update button then show message in UI.
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        common.$timeout(() => {
          vm.isBtnEnable = true;
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    //delete
    vm.delete = function(payload) {
      LocationTypeService.API.DeleteLocationType(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.locationType_Data.findIndex(
            locationType => locationType.id === payload.id
          );
          vm.locationType_Data.splice(index, 1);
          delete vm.typesMap[$stateParams.location_type_id];
          vm.rowsCount--;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (error.status === 412) {
            vm.dependencyList = NotificationService.errorNotification(error);
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          } else {
            vm.message = error.data.error;
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          }
        });
    };

    //// view manipaulation

    //on click of delete button in update form, delete confirmation panel should be shown
    vm.showconfirm = function() {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
    };

    //show details in side panel for selected dependent entity
    vm.showDependencyListDetails = function(data) {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    //for navigation to the udd page, creates array of ids of selected location types
    vm.goToAllTypeUDD = function() {
      let typeIds = [];
      _.each(vm.locationType_Data, function(loc) {
        if (loc.check) {
          typeIds.push(loc.id);
        }
      });
      //vm.disableCheckboxes = true;
      $state.go("common.prime.locationtypeudd", {
        location_type_id: typeIds.join(",")
      });
    };

    //focus will be set to the first field of form
    vm.setInitialState = function() {
      common.$timeout(function() {
        angular.element("#short_description").focus();
      });
    };

    //Open create new location type form
    vm.openForm = function() {
      vm.saveBtnText = "Save";
      vm.new_location = {};
      vm.isSaveSuccess = false;
      $state.go("common.prime.locationtype.new");
      vm.setInitialState();
    };

    //show create new location type form on click of create another button after a new record created.
    vm.createAnotherForm = function() {
      vm.isShowDetails = true;
      vm.isSaveSuccess = false;
      vm.saveBtnText = "Save";
      vm.new_location = {};
      //Setting Previously entered data to the new context
      vm.new_location.status_id = vm.previousLT.status_id;
      vm.setInitialState();
    };

    //Close form and success/error messages in the form
    vm.closeForm = function() {
      vm.isSaveSuccess = false;
      vm.isShowClonePanel=false;
      $state.go("common.prime.locationtype");
      vm.message = null;
      vm.showDependencyDetailsData = false;
      common.$timeout(() => {
        vm.isUnauthorized = false;
        vm.showDependencyDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        // vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    //close dependency details panel only
    vm.closeDependencyDetails = function() {
      vm.showDependencyDetailsData = false;
    };

    //close dependency list panel and show update form
    vm.closeDependencyList = function() {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
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
    vm.dblClickAction = function(locationType) {
      $state.go("common.prime.locationtype.update", {
        location_type_id: locationType.id
      });
      vm.isUnauthorized = false;
      vm.isShowHistory = true;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;
      vm.updateBtnText = "Update";
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      vm.new_location = _.clone(locationType);
      vm.oldLocationTypeDetails = _.clone(locationType);
      vm.setInitialState();
      $scope.closeShowHistory();
    };

    // close the show update history panel
    $scope.closeShowHistory = function() {
      common.$timeout(function() {
      angular.element("#short_description").focus();
    });
      $scope.showhistory = false;
      $scope.showhistoryloading = false;
    };

    vm.gotoUpdateStateIfIdExist = () => {
      if (vm.typesMap[$stateParams.location_type_id]) {
        vm.dblClickAction(vm.typesMap[$stateParams.location_type_id]);
      } else {
        vm.closeForm();
      }
    };

    //shoows all update history for selected record
    $scope.loadHistory = function() {
      $scope.showhistoryloading = true; // Loading history until get the response

      common.EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.new_location.id
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

    function activate() {
      vm.setGridProperties();
      vm.initializeLocationType();
      // Move-UP Down Arrow functions
      $scope.reloadMethodDisplayValues = vm.goToAllTypeUDD;
      $scope.setClickedRow = vm.setClickedRow;
      $scope.dblClickAction = vm.dblClickAction;
    }
  }
})();
