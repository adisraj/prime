(function () {
  "use strict";
  angular
    .module("rc.prime.vendor.pricingterms")
    .controller("VendorpricingtermsController", VendorpricingtermsController);
  VendorpricingtermsController.$inject = [
    "$scope",
    "common",
    "VendorpricingtermsService",
    "FinancingChoicesService",
    "StatusCodes"
  ];

  function VendorpricingtermsController(
    $scope,
    common,
    VendorpricingtermsService,
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
    let logger = common.Logger.getInstance("VendorpricingtermsController");
    let SessionMemory = common.SessionMemory;
    vm.user_id = SessionMemory.API.Get('user.id');
    vm.common = common;

    vm.entityInformation = {};
    vm.annual_interest_touched = false;
    vm.minimum_monthly_touched = false;
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
    vm.loanType = [
      { id: 'interest_paid', typeof: 'Interest Paid' },
      { id: 'interest_free', typeof: 'Interest Free' }
    ]

    //variables used to show delete dependencies
    vm.dependencyList = {};
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;
    vm.$errorDependentData = {};

    //varibles to update page information
    vm.pageSize = 100;
    vm.sortType = "id";
    vm.currentPage = 1;

    vm.uuid = "134";

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
          description: {
            visible: true
          },
          paymentfactor: {
            visible: true
          },

          termdescription: {
            visible: true
          },
          annualinterest: {
            visible: true
          },
          term_id: {
            visible: true
          },
          balloon: {
            visible: true
          },
          loan_id: {
            visible: true
          },
          min_monthly: {
            visible: true
          },
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
        .GetFinancingChoicePricingFactors()
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
          FinancingChoicesService.API.GetFinancingChoiceTerms()
            .then(result => {
              if (result && result.data && result.data.data) {
                vm.financingChoiceTerms = result.data.data;
              } else {
                vm.financingChoiceTerms = [];
              }
            })
            .catch(() => { })
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
      vm.exists_pricingfactor = false;
      _.each(vm.vendorTermsList, choice => {
        if (choice.description.toLowerCase() == payload.description.toLowerCase() || ((choice.annual_interest == payload.annual_interest && choice.term_month == payload.term_month)
          || (choice.term_month == payload.term_month
            && choice.minimum_monthly == payload.minimum_monthly) && choice.loan_type == payload.loan_type)) {
          vm.exists_pricingfactor = true;
        }
      })
      if (!vm.exists_pricingfactor) {
        vm.saveBtnText = "Saving now...";
        vm.isBtnEnable = false;
        payload.created_by = Number(vm.user_id);
        payload.uuid = vm.entityInformation.uuid;
        payload.description = payload.description.replace(/"/g, '')
        payload.description = payload.description.replace(/'/g, '')
        if (!payload.loan_type) {
          payload['loan_type'] = 0
        }
        if (!payload.term_month) {
          payload['term_month'] = 0
        }
        if (!payload.payment_factor) {
          payload['payment_factor'] = 0
        }
        if (!payload.annual_interest) {
          payload['annual_interest'] = 0
        }
        if (!payload.minimum_monthly) {
          payload['minimum_monthly'] = 0
        }
        if (!payload.balloon_payment) {
          payload['balloon_payment'] = 0
        }

        VendorpricingtermsService.API.Insertpricingfactor(payload)
          .then(response => {
            vm.previousTerm = payload;
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            vm.isBtnEnable = true;
            vm.resetForm();
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
        // if (vm.exists_desc == true) {
        //   vm.saveBtnText = "Oops.!! Something went wrong";
        //   vm.saveBtnError = true;
        //   vm.message = "Duplicate Description";
        // }
        // else {
        vm.saveBtnText = "Oops.!! Something went wrong";
        vm.saveBtnError = true;
        vm.message = "Record already exists in the table";
        // }
        // vm.showexists_error = true;
        $timeout(function () {
          // vm.showexists_error = false;
          vm.saveBtnText = "Save";
          vm.saveBtnError = false;
          vm.exists_pricingfactor = false;
          // vm.exists_desc == false;
          vm.message = null;
        }, 3000);
      }
    };

    ////check if the payload is different from old form data. if it is then return true.
    vm.hasUpdateChanges = function (payload) {
      vm.exists_pricingfactor = false;
      vm.duplicateDesc = false;
      _.each(vm.vendorTermsList, choice => {
        if (choice.term_month == payload.term_month &&
          choice.loan_type && (
            (payload.loan_type == 'Interest Free' &&
              payload.minimum_monthly == choice.minimum_monthly && choice.payment_factor == payload.payment_factor) ||
            (payload.loan_type == 'Interest Paid' &&
              payload.annual_interest == choice.annual_interest && choice.payment_factor == payload.payment_factor))
        ) {
          vm.exists_pricingfactor = true;
        }
        if (choice.description.toLowerCase() == payload.description.toLowerCase() && vm.oldVendorTermDetails.description.toLowerCase() != payload.description.toLowerCase()) {
          vm.duplicateDesc = true;
        }
      })
      if (vm.oldVendorTermDetails.description.toLowerCase() != payload.description.toLowerCase() || ((vm.oldVendorTermDetails.annual_interest != payload.annual_interest || vm.oldVendorTermDetails.term_month != payload.term_month)
        || vm.oldVendorTermDetails.minimum_monthly != payload.minimum_monthly
        || vm.oldVendorTermDetails.loan_type != payload.loan_type) && (!vm.duplicateDesc || !vm.exists_pricingfactor)) {
        if (vm.duplicateDesc) return false
        else {
          if (vm.exists_pricingfactor && vm.oldVendorTermDetails.minimum_monthly != payload.minimum_monthly) return false
          else return true;
        }
      } else {
        return false;
      }
    };

    vm.update = function (payload) {
      vm.configured_paymentfactor = false;
      _.each(vm.allFinancingChoices, choice => {
        if (choice.first_description == vm.oldVendorTermDetails.description || choice.second_description == vm.oldVendorTermDetails.description) {
          vm.configured_paymentfactor = true;
        }
      })
      if (payload.annual_interest == null) payload.annual_interest = 0;
      if (payload.minimum_monthly == null) payload.minimum_monthly = 0;
      payload.description = payload.description.replace(/"/g, '')
      payload.description = payload.description.replace(/'/g, '')
      if (vm.hasUpdateChanges(payload) === true && (vm.configured_paymentfactor == false)) {
        //if the payload is different from old form data then send update request
        vm.isBtnEnable = false;
        vm.updateBtnText = "Updating Now...";
        payload.pricing_factor = (payload.pricing_factor);
        payload.newupdated_by = Number(vm.user_id);
        payload.oldpaymentfactor = vm.oldVendorTermDetails.payment_factor;
        payload.uuid = vm.entityInformation.uuid;
        payload.instance_id = vm.term_details.id
        if (payload.loan_type == 'Interest Paid') {
          payload.balloon_payment = 0;
          // payload.annual_interest = 0;
          payload.minimum_monthly = 0;
        }
        else {
          payload.annual_interest = 0;
          // payload.payment_factor = 0;
        }
        VendorpricingtermsService.API.Updatepricingfactor(payload)
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
        if (vm.configured_paymentfactor == true && (vm.oldVendorTermDetails.annual_interest != payload.annual_interest || vm.oldVendorTermDetails.term_month != payload.term_month || vm.oldVendorTermDetails.description != payload.description || vm.oldVendorTermDetails.minimum_monthly != payload.minimum_monthly)) {
          vm.updateBtnText = "Oops.!! Something went wrong";
          vm.updateBtnError = true;
          vm.message = "Selected Financing Payment factor is being used in Financing choice. Please delete the linked financing choice to make the changes here";
        }

        else if (vm.configured_paymentfactor) {
          vm.updateBtnText = "Oops.!! Something went wrong";
          vm.updateBtnError = true;
          vm.message = "Selected Financing Payment factor is being used in Financing choice. Please delete the linked financing choice to make the changes here";
        }

        //if the payload is not different from old form data then do not send update request
        else if (vm.oldVendorTermDetails.annual_interest == payload.annual_interest
          && vm.oldVendorTermDetails.term_month == payload.term_month &&
          vm.oldVendorTermDetails.description == payload.description &&
          vm.oldVendorTermDetails.minimum_monthly == payload.minimum_monthly
          && vm.oldVendorTermDetails.payment_factor == payload.payment_factor
          && vm.oldVendorTermDetails.loan_type == payload.loan_type) {
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
          vm.exists_pricingfactor = false;
          vm.term_details = JSON.parse(JSON.stringify(vm.oldVendorTermDetails));
          vm.onChangeTermMonth();
        }, 3000);
      }
    };

    vm.delete = function (payload) {
      vm.configured_paymentfactor = false;
      _.each(vm.allFinancingChoices, choice => {
        if ((choice.first_description == payload.description) || (choice.second_description == payload.description) ||
          (choice.first_description == vm.oldVendorTermDetails.description) || (choice.second_description == vm.oldVendorTermDetails.description)) {
          vm.configured_paymentfactor = true;
        }
      })
      if (!vm.configured_paymentfactor || vm.configured_paymentfactor == false) {
        VendorpricingtermsService.API.Deletepricingfactor(payload)
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
        vm.isConfirmDelete = false;
        vm.showConfigured_error = true;
        $timeout(function () {
          vm.showConfigured_error = false;

        }, 3000);
        vm.term_details = JSON.parse(JSON.stringify(vm.oldVendorTermDetails));

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
        angular.element("#pricing_factor").focus();
      });
    };

    vm.resetForm = function () {
      vm.term_details = {};
      vm.term_details["resetForm"] = null;
    };

    vm.roundOff = (number) => {
      return number !== null && number !== undefined
        ? Number.parseFloat(number).toFixed(3)
        : undefined;
    }

    vm.onChangePricingFactor = () => {
      vm.annual_interest_touched = true;
      if (!vm.term_details.annual_interest) {
        vm.term_details["initial"] = true;
      }
      var format = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]+/;

      if (format.test(vm.term_details.annual_interest) || vm.term_details.annual_interest == '' || vm.term_details.annual_interest == null) {
        vm.valid_error = true;
      } else {
        // if (vm.term_details.pricing_factor.length > 10) {
        //   vm.valid_error = true
        // }
        // else {
        if (vm.term_details.annual_interest) vm.term_details.annual_interest = vm.roundOff(vm.term_details.annual_interest)
        vm.valid_error = false;
        // }
      }
      if (vm.term_details.annual_interest !== '' && vm.term_details.annual_interest >= 0 && vm.term_details.annual_interest <= 30)
        vm.valid_error = false;
      else
        vm.valid_error = true;
    }

    vm.onChangeMinMonthly = () => {
      vm.minimum_monthly_touched = true;
      if (!vm.term_details.minimum_monthly) {
        vm.term_details["initial"] = true;
      }
      var format = /[a-zA-Z!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]+/;

      if (format.test(vm.term_details.minimum_monthly) || vm.term_details.minimum_monthly == '' || vm.term_details.minimum_monthly == null) {
        vm.valid_error = true;
      } else {
        // if (vm.term_details.minimum_monthly) vm.term_details.minimum_monthly = vm.roundOff(vm.term_details.minimum_monthly)
        vm.valid_error = false;
      }
      if (vm.term_details.minimum_monthly !== '' && vm.term_details.minimum_monthly >= 0 && vm.term_details.minimum_monthly <= Number(this.minimum_monthly_val))
        vm.valid_error = false;
      else
        vm.valid_error = true;
    }

    vm.resetField = () => {
      if (!vm.term_details.term_id) {
        vm.payment_factor = null;
      }
      // if (!vm.term_details.annual_interest && vm.term_details.annual_interest!=0) {
      //   vm.payment_factor = null;
      // }

    }

    // vm.onLoseF = () => {
    //   if (!vm.term_details.annual_interest) {
    //     vm.annual_interest_touched = true;
    //   }
    // }

    vm.clearFields = () => {
      vm.term_details.annual_interest = null;
      vm.term_details.payment_factor = null;
      vm.term_details.balloon_payment = null;
      vm.term_details.minimum_monthly = null;
      this.minimum_monthly_val = 0;
      if (vm.oldVendorTermDetails?.loan_type == vm.term_details.loan_type) {
        vm.term_details = JSON.parse(JSON.stringify(vm.oldVendorTermDetails));
      }
      var financing_term = vm.financingChoiceTerms.find(x => x.id == vm.term_details.term_id);
      vm.term_details.term_month = financing_term.term;
      if (vm.term_details.loan_type == 'Interest Free' && vm.term_details.term_month) {
        this.minimum_monthly_val = Number(vm.roundOff(100 / vm.term_details.term_month));
        var monthlychange = (this.minimum_monthly_val / 100)
        var balloon_percent = (1 - vm.term_details.term_month * (monthlychange));
        balloon_percent = balloon_percent * 100;
        if (balloon_percent < 0) this.minimum_monthly_val -= 0.001
      }
    }

    vm.onChangeTermMonth = () => {
      var financing_term = vm.financingChoiceTerms.find(x => x.id == vm.term_details.term_id);
      vm.term_details.term_month = financing_term.term;
      if (vm.term_details.loan_type == 'Interest Free' && vm.term_details.term_month) {
        this.minimum_monthly_val = Number(vm.roundOff(100 / vm.term_details.term_month));
        // var monthlychange = (this.minimum_monthly_val / 100)
        // var balloon_percent = (1 - vm.term_details.term_month * (monthlychange));
        // balloon_percent = balloon_percent * 100;
        // if (balloon_percent < 0) this.minimum_monthly_val -= 0.001
      }
    }

    vm.onChangeAnnualinterest = () => {
      this.valid_error = false;
      if (vm.term_details.term_id && vm.term_details.annual_interest <= 30 && vm.term_details.loan_type == 'Interest Paid') {
        if (vm.term_details.annual_interest <= 30) {
          var financing_term = vm.financingChoiceTerms.find(x => x.id == vm.term_details.term_id);
          vm.term_details.term_month = financing_term.term;
          vm.monthly_interest = (vm.term_details.annual_interest / 100) / 12;
          var ci = (1 + vm.monthly_interest);
          vm.compound_intrest = (Math.pow(ci, vm.term_details.term_month));
          if (vm.monthly_interest == 0)
            vm.payment_factor = vm.term_details.term_month;
          else {
            vm.payment_factor = (vm.compound_intrest - 1) / (vm.monthly_interest * vm.compound_intrest)
          }
          vm.payment_factor = vm.roundOff(vm.payment_factor);
          vm.term_details.payment_factor = vm.payment_factor;
        }
        else {
          vm.payment_factor = null;
        }
      } else {
        vm.payment_factor = null;
      }
    }

    vm.onChangeMinmonthlyPercentage = () => {
      if (vm.term_details.term_id && vm.term_details.minimum_monthly <= this.minimum_monthly_val && vm.term_details.loan_type == 'Interest Free') {
        var financing_term = vm.financingChoiceTerms.find(x => x.id == vm.term_details.term_id);
        vm.term_details.term_month = financing_term.term;
        vm.min_monthly = 0;
        if (vm.term_details.minimum_monthly >= 0) {
          vm.monthly_payment = (vm.term_details.minimum_monthly / 100);
          if (vm.monthly_payment > 0) vm.min_monthly = (1 / vm.monthly_payment);
          vm.balloon_percent = (1 - vm.term_details.term_month * vm.monthly_payment);
          vm.balloon_payment = vm.balloon_percent * 100;
          vm.term_details.payment_factor = Math.round(vm.min_monthly);
          vm.term_details.balloon_payment = Math.round(vm.balloon_payment);
          if (vm.term_details.balloon_payment < 1 && vm.term_details.balloon_payment > 0) vm.term_details.balloon_payment = 0
        }

      } else {
        vm.balloon_payment = null;
      }
    }

    //open create new form
    vm.openForm = function () {
      vm.entityInformation.name = "Financing Payment Factor";
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      vm.valid_error = true;
      vm.term_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
      vm.term_details["initial"] = true;
      vm.annual_interest_touched = false;
      vm.minimum_monthly_touched = false;
    };

    //set create form to new context on click of create another button after a new record created.
    vm.createAnotherForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.term_details = {};
      vm.payment_factor = null;
      vm.valid_error = true;
      vm.annual_interest_touched = false;
      vm.minimum_monthly_touched = false;
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
      vm.showConfigured_error = false;
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

    vm.clearData = function () {
      vm.term_details.term_id = null;
      vm.term_details.description = null;
      vm.term_details.annual_interest = null;
      vm.term_details.payment_factor = null;
      vm.term_details.balloon_payment = null;
      vm.term_details.minimum_monthly = null;
      vm.term_details.loan_type = null;
      vm.oldVendorTermDetails = {}
    }

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/message in the form will be closed.
    vm.dblClickAction = function (termDetails) {
      vm.valid_error = false;
      vm.isShowDetails = true;
      vm.showConfigured_error = false;
      vm.annual_interest_touched = true;
      vm.minimum_monthly_touched = true;
      vm.showDetailsById(termDetails);
      vm.oldVendorTermDetails = _.clone(termDetails);
      if (termDetails.loan_type == 'Interest Free' && termDetails.term_month) {
        this.minimum_monthly_val = Number(vm.roundOff(100 / termDetails.term_month));
        // var monthlychange = (this.minimum_monthly_val / 100)
        // var balloon_percent = (1 - vm.term_details.term_month * (monthlychange));
        // balloon_percent = balloon_percent * 100;
        // if (balloon_percent < 0) this.minimum_monthly_val -= 0.001
      }
      vm.setInitialState();
      vm.onChangePricingFactor();
      vm.onChangeMinMonthly();
    };

    vm.showDetailsById = function (termDetails) {
      let details = termDetails
      if (!details.term_id) {
        let financing_id = vm.financingChoiceTerms.find(x => x.term == termDetails.term_month);
        details.term_id = financing_id.id;
        var terM = details.term_month;
        var annI = details.annual_interest;
      }

      vm.term_details = Object.assign(vm.term_details, details);
      vm.payment_factor = details.payment_factor;

      // vm.term_details.term_id = _.clone(termDetails.term_month);
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
        angular.element("#pricing_factor").focus();
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
