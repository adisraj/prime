class InventoryMethodController {
  constructor($scope, common, InventoryMethodService) {
    this.$scope = $scope;
    this.common = common;
    this.logger = this.common.Logger.getInstance("InventoryMethodController");
    this.$timeout = this.common.$timeout;
    this.InventoryMethodService = InventoryMethodService;
    this.isViewAuthorized = true;
    this.$scope.name = "Inventory Method";

    //varibles to update page information
    this.pageSize = 100;
    this.rowsCount = 0;
    this.sortType = "name";
    this.currentPage = 1;

    $scope.getAccessPermissions(this.common.Identifiers.inventory_method)
    .then(() => {
      this.activate();
    })
    .catch(() => {
      this.activate();
    });

    //Get history details for codes
    this.$scope.loadHistory = () => {
      this.common.EntityDetails.API.GetHistoryData(
        this.common.Identifiers.inventory_method,
        this.inventoryMethodDetails.id
      )
        .then(response => {
          this.$scope.historyList = response.data;
          this.$scope.showhistory = true;
        })
        .catch(error => {
          this.logger.error(error);
        });
    };

    //Close show history panel only
    this.$scope.closeShowHistory = () => {
      this.$scope.showhistory = false;
    };
  }

  activate() {
    this.setGridProperties();
    this.getInventoryMethodsList();
    this.getModelAndSetValidationRules();
  }

  //Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.inventoryMethodsGrid = {
      columns: {
        id: {
          visible: false
        },
        name: {
          visible: true
        },
        code: {
          visible: true
        },
        description: {
          visible: true
        }
      }
    };
  }

  ShowHideColumnSettings() {
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  getInventoryMethodsList(refresh) {
    this.setGridProperties();
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }
    this.$scope.selectedRow = null;
    this.isLoaded = false;
    this.InventoryMethodService.API.GetInventoryMethods()
      .then(response => {
        this.inventoryMethodsList = response.data;
        this.rowsCount = response.data.length;
        if (refresh !== undefined) {
          this.refreshTableText = "Table is refreshing...";
          this.totalRecords = response.data.length;
          this.totalRecordsText = "record(s) loaded in approximately";
          this.totalTimeText =
            "<strong>" +
            response.time_taken +
            "</strong><span class='f-14 c-gray'> seconds</span>";
          this.refreshTableText = "Successfully refreshed";
          this.$timeout(() => {
            this.isRefreshTable = false;
          }, 3500);
        }
        this.isLoaded = true;
        this.updateTableInformation(1);
      })
      .catch(error => {
        if (error.status === 403) {
          this.isViewAuthorized = false;
        }
        this.isRefreshTable = true;
        this.refreshTableText = "Unsuccessfull!";
        this.$timeout(() => {
          this.isRefreshTable = false;
        }, 3500);
        this.logger.error(error);
      });
  }

  openForm() {
    this.saveBtnText = "Save";
    this.isShowDetails = true;
    this.isShowAdd = true;
    this.inventoryMethodForm.$setPristine();
    this.setInitialState();
    this.resetForm();
  }

  resetForm() {
    this.inventoryMethodDetails = {};
    this.inventoryMethodDetails["name"] = null;
    this.inventoryMethodDetails["code"] = null;
    this.inventoryMethodDetails["description"] = null;
  }

  //Create another individual after save
  createAnotherForm() {
    this.isShowDetails = true;
    this.isShowAdd = true;
    this.isConfirmDelete = false;
    this.isSaveSuccess = false;
    this.inventoryMethodDetails = {};
    this.setInitialState();
  }

  closeForm() {
    this.isShowDetails = false;
    this.saveBtnText = "Save";
    this.$scope.showhistory = false;
    this.$timeout(() => {
      this.isUnauthorized = false;
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
    }, 500);
  }

  showconfirm() {
    this.isConfirmDelete = true;
    this.isShowHistory = false;
    this.isUnauthorized = false;
  }

  dblClickAction(data) {
    this.isShowAdd = false;
    this.inventoryMethodDetails = _.clone(data);
    this.oldInventoryMethodDetails = _.clone(this.inventoryMethodDetails);
    this.isUnauthorized = false;
    this.isConfirmDelete = false;
    this.isSaveSuccess = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isShowHistory = true;
    this.$scope.showhistory = false;
    this.updateBtnText = "Update";
    this.setInitialState();
    this.isShowDetails = true;
  }

  //set focus on first field in form
  setInitialState() {
    this.$timeout(() => {
      angular.element("#name").focus();
    }, 0);
  }

  getModelAndSetValidationRules() {
    this.common.EntityDetails.API.GetModelAndSetValidationRules(
      this.common.Identifiers.inventory_method
    ).then(model => {});
  }

  save(payload) {
    this.saveBtnText = "Saving now...";
    this.InventoryMethodService.API.InsertInventoryMethod(payload)
      .then(response => {
        payload.id = response.data.inserted_id;
        this.previousInventoryMethod = payload;
        this.saveBtnText = "Save";
        this.isSaveSuccess = true;
        this.inventoryMethodsList.push(payload);
      })
      .catch(error => {
        if (error.status === 403) {
          this.isUnauthorized = true;
        }
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.error = true;
        if (error.data.error && error.data.error.message) {
          this.message = error.data.error.message;
        } else {
          this.message = error.data.message || error.data.error;
        }
        this.$timeout(() => {
          this.saveBtnText = "Save";
          this.saveBtnError = false;
          this.message = null;
        }, 2500);
      });
  }

  //check that update form previous data is not same as payload
  hasUpdateChanges(payload) {
    if (
      this.oldInventoryMethodDetails.name !== payload.name ||
      this.oldInventoryMethodDetails.code !== payload.code ||
      this.oldInventoryMethodDetails.description !== payload.description
    ) {
      return true;
    } else {
      return false;
    }
  }

  update(payload) {
    this.updateBtnText = "Updating Now...";
    if (this.hasUpdateChanges(payload) === true) {
      this.$scope.showhistory = false;
      this.InventoryMethodService.API.UpdateInventoryMethod(payload)
        .then(response => {
          let index = this.inventoryMethodsList.findIndex(
            im => im.id === payload.id
          );
          this.inventoryMethodsList[index] = payload;
          this.isShowHistory = false;
          this.updateBtnText = "Done";
          this.isUpdateSuccess = true;
          this.oldInventoryMethodDetails = null;
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          }
          this.error = true;
          if (error.data.error && error.data.error.message) {
            this.message = error.data.error.message;
          } else {
            this.message = error.data.message || error.data.error;
          }
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.$timeout(() => {
            this.updateBtnText = "Update";
            this.updateBtnError = false;
            this.message = null;
          }, 2500);
        });
    } else {
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
      }, 1000);
    }
  }

  delete(payload) {
    this.$scope.showhistory = false;
    this.InventoryMethodService.API.DeleteInventoryMethod(payload)
      .then(response => {
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        let index = this.inventoryMethodsList.findIndex(
          individual => individual.id === payload.id
        );
        this.inventoryMethodsList.splice(index, 1);
      })
      .catch(error => {
        if (error.status === 403) {
          this.isUnauthorized = true;
        } else {
          this.error = true;
          this.message = error.data.message || error.data.error;
        }
        this.$timeout(() => {
          this.message = null;
        }, 2500);
      });
  }

  //On click of row, send the row index and highlight the row clicked
  setClickedRow(index) {
    this.selectedRow = index;
  }

  pageChangeHandler(num) {
    this.currentPage = num;
    this.updateTableInformation(num);
  }

  updateTableInformation(currentPage) {
    if (this.rowsCount === 0) {
      this.initalCount = 0;
    } else {
      this.initalCount = 1;
    }

    if (currentPage === 1) {
      this.rowsInfo =
        "Displaying " +
        this.initalCount +
        " - " +
        (this.rowsCount < this.pageSize ? this.rowsCount : this.pageSize) +
        " Of " +
        this.rowsCount +
        " Records";
    } else {
      var start =
        parseInt(currentPage) * parseInt(this.pageSize) -
        parseInt(this.pageSize) +
        1;
      var end =
        parseInt(currentPage) * parseInt(this.pageSize) -
        parseInt(this.pageSize) +
        parseInt(this.pageSize);
      this.rowsInfo =
        "Displaying " +
        start +
        " -" +
        (end < this.rowsCount ? end : this.rowsCount) +
        " Of " +
        this.rowsCount +
        " Records";
    }
  }
}

angular
  .module("rc.prime.inventorymethods")
  .controller("InventoryMethodController", InventoryMethodController);
