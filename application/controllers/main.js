// =========================================================================
// Base controller for common functions
// =========================================================================

(function () {
  "use strict";
  calculus.controller("MaterialAdminController", MaterialAdminController);
  MaterialAdminController.$inject = [
    "$scope",
    "$location",
    "LoginService",
    "ngDialog",
    "common",
  ];

  function MaterialAdminController(
    $scope,
    $location,
    LoginService,
    ngDialog,
    common
  ) {
    let vm = this;
    let $state = common.$state;
    let SessionMemory = common.SessionMemory;
    let StatusService = common.StatusService;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("MaterialAdminController");
    vm.selected_workbench = JSON.parse(LocalMemory.API.Get("workbench"));
    vm.issideMenuVisible = false;
    vm.isLoadingMetadata = false;
    vm.locationState = $location;

    /* Set workbench by default based on access when user logs in */
    vm.setWorkbench = () => {
      vm.isAllowedAdminWorkbench =
        LocalMemory.API.Get("isAllowedAdminWorkbench") || false; // variable to check user has access to "Admin" workbench
      vm.isAllowedBusinessWorkbench =
        LocalMemory.API.Get("isAllowedBusinessWorkbench") || false; // variable to check user has access to "Business" workbench
      // if user has access to "Admin" workbench then set default as "administrator" workbench
      if (vm.isAllowedAdminWorkbench && !vm.selected_workbench) {
        LocalMemory.API.Post("workbench", "administrator");
        // variable to check currently enabled workbench
        vm.selected_workbench = JSON.parse(LocalMemory.API.Get("workbench"));
        //Variable to set if the buttons in the dashboard has to be enabled or disabled which is accessed in dashboard-main.html
        $scope.enableButton = true;
      } else if (
        !vm.isAllowedAdminWorkbench &&
        !vm.selected_workbench &&
        vm.isAllowedBusinessWorkbench
      ) {
        // if user does not have access to "Admin" workbench then set default as "business" workbench
        LocalMemory.API.Post("workbench", "business");
        // variable to check currently enabled workbench
        vm.selected_workbench = JSON.parse(LocalMemory.API.Get("workbench"));
        //Variable to set if the buttons in the dashboard has to be enabled or disabled which is accessed in dashboard-main.html
        $scope.enableButton = true;
      } else if (
        !vm.isAllowedAdminWorkbench &&
        !vm.isAllowedBusinessWorkbench &&
        !vm.selected_workbench
      ) {
        vm.selected_workbench = undefined;
        //Variable to set if the buttons in the dashboard has to be enabled or disabled which is accessed in dashboard-main.html
        $scope.enableButton = false;
      }
    };

    vm.getDimensionalAttributesList = () => {
      if (!LocalMemory.API.Get("DimensionAttributesMap")) {
        common.EntityDetails.API.GetGraphSet(
          common.Identifiers.attribute,
          ["id", "description", "format", "dimension_class", "dimension_unit"],

          "format_id",
          9
        )
          .then(res => {
            let attributeListMap = {};
            for (let i = 0; i < res.length; i++) {
              if (attributeListMap[res[i].id] === undefined) {
                attributeListMap[res[i].id] = res[i];
              }
            }
            LocalMemory.API.Post("DimensionAttributesMap", attributeListMap);
          })
          .catch(err => logger.error(err));
      }
    };

    /*  function to get workbench access permissions for logged in user */
    vm.getWorkbenchAccessDetailsForUser = () => {
      // Variable to show loading icon while the workbench is loaded
      vm.isProccessing = true;
      LoginService.API.GetWorkbenchPermissionsForUser(
        SessionMemory.API.Get("user.id")
      )
        .then(response => {
          // Variable to show loading icon while the workbench is loaded
          vm.isProccessing = false;
          vm.selected_workbench = undefined; // set variable undefined initially
          for (let i = 0; i < response.length; i++) {
            if (response[i].admin_workbench && response[i].business_workbench) {
              // save to local memory if user has access to "Admin" workbench
              LocalMemory.API.Post(
                "isAllowedAdminWorkbench",
                response[i].admin_workbench
              );
              // save to local memory if user has access to "Business" workbench
              LocalMemory.API.Post(
                "isAllowedBusinessWorkbench",
                response[i].business_workbench
              );
            } else if (response[i].admin_workbench) {
              // save to local memory if user has access to "Admin" workbench
              LocalMemory.API.Post(
                "isAllowedAdminWorkbench",
                response[i].admin_workbench
              );
            } else if (
              response[i].business_workbench &&
              !response[i].admin_workbench
            ) {
              // save to local memory if user has access to "Business" workbench
              LocalMemory.API.Post(
                "isAllowedBusinessWorkbench",
                response[i].business_workbench
              );
            }
          }
          vm.setWorkbench();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Welcome Message
    $scope.child = {};

    vm.program_number = "NA";
    vm.map = {
      center: {
        latitude: 51.508742,
        longitude: -0.12085
      },
      zoom: 8
    };

    // Detact Mobile Browser
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      angular.element("html").addClass("ismobile");
    }

    // By default Sidbars are hidden in boxed layout and in wide layout only the right sidebar is hidden.
    vm.sidebarToggle = {
      left: false,
      right: false
    };

    $scope.toggleSidebar = function () {
      vm.sidebarToggle.left = !vm.sidebarToggle.left;
      vm.sidebarToggle.right = !vm.sidebarToggle.right;
    };

    vm.ShowSideOfSideMenu = function () {
      vm.issideMenuVisible = !vm.issideMenuVisible;
    };

    //Styles for  Side bar
    $scope.styleClassHome = {
      color: "#445c6e"
    };
    $scope.styleClassDataManagement = {
      color: "#445c6e"
    };

    // By default template has a boxed layout
    localStorage.setItem("ma-layout-status", 1);
    vm.layoutSet = function (count) {
      localStorage.setItem("ma-layout-status", count);
      vm.layoutType = localStorage.getItem("ma-layout-status");
    };

    vm.layoutType = localStorage.getItem("ma-layout-status");

    // For Mainmenu Active Class
    vm.$state = $state;

    // fOR expand and minimize side bar
    vm.expandMinimizeSidebar = function () {
      vm.issideMenuVisible = !vm.issideMenuVisible;
    };

    //Close sidebar on click
    vm.sidebarStat = function (event) {
      // vm.issideMenuVisible = !vm.issideMenuVisible;
      if (
        !angular
          .element(event.target)
          .parent()
          .hasClass("active")
      ) {
        vm.sidebarToggle.left = false;
      }
    };

    $scope.openForm = function (name) {
      $state.go(name, {
        create: true
      });
    };

    $scope.loadbargraph = function () {
      var _bars = [].slice.call(document.querySelectorAll(".bar-inner"));
      _bars.map(function (bar, index) {
        setTimeout(function () {
          bar.style.width = bar.dataset.percent;
        }, index * 500);
      });
    };

    vm.showshortcut = function () {
      var shortcutindex = ngDialog.open({
        template: "template/shortcutindex.html"
      });
    };

    vm.goToPage = function (moduleName) {
      $state.go(moduleName);
    };

    /**Meta Data Implementation for all module */
    $scope.showMetaData = function (
      moduleInfo,
      entity_details,
      entity_permissions
    ) {
      entity_details.isLoadingMetadata = true;
      setTimeout(function () {
        angular.element("#stream_id").focus();
      }, 1000)
      $scope.$broadcast("showMetaDataPanel", {
        panel: true,
        moduleInfo: moduleInfo,
        entity_details: entity_details,
        entity_permissions: entity_permissions
      });
    };

    /**  Generic Method for creating Map
     * @param  {} fromArrayModel
     * @param  {} toMapModel
     * @param  {} key
     */
    $scope.createMapWithValueKey = function (
      fromArrayModel,
      toMapModel,
      key,
      valuekey
    ) {
      _.each($scope[fromArrayModel], function (value) {
        $scope[toMapModel][value[key]] = value[valuekey];
      });
    };

    /**
     *  Get statuses for Module
     */
    $scope.getStatuses = function (uuid) {
      $scope.statusMap = {};
      if (localStorage.getItem(uuid + "_statuses") !== null) {
        $scope.statuses = JSON.parse(localStorage.getItem(uuid + "_statuses"));
        $scope.createMapWithValueKey(
          "statuses",
          "statusMap",
          "code",
          "description"
        );
      } else {
        StatusService.getStatusList(uuid).then(data => {
          $scope.statuses = data;
          $scope.createMapWithValueKey(
            "statuses",
            "statusMap",
            "code",
            "description"
          );
        });
      }
    };

    $scope.getNextStatuses = function (uuid) {
      $scope.nextStatusMap = {};
      if (localStorage.getItem(uuid + "next_statuses") !== null) {
        $scope.next_statuses = JSON.parse(
          localStorage.getItem(uuid + "next_statuses")
        );
        $scope.createMapWithValueKey(
          "next_statuses",
          "nextStatusMap",
          "code",
          "description"
        );
      } else {
        StatusService.getNextStatusList(uuid).then(data => {
          $scope.next_statuses = data;
          $scope.createMapWithValueKey(
            "next_statuses",
            "nextStatusMap",
            "code",
            "description"
          );
        });
      }
    };

    $scope.$on("toggleHistory", function (e, args) {
      $scope.showHistory = args.history;
    });
  }
})();

// =========================================================================
// Left Sidebar
// =========================================================================
(() => {
  "use strict";
  calculus.controller("SidebarController", SidebarController);
  SidebarController.$inject = ["$scope", "UserAccessAllPermissionsService"];

  function SidebarController($scope, UserAccessAllPermissionsService) {
    let vm = this;
    vm.showSideSubmenu = false;
  }
})();

(() => {
  "use strict";
  calculus.controller("WorkbenchCtrl", WorkbenchCtrl);
  WorkbenchCtrl.$inject = ["$scope", "$state", "LocalMemory"];

  function WorkbenchCtrl($scope, $state, LocalMemory) {
    let vm = this;
    vm.enableWorkspace = (workbenchName, mactrl) => {
      vm.currentWorkbench = mactrl.selected_workbench;
      LocalMemory.API.Post("workbench", workbenchName);
      mactrl.selected_workbench = JSON.parse(LocalMemory.API.Get("workbench"));
      if (!vm.currentWorkbench || vm.currentWorkbench !== workbenchName) {
        vm.currentWorkbench = workbenchName;
        $state.go("common.dashboard");
      }
    };
  }
})();

// =========================================================================
// Header
// =========================================================================
(function () {
  "use strict";

  calculus.controller("HeaderController", HeaderController);

  HeaderController.$inject = [
    "$scope",
    "$window",
    "UserService",
    "LoginService",
    "ngDialog",
    "ApplicationDetails",
    "common",
    "SessionMemory"
  ];

  function HeaderController(
    $scope,
    $window,
    UserService,
    LoginService,
    ngDialog,
    ApplicationDetails,
    common,
    SessionMemory
  ) {
    let vm = this;
    let $timeout = common.$timeout;
    let $state = common.$state;
    let Notification = common.Notification;
    let LocalMemory = common.LocalMemory;
    $scope.isReply = false;
    $scope.isMsgDial = false;
    $scope.messageResult = [];
    $scope.showVal = false;
    $scope.isDialog = false;
    $scope.showMessanger = false;
    $scope.sessionModuleID = sessionStorage["session.module_id"];

    let cf = [];

    let cleanUpSession = () => {
      SessionMemory.API.Clear();
    };

    vm.closeApp = function () {
      cleanUpSession();
      window.close();
    };

    vm.globalSearch = function () {
      /*
                1. Get user entered search field - for now it is only code
                2. Make the API call and get the result
                3. Make a state.go statement and navigate
              */
      var globalSearchByCodeResult = API.GlobalSearchByCode.query({
        searchCode: vm.globalSearchField
      },
        function () {
          var navigateToResult = globalSearchByCodeResult.data[0];
          // Creating parameters if any
          var parametersArray = navigateToResult.status.split(":");
          $state.go("common.treeview." + navigateToResult.module, {
            action: parametersArray[0],
            id: parseInt(parametersArray[1])
          });
        }
      );
    };

    // Function to focus on the Global search field
    vm.focusGlobalSearchField = () => {
      angular.element("#gobalsuggestion").focus();
    };

    vm.getUserDetails = () => {
      vm.getUserAndSessionCount();
    };

    vm.getCurrentUserSessionCount = () => {
      LoginService.API.GetSessionCount()
        .then(response => {
          vm.sessionCount = response[0].session_count;
          SessionMemory.API.Post("session_count", response[0].session_count);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getUserAndSessionCount = () => {
      vm.username = JSON.parse(SessionMemory.API.Get("user.name"));
      if (SessionMemory.API.Get("session_count") !== null) {
        vm.sessionCount = SessionMemory.API.Get("session_count");
      } else {
        vm.getCurrentUserSessionCount();
      }
    };
  }
})();

(function () {
  "use strict";

  angular.module("calculus").factory("HeaderService", HeaderService);

  HeaderService.$inject = ["$http", "application_configuration"];

  function HeaderService($http, application_configuration) {
    let API = {};
    // API.GetModules = getModules;

    return {
      API
    };
  }
})();

// =========================================================================
// right side notification panel
// =========================================================================
(function () {
  "use strict";

  calculus.controller("MynotificationController", MynotificationController);

  MynotificationController.$inject = ["$scope", "UserService"];

  function MynotificationController($scope, UserService) {
    let vm = this;

    let daysofweek = ["sun", "mon", "tus", "wed", "thu", "fri", "sat"];
    let month = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC"
    ];
    UserService.API.GetUserById()
      .then(data => {
        vm.user_info = data[0];
      })
      .catch(error => {
        $scope.error = "unable to get user details";
      });
  }
})();

// =========================================================================
// Show logged in user message
// =========================================================================
(function () {
  "use strict";

  calculus.controller("showUserMessageCtrl", showUserMessageCtrl);

  showUserMessageCtrl.$inject = ["$scope", "$stateParams", "$timeout"];

  function showUserMessageCtrl($scope, $stateParams, $timeout) {
    var vm = this;
    $scope.usermessageShow = $stateParams.userdetails;
    $scope.username = sessionStorage.name;
    $scope.closealert = function () {
      $scope.usermessage = false;
    };
    $timeout(function () {
      $scope.usermessageShow = false;
      $scope.startFade = true;
    }, 5000);
  }
})();

//=================================================
// Remind password reset
//=================================================
(function () {
  "use strict";

  calculus.controller("RemindResetPassword", RemindResetPassword);

  RemindResetPassword.$inject = ["$scope", "$stateParams", "$timeout"];

  function RemindResetPassword($scope, $stateParams, $timeout) {
    if ($stateParams.resetLogin) {
      $scope.userMessage = "Reset your password below";
    }
    $scope.closeResetAlert = function () {
      $scope.userMessage = "";
      $scope.startFade = true;
    };
    $timeout(function () {
      $scope.userMessage = "";
      $scope.startFade = true;
    }, 5000);
  }
})();

//=================================================
// Profile
//=================================================
(function () {
  "use strict";

  calculus.controller("ProfileController", ProfileController);

  ProfileController.$inject = [
    "growlService",
    "$scope",
    "$rootScope",
    "$window",
    "EntityService",
    "API",
    "viewDataChangeService",
    "common",
    "UserService"
  ];

  function ProfileController(
    growlService,
    $scope,
    $rootScope,
    $window,
    EntityService,
    API,
    viewDataChangeService,
    common,
    UserService
  ) {
    let vm = this;
    let $state = common.$state;
    let $filter = common.$filter;
    let $q = common.$q;
    let Notification = common.Notification;
    let SessionMemory = common.SessionMemory;
    let LocalMemory = common.LocalMemory;

    //These variables are used for update and retiriving profile pictures from factory
    let ProfilePic = API.ProfilePic;
    let AllProfilePics = API.AllProfilePics;
    $scope.pagename = "default page";
    $scope.attributeId = "somevalue";

    $scope.minuteStep = 1;
    $scope.hourStep = 1;
    $scope.showMeridian = true;
    $scope.format = "dd-MMM-yyyy";
    $scope.dateOptions = {
      showWeeks: false,
      startingDay: 0,
      minDate: $filter("date")(new Date(), "fullDate")
    };

    // Get access permission for crud oprations
    $scope.getAccessPermissions = function (uuid) {
      return new Promise((resolve, reject) => {
        let dataObj = {
          user_id: common.SessionMemory.API.Get("user.id"),
          uuid: uuid
        };
        UserService.API.GetAuthorizationPermission(dataObj)
          .then(response => {
            $scope.permissionsMap = {};
            for (let i = 0; i < response.length; i++) {
              if (
                response[i].permission &&
                $scope.permissionsMap[response[i].permission] === undefined
              ) {
                $scope.permissionsMap[response[i].permission] = true;
              }
            }
            resolve($scope.permissionsMap);
          })
          .catch(error => {
            $scope.permissionsMap = {}; // set permission map to empty object
            reject(error);
          });
      });
    };

    $scope.dateTimeNow = function () {
      $scope.date = $filter("date")(new Date(), "fullDate");
    };
    $scope.dateTimeNow();

    $scope.toggleMinDate = function () {
      var minDate = new Date();
      // set to yesterday
      minDate.setDate(minDate.getDate());
      $scope.dateOptions.minDate = $scope.dateOptions.minDate ?
        null :
        $filter("date")(minDate, "fullDate");
    };

    $scope.toggleMinDate();

    $scope.disabled = function (calendarDate, mode) {
      return (
        mode === "day" &&
        (calendarDate.getDay() === 0 || calendarDate.getDay() === 6)
      );
    };

    $scope.$watch(
      "date",
      function (date) {
        // read date value
      },
      true
    );

    $scope.checkAll = function (data, value) {
      for (var i = 0; i < data.length; i++) {
        data[i].check = value;
      }
    };

    function clearErrorMessages(newObj) {
      for (var key in newObj) {
        if (newObj[key + "_error"]) {
          delete newObj[key + "_error"];
        }
      }
    }

    /*some of the keys for shortcuts*/
    $scope.keyShort = {};
    $scope.keyShort["escape"] = "esc";
    $scope.keyShort["save"] = "alt+s";
    $scope.keyShort["create"] = "alt+n";
    $scope.keyShort["fullscreen"] = "f11";
    /*end of shortcut keys*/

    $scope.date_format = SessionMemory.API.Get("user.preference.date.format");

    $scope.ui_date_mask = $scope.date_format ? $scope.date_format.replace(/\w/g, "9") : $scope.date_format;

    $scope.addDaysToDate = function (date, days) {
      var result = new Date(date);
      result.setDate(result.getDate() + Number(days));
      return result;
    }

    $scope.getDateBasedOnFormat = function (date) {
      let tempDate;
      if (date) {
        let valueAsMoment = date;
        let isValid;
        isValid = moment(valueAsMoment).isValid();
        if (isValid) {
          let regex = /^d.*y$/gi;
          if (regex.test($scope.date_format)) {
            tempDate = moment(date).format($scope.date_format);
            return tempDate;
          } else {
            tempDate = moment(date).format($scope.date_format);
          }
        } else {
          tempDate = date;
        }
      } else {
        return tempDate;
      }

      return tempDate;
    };

    $scope.getFormattedDate = function (parm) {
      if (!parm) {
        return "1970-01-01";
      }
      if (parm == "N/A") {
        return parm;
      } else {
        var tempDate = moment(parm, $scope.date_format).format("YYYY-MM-DD");
        return tempDate;
      }
    };

    $scope.lastPageTableRecordDeleteAction = function (setinstance) {
      $scope.setinstance = setinstance;
      if (
        $scope.setinstance.data.length === 1 &&
        $scope.setinstance.page() !== 1
      ) {
        $scope.setinstance.page($scope.setinstance.page() - 1);
      }
    };

    $scope.showHideFollowingArray = function (groupArray) {
      for (var i = 0; i < groupArray.length; i++) {
        groupArray[i].hideRows = !groupArray[i].hideRows;
      }
    };

    $scope.searchresult = {
      term: ""
    };

    $scope.setReturnValue = function (returnValue) {
      $scope.returnValue = returnValue;
    };

    /*
     * Function to get update display sequence information from moveUpDownRows directive and show in UI.
     */
    $scope.getDisplaySequnceUpdateInformation = information => {
      $scope.sequnceUpdateInformation = information;
    };

    /**
     * Select row
     * @param {any} index
     */
    $scope.setClickedRow = function (index) {
      $scope.selectedRow = index;
    };
    $scope.resetTableRow = function (payload) {
      if (payload !== undefined) {
        payload.$edit = false;
        angular.merge(
          payload,
          viewDataChangeService.getOriginalRecord(payload.id)
        );
      }
    };

    $scope.getPrefix = function (module_name) {
      return EntityService.API.GetPrefix(module_name);
    };

    $scope.changeName = function (newName) {
      $scope.pagename = newName;
    };
    $scope.changeLog = function (newLog) {
      $scope.log = newLog;
    };
    $scope.changeMeta = function (newMeta) {
      $scope.meta = newMeta;
    };

    $scope.usernameCompose = $rootScope.receipentUserId;
    $scope.src = "";
    //Code starting for profile picture

    $scope.updateavatar = function () {
      var newimage = $scope.profile_dir_path + "/" + $scope.w;
      var setimage = {
        avatar_url: newimage
      };
      var setProfilePics = ProfilePic.query(function () {
        setProfilePics.avatar_url = newimage;
        setProfilePics.$update();
      });
      swal({
        title: "Updated Successfully",
        type: "success",
        confirmButtonColor: "#F44336"
      },
        function () {
          window.location.reload();
        }
      );
    };

    vm.resetUserData = function () {
      vm.userInfo = angular.copy(vm.old_user_info);
    };

    //Added by Biswa Ranjan Behera-- Mary 10th 2016
    //Code Desc: for adding the color of delete button
    $scope.styleClass = {
      color: "#9A0F05"
    };
    $scope.styleClasseditIcon = {
      color: "#009688"
    };
    $scope.styleClassDataManagement = {
      color: "#009688"
    };

    vm.submit = function (item, message) {
      if (item === "profileSummary") {
        vm.editSummary = 0;
      }

      if (item === "profileInfo") {
        vm.editInfo = 0;
      }

      if (item === "profileContact") {
        vm.editContact = 0;
      }

      growlService.growl(message + " has updated Successfully!", "inverse");
    };

    vm.editSummary = 0;
    vm.editInfo = 0;
    vm.editContact = 0;
  }
})();

// =========================================================================
// Show logged of errored items
// =========================================================================
(function () {
  "use strict";

  calculus.controller("erroredListCtrl", erroredListCtrl);

  erroredListCtrl.$inject = [
    "$scope",
    "$stateParams",
    "ItemService",
    "common",
    "EntityDetails"
  ];

  function erroredListCtrl(
    $scope,
    $stateParams,
    ItemService,
    common,
    EntityDetails
  ) {
    let vm = this;
    vm.common = common;
    vm.uuids = [4, 44];
    vm.erroredList = [];
    vm.hasData = false;
    vm.limit = 20;

    vm.activate = () => {
      vm.page = vm.itempage = vm.skupage = 1;
      for (let i = 0; i < vm.uuids.length; i++) {
        vm.erroredList[vm.uuids[i]] = {};
        vm.isProccessing = true;
        ItemService.API.FetchErroredList(vm.uuids[i], vm.limit, vm.page)
          .then(response => {
            vm.common.EntityDetails.API.GetEntityInformation(vm.uuids[i])
              .then(data => {
                vm.isProccessing = false;
                if (response.data && response.data.data.length > 0) {
                  vm.hasData = true;
                  vm.erroredList[vm.uuids[i]] = {
                    data: response.data.data,
                    uuid: vm.uuids[i],
                    entityName: data.name,
                    count: response.data.error_count
                  };
                }
              })
              .catch(error => {
                vm.isProccessing = false;
              });
          })
          .catch(error => {
            vm.isProccessing = false;
          });
      }
    };

    vm.activate();

    vm.loadMoreItemErrors = uuid => {
      vm.isProccessingMore = true;
      if (uuid === 4) {
        vm.page = vm.itempage = vm.itempage + 1;
      } else {
        vm.page = vm.skupage = vm.skupage + 1;
      }
      ItemService.API.FetchErroredList(4, vm.limit, vm.page)
        .then(response => {
          vm.isProccessingMore = false;
          if (response.data && response.data.data.length > 0) {
            vm.hasData = true;
            for (let i = 0; i < response.data.data.length; i++) {
              vm.erroredList[uuid].data.push(response.data.data[i]);
            }
          }
        })
        .catch(error => {
          vm.isProccessing = false;
        });
    };

    vm.goToUpdate = data => {
      if (data.uuid === 44) {
        EntityDetails.API.GetGraphSet(
          vm.common.Identifiers.sku_master,
          ["id", "description", "sku_type", "sku_sub_type", "item_id"],
          "id",
          data.instance_id
        )
          .then(res => {
            // go to update sku screen for
            vm.common.$state.go("common.prime.itemMaintenance.sku.update", {
              id: res.data[0].id,
              item_id: res.data[0].item_id,
              skutype: res.data[0].sku_type.toLowerCase(),
              subtype: res.data[0].sku_sub_type.toLowerCase()
            });
          })
          .catch(err => logger.error(err));
      } else if (data.uuid === 4) {
        EntityDetails.API.GetGraphSet(
          vm.common.Identifiers.item,
          ["id", "description", "item_sub_type"],
          "id",
          data.instance_id
        )
          .then(res => {
            // go to update item screen
            vm.common.$state
              .go("common.prime.itemMaintenance.update", {
                id: res.data[0].id,
                type: res.data[0].item_sub_type.toLowerCase()
              })
              .then(response => { });
          })
          .catch(err => logger.error(err));
      }
    };
  }
})();
