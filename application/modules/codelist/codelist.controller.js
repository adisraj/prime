(function () {
  "use strict";
  angular
    .module("rc.prime.codes")
    .controller("CodeListController", CodeListController);
  CodeListController.$inject = [
    "$scope",
    "CodeService",
    "common",
    "EntityService"
  ];

  function CodeListController($scope, CodeService, common, EntityService) {
    let vm = this;
    vm.returnValue = "";
    vm.entityInformation = {};
    vm.codePageDetails = {};
    vm.allEntities = {};
    vm.error = {};
    vm.previousCode = {};
    vm.message = null;
    vm.code_details = {};
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.isShowHistory = false;

    vm.isUnauthorized = false;
    vm.isLoaded = false;

    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;

    //variables used to show delete dependencies
    vm.showErrorDetails = false;
    vm.errorDependentData = {};

    vm.uuid = "51";

    vm.isColumnSettingsVisible = false;
    vm.sortType = "entity";
    vm.currentPage = 1;
    vm.pageSize = 100;

    /** Common Modules */
    let $timeout = common.$timeout;
    let ApplicationPermissions = common.ApplicationPermissions;
    let EntityDetails = common.EntityDetails;
    let NotificationService = common.Notification;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("CodeListController");

    // To hide and show the table columns
    vm.setGridProperties = () => {
      vm.codelistGrid = {
        columns: {
          id: {
            visible: false
          },
          entity: {
            visible: true
          },
          fieldname: {
            visible: true
          },
          code: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    //to get required information of code entity
    vm.getEntityInformation = function () {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(code_information => {
        vm.entityInformation = code_information;
        $scope.name = vm.entityInformation.name;
      });
    };

    vm.getModelAndSetValidationRules = function () {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(
        model => {}
      );
    };

    vm.initializeCodes = function () {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.getEntities();
      vm.getMasterEntitiesAndEntitiesByUuids();
      vm.setGridProperties();
      vm.reload(undefined, true);
      $scope.getAccessPermissions(vm.uuid);
    };

    //get all the entities for Entity dropdown
    vm.getEntities = function () {
      vm.allEntities = [];
      let entity_data = JSON.parse(LocalMemory.API.Get("entity_data"));
      if (entity_data && entity_data.length > 0) {
        vm.allEntities = entity_data;
      } else {
        EntityService.API.GetAllEntities()
          .then(response => {
            vm.allEntities = response;
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.watchers = function () {
      $scope.$watch(
        angular.bind(vm.returnValue, function () {
          return vm.returnValue;
        }),
        function (value) {}
      );
    };

    vm.save = function (payload) {
      vm.saveBtnText = "Saving now...";
      CodeService.API.InsertCode(payload)
        .then(response => {
          vm.previousCode = payload;
          vm.saveBtnText = "Save";
          vm.isSaveSuccess = true;
          payload.id = response.data.inserted_id;
          vm.allCodes.push(payload);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = true;
          vm.message = NotificationService.errorNotification(error);
          $timeout(function () {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = function (payload) {
      if (
        vm.oldCodeDetails.entity_id !== payload.entity_id ||
        vm.oldCodeDetails.field_name !== payload.field_name ||
        vm.oldCodeDetails.code !== payload.code
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = function (payload) {
      vm.updateBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        $scope.showhistory = false;
        CodeService.API.UpdateCode(payload)
          .then(response => {
            payload.$edit = false;
            vm.reload();
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldCodeDetails = null;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = NotificationService.errorNotification(error);
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(function () {
              vm.message = null;
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function () {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.delete = function (payload) {
      CodeService.API.DeleteCode(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          vm.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.error = true;
          //to show list of dependent entities in side panel
          vm.dependencyList = error.data.dependency;
          vm.showErrorDetails = true;
        });
    };

    //Show confirmation page on click of delete button
    vm.showconfirm = function () {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
    };

    vm.reload = function (refresh, isCache) {
      vm.isLoaded = false;
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      if (isCache === undefined || isCache === null) {
        isCache = false;
      }
      $scope.selectedRow = null;
      CodeService.API.GetCodesList(isCache)
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allCodes = response.data;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.length;
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
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
    };

    vm.focusSearchField = function () {
      $timeout(function () {
      angular.element("#inlineSearch").focus();
      },1000)
    }

    //set focus on first field in form
    vm.setInitialState = function () {
      $timeout(function () {
        angular.element("#entity_id").focus();
      }, 0);
    };

    vm.resetForm = function () {
      vm.code_details = {};
      vm.code_details["field_name"] = null;
      vm.code_details["code"] = null;
    };

    vm.openForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.code_form.$setPristine();
      vm.setInitialState();
      vm.resetForm();
    };

    //Create an code after save
    vm.createAnotherForm = function () {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.code_details = {};
      //Setting Previously entered data to the new context
      vm.code_details.entity_id = vm.previousCode.entity_id;
      vm.code_details.entity = vm.previousCode.entity;
      vm.setInitialState();
    };

    vm.closeForm = function () {
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      $timeout(function () {
        vm.isUnauthorized = false;
        vm.showErrorDetails = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    //show update form and hide dependencies list and dependency details side panel
    vm.closeDependencyList = function () {
      vm.showErrorDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    vm.ShowHideColumnSettings = () => {
      $timeout(function () {
        angular.element("#hide_show_column").focus();
      }, 1000);
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    vm.updateTableInformation = currentPage => {
      let initalCount;
      if (vm.rowsCount === 0) {
        initalCount = 0;
      } else {
        initalCount = 1;
      }
      if (currentPage === 1) {
        vm.rowsInfo =
          "Displaying " +
          initalCount +
          "-" +
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

    vm.setClickedRow = function (index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function (codeData) {
      vm.isShowAdd = false;
      vm.showDetailsByID(codeData);
    };

    vm.showDetailsByID = function (codeData) {
      vm.code_details = _.clone(codeData);
      vm.oldCodeDetails = _.clone(vm.code_details);
      vm.isUnauthorized = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.showErrorDetails = false;
      vm.isShowHistory = true;
      vm.updateBtnText = "Update";
      vm.setInitialState();
      vm.isShowDetails = true;
      //On double click, data lake panel closes
      $scope.$broadcast("showMetaDataPanel", {
        panel: false,
        moduleInfo: vm.entityInformation
      });
    };

    //Get history details for codes
    $scope.loadHistory = function () {
      EntityDetails.API.GetHistoryData(
          vm.entityInformation.uuid,
          vm.code_details.id
        )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    $scope.closeShowHistory = function () {
      $timeout(function () {
        angular.element("#entity_id").focus();
      }, 1000); 
      $scope.showhistory = false;
    };

    //AVAILABLE STATUS START

    //Get Entity to load status
    vm.getMasterEntitiesAndEntitiesByUuids = () => {
      let uuids = 21 + "," + 27;
      EntityService.API.GetMasterEntitiesAndEntitiesByUuid(uuids)
        .then(response => {
          vm.entities = response;
          vm.getStatusForEntity(vm.entities[0], 0);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getStatusForEntity = (entity, index) => {
      vm.selectedRow = index;
      EntityDetails.API.GetEntityInformation(entity.uuid)
        .then(entity_details => {
          CodeService.API.GetStatuses(
              entity_details.serviceName,
              entity_details.baseurl
            )
            .then(response => {
              vm.statuses = response;
            })
            .catch(error => {
              logger.error(error);
            });
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //AVAILABLE STATUS END
    vm.initializeCodes();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();