(() => {
  "use strict";
  angular.module("rc.prime.financingpriceadjustments")
    .controller("FinancingPriceAdjustmentsController", FinancingPriceAdjustmentsController);
  FinancingPriceAdjustmentsController.$inject = [
    "$scope",
    "common",
    "FinancingPriceAdjustmentsService",
    "FinancingChoicesService",
    "PricingChoicesService",
    "valdr",
    "StatusCodes"
  ];

  function FinancingPriceAdjustmentsController(
    $scope,
    common,
    FinancingPriceAdjustmentsService,
    FinancingChoicesService,
    PricingChoicesService,
    valdr,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    vm.entityInformation = {};
    vm.oldFinancingPriceAdjustmentDetails = {};
    vm.error = {};
    vm.message = null;
    vm.isShowHistory = false;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.financingPriceAdjustmentDetails = {};

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

    vm.isColumnSettingsVisible = false;

    vm.uuid = "128";

    /** Common Modules */
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let NotificationService = common.Notification;

    // Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.financingPriceAdjustmentGrid = {
        columns: {
          id: {
            visible: false
          },
          financing_choice_description: {
            visible: true
          },
          financing_choice_is_eligible_for_finance: {
            visible: true
          },
          term: {
            visible: true
          },
          pricing_factor: {
            visible: true
          },
          pricing_choice_description: {
            visible: true
          },
          pricing_choice_is_eligible_for_finance: {
            visible: true
          },
          can_adjust_price_flag: {
            visible: true
          },
          price_adjustment_percentage: {
            visible: true
          },
          status: {
            visible: true
          }
        }
      };
    };

    // to get required information of financing price adjustment entity
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

    // to get all financing choices
    vm.getFinancingChoices = () => {
      FinancingChoicesService.API
        .GetFinancingChoices()
        .then(result => {
          vm.financingChoices = _.clone(result.data);
        });
    };

    // to get all pricing choices
    vm.getPricingChoices = () => {
      PricingChoicesService.API
        .GetPricingChoices()
        .then(result => {
          vm.pricingChoices = _.clone(result.data);
        });
    };

    vm.initializeFinancingPriceAdjustment = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.reload();
      vm.getFinancingChoices();
      vm.getPricingChoices();
    };

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
      FinancingPriceAdjustmentsService.API
        .GetFinancingPriceAdjustments()
        .then(response => {
          vm.allFinancingPriceAdjustments = response.data;
          vm.rowsCount = vm.allFinancingPriceAdjustments.length;
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
    };

    vm.save = payload => {
      vm.financingPriceAdjustmentDetails.isProcessing = true;
      vm.saveBtnText = "Saving now...";
      FinancingPriceAdjustmentsService.API
        .InsertFinancingPriceAdjustment(payload)
        .then(response => {
          vm.isLoading = true;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          vm.financingPriceAdjustmentDetails.isProcessing = false;
          payload.id = response.data.inserted_id;
          let statusindex = $scope.statuses.findIndex(status => status.code == payload.status_id);
          payload.status = $scope.statuses[statusindex].description;
          if (payload.financing_choice_is_eligible_for_finance == 1) {
            payload.display_financing_choice_is_eligible_for_finance = "Yes";
          } else if (payload.financing_choice_is_eligible_for_finance == 0) {
            payload.display_financing_choice_is_eligible_for_finance = "No";
          }
          if (payload.pricing_choice_is_eligible_for_finance == 1) {
            payload.display_pricing_choice_is_eligible_for_finance = "Yes";
          } else if (payload.pricing_choice_is_eligible_for_finance == 0) {
            payload.display_pricing_choice_is_eligible_for_finance = "No";
          }
          if (payload.can_adjust_price_flag == 1) {
            payload.display_can_adjust_price_flag = "Yes";
          } else if (payload.can_adjust_price_flag == 0) {
            payload.display_can_adjust_price_flag = "No";
          }
          let financingChoiceIndex = vm.financingChoices.findIndex(
            financingChoice => financingChoice.id == payload.financing_choice_id
          );
          let pricingChoiceIndex = vm.pricingChoices.findIndex(
            pricingChoice => pricingChoice.id == payload.pricing_choice_id
          );
          payload.financing_choice_description = vm.financingChoices[financingChoiceIndex].description;
          payload.financing_choice_is_eligible_for_finance = vm.financingChoices[financingChoiceIndex].is_eligible_for_finance;
          payload.display_financing_choice_is_eligible_for_finance = vm.financingChoices[financingChoiceIndex].display_is_eligible_for_finance;
          payload.term = vm.financingChoices[financingChoiceIndex].term;
          payload.pricing_factor = vm.financingChoices[financingChoiceIndex].pricing_factor;
          payload.pricing_choice_description = vm.pricingChoices[pricingChoiceIndex].description;
          payload.pricing_choice_is_eligible_for_finance = vm.pricingChoices[pricingChoiceIndex].is_eligible_for_finance;
          payload.display_pricing_choice_is_eligible_for_finance = vm.pricingChoices[pricingChoiceIndex].is_eligible_for_finance ? "Yes" : "No";
          payload.can_adjust_price_flag = vm.pricingChoices[pricingChoiceIndex].can_adjust_price_flag;
          payload.display_can_adjust_price_flag = vm.pricingChoices[pricingChoiceIndex].can_adjust_price_flag ? "Yes" : "No";
          vm.allFinancingPriceAdjustments.push(payload);
          vm.rowsCount++;
          FinancingPriceAdjustmentsService.API
            .GetFinancingPriceAdjustments()
            .then(response => {
              vm.allFinancingPriceAdjustments = response.data;
              vm.rowsCount = vm.allFinancingPriceAdjustments.length;
              vm.isLoading = false;
              vm.updateTableInformation(1);
            })
          vm.updateTableInformation(vm.currentPage);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.financingPriceAdjustmentDetails.isProcessing = false;
          vm.isLoading = false;
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

    // check that update form previous data is not same as payload
    vm.hasUpdateChanges = payload => {
      if (
        Number(vm.oldFinancingPriceAdjustmentDetails.financing_choice_id) !== Number(payload.financing_choice_id) ||
        Number(vm.oldFinancingPriceAdjustmentDetails.pricing_choice_id) !== Number(payload.pricing_choice_id) ||
        Number(vm.oldFinancingPriceAdjustmentDetails.price_adjustment_percentage) !== Number(payload.price_adjustment_percentage) ||
        Number(vm.oldFinancingPriceAdjustmentDetails.status_id) !== Number(payload.status_id)
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
      vm.financingPriceAdjustmentDetails.isProcessing = true;
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        FinancingPriceAdjustmentsService.API
          .UpdateFinancingPriceAdjustment(payload)
          .then(response => {
            vm.financingPriceAdjustmentDetails.isProcessing = false;
            let index = vm.allFinancingPriceAdjustments.findIndex(
              financingPriceAdjustment => financingPriceAdjustment.id === payload.id
            );
            if (
              Number(vm.oldFinancingPriceAdjustmentDetails.status_id) !==
              Number(payload.status_id)
            ) {
              let statusindex = $scope.statuses.findIndex(status => status.code == payload.status_id);
              payload.status = $scope.statuses[statusindex].description;
            }
            if (payload.financing_choice_is_eligible_for_finance == 1) {
              payload.display_financing_choice_is_eligible_for_finance = "Yes";
            } else if (payload.financing_choice_is_eligible_for_finance == 0) {
              payload.display_financing_choice_is_eligible_for_finance = "No";
            }
            if (payload.pricing_choice_is_eligible_for_finance == 1) {
              payload.display_pricing_choice_is_eligible_for_finance = "Yes";
            } else if (payload.pricing_choice_is_eligible_for_finance == 0) {
              payload.display_pricing_choice_is_eligible_for_finance = "No";
            }
            if (payload.can_adjust_price_flag == 1) {
              payload.display_can_adjust_price_flag = "Yes";
            } else if (payload.can_adjust_price_flag == 0) {
              payload.display_can_adjust_price_flag = "No";
            }
            if (
              Number(vm.oldFinancingPriceAdjustmentDetails.financing_choice_id) !==
              Number(payload.financing_choice_id)
            ) {
              let financingChoiceIndex = vm.financingChoices.findIndex(
                financingChoice => financingChoice.id == payload.financing_choice_id
              );
              payload.financing_choice_description = vm.financingChoices[financingChoiceIndex].description;
              payload.financing_choice_is_eligible_for_finance = vm.financingChoices[financingChoiceIndex].is_eligible_for_finance;
              payload.display_financing_choice_is_eligible_for_finance = vm.financingChoices[financingChoiceIndex].display_is_eligible_for_finance;
              payload.term = vm.financingChoices[financingChoiceIndex].term;
              payload.pricing_factor = vm.financingChoices[financingChoiceIndex].pricing_factor;
            }
            if (
              Number(vm.oldFinancingPriceAdjustmentDetails.pricing_choice_id) !==
              Number(payload.pricing_choice_id)
            ) {
              let pricingChoiceIndex = vm.pricingChoices.findIndex(
                pricingChoice => pricingChoice.id == payload.pricing_choice_id
              );
              payload.pricing_choice_description = vm.pricingChoices[pricingChoiceIndex].description;
              payload.pricing_choice_is_eligible_for_finance = vm.pricingChoices[pricingChoiceIndex].is_eligible_for_finance;
              payload.display_pricing_choice_is_eligible_for_finance = vm.pricingChoices[pricingChoiceIndex].is_eligible_for_finance ? "Yes" : "No";
              payload.can_adjust_price_flag = vm.pricingChoices[pricingChoiceIndex].can_adjust_price_flag;
              payload.display_can_adjust_price_flag = vm.pricingChoices[pricingChoiceIndex].can_adjust_price_flag ? "Yes" : "No";
            }
            vm.allFinancingPriceAdjustments[index] = payload;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldFinancingPriceAdjustmentDetails = _.clone(payload);
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            vm.financingPriceAdjustmentDetails.isProcessing = false;
            $timeout(() => {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.financingPriceAdjustmentDetails.isProcessing = false;
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(() => {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.delete = payload => {
      FinancingPriceAdjustmentsService.API
        .DeleteFinancingPriceAdjustment(payload)
        .then(() => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allFinancingPriceAdjustments.findIndex(
            financingPriceAdjustment => financingPriceAdjustment.id === payload.id
          );
          vm.allFinancingPriceAdjustments.splice(index, 1);
          vm.rowsCount--;
          vm.updateTableInformation(vm.currentPage);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            vm.message = error.data.error;

            // to show list of dependent entities in side panel
            vm.dependencyList = NotificationService.errorNotification(error);
            vm.showErrorDetails = true;
          }
        });
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
      vm.financingPriceAdjustmentDetails = {};
      vm.financingPriceAdjustmentDetails.status_id = vm.statusCodes.Active.ID;
    };

    vm.openForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.financing_price_adjustment_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    // Create another financing price adjustment after save
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

    vm.dblClickAction = financingPriceAdjustmentData => {
      vm.isShowAdd = false;
      vm.showDetailsByID(financingPriceAdjustmentData);
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

    vm.showDetailsByID = financingPriceAdjustmentData => {
      vm.financingPriceAdjustmentDetails = _.clone(financingPriceAdjustmentData);
      vm.oldFinancingPriceAdjustmentDetails = _.clone(vm.financingPriceAdjustmentDetails);
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
        .GetHistoryData(vm.entityInformation.uuid, vm.financingPriceAdjustmentDetails.id)
        .then(response => {
          $scope.historyList = response.data;
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
        vm.initializeFinancingPriceAdjustment();
      })
      .catch(() => {
        vm.initializeFinancingPriceAdjustment();
      })
    $scope.setClickedRow = vm.setClickedRow;
  }
})();