(function () {
  "use strict";
  angular
    .module("rc.prime.login")
    .controller("LoginController", LoginController);
  LoginController.$inject = [
    "$scope",
    "LoginService",
    "$stateParams",
    "UserDataService",
    "$interval",
    "Module",
    "common",
    "CookieMemory",
    "PreferenceService",
    "$location",
    "TemplateService",
    "VendorService",
    "ItemCollectionService",
    "HierarchyValueService",
    "EntityService",
    "UserService"
  ];

  function LoginController(
    $scope,
    LoginService,
    $stateParams,

    UserDataService,
    $interval,
    Module,
    common,
    CookieMemory,
    PreferenceService,
    $location,
    TemplateService,
    VendorService,
    ItemCollectionService,
    HierarchyValueService,
    EntityService,
    UserService
  ) {
    let logger = common.Logger.getInstance("LoginController");
    let $state = common.$state;
    let $timeout = common.$timeout;
    let SessionMemory = common.SessionMemory;
    let LocalMemory = common.LocalMemory;
    let EntityDetails = common.EntityDetails;
    let vm = this;
    vm.user_details = {};
    vm.mfa_code = {};
    vm.isVisibleForgotPasswordPanel = false;
    vm.isVisibleSecondForgotPasswordPanel = false
    vm.user = {};
    vm.username = $location.search()["username"];
    vm.email = $location.search()["email"];
    vm.id = $location.search()["id"];
    vm.hide_show_password = false;
    vm.hide_confirm_pass = false;
    vm.confirm_password_input_type = "password";
    vm.password_input_type = "password";
    vm.isUpdateSuccess = false;
    vm.isProcessing = false;
    vm.isMfaVerified = false;
    vm.loginButtonText = "Sign In";
    vm.passwordMismatch=false;
    //  This variable is used to show the loader while navigating without login through Ark
    vm.isNavigating = false;

    vm.Activate = () => {
      if (vm.username && vm.email && vm.id) {
        vm.isVisibleForgotPasswordPanel = true;
        // Redirect to a different state or perform a different action
        $state.go('desiredState', { /* additional parameters */ });
        return; // Stop further execution
      }

      //  This variable is used to show the loader while navigating without login through Ark
      vm.isNavigating = true;
      if ($location.search()["token"] && $location.search()["sessionId"]) {
        this.activeCart = false;
        SessionMemory.API.Post("user.session", $location.search()["sessionId"]);
        SessionMemory.API.Post("user.token", $location.search()["token"]);
        LoginService.API.GetSession().then(res => {

          if (res.data.length > 0) {
            SessionMemory.API.Post("session.module_id", res.data[0].module_id);
            // This variable is used to show the loader while navigating without login through Ark
            vm.isNavigating = true;
            let user = {
              user_id: res.data[0].user_id,
              userId: res.data[0].user_id,
              token: res.data[0].token,
              name: res.data[0].name,
              session_id: res.data[0].session_id
            };
            let params = user;
            if ($location.search()['moduleid']) {
              params.module_id = $location.search()['moduleid'];
            }
            LoginService.API.CreateSession(params).then(res1 => {

            }).catch(error => {
              console.log(error)
            })
            vm.user_details = user;
            SessionMemory.API.Post("user", JSON.stringify(res.data[0]));
            SessionMemory.API.Post(
              "user.id",
              JSON.stringify(res.data[0].user_id)
            );
            SessionMemory.API.Post(
              "user.name",
              JSON.stringify(res.data[0].name)
            );
            getPreferencesForUser(res.data[0].user_id);
            vm.storePEHierarchyValueTree();
            let $stateParameters = {};
            // If the skuId and itemId exist then search in the URL
            if (
              $location.search()["sku_id"] ||
              $location.search()["item_id"]
            ) {
              $stateParameters["id"] = $location.search()["sku_id"];
              $stateParameters["item_id"] = $location.search()["item_id"];
              $stateParameters["skutype"] = $location.search()["sku_type"];
              $stateParameters["subtype"] = $location.search()["sub_type"];
              $state.go(
                "common.prime.itemMaintenance.sku.update",
                $stateParameters
              );
            } else {
              vm.goToDashboard();
            }
          } else {
            //  This variable is used to show the loader while navigating without login through Ark
            vm.isNavigating = false;
            $state.go("login");
          }
        })
          .catch(error => {
            //  This variable is used to show the loader while navigating without login through Ark
            vm.isNavigating = false;
            if (error.status === -1) {
              $state.go("serverdown");
            }
          });
      } else {
        //  This variable is used to show the loader while navigating without login through Ark
        vm.isNavigating = false;
        $state.go("login");
      }
    };

    vm.Activate();

    let storeUserDetails = userDetails => {
      try {
        let user = {
          id: userDetails.userId,
          token: userDetails.token,
          name: userDetails.name,
          sessionId: userDetails.session_id
        };
        SessionMemory.API.Post("user", JSON.stringify(user));
        SessionMemory.API.Post("user.id", userDetails.userId);
        SessionMemory.API.Post("user.name", JSON.stringify(userDetails.name));
        SessionMemory.API.Post("user.token", userDetails.token);
        SessionMemory.API.Post("user.session", userDetails.session_id);
        SessionMemory.API.Post(
          "user.baseLocationId",
          userDetails["base location id"]
        );
      } catch (error) {
        logger.error(error);
      }
    };

    let getPreferencesForUser = userId => {
      PreferenceService.API.GetPreferencesByUserId(userId)
        .then(response => {
          vm.allPreferences = response.data;
          vm.storePreferences(vm.allPreferences);
        })
        .catch(error => {
          logger.error(error);
        });
    };


    /* Get product explorer hierarchy values list */
    vm.storePEHierarchyValueTree = () => {
      if (
        !SessionMemory.API.Get("item_type_maps") &&
        !JSON.parse(SessionMemory.API.Get("item_type_maps"))
      ) {
        TemplateService.API.GetNodes()
          .then(response => {
            // Key-value map of hierarchy value id and data
            vm.hierarchyValuesMap = JSON.parse(response.lookup);
            // Division/Department/Class tree structure
            vm.nodesDetails = response.results;
            SessionMemory.API.Post(
              "item_types",
              JSON.stringify(vm.nodesDetails)
            );
            SessionMemory.API.Post(
              "item_type_maps",
              JSON.stringify(vm.hierarchyValuesMap)
            );
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.storePreferences = preferencesList => {
      for (var i = 0; i < preferencesList.length; i++) {
        let user_preference = preferencesList[i].preference.replace(
          new RegExp(" ", "g"),
          "."
        );
        if (preferencesList[i].option_id && !preferencesList[i].value) {
          SessionMemory.API.Post(
            "user.preference." + user_preference,
            preferencesList[i].option
          );
        } else if (preferencesList[i].value && !preferencesList[i].option_id) {
          SessionMemory.API.Post(
            "user.preference." + user_preference,
            preferencesList[i].value
          );
        }
      }
    };

    vm.getFormData = () => {
      let cookieData = CookieMemory.API.Get("user");
      if (cookieData) {
        vm.user = JSON.parse(cookieData);
      }
      angular.element("#username").focus();
    };

    let cleanUpSession = () => {
      LocalMemory.API.Clear();
      SessionMemory.API.Clear();
    };
    let getEntityDetails = () => {
      EntityDetails.API.GetAllEntities()
        .then(res => { })
        .catch(err => { });
    };

    vm.getUsers = () => {
      LoginService.API.GetUsersMap(["id", "name"])
        .then(response => {
          SessionMemory.API.Post("users", JSON.stringify(response));
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.login = () => {
      vm.loginButtonText = "Signing in....";
      try {
        vm.isProcessing = true;
        vm.user.module_id = Module.id;
        LoginService.API.Login(vm.user)
          .then(response => {
            LocalMemory.API.Clear();
            SessionMemory.API.Clear();
            vm.isProcessing = false;
            if (angular.equals(response.status, 200)) {
              vm.user_details = response.data;
              vm.getUsers();
              getVendors();
              getCollections();
              getHierarchyValus();
              getEntityDetails();
              getUserRoles(vm.user_details.user_id);
              storeUserDetails(vm.user_details);
              getPreferencesForUser(vm.user_details.user_id);
              vm.storePEHierarchyValueTree();
              vm.isProcessing = true;
              LoginService.API.LoadInitialDataSet();
              if (response.data.is_mfa_verified === 1) {
                vm.isMfaVerified = true;
                vm.mfa_code = {};
              } else {
                vm.goToDashboard();
              }
            }
          })
          .catch(error => {
            vm.loginButtonText = "Sign In";
            vm.isProcessing = false;
            angular.element("#username").focus();
            vm.user.password = "";
            vm.login_error = true;
            if (error.data && error.status === 412) {
              if (error.data.error) {
                vm.login_message = error.data.error.error;
              } else {
                vm.login_message = error.data.message;
              }
            } else {
              vm.login_message =
                "Unable to connect to application platform, contact Administrator!";
            }
            cleanUpSession();
            vm.userauthenticate = true;
            $state.go("login");
          });
      } catch (error) {
        vm.isProcessing = false;
        logger.error(error);
      }
    };

    let getUserRoles = (userId) => {
      UserService.API.GetAccessRolesByUser(userId)
        .then(response => {
          SessionMemory.API.Post("user_role", JSON.stringify(response.data));
        })
        .catch(error => {
          logger.error(error);
        });
    }

    // Get the all hierarchy values list and save it to session memeory
    let getHierarchyValus = () => {
      HierarchyValueService.API.GetHierarchyValues()
        .then(response => {
          let model = "allHierarchyValues";
          vm[model] = response;
          SessionMemory.API.Post("hierarchyValueList", JSON.stringify(vm[model]));
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get the all collections list and save it to session memeory
    let getCollections = () => {
      ItemCollectionService.API.GetItemCollections()
        .then(response => {
          let model = "allCollections";
          vm[model] = response.data;
          SessionMemory.API.Post("collectionList", JSON.stringify(vm[model]));
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get the Vendors to create a map of Vendors
    let getVendors = () => {
      VendorService.API.GetVendors()
        .then(response => {
          let model = "allVendors";
          $scope[model] = [];
          vm[model] = [];
          _.each(response.data.data, response => {
            if (response.goods_allowed) {
              $scope[model].push(response);
              vm[model].push(response);
            }
          });
          SessionMemory.API.Post("vendorList", JSON.stringify(vm[model]));
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.showPosition = position => {
      let location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      LoginService.API.SetUserLocation(location)
        .then(result => { })
        .catch(error => { });
    };

    vm.getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(vm.showPosition);
      } else {

      }
    };

    vm.goToDashboard = () => {
      $state.go("common.dashboard", {
        userdetails: vm.user_details
      });
      getUserRoles(vm.user_details.user_id);
    };

    vm.verifyMfa = mfa_code => {
      let mfa_value =
        mfa_code.a +
        mfa_code.b +
        mfa_code.c +
        mfa_code.d +
        mfa_code.e +
        mfa_code.f;
      LoginService.API.VerifyMfaCode(mfa_value)
        .then(response => {
          vm.goToDashboard();
        })
        .catch(error => {
          vm.mfa_code = {};
          vm.login_error = "Unable to verify MFA code.";
        });
    };

    vm.logout = () => {
      LoginService.API.Logout()
        .then(result => {
          cleanUpSession();
          $state.go("login");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.resetPassword = () => {

      try {
        vm.isProcessing = true;
        LoginService.API.ForgotPassword(vm.recovery)
          .then(response => {
            vm.isProcessing = false;
            if (response.status === 200) {
              $timeout(() => {
                $scope.$apply(() => {
                    vm.isVisibleSecondForgotPasswordPanel = false;
                    vm.isVisibleForgotPasswordPanel = false;
                });
            }, 2000);
              vm.reset_error = false;
              vm.reset_success = true;
              vm.reset_message =
                "We've sent new password to your registered email address.";
              vm.recovery = "";
            

            } else {
              vm.reset_error = true;
              vm.reset_message = response.data.message;
            }
          })
          .catch(error => {
            vm.isProcessing = false;
            vm.recovery = "";
            vm.reset_error = true;
            vm.reset_success = false;
            vm.reset_message = "No matching profile existing in system";
            angular.element("#forgot_username").focus();
          });
      } catch (error) {
        logger.error(error);
      }
    };


    $scope.resetnewFormPasswordFromMail = {}
    $scope.resetnewFormPasswordFromMail.username = vm.username;
    $scope.resetnewFormPasswordFromMail.recovery_email = vm.email;
    $scope.resetnewFormPasswordFromMail.id = vm.id;
    $scope.resetnewFormPasswordFromMail.is_primary = 1;
    $scope.showPasswordForMainForm = false;
    $scope.togglePasswordVisibilityForMainForm = function () {
      $scope.showPasswordForMainForm = !$scope.showPasswordForMainForm;
    };
    $scope.passwordVisibleForConfirmMail = false;
    $scope.togglePasswordVisibility = function () {
      $scope.passwordVisibleForConfirmMail = !$scope.passwordVisibleForConfirmMail;
    };

    $scope.passwordVisibleForNewPasswordRest = false;
    $scope.togglePasswordVisibilityForNewPasswordReset = function () {
      $scope.passwordVisibleForNewPasswordRest = !$scope.passwordVisibleForNewPasswordRest;
    };

    // confirmpassword

    // new_password


    vm.toggleShowpassword = () => {
      vm.hide_show_password = !vm.hide_show_password;
      vm.hide_show_password === true ?
        (vm.password_input_type = "text") :
        (vm.password_input_type = "password");
    };
    vm.toggleConfirmShowpassword = () => {
      vm.hide_confirm_pass = !vm.hide_confirm_pass;
      vm.hide_confirm_pass === true ?
        (vm.confirm_password_input_type = "text") :
        (vm.confirm_password_input_type = "password");

    }
    vm.togglePasswResetShowpassword = () => {
      vm.hide_reset_pass = !vm.hide_reset_pass;
      vm.hide_reset_pass === true ?
        (vm.reset_password_input_type = "text") :
        (vm.reset_password_input_type = "password");

    }


    vm.resetnewFormPassword = () => {

      try {

        const payload = {
          ...$scope.resetnewFormPasswordFromMail,
          confirmpassword: vm.resetnewFormPasswordRecovery.confirmpassword,
          new_password: vm.resetnewFormPasswordRecovery.new_password
        };
        vm.isProcessing = true;
        LoginService.API.UpdateUnblockPassword(payload)
          .then(response => {
            vm.isProcessing = false;
            if (response.status === 200) {
              vm.reset_error = false;
              vm.reset_success = false;
              vm.reset_new_password_error = false;
              vm.reset_new_password_success = true;
              vm.reset_new_password_message =
                "Your password is reset,We've sent new password to your registered email address.";
              vm.recovery = "";

              setTimeout(() => {
                $scope.$state.go("login");
                vm.isVisibleSecondForgotPasswordPanel = false;
                vm.isVisibleForgotPasswordPanel = false;
              }, 2000)
            } else {
              vm.reset_error = false;
              vm.reset_success = false;
              vm.reset_new_password_error = true;
              vm.reset_new_password_success = false;

              vm.reset_new_password_message = response.data.message;
            }
          })
          .catch(error => {
            vm.isProcessing = false;
            vm.recovery = "";
            vm.reset_error = true;
            vm.reset_success = false;
            vm.reset_message = "No matching profile existing in system";
            angular.element("#forgot_username").focus();
          });
      } catch (error) {
        logger.error(error);
      }

    }



    vm.showLoginPanel = (form) => {
      vm.recovery = {};
      vm.isVisibleSecondForgotPasswordPanel = false;
      vm.isVisibleForgotPasswordPanel = false;
      vm.hide_confirm_pass = false;
      vm.hide_show_password = false;
      vm.confirm_password_input_type='password'
      vm.password_input_type='password'
      form.$setUntouched();
      form.$setPristine();
      (document.getElementById("resetForm")).reset();
      vm.user = {};
      vm.recovery["recovery_email"] = null;
      vm.login_error = false;
      $timeout(() => {
        angular.element("#username").focus();
      }, 500);
    };

    $scope.checkPasswordMatch = function () {
      vm.passwordMismatch = (vm.recovery.newPassword !== vm.recovery.confirmPassword);
  };



    vm.showForgotPasswordPanel = (form) => {
      form.$setPristine();
      form.$setUntouched();
      vm.isVisibleSecondForgotPasswordPanel = true;
      vm.isVisibleForgotPasswordPanel = true;
      vm.user = {};
      vm.recovery = {};
      vm.reset_error = false;
      vm.reset_success = false;
      $timeout(() => {
        angular.element("#forgot_username").focus();
      }, 500);
    };

    vm.autoLogin = () => {
      if (CookieMemory.API.Get("user") !== undefined) {
        let user_c = JSON.parse(CookieMemory.API.Get("user"));
        vm.user = user_c;
      }
      getVendors();
      getCollections();
      getHierarchyValus();
      getEntityDetails();
    };

    vm.focusLoginField = () => {
      $timeout(() => {
        angular.element("#username").focus();
      }, 500);
    }

    //footer
    $scope.toggleVersionMenu = () => {
      $("#releaseVersionModal").modal("show");
    }

    vm.findByCopyright = () => {
      EntityService.API.FindByCopyrightNoAuth()
        .then(response => {
           $scope.copyrightDetails = response.filter(x => x.module_id == Module.id)[0];
        })
        .catch(error => {
          logger.error(error);
        });
    };
    function activatefooter() {
      vm.findByCopyright();
    }
    activatefooter();
  }
})();
