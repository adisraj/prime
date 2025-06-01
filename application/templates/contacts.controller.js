(function() {
  "use strict";

  angular
    .module("calculus")
    .controller("ContactsController", ContactsController);

  ContactsController.$inject = [
    "$scope",
    "AddressContactService",
    "common",
    "valdr",
    "StatusCodes",
    "AS400FieldsRegularExpression"
  ];

  function ContactsController(
    $scope,
    AddressContactService,
    common,
    valdr,
    StatusCodes,
    AS400FieldsRegularExpression
  ) {
    var vm = this;
    vm.statusCodes = StatusCodes;
    let $timeout = common.$timeout;
    let $filter = common.$filter;
    let logger = common.Logger.getInstance("ContactsController");
    vm.addBtnLabel = "Add Contact";
    vm.isContactSectionVisisble = false;
    vm.saveBtnError = false;
    vm.isLoaded = true;
    vm.saveBtnText = "Save";
    vm.updateBtnText = "Update";
    vm.contactSubTypes = [];
    vm.isSaveSuccess = false;
    vm.isUpdateSuccess = false;
    vm.isDeleteSuccess = false;
    vm.as400FieldsRegularExpression = AS400FieldsRegularExpression;
    //on click of add contact botton, form will be opened
    vm.displayContactSection = () => {
      $timeout(() => {
      angular.element("#status_id").focus();
      }, 500);
      if (vm.contact_details) {
        vm.contact_details[vm.currentIndex] = false;
      }
      vm.contact_details = {};
      vm.contact_details.status_id = 200; //default status: active
      vm.isContactSectionVisisble = !vm.isContactSectionVisisble;
      !vm.isContactSectionVisisble
        ? (vm.addBtnLabel = "Add Contact")
        : (vm.addBtnLabel = "Close"); //change button label based on create form open or closed
      if (vm.isContactSectionVisisble && !vm.contactTypes) {
        vm.getContactTypes();
      }
      $scope.getStatuses(common.Identifiers.entity);
      vm.getContactSubType();
    };

    vm.getContactTypes = () => {
      AddressContactService.API.GetContactTypes()
        .then(response => {
          vm.contactTypes = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getContactsList = refresh => {
      vm.message = null;
      vm.errorMessage = null;
      vm.isLoaded = false;
      vm.uuid = AddressContactService.API.GetVariable("uuid");
      vm.instance_id = AddressContactService.API.GetVariable("instance_id");
      vm.entityName = AddressContactService.API.GetVariable("entityName");
      AddressContactService.API.GetContactsList(vm.uuid, vm.instance_id)
        .then(response => {
          vm.contactsList = response;
         for (let index = 0; index < vm.contactsList.length; index++) {
          for(let i =0 ;i<vm.contactSubTypes.length;i++){
            if(vm.contactsList[index].sub_type_id === vm.contactSubTypes[i].id && vm.contactsList[index].type_id === vm.contactSubTypes[i].type_id){
              vm.contactsList[index].sub_type = vm.contactSubTypes[i].sub_type
            }
          }
        };               
          vm.isLoaded = true;
          if (refresh !== undefined) {
            vm.message = "Successfully refreshed!";
          }
        })
        .catch(error => {
          if (refresh !== undefined) {
            vm.errorMessage = "Unsuccessfull!";
          }
          vm.isLoaded = true;
          logger.error(error);
        });

      $timeout(() => {
        vm.message = null;
        vm.errorMessage = null;
      }, 2500);
    };

    vm.getContactSubType = () => {
      AddressContactService.API.GetContactSubType().then(response => {
        vm.contactSubTypes = response;
      });
    };

    vm.save = data => {
      // check whether the contact exist for current department
      for (let i = 0; i < vm.contactsList.length; i++) {
        if (vm.contactsList[i].information === data.information) {
          return new Promise((resolve, reject) => {
            let error = {};
            vm.saveBtnText = "Oops.!! Something went wrong";
            vm.saveBtnError = true;
            vm.isLoaded = false;
            vm.errorMessage = "Record already exist in the table";
            vm.recordExist = true;
            $timeout(function() {
              vm.saveBtnText = "Save";
              vm.isLoaded = true;
              vm.errorMessage = null;
              vm.saveBtnError = false;
              vm.message = null;
              vm.recordExist = false;
            }, 2500);
          });
        } else {
          vm.recordExist = false
        }
      }
      if (!vm.recordExist) {
        vm.saveContact(data);
      }
    };

    // To Save the contact
    vm.saveContact = contactDetails => {
      vm.isSaveSuccess = false;
      vm.message = null;
      vm.errorMessage = null;
      contactDetails.uuid = vm.uuid;
      contactDetails.instance_id = vm.instance_id;
      vm.saveBtnText = "Saving Now...";
      vm.isLoaded = false;
      if (contactDetails.contact_type.toLowerCase() === "phone") {
        contactDetails.country_id = 237;
      } else {
        contactDetails.country_id = null;
      }
      AddressContactService.API.InsertContactByUuidAndInstance(contactDetails)
        .then(response => {
          vm.saveBtnText = "Save";
          vm.getContactsList();
          // vm.message = response.data.message;
          vm.isSaveSuccess = true;
          vm.contact_details = {};
          vm.contact_details.status_id = 200; //default status: active
          contactDetails.contact_id = response.data.inserted_id;
          vm.contactsList.push(contactDetails);
          vm.isLoaded = true;
          $timeout(function() {
            vm.saveBtnText = "Save";
            vm.isLoaded = true;
            vm.errorMessage = null;
            vm.saveBtnError = false;
            // vm.message = null;
          }, 2500);
        })
        .catch(error => {
          vm.saveBtnText = "Save";
          vm.saveBtnError = false;
          vm.isLoaded = false;
          // if status is 412
          if (error.data.status === 412) {
            vm.existing_contact_id = error.data.error.existing_contact_id;
            vm.showLinkContactsection = true; // If the contact exist then show the link section
          } else {
            vm.saveBtnText = "Oops.!! Something went wrong";
            vm.saveBtnError = true;
            vm.isLoaded = false;
            vm.errorMessage = "Invalid email!";
            reject(error);
            $timeout(function() {
              vm.saveBtnText = "Save";
              vm.isLoaded = true;
              vm.errorMessage = null;
              vm.saveBtnError = false;
              // vm.message = null;
            }, 2500);
          }
        });
    };

    vm.closeForm = () => {
      $scope.isShowContactsPanel = true;
      vm.showContacts = true;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
    }

    // link the existing contact to new department
    vm.saveContactLink = data => {
      data.existing_contact_id = vm.existing_contact_id;
      data.uuid = vm.uuid;
      data.instance_id = vm.instance_id;
      AddressContactService.API.LinkContact(data)
        .then(response => {
          vm.getContactsList();
          vm.message = "contact linked Successfully";
          vm.contact_details = {};
          vm.showLinkContactsection = false;
        })
        .catch(error => {
          logger.error(error);
        });
      $timeout(function() {
        vm.saveBtnText = "Save";
        vm.isLoaded = true;
        vm.errorMessage = null;
        vm.saveBtnError = false;
        vm.message = null;
      }, 2500);
    };

    vm.focusContactTab = () => {
      $timeout(function() {
        angular.element("#cont_tab").focus();
      }, 1000);
    };

    vm.displayUpdateForm = (contactDetails, flag, index) => {
      $timeout(function() {
        angular.element("#status_id").focus();
      }, 500);
      vm.getContactSubType();
      vm.oldContact = contactDetails;
      contactDetails[index] = flag;
      vm.contact_details = JSON.parse(JSON.stringify(contactDetails));
      vm.isContactSectionVisisble = false;
      vm.addBtnLabel = "Add Contact";
      vm.addValidationRules();
      if (vm.currentIndex !== undefined && vm.currentIndex !== index) {
        vm.closeUpdateForm(vm.contact_details, vm.currentIndex);
        delete vm.contact_details[vm.currentIndex];
        vm.currentIndex = index;
      } else {
        vm.currentIndex = index;
      }

      if (!vm.contactTypes) {
        vm.getContactTypes();
      }
    };

    vm.closeUpdateForm = (contactDetails, index) => {
      $timeout(() => {
        angular.element("#cont_tab").focus();
        }, 500);
      contactDetails[index] = false;
    };

    vm.hasUpdateChanges = payload => {
      if (
        vm.oldContact.type_id !== payload.type_id ||
        vm.oldContact.sub_type_id !== payload.sub_type_id ||
        vm.oldContact.status_id !== payload.status_id ||
        vm.oldContact.information !== payload.information
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = contactDetails => {
      // vm.message = null;
      vm.isUpdateSuccess = false;
      vm.errorMessage = null;
      if (vm.hasUpdateChanges(contactDetails) === true) {
        vm.updateBtnText = "Updating...";
        vm.isLoaded = false;
        let obj = {
          id: contactDetails.contact_id,
          instance_id: vm.instance_id,
          uuid: vm.uuid,
          type_id: contactDetails.type_id,
          sub_type_id: contactDetails.sub_type_id,
          status_id: contactDetails.status_id,
          country_id: contactDetails.country_id || 237,
          /* checking country id for duplicate email contact */
          information: contactDetails.information
        };
        AddressContactService.API.UpdateContactById(obj)
          .then(response => {
            //vm.getContactsList();
            contactDetails[vm.currentIndex] = false;
            // get the sub_type
            for(let i =0 ;i<vm.contactSubTypes.length;i++){
              if(contactDetails.sub_type_id === vm.contactSubTypes[i].id && contactDetails.type_id === vm.contactSubTypes[i].type_id){
                contactDetails.sub_type = vm.contactSubTypes[i].sub_type
              }
            }
            vm.contactsList[vm.currentIndex] = contactDetails;
            // vm.message = response.data.message;
            vm.isUpdateSuccess = true;
            vm.isLoaded = true;
            vm.updateBtnText = "Update";
          })
          .catch(error => {
            if (error.status === 505) {
              vm.updateBtnText = "Update";
              vm.isLoaded = false;
              vm.errorMessage = "Invalid email!";
              $timeout(function() {
                vm.updateBtnText = "Update";
                vm.isLoaded = true;
                vm.errorMessage = null;
                // vm.message = null;
              }, 2500);
            } else {
              vm.errorMessage = error.data.error.error;
              vm.isLoaded = true;
              vm.updateBtnText = "Update";
              logger.error(error);
            }
          });
      } else {
        vm.errorMessage = "Nothing to change !";
      }

      $timeout(() => {
        // vm.message = null;
        vm.errorMessage = null;
      }, 3500);
    };

    vm.delete = id => {
      // vm.message = null;
      vm.isDeleteSuccess = false;
      vm.errorMessage = null;
      let obj = {
        contactId: id,
        instance_id: vm.instance_id,
        uuid: vm.uuid
      };
      AddressContactService.API.DeleteContactLink(obj)
        .then(response => {
          vm.getContactsList();
          // vm.message = response.data.message;
          vm.isDeleteSuccess = true;
        })
        .catch(error => {
          vm.errorMessage = "Unable to delete!";
          logger.error(error);
        });

      $timeout(() => {
        // vm.message = null;
        vm.errorMessage = null;
      }, 3500);
    };

    vm.addValidationRules = function() {
      let obj = {};
      let constraints = [];
      if (
        vm.contact_details.contact_type.toLowerCase() === "phone" ||
        vm.contact_details.contact_type.toLowerCase() === "mobile"
      ) {
        constraints["information"] = {
          phone_number: {
            value: "/^(?(d{3}))?[- ]?(d{3})[- ]?(d{4})$/",
            message:
              "Invalid " +
              vm.contact_details.contact_type +
              " number (E.g (308)-135-7895 or 308-135-7895 or 308135-7895 or 3081357895)"
          }
        };
        obj["CONTACT-RULES"] = constraints;
      } else if (vm.contact_details.contact_type.toLowerCase() === "email") {
        constraints["information"] = {
          pattern: {
            value: /^[_a-zA-Z0-9]+(.[_a-zA-Z0-9]+)*@[a-zA-Z0-9-]*.([a-zA-Z]{2,3})$/,
            message: "Invalid email! E.g (xx@xxx.xxx)"
          }
        };
        obj["CONTACT-RULES"] = constraints;
      }
      valdr.addConstraints(obj);
    };

    activate();

    function activate() {
      vm.getContactSubType();
    }
  }
})();
