(() => {
  "use strict";
  angular
    .module("rc.prime.company.associate")
    .controller("CompanyAssociateController", CompanyAssociateController);
  CompanyAssociateController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "CompanyAssociateService",
    "CompanyService",
    "TitleService",
    "IndividualService",
    "AddressContactService",
    "CompanyDepartmentService",
    "StatusCodes"
  ];

  function CompanyAssociateController(
    $scope,
    $stateParams,
    common,
    CompanyAssociateService,
    CompanyService,
    TitleService,
    IndividualService,
    AddressContactService,
    CompanyDepartmentService,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    vm.entityInformation = {};
    vm.associatePageDetails = {};
    vm.previousAssociate = {};
    vm.oldAssociateDetails = {};
    vm.isShowAssociateDetails = false;
    vm.isShowAddAssociate = false;
    vm.associate_details = {};
    vm.allIndividualList = [];
    vm.allTitleList = {};

    $scope.isShowAddressPanel = false;
    $scope.isAddressPanel = false;
    $scope.isContactsPanel = false;
    $scope.isShowContactsPanel = false;

    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    vm.isUnauthorized = false;
    vm.isLoaded = false;

    vm.assotypes = [];

    vm.saveAssociateBtnText = "Save";
    vm.saveAssociateBtnError = false;
    vm.isSaveAssociateSuccess = false;
    vm.updateAssociateBtnText = "Update";
    vm.updateAssociateBtnError = false;
    vm.isUpdateAssociateSuccess = false;
    vm.isConfirmAssociateDelete = false;
    vm.isDeleteAssociateSuccess = false;

    vm.isColumnSettingsVisible = false;
    vm.uuid = "23";

    /** Common Modules */
    let Identifiers = common.Identifiers;
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("CompanyAssociateController");

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.companyAssociateGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          title: {
            visible: true
          },
          name: {
            visible: true
          },
          addressContact: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.focusSearchField = () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
      },1000)
    } 

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //to get required information of company associates
    vm.getEntityInformation = () => {
      EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(company_associate_information => {
          vm.entityInformation = company_associate_information;
          $scope.name = vm.entityInformation.name;
          vm.getIndividuals();
          vm.getTitles();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(model => {
        //vm.getDynamicColumns(model);
      });
    };

    vm.initializeCompanyAssociate = () => {
      vm.department_id = $stateParams.department_id;
      vm.getSelectedDepartment(vm.department_id);
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.reload();
      // Get access permission of crud oprations for associate
      vm.getPermissionsForUuid(
        "associatePermissions",
        Identifiers.company_associate
      );
    };

    // Get access permission of crud oprations for associate
    vm.getPermissionsForUuid = (model, uuid) => {
      $scope
        .getAccessPermissions(uuid)
        .then(res => {
          vm[model] = res;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getSelectedDepartment = departmentId => {
      CompanyDepartmentService.API.GetCompanyDepartmentById(departmentId)
        .then(response => {
          vm.selectedDepartment = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get all the individuals
    vm.getIndividuals = () => {
      IndividualService.API.GetIndividuals()
        .then(response => {
          vm.allIndividualList = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get all the titles
    vm.getTitles = () => {
      TitleService.API.GetTitles()
        .then(response => {
          vm.allTitleList = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.save = payload => {
      payload.company_department_id = vm.department_id;
      vm.saveAssociateBtnText = "Saving Now...";
      CompanyAssociateService.API.InsertCompanyAssociate(payload)
        .then(() => {
          vm.reload();
          vm.previousAssociate = payload;
          vm.saveAssociateBtnText = "Save";
          vm.isSaveAssociateSuccess = true;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveAssociateBtnText = "Oops.!! Something went wrong";
          vm.saveAssociateBtnError = true;
          vm.error = true;
          vm.errorMessage = error.data.error.message || error.data.error;
          $timeout(() => {
            vm.errorMessage = null;
            vm.saveAssociateBtnText = "Save";
            vm.saveAssociateBtnError = false;
            angular.element("#title_id").focus();
          }, 2500);
        });
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = payload => {
      if (
        vm.oldAssociateDetails.individual_id !== payload.individual_id ||
        vm.oldAssociateDetails.title_id !== payload.title_id ||
        vm.oldAssociateDetails.status_id !== payload.status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = payload => {
      vm.updateAssociateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        CompanyAssociateService.API.UpdateCompanyAssociate(payload)
          .then(response => {
            let index = vm.associates.findIndex(
              associate => associate.id === payload.id
            );
            vm.associates[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateAssociateBtnText = "Done";
            vm.isUpdateAssociateSuccess = true;
            vm.oldAssociateDetails = null;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.updateAssociateBtnText = "Oops.!! Something went wrong";
            vm.updateAssociateBtnError = true;
            vm.error = true;
            vm.errorMessage = error.data.error.message || error.data.error;
            $timeout(() => {
              vm.errorMessage = null;
              vm.updateAssociateBtnText = "Update";
              vm.updateAssociateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateAssociateBtnText = "Nothing to update";
        vm.updateAssociateBtnError = true;
        $timeout(() => {
          vm.updateAssociateBtnText = "Update";
          vm.updateAssociateBtnError = false;
          angular.element("#title_id").focus();
        }, 1000);
      }
    };

    vm.delete = payload => {
      CompanyAssociateService.API.DeleteCompanyAssociate(payload)
        .then(() => {
          vm.isDeleteAssociateSuccess = true;
          vm.isConfirmAssociateDelete = false;
          let index = vm.associates.findIndex(
            associate => associate.id === payload.id
          );
          vm.associates.splice(index, 1);
          vm.rowsCount = vm.rowsCount - 1;
          vm.updateTableInformation(vm.currentPage);
          //$scope.lastPageTableRecordDeleteAction($scope.setinstance);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.error = true;
          vm.errorMessage = error.data.error;
        });
    };

    vm.showconfirm = () => {
      vm.isShowHistory = false;
      vm.isConfirmAssociateDelete = true;
      vm.isUnauthorized = false;
    };

    vm.reload = refresh => {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      vm.department_id = $stateParams.department_id;
      vm.isLoaded = false;
      CompanyAssociateService.API.GetCompanyAssociatesByDepartmentId(
        vm.department_id
      )
        .then(response => {
          vm.isLoaded = true;
          vm.associates = response;
          vm.rowsCount = response.length;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.length;
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
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoadedView = true; // isLoaded variable true after api call
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    //set focus on first field in form
    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#title_id").focus();
      }, 0);
    };

    vm.openAddressContactPanel = () => {
      $timeout(() => {
        angular.element("#add_tab").focus();
      }, 500);
      vm.showAddrCnt = true;
      $scope.isShowAddressContactPanel = true;
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable(
        "entityName",
        "Company Associate"
      );
    };

    $scope.closeAddrCntPanel = () => {
      $scope.isShowAddressContactPanel = false;
      $timeout(() => {
        vm.showAddrCnt = false;
      }, 500);
    };

    $scope.openAddressPanel = instanceId => {
      $scope.isAddressPanel = true;
      $scope.isShowAddressPanel = true;
      $scope.closeContactsPanel();
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    $scope.closeAddressPanel = () => {
      $scope.isShowAddressPanel = false;
      $timeout(() => {
        $scope.isAddressPanel = false;
      }, 500);
    };

    $scope.openContactsPanel = instanceId => {
      $scope.isContactsPanel = true;
      $scope.isShowContactsPanel = true;
      $scope.closeAddressPanel();
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    $scope.closeContactsPanel = () => {
      $scope.isShowContactsPanel = false;
      $timeout(() => {
        $scope.isContactsPanel = false;
      }, 500);
    };

    vm.openForm = () => {
      vm.isShowAssociateDetails = true;
      vm.isShowAddAssociate = true;
      vm.isConfirmAssociateDelete = false;
      $scope.noTitleResults = false;
      $scope.noIndividualResults = false;
      vm.associate_details = {};
      vm.associate_form.$setPristine();
      vm.setInitialState();
    };

    //Create new Associate after save
    vm.createAnotherForm = () => {
      vm.isSaveAssociateSuccess = false;
      vm.isShowAddAssociate = true;
      vm.associate_details = {};
      vm.setInitialState();
      //Setting previously entered data to the new context
      vm.associate_details.status_id = vm.previousAssociate.status_id;
    };

    vm.closeForm = () => {
      vm.message = null;
      vm.isShowAssociateDetails = false;
      vm.saveAssociateBtnText = "Save";
      vm.updateAssociateBtnText = "Update";
      vm.updateAssociateBtnError = false;
      $timeout(() => {
        vm.isUnauthorized = false;
        vm.isDeleteAssociateSuccess = false;
        vm.isSaveAssociateSuccess = false;
        vm.isUpdateAssociateSuccess = false;
        vm.isConfirmAssociateDelete = false;
        vm.titleTextLength = 0;
        vm.individualTextLength = 0;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = associate => {
      $scope.noTitleResults = false;
      $scope.noIndividualResults = false;
      vm.isShowAddAssociate = false;
      vm.showDetailsByID(associate);
      vm.oldAssociateDetails = _.clone(vm.associate_details);
    };

    vm.showDetailsByID = associate => {
      vm.associate_details = _.clone(associate);
      vm.associate_details.name = vm.associate_details.individual;
      $scope.isShowAddressContactPanel = false; // close  address and contacts  panel on open of update form
      vm.isUnauthorized = false;
      vm.isShowHistory = true;
      vm.isShowAssociateDetails = true;
      vm.isShowAddAssociate = false;
      vm.isConfirmAssociateDelete = false;
      vm.isSaveAssociateSuccess = false;
      vm.isUpdateAssociateSuccess = false;
      vm.isDeleteAssociateSuccess = false;
      vm.updateAssociateBtnText = "Update";
      vm.setInitialState();
      //On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    //on enter of entity name it will search for entity
    //if entity present already, then returns entity, else option to add new entity in UI will be shown
    vm.discoverEntity = (data, entityName) => {
      vm.message = null;
      vm.errorMessage = null;
      if (entityName && entityName.toLowerCase() === "title") {
        vm.addingTitle = true;
        TitleService.API.DiscoverTitle(data)
          .then(response => {
            vm.addingTitle = false;
            if (response.status === 200) {
              vm.associate_details.title_id = response.data[0].id;
            } else {
              vm.associate_details.title_id = response.data.inserted_id;
              vm.message = "Title created successfully!";
            }
            vm.titleTextLength = 0;
            $scope.noTitleResults = false;
            vm.getTitles();
          })
          .catch(error => {
            logger.error(error);
          });
      } else if (entityName && entityName.toLowerCase() === "individual") {
        vm.addingIndividual = true;
        IndividualService.API.DiscoverIndividual(data)
          .then(response => {
            vm.addingIndividual = false;
            if (response.status === 200) {
              vm.associate_details.individual_id = response.data[0].id;
            } else {
              vm.associate_details.individual_id = response.data.inserted_id;
              vm.message = "Individual created successfully!";
            }
            vm.individualTextLength = 0;
            $scope.noIndividualResults = false;
            vm.getIndividuals();
          })
          .catch(error => {
            logger.error(error);
          });
      }

      $timeout(() => {
        vm.message = null;
        vm.errorMessage = null;
      }, 2500);
    };

    vm.checkTextLength = (data, entityName) => {
      vm.titleNotExist = false;
      vm.nameNotExist = false;
      if (data) {
        if (entityName && entityName.toLowerCase() === "title") {
          vm.associate_details.title_id = null;
          vm.titleTextLength = data.length;
          vm.titleNotExist =
            vm.allTitleList.findIndex(
              jobtitle => data.toLowerCase() === jobtitle.title.toLowerCase()
            ) > -1
              ? false
              : true;
        } else if (entityName && entityName.toLowerCase() === "individual") {
          vm.associate_details.individual_id = null;
          vm.individualTextLength = data.length;
          vm.nameNotExist =
            vm.allIndividualList.findIndex(
              namedata => data.toLowerCase() === namedata.name.toLowerCase()
            ) > -1
              ? false
              : true;
        }
      } else {
        vm.titleTextLength = 0;
        vm.individualTextLength = 0;
      }
    };

    vm.refineJobTitle = () => {
      $timeout(() => {
        if (
          !vm.addingTitle &&
          vm.associate_details &&
          !vm.associate_details.title_id
        ) {
          vm.associate_details.title = undefined;
          vm.titleTextLength = 0;
          $scope.noTitleResults = false;
        }
      }, 500);
    };

    vm.refineIndividualName = () => {
      $timeout(() => {
        if (
          !vm.addingIndividual &&
          vm.associate_details &&
          !vm.associate_details.individual_id
        ) {
          vm.associate_details.name = undefined;
          vm.individualTextLength = 0;
          $scope.noIndividualResults = false;
        }
      }, 500);
    };

    //Get history details for an attribute value
    $scope.loadHistory = () => {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.associate_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
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

    vm.initializeCompanyAssociate();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
