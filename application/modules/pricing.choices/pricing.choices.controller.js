(function() {
  "use strict";
  angular
    .module("rc.prime.pricingchoices")
    .controller("PricingChoicesController", PricingChoicesController);
    PricingChoicesController.$inject = ["$scope", "common", "PricingChoicesService", "valdr", "StatusCodes"];

  function PricingChoicesController($scope, common, PricingChoicesService, valdr, StatusCodes) {
    let vm = this;
    vm.returnValue = "";
    vm.entityInformation = {};
    vm.error = {};
    vm.previousPricingChoice = {};
    vm.message = null;
    vm.pricing_choice_details = {};
    vm.oldPricingChoiceData = null;
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

    vm.uuid = "127";

    /** Common Modules */
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("PricingChoicesController");
    let NotificationService = common.Notification;

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.pricingChoiceGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          description: {
            visible: true
          },
          eligible_for_finance: {
            visible: true
          },
          price_flag: {
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

    //to get required information of pricing choice entity
    vm.getEntityInformation = function() {
      EntityDetails.API.GetEntityInformation(vm.uuid).then( pricingChoice_information => {
          vm.entityInformation = pricingChoice_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.entity);
      });
    };

    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {
      });
    };

    vm.initializePricingChoice = function() {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.reload(undefined, false);
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
      PricingChoicesService.API.GetPricingChoices(isCache)
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allPricingChoices = response.data;
          for(let i=0;i<vm.allPricingChoices.length;i++){
            if (vm.allPricingChoices[i].is_eligible_for_finance == 1) {
              vm.allPricingChoices[i].show_is_eligible_for_finance = "Yes";
            } else if (vm.allPricingChoices[i].is_eligible_for_finance == 0) {
              vm.allPricingChoices[i].show_is_eligible_for_finance = "No";
            }
            if (vm.allPricingChoices[i].can_adjust_price_flag == 1) {
              vm.allPricingChoices[i].show_can_adjust_price_flag = "Yes";
            } else if (vm.allPricingChoices[i].can_adjust_price_flag == 0) {
              vm.allPricingChoices[i].show_can_adjust_price_flag = "No";
            }
          }
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
        angular.element("#description").focus();
      }, 0);
    };

     //prepare data to create/update
     vm.prepareData = function(data) {
      data.is_eligible_for_finance =
        data.is_eligible_for_finance === undefined ? 0 : parseInt(data.is_eligible_for_finance);
      data.status =
        data.status === undefined
          ? 0
          : parseInt(data.status);
      data.can_adjust_price_flag =
        data.can_adjust_price_flag === undefined
          ? 0
          : parseInt(data.can_adjust_price_flag);
      return data;
    };

    vm.save = function(payload) {
      vm.saveBtnText = "Saving now...";
      payload = vm.prepareData(payload);
      PricingChoicesService.API.InsertPricingChoice(payload)
        .then(response => {
          vm.previousPricingChoice = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          payload.id = response.data.inserted_id;
          if(!payload.status_description) {
            let index =  $scope.statuses.findIndex(status => status.code === payload.status);
            payload.status_description = $scope.statuses[index].description 
          }
          if (payload.is_eligible_for_finance == 1) {
            payload.show_is_eligible_for_finance = "Yes";
          } else if (payload.is_eligible_for_finance == 0) {
            payload.show_is_eligible_for_finance = "No";
          }
          if (payload.can_adjust_price_flag == 1) {
            payload.show_can_adjust_price_flag = "Yes";
          } else if (payload.can_adjust_price_flag == 0) {
            payload.show_can_adjust_price_flag = "No";
          }
          vm.allPricingChoices.push(payload);
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
            angular.element("#decription").focus();
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
        vm.oldPricingChoiceData.description !== payload.description ||
        vm.oldPricingChoiceData.status !== payload.status ||
        vm.oldPricingChoiceData.is_eligible_for_finance !== payload.is_eligible_for_finance ||
        vm.oldPricingChoiceData.can_adjust_price_flag !== payload.can_adjust_price_flag 
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function(payload) {
      payload = vm.prepareData(payload);
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        PricingChoicesService.API.UpdatePricingChoice(payload)
          .then(response => {
            vm.reload();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldPricingChoiceData = null;
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
              angular.element("#description").focus();
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function() {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
          angular.element("#description").focus();
        }, 1000);
      }
    };

    vm.delete = function(payload) {
      PricingChoicesService.API.DeletePricingChoice(payload)
        .then(result => {
          if (
            result &&
            result.data &&
            result.data.status &&
            result.data.status == 412 &&
            result.data.dependency
          ) {
            // to show list of dependent entities in side panel
            vm.dependencyList = result.data.dependency;
            vm.showErrorDetails = true;
          } else {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allPricingChoices.findIndex(choice => choice.id === payload.id);
          vm.allPricingChoices.splice(index, 1);
          vm.rowsCount--;
          vm.updateTableInformation(vm.currentPage);
          }
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

    // show update form and hide dependencies list and dependency details side panel
      vm.closeDependencyList = () => {
        vm.showErrorDetailsData = false;
        vm.showErrorDetails = false;
        vm.isConfirmDelete = false;
        vm.isShowHistory = true;
      };
      
      // close dependency details side panel only
      vm.closeDependencyDetails = () => {
        vm.showErrorDetailsData = false;
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
      vm.pricing_choice_details = {};
      vm.pricing_choice_details["description"] = null;
    };

    vm.openForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.pricing_choice_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    //Create another pricing choice after save
    vm.createAnotherForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.pricing_choice_details = {};
      //Setting Previously entered data to the new context
      vm.pricing_choice_details.active = vm.previousPricingChoice.active;
      vm.pricing_choice_details.status = vm.previousPricingChoice.status;
      vm.setInitialState();
    };

    vm.closeForm = function() {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      vm.showErrorDetailsData = false;
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        $timeout(function() {
        angular.element("#inlineSearch").focus();
      }, 1000);
    };

    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function(pricingChoiceData) {
      vm.isShowAdd = false;
      vm.showDetailsByID(pricingChoiceData);
    };

    vm.showDetailsByID = function(pricingChoiceData) {
      vm.pricing_choice_details = _.clone(pricingChoiceData);
      vm.oldPricingChoiceData = _.clone(vm.pricing_choice_details);
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

    // Get history details for codes
    $scope.loadHistory = () => {
      EntityDetails.API
        .GetHistoryData(vm.entityInformation.uuid, vm.pricing_choice_details.id)
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
      $timeout(function() {
        angular.element("#description").focus();
      }, 500); 
      $scope.showhistory = false;
    };

    $scope.getAccessPermissions(vm.uuid)
      .then(() => {
        vm.initializePricingChoice();
      })
      .catch(() => {
        vm.initializePricingChoice();
      })
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
