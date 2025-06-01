(function() {
  "use strict";
  angular
    .module("rc.prime.company.department")
    .controller("CompanyDepartmentController", CompanyDepartmentController);
  CompanyDepartmentController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "CompanyService",
    "CompanyDepartmentService",
    "AddressContactService",
    "StatusCodes"
  ];

  function CompanyDepartmentController(
    $scope,
    $stateParams,
    common,
    CompanyService,
    CompanyDepartmentService,
    AddressContactService,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    vm.departmentReturnValue = "";
    vm.entityInformation = {};
    vm.departmentPageDetails = {};
    vm.previousDepartment = {};
    vm.oldDepartmentDetails = {};
    vm.isShowDepartmentDetails = false;
    vm.isShowAddDepartment = false;
    vm.department_details = {};

    vm.isUnauthorized = false;
    vm.isLoaded = true;

    vm.saveDepartmentBtnText = "Save";
    vm.saveDepartmentBtnError = false;
    vm.isSaveDepartmentSuccess = false;
    vm.updateDepartmentBtnText = "Update";
    vm.updateDepartmentBtnError = false;
    vm.isUpdateDepartmentSuccess = false;
    vm.isConfirmDepartmentDelete = false;
    vm.isDeleteDepartmentSuccess = false;

    //variables used to show delete dependencies
    vm.showErrorDetails = false;
    vm.showErrorDetailsData = false;
    vm.errorDependentData = {};
    vm.dependencyList = {};

    vm.isColumnSettingsVisible = false;

    vm.pageSize = 100;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    vm.depttypes = [];

    vm.uuid = "24";

    /** Common Modules */
    let Identifiers = common.Identifiers;
    let $timeout = common.$timeout;
    let $state = common.$state;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("CompanyDepartmentController");

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.companyDepartmentGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          departmentName: {
            visible: true
          },
          addressContact: {
            visible: true
          },
          associates: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.ShowHideColumnSettings = () => {
      $timeout(function() {
        angular.element("#hide_show_coloumn").focus();
      }, 500);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //to get required information of company departments
    vm.getEntityInformation = function() {
      EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(company_department_information => {
          vm.entityInformation = company_department_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.entity);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(model => {
        //vm.getDynamicColumns(model);
      });
    };

    vm.initializeCompanyDepartment = function() {
      vm.company_id = $stateParams.company_id;
      // Get access permission of crud oprations for department
      vm.getPermissionsForUuid(
        "departmentPermissions",
        Identifiers.company_department
      );
      vm.getSelectedCompany();
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.reload();
    };

    // Get access permission of crud oprations for department
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

    vm.getSelectedCompany = () => {
      CompanyService.API.GetCompanyById(vm.company_id)
        .then(response => {
          vm.selectedCompany = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.watchers = function() {
      $scope.$watch(
        angular.bind(vm.departmentReturnValue, function() {
          return vm.departmentReturnValue;
        }),
        function(value) {}
      );
    };

    vm.save = function(payload) {
      payload.company_id = vm.company_id;
      vm.saveDepartmentBtnText = "Saving Now...";
      CompanyDepartmentService.API.InsertCompanyDepartment(payload)
        .then(response => {
          vm.reload();
          vm.previousDepartment = payload;
          vm.saveDepartmentBtnText = "Save";
          vm.isSaveDepartmentSuccess = true;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveDepartmentBtnText = "Oops.!! Something went wrong";
          vm.saveDepartmentBtnError = true;
          vm.error = true;
          vm.message = error.data.error.message;
          $timeout(function() {
            vm.message = null;
            vm.saveDepartmentBtnText = "Save";
            vm.saveDepartmentBtnError = false;
            angular.element("#name").focus();
          }, 2500);
        });
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldDepartmentDetails.name !== payload.name ||
        vm.oldDepartmentDetails.status_id !== payload.status_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function(payload) {
      vm.updateDepartmentBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        CompanyDepartmentService.API.UpdateCompanyDepartment(payload)
          .then(response => {
            let index = vm.departments.findIndex(
              department => department.id === payload.id
            );
            vm.departments[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateDepartmentBtnText = "Done";
            vm.isUpdateDepartmentSuccess = true;
            vm.oldDepartmentDetails = null;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.updateDepartmentBtnText = "Oops.!! Something went wrong";
            vm.updateDepartmentBtnError = true;
            vm.error = true;
            vm.message = error.data.error.message;
            $timeout(function() {
              vm.message = null;
              vm.updateDepartmentBtnText = "Update";
              vm.updateDepartmentBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateDepartmentBtnText = "Nothing to update";
        vm.updateDepartmentBtnError = true;
        $timeout(function() {
          vm.updateDepartmentBtnText = "Update";
          vm.updateDepartmentBtnError = false;
          angular.element("#name").focus();
        }, 1000);
      }
    };

    vm.delete = function(payload) {
      CompanyDepartmentService.API.DeleteCompanyDepartment(payload)
        .then(response => {
          vm.isDeleteDepartmentSuccess = true;
          vm.isConfirmDepartmentDelete = false;
          let index = vm.departments.findIndex(
            department => department.id === payload.id
          );
          vm.departments.splice(index, 1);
          vm.rowsCount = vm.departments.length;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            vm.message = error.data.error;

            //to show list of dependent entities in side panel
            vm.dependencyList = error.data.dependency;
            vm.showErrorDetails = true;
          }
        });
    };

    //to show details of dependent entity in side panel
    vm.showDependencyListDetails = function(data) {
      vm.errorDependentData = data;
      vm.showErrorDetailsData = true;
    };

    vm.showconfirm = function() {
      vm.isShowHistory = false;
      vm.isConfirmDepartmentDelete = true;
      vm.isUnauthorized = false;
    };

    vm.reload = function(refresh) {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.isLoaded = false;
      $scope.selectedRow = null;
      CompanyDepartmentService.API.GetCompanyDepartmentsByCompanyId(
        vm.company_id
      )
        .then(response => {
          vm.departments = response;
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
              angular.element("#inlineSearch").focus();
            }, 3500);
          }

          vm.isLoaded = true;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true; // isLoaded variable true after api call
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
    vm.setInitialState = function() {
      $timeout(function() {
        angular.element("#name").focus();
      }, 0);
    };

    vm.focusSearchField = function() {
      $timeout(function() {
        angular.element("#inlineSearch").focus();
      },1000)
    }

    vm.resetForm = function() {
      vm.department_details = {};
      vm.department_details["name"] = null;
    };

    vm.openAddressContactPanel = () => {
      $timeout(() => {
        angular.element("#add_tab").focus();
      }, 500);
      vm.showAddrCnt = true;
      $scope.isShowAddressContactPanel = true;
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("entityName", "Department");
    };

    $scope.closeAddrCntPanel = () => {
      $scope.isShowAddressContactPanel = false;
      $timeout(() => {
        vm.showAddrCnt = false;
        angular.element("#inlineSearch").focus();
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

    vm.openForm = function() {
      vm.isShowDepartmentDetails = true;
      vm.isShowAddDepartment = true;
      vm.isConfirmDepartmentDelete = false;
      vm.department_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    //Create new department after save
    vm.createAnotherForm = function() {
      vm.isSaveDepartmentSuccess = false;
      vm.isShowAddDepartment = true;
      vm.department_details = {};
      vm.setInitialState();
      //Setting previously entered data to the new context
      vm.department_details.status_id = vm.previousDepartment.status_id;
    };

    vm.closeForm = function() {
      vm.message = null;
      vm.isShowDepartmentDetails = false;
      vm.saveDepartmentBtnText = "Save";
      vm.updateDepartmentBtnText = "Update";
      vm.updateDepartmentBtnError = false;
      vm.showErrorDetailsData = false;
      $timeout(function() {
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteDepartmentSuccess = false;
        vm.isSaveDepartmentSuccess = false;
        vm.isUpdateDepartmentSuccess = false;
        vm.isConfirmDepartmentDelete = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = function() {
      vm.showErrorDetailsData = false;
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = function() {
      vm.showErrorDetailsData = false;
      vm.showErrorDetails = false;
      vm.isConfirmDepartmentDelete = false;
      vm.isShowHistory = true;
    };

    vm.gotoAssociates = departmentId => {
      $state.go("common.prime.company.department.associate", {
        company_id: vm.company_id,
        department_id: departmentId
      });
    };

    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function(department) {
      vm.isShowAddDepartment = false;
      vm.showDetailsByID(department);
      vm.oldDepartmentDetails = _.clone(vm.department_details);
    };

    vm.showDetailsByID = function(department) {
      vm.department_details = _.clone(department);
      $scope.isShowAddressContactPanel = false; // close  address and contacts  panel on open of update form
      vm.isUnauthorized = false;
      vm.isShowHistory = true;
      vm.isShowDepartmentDetails = true;
      vm.isShowAddDepartment = false;
      vm.isConfirmDepartmentDelete = false;
      vm.isSaveDepartmentSuccess = false;
      vm.isUpdateDepartmentSuccess = false;
      vm.isDeleteDepartmentSuccess = false;
      vm.updateDepartmentBtnText = "Update";
      vm.setInitialState();
      //On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    //Get history details for an attribute value
    $scope.loadHistory = function() {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.department_details.id
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
      $scope.showhistory = false;
      $timeout(function() {
        angular.element("#name").focus();
      }, 500);
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

    vm.initializeCompanyDepartment();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
