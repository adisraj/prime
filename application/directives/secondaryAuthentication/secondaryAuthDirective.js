// Common directive for Secondary Password Authentication across all services in PRIME
(function () {
  "use strict";

  calculus.controller("SecondaryAuthenticationController", SecondaryAuthenticationController);

  SecondaryAuthenticationController.$inject = ["$rootScope", "$scope", "common", "UserService"];

  function SecondaryAuthenticationController($rootScope, $scope, common, UserService) {
    let vm = this;
    vm.common = common;
    vm.timeout = common.$timeout;
    vm.sessionMemory = common.SessionMemory;
    vm.currentUserName = JSON.parse(vm.sessionMemory.API.Get("user.name"));
    vm.userService = UserService;
    // Variable to hold Secondary Password
    vm.Password = undefined;
    // Variable which desides 'lock-screen-modal' to show
    vm.showModel = false;

    vm.checkIsAllowedFeaturedPassword = () => {
      // if user is allowed secondary password confirmation before clone, ask for confirmation
      vm.userService.API.IsAllowedFeaturedPassword($scope.featureCode)
        .then(result => {
          if (result.data && result.data.length) {
            for (let index = 0; index < result.data.length; index++) {
              if (result.data[index].allow_featured_password) {
                vm.showModel = true;
                // angular.element("body").addClass("o-hidden");
                $scope.isShowInventoryUpdate = false;
                $scope.isShowRmsNumberUpdate = false;
                $scope.isshowEditSku = false;
                $scope.showLockedScreen = true;
                vm.secondaryPassword = undefined;
                vm.message = '';
                break;
              } else {
                if ($scope.featureCode === "rms-vendor-number") {
                  vm.common.$state.go("common.prime.vendor.update");
                }
                $scope.isShowInventoryUpdate = true;
                $scope.isShowRmsNumberUpdate = true;
                $scope.isshowEditSku = true;
                $scope.showLockedScreen = false;
              }
            }
          } else {
            $scope.isShowInventoryUpdate = true;
            $scope.isshowEditSku = true;
            $scope.isShowRmsNumberUpdate = true;
            $scope.showLockedScreen = false;
          }
          // if ($scope.featureCode === "rms-vendor-number" && result.data && result.data.length == 0) {
          //   $scope.isShowRmsNumberUpdate = false;
          // }
        })
        .catch(error => {
          console.error(error);
        })
    }

    vm.unlockWithSecondaryPassword = () => {
      if (vm.secondaryPassword) {
        vm.userService.API.AuthenticateSecondaryPassword(vm.sessionMemory.API.Get("user.id"), vm.secondaryPassword)
          .then(validatedResult => {
            if (validatedResult.status === 200) {
              vm.secondaryPassword = undefined;
              vm.message = '';
              vm.showModel = false;
              angular.element("body").removeClass("o-hidden");
              $scope.isShowInventoryUpdate = true;
              $scope.isShowRmsNumberUpdate = true;
              $scope.showLockedScreen = false;
              $scope.isshowEditSku = true;
              if ($scope.featureCode === "rms-vendor-number") {
                vm.common.$state.go("common.prime.vendor.update");
              }
              if ($scope.featureCode === "sku-edit") {
                $rootScope.$broadcast("showeditsku", {
                  value: true
                });
              }
              if ($scope.featureCode === "SKU status") {
                $rootScope.$broadcast("continueStatus", {
                  value: true
                });
              }
              if ($scope.featureCode === "Item status") {
                $rootScope.$broadcast("continueItemStatus", {
                  value: true
                });
              }
            }
          })
          .catch(error => {
            vm.secondaryPassword = undefined;
            if (error.data.status === 401) {
              vm.message = "Wrong Password.";
              vm.timeout(() => {
                vm.message = '';
                angular.element("#clone_password").focus();
              }, 2500);
            }
          })
        vm.timeout(() => {
          angular.element("#item_Detail_clone").focus();
        }, 1000);
      } else {
        vm.message = "Please provide Password.";
        vm.timeout(() => {
          vm.message = '';
          angular.element("#clone_password").focus();
        }, 2500);
      }
    }

    vm.restoreScroll = () => {
      angular.element("body").removeClass("o-hidden");
    }

    vm.focusCloneItem = () => {
      vm.timeout(() => {
        angular.element("#clone_item").focus();
      }, 1000);
    }

    vm.focusCloneSku = () => {
      vm.timeout(() => {
        angular.element("#clone_sku").focus();
      }, 1000);
    }

    vm.checkIsAllowedFeaturedPassword();
  }

  //Directive
  (function () {
    "use strict";
    calculus
      .directive("secondaryAuthentication", secondaryAuthentication);

    function secondaryAuthentication() {
      var directive = {
        restrict: "E",
        controller: SecondaryAuthenticationController,
        controllerAs: "vm",
        scope: { featureCode: "=", showLockedScreen: "=", closeFn: "&", isShowInventoryUpdate: "=", isShowRmsNumberUpdate: "=", isshowEditSku: "=" },
        templateUrl:
          "application/directives/secondaryAuthentication/secondaryAuth.html"
      };
      return directive;
    }
  })();
})();
