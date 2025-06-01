(function() {
  "use strict";

  angular
    .module("rc.prime.mto.type")
    .controller("MTOTypeController", MTOTypeController);
  MTOTypeController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "CodeService",
    "MTOTypeService",
    "RetailService",
    "CloudCartService",
    "StatusCodes",
    "UserService"
  ];

  function MTOTypeController(
    $scope,
    $stateParams,
    common,
    CodeService,
    MTOTypeService,
    RetailService,
    CloudCartService,
    StatusCodes,
    UserService
  ) {
    var vm = this;
    vm.statusCodes = StatusCodes;
    let $state = common.$state;
    let $timeout = common.$timeout;
    let logger = common.Logger.getInstance("MTOTypeController");
    let Notification = common.Notification;
    vm.common = common;
    vm.$stateParams = $stateParams;

    vm.uuid = "39";
    vm.entityInformation = {};

    //variables used for creata/update/delete forms
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;

    vm.message = null;
    vm.isShowDetails = false;
    vm.isShowHistory = false;
    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;
    vm.isLoaded = false;
    vm.isBtnEnable = true;

    //variables used for delete dependencies
    vm.dependencyList = {};
    vm.showDependencyDetails = false;
    vm.showDependencyDetailsData = false;
    vm.$errorDependentData = {};

    //variables used for pagination/sorting
    vm.isColumnSettingsVisible = false;
    vm.sortType = "short_description";
    vm.currentPage = 1;
    vm.pageSize = 100;

    vm.issideMenuVisible = false;

    ///////// initialzing MTO type module

    //Set attribute grid properties for show-hide MTO Type columns
    vm.setGridProperties = () => {
      vm.mtoTypeGrid = {
        columns: {
          select: {
            visible: true
          },
          id: {
            visible: false
          },
          status: {
            visible: true
          },
          optionType: {
            visible: true
          },
          collectionSupported: {
            visible: true
          },
          familySupported: {
            visible: true
          },
          pricingMethod: {
            visible: true
          },
          datalake: {
            visible: true
          }
        }
      };
    };

    vm.expandMinimizeSidebar = () => {
      vm.issideMenuVisible = !vm.issideMenuVisible;
    };

    vm.initializeMTOType = function() {
      vm.getEntityInformation();
      vm.fetchFeatureAccessPermission();
      vm.getModelAndSetValidationRules();
      vm.setGridProperties();
      vm.loadCodeListData(
        vm.uuid,
        "Pricing Method",
        "allMtoPriceMethod",
        common.$q
      ); // Loading for Pricing Methods
      let promise = vm.reload();

      promise.then(res => {
        $stateParams.mto_type_id &&
        common.$state.current.name.includes("mtotype.update")
          ? vm.gotoUpdateStateIfIdExist()
          : "";
      });
    };

    //Fetch permission to clone item type for the logged in user by code
    vm.fetchFeatureAccessPermission = () => {
      UserService.API.IsAllowedFeaturedPassword("mto-type-clone")
        .then(result => {
          if (result.data && result.data.length) {
            vm.isCloneAllowed = true;
          } else {
            vm.isCloneAllowed = false;
          }
        })
        .catch(error => {
          console.error(error);
        });
    };

    vm.cloneMTOType = () => {
      vm.isCloning = true;
      MTOTypeService.API.CloneMTOType({
        id: vm.type.id,
        is_clone_udd: vm.isCloneUdds,
        description: vm.new_type.description,
        status_id: vm.new_type.status_id
      })
        .then(validatedResult => {
          if (validatedResult.status === 201) {
            this.showLockedScreen = false;
            this.secondaryPassword = "";
            this.isSaveSuccess = true;
            vm.new_type.description = undefined;
            vm.reload();
            $timeout(() => {
              vm.new_type = {};
              vm.cloneError = null;
              vm.isCloning = false;
            }, 2500);
          }
        })
        .catch(error => {
          vm.cloneError = error.data.message;
          $timeout(() => {
            vm.isCloning = false;
            vm.cloneError = null;
          }, 3000);
        });
    };

    vm.openClonePanel = type => {
      this.cloneMessage = null;
      this.cloneError = null;
      this.type = type;
      this.showLockedScreen = true;
      this.isShowClonePanel = true;
      vm.new_type = {};
      vm.new_type.status_id = 100;
    };

    //If update form is open, on refresh page get mto type data for selected id
    vm.getMTOTypeById = () => {
      MTOTypeService.API.GetMTOTypeById($stateParams.mto_type_id)
        .then(response => {
          vm.dblClickAction(response);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Get information required for mto type entity by uuid , statically stored in application.context.js file
    vm.getEntityInformation = function() {
      common.EntityDetails.API.GetEntityInformation(vm.uuid).then(
        lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.mto_option); // GET statuses for MTO module
        }
      );
    };

    //get validation rules for mto type by uuid and set rules using valdr in application.context.js
    vm.getModelAndSetValidationRules = function() {
      common.EntityDetails.API.GetModelAndSetValidationRules(
        vm.uuid
      ).then(model => {});
    };

    //generic function to get data for drop down from code list table
    vm.loadCodeListData = function(uuid, fieldName, model, $q) {
      let defer = $q.defer();

      let query = {
        uuid: uuid,
        field_name: fieldName
      };

      CodeService.API.MultiSearchCodeList(query)
        .then(response => {
          $scope[model] = response;
          vm[model] = response;
          defer.resolve(response);
        })
        .catch(error => {
          defer.reject(error);
          logger.error(error);
        });
      return defer.promise;
    };

    /**
     * @param {Boolean} refresh true/false
     * @description On page load or on "Refresh" button click this will be called.
     * If refresh value is true the message with record number, response time take will be shown in UI
     */
    vm.reload = function(refresh) {
      vm.setGridProperties();
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.checkAll = false;
      $scope.selectedRow = null;
      vm.isLoaded = false;
      let data = MTOTypeService.API.GetMTOTypes()
        .then(response => {
          vm.isDisabled = false; // On click of "Refresh" button, make the "Maintain UDD" button disabled.
          vm.rowsCount = response.data.length;
          vm.mtostype_data = response.data;
          vm.enableGoToAllTypeUDD = true;
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
            vm.focusSearchField();
          }
          vm.createMapListMtoType(response.data);
          vm.isLoaded = true;
          vm.updateTableInformation(1); // show table information like no. of records
          return response.data;
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true;
            vm.isViewAuthorized = false;
          }
          vm.isRefreshTable = true;
          vm.refreshTableText = "Unsuccessfull!";
          $timeout(() => {
            vm.isRefreshTable = false;
          }, 3500);
          logger.error(error);
        });
      return data;
    };

    vm.createMapListMtoType = list => {
      vm.typesMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.typesMap[list[i].id] === undefined) {
          vm.typesMap[list[i].id] = list[i];
        }
      }
    };

    //Focus
    vm.focusSearchField = () => {
      this.common.$timeout(() => {
        angular.element("#inlineSearch").focus();
        },1000)
    };

    ////////// check all select box implementation
    vm.enableDisable = function() {
      _.some(vm.mtostype_data, function(loc, i) {
        // Underscore Library function
        if (loc.check) {
          vm.isDisabled = true;
          vm.enableGoToAllTypeUDD = true;
          return true;
        } else {
          vm.isDisabled = false;
        }
      });
    };
    vm.enableOrDisableCheckboxes = function(flag) {
      _.each(vm.mtostype_data, function(d) {
        d.check = flag;
      });
      vm.enableDisable();
    };

    ///// Entity save update delete implementation

    //prepare data to create/update new mto type
    vm.prepareData = function(data) {
      data.collection_supported =
        data.collection_supported_id === undefined ||
        data.collection_supported_id === null
          ? 0
          : parseInt(data.collection_supported_id);
      data.family_supported =
        data.family_supported_id === undefined ||
        data.family_supported_id === null
          ? 0
          : parseInt(data.family_supported_id);
      return data;
    };

    // Save new mto type
    vm.save = function(payload) {
      vm.isLoaded = false;
      vm.isBtnEnable = false;
      vm.saveBtnText = "Saving now...";
      payload = vm.prepareData(payload);
      MTOTypeService.API.InsertMTOType(payload)
        .then(response => {
          vm.previousLT = payload; // after saving store the payload in a variable
          vm.saveBtnText = "Done";
          vm.isSaveSuccess = true;
          vm.isBtnEnable = true;
          vm.reload();
        })
        .catch(error => {
          vm.isLoaded = true;
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.message = Notification.errorNotification(error);
          }
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          common.$timeout(function() {
            vm.message = null;
            vm.saveBtnText = "Save";
            vm.isBtnEnable = true;
            vm.saveBtnError = false;
          }, 2500);
        });
    };

    //check if the payload is different from old form data. if it is then return true.
    vm.hasUpdateChanges = function(payload) {
      if (
        vm.oldMTOTypeDetails.status_id !== payload.status_id ||
        vm.oldMTOTypeDetails.short_description !== payload.short_description ||
        vm.oldMTOTypeDetails.pricing_method !== payload.pricing_method ||
        vm.oldMTOTypeDetails.collection_supported_id !==
          payload.collection_supported_id ||
        vm.oldMTOTypeDetails.family_supported_id !== payload.family_supported_id
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.getOptionsByTypeId = typeId => {
      common.EntityDetails.API.GetGraphSet(
        common.Identifiers.mto_option,
        ["id", "description"],
        "option_type_id",
        typeId
      )
        .then(res => {
          vm.optionsCount = res.length;
        })
        .catch(err => logger.error(err));
    };

    /// function to check if pricing method is being updated
    // if yes then set variables to show messages in side panel and return false
    // if no then return false
    vm.checkPricingMethodChanged = payload => {
      let oldPM = vm.oldMTOTypeDetails.pricing_method_value.toLowerCase(); /// old pricing method
      let newPM = payload.pricing_method_value.toLowerCase(); /// new pricing method

      /// variables to show messages when user tries to update pricing method
      vm.isRemoveRetails = false;
      vm.isAssignNewRetails = false;
      vm.isAssignPriceGroups = false;

      if (oldPM !== newPM) {
        $scope.showhistory = false;
        vm.isPricingMethodChanged = true;
        vm.showDependencyDetailsData = true;
        if (
          (oldPM === "by choice" && newPM === "price group") ||
          (oldPM === "price group" && newPM === "by choice") ||
          ((oldPM === "by choice" || oldPM === "price group") &&
            newPM === "no charge")
        ) {
          vm.isRemoveRetails = true;
        }

        if (
          (oldPM === "by choice" && newPM === "price group") ||
          (oldPM === "price group" && newPM === "by choice") ||
          (oldPM === "no charge" && newPM === "by choice") ||
          (oldPM === "no charge" && newPM === "price group")
        ) {
          vm.isAssignNewRetails = true;
        }

        if (
          (oldPM === "by choice" && newPM === "price group") ||
          (oldPM === "no charge" && newPM === "price group")
        ) {
          vm.isAssignPriceGroups = true;
        }
        return true;
      } else {
        return false;
      }
    };

    /// function remove retails for the options of option type and then update type
    vm.removeRetailsAndUpdate = payload => {
      let oldPM = vm.oldMTOTypeDetails.pricing_method_value.toLowerCase();
      let newPM = payload.pricing_method_value.toLowerCase();
      if (
        (oldPM === "by choice" && newPM === "price group") ||
        (oldPM === "price group" && newPM === "by choice") ||
        ((oldPM === "by choice" || oldPM === "price group") &&
          newPM === "no charge")
      ) {
        RetailService.API.DeleteOptionsRetailsByOptionTypeId(payload.id)
          .then(response => {
            vm.update(payload, true);
            // remove option added to the cart for current option type
            CloudCartService.API.DeleteCartOptionsByOptionTypeId(payload.id)
              .then(result => {})
              .catch(error => {
                vm.message = Notification.errorNotification(error);
              });
          })
          .catch(error => {
            console.log(error);
          });
      } else {
        vm.update(payload, true);
      }
    };

    //update the mto type.
    vm.update = function(payload, updateFlag) {
      payload = vm.prepareData(payload); //prepere payload before save/update
      if (vm.hasUpdateChanges(payload) === true) {
        /// update if pricing method is not changed or update flag is true or options count for option type is zero
        if (
          vm.optionsCount === 0 ||
          vm.checkPricingMethodChanged(payload) === false ||
          updateFlag
        ) {
          //if the current form data is changed then update.
          vm.isBtnEnable = false;
          vm.updateBtnText = "Updating Now...";
          MTOTypeService.API.UpdateMTOType(payload)
            .then(response => {
              let index = vm.mtostype_data.findIndex(
                mtostype_data => mtostype_data.id === payload.id
              );
              vm.mtostype_data[index] = response.data;
              vm.typesMap[$stateParams.mto_type_id] = response.data;
              vm.showDependencyDetailsData = false;
              vm.oldMTOTypeDetails = null;
              payload.$edit = false;
              vm.isBtnEnable = true;
              vm.isShowHistory = false;
              vm.updateBtnText = "Done";
              vm.isUpdateSuccess = true;
              vm.isDisabled = false; // on update after selecting an entity type, disable Maintain UDD button.
              vm.enableOrDisableCheckboxes(0); // Remove entity type selection when maintain udd button is disabled.
              $scope.closeShowHistory(); // on update close history panel if it is opened
            })
            .catch(error => {
              vm.isLoaded = true;
              vm.showDependencyDetailsData = false;
              if (error.status === 403) {
                vm.isUnauthorized = true;
              } else {
                vm.message = Notification.errorNotification(error);
              }
              vm.updateBtnText = "Oops.!! Something went wrong";
              vm.updateBtnError = true;
              common.$timeout(function() {
                vm.message = null;
                vm.updateBtnText = "Update";
                vm.updateBtnError = false;
                vm.isBtnEnable = true;
              }, 2500);
            });
        }
      } else {
        vm.updateBtnText = "Nothing to update";
        vm.showDependencyDetailsData = false;
        vm.updateBtnError = true;
        common.$timeout(function() {
          vm.updateBtnText = "Update";
          vm.isBtnEnable = true;
          vm.updateBtnError = false;
        }, 1000);
      }
    };

    //delete mto type
    vm.delete = function(payload) {
      // vm.isLoaded = false;
      vm.showDependencyDetailsData = false;
      MTOTypeService.API.DeleteMTOType(payload)
        .then(response => {
          //vm.isLoaded = true;
          vm.isDeleteSuccess = true;
          vm.isConfirmDelete = false;
          let index = vm.mtostype_data.findIndex(
            mtostype_data => mtostype_data.id === payload.id
          );
          vm.mtostype_data.splice(index, 1);
          delete vm.typesMap[$stateParams.mto_type_id];
          vm.rowsCount--;
          vm.updateTableInformation(1);
        })
        .catch(error => {
          //vm.isLoaded = true;
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else if (error.status === 412) {
            vm.dependencyList = error.data.dependency;
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          } else {
            vm.message = Notification.errorNotification(error);
            vm.isUpdateSuccess = false;
            vm.showDependencyDetails = true;
          }
        });
    };

    //// view manipaulation

    //on click of delete button in update form, delete confirmation panel should be shown
    vm.showconfirm = function() {
      vm.isConfirmDelete = true;
      vm.isShowHistory = false;
      vm.isUnauthorized = false;
    };

    //show dependency details in side panel for selected dependent entity
    vm.showDependencyListDetails = function(data) {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
      vm.isPricingMethodChanged = false;
    };

    //for navigation to the udd page, creates array of ids of selected mto types
    vm.goToAllTypeUDD = function() {
      let typeIds = [];
      _.each(vm.mtostype_data, function(d) {
        if (d.check) {
          typeIds.push(d.id);
        }
      });

      //vm.disableCheckboxes = true;
      $state.go("common.prime.mtotypeudd", {
        mto_type_id: typeIds.join(",")
      });
    };

    //focus will be set to the first field of form
    vm.setInitialState = function(entityName) {
      common.$timeout(function() {
        angular.element("#short_description").focus();
      });
    };

    //Open create new mto type form
    vm.openForm = function() {
      vm.saveBtnText = "Save";
      vm.new_type = {};
      $state.go("common.prime.mtotype.new");
      vm.setInitialState();
    };

    //toggle Hide/Show column panel
    vm.ShowHideColumnSettings = () => {
      vm.isColumnSettingsVisible = vm.isColumnSettingsVisible ? false : true;
    };

    //show create new mto type form on click of create another button after a new record created.
    vm.createAnotherForm = function() {
      vm.saveBtnText = "Save";
      vm.isSaveSuccess = false;
      vm.new_type = {};
      //Setting Previously entered data to the new context
      vm.new_type.status_id = vm.previousLT.status_id;
      vm.setInitialState();
    };

    //Close form and success/error messages in the form
    vm.closeForm = function() {
      vm.isSaveSuccess = false
      $state.go("common.prime.mtotype");
      vm.message = null;
      vm.showDependencyDetailsData = false;
      vm.isShowClonePanel = false
      common.$timeout(function() {
        vm.showDependencyDetails = false;
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    //close dependency details panel only
    vm.closeDependencyDetails = function() {
      vm.showDependencyDetailsData = false;
    };

    //close dependency list panel and show update form
    vm.closeDependencyList = function() {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.isConfirmDelete = false;
      vm.isShowHistory = true;
    };

    //highlight the clicked row in table
    vm.setClickedRow = function(index) {
      $scope.selectedRow = index;
    };

    vm.pageChangeHandler = num => {
      vm.currentPage = num;
      vm.updateTableInformation(num);
    };

    // show table information like no. of records with or without search filter.
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

    //On double click on a record in the table, update form will be opened and
    // if any success/error page/meesage in the form will be closed.
    vm.dblClickAction = function(mtoType) {
      $state.go("common.prime.mtotype.update", { mto_type_id: mtoType.id });
      vm.isUnauthorized = false;
      vm.isShowHistory = true;
      vm.isSaveSuccess = false;
      vm.isUpdateSuccess = false;
      vm.isDeleteSuccess = false;
      vm.isConfirmDelete = false;
      vm.updateBtnText = "Update";
      vm.getOptionsByTypeId(mtoType.id);
      vm.new_type = _.clone(mtoType);
      vm.oldMTOTypeDetails = _.clone(mtoType);
      $scope.closeShowHistory();
      vm.setInitialState();
    };

    vm.gotoUpdateStateIfIdExist = () => {
      if (vm.typesMap[$stateParams.mto_type_id]) {
        vm.dblClickAction(vm.typesMap[$stateParams.mto_type_id]);
      } else {
        vm.closeForm();
      }
    };

    //shows all update history for selected record
    $scope.loadHistory = function() {
      $scope.showhistoryloading = true; // Loading history until get the response
      vm.showDependencyDetailsData = false;
      common.EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        vm.new_type.id
      )
        .then(response => {
          $scope.historyList = response;
          $scope.showhistory = true;
          $scope.showhistoryloading = false;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // close the show update history panel
    $scope.closeShowHistory = function() {
      common.$timeout(function() {
      angular.element("#short_description").focus();
    });
      $scope.showhistory = false;
      $scope.showhistoryloading = false;
    };

    activate();

    ///////// activating MTO type module
    function activate() {
      vm.initializeMTOType();
      // Move-UP Down Arrow functions
      $scope.reloadMethodDisplayValues = vm.goToAllTypeUDD;
      $scope.setClickedRow = vm.setClickedRow;
      $scope.dblClickAction = vm.dblClickAction;
      $scope.getAccessPermissions(vm.uuid);
    }
  }
})();
