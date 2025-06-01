(function() {
  "use strict";

  angular
    .module("rc.prime.item")
    .controller("RetailPriceTypeController", RetailPriceTypeController);

  RetailPriceTypeController.$inject = [
    "$scope",
    "common",
    "RetailPriceTypeService"
  ];

  function RetailPriceTypeController($scope, common, RetailPriceTypeService) {
    var vm = this;
    vm.allRuleGroups = [];
    vm.isShowDetails = false;
    vm.isLoaded = false;
    vm.isShowAdd = false;

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

    vm.sortType = "rule_group";
    vm.currentPage = 1;
    vm.pageSize = 100;
    vm.rowsCount = 0;

    vm.uuid = "101";

    let Identifiers = common.Identifiers;
    let logger = common.Logger.getInstance("RetailPriceTypeController");
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;

    //Set attribute grid properties for show-hide Retail Price Types columns
    vm.setGridProperties = () => {
      vm.retailPriceTypesGrid = {
        columns: {
          id: {
            visible: false
          },
          name: {
            visible: true
          },
          isDefault: {
            visible: true
          }
        }
      };
    };

    vm.getEntityInformation = function() {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        retail_price_type_information => {
          vm.entityInformation = retail_price_type_information;
          $scope.name = vm.entityInformation.name;
        }
      );
    };

    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    vm.getRetailPriceTypes = refresh => {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.isLoaded = false;
      RetailPriceTypeService.API.GetRetailPriceTypes()
        .then(response => {
          vm.allPriceTypes = response.data;
          vm.rowsCount = response.data.length;
          vm.isLoaded = true;
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
          }
          vm.isLoaded = true;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
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

    vm.dblClickAction = data => {
      vm.message = "";
      vm.isShowAdd = false;
      vm.price_type_details = angular.copy(data);
      vm.oldpriceTypeDetails = angular.copy(vm.price_type_details);
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

    vm.prepareData = data => {
      if (!data.is_default) {
        data.is_default = 0;
      }
      return data;
    };

    vm.save = function(payload) {
      vm.saveBtnText = "Saving now...";
      vm.isLoaded = false;
      vm.prepareData(payload);
      RetailPriceTypeService.API.InsertRetailPriceType(payload)
        .then(response => {
          vm.previousRetailPrice = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          vm.isLoaded = true;
          vm.getRetailPriceTypes();
        })
        .catch(error => {
          vm.isLoaded = true;
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (error.status === 505 || error.status === 412) {
            vm.error = true;
            vm.message = "Record already exists in the table";
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          common.$timeout(function() {
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
            vm.message = "";
          }, 2500);
        });
    };

    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldpriceTypeDetails.name !== payload.name ||
        vm.oldpriceTypeDetails.is_default !== payload.is_default
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function(payload) {
      vm.updateBtnText = "Updating Now...";
      vm.isLoaded = false;
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        RetailPriceTypeService.API.UpdateRetailPriceType(payload)
          .then(response => {
            vm.getRetailPriceTypes();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldpriceTypeDetails = null;
            vm.isLoaded = true;
          })
          .catch(error => {
            vm.isLoaded = true;
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else if (error.status === 505) {
              vm.error = true;
              vm.message = "Record already exists in the table";
            } else if (error.status === 412) {
              vm.error = true;
              vm.message = error.data.message;
            }
            vm.error = true;
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            common.$timeout(function() {
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
              vm.message = "";
            }, 2500);
          });
      } else {
        vm.isLoaded = true;
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        common.$timeout(function() {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.delete = function(payload) {
      vm.isLoaded = false;
      RetailPriceTypeService.API.DeleteRetailPriceType(payload)
        .then(response => {
          vm.isLoaded = true;
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.message = response.message;
          vm.getRetailPriceTypes();
          common.$timeout(function() {
            vm.message = "";
          }, 2500);
        })
        .catch(error => {
          vm.isLoaded = true;
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (error.status === 412) {
            vm.error = true;
            vm.message = error.data.message;
          } else {
            vm.error = true;
            vm.message = error.data.error;
          }
          common.$timeout(function() {
            vm.message = "";
          }, 2500);
        });
    };

    //Show confirmation page on click of delete button
    vm.showconfirm = function() {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    vm.setInitialState = function() {
      common.$timeout(function() {
        angular.element("#name").focus();
      }, 0);
    };

    vm.openForm = function() {
      vm.price_type_details = {};
      vm.setInitialState();
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.price_type_form.$setPristine();
    };

    //Create another individual after save
    vm.createAnotherForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.price_type_details = {};
      //Setting Previously entered data to the new context
      vm.setInitialState();
    };

    vm.closeForm = function() {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      vm.message = "";
      common.$timeout(function() {
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    //Get history details for codes
    $scope.loadHistory = function() {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.price_type_details.id
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

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
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

    activate();

    function activate() {
      // Get access permission of crud oprations for retail price type
      $scope.getAccessPermissions(Identifiers.retail_price_type);
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.getRetailPriceTypes();
    }
  }
})();
