(function() {
  "use strict";
  angular
    .module("rc.prime.contactsubtypes")
    .controller("ContactTypeController", ContactTypeController);
  ContactTypeController.$inject = [
    "$scope",
    "common",
    "ContactsubtypesService",
    "AS400FieldsRegularExpression"
  ];

  function ContactTypeController($scope, common, ContactsubtypesService,AS400FieldsRegularExpression) {
    let vm = this;
    vm.$scope = $scope;
    vm.saveSubTypeBtnText = "Save";
    vm.updateSubTypeBtnText = "Update";
    vm.sortType = "name";
    let $timeout = common.$timeout;
    vm.isDeleteSuccess = false;
    vm.isSaveSuccess = false;
    vm.isLoaded = false;
    vm.showDependencyDetails = false;
    vm.showErrorDetails = false;
    vm.uuid = "17";
    vm.as400FieldsRegularExpression = AS400FieldsRegularExpression;
    let $q = common.$q;

    vm.initializeCodes = () => {
      // Get permissions of crud operations for contact
      $scope.getAccessPermissions(vm.uuid);
      // to get the contact types
      vm.fetchContactTypes();
    };

    // Function to fetch contact types
    vm.fetchContactTypes = () => {
      vm.allContactTypes = [];
      ContactsubtypesService.API.getContactsTypes()
        .then(response => {
          vm.allContactTypes = response;
          vm.ContactsSubTypes = [];
          vm.getSubTypes();
        })
        .catch(error => {});
    };

     //Focus
     vm.focusSearchField =  () => {
      $timeout(() => {
        angular.element("#inlineSearch").focus();
        },1000)
    };

    // Funtion to fetch  contact sub types
    vm.getSubTypes = (refresh, isCache) => {
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      // check whether isCache is null or undefined, then assigned to false
      if (isCache === undefined || isCache === null) {
        isCache = false;
      }
      vm.templates = [];
      vm.isLoaded = false;
      // to get contact sub types
      ContactsubtypesService.API.GetContactSubTypes()
        .then(response => {
          vm.ContactsSubTypes = response;
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
            vm.focusSearchField();
          }
          vm.isLoaded = true;
          vm.mapContacttype();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true; // isLoaded variable true after api call
          }
          vm.refreshTableText = "Unsuccessfull!";
          vm.isLoaded = true;
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
        });
    };

    // Function to map contact type_id to sub_type
    vm.mapContacttype = () => {
      for (let i = 0; i < vm.ContactsSubTypes.length; i++) {
        for (let j = 0; j < vm.allContactTypes.length; j++) {
          if (vm.allContactTypes[j].id === vm.ContactsSubTypes[i].type_id) {
            vm.ContactsSubTypes[i].name = vm.allContactTypes[j].contact_type;
          }
        }
      }
    };

    // Funtion to open form for create
    vm.openForm = () => {
      vm.isShowcontactTypeDetails = true;
      vm.isAddSubType = true;
      vm.isUpdateSubType = false;
      vm.isSaveSuccess = false;
      vm.contactType_Details = {};
      vm.saveBtnError = false;
      vm.updateBtnError = false;
      vm.showErrorDetails = false;
      vm.showDependencyDetails = false;
      vm.message = "";
      vm.setInitialState();
    };
    // function to save contact sub type
    vm.save = payload => {
      vm.saveSubTypeBtnText = "Saving Now...";
      ContactsubtypesService.API.InsertContactSubType(payload)
        .then(response => {
          vm.isSaveSuccess = true;
          vm.isAddSubType = false;
          payload.id = response.data.id;
          vm.previousState = payload;
          vm.saveSubTypeBtnText = "Save";
          vm.fetchContactTypes();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.saveSubTypeBtnText = "Oops.!! Something went wrong";
          vm.saveStateBtnError = true;
          vm.error = true;
          vm.message = "Record already exists in the table";
          $timeout(() => {
            vm.message = null;
            vm.saveSubTypeBtnText = "Save";
            vm.saveStateBtnError = false;
          }, 2500);
        });
    };
    // update form
    vm.updateForm = subTypeDetails => {
      vm.isShowcontactTypeDetails = true;
      vm.isUpdateSubType = true;
      vm.contactType_Details = _.clone(subTypeDetails);
      vm.oldContactTypeDetails = _.clone(vm.contactType_Details);
      vm.saveBtnError = false;
      vm.updateBtnError = false;
      vm.showErrorDetails = false;
      vm.showDependencyDetails = false;
      vm.message = "";
      vm.setInitialState();
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = payload => {
      if (
        vm.oldContactTypeDetails.type_id !== payload.type_id ||
        vm.oldContactTypeDetails.sub_type !== payload.sub_type
      ) {
        return true;
      } else {
        return false;
      }
    };
    // Function to update the contact sub type changes
    vm.update = payload => {
      vm.updateSubTypeBtnText = "Updating Now...";
      if (vm.hasUpdateChanges(payload) === true) {
        ContactsubtypesService.API.UpdateContactSubType(payload)
          .then(response => {
            vm.updateSubTypeBtnText = "Done";
            vm.isUpdateSubType = false;
            vm.isUpdateSuccess = true;
            vm.oldContactTypeDetails = null;
            vm.fetchContactTypes();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            }
            vm.updateSubTypeBtnText = "Oops.!! Something went wrong";
            vm.updateSubTypeBtnError = true;
            vm.error = true;
            vm.message =
              error.data.error || "Record already exists in the table";
            $timeout(() => {
              vm.saveStateBtnText = "Update";
              vm.updateSubTypeBtnError = false;
              vm.message = null;
              vm.updateSubTypeBtnText = "Update";
            }, 2500);
          });
      } else {
        vm.updateSubTypeBtnText = "Nothing to update";
        vm.updateSubTypeBtnError = true;
        $timeout(() => {
          vm.updateSubTypeBtnText = "Update";
          vm.updateSubTypeBtnError = false;
        }, 1000);
      }
    };
    // Function to get confirmation to delete contact sub type
    vm.showconfirm = subTypeDetails => {
      vm.showDependencyDetails = false;
      vm.isShowcontactTypeDetails = true;
      vm.contactType_Details = _.clone(subTypeDetails);
      vm.isConfirmSubTypeDelete = true;
      vm.isAddSubType = false;
      vm.isUpdateSubType = false;
      vm.showErrorDetails = false;
    };
    // Function to delete contact sub type
    vm.delete = payload => {
      ContactsubtypesService.API.DeleteContactSubType(payload)
        .then(response => {
          vm.isDeleteSuccess = true;
          vm.isDeleteContactTypeSuccess = true;
          vm.oldContactTypeDetails = null;
          vm.isConfirmSubTypeDelete = false;
          vm.fetchContactTypes();
        })
        .catch(error => {
          vm.showDependencyDetails = true;
          if (error.status === 412) {
            vm.showErrorDetails = true;
            vm.error = true;
          } else {
            vm.error = true;
            vm.message = error.data.error;
          }
          common.$timeout(function() {
            vm.message = "";
          }, 2500);
        });
    };
    // To close the form
    vm.closeForm = () => {
      vm.message = null;
      vm.saveSubTypeBtnText = "Save";
      vm.updateSubTypeBtnText = "Update";
      $timeout(() => {
        vm.showDependencyDetails = false;
        vm.isConfirmSubTypeDelete = false;
        vm.isUpdateSubType = false;
        vm.isDeleteContactTypeSuccess = false;
        vm.isShowcontactTypeDetails = false;
        vm.isAddSubType = false;
        vm.isUpdateSuccess = false;
        vm.isDeleteSuccess = false;
        vm.isSaveSuccess = false;
        angular.element("#inlineSearch").focus();
      }, 500);
    };

    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#type_id").focus();
      }, 0);
    };

    vm.watchers = function() {
      $scope.$watch(
        angular.bind(vm.returnValue, function() {
          return vm.returnValue;
        }),
        function(value) {}
      );
    };
    //AVAILABLE STATUS END
    vm.initializeCodes();
    vm.watchers();
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
