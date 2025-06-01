(function () {
  "user strict";
  angular
    .module("rc.prime.invoicetermsandconditions")
    .controller("invoicetermsandconditionsController", invoicetermsandconditionsController);
  invoicetermsandconditionsController.$inject = [
    "$scope",
    "invoicetermsandconditionsService",
    "common",
    "EntityService"
  ];

  function invoicetermsandconditionsController(
    $scope,
    invoicetermsandconditionsService,
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
    vm.termsExists = false;
    vm.titleLengthError = false;
    vm.sortType = "id";
    vm.sortReverse = false;
    vm.showDependencyDetails = false;
    vm.showErrorDetails = false;
    vm.orderHelpText_details = {};
    vm.oldOrderHelpText = {};
    vm.entityInformation = {};

    // Unique Identification number
    vm.uuid = "137";

    /** Common Modules */
    let $timeout = common.$timeout;
    let logger = common.Logger.getInstance("invoicetermsandconditionsController");
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
    vm.focusSearchField = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000)
    };

    // fuction to close the dependency panel
    vm.closeDependencyList = () => {
      $timeout(function () {
        angular.element("#title").focus();
      }, 500);
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
    }


    /* fetch all invoice terms and conditions */
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
      invoicetermsandconditionsService.API.GetTermsConditionList()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.orderHelpTextList = response.data.sort(function(a, b) {
            return a.id - b.id;
          });
          vm.isLoaded = false;
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

    vm.loadInvoiceTypes = function () {
      invoicetermsandconditionsService.API.GetInvoiceTypes()
        .then(function (response) {
          vm.originalinvoiceTypes = vm.invoiceTypes = response.data; // Store the invoice types
          // Create a Set of all invoiceTypes from y for quick lookup
          // const yInvoiceTypes = new Set(vm.orderHelpTextList.map(item => item.invoiceType));

          // // Filter x to remove items that have a type existing in yInvoiceTypes
          // vm.invoiceTypes = vm.invoiceTypes.filter(item => !yInvoiceTypes.has(item.type));
        })
        .catch(function (error) {
          console.error("Error fetching invoice types", error);
        });
    };
    vm.$onInit = function () {
      vm.loadInvoiceTypes(); // Call the function when the controller is initialized
    };

    // Check if any record already exists with the same type
    vm.checkTermsExists = function() {
      if (vm.orderHelpText_details.invoiceType) {
          vm.termsExists = vm.orderHelpTextList.some(item => 
              item.invoiceType === vm.orderHelpText_details.invoiceType && 
              (!vm.orderHelpText_details.id || item.id !== vm.orderHelpText_details.id)
          );
      } else {
          vm.termsExists = false;
      }
  };

    /* save new order help text */
    vm.save = function (payload) {
      if (payload.title && payload.title.length > 40) {
        vm.titleLengthError = true;
        return;
      }
      vm.titleLengthError = false;
      if (vm.termsExists) {
        vm.saveBtnText = "This type already exists!";
        vm.saveBtnError = true;
        $timeout(function () {
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
        }, 1000);
        return;
    }
      vm.saveBtnText = "Saving now...";
      invoicetermsandconditionsService.API.InsertTermsCondition(payload)
        .then(response => {
          vm.orderHelpText_details = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          payload.id = response.data.id;
          vm.orderHelpTextList.push(payload);
          vm.rowsCount++;
          vm.updateTableInformation(1);
          vm.reload(true)
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
        vm.oldOrderHelpText.title !== payload.title ||
        vm.oldOrderHelpText.invoiceType !== payload.invoiceType
      ) {
        return true;
      } else {
        return false;
      }
    };
    // delete order help text
    vm.delete = function (payload) {
      invoicetermsandconditionsService.API.DeleteTermsCondition(payload)
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
      if (payload.title && payload.title.length > 40) {
        vm.titleLengthError = true;
        return;
      }
      vm.titleLengthError = false;
      if (vm.termsExists) {
        vm.updateBtnText = "This type already exists!";
        vm.updateBtnError = true;
        $timeout(function () {
            vm.updateBtnText = "Update";
            vm.updateBtnError = false;
        }, 1000);
        return;
    }
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        invoicetermsandconditionsService.API.UpdateTermsCondition(payload)
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
          },
          type: {
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
      // vm.invoiceTypes = vm.originalinvoiceTypes;
      vm.showDetailsByID(orderHelpData);
      vm.setInitialState();
    };

    vm.showDetailsByID = function (orderHelpData) {
      vm.termsExists = false;
      vm.titleLengthError = false;
      vm.resetForm();
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
      vm.termsExists = false;
      vm.titleLengthError = false;
      vm.orderhelptext_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    vm.resetForm = function () {
      vm.orderHelpText_details = {};
      vm.orderHelpText_details["description"] = null;
      vm.termsExists = false;
      vm.titleLengthError = false;
      vm.updateBtnError = false;
    };

    // Create an order help text after save
    vm.createAnotherForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.orderHelpText_details = {};
      vm.setInitialState();
    };

    vm.closeForm = function () {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      vm.termsExists = false;
      vm.titleLengthError = false;
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
