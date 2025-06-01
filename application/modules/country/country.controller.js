(function() {
  "use strict";
  angular
    .module("rc.prime.country")
    .controller("CountryController", CountryController);
  CountryController.$inject = ["$scope", "common", "CountryService"];

  function CountryController($scope, common, CountryService) {
    let vm = this;
    vm.entityInformation = {};
    vm.error = {};
    vm.message = null;
    vm.country_details = {};
    vm.oldCountryDetails = null;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.isShowHistory = false;

    vm.isViewAuthorized = true;
    vm.isUnauthorized = false;
    vm.isLoaded = false;
    vm.isBtnEnable = true;
    vm.isColumnSettingsVisible = false;

    //variables used in create/update forms
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;

    //varibles to update page information
    vm.pageSize = 100;
    vm.sortType = "name";
    vm.currentPage = 1;

    vm.uuid = "5";

    /** Common Modules */
    let $timeout = common.$timeout;
    let $state = common.$state;
    let EntityDetails = common.EntityDetails;
    let logger = common.Logger.getInstance("CountryController");
    let NotificationService = common.Notification;

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.countryGrid = {
        columns: {
          id: {
            visible: false
          },
          name: {
            visible: true
          },
          timezones: {
            visible: true
          },
          calling_codes: {
            visible: true
          },
          iso2_code: {
            visible: true
          },
          iso3_code: {
            visible: true
          },
          currencies: {
            visible: true
          },
          language_code: {
            visible: true
          },
          states: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    // Get access permission of crud oprations for associate
    vm.getPermissionsForUuid = () => {
      $scope
        .getAccessPermissions(5)
        .then(res => {
          vm.countryPermissions = res;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Toggle Hide/Show Columns panel
    vm.ShowHideColumnSettings = () => {
      $timeout(() => {
        angular.element("#hide_show_column").focus();
      }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //to get required information of country entity
    vm.getEntityInformation = function() {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        country_information => {
          vm.entityInformation = country_information;
          $scope.name = vm.entityInformation.name;
        }
      );
    };

    //get json model and set validation rules for countries
    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    //initialize country module
    vm.initializeCountry = function() {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.reload(undefined, true);
      vm.getPermissionsForUuid();
    };

    /**
     * @param {Boolean} refresh true/false
     * @description On page load or on "Refresh" button click this will be called.
     * If refresh value is true the message with record number, response time take will be shown in UI
     */
    vm.reload = function(refresh, isCache) {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTime = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }

      if (isCache === undefined || isCache === null) {
        isCache = false;
      }
      $scope.selectedRow = null;
      vm.isLoaded = false;
      CountryService.API.GetCountries(isCache)
        .then(response => {
          vm.rowsCount = response.length;
          vm.countryList = response;
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
            vm.focusSearchField();
          }
          vm.isLoaded = true;
          vm.updateTableInformation(1); ////on reload update table information like no. of records
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
    };

    //set focus on first field in form
    vm.setInitialState = function() {
      $timeout(function() {
        angular.element("#name").focus();
      }, 0);
    };

    vm.save = function(payload) {
      vm.saveBtnText = "Saving now...";
      vm.isBtnEnable = false;
      CountryService.API.InsertCountry(payload)
        .then(response => {
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          vm.isBtnEnable = true;
          payload.id = response.data.inserted_id;
          vm.countryList.data.push(payload);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.message = NotificationService.errorNotification(error);
          $timeout(function() {
            vm.message = null;
            vm.isBtnEnable = true;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldCountryDetails.name !== payload.name ||
        vm.oldCountryDetails.iso2_code !== payload.iso2_code ||
        vm.oldCountryDetails.iso3_code !== payload.iso3_code ||
        vm.oldCountryDetails.currencies !== payload.currencies ||
        vm.oldCountryDetails.language_code !== payload.language_code ||
        vm.oldCountryDetails.calling_codes !== payload.calling_codes ||
        vm.oldCountryDetails.timezones !== payload.timezones
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function(payload) {
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        vm.isBtnEnable = false;
        $scope.showhistory = false;
        CountryService.API.UpdateCountry(payload)
          .then(response => {
            vm.reload();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.isBtnEnable = true;
            vm.oldCountryDetails = null;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(function() {
              vm.message = null;
              vm.isBtnEnable = true;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function() {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.resetForm = function() {
      vm.country_details["name"] = null;
      vm.country_details["iso2_code"] = null;
      vm.country_details["iso3_code"] = null;
      vm.country_details["currencies"] = null;
      vm.country_details["language_code"] = null;
      vm.country_details["calling_codes"] = null;
      vm.country_details["timezones"] = null;
    };

    //open create new form
    vm.openForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.country_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    //set create form to new context on click of create another button after a new record created.
    vm.createAnotherForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.country_details = {};
      vm.setInitialState();
    };

    //close form and messages
    vm.closeForm = function() {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      $timeout(function() {
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/message in the form will be closed.
    vm.dblClickAction = function(countryData) {
      vm.isShowAdd = false;
      vm.showDetailsByID(countryData);
    };

    vm.showDetailsByID = function(countryData) {
      vm.country_details = _.clone(countryData);
      vm.oldCountryDetails = _.clone(vm.country_details);
      vm.isUnauthorized = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.isShowDetails = true;
    };

    //Get history details for codes
    $scope.loadHistory = function() {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.country_details.id
      )
        .then(response => {
          $scope.historyList = response.data;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Close show history panel only
    $scope.closeShowHistory = function() {
      $scope.showhistory = false;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

     //Focus
     vm.focusSearchField =  () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
        },1000)
    };

    //// show table information like no. of records with or without search filter.
    vm.updateTableInformation = currentPage => {
      if (!vm.rowsCount || vm.rowsCount === 0) {
        vm.initalCount = 0;
      } else {
        vm.initalCount = 1;
      }

      if (currentPage === 1) {
        vm.rowsInfo =
          "Displaying " +
          vm.initalCount +
          " - " +
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

    activate();

    function activate() {
      vm.initializeCountry();
      $scope.setClickedRow = vm.setClickedRow;
    }

    vm.gotoStates = function(countryId) {
      $state.go("common.prime.country.states", {
        country_id: countryId
      });
    };

    $scope.usaFirst = function(country) {
      return country.name !== "USA";
    };
  }
})();
