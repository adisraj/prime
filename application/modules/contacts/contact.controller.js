(function() {
  "use strict";
  angular
    .module("rc.prime.contact")
    .controller("ContactController", ContactController);
  ContactController.$inject = [
    "$scope",
    "common",
    "ContactService",
    "CountryService",
    "CodeService",
    "StatusCodes"
  ];

  function ContactController(
    $scope,
    common,
    ContactService,
    CountryService,
    CodeService,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    vm.returnValue = "";
    vm.entityInformation = {};
    vm.previousContact = {};
    vm.oldContactDetails = {};
    vm.error = {};
    vm.contactPageDetails = {};
    vm.allCountryList = {};
    vm.allContactTypes = {};
    vm.allMarketingOptions = {};
    vm.message = null;
    vm.isShowDetails = false;
    vm.isShowAdd = false;
    vm.contact_details = null;
    vm.isShowHistory = false;

    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;

    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;

    //varibles to update page information
    vm.pageSize = 10;
    vm.rowsCount = 0;
    vm.sortType = "id";
    vm.currentPage = 1;

    vm.uuid = "17";

    vm.isColumnSettingsVisible = false;
    /** Common Modules */
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let loadDynamicTableService = common.LoadDynamicTableService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("ContactController");
    let NotificationService = common.Notification;

    //Set attribute grid properties for show-hide attribute columns
    vm.setGridProperties = () => {
      vm.contactGrid = {
        columns: {
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          country: {
            visible: true
          },
          type: {
            visible: true
          },
          information: {
            visible: true
          },
          hygiene: {
            visible: true
          },
          optin: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    let getDetails = () => {
      $scope.getStatuses(common.Identifiers.entity);
      vm.fetchContactTypes(); //get contact types
      vm.getCodeListData(
        "field_name",
        "Marketing Option",
        "allMarketingOptions"
      ); // get marketing options
      vm.getCountries();
    };

    //to get required information of contact entity
    vm.getEntityInformation = function() {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(
        contact_information => {
          vm.entityInformation = contact_information;
          $scope.name = vm.entityInformation.name;
          getDetails();
        }
      );
    };

    vm.getModelAndSetValidationRules = function() {
      EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    vm.initializeContact = function() {
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.reload();
    };

    //to get all the countries
    vm.getCountries = function() {
      CountryService.API.GetCountries()
        .then(response => {
          vm.allCountryList = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //to get data like contact types, marketing options from code list
    vm.getCodeListData = function(fieldName, fieldValue, model) {
      CodeService.API.SearchCodes(fieldName, fieldValue)
        .then(response => {
          vm[model] = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.fetchContactTypes = () => {
      ContactService.API.GetContactTypes()
        .then(response => {
          vm.allContactTypes = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.validateInformationForType = () => {
      if (vm.contact_details.information) {
        vm.formatError = null;
        _.map(vm.allContactTypes, contactType => {
          if (contactType.id === vm.contact_details.type_id) {
            vm.selectedContactType = contactType.contact_type;
          }
        });
        if (vm.selectedContactType.toLowerCase() === "phone") {
          vm.informationPattern = /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/;
          let isValid = vm.informationPattern.test(
            vm.contact_details.information
          );
          isValid === false
            ? (vm.formatError =
                "Phone number should be of format (XXX)-XXX-XXXX or XXX-XXX-XXXX or XXXXXX-XXXX or XXXXXXXXXX")
            : (vm.formatError = null);
        } else if (vm.selectedContactType.toLowerCase() === "email") {
          vm.informationPattern = /^[a-z]+[a-z0-9._]+@[a-z]+.[a-z.]{2,5}$/;
          let isValid = vm.informationPattern.test(
            vm.contact_details.information
          );
          isValid === false
            ? (vm.formatError =
                "Email should be of format xx@xxx.xx/xx@xxx.xxx")
            : (vm.formatError = null);
        }
      }
    };

    vm.watchers = function() {
      $scope.$watch(
        angular.bind(vm.returnValue, function() {
          return vm.returnValue;
        }),
        function(value) {}
      );
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
      ContactService.API.GetContacts()
        .then(response => {
          vm.rowsCount = response.data.length;
          vm.allContacts = response.data;
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
            vm.isViewAuthorized = false;
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
        angular.element("#country_id").focus();
      }, 0);
    };

    vm.save = function(payload) {
      vm.saveBtnText = "Saving now...";
      ContactService.API.InsertContact(payload)
        .then(response => {
          vm.previousContact = payload;
          vm.saveBtnText = "Save";
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
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
            vm.message = null;
          }, 2500);
        });
      $timeout(() => {
        vm.message = null;
        vm.saveBtnText = "Save";
        vm.saveBtnError = false;
      }, 2500);
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldContactDetails.country_id !== payload.country_id ||
        vm.oldContactDetails.status_id !== payload.status_id ||
        vm.oldContactDetails.type_id !== payload.type_id ||
        vm.oldContactDetails.information !== payload.information ||
        vm.oldContactDetails.hygiene !== payload.hygiene ||
        vm.oldContactDetails.opt_marketing !== payload.opt_marketing
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
        ContactService.API.UpdateContact(payload)
          .then(response => {
            let index = vm.allContacts.findIndex(
              contact => contact.id === payload.id
            );
            vm.allContacts[index] = response.data.data;
            vm.isShowHistory = false;
            vm.updateBtnText = "Done";
            vm.isUpdateSuccess = true;
            vm.oldContactDetails = null;
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.error = true;
            vm.message = error.data.error;
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            $timeout(function() {
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
            }, 2500);
          });
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        $timeout(function() {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    vm.delete = function(payload) {
      ContactService.API.DeleteContact(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.allContacts.findIndex(
            contact => contact.id === payload.id
          );
          vm.allContacts.splice(index, 1);
          $scope.lastPageTableRecordDeleteAction($scope.setinstance);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.error = true;
          vm.message = error.data.error;
        });
    };

    //Show confirmation page on click of delete button
    vm.showconfirm = function() {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    vm.openForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.contact_details = {};
      vm.formatError = null;
      vm.contact_form.$setPristine();
      vm.setInitialState();
    };

    //Create another contact after save
    vm.createAnotherForm = function() {
      vm.isShowDetails = true;
      vm.isShowAdd = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.contact_details = {};
      //Setting Previously entered data to the new context
      vm.contact_details.status_id = vm.previousContact.status_id;
      vm.setInitialState();
    };

    vm.closeForm = function() {
      vm.contact_details = {};
      vm.formatError = null;
      vm.isShowDetails = false;
      vm.saveBtnText = "Save";
      $timeout(function() {
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.dblClickAction = function(contactData) {
      vm.isShowAdd = false;
      vm.showDetailsByID(contactData);
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

    vm.showDetailsByID = function(contactData) {
      vm.contact_details = _.clone(contactData);
      vm.oldContactDetails = _.clone(vm.contact_details);
      vm.validateInformationForType();
      vm.isUnauthorized = false;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
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

    //Get history details for contact
    $scope.loadHistory = function() {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.contact_details.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Close show history panel only
    $scope.closeShowHistory = function() {
      $scope.showhistory = false;
    };

    vm.initializeContact();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
