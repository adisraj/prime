"use strict";
var calculus = angular.module("calculus", [
  "environment",
  "ngAnimate",
  "ngResource",
  "ngSanitize",
  "ui.select",
  "ngCookies",
  "ui.mask",
  "ui.router",
  "ui.bootstrap",
  "oc.lazyLoad",
  "nouislider",
  "ngDialog",
  "ntt.TreeDnD",
  "angular-cache",
  "angular.filter",
  "angularTreeview",
  "angular-growl",
  "queryBuilder",
  "export.csv",
  "google.places",
  "json-tree",
  "ngPrettyJson",
  "valdr",
  "angularUtils.directives.dirPagination",
  "ng-selectize",
  "textAngular",
  "uix-multiselect",
  "Dragtable",
  "common",
  "chart.js",
  "rc.prime.login",
  "rc.prime.dashboard",
  "rc.prime.report",
  "rc.prime.user",
  "rc.prime.title",
  "rc.prime.entity",
  "rc.prime.attributes",
  "rc.prime.attribute.values",
  "rc.prime.country",
  "rc.prime.codes",
  "rc.prime.contactsubtypes",
  "rc.prime.company",
  "rc.prime.company.department",
  "rc.prime.company.associate",
  "rc.prime.contact",
  "rc.prime.hierarchy",
  "rc.prime.hierarchy.value",
  "rc.prime.peexport",
  "rc.prime.individual",
  "rc.prime.location",
  "rc.prime.location.type",
  "rc.prime.location.type.udd",
  "rc.prime.vendor",
  "rc.prime.vendor.term",
  "rc.prime.vendor.financingterms",
  "rc.prime.vendor.pricingterms",
  "rc.prime.vendor.type",
  "rc.prime.vendor.type.udd",
  "rc.prime.item",
  "rc.prime.item.type",
  "rc.prime.item.type.udd",
  "rc.prime.item.pricegroup",
  "rc.prime.item.collection",
  "rc.prime.mto",
  "rc.prime.mto.choice",
  "rc.prime.mto.family",
  "rc.prime.mto.collection",
  "rc.prime.mto.pricegroup",
  "rc.prime.mto.type",
  "rc.prime.mto.type.udd",
  "rc.prime.orderadvisor",
  "rc.prime.orderadvisor.type",
  "rc.prime.orderadvisor.type.packages",
  "rc.prime.orderadvisor.type.udd",
  "rc.prime.orderhelptext",
  "rc.prime.corporatecontrol",
  "rc.prime.financingchoices",
  "rc.prime.financingpriceadjustments",
  "rc.prime.authorisation",
  "rc.prime.import",
  "rc.prime.datalake",
  "rc.prime.tag",
  "rc.prime.template",
  "rc.prime.item.clone",
  "rc.prime.sku",
  "rc.prime.sku.settings",
  "rc.prime.sku.inventory",
  "rc.prime.sku.retail",
  "rc.prime.sku.installation.retail",
  "rc.prime.retail.rounding.rule",
  "rc.prime.mto.clone",
  "rc.prime.offers",
  "rc.prime.benefits",
  "rc.prime.offerrule",
  "rc.prime.tax",
  "rc.prime.templatesku",
  "rc.prime.customer",
  "rc.prime.discount",
  "rc.prime.marketingcampaigns",
  "rc.prime.tickets",
  "rc.search",
  "rc.prime.massmaintenance",
  "rc.prime.retailreport",
  "rc.prime.country.states",
  "rc.prime.country.states.cities",
  "rc.prime.inventorymethods",
  "rc.prime.inventorytypes",
  "rc.prime.inventoryquality",
  "rc.prime.pricingchoices",
  "rc.prime.interface",
  "rc.prime.reactivatesku",
  "rc.prime.upcconfigurations",
  "rc.prime.bulkupdateinterface",
  "angularTrix",
  "tooltips",
  "rc.prime.invoicetermsandconditions",
]);

calculus.factory("timeoutHttpIntercept", function ($rootScope, $q) {
  return {
    request: function (config) {
      config.timeout = 800000;
      return config;
    }
  };
});
calculus.factory("logTimeTaken", [
  function () {
    var logTimeTaken = {
      request: function (config) {
        config.requestTimestamp = new Date().getTime();
        return config;
      },
      response: function (response) {
        response.config.responseTimestamp = new Date().getTime();
        return response;
      }
    };
    return logTimeTaken;
  }
]);
calculus.config([
  "$httpProvider",
  function ($http) {
    //Reset headers to avoid OPTIONS request (aka preflight)
    $http.defaults.withCredentials = false;
    $http.interceptors.push("timeoutHttpIntercept");
    $http.interceptors.push("logTimeTaken");
  }
]);

calculus.config([
  "$compileProvider",
  function ($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
  }
]);

calculus.config([
  "growlProvider",
  function (growlProvider) {
    growlProvider.globalInlineMessages(true);
    growlProvider.globalDisableCountDown(true);
  }
]);

calculus.factory("Access", [
  "$state",
  "LoginService",
  "$location",
  "Module",
  function ($state, LoginService, $location, Module) {
    var Access = {
      OK: 200,
      // "we don't know who you are, so we can't say if you're authorized to access
      // this resource or not yet, please sign in first"
      UNAUTHORIZED: 401,
      // "we know who you are, and your profile does not allow you to access this resource"
      FORBIDDEN: 403,
      isAuthenticated: function () {
        return new Promise(function (resolve, reject) {
          LoginService.API.GetSession()
            .then(res => {
              if (res.data.length > 0) {
                resolve(Access.OK);
              } else if (
                $location.search()["token"] &&
                $location.search()["sessionId"]
              ) {
                SessionMemory.API.Post(
                  "user.session",
                  $location.search()["sessionId"]
                );
                SessionMemory.API.Post(
                  "user.token",
                  $location.search()["token"]
                );
                SessionMemory.API.Post("user.id", res.data[0].user_id);
                let $stateParameters = {};
                $stateParameters["id"] = JSON.stringify(
                  $location.search()["sku_id"]
                );
                $stateParameters["item_id"] = JSON.stringify(
                  $location.search()["item_id"]
                );
                $stateParameters["skutype"] = JSON.stringify(
                  $location.search()["sku_type"]
                );
                $stateParameters["subtype"] = JSON.stringify(
                  $location.search()["sub_type"]
                );
                resolve(Access.OK);
              } else {
                reject(Access.UNAUTHORIZED);
              }
            })
            .catch(error => {
              if (error.status === -1) {
                $state.go("serverdown");
              } else {
                reject(Access.UNAUTHORIZED);
              }
            });
        });
      }
    };

    return Access;
  }
]);

calculus
  .factory("PreviousState", [
    "$rootScope",
    "$state",
    function ($rootScope, $state) {
      var lastHref = "/dashboard",
        lastStateName = "dashboard",
        lastParams = {};

      $rootScope.$on("$stateChangeSuccess", function (
        event,
        toState,
        toParams,
        fromState,
        fromParams
      ) {
        lastStateName = fromState.name;
        lastParams = fromParams;
        lastHref = $state.href(lastStateName, lastParams);
      });

      return {
        getLastHref: function () {
          return lastHref;
        },
        goToLastState: function () {
          return $state.go(lastStateName, lastParams);
        }
      };
    }
  ])
  .run([
    "$rootScope",
    "$state",
    "$stateParams",
    "PreviousState",
    "$transitions",
    "Access",
    function (
      $rootScope,
      $state,
      $stateParams,
      PreviousState,
      $transitions,
      Access
    ) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.PreviousState = PreviousState;
      $transitions.onError({}, function (transition) {
        switch (transition._error.detail) {
          case Access.UNAUTHORIZED:
            $state.go("login");
            break;
          case Access.FORBIDDEN:
            $state.go("forbidden");
            break;
          default:
            break;
        }
      });
    }
  ]);