(function() {
  "use strict";
  angular
    .module("rc.prime.sku")
    .controller(
      "SKUInstallationRetailController",
      SKUInstallationRetailController
    );
  SKUInstallationRetailController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "ItemService",
    "SKUService",
    "APIServices",
    "$location"
  ];

  function SKUInstallationRetailController(
    $scope,
    $stateParams,
    common,
    ItemService,
    SKUService,
    APIServices,
    $location
  ) {
    let vm = this;
    vm.$location = $location;

    /** Common Modules */
    let $state = common.$state;
    let $timeout = common.$timeout;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("SKUInstallationRetailController");
    vm.isDeleteSuccess = false;
    vm.isSaveSuccess = false;

    vm.Activate = () => {
      vm.button = "Create Installation Retails";
      vm.isUpdate = false;
      vm.installationRetail = {};
      vm.currentDate = $scope.getDateBasedOnFormat(new Date());
      vm.fetchInstallationRetailsForSku();
      vm.getSKUDetailsById($stateParams.id);
    };

    //To load the locations to check the availability of the SKU
    vm.fetchInstallationRetailsForSku = () => {
      vm.isLoaded = false;
      APIServices.Item.SKU.InstallationRetail
        .FetchInstallationRetailsForSku($stateParams.id)
        .then(response => {
          vm.installationRetails = response;
        })
        .catch(error => {
          console.log(error);
        });
    };

    vm.getSKUDetailsById = (skuId) => {
      SKUService.API.GetSKU(skuId)
      .then(response => {
        vm.skuDetails = response.data[0];
      })
      .catch(error => {
        console.log(error);
      })
    }

    vm.createOrUpdateInstallationRetail = () => {
      vm.isUpdate === true
        ? vm.updateInstallationRetailForSku()
        : vm.createInstallationRetailForSku();
    };

    vm.createInstallationRetailForSku = () => {
      vm.isProcessing = true;
      vm.installationRetail.id = $stateParams.id;
      APIServices.Item.SKU.InstallationRetail
        .CreateInstallationRetailForSku(vm.installationRetail)
        .then(response => {
          vm.isProcessing = false;
          // vm.message = "Created installation retails successfully.";
          vm.isSaveSuccess = true;
          vm.installationRetail = {};
          vm.installation_retail_form.$setPristine();
          vm.fetchInstallationRetailsForSku();
        })
        .catch(error => {
          vm.isProcessing = false;
          vm.error = error.data.error.message;
        });
      $timeout(() => {
        // vm.message = null;
        vm.error = null;
      }, 3000);
    };

    vm.updateInstallationRetailForSku = () => {
      vm.isProcessing = true;
      if (vm.hasUpdateChanges() === true) {
        vm.installationRetail.effective_date = moment(
          vm.installationRetail.effective_date
        ).format("YYYY-MM-DD");
        APIServices.Item.SKU.InstallationRetail
          .UpdateInstallationRetailForSku(vm.installationRetail)
          .then(response => {
            vm.message = "Updated installation retails successfully.";
            vm.fetchInstallationRetailsForSku();
          })
          .catch(error => {
            vm.error = error.data.error.message;
          });
        $timeout(() => {
          vm.isProcessing = false;
          vm.message = null;
          vm.error = null;
          vm.installationRetail = {};
          vm.installation_retail_form.$setPristine();
          vm.isUpdate = false;
          vm.button = "Create Installation Retails";
        }, 3000);
      } else {
        vm.message = "No changes detected to update.";
        $timeout(() => {
          vm.isProcessing = false;
          vm.message = null;
          vm.error = null;
        }, 3000);
      }
    };

    vm.hasUpdateChanges = () => {
      if (
        moment(vm.oldInstallationRetailObject.effective_date).format(
          "YYYY-MM-DD"
        ) !==
          moment(vm.installationRetail.effective_date).format("YYYY-MM-DD") ||
        vm.oldInstallationRetailObject.installation_charge !==
          vm.installationRetail.installation_charge ||
          vm.oldInstallationRetailObject.installation_cost !==
          vm.installationRetail.installation_cost
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.deleteInstallationRetail = data => {
      let id = data.id;
      vm.isProcessing = true;
      data.isProcessing = true;
      APIServices.Item.SKU.InstallationRetail
        .DeleteInstallationRetail(id)
        .then(response => {
          // vm.message = "Deleted installation retail successfully.";
          vm.isDeleteSuccess = true;
          vm.isProcessing = false;
          data.isProcessing = false;
          vm.fetchInstallationRetailsForSku();
        })
        .catch(error => {
          vm.error = error;
        });
      $timeout(() => {
        vm.isProcessing = false;
        // vm.message = null;
      }, 3000);
    };

    vm.updateInstallationRetail = installationRetail => {
      vm.oldInstallationRetailObject = _.clone(installationRetail);
      vm.installationRetail = _.clone(installationRetail);
      vm.installationRetail.effective_date = $scope.getDateBasedOnFormat(
        vm.installationRetail.effective_date
      );
      vm.button = "Update Installation Retails";
      vm.isUpdate = true;
    };

    vm.cancelUpdate = () => {
      vm.installation_retail_form.$setPristine();
      vm.installationRetail = {};
      vm.isUpdate = false;
      vm.button = "Create Installation Retails";
    };

    vm.goBack = () => {
      $state.go("common.prime.itemMaintenance.sku");
      $timeout(() => {
        angular.element("#install_retail").focus();
      }, 1000);
    };

    vm.Activate();
  }
})();
