/********** Setting environment info for angular application */
calculus.config(function (envServiceProvider) {
  // set the domains and variables for each environment
  envServiceProvider.config({
    development: {
      appName: "Retail Calculus",
      appShortName: "RC",
      apiServer: "https://development.api.retailcalculus.com/auth-service",
      authenticationServer: "https://development.api.retailcalculus.com/auth-service",
      cloudCartService: {
        name: "cloudCart",
        url: "https://development.api.retailcalculus.com/cloudcart-service"
      },
      taxService: {
        name: "tax",
        url: "https://development.api.retailcalculus.com/tax-service"
      },
      entityService: {
        name: "entity",
        url: "https://development.api.retailcalculus.com/entity-service"
      },
      uddService: {
        name: "udd",
        url: "https://development.api.retailcalculus.com/udd-service"
      },
      locationService: {
        name: "location",
        url: "https://development.api.retailcalculus.com/location-service"
      },
      vendorService: {
        name: "vendor",
        url: "https://development.api.retailcalculus.com/vendor-service"
      },
      mtoService: {
        name: "mto",
        url: "https://development.api.retailcalculus.com/mto-service"
      },
      itemAndRetailService: {
        name: "itemAndRetail",
        url: "https://development.api.retailcalculus.com/item-service"
      },
      dataLakeService: {
        name: "datalake",
        url: "https://development.api.retailcalculus.com/datalake-service"
      },
      marketingService: {
        name: "marketing",
        url: "https://development.api.retailcalculus.com/marketing-service"
      },
      jobsService: {
        name: "jobs",
        url: "https://development.api.retailcalculus.com/jobs-service"
      },
      changeHistoryService: {
        name: "changehistory",
        url: "https://development.api.retailcalculus.com/:3081"
      },
      statsService: {
        name: "stats",
        url: "https://development.api.retailcalculus.com/:3031"
      },
      tagService: {
        name: "tags",
        url: "https://development.api.retailcalculus.com/:3051"
      },
      offersService: {
        name: "offers",
        url: "https://development.api.retailcalculus.com/:3052"
      },
      orderadvisorService: {
        name: "orderadvisor",
        url: "https://development.api.retailcalculus.com/orderadviser-service"
      },
      templateSkuService: {
        url: "https://development.api.retailcalculus.com/:3002"
      },
      deliveryBookingService: {
        name: "deliveryBooking",
        url: "https://development.api.retailcalculus.com/delivery-booking-service"
      },
      mercuryService: {
        url: 'https://development.api.retailcalculus.com/mercury-service'
      },
      appOrganization: "ndVOR IT solutions",
      socketServer: "https://development.api.retailcalculus.com/auth-service"
    },
    as_uat: {
      appName: "Retail Calculus production",
      appShortName: "RC",
      appVersion: 2.0,
      apiServer: "https://webapi.retailcalculus.com/auth-service",
      authenticationServer: "https://webapi.retailcalculus.com/auth-service",
      cloudCartService: {
        name: "cloudCart",
        url: "https://webapi.retailcalculus.com/cloudcart-service"
      },
      taxService: {
        name: "tax",
        url: "https://webapi.retailcalculus.com/tax-service"
      },
      entityService: {
        name: "entity",
        url: "https://webapi.retailcalculus.com/entity-service"
      },
      uddService: {
        name: "udd",
        url: "https://webapi.retailcalculus.com/udd-service"
      },
      locationService: {
        name: "location",
        url: "https://webapi.retailcalculus.com/location-service"
      },
      vendorService: {
        name: "vendor",
        url: "https://webapi.retailcalculus.com/vendor-service"
      },
      mtoService: {
        name: "mto",
        url: "https://webapi.retailcalculus.com/mto-service"
      },
      itemAndRetailService: {
        name: "itemAndRetail",
        url: "https://webapi.retailcalculus.com/item-service"
      },
      dataLakeService: {
        name: "datalake",
        url: "https://webapi.retailcalculus.com/datalake-service"
      },
      marketingService: {
        name: "marketing",
        url: "https://webapi.retailcalculus.com/marketing-service"
      },
      changeHistoryService: {
        name: "changehistory",
        url: "http://18.220.98.244:8090"
      },
      statsService: {
        name: "stats",
        url: "http://18.220.98.244:8081"
      },
      jobsService: {
        name: "jobs",
        url: "https://webapi.retailcalculus.com/jobs-service"
      },
      tagService: {
        name: "tags",
        url: "http://18.220.98.244:8051"
      },
      offersService: {
        name: "tags",
        url: "http://18.220.98.244:8052"
      },
      productExplorerService: {
        applicationUrl: "http://18.220.98.244:8081"
      },
      templateSkuService: {
        url: "http://18.220.98.244:8002"
      },
      orderadvisorService: {
        name: "orderadvisor",
        url: "https://webapi.retailcalculus.com/orderadviser-service"
      },
      deliveryBookingService: {
        name: "deliveryBooking",
        url: "https://webapi.retailcalculus.com/delivery-service"
      },
      mercuryService: {
        url: "https://webapi.retailcalculus.com/mercury-service"
      },
      appOrganization: "ndVOR IT solutions",
      socketServer: "http://18.220.98.244:8080"
    },
    as_prod: {
      appName: "Retail Calculus production",
      appShortName: "RC",
      appVersion: 2.0,
      apiServer: "https://api.americansale.retailcalculus.com/auth-service",
      authenticationServer: "https://api.americansale.retailcalculus.com/auth-service",
      cloudCartService: {
        name: "cloudCart",
        url: "https://api.americansale.retailcalculus.com/cloudcart-service"
      },
      taxService: {
        name: "tax",
        url: "https://api.americansale.retailcalculus.com/tax-service"
      },
      entityService: {
        name: "entity",
        url: "https://api.americansale.retailcalculus.com/entity-service"
      },
      uddService: {
        name: "udd",
        url: "https://api.americansale.retailcalculus.com/udd-service"
      },
      locationService: {
        name: "location",
        url: "https://api.americansale.retailcalculus.com/location-service"
      },
      vendorService: {
        name: "vendor",
        url: "https://api.americansale.retailcalculus.com/vendor-service"
      },
      mtoService: {
        name: "mto",
        url: "https://api.americansale.retailcalculus.com/mto-service"
      },
      itemAndRetailService: {
        name: "itemAndRetail",
        url: "https://api.americansale.retailcalculus.com/item-service"
      },
      dataLakeService: {
        name: "datalake",
        url: "https://api.americansale.retailcalculus.com/datalake-service"
      },
      marketingService: {
        name: "marketing",
        url: "https://api.americansale.retailcalculus.com/marketing-service"
      },
      changeHistoryService: {
        name: "changehistory",
        url: "https://api.americansale.retailcalculus.com:8090"
      },
      statsService: {
        name: "stats",
        url: "https://api.americansale.retailcalculus.com:8081"
      },
      jobsService: {
        name: "jobs",
        url: "https://api.americansale.retailcalculus.com/jobs-service"
      },
      tagService: {
        name: "tags",
        url: "https://api.americansale.retailcalculus.com:8051"
      },
      offersService: {
        name: "tags",
        url: "https://api.americansale.retailcalculus.com:8052"
      },
      productExplorerService: {
        applicationUrl: "https://api.americansale.retailcalculus.com:8081"
      },
      templateSkuService: {
        url: "https://api.americansale.retailcalculus.com:8002"
      },
      orderadvisorService: {
        name: "orderadvisor",
        url: "https://api.americansale.retailcalculus.com/orderadviser-service"
      },
      deliveryBookingService: {
        name: "deliveryBooking",
        url: "https://api.americansale.retailcalculus.com/delivery-service"
      },
      mercuryService: {
        url: "https://api.americansale.retailcalculus.com/mercury-service"
      },
      appOrganization: "ndVOR IT solutions",
      socketServer: "https://api.americansale.retailcalculus.com:8080"
    },
    rc_uat: {
      appName: "Retail Calculus production",
      appShortName: "RC",
      appVersion: 2.0,
      apiServer: "https://uat.api.retailcalculus.com/auth-service",
      authenticationServer: "https://uat.api.retailcalculus.com/auth-service",
      cloudCartService: {
        name: "cloudCart",
        url: "https://uat.api.retailcalculus.com/cloudcart-service"
      },
      taxService: {
        name: "tax",
        url: "https://uat.api.retailcalculus.com/tax-service"
      },
      entityService: {
        name: "entity",
        url: "https://uat.api.retailcalculus.com/entity-service"
      },
      uddService: {
        name: "udd",
        url: "https://uat.api.retailcalculus.com/udd-service"
      },
      locationService: {
        name: "location",
        url: "https://uat.api.retailcalculus.com/location-service"
      },
      vendorService: {
        name: "vendor",
        url: "https://uat.api.retailcalculus.com/vendor-service"
      },
      mtoService: {
        name: "mto",
        url: "https://uat.api.retailcalculus.com/mto-service"
      },
      itemAndRetailService: {
        name: "itemAndRetail",
        url: "https://uat.api.retailcalculus.com/item-service"
      },
      dataLakeService: {
        name: "datalake",
        url: "https://uat.api.retailcalculus.com/datalake-service"
      },
      marketingService: {
        name: "marketing",
        url: "https://uat.api.retailcalculus.com/marketing-service"
      },
      changeHistoryService: {
        name: "changehistory",
        url: "https://uat.api.retailcalculus.com:8090"
      },
      statsService: {
        name: "stats",
        url: "https://uat.api.retailcalculus.com:8081"
      },
      jobsService: {
        name: "jobs",
        url: "https://uat.api.retailcalculus.com/jobs-service"
      },
      tagService: {
        name: "tags",
        url: "https://uat.api.retailcalculus.com:8051"
      },
      offersService: {
        name: "tags",
        url: "https://uat.api.retailcalculus.com:8052"
      },
      productExplorerService: {
        applicationUrl: "https://uat.api.retailcalculus.com:8081"
      },
      templateSkuService: {
        url: "https://uat.api.retailcalculus.com:8002"
      },
      orderadvisorService: {
        name: "orderadvisor",
        url: "https://uat.api.retailcalculus.com/orderadviser-service"
      },
      deliveryBookingService: {
        name: "deliveryBooking",
        url: "https://uat.api.retailcalculus.com/delivery-service"
      },
      mercuryService: {
        url: "https://uat.api.retailcalculus.com/mercury-service"
      },
      appOrganization: "ndVOR IT solutions",
      socketServer: "https://uat.api.retailcalculus.com:8080"
    }
  }
  );
  // run the environment check, so the comprobation is made
  // before controllers and services are built
  envServiceProvider.check();
  envServiceProvider.set("development"); // You can change to development to uat, demo
});
calculus.service("application_configuration", function (envService) {
  return envService.data[envService.get()];
});
/*********************************************************************************************/

angular.module("calculus").constant("program_number", {
  program_number_list: {
    "activeusers.html": "UA-AC",
    "userprofiles.html": "UA-UP",
    "auth.html": "UA-UP",
    "permissions.html": "UA-PM",
    "roles.html": "UA-RL",
    "entity_details.html": "ED",
    "settings.html": "ST",
    "profile-about.html": "VP",
    "entity.html": "MD-ENT",
    "codelist.html": "MD-COD",
    "status.html": "MD-ST",
    "type.html": "MD-TYP",
    "title.html": "MD-TL",
    "country.html": "MD-COU",
    "company.html": "MD-CMP",
    "contacts.html": "MD-CNT",
    "mto_collections.html": "MD-MTOC",
    "individual.html": "MD-IND",
    "vendor_purchase.html": "MD-VNDP",
    "mto_families.html": "MD-MTOF",
    "attributes.html": "SA-AM",
    "hierarchy.html": "SA-HM",
    "location.html": "EC-LC",
    "vendor_configuration.html": "EC-VN",
    "item_configuration.html": "EC-IT",
    "mto.html": "EC-MTO",
    "home.html": "HM",
    "location_maintenance.html": "EM-LM",
    "mto_maintenance.html": "EM-MTO",
    "vendor_maintenance.html": "EM-VM",
    "item_maintenance.html": "EM-IM"
  }
});

angular.module("calculus").constant("cnstSelectiveHideColumns", {
  selective_hide_columns: {}
});

angular.module("calculus").value("Module", {
  id: 1
});
angular.module("calculus").value("VendorPortalModule", {
  id: 12
});

angular.module("calculus").constant("identifiers", {
  location: 1,
  vendor_parameter: 2,
  vendor_type: 3,
  item: 4,
  country: 5,
  company: 6,
  location_type: 7,
  contact_bridge: 8,
  vendor: 9,
  user_access: 10,
  location_udd: 11,
  item_parameter: 12,
  item_type_price_classification: 13,
  vendor_purchase_terms: 15,
  vendor_bridge: 16,
  contact: 17,
  location_parameter: 19,
  attribute_value: 20,
  attribute: 21,
  vendor_udd: 22,
  company_associate: 23,
  company_department: 24,
  hierarchy_values: 26,
  hierarchy: 27,
  individual: 28,
  set: 29,
  item_type: 30,
  item_bridge: 31,
  item_udd: 32,
  collections: 33,
  mto_choice: 34,
  mto_family: 35,
  mto_option: 36,
  mto_parameter: 37,
  mto_price_group: 38,
  mto_type: 39,
  mto_bridge: 40,
  mto_udd: 41,
  retail_sku: 42,
  retail_mto_sku: 43,
  sku_master: 44,
  sku_detail: 45,
  sku_header: 46,
  system_level: 48,
  entity: 49,
  title: 50,
  code: 51,
  mto: 58,
  address_bridge: 61,
  address: 62,
  users: 78,
  entity_details: 86,
  item_collection: 88,
  cloud_cart: 95,
  retail_price_type: 101,
  template: 108,
  template_parameter: 109,
  template_package: 110,
  template_option: 111,
  template_parameter_choice: 112,
  template_option_choice: 113,
  inventory_type: 114,
  inventory_method: 115,
  inventory_quality: 116,
  marketing_campaign: 131
});

/**
 * Constant : shortcuts
 * Shortcut mapping to handle keyborad interactions.
 * global object will be used for global keys
 * -- can create mapping for spefic module --
 *
 *  Mapping itself is a object with property of
 *      key - which is the actual key map.
 *      description - which is used to show in the keyword mapping popup
 */
angular.module("calculus").constant("shortcuts", {
  global: {
    close: {
      key: 27
    }
  }
});

angular.module("calculus").constant("LearnImage", {
  enable: {
    learn: {
      image: false
    }
  }
});

angular.module("calculus").constant("GlobalRegularExpression", /^[a-zA-Z0-9`\-\\=[\]\;?:‘\",./~!@#$%^&*()_+'{}|“\n<> \u00e4\u00f6\u00eb\u00ef\u00fc\u00e1\u00e9\u00ed\u00f3\u00fa ]+$/);
angular.module("calculus").constant("AS400FieldsRegularExpression", /^[a-zA-Z0-9`\-\\=[\]\;?:\",./~!@#$%^&*()_+'{}|“\n<> ]+$/);
angular.module("calculus").constant("AS400FieldsRegExpression", /^[a-zA-Z0-9`\-\\=[\]\;?:\",./~!@#$%^&*()_+'{}|“\n<> ]+$/);
                                                                

angular.module("calculus").constant("StatusCodes", {
  Pending: {
    Code: "PEN",
    ID: 100
  },
  Active: {
    Code: "ACT",
    ID: 200
  },
  Inactive: {
    Code: "INA",
    ID: 300
  },
  Discontinued: {
    Code: "DIS",
    ID: 400
  },
  None: {
    Code: "NONE",
    ID: 500
  }
});

/**
 * Constant : versions
 * Version history and features/bug updates
 * Contains an array of versions.
 * key (current) - will always the latest release.
    Structure of version id: 1: Major revision (new UI, lots of new features, conceptual change, etc.)
                             9: Minor revision (maybe a change to a search box, 1 feature added, collection of bug fixes)
                             0: Bug fix release
                             1: Build number (if used)—that's why you see the .NET framework using something like 2.0.4.2709
*/
angular.module("calculus").constant("Versions", {
  versions: [
    {
      current: {
        release_date: "08/05/2018",
        release_time: "12.00 AM",
        id: "1.0.0.2",
        features: [
          {
            description: "Option to link multiple vendors to a SKU"
          },
          {
            description: "Additional descriptions for Items and SKU"
          },
          {
            description: "New sub-type 'component' added in item"
          },
          {
            description: "Product assortment at SKU level"
          },
          {
            description: "Added Vendor reorder/buyer code in vendor and item"
          },
          {
            description:
            "Mass buyer code/Vendor reorder update in items while changing buyer code/reorder in vendor"
          },
          {
            description: "Added vendor purchase information in SKU"
          }
        ]
      },
      "1.0.0.2": {
        release_date: "20/03/2018",
        release_time: "12.00 AM",
        id: "1.0.0.1",
        features: [
          {
            description:
            "Introduced searchable select dropdown in the UDD screens"
          },
          {
            description:
            "Feature to add multiple UDDs to multiple types is introduced"
          },
          {
            description:
            "UI for the Group by in the Item maintenance screen is changed to table view"
          },
          {
            description:
            "Left side panel width is reduced to increase the working area width"
          },
          {
            description:
            "User now has the option to refresh the data list in the maintenance screens"
          },
          {
            description:
            "The filter panel in the maintenance screens are redesigned"
          }
        ],
        bugfixes: [
          {
            description:
            "Short Description Length: Changed to Maximum - 30 and Minimum - 2"
          },
          {
            description: "Images are now shown even after grouping of data"
          }
        ]
      },
      "1.0.0.1": {
        id: "1.0.0.1",
        features: [
          {
            description: "Item types can be sorted by complete path"
          },
          {
            description: "Item types can be filterd at any level of path"
          }
        ],
        bugfixes: [
          {
            description:
            "Resuse existing connection pool instead of creating new ones."
          }
        ]
      }
    }
  ]
});
