class InventoryTypeController {
  constructor($scope, common, InventoryTypeService, EntityDetails) {
    this.$scope = $scope;
    this.common = common;
    this.logger = this.common.Logger.getInstance("InventoryTypeController");
    this.$timeout = this.common.$timeout;
    this.InventoryTypeService = InventoryTypeService;
    this.EntityDetails = EntityDetails;
    this.isViewAuthorized = true;
    this.$scope.name = "Inventory Type";
    this.isLoaded = false;
    this.saveBtnText = "Save";
    this.saveBtnError = false;
    this.isSaveSuccess = false;
    this.updateBtnText = "Update";
    this.updateBtnError = false;
    this.isUpdateSuccess = false;
    this.isConfirmDelete = false;
    this.isDeleteSuccess = false;

    // varibles to update page information
    this.pageSize = 100;
    this.rowsCount = 0;
    this.sortType = "id";
    this.currentPage = 1;

    $scope.getAccessPermissions(this.common.Identifiers.inventory_type)
    .then(() => {
      this.activate();
    })
    .catch(() => {
      this.activate();
    });

    // Get history details for codes
    this.$scope.loadHistory = () => {
      this.common.EntityDetails.API.GetHistoryData(
        this.common.Identifiers.inventory_type,
        this.inventoryTypeDetails.id
      )
        .then(response => {
          this.$scope.historyList = response.data;
          this.$scope.showhistory = true;
        })
        .catch(error => {
          this.logger.error(error);
        });
    };

    // Close show history panel only
    this.$scope.closeShowHistory = () => {
      this.$scope.showhistory = false;
    };
  }

  activate() {
    this.setGridProperties();
    this.getInventoryTypesList();
    this.getModelAndSetValidationRules(this.common.Identifiers.inventory_type);
  }

  getModelAndSetValidationRules(uuid) {
    this.EntityDetails.API.GetModelAndSetValidationRules(uuid).then(
      model => {}
    );
  }

  // Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.inventoryTypesGrid = {
      columns: {
        id: { visible: false },
        type: { visible: true },
        code: { visible: true },
        description: { visible: true }
      }
    };
  }

  ShowHideColumnSettings() {
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  getInventoryTypesList(refresh) {
    this.setGridProperties();
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }
    this.$scope.selectedRow = null;
    this.isLoaded = false;
    this.InventoryTypeService.API.GetInventoryTypes()
      .then(response => {
        this.inventoryTypesList = response.data;

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

  // set focus on first field in form
  setInitialState() {
    this.$timeout(() => {
      angular.element("#type").focus();
    }, 0);
  }

  openForm() {
    this.isShowDetails = true;
    this.isShowAdd = true;
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    this.inventoryTypeForm.$setPristine();
    this.setInitialState();
    this.resetForm();
  }

  resetForm() {
    this.inventoryTypeDetails = {};
    this.inventoryTypeDetails["inventory_type"] = null;
    this.inventoryTypeDetails["code"] = null;
    this.inventoryTypeDetails["description"] = null;
  }

  dblClickAction(inventoryType) {
    this.message = null;
    this.isShowAdd = false;
    this.inventoryTypeDetails = _.clone(inventoryType);
    this.oldInventoryTypeDetails = _.clone(inventoryType);
    this.isUnauthorized = false;
    this.isConfirmDelete = false;
    this.isSaveSuccess = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isShowHistory = true;
    this.updateBtnText = "Update";
    this.setInitialState();
    this.isShowDetails = true;
  }

  closeForm() {
    this.isShowDetails = false;
    this.saveBtnText = "Save";
    this.showErrorDetailsData = false;
    this.$scope.showhistory = false;
    this.$timeout(() => {
      this.isUnauthorized = false;
      this.showErrorDetails = false;
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
    }, 500);
  }

  // Show confirmation page on click of delete button
  showconfirm() {
    this.isConfirmDelete = true;
    this.isShowHistory = false;
    this.isUnauthorized = false;
  }

  // funcion to check if the payload has changed, if yes returns true else returns false
  hasUpdateChanges(payload) {
    for (let key in payload) {
      if (
        this.oldInventoryTypeDetails[key] !== undefined &&
        payload[key] !== undefined &&
        this.oldInventoryTypeDetails[key] !== payload[key] &&
        typeof this.oldInventoryTypeDetails[key] !== "object"
      ) {
        return true;
      }
    }
    return false;
  }

  save(inventoryTypeDetails) {
    const payload = {
      code: inventoryTypeDetails.code,
      type: inventoryTypeDetails.inventory_type
    };
    this.saveBtnText = "Saving now...";
    this.isProcessing = true;
    this.InventoryTypeService.API.InsertInventoryType(payload)
      .then(response => {
        inventoryTypeDetails.id = response.inserted_id;
        this.saveBtnText = "Save";
        this.isProcessing = false;
        this.isSaveSuccess = true;
        this.rowsCount++;
        this.inventoryTypesList.push(inventoryTypeDetails);
        this.updateTableInformation(this.currentPage);
      })
      .catch(error => {
        if (error.status === 403) {
          this.isUnauthorized = true;
        }
        this.saveBtnText = "Oops.!! Something went wrong";
        this.saveBtnError = true;
        this.isProcessing = false;
        if (error.data.error && error.data.error.message) {
          this.message = error.data.error.message;
        } else {
          this.message = error.data.message || error.data.error;
        }
        this.$timeout(() => {
          this.message = null;
          this.saveBtnText = "Save";
          this.saveBtnError = false;
          this.message = null;
        }, 2500);
      });
  }

  update(inventoryTypeDetails) {
    const payload = {
      id: inventoryTypeDetails.id,
      code: inventoryTypeDetails.code,
      type: inventoryTypeDetails.inventory_type,
      description: inventoryTypeDetails.description
    };
    this.updateBtnText = "Updating Now...";
    if (this.hasUpdateChanges(inventoryTypeDetails)) {
      this.isProcessing = true;
      this.$scope.showhistory = false;
      this.InventoryTypeService.API.UpdateInventoryType(payload)
        .then(response => {
          this.isShowHistory = false;
          this.isProcessing = false;
          this.updateBtnText = "Update";
          this.isUpdateSuccess = true;
          this.oldInventoryTypeDetails = null;
          this.inventoryTypesList[
            this.inventoryTypesList.findIndex(
              _type => _type.id == inventoryTypeDetails.id
            )
          ] = inventoryTypeDetails;
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          }
          if (error.data.error && error.data.error.message) {
            this.message = error.data.error.message;
          } else {
            this.message = error.data.message || error.data.error;
          }
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.$timeout(() => {
            this.message = null;
            this.updateBtnText = "Update";
            this.updateBtnError = false;
            this.isProcessing = false;
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

  delete(inventoryTypeDetails) {
    this.isProcessing = true;
    this.InventoryTypeService.API.DeleteInventoryType(inventoryTypeDetails)
      .then(response => {
        this.isProcessing = false;
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        this.rowsCount--;
        this.inventoryTypesList.splice(
          this.inventoryTypesList.findIndex(
            _type => _type.id == inventoryTypeDetails.id
          ),
          1
        );
        this.updateTableInformation(this.currentPage);
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
          this.isProcessing = false;
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
    this.rowsCount === 0 ? (this.initalCount = 0) : (this.initalCount = 1);

    if (currentPage === 1) {
      this.rowsInfo = `Displaying ${this.initalCount} - ${
        this.rowsCount < this.pageSize ? this.rowsCount : this.pageSize
      } Of ${this.rowsCount} Records`;
    } else {
      var start =
        parseInt(currentPage) * parseInt(this.pageSize) -
        parseInt(this.pageSize) +
        1;
      var end =
        parseInt(currentPage) * parseInt(this.pageSize) -
        parseInt(this.pageSize) +
        parseInt(this.pageSize);
      this.rowsInfo = `Displaying ${start} - ${
        end < this.rowsCount ? end : this.rowsCount
      } Of ${this.rowsCount} Records`;
    }
  }
}

angular
  .module("rc.prime.inventorytypes")
  .controller("InventoryTypeController", InventoryTypeController);
