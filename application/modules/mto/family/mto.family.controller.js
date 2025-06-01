(() => {
  "use strict";
  angular
    .module("rc.prime.mto.family")
    .controller("MTOFamilyController", MTOFamilyController);
  MTOFamilyController.$inject = [
    "$scope",
    "common",
    "MTOService",
    "MTOFamilyService",
    "StatusCodes"
  ];

  function MTOFamilyController(
    $scope,
    common,
    MTOService,
    MTOFamilyService,
    StatusCodes
  ) {
    let vm = this;

    /*Common modules*/
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let Identifiers = common.Identifiers;
    let logger = common.Logger.getInstance("MTOFamilyController");
    let NotificationService = common.Notification;
    vm.statusCodes = StatusCodes;
    vm.returnValue = "";
    vm.entityInformation = {};
    vm.mtoFamilyCols = {};
    vm.mtoFamilyGroupByDropdown = {};
    vm.previousFamily = {};
    vm.oldFamilyDetails = {};
    vm.family_details = {};

    vm.pagedetails = {};
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.error = {};
    vm.message = null;
    vm.isShowHistory = false;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;

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

    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    //variables used for link/unlink vendors
    vm.showVendorLinkDetails = false;
    vm.family_id = {};
    vm.choiceLinkDetails = {};
    vm.dependencyDetails = {};
    vm.linkedOptionDetails = {};
    vm.isShowLinkedDetails = false;
    vm.actionSuccess = false;
    vm.actionMessage = "";

    vm.isColumnSettingsVisible = false;

    vm.uuid = "35";

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      this.mtoFamiliesGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          shortDescription: {
            visible: true
          },
          link: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.initializeMtoFamily = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      $scope.getStatuses(common.Identifiers.mto_option);
      vm.setGridProperties();
      $scope.getAccessPermissions(vm.uuid);
      $timeout(() => {
        vm.reload();
      },500)
    };

    vm.focusSearchField = function() {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      },1000)
    }

    vm.getEntityInformation = () => {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        mto_family_information => {
          vm.entityInformation = mto_family_information;
          $scope.name = vm.entityInformation.name;
        }
      );
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(
        model => {}
      );
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
      vm.isLoaded = false;
      MTOFamilyService.API.GetFamilies()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allMtofamilies = response.data;

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

    vm.watchers = () => {
      $scope.$watch(
        angular.bind(vm.returnValue, () => {
          return vm.returnValue;
        }),
        value => {}
      );
    };

    vm.save = payload => {
      vm.saveBtnText = "Saving now...";
      MTOFamilyService.API.InsertFamily(payload)
        .then(response => {
          vm.previousFamily = payload;
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
            angular.element("#short_description").focus();
          }, 2500);
        });
    };

    vm.hasUpdateChanges = payload => {
      if (
        vm.oldFamilyDetails.short_description !== payload.short_description ||
        vm.oldFamilyDetails.families_status_id !== payload.families_status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.ShowHideColumnSettings = () => {
      $timeout(function() {
        angular.element("#hide_show_column").focus();
      }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };
    vm.update = payload => {
      if (vm.hasUpdateChanges(payload) === true) {
        vm.$updateBtnText = "Updating Now...";
        MTOFamilyService.API.UpdateFamily(payload)
          .then(response => {
            //get index of current location by id
            let index = vm.allMtofamilies.findIndex(
              mtoFamily => mtoFamily.id === payload.id
            );
            //update location in list present at the index
            vm.allMtofamilies[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldFamilyDetails = null;
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
              angular.element("#short_description").focus();
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(() => {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
          angular.element("#short_description").focus();
        }, 1000);
      }
    };

    vm.delete = payload => {
      MTOFamilyService.API.DeleteFamily(payload)
        .then(response => {
          let index = vm.allMtofamilies.findIndex(
            mtoFamily => mtoFamily.id === payload.id
          );
          vm.allMtofamilies.splice(index, 1);
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.rowsCount--;
          vm.updateTableInformation(vm.currentPage);
          $scope.lastPageTableRecordDeleteAction($scope.setinstance);
        })
        .catch(error => {
          if(error.data){
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              vm.dependencyList = NotificationService.errorNotification(error);
              vm.isUpdateSuccess = false;
              vm.showDependencyDetails = true;
            }
          }
        });
    };

    vm.showconfirm = () => {
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
    };

    //show the dependent entities list in side panel
    vm.showDependencyListDetails = data => {
      $timeout(function() {
        angular.element("#mto_family_depend_close").focus();
      }, 500); 
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    //set focus on first field in form
    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#short_description").focus();
      });
    };

    vm.resetForm = function() {
      vm.family_details = {};
      vm.family_details["short_description"] = null;
    };

    vm.openForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      vm.family_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    vm.createAnotherForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.family_details = {};
      //Setting Previously entered data to the new context
      vm.family_details.families_status_id =
        vm.previousFamily.families_status_id;
      vm.setInitialState();
    };

    vm.closeForm = () => {
      vm.message = null;
      vm.isShowDetails = false;
      vm.showDependencyDetailsData = false;
      $timeout(() => {
        vm.isUnauthorized = false;
        vm.showDependencyDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 1000);
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = () => {
      $timeout(function() {
        angular.element("#close_depen_mto_family").focus();
      }, 500);
      vm.showDependencyDetailsData = false;
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = () => {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    //close vendor link panel
    vm.closeVendorLink = () => {
      vm.showVendorLinkDetails = false;
      vm.isShowLinkedDetails = false;
      vm.message = "";
      vm.hasLinkError = "";
      vm.searchFamily = "";
      $timeout(() => {
        angular.element("#mto_vendor").focus();
      }, 1000);
    };

    //close vendor link details panel
    vm.closeVendorLinkDetails = () => {
      vm.isShowLinkedDetails = false;
    };

    //to show vendors link in side panel
    vm.openLinkVendor = familyDetails => {
      vm.family_id = familyDetails.id;
      vm.showVendorLinkDetails = true;
      vm.familyVendors = [];
      $timeout(() => {
        angular.element("#mtoVendorSearch").focus();
      }, 1000);
    };

    //Load vendors for the mto family
    vm.loadVendorFamilyLinks = family_id => {
      vm.loadingLinks = true;
      MTOFamilyService.API.GetFamilyVendors(family_id)
        .then(response => {
          vm.loadingLinks = false;
          vm.familyVendors = response.data;
          vm.allFamilyVendors = response.data;
        })
        .catch(error => {
          vm.loadingLinks = false;
          logger.error(error);
        });
    };

    vm.resetSearch = () => {
      vm.isReset = true;
      vm.familyVendors = [];
      vm.searchText = "";
      $timeout(() => {
        vm.familyVendors = vm.allFamilyVendors;
      }, 1);
      $timeout(() => {
        vm.isReset = false;
          angular.element("#mtoVendorSearch").focus();
      }, 2500);
    };

    vm.searchVendors = vendor => {
      vm.isSearching = true;
      if (vendor.length > 0) {
        vm.familyVendors = _.filter(vm.allFamilyVendors, vendorCollection => {
          if (
            vendorCollection.name.toLowerCase().includes(vendor.toLowerCase())
          ) {
            return vendorCollection;
          }
        });
        vm.isSearching = false;
      } else {
        vm.familyVendors = vm.allFamilyVendors;
        vm.isSearching = false;
      }
    };

    //Load details of mto option linked to family
    vm.loadLinkedOptionDetails = option_id => {
      MTOService.API.SearchMTO("id", option_id)
        .then(response => {
          vm.linkedOptionDetails = response.data[0];
        })
        .catch(error => {});
    };

    //Show the details of entities in which that family is reffered
    vm.showLinkedVendorDependencyDetails = data => {
      vm.isShowLinkedDetails = true;
      vm.choiceLinkDetails = data;
      vm.loadLinkedOptionDetails(data.option_id);
    };

    //link or unlink vendor from family
    vm.vendorFamily = payload => {
      vm.message = "";
      vm.hasLinkError = "";
      vm.disablePanel = true;
      vm.showDependencyPanel = false;
      let timeout;
      let pay = {};
      //Linking family to vendor
      if (payload.selected === true) {
        pay.family_id = vm.family_id;
        pay.vendor_id = payload.id;
        MTOFamilyService.API.LinkVendorToFamily(pay).then(
          response => {
            // Set message for successful link
            vm.message = " 🔗 Successfully linked Family";
            timeout = $timeout(() => {
              payload.isselected = payload.selected;
              vm.message = "";
              $timeout.cancel(timeout);
            }, 2500);
          },
          error => {
            // Set error message for unsuccessful link
            vm.hasLinkError =
              "Unable to update link vendor to Family. Please contact administrator";
            timeout = $timeout(() => {
              vm.hasLinkError = "";
              $timeout.cancel(timeout);
            }, 2500);
          }
        );
      } else if (payload.selected === false) {
        //Unlinking vendor from the family
        pay.family_id = vm.family_id;
        pay.vendor_id = payload.id;
        MTOFamilyService.API.UnlinkVendorFromFamily(
          pay.family_id,
          pay.vendor_id
        ).then(
          response => {
            // Set message for successful unlink
            vm.message = " Successfully unlinked Family";
            vm.showDependencyPanel = false;
            timeout = $timeout(() => {
              payload.isselected = payload.selected;
              vm.message = "";
              $timeout.cancel(timeout);
            }, 2500);
          },
          error => {
            // On failure because of dependency set the error message
            if (error.data.type.toLowerCase() === "dependency check") {
              payload.isselected = true;
              vm.hasLinkError = "Unable to unlink because of dependency";
              vm.dependencyDetails = error.data.dependency;
              vm.showDependencyPanel = true;
            } else {
              // Set error message for unsuccessful unlink
              vm.hasLinkError =
                "Unable to update link vendor to Family. Please contact administrator";
              timeout = $timeout(() => {
                vm.hasLinkError = "";
                $timeout.cancel(timeout);
                vm.showDependencyPanel = false;
              }, 2500);
            }
            payload.isselected = true;
            payload.selected = true;
          }
        );
      }
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

    vm.dblClickAction = familyDetails => {
      vm.isShowDetails = true;
      vm.showDetailsById(familyDetails);
      vm.setInitialState();
    };

    vm.showDetailsById = familyDetails => {
      vm.family_details = _.clone(familyDetails);
      vm.oldFamilyDetails = _.clone(familyDetails);
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
      //On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    //Close show history panel only
    $scope.closeShowHistory = () => {
      $timeout(function() {
        angular.element("#short_description").focus();
      }, 500); 
      $scope.showhistory = false;
    };

    //Get history details for mto family
    $scope.loadHistory = () => {
      $timeout(function() {
        angular.element("#history_close").focus();
      }, 500);
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.family_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.initializeMtoFamily();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
