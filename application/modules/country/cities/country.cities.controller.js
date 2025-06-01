class CountryCityController {
  constructor(
    $scope,
    common,
    CountryCityService,
    CountryStatesService,
    EntityDetails
  ) {
    this.$scope = $scope;
    this.common = common;
    this.$timeout = this.common.$timeout;
    this.$state = common.$state;
    this.CountryCityService = CountryCityService;
    this.CountryStatesService = CountryStatesService;
    this.entityDetails = EntityDetails;
    this.entityInformation = {};
    this.error = {};
    this.message = null;
    this.oldCityDetails = null;
    this.pageSize = 100;
    this.sortType = "name";
    this.currentPage = 1;
    this.isLoaded = false;
    // this.isUnauthorized = true;
    this.cities_details = {};
    this.allIndividualList = {};
    this.isColumnSettingsVisible = false;
    this.saveCityBtnText = "Save";
    this.saveCityBtnError = false;
    this.pageSize = 100;
    this.rowsCount = 0;
    this.sortType = "name";
    this.currentPage = 1;
    this.uuid = "118";
    
    // Get permissions for Company module
    this.$scope
      .getAccessPermissions(118)
      .then(result => {
        this.cityPermissions = result;
        this.activate();
      })
      .catch(error => {
        this.cityPermissions = error.data;
        this.activate();
      });

    //Get history details for an attribute value
    this.$scope.loadHistory = () => {
      common.EntityDetails.API.GetHistoryData(this.uuid, this.cities_details.id)
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
        angular.element("#city_name").focus();
      }, 0);
      this.$scope.showhistory = false;
    };
  }

  //Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.countryCitiesGrid = {
      columns: {
        region_id: {
          visible: false
        },
        city_name: {
          visible: true
        }
      }
    };
  }

  activate() {
    this.regionId = this.common.$stateParams.region_id;
    this.setGridProperties();
    this.reload();
    this.getSelectedState(this.regionId);
    this.getEntityInformation();
    this.getModelAndSetValidationRules();
  }

  //Focus
  focusSearchField() {
    this.$timeout(() => {
      angular.element("#inlineSearch").focus();
      },1000)
  };

  getSelectedState(regionId) {
    this.CountryStatesService.API.GetCountryStatesById(regionId)
      .then(response => {
        this.selectedState = response[0];
      })
      .catch(error => {
        logger.error(error);
      });
  }

  //to get required information of company departments
  getEntityInformation() {
    this.entityDetails.API.GetEntityInformation(this.uuid)
      .then(city_information => {
        this.entityInformation = city_information;
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
    this.CountryCityService.API.GetCountryCitiesByStateId(
      this.common.$stateParams.region_id
    )
      .then(response => {
        this.rowsCount = response.length;
        this.cityList = response;
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
          this.isUnauthorized = false;
        }
        this.isRefreshTable = true;
        this.refreshTableText = "Unsuccessfull!";
        this.$timeout(() => {
          this.isRefreshTable = false;
        }, 3500);
        // logger.error(error);
      });
  }

  //set focus on first field in form
  setInitialState() {
    this.$timeout(() => {
      angular.element("#city_name").focus();
    }, 0);
  }

  save(payload) {
    payload.region_id = this.regionId;
    this.saveCityBtnText = "Saving Now...";
    this.CountryCityService.API.InsertCountryCity(payload)
      .then(response => {
        payload.id = response.data.data.id;
        this.previousCity = payload;
        this.saveCityBtnText = "Save";
        this.isSaveCitySuccess = true;
        this.reload();
      })
      .catch(error => {
        if (error.status === 403) {
          this.isUnauthorized = true;
        }
        this.saveCityBtnText = "Oops.!! Something went wrong";
        this.saveCityBtnError = true;
        this.error = true;
        this.message = " Record already exists in the table ";
        this.$timeout(() => {
          this.message = null;
          this.saveCityBtnText = "Save";
          this.saveCityBtnError = false;
        }, 2500);
      });
  }

  //check that update form previous data is not same as payload
  hasUpdateChanges(payload) {
    if (
      this.oldCityDetails.region_id !== payload.region_id ||
      this.oldCityDetails.city_name !== payload.city_name
    ) {
      return true;
    } else {
      return false;
    }
  }

  update(payload) {
    this.updateCityBtnText = "Updating Now...";
    if (this.hasUpdateChanges(payload) === true) {
      this.$scope.showhistory = false;
      this.CountryCityService.API.UpdateCountryCity(payload)
        .then(response => {
          let index = this.cityList.findIndex(im => im.id === payload.id);
          this.cityList[index] = payload;
          this.isShowHistory = false;
          this.updateCityBtnText = "Done";
          this.isUpdateCitySuccess = true;
          this.oldCityDetails = null;
          this.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          }
          this.updateCityBtnText = "Oops.!! Something went wrong";
          this.updateCityBtnError = true;
          this.error = true;
          this.message =
            error.data.error || "Record already exists in the table";
          this.$timeout(() => {
            this.updateCityBtnText = "Update";
            this.updateCityBtnError = false;
            this.message = null;
          }, 2500);
        });
    } else {
      this.updateCityBtnText = "Nothing to update";
      this.updateCityBtnError = true;
      this.$timeout(() => {
        this.updateCityBtnText = "Update";
        this.updateCityBtnError = false;
      }, 1000);
    }
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

  dblClickAction(city) {
    this.isShowAddCity = false;
    this.showDetailsByID(city);
    this.oldCityDetails = _.clone(this.cities_details);
  }

  showDetailsByID(city) {
    this.cities_details = _.clone(city);
    this.$scope.isShowAddressContactPanel = false; // close  address and contacts  panel on open of update form
    this.isUnauthorized = false;
    this.isShowHistory = true;
    this.isShowCitiesDetails = true;
    this.isShowAddCity = false;
    this.isConfirmCityDelete = false;
    this.isSaveCitySuccess = false;
    this.isUpdateCitySuccess = false;
    this.isDeleteCitySuccess = false;
    this.updateCityBtnText = "Update";
    this.setInitialState();
    //On double click, data lake panel closes
    this.$scope.$broadcast("showMetaDataPanel", {
      panel: false,
      moduleInfo: this.entityInformation
    });
  }

  delete(payload) {
    this.CountryCityService.API.DeleteCountryCity(payload)
      .then(response => {
        this.isDeleteCitySuccess = true;
        this.isConfirmCityDelete = false;
        let index = this.cityList.findIndex(city => city.id == payload.id);
        this.cityList.splice(index, 1);
        this.rowsCount--;
        //this.$scope.lastPageTableRecordDeleteAction($scope.setinstance);
        this.updateTableInformation(this.currentPage);
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
    this.isConfirmCityDelete = true;
    this.isUnauthorized = false;
  }

  ShowHideColumnSettings() {
    this.$timeout(() => {
    angular.element("#hide_show_column").focus();
  }, 1000);
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  openForm() {
    this.isShowCitiesDetails = true;
    this.isShowAddCity = true;
    this.isConfirmCityDelete = false;
    this.cities_details = {};
    this.city_form.$setPristine();
    this.setInitialState();
  }

  closeForm() {
    this.message = null;
    this.isShowCitiesDetails = false;
    this.saveCityBtnText = "Save";
    this.updateCityBtnText = "Update";
    this.updateCityBtnError = false;
    this.$timeout(() => {
      this.isUnauthorized = false;
      this.isDeleteCitySuccess = false;
      this.isSaveCitySuccess = false;
      this.isUpdateCitySuccess = false;
      this.isConfirmCityDelete = false;
      angular.element("#inlineSearch").focus();
    }, 500);
  }

  //Create another city after save
  createAnotherForm() {
    this.isSaveCitySuccess = false;
    this.isShowCitiesDetails = true;
    this.cities_details = {};
    this.setInitialState();
  }
}

angular
  .module("rc.prime.country.states.cities")
  .controller("CountryCityController", CountryCityController);
