class TypeController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    valdr,
    StatusCodes,
    OrderAdvisorServices,
    HierarchyValueService
  ) {
    //Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    this.valdr = valdr;
    this.StatusCodes = StatusCodes;
    this.OrderAdvisorService = OrderAdvisorServices.OrderAdvisor;
    this.HierarchyValueService = HierarchyValueService;

    this.logger = this.common.Logger.getInstance("TypeController");

    //Unique Identification number for attribute header entity, set in entity table
    this.uuid = "121";

    //Set default value for table sort type, page and page size for paginate table
    this.currentPage = 1;
    this.pageSize = 100;
    this.sortType = "description";

    this.saveBtnText = "Save";

    //When the variables are called, it has its this keyword set to the provided value
    this.$scope.loadHistory = this.FetchHistory.bind(this);
    this.$scope.closeShowHistory = this.CloseHistoryPanel.bind(this);
    this.Activate();
  }

  //Activation method to initialize order advisor type controller
  Activate() {
    //Fetch the view/create/update/delete permission by user
    this.$scope.getAccessPermissions(this.uuid);
    //Set show/hide column values to true or false
    this.setGridProperties();
    //Fetch statuses
    this.FetchStatuses();
    this.getBuyerHierarchyValues();
    //set Validation rules
    this.AddValidationRules();
    //Fetch all order advisor types
    this.common.$timeout(() => {
      this.FetchOrderAdvisorTypes();
    }, 1000);
  }

  //Fetch all the order advisor types
  FetchOrderAdvisorTypes(refresh) {
    this.isLoaded = false;
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }
    this.checkAll = false; // all checkbox reset after click on "Refresh" button.
    this.OrderAdvisorService.Type.FetchAll()
      .then(response => {
        this.isDisabled = false; // On click of "Refresh" button, make the "Maintain UDD" button disabled.
        this.OrderAdvisorTypes = response.data;
        //Get data from map, based on selected type udd id and current state
        if (
          this.$stateParams.id &&
          this.$state.current.name.includes(".update")
        ) {
          this.updateBtnText = "Update";
          this.isShowHistory = true;
          //Find the attribute by index and set it with updated value
          let index = this.OrderAdvisorTypes.findIndex(
            typeudd => typeudd.id === parseInt(this.$stateParams.id)
          );
          this.Type = this.OrderAdvisorTypes[index];
        }
        this.rowsCount = response.data.length;
        this.isLoaded = true;
        let time_taken = response.data.time_taken;
        //Get the from and to attribute count loaded for the selected page
        this.UpdateTableInformation(1);
        //Check if view permission for attributes is true or false and set the flag value accordingly
        this.OrderAdvisorTypes.status === 404
          ? (this.isViewAuthorized = false)
          : (this.isViewAuthorized = true);
        if (refresh !== undefined) {
          this.totalRecords = response.data.length;
          this.totalRecordsText = "record(s) loaded in approximately";
          this.totalTimeText =
            "<strong>" +
            time_taken +
            "</strong><span class='f-14 c-gray'> seconds</span>";
          this.refreshTableText = "Successfully refreshed";
          this.common.$timeout(() => {
            this.isRefreshTable = false;
          }, 3500);
          this.focusSearchField();
        }
      })
      .catch(error => {
        //If fetch attributes fail, return a fail message
        this.isRefreshTable = true;
        this.refreshTableText = "Unsuccessfull!";
        this.common.$timeout(() => {
          this.isRefreshTable = false;
        }, 2500);
        this.isLoaded = false;
        this.logger.error(error);
      });
  }

  //Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.orderTypeGrid = {
      columns: {
        select: {
          visible: true
        },
        id: {
          visible: false
        },
        status: {
          visible: true
        },
        addSKUAutomatically: {
          visible: true
        },
        noPackage: {
          visible: true
        },
        buyer: {
          visible: true
        },
        view: {
          visible: true
        }
      }
    };
  }

  // Get available statuses for UDD service
  FetchStatuses() {
    this.OrderAdvisorService.Status.FetchAll()
      .then(response => {
        this.Statuses = response.data;
        this.statusMap = new Map();
        //Create map of avaiable statuses by status code
        this.Statuses.forEach(status => {
          this.statusMap[status.code] = status;
        });
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  onSelectedBuyer(buyer){
    this.Type.buyer = buyer.short_description;
  }

  resetBuyer(){
    this.Type.buyer = "";
  }

  //get buyer hierarchy values
  getBuyerHierarchyValues() {
    this.HierarchyValueService.API.SearchHierarchyValue("is_buyer_hierarchy", "1")
      .then(res => {
        this.buyerValues = res;
        this.buyer_hierarchy_id = res[0].hierarchy_id;
        this.buyer_hierarchy_desc = res[0].hierarchy;
      })
      .catch(err => { });
  };

  //Re-Load attributes on click refresh button
  RefreshData(refresh) {
    this.setGridProperties();
    this.FetchOrderAdvisorTypes(refresh);
    if (refresh !== undefined) {
      // this.totalRecords = "";
      // this.totalTimeText = "";
      // this.isRefreshTable = true;
      // this.refreshTableText = "Table is refreshing...";
      this.common.$timeout(() => {
        this.isRefreshTable = false;
        this.refreshTableText = "";
      }, 3500);
    }
  }

  //Function to transit the state to create new attribute
  OpenPanelNewAdvisorType() {
    //Set message, error and attribute variables to null initially
    this.message = null;
    this.isSaveSuccess = false;
    this.error = null;
    this.ValidationError = null;
    this.isShowAdd = true;
    this.common.$state.go("common.prime.orderadvisortype.new");
    // this.getBuyerHierarchyValues();
  }

  InitializeCreateForm() {
    this.Type = {};
    this.Type.status_id = 200;
    this.Type.status = "Active";
    //Initialize success form to false on load of create
    this.isSaveSuccess = false;
    //Set the focus to description field on timeout
    this.common.$timeout(() => {
      angular.element("#description").focus();
    }, 0);
    // If the user closes the create form then remove is checked for all the types
    _.each(this.OrderAdvisorTypes, type => {
      type.check = false;
    });
  }

  //Function to transit the state to update attribute by id
  OpenPanelUpdateAdvisorType(type) {
    //Set message, error and history variables to null initially
    this.$scope.showhistory = false;
    this.isShowAdd = false;
    this.isShowHistory = true;
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    this.showConfigureUdd = false;
    this.message = null;
    this.error = null;
    this.updateBtnText = "Update";
    // If user double clicks on a row while the side panel is in success state then make it false
    this.isDeleteSuccess = false;
    this.isUpdateSuccess = false;
    this.isSaveSuccess = false;
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    this.common.$state.go("common.prime.orderadvisortype.update", {
      id: type.id
    });
  }

  InitializeUpdateForm() {
    this.OrderAdvisorService.Type.FetchTypeByID(this.$stateParams.id).then(
      type => {
        this.OldType = _.clone(type.data);
        this.Type = _.clone(type.data);
        //Set the focus to description field on timeout
        this.common.$timeout(() => {
          angular.element("#description").focus();
        }, 0);
      }
    );
  }

  //Function to transit the state to delete the selected attribute
  PanelDeleteAttribute(id) {
    this.message = null;
    this.error = null;
    //Variable to show confirm delete panel
    this.isConfirmDelete = true;
    this.isDeleteConfirmation = false;
    this.isShowHistory = false;
  }

  //How or hide column set flag
  ShowHideColumnSettings() {
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  //Request to create new order advisor type
  CreateAdvisorType() {
    //Set is processing flag to true till request is completed
    this.isProcessing = true;
    //Set Attribute payload to create new Attribute
    let AdvisorTypePayLoad = {
      status_id: this.Type.status_id,
      description: this.Type.description,
      buyer: this.Type.buyer,
      add_sku_automatically: parseInt(this.Type.add_sku_automatically),
      no_package: parseInt(this.Type.no_package),
    };
    this.OrderAdvisorService.Type.Create(AdvisorTypePayLoad)
      .then(response => {
        this.oldAdvisorTypeValue = response.data;
        // Make the check as true once we create if the user wants to configure right after creating a order advisor
        response.data.check = true;
        //Inserted record is added to existing attributes to show
        //Is processing flag is set to false
        this.rowsCount += 1;
        this.isSaveSuccess = true;
        this.OrderAdvisorTypes.push(response.data);
        this.isProcessing = false;
        this.UpdateTableInformation(this.currentPage);
      })
      .catch(exception => {
        this.saveBtnText = "Oops something went wrong.";
        this.saveBtnError = true;
        this.isProcessing = false;
        this.error = exception.data.message;
      });
    this.common.$timeout(() => {
      this.message = null;
      this.error = null;
      this.saveBtnError = false;
      this.saveBtnText = "Save";
    }, 3000);
  }

  //Request to update selected attribute
  UpdateAdvisorType() {
    if (this.HasUpdateChanges()) {
      //Set is processing flag to true till request is completed
      this.isProcessing = true;
      //Update request with updated attribute payload
      this.updateBtnText = "Updating Now...";
      this.isBtnEnable = false;
      this.Type.status = this.statusMap[this.Type.status_id].description;
      // if (this.hasUpdateChanges(this.Attribute)) {
      this.OrderAdvisorService.Type.Update(this.Type)
        .then(result => {
          //Find the attribute by index and set it with updated value
          let index = this.OrderAdvisorTypes.findIndex(
            value => value.id === this.Type.id
          );
          this.OrderAdvisorTypes[index] = this.Type;
          this.isBtnEnable = true;
          this.updateBtnText = "Done";
          this.isUpdateSuccess = true;
          //Set the old type data to null
          this.OldType = null;
          this.isDisabled = false; // on update after selecting an entity type, disable Maintain UDD button.
          this.SelectAllTypesForMaintainUDD(0); // Remove entity type selection when maintain udd button is disabled.
          this.isShowHistory = false;
          this.$scope.showhistory = false;
          //Set is processing flag to false
          this.isProcessing = false;
        })
        .catch(error => {
          this.updateBtnError = true;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.isBtnEnable = false;
          this.isProcessing = false;
          if (error.status === 403) {
            this.isUnauthorized = true;
          } else {
            this.error = error.data.message;
          }
        });
      this.common.$timeout(() => {
        this.updateBtnError = false;
        this.isBtnEnable = true;
        this.updateBtnText = "Update";
        this.message = null;
        this.error = null;
      }, 3000);
    } else {
      this.isBtnEnable = true;
      this.updateBtnError = true;
      this.updateBtnText = "Nothing To Update";
      this.common.$timeout(() => {
        this.updateBtnError = false;
        this.isBtnEnable = true;
        this.updateBtnText = "Update";
      }, 3000);
    }
  }

  //Function to check if the type has any updated data
  HasUpdateChanges() {
    let isTypeChanged = false;
    let OmitKeys = ["id", "status"];
    for (let key in this.Type) {
      if (this.OldType[key] !== this.Type[key] && !OmitKeys.includes(key)) {
        return (isTypeChanged = true);
      }
    }
    return isTypeChanged;
  }

  //Request to delete selected attribute
  RemoveAdvisorType() {
    let id = this.$stateParams.id;
    this.isProcessing = true;
    this.OrderAdvisorService.Type.Delete(id)
      .then(result => {
        this.isProcessing = false;
        //Delete the object from attributes array after deletion
        this.OrderAdvisorTypes = this.OrderAdvisorTypes.filter(Type => {
          if (Type.id !== parseInt(id)) {
            return Type;
          }
        });
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        this.RefreshData();
        this.rowsCount -= 1;
        this.UpdateTableInformation(this.currentPage);
      })
      .catch(error => {
        this.isProcessing = false;
        if (error.status === 403) {
          this.isUnauthorized = true;
        } else {
          this.error = error.data.message;
        }
      });
    this.common.$timeout(() => {
      this.message = null;
      this.error = null;
    }, 3500);
  }

  //Go to view order advisors view page
  Exit() {
    this.Type = null;
    this.isDeleteSuccess = false;
    this.isUpdateSuccess = false;
    this.isSaveSuccess = false;
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    this.common.$state.go("common.prime.orderadvisortype");
    this.isUnauthorized = false;
    if (!this.$state.current.name.includes(".update")) {
      // If the user closes the create form then remove is checked for all the types
      _.each(this.OrderAdvisorTypes, type => {
        type.check = false;
      });
    }
  }

  //on click of delete button in update form, delete confirmation panel should be shown
  ShowDeleteConfirmPanel() {
    this.isConfirmDelete = true;
    this.isShowHistory = false;
    this.isUnauthorized = false;
    this.$scope.showhistory = false;
  }

  //Close form and success/error messages in the form
  CloseUpdateForm() {
    this.$state.go("common.prime.orderadvisortype");
    this.message = null;
    this.common.$timeout(() => {
      this.isUnauthorized = false;
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
    }, 500);
  }

  ViewMaintaineUDDButton() {
    _.some(this.OrderAdvisorTypes, (type, i) => {
      if (type.check) {
        this.enableGoToAllTypeUDD = true;
        this.isDisabled = true;
        return true;
      } else {
        this.isDisabled = false;
      }
    });
  }

  SelectAllTypesForMaintainUDD(flag) {
    _.each(this.OrderAdvisorTypes, type => {
      type.check = flag;
    });
    this.ViewMaintaineUDDButton();
  }

  //View UDDs for selected order advisor types
  ViewTypeUDDs() {
    let typeIds = [];
    _.each(this.OrderAdvisorTypes, type => {
      if (type.check) {
        typeIds.push(type.id);
      }
    });
    this.$state.go("common.prime.orderadvisortypeudd", {
      advisor_type_id: typeIds.join(",")
    });
  }

  //View UDDs for selected order advisor types
  ViewTypeUDD(typeId) {
    this.$state.go("common.prime.orderadvisortypeudd", {
      advisor_type_id: typeId
    });
  }

  //Get changes made to a record - previous and updated values
  FetchHistory() {
    // Loading history until get the response
    this.$scope.showhistoryloading = true;
    this.common.EntityDetails.API.GetHistoryData(
      this.uuid,
      this.$stateParams.id
    )
      .then(response => {
        this.$scope.historyList = response;
        this.$scope.historyList.map(x => {
          if (x.field == "NoPackage") x.field = 'Display No Package on Product Explorer';
          if(x.field == "AddSkuAutomatically") x.field = 'Add Sku Automatically'
          return x;
        })
        this.$scope.showhistory = true;
        this.$scope.showhistoryloading = false;
      })
      .catch(() => { });
  }

  //Function to close the history panel
  CloseHistoryPanel() {
    this.common.$timeout(function () {
      angular.element("#description").focus();
    }, 0);
    this.$scope.showhistory = false;
    this.$scope.showhistoryloading = false;
  }

  //Check selected/all types to view UDDs
  EnableOrDisableCheckboxes(flag) {
    _.each(this.OrderAdvisorTypes, orderadvisor => {
      orderadvisor.check = flag;
    });
    //Funciton to show maintain UDDs button
    this.ViewMaintaineUDDButton();
  }

  //Set validation rules for different format selected
  AddValidationRules() {
    let obj = {};
    let getConstraint = this.valdr.getConstraints()["RULES-7"];
    getConstraint === undefined ? (getConstraint = {}) : null;
    let msg = `Description must be a string between 3 and 500 characters.`;
    getConstraint["description"] = {
      string: {
        message: msg
      },
      minLength: {
        number: 3,
        message: msg
      },
      maxLength: {
        number: 500,
        message: msg
      }
    };
    obj["RULES-7"] = getConstraint;
    this.valdr.addConstraints(obj);
  }

  // show table information like no. of records with or without search filter.
  UpdateTableInformation(currentPage) {
    let initalCount;
    if (this.rowsCount === 0) {
      initalCount = 0;
    } else {
      initalCount = 1;
    }
    if (currentPage === 1) {
      this.rowsInfo =
        "Displaying " +
        initalCount +
        "-" +
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
        " - " +
        (end < this.rowsCount ? end : this.rowsCount) +
        " Of " +
        this.rowsCount +
        " Records";
    }
  }

  //Function to view the packages available for a type
  GoToPackages(typeId) {
    this.common.$state.go("common.prime.orderadvisortypepackages", {
      type_id: typeId
    });
  }

  focusSearchField() {
    this.common.$timeout(() => {
      angular.element("#inlineSearch").focus();
    }, 1000)
  }
}

angular
  .module("rc.prime.orderadvisor.type")
  .controller("TypeController", TypeController);
