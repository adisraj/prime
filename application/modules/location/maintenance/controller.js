(() => {
  "use strict";
  angular
    .module("rc.prime.location")
    .controller("LocationController", LocationController);
  LocationController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "DataLakeService",
    "LocationFactory",
    "LocationTypeService",
    "LocationParameterService",
    "LocationUDDValueService",
    "UserService",
    "DataLakeAPIService",
    "AttributeValueService",
    "HierarchyService",
    "HierarchyValueService",
    "HierarchyValuesTreePathService",
    "AddressContactService",
    "TaxService",
    "StatusCodes",
    "$location",
    "$http"
  ];

  function LocationController(
    $scope,
    $stateParams,
    common,
    DataLakeService,
    LocationFactory,
    LocationTypeService,
    LocationParameterService,
    LocationUDDValueService,
    UserService,
    DataLakeAPIService,
    AttributeValueService,
    HierarchyService,
    HierarchyValueService,
    HierarchyValuesTreePathService,
    AddressContactService,
    TaxService,
    StatusCodes,
    $location,
    $http
  ) {
    //Assign this variable to controller variable
    let vm = this;

    //Assign available functions in common module to controller variable
    let $filter = common.$filter;
    let $state = common.$state;
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let ApplicationPermissions = common.ApplicationPermissions;
    let Identifiers = common.Identifiers;
    let LocalMemory = common.LocalMemory;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let Notification = common.Notification;
    let logger = common.Logger.getInstance("LocationController");
    vm.isGroupByFilterApplied = false;
    vm.statusCodes = StatusCodes;
    vm.SessionMemory = common.SessionMemory;
    vm.$location = $location;
    vm.isAddedToQueue = false;
    vm.itemdataAddToQueueError = false;
    //UUID of location entity
    vm.uuid = "1";
    vm.isResetFilter = false;
    vm.sortByField = "none";
    vm.sortByOrder = "desc";
    vm.selectedGroupHeader = [];
    vm.groupLocations = [];
    vm.groupLocationsMap = [];
    vm.isLoadingDelete = false;
    $scope.unique_id = 1;
    /**
     * Initialising Location module
     * Fetch the total functions
     * Fetch all the locations and images for fetched locations
     * Get Primary Hierarchy set for Locations
     */
    vm.Activate = () => {
      vm.clearPath = true;
      vm.InitializeControllerVariables();
      vm.setVariables();
      vm.SetLocationLimitPerPage();
      vm.reloadLocationCountAndList();
      vm.GetLocationEntityDetails();
      vm.FetchLakeDropsForLocation();
      vm.FetchSpecialHierarchiesForLocation();
      vm.FetchHierarchyValuesMappedById();
      vm.FetchAttributeValuesMappedById();
      vm.GetParameterStatus();
      vm.getAllLocationTypes();
      $scope.getStatuses(common.Identifiers.location);
      $scope.getNextStatuses(common.Identifiers.location);
      vm.FetchValidationModel();
      vm.fetchFeatureAccessDetails();
    };

    // Function to declare all variables used in the controller
    vm.InitializeControllerVariables = () => {
      vm.returnValue = "";
      vm.entityInformation = {};
      vm.thumbnails = [];
      vm.groupByField = "";
      vm.locationsDataList = [];
      vm.originalLocationsDataList = [];
      vm.hierarachyValuesMap = {};
      vm.allAttributeValues = {};
      vm.attributeValuesMap = {};
      vm.allLocations = {};
      vm.allLocationTypes = {};
      $scope.head = {};
      vm.filters = {};
      vm.old_filters = {};
      vm.appliedFilterCount = 0;
      $scope.drop = {};
      $scope.uddValidationErrors = [];
      vm.isGroupByApplied = false;
    };

    /**
     * Function to initialize variables to show various forms
     * Initially set all variable other than view locations to false
     */
    vm.setVariables = () => {
      //Is primary hierarchy detail loaded is set false
      vm.isPrimaryHierarchyLoaded = false;
      //Variable to check if hierarchy map details are loaded is false
      vm.isMapDataLoaded = false;
      //Variable to show advanced search panel is false
      vm.advancedSearchPanel = false;
      //Variable is used to show the which review stage is executed.
      vm.publishReviewStage = 0;
      //Is authorized to view is true initially
      vm.isViewAuthorized = true;
      //Is apply filter success is true initially
      vm.applyFilterSuccess = true;
      //Used to toggle the right side group by panel
      vm.showgroupByMenu = false;
      //Variable to hide the Advanced Search panel initially
      vm.showFilter = false;
      //Show dependency details data for a location is false initially
      vm.showDependencyDetailsData = false;
      //Show dependency details for a location is false initially
      vm.showDependencyDetails = false;
      //Variable to check if operations post, put or delete is done on location
      vm.opdone = false;
      //Apply filters button content
      vm.applyFiltersBtnLabel = "Apply Filters";
      //Variable to hide the Analyse panel
      vm.showAnalysePanel = false;
      // Variable which desides the access for clone
      vm.isCloneAllowed = false;
      // variable to save cover image as thumbnail
      vm.is_thumbnail = 1;
      // variable to call confirmation panel on cover image deletion
      vm.showConfirmDeletion = false;
      // On create location, variable to call confirmation panel on cover image deletion
      vm.DeletionConfirmation = false;
    };

    //Set Values valid for sorting
    $scope.sortableFields = [{
      field: "Sort By None",
      value: ""
    },
    {
      field: "Name",
      value: "name"
    },
    {
      field: "Short Name",
      value: "short_name"
    },
    {
      field: "Location Type",
      value: "type"
    },
    {
      field: "Location Hierarchy",
      value: "primary_location_hierarchy_value_path"
    },
    {
      field: "Price Group",
      value: "pricing_classification_group_value_desc"
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

    //Function to set limit location count per page
    vm.SetLocationLimitPerPage = () => {
      vm.limit = 50;
    };

    // Fetch access for clone
    vm.fetchFeatureAccessDetails = () => {
      UserService.API.IsAllowedFeaturedPassword("location-clone")
        .then(result => {
          if (result.data && result.data.length) {
            vm.isCloneAllowed = true;
          } else {
            vm.isCloneAllowed = false;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get Location entity UUID and related information like base url
    vm.GetLocationEntityDetails = () => {
      EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(location_information => {
          vm.entityInformation = location_information;
          $scope.name = vm.entityInformation.name;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Get total locations available
    vm.GetLocationsCount = () => {
      LocationFactory.API.FetchTotalRecordCount()
        .then(locationCount => {
          $timeout(() => {
            vm.totalRecordCount = locationCount;
            if (vm.locationsDataList && vm.locationsDataList.length) {
              vm.availableLocationsCount = vm.totalRecordCount - vm.locationsDataList.length;
            }
          }, 0);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // On Press of refresh button fetch location count and the data
    vm.reloadLocationCountAndList = refresh => {
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
            vm.GetLocationsCount();
            vm.FetchLocations(refresh)
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            vm.FetchLocations(refresh)
              .then(response => {
                resolve(response);
                vm.totalRecordCount = response.data.filterdRecordCount;
                vm.availableLocationsCount = vm.totalRecordCount - vm.locationsDataList.length;
              })
              .catch(error => {
                reject(error);
              });
          }
        }
      });
    };

    // Get Location validation model for creating or updating a location
    vm.FetchValidationModel = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid)
        .then(model => {
          vm.location_model = model;
          //Get columns available for group by feature
          vm.getDynamicColumns(model);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Configure location type select object
    $scope.selectLocationType = {
      valueField: "id",
      labelField: "short_description",
      searchField: ["short_description"],
      sortField: "short_description",
      //Space is concatinated so that end of the text does not cut off
      placeholder: "Select Location Type" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      //Adding the data to the options, so as to show the data in the dropdown
      options: vm.allLocationTypes,
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
              "</span>" +
              "<span>" +
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
            "-" +
            '<span class="m-l-5 f-12 text-muted">' +
            escape(data.status) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    //Function to open location form i.e create, update or delete function
    vm.openForm = () => {
      $scope.uddValidationErrors = [];
      $scope.resetValidation();
      vm.createForm = true;
      vm.resetModel();
      if (!vm.disableActions) {
        vm.isShowDetails = true;
        vm.clearHead();

        //Variables to check if update,create or delete is successfull is set to false
        vm.isUpdate = false;
        vm.opdone = false;
        vm.confirmDelete = false;
        vm.deleteLocationMessage = null;

        //Variable to check if effective date is valid is intially false
        $scope.effective_val = false;

        /**Set current and next status Ids [200 - active, 500 - None] and
        /**Effective date to current date
        **/
        if ($stateParams.id === undefined) {
          $scope.head.effective_date = moment()
            .utcOffset("0")
            .format($scope.date_format);
          $scope.head.status_id = 200;
          $scope.head.status = "Active";
          $scope.head.next_status_id = 500;
          $scope.head.next_status = "None";
        }

        /*edit screen variables-start*/
        vm.createStage = true;
        vm.configureStage = false;
        vm.manageDropStage = false;
        vm.previewandpublishStage = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        /*edit screen variables-end*/

        //on open of form clear all queued drops list
        $scope.queuedDrops = [];

        //remove validation error message in form
        vm.validationMessage = null;

        /* variables to reset the Notification message-start */
        $scope.locationSuccessMessage = null;
        $scope.locationErrorMessage = null;
        $scope.locationUDDSuccessMessage = null;
        /* variables to reset the Notification message-end */
      }
    };

    //Initialize Create and Update Forms
    vm.InitializeCreateUpdateForm = () => {
      //Set message variable to null
      vm.message = null;
      //Set error variable to null
      vm.error = null;
      //Variable to show all locations
      vm.showLocationPage = false;
      //Get effective statuses available
      $scope.getStatuses(common.Identifiers.location);
      //Get next statuses available
      $scope.getNextStatuses(common.Identifiers.location);
      //Get hierarchy values map
      vm.FetchHierarchyValuesMappedById();
      //Get attribute values map
      vm.FetchAttributeValuesMappedById();
      //Get all locations
      vm.getAllLocations();
      vm.initializeLocationDropdown();
      //Get all location types
      vm.getAllLocationTypes();
      //Intialize user defined data directive variables
      vm.initializeUDDDirective();
      //Get location parameter status,if true then allow create/update/delete
      vm.GetParameterStatus();
      //Function to open the location form for create/update
      vm.openForm();
    };

    // Configure location select object
    vm.initializeLocationDropdown = () => {
      $scope.selectLocation = {
        valueField: "id",
        labelField: "name",
        searchField: ["name"],
        sortField: "name",
        // Space is concatinated so that end of the text does not cut off
        placeholder: "Select Location" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        // Adding the data to the options, so as to show the data in the dropdown
        options: [],
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
                "</span>" +
                "<span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          // The selected option is sent to the item object
          item: (data, escape) => {
            if (
              vm.old_data &&
              ((!vm.old_data.fulfilment_center_id && data.id) ||
                (vm.old_data.fulfilment_center_id &&
                  data.id &&
                  Number(vm.old_data.fulfilment_center_id) !== Number(data.id)))
            ) {
              // function will be called only if fulfillment center is changed or reset manually
              vm.getDeliverySlotsByFulfillmentLocation(
                vm.old_data.fulfilment_center_id,
                vm.old_data.fulfilment_center
              );
            }
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.name) +
              "</span>" +
              "-" +
              '<span class="m-l-5 f-12 text-muted">' +
              escape(data.status) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vm.onSelfFulfilmentLocation = () => {
      $timeout(() => {
        if ($scope.head.self_fulfilment_center) {
          $("#fulfilment_center_id")[0].selectize.disable();
          $scope.head.fulfilment_center_id = null;
          $scope.head.fulfilment_center = "";
        } else {
          $("#fulfilment_center_id")[0].selectize.enable();
        }
      }, 0);
    };

    vm.NewLocation = () => {
      vm.isPrimaryHierarchyLoaded = false;
      if ($scope.permissionsMap.create) {
        $scope.head = {};
        $scope.isEnabled = false;
        // Variable to show the Published review section.
        vm.publishResponseMessage = false;
        vm.InitializeCreateUpdateForm();
        $state.go("common.prime.location.new");
        $timeout(() => {
          vm.isPrimaryHierarchyLoaded = true;
        }, 10);
      }
    };

    //Function to initialize delete location form
    vm.DeleteLocation = id => {
      vm.message = null;
      vm.error = null;
      $state.go("common.prime.location.delete", {
        id: id
      });
      vm.isConfirmDelete();
    };

    vm.deleteTaxForLocation = () => {
      TaxService.API.DeleteTaxForLocation($stateParams.id)
        .then(response => { })
        .catch(error => {
          logger.error(error);
        });
    };

    //Function to initialize update location form
    vm.UpdateLocation = (data, index, locationGroup) => {
      if ($scope.permissionsMap.update) {
        data.isShowUpdateProcessing = true;
        vm.message = null;
        vm.error = null;
        vm.locationIndex = index;
        vm.isGroupByApplied === true ?
          (vm.selectedLocationGroup = locationGroup) :
          "";
        vm.State = "'update'";
        $timeout(() => {
          $state
            .go("common.prime.location.update", {
              id: data.id
            })
            .then(() => {
              data.isShowUpdateProcessing = false;
            });
        }, 0);
      }
    };

    //Get all location types
    vm.getAllLocations = () => {
      LocationFactory.API.FetchLocationsGraph(["id", "name", "status"])
        .then(response => {
          vm.allLocations = response;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Get all location types
    vm.getAllLocationTypes = () => {
      LocationTypeService.API.GetLocationTypes()
        .then(response => {
          vm.allLocationTypes = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    /**
     * Get All drops available for location entity
     */
    vm.FetchLakeDropsForLocation = () => {
      DataLakeAPIService.API.GetDropsByUuid(vm.uuid)
        .then(response => {
          if (response.data !== undefined) {
            vm.thumbnails = response.data;
          } else {
            vm.thumbnails = [];
          }
          //Get the download url for locations having uploaded images
          vm.loadThumbNailImages("165x165");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Get download urls for thumbnails and cover images
    vm.loadThumbNailImages = size => {
      if (vm.locationsDataList) {
        //For all locations, if thumbnail instance id matches location id save the drop id
        for (let i = 0; i < vm.locationsDataList.length; i++) {
          if (vm.thumbnails) {
            let thumbnail = vm.thumbnails.filter(lake => {
              return lake.instance_id == vm.locationsDataList[i].id;
            });

            //If thumbnail exists for location, get the download URL for drop id and attach it with location object
            if (thumbnail[0]) {
              if (!thumbnail[0].url) {
                if (
                  thumbnail[0].type &&
                  thumbnail[0].type.toLowerCase() === "virtual"
                ) {
                  vm.locationsDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    "",
                    vm.uuid
                  );
                  vm.locationsDataList[i].drop_id = thumbnail[0].drop_id;
                  vm.originalLocationsDataList[i].thumbnail =
                    vm.locationsDataList[i].thumbnail;
                  vm.originalLocationsDataList[i].drop_id =
                    vm.locationsDataList[i].drop_id;
                } else {
                  vm.locationsDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    size,
                    vm.uuid
                  );
                  vm.locationsDataList[i].drop_id = thumbnail[0].drop_id;
                  vm.originalLocationsDataList[i].thumbnail =
                    vm.locationsDataList[i].thumbnail;
                  vm.originalLocationsDataList[i].drop_id =
                    vm.locationsDataList[i].drop_id;
                }
              } else if (thumbnail[0].url) {
                vm.locationsDataList[i].thumbnail = thumbnail[0].url;
              }
            }
          }
        }
      }
    };

    //Get image by uuid and location id to display in update screen
    vm.loadImage = (location, size) => {
      DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
        vm.uuid,
        location.id,
        "cover_image"
      )
        .then(response => {
          if (response && response.length > 0) {
            if (!response[0].url) {
              location.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                response[0].drop_id,
                size,
                vm.uuid
              );
            } else if (response[0].url) {
              location.thumbnail = response[0].url;
            }
          } else {
            location.thumbnail = undefined;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // Function to get preview
    vm.getDownloadUrl = (url, downloadUrl) => {
      if (!downloadUrl) {
        return DataLakeAPIService.API.GetDownloadUrl(url, vm.uuid);
      } else {
        return downloadUrl;
      }
    };

    // Scroll bar will be pointed to (x, y) position
    vm.scrollToPosition = (x, y) => {
      window.scrollTo(x, y);
    };

    // Sets current pagination variables
    vm.pagination = () => {
      vm.resetUnusedFiltersArrays();
      if (vm.sortByField === "") {
        vm.sortByField = "none";
        vm.sortByOrder = "desc";
      }
      vm.groupByField === "" ? (vm.groupByValue = null) : "";
    };

    /**
     * Fetch locations initially with given limit
     * Get cover images and thumbnails for locations fetched
     * Get the total records available and fetched locations
     **/
    vm.FetchLocations = refresh => {
      return new Promise((resolve, reject) => {
        if (refresh !== undefined) {
          // On click of refresh button, a message bar with information will be displayed in UI
          vm.totalTimeText = "";
          vm.isRefreshing = true;
          vm.refreshTableText = "Refreshing list...";
        }
        /** ---------- Get location based on page and limit ----------
         * Filter object is undefined (third parameter)
         * sort by field and order initially none and asc
         * may change according to the user customization
         * No parameter means, get all the records without any conditions.
         */
        $scope.selectedRow = null;
        vm.groupByField = "";
        vm.page = 1;
        vm.isLoaded = false;
        vm.showLocationPage = true;
        vm.isGroupByApplied = false;
        vm.pagination();
        LocationFactory.API.GetLocations(
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
            vm.locationsDataList = response.data.data;
            vm.originalLocationsDataList = JSON.parse(
              JSON.stringify(vm.locationsDataList)
            );
            vm.totalRecordCount = response.data.filterdRecordCount;
            vm.availableLocationsCount = vm.totalRecordCount - vm.locationsDataList.length;
            vm.FetchLakeDropsForLocation();
            localStorage.removeItem("LocationPageCount");
            vm.MapLocations(vm.locationsDataList);
            vm.isLoaded = true;
            resolve(response);
          })
          .catch(error => {
            vm.isRefreshing = true;
            vm.refreshTableText = "Unsuccessfull!";
            vm.isLoaded = true;
            reject(error);
            logger.error(error);
            $timeout(() => {
              vm.isRefreshing = false;
            }, 3500);
          });
      });
    };

    /**
     * Create Map of locations based on location id
     * Location of mapped id return the data of location
     */
    vm.MapLocations = list => {
      vm.LocationsMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.LocationsMap[list[i].id] === undefined) {
          vm.LocationsMap[list[i].id] = list[i];
        }
      }
      $stateParams.id && $state.current.name.includes(".update") ?
        vm.gotoUpdateState() :
        "";
    };

    /**
     * Load more locations based by page count and limit
     * Get cover images and thumbnails for locations fetched
     * Get the total records available and fetched locations
     * Increment page by 1 if locations fetched is less than total count
     **/
    vm.loadMoreLocations = () => {
      vm.isLoading = true;
      vm.page = parseInt(LocalMemory.API.Get("LocationPageCount")) || 1;
      vm.pagination();
      // Fetch more locations if no filters are applied
      if (!vm.isFilterApplied) {
        //if filter is not applied then this will fetch next limited records
        if (vm.sortByField === "") {
          vm.sortByField = "none";
          vm.sortByOrder = "desc";
        }
        /** ---------- Get locations based on page and limit ----------
         * Filter object is undefined (third parameter)
         * sort by field and order initially none and asc
         * may change according to the user customization
         * No parameter means, get all the records without any conditions.
         */
        LocationFactory.API.GetLocations({
          page: vm.page + 1,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: vm.groupByField,
          value: vm.groupByValue
        }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.locationsDataList.push(response.data[i]);
                vm.originalLocationsDataList.push(response.data[i]);
              }
              vm.availableLocationsCount =
                vm.totalRecordCount - vm.originalLocationsDataList.length;
              vm.FetchLakeDropsForLocation();
              vm.SetLocationLimitPerPage();
              if (vm.searchLocations) {
                $scope.showhistory = false;
                vm.locationsDataList = $filter("filter")(
                  vm.originalLocationsDataList,
                  vm.searchLocations
                );
              }
              LocalMemory.API.Post("LocationPageCount", vm.page + 1);
              vm.isLoading = false;
              vm.MapLocations(vm.locationsDataList);
            } else {
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        // Fetch more locations matching the filters applied
        LocationFactory.API.GetLocations({
          page: vm.page + 1,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: vm.groupByField,
          value: vm.groupByValue
        }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.locationsDataList.push(response.data[i]);
              } !vm.isGroupByFilterApplied ?
                (vm.availableLocationsCount =
                  vm.totalRecordCount - vm.locationsDataList.length) :
                "";
              vm.FetchLakeDropsForLocation();
              vm.SetLocationLimitPerPage();
              LocalMemory.API.Post("LocationPageCount", vm.page + 1);
              vm.isLoading = false;
              vm.MapLocations(vm.locationsDataList);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    //Watcher function to watch search variable for lacoation
    vm.watchers = () => {
      /** searching Location Data List */
      $scope.$watch("locationController.searchLocations", (searchValue, o) => {
        $scope.showhistory = false;
        vm.locationsDataList = $filter("filter")(
          vm.originalLocationsDataList,
          searchValue
        );
      });
    };
    vm.watchers();

    vm.dblClickAction = location => {
      vm.miscellaneousMethods();
      vm.opdone = false;
      vm.isError = false;
      vm.isFullfillment = false;
      //Set is update location to true on each double click action
      vm.isUpdateLocation = true;
      $scope.resetValidation();
      $scope.head = _.clone(location);
      $scope.head.effective_date = location.effective_date = $scope.getDateBasedOnFormat(
        $scope.head.effective_date
      );
      vm.old_data = angular.copy(location);
      vm.copyToHead(location);
      $scope.changeevent(location);
      $scope.isShowAddressContactPanel = false; // close address and contacts panel on open update form
      vm.isShowDetails = true;
      vm.showLocationPage = false;
      vm.isUpdate = true;
      vm.createStage = true;
      vm.configureStage = false;
      vm.previewandpublishStage = false;
      vm.createForm = true;
      vm.configureScreen = false;
      vm.previewAndPublish = false;
      //remove validation error message in form
      vm.validationMessage = null;
      // Variable to show the Published review section.
      vm.publishResponseMessage = false;
      $scope.head.name.includes("Clone") || $scope.head.name.includes("clone") ?
        (vm.isCloned = true) :
        (vm.isCloned = false);
      /* variables to reset the Notification message-start */
      $scope.locationSuccessMessage = null;
      $scope.locationErrorMessage = null;
      $scope.locationUDDSuccessMessage = null;
      /* variables to reset the Notification message-end */
      vm.confirmDelete = false;
      vm.loadImage($scope.head, "125x125");
      vm.resetModel();
    };

    //goto update state if id exists in data map
    vm.gotoUpdateState = () => {
      $scope.uddValidationErrors = [];
      if (vm.LocationsMap[$stateParams.id]) {
        //if current state is update and selected id is present in locations map then get data from map
        vm.LocationsMap[$stateParams.id].type_id = parseInt(
          vm.LocationsMap[$stateParams.id].type_id
        );
        vm.oldLocationData = _.clone(vm.LocationsMap[$stateParams.id]);
        vm.dblClickAction(vm.LocationsMap[$stateParams.id]);
      } else if (
        $stateParams.id &&
        $state.current.name.includes(".update") &&
        !vm.LocationsMap[$stateParams.id]
      ) {
        //if current state is update and selected id is not present in locations map then get by API call
        LocationFactory.API.FetchLocation($stateParams.id)
          .then(response => {
            if (response.id) {
              vm.LocationsMap[$stateParams.id] = response;
              vm.oldLocationData = _.clone(response);
              vm.dblClickAction(vm.LocationsMap[$stateParams.id]);
            } else {
              //if response also don't have id then close form
              vm.exit();
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

    vm.showHistoryDetails = data => {
      if (vm.locationData !== undefined) {
        vm.locationData.showhistory = false;
      }
      vm.locationData = data;
      vm.locationData.showhistory = true;
      vm.isShowHistory = true;
      // close address and contacts panel on open of history panel
      $scope.isShowAddressContactPanel = false;
      $scope.instanceName = data.name;
      $scope.isMaintenance = true;
      $scope.loadHistory(data.id);
    };

    //API request to get the history for location operations
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

    //Set Variables to close history data for location
    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
      $scope.isMaintenance = true;
      $scope.instanceName = null;
      if (vm.locationData !== undefined) {
        vm.locationData.showhistory = false;
      }
    };

    vm.FetchAttributeValuesMappedById = () => {
      AttributeValueService.API.GetAttributeValues()
        .then(response => {
          vm.allAttributeValues = response.data;
          // Create Attribute value Map witk Key :Id, value : collection object
          vm.createMap("allAttributeValues", "attributeValuesMap", "id");
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.createMap = (fromArrayModel, toMapModel, key) => {
      _.each(vm[fromArrayModel], value => {
        vm[toMapModel][value[key]] = value;
      });
    };

    vm.FetchHierarchyValuesMappedById = () => {
      HierarchyValuesTreePathService.getMap()
        .then(
          map => {
            vm.isMapDataLoaded = true;
            vm.hierarachyValuesMap = map;
          },
          error => {
            logger.error(error);
          }
        )
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getTreePath = (actualHierValId, path) => {
      let trimres = [];
      let tempVar = HierarchyValuesTreePathService.getTreePath(
        vm.hierarachyValuesMap,
        actualHierValId,
        path
      );
      let res = tempVar.split(">");
      if (res.length >= 5) {
        trimres[0] = res[0];
        trimres[1] = res[1];
        trimres[2] = "...";
        trimres[3] = res[res.length - 2];
        trimres[4] = res[res.length - 1];
        return trimres;
      } else {
        return res;
      }
    };

    vm.FetchSpecialHierarchiesForLocation = () => {
      HierarchyService.API.SearchHierarchy(
        "is_primary_location_hierarchy_id",
        1
      )
        .then(primary_location_result => {
          HierarchyService.API.SearchHierarchy(
            "is_pricing_classification_group_id",
            1
          )
            .then(pricing_classification_result => {
              HierarchyService.API.SearchHierarchy(
                "is_assortment_classification_group_id",
                1
              )
                .then(assortment_classification_result => {
                  $scope.locationConfig = {};
                  if (assortment_classification_result.length > 0) {
                    $scope.locationConfig.assortment_classification_group =
                      assortment_classification_result[0].id;
                    $scope.locationConfig.assortment_classification_group_desc =
                      assortment_classification_result[0].short_description;
                  }
                  if (pricing_classification_result.length > 0) {
                    $scope.locationConfig.pricing_classification_group =
                      pricing_classification_result[0].id;
                    $scope.locationConfig.pricing_classification_group_desc =
                      pricing_classification_result[0].short_description;
                  }
                  if (primary_location_result.length > 0) {
                    $scope.locationConfig.primary_location_hierarchy_desc =
                      primary_location_result[0].short_description;
                    $scope.locationConfig.primary_location_hierarchy_id =
                      primary_location_result[0].id;
                  }

                  HierarchyValueService.API.SearchHierarchyValue(
                    "hierarchy_id",
                    $scope.locationConfig.primary_location_hierarchy_id
                  )
                    .then(response => {
                      $scope.primary_location_hierarchy_data = {};
                      $scope.primary_location_hierarchy_data[
                        $scope.locationConfig.primary_location_hierarchy_id
                      ] = response;

                      HierarchyValueService.API.SearchHierarchyValue(
                        "hierarchy_id",
                        $scope.locationConfig.pricing_classification_group
                      )
                        .then(res => {
                          $scope.pricing_classification_group_data = {};
                          $scope.pricing_classification_group_data[
                            $scope.locationConfig.pricing_classification_group
                          ] = res;

                          HierarchyValueService.API.SearchHierarchyValue(
                            "hierarchy_id",
                            $scope.locationConfig
                              .assortment_classification_group
                          )
                            .then(resp => {
                              vm.isPrimaryHierarchyLoaded = true;
                              vm.FetchValidationModel();
                              $scope.assortment_classification_group_data = {};
                              $scope.assortment_classification_group_data[
                                $scope.locationConfig.assortment_classification_group
                              ] = resp;
                            })
                            .catch(error => {
                              logger.error(error);
                            });
                        })
                        .catch(error => {
                          logger.error(error);
                        });
                    })
                    .catch(error => {
                      logger.error(error);
                    });
                })
                .catch(error => {
                  logger.error(error);
                });
            })
            .catch(error => {
              logger.error(error);
            });
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getDynamicColumns = model => {
      let supportActions = {};
      if ($scope.locationConfig !== undefined) {
        let alterTitles = {
          primary_location_hierarchy_value_id: $scope.locationConfig.primary_location_hierarchy_desc,
          pricing_classification_group_value_id: $scope.locationConfig.pricing_classification_group_desc,
          assortment_classification_group_value_id: $scope.locationConfig.assortment_classification_group_desc
        };
        let drillTo = {};
        let locmMeta = generateDynamicTableColumnsService.getTableColumns(
          model,
          supportActions,
          alterTitles,
          drillTo
        );
        $scope.locmGroupByDropdown = locmMeta.dropdownList;
      }
    };

    vm.initializeUDDDirective = () => {
      $scope.showaddcnt = false;
      $scope.uddData = [];
      $scope.module_name = "location";
      $scope.edit_master_id = "";
      $scope.addresses = [];
    };

    vm.publishLocationUdd = (head, isPublishChanges) => {
      if (isPublishChanges) {
        vm.createForm = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.back = true;
        vm.validationMessage = null;
        vm.previewAndPublish = true;
      }
      vm.publishResponseMessage = true;
      if (vm.isUpdate) {
        vm.update(head);
      } else {
        vm.save(head);
      }
    };

    vm.GetParameterStatus = () => {
      LocationParameterService.API.GetLocationParameter()
        .then(response => {
          if (response[0].status_id !== 200) {
            vm.disableActions = true;
          } else {
            vm.disableActions = false;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Storage Functions START
    vm.initializeDropForm = () => {
      $scope.isAllowMultipleDrops = true;
      vm.showConfirmDeletion = false;
      vm.DeletionConfirmation = false;
      vm.is_thumbnail = 1;
    };

    vm.ffe = () => {
      $scope.drop.source = 'Local';
      $scope.files = [];
    }

    vm.getDropStatus = () => {
      try {
        $scope.statusList = DataLakeService.GetDropStatuses();
      } catch (error) {
        logger.error(error);
      }
    };

    //Get available drops by an entity and its uuid
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
                if (response[index].stream.toLowerCase() === "cover image" && response[index].is_thumbnail) {
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
      $scope.errFiles = errFiles;
      $scope.notImage=false
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
      vm.locdataUploaderror = false;
      vm.itemdataAddToQueueError = false;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      DataLakeService.GetLakeStreamLink(lakeId, streamId)
        .then(response => {
          $scope.isAllowMultipleDrops = true;
          response.length > 0 ?
            ($scope.selectedLakeStream = response[0]) :
            (scope.selectedLakeStream = {});
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

    $scope.resetAllconfigData = () => {
      vm.locdataUploaderror = false;
      vm.showCantGen = false;
      $scope.files = [];
      $scope.drop.url = null;
      vm.itemdataAddToQueueError = false;
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
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
              vm.locdataUploaderror = false;
              vm.itemdataAddToQueueError = false;
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
      }
    };

    vm.addCoverImg = () => {
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        vm.AddedForUrl($scope.drops);
        vm.isProcessing = true;
      } else {
        vm.replaceExistingDropAndUpload();
      }
    }

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
              if ($scope.drop.source.toLowerCase() === "camera") {
                if ($stateParams.id === undefined) {
                  vm.resetValues();
                }
              }
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
        vm.locdataUploaderror = false;
        vm.isUploading = true;
        vm.isAddedToQueue = true;
        vm.itemdataAddToQueueError = false;
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
      drop.instance_id = $stateParams.id;
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
      $scope.queuedDrops.splice(index, 1)
      for (let i = 0; i < $scope.queuedDrops.length; i++) {
        if ($scope.queuedDrops[i].stream.toLowerCase() == "thumbnail" && $scope.queuedDrops[i].is_coverImage) {
          $scope.queuedDrops.splice(i, 1)
        }
      }
      $scope.isAllowMultipleDrops = true;
    }

    // To remove the drop from queue
    vm.removeDropsFromQueue = index => {
      let deletedDrop = $scope.queuedDrops[index];
      if (deletedDrop.stream.toLowerCase() === "cover image" && deletedDrop.is_thumbnail) {
        // store the value of index
        vm.dropIndex = index;
        vm.DeletionConfirmation = true;
        // if stream is thumbnail and copy of cover image
      } else if (deletedDrop.stream.toLowerCase() == "thumbnail" && deletedDrop.is_coverImage) {
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

    // to delete drop
    vm.removeDrop = drop => {
      return new Promise((resolve, reject) => {
        try {
          vm.isDeleting = true;
          drop.uuid = vm.uuid;
          if (vm.dropToDelete) {
            drop = vm.dropToDelete
          }
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Deleting drop in progress";
          DataLakeService.DeleteDrop(drop)
            .then(() => {
              vm.dropToDelete = undefined;
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the location";
              delete $scope.head.thumbnail; //delete the thumbnail property
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
              }, 2500);
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
        // variable to store drop values
        vm.dropToDelete = drop;
      } else if (drop.stream.toLowerCase() === "thumbnail" && drop.is_coverImage) {
        vm.dropToDelete = undefined;
        let object = {
          drop_id: drop.drop_id,
          instance_id: drop.instace_id,
          is_thumbnail: 0
        }
        DataLakeAPIService.API
          .UpdateDetails(object)
          .then(response => {
            vm.$updateBtnText = "Update";
            angular.element("#showQueueMessage").show();
            vm.isDeleting = 1;
            vm.showSuccessQueueMessage = "Image unlinked from the location";
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
      if ($scope.selectedLakeStream.stream.toLowerCase() === "cover image" && vm.is_thumbnail) {
        queuedDropObject.is_thumbnail = vm.is_thumbnail;
      }
      //$scope.queuedDrops.push(queuedDropObject);

      // if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url" && $scope.drop.is_save_to_document_store) {
      //   let params = {
      //     data: queuedDropObject
      //   }
      //   DataLakeAPIService.API.CheckFileType(params)
      //   .then(res => {
      //     $scope.queuedDrops.push(queuedDropObject);
      //     if (queuedDropObject && queuedDropObject.stream.toLowerCase() === "cover image" && vm.is_thumbnail) {
      //       vm.uniqueId = vm.uniqueId + 1;
      //       let obj = {
      //         lake: queuedDropObject.lake,
      //         lake_id: queuedDropObject.lake_id,
      //         stream: "Thumbnail",
      //         stream_code: "thumbnail",
      //         stream_id: 1,
      //         url: queuedDropObject.url,
      //         file_name: queuedDropObject.file_name,
      //         is_coverImage: true,
      //         coverImgId: queuedDropObject.unique_id,
      //         unique_id: vm.uniqueId
      //       };
      //       $scope.queuedDrops.push(obj);
      //     }
      //     if ($scope.queuedDrops.length > 0) {
      //       vm.isUploading = false;
      //       angular.element("#showQueueMessage").show();
      //       vm.showSuccessQueueMessage = "Image added to the Queue";
      //       vm.resetModel();
      //       $timeout(() => {
      //         angular.element("#showQueueMessage").hide();
      //         vm.showSuccessQueueMessage = null;
      //       }, 2500);
      //     }
      //     vm.resetValues();
      //     vm.isAddedToQueue = false;
      //   })
      //   .catch(error => {
      //     vm.isAddedToQueue = false;
      //     // vm.itemdataAddToQueueError = error.data;
      //     vm.itemdataAddToQueueError = "File type is not suitable for physical upload";
      //   });
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
                vm.FetchLakeDropsForLocation(); //Load all drops and images after creating new drop
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
          // drop = $scope.drop;
          drop = angular.copy($scope.drop);
          drop.instance_id = instanceId;
          drop.uuid = vm.uuid;
          drop.source = "local"
          drop.files = $scope.files;
          drop.url = undefined;
          drop.is_thumbnail = vm.is_thumbnail;
          if(del){
            if(del.source==="url" && del.url){
              drop.url=del.url
              drop.thumbnail=del.url
            }
          }
          DataLakeService.UploadDrop(drop)
            .then(() => {
              vm.is_thumbnail = 1;
              // After create of drops, it should be shown in the list immidietly
              vm.FetchLakeDropsForLocation();
              // reset manage drops page to initial state
              vm.resetModel();
              resolve(true);
              $timeout(() => {
                vm.isUploading = false;
                vm.isAddedToQueue = false;
                vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
                $scope.files = null;
                $scope.errFiles = null;
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
              vm.locdataUploaderror = "File type is not suitable for physical upload";
              // vm.locdataUploaderror = error.data;
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

    // vm.setImage = (entity) => {
    //   entity.thumbnail = "" + "?decache=" + Math.random();
    // }

    //Storage function END

    /*********** Save,update or delete Location implementation ************/
    vm.save = payload => {
      if (!vm.disableActions) {
        vm.isProcessing = true;
        let dataToBeSaved = _.clone(payload);

        //format effective and next effective date in current date format
        if (dataToBeSaved.effective_date && dataToBeSaved.next_effective_date) {
          dataToBeSaved.effective_date = $scope.getFormattedDate(
            payload.effective_date
          );
          dataToBeSaved.next_effective_date = $scope.getFormattedDate(
            payload.next_effective_date
          );
        }
        LocationFactory.API.InsertLocation(dataToBeSaved)
          .then(response => {
            vm.isProcessing = false;
            payload.id = response.data.inserted_id;
            payload.self_fulfilment_center ?
              (payload.fulfilment_center_id = response.data.inserted_id) :
              null;
            payload.self_fulfilment_center = false;
            vm.opdone = true; //show done button to close form after creating location
            vm.totalRecordCount = vm.totalRecordCount + 1;
            payload.next_status && payload.next_status.toLowerCase() === "none" ?
              (payload.next_effective_date = "1970-01-01") :
              "";
            vm.insertedData = payload;
            //push newly created location to list of locations
            vm.locationsDataList.length > 0 ?
              vm.locationsDataList.unshift(payload) :
              (vm.locationsDataList = payload);
            vm.LocationsMap[payload.id] = payload;
            //if group by filter is applied then update location from group array
            if (vm.groupByField) {
              //find index of group under which current location exist
              let groupFieldIndex = vm.groupLocations.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );
              if (groupFieldIndex === -1) {
                vm.groupLocations.push({
                  [vm.groupByField]: payload[vm.groupByField],
                  count: 1,
                  expanded: false,
                  selected: 1,
                  locations: [payload]
                });
              } else if (
                groupFieldIndex > -1 &&
                vm.groupLocations[groupFieldIndex].locations
              ) {
                vm.groupLocations[groupFieldIndex].locations.unshift(payload);
                vm.groupLocations[groupFieldIndex].count++;
              } else {
                vm.groupLocations[groupFieldIndex].count++;
              }
              vm.groupLocationsMap[payload.id] === undefined ?
                (vm.groupLocationsMap[payload.id] = payload) :
                "";
            }
            ///create user defined data values for location
            //After creating location, updalod drops which are in queue
            vm.uploadQueuedDrops(response.data.inserted_id);

            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              response: response,
              inserted_id: response.data.inserted_id
            });
          })
          .catch(error => {
            vm.isProcessing = false;
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              error: error
            });
          });
      }
    };

    //funcion to check if the payload has changed, if yes returns true else returns false
    vm.hasPayloadChanges = payload => {
      vm.oldLocationData["effective_date"] = moment(
        vm.oldLocationData["effective_date"]
      ).format("YYYY-MM-DD");
      vm.oldLocationData["next_effective_date"].toLowerCase() === "none" ?
        (vm.oldLocationData["next_effective_date"] = "1970-01-01") :
        null;
      let omitKeys = [
        "thumbnail",
        "summaryThumbnail",
        "next_status",
        "status",
        "drop_id",
        "price_classification_path",
        "primary_hierarchy_path_value",
        "pricing_classification_group_value_name",
        "assortment_classification_group_value_name",
        "primary_location_hierarchy_value_name",
        "pricing_classification_group_desc",
        "primary_location_hierarchy_desc",
        "assortment_classification_group_desc",
        "fulfilment_center",
        "$$hashKey"
      ];
      for (let key in payload) {
        if (!omitKeys.includes(key)) {
          if (payload[key] == vm.oldLocationData[key]) {
            vm.hasUpdate = false;
          } else if (payload[key] != vm.oldLocationData[key]) {
            return (vm.hasUpdate = true);
          }
        }
      }
      return vm.hasUpdate;
    };

    vm.update = payload => {
      if (!vm.disableActions) {
        // variable to controle the loader functionality
        vm.isProcessing = true;
        let dataToBeUpdate = _.clone(payload);
        //format effective and next effective date in current date format
        if (
          dataToBeUpdate.effective_date &&
          dataToBeUpdate.next_effective_date
        ) {
          dataToBeUpdate.effective_date = $scope.getFormattedDate(
            payload.effective_date
          );
          dataToBeUpdate.next_effective_date = $scope.getFormattedDate(
            payload.next_effective_date
          );
        }

        //set next effective by default, if next status is 'None'
        if ($scope.effective_val === false) {
          dataToBeUpdate.next_effective_date = "1970-01-01";
        }

        dataToBeUpdate.primary_location_hierarchy_id =
          $scope.locationConfig.primary_location_hierarchy_id;
        dataToBeUpdate.pricing_classification_group_id =
          $scope.locationConfig.pricing_classification_group;
        dataToBeUpdate.assortment_classification_group_id =
          $scope.locationConfig.assortment_classification_group;

        payload.isShowUpdateProcessing = false;
        vm.oldLocationData.isShowUpdateProcessing = false;
        if (!vm.updateFormValidation()) {
          if (vm.hasPayloadChanges(dataToBeUpdate)) {
            //if payload not equal to previous data, then update location
            LocationFactory.API.UpdateLocation(dataToBeUpdate)
              .then(response => {
                vm.isProcessing = false;
                ///put same cover image for location which is in payload
                response.data.data.thumbnail = payload.thumbnail;
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "update",
                  response: response,
                  inserted_id: payload.id
                });
                vm.opdone = true;
                //get index of current location by id
                let index = this.locationsDataList.findIndex(
                  location => location.id === payload.id
                );
                //if group by filter is applied then update location from group array
                if (vm.groupByField) {
                  //find index of group under which current location exist
                  let groupFieldIndex = vm.groupLocations.findIndex(
                    group =>
                      group[vm.groupByField] ===
                      vm.groupLocationsMap[payload.id][vm.groupByField]
                  );
                  //find index of location from locations list under the selected group
                  let groupIndex = vm.groupLocations[
                    groupFieldIndex
                  ].locations.findIndex(
                    location => parseInt(location.id) === parseInt(payload.id)
                  );

                  if (groupFieldIndex === -1) {
                    vm.groupLocations.push({
                      [vm.groupByField]: payload[vm.groupByField],
                      count: 1,
                      expanded: false,
                      selected: 1,
                      locations: [payload]
                    });
                  } else if (
                    groupFieldIndex > -1 &&
                    vm.groupLocations[groupFieldIndex].locations[groupIndex][
                    vm.groupByField
                    ] !== response.data.data[vm.groupByField]
                  ) {
                    vm.groupLocations[groupFieldIndex].locations.splice(
                      groupIndex,
                      1
                    );
                    vm.groupLocations[groupFieldIndex].count--;
                    let newGroupFieldIndex = vm.groupLocations.findIndex(
                      group =>
                        group[vm.groupByField] ===
                        response.data.data[vm.groupByField]
                    );
                    if (newGroupFieldIndex === -1) {
                      vm.groupLocations.push({
                        [vm.groupByField]: response.data.data[vm.groupByField],
                        count: 1,
                        expanded: false,
                        selected: 1,
                        locations: [response.data.data]
                      });
                    } else if (
                      newGroupFieldIndex > -1 &&
                      vm.groupLocations[newGroupFieldIndex].locations
                    ) {
                      vm.groupLocations[newGroupFieldIndex].locations.unshift(
                        response.data.data
                      );
                      vm.groupLocations[newGroupFieldIndex].count++;
                      vm.groupLocationsMap[payload.id] = response.data.data;
                    } else {
                      vm.groupLocations[newGroupFieldIndex].count++;
                    }
                    //update location from list
                    vm.groupLocationsMap[payload.id] = response.data.data;
                  } else if (
                    groupFieldIndex > -1 &&
                    vm.groupLocations[groupFieldIndex].locations
                  ) {
                    //update location from list
                    vm.groupLocations[groupFieldIndex].locations[groupIndex] =
                      response.data.data;
                    vm.groupLocationsMap[payload.id] = response.data.data;
                  }
                }
                //update location in list present at the index
                this.locationsDataList[index] = response.data.data;
                //update object in location map also
                vm.LocationsMap[payload.id] = response.data.data;
                vm.oldLocationData = response.data.data;
              })
              .catch(error => {
                vm.isProcessing = false;
                //get index of current location by id
                let index = this.locationsDataList.findIndex(
                  location => location.id === payload.id
                );
                this.locationsDataList[index] = angular.copy(vm.old_data);
                this.locationsDataList[index].isShowUpdateProcessing = false;
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "update",
                  error: error
                });
              });
          } else {
            vm.isProcessing = false;
            $scope.message = "Nothing to update.";
            vm.opdone = true;
            let response = {
              status: 403
            };
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "update",
              response: response,
              inserted_id: payload.id
            });
          }
        } else {
          // If there is any validation error then assign back the old data to the $scope.head object
          vm.LocationsMap[$scope.head.id] = vm.old_data;
          vm.LocationsMap[$scope.head.id].isShowUpdateProcessing = false;
          vm.locationsDataList[vm.locationIndex] = vm.old_data;
          vm.isProcessing = false;
          let response = {
            status: 412,
            form_validation_error: vm.validationError
          };
          $scope.$broadcast("saveOrUpdateUdd", {
            event: "update",
            response: response,
            inserted_id: payload.id
          });
        }
      }
    };

    vm.delete = (payload, is_proceed) => {
      vm.isLoadingDelete = true;
      if (!vm.disableActions) {
        payload.is_proceed = is_proceed;
        LocationFactory.API.DeleteLocation(payload)
          .then(response => {
            vm.isLoadingDelete = false;
            vm.opdone = true;
            let index = vm.locationsDataList.findIndex(
              location => location.id === payload.id
            );

            //if group by filter is applied then delete location from group array
            if (vm.groupByField) {
              //find index of group under which current location exist
              let groupFieldIndex = vm.groupLocations.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );

              //find index of location from locations list under the selected group
              let groupIndex = vm.groupLocations[
                groupFieldIndex
              ].locations.findIndex(
                location => parseInt(location.id) === parseInt(payload.id)
              );
              //Delete location from list
              vm.groupLocations[groupFieldIndex].locations.splice(
                groupIndex,
                1
              );
              vm.groupLocations[groupFieldIndex].count -= 1; //decrease location count of the group
              delete vm.groupLocationsMap[payload.id];
              vm.limit =
                vm.groupLocations[groupFieldIndex].locations.length + vm.limit;
              vm.groupLocations[groupFieldIndex].groupPage -= 1;
            }
            vm.locationsDataList.splice(index, 1);
            //delete vm.LocationsMap[payload.id];
            vm.LocationsMap.splice(payload.id, 1);
            vm.totalRecordCount = vm.totalRecordCount - 1;
            vm.exit();
            vm.closeForm();
            /* variables to reset the Notification message-start */
            $scope.locationSuccessMessage = null;
            $scope.locationErrorMessage = null;
            $scope.locationUDDSuccessMessage = null;
            vm.deleteTaxForLocation();
            /* variables to reset the Notification message-end */
          })
          .catch(error => {
            vm.isLoadingDelete = false;
            vm.isError = true;
            if (error.status === 412) {
              vm.isFullfillment = false;
              _.each(error.data.dependency, dep => {
                if (
                  dep.dependent_entity.toLowerCase() ===
                  "location fullfillment" ||
                  dep.dependent_entity.toLowerCase() === "delivery date"
                ) {
                  vm.isFullfillment = true;
                  vm.dependencyList = error.data.dependency;
                  vm.showDependencyDetailsData = true;
                  $timeout(() => {
                    $("#rcrightsidebar").focus();
                  }, 0);
                }
              });
            } else {
              vm.deleteLocationMessage = "Error while deleting Location";
            }
            $timeout(() => {
              vm.deleteLocationMessage = null;
            }, 3500);
          });
      }
    };

    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.$showErrorDetailsData = true;
      vm.$showErrorDetails = true;
    };

    // function to check if fulfillment center is being updated or reset has delivery dates scheduled
    // if Yes and if selected center is assigned to only one location then do NOT Allow to reset/update
    // if Yes and if selected center is assigned to multiple locations location then Allow to reset/update
    // if No then allow to reset/update
    vm.getDeliverySlotsByFulfillmentLocation = (
      locationId,
      locationName,
      isResetFlag
    ) => {
      if (locationId) {
        // get locations for selected fulfillment center id
        LocationFactory.API.FetchLocationsGraph(
          ["id", "name"],
          "fulfilment_center_id",
          locationId
        )
          .then(response => {
            let locationsList = response;
            // get delivery dates for current fulfillment center
            LocationFactory.API.FetchDeliveryDatesForFulfillmentLocation({
              fulfilling_location_id: Number(locationId)
            })
              .then(response => {
                // if current fulfillment center is assigned to multiple locations
                if (locationsList.length > 1) {
                  vm.showFullfillmentCenterDependencyError = false;
                  if (isResetFlag) {
                    $scope.head.fulfilment_center_id = null;
                    $scope.head.fulfilment_center = "";
                  }
                } else if (locationsList.length === 1 && response.length > 0) {
                  // if current fulfillment center is assigned to only one locations and delivery is scheduled for the fulfillment center
                  vm.showFullfillmentCenterDependencyError = true;
                  $scope.head.fulfilment_center_id = locationId;
                  $scope.head.fulfilment_center = locationName;
                  $timeout(() => {
                    vm.showFullfillmentCenterDependencyError = false;
                  }, 3500);
                } else if (response.length === 0 && isResetFlag) {
                  // if no delivery is scheduled for fulfillment center
                  $scope.head.fulfilment_center_id = null;
                  $scope.head.fulfilment_center = "";
                }
              })
              .catch(error => {
                logger.error(error);
              });
          })
          .catch(error => {
            logger.error(error);
          });
      } else if (isResetFlag) {
        $scope.head.fulfilment_center_id = null;
        $scope.head.fulfilment_center = "";
      }
    };

    vm.reloadUDDs = () => {
      $scope.isEnabled = false;
      common.$timeout(() => {
        $scope.isEnabled = true;
      }, 10);
    };

    //to show details of dependent entity in side panel
    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetails = true;
    };

    vm.openAddressContactPanel = () => {
      vm.showAddrCnt = true;
      vm.isShowHistory = false; // close history panel on open of address and contacts panel
      $scope.isShowAddressContactPanel = true;
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("entityName", "Location");
    };

    $scope.closeAddrCntPanel = () => {
      $scope.isShowAddressContactPanel = false;
      $timeout(() => {
        vm.showAddrCnt = false;
      }, 500);
    };

    $scope.openAddressPanel = instanceId => {
      vm.instance_id = instanceId;
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    $scope.openContactsPanel = instanceId => {
      AddressContactService.API.StoreVariable("uuid", vm.uuid);
      AddressContactService.API.StoreVariable("instance_id", instanceId);
    };

    vm.openFiltersPanel = () => {
      vm.showTreeViewPanel = false;
      if (!vm.isFilterApplied) {
        vm.clearPath = true;
        vm.clearHead();
      }
      $state.go("common.prime.location.filter");
    };

    vm.treeViewPanels = [];
    vm.toggleTreeViewPanel = data => {
      vm.selectedTreeValueData = data.selectedHierarchyValue;
      if (vm.treeViewPanels[data.primaryHierarchyId] === undefined) {
        vm.treeViewPanels[data.primaryHierarchyId] = data;
      }

      for (let i = 0; i < Object.keys(vm.treeViewPanels).length; i++) {
        if (vm.treeViewPanels[data.primaryHierarchyId] && !data.currentFlag) {
          delete vm.treeViewPanels[data.primaryHierarchyId];
        }
      }

      /// Importatnt: if hierarchy value is reset in advanced search panel then remove same from filters object
      if (
        !data.isReset &&
        vm.old_filters &&
        ("primaryLocationHierarchyValueId" in vm.old_filters ||
          "pricingClassificationGroupValueId" in vm.old_filters ||
          "assortmentClassificationGroupValueId" in vm.old_filters)
      ) {
        vm.filters.assortmentClassificationGroupValueId =
          $scope.assortment_classification_group_value_id;
        vm.filters.primaryLocationHierarchyValueId =
          $scope.primary_location_hierarchy_value_id;
        vm.filters.pricingClassificationGroupValueId =
          $scope.pricing_classification_group_value_id;
      }

      //if filter is applied with primary hierarchy fields
      if (
        data.isReset &&
        !$state.current.name.includes(".new") &&
        !$state.current.name.includes(".update")
      ) {
        /// If primary location hierarchy is reset then remove value from filters payload
        if (
          data.primaryHierarchyId ===
          $scope.locationConfig.primary_location_hierarchy_id
        ) {
          delete vm.filters.primaryLocationHierarchyValueId;
        }
        /// If primary pricing classification group is reset then remove value from filters payload
        if (
          data.primaryHierarchyId ===
          $scope.locationConfig.pricing_classification_group
        ) {
          delete vm.filters.pricingClassificationGroupValueId;
        }
        /// If assortment classification group is reset then remove value from filters payload
        if (
          data.primaryHierarchyId ===
          $scope.locationConfig.assortment_classification_group
        ) {
          delete vm.filters.assortmentClassificationGroupValueId;
        }
      }

      if (Object.keys(vm.treeViewPanels).length === 0) {
        vm.showTreeViewPanel = false;
      } else {
        vm.showTreeViewPanel = true;
      }
    };

    vm.goToPreviusState = () => {
      $state.go("common.prime.location");
    };

    vm.resetFilters = refresh => {
      vm.isResetFilter = true;
      vm.isPrimaryHierarchyLoaded = false;
      vm.message = null;
      vm.errorMessage = null;
      vm.filters.locationTypeIds = [];
      vm.filters.currentStatusIds = [];
      vm.filters.nextStatusIds = [];
      $scope.head = {};
      $scope.primary_location_hierarchy_value_id = null;
      $scope.pricing_classification_group_value_id = null;
      $scope.assortment_classification_group_value_id = null;

      vm.filters["primaryLocationHierarchyValueId"] = null;
      vm.filters["pricingClassificationGroupValueId"] = null;
      vm.filters["assortmentClassificationGroupValueId"] = null;
      vm.clearPath = true;
      vm.applyFiltersBtnLabel = "Apply Filters";
      /*
        Only on click of the reset button in the filter panel the message
        for the reset will be shown by passing -1.
      */
      if (refresh === -1) {
        if (JSON.stringify(vm.old_filters) !== "{}") {
          vm.resetMessage = "Filter reset successfull!";
        }
        $timeout(() => {
          vm.resetMessage = null;
          this.showAdvancedSearchPanel(true);
        }, 500);
      }
      if (vm.isFilterApplied && JSON.stringify(vm.old_filters) !== "{}") {
        vm.reloadLocationCountAndList();
      }
      vm.applyFilterSuccess = true;
      vm.isFilterApplied = false;
      $timeout(() => {
        vm.isResetFilter = false;
        vm.isPrimaryHierarchyLoaded = true;
        vm.advancedSearchPanel = false;
        vm.old_filters = {};
      }, 0);
    };

    // Reset not applied filter arrays.
    vm.resetUnusedFiltersArrays = refresh => {
      (vm.filters.locationTypeIds && !vm.filters.locationTypeIds.length) ?
        (delete vm.filters.locationTypeIds) :
        "";
      (vm.filters.currentStatusIds && !vm.filters.currentStatusIds.length) ?
        (delete vm.filters.currentStatusIds) :
        "";
      (vm.filters.nextStatusIds && !vm.filters.nextStatusIds.length) ?
        (delete vm.filters.nextStatusIds) :
        "";
      vm.getFilterCount();
    };

    // Calculet filter count.
    vm.getFilterCount = () => {
      vm.appliedFilterCount = 0;
      vm.filters.locationTypeIds && vm.filters.locationTypeIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.currentStatusIds && vm.filters.currentStatusIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters.nextStatusIds && vm.filters.nextStatusIds.length ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters["primaryLocationHierarchyValueId"] ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters["pricingClassificationGroupValueId"] ?
        vm.appliedFilterCount++
        :
        "";
      vm.filters["assortmentClassificationGroupValueId"] ?
        vm.appliedFilterCount++
        :
        "";
    };

    vm.focusSearchField = () => {
      angular.element("#inlineSearch").focus();
      vm.showFilter = true;
    };

    vm.reloadHierarchy = true;
    vm.showAdvancedSearchPanel = flag => {
      $timeout(() => {
        $("#advanced-search").collapse("hide");
        vm.old_filters ? (vm.filters = _.clone(vm.old_filters)) : "";
        // First time when the panel is opened reset all the values
        if (!vm.advancedSearchPanel) {
          vm.resetFilters();
        } else {
          // When vm.advancedSearchPanel is true, then resetUnusedFiltersArrays() will resets the not applied filters.
          // (this is when checks some values and clicks on search button without clicking on apply filter).
          vm.resetUnusedFiltersArrays();
        }
        if (flag) {
          vm.showFilter = !vm.showFilter;
        }
        if (vm.showFilter) {
          $scope.primary_location_hierarchy_value_id =
            vm.filters.primaryLocationHierarchyValueId;
          $scope.pricing_classification_group_value_id =
            vm.filters.pricingClassificationGroupValueId;
          $scope.assortment_classification_group_value_id =
            vm.filters.assortmentClassificationGroupValueId;
          vm.reloadHierarchy = false;
          $timeout(() => {
            vm.reloadHierarchy = true;
          }, 0);
        }
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
      }, 300);
    };

    vm.setInitialHeight = () => {
      $timeout(() => {
        vm.showFilter ? vm.showAdvancedSearchPanel() : "";
      }, 0);
    };

    vm.applyFilters = () => {
      vm.message = null;
      vm.errorMessage = null;
      vm.prepareFilterData();
      vm.filters.length > 0 ?
        (vm.applyFilterSuccess = true) :
        (vm.applyFilterSuccess = false);
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
          "locationTypeIds" in vm.filters ||
          "currentStatusIds" in vm.filters ||
          "nextStatusIds" in vm.filters ||
          "primaryLocationHierarchyValueId" in vm.filters ||
          "pricingClassificationGroupValueId" in vm.filters ||
          "assortmentClassificationGroupValueId" in vm.filters ||
          !angular.equals(vm.old_filters, vm.filters)
        ) {
          if (
            !angular.equals(vm.old_filters, vm.filters) ||
            !vm.isFilterApplied ||
            (vm.isGroupByApplied && !vm.isGroupByFilterApplied)
          ) {
            vm.page = 1;
            vm.applyFiltersBtnLabel = "Applying Filters...";
            vm.reloadLocationCountAndList()
              .then(() => {
                vm.advancedSearchPanel = true;
                if (vm.isGroupByApplied) {
                  vm.isGroupHeader = true;
                  vm.isGroupByFilterApplied = true;
                }
                vm.isFilterApplied = true;
                vm.old_filters = _.clone(vm.filters);
                vm.message = "Filter applied successfully!";
                vm.applyFilterSuccess = true;
                vm.applyFiltersBtnLabel = "Apply Filters";
                $timeout(() => {
                  vm.message = null;
                  vm.errorMessage = null;
                  this.showAdvancedSearchPanel(true);
                }, 1000);
              })
              .catch(error => {
                vm.errorMessage = "Unable to apply filter!";
                vm.applyFiltersBtnLabel = "Apply Filters";
                vm.showFilter = false;
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
          vm.applyFilterMessage = "* Please select atleast one filter to search relevant locations";
        }
      } else {
        vm.applyFilterSuccess = false;
        vm.showFilter = false;
        vm.applyFilterMessage = "* Please select atleast one filter to search relevant locations";
      }
    };

    vm.prepareFilterData = () => {
      if ($scope.primary_location_hierarchy_value_id) {
        vm.filters.primaryLocationHierarchyValueId =
          $scope.primary_location_hierarchy_value_id;
      }
      if ($scope.pricing_classification_group_value_id) {
        vm.filters.pricingClassificationGroupValueId =
          $scope.pricing_classification_group_value_id;
      }

      if ($scope.assortment_classification_group_value_id) {
        vm.filters.assortmentClassificationGroupValueId =
          $scope.assortment_classification_group_value_id;
      }

      for (let property in vm.filters) {
        if (
          vm.filters[property] === undefined ||
          vm.filters[property] === null ||
          (Array.isArray(vm.filters[property]) && vm.filters[property].length === 0)
        ) {
          delete vm.filters[property];
        }
      }
    };

    vm.closeForm = () => {
      vm.isShowDetails = false;
      vm.showLocationPage = true;
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      $state.go("common.prime.location");
    };

    vm.closePanels = () => {
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = () => {
      vm.showDependencyDetails = false;
    };

    vm.setDefaultShortName = (description, shortName) => {
      if (
        (description && !shortName) ||
        (description && shortName.length === 0)
      ) {
        $scope.head.short_name = description;
      }
    };

    vm.setStages = () => {
      vm.createForm = true;
      vm.configureScreen = false;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
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

    vm.copyToHead = value => {
      $scope.head = value;
      $scope.edit_master_id = value.id;
      $scope.master_id = value.id;
    };

    vm.clearHead = () => {
      $scope.head = {};
      $scope.edit_master_id = "";
    };

    vm.miscellaneousMethods = () => {
      $scope.selectedTreeItem = false;
      $scope.selectedTreePricingItem = false;
      $scope.selectedTreeAssortmentItem = false;

      $scope.end = data => {
        if (
          (
            $state.current.name.includes(".new") ||
            $state.current.name.includes(".update")
          ) &&
          data.hierarchyValueData
        ) {
          $scope.head.primary_location_hierarchy_id =
            data.hierarchyValueData.hierarchy_id;
          $scope.head.primary_location_hierarchy_value_id =
            data.hierarchyValueData.id;
          $scope.head.primary_location_hierarchy_value_name = data.path_name;
          $scope.head.primary_location_hierarchy_value_path =
            data.hierarchyValueData.tree_path;
          $scope.head.primary_location_hierarchy_value_desc =
            data.hierarchyValueData.short_description;
          $scope.head.primary_location_hierarchy_desc = $scope.head.primary_location_hierarchy =
            $scope.locationConfig.primary_location_hierarchy_desc;
        } else if (data.hierarchyValueData) {
          $scope.primary_location_hierarchy_value_name = data.path_name;
          $scope.primary_location_hierarchy_value_id =
            data.hierarchyValueData.id;
          $scope.primary_location_hierarchy_value_path =
            data.hierarchyValueData.tree_path;
        }
        $scope.selectedTreeItem = true;
      };

      $scope.sendPrimayClassificationGroup = data => {
        if (
          $state.current.name.includes(".new") ||
          $state.current.name.includes(".update")
        ) {
          $scope.head.pricing_classification_group_id =
            data.hierarchyValueData.hierarchy_id;
          $scope.head.pricing_classification_group_value_id =
            data.hierarchyValueData.id;
          $scope.head.pricing_classification_group_value_name = data.path_name;
          $scope.head.pricing_classification_group_value_desc =
            data.hierarchyValueData.short_description;
          $scope.head.pricing_classification_group_desc = $scope.head.pricing_classification_group =
            $scope.locationConfig.pricing_classification_group_desc;
        } else {
          $scope.pricing_classification_group_value_id =
            data.hierarchyValueData.id;
          $scope.pricing_classification_group_value_name = data.path_name;
        }
        $scope.selectedTreePricingItem = true;
      };
      $scope.sendAssortmentClassificationGroup = data => {
        if (
          $state.current.name.includes(".new") ||
          $state.current.name.includes(".update")
        ) {
          $scope.head.assortment_classification_group_id =
            data.hierarchyValueData.hierarchy_id;
          $scope.head.assortment_classification_group_value_id =
            data.hierarchyValueData.id;
          $scope.head.assortment_classification_group_value_name =
            data.path_name;
          $scope.head.assortment_classification_group_value_desc =
            data.hierarchyValueData.short_description;
          $scope.head.assortment_classification_group_desc =
            $scope.locationConfig.assortment_classification_group_desc;
        } else {
          $scope.assortment_classification_group_value_id =
            data.hierarchyValueData.id;
          $scope.assortment_classification_group_value_name = data.path_name;
        }
        $scope.selectedTreeAssortmentItem = true;
      };
      $scope.resetValidation = () => {
        $scope.selectedTreePricingItem = false;
        $scope.selectedTreeAssortmentItem = false;
        $scope.selectedTreeItem = false;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      };

      $scope.effective_val = true;
      $scope.changeevent = location => {
        if (location.next_status_id === 500) {
          $scope.effective_val = false;
        } else {
          $scope.effective_val = true;
        }
      };
    };

    /*********** Groub by field implementation ************/
    vm.groupByData = groupByColumn => {
      return new Promise((resolve, reject) => {
        vm.isGroupHeader = false;
        vm.isGroupByApplied = true;
        vm.isFilterApplied === true ? (vm.isGroupByFilterApplied = true) : "";
        vm.groupLocations = [];
        if (groupByColumn.length > 0) {
          vm.pagination();
          /** ---------- Get locations based on page and limit ----------
           * sort by field and order initially none and asc
           * may change according to the user customization
           * No parameter means, get all the records without any conditions.
           *
           * NOTE: First two undefined parameters are for page and limit AND third empty object is for filter
           */
          vm.groupByField = groupByColumn;
          LocationFactory.API.GetLocations(
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
                    vm.groupLocations.push(response.data.data[i]);
                  } else {
                    response.data.data[i].selected = 1;
                    response.data.data[i].expanded = false;
                    vm.groupLocations.push(response.data.data[i]);
                  }
                } else {
                  response.data.data[i].selected = 1;
                  response.data.data[i].expanded = false;
                  vm.groupLocations.push(response.data.data[i]);
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
          vm.GetLocationsCount();
          vm.scrollToPosition(0, 0);
          vm.FetchLocations()
            .then(response => {
              resolve(response);
            }).catch(error => {
              reject(error);
            });
        }
      });
    };

    vm.goToClonePanel = location => {
      location.isLoadingClone = true;
      location.name.includes("Clone") || location.name.includes("clone") ?
        "" :
        $state
          .go("common.prime.location.clone", {
            id: location.id
          })
          .then(() => {
            if (location.isLoadingClone) {
              $timeout(() => {
                location.isLoadingClone = false;
              }, 0);
            }
          });
    };

    vm.MapGroupLocations = list => {
      for (let i = 0; i < list.length; i++) {
        if (vm.groupLocationsMap[list[i].id] === undefined) {
          vm.groupLocationsMap[list[i].id] = list[i];
        }
      }
    };

    vm.showLocationData = (groupByField, groupData) => {
      groupData.expanded = !groupData.expanded;
      groupData.isLocationsLoaded = false;
      if (groupData.locations === undefined) {
        vm.groupByValue = groupData[groupByField];
        groupData.groupPage = 1;
        vm.pagination();
        LocationFactory.API.GetLocations({
          page: groupData.groupPage,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: groupByField,
          value: vm.groupByValue
        }
        )
          .then(res => {
            groupData.isLocationsLoaded = true;
            if (res.data.data.length > 0) {
              groupData.locations = res.data.data;
              groupData.availableGroupLocations =
                groupData.count - res.data.data.length;
              vm.groupLocationsMap = [];
              vm.LocationsMap = [];
              vm.MapGroupLocations(groupData.locations);
              // load location cover images when locations are grouped by field
              vm.FetchLakeDropsForLocation();
              vm.loadGroupByThumbNailImages("165x165", groupData.locations);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        groupData.isLocationsLoaded = true;
      }
    };

    //when click on expand all in group by panel, data for all group by locations should be fetched
    vm.loadGroupDataOnExpandAll = groupByField => {
      let object = {
        [groupByField]: []
      };
      for (let i = 0; i < vm.groupLocations.length; i++) {
        if (vm.groupLocations[i].locations === undefined) {
          object[groupByField].push(vm.groupLocations[i][groupByField]);
        }
      }

      if (object[groupByField].length) {
        vm.groupPage = 1;
        LocationFactory.API.GroupByFieldAndValues(
          object,
          vm.groupPage,
          vm.limit
        )
          .then(response => {
            for (let i = 0; i < vm.groupLocations.length; i++) {
              if (vm.groupLocations[i].locations === undefined) {
                vm.groupLocations[i].locations = $filter("filter")(
                  response,
                  vm.groupLocations[i][groupByField]
                );
                vm.groupLocations[i].availablegroupLocations =
                  vm.groupLocations[i].count - response.length;
                vm.originalLocationsDataList = JSON.parse(
                  JSON.stringify(vm.groupLocations[i].locations)
                );
                vm.groupLocations[i].isLocationsLoaded = true;
              }
            }
            vm.loadGroupByThumbNailImages("165x165", response); // load sku cover images when items are grouped by field
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.loadGroupByThumbNailImages = (size, locations) => {
      if (locations) {
        for (let i = 0; i < locations.length; i++) {
          let thumbnail = vm.thumbnails.filter(lake => {
            return lake.instance_id == locations[i].id;
          });
          if (thumbnail[0]) {
            if (!thumbnail[0].url) {
              locations[
                i
              ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                thumbnail[0].drop_id,
                size,
                vm.uuid
              );
            } else if (thumbnail[0].url) {
              locations[i].thumbnail = thumbnail[0].url;
            }
            locations[i].drop_id = thumbnail[0].drop_id;
          }
        }
      }
    };

    ///Group by Panel: Select or Unselect all the item groups
    vm.toggleAllGroups = isSelectAll => {
      for (let i = 0; i < vm.groupLocations.length; i++) {
        if (isSelectAll) {
          vm.groupLocations[i].selected = 1;
        } else {
          vm.groupLocations[i].expanded = false;
          vm.groupLocations[i].locations = undefined; //remove data from group after Unselect all
          vm.groupLocations[i].selected = 0;
        }
      }
    };

    vm.toggleselectedGroupLocation = (gc, index) => {
      if (gc.selected) {
        for (let x = 0; x < vm.selectedGroupHeader.length; x++) {
          if (
            vm.selectedGroupHeader[x][vm.groupByField] === gc[vm.groupByField]
          ) {
            vm.selectedGroupHeader.splice(x, 1);
          }
        }
        gc.locations = undefined;
        for (let i = 0; i < vm.groupLocations.length; i++) {
          vm.groupLocations[i].isLocationsLoaded = undefined;
        }
      } else {
        vm.selectedGroupHeader.push(gc);
      }
      gc.expanded = false;
    };

    //load next batch of records on click of load more button
    vm.loadMoreLocationData = (groupByField, groupData) => {
      groupData.isMoreLocationsLoaded = false;
      vm.groupByValue = groupData[groupByField];
      if (groupData[groupByField]) {
        groupData.groupPage = groupData.groupPage + 1;
        vm.pagination();
        LocationFactory.API.GetLocations({
          page: groupData.groupPage,
          limit: vm.limit
        },
          vm.filters, {
          field: vm.sortByField,
          order: vm.sortByOrder
        }, {
          field: groupByField,
          value: vm.groupByValue
        }
        )
          .then(res => {
            let data = res.data || res;
            groupData.isMoreLocationsLoaded = true;
            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                if (!vm.groupLocationsMap[data[i].id]) {
                  groupData.locations.push(data[i]);
                  vm.groupLocationsMap[data[i].id] = data[i];
                }
              }
              groupData.availableGroupLocations =
                groupData.count - groupData.locations.length;
              vm.loadGroupByThumbNailImages("165x165", groupData.locations);
              vm.SetLocationLimitPerPage();
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
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

    //This function will be called when click event happens on Next button taking screen name as parameter to move forward
    vm.goToScreen = screen => {
      vm.resetFormField()
      vm.validationMessage = null;
      vm.validationError = [];
      vm.publishResponseMessage = false;
      vm.locdataUploaderror = false;
      vm.opdone = false;
      if (screen && screen.toLowerCase() === "locationmasterscreen") {
        vm.validationMessage = null;
        vm.createForm = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
      } else if (
        screen &&
        screen.toLowerCase() === "userdefineddataconfigurationscreen"
      ) {
        vm.createForm = false;
        vm.configureScreen = true;
        vm.manageDropScreen = false;
        vm.back = true;
        vm.previewAndPublish = false;
        $scope.isEnabled = true;
        // $scope.$broadcast("initUserDefinedData", {
        //   a: 10
        // });
        vm.validationMessage = null;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      } else if (screen && screen.toLowerCase() === "dropconfigurationscreen") {
        vm.createForm = false;
        vm.configureScreen = false;
        vm.manageDropScreen = true;
        vm.back = true;
        vm.validationMessage = null;
        vm.previewAndPublish = false;
        vm.ffe()
      } else if (screen && screen.toLowerCase() === "publishscreen") {
        vm.createForm = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.back = true;
        vm.validationMessage = null;
        vm.previewAndPublish = true;
      }
    };

    //This function will be called when click event happens on Next button taking screen name as parameter to move forward
    vm.updateFormValidation = () => {
      vm.validationError = [];
      vm.isInvalidForm = false;
      //if current screen is create/update master data form and form data
      //is valid and all mandatory fields are filled then go to next stage
      if (
        !vm.loc_maint_form.$invalid &&
        $scope.head.primary_location_hierarchy_value_id !== undefined &&
        $scope.head.primary_location_hierarchy_value_id !== null &&
        $scope.head.pricing_classification_group_value_id !== undefined &&
        $scope.head.pricing_classification_group_value_id !== null &&
        $scope.head.assortment_classification_group_value_id !== undefined &&
        $scope.head.assortment_classification_group_value_id !== null
      ) {
        vm.isInvalidForm = false;
      } else {
        //Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in Location Master Screen."
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
      return vm.isInvalidForm;
    };

    vm.continueFn = screen => {
      if (vm.configureScreen === undefined) {
        vm.createForm = false;
        vm.previewAndPublish = true;
        vm.validationMessage = null;
        vm.back = false;
      } else if (screen && screen.toLowerCase() === "createform") {
        //if current screen is create/update master data form and form data
        //is valid and all mandatory fields are filled then go to next stage
        vm.loc_maint_form === undefined ? (vm.loc_maint_form = {}) : null;
        if (
          !vm.loc_maint_form.$invalid &&
          $scope.head.primary_location_hierarchy_value_id !== undefined &&
          $scope.head.primary_location_hierarchy_value_id !== null &&
          $scope.head.pricing_classification_group_value_id !== undefined &&
          $scope.head.pricing_classification_group_value_id !== null &&
          $scope.head.assortment_classification_group_value_id !== undefined &&
          $scope.head.assortment_classification_group_value_id !== null
        ) {
          vm.createForm = false;
          vm.configureScreen = true;
          vm.back = true;
          vm.validationMessage = null;
          $scope.isEnabled = true;
          //Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
        } else {
          //Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        //if current screen is configure screen and  udd values form data valid
        //and all mandatory fields are filled then go to next stage
        if (vm.uddForm && !vm.uddForm.$invalid) {
          vm.configureScreen = false;
          vm.manageDropScreen = true;
          vm.back = true;
          vm.validationMessage = null;
          //Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
        } else {
          //Variable to set the validation to true if validation is not met
          vm.isInvalidForm = true;
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        if ($scope.files && $scope.files.length > 0) {
          let btnLable = vm.isUpdate ? "'Upload Image'" : "'Add to Queue'";
          if (vm.drop_form.$valid) {
            vm.validationMessage = `Please click on ${btnLable} button to link drop to location. Click on 'Skip' button to proceed without uploading.`;
          } else {
            vm.validationMessage = `Please fill in the required fields and click on ${btnLable} button to link drop to location or Click on 'Skip' button to proceed without uploading.`;
          }
        } else {
          vm.manageDropScreen = false;
          vm.previewAndPublish = true;
          vm.back = true;
          vm.validationMessage = null;
        }
      } else if (screen && screen.toLowerCase() === "skip") {
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.back = true;
        vm.validationMessage = null;
      }
    };

    vm.backFn = screen => {
      if (vm.configureScreen === undefined) {
        vm.back = false;
        vm.refineFn();
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        vm.validationMessage = null;
        vm.createForm = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.onSelfFulfilmentLocation();
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        vm.validationMessage = null;
        vm.manageDropStage = false;
        vm.manageDropScreen = false;
        vm.configureScreen = true;
        vm.back = true;
        $scope.isEnabled = true;
      } else {
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
      }
      vm.itemdataAddToQueueError = false;
    };

    vm.refineFn = () => {
      vm.createForm = true;
      vm.configureScreen = false;
      vm.previewAndPublish = false;
    };
    vm.confirmDelete = false;

    vm.isConfirmDelete = () => {
      vm.deleteLocationMessage = null;
      vm.confirmDelete = !vm.confirmDelete;
      vm.isError = false;
      vm.isFullfillment = false;
    };

    vm.exit = opType => {
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.showFilter ? vm.showAdvancedSearchPanel() : "";
      $scope.isEnabled = false;
      //Set a variable to check if location is in update state
      vm.isUpdateLocation = false;
      if (opType == "create") {
        if (
          ($scope.head && $scope.head.name !== undefined) ||
          ($scope.head && $scope.head.short_name !== undefined) ||
          ($scope.head &&
            $scope.head.primary_location_hierarchy_value_id !== undefined) ||
          ($scope.head &&
            $scope.head.pricing_classification_group_value_id !== undefined) ||
          ($scope.head &&
            $scope.head.assortment_classification_group_value_id !==
            undefined) ||
          ($scope.head && $scope.head.type_id !== undefined) ||
          ($scope.head && $scope.head.fulfilment_center_id !== undefined) ||
          ($scope.head && $scope.head.self_fulfilment_center !== undefined)
        ) {
          $("#formCancellationModal").modal("show");
        } else {
          //Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
          vm.resetModel(); //reset manage drops page to initial state
          $state.go("common.prime.location");
        }
      } else if (opType == "update") {
        if (
          vm.old_data.name !== $scope.head.name ||
          vm.old_data.short_name !== $scope.head.short_name ||
          vm.old_data.status_id !== $scope.head.status_id ||
          vm.old_data.primary_location_hierarchy_value_id !==
          $scope.head.primary_location_hierarchy_value_id ||
          vm.old_data.next_status_id !== $scope.head.next_status_id ||
          vm.old_data.pricing_classification_group_value_id !==
          $scope.head.pricing_classification_group_value_id ||
          vm.old_data.assortment_classification_group_value_id !==
          $scope.head.assortment_classification_group_value_id ||
          vm.old_data.type_id !== $scope.head.type_id ||
          (vm.old_data.fulfilment_center_id &&
            ($scope.head.fulfilment_center_id ||
              $scope.head.fulfilment_center_id === null) &&
            parseInt(vm.old_data.fulfilment_center_id) !==
            parseInt($scope.head.fulfilment_center_id)) ||
          $scope.getDateBasedOnFormat(vm.old_data.effective_date) !==
          $scope.getDateBasedOnFormat($scope.head.effective_date) ||
          $scope.getDateBasedOnFormat(vm.old_data.next_effective_date) !==
          $scope.getDateBasedOnFormat($scope.head.next_effective_date)
        ) {
          $("#formCancellationModal").modal("show");
        } else {
          //Variable to set the validation to false if the required validation is met
          vm.isInvalidForm = false;
          vm.resetModel(); //reset manage drops page to initial state
          $state.go("common.prime.location");
        }
      } else {
        //Variable to set the validation to false if the required validation is met
        vm.itemdataAddToQueueError = false;
        vm.isInvalidForm = false;
        vm.resetModel(); //reset manage drops page to initial state
        $state.go("common.prime.location");
      }
    };
    vm.hideCancelPopUp = confirmCancel => {
      if (confirmCancel == 0) {
        $("#formCancellationModal").modal("hide");
        angular.element("body").removeClass("modal-open");
        if (vm.old_data) {
          //Reset the location object to the old data
          vm.LocationsMap[$scope.head.id] = vm.old_data;
          vm.locationsDataList[vm.locationIndex] = vm.old_data;
          vm.LocationsMap[$scope.head.id].isShowUpdateProcessing = false;
          //Set is update location form to true
          vm.isUpdateLocation = true;
        } else {
          // Reset the location object to the new data
          vm.createForm = true;
          vm.isUpdateLocation = false;
          vm.configureScreen = false;
          vm.manageDropScreen = false;
          vm.previewAndPublish = false;
        }
      } else if (confirmCancel == 1) {
        $("#formCancellationModal").modal("hide");
        angular.element("body").removeClass("modal-open");
        vm.LocationsMap[$scope.head.id] = vm.old_data;
        vm.locationsDataList[vm.locationIndex] = vm.old_data;
        vm.resetModel(); //reset manage drops page to initial state
        $state.go("common.prime.location");
        vm.LocationsMap[$scope.head.id].isShowUpdateProcessing = false;
      }
    };

    $scope.getAccessPermissions(vm.uuid)
      .then(() => {
        vm.Activate();
      })
      .catch(() => {
        vm.Activate();
      })
    vm.miscellaneousMethods();
  }
})();
