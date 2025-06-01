class DiscountTypeController {
  constructor($scope, common, DiscountService) {
    this.$scope = $scope;
    this.common = common;
    this.logger = this.common.Logger.getInstance("DiscountTypeController");
    this.$timeout = this.common.$timeout;
    this.DiscountService = DiscountService;
    this.DiscountTypeuuid = 106;
    this.DiscountTypeValueuuid = 107;

    //Variable used in save/update/delete form
    this.saveBtnText = "Save";
    this.saveBtnError = false;
    this.isSaveSuccess = false;
    this.updateBtnText = "Update";
    this.updateBtnError = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isConfirmDelete = false;
    this.isUnauthorized = false;
    this.isViewAuthorized = true;
    this.message = null;
    this.isBtnEnable = true;
    this.valuesMap = {};

    //varibles to update page information
    this.rowsCount = 0;
    $scope
      .getAccessPermissions(131)
      .then(result => {
        this.permissionsMap = result;
        this.activate();
      })
      .catch(error => {
        this.permissionsMap = error.data;
        this.activate();
        logger.error(error);
      });
  }

  activate() {
    this.getAllDiscountTypes();
    this.getModelAndSetValidationRules(this.DiscountTypeuuid);
    this.getModelAndSetValidationRules(this.DiscountTypeValueuuid);
    this.$scope.getStatuses(this.common.Identifiers.cloud_cart); // Getting cloud cart module status;  
  }

  /// Get list of all regions to show in UI
  getAllDiscountTypes(refresh) {
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }
    this.discountTypes = [];
    this.rowsCount = 0;
    this.DiscountService.API.GetDiscountTypes()
      .then(response => {
        this.isLoaded = true;
        this.discountTypes = response.data;
        for (let i = 0; i < this.discountTypes.length; i++) {
          this.discountTypes[i].checked = true;
        }
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
        this.createTypesListMap(response.data);
      })
      .catch(error => {
        this.isLoaded = true;
        this.logger.error(error);
      });
  }

  //get validation rules for discount type by uuid and set rules using valdr in application.context.js
  getModelAndSetValidationRules(uuid) {
    this.common.EntityDetails.API.GetModelAndSetValidationRules(uuid).then(
      model => {}
    );
  }

  getAllValuesByDisountTypeId(typeId) {
    this.DiscountService.API.GetDiscountTypeValues(typeId)
      .then(response => {
        this.isLoaded = true;
        for (let i = 0; i < response.length; i++) {
          if (this.valuesMap[response[i].id] === undefined) {
            this.valuesMap[response[i].id] = response[i];
          }
        }

        this.navigateToForm()
      })
      .catch(error => {
        this.isLoaded = true;
        this.logger.error(error);
      });
  }

  navigateToForm(){   
    // if discount update/delete succes page is there then do not call function
    if(!this.isUpdateSuccess && !this.isDeleteSuccess){
      if (this.common.$state.current.name.includes("discount.newvalue")) {
        let dataObj =
          this.common.$stateParams.discount_type_value_id &&
          this.valuesMap[this.common.$stateParams.discount_type_value_id]
            ? this.valuesMap[this.common.$stateParams.discount_type_value_id]
            : this.typesMap[this.common.$stateParams.discount_type_id];
        this.openNewValueForm(dataObj);
      } else if (
        this.common.$state.current.name.includes("discount.updatevalue") && 
        this.common.$stateParams.discount_type_value_id
      ) {
        let valueObj = this.valuesMap[
          this.common.$stateParams.discount_type_value_id
        ];
        this.dblClickAction(valueObj, "DiscountTypeValue");
      } else {
        this.closeForm();
      }
    }

    if (this.common.$state.current.name.includes("discount.new")) {
      this.openForm();
    } else if (
      this.common.$state.current.name.includes("discount.update") && 
      this.typesMap[this.common.$stateParams.discount_type_id] && 
      !this.common.$stateParams.discount_type_value_id
    ) {
      this.dblClickAction(this.typesMap[this.common.$stateParams.discount_type_id]);
    } 
  }

  //Create Map List
  createTypesListMap(list) {
    this.typesMap = [];
    for (let i = 0; i < list.length; i++) {
      list[i].discount_type_id = list[i].id;
      if (this.typesMap[list[i].id] === undefined) {
        this.typesMap[list[i].id] = list[i];
      }
      this.getAllValuesByDisountTypeId(list[i].discount_type_id);
    }
  }

  openNewValueForm(data) {
    this.new_discount_type_value = this.prepareData(data);
    if (data.nodes) {
      this.selectedParent = data;
    }
    this.saveBtnText = "Save";
    this.common.$state.go("common.prime.discount.newvalue", {
      discount_type_id: data.discount_type_id,
      discount_type_value_id:
        data.parent_id || data.parent_id === null ? data.id : undefined
    });
    this.setInitialState();
  }

  prepareData(data) {
    let obj = {
      discount_type_id: data.discount_type_id,
      parent_id: data.parent_id || data.parent_id === null ? data.id : null,
      parent_description: data.parent_description
        ? data.parent_description
        : data.description,
      level: data.level ? data.level + 1 : 1,
      discount_type: data.discount_type ? data.discount_type : data.description
    };
    return obj;
  }

  createAnotherValueForm() {
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    this.new_discount_type_value = this.prepareData(this.selectedParent);
    //Setting Previously entered data to the new context
    this.new_discount_type_value.status_id = this.previousDTV.status_id;
    this.setInitialState();
  }

  //Open create new discount type form
  openForm() {
    this.saveBtnText = "Save";
    this.new_discount_type = {};
    this.isSaveSuccess = false;
    this.common.$state.go("common.prime.discount.new");
    this.setInitialState();
  }

  //show create new discount type form on click of create another button after a new record created.
  createAnotherForm() {
    this.isSaveSuccess = false;
    this.saveBtnText = "Save";
    this.new_discount_type = {};
    //Setting Previously entered data to the new context
    this.new_discount_type.status_id = this.previousDT.status_id;
    this.setInitialState();
  }

  //On double click on a record in the table, update form will be opened and
  // if any success/error page/meesage in the form will be closed.
  dblClickAction(data, entityname) {
    if (entityname && entityname.toLowerCase() === "discounttypevalue") {
      this.common.$state.go("common.prime.discount.updatevalue", {
        discount_type_id: data.discount_type_id,
        discount_type_value_id: data.id
      });
      this.selectedParent = data.parent_id
        ? this.valuesMap[data.parent_id]
        : this.typesMap[data.discount_type_id];
      data.effective_date = this.$scope.getDateBasedOnFormat(
        data.effective_date
      );
      this.new_discount_type_value = _.clone(data);
      this.oldDiscountTypeValue = _.clone(data);
    } else {
      this.common.$state.go("common.prime.discount.update", {
        discount_type_id: data.id
      });
      this.new_discount_type = _.clone(data);
      this.oldDiscountTypeDetails = _.clone(data);
    }

    this.selectedNode = data;
    this.isUnauthorized = false;
    this.isSaveSuccess = false;
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isConfirmDelete = false;
    this.updateBtnText = "Update";
    this.setInitialState();
  }

  //Close form and success/error messages in the form
  closeForm() {
    this.common.$state.go("common.prime.discount");
    this.showDependencyDetails = false;
    this.message = null;
    this.common.$timeout(() => {
      this.isUnauthorized = false;
      this.isDeleteSuccess = false;
      this.isUpdateSuccess = false;
      this.isSaveSuccess = false;
      this.isConfirmDelete = false;
    }, 500);
  }

  gotoUpdateStateIfIdExist() {
    if (this.typesMap[this.common.$stateParams.discount_type_id]) {
      this.dblClickAction(
        this.typesMap[this.common.$stateParams.discount_type_id]
      );
    } else {
      this.closeForm();
    }
  }

  //focus will be set to the first field of form
  setInitialState() {
    this.common.$timeout(function() {
      angular.element("#description").focus();
    });
  }

  save(payload, entityname) {
    this.isBtnEnable = false;
    this.saveBtnText = "Saving now...";
    if (entityname && entityname.toLowerCase() === "discounttypevalue") {
      let dataToSave = _.clone(payload);
      dataToSave.effective_date = moment(dataToSave.effective_date).format(
        "YYYY-MM-DD"
      );
      this.DiscountService.API.InsertDiscountTypeValue(dataToSave)
        .then(response => {
          payload.id = response.data.inserted_id;
          this.previousDTV = _.clone(payload);
          this.saveBtnText = "Done";
          this.isSaveSuccess = true;
          this.isBtnEnable = true;
          if (this.selectedParent) {
            if (this.selectedParent.nodes) {
              this.selectedParent.nodes.push(payload);
              this.valuesMap[payload.id].nodes.push(payload);
            } else {
              this.selectedParent.nodes = [payload];
              this.valuesMap[payload.id].nodes = [payload];
            }
          }
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          } else {
            this.message =
              error.data.error.message ||
              error.data.message ||
              error.data.error;
          }
          this.saveBtnText = "Oops.!! Something went wrong";
          this.saveBtnError = true;
          this.common.$timeout(() => {
            this.message = null;
            this.saveBtnText = "Save";
            this.saveBtnError = false;
            this.isBtnEnable = true;
          }, 2500);
          this.logger.error(error);
        });
    } else {
      this.DiscountService.API.InsertDiscountType(payload)
        .then(response => {
          payload.discount_type_id = payload.id = response.data.inserted_id;
          payload.checked = true;
          this.previousDT = _.clone(payload);
          this.saveBtnText = "Done";
          this.isSaveSuccess = true;
          this.isBtnEnable = true;
          this.discountTypes.push(payload);
          this.typesMap[payload.id] = payload;
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          } else {
            this.message =
              error.data.error.message ||
              error.data.message ||
              error.data.error;
          }
          this.saveBtnText = "Oops.!! Something went wrong";
          this.saveBtnError = true;
          this.common.$timeout(() => {
            this.message = null;
            this.saveBtnText = "Save";
            this.saveBtnError = false;
            this.isBtnEnable = true;
          }, 2500);
          this.logger.error(error);
        });
    }
  }

  //check if the payload is different from old form data. if it is then return true.
  hasUpdateChanges(payload) {
    if (
      this.oldDiscountTypeDetails.description !== payload.description ||
      this.oldDiscountTypeDetails.long_description !==
        payload.long_description ||
      this.oldDiscountTypeDetails.status_id !== payload.status_id
    ) {
      return true;
    } else {
      return false;
    }
  }

  hasValueUpdateChanges(payload) {
    if (
      this.oldDiscountTypeValue.description !== payload.description ||
      this.oldDiscountTypeValue.long_description !== payload.long_description ||
      this.oldDiscountTypeValue.status_id !== payload.status_id ||
      this.oldDiscountTypeValue.discount_percentage !==
        payload.discount_percentage ||
      moment(this.oldDiscountTypeValue.effective_date).format("YYYY-MM-DD") !==
        moment(payload.effective_date).format("YYYY-MM-DD")
    ) {
      return true;
    } else {
      return false;
    }
  }

  //update the discount type.
  update(payload, entityname) {
    this.isBtnEnable = false;
    this.updateBtnText = "Updating Now...";    
    if (entityname && entityname.toLowerCase() === "discounttypevalue") {
      let dataToUpdate = _.clone(payload);
      if (this.hasValueUpdateChanges(dataToUpdate) === true) {
        dataToUpdate.effective_date =  moment(dataToUpdate.effective_date).format(
          "YYYY-MM-DD"
        );
        this.DiscountService.API.UpdateDiscountTypeValue(dataToUpdate)
          .then(response => {
            this.oldDiscountTypeValue = response.data.updatedResult;
            this.updateBtnText = "Done";
            this.isBtnEnable = true;
            this.isUpdateSuccess = true;
            this.getAllDiscountTypes();
           /*  if (
              this.selectedParent &&
              (this.selectedParent.parent_id ||
                this.selectedParent.parent_id === null)
            ) {
              delete this.selectedParent.nodes;
              this.getNodes(this.selectedParent);
            } else {
              this.selectedParent = this.typesMap[payload.discount_type_id];
              delete this.selectedParent.nodes;
              this.getNodes(this.selectedParent, true);
            } */
          })
          .catch(error => {
            this.isLoaded = true;
            if (error.status === 403) {
              this.isUnauthorized = true;
            } else {
              this.message = error.data.message || error.data.error;
            }
            this.updateBtnText = "Oops.!! Something went wrong";
            this.updateBtnError = true;
            this.common.$timeout(() => {
              this.isBtnEnable = true;
              this.message = null;
              this.updateBtnText = "Update";
              this.updateBtnError = false;
              this.isUnauthorized = false;
            }, 2500);
          });
      } else {
        // if current form data is not changed and user click on update button then show message in UI.
        this.updateBtnText = "Nothing to update";
        this.updateBtnError = true;
        this.common.$timeout(() => {
          this.isBtnEnable = true;
          this.updateBtnText = "Update";
          this.updateBtnError = false;
        }, 1000);
      }
    } else {
      if (this.hasUpdateChanges(payload) === true) {
        //if the current form data is changed then update.
        this.DiscountService.API.UpdateDiscountType(payload)
          .then(response => {
            //get index of current discount by id
            let index = this.discountTypes.findIndex(
              type => type.id === payload.id
            );
            response.data.updatedResult.discount_type_id = response.data.updatedResult.id;
            //update discount in list present at the index
            this.discountTypes[index] = response.data.updatedResult;
            this.discountTypes[index].checked = true;
            this.typesMap[this.common.$stateParams.discount_type_id] =
              response.data.data;
            this.oldDiscountTypeDetails = response.data.updatedResult;
            this.updateBtnText = "Done";
            this.isBtnEnable = true;
            this.isUpdateSuccess = true;
          })
          .catch(error => {
            this.isLoaded = true;
            if (error.status === 403) {
              this.isUnauthorized = true;
            } else {
              this.message = error.data.message || error.data.error;
            }
            this.updateBtnText = "Oops.!! Something went wrong";
            this.updateBtnError = true;
            this.common.$timeout(() => {
              this.isBtnEnable = true;
              this.message = null;
              this.updateBtnText = "Update";
              this.updateBtnError = false;
              this.isUnauthorized = false;
            }, 2500);
          });
      } else {
        // if current form data is not changed and user click on update button then show message in UI.
        this.updateBtnText = "Nothing to update";
        this.updateBtnError = true;
        this.common.$timeout(() => {
          this.isBtnEnable = true;
          this.updateBtnText = "Update";
          this.updateBtnError = false;
        }, 1000);
      }
    }
  }

  //delete
  delete(payload, entityname) {
    if (entityname && entityname.toLowerCase() === "discounttypevalue") {
      this.DiscountService.API.DeleteDiscountTypeValue(payload.id)
        .then(response => {
          this.showDependencyDetails = false;
          this.isDeleteSuccess = true;
          this.isConfirmDelete = false;
          this.getAllDiscountTypes();
          /* if (
            this.selectedParent &&
            (this.selectedParent.parent_id ||
              this.selectedParent.parent_id === null)
          ) {
            delete this.selectedParent.nodes;
            this.getNodes(this.selectedParent);
          } else {
            this.selectedParent = this.typesMap[payload.discount_type_id];
            delete this.selectedParent.nodes;
            this.getNodes(this.selectedParent, true);
          } */
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          } else {
            this.message =
              error.data.message || error.data.error || "Can not delete";
            this.isUpdateSuccess = false;
          }
          this.common.$timeout(() => {
            this.message = null;
          }, 2500);
        });
    } else {
      this.DiscountService.API.DeleteDiscountTypeValuesByDisountTypeId(
        payload.discount_type_id
      )
        .then(res => {
          this.DiscountService.API.DeleteDiscountType(payload.discount_type_id)
            .then(response => {
              this.showDependencyDetails = false;
              this.isDeleteSuccess = true;
              this.isConfirmDelete = false;
              let index = this.discountTypes.findIndex(
                discountType => discountType.id === payload.discount_type_id
              );
              this.discountTypes.splice(index, 1);
              delete this.typesMap[this.common.$stateParams.discount_type_id];
            })
            .catch(error => {
              if (error.status === 403) {
                this.isUnauthorized = true;
              } else {
                this.message =
                  error.data.message || error.data.error || "Can not delete";
                this.isUpdateSuccess = false;
              }
              this.common.$timeout(() => {
                this.message = null;
              }, 2500);
            });
        })
        .catch(error => {
          if (error.status === 403) {
            this.isUnauthorized = true;
          } else {
            this.message =
              error.data.message || error.data.error || "Can not delete";
            this.isUpdateSuccess = false;
          }
          this.common.$timeout(() => {
            this.message = null;
          }, 2500);
        });
    }
  }

  //on click of delete button in update form, delete confirmation panel should be shown
  showconfirm(entityname) {
    //this.isConfirmDelete = true;
    this.isUnauthorized = false;
    this.showDependencyDetails = true;
  }

  getNodes(data, isDiscountType) {    
    if (!data.nodes || data.nodes.length === 0) {
      data.isLoaded = false;
      data.nodes = [];
      let query = {
        discount_type_id: data.discount_type_id,
        parent_id: !isDiscountType ? data.id : undefined
      };
      this.DiscountService.API.GetDiscountTypeValuesByTypeIdAndParentId(query)
        .then(response => {
          /* for (let i = 0; i < response.length; i++) {
              if (!data.pathIndexes) {
                response[i].pathIndexes = [i];
              } else {
                let arr = _.clone(data.pathIndexes);
                arr.push(i)
                response[i].pathIndexes = arr;
              }
            }   */
          data.nodes = response;
          if (isDiscountType) {
            this.typesMap[data.discount_type_id].nodes = [];
            this.typesMap[data.discount_type_id].nodes = response;
          } else {
            this.valuesMap[data.id].nodes = [];
            this.valuesMap[data.id].nodes = response;
          }
          data.isLoaded = true;
        })
        .catch(error => {
          data.isLoaded = true;
          this.logger.error(error);
        });
    }
  }

  /* enterIndexToList(parent, data, index) {
    let index = this.discountTypes.findIndex(dt => dt.discount_type_id === payload.discount_type_id);
    let st = this.discountTypes[index];
    for(let i=0;i<payload.pathIndexes.length;i++) {
        let idx = payload.pathIndexes[i];
        if(idx > -1 && i !== payload.pathIndexes.length) {
            st = st.nodes[idx]
        }
    }
    if (data.level === 1) {
      data.pathIndexes = [index];
    } else {
      let arr = _.clone(parent.pathIndexes);
      arr.push(index);
      data.pathIndexes = arr;
    }
  }  */
}

angular
  .module("rc.prime.discount")
  .controller("DiscountTypeController", DiscountTypeController);
