(function() {
  "use strict";
  angular
    .module("rc.prime.title")
    .controller("TitleController", TitleController);
  TitleController.$inject = ["$scope", "common", "TitleService", "StatusCodes"];

  function TitleController($scope, common, TitleService, StatusCodes) {
    let vm = this;
    vm.returnValue = "";
    vm.entityInformation = {};
    vm.titlePageDetails = {};
    vm.error = {};
    vm.previousTitle = {};
    vm.message = null;
    vm.title_details = {};
    vm.oldTitleDetails = null;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.isShowHistory = false;

    vm.statusCodes = StatusCodes;

    vm.isUnauthorized = false;
    vm.isLoaded = false;

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
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    //variables used to show delete dependencies
    vm.showErrorDetails = false;
    vm.showErrorDetailsData = false;
    vm.errorDependentData = {};

    vm.isColumnSettingsVisible = false;
    vm.titletype = [];

    vm.uuid = "50";

    /** Common Modules */
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("TitleController");
    let NotificationService = common.Notification;

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.titleGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          title: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.focusSearchField = function() {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      },1000)
    }

    //to get required information of title entity
    vm.getEntityInformation = function() {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        title_information => {
          vm.entityInformation = title_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.entity);
        }
      );
    };

    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    vm.initializeTitle = function() {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.reload(undefined, false);
      $scope.getAccessPermissions(vm.uuid);
    };

    vm.watchers = function() {
      $scope.$watch(
        angular.bind(vm.returnValue, function() {
          return vm.returnValue;
        }),
        function(value) {}
      );
    };

    vm.reload = function(refresh, isCache) {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }

      if (isCache === undefined || isCache === null) {
        isCache = false;
      }
      $scope.selectedRow = null;
      vm.isLoaded = false;
      TitleService.API.GetTitles(isCache)
        .then(response => {
          response.data = response;
          vm.rowsCount = response.data.length;
          vm.allTitles = response.data;
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
              angular.element("#inlineSearch").focus();
            }, 3500);
          }
          vm.isLoaded = true;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          logger.error(error);
          if (error.status === 403) {
            vm.isLoaded = true;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
        });
    };

    //set focus on first field in form
    vm.setInitialState = function() {
      $timeout(function() {
        angular.element("#title").focus();
      }, 0);
    };

    vm.save = function(payload) {
      vm.saveBtnText = "Saving now...";
      TitleService.API.InsertTitle(payload)
        .then(response => {
          vm.previousTitle = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          payload.id = response.data.inserted_id;
          vm.allTitles.push(payload);
          vm.rowsCount += 1;
          vm.updateTableInformation(1);
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
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
            angular.element("#title").focus();
          }, 2500);
        });
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

    vm.ShowHideColumnSettings = () => {
      $timeout(function() {
        angular.element("#hide_show_column").focus();
      }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };
    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldTitleDetails.title !== payload.title ||
        vm.oldTitleDetails.active !== payload.active
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function(payload) {
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        TitleService.API.UpdateTitle(payload)
          .then(response => {
            let index = vm.allTitles.findIndex(
              title => title.id === payload.id
            );
            vm.allTitles[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldTitleDetails = null;
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
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
              angular.element("#title").focus();
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function() {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
          angular.element("#title").focus();
        }, 1000);
      }
    };

    vm.delete = function(payload) {
      TitleService.API.DeleteTitle(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allTitles.findIndex(title => title.id === payload.id);
          vm.allTitles.splice(index, 1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            vm.message = error.data.error;

            //to show list of dependent entities in side panel
            vm.dependencyList = error.data.dependency;
            vm.showErrorDetails = true;
          }
        });
    };

    //to show details of dependent entity in side panel
    vm.showDependencyListDetails = function(data) {
      $timeout(function() {
        angular.element("#title_depend_close").focus();
      }, 500); 
      vm.errorDependentData = data;
      vm.showErrorDetailsData = true;
    };

    //Show confirmation page on click of delete button
    vm.showconfirm = function() {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    vm.resetForm = function() {
      vm.title_details = {};
      vm.title_details["title"] = null;
    };

    vm.openForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.title_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    //Create another title after save
    vm.createAnotherForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.title_details = {};
      //Setting Previously entered data to the new context
      vm.title_details.active = vm.previousTitle.active;
      vm.title_details.status = vm.previousTitle.status;
      vm.setInitialState();
    };

    vm.closeForm = function() {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      vm.showErrorDetailsData = false;
      $timeout(function() {
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 1000);
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = function() {
      $timeout(function() {
        angular.element("#close_depen_title").focus();
      }, 500);
      vm.showErrorDetailsData = false;
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = function() {
      $timeout(function() {
        angular.element("#title").focus();
      }, 500); 
      vm.showErrorDetailsData = false;
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function(titleData) {
      vm.isShowAdd = false;
      vm.showDetailsByID(titleData);
    };

    vm.showDetailsByID = function(titleData) {
      vm.title_details = _.clone(titleData);
      vm.oldTitleDetails = _.clone(vm.title_details);
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
    $scope.loadHistory = function() {
      $timeout(function() {
        angular.element("#history_close").focus();
      }, 500);
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.title_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Close show history panel only
    $scope.closeShowHistory = function() {
      $timeout(function() {
        angular.element("#title").focus();
      }, 500); 
      $scope.showhistory = false;
    };

    vm.initializeTitle();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
