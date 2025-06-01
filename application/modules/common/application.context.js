(function () {
  "use strict";
  angular.module("calculus.application", ["ngCookies"]);
  angular.module("calculus.application").factory("LocalMemory", LocalMemory);
  angular
    .module("calculus.application")
    .factory("SessionMemory", SessionMemory);
  angular.module("calculus.application").factory("CookieMemory", CookieMemory);
  angular.module("calculus.application").filter("FormatDate", FormatDate);
  angular.module("calculus.application").filter("FormatTime", FormatTime);
  angular
    .module("calculus.application")
    .filter("GetUserNameById", GetUserNameById);
  angular
    .module("calculus.application")
    .filter("DecimalPrecision", DecimalPrecision);
  angular
    .module("calculus.application")
    .filter("PrefixWithZeros", PrefixWithZeros);
  angular
    .module("calculus.application")
    .filter("FormatImageIcon", FormatImageIcon);
  angular
    .module("calculus.application")
    .factory("EntityDetails", EntityDetails);
  angular
    .module("calculus.application")
    .factory("ApplicationDetails", ApplicationDetails);
  angular
    .module("calculus.application")
    .factory("StatusService", StatusService);
  angular
    .module("calculus.application")
    .filter("MemoryConverterFilter", MemoryConverterFilter);
  angular
    .module("calculus.application")
    .controller("TimeController", TimeController);

  LocalMemory.$inject = ["Logger"];
  CookieMemory.$inject = ["$cookies", "Logger"];
  SessionMemory.$inject = ["$window", "Logger"];
  EntityDetails.$inject = [
    "Logger",
    "application_configuration",
    "EntityService",
    "LocalMemory",
    "$http",
    "valdr"
  ];
  ApplicationDetails.$inject = [
    "Logger",
    "application_configuration",
    "$http",
    "SessionMemory"
  ];
  StatusService.$inject = [
    "$http",
    "application_configuration",
    "EntityDetails",
    "$window",
    "$q",
    "identifiers"
  ];
  FormatDate.$inject = ["SessionMemory", "Logger"];
  FormatTime.$inject = ["SessionMemory", "Logger"];
  GetUserNameById.$inject = ["SessionMemory"];
  DecimalPrecision.$inject = ["$filter", "SessionMemory"];
  PrefixWithZeros.$inject = ["$filter", "SessionMemory", "Logger"];
  FormatImageIcon.$inject = ["EntityDetails", "Logger"];
  MemoryConverterFilter.$inject = ["Logger"];
  TimeController.$inject = ["$scope", "$interval"];

  angular
    .module("calculus.application")
    .directive("currency", function ($filter) {
      return {
        restrict: "A", // Only usable as an attribute of another HTML element
        require: "?ngModel",
        scope: {
          decimals: "@",
          decimalPoint: "@"
        },
        link: function (scope, element, attr, ngModel) {
          var decimalCount = parseInt(scope.decimals) || 3;
          var decimalPoint = scope.decimalPoint || ".";

          // Run when the model is first rendered and when the model is changed from code
          ngModel.$render = function () {
            if (ngModel.$modelValue != null && ngModel.$modelValue >= 0) {
              if (typeof decimalCount === "number") {
                element.val(
                  ngModel.$modelValue
                    .toFixed(decimalCount)
                    .toString()
                    .replace(".", ".")
                );
              } else {
                element.val(ngModel.$modelValue.toString().replace(".", "."));
              }
            }
            if (ngModel.$modelValue === null) {
              element.val(ngModel.$modelValue);
            }
          };

          // Run when the view value changes - after each keypress
          // The returned value is then written to the model
          ngModel.$parsers.unshift(function (newValue) {
            if (typeof decimalCount === "number") {
              var floatValue = parseFloat(newValue.replace(",", "."));
              if (decimalCount === 0) {
                return parseInt(floatValue);
              }
              return parseFloat(floatValue.toFixed(decimalCount));
            }

            return parseFloat(newValue.replace(",", "."));
          });

          // Formats the displayed value when the input field loses focus
          element.on("change", function (e) {
            var floatValue = parseFloat(element.val().replace(",", "."));
            if (!isNaN(floatValue) && typeof decimalCount === "number") {
              if (decimalCount === 0) {
                element.val(parseInt(floatValue));
                element.css("border", "1px solid green");
              } else {
                var strValue = floatValue.toFixed(decimalCount);
                element.val(strValue.replace(".", decimalPoint));
                element.css("border", "1px solid #9bb59b");
                element.css("background", "#ebf5eb");
              }
            } else {
              element.css("border", "1px solid #9bb59b");
              element.css("background", "#ebf5eb");
            }
          });
        }
      };
    });

  function TimeController($scope, $interval) {
    let tick = function () {
      $scope.clock = Date.now();
    };
    $scope.today_date = moment().format("dddd,MMM DD,YYYY");
    tick();
    $interval(tick, 1000);
    $scope.$on("$destroy", function () {
      $interval.cancel();
    });
  }

  function LocalMemory(Logger) {
    let logger = Logger.getInstance("Application.Context.LocalMemory");
    try {
      let API = {};
      API.Post = function (shelf, data) {
        localStorage.setItem(shelf, JSON.stringify(data));
      };

      API.Get = function (shelf) {
        return localStorage.getItem(shelf);
      };

      API.Delete = function (shelf) {
        return localStorage.removeItem(shelf);
      };

      API.Clear = function () {
        localStorage.clear();
      };
      return {
        API
      };
    } catch (error) {
      logger.error("Error while getting user date format. Error {1}", [error]);
    }
  }

  function SessionMemory($window, Logger) {
    try {
      let API = {};
      API.Post = function (shelf, data) {
        $window.sessionStorage.setItem(shelf, data);
      };
      API.Get = function (shelf) {
        return $window.sessionStorage.getItem(shelf);
      };
      API.Clear = function () {
        $window.sessionStorage.clear();
      };
      return {
        API
      };
    } catch (error) {
      logger.error("Error while getting user date format. Error {1}", [error]);
    }
  }

  function CookieMemory($cookies, Logger) {
    try {
      let API = {};
      API.Post = function (name, value) {
        if (typeof value === "object") {
          $cookies.putObject(name, value);
        } else {
          $cookies.put(name, value);
        }
      };
      API.Get = function (name) {
        return $cookies.get(name);
      };
      return {
        API
      };
    } catch (error) {
      logger.error("Error while getting user date format. Error {1}", [error]);
    }
  }

  function EntityDetails(
    Logger,
    application_configuration,
    EntityService,
    LocalMemory,
    $http,
    valdr
  ) {
    let logger = Logger.getInstance("Application.Context.EntityDetails");
    try {
      let details = {
        "0": {
          svg: "./img/sidebar-icons/department.svg"
        },
        "1": {
          uuid: "1",
          svg: "./img/sidebar-icons/entity-config-location.svg",
          name: "Location",
          serviceName: "locationService",
          baseurl: "api/location",
          countURL: "/count",
          masterField: "name",
          modelName: "location_master",
          tableName: "location_master",
          modelURL: "/model",
          next_status: true
        },
        "2": {
          uuid: 2,
          svg: "./img/sidebar-icons/entity-config-vendor.svg",
          name: "Vendor Parameter",
          serviceName: "vendorService",
          baseurl: "api/vendor/parameter",
          masterField: "id",
          modelURL: "/model",
          modelName: "vendor_parameter"
        },
        "3": {
          uuid: 3,
          svg: "./img/sidebar-icons/entity-config-vendor.svg",
          name: "Vendor Type",
          serviceName: "vendorService",
          baseurl: "api/vendor/type",
          masterField: "short_description",
          microServiceName: "vendor",
          tableName: "vendor_type_table",
          modelURL: "/model",
          modelName: "vendor_type"
        },
        "4": {
          uuid: 4,
          svg: "./img/sidebar-icons/entity-config-item.svg",
          name: "Item",
          serviceName: "itemAndRetailService",
          baseurl: "api/item",
          countURL: "/count",
          masterField: "description",
          microServiceName: "itemAndRetail",
          modelURL: "/model",
          modelName: "item_master",
          next_status: true
        },
        "5": {
          uuid: 5,
          svg: "./img/sidebar-icons/submenu_country.svg",
          name: "Country",
          serviceName: "entityService",
          baseurl: "api/country",
          masterField: "name",
          modelName: "country",
          modelURL: "/model",
          tableName: "country_table"
        },
        "6": {
          uuid: 6,
          svg: "./img/sidebar-icons/submenu_company.svg",
          name: "Company",
          serviceName: "entityService",
          baseurl: "api/company",
          countURL: "/count",
          masterField: "name",
          modelURL: "/model",
          tableName: "company_table",
          modelName: "company"
        },
        "7": {
          uuid: 7,
          svg: "./img/sidebar-icons/entity-config-location.svg",
          name: "Location Type",
          serviceName: "locationService",
          baseurl: "api/location/type",
          masterField: "short_description",
          microServiceName: "location",
          tableName: "location_type_table",
          modelURL: "/model",
          modelName: "location_type"
        },
        "9": {
          uuid: 9,
          svg: "./img/sidebar-icons/entity-config-vendor.svg",
          name: "Vendor",
          serviceName: "vendorService",
          baseurl: "api/vendor",
          countURL: "/count",
          masterField: "name",
          microServiceName: "vendor",
          statusURL: "/status",
          tableName: "vendor_master",
          modelURL: "/model",
          modelName: "vendor_master",
          next_status: true
        },
        "11": {
          uuid: 11,
          svg: "./img/sidebar-icons/entity-config-location.svg",
          serviceName: "locationService",
          baseurl: "api/location/udd",
          masterField: "maintenance_description",
          name: "Location Type User Defined Data",
          tableName: "type_udd_table",
          modelURL: "/model",
          modelName: "location_master_user_defined_data"
        },
        "12": {
          uuid: 12,
          svg: "./img/sidebar-icons/entity-config-item.svg",
          name: "SKU Setting",
          serviceName: "itemAndRetailService",
          baseurl: "api/item/parameter",
          masterField: "id"
        },
        "13": {
          svg: "./img/sidebar-icons/entity-config-item.svg",
          name: "item_type_price_classification",
          serviceName: "itemAndRetailService",
          baseurl: "api/item/pricegroup",
          masterField: "id"
        },
        "15": {
          uuid: 15,
          svg: "./img/sidebar-icons/submenu_vendor_purchase.svg",
          name: "Vendor Term",
          serviceName: "vendorService",
          baseurl: "api/vendor/purchaseterms",
          masterField: "description",
          tableName: "vendor_terms_table",
          modelName: "vendor_purchase_terms",
          modelURL: "/model"
        },
        "17": {
          uuid: 17,
          svg: "./img/sidebar-icons/submenu_contact.svg",
          name: "Contact",
          serviceName: "entityService",
          baseurl: "api/contact",
          countURL: "/count",
          masterField: "information",
          tableName: "contacts_table",
          modelName: "contact",
          modelURL: "/model"
        },
        "19": {
          uuid: 19,
          svg: "./img/sidebar-icons/entity-config-location.svg",
          serviceName: "locationService",
          baseurl: "api/location/parameter",
          masterField: "id",
          name: "Location Parameter",
          modelURL: "/model",
          modelName: "location_parameter"
        },
        "20": {
          uuid: 20,
          svg: "./img/sidebar-icons/package.svg",
          name: "Attribute Value",
          serviceName: "uddService",
          microServiceName: "udd",
          baseurl: "api/attribute/properties",
          masterField: "description",
          tableName: "attributeProp_table",
          modelURL: "/model",
          modelName: "attribute_properties"
        },
        "21": {
          uuid: 21,
          svg: "./img/sidebar-icons/package.svg",
          name: "Attribute",
          serviceName: "uddService",
          microServiceName: "udd",
          baseurl: "api/attributes",
          masterField: "description",
          statusURL: "/status",
          countURL: "/count",
          tableName: "attributes_table",
          modelURL: "/model",
          modelName: "attribute"
        },
        "22": {
          uuid: 22,
          svg: "./img/sidebar-icons/entity-config-vendor.svg",
          serviceName: "vendorService",
          baseurl: "api/vendor/udd",
          masterField: "maintenance_description",
          name: "Vendor Type User Defined Data",
          tableName: "type_udd_table",
          modelURL: "/model",
          modelName: "vendor_master_user_defined_data"
        },
        "23": {
          uuid: 23,
          svg: "./img/sidebar-icons/inr-users.svg",
          name: "Associate",
          serviceName: "entityService",
          baseurl: "api/company/associate",
          masterField: "individual",
          tableName: "companyassoc_table",
          modelName: "company_associate",
          modelURL: "/model"
        },
        "24": {
          uuid: 24,
          svg: "./img/sidebar-icons/department.svg",
          name: "Department",
          serviceName: "entityService",
          countURL: "/count",
          baseurl: "api/company/department",
          masterField: "name",
          tableName: "companydept_table",
          modelName: "company_department",
          modelURL: "/model"
        },
        "26": {
          uuid: 26,
          svg: "./img/sidebar-icons/hierarchy-levels.svg",
          name: "Hierarchy Value",
          serviceName: "uddService",
          baseurl: "api/hierarchy/properties",
          masterField: "short_description",
          statusURL: "/status",
          countURL: "/count",
          tableName: "companydept_table",
          modelURL: "/model",
          modelName: "hierarchyProperties",
          microServiceName: "udd"
        },
        "27": {
          uuid: 27,
          svg: "./img/sidebar-icons/hierarchy-levels.svg",
          name: "Hierarchy",
          serviceName: "uddService",
          baseurl: "api/hierarchies",
          countURL: "/count",
          masterField: "description",
          statusURL: "/status",
          tableName: "hierarchy_table",
          modelURL: "/model",
          modelName: "hierarchy",
          microServiceName: "udd"
        },
        "28": {
          uuid: 28,
          svg: "./img/sidebar-icons/submenu_individual.svg",
          name: "Individual",
          serviceName: "entityService",
          baseurl: "api/individual",
          masterField: "name",
          tableName: "individual_table",
          modelName: "individual",
          modelURL: "/model"
        },
        "29": {
          svg: "./img/sidebar-icons/entity-config-item.svg",
          name: "set",
          serviceName: "itemAndRetailService",
          baseurl: "api/item/set",
          masterField: "description",
          next_status: true
        },
        "30": {
          uuid: 30,
          svg: "./img/sidebar-icons/entity-config-item.svg",
          name: "Item Type",
          serviceName: "itemAndRetailService",
          baseurl: "api/item/type",
          masterField: "short_description",
          tableName: "type_table",
          modelURL: "/model",
          modelName: "item_type"
        },
        "32": {
          uuid: 32,
          svg: "./img/sidebar-icons/entity-config-item.svg",
          name: "Item Type User Defined Data",
          serviceName: "itemAndRetailService",
          baseurl: "api/item/udd",
          masterField: "maintenance_description",
          tableName: "type_udd_table",
          modelURL: "/model",
          modelName: "item_master_user_defined_data"
        },
        "19": {
          uuid: 19,
          svg: "./img/sidebar-icons/mto_collections.svg",
          name: "MTO Collection",
          serviceName: "mtoService",
          baseurl: "api/mto/collections",
          masterField: "short_description",
          tableName: "mto_collection_table",
          modelName: "mto_collections",
          modelURL: "/model"
        },
        "34": {
          uuid: 34,
          svg: "./img/sidebar-icons/mto-choice.svg",
          name: "MTO Choice",
          serviceName: "mtoService",
          baseurl: "api/mto/choice",
          masterField: "choice_description",
          tableName: "mto_choice",
          modelName: "mto_choice",
          modelURL: "/model",
          next_status: true
        },
        "35": {
          uuid: 35,
          svg: "./img/sidebar-icons/mto-family.svg",
          name: "MTO Family",
          serviceName: "mtoService",
          baseurl: "api/mto/families",
          masterField: "short_description",
          tableName: "mto_families_table",
          modelName: "mto_families",
          modelURL: "/model"
        },
        "36": {
          uuid: 36,
          svg: "./img/sidebar-icons/entity-config-made-to-order.svg",
          name: "MTO",
          serviceName: "mtoService",
          baseurl: "api/mto",
          masterField: "description",
          countURL: "/count",
          tableName: "mto_master",
          modelName: "mto_header_master",
          modelURL: "/model",
          next_status: true
        },
        "37": {
          uuid: 37,
          svg: "./img/sidebar-icons/entity-config-made-to-order.svg",
          name: "MTO Parameter",
          serviceName: "mtoService",
          baseurl: "api/mto/parameter",
          masterField: "id",
          modelURL: "/model",
          modelName: "mto_parameter"
        },
        "38": {
          uuid: 38,
          svg: "./img/sidebar-icons/mto-price-group.svg",
          name: "MTO Price Group",
          serviceName: "mtoService",
          baseurl: "api/mto/pricegroups",
          masterField: "short_description",
          statusURL: "/status",
          countURL: "/count",
          tableName: "mto_price_group_table",
          modelURL: "/model",
          modelName: "mto_price_groups"
        },
        "39": {
          uuid: 39,
          svg: "./img/sidebar-icons/entity-config-made-to-order.svg",
          name: "MTO Type",
          serviceName: "mtoService",
          baseurl: "api/mto/type",
          masterField: "short_description",
          microServiceName: "mto",
          tableName: "type_table",
          modelURL: "/model",
          modelName: "mto_options_type"
        },
        "41": {
          uuid: 41,
          svg: "./img/sidebar-icons/entity-config-made-to-order.svg",
          name: "MTO Type User Defined Data",
          serviceName: "mtoService",
          baseurl: "api/mto/udd",
          masterField: "maintenance_description",
          tableName: "type_udd_table",
          modelURL: "/model",
          modelName: "mto_options_user_defined_data"
        },
        "42": {
          uuid: 42,
          svg: "./img/sidebar-icons/retail.svg",
          name: "retail_sku",
          serviceName: "itemAndRetailService",
          baseurl: "api/retail",
          masterField: "id",
          modelURL: "/model",
          modelName: "retail_sku_options_master"
        },
        "43": {
          uuid: 43,
          svg: "./img/sidebar-icons/retail.svg",
          name: "Retail MTO SKU",
          serviceName: "itemAndRetailService",
          baseurl: "api/retail/mtosku",
          masterField: "id",
          modelURL: "/model",
          modelName: "retail_mto_sku_options_master"
        },
        "44": {
          uuid: 44,
          svg: "./img/sidebar-icons/sku.svg",
          name: "SKU",
          serviceName: "itemAndRetailService",
          baseurl: "api/sku",
          masterField: "sku",
          modelURL: "/model",
          modelName: "sku_master",
          next_status: true
        },
        "46": {
          uuid: 46,
          svg: "./img/sidebar-icons/skuOption.svg",
          name: "SKU Option",
          serviceName: "itemAndRetailService",
          baseurl: "api/sku/header/new",
          masterField: "name",
          tableName: "sku_header_list",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "sku_option_list_header"
        },
        "49": {
          uuid: 49,
          svg: "./img/sidebar-icons/submenu_entity.svg",
          name: "Entity",
          tableName: "entity_table_dynamic",
          serviceName: "entityService",
          baseurl: "api/entity",
          masterField: "entity",
          modelName: "entity",
          modelURL: "/model"
        },
        "50": {
          uuid: 50,
          svg: "./img/sidebar-icons/submenu_title.svg",
          name: "Job Title",
          serviceName: "entityService",
          baseurl: "api/title",
          masterField: "title",
          modelName: "title",
          modelURL: "/model",
          tableName: "title_table"
        },
        "51": {
          uuid: 51,
          svg: "./img/sidebar-icons/submenu_code.svg",
          name: "Code",
          serviceName: "entityService",
          baseurl: "api/code",
          masterField: "entity",
          modelName: "codes",
          modelURL: "/model",
          tableName: "code_list"
        },
        "58": {
          svg: "./img/sidebar-icons/entity-config-made-to-order.svg",
          name: "mto",
          serviceName: "mtoService",
          baseurl: "api/mto",
          countURL: "/count",
          masterField: "description"
        },
        "86": {
          uuid: 86,
          svg: "./img/sidebar-icons/submenu_entity.svg",
          name: "Entity Details",
          serviceName: "entityService",
          baseurl: "api/entity/details",
          masterField: "id",
          tableName: "entity_details_list",
          modelName: "entity_details",
          modelURL: "/model"
        },
        "88": {
          uuid: "88",
          svg: "./img/sidebar-icons/itemCollection.svg",
          name: "Item Collection",
          serviceName: "itemAndRetailService",
          baseurl: "api/item/collections",
          masterField: "short_description",
          tableName: "item_collections_list",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "item_collections"
        },
        "78": {
          uuid: "78",
          svg: "./img/sidebar-icons/user.svg",
          name: "User",
          serviceName: "apiServer",
          baseurl: "api/user",
          masterField: "username",
          tableName: "user_list",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "user"
        },
        "89": {
          svg: "./img/sidebar-icons/datalake.svg",
          name: "datalake"
        },
        "90": {
          svg: "./img/sidebar-icons/datalake_category.svg",
          name: "datalake"
        },
        "95": {
          uuid: "95",
          name: "Cloudcart",
          serviceName: "cloudCartService",
          statusURL: "/status"
        },
        "101": {
          uuid: "101",
          svg: "./img/sidebar-icons/user.svg",
          name: "Retail Price Type",
          serviceName: "itemAndRetailService",
          baseurl: "api/retail",
          masterField: "name",
          tableName: "rcp_retail_price_type_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "retail_price_type"
        },
        "102": {
          uuid: "102",
          svg: "./img/sidebar-icons/user.svg",
          name: "Promotion",
          serviceName: "itemAndRetailService",
          baseurl: "api/promotion",
          masterField: "name",
          tableName: "promotions_master_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "promotions_master"
        },
        "103": {
          uuid: "103",
          svg: "./img/sidebar-icons/user.svg",
          name: "Promotion Detail",
          serviceName: "itemAndRetailService",
          baseurl: "api/promotion",
          masterField: "name",
          tableName: "promotions_details_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "promotions_details"
        },
        "104": {
          uuid: "104",
          name: "SKU Vendor Purchase",
          serviceName: "itemAndRetailService",
          tableName: "rcp_sku_vendor_purchasing_info_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "sku_vendor_purchase"
        },
        "106": {
          uuid: "106",
          name: "Marketing Campaigns",
          serviceName: "marketingService",
          tableName: "rc_marketing_campaign_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "marketing_campaign"
        },
        "107": {
          uuid: "107",
          name: "Promotions",
          serviceName: "marketingService",
          tableName: "rc_promotions_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "promotion"
        },
        "108": {
          uuid: "108",
          name: "Template",
          serviceName: "templateSkuService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "template_master"
        },
        "109": {
          uuid: "109",
          name: "Template Parameter",
          serviceName: "templateSkuService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "template_parameter"
        },
        "110": {
          uuid: "110",
          name: "Template Package",
          serviceName: "templateSkuService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "template_package"
        },
        "111": {
          uuid: "111",
          name: "Template Option",
          serviceName: "templateSkuService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "template_option"
        },
        "112": {
          uuid: "112",
          name: "Template Parameter Choice",
          serviceName: "templateSkuService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "template_parameter_choice"
        },
        "113": {
          uuid: "113",
          name: "Template Option Choice",
          serviceName: "templateSkuService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "template_option_choice"
        },
        "114": {
          uuid: "114",
          name: "Inventory Type",
          serviceName: "itemAndRetailService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "inventory_type"
        },
        "115": {
          uuid: "115",
          name: "Inventory Method",
          serviceName: "itemAndRetailService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "inventory_method"
        },
        "116": {
          uuid: "116",
          name: "Inventory Quality",
          serviceName: "itemAndRetailService",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "inventory_quality"
        },
        "117": {
          uuid: "117",
          name: "States",
          serviceName: "entityService",
          baseurl: "api/region",
          masterField: "name",
          modelURL: "/model",
          modelName: "region"
        },
        "118": {
          uuid: "118",
          name: "cities",
          serviceName: "entityService",
          baseurl: "api/city",
          masterField: "name",
          modelURL: "/model",
          modelName: "city"
        },
        "119": {
          uuid: "119",
          name: "Quick Access Toolbar",
          serviceName: "itemAndRetailService",
          baseurl: "api/toolbar/template",
          masterField: "name",
          modelURL: "/model",
          modelName: "toolbar_template"
        },
        "120": {
          uuid: "120",
          name: "Order Advisor",
          serviceName: "orderadvisorService",
          baseurl: "/api/order-adviser",
          modelURL: "/model",
          modelName: "order_advisor"
        },
        "121": {
          uuid: "121",
          name: "Order Advisor Type",
          serviceName: "orderadvisorService",
          baseurl: "/api/order-adviser",
          modelURL: "/model",
          modelName: "order_advisor_type"
        },
        "122": {
          uuid: "122",
          name: "Order Advisor Type UDD",
          serviceName: "orderadvisorService",
          baseurl: "/api/order-adviser",
          modelURL: "/model",
          modelName: "order_advisor_type_udd"
        },
        "125": {
          uuid: "125",
          name: "Order Help Text",
          serviceName: "OrderHelpTextService",
          baseurl: "/api/order-adviser",
          modelURL: "/model",
          modelName: "orderhelptext"
        },
        "126": {
          uuid: "126",
          name: "Financing Choice",
          serviceName: "cloudCartService",
          baseurl: "api/financing/choices",
          masterField: "description",
          tableName: "rcp_financing_choices_tbl",
          modelName: "financing_choices",
          modelURL: "/model"
        },
        "127": {
          uuid: "127",
          name: "Pricing Choices",
          serviceName: "cloudCartService",
          baseurl: "/api/pricingchoices",
          masterField: "description",
          tableName: "rcp_financing_choices_tbl",
          modelURL: "/model",
          modelName: "pricing_choice"
        },
        "128": {
          uuid: "128",
          name: "Financing Price Adjustment",
          serviceName: "cloudCartService",
          baseurl: "/api/financing/price/adjustment",
          tableName: "rcp_financing_price_adjustment_tbl",
          modelURL: "/model",
          modelName: "financing_price_adjustment"
        },
        "135": {
          uuid: 135,
          svg: "./img/sidebar-icons/entity-config-item.svg",
          name: "Corporate Message",
          serviceName: "itemAndRetailService",
          baseurl: "api/item/type",
          modelURL: "/model",
          modelName: "corporate_control"
        },
        "131": {
          uuid: "131",
          name: "Marketing Campaigns and Promotions",
          serviceName: "marketingService",
          tableName: "rc_marketing_campaign_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "marketing_campaign"
        },
        "133": {
          uuid: 133,
          svg: "./img/sidebar-icons/submenu_vendor_purchase.svg",
          name: "Financing Term",
          serviceName: "entityService",
          baseurl: "api/financing/choices",
          masterField: "term",
          modelName: "entity",
          modelURL: "/model"
        },
        "134": {
          uuid: 134,
          svg: "./img/sidebar-icons/submenu_vendor_purchase.svg",
          name: "Financing Payment Factor",
          serviceName: "entityService",
          baseurl: "api/financing/choices",
          masterField: "description",
          modelName: "entity",
          modelURL: "/model"
        },
        "137": {
          uuid: "137",
          name: "Invoice Terms and Conditions",
          serviceName: "invoicetermsandconditionsService",
          tableName: "rc_marketing_campaign_tbl",
          statusURL: "/status",
          countURL: "/count",
          modelURL: "/model",
          modelName: "marketing_campaign"
        }
      };

      let getAllEntities = function () {
        return new Promise((resolve, reject) => {
          if (!LocalMemory.API.Get("entity_details")) {
            EntityService.API.GetAllEntities()
              .then(response => {
                LocalMemory.API.Post("entity_details", details);
                LocalMemory.API.Post("entity_data", response);
                resolve({
                  details: details,
                  data: response
                });
              })
              .catch(error => {
                resolve({
                  details: details,
                  data: []
                });
              });
          } else {
            resolve({
              details: LocalMemory.API.Get("entity_details"),
              data: LocalMemory.API.Get("entity_data")
            });
          }
        });
      };

      let getEntityStatusURL = function (uuid) {
        if (details[uuid] !== undefined) {
          if (
            details[uuid].statusURL !== undefined &&
            details[uuid].baseurl !== undefined
          ) {
            return (
              application_configuration[details[uuid].serviceName].url +
              "/" +
              details[uuid].baseurl +
              details[uuid].statusURL
            );
          } else {
            return new Error("invalid uuid");
          }
        } else {
          return new Error("invalid uuid");
        }
      };
      let getEntityCountURL = function (uuid) {
        if (details[uuid] !== undefined) {
          if (
            details[uuid].countURL !== undefined &&
            details[uuid].baseurl !== undefined
          ) {
            return (
              application_configuration[details[uuid].serviceName].url +
              "/" +
              details[uuid].baseurl +
              details[uuid].countURL
            );
          } else {
            return new Error("invalid uuid");
          }
        } else {
          return new Error("invalid uuid");
        }
      };
      let getModelURL = function (uuid) {
        if (details[uuid] !== undefined) {
          if (
            details[uuid].modelURL !== undefined &&
            details[uuid].modelName !== undefined
          ) {
            return (
              application_configuration[details[uuid].serviceName].url +
              details[uuid].modelURL +
              "/" +
              details[uuid].modelName
            );
          } else {
            return new Error("invalid uuid");
          }
        } else {
          return new Error("invalid uuid");
        }
      };
      let getStatus = function (uuid) {
        try {
          let statusURL = getEntityStatusURL(uuid);
          return $http
            .get(statusURL, {
              cache: true
            })
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              logger.error(error);
            });
        } catch (error) {
          return new Promise((resolve, reject) => {
            let error_object = {
              message: "invalid uuid " + uuid,
              error: error
            };
            reject(error_object);
          });
        }
      };
      let getHistoryUrl = function (uuid, instance_id) {
        if (details[uuid].serviceName !== undefined) {
          return (
            application_configuration[details[uuid].serviceName].url +
            "/api/history/uuid/" +
            uuid +
            "/instance/" +
            instance_id
          );
        } else {
          return new Error("invalid uuid");
        }
      };

      let API = {};
      API.GetAllEntities = getAllEntities;
      API.Details = details;
      API.GetHistoryData = function (uuid, instance_id) {
        try {
          let base_url = getHistoryUrl(uuid, instance_id);
          return $http
            .get(base_url)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              logger.error(error);
            });
        } catch (error) {
          return new Promise((resolve, reject) => {
            let error_object = {
              message: "invalid uuid " + uuid,
              error: error
            };
            reject(error_object);
          });
        }
      };

      API.GetEntityInformation = function (uuid) {
        return new Promise((resolve, reject) => {
          if (details[uuid] !== undefined) {
            if (!LocalMemory.API.Get("entity_details")) {
              getAllEntities().then(res => {
                resolve(res.details[uuid]);
              });
            } else {
              let data = LocalMemory.API.Get("entity_details");
              resolve(JSON.parse(data)[uuid]);
            }
          } else {
            return new Error("invalid uuid");
          }
        });
      };

      API.GetEntityBaseURL = function (uuid) {
        if (details[uuid] !== undefined) {
          if (
            details[uuid].serviceName !== undefined &&
            details[uuid].baseurl !== undefined
          ) {
            return (
              application_configuration[details[uuid].serviceName].url +
              "/" +
              details[uuid].baseurl
            );
          }
          return new Error("invalid uuid");
        } else {
          return new Error("invalid uuid");
        }
      };
      API.GetEntityGraphURL = function (uuid) {
        if (details[uuid] !== undefined) {
          if (
            details[uuid].serviceName !== undefined &&
            details[uuid].baseurl !== undefined
          ) {
            let url = application_configuration[details[uuid].serviceName].url ? application_configuration[details[uuid].serviceName].url : application_configuration[details[uuid].serviceName];
            return (
              url +
              "/" +
              details[uuid].baseurl +
              "/graph/"
            );
          }
          return new Error("invalid uuid");
        } else {
          return new Error("invalid uuid");
        }
      };
      API.GetEntityMasterField = function (uuid) {
        if (details[uuid] !== undefined) {
          return details[uuid].masterField;
        } else {
          return new Error("invalid uuid");
        }
      };
      API.GetDataSet = function (uuid) {
        try {
          let base_url = getEntityBaseURL(uuid);
          return $http
            .get(base_url)
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              logger.error(error);
            });
        } catch (error) {
          return new Promise((resolve, reject) => {
            let error_object = {
              message: "invalid uuid " + uuid,
              error: error
            };
            reject(error_object);
          });
        }
      };
      API.GetGraphSet = function (
        uuid,
        columns,
        conditionField,
        conditionValue
      ) {
        try {
          let base_url = API.GetEntityGraphURL(uuid);
          return $http
            .get(base_url, {
              params: {
                column: columns,
                condition_field: conditionField,
                condition_value: conditionValue
              }
            })
            .then(function (response) {
              return response.data;
            })
            .catch(function (error) {
              logger.error(error);
            });
        } catch (error) {
          return new Promise((resolve, reject) => {
            let error_object = {
              message: "invalid uuid " + uuid,
              error: error
            };
            reject(error_object);
          });
        }
      };
      API.GetIcon = function (uuid) {
        if (details[uuid] !== undefined) {
          if (details[uuid].svg !== undefined) {
            return details[uuid].svg;
          } else {
            return details["0"].svg;
          }
        } else {
          return details["0"].svg;
        }
      };

      API.GetEntityCount = function (uuid, cacheValue) {
        let isCache = undefined;
        if (cacheValue !== undefined && cacheValue !== null) {
          isCache = cacheValue;
        }
        try {
          let countURL = getEntityCountURL(uuid);
          return $http
            .get(countURL, {
              cache: isCache
            })
            .then(function (response) {
              return {
                uuid: uuid,
                data: response.data
              };
            })
            .catch(function (error) {
              logger.error(error);
            });
        } catch (error) {
          return new Promise((resolve, reject) => {
            let error_object = {
              message: "invalid uuid " + uuid,
              error: error,
              uuid: uuid
            };
            reject(error_object);
          });
        }
      };

      API.GetModel = function (uuid) {
        try {
          let modelURL = getModelURL(uuid);
          return $http
            .get(modelURL, {
              cache: true
            })
            .then(function (response) {
              return {
                uuid: uuid,
                data: response.data
              };
            })
            .catch(function (error) {
              logger.error(error);
            });
        } catch (error) {
          return new Promise((resolve, reject) => {
            let error_object = {
              message: "invalid uuid " + uuid,
              error: error,
              uuid: uuid
            };
            reject(error_object);
          });
        }
      };

      API.SearchEntityByValue = function (uuid, value) {
        if (details[uuid] !== undefined) {
          if (
            details[uuid].serviceName !== undefined &&
            details[uuid].baseurl !== undefined
          ) {
            return $http
              .get(
                application_configuration[details[uuid].serviceName].url +
                "/" +
                details[uuid].baseurl +
                "/search/" +
                details[uuid].masterField +
                "-" +
                value
              )
              .then(response => {
                return response.data;
              });
          } else {
            return new Error("invalid uuid");
          }
        } else {
          return new Error("invalid uuid");
        }
      };

      API.GetModelAndSetValidationRules = function (uuid) {
        try {
          let modelURL = getModelURL(uuid);
          return $http
            .get(modelURL, {
              cache: true
            })
            .then(function (response) {
              var model = response.data.model;
              var updateConstraints = {};
              _.map(model, function (value, key) {
                if (value.rules !== undefined && value.rules !== null) {
                  if (value.rules.create_validation_rules !== undefined) {
                    var rule = value.rules.create_validation_rules.split("|");
                    for (var i = 0; i < rule.length; i++) {
                      var index = i;
                      var r = rule[i];
                      if (index == 0) {
                        updateConstraints[key] = {};
                      }
                      if (r == "required") {
                        updateConstraints[key][r] = {
                          message: "The " + model[key]["title"] + " is required !"
                        };
                      } else if (r == "string") {
                        updateConstraints[key]["string"] = {
                          message: "" + model[key]["title"] + " must be a valid string"
                        };
                      } else if (r == "as400string") {
                        updateConstraints[key]["as400string"] = {
                          message: "" + model[key]["title"] + " must be a valid string"
                        };
                      } else if (r.indexOf(":") !== -1) {
                        var nrule = r.split(":");
                        if (nrule[0] == "min" || nrule[0] == "minimum") {
                          nrule[0] = "min";
                        } else if (nrule[0] == "max" || nrule[0] == "maximum") {
                          nrule[0] = "max";
                        }
                        if (updateConstraints[key]["size"] == undefined) {
                          updateConstraints[key]["size"] = {};
                          updateConstraints[key]["size"][nrule[0]] = parseInt(
                            nrule[1]
                          );
                          updateConstraints[key]["size"]["message"] =
                            "Length ( " + r;
                          if (
                            !nrule.includes("min") ||
                            !nrule.includes("max")
                          ) {
                            updateConstraints[key]["size"]["message"] += " )";
                          }
                        } else {
                          updateConstraints[key]["size"][
                            "message"
                          ] = updateConstraints[key]["size"][
                            "message"
                          ].endsWith(")") ?
                              updateConstraints[key]["size"][
                                "message"
                              ].substring(
                                0,
                                updateConstraints[key]["size"]["message"]
                                  .length - 1
                              ) :
                              updateConstraints[key]["size"]["message"];
                          updateConstraints[key]["size"][nrule[0]] = parseInt(
                            nrule[1]
                          );
                          updateConstraints[key]["size"]["message"] +=
                            " & " + r + ") chars";
                        }
                        if (nrule[0] == "regex") {
                          updateConstraints[key]["pattern"] = {
                            value: nrule[1],
                            message: "" + model[key]["title"] + value.message
                          };
                        }
                      } else if (r == "integer") {
                        updateConstraints[key]["digits"] = {
                          integer: 10,
                          message: model[key]["title"] +
                            " should be integer number upto (10 digits)"
                        };
                      } else if (r == "numeric") {
                        updateConstraints[key]["digits"] = {
                          integer: 10,
                          fraction: 2,
                          message: "" + model[key]["title"] + " should be numeric"
                        };
                      } else if (r == "boolean") {
                        updateConstraints[key]["boolean"] = {
                          message: "" + model[key]["title"] + " should be boolean"
                        };
                      } else if (r == "date" && value.validation == "future") {
                        updateConstraints[key]["nextEffectiveDate"] = {
                          message: "" +
                            model[key]["title"] +
                            " should be current date or future date"
                        };
                      } else if (r == "date" && value.validation == "past") {
                        updateConstraints[key]["effectiveDate"] = {
                          message: "" +
                            model[key]["title"] +
                            " should be current date or past date"
                        };
                      } else if (r == "alpha") {
                        updateConstraints[key]["alpha"] = {
                          message: "" + model[key]["title"] + " should be alphabets"
                        };
                      } else if (r == "alpha_num") {
                        updateConstraints[key]["alpha"] = {
                          message: "" + model[key]["title"] + " should be alphanumeric"
                        };
                      } else if (r == "phone_number") {
                        updateConstraints[key]["phone_number"] = {
                          message: "Invalid phone number (E.g (308)-135-7895 or 308-135-7895 or 308135-7895 or 3081357895)"
                        };
                      } else if (r == "alphaNumericString") {
                        updateConstraints[key]["alphaNumericString"] = {
                          message: "" +
                            model[key]["title"] +
                            " must contain at least one alphabet or number."
                        };
                      }
                    }
                  }
                }
              });
              var obj = {};
              obj["RULES-" + uuid] = updateConstraints;
              valdr.addConstraints(obj);
              return model;
            })
            .catch(function (error) {
              logger.error(error);
            });
        } catch (error) {
          return new Promise((resolve, reject) => {
            let error_object = {
              message: "invalid uuid " + uuid,
              error: error,
              uuid: uuid
            };
            reject(error_object);
          });
        }
      };
      return {
        API
      };
    } catch (error) {
      logger.error("Error while getting entity details", [error]);
    }
  }

  function FormatDate(SessionMemory) {
    try {
      return function (input) {
        let format = SessionMemory.API.Get("user.preference.date.format");
        if (input) {
          let valueAsMoment = input,
            isValid,
            tempDate;
          tempDate = input;
          isValid = moment(valueAsMoment).isValid();
          if (isValid) {
            tempDate = moment(input).format(format);
          }
          return tempDate;
        } else {
          return input;
        }
      };
    } catch (error) {
      logger.error(
        "Error wwhile formatting date. Error {1}. Date Value ={2} format ={3}",
        [error, input, SessionMemory.API.Get("user.preference.date.format")]
      );
    }
  }

  function FormatTime(SessionMemory) {
    try {
      return function (input) {
        if (input) {
          return moment(input).format(
            SessionMemory.API.Get("user.preference.time.format")
          );
        } else {
          return input;
        }
      };
    } catch (error) {
      logger.error(
        "Error while formatting time. Error {1}. Time Value ={2} format ={3}",
        [error, input, SessionMemory.API.Get("user.preference.time.format")]
      );
    }
  }

  function GetUserNameById(SessionMemory) {
    try {
      return function (userid) {
        let users = JSON.parse(SessionMemory.API.Get("users"));
        if (userid) {
          for (let i = 0; i < users.length; i++) {
            if (userid == users[i].id) {
              return users[i].name;
              break;
            }
          }
        } else {
          return input;
        }
      };
    } catch (error) {
      logger.error(
        "Error wwhile formatting date. Error {1}. Date Value ={2} format ={3}",
        [error, input, SessionMemory.API.Get("user.preference.date.format")]
      );
    }
  }

  function DecimalPrecision($filter, SessionMemory) {
    try {
      return function (input, places) {
        if (input !== "NA") {
          if (!places) {
            let precision = parseInt(
              SessionMemory.API.Get("user.preference.decimal.precision")
            );
            return parseFloat(input).toFixed(precision);
          } else if (places) {
            return parseFloat(input).toFixed(places);
          }
        } else {
          return input;
        }
      };
    } catch (error) {
      logger.error(
        "Error while formatting decimal value. Error {1}. Decimal Value ={2} precision ={3}",
        [
          error,
          input,
          SessionMemory.API.Get("user.preference.decimal.precision")
        ]
      );
    }
  }

  function PrefixWithZeros($filter, SessionMemory, Logger) {
    var logger = Logger.getInstance("Application.Context.PrefixWithZeros");
    try {
      return function (input, prefix) {
        if (input !== "NA") {
          let zeros = "";
          if (!prefix) prefix = 1;
          for (let i = 0; i < Number(prefix); i++) zeros += "0";
          return (input < 10 ? zeros : "") + input;
        } else {
          return input;
        }
      };
    } catch (error) {
      logger.error(
        "Error while formatting decimal value. Error {1}. Decimal Value ={2} prefix ={3}",
        [error, input, 1]
      );
    }
  }

  function FormatImageIcon(EntityDetails, Logger) {
    var logger = Logger.getInstance("Application.Context.FormatImageIcon");
    try {
      return function (input) {
        if (input) {
          return EntityDetails.API.GetIcon(input);
        } else {
          return input;
        }
      };
    } catch (error) {
      logger.error("Error while Formatting Image Icon. Error {1} , {2}, {3}.", [
        error,
        input,
        EntityDetails.API.GetIcon(input)
      ]);
    }
  }

  function MemoryConverterFilter(Logger) {
    var logger = Logger.getInstance(
      "Application.Context.MemoryConverterFilter"
    );
    try {
      return function (bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return "-";
        if (typeof precision === "undefined") precision = 1;
        var units = ["bytes", "kB", "MB", "GB", "TB", "PB"],
          number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (
          (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) +
          " " +
          units[number]
        );
      };
    } catch (error) {
      logger.error("Error while Formatting Bytes. Error {1} , {2}, {3}.", [
        error,
        bytes,
        precision
      ]);
    }
  }

  function ApplicationDetails(
    Logger,
    application_configuration,
    $http,
    SessionMemory
  ) {
    var logger = Logger.getInstance("Application.Context.ApplicationDetails");
    var API = {};
    API.GetProductExplorerURL = getProductExplorerURL;
    return {
      API
    };

    function getProductExplorerURL() {
      var token = SessionMemory.API.Get("user.token");
      var session = SessionMemory.API.Get("user.session");
      var url =
        application_configuration.productExplorerService.applicationUrl +
        "/#/home?hash=" +
        token +
        "&id=" +
        session;
      return url;
    }
  }

  function StatusService(
    $http,
    application_configuration,
    EntityDetails,
    $window,
    $q,
    identifiers
  ) {
    let statusList = {};
    statusList["" + identifiers.entity] = {
      uuid: identifiers.entity,
      name: "entity",
      serviceMap: application_configuration.entityService.url
    };

    statusList["" + identifiers.attribute] = {
      uuid: identifiers.attribute,
      name: "udd",
      serviceMap: application_configuration.uddService.url
    };
    statusList["" + identifiers.hierarchy] = {
      uuid: identifiers.hierarchy,
      name: "udd",
      serviceMap: application_configuration.uddService.url
    };
    statusList["" + identifiers.location] = {
      uuid: identifiers.location,
      name: "location",
      serviceMap: application_configuration.locationService.url
    };
    statusList["" + identifiers.vendor] = {
      uuid: identifiers.vendor,
      name: "vendor",
      serviceMap: application_configuration.vendorService.url
    };
    statusList["" + identifiers.mto_option] = {
      uuid: identifiers.mto_option,
      name: "mto",
      serviceMap: application_configuration.mtoService.url
    };
    statusList["" + identifiers.item] = {
      uuid: identifiers.item,
      name: "item",
      serviceMap: application_configuration.itemAndRetailService.url
    };
    statusList["" + identifiers.cloud_cart] = {
      uuid: identifiers.cloud_cart,
      name: "cloudcart",
      serviceMap: application_configuration.cloudCartService.url
    };

    let getStatusList = function (uuid) {
      let deferred = $q.defer();
      $http
        .get(
          statusList[uuid]["serviceMap"] +
          "/api/" +
          statusList[uuid]["name"] +
          "/status"
        )
        .success((data, status) => {
          if (status === 200) {
            localStorage.removeItem(uuid + "_statuses");
            localStorage.setItem(uuid + "_statuses", JSON.stringify(data));
          }
          deferred.resolve(data);
        })
        .error(function (error) { });
      return deferred.promise;
    };

    let getNextStatusList = function (uuid) {
      let deferred = $q.defer();
      $http
        .get(
          statusList[uuid]["serviceMap"] +
          "/api/" +
          statusList[uuid]["name"] +
          "/nextstatus"
        )
        .success((data, status) => {
          if (status === 200) {
            localStorage.removeItem(uuid + "next_statuses");
            localStorage.setItem(uuid + "next_statuses", JSON.stringify(data));
          }
          deferred.resolve(data);
        })
        .error(function (error) { });
      return deferred.promise;
    };

    let initializeStatues = function (uuid, serviceName) {
      let promises = [];
      _.each(statusList, function (statusItem) {
        promises.push(getStatusList(statusItem.uuid));
        if (EntityDetails.API.Details[statusItem.uuid]["next_statuses"]) {
          promises.push(getNextStatusList(statusItem.uuid));
        }
      });
      Promise.all(promises)
        .then(function (results) { })
        .catch(function (err) { });
    };
    return {
      initializeStatuses: initializeStatues,
      getStatusList: getStatusList,
      getNextStatusList: getNextStatusList
    };
  }
})();
