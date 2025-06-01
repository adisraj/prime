(() => {
  "use strict";

  angular
    .module("rc.prime.item.collection")
    .controller("ItemCollectionController", ItemCollectionController);
  ItemCollectionController.$inject = [
    "$scope",
    "common",
    "ItemService",
    "ItemCollectionService",
    "StatusCodes"
  ];

  function ItemCollectionController(
    $scope,
    common,
    ItemService,
    ItemCollectionService,
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
    let NotificationService = common.Notification;
    let logger = common.Logger.getInstance("ItemCollectionController");
    vm.statusCodes = StatusCodes;
    vm.pagedetails = {};
    vm.entityInformation = {};
    vm.error = {};
    vm.moduleNameCol = "Item Collection";
    vm.message = null;
    vm.itemCol_details = {};
    vm.isShowDetails = false;
    vm.isShowHistory = false;

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
    vm.isLoaded = false;

    //varibles to update page information
    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    //variables used to show delete dependencies
    vm.dependencyList = {};
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;
    vm.errorDependentData = {};

    //variables used for link/unlink vendors
    vm.showVendorLinkDetails = false;
    vm.collection_id = {};
    vm.itemColLinkDetails = {};
    vm.dependencyDetails = {};
    vm.linkedOptionDetails = {};
    vm.isShowLinkedDetails = false;
    vm.actionSuccess = false;
    vm.actionMessage = "";
    vm.returnValue = "";

    vm.isColumnSettingsVisible = false;

    vm.uuid = "88";

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.itemCollectionsGrid = {
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

    vm.initializeItemCollection = () => {
      vm.getEntityInformation();
      $scope.getStatuses(common.Identifiers.item);
      if (common.$state.$current.name.includes(".delete")) {
        vm.getItemCollectionById();
      }
      vm.reload();
      vm.setInitialState();
      vm.setGridProperties();
      vm.getModelAndSetValidationRules();
      $scope.getAccessPermissions(vm.uuid);
    };

    vm.getEntityInformation = () => {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        item_collection_information => {
          vm.entityInformation = item_collection_information;
          $scope.name = vm.entityInformation.name;
        }
      );
    };

    //get JSON model and set validation rules for item collection create/update
    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    //If update form is open, on refresh page get data for selected collection
    vm.getItemCollectionById = () => {
      vm.isShowHistory = true;
      ItemCollectionService.API.GetItemCollectionById(
        common.$stateParams.item_collection_id
      )
        .then(response => {
          vm.dblClickAction(response.data[0]);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.loadHistory = () => {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.itemCol_details.id
      )
        .then(response => {
          $scope.historyList = response.data;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
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
      ItemCollectionService.API.GetItemCollections()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allItemCollections = response.data;
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
            vm.isLoaded = true;
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
      vm.saveBtnText = "Saving now...";
      vm.isProcessing = true;
      ItemCollectionService.API.InsertItemCollection(payload)
        .then(response => {
          payload.id = response.data.inserted_id;
          let collections = JSON.parse(common.SessionMemory.API.Get("collectionList"))
          collections.push(payload)
          common.SessionMemory.API.Post("collectionList", JSON.stringify(collections))
          //Save the payload into a variable
          vm.oldPayload = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          vm.isProcessing = false;
          vm.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.isProcessing = false;
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
        vm.oldItemCollection.short_description !== payload.short_description ||
        vm.oldItemCollection.collection_status_id !==
          payload.collection_status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    ///Update item collection
    vm.update = payload => {
      vm.isProcessing = true;
      if (vm.hasUpdateChanges(payload) === true) {
        vm.updateBtnText = "Updating Now...";
        ItemCollectionService.API.UpdateItemCollection(payload)
          .then(response => {
            let collections = JSON.parse(common.SessionMemory.API.Get("collectionList"));
            let idx = collections.findIndex(coll => coll.id === payload.id);
            idx>-1 ? collections[idx] = response.data.data : null;
            common.SessionMemory.API.Post("collectionList", JSON.stringify(collections));
            //get index of current location by id
            let index = vm.allItemCollections.findIndex(
              itemCollection => itemCollection.id === payload.id
            );
            //update location in list present at the index
            vm.allItemCollections[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.isProcessing = false;
            vm.oldLocationTypeDetails = null;
            $scope.closeShowHistory();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.isProcessing = false;
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
        vm.isProcessing = false;
        $timeout(() => {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.delete = payload => {
      vm.isProcessing = true;
      ItemCollectionService.API.DeleteItemCollection(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.isProcessing = false;
          let collections = JSON.parse(common.SessionMemory.API.Get("collectionList"));
          collections.splice(collections.findIndex(coll=> coll.id === payload.id),1);
          common.SessionMemory.API.Post("collectionList", JSON.stringify(collections));
          let index = vm.allItemCollections.findIndex(
            itemCollection => itemCollection.id === payload.id
          );
          vm.allItemCollections.splice(index, 1);
          vm.rowsCount--;
          vm.updateTableInformation(vm.currentPage);
        })
        .catch(error => {
          vm.isProcessing = false;
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            vm.dependencyList = NotificationService.errorNotification(error);
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          }
        });
    };

    vm.exit = () => {
      common.$state.go("common.prime.itemcollections");
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

    vm.showconfirm = () => {
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
    };

    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    //close vendor link details panel
    vm.closeVendorLinkDetails = () => {
      vm.isShowLinkedDetails = false;
    };

    //to show vendors link in side panel
    vm.openLinkVendor = collectionDetails => {
      vm.collection_id = collectionDetails.id;
      common.$state.go("common.prime.itemcollections.linkitemcollection", {
        id: vm.collection_id
      });
    };

    //Load vendors for the mto collection
    vm.loadVendorCollectionLinks = collection_id => {
      if (
        Object.keys(vm.collection_id).length === 0 &&
        vm.collection_id.constructor === Object
      ) {
        vm.collection_id = common.$stateParams.id;
      }
      vm.loadingLinks = true;
      ItemCollectionService.API.GetCollectionVendors(vm.collection_id)
        .then(response => {
          vm.loadingLinks = false;
          vm.collectionVendors = response.data;
          vm.allVendorCollections = response.data;
        })
        .catch(error => {
          vm.loadingLinks = false;
          logger.error(error);
        });
    };

    vm.searchCollectionVendors = vendor => {
      vm.isSearching = true;
      if (vendor.length > 0) {
        vm.collectionVendors = _.filter(
          vm.allVendorCollections,
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
        vm.collectionVendors = vm.allVendorCollections;
        vm.isSearching = false;
      }
    };

    vm.resetSearch = () => {
      vm.isReset = true;
      vm.collectionVendors = [];
      vm.searchText = "";
      $timeout(() => {
        vm.collectionVendors = vm.allVendorCollections;
      }, 1);
      $timeout(() => {
        vm.isReset = false;
      }, 2500);
    };

    //Load details of mto option linked to collection
    vm.loadLinkedOptionDetails = option_id => {
      ItemService.API.SearchItems("id", option_id).then(
        response => {
          vm.linkedOptionDetails = response.data[0];
        },
        error => {}
      );
    };

    //Show the details of entities in which that collection is reffered
    vm.showLinkedVendorDependencyDetails = data => {
      vm.isShowLinkedDetails = true;
      vm.itemColLinkDetails = data;
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
      vm.isLinkingVendor = true;
      //Linking collection to vendor
      if (payload.selected === true) {
        pay.collection_id = vm.collection_id;
        pay.vendor_id = payload.id;
        ItemCollectionService.API.LinkVendorToCollection(pay).then(
          response => {
            vm.isLinkingVendor = false;
            vm.message = " 🔗 Successfully linked Collection";
            timeout = $timeout(() => {
              vm.message = "";
              $timeout.cancel(timeout);
              payload.isselected = payload.selected;
            }, 2500);
          },
          error => {
            // Set error message for unsuccessful link
            vm.hasLinkError =
              "Unable to update link vendor to Collection. Please contact administrator";
            timeout = $timeout(() => {
              vm.hasLinkError = "";
              $timeout.cancel(timeout);
            }, 2500);
            payload.isselected = false;
            payload.selected = false;
          }
        );
      } else if (payload.selected === false) {
        //Unlinking vendor from the collection
        pay.collection_id = vm.collection_id;
        pay.vendor_id = payload.id;
        ItemCollectionService.API.UnlinkVendorFromCollection(
          pay.collection_id,
          pay.vendor_id
        ).then(
          response => {
            // Set message for successful unlink
            vm.message = " Successfully unlinked Collection";
            vm.isLinkingVendor = false;
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
              payload.selected = true;
              vm.hasLinkError = "Unable to unlink because of dependency";
              vm.dependencyDetails = error.data.dependency;
              vm.showDependencyPanel = true;
            } else {
              // Set error message for unsuccessful unlink
              vm.hasLinkError =
                "Unable to update link vendor to Collection. Please contact administrator";
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

    // function is used to set the focus to the short_description field on load
    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#short_description").focus();
      });
    };

    vm.resetForm = function() {
      vm.itemCol_details = {};
      vm.itemCol_details["short_description"] = null;
    };

    // Resets the form and goes to the new form state
    vm.openForm = () => {
      vm.message = null;
      vm.error = null;
      vm.isConfirmDelete = false;
      vm.showDependencyDetails = false;
      vm.resetForm();
      vm.setInitialState();
      common.$state.go("common.prime.itemcollections.new");
    };

    // Goes to the new form state with persisting data
    vm.createAnotherForm = () => {
      vm.message = null;
      vm.error = null;
      vm.itemCol_details = {};
      vm.itemCol_details.collection_status_id =
        vm.oldPayload.collection_status_id;
      vm.setInitialState();
      common.$state.go("common.prime.itemcollections.new");
      $timeout(() => {
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    // Goes back to the main state. while reseting the variables.
    vm.closeForm = () => {
      vm.message = null;
      this.itemCol_details = null;
      common.$state.go("common.prime.itemcollections");
      vm.showDependencyDetailsData = false;
      vm.message = "";
      vm.hasLinkError = "";
      vm.searchCollection = "";
      vm.isUnauthorized = false;
      vm.isDeleteSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isSaveSuccess = false;
      vm.isConfirmDelete = false;
      vm.isShowLinkedDetails = false;
      vm.collectionVendors = [];
    };

    vm.closeDependencyDetails = () => {
      vm.showDependencyDetailsData = false;
    };
    vm.closeDependencyList = () => {
      common.$state.go("common.prime.itemcollections.update", {
        item_collection_id: common.$stateParams.item_collection_id
      });
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };
    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    //Called during update and double click action and also after canceling from delete state.
    vm.dblClickAction = itemCollection => {
      common.$state.go("common.prime.itemcollections.update", {
        item_collection_id: itemCollection.id
      });
      vm.isUnauthorized = false;
      vm.isShowHistory = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.updateBtnText = "Update";
      vm.showDependencyDetails = false;
      vm.showDependencyDetailsData = false;
      vm.itemCol_details = _.clone(itemCollection);
      vm.oldItemCollection = _.clone(itemCollection);
      vm.setInitialState();
    };

    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
    };

    vm.initializeItemCollection();
  }
})();
