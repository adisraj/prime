(() => {
  "use strict";

  angular
    .module("rc.prime.vendor")
    .controller("VendorMaintenanceController", VendorMaintenanceController);

  VendorMaintenanceController.$inject = [
    "$scope",
    "$window",
    "common",
    "AttributeValueService",
    "DataLakeService",
    "VendorService",
    "CompanyService",
    "CompanyDepartmentService",
    "CompanyAssociateService",
    "IndividualService",
    "TitleService",
    "VendorTermsService",
    "VendorTypeService",
    "VendorParameterService",
    "DataLakeAPIService",
    "AddressContactService",
    "ItemService",
    "HierarchyValueService",
    "StatusCodes",
    "$location",
    "VendorPortalModule",
    "SKUService",
    "GlobalRegularExpression",
    "AS400FieldsRegularExpression",
    "AS400FieldsRegExpression",
    "UserService",
    "ItemCollectionService",
    "$http"
  ];

  function VendorMaintenanceController(
    $scope,
    $window,
    common,
    AttributeValueService,
    DataLakeService,
    VendorService,
    CompanyService,
    CompanyDepartmentService,
    CompanyAssociateService,
    IndividualService,
    TitleService,
    VendorTermsService,
    VendorTypeService,
    VendorParameterService,
    DataLakeAPIService,
    AddressContactService,
    ItemService,
    HierarchyValueService,
    StatusCodes,
    $location,
    VendorPortalModule,
    SKUService,
    GlobalRegularExpression,
    AS400FieldsRegularExpression,
    AS400FieldsRegExpression,
    UserService,
    ItemCollectionService,
    $http
  ) {
    let vm = this;

    //common module variables intilized
    let $filter = common.$filter;
    let $state = common.$state;
    let $timeout = common.$timeout;
    let $stateParams = common.$stateParams;
    let logger = common.Logger.getInstance("VendorMaintenanceController");
    let LocalMemory = common.LocalMemory;
    let EntityDetails = common.EntityDetails;
    let ApplicationPermissions = common.ApplicationPermissions;
    let Identifiers = common.Identifiers;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let Notification = common.Notification;
    vm.globalRegularExpression = GlobalRegularExpression;
    vm.as400FieldsRegularExpression = AS400FieldsRegularExpression;
    vm.as400FieldsRegExpression = AS400FieldsRegExpression;
    vm.vendorPortalModuleId = VendorPortalModule.id;
    vm.$state = $state;
    vm.statusCodes = StatusCodes;
    vm.thumbnails = [];
    $scope.uddValidationErrors = [];
    vm.filters = {};
    vm.appliedFilterCount = 0;
    $scope.head = {};
    vm.isViewAuthorized = true;
    vm.clearPath = false;
    vm.applyFiltersBtnLabel = "Apply Filters";
    vm.entityInformation = {};
    vm.pagedetails = {};
    vm.message = null;
    vm.error = {};
    vm.$location = $location;
    vm.showFilter = false; // Variable to hide the Advanced Search panel initially
    vm.advancedSearchPanel = false;
    vm.sortByField = "none"; // Variable to hold current sorting field.
    vm.sortByOrder = "desc"; // Variable to hold the order for the sort option.
    vm.groupByField = "";
    vm.groupByValue = null;
    vm.selectedGroupHeader = [];
    vm.shortNameValidation = false;
    vm.duplicateShortNameMessage = null;
    vm.isAddedToQueue = false;
    vm.venDataAddToQueueError = false;
    //model variables
    vm.allindividuals = [];
    vm.allCompanies = [];
    vm.allCompanyDepartments = {};
    vm.allVendorPurchaseTerms = {};
    vm.allVendorTypes = {};
    vm.groupVendorsMap = [];
    vm.attributeValuesMap = {};
    vm.department_details = {};
    vm.vendor_properties = {};
    $scope.drop = {};
    vm.isGroupByApplied = false;
    vm.isGroupByFilterApplied = false;
    //Create/Update side panel variables
    vm.saveBtnError = false;
    vm.saveBtnText = "Save";
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.allVendors = [];

    vm.isResetFilter = false;
    vm.showPrimaryDepartment = true;
    vm.mainAddress = undefined;
    //vm.primaryDepartment = undefined;

    vm.department_uuid = Identifiers.company_department;
    vm.associate_uuid = Identifiers.company_associate;
    vm.uuid = "9";
    vm.applyFilterSuccess = true;
    vm.shouldUpdateReorderInItems = false;
    vm.isLoadingDelete = false;
    // variable to save cover image as thumbnail
    vm.is_thumbnail = 1;
    // variable to call confirmation panel on cover image deletion
    vm.showConfirmDeletion = false;
    // On create vendor, variable to call confirmation panel on cover image deletion
    vm.DeletionConfirmation = false;
    // on success of vendor portal show side panel for success message
    vm.isSaveSuccess = false;
    // on success of remove vendor portal show side panel for success message
    vm.isDeletePortalSuccess = false;
    //set records limit to be get on request
    vm.setLimit = () => {
      vm.limit = 50;
    };
    this.showLockedScreen = true;
    this.secondaryPassword = '';
    vm.isCloneAllowed = false;
    //Initilize vendor module
    vm.initializeVendorMaintenance = () => {
      vm.setLimit();
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.getVendorMetaData();
      vm.getAttributeValues();
      vm.getBuyerHierarchyValues(); // get buyer hierarchy values
      vm.reloadVendorCountAndList();
      vm.fetchInventoryMethods();
      // Get permissions for crud opration for department in vendor module
      vm.getPermissionsForUuid(
        "companyDepartmentPermissions",
        Identifiers.company_department
      );
      // Get permissions for crud opration for associate in vendor module
      vm.getPermissionsForUuid(
        "associatePermissions",
        Identifiers.company_associate
      );
    };

    vm.editVendorName = () => {
      let payload = angular.copy($scope.head);
      if ($scope.head.individual_or_company != "Company") {
        payload.first_name = vm.individualDetails.first_name;
        payload.last_name = vm.individualDetails.last_name;
      }
      vm.edit_vendor = angular.copy(payload);
      vm.isEditVendorName = true;
    }

    vm.updateVendorName = (vendorNameObject) => {
      if (vendorNameObject.individual_or_company.toLowerCase() == "company") {
        if (vm.oldVendorData.name !== vendorNameObject.name) {
          let object = {
            id: vendorNameObject.individual_id_or_company_id,
            name: vendorNameObject.name
          }
          CompanyService.API.UpdateCompany(object)
            .then(result => {
              vm.isUpdateNameSuccess = true;
              $scope.head.name = object.name;
              vm.oldVendorData.name = object.name;
              _.each(vm.allCompanies, company => {
                if (company.id == vendorNameObject.individual_id_or_company_id) {
                  company.name = object.name;
                  vm.loadCompanyDropDown();
                }
              });
              let vidx = vm.vendorsDataList.findIndex(vendr => vendr.id === object.id);
              vidx > -1 ? vm.vendorsDataList[vidx].name = object.name : '';

              if (vm.groupVendors && vm.groupVendors.length) {
                let gidx = vm.groupVendors.findIndex(vendr => vendr.id === object.id);
                gidx > -1 ? vm.groupVendors[gidx].name = object.name : '';
              }
              vm.getAllCompanies();
              VendorService.API.GetVendors()
                .then(response => {
                  common.SessionMemory.API.Post("vendorList", JSON.stringify(response.data.data));

                })
                .catch(error => {
                  logger.error(error);
                });
            })
            .catch(error => {
              vm.updateError = error.data.error.message;
              $timeout(() => {
                vm.updateError = null;
              }, 3000);
            })
        } else {
          vm.nothingToUpdate = true;
          $timeout(() => {
            vm.nothingToUpdate = false;
          }, 3000);
        }
      } else {
        if (vm.oldVendorData.name !== vendorNameObject.name) {
          let object = {
            id: vendorNameObject.individual_id_or_company_id,
            name: vendorNameObject.name,
            first_name: vendorNameObject.first_name,
            last_name: vendorNameObject.last_name
          }
          IndividualService.API.UpdateIndividual(object)
            .then(result => {
              vm.isUpdateNameSuccess = true;
              $scope.head.name = object.name;
              vm.oldVendorData.name = object.name;
              vm.individualDetails.name = object.name;
              vm.individualDetails.first_name = object.first_name;
              vm.oldVendorData.first_name = object.first_name;
              vm.individualDetails.last_name = object.last_name;
              vm.oldVendorData.last_name = object.last_name;
              _.each(vm.allindividuals, individual => {
                if (individual.id == vendorNameObject.individual_id_or_company_id) {
                  individual.name = object.name;
                  individual.first_name = object.first_name;
                  individual.last_name = object.last_name;
                  vm.loadIndividualDropDown();
                }
              });
              vm.getAllIndividuals();
              VendorService.API.GetVendors()
                .then(response => {
                  common.SessionMemory.API.Post("vendorList", JSON.stringify(response.data.data));
                })
                .catch(error => {
                  logger.error(error);
                });
            }).catch(error => {
              vm.updateError = error.data.error.message;
              $timeout(() => {
                vm.updateError = null;
              }, 3000);
            })
        } else {
          vm.nothingToUpdate = true;
          $timeout(() => {
            vm.nothingToUpdate = false;
          }, 3000);
        }
      }
    }

    // Get permissions for vendor module
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

    // To store inventory methods in a variable
    vm.getInventoryMethods = () => {
      if ($scope.head.inventory_method_id && !vm.isUpdateVendor) {
        vm.inventoryMethodId = $scope.head.inventory_method_id;
      } else {
        vm.inventoryMethodId = vm.vendor_properties.inventory_method_id;
      }
      vm.inventory_methods = "";
      for (let j = 0; j < vm.inventoryMethodId.length; j++) {
        for (let i = 0; i < vm.inventoryMethods.length; i++) {
          if (vm.inventoryMethods[i].id == vm.inventoryMethodId[j]) {
            vm.inventory_methods += vm.inventoryMethods[i].name + ", ";
          }
        }
      }
    }

    vm.fetchInventoryMethods = () => {
      VendorService.API.FetchInventoryMethods()
        .then(response => {
          vm.inventoryMethods = response;
        })
        .catch(error => {
          console.log(error);
        })
    }

    //Insights for vendor
    vm.toggleSKUListPanel = VendorData => {
      vm.selectedVendorData = VendorData;
      vm.showSKUList = true;
      vm.fetchVendorInsights(VendorData);
    };
    // fetch sku count information(insights) for vendor
    vm.fetchVendorInsights = vendor => {
      if (!vendor.insights) {
        vm.loadingInsights = true;
        vm.groupWiseSkuCount = {};
        VendorService.API.GetInsightsByVendorId(vendor.id)
          .then(response => {
            vendor.insights = response.data;
            vendor.totalSkuCount = 0;
            //key value pair mapping of sku type to insights
            for (let i = 0; i < vendor.insights.length; i++) {
              vendor.totalSkuCount += vendor.insights[i].sku_count;
              if (
                vm.groupWiseSkuCount[vendor.insights[i].sku_sub_type] ===
                undefined
              ) {
                vm.groupWiseSkuCount[vendor.insights[i].sku_sub_type] =
                  vendor.insights[i].sku_count;
              } else {
                vm.groupWiseSkuCount[vendor.insights[i].sku_sub_type] +=
                  vendor.insights[i].sku_count;
              }
            }
            vm.loadingInsights = false;
          })
          .catch(error => {
            vm.loadingInsights = false;
            logger.error(error);
          });
      } else {
        vm.groupWiseSkuCount = {};
        //key value pair mapping of sku type to insights
        for (let i = 0; i < vendor.insights.length; i++) {
          if (
            vm.groupWiseSkuCount[vendor.insights[i].sku_sub_type] === undefined
          ) {
            vm.groupWiseSkuCount[vendor.insights[i].sku_sub_type] =
              vendor.insights[i].sku_count;
          } else {
            vm.groupWiseSkuCount[vendor.insights[i].sku_sub_type] +=
              vendor.insights[i].sku_count;
          }
        }
      }
    };

    // Access in Vendor Portal
    vm.showVendorPortalPanel = VendorData => {
      vm.accessVendorDetails = VendorData;
      vm.PortalAccess = true;
      vm.vendoraccess = {};
      vm.vendorAccessObject = {};
      vm.message = null;
      vm.isLoadingVendorPortalData = true;
      vm.vendorPortalUrl = false;
      let vendorId = vm.accessVendorDetails.id;
      VendorService.API.GetPortalAccessByVendorId(vendorId)
        .then(response => {
          vm.isLoadingVendorPortalData = false;
          vm.vendoraccess = response.data;
        })
        .catch(error => {
          vm.isLoadingVendorPortalData = false;
          logger.error(error);
        });
    };

    // Function gets vendor portal module details and generate login url
    vm.getVendorPortalLoginLink = access => {
      vm.vendorPortalUrl = null;
      VendorService.API.GetModuleDetailsById(vm.vendorPortalModuleId)
        .then(response => {
          vm.vendorPortalUrl = `${response[0].dns}#/${access.uuid}/login`;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Function to copy url text to clipboard
    vm.copyToClipboard = str => {
      const el = document.createElement("textarea");
      el.value = str;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      // show text copied message in UI
      vm.showTextCopied = true;

      $timeout(() => {
        vm.showTextCopied = false;
      }, 3000);
    };

    vm.closeVendorPortalPanel = () => {
      vm.PortalAccess = false;
      vm.isSaveSuccess = false;
      vm.isDeletePortalSuccess = false;
    };

    vm.closeVendorPortalForm = () => {
      vm.PortalAccess = true;
      vm.isSaveSuccess = false;
      vm.isDeletePortalSuccess = false;
    }

    // Function to check whether the vendor short name already used or not
    vm.duplicateCheck = (short_name) => {
      vm.shortNameValidation = false;
      vm.duplicateShortNameMessage = null;
      if ((vm.oldVendorData && vm.oldVendorData.rms_vendor_short_name && vm.oldVendorData.rms_vendor_short_name != short_name) || vm.oldVendorData == undefined) {
        vm.shortNameValidation = true;
        VendorService.API.VendorShortNameDuplicateCheck(short_name)
          .then(response => {
            vm.shortNameValidation = false;
            vm.isVendorShortNameExist = false;
            $timeout(() => {
              vm.duplicateShortNameMessage = null;
            }, 2000);
          })
          .catch(error => {
            if (error.data.status === 412) {
              vm.isVendorShortNameExist = true;
              vm.shortNameValidation = false;
              vm.duplicateShortNameMessage = "*Vendor Short Name is already assigned";
            } else {
              vm.isVendorShortNameExist = true;
              vm.duplicateShortNameMessage = null;
            }
            logger.error(error);
          });
      } else {
        vm.shortNameValidation = false;
        vm.isVendorShortNameExist = false;
        vm.duplicateShortNameMessage = null;
      }
    }

    vm.createVendorPortalAccess = () => {
      vm.isLoading = true;
      vm.isSaveSuccess = false;
      let converted_expiry_date = moment(
        vm.vendorAccessObject.expiry_date
      ).format("YYYY-MM-DD");
      let object = {
        email_id: vm.vendorAccessObject.email_id,
        expiry_date: converted_expiry_date
      };
      VendorService.API.InsertVendorPortalAccess(
        vm.accessVendorDetails.id,
        object
      )
        .then(response => {
          vm.isLoading = false;
          let insertedObj = {
            email_id: vm.vendorAccessObject.email_id,
            expiry_date: vm.vendorAccessObject.expiry_date,
            vendor_id: vm.accessVendorDetails.id,
            uuid: response.data.data.uuid
          };
          vm.vendorAccessObject = {};
          vm.vendorAccessObject.email_id = undefined;
          vm.vendorAccessObject.expiry_date = undefined;
          // vm.message =
          //   "Access to vendor portal is enabled for selected vendor!!";
          vm.isSaveSuccess = true;
          vm.vendoraccess.push(insertedObj);
          $timeout(() => {
            vm.message = null;
          }, 2000);
        })
        .catch(error => {
          if (error.status === 412) {
            vm.isLoading = false;
            this.errorMessage = "Record already exists";
            $timeout(() => {
              vm.errorMessage = null;
            }, 2000);
          } else {
            vm.isLoading = false;
            vm.error = true;
            this.errorMessage = "Oops.!! Something went wrong";
            $timeout(() => {
              vm.errorMessage = null;
            }, 2000);
          }
          logger.error(error);
        });
    };

    vm.checkDateValidation = selectedDate => {
      vm.currentDate = new Date();
      let selectedDateFormat = new Date(selectedDate);
      if (selectedDate < vm.currentDate) {
        vm.invalidExpiryDate = true; // to check if the expiry date is lesser than the current date
      } else {
        vm.invalidExpiryDate = false;
      }
    };

    vm.removeVendorPortalAccess = (data, index) => {
      data.isDeletingVendor = true;
      vm.isDeletingVendor = true;
      vm.showRemoveConfirmation = false;
      VendorService.API.DeleteVendorPortalAccess(
        vm.accessVendorDetails.id,
        data.uuid
      )
        .then(response => {
          data.isDeletingVendor = false;
          vm.isDeletingVendor = false;
          vm.vendorPortalUrl = false;
          vm.vendoraccess.splice(index, 1);
          if (response.data.affectedRows >= 1) {
            // vm.message = "Access to portal removed to the selected vendor!";
            vm.isDeletePortalSuccess = true;
            $timeout(() => {
              // vm.message = null;
            }, 2000);
          } else {
            this.errorMessage = "Error while removing the vendor!";
            $timeout(() => {
              vm.errorMessage = null;
            }, 2000);
          }
        })
        .catch(error => {
          data.isDeletingVendor = false;
          vm.isDeletingVendor = false;
          logger.error(error);
        });
    };

    //Initialize Create and Update Forms
    vm.InitializeCreateUpdateForm = () => {
      vm.isFormLoading = true;
      $scope.uddValidationErrors = [];
      vm.GetParameterStatus(); //get configuartion parameter status for vendor
      $scope.getStatuses(common.Identifiers.vendor); // Getting vendor current statuses
      $scope.getNextStatuses(common.Identifiers.vendor); // Getting vendor next statuses
      vm.getAllCompanies();
      vm.getAllIndividuals();
      vm.getAllVendorPurchaseTerms();
      vm.getAllVendorTypes();
      vm.getBuyerHierarchyValues();
      vm.initVendorUserDefinedDataDirective();
      !$stateParams.id && $state.current.name.includes(".new")
        ? vm.openForm()
        : "";
      !$stateParams.id && $state.current.name.includes(".new")
        ? ($scope.head.individual_or_company = "Company")
        : "";
      $timeout(() => {
        vm.isFormLoading = false;
      }, 3000);
    };

    //get parameter status and set variable based on status
    vm.GetParameterStatus = () => {
      VendorParameterService.API.GetVendorParameter()
        .then(response => {
          if (response.data[0].status_id !== 200) {
            vm.disableActions = true;
          } else {
            vm.disableActions = false;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.actionOnEscape = event => {
      if (event.keyCode === 27 && vm.$showErrorDetailsData === true) {
        vm.$showErrorDetailsData = false;
        vm.$showErrorDetails = false;
        vm.$confirmdelete = false;
      } else if (event.keyCode === 27 && !vm.$showErrorDetailsData) {
        vm.exit("update");
      }
    };

    // Fetch total count of vendors
    vm.fetchTotalRecordCount = () => {
      VendorService.API.FetchTotalRecordCount()
        .then(vendorCount => {
          $timeout(() => {
            vm.totalRecordCount = vendorCount;
            if (vm.vendorsDataList && vm.vendorsDataList.length) {
              vm.availableVendorsCount = vm.totalRecordCount - vm.vendorsDataList.length;
            }
          }, 0);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // On Press of refresh button fetch vendors count and the data
    vm.reloadVendorCountAndList = refresh => {
      return new Promise((resolve, reject) => {
        if (vm.isGroupByApplied) {
          vm.groupByData(vm.groupByField)
            .then(response => {
              resolve(response);
            })
            .catch(error => {
              reject(error);
            });
        } else {
          if (!Object.keys(vm.filters).length) {
            vm.fetchTotalRecordCount();
            vm.reload(refresh)
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            vm.reload(refresh)
              .then(response => {
                resolve(response);
                vm.totalRecordCount = response.data.filterdRecordCount;
                vm.availableVendorsCount = vm.totalRecordCount - vm.vendorsDataList.length;
              })
              .catch(error => {
                reject(error);
              });
          }
        }
      });
    };

    vm.goToClonePanel = vendorId => {
      $state.go("common.prime.vendor.clone", {
        id: vendorId
      });
    };

    // Scroll bar will be pointed to (x, y) position
    vm.scrollToPosition = (x, y) => {
      window.scrollTo(x, y);
    };

    // Sets current pagination variables
    vm.pagination = () => {
      vm.resetUnusedFilterArrays();
      if (vm.sortByField === "") {
        vm.sortByField = "none";
        vm.sortByOrder = "desc";
      }
      vm.groupByValue = vm.groupByField === "" ? null : vm.groupByValue;
    };

    vm.reload = refresh => {
      return new Promise((resolve, reject) => {
        $scope.selectedRow = null;
        vm.groupByField = "";
        vm.page = 1;
        vm.isLoaded = false;
        vm.isGroupByApplied = false;
        if (refresh !== undefined) {
          // On click of refresh button, a message bar with information will be toggled in UI
          vm.totalTimeText = "";
          vm.isRefreshing = true;
          vm.refreshTableText = "Refreshing list...";
        }
        vm.pagination();
        /** ---------- Get vendors based on page and limit ----------
         * Filter object is undefined (third parameter)
         * sort by field and order initially none and asc
         * may change according to the user customization
         * No parameter means, get all the records without any conditions.
         */
        VendorService.API.GetVendors(
          { page: vm.page, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (refresh !== undefined) {
              // After successfully refreshed information like time taken for getting response and number of records fetched will be displyed in UI
              vm.totalRecordsText = "record(s) loaded in approximately";
              vm.totalTimeText =
                "<strong>" +
                response.time_taken +
                "</strong><span class='f-14 c-gray'> seconds</span>";
              vm.refreshTableText = "Successfully refreshed";
              $timeout(() => {
                vm.isRefreshing = false;
              }, 3500);
            }
            vm.recordsCount = response.data.data.length;
            vm.vendorsDataList = response.data.data;
            vm.originalVendorsDataList = JSON.parse(
              JSON.stringify(vm.vendorsDataList)
            );
            vm.totalRecordCount = response.data.filterdRecordCount;
            vm.availableVendorsCount = vm.totalRecordCount - vm.vendorsDataList.length;
            vm.getVendorMetaData(); // get meta data for vendors
            localStorage.removeItem("PageCount");
            vm.MapVendors(vm.vendorsDataList);
            vm.getVendorsFilter();
            vm.isLoaded = true;
            resolve(response);
          })
          .catch(error => {
            vm.isRefreshing = true;
            vm.refreshTableText = "Unsuccessfull!";
            reject(error);
            logger.error(error);
            $timeout(() => {
              vm.isRefreshing = false;
            }, 3500);
          });
      });
    };
    vm.MapVendors = list => {
      vm.VendorsMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.VendorsMap[list[i].id] === undefined) {
          vm.VendorsMap[list[i].id] = list[i];
        }
      }
      $stateParams.id && $state.current.name.includes(".update")
        ? vm.gotoUpdateState()
        : "";
    };
    //on click of 'Load More' button this will be called.
    //Based on page no. and limit this will fetch records
    vm.loadMoreVendors = () => {
      vm.isLoading = true;
      vm.page = parseInt(LocalMemory.API.Get("PageCount")) || 1;
      vm.pagination();
      if (!vm.isFilterApplied) {
        //if filter is not applied then this will fetch next limited records
        if (vm.sortByField === "") {
          vm.sortByField = "none";
          vm.sortByOrder = "desc";
        }
        /** ---------- Get vendors based on page and limit ----------
         * Filter object is undefined (third parameter)
         * sort by field and order initially none and asc
         * may change according to the user customization
         * No parameter means, get all the records without any conditions.
         */
        VendorService.API.GetVendors(
          { page: vm.page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.vendorsDataList.push(response.data[i]);
                vm.originalVendorsDataList.push(response.data[i]);
              }
              vm.availableVendorsCount =
                vm.totalRecordCount - vm.originalVendorsDataList.length;
              LocalMemory.API.Post("PageCount", vm.page + 1);
              vm.setLimit();
              vm.getVendorMetaData();
              if (vm.searchVendors) {
                $scope.showhistory = false;
                vm.vendorsDataList = $filter("filter")(
                  vm.originalVendorsDataList,
                  vm.searchVendors
                );
              }
              vm.isLoading = false;
              vm.MapVendors(vm.vendorsDataList);
            } else {
              vm.availableVendorsCount = 0;
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        //when filter is applied on vendors list and if 'Load More' button is clicked then record will be fetched based on applied filter values
        VendorService.API.GetVendors(
          { page: vm.page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.vendorsDataList.push(response.data[i]);
              }
              if (!vm.isGroupByFilterApplied) {
                vm.availableVendorsCount =
                  vm.totalRecordCount - vm.vendorsDataList.length;
              }
              LocalMemory.API.Post("PageCount", vm.page + 1);
              vm.setLimit();
              vm.getVendorMetaData();
              vm.isLoading = false;
            } else {
              vm.availableVendorsCount = 0;
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };
    //get vendor entity information

    vm.getEntityInformation = () => {
      common.EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getModelAndSetValidationRules = (uuid) => {
      let uuidValue = uuid ? uuid : vm.uuid;
      EntityDetails.API.GetModelAndSetValidationRules(uuidValue)
        .then(model => {
          vm.getDynamicColumns(model);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getDynamicColumns = model => {
      let alterTitles = {};
      let drillTo = {};
      let typeMeta = generateDynamicTableColumnsService.getTableColumns(
        model,
        {},
        alterTitles,
        drillTo
      );
      $scope.venmGroupByDropdown = typeMeta.dropdownList;
    };

    vm.getVendorMetaData = () => {
      DataLakeAPIService.API.GetDropsByUuid(vm.uuid)
        .then(res => {
          if (res.data !== undefined) {
            vm.thumbnails = res.data;
            vm.loadThumbNailImages("165x165");
          } else {
            vm.thumbnails = [];
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Load thumbnail images for all vendor in the list
    vm.loadThumbNailImages = size => {
      if (vm.vendorsDataList) {
        for (var i = 0; i < vm.vendorsDataList.length; i++) {
          if (vm.thumbnails) {
            let thumbnail = vm.thumbnails.filter(lake => {
              return lake.instance_id == vm.vendorsDataList[i].id;
            });
            if (thumbnail[0]) {
              if (!thumbnail[0].url) {
                if (
                  thumbnail[0].type &&
                  thumbnail[0].type.toLowerCase() === "virtual"
                ) {
                  vm.vendorsDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    "",
                    vm.uuid
                  );
                  vm.vendorsDataList[i].drop_id = thumbnail[0].drop_id;
                  vm.originalVendorsDataList[i].thumbnail =
                    vm.vendorsDataList[i].thumbnail;
                  vm.originalVendorsDataList[i].drop_id =
                    vm.vendorsDataList[i].drop_id;
                } else {
                  vm.vendorsDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    size,
                    vm.uuid
                  );
                  vm.vendorsDataList[i].drop_id = thumbnail[0].drop_id;
                  vm.originalVendorsDataList[i].thumbnail =
                    vm.vendorsDataList[i].thumbnail;
                  vm.originalVendorsDataList[i].drop_id =
                    vm.vendorsDataList[i].drop_id;
                }
              } else if (thumbnail[0].url) {
                vm.vendorsDataList[i].thumbnail = thumbnail[0].url;
              }
            }
          }
        }
      }
    };

    //load cover image for Create/Update form
    vm.loadImage = (vendor, size) => {
      DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
        vm.uuid,
        vendor.id,
        "cover_image"
      )
        .then(response => {
          if (response && response.length > 0) {
            if (!response[0].url) {
              vendor.summaryThumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                response[0].drop_id,
                size,
                vm.uuid
              );
            } else if (response[0].url) {
              vendor.summaryThumbnail = response[0].url;
            }
          } else {
            vendor.summaryThumbnail = undefined;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.loadIndividualDropDown = () => {
      vm.selectIndividualDropDown = {
        valueField: "id",
        labelField: "name",
        searchField: ["name"],
        sortField: "name",
        //Space is concatinated so that end of the text does not cut off
        placeholder: "Select Individual name" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        //Adding the data to the options, so as to show the data in the dropdown
        options: vm.allindividuals,
        render: {
          option: (data, escape) => {
            if (data.status_id === vm.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.name) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            } else {
              return (
                '<div class="p-5">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.name) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          //The selected option is sent to the item object
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.name) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vm.loadCompanyDropDown = () => {
      vm.selectCompanyDropDown = {
        valueField: "id",
        labelField: "name",
        searchField: ["name"],
        sortField: "name",
        //Space is concatinated so that end of the text does not cut off
        placeholder: "Select Company" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        //Adding the data to the options, so as to show the data in the dropdown
        options: vm.allCompanies,
        render: {
          option: (data, escape) => {
            if (data.status_id === vm.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.name) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            } else {
              return (
                '<div class="p-5">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.name) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          //The selected option is sent to the item object
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.name) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vm.loadVendorTypeDropDown = () => {
      vm.selectVendorTypeDropDown = {
        valueField: "id",
        labelField: "short_description",
        searchField: ["short_description"],
        sortField: "short_description",
        //Space is concatinated so that end of the text does not cut off
        placeholder: "Select vendor type" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        //Adding the data to the options, so as to show the data in the dropdown
        options: vm.allVendorTypes,
        render: {
          option: (data, escape) => {
            if (data.status_id === vm.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.short_description) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            } else {
              return (
                '<div class="p-5">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.short_description) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          //The selected option is sent to the item object
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.short_description) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vm.loadVendorTermsDropDown = () => {
      vm.selectVendorTermsDropDown = {
        valueField: "id",
        labelField: "description",
        searchField: ["description"],
        sortField: "description",
        //Space is concatinated so that end of the text does not cut off
        placeholder: "Select vendor term" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        //Adding the data to the options, so as to show the data in the dropdown
        options: vm.allVendorPurchaseTerms,
        render: {
          option: (data, escape) => {
            if (data.status_id === vm.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.description) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            } else {
              return (
                '<div class="p-5">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.description) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          //The selected option is sent to the item object
          item: (data, escape) => {
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.description) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    //Set Values valid for sorting
    $scope.sortableFields = [
      {
        field: "Sort By None",
        value: ""
      },
      {
        field: "Company/Individual Name",
        value: "name"
      },
      {
        field: "Vendor Type",
        value: "VendorType"
      },
      {
        field: "Vendor Terms",
        value: "purchase_terms"
      },
      {
        field: "Buyer",
        value: "buyer"
      },
      {
        field: "Status",
        value: "status"
      },
      {
        field: "Next Status",
        value: "next_status"
      }
    ];

    //initialize vendor user defined data directive
    vm.initVendorUserDefinedDataDirective = () => {
      $scope.head = {};
      $scope.module_name = "vendor";
      $scope.edit_master_id = "";
    };

    //get all companies list
    vm.getAllCompanies = () => {
      vm.showLoadingCompany = true;
      CompanyService.API.GetCompanies()
        .then(response => {
          // Get permissions for crud permission of company in vendor moduel
          vm.getPermissionsForUuid("companyPermissions", Identifiers.company);
          vm.showLoadingCompany = false;
          vm.allCompanies = response;
          vm.loadCompanyDropDown();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getAllIndividuals = () => {
      vm.showLoadingIndividual = true;
      IndividualService.API.GetIndividuals()
        .then(response => {
          vm.showLoadingIndividual = false;
          vm.allindividuals = response;
          vm.loadIndividualDropDown();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getAllVendorPurchaseTerms = () => {
      vm.showLoadingVendorTerms = true;
      VendorTermsService.API.GetVendorTerms()
        .then(response => {
          vm.showLoadingVendorTerms = false;
          vm.allVendorPurchaseTerms = response.data;
          vm.loadVendorTermsDropDown();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getAllVendorTypes = () => {
      vm.showLoadingVendorType = true;
      VendorTypeService.API.GetVendorTypes()
        .then(response => {
          vm.showLoadingVendorType = false;
          vm.allVendorTypes = response.data;
          vm.loadVendorTypeDropDown();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getIndividualDetails = id => {
      vm.isLoadedIndividual = false;
      IndividualService.API.GetIndividual($scope.head.individual_id_or_company_id)
        .then(response => {
          if (response && response.data) {
            vm.individualDetails = response.data;
          } else {
            vm.individualDetails = {};
          }
          vm.isLoadedIndividual = true;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getCompanyDetails = id => {
      vm.companyDetails = {};
      vm.showassociate = false;
      // vm.primaryDepartment = undefined;
      CompanyService.API.GetCompanyDeptAssoc(id)
        .then(res => {
          vm.companyname = res.company;
          vm.companyDetails = res.departments;
          for (let i = 0; vm.companyDetails && i < vm.companyDetails.length; i++) {
            if (vm.companyDetails[i].is_primary === 1) {
              vm.showPrimaryDepartment = true;
              //vm.primaryDepartment = vm.companyDetails[i];
              vm.primaryDepartmentLoaded = true;
              //vm.getMainAddress();
              break;
            } else {
              vm.showPrimaryDepartment = false;
              vm.primaryDepartmentLoaded = false;
            }
          }
        })
        .catch(error => {
          logger.error(error);
        });

      if (!vm.allTitleList || !vm.allIndividualList) {
        vm.getIndividuals();
        vm.getTitles();
      }

      //get models and set validation rules based on entity uuid
      vm.getEntityModelAndSetValidationRules(vm.department_uuid);
      vm.getEntityModelAndSetValidationRules(vm.associate_uuid);
    };

    // vm.getMainAddress = () => {
    //   vm.mainAddress = undefined;
    //   if (vm.primaryDepartment) {
    //     AddressContactService.API.GetAddressList(vm.department_uuid, vm.primaryDepartment.department_id)
    //       .then(response => {
    //         if (response && response.length) {
    //           vm.mainAddress = response;
    //           vm.mainAddressLoaded = true;
    //         } else {
    //           vm.mainAddressLoaded = false;
    //         }
    //       })
    //       .catch(error => {
    //         logger.error(error);
    //       });
    //   } else {
    //     vm.mainAddressLoaded = false;
    //   }
    // }

    vm.getDepartmentDetails = departmentId => {
      vm.departmentDetails = {};
      CompanyDepartmentService.API.SearchCompanyDepartments("id", departmentId)
        .then(response => {
          vm.departmentDetails = response[0];
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getAssociateDetails = associateId => {
      vm.associateDetails = {};
      vm.attributeValuesMap = {};
      CompanyAssociateService.API.SearchDepartmentAssociates("id", associateId)
        .then(response => {
          vm.associateDetails = response[0];
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getAttributeValues = () => {
      AttributeValueService.API.GetAttributeValues()
        .then(response => {
          let model = "allAttributeValues";
          $scope[model] = response.data;
          vm[model] = response.data;
          vm.createMap(model, "attributeValuesMap", "id");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.showHistoryDetails = data => {
      if (vm.vendorData !== undefined) {
        vm.vendorData.showhistory = false;
      }
      vm.vendorData = data;
      vm.vendorData.showhistory = true;
      vm.isShowHistory = true;
      $scope.instanceName = data.name;
      $scope.isMaintenance = true;
      $scope.loadHistory(data.id);
    };

    $scope.loadHistory = instance_id => {
      common.EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        instance_id
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
      $scope.isMaintenance = true;
      $scope.instanceName = null;
      if (vm.vendorData !== undefined) {
        vm.vendorData.showhistory = false;
      }
    };

    vm.createMap = (fromArrayModel, toMapModel, key) => {
      _.each(vm[fromArrayModel], value => {
        vm[toMapModel][value[key]] = value;
      });
    };
    vm.watchers = () => {
      $scope.$watch(
        angular.bind(vm.returnValue, () => {
          return vm.returnValue;
        }),
        value => { }
      );
      /** searching Vendor Data List */
      $scope.$watch("venMaintCtrl.searchVendors", (searchValue, o) => {
        $scope.showhistory = false;
        vm.vendorsDataList = $filter("filter")(
          vm.originalVendorsDataList,
          searchValue
        );
      });
    };

    vm.changeInfo = type => {
      $scope.head.individual_or_company = type;
      $scope.head.individual_id_or_company_id = null;
      vm.hideAllSidePanels();
    };

    //Storage Functions START

    vm.initializeDropForm = () => {
      $scope.isAllowMultipleDrops = true;
      vm.showConfirmDeletion = false;
      vm.DeletionConfirmation = false;
      vm.is_thumbnail = 1;
    };

    vm.getDropStatus = () => {
      try {
        $scope.statusList = DataLakeService.GetDropStatuses();
      } catch (error) {
        logger.error(error);
      }
    };

    vm.fetchDropsByUuidAndInstanceId = instanceId => {
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      try {
        DataLakeService.GetDropByUuidAndInstanceId(vm.uuid, instanceId)
          .then(response => {
            if (response.length > 0) {
              for (let index = 0; index < response.length; index++) {
                // if stream is cover image, then insert thumbnail with same url
                if (
                  response[index].stream.toLowerCase() === "cover image" &&
                  response[index].is_thumbnail
                ) {
                  // create an object with response fields and assign values.
                  let obj = {
                    id: response[index].id,
                    file_name: response[index].file_name,
                    stream: "Thumbnail",
                    stream_code: "thumbnail",
                    stream_id: 1,
                    instance_id: response[index].instance_id,
                    drop_id: response[index].drop_id,
                    drop_type: response[index].drop_type,
                    entity: response[index].entity,
                    status_id: response[index].status_id,
                    sequence: response[index].sequence,
                    lake: response[index].lake,
                    lake_id: response[index].lake_id,
                    type: response[index].type,
                    type_id: response[index].type_id,
                    size: response[index].size,
                    kind: response[index].kind,
                    url: response[index].url,
                    is_coverImage: true
                  };
                  // push the object to the response
                  response.push(obj);
                }
              }
              // assign the response to drops
              $scope.drops = response;
            } else {
              // assign the response to drops
              $scope.drops = response;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } catch (error) {
        logger.error(error);
      }
    };

    vm.fetchDropLakesByUuid = () => {
      try {
        DataLakeService.GetDropLakesByUUID(vm.uuid)
          .then(response => {
            $scope.lakes = response;
            if (response.length) {
              $scope.drop.lake_id = response[0].lake_id;
              vm.fetchStreamsByLakeId(response[0].lake_id);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } catch (error) {
        logger.error(error);
      }
    };

    vm.fetchStreamsByLakeId = lakeId => {
      try {
        $scope.loadingStreams = true;
        DataLakeService.GetStreamsByLakeId(lakeId)
          .then(response => {
            $scope.streams = response;
            $scope.loadingStreams = false;
          })
          .catch(error => {
            logger.error(error);
          });
      } catch (error) {
        logger.error(error);
      }
    };

    let checkType = type => {
      $scope.isImage = false;
      if (
        type === "image/jpg" ||
        type === "image/jpeg" ||
        type === "image/png" ||
        type === "image/gif" ||
        type === "image/webp" ||
        type === "image/bmp" ||
        type === "image/svg" ||
        type === "application/octet-stream"
      ) {
        $scope.isImage = true;
      }
    };

    vm.previewDatalake = dropdata => {
      function isValidUrl(string) {
        try {
          new URL(string);
          return true;
        } catch (err) {
          return false;
        }
      }
      if (dropdata["thumbnail"] && !isValidUrl(dropdata.file_name)) {
        common.$window.open(dropdata["thumbnail"]);
      } else if (isValidUrl(dropdata.file_name) || isValidUrl(dropdata.url)) {
        common.$window.open(dropdata.file_name ? dropdata.file_name : dropdata.url);
      }
    };

    vm.selectFiles = (files, errFiles) => {
      $scope.isUpload = false;
      $scope.isDropUploaded = false;
      $scope.files = files;
      $scope.notImage=false
      $scope.errFiles = errFiles;
      $scope.files && $scope.files[0] ? checkType($scope.files[0].type) : null;
      if($scope.files && $scope.files.length>0){
        if (!$scope.isImage && ($scope.drop.stream_id == 33 || $scope.drop.stream_id == 1)) {
          $scope.notImage = true;
        } else {
          $scope.notImage = false;
        }
      }
    };

    vm.validateUrl=(u)=>{
      $scope.invalidUrl = false;
      if(u){
        try {
            new URL(u);
            $scope.invalidUrl = false;
        } catch (e) {
            $scope.invalidUrl = true; 
            $scope.notImageUrl=false
            return; // Exit early if URL is invalid
        }
        if(!$scope.invalidUrl){
          $http({
            method: 'HEAD',
            url: u
          }).then(function(response) {
              // Get the content type from the response headers
              var contentType = response.headers('Content-Type');
              checkType(contentType)
              if (!$scope.isImage && ($scope.drop.stream_id ==1 || $scope.drop.stream_id == 33)) {
                $scope.notImageUrl=true
              }  else {
                $scope.notImageUrl=false
              }
          }).catch(function(error) {
            const fileExtension = u.split('.').pop().toLowerCase();
            const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp','svg',"octet-stream"];
      
            if (imageTypes.includes(fileExtension)) {
              $scope.notImageUrl=false
            } else {
              if(!$scope.invalidUrl && u && u.trim() !== "" && ($scope.drop.stream_id ==1 || $scope.drop.stream_id == 33)){
                $scope.notImageUrl=true
              }else{
                $scope.notImageUrl=false
              }
            }
          });
        }
      }else{
        $scope.notImageUrl=false
      }
    }

    vm.getLakeStreamLinkByIds = (lakeId, streamId) => {
      vm.vendataUploaderror = false;
      vm.venDataAddToQueueError = false;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      DataLakeService.GetLakeStreamLink(lakeId, streamId)
        .then(response => {
          $scope.isAllowMultipleDrops = true;
          response.length > 0
            ? ($scope.selectedLakeStream = response[0])
            : (scope.selectedLakeStream = {});
        })
        .catch(error => {
          logger.error(error);
        });
    };


    vm.downloadFile = (file, fileName, drop) => {
      let file_name = fileName;
      if (file_name.length > 4) {
        var lastFive = file_name.substr(file_name.length - 4);
        if (lastFive) {
          lastFive = lastFive.toLowerCase();
        }
        if (lastFive && lastFive != '.jpg' && lastFive != '.png' && lastFive != 'webp' && lastFive != 'jpeg' && drop.kind.includes("image")) {
          file_name = file_name + '.jpg'
        }
      }
      DataLakeService.DownloadDrop(vm.uuid, file, file_name)
        .then(response => { })
        .catch(error => { });
    };

    vm.AddedForUrl = drops => {
      vm.isUploading = true;
      vm.isAddedToQueue = true;
      vm.showCantGen = false;
      let params = {
        data: {
          url: $scope.drop.url,
          is_save_to_document_store: true
        }
      }
      DataLakeAPIService.API.CheckFileType(params)
        .then(res => {
          $scope.isGivenUrlAnImage($scope.drop, drops);
        })
        .catch(error => {
          vm.isAddedToQueue = false;
          vm.isUploading = false;
          vm.showCantGen = true;
          if (!$scope.isAllowMultipleDrops) {
            $scope.isAllowMultipleDrops = true;
            vm.isProcessing = false;
          }
        });
    }

    vm.addCoverImg = () => {
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        vm.AddedForUrl($scope.drops);
        vm.isProcessing = true;
      } else {
        vm.replaceExistingDropAndUpload();
      }
    }

    $scope.isGivenUrlAnImage = async (drop, drops) => {
      let url = drop.url;
      if (url) {
        url.includes("jpg") ||
          url.includes("jpeg") ||
          url.includes("image/png") ||
          url.includes("image/gif") ||
          url.includes("image/webp") ||
          url.includes("image/bmp") ||
          url.includes("image/svg") ||
          url.includes("images") ||
          url.includes("application/octet-stream") ?
          ($scope.isImage = true) :
          ($scope.isImage = false);
        blobtest()
        async function blobtest() {
          try {
            let blob = await fetch(url).then(r => r.blob())
              .then(blobFile => new File([blobFile], url, { type: "image/jpeg" }))
            let files = [blob];
            vm.selectFiles(files, []);
            if (!$scope.isAllowMultipleDrops && $stateParams.id) {
              vm.replaceExistingDropAndUpload();
            } else {
              $scope.dropsForselectedLakeStream = [];
              vm.vendataUploaderror = false;
              vm.venDataAddToQueueError = false;
              if (drops && drops.length > 0) {
                if ($scope.selectedLakeStream.stream_id == 33) {
                  let coverDrops = drops.filter(item => {
                    return item.stream_id == 33;
                  });
                  if (coverDrops && coverDrops.length > 0) {

                    $scope.isAllowMultipleDrops = false;
                    vm.isUploading = false;
                    vm.isAddedToQueue = false;
                  } else {
                    vm.addToQueueOrUploadDrop();
                  }
                } else {
                  vm.addToQueueOrUploadDrop();
                }
              } else {
                vm.addToQueueOrUploadDrop();
              }
            }
          } catch (err) {
            let blob = await fetch(url, { mode: 'no-cors' }).then(r => r.blob())
              .then(blobFile => new File([blobFile], url, { type: "image/jpeg" }))
            let files = [blob];
            vm.selectFiles(files, []);
            if (!$scope.isAllowMultipleDrops && $stateParams.id) {
              vm.replaceExistingDropAndUpload(drop);
            } else {
              vm.addToQueueOrUploadDrop(drop);
            }
            vm.isUploading = false;
            vm.isAddedToQueue = false;
            // vm.showCantGen = true;
            if (!$scope.isAllowMultipleDrops) {
              $scope.isAllowMultipleDrops = true;
              vm.isProcessing = false;
            }
          }
        }
      } else {
        vm.isUploading = false;
        vm.isAddedToQueue = false;
        if (!$scope.isAllowMultipleDrops) {
          $scope.isAllowMultipleDrops = true;
          vm.isProcessing = false;
        }
      }
    };

    $scope.resetAllconfigData = () => {
      vm.vendataUploaderror = false;
      vm.venDataAddToQueueError = false;
      vm.showCantGen = false;
      $scope.files = [];
      $scope.drop.url = null;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
    }

    vm.uniqueId = 0;
    vm.isAllowedMultipleDropsForSelectedStream = drops => {
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        // vm.AddedForUrl(drops);
        if (drops && drops.length > 0) {
          if ($scope.selectedLakeStream.stream_id == 33) {
            let coverDrops = drops.filter(item => {
              return item.stream_id == 33;
            });
            if (coverDrops && coverDrops.length > 0) {
              $scope.isAllowMultipleDrops = false;
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              $scope.notImage=false
              $scope.notImageUrl=false
              $scope.invalidUrl = false;
            } else {
              vm.AddedForUrl(drops);
            }
          } else {
            vm.AddedForUrl(drops);
          }
        } else {
          vm.AddedForUrl(drops);
        }
      } else {
        $scope.dropsForselectedLakeStream = [];
        vm.isUploading = true;
        vm.vendataUploaderror = false;
        vm.isAddedToQueue = true;
        vm.venDataAddToQueueError = false;
        if (drops && drops.length > 0) {
          if ($scope.selectedLakeStream.stream_id == 33) {
            let coverDrops = drops.filter(item => {
              return item.stream_id == 33;
            });
            if (coverDrops && coverDrops.length > 0) {

              $scope.isAllowMultipleDrops = false;
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              $scope.notImage=false
              $scope.notImageUrl=false
              $scope.invalidUrl = false;
            } else {
              vm.addToQueueOrUploadDrop();
            }
          } else {
            vm.addToQueueOrUploadDrop();
          }
        } else {
          vm.addToQueueOrUploadDrop();
        }
      }
    };

    vm.replaceExistingDropAndUpload = (detai) => {
      let coverDrops = $scope.drops.filter(item => {
        return item.stream_id == 33;
      });
      let drop = []
      if (coverDrops && coverDrops.length > 0) {
        drop = coverDrops[0];
      }
      // let drop = $scope.dropsForselectedLakeStream[0];
      drop.instance_id = parseInt($stateParams.id);
      drop.uuid = vm.uuid;
      vm.isProcessing = true;
      let uploadResponse = vm.uploadDrop(drop, $stateParams.id,detai)
        .then(() => { })
        .catch(() => { });
      let removeResponse = vm.removeDrop(drop)
        .then(() => { })
        .catch(() => { });
      Promise.allSettled([uploadResponse, removeResponse])
        .then(() => {
          $scope.isAllowMultipleDrops = true;
        })
        .catch(() => { });
    };

    vm.resetValues = () => {
      $scope.drop.stream_id = null;
      $scope.files = undefined;
      $scope.errFiles = undefined;
      $scope.drop.url = undefined;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      if (vm.drop_form.ur) {
        vm.drop_form.url.$setPristine();
      }
    }

    vm.deleteDropsFromQueue = dropId => {
      let ids = $scope.queuedDrops.map(it => it.unique_id);
      let index = ids.indexOf(dropId.unique_id);
      if (dropId.stream.toLowerCase() === "cover image" && dropId.is_thumbnail) {

        // store the value of index
        vm.dropIndex = index;
        vm.coverIndexId = dropId.coverImgId;
        vm.DeletionConfirmation = true;
        // if stream is thumbnail and copy of cover image
      } else if (dropId.stream.toLowerCase() == "thumbnail" && dropId.is_coverImage) {
        // removing image from thumbnail
        $scope.queuedDrops.splice(index, 1);
        // update the cover image record with is_thumbnail 0
        for (let i = 0; i < $scope.queuedDrops.length; i++) {
          if ($scope.queuedDrops[i].is_thumbnail) {
            $scope.queuedDrops[i].is_thumbnail = 0;
          }
        }
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      } else {
        // $scope.queuedDrops.splice(index, 1);
        $scope.queuedDrops.splice(index, 1);
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      if ($scope.queuedDrops.length === 0) {
        $scope.isAllowMultipleDrops = true;
      }
    };

    vm.addToQueueOrUploadDrop = (del) => {
      if ($stateParams.id === undefined) {
        vm.addDropToQueue();
        // $scope.drop.stream_id = null;
        // $scope.files = undefined;
        // $scope.errFiles = undefined;
        // $scope.drop.url = undefined;
        // vm.drop_form.url.$setPristine();
      } else {
        vm.uploadDrop($scope.drop, $stateParams.id,del)
          .then(() => { })
          .catch(() => { });
      }
    };

    // on create location delete drop after confirmation
    vm.deleteDropFromQueue = () => {
      vm.DeletionConfirmation = false;
      let index = vm.dropIndex;
      $scope.queuedDrops.splice(index, 1);
      for (let i = 0; i < $scope.queuedDrops.length; i++) {
        if (
          $scope.queuedDrops[i].stream.toLowerCase() == "thumbnail" &&
          $scope.queuedDrops[i].is_coverImage
        ) {
          $scope.queuedDrops.splice(i, 1);
        }
      }
      $scope.isAllowMultipleDrops = true;
    };

    // To remove the drop from queue
    vm.removeDropsFromQueue = index => {
      let deletedDrop = $scope.queuedDrops[index];
      if (
        deletedDrop.stream.toLowerCase() === "cover image" &&
        deletedDrop.is_thumbnail
      ) {
        // store the value of index
        vm.dropIndex = index;
        vm.DeletionConfirmation = true;
        // if stream is thumbnail and copy of cover image
      } else if (
        deletedDrop.stream.toLowerCase() == "thumbnail" &&
        deletedDrop.is_coverImage
      ) {
        // removing image from thumbnail
        $scope.queuedDrops.splice(index, 1);
        // update the cover image record with is_thumbnail 0
        for (let i = 0; i < $scope.queuedDrops.length; i++) {
          if ($scope.queuedDrops[i].is_thumbnail) {
            $scope.queuedDrops[i].is_thumbnail = 0;
          }
        }
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      } else {
        $scope.queuedDrops.splice(index, 1);
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      if ($scope.queuedDrops.length === 0) {
        $scope.isAllowMultipleDrops = true;
      }
    };

    vm.resetModel = () => {
      $scope.drop = {
        source: "Local"
      };
      $scope.files = undefined;
      $scope.errFiles = undefined;
      vm.fetchDropLakesByUuid();
      vm.getDropStatus();
    };

    // To delete drop
    vm.removeDrop = drop => {
      return new Promise((resolve, reject) => {
        try {
          vm.isDeleting = true;
          drop.uuid = vm.uuid;
          if (vm.dropToDelete) {
            drop = vm.dropToDelete;
          }
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Deleting drop in progress";
          DataLakeService.DeleteDrop(drop)
            .then(() => {
              vm.dropToDelete = undefined;
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the vendor";
              delete vm.oldVendorData.thumbnail;
              delete vm.oldVendorData.summaryThumbnail;
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              resolve(true);
              $timeout(() => {
                vm.showConfirmDeletion = false;
                angular.element("#showQueueMessage").hide();
                vm.showSuccessQueueMessage = null;
                vm.isProcessing = false;
                vm.isDeleting = false;
              }, 4500);
            })
            .catch(error => {
              vm.isProcessing = false;
              vm.isDeleting = false;
              reject(false);
              logger.error(error);
            });
        } catch (error) {
          reject(false);
          logger.error(error);
        }
      });
    };

    // function to get confirmation before delete drop
    vm.confirmRemoveDrop = (drop, flag) => {
      // if stream is cover image
      if (drop.stream.toLowerCase() === "cover image" && drop.is_thumbnail) {
        // show a confirmation panel to ask the permission to delete thumbnail also.
        vm.showConfirmDeletion = true;
        vm.dropToDelete = drop;
      } else if (
        drop.stream.toLowerCase() === "thumbnail" &&
        drop.is_coverImage
      ) {
        vm.dropToDelete = undefined;
        let object = {
          drop_id: drop.drop_id,
          instance_id: drop.instace_id,
          is_thumbnail: 0
        };
        DataLakeAPIService.API.UpdateDetails(object)
          .then(response => {
            vm.$updateBtnText = "Update";
            angular.element("#showQueueMessage").show();
            vm.isDeleting = 1;
            vm.showSuccessQueueMessage = "Image unlinked from the vendor";
            vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
            vm.resetModel();
            // This function is to remove the confirm box
            vm.initializeDropForm();
            $timeout(() => {
              angular.element("#showQueueMessage").hide();
              vm.showSuccessQueueMessage = null;
              vm.isProcessing = false;
              vm.isDeleting = false;
            }, 4500);
          })
          .catch(error => {
            logger.error(error);
            $scope.actionFail = true;
          });
      } else {
        vm.dropToDelete = undefined;
        vm.removeDrop(drop)
          .then(() => { })
          .catch(() => { });
      }
    };

    vm.addDropToQueue = () => {
      vm.isAddedToQueue = true;
      $scope.queuedDrops === undefined ? ($scope.queuedDrops = []) : null;
      vm.uniqueId = vm.uniqueId + 1;
      let queuedDropObject = {
        lake: $scope.selectedLakeStream.lake,
        stream: $scope.selectedLakeStream.stream,
        stream_code: $scope.selectedLakeStream.stream_code,
        lake_id: $scope.drop.lake_id,
        stream_id: $scope.drop.stream_id,
        uuid: vm.uuid,
        source: 'local',
        url: undefined,
        status_id: $scope.drop.status_id,
        is_save_to_document_store: $scope.drop.is_save_to_document_store,
        unique_id: vm.uniqueId
      };
      // if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
      //   queuedDropObject.url = $scope.drop.url;
      // } else if (
      //   $scope.drop.source &&
      //   $scope.drop.source.toLowerCase() === "local"
      // ) {
      if ($scope.files && $scope.files[0]) {
        queuedDropObject.size = $scope.files[0].size;
        queuedDropObject.file_name = $scope.files[0].name;
        queuedDropObject.files = $scope.files;
      }
      // }
      // If is_thumbnail is there
      if (vm.is_thumbnail) {
        queuedDropObject.is_thumbnail = vm.is_thumbnail;
      }
      // $scope.queuedDrops.push(queuedDropObject);

      // if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url" && $scope.drop.is_save_to_document_store) {
      //   let params = {
      //     data: queuedDropObject
      //   }
      //   DataLakeAPIService.API.CheckFileType(params)
      //     .then(res => {
      //       $scope.queuedDrops.push(queuedDropObject);
      //       if (queuedDropObject && queuedDropObject.stream.toLowerCase() === "cover image" && vm.is_thumbnail) {
      //         vm.uniqueId = vm.uniqueId + 1;
      //         let obj = {
      //           lake: queuedDropObject.lake,
      //           lake_id: queuedDropObject.lake_id,
      //           stream: "Thumbnail",
      //           stream_code: "thumbnail",
      //           stream_id: 1,
      //           url: queuedDropObject.url,
      //           file_name: queuedDropObject.file_name,
      //           is_coverImage: true,
      //           coverImgId: queuedDropObject.unique_id,
      //           unique_id: vm.uniqueId
      //         };
      //         $scope.queuedDrops.push(obj);
      //       }
      //       if ($scope.queuedDrops.length > 0) {
      //         vm.isUploading = false;
      //         angular.element("#showQueueMessage").show();
      //         vm.showSuccessQueueMessage = "Image added to the Queue";
      //         vm.resetModel();
      //         $timeout(() => {
      //           angular.element("#showQueueMessage").hide();
      //           vm.showSuccessQueueMessage = null;
      //         }, 2500);
      //       }
      //       vm.resetValues();
      //       vm.isAddedToQueue = false;
      //     })
      //     .catch(error => {
      //       vm.isAddedToQueue = false;
      //       // vm.venDataAddToQueueError = error.data;
      //       vm.venDataAddToQueueError = "File type is not suitable for physical upload";
      //     });
      // } else {
      $scope.queuedDrops.push(queuedDropObject);
      if (queuedDropObject && queuedDropObject.stream.toLowerCase() === "cover image" && vm.is_thumbnail) {
        vm.uniqueId = vm.uniqueId + 1;
        let obj = {
          lake: queuedDropObject.lake,
          lake_id: queuedDropObject.lake_id,
          stream: "Thumbnail",
          stream_code: "thumbnail",
          stream_id: 1,
          url: queuedDropObject.url,
          file_name: queuedDropObject.file_name,
          is_coverImage: true,
          coverImgId: queuedDropObject.unique_id,
          unique_id: vm.uniqueId,
          size: queuedDropObject.size
        };
        $scope.queuedDrops.push(obj);
      }
      if ($scope.queuedDrops.length > 0) {
        vm.isUploading = false;
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image added to the Queue";
        vm.resetValues();
        vm.resetModel();
        $timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      vm.isAddedToQueue = false;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      // }
      // If stream is cover image and is_thumbnail is true, then save the cover image as thumbnail
      // if (
      //   $scope.queuedDrops[0] &&
      //   $scope.queuedDrops[0].stream.toLowerCase() === "cover image" &&
      //   vm.is_thumbnail
      // ) {
      //   let obj = {
      //     lake: $scope.queuedDrops[0].lake,
      //     lake_id: $scope.queuedDrops[0].lake_id,
      //     stream: "Thumbnail",
      //     stream_code: "thumbnail",
      //     stream_id: 1,
      //     url: $scope.queuedDrops[0].url,
      //     file_name: $scope.queuedDrops[0].file_name,
      //     is_coverImage: true
      //   };
      //   $scope.queuedDrops.push(obj);
      // }

      // if ($scope.queuedDrops.length > 0) {
      //   vm.isUploading = false;
      //   angular.element("#showQueueMessage").show();
      //   vm.showSuccessQueueMessage = "Image added to the Queue";
      //   //reset manage drops page to initial state
      //   vm.resetModel();
      //   $timeout(() => {
      //     angular.element("#showQueueMessage").hide();
      //     vm.showSuccessQueueMessage = null;
      //   }, 2500);
      // }
    };

    vm.uploadQueuedDrops = insertedLocationId => {
      if ($scope.queuedDrops) {
        for (let i = 0; i < $scope.queuedDrops.length; i++) {
          $scope.queuedDrops[i].instance_id = insertedLocationId;
          DataLakeService.UploadDrop($scope.queuedDrops[i])
            .then(res => {
              // After create of drops, it should be shown in the list immidietly
              if (res && res.data && (i === $scope.queuedDrops.length - 1 ||
                ($scope.queuedDrops[i].is_thumbnail && i === ($scope.queuedDrops.length / 2) - 1)
              )) {
                vm.getVendorMetaData(); //Load all drops and images after creating new drop
              }
            })
            .catch(error => {
              logger.error(error);
            });
        }
      }
    };

    vm.uploadDrop = (drop, instanceId,del) => {
      return new Promise((resolve, reject) => {
        try {
          vm.isUploading = true;
          drop = angular.copy($scope.drop);
          drop.instance_id = instanceId;
          drop.uuid = vm.uuid;
          drop.files = $scope.files;
          drop.is_thumbnail = vm.is_thumbnail;
          drop.source = "local";
          drop.url = undefined;
          if(del){
            if(del.source==="URL" && del.url){
              drop.url=del.url
              drop.thumbnail=del.url
            }
          }
          DataLakeService.UploadDrop(drop)
            .then(() => {
              vm.is_thumbnail = 1;
              // After create of drops, it should be shown in the list immidietly
              vm.getVendorMetaData();
              // reset manage drops page to initial state
              vm.resetModel();
              resolve(true);
              $timeout(() => {
                vm.isUploading = false;
                vm.isAddedToQueue = false;
                vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
                vm.validationMessage = null;
                $scope.notImage=false
                $scope.notImageUrl=false
                $scope.invalidUrl = false;
              }, 2000);
            })
            .catch(error => {
              reject(false);
              logger.error(error);
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              vm.vendataUploaderror = "File type is not suitable for physical upload";
              // vm.vendataUploaderror = error.data;
            });
        } catch (error) {
          reject(false);
          logger.error(error);
        }
        $timeout(() => {
          vm.isUploading = false;
          vm.isAddedToQueue = false;
          // vm.skudataUploaderror = false;
        }, 3000)
      });
    };

    //Storage function END

    /*********** Save,update or delete vendor implementation ************/
    vm.save = (entityName, payload) => {
      let dataToBeSaved = _.clone(payload);
      if (
        entityName &&
        entityName.toLowerCase() === "vendor" &&
        !vm.disableActions
      ) {
        // Variable to show the Published review section.
        vm.publishResponseMessage = true;
        vm.isProcessing = true;
        if (dataToBeSaved.effective_date && dataToBeSaved.next_effective_date) {
          dataToBeSaved.effective_date = $scope.getFormattedDate(
            payload.effective_date
          );
          dataToBeSaved.next_effective_date = $scope.getFormattedDate(
            payload.next_effective_date
          );
        }
        if (
          payload.individual_id_or_company &&
          payload.individual_id_or_company.toLowerCase() === "company"
        ) {
          $scope.department_id = payload.department_id;
        }
        $scope.individual_id_or_company_id =
          payload.individual_id_or_company_id;
        $scope.department = true;
        dataToBeSaved.buyer_id = $scope.buyer_hierarchy_value_id;
        // get Comapany or Individual name by payload.individual_id_or_company_id from vm.allCompanies
        payload.individual_id_or_company_id = parseInt(
          payload.individual_id_or_company_id
        );
        if (
          payload.individual_or_company &&
          payload.individual_or_company.toLowerCase() === "company"
        ) {
          payload.name =
            vm.allCompanies[
              vm.allCompanies.findIndex(
                company => company.id === payload.individual_id_or_company_id
              )
            ].name;
        }
        if (
          payload.individual_or_company &&
          payload.individual_or_company.toLowerCase() === "individual"
        ) {
          payload.name =
            vm.allindividuals[
              vm.allindividuals.findIndex(
                individual =>
                  individual.id === payload.individual_id_or_company_id
              )
            ].name;
        }
        // get purchase_terms by purchase_terms_id from vm.allVendorPurchaseTerms
        payload.purchase_terms =
          vm.allVendorPurchaseTerms[
            vm.allVendorPurchaseTerms.findIndex(
              purchaseTerm =>
                purchaseTerm.id === Number(payload.purchase_terms_id)
            )
          ].description;
        // get VendorType by type_id from vm.allVendorTypes
        payload.VendorType =
          vm.allVendorTypes[
            vm.allVendorTypes.findIndex(
              type => type.id === Number(payload.type_id)
            )
          ].short_description;
        VendorService.API.InsertVendor(dataToBeSaved)
          .then(response => {
            vm.isProcessing = false;
            vm.savedToMasterList = true;
            vm.showparametervalues = true;
            vm.opdone = true;
            payload.id = response.data.inserted_id;
            vm.totalRecordCount = vm.totalRecordCount + 1;
            vm.vendor_properties === undefined
              ? (vm.vendor_properties = {})
              : null;
            vm.vendor_properties.vendor_id = response.data.inserted_id;
            vm.vendor_properties.rms_vendor_short_name =
              dataToBeSaved.rms_vendor_short_name;
            vm.vendor_properties.rms_vendor_short_sequence =
              dataToBeSaved.rms_vendor_short_sequence;
            vm.vendor_properties.rms_vendor_number =
              dataToBeSaved.rms_vendor_number;
            vm.vendor_properties.inventory_method_id =
              dataToBeSaved.inventory_method_id;
            vm.vendor_properties && Object.keys(vm.vendor_properties).length > 0 ? vm.insertVendorProperties(vm.vendor_properties) : "";
            payload.factor ? vm.upsertVendorPricingFactor(
              payload.factor,
              vm.vendor_properties.vendor_id
            ) : "";
            // set next_effective_date if it is none
            payload.next_status && payload.next_status.toLowerCase() === "none"
              ? (payload.next_effective_date = "1970-01-01")
              : "";
            //push newly created vendor to list of vendors
            vm.vendorsDataList.length > 0
              ? vm.vendorsDataList.unshift(payload)
              : (vm.vendorsDataList = payload);
            vm.VendorsMap[payload.id] = payload;
            //if group by filter is applied then update vendor from group array
            if (vm.groupByField) {
              //find index of group under which current vendor exist
              let groupFieldIndex = vm.groupVendors.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );
              if (groupFieldIndex === -1) {
                vm.groupVendors.push({
                  [vm.groupByField]: payload[vm.groupByField],
                  count: 1,
                  expanded: false,
                  selected: 1,
                  vendors: [payload]
                });
              } else if (
                groupFieldIndex > -1 &&
                vm.groupVendors[groupFieldIndex].vendors
              ) {
                saveBtnText;
                vm.groupVendors[groupFieldIndex].vendors.unshift(payload);
                vm.groupVendors[groupFieldIndex].count++;
              } else {
                vm.groupVendors[groupFieldIndex].count++;
              }
              vm.groupVendorsMap[payload.id] = payload;
            }
            if (common.SessionMemory.API.Get("vendorList")) {
              let vendorsList = JSON.parse(common.SessionMemory.API.Get("vendorList"));
              vendorsList.push(payload);
              common.SessionMemory.API.Post("vendorList", JSON.stringify(vendorsList));
            }
            //After creating vendor, updalod drops which are in queue
            vm.uploadQueuedDrops(response.data.inserted_id);
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              response: response,
              inserted_id: response.data.inserted_id
            });
            $scope.$broadcast("saveOrUpdateDepartmentDetails", {
              event: "save",
              response: response,
              inserted_id: response.data.inserted_id
            });
          })
          .catch(error => {
            vm.isProcessing = false;
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              response: error
            });
            $scope.$broadcast("saveOrUpdateDepartmentDetails", {
              event: "save",
              response: error
            });
          });
      } else if (
        entityName &&
        entityName.toLowerCase() === "company" &&
        !vm.disableActions
      ) {
        vm.saveBtnText = "Saving now...";
        $scope.head.individual_id_or_company_id = null;
        CompanyService.API.InsertCompany(payload)
          .then(response => {
            vm.previousCompany = payload;
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            $scope.head.individual_id_or_company_id = response.data.inserted_id;
            vm.getAllCompanies();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.saveBtnText = "Oops.!! Something went wrong";
              vm.saveBtnError = true;
              vm.error = true;
              vm.message = error.data.error.message;
              $timeout(() => {
                vm.saveBtnText = "Save";
                vm.saveBtnError = false;
                vm.message = null;
              }, 2500);
            }
          });
      } else if (
        entityName &&
        entityName.toLowerCase() === "department" &&
        !vm.disableActions
      ) {
        vm.saveBtnText = "Saving now...";
        payload.company_id = $scope.head.individual_id_or_company_id;
        CompanyDepartmentService.API.InsertCompanyDepartment(payload)
          .then(response => {
            vm.previousDepartment = payload;
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            vm.getCompanyDetails($scope.head.individual_id_or_company_id);
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.saveBtnText = "Oops.!! Something went wrong";
              vm.saveBtnError = true;
              vm.error = true;
              vm.message = error.data.error.message;
              $timeout(() => {
                vm.saveBtnText = "Save";
                vm.saveBtnError = false;
                vm.message = null;
              }, 2500);
            }
          });
      } else if (
        entityName &&
        entityName.toLowerCase() === "associate" &&
        !vm.disableActions
      ) {
        vm.saveBtnText = "Saving now...";
        payload.company_department_id = vm.company_department_id;
        CompanyAssociateService.API.InsertCompanyAssociate(payload)
          .then(response => {
            vm.previousAssociate = payload;
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            vm.getCompanyDetails($scope.head.individual_id_or_company_id);
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.saveBtnText = "Oops.!! Something went wrong";
              vm.saveBtnError = true;
              vm.error = true;
              vm.message = error.data.error.message;
              $timeout(() => {
                vm.saveBtnText = "Save";
                vm.saveBtnError = false;
                vm.message = null;
              }, 2500);
            }
          });
      } else if (
        entityName &&
        entityName.toLowerCase() === "individual" &&
        !vm.disableActions
      ) {
        vm.previousI = payload;
        vm.saveBtnText = "Saving Now...";
        $scope.head.individual_id_or_company_id = null;
        IndividualService.API.InsertIndividual(payload)
          .then(response => {
            vm.saveBtnText = "Save";
            vm.isSaveSuccess = true;
            $scope.head.individual_id_or_company_id = response.data.inserted_id;
            vm.getAllIndividuals();
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.saveBtnText = "Oops.!! Something went wrong";
              vm.saveBtnError = true;
              vm.error = true;
              vm.message = error.data.error.message;
              $timeout(() => {
                vm.saveBtnText = "Save";
                vm.saveBtnError = false;
                vm.message = null;
              }, 2500);
            }
          });
      }
    };

    /**
     * Function to add pricing factor for a vendor
     */
    vm.addVendorPricingFactor = (pricingFactor, vendorId) => {
      //Check if the pricing factor has valid value
      if (
        pricingFactor &&
        pricingFactor !== null &&
        pricingFactor !== undefined &&
        vendorId
      ) {
        /**
         * Prepare pricing factor object
         * Type of the pricing factor will be 'vendor',
         * Link id being the vendor id
         * Factor is the pricing factor to be applied for a vendor
         **/
        let pricingFactorObject = {
          type: "vendor",
          link_id: vendorId,
          factor: parseFloat(pricingFactor).toFixed(3)
        };
        //Add pricing factor for vendor entity from item service
        ItemService.API.AddPricingFactorForAnEntity(pricingFactorObject)
          .then(response => {
            vm.message = "Pricing Factor created successfully!";
          })
          .catch(error => {
            vm.error = "Error in creating Pricing Factor!";
          });
      }
    };

    //funcion to check if the payload has changed, if yes returns true else returns false
    vm.hasPayloadChanges = payload => {
      vm.oldVendorData["effective_date"] = moment(
        vm.oldVendorData["effective_date"]
      ).format("YYYY-MM-DD");
      vm.oldVendorData["next_effective_date"].toLowerCase() === "none"
        ? (vm.oldVendorData["next_effective_date"] = "1970-01-01")
        : null;
      let omitKeys = [
        "thumbnail",
        "summaryThumbnail",
        "drop_id",
        "next_status",
        "status",
        "company",
        "factor",
        "buyer",
        "purchase_terms",
        "$edit",
        "$$hashKey",
        "isShowUpdateProcessing",
        "update_vendor_reorder_in_items",
        "update_buyer_id_in_items",
        "old_buyer_id"
      ];
      for (let key in payload) {
        if (!omitKeys.includes(key)) {
          if (payload[key] === vm.oldVendorData[key]) {
            vm.hasUpdate = false;
          } else if (payload[key] != vm.oldVendorData[key]) {
            return (vm.hasUpdate = true);
          }
        }
      }
      if ($scope.head.factor != vm.old_pricing_factor) {
        return (vm.hasUpdate = true);
      } else {
        vm.hasUpdate = false;
      }
      return vm.hasUpdate;
    };

    vm.goToScreen = currentScreen => {
      vm.resetFormField()
      vm.validationMessage = null;
      vm.validationError = [];
      vm.publishResponseMessage = false;
      vm.vendataUploaderror = false;
      vm.opdone = false;
      if (
        currentScreen &&
        currentScreen.toLowerCase() === "vendormasterscreen"
      ) {
        vm.createForm = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.showSummaryPanel = true;
        vm.previewAndPublish = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "userdefineddataconfigurationscreen"
      ) {
        vm.createForm = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.configureScreen = true;
        vm.back = true;
        // This array is used to set the UDD validation
        $scope.uddValidationErrors = [];
        //Close the company side panel when navigating to the next screen.
        vm.showCmpDetails = false;
        //Close the department side panel when navigating to the next screen.
        vm.isCompanyDepartmentSidePanelVisible = false;
        //Close the individual side panel when navigating to the next screen.
        vm.showIndDetails = false;
        //Close the associate side panel when navigating to the next screen.
        vm.isShowAssociateDetails = false;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
        // $scope.$broadcast("initUserDefinedData", {
        //   a: 10
        // });
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "dropconfigurationscreen"
      ) {
        vm.configureScreen = false;
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        vm.createForm = false;
        vm.back = true;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      }
    };

    vm.validateVendor = () => {
      vm.validationError = [];
      vm.isInvalidForm = false;
      //if current screen is create/update master data form and form data
      //is valid and all mandatory fields are filled then go to next stage
      if (
        (vm.ven_maint_form && vm.ven_maint_form.$invalid) ||
        !$scope.head.buyer_id ||
        //(!vm.primaryDepartment) || 
        //(!vm.mainAddress) || 
        (vm.vendor_properties.inventory_method_id.length == 0) ||
        (vm.isUpdateVendor && vm.isUnassignedInventoryMethod) || (!vm.isUpdateVendor && (!$scope.head.rms_vendor_short_name || !$scope.head.rms_vendor_short_sequence))
        || (vm.isUpdateVendor && (!vm.vendor_properties.rms_vendor_short_name || !vm.vendor_properties.rms_vendor_short_sequence || vm.vendor_properties.rms_vendor_short_name == '' || vm.vendor_properties.rms_vendor_short_sequence == ''))
      ) {
        //Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields In Vendor Master Screen."
        );
      }
      if ((vm.departmentForm1 && vm.departmentForm1.$invalid) ||
        (vm.departmentForm2 && vm.departmentForm2.$invalid) ||
        (vm.departmentForm3 && vm.departmentForm3.$invalid) ||
        (vm.departmentForm4 && vm.departmentForm4.$invalid)) {
        //Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in Department Address and Contact Screen."
        );
      }
      if (vm.uddForm && vm.uddForm.$invalid) {
        //Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in UDD Configuration Screen."
        );
      }

      if (vm.duplicateShortNameMessage) {
        //Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in Vendor Master Screen."
        );
      }
      return vm.isInvalidForm;
    };

    vm.update = (entityName, payload, properties, isPublishChanges) => {
      if (isPublishChanges) {
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.createForm = false;
        vm.addressContactScreen = false;
        vm.back = true;
      }
      payload.individual_id_or_company_id = parseInt(
        payload.individual_id_or_company_id
      );
      payload.purchase_terms_id = parseInt(payload.purchase_terms_id);
      payload.type_id = parseInt(payload.type_id);
      payload.isShowUpdateProcessing = false;
      if (
        payload.individual_or_company &&
        payload.individual_or_company.toLowerCase() === "company"
      ) {
        payload.name =
          vm.allCompanies[
            vm.allCompanies.findIndex(
              company => company.id === payload.individual_id_or_company_id
            )
          ].name;
      }
      if (
        payload.individual_or_company &&
        payload.individual_or_company.toLowerCase() === "individual"
      ) {
        payload.name =
          vm.allindividuals[
            vm.allindividuals.findIndex(
              individual =>
                individual.id === payload.individual_id_or_company_id
            )
          ].name;
      }
      var dataToBeUpdated = _.clone(payload);
      if (
        entityName &&
        entityName.toLowerCase() === "vendor" &&
        !vm.disableActions
      ) {
        dataToBeUpdated.effective_date = $scope.getFormattedDate(
          payload.effective_date
        );
        dataToBeUpdated.next_effective_date = $scope.getFormattedDate(
          payload.next_effective_date
        );

        if (
          dataToBeUpdated.individual_or_company &&
          dataToBeUpdated.individual_or_company.toLowerCase() === "individual"
        ) {
          delete dataToBeUpdated.department_id;
        }

        if ($scope.effective_val === false) {
          dataToBeUpdated.next_effective_date = "1970-01-01";
        }
        dataToBeUpdated.buyer_id = $scope.buyer_hierarchy_value_id;
        // variable to controle the loader functionality
        vm.isProcessing = true;
        // Variable to show the Published review section.
        vm.publishResponseMessage = true;
        // vendor short name and vendor short sequence added before update
        vm.vendor_properties !== undefined
          ? (dataToBeUpdated.rms_vendor_short_name =
            vm.vendor_properties.rms_vendor_short_name)
          : null;
        vm.vendor_properties !== undefined
          ? (dataToBeUpdated.rms_vendor_short_sequence =
            vm.vendor_properties.rms_vendor_short_sequence)
          : null;
        vm.vendor_properties !== undefined
          ? (dataToBeUpdated.rms_vendor_number =
            vm.vendor_properties.rms_vendor_number)
          : null;
        vm.vendor_properties !== undefined
          ? (dataToBeUpdated.inventory_method_id =
            vm.vendor_properties.inventory_method_id)
          : null;
        if (!vm.validateVendor()) {
          if (vm.hasPayloadChanges(dataToBeUpdated) || (vm.edit_vendor && vm.edit_vendor.name !== vm.oldVendorData.name)) {
            VendorService.API.UpdateVendor(dataToBeUpdated)
              .then(response => {
                vm.isProcessing = false;
                payload.$edit = false;
                if (vm.edit_vendor) {
                  vm.updateVendorName(vm.edit_vendor);
                }
                vm.isEditVendorName = false;
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "save",
                  response: response,
                  inserted_id: payload.id
                });
                $scope.$broadcast("saveOrUpdateDepartmentDetails", {
                  event: "save",
                  response: response,
                  vendor_id: payload.id,
                  isVendorMasterDataUpdated: true
                });
                if (response.data && response.data.data) {
                  //put same cover image as in payload for updated vendor
                  response.data.data.thumbnail = vm.oldVendorData && vm.oldVendorData.thumbnail ? vm.oldVendorData.thumbnail : "";
                } else {
                  response.data.data = payload;
                }
                //if group by filter is applied then update vendor from group array
                if (vm.groupByField) {
                  //find index of group under which current vendor exist
                  let groupFieldIndex = vm.groupVendors.findIndex(
                    group =>
                      group[vm.groupByField] ===
                      vm.groupVendorsMap[payload.id][vm.groupByField]
                  );
                  //find index of vendor from vendors list under the selected group
                  let groupIndex = vm.groupVendors[
                    groupFieldIndex
                  ].vendors.findIndex(
                    vendor => parseInt(vendor.id) === parseInt(payload.id)
                  );

                  if (groupFieldIndex === -1) {
                    vm.groupVendors.push({
                      [vm.groupByField]: payload[vm.groupByField],
                      count: 1,
                      expanded: false,
                      selected: 1,
                      vendors: [payload]
                    });
                  } else if (
                    groupFieldIndex > -1 &&
                    vm.groupVendors[groupFieldIndex].vendors[groupIndex][
                    vm.groupByField
                    ] !== response.data.data[vm.groupByField]
                  ) {
                    vm.groupVendors[groupFieldIndex].vendors.splice(
                      groupIndex,
                      1
                    );
                    vm.groupVendors[groupFieldIndex].count--;
                    let newGroupFieldIndex = vm.groupVendors.findIndex(
                      group =>
                        group[vm.groupByField] ===
                        response.data.data[vm.groupByField]
                    );
                    if (newGroupFieldIndex === -1) {
                      vm.groupVendors.push({
                        [vm.groupByField]: response.data.data[vm.groupByField],
                        count: 1,
                        expanded: false,
                        selected: 1,
                        vendors: [response.data.data]
                      });
                    } else if (
                      newGroupFieldIndex > -1 &&
                      vm.groupVendors[newGroupFieldIndex].vendors
                    ) {
                      vm.groupVendors[newGroupFieldIndex].vendors.unshift(
                        response.data.data
                      );
                      vm.groupVendors[newGroupFieldIndex].count++;
                      vm.groupVendorsMap[payload.id] = response.data.data;
                    } else {
                      vm.groupVendors[newGroupFieldIndex].count++;
                    }
                    //update vendor from list
                    //vm.groupVendors[groupFieldIndex].vendors[groupIndex] = response.data.data;
                    vm.groupVendorsMap[payload.id] = response.data.data;
                    //vm.groupVendors[groupFieldIndex].count++;
                  } else if (
                    groupFieldIndex > -1 &&
                    vm.groupVendors[groupFieldIndex].vendors
                  ) {
                    //update vendor from list
                    vm.groupVendors[groupFieldIndex].vendors[groupIndex] =
                      response.data.data;
                    vm.groupVendorsMap[payload.id] = response.data.data;
                  } else {
                    //vm.groupVendors[groupFieldIndex].count++;
                  }
                }
                //find index of current vendor by id in vendorsDataList
                let index = this.vendorsDataList.findIndex(
                  vendor => vendor.id === payload.id
                );
                //update vendor data in vendorsDataList and map
                this.vendorsDataList[index] = response.data.data;
                vm.oldVendorData = response.data.data;
                vm.vendor_properties && vm.vendor_properties.rms_vendor_short_name
                  ? (vm.oldVendorData.rms_vendor_short_name =
                    vm.vendor_properties.rms_vendor_short_name)
                  : null;
                vm.vendor_properties && vm.vendor_properties.rms_vendor_short_sequence
                  ? (vm.oldVendorData.rms_vendor_short_sequence =
                    vm.vendor_properties.rms_vendor_short_sequence)
                  : null;
                vm.vendor_properties && vm.vendor_properties.rms_vendor_number
                  ? (vm.oldVendorData.rms_vendor_number =
                    vm.vendor_properties.rms_vendor_number)
                  : null;
                vm.vendor_properties
                  ? (vm.oldVendorData.inventory_method_id =
                    vm.vendor_properties.inventory_method_id)
                  : null;
                vm.VendorsMap[payload.id] = response.data.data;
                vm.opdone = true;
                vm.updateVendorPropertiesById(properties);
                vm.upsertVendorPricingFactor(payload.factor, $stateParams.id);
                vm.isShowRmsNumberUpdate = false;
                if (common.SessionMemory.API.Get("vendorList")) {
                  let vendorsList = JSON.parse(common.SessionMemory.API.Get("vendorList"));
                  let idx = vendorsList.findIndex(ven => ven.id === payload.id);
                  if (idx > -1) {
                    vendorsList[idx] = angular.copy(payload);
                    common.SessionMemory.API.Post("vendorList", JSON.stringify(vendorsList));
                  }
                }
              })
              .catch(error => {
                vm.isProcessing = false;
                if (error.data && error.data.error) {
                  $scope.vendorErrorMessage = error.data.error.message;
                }
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "save",
                  response: error
                });
                $scope.$broadcast("saveOrUpdateDepartmentDetails", {
                  event: "save",
                  response: error,
                });
              });
          } else {
            $scope.message = "Nothing to update.";
            vm.isProcessing = false;
            vm.opdone = true;
            let response = {
              status: 403
            };
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              response: response,
              inserted_id: payload.id
            });
            $scope.$broadcast("saveOrUpdateDepartmentDetails", {
              event: "save",
              response: response,
              vendor_id: payload.id
            });
          }
        } else {
          vm.isProcessing = false;
          let response = {
            status: 412,
            form_validation_error: vm.validationError
          };
          $scope.$broadcast("saveOrUpdateUdd", {
            event: "save",
            response: response,
            inserted_id: payload.id
          });
          $scope.$broadcast("saveOrUpdateDepartmentDetails", {
            event: "save",
            response: response,
            vendor_id: payload.id
          });
        }
      } else if (
        entityName &&
        entityName.toLowerCase() === "department" &&
        !vm.disableActions
      ) {
        if (vm.hasUpdateChanges(entityName, payload) === true) {
          vm.updateBtnText = "Updating now...";
          payload.company_id = $scope.head.individual_id_or_company_id;
          CompanyDepartmentService.API.UpdateCompanyDepartment(payload)
            .then(response => {
              vm.updateBtnText = "Update";
              vm.isUpdateSuccess = true;
              vm.getCompanyDetails($scope.head.individual_id_or_company_id);
              // if (vm.primaryDepartment && payload.id === vm.primaryDepartment.department_id) {
              //   vm.primaryDepartment = undefined;
              // }
            })
            .catch(error => {
              if (error.status === 403) {
                vm.isUnauthorized = true;
              } else {
                vm.updateBtnText = "Oops.!! Something went wrong";
                vm.updateBtnError = true;
                vm.error = true;
                vm.message = error.data.error.message;
                $timeout(() => {
                  vm.message = null;
                  vm.updateBtnText = "Update";
                  vm.updateBtnError = false;
                }, 2500);
              }
            });
        } else {
          vm.updateBtnError = true;
          vm.updateBtnText = "Nothing to change";
          $timeout(() => {
            vm.updateBtnError = false;
            vm.updateBtnText = "Update";
          }, 2500);
        }
      } else if (
        entityName &&
        entityName.toLowerCase() === "associate" &&
        !vm.disableActions
      ) {
        if (vm.hasUpdateChanges(entityName, payload) === true) {
          vm.updateBtnText = "Updating now...";
          CompanyAssociateService.API.UpdateCompanyAssociate(payload)
            .then(response => {
              vm.updateBtnText = "Update";
              vm.isUpdateSuccess = true;
              vm.getCompanyDetails($scope.head.individual_id_or_company_id);
            })
            .catch(error => {
              if (error.status === 403) {
                vm.isUnauthorized = true;
              } else {
                vm.updateBtnText = "Oops.!! Something went wrong";
                vm.updateBtnError = true;
                vm.error = true;
                vm.message = error.data.error.message;
                $timeout(() => {
                  vm.message = null;
                  vm.updateBtnText = "Update";
                  vm.updateBtnError = false;
                }, 2500);
              }
            });
        } else {
          vm.updateBtnError = true;
          vm.updateBtnText = "Nothing to change";
          $timeout(() => {
            vm.updateBtnText = "Update";
            vm.updateBtnError = false;
          }, 2500);
        }
      }
    };

    //check that update form previous data is not same as payload
    vm.hasUpdateChanges = (entityName, payload) => {
      if (
        entityName &&
        entityName.toLowerCase() === "department" &&
        (vm.oldDepartment.name !== payload.name ||
          vm.oldDepartment.status_id !== payload.status_id) ||
        (vm.oldDepartment.is_primary !== payload.is_primary)
      ) {
        return true;
      } else if (
        entityName &&
        entityName.toLowerCase() === "associate" &&
        (vm.oldAssociate.individual_id !== payload.individual_id ||
          vm.oldAssociate.title_id !== payload.title_id ||
          vm.oldAssociate.status_id !== payload.status_id)
      ) {
        return true;
      } else {
        return false;
      }
    };

    /**
     * Function to update pricing factor for a vendor
     */
    vm.upsertVendorPricingFactor = (pricingFactor, vendorId) => {
      //Check if the pricing factor has valid value
      /**
       * Prepare pricing factor object
       * Type of the pricing factor will be 'vendor',
       * Link id being the vendor id
       * Factor is the pricing factor to be applied for a vendor
       **/
      if (pricingFactor) {
        let pricingFactorObject = {
          type: "vendor",
          link_id: vendorId,
          factor: parseFloat(pricingFactor).toFixed(3)
        };
        //Update pricing factor for vendor entity from item service
        ItemService.API.UpsertPricingFactorForAnEntity(pricingFactorObject)
          .then(response => {
            vm.old_pricing_factor = pricingFactorObject.factor;
            vm.message = "Pricing Factor updated successfully!";
            $timeout(() => {
              vm.message = null;
            }, 2500);
          })
          .catch(error => {
            vm.error = "Error in updating Pricing Factor!";
            $timeout(() => {
              vm.message = null;
              vm.error = null;
            }, 2500);
          });
      }
    };

    vm.delete = (entityName, payload, properties) => {
      vm.isLoadingDelete = true;
      if (
        entityName &&
        entityName.toLowerCase() === "vendor" &&
        !vm.disableActions
      ) {
        VendorService.API.DeleteVendor(payload)
          .then(response => {
            vm.deleteVendorDepartmentDetails(payload.id);
            vm.isLoadingDelete = false;
            vm.opdone = true;
            //find index of current vendor in vendors list
            let index = this.vendorsDataList.findIndex(
              vendor => vendor.id === payload.id
            );
            //if group by filter is applied then delete vendor from group array
            if (vm.groupByField) {
              //find index of group under which current vendor exist
              let groupFieldIndex = vm.groupVendors.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );

              //find index of vendor from vendors list under the selected group
              let groupIndex = vm.groupVendors[
                groupFieldIndex
              ].vendors.findIndex(
                vendor => parseInt(vendor.id) === parseInt(payload.id)
              );
              //Delete vendor from list
              vm.groupVendors[groupFieldIndex].vendors.splice(groupIndex, 1);
              vm.groupVendors[groupFieldIndex].count -= 1; //decrease vendor count of the group
              delete vm.groupVendorsMap[payload.id];
              vm.limit =
                vm.groupVendors[groupFieldIndex].vendors.length + vm.limit;
              vm.groupVendors[groupFieldIndex].groupPage -= 1;
            }

            //remove vendor from list
            this.vendorsDataList.splice(index, 1);
            vm.VendorsMap.splice(payload.id, 1);

            vm.totalRecordCount = vm.totalRecordCount - 1; //decrease records count
            /* variables to reset the Notification message-start */
            $scope.vendorSuccessMessage = null;
            $scope.vendorErrorMessage = null;
            $scope.vendorUDDSuccessMessage = null;
            /* variables to reset the Notification message-end */
            payload.factor ? vm.deleteVendorPricingFactor() : null;
            //If the properties
            properties ? "" : (properties = {});
            properties.vendor_id = payload.id;
            vm.deleteVendorPropertiesById(properties);
            vm.closeForm();
            if (common.SessionMemory.API.Get("vendorList")) {
              let vendorsList = JSON.parse(common.SessionMemory.API.Get("vendorList"));
              let idx = vendorsList.findIndex(ven => ven.id === payload.id);
              if (idx > -1) {
                vendorsList.splice(idx, 1);
                common.SessionMemory.API.Post("vendorList", JSON.stringify(vendorsList));
              }
            }
          })
          .catch(error => {
            if (error.status === 412) {
              vm.dependencyList = error.data.dependency;
              vm.$showErrorDetailsData = true;
              $timeout(() => {
                $("#rcrightsidebar").focus();
              }, 0);
            } else {
              vm.deleteVendorMessage = "Error while deleting the vendor";
              $timeout(() => {
                vm.deleteVendorMessage = null;
              }, 2500);
            }
          });
      } else if (
        entityName &&
        entityName.toLowerCase() === "department" &&
        !vm.disableActions
      ) {
        CompanyDepartmentService.API.DeleteCompanyDepartment(payload)
          .then(response => {
            vm.isDeleteSuccess = true;
            vm.isConfirmDelete = false;
            vm.getCompanyDetails($scope.head.individual_id_or_company_id);
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              vm.message = "Department cannot be deleted";

              //to show list of dependent entities in side panel
              vm.dependencyList = error.data.dependency;
              vm.showErrorDetails = true;
              $timeout(() => {
                vm.message = null;
              }, 2500);
            }
          });
      } else if (
        entityName &&
        entityName.toLowerCase() === "associate" &&
        !vm.disableActions
      ) {
        CompanyAssociateService.API.DeleteCompanyAssociate(payload)
          .then(response => {
            vm.isDeleteSuccess = true;
            vm.isConfirmDelete = false;
            vm.getCompanyDetails($scope.head.individual_id_or_company_id);
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.error = true;
              vm.message = error.data.error.message;
            }
          });
      }
    };

    vm.deleteVendorDepartmentDetails = (vendorId) => {
      VendorService.API.DeleteVendorDepartmentDetails(vendorId).then(response => { })
        .catch(error => { console.log(error) })
    }

    vm.setInitialState = entityName => {
      // Variable to show the Published review section.
      vm.publishResponseMessage = false;
      if (entityName && entityName.toLowerCase() === "company") {
        $timeout(() => {
          angular.element("#company_name").focus();
        }, 0);
      } else if (entityName && entityName.toLowerCase() === "individual") {
        $timeout(() => {
          angular.element("#individual_name").focus();
        }, 0);
      } else if (entityName && entityName.toLowerCase() === "department") {
        $timeout(() => {
          angular.element("#department_name").focus();
        }, 0);
      } else if (entityName && entityName.toLowerCase() === "associate") {
        $timeout(() => {
          angular.element("#title_id").focus();
        }, 0);
      } else if (entityName && entityName.toLowerCase() === "vendormaster") {
        $timeout(() => {
          angular.element("#ind_name").focus();
          angular.element("#comp_name").focus();
        }, 0);
      }
    };

    vm.NewVendor = () => {
      // Variable to show the Published review section.
      vm.result_udd_data = undefined;
      vm.publishResponseMessage = false;
      vm.InitializeCreateUpdateForm();
      vm.oldVendorData = undefined;
      $state.go("common.prime.vendor.new");
    };

    vm.showDependencyListDetails = data => {
      vm.$errorDependentData = data;
      vm.$showErrorDetailsData = true;
      vm.$showErrorDetails = true;
    };

    //Set the validation for the entity form on opening form
    vm.getEntityModelAndSetValidationRules = uuid => {
      EntityDetails.API.GetModelAndSetValidationRules(uuid)
        .then(model => { })
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

    //Get all the titles
    vm.getTitles = () => {
      TitleService.API.GetTitles()
        .then(response => {
          vm.allTitleList = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.openGenerateReportPanel = vendor => {
      vm.selectedVendorForReport = vendor;
      vm.showGenerateReportPanel = true;
      vm.message = false;
      vm.errorMessage = null;
      vm.exportSkusCount = undefined;

      vm.getSkuCountByVendor(vendor.id)
    };

    vm.exportDataForVendor = vendorId => {
      if (this.exportSkusCount) {
        let payload = { vendor_id: vendorId }
        SKUService.API.ExportSKUData(payload)
          .then(response => {
            vm.isButtonDisabled = true;
            vm.message =
              "Request created to generate vendor export report successfully. You will be notified once the report generation is successful.";
            common.$timeout(() => {
              vm.message = null;
              vm.isButtonDisabled = false;
              vm.showGenerateReportPanel = false;
            }, 3000);
          })
          .catch(error => {
            vm.isButtonDisabled = false;
          });
      } else {
        this.errorMessage = "Can not be exported! SKUs does not exist for selected Vendor";
        common.$timeout(() => {
          this.errorMessage = null;
        }, 5000)
      }
    };

    vm.getSkuCountByVendor = (vendorId) => {
      let query = {
        vendor_id: vendorId,
        status_id: [100, 200, 400, 500]
      }
      vm.isButtonDisabled = true;
      SKUService.API.GetSKUCountToBeExported(query)
        .then(response => {
          vm.isButtonDisabled = false;
          this.exportSkusCount = response[0].sku_count;
        })
        .catch(error => {
          logger.error(error)
        });
    }

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

    //get buyer hierarchy values
    vm.getBuyerHierarchyValues = () => {
      $scope.vendorConfig = {};
      HierarchyValueService.API.SearchHierarchyValue("is_buyer_hierarchy", "1")
        .then(res => {
          vm.buyerValues = res;
          $scope.vendorConfig.buyer_hierarchy_id = res[0].hierarchy_id;
          $scope.vendorConfig.buyer_hierarchy_desc = res[0].hierarchy;
        })
        .catch(err => { });
    };

    // Directive Send Data back to controller
    $scope.getBuyerHierarchyPath = data => {
      if (data.hierarchyValueData) {
        $scope.head.buyer_id = data.hierarchyValueData.id;
        $scope.head.buyer = data.path_name;
        $scope.buyer_hierarchy_value_id = data.hierarchyValueData.id;
        $scope.checkBuyerId($scope.head.buyer_id);
      }
    };

    $scope.checkBuyerId = currentBuyerId => {
      if (vm.previousBuyerId != currentBuyerId) {
        vm.IsupdateVendorReorder = false;
        vm.IsupdateBuyer = true;

        $("#vendorChangeModal").modal("show");
      }
    };

    //Check flag for is update buyer in items based on value selected
    vm.updateBuyerId = isUpdateBuyerInItems => {
      $scope.head.old_buyer_id = vm.previousBuyerId;
      $scope.head.update_buyer_id_in_items = isUpdateBuyerInItems;
      vm.previousBuyerId = $scope.head.buyer_id;
      vm.IsupdateBuyer = false;
      $("#vendorChangeModal").modal("hide");
      angular.element("body").removeClass("modal-open");
    };

    //Check flag for is update vendor reorder in items based on value selected
    vm.changeVendorReorder = () => {
      vm.IsupdateBuyer = false;
      vm.IsupdateVendorReorder = true;
      $("#vendorChangeModal").modal("show");
    };

    vm.updateVendorReorder = shouldUpdateReorderInItems => {
      $scope.head.update_vendor_reorder_in_items = shouldUpdateReorderInItems;
      vm.IsupdateVendorReorder = false;
      angular.element("body").removeClass("modal-open");
      $("#vendorChangeModal").modal("hide");
    };

    vm.setClickedRow = (entityName, index, parentIndex) => {
      if (
        entityName &&
        entityName.toLowerCase() === "department" &&
        entityName
      ) {
        vm.selectedDepartment = index;
        vm.selectedAssociate = null;
      } else if (
        entityName &&
        entityName.toLowerCase() === "associate" &&
        entityName
      ) {
        vm.selectedDepartment = null;
        vm.selectedParent = parentIndex;
        vm.selectedAssociate = index;
      }
    };

    vm.resetForm = entityName => {
      if (entityName && entityName.toLowerCase() === "company") {
        vm.company_details = {};
        vm.company_details["name"] = null;
        vm.company_details["short_code"] = null;
      } else if (entityName && entityName.toLowerCase() === "individual") {
        vm.ind_details = {};
        vm.ind_details["name"] = null;
      } else if (entityName && entityName.toLowerCase() === "department") {
        vm.department_details = {};
        vm.department_details["name"] = null;
      } else {
        console.log("Entity name defined", entityName);
      }
    };

    vm.openAddressContactPanel = entity => {
      vm.showAddrCnt = false;
      $scope.isShowAddressContactPanel = true;
      vm.isShowDepartmentDetails = false;
      vm.isShowAssociateDetails = false;
      vm.isShowDepartmentDetails = false;
      if (entity && entity === "department") {
        vm.showDepartmentAddressAndContact = true;
        vm.showAssociateAddressAndContact = false;
        AddressContactService.API.StoreVariable("uuid", vm.department_uuid);
        AddressContactService.API.StoreVariable(
          "entityName",
          "Company Department"
        );
      } else if (entity && entity === "associate") {
        vm.showAssociateAddressAndContact = true;
        vm.showDepartmentAddressAndContact = false;
        AddressContactService.API.StoreVariable("uuid", vm.associate_uuid);
        AddressContactService.API.StoreVariable(
          "entityName",
          "Company Associate"
        );
      }
      $timeout(() => {
        vm.showAddrCnt = true;
      }, 0);
    };

    $scope.closeAddrCntPanel = () => {
      $scope.isShowAddressContactPanel = false;
      $timeout(() => {
        vm.showAddrCnt = false;
      }, 500);
    };

    $scope.openAddressPanel = instanceId => {
      /* Kept commented, cause - we never know uuid is belongs to the entity department or associate */
      /* any how we already setting uuid in the function 'vm.openAddressContactPanel' */
      // AddressContactService.API.StoreVariable("uuid", vm.associate_uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    $scope.openContactsPanel = instanceId => {
      /* Kept commented, cause - we never know uuid is belongs to the entity department or associate */
      /* any how we already setting uuid in the function 'vm.openAddressContactPanel' */
      // AddressContactService.API.StoreVariable("uuid", vm.associate_uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    //common function for open forms
    vm.openForm = (entityName, id) => {
      $scope.uddValidationErrors = [];
      vm.isUnauthorized = false;
      vm.showErrorDetails = false;
      vm.isDeleteSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isSaveSuccess = false;
      vm.isUpdateVendor = false;
      vm.isConfirmDelete = false;
      vm.confirmDelete = false;
      vm.selectedAssociate = null;
      vm.selectedDepartment = null;
      // This array is used to set the UDD validation
      $scope.uddValidationErrors = [];

      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      if (
        entityName &&
        entityName.toLowerCase() === "company" &&
        !vm.disableActions
      ) {
        $scope.head.individual_or_company = "Company";
        $scope.name = "Company";
        vm.showCmpDetails = true;
        vm.showIndDetails = false;
        vm.deptdetails = false;
        vm.assocdetails = false;
        vm.company_details = {};
        /* // set next_effective_date if it is none
        payload.next_status && payload.next_status.toLowerCase() === "none" ? payload.next_effective_date = null : ""; */
        vm.getEntityModelAndSetValidationRules(Identifiers.company);
        vm.company_form.$setPristine();
        vm.setInitialState(entityName);
        vm.resetForm(entityName);
      } else if (
        entityName &&
        entityName.toLowerCase() === "individual" &&
        !vm.disableActions
      ) {
        vm.ind_details = {};
        vm.showCmpDetails = false;
        vm.showIndDetails = true;
        vm.isCompanyDepartmentSidePanelVisible = false;
        /* // set next_effective_date if it is none
        payload.next_status && payload.next_status.toLowerCase() === "none" ? payload.next_effective_date = null : ""; */
        vm.getEntityModelAndSetValidationRules(Identifiers.individual);
        vm.ind_form.$setPristine();
        vm.setInitialState(entityName);
        vm.resetForm(entityName);
      } else if (
        entityName &&
        entityName.toLowerCase() === "associatedetails"
      ) {
        vm.moduleheadername = "Associate Details";
        vm.assocdetails = true;
        vm.deptdetails = false;
        vm.showassociate = true;
        vm.isShowDepartmentDetails = false;
        vm.isShowAssociateDetails = false;
        vm.getAssociateDetails(id);
      } else if (
        entityName &&
        entityName.toLowerCase() === "departmentdetails"
      ) {
        vm.moduleheadername = "Department Details";
        vm.assocdetails = false;
        vm.deptdetails = true;
        vm.showassociate = true;
        vm.isShowDepartmentDetails = false;
        vm.isShowAssociateDetails = false;
        vm.getDepartmentDetails(id);
      } else if (
        entityName &&
        entityName.toLowerCase() === "companydepartments"
      ) {
        vm.showCmpDetails = false;
        vm.showIndDetails = false;
        vm.isCompanyDepartmentSidePanelVisible = true;
        vm.getCompanyDetails($scope.head.individual_id_or_company_id);
      } else if (entityName && entityName.toLowerCase() === "department") {
        vm.showassociate = false;
        vm.isShowAdd = true;
        vm.isShowDepartmentDetails = true;
        vm.isSaveSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isShowAssociateDetails = false;
        $scope.isShowAddressContactPanel = false;
        vm.department_details = {};
        vm.resetForm(entityName);
        vm.setInitialState(entityName);
        if (vm.primaryDepartment) {
          vm.showPrimaryDepartment = false;
        } else {
          vm.showPrimaryDepartment = true;
        }
        vm.department_form.$setPristine();
      } else if (entityName && entityName.toLowerCase() === "associate") {
        vm.company_department_id = id;
        vm.associate_details = {};
        vm.isShowAssociateDetails = true;
        vm.showassociate = false;
        vm.isShowAdd = true;
        vm.isSaveSuccess = false;
        vm.isShowDepartmentDetails = false;
        $scope.isShowAddressContactPanel = false;
        vm.associate_form.$setPristine();
        vm.setInitialState(entityName);
      } else {
        //on open of form clear all queued drops list
        $scope.queuedDrops = [];
        vm.resetModel();
        $scope.buyer_hierarchy_value_id = null;
        vm.opdone = false;
        vm.createVendorForm = false;
        vm.showparametervalues = false;
        vm.savedToMasterList = false;
        vm.isUpdateSuccess = false;
        vm.showCmpDetails = false;
        vm.showIndDetails = false;
        vm.assocdetails = false;
        vm.deptdetails = false;
        vm.isCompanyDepartmentSidePanelVisible = false;
        $scope.head.vendor_reorder = 1;

        /*edit screen variables-start*/
        vm.showSummaryPanel = true;
        vm.createStage = true;
        vm.configureStage = false;
        vm.manageDropStage = false;
        vm.previewandpublishStage = false;
        vm.createForm = true;
        vm.addressContactScreen = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        /*edit screen variables-end*/

        /* variables to reset the Notification message-start */
        $scope.vendorSuccessMessage = null;
        $scope.vendorErrorMessage = null;
        $scope.vendorUDDSuccessMessage = null;
        /* variables to reset the Notification message-end */

        $scope.effective_val = false;
        $scope.head.effective_date = moment()
          .utcOffset("0")
          .format($scope.date_format);
        $scope.head.status_id = 200;
        $scope.head.status = "Active";
        $scope.head.next_status_id = 500;
        $scope.head.next_status = "None";
        $scope.edit_master_id = "";
        vm.setInitialState("vendormaster");
        // Variable to show the Published review section.
        vm.publishResponseMessage = false;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
        $state.go("common.prime.vendor.new");
      }
    };

    vm.openFiltersPanel = () => {
      $state.go("common.prime.vendor.filter");
    };

    //open upadte Department/Associate form and set form data
    vm.openUpdateForm = (entityName, data) => {
      vm.showassociate = false;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;
      vm.showErrorDetails = false;
      vm.isShowAdd = false;
      $scope.isShowAddressContactPanel = false;
      // Variable to show the Published review section.
      vm.publishResponseMessage = false;
      if (
        entityName &&
        entityName.toLowerCase() === "department" &&
        entityName
      ) {
        vm.showPrimaryDepartment = true;
        vm.oldDepartment = {};
        vm.isShowDepartmentDetails = true;
        vm.isShowAssociateDetails = false;
        if (data.is_primary === 1) {
          vm.showPrimaryDepartment = true;
          vm.department_details.is_primary = vm.oldDepartment.is_primary = data.is_primary;
        } else if (vm.primaryDepartment) {
          vm.showPrimaryDepartment = false;
          vm.department_details.is_primary = vm.oldDepartment.is_primary = 0;
        } else {
          vm.department_details.is_primary = vm.oldDepartment.is_primary = 0;
        }
        vm.department_details.id = data.department_id;
        vm.department_details.name = vm.oldDepartment.name = data.department;
        vm.department_details.status_id = vm.oldDepartment.status_id =
          data.status_id;
        vm.setInitialState(entityName);
      } else if (
        entityName &&
        entityName.toLowerCase() === "associate" &&
        entityName
      ) {
        vm.oldAssociate = {};
        vm.isShowDepartmentDetails = false;
        vm.isShowAssociateDetails = true;
        vm.associate_details = data;
        vm.associate_details.name = data.associate;
        vm.oldAssociate = _.clone(data);
        vm.setInitialState(entityName);
      }
    };

    vm.validateIndividualForm = objectData => {
      // Loop to check if either first name or last name has some values
      if (
        objectData.first_name &&
        objectData.first_name.length === 0 &&
        objectData.last_name &&
        objectData.last_name.length === 0
      ) {
        vm.ind_form.name.$valid = false;
        vm.ind_form.name.$invalid = true;
        vm.nameValidationMessage = "Required field";
      } else if (
        (objectData.first_name &&
          (objectData.first_name.length < 3 ||
            objectData.first_name.length > 25)) ||
        (objectData.last_name &&
          (objectData.last_name.length < 3 || objectData.last_name.length > 25))
      ) {
        // Loop to check if either first name or last name is within the validation limit
        vm.ind_form.name.$valid = false;
        vm.ind_form.name.$invalid = true;
        vm.nameValidationMessage =
          "First name or Last name length should be between 3 and 25";
      } else {
        // Loop to check if either first name or last name has some values and if it valid then show no error message
        if (
          (objectData.first_name && objectData.first_name.length !== 0) ||
          (objectData.last_name && objectData.last_name.length !== 0)
        ) {
          $timeout(() => {
            vm.ind_form.name.$valid = true;
            vm.ind_form.name.$invalid = false;
            vm.nameValidationMessage = "";
          }, 0);
        } else {
          vm.ind_form.name.$valid = false;
          vm.ind_form.name.$invalid = true;
          vm.nameValidationMessage = "Required field";
        }
      }
    };

    vm.validateIndividualUpdateForm = objectData => {
      objectData.name = "";
      // Loop to check if either first name or last name has some values
      if (objectData.first_name) {
        objectData.name = objectData.first_name;
        objectData.name = String(objectData.name).trim();
        if (objectData.last_name) {
          objectData.name += " ";
        }
      }
      if (objectData.last_name) {
        objectData.name += objectData.last_name;
        objectData.name = String(objectData.name).trim();
      }
      if (
        objectData.name &&
        objectData.name.length === 0
      ) {
        $timeout(() => {
          vm.individual_form.first_name.$valid = false;
          vm.individual_form.first_name.$invalid = true;
          vm.individual_form.last_name.$valid = false;
          vm.individual_form.last_name.$invalid = true;
          vm.nameValidationMessage = "Required field";
        }, 100);
      } else if (
        (objectData.name &&
          (objectData.name.length < 3 ||
            objectData.name.length > 25))
      ) {
        // Loop to check if either first name or last name is within the validation limit
        vm.individual_form.first_name.$valid = false;
        vm.individual_form.first_name.$invalid = true;
        vm.individual_form.last_name.$valid = false;
        vm.individual_form.last_name.$invalid = true;
        vm.nameValidationMessage =
          "Name length should be between 3 and 25";
      } else {
        // Loop to check if either first name or last name has some values and if it valid then show no error message
        if (objectData.name && objectData.name.length !== 0) {
          $timeout(() => {
            vm.individual_form.first_name.$valid = true;
            vm.individual_form.first_name.$invalid = false;
            vm.individual_form.last_name.$valid = true;
            vm.individual_form.last_name.$invalid = false;
            vm.nameValidationMessage = "";
          }, 0);
        } else {
          vm.individual_form.first_name.$valid = false;
          vm.individual_form.first_name.$invalid = true;
          vm.individual_form.last_name.$valid = false;
          vm.individual_form.last_name.$invalid = true;
          vm.nameValidationMessage = "Required field";
        }
      }
    };

    vm.showconfirm = entityName => {
      vm.isConfirmDelete = true;
      vm.isUnauthorized = false;
    };

    vm.createAnotherForm = entityName => {
      vm.isSaveSuccess = false;
      if (entityName && entityName.toLowerCase() === "company") {
        vm.showCmpDetails = true;
        vm.company_details = {};
        vm.company_details.status_id = vm.previousC.status_id;
      } else if (entityName && entityName.toLowerCase() === "individual") {
        vm.showIndDetails = true;
        vm.ind_details = {};
        vm.ind_details.name = "";
        vm.ind_details.status_id = vm.previousI.status_id;
      } else if (entityName && entityName.toLowerCase() === "department") {
        vm.isShowDepartmentDetails = true;
        vm.isShowAdd = true;
        vm.department_details = {};
        vm.department_details.status_id = vm.previousDepartment.status_id;
        if (vm.primaryDepartment) {
          vm.showPrimaryDepartment = false;
        } else {
          vm.showPrimaryDepartment = true;
        }
      } else if (entityName && entityName.toLowerCase() === "associate") {
        vm.associate_details = {};
        vm.isShowAssociateDetails = true;
        vm.associate_details.status_id = vm.previousAssociate.status_id;
      }
      vm.setInitialState(entityName);
    };

    vm.closeForm = entityName => {
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.isEditVendorName = false;
      if (entityName && entityName.toLowerCase() === "company") {
        vm.showCmpDetails = false;
        vm.isCompanyDepartmentSidePanelVisible = false;
      } else if (
        entityName &&
        entityName.toLowerCase() === "associatedetails"
      ) {
        vm.selectedAssociate = null;
        vm.selectedDepartment = null;
        vm.showassociate = false;
        $scope.isShowAddressContactPanel = false;
        vm.isCompanyDepartmentSidePanelVisible = true;
        $timeout(() => {
          $scope.isAddressPanel = false;
          $scope.isContactsPanel = false;
        }, 500);
      } else if (
        entityName &&
        entityName.toLowerCase() === "companydepartments"
      ) {
        vm.isSaveSuccess = false;
        vm.showassociate = false;
        vm.isCompanyDepartmentSidePanelVisible = false;
        vm.isShowAssociateDetails = false;
        vm.isShowDepartmentDetails = false;
        $scope.isShowAddressContactPanel = false;
        //vm.getMainAddress();
      } else if (entityName && entityName.toLowerCase() === "individual") {
        vm.showIndDetails = false;
        vm.isSaveSuccess = false;
      } else if (entityName && entityName.toLowerCase() === "department") {
        vm.isShowDepartmentDetails = false;
      } else if (entityName && entityName.toLowerCase() === "associate") {
        vm.isShowAssociateDetails = false;
      } else {
        if ($state.current.name.includes(".rmsnumber")) {
          $window.history.back();
        } else {
          $state.go("common.prime.vendor");
        }
        //$window.history.back();
        vm.isShowDepartmentDetails = false;
        vm.isShowAssociateDetails = false;
        vm.createVendorForm = false;
        vm.isCompanyDepartmentSidePanelVisible = false;
        vm.assocdetails = false;
        $scope.head = {};
        vm.$showErrorDetailsData = false;
        vm.$showErrorDetails = false;
        vm.drop_form = {};
        $scope.queuedDrops = [];
        vm.dependentSkus = undefined;
        vm.isUnassignedInventoryMethod = false;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
        vm.showFilter ? vm.showAdvancedFilter() : "";
      }
    };

    vm.hideAllSidePanels = () => {
      $scope.showhistory = false;
      vm.showCmpDetails = false;
      vm.showIndDetails = false;
      vm.assocdetails = false;
      vm.deptdetails = false;
      vm.showassociate = false;
      vm.isShowAssociateDetails = false;
      vm.isShowDepartmentDetails = false;
      vm.isCompanyDepartmentSidePanelVisible = false;
    };

    vm.viewDetails = value => {
      vm.savedToMasterList = true;
      vm.showparametervalues = false;
      $scope.head = _.clone(value);
      $scope.isEnabled = true;
      $scope.edit_master_id = value.id;
      $scope.master_id = value.id;
      $scope.flag = true;
      if (
        $scope.head &&
        $scope.head.individual_or_company &&
        $scope.head.individual_or_company.toLowerCase() === "individual"
      ) {
        $scope.head.individual = {};
        $scope.head.individual.name = $scope.head.Name;
        $scope.department = false;
      } else {
        $scope.head.company = {};
        $scope.head.company.name = $scope.head.Name;
        $scope.department = true;
      }
    };

    $scope.effective_val = true;
    vm.changeEvent = vendor => {
      if (vendor.next_status_id === 500) {
        $scope.effective_val = false;
      } else {
        $scope.effective_val = true;
      }
    };

    //Function to get pricing factor for a vendor, if exists
    vm.getPricingFactorForVendor = () => {
      //Fetch pricing factor for vendor entity from item service
      ItemService.API.FetchPricingFactorForAnEntityAndInstance(
        "vendor",
        $stateParams.id
      )
        .then(response => {
          $scope.head.factor = response.factor;
          vm.old_pricing_factor = response.factor;
        })
        .catch(error => {
          logger.error(error);
        });
    };
    vm.updateVendor = data => {
      /* check update permission from profile*/
      if (vm.vendorPermissions.update) {
        vm.validationMessage = null;
        data.isShowUpdateProcessing = true;
        $timeout(() => {
          $state
            .go("common.prime.vendor.update", {
              id: data.id
            })
            .then(() => {
              data.isShowUpdateProcessing = false;
            });
        }, 0);
      }
    };

    vm.fetchFeatureAccessPermission = () => {
      vm.isShowRmsNumberUpdate = false;
      vm.isRmsNumberUpdatePermitted = true;
      UserService.API.IsAllowedFeaturedPassword("rms-vendor-number")
        .then(result => {
          if (result.data.length == 0) {
            vm.isRmsNumberUpdatePermitted = false;
          }
        })
        .catch(error => {
          console.error(error);
        });
    };

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/meesage in the form will be closed.
    vm.dblClickAction = vendor => {
      vm.fetchFeatureAccessPermission();
      vm.hideAllSidePanels();
      vm.viewDetails(vendor);
      vm.changeEvent(vendor);
      vm.isEditVendorName = false;
      //Set is update vendor state to form on double click update action
      vm.isUpdateVendor = true;
      vm.opdone = false;
      vm.showSummaryPanel = true;
      //Initial vendor master form is set to true
      vm.createStage = true;
      vm.createForm = true;
      //Configure UDD for vendor form is false
      vm.configureStage = false;
      vm.configureScreen = false;
      vm.addressContactScreen = false;
      //Manage drops for vendor variable is false
      vm.manageDropStage = false;
      vm.manageDropScreen = false;
      //Preview and publish state is false initially
      vm.previewandpublishStage = false;
      vm.previewAndPublish = false;
      // Variable to show the Published review section.
      vm.publishResponseMessage = false;
      vm.confirmDelete = false;
      vm.vendor_properties = {};

      vm.$errorDependentData = {};
      vm.$showErrorDetailsData = false;
      vm.$showErrorDetails = false;
      // This array is used to set the UDD validation
      $scope.uddValidationErrors = [];
      vm.previousBuyerId = vendor.buyer_id;
      vm.old_vendor_reorder = vendor.vendor_reorder;
      vm.getVendorPropertyById(vendor.id);
      vm.getPricingFactorForVendor();
      vm.loadImage($scope.head, "125x125");
      //on open of update form clear all queued drops list
      $scope.queuedDrops = [];
      vm.resetModel();
      /* variables to reset the Notification message-start */
      $scope.vendorSuccessMessage = null;
      $scope.vendorErrorMessage = null;
      $scope.vendorUDDSuccessMessage = null;
      /* variables to reset the Notification message-end */

      // Set Dependency details to false
      vm.$showErrorDetailsData = false;
      vm.$showErrorDetails = false;
      if ($scope.head.individual_or_company == "Company") {
        vm.getCompanyDetails($scope.head.individual_id_or_company_id);
      } else {
        vm.getIndividualDetails($scope.head.individual_id_or_company_id);
      }
    };

    //goto update state if id exists in data map
    vm.gotoUpdateState = () => {
      $scope.uddValidationErrors = [];
      if (vm.VendorsMap[$stateParams.id]) {
        vm.VendorsMap[$stateParams.id].individual_id_or_company_id = parseInt(
          vm.VendorsMap[$stateParams.id].individual_id_or_company_id
        );
        vm.VendorsMap[$stateParams.id].next_effective_date === "1970-01-01"
          ? (vm.VendorsMap[$stateParams.id].next_effective_date = "none")
          : "";
        vm.VendorsMap[$stateParams.id].purchase_terms_id = parseInt(
          vm.VendorsMap[$stateParams.id].purchase_terms_id
        );
        vm.VendorsMap[$stateParams.id].type_id = parseInt(
          vm.VendorsMap[$stateParams.id].type_id
        );
        vm.oldVendorData = vm.VendorsMap[$stateParams.id];
        //if current state is update and selected id is present in choices map then get data from map
        vm.dblClickAction(vm.VendorsMap[$stateParams.id]);
      } else if (
        $stateParams.id &&
        $state.current.name.includes(".update") &&
        !vm.VendorsMap[$stateParams.id]
      ) {
        //if current state is update and selected id is not present in choices map then get by API call
        VendorService.API.GetVendorById($stateParams.id)
          .then(response => {
            if (response.id) {
              vm.VendorsMap[$stateParams.id] = response;
              vm.oldVendorData = vm.VendorsMap[$stateParams.id];
              vm.dblClickAction(vm.VendorsMap[$stateParams.id]);
            } else {
              //if response also don't have id then close form
              vm.closeForm();
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        vm.closeForm();
      }
    };

    vm.setStageIndication = currentScreen => {
      if (currentScreen && currentScreen.toLowerCase() === "createform") {
        vm.createStage = true;
        vm.configureStage = false;
        vm.manageDropStage = false;
        vm.previewandpublishStage = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "configureform"
      ) {
        vm.createStage = true;
        vm.configureStage = true;
        vm.manageDropStage = false;
        vm.previewandpublishStage = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "dropscreen"
      ) {
        vm.createStage = true;
        vm.configureStage = true;
        vm.manageDropStage = true;
        vm.previewandpublishStage = false;
        //Hide the Queued message on load of the drop manage screen
        angular.element("#showQueueMessage").hide();
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "previewandpublish"
      ) {
        vm.createStage = true;
        vm.configureStage = true;
        vm.manageDropStage = true;
        vm.previewandpublishStage = true;
      }
    };

    vm.focusSearchField = () => {
      angular.element("#inlineSearch").focus();
      vm.showFilter = true;
    };

    // Reset not applied filter arrays.
    vm.resetUnusedFilterArrays = refresh => {
      (vm.filters.individualOrCompanyIds && !vm.filters.individualOrCompanyIds.length)
        ? (delete vm.filters.individualOrCompanyIds)
        : "";
      (vm.filters.vendorTermIds && !vm.filters.vendorTermIds.length)
        ? (delete vm.filters.vendorTermIds)
        : "";
      (vm.filters.vendorTypeIds && !vm.filters.vendorTypeIds.length)
        ? (delete vm.filters.vendorTypeIds)
        : "";
      (vm.filters.buyerIds && !vm.filters.buyerIds.length)
        ? (delete vm.filters.buyerIds)
        : "";
      (vm.filters.currentStatusIds && !vm.filters.currentStatusIds.length)
        ? (delete vm.filters.currentStatusIds)
        : "";
      (vm.filters.nextStatusIds && !vm.filters.nextStatusIds.length)
        ? (delete vm.filters.nextStatusIds)
        : "";
      vm.getFilterCount();
    };

    // Calculet filter count.
    vm.getFilterCount = () => {
      vm.appliedFilterCount = 0;
      vm.filters.name ? vm.appliedFilterCount++ : "";
      vm.filters.individualOrCompany ? vm.appliedFilterCount++ : "";
      vm.filters.individualOrCompanyIds &&
        vm.filters.individualOrCompanyIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.vendorTermIds && vm.filters.vendorTermIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.vendorTypeIds && vm.filters.vendorTypeIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.buyerIds && vm.filters.buyerIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.currentStatusIds && vm.filters.currentStatusIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.nextStatusIds && vm.filters.nextStatusIds.length
        ? vm.appliedFilterCount++
        : "";
    };

    vm.showAdvancedFilter = flag => {
      $timeout(() => {
        $("#advanced-search").collapse("hide");
        vm.old_filters ? (vm.filters = _.clone(vm.old_filters)) : "";
        // First time when the panel is opened reset all the values
        if (!vm.advancedSearchPanel) {
          vm.resetFilters();
        } else {
          // When vm.advancedSearchPanel is true, then resetUnusedFilterArrays() will resets the not applied filters.
          // (this is when checks some values and clicks on search button without clicking on apply filter).
          vm.resetUnusedFilterArrays();
        }
        flag ? (vm.showFilter = !vm.showFilter) : "";
        vm.InitializeCreateUpdateForm();
        vm.checkFilterHeight();
      }, 0);
    };

    /*
     * This function is used to get the height of the element
     * and move the datalist accordingly.
     */
    vm.checkFilterHeight = () => {
      $timeout(() => {
        let headerHeight = angular.element(".rc-module-header").height();
        angular.element(".module-content").css("margin-top", headerHeight);
      }, 500);
    };

    vm.setInitialHeight = () => {
      $timeout(() => {
        vm.showFilter ? vm.showAdvancedFilter() : "";
      }, 0);
    };

    vm.applyFilters = () => {
      vm.message = null;
      vm.errorMessage = null;
      vm.filters.individualOrCompany === undefined ||
        vm.filters.individualOrCompany === ""
        ? delete vm.filters.individualOrCompanyIds
        : "";

      vm.filters.length > 0
        ? (vm.applyFilterSuccess = true)
        : (vm.applyFilterSuccess = false);
      for (let property in vm.filters) {
        if (
          vm.filters[property] === undefined ||
          vm.filters[property] === null ||
          vm.filters[property] === "" ||
          (Array.isArray(vm.filters[property]) && vm.filters[property].length === 0)
        ) {
          delete vm.filters[property];
        }
      }
      if (
        Object.keys(vm.filters).length != 0 ||
        (vm.old_filters !== undefined && !angular.equals(vm.old_filters, vm.filters))
      ) {
        vm.applyFilterSuccess = true;
        if (
          "individualOrCompany" in vm.filters ||
          "name" in vm.filters ||
          "vendorTypeIds" in vm.filters ||
          "vendorTermIds" in vm.filters ||
          "individualOrCompanyIds" in vm.filters ||
          "buyerIds" in vm.filters ||
          "currentStatusIds" in vm.filters ||
          "nextStatusIds" in vm.filters ||
          !angular.equals(vm.old_filters, vm.filters)
        ) {
          if (
            !angular.equals(vm.old_filters, vm.filters) ||
            !vm.isFilterApplied ||
            (vm.isGroupByApplied && !vm.isGroupByFilterApplied)
          ) {
            vm.page = 1;
            vm.applyFiltersBtnLabel = "Applying Filters...";
            vm.filters.vendorIds = [];
            vm.reloadVendorCountAndList()
              .then(() => {
                vm.advancedSearchPanel = true;
                if (vm.isGroupByApplied) {
                  vm.isGroupHeader = true;
                  vm.isGroupByFilterApplied = true;
                }
                vm.isFilterApplied = true;
                vm.old_filters = angular.copy(vm.filters);
                vm.message = "Filter applied successfully!";
                vm.applyFiltersBtnLabel = "Apply Filters";
                $timeout(() => {
                  vm.message = null;
                  vm.errorMessage = null;
                  vm.showAdvancedFilter(true);
                }, 1000);
              })
              .catch(error => {
                vm.errorMessage = "Unable to apply filter!";
                vm.showFilter = false;
                vm.applyFiltersBtnLabel = "Apply Filters";
                logger.error(error);
              });
          } else {
            vm.applyFilterSuccess = false;
            vm.showFilter = false;
            vm.applyFilterMessage = "* Search results already found for selected filters";
          }
        } else {
          vm.applyFilterSuccess = false;
          vm.showFilter = false;
          vm.applyFilterMessage = "* Please select atleast one filter to search relevant vendors";
        }
      } else {
        vm.applyFilterSuccess = false;
        vm.showFilter = false;
        vm.applyFilterMessage = "* Please select atleast one filter to search relevant vendors";
      }
    };

    vm.resetFilters = refresh => {
      vm.isResetFilter = true;
      vm.message = null;
      vm.errorMessage = null;
      vm.clearPath = true;
      vm.filters.individualOrCompany = null;
      vm.filters.individualOrCompanyIds = [];
      vm.filters.name = "";
      vm.filters.vendorTermIds = [];
      vm.filters.vendorTypeIds = [];
      vm.filters.buyerIds = [];
      vm.filters.currentStatusIds = [];
      vm.filters.nextStatusIds = [];
      vm.applyFiltersBtnLabel = "Apply Filters";
      /*
        Only on click of the reset button in the filter panel the message
        for the reset will be shown by passing -1.
      */
      if (refresh === -1) {
        // Once the reset button is clicked the height is reset to the height of the panel
        vm.checkFilterHeight();
        if (JSON.stringify(vm.old_filters) !== "{}") {
          vm.resetMessage = "Filter reset successfull!";
        }
        $timeout(() => {
          vm.resetMessage = null;
          vm.showAdvancedFilter(true);
        }, 500);
      }
      if (vm.isFilterApplied && JSON.stringify(vm.old_filters) !== "{}") {
        vm.reloadVendorCountAndList();
      }
      vm.isFilterApplied = false;
      vm.applyFilterSuccess = true;
      $timeout(() => {
        vm.isResetFilter = false;
        vm.advancedSearchPanel = false;
        vm.old_filters = {};
      }, 0);
    };

    /*************** Group by implementation *****************/
    vm.groupByData = groupByColumn => {
      return new Promise((resolve, reject) => {
        vm.isGroupHeader = false;
        vm.isGroupByApplied = true;
        vm.groupVendors = [];
        vm.isFilterApplied === true ? (vm.isGroupByFilterApplied = true) : "";
        if (groupByColumn.length > 0) {
          /** ---------- Get vendors based on page and limit ----------
           * sort by field and order initially none and asc
           * may change according to the user customization
           * No parameter means, get all the records without any conditions.
           *
           * NOTE: First two undefined parameters are for page and limit AND third empty object is for filter
           */
          vm.groupByField = groupByColumn;
          vm.pagination();
          VendorService.API.GetVendors(
            {},
            vm.filters,
            { field: vm.sortByField, order: vm.sortByOrder },
            { field: vm.groupByField }
          )
            .then(response => {
              vm.isGroupHeader = true;
              for (let i = 0; i < response.data.data.length; i++) {
                let groupHidden = false;
                if (vm.selectedGroupHeader.length > 0) {
                  for (let j = 0; j < vm.selectedGroupHeader.length; j++) {
                    if (
                      vm.selectedGroupHeader[j][vm.groupByField] ===
                      response.data.data[i][vm.groupByField]
                    ) {
                      groupHidden = true;
                      response.data.data[i].selected = 0;
                      response.data.data[i].expanded = false;
                    }
                  }
                  if (groupHidden === true) {
                    vm.groupVendors.push(response.data.data[i]);
                  } else {
                    response.data.data[i].selected = 1;
                    response.data.data[i].expanded = false;
                    vm.groupVendors.push(response.data.data[i]);
                  }
                } else {
                  response.data.data[i].selected = 1;
                  response.data.data[i].expanded = false;
                  vm.groupVendors.push(response.data.data[i]);
                }
              }
              resolve(response);
            })
            .catch(error => {
              reject(error);
              logger.error(error);
            });
        } else {
          vm.isGroupByFilterApplied = false;
          vm.fetchTotalRecordCount();
          vm.scrollToPosition(0, 0);
          vm.reload()
            .then(response => {
              resolve(response);
            }).catch(error => {
              reject(error);
            });
        }
      });
    };

    vm.MapGroupVendors = list => {
      for (let i = 0; i < list.length; i++) {
        if (vm.groupVendorsMap[list[i].id] === undefined) {
          vm.groupVendorsMap[list[i].id] = list[i];
        }
      }
    };

    //When group by filter is applied, on click of group hedaer load data.
    vm.showVendorData = (groupByField, groupData) => {
      groupData.expanded = !groupData.expanded;
      groupData.isVendorsLoaded = false;
      if (groupData.vendors === undefined) {
        vm.groupByValue = groupData[groupByField];
        groupData.groupPage = 1;
        vm.pagination();
        VendorService.API.GetVendors(
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: groupByField, value: vm.groupByValue }
        )
          .then(response => {
            groupData.isVendorsLoaded = true;
            if (response.data.data && response.data.data.length > 0) {
              groupData.vendors = response.data.data;
              groupData.availableGroupVendors =
                groupData.count - response.data.data.length;
              vm.groupVendorsMap = [];
              vm.VendorsMap = [];
              vm.MapGroupVendors(groupData.vendors);
              vm.MapVendors(groupData.vendors);
              // load item cover images when vendors are grouped by field
              vm.getVendorMetaData();
              vm.loadGroupByThumbNailImages("165x165", groupData.vendors);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        groupData.isVendorsLoaded = true;
      }
    };

    //when click on expand all in group by panel, data for all groups should be fetched
    vm.loadGroupDataOnExpandAll = groupByField => {
      let object = {
        [groupByField]: []
      };
      for (let i = 0; i < vm.groupVendors.length; i++) {
        if (vm.groupVendors[i].vendors === undefined) {
          object[groupByField].push(vm.groupVendors[i][groupByField]);
          vm.groupVendors[i].isVendorsLoaded = false;
        }
      }

      if (object[groupByField].length) {
        vm.groupPage = 1;
        VendorService.API.GroupByFieldAndValues(object, vm.groupPage, vm.limit)
          .then(response => {
            for (let i = 0; i < vm.groupVendors.length; i++) {
              if (vm.groupVendors[i].vendors === undefined) {
                vm.groupVendors[i].vendors = $filter("filter")(
                  response,
                  vm.groupVendors[i][groupByField]
                );
                vm.groupVendors[i].availableGroupVendors =
                  vm.groupVendors[i].count - vm.groupVendors[i].vendors.length;
                vm.originalVendorsDataList = JSON.parse(
                  JSON.stringify(vm.groupVendors[i].vendors)
                );
                vm.groupVendors[i].groupPage = 1;
                vm.groupVendors[i].isVendorsLoaded = true;
              }
            }
            vm.loadGroupByThumbNailImages("165x165", response); // load sku cover images when items are grouped by field
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    //load next batch of records on click of load more button
    vm.loadMoreVendorData = (groupByField, groupData) => {
      groupData.isMoreVendorsLoaded = false;
      vm.groupByValue = groupData[groupByField];
      if (groupData[groupByField]) {
        groupData.groupPage = groupData.groupPage + 1;
        vm.pagination();
        VendorService.API.GetVendors(
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: groupByField, value: vm.groupByValue }
        )
          .then(res => {
            let data = res.data.data || res.data;
            groupData.isMoreVendorsLoaded = true;
            if (data && data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                if (!vm.groupVendorsMap[data[i].id]) {
                  groupData.vendors.push(data[i]);
                  vm.groupVendorsMap[data[i].id] = data[i];
                  vm.VendorsMap[data[i].id] = data[i];
                }
              }
              groupData.availableGroupVendors =
                groupData.count - groupData.vendors.length;
              vm.loadGroupByThumbNailImages("165x165", groupData.vendors);
              vm.setLimit();
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    //load cover images when group by filter is applied
    vm.loadGroupByThumbNailImages = (size, vendors) => {
      if (vendors) {
        for (let i = 0; i < vendors.length; i++) {
          let thumbnail = vm.thumbnails.filter(lake => {
            return lake.instance_id == vendors[i].id;
          });
          if (thumbnail[0]) {
            if (!thumbnail[0].url) {
              vendors[i].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                thumbnail[0].drop_id,
                size,
                vm.uuid
              );
            } else if (thumbnail[0].url) {
              vendors[i].thumbnail = thumbnail[0].url;
            }
            vendors[i].drop_id = thumbnail[0].drop_id;
          }
        }
      }
    };

    // Function to get preview
    vm.getDownloadUrl = (url, downloadUrl) => {
      if (!downloadUrl) {
        return DataLakeAPIService.API.GetDownloadUrl(url, vm.uuid);
      } else {
        return downloadUrl;
      }
    };

    ///Group by Panel: Select or Unselect all the item groups
    vm.toggleAllGroups = isSelectAll => {
      for (let i = 0; i < vm.groupVendors.length; i++) {
        if (isSelectAll) {
          vm.groupVendors[i].selected = 1;
        } else {
          vm.groupVendors[i].expanded = false;
          vm.groupVendors[i].vendors = undefined; //remove data from group after Unselect all
          vm.groupVendors[i].selected = 0;
        }
      }
    };

    vm.toggleselectedGroupVendor = (gc, index) => {
      if (gc.selected) {
        for (let x = 0; x < vm.selectedGroupHeader.length; x++) {
          if (
            vm.selectedGroupHeader[x][vm.groupByField] === gc[vm.groupByField]
          ) {
            vm.selectedGroupHeader.splice(x, 1);
          }
        }
        gc.vendors = undefined;
        for (let i = 0; i < vm.groupVendors.length; i++) {
          vm.groupVendors[i].isVendorsLoaded = undefined;
        }
      } else {
        vm.selectedGroupHeader.push(gc);
      }
      gc.expanded = false;
    };

    //Vendor properties CRUD operation

    //Fetch vendor properties by id
    vm.getVendorPropertyById = vendor_id => {
      VendorService.API.GetVendorProperties(vendor_id)
        .then(response => {
          vm.vendor_properties = response.data && response.data[0] ? response.data[0] : {};
          vm.vendor_properties.inventory_method_id = vm.vendor_properties && vm.vendor_properties.inventory_method_id ? vm.vendor_properties.inventory_method_id.split(",") : [];
          vm.vendor_properties.inventory_method_id = vm.vendor_properties.inventory_method_id.map(Number);
          vm.originalProperties = angular.copy(vm.vendor_properties);
          if (response.data.length > 0) {
            vm.vendor_properties && vm.vendor_properties.rms_vendor_short_name
              ? (vm.oldVendorData.rms_vendor_short_name =
                vm.vendor_properties.rms_vendor_short_name)
              : null;
            vm.vendor_properties && vm.vendor_properties.rms_vendor_short_sequence
              ? (vm.oldVendorData.rms_vendor_short_sequence =
                vm.vendor_properties.rms_vendor_short_sequence)
              : null;
            vm.vendor_properties && vm.vendor_properties.rms_vendor_number
              ? (vm.oldVendorData.rms_vendor_number =
                vm.vendor_properties.rms_vendor_number)
              : null;
            !vm.oldVendorData ? vm.oldVendorData = {} : "";
            vm.oldVendorData["inventory_method_id"] = vm.vendor_properties && vm.vendor_properties.inventory_method_id ? vm.vendor_properties.inventory_method_id : [];
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.checkInventoryMethodDependency = vendorProperties => {
      vm.dependentSkus = undefined;
      vm.isUnassignedInventoryMethod = false;
      // if unselected, add inventory method id to the list of removed ids
      if (vm.originalProperties.inventory_method_id.length > vendorProperties.inventory_method_id.length) {
        vendorProperties.removed_inventory_methods = vm.originalProperties.inventory_method_id.filter(inv => !vendorProperties.inventory_method_id.includes(inv));
      }

      // if selected, remove inventory method id from the list of removed ids
      if (vendorProperties.removed_inventory_methods && vendorProperties.removed_inventory_methods.length) {
        vendorProperties.removed_inventory_methods = vendorProperties.removed_inventory_methods.filter(inv => !vendorProperties.inventory_method_id.includes(inv))
      }
      if (vendorProperties.removed_inventory_methods && vendorProperties.removed_inventory_methods.length > 0) {
        VendorService.API.FetchSkusByVendorAndInventoryMethods(vendorProperties.vendor_id, vendorProperties.removed_inventory_methods)
          .then(response => {
            if (response.length !== 0) {
              vm.isUnassignedInventoryMethod = true;
            }
            vm.dependentSkus = response;
          })
          .catch(error => {
            logger.error(error);
          });
      }
    }


    //Update vendor properties of a vendor
    vm.updateVendorPropertiesById = vendorProperties => {
      let isAS400SKUChange = false
      if (
        vm.originalProperties &&
        (
          vm.originalProperties.rms_vendor_short_sequence !== vendorProperties.rms_vendor_short_sequence ||
          vm.originalProperties.rms_vendor_short_name !== vendorProperties.rms_vendor_short_name ||
          vm.originalProperties.rms_vendor_number !== vendorProperties.rms_vendor_number ||
          vm.originalProperties.inventory_method_id.join(",") !== vendorProperties.inventory_method_id.join(",")
        )
      ) {
        if (
          vm.originalProperties.rms_vendor_short_sequence !== vendorProperties.rms_vendor_short_sequence ||
          vm.originalProperties.rms_vendor_short_name !== vendorProperties.rms_vendor_short_name ||
          vm.originalProperties.rms_vendor_number !== vendorProperties.rms_vendor_number
        ) {
          isAS400SKUChange = true; // flag to hold sku interface change on vendor change
        }
        vm.oldVendorData.rms_vendor_short_name = vm.vendor_properties.rms_vendor_short_name;
        vm.oldVendorData.rms_vendor_short_sequence = vm.vendor_properties.rms_vendor_short_sequence;
        vm.oldVendorData.rms_vendor_number = vm.vendor_properties.rms_vendor_number;
        vm.oldVendorData.inventory_method_id = vm.vendor_properties.inventory_method_id;
        //Set new Inventory ID
        vendorProperties.inventory_method_id = vm.vendor_properties.inventory_method_id.join(",");
        VendorService.API.UpdateVendorProperties(vendorProperties)
          .then(() => {
            vm.getVendorPropertyById(vendorProperties.vendor_id);
            vm.opdone = true;
            if (isAS400SKUChange) {
              ItemService.API.CaptureSKUChangesInVendorProperties($stateParams.id, vm.oldVendorData.rms_vendor_number);
            }
          })
          .catch(error => {
            vm.opdone = false;
            logger.error(error);
          });
      } else if (!vm.originalProperties || (vm.originalProperties && !vm.originalProperties.vendor_id)) {
        vendorProperties
          ? (vendorProperties.vendor_id = $stateParams.id)
          : (vendorProperties = {
            vendor_id: $stateParams.id
          });
        vm.insertVendorProperties(vendorProperties);
      }
    };

    //Insert vendor properties for a vendor
    vm.insertVendorProperties = vendorProperties => {
      vendorProperties.inventory_method_id = vendorProperties.inventory_method_id.join(",");
      VendorService.API.InsertVendorProperties(vendorProperties);
      vm.getVendorPropertyById(vendorProperties.vendor_id);
    };

    vm.deleteVendorPropertiesById = vendorProperties => {
      VendorService.API.DeleteVendorProperties(vendorProperties);
    };

    vm.deleteVendorPricingFactor = () => {
      ItemService.API.DeletePricingFactorForAnEntity("vendor", $stateParams.id);
    };

    vm.reloadUDDs = () => {
      $scope.isEnabled = false;
      common.$timeout(() => {
        $scope.isEnabled = true;
      }, 10);
    };
    vm.resetFormField = () => {
      $scope.drop.stream_id = null;
      $scope.files = undefined;
      $scope.errFiles = undefined;
      $scope.drop.url = undefined;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
    }

    vm.goToScreen = currentScreen => {
      vm.resetFormField()
      vm.validationMessage = null;
      vm.validationError = [];
      vm.publishResponseMessage = false;
      vm.opdone = false;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      if (
        currentScreen &&
        currentScreen.toLowerCase() === "vendormasterscreen"
      ) {
        vm.createForm = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.showSummaryPanel = true;
        vm.previewAndPublish = false;
        vm.addressContactScreen = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "addresscontactscreen"
      ) {
        vm.createForm = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.showSummaryPanel = true;
        vm.previewAndPublish = false;
        vm.addressContactScreen = true;
        vm.back = true;
        $scope.isEnabledAddressContact = !$scope.isEnabledAddressContact;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "userdefineddataconfigurationscreen"
      ) {
        vm.createForm = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.configureScreen = true;
        vm.addressContactScreen = false;
        vm.back = true;
        // This array is used to set the UDD validation
        $scope.uddValidationErrors = [];
        //Close the company side panel when navigating to the next screen.
        vm.showCmpDetails = false;
        //Close the department side panel when navigating to the next screen.
        vm.isCompanyDepartmentSidePanelVisible = false;
        //Close the individual side panel when navigating to the next screen.
        vm.showIndDetails = false;
        //Close the associate side panel when navigating to the next screen.
        vm.isShowAssociateDetails = false;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
        $scope.isEnabled = true;
        // $scope.$broadcast("initUserDefinedData", {
        //   a: 10
        // });
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "dropconfigurationscreen"
      ) {
        vm.configureScreen = false;
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        vm.createForm = false;
        vm.addressContactScreen = false;
        vm.back = true;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "publishscreen"
      ) {
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.createForm = false;
        vm.addressContactScreen = false;
        vm.back = true;
        vm.getInventoryMethods();
      }
    };

    vm.resultdata = (result) => {
      vm.result_udd_data = result;
    }

    vm.continueFn = screen => {
      vm.validationMessage = null;
      if (vm.configureScreen === undefined) {
        vm.createForm = false;
        vm.previewAndPublish = true;
        vm.back = false;
      } else if (screen && screen.toLowerCase() === "createform") {
        //if current screen is create/update master data form and form data
        //is valid and all mandatory fields are filled then go to next stage
        if (vm.ven_maint_form && !vm.ven_maint_form.$invalid && $scope.head.buyer_id && vm.duplicateShortNameMessage == null
          // && 
          // vm.primaryDepartment && 
          // vm.mainAddress
        ) {
          if ((vm.isUpdateVendor && (vm.vendor_properties.inventory_method_id && vm.vendor_properties.inventory_method_id.length == 0)) || (!vm.isUpdateVendor && !$scope.head.inventory_method_id) || (vm.isUpdateVendor && vm.isUnassignedInventoryMethod) || (!vm.isUpdateVendor && (!$scope.head.rms_vendor_short_name || !$scope.head.rms_vendor_short_sequence))
            || (vm.isUpdateVendor && (!vm.vendor_properties.rms_vendor_short_name || !vm.vendor_properties.rms_vendor_short_sequence || vm.vendor_properties.rms_vendor_short_name == '' || vm.vendor_properties.rms_vendor_short_sequence == ''))) {
            //Variable to set the validation to true if validation is not met
            vm.isInvalidForm = true;
            //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
            vm.validationMessage =
              "Please check for any validation errors and all the mandatory fields.";
          } else {
            vm.getInventoryMethods();
            vm.createForm = false;
            vm.configureScreen = false;
            vm.addressContactScreen = true;
            vm.back = true;
            // This array is used to set the UDD validation
            $scope.uddValidationErrors = [];
            //Close the company side panel when navigating to the next screen.
            vm.showCmpDetails = false;
            //Close the department side panel when navigating to the next screen.
            vm.isCompanyDepartmentSidePanelVisible = false;
            //Close the individual side panel when navigating to the next screen.
            vm.showIndDetails = false;
            //Close the associate side panel when navigating to the next screen.
            vm.isShowAssociateDetails = false;
            //Variable to set the validation to false if the required validation is met
            vm.isInvalidForm = false;
            $scope.isEnabledAddressContact = !$scope.isEnabledAddressContact;
          }
        } else {
          //Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      } else if (screen && screen.toLowerCase() === "addresscontactscreen") {
        if (
          (vm.departmentForm1 && vm.departmentForm1.$invalid) ||
          (vm.departmentForm2 && vm.departmentForm2.$invalid) ||
          (vm.departmentForm3 && vm.departmentForm3.$invalid) ||
          (vm.departmentForm4 && vm.departmentForm4.$invalid)
        ) {
          //Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        } else {
          vm.configureScreen = true;
          vm.addressContactScreen = false;
          vm.manageDropScreen = false;
          vm.previewAndPublish = false;
          $scope.isEnabled = true;
          vm.back = true;
        }
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        if ((vm.uddForm && !vm.uddForm.$invalid) || vm.result_udd_data.length == 0) {
          vm.configureScreen = false;
          vm.manageDropScreen = true;
          vm.previewAndPublish = false;
          vm.back = true;
          //Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
        } else {
          if (vm.result_udd_data.length > 0) {
            //Variable to set the validation to true if validation is not met
            vm.isInvalidForm = true;
            //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
            vm.validationMessage =
              "Please check for any validation errors and all the mandatory fields.";
          }

        }
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        if ($scope.files && $scope.files.length > 0) {
          let btnLabel = $stateParams.id ? "'Upload Image'" : "'Add to Queue'";
          if (vm.drop_form.$valid) {
            vm.validationMessage = `Please click on ${btnLabel} button to link drop to vendor. Click on 'Skip' button to proceed without uploading.`;
          } else {
            vm.validationMessage = `Please fill in the required fields and click on ${btnLabel} button to link drop to vendor or Click on 'Skip' button to proceed without uploading.`;
          }
        } else {
          vm.manageDropScreen = false;
          vm.previewAndPublish = true;
          vm.createForm = false;
          vm.configureScreen = false;
          vm.back = true;
        }
      } else if (screen && screen.toLowerCase() === "skip") {
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.back = true;
        vm.validationMessage = null;
      }
    };
    vm.backFn = screen => {
      // Variable to show the validation message under the form fields
      vm.validationMessage = null;
      if (vm.configureScreen === undefined) {
        vm.back = false;
        vm.refineFn();
      } else if (screen && screen.toLowerCase() === "addresscontactscreen") {
        vm.createForm = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.showSummaryPanel = true;
        vm.previewAndPublish = false;
        vm.addressContactScreen = false;
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        vm.createForm = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.showSummaryPanel = false;
        vm.previewAndPublish = false;
        vm.addressContactScreen = true;
        $scope.isEnabledAddressContact = !$scope.isEnabledAddressContact;
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        vm.configureScreen = true;
        vm.previewAndPublish = false;
        vm.showSummaryPanel = true;
        vm.manageDropScreen = false;
        $scope.isEnabled = true;
        vm.addressContactScreen = false;
      } else if (screen && screen.toLowerCase() === "publishvendor") {
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        vm.addressContactScreen = false;
      }
      vm.venDataAddToQueueError = false;
    };
    vm.refineFn = () => {
      vm.createForm = true;
      vm.configureScreen = false;
      vm.vendorAddressForm = false;
      vm.previewAndPublish = false;
      vm.addressContactScreen = false;
    };
    vm.confirmDelete = false;
    vm.confirmDel = () => {
      vm.confirmDelete = !vm.confirmDelete;
    };

    // Get permissions for crud opration for vendor
    $scope.getAccessPermissions(vm.uuid)
      .then(result => {
        vm.vendorPermissions = result;
        vm.initializeVendorMaintenance();
      })
      .catch(error => {
        vm.vendorPermissions = error.data;
        vm.initializeVendorMaintenance();
      });
    vm.watchers();

    vm.unlockWithSecondaryPassword = (secondaryPassword) => {
      if (secondaryPassword) {
        VendorService.API.ValidateWithSecondaryPassword({ secondary_password: secondaryPassword })
          .then(validatedResult => {
            if (validatedResult.status === 200) {
              vm.showLockedScreen = false;
              vm.secondaryPassword = '';
              vm.message = '';
            }
          })
          .catch(error => {
            this.secondaryPassword = '';
            if (error.data.status === 401) {
              angular.element("#lockScreenPassword").focus();
              vm.message = 'Wrong Password.';
              $timeout(() => {
                vm.message = '';
              }, 2500);
            }
          })
      } else {
        angular.element("#lockScreenPassword").focus();
        vm.message = 'Please provide Password.';
        $timeout(() => {
          vm.message = '';
        }, 2500);
      }
    }

    vm.exitEditRMSNumber = () => {
      vm.showLockedScreen = false;
      vm.isShowRmsNumberUpdate = false;
      $state.go("common.prime.vendor.update");
    }

    vm.goToPasswordPanel = vendor => {
      vm.isCloneAllowed = true;
      vm.showLockedScreen = true;
      $state
        .go("common.prime.vendor.update.rmsnumber", {
          id: vendor.id
        });
    };
    vm.getVendorsFilter = () => {
      let model = "allVendors";
      VendorService.API.GetVendors()
        .then(response => {
          vm[model] = response.data.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };
  }
})();