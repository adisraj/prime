(function () {
  "use strict";
  angular
    .module("rc.prime.individual")
    .controller("IndividualController", IndividualController);
  IndividualController.$inject = ["$scope", "common", "IndividualService", "StatusCodes"];

  function IndividualController($scope, common, IndividualService, StatusCodes) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    vm.returnValue = "";
    vm.entityInformation = {};
    vm.previousIndividual = {};
    vm.oldIndividualDetails = {};
    vm.individualPageDetails = {};
    vm.error = {};
    vm.individualCols = {};
    vm.individualGroupByDropdown = {};
    vm.setinstance = {};
    vm.message = null;
    vm.isShowHistory = false;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.individual_details = null;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;

    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.indtypes = [];
    //varibles to update page information
    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    //variables used to show delete dependencies
    vm.showErrorDetails = false;
    vm.showErrorDetailsData = false;
    vm.errorDependentData = {};
    vm.dependencyList = {};

    vm.isColumnSettingsVisible = false;

    vm.uuid = "28";

    /** Common Modules */
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("IndividualController");
    let NotificationService = common.Notification;

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.individualGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          name: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    //to get required information of individual entity
    vm.getEntityInformation = function () {
      EntityDetails.API
        .GetEntityInformation(vm.uuid)
        .then(individual_information => {
          vm.entityInformation = individual_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.entity);
        });
    };

    vm.getModelAndSetValidationRules = function () {
      EntityDetails.API
        .GetModelAndSetValidationRules(vm.uuid)
        .then(model => {});
    };

    vm.initializeIndividual = function () {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      $scope.getAccessPermissions(vm.uuid); //Fetch the view/create/update/delete permission by user
      vm.reload();
    };

    vm.watchers = function () {
      $scope.$watch(
        angular.bind(vm.returnValue, function () {
          return vm.returnValue;
        }),
        function (value) {}
      );
    };

    vm.reload = function (refresh) {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      vm.isLoaded = true;
      IndividualService.API
        .GetIndividuals()
        .then(response => {
          response.data = response;
          vm.allIndividuals = response.data;

          vm.rowsCount = response.length;
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
          }
          vm.isLoaded = false;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    vm.save = function (payload) {
      vm.saveBtnText = "Saving now...";
      IndividualService.API
        .InsertIndividual(payload)
        .then(response => {
          vm.previousIndividual = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          vm.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.message = NotificationService.errorNotification(error);
          $timeout(function () {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    vm.validateForm = (objectData) => {
      // Loop to check if either first name or last name has some values
      if ((objectData.first_name && objectData.first_name.length === 0) && (objectData.last_name && objectData.last_name.length === 0)) {
        vm.individual_form.name.$valid = false;
        vm.individual_form.name.$invalid = true;
        vm.nameValidationMessage = "Required field";
      } else if ((objectData.first_name && (objectData.first_name.length < 2 || objectData.first_name.length > 25)) ||
        (objectData.last_name && (objectData.last_name.length < 2 || objectData.last_name.length > 25))) {
        // Loop to check if either first name or last name is within the validation limit
        vm.individual_form.name.$valid = false;
        vm.individual_form.name.$invalid = true;
        vm.nameValidationMessage = "First name or Last name length should be between 2 and 25";
      } else {
        // Loop to check if either first name or last name has some values and if it valid then show no error message
        if ((objectData.first_name && objectData.first_name.length !== 0) || (objectData.last_name && objectData.last_name.length !== 0)) {
          $timeout(function () {
            vm.individual_form.name.$valid = true;
            vm.individual_form.name.$invalid = false;
            vm.nameValidationMessage = '';
          }, 0);
        } else {
          vm.individual_form.name.$valid = false;
          vm.individual_form.name.$invalid = true;
          vm.nameValidationMessage = "Required field";
        }
      }
    }

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = function (payload) {
      if (
        vm.oldIndividualDetails.first_name !== payload.first_name ||
        vm.oldIndividualDetails.last_name !== payload.last_name ||
        vm.oldIndividualDetails.status_id !== payload.status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.ShowHideColumnSettings = () => {
      $timeout(() => {
      angular.element("#hide_show_column").focus();
    }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.update = function (payload) {
      vm.updateBtnText = "Updating Now...";
      delete payload.name;
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        IndividualService.API
          .UpdateIndividual(payload)
          .then(response => {
            let index = vm.allIndividuals.findIndex(
              individual => individual.id === payload.id
            );
            vm.allIndividuals[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldIndividualDetails = null;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(function () {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function () {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.delete = function (payload) {
      IndividualService.API
        .DeleteIndividual(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allIndividuals.findIndex(
            individual => individual.id === payload.id
          );
          vm.allIndividuals.splice(index, 1);
          $scope.lastPageTableRecordDeleteAction(vm.setinstance);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            vm.message = error.data.error;

            //to show list of dependent entities in side panel
            vm.dependencyList = NotificationService.errorNotification(error);
            vm.showErrorDetails = true;
          }
        });
    };

    //to show details of dependent entity in side panel
    vm.showDependencyListDetails = function (data) {
      vm.errorDependentData = data;
      vm.showErrorDetailsData = true;
    };

    //Show confirmation page on click of delete button
    vm.showconfirm = function () {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

     //Focus
     vm.focusSearchField = function () {
      $timeout(function () {
        angular.element("#inlineSearch").focus();
        },1000)
    };

    //set focus on first field in form
    vm.setInitialState = function () {
      $timeout(function () {
        angular.element("#first_name").focus();
      }, 1000);
    };

    vm.resetForm = function () {
      vm.individual_details = {};
      vm.individual_details["name"] = null;
    };

    vm.openForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.individual_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    //Create another individual after save
    vm.createAnotherForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.individual_details = {};
      //Setting Previously entered data to the new context
      vm.individual_details.status_id = vm.previousIndividual.status_id;
      vm.setInitialState();
    };

    vm.closeForm = function () {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      vm.showErrorDetailsData = false;
      $timeout(function () {
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = function () {
      vm.showErrorDetailsData = false;
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = function () {
      vm.showErrorDetailsData = false;
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    vm.setClickedRow = function (index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function (individualData) {
      vm.isShowAdd = false;
      vm.showDetailsByID(individualData);
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    vm.updateTableInformation = currentPage => {
      if (vm.rowsCount === 0) {
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

    vm.showDetailsByID = function (individualData) {
      vm.individual_details = _.clone(individualData);
      vm.validateForm(vm.individual_details);
      vm.oldIndividualDetails = _.clone(vm.individual_details);
      vm.isUnauthorized = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.isShowDetails = true;
      //On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    //Get history details for codes
    $scope.loadHistory = function () {
      EntityDetails.API
        .GetHistoryData(vm.entityInformation.uuid, vm.individual_details.id)
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Close show history panel only
    $scope.closeShowHistory = function () {
      $timeout(function () {
        angular.element("#name").focus();
      }, 0);
      $scope.showhistory = false;
    };

    vm.initializeIndividual();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();