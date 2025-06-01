(() => {
  "use strict";

  angular
    .module("rc.prime.item")
    .controller("SkuOptionHeaderController", SkuOptionHeaderController);
  SkuOptionHeaderController.$inject = [
    "$scope",
    "common",
    "SkuOptionHeaderService",
    "StatusCodes"
  ];

  function SkuOptionHeaderController($scope, common, SkuOptionHeaderService, StatusCodes) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    /*Common modules*/ 
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let Identifiers = common.Identifiers;
    let logger = common.Logger.getInstance("SkuOptionHeaderController");
    let NotificationService = common.Notification;

    vm.pagedetails = {};
    vm.returnValue = "";
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;

    vm.pageSize = 10;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;
    vm.isColumnSettingsVisible = false;

    vm.dependencyList = {};
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;
    vm.errorDependentData = {};

    vm.returnValue = "";

    vm.entityInformation = {};
    vm.uuid = "46";

    //Set attribute grid properties for show-hide SKU Options columns
    vm.setGridProperties = () => {
      vm.skuOptionsGrid = {
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

    vm.initializeSkuHeader = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      $scope.getStatuses(common.Identifiers.item);
      vm.setGridProperties();
      vm.reload();
      $scope.getAccessPermissions(vm.uuid);
    };

    vm.getEntityInformation = () => {
      EntityDetails.API
        .GetEntityInformation(vm.uuid)
        .then(option_header_information => {
          vm.entityInformation = option_header_information;
          $scope.name = vm.entityInformation.name;
        });
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API
        .GetModelAndSetValidationRules(vm.uuid)
        .then(model => {});
    };
    //Get history details for mto collections
    $scope.loadHistory = () => {
      EntityDetails.API
        .GetHistoryData(vm.entityInformation.uuid, vm.skuHeader_details.id)
        .then(response => {
          $scope.historyList = response.data;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

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
      SkuOptionHeaderService.API
        .GetSkuHeaders()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allSkus = response.data;
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
          }
          vm.isLoaded = true;
          vm.updateTableInformation(1);
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

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.save = payload => {
      vm.saveBtnText = "Saving now...";
      SkuOptionHeaderService.API
        .InsertSkuHeader(payload)
        .then(response => {
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
          $timeout(() => {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };
    vm.hasUpdateChanges = payload => {
      if (
        vm.oldSkuHeaderDetails.name !== payload.name ||
        vm.oldSkuHeaderDetails.status_id !== payload.status_id
      ) {
        return true;
      } else {
        return false;
      }
    };
    vm.update = payload => {
      if (vm.hasUpdateChanges(payload) === true) {
        vm.updateBtnText = "Updating Now...";
        SkuOptionHeaderService.API
          .UpdateSkuHeader(payload)
          .then(response => {
            vm.reload();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldLocationTypeDetails = null;
            $scope.closeShowHistory();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(() => {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(() => {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1500);
      }
    };
    vm.delete = payload => {
      SkuOptionHeaderService.API
        .DeleteSkuHeader(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.reload();
          //$scope.lastPageTableRecordDeleteAction($scope.setinstance);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            if (error.status == 412) {
              vm.dependencyList = NotificationService.errorNotification(error);
            } else {
              vm.message = NotificationService.errorNotification(error);
            }
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          }
        });
    };
    vm.showconfirm = () => {
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
    };

    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };
    vm.setInitialState = entityName => {
      $timeout(() => {
        angular.element("#name").focus();
      });
    };

    vm.resetForm = () => {
      vm.skuHeader_details = {};
      vm.skuHeader_details["name"] = null;
    };

    vm.openForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      if (vm.skuHeader_form !== undefined) {
        vm.skuHeader_form.$setPristine();
      }
      vm.setInitialState();
      vm.resetForm();
    };
    vm.createAnotherForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.skuHeader_details = {};
      vm.setInitialState();
    };
    vm.closeForm = () => {
      vm.message = null;
      vm.isShowDetails = false;
      vm.showDependencyDetailsData = false;
      $timeout(() => {
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    vm.closeDependencyDetails = () => {
      vm.showDependencyDetailsData = false;
    };
    vm.closeDependencyList = () => {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };
    vm.setClickedRow = index => {
      $scope.selectedRow = index;
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

    vm.dblClickAction = skuHeader => {
      vm.isShowDetails = true;
      vm.isUnauthorized = false;
      vm.isShowAdd = false;
      vm.isShowHistory = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.updateBtnText = "Update";
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      vm.skuHeader_details = _.clone(skuHeader);
      vm.oldSkuHeaderDetails = _.clone(skuHeader);
      vm.setInitialState();
    };

    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
    };

    vm.initializeSkuHeader();
  }
})();
