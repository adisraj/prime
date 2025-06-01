(function () {
  "use strict";
  angular
    .module("rc.prime.vendor.financingterms")
    .controller("VendorfinancingtermsController", VendorfinancingtermsController);
  VendorfinancingtermsController.$inject = [
    "$scope",
    "common",
    "VendorfinancingTermsService",
    "FinancingChoicesService",
    "StatusCodes"
  ];

  function VendorfinancingtermsController(
    $scope,
    common,
    VendorfinancingTermsService,
    FinancingChoicesService,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    /*Common modules*/
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let Identifiers = common.Identifiers;
    let logger = common.Logger.getInstance("VendorfinancingtermsController");
    let SessionMemory = common.SessionMemory;
    vm.user_id = SessionMemory.API.Get('user.id');
    vm.common = common;

    vm.entityInformation = {};

    vm.term_details = {};
    vm.previousTerm = {};
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.oldVendorTermDetails = null;
    vm.error = {};
    vm.message = null;
    vm.isShowHistory = false;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;
    vm.isBtnEnable = true;

    //variables used for create/update forms
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;

    //variables used to show delete dependencies
    vm.dependencyList = {};
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;
    vm.$errorDependentData = {};

    //varibles to update page information
    vm.pageSize = 100;
    vm.sortType = "id";
    vm.currentPage = 1;

    vm.uuid = "133";

    //initialize vendor terms module
    vm.initializeVendorTerms = function () {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.reload();
      $scope.getAccessPermissions(vm.uuid);
    };

    //Set vendor term grid properties for show-hide vendor term columns
    vm.setGridProperties = () => {
      vm.vendorTermGrid = {
        columns: {
          id: {
            visible: false
          },
          // status: {
          //   visible: true
          // },
          description: {
            visible: true
          }
        }
      };
    };

    //toggle Hide/Show columns panel
    vm.ShowHideColumnSettings = () => {
      this.common.$timeout(() => {
        angular.element("#hide_show_column").focus();
      }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //get vendor term entity information stored statically in applicatio.context.js file
    vm.getEntityInformation = function () {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        vendor_term_information => {
          vm.entityInformation = vendor_term_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.vendor);
        }
      );
    };

    //Focus
    vm.focusSearchField = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000)
    };

    //get JSON model and set validations rules
    vm.getModelAndSetValidationRules = function () {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(
        model => { }
      );
    };

    /**
     * @param {Boolean} refresh true/false
     * @description On page load or on "Refresh" button click this will be called.
     * If refresh value is true the message with record number, response time take will be shown in UI
     */
    vm.reload = function (refresh) {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.isLoaded = false;
      $scope.selectedRow = null;
      FinancingChoicesService.API
        .GetFinancingChoiceTerms()
        .then(response => {
          vm.rowsCount = response.data.data.length;
          vm.vendorTermsList = response.data.data;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.data.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.data.data.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
            vm.focusSearchField();
          }
          $timeout(() => {
            vm.isLoaded = true;
          }, 2500)
          vm.updateTableInformation(1); ////on reload update table information like no. of records
          FinancingChoicesService.API
            .GetFinancingChoices()
            .then(response => {
              vm.allFinancingChoices = response.data;
            });
          FinancingChoicesService.API
            .GetFinancingChoicePricingFactors()
            .then(response => {
              vm.financingPaymentTerms = response.data.data;
            });
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

    vm.save = function (payload) {
      vm.exists_term = false;
      _.each(vm.vendorTermsList, choice => {
        if (choice.term == payload.term) {
          vm.exists_term = true;
        }
      })
      if (!vm.exists_term) {
        vm.saveBtnText = "Saving now...";
        vm.isBtnEnable = false;
        payload.created_by = Number(vm.user_id);
        payload.uuid = vm.entityInformation.uuid;
        VendorfinancingTermsService.API.InsertfinancingTerm(payload)
          .then(response => {
            vm.previousTerm = payload;
            vm.saveBtnText = "Save";
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
            vm.error = true;
            $timeout(function () {
              vm.isBtnEnable = true;
              vm.message = null;
              vm.saveBtnText = "Save";
              vm.saveBtnError = false;
            }, 2500);
          });
      }
      else {
        vm.saveBtnText = "Oops.!! Something went wrong";
        vm.saveBtnError = true;
        vm.message = "Record already exists in the table";
        // vm.showexists_error = true;
        $timeout(function () {
          // vm.showexists_error = false;
          vm.saveBtnText = "Save";
          vm.saveBtnError = false;
          vm.exists_term = false;
          vm.message = null;
        }, 3000);
      }
    };

    ////check if the payload is different from old form data. if it is then return true.
    vm.hasUpdateChanges = function (payload) {
      vm.exists_term = false;
      _.each(vm.vendorTermsList, choice => {
        if (choice.term == payload.term) {
          vm.exists_term = true;
        }
      })
      if (
        vm.oldVendorTermDetails.term != payload.term && !vm.exists_term
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function (payload) {
      vm.configured_pricingfactor = false;
      _.each(vm.financingPaymentTerms, choice => {
        if (choice.term_month == vm.oldVendorTermDetails.term) {
          vm.configured_pricingfactor = true;
        }
      })
      vm.configured_paymentfactor = false;
      _.each(vm.vendorTermsList, choice => {
        if (choice.term == vm.oldVendorTermDetails.term) {
          vm.configured_paymentfactor = true;
        }
      })
      if (vm.hasUpdateChanges(payload) === true && vm.configured_pricingfactor == false) {
        //if the payload is different from old form data then send update request
        vm.isBtnEnable = false;
        vm.updateBtnText = "Updating Now...";
        payload.term = Number(payload.term);
        payload.newupdated_by = Number(vm.user_id);
        payload.oldterm = vm.oldVendorTermDetails.term;
        payload.uuid = vm.entityInformation.uuid;
        payload.instance_id = vm.term_details.id
        VendorfinancingTermsService.API.UpdateFinancingterm(payload)
          .then(response => {
            payload.$edit = false;
            vm.reload();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldVendorTermDetails = null;
            vm.isBtnEnable = true;
            $scope.closeShowHistory();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.message = vm.common.Notification.errorNotification(error);
            }
            vm.error = true;
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(function () {
              vm.isBtnEnable = true;
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        if(vm.configured_pricingfactor == true  && (vm.oldVendorTermDetails.term!=payload.term))
        {
          vm.updateBtnText = "Oops.!! Something went wrong";
          vm.updateBtnError = true;
          vm.message = "Term is being used in financing payment factor. Create a new term if needed";
        }
        //if the payload is not different from old form data then do not send update request
        else if (!vm.exists_term || vm.oldVendorTermDetails.term == payload.term) {
          vm.updateBtnText = "Nothing to update";
          vm.updateBtnError = true;
        }
        else {
          vm.updateBtnText = "Oops.!! Something went wrong";
          vm.updateBtnError = true;
          vm.message = "Record already exists in the table";

        }
        $timeout(function () {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
          vm.message = null;
          vm.exists_term = false;
        }, 3000);
      }
    };

    vm.delete = function (payload) {
      vm.configured_pricingfactor = false;
      _.each(vm.financingPaymentTerms, choice => {
        if (choice.term_month == payload.term) {
          vm.configured_pricingfactor = true;
        }
      })
      vm.configured_paymentfactor = false;
      _.each(vm.financingPaymentTerms, choice => {
        if (choice.term_month == vm.oldVendorTermDetails.term) {
          vm.configured_paymentfactor = true;
        }
      })
      if (!vm.configured_pricingfactor && vm.configured_paymentfactor == false) {
        vm.updateBtnText = "Deleting Now...";
        VendorfinancingTermsService.API.DeleteFinancingTerm(payload)
          .then(response => {
            vm.isDeleteSuccess = true;
            vm.isConfirmDelete = false;
            vm.reload();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              //vm.message = error.data.error;
              vm.dependencyList = vm.common.Notification.errorNotification(error);
              vm.isUpdateSuccess = false;
              vm.showDependencyDetails = true;
            }
          });
      }
      else {
        // vm.isConfirmDelete = false;
        vm.showConfigured_error = true;
        // $timeout(function () {
        //   vm.showConfigured_error = false;
        // }, 3000);
      }
    };

    //show message asking for delete confirmation
    vm.showconfirm = function () {
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
    };

    //show the dependent entities list in side panel
    vm.showDependencyListDetails = function (data) {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    //set focus on first field in form
    vm.setInitialState = function () {
      $timeout(function () {
        angular.element("#term").focus();
      });
    };

    vm.resetForm = function () {
      vm.term_details = {};
      vm.term_details["term"] = null;
    };

    vm.onChangeFinancingterm = () => {
      if (!vm.term_details.term) {
        vm.term_details["initial"] = true;
      }
      var format = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

      if (format.test(vm.term_details.term)) {
        vm.valid_error = true;
      } else {
        if (vm.term_details.term.length > 3) {
          vm.valid_error = true
        }
        else {
          vm.valid_error = false;
        }
      }
    }

    //open create new form
    vm.openForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.showDependencyDetails = false;
      vm.showConfigured_error = false;
      vm.showDependencyDetailsData = false;
      vm.valid_error = false;
      vm.term_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
      vm.term_details["initial"] = true;
    };

    //set create form to new context on click of create another button after a new record created.
    vm.createAnotherForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.term_details = {};
      //Setting Previously entered data to the new context
      vm.term_details.status_id = vm.previousTerm.status_id;
      vm.setInitialState();
      vm.term_details["initial"] = true;
    };

    //close forms and messages
    vm.closeForm = function () {
      vm.message = null;
      vm.isShowDetails = false;
      vm.showDependencyDetailsData = false;
      $timeout(function () {
        vm.isUnauthorized = false;
        vm.showDependencyDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = function () {
      vm.showDependencyDetailsData = false;
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = function () {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
      vm.showErrorDetailsData = false;
      vm.showErrorDetails = false;
      vm.valid_error = false;
      vm.isShowDetails = true;
      vm.showConfigured_error = false;
    };

    //highlight clicked row in table
    vm.setClickedRow = function (index) {
      $scope.selectedRow = index;
    };

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/message in the form will be closed.
    vm.dblClickAction = function (termDetails) {
      vm.valid_error = false;
      vm.isShowDetails = true;
      vm.showConfigured_error = false;
      vm.showDetailsById(termDetails);
      vm.oldVendorTermDetails = _.clone(termDetails);
      vm.setInitialState();
    };
    vm.showDetailsById = function (termDetails) {
      vm.term_details = _.clone(termDetails);
      if (!vm.term_details.term) vm.term_details.term = 'Null';
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
    };

    //Close show history panel only
    $scope.closeShowHistory = function () {
      $timeout(function () {
        angular.element("#term").focus();
      });
      $scope.showhistory = false;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
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

    //Get history details for vendor terms
    $scope.loadHistory = function () {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.term_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    activate();

    function activate() {
      vm.setGridProperties();
      vm.initializeVendorTerms();
    }
  }
})();
