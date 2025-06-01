calculus.config(function(
  $stateProvider,
  $urlRouterProvider,
  $locationProvider
) {
  $urlRouterProvider.otherwise("/login");
  /*Not found error*/

  $stateProvider.state("serverdown", {
    url: "/serverdown",
    templateUrl: "serverdown.html"
  });

  $stateProvider.state("login", {
    url: "/login",
    templateUrl: "application/modules/login/login.html"
  });

  $stateProvider.state("common", {
    url: "/prime",
    views: {
      "": {
        templateUrl: "views/common.html"
      },
      "admin@common": {
        templateUrl: "application/modules/workbench/admin.workbench.html"
      },
      "business@common": {
        templateUrl: "application/modules/workbench/business.workbench.html"
      }
    },
    resolve: {
      access: [
        "Access",
        function(Access) {
          return Access.isAuthenticated();
        }
      ]
    }
  });

  /**
   * Application Preferences
   */
  var app_preference = {
    name: "preferences",
    url: "/applpreferences",
    views: {
      "": {
        templateUrl: "views/common.html"
      }
    },
    data: {
      displayName: false
    },
    resolve: {
      access: [
        "Access",
        function(Access) {
          return Access.isAuthenticated();
        }
      ]
    }
  };
  $stateProvider.state(app_preference);

  /*Preference master*/
  var preference_master = {
    name: "preferences.master",
    url: "/master",
    templateUrl: "application/modules/preferences/preferences.html",
    data: {
      displayName: "Preferences"
    },
    resolve: {
      access: [
        "Access",
        function(Access) {
          return Access.isAuthenticated();
        }
      ]
    }
  };
  $stateProvider.state(preference_master);

  var prime = {
    name: "common.prime",
    templateUrl: "application/modules/layout/prime.html"
  };
  $stateProvider.state(prime);

  /*User Profile*/
  var profilepage = {
    name: "pages",
    url: "/pages",
    views: {
      "": {
        templateUrl: "views/common.html"
      },
      "info@pages": {
        templateUrl: "application/templates/infopage.html"
      }
    },
    data: {
      displayName: false
    }
  };
  $stateProvider.state(profilepage);
});

calculus.config([
  "growlProvider",
  function(growlProvider) {
    growlProvider.globalTimeToLive(3000);
    growlProvider.globalPosition("top-right");
  }
]);
