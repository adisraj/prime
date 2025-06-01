(function() {
  "use strict";

  angular
    .module("rc.prime.company")
    .controller("CompanyController", CompanyController);
  CompanyController.$inject = [
    "$scope",
    "common",
    "CompanyService",
    "CompanyDepartmentService",
    "AddressContactService",
    "StatusCodes"
  ];

  function CompanyController(
    $scope,
    common,
    CompanyService,
    CompanyDepartmentService,
    AddressContactService,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    vm.returnValue = "";
    vm.companyDescription = "";
    vm.entityInformation = {};
    vm.companyPageDetails = {};
    vm.company_details = {};
    vm.oldCompanyDetails = {};
    vm.previousCompany = {};
    vm.error = {};
    vm.message = null;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.isShowHistory = false;

    vm.isUnauthorized = false;
    vm.isLoaded = false;

    vm.saveBtnText = vm.saveDepartmentBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.issideMenuVisible = false;

    vm.isShowAddDepartment = false;

    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "name";
    vm.currentPage = 1;

    //variables used to show delete dependencies
    vm.showErrorDetails = false;
    vm.showErrorDetailsData = false;
    vm.errorDependentData = {};
    vm.dependencyList = {};

    vm.isColumnSettingsVisible = false;

    vm.uuid = "6";
    vm.department_uuid = "24";

    vm.cmptypes = [];
    /** Common Modules */
    let Identifiers = common.Identifiers;
    let $state = common.$state;
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let NotificationService = common.Notification;
    let logger = common.Logger.getInstance("CompanyController");

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.companyGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          name: {
            visible: true
          },
          shortName: {
            visible: true
          },
          addressContact: {
            visible: true
          },
          departments: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.expandMinimizeSidebar = () => {
      vm.issideMenuVisible = !vm.issideMenuVisible;
    };

    //to get required information of company
    vm.getEntityInformation = function() {
      EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(company_information => {
          vm.entityInformation = company_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.entity);
          vm.reload();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getModelAndSetValidationRules = function(uuid) {
      EntityDetails.API.GetModelAndSetValidationRules(uuid).then(model => {
        //vm.getDynamicColumns(model);
      });
    };

    vm.initializeCompany = function() {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules(vm.uuid);
      vm.getModelAndSetValidationRules(vm.department_uuid);
      vm.setGridProperties();
      vm.reload();
      // Get permissions for Company module
      vm.getPermissionsForUuid("companyPermissions", Identifiers.company);
    };

    // Get permissions for Company module
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

    vm.watchers = function() {
      $scope.$watch(
        angular.bind(vm.returnValue, function() {
          return vm.returnValue;
        }),
        function(value) {}
      );
    };

    vm.save = function(payload) {
      vm.saveBtnText = "Saving now...";
      CompanyService.API.InsertCompany(payload)
        .then(response => {
          vm.previousCompany = payload;
          vm.saveBtnText = "Done";
          vm.isSaveSuccess = true;
          vm.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.message = NotificationService.errorNotification(error);
          $timeout(function() {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
            angular.element("#name").focus();
          }, 2500);
        });
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldCompanyDetails.name !== payload.name ||
        vm.oldCompanyDetails.short_code !== payload.short_code ||
        vm.oldCompanyDetails.status_id !== payload.status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function(payload) {
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        CompanyService.API.UpdateCompany(payload)
          .then(response => {
            let index = vm.allCompanies.findIndex(
              company => company.id === payload.id
            );
            vm.allCompanies[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldCompanyDetails = null;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(function() {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
              angular.element("#name").focus();
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function() {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
          angular.element("#name").focus();
        }, 1000);
      }
    };

    vm.delete = (payload)=> {
      CompanyService.API.DeleteCompany(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allCompanies.findIndex(
            company => company.id === payload.id
          );
          vm.allCompanies.splice(index, 1);
          $scope.lastPageTableRecordDeleteAction($scope.setinstance);
        })
        .catch(error => {
          if(error.data){
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              //vm.message = NotificationService.errorNotification(error);

              //to show list of dependent entities in side panel
              vm.dependencyList = NotificationService.errorNotification(error);
              vm.isUpdateSuccess=false
              vm.showErrorDetails = true;
            }
        }
        });
    };

    //to show details of dependent entity in side panel
    vm.showDependencyListDetails = function(data) {
      $timeout(function() {
        angular.element("#com_depend_close").focus();
      }, 500);      
      vm.errorDependentData = data;
      vm.showErrorDetailsData = true;
    };

    vm.showconfirm = function() {
      vm.isShowHistory = false;
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
    };

    vm.openAddressContactPanel = () => {
      $timeout(() => {
        angular.element("#add_tab").focus();
      }, 500);
      vm.showAddrCnt = true;
      $scope.isShowAddressContactPanel = true;
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("entityName", "Company");
    };

    $scope.closeAddrCntPanel = () => {
      $scope.isShowAddressContactPanel = false;
      $timeout(() => {
        vm.showAddrCnt = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    $scope.openAddressPanel = instanceId => {
      $scope.isShowAddressContactPanel = true;
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    $scope.openContactsPanel = instanceId => {
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    vm.reload = function(refresh) {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      $scope.selectedRow = null;
      vm.isLoaded = false;
      CompanyService.API.GetCompanies()
        .then(response => {
          vm.allCompanies = response;
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
          vm.isLoaded = true;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true; // isLoaded variable true after api call
          }
          logger.error(error);
        });
    };

    vm.gotoDepartments = function(companyId) {
      $state.go("common.prime.company.department", {
        company_id: companyId
      });
    };

    //set focus on first field in form
    vm.setInitialState = function() {
      $timeout(function() {
        angular.element("#name").focus();
      }, 1000);
    };

    vm.focusSearchField = function() {
      $timeout(function() {
        angular.element("#inlineSearch").focus();
      },1000)
    }

    vm.resetForm = function() {
      vm.company_details = {};
      vm.company_details["name"] = null;
      vm.company_details["short_code"] = null;
    };

    vm.openForm = function() {
      vm.saveBtnText = "Save";
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.company_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    //Create an Company after save
    vm.createAnotherForm = function() {
      vm.saveBtnText = "Save";
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.company_details = {};
      //Setting Previously entered data to the new context
      vm.company_details.status_id = vm.previousCompany.status_id;
      vm.setInitialState();
    };

    vm.closeForm = function() {
      vm.message = null;
      vm.isShowDetails = false;
      vm.updateBtnError = false;
      vm.showErrorDetailsData = false;
      vm.isShowDepartmentDetails = false;
      $timeout(function() {
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = function() {
      $timeout(function() {
        angular.element("#close_depen_com").focus();
      }, 500);
      vm.showErrorDetailsData = false;
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = function() {
      $timeout(function() {
        angular.element("#name").focus();
      }, 500);
      vm.showErrorDetailsData = false;
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function(company) {
      $timeout(function() {
        angular.element("#name").focus();
      }, 500);      
      vm.isShowHistory = true;
      vm.showDetailsByID(company);
      vm.isShowDetails = true;
    };

    vm.showDetailsByID = function(company) {
      vm.company_id = company.id;
      vm.company_details = _.clone(company);
      vm.oldCompanyDetails = _.clone(vm.company_details);
      $scope.isShowAddressContactPanel = false; //// close  address and contacts  panel on open of update form
      vm.isUnauthorized = false;
      vm.isShowAdd = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.updateBtnText = "Update";
      vm.getDepartments();
      vm.setInitialState();
      //On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    /***************** Maintain department section - START *******************/
    vm.openCreateDepartmentForm = () => {
      vm.isSaveDepartmentSuccess = false;
      vm.isShowDepartmentDetails = true;
      vm.isShowAddDepartment = true;
      vm.department_details = {};
      $scope.closeShowHistory();
      vm.department_form.$setPristine();
      vm.department_details["name"] = null;
    };

    vm.focusDepartmentAdd = () => {
      $timeout(function() {
        angular.element("#department_name").focus();
      }, 1000);
    }
    
    //Create new department after save
    vm.createAnotherDepartmentForm = function() {
      vm.isSaveDepartmentSuccess = false;
      vm.isShowAddDepartment = true;
      vm.department_details = {};
      $timeout(function() {
        angular.element("#department_name").focus();
      }, 0);
      //Setting previously entered data to the new context
      vm.department_details.status_id = vm.previousDepartment.status_id;
    };

    vm.closeDepartmentForm = () => {
      $timeout(function() {
        angular.element("#name").focus();
      }, 1000);
      vm.isShowDepartmentDetails = false;
    };

    vm.showConfirmDepartmentDelete = details => {
      vm.confirmDepartmentDelete = true;
      vm.department_data = details;
      vm.isShowDepartmentDetails = false;
    };

    //Get departments for a company
    vm.getDepartments = () => {
      vm.departments = [];
      vm.confirmDepartmentDelete = false;
      CompanyDepartmentService.API.GetCompanyDepartmentsByCompanyId(
        vm.company_id
      )
        .then(response => {
          vm.departments = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.addDepartment = payload => {
      payload.company_id = vm.company_id;
      vm.saveDepartmentBtnText = "Saving Now...";
      CompanyDepartmentService.API.InsertCompanyDepartment(payload)
        .then(response => {
          vm.getDepartments();
          vm.previousDepartment = payload;
          vm.saveDepartmentBtnText = "Save";
          vm.isSaveDepartmentSuccess = true;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }

          // if status is 412
          if (error.data.status === 412) {
            vm.saveDepartmentBtnText = "Oops.!! Something went wrong";
            vm.saveDepartmentBtnError = true;
            vm.message = error.data.error.message;
          }
          $timeout(function() {
            vm.saveDepartmentBtnText = "Save";
            vm.saveDepartmentBtnError = false;
            vm.message = null;
            angular.element("#department_name").focus();
          }, 2500);
        });
    };

    vm.deleteDepartment = function(payload) {
      vm.departmentErrorMessage = null;
      vm.departmentMessage = null;
      CompanyDepartmentService.API.DeleteCompanyDepartment(payload)
        .then(response => {
          vm.getDepartments();
          vm.confirmDepartmentDelete = false;
          vm.departmentMessage = "Department deleted successfully!";
        })
        .catch(error => {
          vm.confirmDepartmentDelete = false;
          if (error.status === 403) {
            vm.departmentErrorMessage = "Access denied!";
          } else if (error.status == 412) {
            vm.error = true;
            vm.departmentErrorMessage =
              "Can not be deleted! Department referenced in " +
              error.data.dependency[0].dependent_entity;
          }
        });

      $timeout(function() {
        vm.departmentErrorMessage = null;
        vm.departmentMessage = null;
        angular.element("#name").focus();
      }, 2500);
    };

    /***************** Maintain department section - END *******************/

    //Get history details for company
    $scope.loadHistory = function() {
      $timeout(function() {
        angular.element("#history_close").focus();
      }, 500);
      vm.isShowDepartmentDetails = false;
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.company_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.closeShowHistory = function() {
      $timeout(function() {
        angular.element("#name").focus();
      }, 1000);
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

    vm.initializeCompany();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
    $scope.dblClickAction = vm.dblClickAction;
  }
})();
