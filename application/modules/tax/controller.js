class TaxController {
  constructor($scope, common, TaxService, LocationFactory) {
    this.$scope = $scope;
    this.common = common;
    this.logger = this.common.Logger.getInstance("TaxController");
    this.$timeout = this.common.$timeout;
    this.TaxService = TaxService;
    this.LocationService = LocationFactory;
    this.isViewAuthorized = true;
    //varibles to update page information
    this.pageSize = 100;
    this.rowsCount = 0;
    this.sortType = "region_name";
    this.currentPage = 1;
    this.activate();
    this.taxDetails = {};
    this.taxRegExp = new RegExp(/^(?!0+(?:\.0+)?$)\d?\d(?:\.\d\d?)?$/);
    this.saveBtnText = "Save";
    this.updateBtnText = "Update";

    this.$scope.selectLocationConfiguration = {
      valueField: "id",
      labelField: "name",
      searchField: ["name"],
      sortField: "name",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Location" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: this.locations,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.name) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
        item: (data, escape) => {
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.name) +
            "</span>" +
            "</div>"
          );
        }
      }
    };
  }

  activate() {
    // To get the permission
    this.$scope.getAccessPermissions(130);
    this.setGridProperties();
    this.getCountries();
    this.fetchLocations();
  }

  //Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.taxRegionsGrid = {
      columns: {
        id: {
          visible: false
        },
        region_name: {
          visible: true
        },
        nexus: {
          visible: true
        },
        tax_method: {
          visible: true
        },
        search: {
          visible: true
        }
      }
    };
  }

  getCountries() {
    this.common.EntityDetails.API.GetGraphSet(this.common.Identifiers.country, [
      "id",
      "name",
      "iso3_code"
    ])
      .then(res => {
        for (let i = 0; i < res.length; i++) {
          if (res[i].iso3_code.toLowerCase() === "usa") {
            /// USA id
            this.countryId = res[i].id;
          }
        }
        this.getAllRegions();
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  /// Get list of all regions to show in UI
  getAllRegions(refresh) {
    this.setGridProperties();
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }

    this.TaxService.API.GetRegions(this.countryId)
      .then(response => {
        this.regionsMap = {};
        for (let i = 0; i < response.data.length; i++) {
          if (this.regionsMap[response.data[i].id] === undefined) {
            this.regionsMap[response.data[i].id] = response.data[i];
          }
        }
        this.getAllRegionsAndTaxingMethods();
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
        this.logger.error(error);
      });
  }

  getAllRegionsAndTaxingMethods() {
    this.TaxService.API.GetRegionsWithTaxMethods()
      .then(response => {
        this.allRegions = response.data;
        for (let i = 0; i < this.allRegions.length; i++) {
          if (this.regionsMap[this.allRegions[i].id]) {
            this.allRegions[i].region_name = this.regionsMap[
              this.allRegions[i].id
            ].region_name;
          }
        }
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  fetchLocations() {
    this.LocationService.API.FetchLocationsGraph(["id", "name"])
      .then(response => {
        this.locations = response;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Get all the tax methods
  getAllTaxMethods() {
    this.TaxService.API.GetTaxMethods()
      .then(response => {
        this.taxMethods = [];
        for (let i = 0; i < response.length; i++) {
          if (
            response[i].code !== "one_rate" &&
            response[i].code !== "no_sales_tax"
          ) {
            this.taxMethods.push(response[i]);
          }
        }
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  //Select regions and set object when clicked on link in table
  selectRegion(region) {
    this.region_details = region;
    this.old_region = {};
    this.showAddTaxForm = false;
    this.showUpdateTaxForm = false;
    this.taxDetails.taxList = undefined;
    this.region_details.zipcode = undefined;
    if (region.code === "selling_location") {
      this.getSellingLocationsTaxList(region);
    }

    this.$timeout(() => {
      angular.element("#zipcode").focus();
    }, 0);
  }

  //Highlight clicked row
  setClickedRow(index) {
    this.selectedRow = index;
  }

  /// Function to get list of selling locations along with tax by region id
  getSellingLocationsTaxList(region) {
    if (
      (this.old_region && region.id !== this.old_region.id) ||
      (!this.old_region && region.id)
    ) {
      this.sellingLocations = undefined;
      this.TaxService.API.GetSellingLocationsWithTax(region)
        .then(response => {
          this.old_region = region;
          this.sellingLocations = response;
        })
        .catch(error => {
          this.logger.error(error);
        });
    }
  }

  // function to serach tax details by zipcode
  serachTaxDetails(region) {
    if (
      (region.zipcode && !this.old_region) ||
      (region.zipcode &&
        this.old_region &&
        this.old_region.zipcode !== region.zipcode)
    ) {
      // Closing add and update tax forms
      this.showAddTaxForm = false;
      this.showUpdateTaxForm = false;
      this.selectedRow = undefined;
      this.TaxService.API.GetRegionTaxDetailsByZipcode(region)
        .then(response => {
          this.searchedZipcode = region.zipcode;
          if (response.length > 0) {
            this.taxDetails.taxList = response;
            // once result fetched, reset the zipcode field
            region.zipcode = undefined;
          } else {
            this.taxDetails.taxList = [];
          }
          if (!region.id && response.length > 0) {
            //if tax searched by zipcode in header search
            this.region_details = {
              id: response[0].region_id,
              code: response[0].code,
              tax_method_id: response[0].tax_method_id,
              zipcode: response[0].zipcode
            };
          } else {
            //tax searched from table
            this.region_details = {
              id: region.id,
              code: "delivery_location", // if response length is 0 then code need to be given statically
              tax_method_id: region.tax_method_id,
              zipcode: region.zipcode
            };
          }
          this.filterRegionsList(this.region_details.id);
        })
        .catch(error => {
          this.logger.error(error);
        });
    }
  }

  // highlight the region in list when searched for zipcode
  filterRegionsList(regionId) {
    let regions = this.common.$filter("orderBy")(
      this.allRegions,
      "region_name"
    );
    for (let i = 0; i < regions.length; i++) {
      if (regions[i].id === regionId) {
        this.setClickedRow(i);
      }
    }
  }

  //open form
  openForm(entity, data) {
    this.message = null;
    this.errorMessage = null;
    if (!this.taxMethods) {
      this.getAllTaxMethods();
    }
    if (!entity || entity === "create") {
      this.showAddTaxForm = true;
      this.newTax = {};
      this.showUpdateTaxForm = false;
      if (this.region_details && this.region_details.tax_method_id) {
        this.newTax = angular.copy(this.region_details);
        this.newTax.region_id = this.region_details.id;
      }
    } else if (entity === "update") {
      this.showUpdateTaxForm = true;
      this.showAddTaxForm = false;
      this.oldTax = angular.copy(data);
      this.updateTax = angular.copy(data);
      this.updateTax.tax = Number(this.updateTax.tax);
    }
  }

  closeForm(formName) {
    this.region_details.zipcode = null;
    formName === "addForm"
      ? (this.showAddTaxForm = false)
      : (this.showUpdateTaxForm = false);
  }

  ///Save new tax for region
  save(taxData) {
    this.isProccessing = true;
    this.saveBtnText = "Saving...";
    this.TaxService.API.InsertNewTax(taxData)
      .then(response => {
        this.message = response.data.message;
        if (taxData.code === "delivery_location") {
          //get list of tax by zipcode
          this.serachTaxDetails({
            id: undefined,
            zipcode: taxData.zipcode
          });
        } else if (taxData.code === "selling_location") {
          this.selectRegion(this.region_details);
        }
        this.isProccessing = false;
        this.saveBtnText = "Save";
        this.openForm("create");
        this.newTax.tax = null;
        this.newTax.zipcode = null;
        this.$timeout(() => {
          this.message = null;
          this.newTax.location_id = undefined;
        }, 2500);
      })
      .catch(error => {
        this.isProccessing = false;
        this.saveBtnText = "Save";
        this.errorMessage = error.data.error.message;
        this.logger.error(error);
        this.$timeout(() => {
          this.errorMessage = null;
        }, 2500);
      });
  }

  //check that update form previous data is not same as payload
  hasUpdateChanges() {
    if (
      JSON.stringify(this.updateTax.tax) !== this.oldTax.tax ||
      this.updateTax.county !== this.oldTax.county ||
      this.updateTax.is_primary !== this.oldTax.is_primary
    ) {
      return true;
    } else {
      return false;
    }
  }

  update(taxData) {
    if (this.hasUpdateChanges() === true) {
      this.isProccessing = true;
      this.updateBtnText = "Updating...";
      this.TaxService.API.UpdateTax(taxData)
        .then(response => {
          this.message = "Record updated successfully";
          this.showUpdateTaxForm = false;
          this.isProccessing = false;
          this.updateBtnText = "Update";
          this.old_region = {};
          if (taxData.code === "delivery_location") {
            //get list of tax by zipcode
            this.serachTaxDetails({
              id: undefined,
              zipcode: taxData.zipcode
            });
          }
          if (taxData.code === "selling_location") {
            this.sellingLocations[
              this.sellingLocations.findIndex(
                location => location.id === taxData.id
              )
            ] = taxData;
          }
          this.$timeout(() => {
            this.message = null;
          }, 2500);
        })
        .catch(error => {
          this.isProccessing = false;
          this.updateBtnText = "Update";
          this.errorMessage = error.data.error;
          this.logger.error(error);
          this.$timeout(() => {
            this.errorMessage = null;
          }, 2500);
        });
    } else {
      this.errorMessage = "Nothing to update";
      this.$timeout(() => {
        this.errorMessage = null;
      }, 2500);
    }
  }

  // Update tax to make it primary tax for zipcode
  makePrimaryTax(taxData) {
    if (!taxData.is_primary) {
      taxData.is_primary = 1;
      this.TaxService.API.UpdateTax(taxData)
        .then(response => {
          //this.message = "Tax updated successfully!";
          this.old_region = {};
          //get list of tax by zipcode
          this.serachTaxDetails({
            id: undefined,
            zipcode: taxData.zipcode
          });
        })
        .catch(error => {
          this.logger.error(error);
        });
      this.$timeout(() => {
        this.message = null;
      }, 2500);
    }
  }

  // Delete Tax
  deleteTax(id, code) {
    this.isProccessing = true;
    this.TaxService.API.DeleteTax(id, code)
      .then(response => {
        this.message = "Record deleted successfully";
        this.showUpdateTaxForm = false;
        this.old_region = {};
        if (code === "delivery_location") {
          this.taxDetails.taxList.splice(
            [this.taxDetails.taxList.findIndex(tax => tax.id === id)],
            1
          );
        }
        if (code === "selling_location") {
          this.sellingLocations.splice(
            [this.sellingLocations.findIndex(location => location.id === id)],
            1
          );
        }
        this.isProccessing = false;
        this.$timeout(() => {
          this.message = null;
        }, 2500);
      })
      .catch(error => {
        this.errorMessage = error.data.error.message;
        this.logger.error(error);
        this.isProccessing = false;
        this.$timeout(() => {
          this.errorMessage = null;
        }, 2500);
      });
  }

  ShowHideColumnSettings() {
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
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

angular.module("rc.prime.tax").controller("TaxController", TaxController);
