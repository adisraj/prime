(() => {
  "use strict";
  angular
    .module("rc.prime.mto.pricegroup")
    .controller("MTOPriceGroupController", MTOPriceGroupController);
  MTOPriceGroupController.$inject = [
    "$scope",
    "common",
    "MTOService",
    "MTOPriceGroupService",
    "StatusCodes"
  ];

  function MTOPriceGroupController(
    $scope,
    common,
    MTOService,
    MTOPriceGroupService,
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
    let logger = common.Logger.getInstance("MTOPriceGroupController");
    let NotificationService = common.Notification;

    vm.returnValue = "";
    vm.entityInformation = {};
    vm.mtoPrcGrpcols = {};
    vm.mtoPrcGrpGroupByDropdown = {};

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

    //variables used for link/unlink vendors
    vm.showVendorLinkDetails = false;
    vm.price_group_id = {};
    vm.collectionVendors = {};
    vm.choiceLinkDetails = {};
    vm.dependencyDetails = {};
    vm.linkedOptionDetails = {};
    vm.isShowLinkedDetails = false;
    vm.actionSuccess = false;
    vm.actionMessage = "";

    //varibles to update page information
    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    vm.isColumnSettingsVisible = false;

    vm.uuid = "38";

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.mtoPriceGroupGrid = {
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

    vm.initializeMTOPriceGroup = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      $scope.getStatuses(common.Identifiers.mto_option);
      vm.setGridProperties();
      $scope.getAccessPermissions(vm.uuid);
      $timeout(() => {
        vm.reload();
      }, 0);
    };

    vm.getEntityInformation = () => {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        price_group_information => {
          vm.entityInformation = price_group_information;
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
      MTOPriceGroupService.API.GetMtoPriceGroups()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allPriceGroups = response.data;
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
            vm.isLoaded = true; // isLoaded variable true after api call
            vm.isViewAuthorized = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isLoaded = true;
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    vm.save = payload => {
      vm.saveBtnText = "Saving now...";
      MTOPriceGroupService.API.InsertMtoPriceGroup(payload)
        .then(response => {
          vm.previousCollection = payload;
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
        vm.oldPriceGroupDetails.short_description !==
          payload.short_description ||
        vm.oldPriceGroupDetails.price_group_status_id !==
          payload.price_group_status_id
      ) {
        return true;
      } else {
        return false;
      }
    };
    vm.update = payload => {
      if (vm.hasUpdateChanges(payload) === true) {
        vm.$updateBtnText = "Updating Now...";
        MTOPriceGroupService.API.UpdateMtoPriceGroup(payload)
          .then(response => {
            //get index of current location by id
            let index = vm.allPriceGroups.findIndex(
              priceGroup => priceGroup.id === payload.id
            );
            //update location in list present at the index
            vm.allPriceGroups[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldPriceGroupDetails = null;
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
        }, 1000);
      }
    };

    vm.delete = payload => {
      MTOPriceGroupService.API.DeleteMtoPriceGroup(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allPriceGroups.findIndex(
            priceGroup => priceGroup.id === payload.id
          );
          vm.allPriceGroups.splice(index, 1);
          vm.rowsCount--;
          vm.updateTableInformation(vm.currentPage);
          $scope.lastPageTableRecordDeleteAction($scope.setinstance);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            //vm.message = NotificationService.errorNotification(error);
            vm.dependencyList = NotificationService.errorNotification(error);
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

    //show the dependent entities list in side panel
    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#short_description").focus();
      });
    };

    vm.resetForm = function() {
      vm.mtoPrice_details = {};
      vm.mtoPrice_details["short_description"] = null;
    };

    vm.openForm = () => {
      vm.saveBtnText = "Save";
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      vm.mtopriceGrp_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    vm.createAnotherForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.mtoPrice_details = {};
      //Setting Previously entered data to the new context
      vm.mtoPrice_details.status_id = vm.previousCollection.status_id;
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
      }, 500);
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = () => {
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
      vm.searchPrice = "";
    };

    //close vendor link details panel
    vm.closeVendorLinkDetails = () => {
      vm.isShowLinkedDetails = false;
    };

    //to show vendors link in side panel
    vm.openLinkVendor = pricegroupDetails => {
      vm.price_group_id = pricegroupDetails.id;
      vm.showVendorLinkDetails = true;
      vm.priceGroupVendors = [];
    };

    //Load vendors for the mto collection
    vm.loadVendorPricegroupLinks = price_group_id => {
      vm.loadingLinks = true;
      MTOPriceGroupService.API.GetMtoPriceGroupVendors(price_group_id)
        .then(response => {
          vm.loadingLinks = false;
          vm.priceGroupVendors = response.data;
          vm.allPriceGroupVendors = response.data;
        })
        .catch(error => {
          vm.loadingLinks = false;
          logger.error(error);
        });
    };

    vm.resetSearch = () => {
      vm.isReset = true;
      vm.priceGroupVendors = [];
      vm.searchText = "";
      $timeout(() => {
        vm.priceGroupVendors = vm.allPriceGroupVendors;
      }, 1);
      $timeout(() => {
        vm.isReset = false;
      }, 2500);
    };

    vm.searchVendors = vendor => {
      vm.isSearching = true;
      if (vendor.length > 0) {
        vm.priceGroupVendors = _.filter(
          vm.allPriceGroupVendors,
          vendorCollection => {
            if (
              vendorCollection.name.toLowerCase().includes(vendor.toLowerCase())
            ) {
              return vendorCollection;
            }
          }
        );
        vm.isSearching = false;
      } else {
        vm.priceGroupVendors = vm.allPriceGroupVendors;
        vm.isSearching = false;
      }
    };

    //Load details of mto option linked to collection
    vm.loadLinkedOptionDetails = option_id => {
      MTOService.API.SearchMTO("id", option_id)
        .then(response => {
          vm.linkedOptionDetails = response.data[0];
        })
        .catch(error => {});
    };

    //Show the details of entities in which that collection is reffered
    vm.showLinkedVendorDependencyDetails = data => {
      vm.isShowLinkedDetails = true;
      vm.choiceLinkDetails = data;
      vm.loadLinkedOptionDetails(data.option_id);
    };

    //link or unlink vendor from collection
    vm.vendorPriceGroup = payload => {
      vm.message = "";
      vm.hasLinkError = "";
      vm.disablePanel = true;
      vm.showDependencyPanel = false;
      let timeout;
      let pay = {};
      //Linking collection to vendor
      if (payload.selected === true) {
        pay.price_group_id = vm.price_group_id;
        pay.vendor_id = payload.id;
        MTOPriceGroupService.API.LinkVendorToMtoPriceGroup(pay).then(
          response => {
            // Set message for successful link
            vm.message = " 🔗 Successfully linked Price Group";
            timeout = $timeout(() => {
              payload.isselected = payload.selected;
              vm.message = "";
              $timeout.cancel(timeout);
            }, 2500);
          },
          error => {
            // Set error message for unsuccessful link
            vm.hasLinkError =
              "Unable to update link vendor to Price Group. Please contact administrator";
            timeout = $timeout(() => {
              vm.hasLinkError = "";
              $timeout.cancel(timeout);
            }, 2500);
          }
        );
      } else if (payload.selected === false) {
        //Unlinking vendor from the collection
        pay.price_group_id = vm.price_group_id;
        pay.vendor_id = payload.id;
        MTOPriceGroupService.API.UnlinkVendorFromMtoPriceGroup(
          pay.price_group_id,
          pay.vendor_id
        ).then(
          response => {
            // Set message for successful unlink
            vm.message = " Successfully unlinked Price Group";
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
                "Unable to update link vendor to Price Group. Please contact administrator";
              timeout = $timeout(() => {
                vm.hasLinkError = "";
                $timeout.cancel(timeout);
                vm.showDependencyPanel = false;
              }, 2500);
            }
            payload.selected = true;
            payload.isselected = true;
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

    vm.dblClickAction = pricegroupDetails => {
      vm.isShowDetails = true;
      vm.showDetailsById(pricegroupDetails);
      vm.setInitialState();
      $scope.closeShowHistory();
    };

    vm.showDetailsById = pricegroupDetails => {
      vm.mtoPrice_details = _.clone(pricegroupDetails);
      vm.oldPriceGroupDetails = _.clone(pricegroupDetails);
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
      $scope.showhistory = false;
    };

    //Get history details for mto collections
    $scope.loadHistory = () => {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.mtoPrice_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.initializeMTOPriceGroup();
  }
})();
