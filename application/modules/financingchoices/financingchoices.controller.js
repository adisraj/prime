(() => {
  "use strict";
  angular.module("rc.prime.financingchoices").controller("FinancingChoicesController", FinancingChoicesController);
  FinancingChoicesController.$inject = [
    "$scope",
    "common",
    "FinancingChoicesService",
    "FinancingPriceAdjustmentsService",
    "valdr",
    "StatusCodes"
  ];

  function FinancingChoicesController(
    $scope,
    common,
    FinancingChoicesService,
    FinancingPriceAdjustmentsService,
    valdr,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    vm.entityInformation = {};
    vm.oldFinancingChoiceDetails = {};
    vm.error = {};
    vm.message = null;
    vm.isShowHistory = false;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.financingChoiceDetails = {};

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoading = true;

    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.showwarning_plan = false;
    vm.indtypes = [];
    // varibles to update page information
    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    // variables used to show delete dependencies
    vm.showErrorDetails = false;
    vm.showErrorDetailsData = false;
    vm.errorDependentData = {};
    vm.dependencyList = {};
    vm.displayCriteria = [
      { id: 'always', name: 'Always', disable: false },
      { id: 'primary', name: 'Primary', disable: false },
      { id: 'always_default', name: 'Always default', disable: false },
      { id: 'primary_default', name: 'Primary default', disable: false }
    ]

    vm.isColumnSettingsVisible = false;

    vm.uuid = "126";
    vm.special_pattern = "[a-zA-Z0-9]+"

    /** Common Modules */
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let NotificationService = common.Notification;

    // Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.financingChoiceGrid = {
        columns: {
          id: {
            visible: false
          },
          description: {
            visible: true
          },
          is_eligible_for_finance: {
            visible: true
          },
          first_term_month: {
            visible: true
          },
          first_annual_interest: {
            visible: true
          },
          first_minimum_monthly: {
            visible: true
          },
          first_balloon_payment: {
            visible: true
          },
          first_payment_factor: {
            visible: true
          },
          second_term_month: {
            visible: true
          },
          second_annual_interest: {
            visible: true
          },
          second_minimum_monthly: {
            visible: true
          },
          second_balloon_payment: {
            visible: true
          },
          second_payment_factor: {
            visible: true
          },
          status: {
            visible: true
          },
          plan_number: {
            visible: true
          },
          display_criteria: {
            visible: true
          }
        }
      };
    };

    // to get required information of financing choice entity
    vm.getEntityInformation = () => {
      EntityDetails.API
        .GetEntityInformation(vm.uuid)
        .then(result => {
          vm.entityInformation = result;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.entity);
        });
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API
        .GetModelAndSetValidationRules(vm.uuid)
        .then(() => { });
    };

    vm.getFinancingChoiceTerms = () => {
      FinancingChoicesService.API
        .GetFinancingChoiceTerms()
        .then(result => {
          if (result && result.data && result.data.data) {
            vm.financingChoiceTerms = result.data.data;
          } else {
            vm.financingChoiceTerms = [];
          }
        })
        .catch(() => { })
    };

    vm.getFinancingChoicePricingFactors = () => {
      FinancingChoicesService.API
        .GetFinancingChoicePricingFactors()
        .then(result => {
          if (result && result.data && result.data.data) {
            vm.financingChoicePricingFactors = result.data.data;
          } else {
            vm.financingChoicePricingFactors = [];
          }
        })
        .catch(() => { })
    };

    vm.initializeFinancingChoice = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.reload();
      vm.getFinancingChoiceTerms();
      vm.getFinancingChoicePricingFactors();
    };

    vm.resetTermAndPricingFactor = () => {
      vm.financingChoiceDetails.term_month = null;
      vm.financingChoiceDetails.payment_factor = null;
      delete vm.financingChoiceDetails.term_month;
      delete vm.financingChoiceDetails.payment_factor;
    }

    vm.changePricingFactor = () => {
      for (let index = 0; index < vm.financingChoicePricingFactors.length; index++) {
        if (vm.financingChoiceTerms[index].id == vm.financingChoiceDetails.term_id) {
          vm.financingChoiceDetails.term_month = vm.financingChoiceTerms[index].term_month;
          break;
        }
      }
      for (let index = 0; index < vm.financingChoicePricingFactors.length; index++) {
        if (vm.financingChoicePricingFactors[index].pricing_factor == vm.financingChoiceDetails.term) {
          vm.financingChoiceDetails.pricing_factor_id = vm.financingChoicePricingFactors[index].id;
          vm.financingChoiceDetails.pricing_factor = vm.financingChoicePricingFactors[index].pricing_factor;
          break;
        }
      }
    }

    vm.onChangetermMonth = (term_month) => {
      if (term_month) {
        vm.financingChoiceDetails.payment_factor = null;
        if (vm.changeterm) {
          vm.financingChoiceDetails.annual_interest = null;
        }
        vm.anual_ar = vm.vendorTermsList.filter(item => term_month == item.term_month);
        vm.financingChoiceDetails.term_month = term_month;
      }
    }

    // vm.onChangeAnnualInterest = (annual_interest) => {
    //   annual_interest = annual_interest !== null ? annual_interest : null;
    //   if (annual_interest >= 0 && annual_interest != null) {
    //     var filtered_annual = vm.anual_ar.filter(item => annual_interest == item.annual_interest);
    //     vm.payment_factor = filtered_annual[0].payment_factor;
    //     vm.financingChoiceDetails.annual_interest = annual_interest;
    //     vm.financingChoiceDetails.payment_factor = vm.payment_factor;
    //   }
    // }

    vm.disableCriteriaOptions = () => {
      vm.displayCriteria.forEach(criteria => {
        criteria.disable = false
      })
      vm.allFinancingChoices.forEach(item => {
        if (item.display && item.display.toLowerCase() == 'always default') {
          vm.displayCriteria.forEach(criteria => {
            if (criteria.id == 'always_default' ) {
              criteria.disable = true
            }
          })
        }
        if (item.display && item.display.toLowerCase() == 'primary default') {
          vm.displayCriteria.forEach(criteria => {
            if (criteria.id == 'primary_default' ) {
              criteria.disable = true
            }
          })
        }
      })
    }

    vm.reload = refresh => {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      vm.isLoading = true;
      FinancingChoicesService.API
        .GetFinancingChoices()
        .then(response => {
          vm.allFinancingChoices = response.data;
          vm.disableCriteriaOptions();
          vm.rowsCount = vm.allFinancingChoices.length;
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
          vm.isLoading = false;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoading = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
      FinancingChoicesService.API
        .GetFinancingChoicePricingFactors()
        .then(response => {
          vm.vendorTermsList = response.data.data;
          vm.vendorFinancing_ar = [];
          vm.vendorFinancing_ar = vm.vendorTermsList.filter((arr, index, self) =>
            index === self.findIndex((a) => (a.description == arr.description)))
          vm.original_vendorfinancing = JSON.parse(JSON.stringify(vm.vendorFinancing_ar))
        })
      FinancingPriceAdjustmentsService.API
        .GetFinancingPriceAdjustments()
        .then(response => {
          vm.allFinancingPriceAdjustments = response.data;
        })
    };

    vm.onChangePaidInterest = function (description) {
      this.is_interest_paid = false;
      this.is_interest_free = false;
      var financeTerm = vm.vendorTermsList.filter(x => x.description == description);
      vm.second_paymentar = vm.original_vendorfinancing.filter(desc => desc.description != description)
      if (financeTerm?.length) {
        vm.financingChoiceDetails.first_term_month = financeTerm[0].term_month;
        // vm.financingChoiceDetails.payment_factor_paid = financeTerm[0].payment_factor;
        vm.financingChoiceDetails.first_annual_interest = financeTerm[0].annual_interest;
        vm.financingChoiceDetails.first_minimum_monthly = financeTerm[0].minimum_monthly;
        vm.financingChoiceDetails.first_balloon_payment = financeTerm[0].balloon_payment;
        vm.financingChoiceDetails.first_payment_factor = financeTerm[0].payment_factor;
        if (financeTerm[0].loan_type == "Interest Paid") {
          this.is_interest_paid = true;
          vm.vendorFinancing_ar = vm.original_vendorfinancing;
          vm.financingChoiceDetails.second_description = null; vm.financingChoiceDetails.second_term_month = null;
          vm.financingChoiceDetails.second_annual_interest = null; vm.financingChoiceDetails.second_payment_factor = null;
          vm.financingChoiceDetails.second_minimum_monthly = null; vm.financingChoiceDetails.second_balloon_payment = null;
        }
        else if (financeTerm[0].loan_type == "Interest Free") {
          this.is_interest_free = true;
        }
      }
    };

    vm.ChangeDefaults = () => {
      this.is_interest_paid = false;
      this.is_interest_free = false
      vm.financingChoiceDetails.second_description = null; vm.financingChoiceDetails.second_term_month = null;
      vm.financingChoiceDetails.second_annual_interest = null; vm.financingChoiceDetails.second_payment_factor = null;
      vm.financingChoiceDetails.second_minimum_monthly = null; vm.financingChoiceDetails.second_balloon_payment = null;
      vm.financingChoiceDetails.first_description = null; vm.financingChoiceDetails.first_term_month = null;
      vm.financingChoiceDetails.first_annual_interest = null; vm.financingChoiceDetails.first_payment_factor = null;
      vm.financingChoiceDetails.first_minimum_monthly = null; vm.financingChoiceDetails.first_balloon_payment = null;
      vm.vendorFinancing_ar = vm.original_vendorfinancing;
    }

    vm.onChangeSecondPaidInterest = (description) => {
      this.second_interest_paid = false;
      this.second_interest_free = false;
      var financeTerm = vm.vendorTermsList.filter(x => x.description == description);
      vm.vendorFinancing_ar = vm.original_vendorfinancing.filter(desc => desc.description != description)
      if (financeTerm?.length) {
        vm.financingChoiceDetails.second_term_month = financeTerm[0].term_month;
        // vm.financingChoiceDetails.payment_factor_paid = financeTerm[0].payment_factor;
        vm.financingChoiceDetails.second_annual_interest = financeTerm[0].annual_interest;
        vm.financingChoiceDetails.second_minimum_monthly = financeTerm[0].minimum_monthly;
        vm.financingChoiceDetails.second_balloon_payment = financeTerm[0].balloon_payment;
        vm.financingChoiceDetails.second_payment_factor = financeTerm[0].payment_factor;
        if (financeTerm[0].loan_type == "Interest Paid") {
          this.second_interest_paid = true;
        }
        else if (financeTerm[0].loan_type == "Interest Free") {
          this.second_interest_free = true;
        }
      }
    }

    vm.onChangeplannumber = payload => {
      var format = /[!@#$%^&*()_+\-=\[\]{};':"`~\\|,.<>\/?]+/;

      if (format.test(payload.plan_number)) {
        payload.show_specialwarning = true
      } else {
        payload.show_specialwarning = false
      }
      if (payload.plan_number && payload.plan_number.length < 4) {
        vm.financing_choice_form.plan_number.$invalid = true;
        vm.financing_choice_form.plan_number.$valid = false;
      }
      if (payload.is_eligible_for_finance == 1 && payload.changeplan) {
        if (!payload.plan_number || payload.plan_number.length == 0) {
          payload.showwarning_plan = true;
          $timeout(() => {
            payload.showwarning_plan = false;
          }, 2500);
        }
        else {
          payload.showwarning_plan = false;
        }
      }
      else {
        payload.showwarning_plan = false;
      }
    }

    vm.save = payload => {
      vm.exists_desc = false;
      _.each(vm.allFinancingChoices, choice => {
        if (choice.description == payload.description) {
          vm.exists_desc = true;
        }
      })
      // vm.exists_paymentfactor = false;
      // _.each(vm.allFinancingChoices, choice => {
      //   if ((choice.annual_interest == payload.annual_interest && choice.term_month == payload.term_month)) {
      //     vm.exists_paymentfactor = true;
      //   }
      // })
      // if (payload.payment_factor == null) {
      //   vm.exists_paymentfactor = false;
      // }
      if (vm.exists_desc == false) {
        vm.financingChoiceDetails.isProcessing = true;
        vm.changeterm = false;
        vm.saveBtnText = "Saving now...";
        if (payload.term_month === "") {
          delete payload.term_month;
        }
        if (payload.payment_factor === "") {
          delete payload.payment_factor;
        }
        payload.new_plannumber = payload.plan_number || "";
        FinancingChoicesService.API
          .InsertFinancingChoice(payload)
          .then(response => {
            payload.plan_number = response.config.data.new_plannumber;
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            vm.financingChoiceDetails.isProcessing = false;
            payload.id = response.data.inserted_id;
            let statusindex = $scope.statuses.findIndex(status => status.code == payload.status_id);
            payload.status = $scope.statuses[statusindex].description;
            if (payload.is_eligible_for_finance == 1) {
              payload.display_is_eligible_for_finance = "Yes";
            } else if (payload.is_eligible_for_finance == 0) {
              payload.display_is_eligible_for_finance = "No";
            }
            vm.disableCriteriaOptions();
            vm.allFinancingChoices.push(payload);
            vm.rowsCount++;
            vm.updateTableInformation(vm.currentPage);
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.saveBtnText = "Oops.!! Something went wrong";
            vm.saveBtnError = true;
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.financingChoiceDetails.isProcessing = false;
            $timeout(() => {
              vm.message = null;
              vm.saveBtnText = "Save";
              vm.saveBtnError = false;
            }, 2500);
          });
      }
      else {
        if (vm.exists_desc == true) {
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.message = new Array()
          vm.message = "Duplicate Description";
          if (vm.exists_paymentfactor) {
            vm.message = "Duplicate Description : Selected Term & Annual Interest Rate already exists in the table";
          }
        }
        else {
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.message = "Selected Term & Annual Interest Rate already exists in the table";
        }
        // vm.showexists_error = true;
        $timeout(function () {
          // vm.showexists_error = false;
          vm.saveBtnText = "Save";
          vm.saveBtnError = false;
          vm.exists_paymentfactor = false;
          vm.exists_desc == false;
          vm.message = null;
        }, 3000);
      }
    };

    // check that update form previous data is not same as payload
    vm.hasUpdateChanges = payload => {
      vm.exists_description = false;
      // _.each(vm.allFinancingPriceAdjustments, choice => {
      //   if ((choice.financing_choice_description == vm.oldFinancingChoiceDetails.description)) {
      //     vm.exists_description = true;
      //   }
      // })
      // vm.exists_term = false;
      // _.each(vm.allFinancingChoices, choice => {
      //   if ((choice.annual_interest == payload.annual_interest && choice.term_month == payload.term_month && payload.is_eligible_for_finance == 1)) {
      //     vm.exists_term = true;
      //   }
      // })
      // if (vm.exists_paymentfactor) {
      //   if (!vm.exists_desc && !vm.exists_term && (vm.oldFinancingChoiceDetails.description != payload.description)
      //     && vm.oldFinancingChoiceDetails.term_month == payload.term_month && vm.oldFinancingChoiceDetails.annual_interest == payload.annual_interest) {
      //     vm.exists_paymentfactor = false;
      //   } else {
      //     if (Number(vm.oldFinancingChoiceDetails.is_eligible_for_finance) !== Number(payload.is_eligible_for_finance)
      //       || Number(vm.oldFinancingChoiceDetails.status_id) !== Number(payload.status_id) || (vm.oldFinancingChoiceDetails.plan_number !== payload.plan_number)
      //     ) {
      //       vm.exists_paymentfactor = false;
      //     }
      //     else {
      //       vm.exists_paymentfactor = true;
      //     }
      //   }
      // }
      if (
        (vm.oldFinancingChoiceDetails.description !== payload.description || vm.oldFinancingChoiceDetails.display !== payload.display ||
          Number(vm.oldFinancingChoiceDetails.is_eligible_for_finance) !== Number(payload.is_eligible_for_finance) ||
          (((vm.oldFinancingChoiceDetails.first_description) !== (payload.first_description)) ||
            ((vm.oldFinancingChoiceDetails.second_description) !== (payload.second_description)) && !vm.exists_paymentfactor) ||
          Number(vm.oldFinancingChoiceDetails.status_id) !== Number(payload.status_id) ||
          vm.oldFinancingChoiceDetails.plan_number !== payload.plan_number) && !vm.exists_description
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

    vm.update = payload => {
      vm.financingChoiceDetails.new_plannumber = payload.plan_number;
      vm.financingChoiceDetails.new_plannumber = vm.financingChoiceDetails.plan_number;
      vm.financingChoiceDetails.isProcessing = true;
      vm.changeterm = false;
      vm.updateBtnText = "Updating Now...";
      if (!payload.term_id) {
        payload.term_id = null;
        payload.term = null;
      }
      vm.exists_desc = false;
      _.each(vm.allFinancingChoices, choice => {
        if (choice.description == payload.description && choice.description !== vm.oldFinancingChoiceDetails.description) {
          vm.exists_desc = true;
        }
      })

      if (!payload.pricing_factor_id) {
        payload.pricing_factor_id = null;
        payload.pricing_factor = null;
      }
      if (vm.hasUpdateChanges(payload) === true && vm.exists_desc == false) {
        $scope.showhistory = false;
        FinancingChoicesService.API
          .UpdateFinancingChoice(payload)
          .then(response => {
            payload.plan_number = response.data.updatedResult.plan_number;
            vm.financingChoiceDetails.isProcessing = false;
            let index = vm.allFinancingChoices.findIndex(
              financingChoice => financingChoice.id === payload.id
            );
            if (
              Number(vm.oldFinancingChoiceDetails.status_id) !==
              Number(payload.status_id)
            ) {
              let statusindex = $scope.statuses.findIndex(status => status.code == payload.status_id);
              payload.status = $scope.statuses[statusindex].description;
            }
            if (payload.is_eligible_for_finance == 1) {
              payload.display_is_eligible_for_finance = "Yes";
            } else if (payload.is_eligible_for_finance == 0) {
              payload.display_is_eligible_for_finance = "No";
            }
            vm.allFinancingChoices[index] = payload;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldFinancingChoiceDetails = _.clone(payload);
            vm.disableCriteriaOptions();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            vm.financingChoiceDetails.isProcessing = false;
            $timeout(() => {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      }
      else {
        if (vm.exists_description == true && vm.oldFinancingChoiceDetails.description != payload.description) {
          vm.updateBtnText = "Oops.!! Something went wrong";
          vm.updateBtnError = true;
          vm.message = "Financing Choice is being used";
          vm.financingChoiceDetails.isProcessing = false;
        }
        else if ((vm.oldFinancingChoiceDetails.description == payload.description && vm.oldFinancingChoiceDetails.first_description == payload.first_description && vm.oldFinancingChoiceDetails.second_description == payload.second_description)) {
          vm.financingChoiceDetails.isProcessing = false;
          vm.updateBtnText = "Nothing to update";
          vm.updateBtnError = true;
        }
        else if (vm.exists_desc && (vm.oldFinancingChoiceDetails.description != payload.description)) {
          vm.updateBtnText = "Oops.!! Something went wrong";
          vm.updateBtnError = true;
          vm.message = "Duplicate Description";
          vm.financingChoiceDetails.isProcessing = false;
        }

        else {
          vm.updateBtnText = "Oops.!! Something went wrong";
          vm.updateBtnError = true;
          vm.message = "Selected Term & Annual Interest Rate already exists in the table";
          vm.financingChoiceDetails.isProcessing = false;
        }
      }
      $timeout(function () {
        vm.updateBtnText = "Update";
        vm.updateBtnError = false;
        vm.message = null;
        vm.exists_paymentfactor = false;
        if (vm.oldFinancingChoiceDetails.first_description && !vm.oldFinancingChoiceDetails.first_annual_interest) {
          vm.oldFinancingChoiceDetails.first_annual_interest = 0;
          vm.oldFinancingChoiceDetails.first_payment_factor = 0;
          vm.oldFinancingChoiceDetails.first_minimum_monthly = 0;
          vm.oldFinancingChoiceDetails.first_balloon_payment = 0;
        }
        if (vm.oldFinancingChoiceDetails.second_description && !vm.oldFinancingChoiceDetails.second_annual_interest) {
          vm.oldFinancingChoiceDetails.second_annual_interest = 0;
          vm.oldFinancingChoiceDetails.second_payment_factor = 0;
          vm.oldFinancingChoiceDetails.second_minimum_monthly = 0;
          vm.oldFinancingChoiceDetails.second_balloon_payment = 0;
        }
        vm.financingChoiceDetails = JSON.parse(JSON.stringify(vm.oldFinancingChoiceDetails));
      }, 3000);
    };

    vm.delete = payload => {
      // if (payload.display && (payload.display == 'Always default' || payload.display == 'Primary default')) {
      //   vm.error = true;
      //   vm.message = "Cannot delete this financing choice as it is set as default";
      // } else {
        FinancingChoicesService.API
        .DeleteFinancingChoice(payload)
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
            let index = vm.allFinancingChoices.findIndex(
              financingChoice => financingChoice.id === payload.id
            );
            vm.allFinancingChoices.splice(index, 1);
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
          }
        });
      // }
    };

    // to show details of dependent entity in side panel
    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showErrorDetailsData = true;
    };

    // Show confirmation page on click of delete button
    vm.showconfirm = () => {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    // Focus
    vm.focusSearchField = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      }, 1000)
    };

    // set focus on first field in form
    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#first_name").focus();
      }, 1000);
    };

    vm.resetForm = () => {
      vm.financingChoiceDetails = {};
      vm.financingChoiceDetails.is_eligible_for_finance = 0;
      vm.financingChoiceDetails.plan_number = null;
      vm.financingChoiceDetails.status_id = vm.statusCodes.Active.ID;
    };

    vm.openForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.financing_choice_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
      vm.financingChoiceDetails.showwarning_plan = false;
      vm.financingChoiceDetails.payment_factor = null;
      vm.financingChoiceDetails.display = null;
      vm.ChangeDefaults();
    };

    // Create another financing choice after save
    vm.createAnotherForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.setInitialState();
      vm.resetForm();
    };

    vm.closeForm = () => {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      vm.showErrorDetailsData = false;
      $timeout(() => {
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    // close dependency details side panel only
    vm.closeDependencyDetails = () => {
      vm.showErrorDetailsData = false;
    };

    // show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = () => {
      vm.showErrorDetailsData = false;
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = financingChoiceData => {
      vm.isShowAdd = false;
      vm.showDetailsByID(financingChoiceData);
      vm.onChangePaidInterest(financingChoiceData.first_description);
      vm.onChangeSecondPaidInterest(financingChoiceData.second_description)
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    vm.updateTableInformation = currentPage => {
      vm.rowsCount === 0 ? (vm.initalCount = 0) : (vm.initalCount = 1);

      if (currentPage === 1) {
        vm.rowsInfo = `Displaying ${vm.initalCount} - ${vm.rowsCount < vm.pageSize ? vm.rowsCount : vm.pageSize
          } Of ${vm.rowsCount} Records`;
      } else {
        var start =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          1;
        var end =
          parseInt(currentPage) * parseInt(vm.pageSize) -
          parseInt(vm.pageSize) +
          parseInt(vm.pageSize);
        vm.rowsInfo = `Displaying ${start} - ${end < vm.rowsCount ? end : vm.rowsCount
          } Of ${vm.rowsCount} Records`;
      }
    }

    vm.showDetailsByID = financingChoiceData => {
      vm.financingChoiceDetails = _.clone(financingChoiceData);
      vm.oldFinancingChoiceDetails = _.clone(vm.financingChoiceDetails);
      vm.isUnauthorized = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.isShowDetails = true;
      // On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    // Get history details for codes
    $scope.loadHistory = () => {
      EntityDetails.API
        .GetHistoryData(vm.entityInformation.uuid, vm.financingChoiceDetails.id)
        .then(response => {
          $scope.historyList = response.data;
          $scope.historyList.filter(x => {
            if (x.field == "plan_number") {
              x.field = "Plan Number"
            }
          })
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Close show history panel only
    $scope.closeShowHistory = () => {
      $timeout(() => {
        angular.element("#description").focus();
      }, 0);
      $scope.showhistory = false;
    };

    // Fetch the view/create/update/delete permission by user
    $scope.getAccessPermissions(vm.uuid)
      .then(() => {
        vm.initializeFinancingChoice();
      })
      .catch(() => {
        vm.initializeFinancingChoice();
      })
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
