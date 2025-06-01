class UDDController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    valdr,
    StatusCodes,
    OrderAdvisorServices,
    CodeService,
    SKUService
  ) {
    //Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    this.$filter = common.$filter;
    this.$timeout = common.$timeout;

    this.valdr = valdr;
    this.StatusCodes = StatusCodes;
    this.OrderAdvisorService = OrderAdvisorServices.OrderAdvisor;
    this.CodeService = CodeService;
    this.SKUService = SKUService;
    this.logger = this.common.Logger.getInstance("UDDController");

    //Unique Identification number for attribute header entity, set in entity table
    this.uuid = "122";

    //Set default value for table sort type, page and page size for paginate table
    this.currentPage = 1;
    this.pageSize = 100;
    this.sortType = "sequence";
    this.oldTypeUdd = {}; // Initialize old type UDD object to empty object
    this.uddOptionChoiceId=[];

    this.saveBtnText = "Save";
    this.updateBtnText = "Update";

    //When the variables are called, it has its this keyword set to the provided value
    this.$scope.loadHistory = this.FetchHistory.bind(this);
    this.$scope.closeShowHistory = this.CloseHistoryPanel.bind(this);
    this.Activate();
  }

  //Activation method to initialize order advisor type controller
  Activate() {
    //Fetch all order advisor types
    this.FetchOrderAdvisorTypesUDDs();
    //Set show/hide column values to true or false
    this.setGridProperties();
    //Fetch the view/create/update/delete permission by user
    this.$scope.getAccessPermissions(this.uuid);
  }

  //Fetch all the order advisor types
  FetchOrderAdvisorTypesUDDs(refresh) {
    this.isLoaded = false;
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }
    this.$scope.selectedIDs = this.$stateParams.advisor_type_id.split(",");

    this.OrderAdvisorService.TypeUDD.FetchUDDsForType(this.$scope.selectedIDs)
      .then(response => {
        this.isViewAuthorized = true;
        let time_taken = response.data.time_taken;
        response.data = this.$filter("orderBy")(response.data, [
          "short_description",
          "display_sequence"
        ]);
        this.rowsCount = response.data.length;
        this.UddData = response.data;
        this.UddData.map(data => {
          data["adviser_type_description"] = data.adviser_type.description;
        });
        //Get data from map, based on selected type udd id and current state
        if (
          this.$stateParams.id &&
          this.$state.current.name.includes(".update")
        ) {
          //Find the attribute by index and set it with updated value
          let index = this.UddData.findIndex(
            typeudd => typeudd.id === parseInt(this.$stateParams.id)
          );
          this.TypeUDD = this.UddData[index];
          //Add validation rules for Type UDD module
          this.oldTypeUdd = {};
          // If we are in update screen then capture the current data to oldTypeUdd object
          if (this.TypeUDD) {
            this.oldTypeUdd[
              "maintenance_description"
            ] = this.TypeUDD.maintenance_description;
            this.oldTypeUdd["sequence"] = this.TypeUDD.sequence;
            this.oldTypeUdd["required"] = this.TypeUDD.required;
            this.oldTypeUdd[
              "allow_multiple_choices"
            ] = this.TypeUDD.allow_multiple_choices;
            this.oldTypeUdd["minimum_quantity"] = this.TypeUDD.minimum_quantity;
            this.oldTypeUdd["maximum_quantity"] = this.TypeUDD.maximum_quantity;
          }
        }
        this.$scope.selectedIDs.length > 1 || this.rowsCount <= 1;
        this.enableGoToAllTypeUDD = false;
        this.selectedDescription = this.UddData.map(e => e["advisor_type_id"])
          .map((e, i, final) => final.indexOf(e) === i && i)
          .filter(e => this.UddData[e])
          .map(e => this.UddData[e]);
        if (refresh !== undefined) {
          this.refreshTableText = "Table is refreshing...";
          this.totalRecords = response.data.length;
          this.totalRecordsText = "record(s) loaded in approximately";
          this.totalTimeText =
            "<strong>" +
            time_taken +
            "</strong><span class='f-14 c-gray'> seconds</span>";
          this.refreshTableText = "Successfully refreshed";
          this.$timeout(() => {
            this.isRefreshTable = false;
          }, 3500);
        }
        this.isLoaded = true;
        this.UpdateTableInformation(1);
        return response.data;
      })
      .catch(error => {
        this.isLoaded = true;
        if (error.status === 403) {
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

  //Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.uddGrid = {
      columns: {
        select: {
          visible: false
        },
        id: {
          visible: false
        },
        type: {
          visible: false
        },
        description: {
          visible: true
        },
        sequence: {
          visible: true
        },
        required: {
          visible: true
        },
        quantity: {
          visible: true
        },
        allow_multiple_choices: {
          visible: true
        }
      }
    };
    this.countVisibleColumns();
  }

  // this is to count the number of visible columns so that the col span can be given for min and max columns in table
  countVisibleColumns() {
    this.visibleColumns = 0;
    for (let key in this.uddGrid.columns) {
      if (this.uddGrid.columns[key].visible) {
        this.visibleColumns += 1;
      }
    }
  }

  LoadCodeListData(uuid, fieldName, model) {
    this.CodeService.API.MultiSearchCodeList({
      uuid: uuid,
      field_name: fieldName
    })
      .then(response => {
        this.$scope[model] = response;
        this[model] = response;
      })
      .catch(error => {
        logger.error(error);
      });
  }

  // Get available statuses for UDD service
  FetchStatuses() {
    this.OrderAdvisorService.Status.FetchAll()
      .then(response => {
        this.Statuses = response.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  //Load all the available statuses from the localmemory
  LoadStatus() {
    this.Status = JSON.parse(
      this.common.LocalMemory.API.Get(this.uuid + "_statuses")
    );
  }

  //Re-Load attributes on click refresh button
  RefreshData(refresh) {
    this.setGridProperties();
    if (!this.appliedFilterCount) {
      this.FetchOrderAdvisorTypesUDDs(refresh);
    } else if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
      this.common.$timeout(() => {
        this.isRefreshTable = false;
        this.refreshTableText = "";
      }, 2500);
    }
  }

  //Function to transit the state to create new attribute
  OpenPanelNewAdvisorTypeUDD() {
    //Set message, error and attribute variables to null initially
    this.message = null;
    this.isSaveSuccess = false;
    this.error = null;
    this.ValidationError = null;
    this.isShowAdd = true;
    this.TypeUDD = {};
    this.AddValidationRules();
    // this.TypeUDD.status_id = 200;
    // this.TypeUDD.status = "Active";
    this.common.$state.go("common.prime.orderadvisortypeudd.new");
    //Set the focus to description field on timeout
    this.common.$timeout(() => {
      angular.element("#maintenance_description").focus();
    }, 0);
  }

  //Function to transit the state to update attribute by id
  OpenPanelUpdateAdvisorType(typeudd) {
    //Set message, error and history variables to null initially
    this.oldTypeUdd["maintenance_description"] =
      typeudd.maintenance_description;
    this.oldTypeUdd["sequence"] = typeudd.sequence;
    this.oldTypeUdd["required"] = typeudd.required;
    this.oldTypeUdd["allow_multiple_choices"] = typeudd.allow_multiple_choices;
    this.oldTypeUdd["minimum_quantity"] = typeudd.minimum_quantity;
    this.oldTypeUdd["maximum_quantity"] = typeudd.maximum_quantity;
    this.selectedUdd = typeudd;
    this.$scope.showhistory = false;
    this.isShowAdd = false;
    this.isShowHistory = true;
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    this.showConfigureUdd = false;
    this.message = null;
    this.error = null;
    this.updateBtnText = "Update";
    this.AddValidationRules();
    this.common.$state.go("common.prime.orderadvisortypeudd.update", {
      id: typeudd.id
    });
  }

  InitializeUpdateForm() {
    this.OrderAdvisorService.TypeUDD.FetchUddsByID(this.$stateParams.id).then(
      typeudd => {
        this.TypeUDD = _.clone(typeudd.data[0]);
        this.TypeUDD[
          "adviser_type_description"
        ] = this.TypeUDD.adviser_type.description;
        //Set the focus to description field on timeout
        this.common.$timeout(() => {
          angular.element("#description").focus();
        }, 0);
      }
    );
  }

  //How or hide column set flag
  ShowHideColumnSettings() {
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  //Request to create new order advisor type
  CreateAdvisorTypeUDD() {
    this.$scope.selectedIDs = this.$stateParams.advisor_type_id.split(",");
    //Set is processing flag to true till request is completed
    this.isProcessing = true;
    for (let i = 0; i < this.$scope.selectedIDs.length; i++) {
      //Set TypeUDD payload to create new TypeUDD
      this.isProcessing = true;
      let AdvisorTypeUDDPayLoad = {
        advisor_type_id: parseInt(this.$scope.selectedIDs[i]),
        maintenance_description: this.TypeUDD.maintenance_description,
        sequence: this.TypeUDD.sequence,
        required: this.TypeUDD.required,
        allow_multiple_choices: this.TypeUDD.allow_multiple_choices,
        minimum_quantity: this.TypeUDD.minimum_quantities,
        maximum_quantity: this.TypeUDD.maximum_quantities
      };
      this.OrderAdvisorService.TypeUDD.Create(AdvisorTypeUDDPayLoad)
        .then(response => {
          //Inserted record is added to existing attributes to show
          if (i === this.$scope.selectedIDs.length - 1) {
            this.oldAdvisorTypeValue = response.data;
            this.FetchOrderAdvisorTypesUDDs();
            //Is processing flag is set to false
            this.isProcessing = false;
            this.rowsCount += 1;
            this.isSaveSuccess = true;
            this.UpdateTableInformation(this.currentPage);
            //Set pristine and set form as untounched
            // this.type_form.$setPristine();
            // this.type_form.$setUntouched();
            this.TypeUDD = {};
          }
        })
        .catch(exception => {
          if (i === this.$scope.selectedIDs.length - 1) {
            this.isProcessing = false;
            this.saveBtnError = true;
            this.saveBtnText = "Oops something went wrong.";
            this.FetchOrderAdvisorTypesUDDs();
            !exception.data.message.includes("Deadlock")
              ? (this.error = exception.data.message)
              : (this.error = null);
          }
        });
    }
    this.common.$timeout(() => {
      this.message = null;
      this.error = null;
      this.saveBtnError = false;
      this.saveBtnText = "Save";
    }, 3000);
  }

  // function to open new form after click on Create Another button
  createAnotherForm() {
    this.TypeUDD = {};
    this.error = null;
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    //Set the focus to maintenance_description field on timeout
    this.common.$timeout(() => {
      angular.element("#maintenance_description").focus();
    }, 0);
  }

  ArrangeSequenceAfterUpdate(uddData, payload, newSequence, oldSequence) {
    for (let index = 0; index < uddData.length; index++) {
      if (uddData[index].adviser_type_id == payload.adviser_type_id) {
        if (
          uddData[index].id != payload.id &&
          ((uddData[index].sequence <= newSequence &&
            uddData[index].sequence >= oldSequence) ||
            (uddData[index].sequence <= oldSequence &&
              uddData[index].sequence >= newSequence))
        ) {
          if (oldSequence <= newSequence) {
            uddData[index].sequence = Number(uddData[index].sequence) - 1;
          } else {
            uddData[index].sequence = Number(uddData[index].sequence) + 1;
          }
        }
      }
    }
  }

  //Request to update selected attribute
  UpdateAdvisorTypeUDD() {
    //Set is processing flag to true till request is completed
    this.isProcessing = true;
    //Update request with updated attribute payload
    this.updateBtnText = "Updating Now...";
    this.isBtnEnable = false;
    let AdvisorTypeUDDPayLoad = {
      id: this.TypeUDD.id,
      advisor_type_id: this.TypeUDD.adviser_type_id,
      maintenance_description: this.TypeUDD.maintenance_description,
      sequence: this.TypeUDD.sequence,
      required: this.TypeUDD.required,
      allow_multiple_choices: this.TypeUDD.allow_multiple_choices,
      minimum_quantity: this.TypeUDD.minimum_quantity,
      maximum_quantity: this.TypeUDD.maximum_quantity
    };

    this.uddOptionChoiceId = [];
    this.UddData.forEach(option=>{
      if((this.TypeUDD.id != option.id) && (this.TypeUDD.adviser_type_id == option.adviser_type_id) ){
        this.SKUService.API.FetchSkuOrderAdvisorTypeIdAndUddId(option.adviser_type_id,option.id).then(res=>{
          res.data.forEach(element => {
            if(element.choice_id!="" && element.choice_id!=null){
              element.choice_id=element.choice_id.split(',').map(Number)
              this.uddOptionChoiceId = [...this.uddOptionChoiceId, ...element.choice_id];
            }
          });
        })
      }
    })
    if (this.hasUpdateChanges(this.TypeUDD)) {
      this.OrderAdvisorService.TypeUDD.Update(AdvisorTypeUDDPayLoad)
        .then(result => {
          this.FetchOrderAdvisorTypesUDDs();
          this.SKUService.API.FetchSkuOrderAdvisorTypeIdAndUddId(AdvisorTypeUDDPayLoad.advisor_type_id,AdvisorTypeUDDPayLoad.id).then(res=>{
            let wantToDeleteRetail=res.data
          
            let payload = {}
            if (AdvisorTypeUDDPayLoad.maximum_quantity > 1 || this.TypeUDD.allow_multiple_choices) {
              payload = {
                order_advisor_udd_id: this.TypeUDD.id,
                order_adviser_type_id: this.TypeUDD.adviser_type_id,
                update_choice: true
              }
              wantToDeleteRetail.forEach(element => {
                if(element.choice_id!="" && element.choice_id!=null){
                element.choice_id=element.choice_id.split(',').map(Number);
                
                  element.choice_id.forEach(ele=>{
                    if(this.uddOptionChoiceId.includes(ele)){
                      console.log("found1")
                    }else{
                    this.SKUService.API.DeleteOrderAdvisorPackageRetail(element.sku_id,element.order_advisor_id,ele)
                    }
                  })
                }
              });
            }
            else {
              if (AdvisorTypeUDDPayLoad.maximum_quantity == 1 || !this.TypeUDD.allow_multiple_choices) {
                payload = {
                  order_advisor_udd_id: this.TypeUDD.id,
                  order_adviser_type_id: this.TypeUDD.adviser_type_id,
                  update_quantity: true
                }
              }
            }
            this.OrderAdvisorService.Packages.UpdatePackagesForSingleAndMaxQuantity(payload.order_adviser_type_id, payload).then((res) => { }).catch(error => {
              console.log(error)
            });
            this.isBtnEnable = true;
            this.updateBtnText = "Done";
            this.isUpdateSuccess = true;
            this.isShowHistory = false;
            //Set is processing flag to false
            this.isProcessing = false;
            this.$scope.showhistory = false;
          })
        })
        .catch(error => {
          this.updateBtnError = true;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.isBtnEnable = false;
          this.isProcessing = false;
          this.error = error.data.message;
        });
      this.common.$timeout(() => {
        this.updateBtnError = false;
        this.isBtnEnable = true;
        this.updateBtnText = "Update";
        this.message = null;
        this.error = null;
      }, 3000);
    } else {
      this.isBtnEnable = false;
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        this.isBtnEnable = true;
      }, 1000);
    }
  }

  hasUpdateChanges(object) {
    if (
      object.maintenance_description ===
      this.oldTypeUdd.maintenance_description &&
      object.sequence === this.oldTypeUdd.sequence &&
      object.required === this.oldTypeUdd.required &&
      object.allow_multiple_choices ===
      this.oldTypeUdd.allow_multiple_choices &&
      object.minimum_quantity === this.oldTypeUdd.minimum_quantity &&
      object.maximum_quantity === this.oldTypeUdd.maximum_quantity
    ) {
      this.hasUpdateChange = false;
    } else {
      this.hasUpdateChange = true;
    }
    return this.hasUpdateChange;
  }

  //Request to delete selected attribute
  RemoveAdvisorTypeUDD(isDeleteConfirm) {
    if (this.TypeUDD?.id) {
      this.isProcessing = true;
      isDeleteConfirm === undefined ? (isDeleteConfirm = false) : null;
      this.SKUService.API.FetchSkuOrderAdvisorTypeIdAndUddId(this.TypeUDD.adviser_type_id,this.TypeUDD.id).then(res=>{
        let wantToDeleteRetail=res.data
        this.OrderAdvisorService.TypeUDD.Delete(this.TypeUDD.id, isDeleteConfirm)
          .then(result => {
            this.isProcessing = false;
            //Delete the object from attributes array after deletion
            this.isDeleteSuccess = true;
            this.isConfirmDelete = false;
            this.isDependent = false;
            wantToDeleteRetail.forEach(element => {
              if(element.choice_id!="" && element.choice_id!=null){
              element.choice_id=element.choice_id.split(',').map(Number);
              
                element.choice_id.forEach(ele=>{
                  if(this.uddOptionChoiceId.includes(ele)){
                    console.log("found1")
                  }else{
                    this.SKUService.API.DeleteOrderAdvisorPackageRetail(element.sku_id,element.order_advisor_id,ele)
                  }
                })
              }
            });
            this.rowsCount -= 1;
            this.TypeUDD.order_advisor_udd_id = this.TypeUDD.id;
            this.SKUService.API.DeleteaddedDiscountsUDD(this.TypeUDD).then(response => { })
            this.FetchOrderAdvisorTypesUDDs();
            this.UpdateTableInformation(this.currentPage);
          })
          .catch(error => {
            this.isProcessing = false;
            if (error.status === 403) {
              this.isUnauthorized = true;
            } else {
              this.isDependent = true;
              this.error = error.data.error;
            }
          });
      })
      this.common.$timeout(() => {
        this.message = null;
        this.error = null;
      }, 3500);
    }
  }

  //on click of delete button in update form, delete confirmation panel should be shown
  ShowDeleteConfirmPanel() {
    this.uddOptionChoiceId = [];
    this.UddData.forEach(option=>{
      if((this.TypeUDD.id != option.id) && (this.TypeUDD.adviser_type_id == option.adviser_type_id) ){
        this.SKUService.API.FetchSkuOrderAdvisorTypeIdAndUddId(option.adviser_type_id,option.id).then(res=>{
          res.data.forEach(element => {
            if(element.choice_id!="" && element.choice_id!=null){
              element.choice_id=element.choice_id.split(',').map(Number)
              this.uddOptionChoiceId = [...this.uddOptionChoiceId, ...element.choice_id];
            }
          });
        })
      }
      // }else{
      //   this.SKUService.API.FetchSkuOrderAdvisorTypeIdAndUddId(this.TypeUDD.adviser_type_id,this.TypeUDD.id).then(res=>{
      //     res.data.forEach(element => {
      //       if(element.choice_id!="" && element.choice_id!=null){
      //         element.choice_id=element.choice_id.split(',').map(Number)
      //         this.presentChoiceId = [...this.presentChoiceId, ...element.choice_id];
      //       }
      //     });
      //   })
      // }
    })
  this.isConfirmDelete = true;
  this.isShowHistory = false;
  this.isUnauthorized = false;
  this.$scope.showhistory = false;

}

  //Close form and success/error messages in the form
  CloseUpdateForm() {
    this.$state.go("common.prime.orderadvisortypeudd");
    this.message = null;
    this.common.$timeout(() => {
      this.isUnauthorized = false;
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
    }, 500);
  }

  //Go to view attributes page
  Exit() {
    this.TypeUDD = null;
    this.isDeleteSuccess = false;
    this.isUpdateSuccess = false;
    this.isSaveSuccess = false;
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    this.isDependent = false;
    this.common.$state.go("common.prime.orderadvisortypeudd");
    this.isUnauthorized = false;
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
        this.$scope.showhistory = true;
        this.$scope.showhistoryloading = false;
      })
      .catch(error => {
        logger.error(error);
      });
  }

  //Function to close the history panel
  CloseHistoryPanel() {
    this.common.$timeout(function () {
      angular.element("#maintenance_description").focus();
    }, 0);
    this.$scope.showhistory = false;
    this.$scope.showhistoryloading = false;
  }

  //Set validation rules for different format selected
  AddValidationRules() {
    let obj = {};
    let getConstraint = this.valdr.getConstraints()["RULES-55"];
    getConstraint === undefined ? (getConstraint = {}) : null;
    getConstraint["maintenance_description"] = {
      string: {
        message: `Description must be a string between 3 and 500 characters.`
      },
      minLength: {
        number: 3,
        message: `Description must be a string between 3 and 500 characters.`
      },
      maxLength: {
        number: 500,
        message: `Description must be a string between 3 and 500 characters.`
      }
    };
    // getConstraint["minimum_quantity"] = {
    //   integer: {
    //     message: `Minimum quantity must be an integer.`
    //   },
    //   min: {
    //     value: 1,
    //     message: `Minimum quantity must be an integer between 1 to 10.`
    //   },
    //   max: {
    //     value: 10,
    //     message: `Minimum quantity must be an integer between 1 to 10.`
    //   }
    // };
    // getConstraint["maximum_quantity"] = {
    //   integer: {
    //     message: `Maximum quantity must be an integer.`
    //   },
    //   min: {
    //     value: 1,
    //     message: `Maximum quantity must be an integer between 1 to 10.`
    //   },
    //   max: {
    //     value: 10,
    //     message: `Maximum quantity must be an integer between 1 to 10.`
    //   }
    // };
    let displaySequencemax = this.selectedUdd ? this.UddData.filter(x => x.adviser_type_id == this.selectedUdd.adviser_type_id).length : this.UddData.length;
    getConstraint["display_sequence"] = {
      integer: {
        message: `Display Sequence must be an integer.`
      },
      min: {
        value: 1,
        message: `Display Sequence must be an integer between 1 to ${displaySequencemax}.`
      },
      max: {
        value: displaySequencemax,
        message: `Display Sequence must be an integer between 1 to ${displaySequencemax}.`
      }
    };
    obj["RULES-55"] = getConstraint;
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

  focusSearchField() {
    angular.element("#inlineUddSearch").focus();
  }
}

angular
  .module("rc.prime.orderadvisor.type")
  .controller("UDDController", UDDController);
