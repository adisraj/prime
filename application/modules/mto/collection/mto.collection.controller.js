(() => {
  "use strict";
  angular
    .module("rc.prime.mto.collection")
    .controller("MTOCollectionController", MTOCollectionController);
  MTOCollectionController.$inject = [
    "$scope",
    "common",
    "MTOService",
    "MTOCollectionService",
    "StatusCodes"
  ];

  function MTOCollectionController(
    $scope,
    common,
    MTOService,
    MTOCollectionService,
    StatusCodes
  ) {
    let vm = this;

    /*Common modules*/
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let Identifiers = common.Identifiers;
    let logger = common.Logger.getInstance("MTOCollectionController");
    let Notification = common.Notification;
    vm.statusCodes = StatusCodes;
    vm.returnValue = "";
    vm.entityInformation = {};
    vm.mtoCollectCols = {};
    vm.mtoCollectGroupByDropdown = {};
    vm.oldCollectionDetails = {};
    vm.previousCollection = {};
    vm.collection_details = {};
    vm.errorCondition=false
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

    //varibles to update page information
    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    //variables used for link/unlink vendors
    vm.showVendorLinkDetails = false;
    vm.collection_id = {};
    vm.choiceLinkDetails = {};
    vm.dependencyDetails = {};
    vm.linkedOptionDetails = {};
    vm.isShowLinkedDetails = false;
    vm.actionSuccess = false;
    vm.actionMessage = "";

    vm.isColumnSettingsVisible = false;

    vm.uuid = "19";

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.mtoCollectionGrid = {
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

    vm.initializeMtoCollection = () => {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
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
        mto_collection_information => {
          vm.entityInformation = mto_collection_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.mto_option);
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
      MTOCollectionService.API.GetMtoCollections()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allMtoCollections = response.data;
          vm.originalMtoCollections = response.data;
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
      MTOCollectionService.API.InsertMtoCollection(payload)
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
          vm.message = Notification.errorNotification(error);
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
        vm.oldCollectionDetails.short_description !==
          payload.short_description ||
        vm.oldCollectionDetails.collection_status_id !==
          payload.collection_status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = payload => {
      if (vm.hasUpdateChanges(payload) === true) {
        vm.$updateBtnText = "Updating Now...";
        MTOCollectionService.API.UpdateMtoCollection(payload)
          .then(response => {
            //get index of current location by id
            let index = this.allMtoCollections.findIndex(
              mtoCollection => mtoCollection.id === payload.id
            );

            //update location in list present at the index
            this.allMtoCollections[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldCollectionDetails = null;
            $scope.closeShowHistory();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = Notification.errorNotification(error);
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

    vm.shortValue=()=>{
      if((vm.collection_details["short_description"].length)>2 && (vm.collection_details["short_description"].length)<=30){
        vm.errorCondition=true
      }else{
        vm.errorCondition=false
      }
    }
    vm.delete = payload => {
      MTOCollectionService.API.DeleteMtoCollection(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allMtoCollections.findIndex(
            mtoCollection => mtoCollection.id === payload.id
          );
          vm.allMtoCollections.splice(index, 1);
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
              //vm.message = error.data.error;
              vm.dependencyList = Notification.errorNotification(error);
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
        angular.element("#mto_coll_depend_close").focus();
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
      vm.collection_details = {};
      vm.collection_details["short_description"] = null;
    };

    vm.openForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      vm.collection_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    vm.createAnotherForm = () => {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.collection_details = {};
      //Setting Previously entered data to the new context
      vm.collection_details.collection_status_id =
        vm.previousCollection.collection_status_id;
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
        angular.element("#close_depen_mto_coll").focus();
      }, 500);
      vm.showDependencyDetailsData = false;
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = () => {
      $timeout(function() {
        angular.element("#short_description").focus();
      }, 500); 
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    //close vendor link panel
    vm.closeVendorLink = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
       }, 1000);
      vm.showVendorLinkDetails = false;
      vm.isShowLinkedDetails = false;
      vm.message = "";
      vm.hasLinkError = "";
      vm.searchCollection = "";
    };

    //close vendor link details panel
    vm.closeVendorLinkDetails = () => {
      vm.isShowLinkedDetails = false;
    };

    //to show vendors link in side panel
    vm.openLinkVendor = collectionDetails => {
      $timeout(() => {
       angular.element("#link_vendor_search").focus();
      }, 1000);
      vm.collection_id = collectionDetails.id;
      vm.showVendorLinkDetails = true;
      vm.collectionVendors = [];
    };

    //Load vendors for the mto collection
    vm.loadVendorCollectionLinks = collection_id => {
      vm.loadingLinks = true;
      MTOCollectionService.API.GetCollectionVendors(collection_id)
        .then(response => {
          vm.loadingLinks = false;
          vm.collectionVendors = response.data;
          vm.allCollectionVendors = response.data;
        })
        .catch(error => {
          vm.loadingLinks = false;
          logger.error(error);
        });
    };

    vm.resetSearch = () => {
      vm.isReset = true;
      vm.collectionVendors = [];
      vm.searchText = "";
      $timeout(() => {
        vm.collectionVendors = vm.allCollectionVendors;
      }, 1);
      $timeout(() => {
        vm.isReset = false;
        angular.element("#link_vendor_search").focus();
      }, 2500);
    };

    vm.searchPriceGroupVendors = vendor => {
      vm.isSearching = true;
      if (vendor.length > 0) {
        vm.collectionVendors = _.filter(
          vm.allCollectionVendors,
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
        vm.collectionVendors = vm.allCollectionVendors;
        vm.isSearching = false;
      }
    };

    //Load details of mto option linked to collection
    vm.loadLinkedOptionDetails = option_id => {
      MTOService.API.SearchMTO("id", option_id)
        .then(response => {
          vm.linkedOptionDetails = response.data[0];
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Show the details of entities in which that collection is reffered
    vm.showLinkedVendorDependencyDetails = data => {
      vm.isShowLinkedDetails = true;
      vm.choiceLinkDetails = data;
      vm.loadLinkedOptionDetails(data.option_id);
    };

    //link or unlink vendor from collection
    vm.vendorCollection = payload => {
      vm.message = "";
      vm.hasLinkError = "";
      vm.disablePanel = true;
      vm.showDependencyPanel = false;
      let timeout;
      let pay = {};
      //Linking collection to vendor
      if (payload.selected === true) {
        pay.collection_id = vm.collection_id;
        pay.vendor_id = payload.id;
        MTOCollectionService.API.LinkVendorToCollection(pay).then(
          response => {
            // Set message for successful link
            vm.message = " 🔗 Successfully linked Collection";
            timeout = $timeout(() => {
              vm.message = "";
              payload.isselected = payload.selected;
              $timeout.cancel(timeout);
            }, 2500);
          },
          error => {
            // Set error message for unsuccessful link
            vm.hasLinkError =
              "Unable to update link vendor to collection. Please contact administrator";
            timeout = $timeout(() => {
              vm.hasLinkError = "";
              $timeout.cancel(timeout);
            }, 2500);
          }
        );
      } else if (payload.selected === false) {
        //Unlinking vendor from the collection
        pay.collection_id = vm.collection_id;
        pay.vendor_id = payload.id;
        MTOCollectionService.API.UnlinkVendorFromCollection(
          pay.collection_id,
          pay.vendor_id
        ).then(
          response => {
            // Set message for successful unlink
            vm.message = "Successfully unlinked collection";
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
              vm.hasLinkError = "Unable to unlink because of dependency";
              vm.dependencyDetails = error.data.dependency;
              vm.showDependencyPanel = true;
              payload.isselected = true;
            } else {
              // Set error message for unsuccessful unlink
              vm.hasLinkError =
                "Unable to update link vendor to collection. Please contact administrator";
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
      vm.disablePanel = false;
    };

    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    vm.ShowHideColumnSettings = () => {
      $timeout(function() {
        angular.element("#hide_show_column").focus();
      }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.dblClickAction = collectionDetails => {
      vm.isShowDetails = true;
      vm.showDetailsById(collectionDetails);
      vm.setInitialState();
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

    vm.showDetailsById = collectionDetails => {
      vm.collection_details = _.clone(collectionDetails);
      vm.oldCollectionDetails = _.clone(collectionDetails);
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

    //Get history details for mto collections
    $scope.loadHistory = () => {
      $timeout(function() {
        angular.element("#history_close").focus();
      }, 500);
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.collection_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.initializeMtoCollection();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
