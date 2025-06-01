class AttributeValueController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    AttributeFactory,
    AttributeValueFactory,
    AttributeValueService,
    ItemUDDValueService,
    LocationUDDService,
    VendorUDDService,
    MTOUDDService,
    EntityFactory,
    StatusCodes,
    valdr
  ) {
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.attributeId = this.$stateParams.attribute_id;
    this.common = common;
    this.statusCodes = StatusCodes;
    this.logger = this.common.Logger.getInstance("AttributeValueController");
    this.AttributeValueFactory = AttributeValueFactory;
    this.AttributeValueService = AttributeValueService;
    this.AttributeFactory = AttributeFactory;
    this.ItemUDDValueService = ItemUDDValueService;
    this.LocationUDDService = LocationUDDService;
    this.VendorUDDService = VendorUDDService;
    this.MTOUDDService = MTOUDDService;
    this.EntityFactory = EntityFactory;
    this.valdr = valdr;
    this.sortType = "display_sequence";
    this.uuid = 20;
    this.page = 1;
    this.pageSize = 100;
    this.isColumnSettingsVisible = false;
    this.isLoaded = false;
    this.isShowHistory = false;
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    this.isUpdateSuccess = false;
    this.updateBtnText = "Update";
    // Variable used to show move up down columns
    this.showmoveupdown = true;
    this.$scope.loadHistory = this.loadHistory.bind(this);
    this.$scope.closeShowHistory = this.closeShowHistory.bind(this);
    this.$scope.apiInstanceDisplayValues = this.AttributeValueService.API.UpdateAttributeValue;
    this.activate();
  }
  //Set attribute grid properties for show-hide attribute values columns
  setGridProperties() {
    this.attributeValuesGrid = {
      columns: {
        status: {
          visible: true
        },
        description: {
          visible: true
        },
        shortDescription: {
          visible: true
        },
        displaySequence: {
          visible: true
        },
        moveUpDown: {
          visible: true
        },
        datalake: {
          visible: true
        }
      }
    };
  }
  activate() {
    this.ViewAttributeValues();
    this.FetchAttribute();
    this.FetchStatus();
    this.getAttributeValueInformation();
    this.setGridProperties();
    this.GetModelAndSetValidationRules();
    this.getPermissionsForUuid("attributeValuePermissions", this.uuid);
    this.reloadMethodDisplayValues = this.ViewAttributeValues;
  }

  // Get permissions of crud operation for attribute value
  getPermissionsForUuid(model, uuid) {
    this.$scope
      .getAccessPermissions(uuid)
      .then(res => {
        this[model] = res;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  //get attribute entity information
  getAttributeValueInformation() {
    this.common.EntityDetails.API.GetEntityInformation(this.uuid).then(
      AttributeValueDetails => {
        this.AttributeValueInformation = AttributeValueDetails;
      }
    );
  }

  //Get the model and validation rules for attribute values create and update
  GetModelAndSetValidationRules() {
    this.common.EntityDetails.API.GetModelAndSetValidationRules(
      this.uuid
    ).then(model => {});
  }

  //get all statuses for attributes
  async FetchStatus() {
    try {
      let response = await this.AttributeValueFactory.FetchStatus(1);
      this.common.LocalMemory.API.Post("UddStatus", response.data);
      this.statusIdsMap = {};
      for (let i = 0; i < response.data.length; i++) {
        if (this.statusIdsMap[response.data[i].code] === undefined) {
          this.statusIdsMap[response.data[i].code] = response.data[i];
        }
      }
    } catch (exception) {
      console.log(exception);
    }
  }

  LoadStatus() {
    try {
      this.Status = JSON.parse(this.common.LocalMemory.API.Get("UddStatus"));
    } catch (exception) {
      console.log(exception);
    }
  }

  //function to toggle move up/down rows arrow column
  toggleColumn(flag) {
    this.showmoveupdown = flag;
  }

  // validation for sequence
  addSequenceValidation(typeId) {
    let obj = {};
    if (
      this.$scope.ValueCtrl.Value_form &&
      this.$scope.ValueCtrl.Value_form.display_sequence
    ) {
      this.$scope.ValueCtrl.Value_form.display_sequence.$setUntouched();
    }
    let getConstraint = this.valdr.getConstraints()["RULES-20"];
    let minimum = 1;
    let maximum = this.AttributeValues ? this.AttributeValues.length : 1;
    // check whether display sequence has value
    if (
      this.AttributeValue &&
      this.AttributeValue.display_sequence &&
      getConstraint
    ) {
      let msg = `Sequence must be an integer between ${minimum} and ${maximum}.`;
      getConstraint["display_sequence"] = {
        digits: {
          integer: 10,
          message: msg
        },
        min: {
          value: Number(minimum),
          message: msg
        },
        max: {
          value: Number(maximum),
          message: msg
        },
        required: {
          message: "Sequence is required !"
        }
      };
      obj["RULES-20"] = getConstraint;
    } else if (!typeId) {
      let msg = `Sequence must be greater than 0.`;
      getConstraint["display_sequence"] = {
        digits: {
          integer: 10,
          message: msg
        },
        min: {
          value: Number(minimum),
          message: msg
        }
      };
      obj["RULES-20"] = getConstraint;
    } else {
      getConstraint ? delete getConstraint.display_sequence : null;
      obj["RULES-20"] = getConstraint;
    }
    this.valdr.addConstraints(obj);
  }

  //get attribute values for selected attribute
  ViewAttributeValues(refresh) {
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.refreshTableText = "Table is refreshing...";
      this.isRefreshTable = true;
    }
    this.isLoaded = false;
    this.AttributeValueFactory.FetchAttributeValues(this.attributeId)
      .then(response => {
        this.creatValuesMap(response.data);
        this.AttributeValues = response.data;
        this.rowsCount = this.AttributeValues.length;
        this.AttributeValues.status === 404 ?
          (this.isViewAuthorized = false) :
          (this.isViewAuthorized = true);
        if (refresh !== undefined) {
          this.totalRecords = this.AttributeValues.length;
          this.totalRecordsText = "record(s) loaded in approximately";
          this.refreshTableText = "Successfully refreshed";
        }
        this.common.$timeout(() => {
          this.isRefreshTable = false;
          angular.element("#create_attr").focus();
        }, 3500);
        this.setGridProperties();
        this.isLoaded = true;
        this.paginationHandler(1); //update table information on reload
      })
      .catch(error => {
        if (error.status === 403) {
          this.isAccessDenied = true;
        }
        this.isRefreshTable = true;
        this.refreshTableText = "Unsuccessfull!";
        this.common.$timeout(() => {
          this.isRefreshTable = false;
        }, 2500);
        this.logger.error(error);
      });
  }

  //Function to create map of attribute values where key:id, value:data object
  creatValuesMap(values) {
    this.ValuesMap = [];
    for (let i = 0; i < values.length; i++) {
      if (this.ValuesMap[values[i].id] === undefined) {
        this.ValuesMap[values[i].id] = values[i];
      }
    }

    //if state parameter id is present in map and current state is update state then oprn update form on refresh
    this.$stateParams.id && this.$state.current.name.includes(".update") ?
      this.LoadAttributeValue(this.$stateParams.id) :
      "";
  }

  //Load attribute value in update state
  LoadAttributeValue(id) {
    if (
      this.$stateParams.id &&
      this.ValuesMap &&
      this.ValuesMap[this.$stateParams.id]
    ) {
      this.PanelUpdateAttributeValue(this.$stateParams.id);
    } else {
      this.exit();
    }
  }

  //get attribute by selected id
  FetchAttribute() {
    this.isLoaded = false;
    this.AttributeFactory.FetchAttributeById(this.$stateParams.attribute_id)
      .then(response => {
        this.isLoaded = true;
        this.Attribute = response.data;
      })
      .catch(error => {
        this.isLoaded = true; // isLoaded variable true after api call
        this.logger.error(error);
      });
  }

  //open create new attribute state
  NewAttributeValue() {
    this.AttributeValue = {};
    this.error = null;
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    this.addSequenceValidation();
    // On click of create attribute value, display sequence is created.
    if (this.AttributeValues) {
      this.setSuggestedSequence();
    }
    this.common.$timeout(() => {
      angular.element("#description").focus();
    }, 0);
    this.AttributeValue.status_id = 200;
  }

  //sequence value is created on click of create Attribute value
  setSuggestedSequence() {
    this.AttributeValue.display_sequence = this.AttributeValues.length + 1;
  }

  //on double click a row, preview attribute value
  ViewAttributeValue(id) {
    this.error = null;
    this.common.$state.go("common.prime.attributes.values.view", {
      id: id
    });
  }

  //update attribute value state
  PanelUpdateAttributeValue(id) {
    this.$scope.showhistory = false;
    this.error = null;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isConfirmDelete = false;
    this.updateBtnText = "Update";
    this.isShowHistory = true;
    this.AttributeValue = _.clone(this.ValuesMap[id]);
    this.original_attr_value = _.clone(this.ValuesMap[id]);
    this.common.$state.go("common.prime.attributes.values.update", {
      id: id
    });
    this.setInitialState();
    this.addSequenceValidation(id);
  }

  //delete attribute page
  PanelDeleteAttributeValue() {
    this.error = null;
    this.isShowHistory = false;
    this.isConfirmDelete = true;
    this.isUnauthorized = false;
  }

  // function to open new form after click on Create Another button
  createAnotherForm() {
    this.AttributeValue = {};
    this.error = null;
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    this.AttributeValue.status_id = this.old_data.status_id;
    this.setSuggestedSequence();
    this.setInitialState();
  }

  //set focus in first field of form
  setInitialState() {
    this.common.$timeout(() => {
      angular.element("#description").focus();
    }, 0);
  }

  ShowHideColumnSettings() {
    this.common.$timeout(() => {
      angular.element("#hide_show_column").focus();
    }, 1000);
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  //set attribbbute value description to default as short description
  setDefaultShortDescription() {
    if (
      (this.AttributeValue.short_description === undefined ||
        this.AttributeValue.short_description === null ||
        this.AttributeValue.short_description.length === 0) &&
      this.AttributeValue.description != null
    ) {
      this.AttributeValue.short_description = this.AttributeValue.description.substring(
        0,
        44
      );
    }
  }

  ArrangeDisplaySequenceAfterInsert(valueData, sequence) {
    if (sequence < valueData.length) {
      for (let index = 0; index < valueData.length; index++) {
        if (valueData[index].display_sequence >= sequence) {
          valueData[index].display_sequence =
            Number(valueData[index].display_sequence) + 1;
        }
      }
    }
  }

  CreateAttributeValue() {
    this.error = null;
    this.saveBtnText = "Saving Now..."; //change button label as clicked on button
    this.isProcessing = true; //variable to disable the button till response get back
    this.AttributeValue.attribute_id = this.attributeId;
    this.AttributeValueFactory.CreateAttributeValue(this.AttributeValue)
      .then(result => {
        this.AttributeValue = result.data;
        this.isSaveSuccess = true;
        this.ValuesMap[result.data.id] = result.data;
        this.old_data = result.data;
        this.rowsCount = this.rowsCount + 1;
        this.paginationHandler(1);
        this.saveBtnText = "Save";
        this.isProcessing = false;
        this.ArrangeDisplaySequenceAfterInsert(
          this.AttributeValues,
          this.AttributeValue.display_sequence
        );
        this.AttributeValues.push(this.AttributeValue);
        // Variable used to show move up down columns
        this.showmoveupdown = false;
        this.$scope.$emit("AttributeValueUpdate", {
          attribute_id: this.attributeId,
          action: "create"
        });
        this.common.$timeout(() => {
          // Variable used to show move up down columns
          this.showmoveupdown = true;
        }, 0);
      })
      .catch(exception => {
        this.saveBtnError = true;
        this.isProcessing = false;
        this.saveBtnText = "Oops.!! Something went wrong";
        exception.status === 412 ?
          (this.error = exception.data.error.message) :
          (this.error = exception.data.error);

        this.common.$timeout(() => {
          this.saveBtnError = false;
          this.saveBtnText = "Save";
          this.error = null;
          angular.element("#description").focus();
        }, 3000);
      });
      this.common.$timeout(() => {
       angular.element("#done_btn").focus();
      }, 1000);
  }

  ArrangeDisplaySequenceAfterUpdate(
    valueData,
    payload,
    newSequence,
    oldSequence
  ) {
    for (let index = 0; index < valueData.length; index++) {
      if (valueData[index].attribute_id == payload.attribute_id) {
        if (
          valueData[index].id != payload.id &&
          ((valueData[index].display_sequence <= newSequence &&
              valueData[index].display_sequence >= oldSequence) ||
            (valueData[index].display_sequence <= oldSequence &&
              valueData[index].display_sequence >= newSequence))
        ) {
          if (oldSequence <= newSequence) {
            valueData[index].display_sequence =
              Number(valueData[index].display_sequence) - 1;
          } else {
            valueData[index].display_sequence =
              Number(valueData[index].display_sequence) + 1;
          }
        }
      }
    }
  }

  UpdateAttributeValue() {
    if (
      this.original_attr_value.attribute_id !==
      this.AttributeValue.attribute_id ||
      this.original_attr_value.description !==
      this.AttributeValue.description ||
      this.original_attr_value.short_description !==
      this.AttributeValue.short_description ||
      this.original_attr_value.status !== this.AttributeValue.status ||
      this.original_attr_value.display_sequence !==
      this.AttributeValue.display_sequence
    ) {
      this.error = null;
      this.updateBtnText = "Updating Now..."; //change button label as clicked on button
      this.isProcessing = true; //variable to disable the button till response get back
      this.AttributeValueFactory.UpdateAttributeValue(this.AttributeValue)
        .then(result => {
          //get index of id from array of values
          let index = this.AttributeValues.findIndex(
            value => value.id === this.AttributeValue.id
          );
          this.ArrangeDisplaySequenceAfterUpdate(
            this.AttributeValues,
            this.AttributeValue,
            this.AttributeValue.display_sequence,
            this.AttributeValues[index].display_sequence
          );
          this.AttributeValues[index] = this.AttributeValue; //assign updated info to the object at the index
          this.ValuesMap[this.AttributeValue.id] = this.AttributeValue; //update object at id in map
          this.PanelUpdateAttributeValue(this.AttributeValue.id);
          this.isUpdateSuccess = true;
          this.isProcessing = false;
          this.updateBtnText = "Update";
          this.isShowHistory = false;
        })
        .catch(exception => {
          this.isProcessing = false;
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          exception.status === 412 ?
            (this.error = exception.data.error.message) :
            (this.error = exception.data.error);

          this.common.$timeout(() => {
            this.updateBtnError = false;
            this.updateBtnText = "Update";
            this.error = null;
          }, 3000);
        });
    } else {
      this.isProcessing = false;
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
    }
    this.common.$timeout(() => {
      this.updateBtnError = false;
      this.updateBtnText = "Update";
      this.error = null;
    }, 3000);
  }

  // Arrange values according to display sequence
  ArrangeDisplaySequenceAfterDelete(values, sequence, attributeId) {
    values.filter(value => {
      if (
        Number(value.attribute_id) === Number(attributeId) &&
        Number(value.display_sequence) > Number(sequence)
      ) {
        value.display_sequence = Number(value.display_sequence) - 1;
      }
    });
  }

  RemoveAttributeValue() {
    let id = this.$stateParams.id;
    this.isLoadingDelete = true;
    //get index of id from array of values
    let index = this.AttributeValues.findIndex(
      value => value.id === parseInt(id)
    );
    this.AttributeValueFactory.DeleteAttributeValue(id)
      .then(result => {
        this.isLoadingDelete = false;
        this.rowsCount = this.rowsCount - 1;
        this.AttributeValues.splice(index, 1); //remove object with index from array
        delete this.ValuesMap[id]; //remove same id from map
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        delete this.ValuesMap[id]; //remove same id from map
        // arrange values according to display sequence after delete
        this.ArrangeDisplaySequenceAfterDelete(
          this.AttributeValues,
          this.AttributeValue.display_sequence,
          this.Attribute.id
        );
        // Variable used to show move up down columns
        this.showmoveupdown = false;
        this.common.$timeout(() => {
          // Variable used to show move up down columns
          this.showmoveupdown = true;
        }, 0);
        this.$scope.$emit("AttributeValueUpdate", {
          attribute_id: this.attributeId,
          action: "delete"
        });
        //Following function is used to upate the record count value and remain in the same page number
        this.paginationHandler(this.page);
      })
      .catch(exception => {
        this.isLoadingDelete = false;
        if (
          exception.data.status === 412 &&
          exception.data.type === "Dependency Check"
        ) {
          this.isDependant = true;
        } else {
          this.error = exception.data.error;
        }
        this.common.$timeout(() => {
          this.error = null;
        }, 3000);
      });
  }

  RemoveAttributeValueWithDependents() {
    let id = this.$stateParams.id;
    this.isProcessing = true;
    let service;
    if (this.Attribute.entity.toLowerCase() === "item") {
      service = this.ItemUDDValueService;
    } else if (this.Attribute.entity.toLowerCase() === "location") {
      service = this.LocationUDDService;
    } else if (this.Attribute.entity.toLowerCase() === "vendor") {
      service = this.VendorUDDService;
    } else if (this.Attribute.entity.toLowerCase() === "mto") {
      service = this.MTOUDDService;
    }
    //get index of id from array of values
    let index = this.AttributeValues.findIndex(
      value => value.id === parseInt(id)
    );
    service.API.DeleteUDDValuesByValue(id, this.Attribute.format).then(
      result => {
        this.AttributeValueFactory.RemoveValueById(id)
          .then(result => {
            this.isProcessing = false;
            this.rowsCount = this.rowsCount - 1;
            this.AttributeValues.splice(index, 1); //remove object with index from array
            delete this.ValuesMap[id]; //remove same id from map
            // arrange values according to display sequence after delete
            this.ArrangeDisplaySequenceAfterDelete(
              this.AttributeValues,
              this.AttributeValue.display_sequence,
              this.Attribute.id
            );
            this.isDependant = false;
            this.isDeleteSuccess = true;
            this.isConfirmDelete = false;
            // Variable used to show move up down columns
            this.showmoveupdown = false;
            this.common.$timeout(() => {
              // Variable used to show move up down columns
              this.showmoveupdown = true;
            }, 0);
            this.$scope.$emit("AttributeValueUpdate", {
              attribute_id: this.attributeId,
              action: "delete"
            });
            //Following function is used to upate the record count value and remain in the same page number
            this.paginationHandler(this.page);
          })
          .catch(exception => {
            console.log(exception);
          });
      }
    );
  }

  exit() {
    this.$scope.showhistory = false;
    this.AttributeValue = null;
    this.isDependant = false;
    this.common.$state.go("common.prime.attributes.values");
    this.common.$timeout(() => {
      angular.element("#inlineSearch").focus();
      },1000)
  }
  
  cancelDeleteDependency() {
    this.common.$timeout(() => {
      angular.element("#description").focus();
      },1000)
  }

 

  focusSearchField() {
    this.showFilter = 1;
  }

  //load update history for selected value
  loadHistory() {
    this.common.EntityDetails.API.GetHistoryData(
        this.uuid,
        this.$stateParams.id
      )
      .then(response => {
        this.$scope.historyList = response;
        this.$scope.showhistory = true;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  closeShowHistory() {
    this.common.$timeout(() => {
      angular.element("#description").focus();
      },1000)
    this.$scope.showhistory = false;
  }

  paginationHandler(page) {
    let initialCount;
    this.page = page;
    if (this.AttributeValues.length === 0) {
      initialCount = 0;
    } else {
      initialCount = 1;
    }

    if (page === 1) {
      this.rowsFound =
        "Displaying " +
        initialCount +
        " - " +
        (this.pageSize < this.AttributeValues.length ?
          this.pageSize :
          this.AttributeValues.length) +
        " Of " +
        this.AttributeValues.length +
        " Records";
    } else {
      var start =
        parseInt(page) * parseInt(this.pageSize) - parseInt(this.pageSize) + 1;
      var end =
        parseInt(page) * parseInt(this.pageSize) -
        parseInt(this.pageSize) +
        parseInt(this.pageSize);
      this.rowsFound =
        "Displaying " +
        start +
        " -" +
        (end < this.AttributeValues.length ?
          end :
          this.AttributeValues.length) +
        " Of " +
        this.AttributeValues.length +
        " Records";
    }
  }
}

angular
  .module("rc.prime.attribute.values")
  .controller("AttributeValueController", AttributeValueController);