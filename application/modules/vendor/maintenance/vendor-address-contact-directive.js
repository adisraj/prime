(function () {
  "use strict";
  angular
    .module("rc.prime.vendor").controller("VendorAddressContactController", VendorAddressContactController);

  VendorAddressContactController.$inject = [
    "$scope",
    "common",
    "CountryService",
    "VendorService",
    "AddressContactService"
  ]

  function VendorAddressContactController(
    $scope,
    common,
    CountryService,
    VendorService,
    AddressContactService
  ) {
    let vmCtrl = this;
    let logger = common.Logger.getInstance("VendorUserDefinedDataController");
    let $timeout = common.$timeout;
    $scope.isLoading = false;
    let $stateParams = common.$stateParams;

    // initialize
    vmCtrl.init = () => {
      if ($stateParams.id) {
        $scope.vendorId = $stateParams.id;
        vmCtrl.isUpdateVendor = true;
        vmCtrl.getVendorDepartmentAddressContactDetails($scope.vendorId);
      }
      $scope.isLoading = true
      vmCtrl.getVendorDepartments();
      vmCtrl.getCountryList();
    }

    // fetch Country list
    vmCtrl.getCountryList = () => {
      CountryService.API.GetCountries()
        .then(response => {
          $scope.countries = response;

        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Map the department address & contact data to departmets list to show in the form
    vmCtrl.mapData = () => {
      vmCtrl.oldDepartmentData = {};
      for (let i = 0; i < $scope.vendorDepartments.length; i++) {
        let department = $scope.vendorDepartments[i];
        for (let j = 0; j < $scope.vendorDepartmentDetails.length; j++) {
          if ($scope.vendorDepartmentDetails[j].department_id === department.id) {
            department["addressContactDetails"] = $scope.vendorDepartmentDetails[j];
            if (department["addressContactDetails"].country_id && department["addressContactDetails"].country_id === 237) {
              $scope.getRegions(department["addressContactDetails"].country_id, department["addressContactDetails"]);
            }
            vmCtrl.getCitiesByRegion(undefined, department["addressContactDetails"]);
            vmCtrl.oldDepartmentData[department.id] = angular.copy(department["addressContactDetails"]);
          }
        }
      }
    }

    vmCtrl.getVendorDepartmentAddressContactDetails = (vendorId) => {
      VendorService.API.FetchVendorDepartmentDetails(vendorId)
        .then(response => {
          $scope.vendorDepartmentDetails = response;
          if ($scope.vendorDepartments) {
            vmCtrl.mapData();
          }
        })
        .catch(error => {
          logger.error(error);
        });
    }

    // Get vendor departments list
    vmCtrl.getVendorDepartments = () => {
      VendorService.API.FetchVendorDepartments()
        .then((response) => {
          $scope.vendorDepartments = response;

          if (!vmCtrl.isUpdateVendor) {
            for (let i = 0; i < $scope.vendorDepartments.length; i++) {
              // select USA by default in create form only
              $scope.vendorDepartments[i]["addressContactDetails"] = { country_id: 237, allRegions: [] } // USA
            }
            $scope.getRegions(237)
          } else {
            if ($scope.vendorDepartmentDetails) {
              vmCtrl.mapData();
            }
          }
          $scope.isLoading = false;
        }).catch(error => {
          logger.error(error);
        });
    }

    $scope.getRegions = (country_id, details, selectedAddress) => {
      AddressContactService.API.GetRegions(country_id)
        .then(response => {
          if (details) {
            // if form is update vendor,then assign respective regions for departments
            details.allRegions = response
            details.region_id && !details.region_name ? details.region_name = response.filter(reg => reg.id === details.region_id)[0].region_name : "";
            details.region_name ? details.region_id = response.filter(reg => reg.region_name === details.region_name)[0].id : "";
            if (selectedAddress) {
              // when we select zipcode in update form there we don have regions and cities
              // that time fetch regions and cities for country
              vmCtrl.getCitiesByRegion(selectedAddress, details)
            }
          } else {
            // if form is create vendor,then assign same regions for all departments
            for (let i = 0; i < $scope.vendorDepartments.length; i++) {
              $scope.vendorDepartments[i]["addressContactDetails"]["allRegions"] = response;
            }
          }


        })
        .catch(error => {
          logger.error(error);
        });
    };

    vmCtrl.getCitiesByRegion = (selectedAddress, details) => {
      if (details.region_id) {
        details.isLoadingData = true;
        // get all cities under the current region
        AddressContactService.API.GetCitiesByRegion(details.region_id)
          .then(response => {
            details.isLoadingData = false;
            if (selectedAddress) {
              // check whether both city are equal and assign city_id value
              details.city_id = response.filter(city => selectedAddress.City === city.city_name)[0].id;

              // If city is not found, create city 
              if (!details.city_id) {
                let cityDetail = {
                  region_id: details.region_id,
                  city_name: selectedAddress.City
                }
                AddressContactService.API.InsertCity(cityDetail)
                  .then(res => {
                    details.city_id = response.data.data.id;
                    response.push(res.data.data);
                  })
              }
            }
            // get all city list under the region
            details.regionalCitiesList = response;
          })
          .catch(error => {
            details.isLoadingData = false;
            logger.error(error);
          });
      } 
    }

    // If send to as400 field checked for any department then un check that field for other departments
    $scope.checkSendToAs400Data = (department, field) => {
      $timeout(() => {
        for (let i = 0; i < $scope.vendorDepartments.length; i++) {
          if (department.id !== $scope.vendorDepartments[i].id) {
            // if send to as400 field checked for any department then un check that field for other departments
            if (
              department["addressContactDetails"] &&
              department["addressContactDetails"][field] &&
              $scope.vendorDepartments[i]["addressContactDetails"] &&
              $scope.vendorDepartments[i]["addressContactDetails"][field]
            ) {
              $scope.vendorDepartments[i]["addressContactDetails"][field] = 0;
            }
          }
        }
      }, 0)
    }

    // set all address values liek city id, region id
    $scope.setValues = (selectedAddress, details) => {
      if(selectedAddress && selectedAddress.Country &&  selectedAddress.Country.toLowerCase() === "usa"){
        if (selectedAddress.Postalcode) {
          // Assigning address_details.zipcode with Postalcode
          details.zipcode = selectedAddress.Postalcode;
          details.minlength = details.maxlength = 5;
          if (selectedAddress.Country) {
            details.country_id = $scope.countries.filter(country => selectedAddress.Country === country.name)[0].id
          }
          if (selectedAddress.State) {
            // Assigning addressdetails.region_name with StateName
            details.region_name = selectedAddress.StateName;
            // allRegions contains all the region details of current country
            // check whether the both state codes are equal or not and assign region_id
            if (details.allRegions) {
              details.region_id = details.allRegions.filter(region => selectedAddress.State === region.region_code)[0].id
            }

            if (details.region_id) {
              vmCtrl.getCitiesByRegion(selectedAddress, details)
            }
            if (!details.region_id) {
              // when we select zipcode in update form there we don have regions and cities
              // that time fetch regions and cities for country
              $scope.getRegions(details.country_id, details, selectedAddress);
            }
          }
        }
      } else {
        if (selectedAddress.Country) {
          details.country_id = $scope.countries.filter(country => selectedAddress.Country === country.name)[0].id
          details.address = `${selectedAddress.City}, ${selectedAddress.StateName}, ${selectedAddress.Postalcode}`;
          details.zipcode = "";
        }
      }
    }

    $scope.upsertVendorDepartmentDetails = () => {
      let count = 0;
      let responseCount = 0
      if($scope.vendorDepartments) {
        for (let i = 0; i < $scope.vendorDepartments.length; i++) {
          let department = $scope.vendorDepartments[i];
          let payload = {
            vendor_id: $scope.vendorId,
            department_id: department.id,
            contact_person_name: department.addressContactDetails && department.addressContactDetails.contact_person_name ? department.addressContactDetails.contact_person_name : "",
            phone_number: department.addressContactDetails.phone_number,
            email_id: department.addressContactDetails.email_id,
            address: department.addressContactDetails.address,
            city_id: department.addressContactDetails.city_id,
            region_id: department.addressContactDetails.region_id,
            zipcode: department.addressContactDetails.zipcode,
            country_id: department.addressContactDetails.country_id,
            send_address_to_as400: department.addressContactDetails.send_address_to_as400,
            send_name_to_as400: department.addressContactDetails.send_name_to_as400,
            send_phone_to_as400: department.addressContactDetails.send_phone_to_as400,
            send_email_to_as400: department.addressContactDetails.send_email_to_as400,
            pe_directory: department.addressContactDetails.pe_directory
          }
          if (
            (!vmCtrl.isUpdateVendor &&
              (
                payload.contact_person_name ||
                payload.phone_number ||
                payload.email_id ||
                (
                  (
                    payload.country_id &&
                    payload.country_id === 237 &&
                    payload.zipcode &&
                    payload.address &&
                    payload.city_id &&
                    payload.region_id
                  ) ||
                  (
                    payload.country_id &&
                    payload.country_id !== 237 &&
                    payload.address
                  )
                )
              )
            ) ||
            vmCtrl.isUpdateVendor &&
            vmCtrl.hasUpdateChanges(payload)
          ) {
            count += 1;
            VendorService.API.UpsertVendorDepartmentDetails(payload)
              .then(response => {
                responseCount += 1;
                if (vmCtrl.isUpdateVendor && $scope.vendorId && count === responseCount && !vmCtrl.isVendorMasterDataUpdated) {
                  $timeout(() => {
                    VendorService.API.SendChangesToAS400($scope.vendorId)
                      .then(result => { })
                      .catch(error => {
                        logger.error(error);
                      });
                  }, 3000);
                }
                $scope.$parent.vendorDepartmentSuccessMessage = response.message
              }).catch(error => {
                responseCount += 1;
                logger.error(error);
              });
          } else {
            if (!$scope.$parent.vendorDepartmentSuccessMessage) {
              $scope.$parent.vendorDepartmentSuccessMessage = "Nothing to update in Vendor Department Address and Contact";
            }
          }
        }
      } else {
        if (!$scope.$parent.vendorDepartmentSuccessMessage && vmCtrl.isUpdateVendor) {
          $scope.$parent.vendorDepartmentSuccessMessage = "Nothing to update in Vendor Department Address and Contact";
        }
      }
    }

    vmCtrl.hasUpdateChanges = (payload) => {
      let oldData = vmCtrl.oldDepartmentData && vmCtrl.oldDepartmentData[payload.department_id] ? vmCtrl.oldDepartmentData[payload.department_id] : undefined;
      if (
        (payload && !oldData) ||
        payload.contact_person_name !== oldData.contact_person_name ||
        payload.phone_number !== oldData.phone_number ||
        payload.email_id !== oldData.email_id ||
        payload.zipcode !== oldData.zipcode ||
        payload.country_id !== oldData.country_id ||
        payload.address !== oldData.address ||
        payload.city_id !== oldData.city_id ||
        payload.region_id !== oldData.region_id ||
        payload.send_address_to_as400 !== oldData.send_address_to_as400 ||
        payload.send_name_to_as400 !== oldData.send_name_to_as400 ||
        payload.send_phone_to_as400 !== oldData.send_phone_to_as400 ||
        payload.send_email_to_as400 !== oldData.send_email_to_as400 ||
        payload.pe_directory !== oldData.pe_directory
      ) {
        return true;
      } else {
        return false;
      }
    }

    $scope.$watch("isEnabledAddressContact", function (n, o) {
      if (n !== o && !$scope.vendorDepartments) {
        vmCtrl.init();
      }
    });

    $scope.$on("saveOrUpdateDepartmentDetails", function (e, args) {
      /* variables to reset the Notification message-start */
      $scope.$parent.vendorSuccessMessage = null;
      $scope.$parent.vendorErrorMessage = null;
      $scope.$parent.vendorDepartmentSuccessMessage = null;
      /* variables to reset the Notification message-end */
      if (
        args.response != undefined &&
        (args.response.status == 200 ||
          args.response.status === 201 ||
          args.response.status === 403)
      ) {
        if (args.response.data && args.response.data.inserted_id) {
          //while creating UDD
          $scope.vendorSuccessMessage = args.response.data.message;
          $scope.vendorId = args.response.data.inserted_id;
        } else {
          //while updating UDD
          args.response.status === 403
            ? ($scope.$parent.vendorSuccessMessage =
              "Nothing to update in Vendor Master")
            : ($scope.$parent.vendorSuccessMessage =
              "Vendor is updated Successfully");
        }
        vmCtrl.isVendorMasterDataUpdated = args.isVendorMasterDataUpdated;
        $scope.upsertVendorDepartmentDetails();
      } else if (
        args.response.data !== undefined &&
        args.response.data.error !== undefined
      ) {
        $scope.$parent.vendorErrorMessage = args.response.data.error.message;
      } else {
        $scope.vendorErrorMessage = args.response.form_validation_error;
      }
    });

  }

  (function () {
    "use strict";

    angular
      .module("rc.prime.vendor")
      .directive(
      "vendorAddressContactDirective",
      vendorAddressContactDirective
      );

    function vendorAddressContactDirective() {
      // Usage:
      //     <vendor-userdefined-data-directive> </vendor-userdefined-data-directive>
      // Creates:
      //
      var directive = {
        restrict: "EA",
        controller: VendorAddressContactController,
        controllerAs: "vmCtrl",
        templateUrl:
        "application/modules/vendor/maintenance/vendor.address.contact.directive.html"
      };
      return directive;
    }
  })();
})()
