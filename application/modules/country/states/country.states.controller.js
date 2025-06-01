class CountryStateController {
  constructor(
    $scope,
    common,
    CountryStatesService,
    CountryService,
    EntityDetails
  ) {
    this.$scope = $scope;
    this.common = common;
    this.$timeout = this.common.$timeout;
    this.$state = common.$state;
    this.CountryStatesService = CountryStatesService;
    this.CountryService = CountryService;
    this.entityDetails = EntityDetails;
    this.entityInformation = {};
    this.error = {};
    this.message = null;
    this.oldStateDetails = null;
    this.isLoaded = false;
    this.isViewAuthorized = true;
    this.states_details = {};
    this.allIndividualList = {};
    this.isColumnSettingsVisible = false;
    this.saveStateBtnText = "Save";
    this.saveStateBtnError = false;
    this.pageSize = 100;
    this.rowsCount = 0;
    this.sortType = "name";
    this.currentPage = 1;
    this.uuid = "117";
    
    // Get permissions for Company module
    this.$scope
      .getAccessPermissions(117)
      .then(result => {
        this.statePermissions = result;
        this.activate();
      })
      .catch(error => {
        this.statePermissions = error.data;
        this.activate();
      });

    //Get history details for an attribute value
    this.$scope.loadHistory = () => {
      common.EntityDetails.API.GetHistoryData(this.uuid, this.states_details.id)
        .then(response => {
          this.$scope.historyList = response;
          this.$scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    this.$scope.closeShowHistory = () => {
      this.$timeout(() => {
        angular.element("#region_name").focus();
      }, 0);
      this.$scope.showhistory = false;
    };
  }

  //Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.countrySatesGrid = {
      columns: {
        id: {
          visible: false
        },
        region_name: {
          visible: true
        },
        region_code: {
          visible: true
        },
        cities: {
          visible: true
        }
      }
    };
  }

  ShowHideColumnSettings() {
    this.$timeout(() => {
    angular.element("#hide_show_column").focus();
  }, 1000);
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  activate() {
    this.countryId = this.common.$stateParams.country_id;
    this.setGridProperties();
    this.reload();
    this.getSelectedCountry(this.countryId);
    this.getEntityInformation();
    this.getModelAndSetValidationRules();
  }

  //to get required information of company departments
  getEntityInformation() {
    this.entityDetails.API.GetEntityInformation(this.uuid)
      .then(states_information => {
        this.entityInformation = states_information;
        this.$scope.name = this.entityInformation.name;
        this.$scope.getStatuses(common.Identifiers.entity);
      })
      .catch(error => {});
  }

  getModelAndSetValidationRules() {
    this.entityDetails.API.GetModelAndSetValidationRules(this.uuid).then(
      model => {
        //vm.getDynamicColumns(model);
      }
    );
  }

  gotoCities(regionId) {
    this.$state.go("common.prime.country.states.cities", {
      region_id: regionId,
      country_id: this.countryId
    });
  }

  getSelectedCountry(countryId) {
    this.CountryService.API.GetCountryById(countryId)
      .then(response => {
        this.selectedCountry = response;
      })
      .catch(error => {
        logger.error(error);
      });
  }

  reload(refresh, isCache) {
    this.setGridProperties();
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTime = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }

    if (isCache === undefined || isCache === null) {
      isCache = false;
    }
    this.$scope.selectedRow = null;
    this.isLoaded = false;
    this.CountryStatesService.API.GetCountryStatesBycountryId(
      this.common.$stateParams.country_id
    )
      .then(response => {
        this.rowsCount = response.length;
        this.statesList = response;
        if (refresh !== undefined) {
          this.refreshTableText = "Table is refreshing...";
          this.totalRecords = response.length;
          this.totalRecordsText = "record(s) loaded in approximately";
          this.totalTimeText =
            "<strong>" +
            response.time_taken +
            "</strong><span class='f-14 c-gray'> seconds</span>";
          this.refreshTableText = "Successfully refreshed";
          this.$timeout(() => {
            this.isRefreshTable = false;
          }, 3500);
          this.focusSearchField();
        }
        this.isLoaded = true;
        this.updateTableInformation(1); ////on reload update table information like no. of records
      })
      .catch(error => {
        if (error.status === 403) {
          this.isLoaded = true;
          this.isViewAuthorized = false;
        }
        this.isRefreshTable = true;
        this.refreshTableText = "Unsuccessfull!";
        this.$timeout(() => {
          this.isRefreshTable = false;
        }, 3500);
        // logger.error(error);
      });
  }

  //Focus
  focusSearchField =  () => {
    this.$timeout(() => {
      angular.element("#inlineSearch").focus();
      },1000)
  };


  //set focus on first field in form
  setInitialState() {
    this.$timeout(() => {
      angular.element("#region_name").focus();
    }, 0);
  }

  save(payload) {
    payload.country_id = this.countryId;
    this.saveStateBtnText = "Saving Now...";
    this.CountryStatesService.API.InsertCountryStates(payload)
      .then(response => {
        payload.id = response.data.data.id;
        this.previousState = payload;
        this.saveStateBtnText = "Save";
        this.isSaveStateSuccess = true;
        this.statesList && this.statesList.length
          ? (this.statesList = [])
          : null;
        this.reload();
      })
      .catch(error => {
        if (error.status === 403) {
          this.isUnauthorized = true;
        }
        this.saveStateBtnText = "Oops.!! Something went wrong";
        this.saveStateBtnError = true;
        this.error = true;
        this.message = "Record already exists in the table";
        this.$timeout(() => {
          this.message = null;
          this.saveStateBtnText = "Save";
          this.saveStateBtnError = false;
        }, 2500);
      });
  }

  //Create new Associate after save
  createAnotherForm() {
    this.isSaveStateSuccess = false;
    this.isShowAddStates = true;
    this.states_details = {};
    this.setInitialState();
    //Setting previously entered data to the new context
    this.states_details.status_id = this.previousState.status_id;
  }

  //check that update form previous data is not same as payload
  hasUpdateChanges(payload) {
    if (
      this.oldStateDetails.region_name !== payload.region_name ||
      this.oldStateDetails.region_code !== payload.region_code
    ) {
      return true;
    } else {
      return false;
    }
  }

  update(payload) {
    this.updateStateBtnText = "Updating Now...";
    if (this.hasUpdateChanges(payload) === true) {
      this.$scope.showhistory = false;
      this.CountryStatesService.API.UpdateCountryStates(payload)
        .then(response => {
          let index = this.statesList.findIndex(im => im.id === payload.id);
          this.statesList[index] = payload;
          this.isShowHistory = false;
          this.updateStateBtnText = "Done";
          this.isUpdateStateSuccess = true;
          this.oldStateDetails = null;
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          }
          this.updateStateBtnText = "Oops.!! Something went wrong";
          this.updateStateBtnError = true;
          this.error = true;
          this.message =
            error.data.error || "Record already exists in the table";
          this.$timeout(() => {
            this.saveStateBtnText = "Update";
            this.updateStateBtnError = false;
            this.message = null;
            this.updateStateBtnText = "Update";
          }, 2500);
        });
    } else {
      this.updateStateBtnText = "Nothing to update";
      this.updateStateBtnError = true;
      this.$timeout(() => {
        this.updateStateBtnText = "Update";
        this.updateStateBtnError = false;
      }, 1000);
    }
  }

  delete(payload) {
    this.CountryStatesService.API.DeleteCountryStates(payload)
      .then(response => {
        this.isDeleteStateSuccess = true;
        this.isConfirmStateDelete = false;
        this.reload();
        // this.$timeout(() => {
        //   this.statesList.length--;
        // }, 0);
      })
      .catch(error => {
        if (error.status === 403) {
          this.isUnauthorized = true;
        }
        this.error = true;
        this.message = error.data.error;
      });
  }

  showconfirm() {
    this.isShowHistory = false;
    this.isConfirmStateDelete = true;
    this.isUnauthorized = false;
  }

  dblClickAction(state) {
    this.isShowAddStates = false;
    this.showDetailsByID(state);
    this.oldStateDetails = _.clone(this.states_details);
  }

  showDetailsByID(state) {
    this.states_details = _.clone(state);
    this.$scope.isShowAddressContactPanel = false; // close  address and contacts  panel on open of update form
    this.isUnauthorized = false;
    this.isShowHistory = true;
    this.isShowStatesDetails = true;
    this.isShowAddStates = false;
    this.isConfirmStateDelete = false;
    this.isSaveStateSuccess = false;
    this.isUpdateStateSuccess = false;
    this.isDeleteStateSuccess = false;
    this.updateStateBtnText = "Update";
    this.setInitialState();
    //On double click, data lake panel closes
    this.$scope.$broadcast("showMetaDataPanel", {
      panel: false,
      moduleInfo: this.entityInformation
    });
  }

  openForm() {
    this.isShowStatesDetails = true;
    this.isShowAddStates = true;
    this.isConfirmStateDelete = false;
    this.states_details = {};
    this.state_form.$setPristine();
    this.setInitialState();
  }

  closeForm() {
    this.message = null;
    this.isShowStatesDetails = false;
    this.saveStateBtnText = "Save";
    this.updateStateBtnText = "Update";
    this.updateStateBtnError = false;
    this.$timeout(() => {
      this.isUnauthorized = false;
      this.isDeleteStateSuccess = false;
      this.isSaveStateSuccess = false;
      this.isUpdateStateSuccess = false;
      this.isConfirmStateDelete = false;
      angular.element("#inlineSearch").focus();
    }, 500);
  }

  ShowHideColumnSettings() {
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  pageChangeHandler(num) {
    this.currentPage = num;
    this.updateTableInformation(num);
  }

  //// show table information like no. of records with or without search filter.
  updateTableInformation(currentPage) {
    if (!this.rowsCount || this.rowsCount === 0) {
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
  .module("rc.prime.country.states")
  .controller("CountryStateController", CountryStateController);
