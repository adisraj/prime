(function() {
  "use strict";

  angular.module("calculus").controller("AddressController", AddressController);

  AddressController.$inject = [
    "$scope",
    "AddressContactService",
    "CountryService",
    "EntityService",
    "common",
    "StatusCodes"
  ];

  function AddressController(
    $scope,
    AddressContactService,
    CountryService,
    EntityService,
    common,
    StatusCodes
  ) {
    var vm = this;
    vm.statusCodes = StatusCodes;
    let $timeout = common.$timeout;
    let logger = common.Logger.getInstance("AddressController");
    vm.addBtnLabel = "Add Address";
    vm.saveBtnError = false;
    vm.isLoaded = true;
    //to show message that cities are getting loaded
    vm.isLoadingCities = false;
    vm.saveBtnText = "Save";
    vm.updateBtnText = "Update";
    vm.address_form = {};
    vm.addressTypesMap = [];
    vm.citiesMap = {};
    vm.regionsMap = {};
    let isAddressCached = true;
    vm.isSaveSuccess = false;
    vm.isUpdateSuccess = false;
    vm.isDeleteSuccess = false;

    vm.initializeRegionsDropdown = () => {
      // Initializing object for regions Selcetize dropdown

      $scope.selectRegionList = {
        valueField: "id",
        labelField: "region_name",
        searchField: ["region_name"],
        sortField: "region_name",
        placeholder: "Select Region" + "  ", // space is given because last 2 letters are getting cut off.
        allowEmptyOption: true,
        create: false,
        hideSelected: true,
        highlight: false,
        searchConjunction: "or",
        options: this.allRegions,
        render: {
          option: (data, escape) => {
            return (
              '<div class="option-row department">' +
              '<div class="m-b-5">' +
              '<span class="f-500">' +
              data.region_name +
              "</span>" +
              "</div>" +
              "</div>"
            );
          },
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title">' +
              data.region_name +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vm.initializeCitiesDropdown = model => {
      // Initializing object for city Selcetize dropdown
      $scope.selectCitiesList = {
        valueField: "id",
        labelField: "city_name",
        searchField: ["city_name"],
        sortField: "city_name",
        placeholder: "Select City" + "  ", // space is given because last 2 letters are getting cut off.
        allowEmptyOption: true,
        create: false,
        hideSelected: true,
        highlight: false,
        searchConjunction: "or",
        options: model,
        render: {
          option: (data, escape) => {
            return (
              '<div class="option-row department">' +
              '<div class="m-b-5">' +
              '<span class="f-500">' +
              data.city_name +
              "</span>" +
              "</div>" +
              "</div>"
            );
          },
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title">' +
              data.city_name +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    //on click of add address botton, form will be opened
    vm.displayAddressSection = () => {
      $timeout(() => {
      angular.element("#status_id").focus();
      }, 500);
      vm.isUpdateSuccess = false;
      vm.isSaveSuccess = false;
      if (vm.address_details) {
        vm.address_details[vm.currentIndex] = false;
      }
      vm.address_details = {};

      //set address values by defualt
      vm.address_details.country_id = 237; //default country: USA
      vm.address_details.status_id = 200; //default status: active
      vm.address_details.type_id = 2; //default address type:Business

      vm.isAddressSectionVisisble = !vm.isAddressSectionVisisble; // toggle address form section
      for (let k = 0; k < vm.addressList.length; k++) {
        if (vm.addressList[k][k]) {
          vm.addressList[k][k] = false;
        }
      }
      !vm.isAddressSectionVisisble
        ? (vm.addBtnLabel = "Add Address")
        : (vm.addBtnLabel = "Close"); //change button label based on create form open or closed

      if (vm.isAddressSectionVisisble && !vm.addressTypes && !vm.countries) {
        vm.getAddressTypes();
        vm.getCountryList();
      } else {
        vm.address_details.address_type =
          vm.addressTypesMap[vm.address_details.type_id].address_type;
      }
      if (!vm.allRegions) {
        vm.getRegions(vm.address_details.country_id);
      }

      $scope.getStatuses(common.Identifiers.entity);
    };

    vm.closeAddressSection = () => {
      $timeout(() => {
        vm.addBtnLabel = "Add Address";
        vm.isAddressSectionVisisble = false;
        vm.address_details = {};
      }, 500);
    };

    //get list of address types
    vm.getAddressTypes = () => {
      AddressContactService.API.GetAddressTypes()
        .then(response => {
          vm.addressTypes = response;

          //map address types as key,value pair where key:id
          for (let i = 0; i < response.length; i++) {
            if (vm.addressTypesMap[response[i].id] === undefined) {
              vm.addressTypesMap[response[i].id] = response[i];
            }
          }
          vm.address_details.address_type =
            vm.addressTypesMap[vm.address_details.type_id].address_type;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getCountryList = () => {
      CountryService.API.GetCountries()
        .then(response => {
          vm.countries = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // function to get the address and Assign the values to state,city,and address
    vm.setValues = selectedAddress => {
      vm.address_details.region_name === undefined
        ? (vm.address_details.region_name = {})
        : null;
      vm.address_details.region_name = undefined;

      vm.address_details.city_name === undefined
        ? (vm.address_details.city_name = {})
        : null;
      vm.address_details.city_name = undefined;

      vm.address_details.address === undefined
        ? (vm.address_details.address = {})
        : null;
      vm.address_details.address = undefined;
      vm.address_details.address_type =
          vm.addressTypesMap[vm.address_details.type_id].address_type;
      // variable used to show state field
      vm.isShowcontactRegions = false;
      // variable used to show city field
      vm.isShowcontactCities = false;
      // variable used to show address field
      vm.isShowcontactAddress = false;
      // check whether selectedAddress having address or not
      if (selectedAddress) {
        if (selectedAddress.Postalcode) {
          // Assigning address_details.zipcode with Postalcode
          vm.address_details.zipcode = selectedAddress.Postalcode;

          if (selectedAddress.State) {
            // Assigning address_details.region_name with StateName
            vm.address_details.region_name = selectedAddress.StateName;
            vm.isShowcontactRegions = true;
            // allRegions contains all the region details of current country
            for (let i = 0; i < vm.allRegions.length; i++) {
              // check whether the both state codes are equal or not
              if (selectedAddress.State === vm.allRegions[i].region_code) {
                // Assigning region_id
                vm.address_details.region_id = vm.allRegions[i].id;
              }
            }
          }
          if (selectedAddress.City) {
            // Assigning address_details.city_name with City
            vm.address_details.city_name = selectedAddress.City;
            vm.isShowcontactCities = true;
            // get all cities under the current region
            AddressContactService.API.GetCitiesByRegion(
              vm.address_details.region_id
            )
              .then(response => { 
                for (let i = 0; i < response.length; i++) {
                  // check whether both city are equal
                  if (selectedAddress.City === response[i].city_name) {
                    // Assign city_id value
                    vm.address_details.city_id = response[i].id;
                  }
                }
                // If city is not found, create city 
                if(!vm.address_details.city_id){
                  let cityDetail = {
                    region_id : vm.address_details.region_id,
                    city_name : selectedAddress.City
                  }
                  AddressContactService.API.InsertCity(cityDetail) 
                  .then(res => {
                    vm.address_details.city_id = response.data.data.id;
                    response.push(res.data.data);
                  })
                }
                this.isLoadingCities = false;
                // get all city list under the region
                this.regional_citiesList = response;
              })
              .catch(error => {
                logger.error(error);
              });
          } else {
            vm.address_details.city_id = null;
            vm.address_details.city_name = null;
          }
        }
      }
    };

    vm.getAddressList = refresh => {
      vm.isLoaded = false;
      vm.message = null;
      vm.errorMessage = null;
      vm.uuid = AddressContactService.API.GetVariable("uuid");
      vm.instance_id = AddressContactService.API.GetVariable("instance_id");
      vm.entityName = AddressContactService.API.GetVariable("entityName");
      AddressContactService.API.GetAddressList(vm.uuid, vm.instance_id)
        .then(response => {
          vm.addressList = response;
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

    vm.getRegions = country_id => {
      this.allRegions = [];
      AddressContactService.API.GetRegions(country_id)
        .then(response => {
          this.allRegions = response;
          for (let i = 0; i < this.allRegions.length; i++) {
            if (vm.regionsMap[this.allRegions[i].id] === undefined) {
              vm.regionsMap[this.allRegions[i].id] = this.allRegions[i];
            }
          }
          this.initializeRegionsDropdown();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //get cities list under selected state
    vm.getCitiesUnderRegion = regionId => {
      this.isLoadingStates = true;
      //to show message that cities are getting loaded
      this.isLoadingCities = true;
      // region is changed then set city dropdown, zipcode and city id to undefined/empty
      this.regional_cities = [undefined];
      if (regionId) {
        AddressContactService.API.GetCitiesByRegion(regionId)
          .then(response => {
            this.regional_citiesList = response;
            this.isLoadingStates = false;
            this.isLoadingCities = false;
            this.regional_cities = response;
            for (let i = 0; i < this.regional_cities.length; i++) {
              if (vm.citiesMap[this.regional_cities[i].id] === undefined) {
                vm.citiesMap[this.regional_cities[i].id] = this.regional_cities[
                  i
                ];
              }
            }
            this.initializeCitiesDropdown(this.regional_cities);
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.save = addressDetails => {
      // vm.message = null;
      vm.errorMessage = null;
      addressDetails.uuid = vm.uuid;
      addressDetails.instance_id = vm.instance_id;
      vm.saveBtnText = "Saving Now...";
      vm.isLoaded = false;
      AddressContactService.API.InsertAddressByUuidAndInstance(addressDetails)
        .then(response => {
          vm.saveBtnText = "Save";
          vm.getAddressList();
          // vm.message = response.data.message;
          vm.isSaveSuccess = true;
          vm.address_details = {};
           //set address values by defualt
          vm.address_details.country_id = 237; //default country: USA
          vm.address_details.status_id = 200; //default status: active
          vm.address_details.type_id = 2; //default address type:Business
          vm.isLoaded = true;
        })
        .catch(error => {
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.errorMessage = "Unable to insert!";
          if (
            error &&
            error.data &&
            error.data.error &&
            error.data.error.message
          ) {
            vm.errorMessage = error.data.error.message;
          }
          $timeout(function() {
            vm.saveBtnText = "Save";
            vm.isLoaded = true;
            vm.saveBtnError = false;
            vm.errorMessage = null;
          }, 2500);
        });

      $timeout(() => {
        // vm.message = null;
        vm.errorMessage = null;
      }, 3500);
    };

    vm.closeForm = () => {
      $scope.isShowAddressPanel = true;
      vm.showAddress = true;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false
    };

    vm.focusAddressTab = () => {
      $timeout(function() {
        angular.element("#add_tab").focus();
      }, 1000);
    };

    vm.displayUpdateForm = (addressDetails, flag, index) => {
      $timeout(function() {
        angular.element("#status_id").focus();
      }, 500);
      vm.oldAddress = addressDetails;
      addressDetails[index] = flag;
      vm.address_details = JSON.parse(JSON.stringify(addressDetails));
      vm.isAddressSectionVisisble = false;
      vm.addBtnLabel = "Add Address";
      if (vm.currentIndex !== undefined && vm.currentIndex !== index) {
        vm.closeUpdateForm(vm.address_details, vm.currentIndex);
        delete vm.address_details[vm.currentIndex];
        vm.currentIndex = index;
      } else {
        vm.currentIndex = index;
      }
      if (!vm.allRegions) {
        vm.getRegions(vm.address_details.country_id);
      }
      if (!vm.addressTypes && !vm.countries) {
        vm.getAddressTypes();
        vm.getCountryList();
      }
      // get all cities under the region
      vm.getCitiesUnderRegion(vm.address_details.region_id)
      this.isLoadingCities = false;
    };

    vm.closeUpdateForm = (addressDetails, index) => {
      $timeout(() => {
        angular.element("#add_tab").focus();
        }, 500);
      addressDetails[index] = false;
    };

    vm.hasUpdateChanges = payload => {
      if (
        vm.oldAddress.type_id !== payload.type_id ||
        vm.oldAddress.status_id !== payload.status_id ||
        vm.oldAddress.address !== payload.address ||
        vm.oldAddress.country_id !== payload.country_id ||
        Number(vm.oldAddress.region_id) !== Number(payload.region_id) ||
        vm.oldAddress.city_id !== payload.city_id ||
        vm.oldAddress.zipcode !== payload.zipcode
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = addressDetails => {
      // vm.message = null;
      vm.isUpdateSuccess = null;
      vm.errorMessage = null;
      vm.updateErrorMessage = null;
      if (vm.hasUpdateChanges(addressDetails) === true) {
        // if citymap and cityid is there then assign city name otherwise not //
        addressDetails.city_name =
        vm.citiesMap && vm.citiesMap[addressDetails.city_id]
          ? vm.citiesMap[addressDetails.city_id].city_name
          : "";
        
        // if regionmap and regionid is there then assign region name otherwise not //
        addressDetails.region_name =
          vm.regionsMap && vm.regionsMap[addressDetails.region_id]
            ? vm.regionsMap[addressDetails.region_id].region_name
            : "";

        let obj = {
          uuid:vm.uuid,
          instance_id:vm.instance_id,
          id: addressDetails.address_id,
          type_id: addressDetails.type_id,
          status_id: addressDetails.status_id,
          address: addressDetails.address,
          address_type: addressDetails.address_type,
          country_id: addressDetails.country_id,
          region_id: addressDetails.region_id,
          city_id: addressDetails.city_id,
          zipcode: addressDetails.zipcode
        };
        addressDetails.isProcessing = true;
        vm.updateBtnText = "Updating...";
        AddressContactService.API.UpdateAddressById(obj)
          .then(response => {
            delete addressDetails.isProcessing;
            addressDetails[vm.currentIndex] = false;
            vm.addressList[vm.currentIndex] = addressDetails;
            // vm.message = response.data.message;
            vm.isUpdateSuccess = true;
            vm.updateBtnText = "Update";
          })
          .catch(error => {
            vm.updateErrorMessage = "Unable to update!";
            if (
              error &&
              error.data &&
              error.data.error &&
              error.data.error.message
            ) {
              vm.updateErrorMessage = error.data.error.message;
            }
            delete addressDetails.isProcessing;
            vm.updateBtnText = "Update";
            logger.error(error);
          });
      } else {
        vm.updateErrorMessage = "Nothing to update!";
      }
      $timeout(() => {
        // vm.message = null;
        vm.updateErrorMessage = null;
      }, 3500);
    };

    vm.delete = addressId => {
      // vm.message = null;
      vm.isDeleteSuccess = null;
      vm.errorMessage = null;
      AddressContactService.API.DeleteAddressById(addressId)
        .then(response => {
          vm.getAddressList();
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

    activate();

    function activate() {
      vm.isAddressSectionVisisble = false;
    }
  }
})();
