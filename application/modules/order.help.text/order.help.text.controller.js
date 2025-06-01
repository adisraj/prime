(function () {
  "user strict";
  angular
    .module("rc.prime.orderhelptext")
    .controller("OrderHelpTextController", OrderHelpTextController);
  OrderHelpTextController.$inject = [
    "$scope",
    "OrderHelpTextService",
    "common",
    "EntityService"
  ];

  function OrderHelpTextController(
    $scope,
    OrderHelpTextService,
    common,
    EntityService
  ) {
    let vm = this;
    vm.isLoaded = false;
    vm.isShowAdd = false;
    vm.isShowDetails = false;
    vm.order_text = {};
    vm.sortType = "description";
    vm.currentPage = 1;
    vm.pageSize = 100;
    vm.isColumnSettingsVisible = false;
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.showDependencyDetails = false;
    vm.showErrorDetails = false;
    vm.orderHelpText_details = {};
    vm.oldOrderHelpText = {};
    vm.entityInformation = {};

    // Unique Identification number
    vm.uuid = "125";

    /** Common Modules */
    let $timeout = common.$timeout;
    let logger = common.Logger.getInstance("OrderHelpTextController");
    let EntityDetails = common.EntityDetails;

    vm.initializeOrderHelpText = function () {
      vm.getEntityInformation();
      $scope.getAccessPermissions(vm.uuid); // Fetch the view/create/update/delete permission by user
      vm.reload(undefined);
    };

    // to get required information of order help text entity
    vm.getEntityInformation = function () {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        ordertext_information => {
          vm.entityInformation = ordertext_information;
          $scope.name = vm.entityInformation.name;
        }
      );
    };

     //Focus
     vm.focusSearchField =  () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
        },1000)
    };

    // fuction to close the dependency panel
   vm.closeDependencyList = () => {
    $timeout(function() {
      angular.element("#title").focus();
    }, 500);
    vm.showErrorDetails = false;
    vm.isConfirmDelete = false;
  }


    /* fetch all order help text */
    vm.reload = function (refresh) {
      vm.isLoaded = true;
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      OrderHelpTextService.API.GetOrderHelpTextList()
        .then(response => {
          vm.rowsCount = response.length;
          vm.orderHelpTextList = response;
          vm.isLoaded = false;
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
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    /* save new order help text */
    vm.save = function (payload) {
      vm.saveBtnText = "Saving now...";
      OrderHelpTextService.API.InsertOrderHelpText(payload)
        .then(response => {
          vm.orderHelpText_details = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          payload.id = response.data.id;
          vm.orderHelpTextList.push(payload);
          vm.rowsCount++;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.message = error.data.message;
          $timeout(function () {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    /* fetch all order help text */
    vm.reload = function (refresh) {
      vm.isLoaded = true;
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      OrderHelpTextService.API.GetOrderHelpTextList()
        .then(response => {
          vm.rowsCount = response.length;
          vm.orderHelpTextList = response;
          vm.isLoaded = false;
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
          vm.updateTableInformation(1);
        })
        .catch(error => {
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    /* save new order help text */
    vm.save = function (payload) {
      vm.saveBtnText = "Saving now...";
      OrderHelpTextService.API.InsertOrderHelpText(payload)
        .then(response => {
          vm.orderHelpText_details = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          payload.id = response.data.id;
          vm.orderHelpTextList.push(payload);
          vm.rowsCount++;
        })
        .catch(error => {
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.message = error.data.message;
          $timeout(function () {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    // check that update form previous data is not same as payload
    vm.hasUpdateChanges = function (payload) {
      if (
        vm.oldOrderHelpText.id !== payload.id ||
        vm.oldOrderHelpText.description !== payload.description ||
        vm.oldOrderHelpText.title !== payload.title
      ) {
        return true;
      } else {
        return false;
      }
    };
    // delete order help text
    vm.delete = function (payload) {
      OrderHelpTextService.API.DeleteOrderHelpText(payload)
        .then(() => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.reload();
        })
        .catch(() => {
          vm.error = true;
          vm.showErrorDetails = true;
          vm.showDependencyDetails = true;
        });
    };

    // update order help text
    vm.update = function (payload) {
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        OrderHelpTextService.API.UpdateOrderHelpText(payload)
          .then(() => {
            payload.$edit = false;
            vm.reload();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldOrderHelpText = null;
          })
          .catch(error => {
            vm.error = true;
            vm.message = error.data.message;
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

    // delete order help text
    vm.delete = function (payload) {
      OrderHelpTextService.API.DeleteOrderHelpText(payload)
        .then(() => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.reload();
        })
        .catch((error) => {
          vm.error = true;
          vm.showErrorDetails = true;
          if (error.data && error.data.Data && error.data.Data.length > 0) {
            vm.dependentSkus = error.data.Data;
          }
        });
    };

    // Show confirmation page on click of delete button
    vm.showconfirm = function () {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      // vm.isUnauthorized = false;
    };

    // set grid properties in order help text table
    vm.setGridProperties = () => {
      vm.ordertextlistGrid = {
        columns: {
          id: {
            visible: false
          },
          title: {
            visible: true
          },
          description: {
            visible: true
          }
        }
      };
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

    vm.setClickedRow = function (index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function (orderHelpData) {
      vm.isShowAdd = false;
      vm.showDetailsByID(orderHelpData);
      vm.setInitialState();
    };

    vm.showDetailsByID = function (orderHelpData) {
      vm.orderHelpText_details = _.clone(orderHelpData);
      vm.oldOrderHelpText = _.clone(vm.orderHelpText_details);
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.showErrorDetails = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.isShowDetails = true;
      // On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    /* side panel to open and close on click of column button */
    vm.ShowHideColumnSettings = () => {
      $timeout(() => {
      angular.element("#hide_show_column").focus();
    }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#title").focus();
      }, 0);
    };

    vm.openForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.showErrorDetails = false;
      vm.showDependencyDetails = false;
      vm.orderhelptext_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    vm.resetForm = function () {
      vm.orderHelpText_details = {};
      vm.orderHelpText_details["description"] = null;
    };

    // Create an order help text after save
    vm.createAnotherForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.orderHelpText_details = {};
      // Setting Previously entered data to the new context
      // vm.orderHelpText_details.entity_id = vm.orderHelpText.entity_id;
      // vm.orderHelpText_details.entity = vm.orderHelpText.entity;
       vm.setInitialState();
    };

    vm.closeForm = function () {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      $timeout(function () {
        vm.showDependencyDetails = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    vm.initializeOrderHelpText();
  }
})();
