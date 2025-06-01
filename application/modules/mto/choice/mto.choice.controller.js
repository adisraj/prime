(() => {
  "use strict";
  angular
    .module("rc.prime.mto.choice")
    .controller("MTOChoiceController", MTOChoiceController);

  /* Service - Path
   * MTOService - application/modules/mto/maintenance/mto.maintenance.factory.js
   * MTOChoiceService - application/modules/mto/choice.mto.choice.factory.js
   * MTOCollectionService - application/modules/mto/collection/mto.collection.factory.js
   * MTOPriceGroupService - application/modules/mto/pricegroup/mto.pricegroup.factory.js
   * MTOFamilyService - application/modules/mto/family/mto.family.factory.js
   * MTOParameterService - application/modules/mto/parameter/mto.parameter.factory.js
   * AttributeValueService - application/modules/attributes/attribute.value.factory.js
   * DataLakeAPIService - application/modules/api/data_lake_service.js
   */

  MTOChoiceController.$inject = [
    "$scope",
    "$window",
    "common",
    "MTOService",
    "MTOChoiceService",
    "MTOCollectionService",
    "MTOPriceGroupService",
    "MTOFamilyService",
    "MTOParameterService",
    "AttributeValueService",
    "UserService",
    "DataLakeAPIService",
    "DataLakeService",
    "StatusCodes"
  ];

  function MTOChoiceController(
    $scope,
    $window,
    common,
    MTOService,
    MTOChoiceService,
    MTOCollectionService,
    MTOPriceGroupService,
    MTOFamilyService,
    MTOParameterService,
    AttributeValueService,
    UserService,
    DataLakeAPIService,
    DataLakeService,
    StatusCodes
  ) {
    let vm = this;

    let $filter = common.$filter;
    let $state = common.$state;
    let $stateParams = common.$stateParams;
    let $timeout = common.$timeout;
    let logger = common.Logger.getInstance("MTOChoiceController");
    let EntityDetails = common.EntityDetails;
    let ApplicationPermissions = common.ApplicationPermissions;
    let LocalMemory = common.LocalMemory;
    let Identifiers = common.Identifiers;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let Notification = common.Notification;
    vm.$state = $state;
    vm.statusCodes = StatusCodes;

    /**variable declaration */
    $scope.choiceHead = {};
    vm.entityInformation = {};
    vm.mtoChoiceDataList = [];
    vm.originalMTOChoiceDataList = [];
    vm.selected_mto = {};
    vm.groupMTOChoice = {};
    vm.isChoiceGrids = true;
    vm.ChoicesMap = [];
    vm.groupChoicesMap = [];
    vm.choiceGroupByDropdown = [];
    vm.allCollections = [];
    vm.allFamilies = [];
    vm.allPriceGroups = [];
    vm.allAttributeValues = {};
    vm.attributeValuesMap = {};
    $scope.uddValidationErrors = [];
    vm.filters = {};
    $scope.drop = {};
    vm.isShowDetails = false;
    vm.isUpdate = false;
    vm.opdone = false;
    vm.applyFiltersBtnLabel = "Apply Filters";
    vm.isAddedToQueue = false;
    vm.mtodataAddToQueueError = false;
    vm.saveBtnText = "Save";
    vm.isSaveSuccess = false;
    vm.saveBtnError = false;
    vm.error = false;
    vm.message = null;

    vm.isResetFilter = false;

    vm.family_details = {};
    vm.isShowFamilyDetails = false;
    vm.previousFamily = {};

    vm.price_group_details = {};
    vm.previousPriceGroup = {};
    vm.isShowPriceGroupDetails = false;

    vm.isShowCollectionDetails = false;
    vm.collection_details = {};
    vm.previousCollection = {};
    vm.isGroupByApplied = false;
    vm.isGroupByFilterApplied = false;
    //check dependency related variables
    vm.dependencyList = [];
    vm.errorDependentData = {};
    vm.showDependencyDetailsData = false;
    vm.showDependencyDetails = false;
    vm.showFilter = false; //Variable to hide the Advanced Search panel initially
    vm.advancedSearchPanel = false;

    vm.uuid = "34"; // mto choice uuid
    vm.applyFilterSuccess = true;
    vm.sortByField = "none"; // Variable to hold current sorting field.
    vm.sortByOrder = "desc"; // Variable to hold the order for the sort option.
    vm.groupByField = "";
    vm.groupByValue = null;
    vm.groupChoices = [];
    vm.selectedGroupHeader = [];
    // Variable to hold the access value for 'sku-clone' from user management
    vm.isCloneAllowed = false;
    vm.isLoadingDelete = false;
    // variable to save cover image as thumbnail
    vm.is_thumbnail = 1;
    // variable to call confirmation panel on cover image deletion
    vm.showConfirmDeletion = false;
    // On create, variable to call confirmation panel on cover image deletion
    vm.DeletionConfirmation = false;

    //Selectize object for Family Drop down
    $scope.selectFamily = {
      valueField: "family_id",
      labelField: "family",
      searchField: ["family"],
      sortField: "family",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Family" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: vm.allFamilies,
      render: {
        option: (data, escape) => {
          if (data.status_id === vm.statusCodes.Inactive.ID) {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.family) +
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
              escape(data.family) +
              "</span>" +
              "<span>" +
              "</span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.status) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: (data, escape) => {
          vm.selectedFamily = data.family;
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.family) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    //Set Values valid for sorting
    $scope.sortableFields = [
      {
        field: "Sort By None",
        value: ""
      },
      {
        field: "Description",
        value: "choice_description"
      },
      {
        field: "Collection",
        value: "collection"
      },
      {
        field: "Price Group",
        value: "price_group"
      },
      {
        field: "Status",
        value: "status"
      }
    ];

    //Selectize object for Collection Drop down
    $scope.selectCollection = {
      valueField: "collection_id",
      labelField: "collection",
      searchField: ["collection"],
      sortField: "collection",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select collection" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: vm.allCollections,
      render: {
        option: (data, escape) => {
          if (data.status_id === vm.statusCodes.Inactive.ID) {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.collection) +
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
              escape(data.collection) +
              "</span>" +
              "<span>" +
              "</span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.status) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: (data, escape) => {
          vm.selectedCollection = data.collection;
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.collection) +
            "</span>" +
            "</div>"
          );
        }
      }
    };

    vm.setLimit = () => {
      vm.limit = 50;
    };

    vm.initializeMTOChoice = () => {
      vm.setLimit();
      vm.reloadChoiceCountAndList();
      vm.getSelectedMTOInformation(); //get information of selected entity
      vm.getEntityInformation(); //get Choice information
      vm.getMTOParameters(); // get mto configuartion parameters
      vm.getMtoChoiceMetaData();
      vm.createAttributeValuesMap();
      vm.fetchFeatureAccessDetails();
      vm.loadMTOCollections(); // to load all the MTO Collections irrespective of the vendor ID
      vm.loadMTOFamilies(); // to load all the MTO Families irrespective of the vendor ID
      vm.loadMTOPriceGroups(); // to load all the MTO PriceGroups irrespective of the vendor ID
    };

    // Fetch access for clone
    vm.fetchFeatureAccessDetails = () => {
      UserService.API.IsAllowedFeaturedPassword("choice-clone")
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

    //get required choice information
    vm.getEntityInformation = () => {
      vm.entityInformation = EntityDetails.API.GetEntityInformation(vm.uuid);
      common.EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
          $scope.getStatuses(common.Identifiers.mto_option);
          $scope.getNextStatuses(common.Identifiers.mto_option);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //getting model and set validations rules for mto choice
    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid)
        .then(model => {
          vm.getDynamicColumns(model);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //getting model and set validations rules for mto collection
    vm.getCollectionModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(Identifiers.collections)
        .then(model => { })
        .catch(error => {
          logger.error(error);
        });
    };

    //getting model and set validations rules for mto family
    vm.getFamilyModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(Identifiers.mto_family)
        .then(model => { })
        .catch(error => {
          logger.error(error);
        });
    };

    //getting model and set validations rules for mto price group
    vm.getPriceGroupModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(
        Identifiers.mto_price_group
      )
        .then(model => { })
        .catch(error => {
          logger.error(error);
        });
    };

    //Function to form group by drop down
    vm.getDynamicColumns = model => {
      let supportActions = {};
      let alterTitles = {};
      let drillTo = {};

      ////if selected mto is not collection supported, then remove collection option from group by drop down
      if (!vm.selected_mto.collection_supported) {
        delete model.collection_id;
      }

      ////if selected mto is not family supported, then remove family option from group by drop down
      if (!vm.selected_mto.family_supported) {
        delete model.family_id;
      }

      ////if selected mto does not have price method as Price Group, then remove Price Group option from group by drop down
      if (
        vm.selected_mto &&
        vm.selected_mto.pricing_method &&
        vm.selected_mto.pricing_method.toLowerCase() !== "price group"
      ) {
        delete model.price_group_id;
      }

      //Get group by drop down options list
      let choiceMeta = generateDynamicTableColumnsService.getTableColumns(
        model,
        supportActions,
        alterTitles,
        drillTo
      );

      ////assign group by drop down options list to an empty array
      vm.choiceGroupByDropdown = choiceMeta.dropdownList;
    };

    ///Get meta data for mto choice for e.g drop id
    vm.getMtoChoiceMetaData = () => {
      let thumbnails = DataLakeAPIService.API.GetDropsByUuid(vm.uuid)
        .then(response => {
          if (response.data !== undefined) {
            vm.choice_thumbnails = response.data;
          } else {
            vm.choice_thumbnails = [];
          }
          return response.data;
        })
        .catch(error => {
          logger.error(error);
        });
      return thumbnails;
    };

    //Get thumbnail images for the choice by drop id and uuid to show in data lake panel
    vm.loadThumbNailImages = size => {
      if (vm.mtoChoiceDataList) {
        for (var i = 0; i < vm.mtoChoiceDataList.length; i++) {
          if (vm.choice_thumbnails) {
            let thumbnail = vm.choice_thumbnails.filter(lake => {
              return lake.instance_id == vm.mtoChoiceDataList[i].id;
            });
            if (thumbnail[0]) {
              if (!thumbnail[0].url) {
                if (
                  thumbnail[0].type &&
                  thumbnail[0].type.toLowerCase() === "virtual"
                ) {
                  vm.mtoChoiceDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    "",
                    vm.uuid
                  );
                  vm.mtoChoiceDataList[i].drop_id = thumbnail[0].drop_id;
                  vm.originalMTOChoiceDataList[i].thumbnail =
                    vm.mtoChoiceDataList[i].thumbnail;
                  vm.originalMTOChoiceDataList[i].drop_id =
                    vm.mtoChoiceDataList[i].drop_id;
                } else {
                  vm.mtoChoiceDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    size,
                    vm.uuid
                  );
                  vm.mtoChoiceDataList[i].drop_id = thumbnail[0].drop_id;
                  vm.originalMTOChoiceDataList[i].thumbnail =
                    vm.mtoChoiceDataList[i].thumbnail;
                  vm.originalMTOChoiceDataList[i].drop_id =
                    vm.mtoChoiceDataList[i].drop_id;
                }
              } else if (thumbnail[0].url) {
                vm.mtoChoiceDataList[i].thumbnail = thumbnail[0].url;
              }
            }
          }
        }
      }
    };

    //Load cover images for choices. Parameters passed are choice data and image size
    vm.loadImage = (choice, size) => {
      //Get meta data like drop id for instance
      DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
        vm.uuid,
        choice.id,
        "cover_image"
      )
        .then(response => {
          if (response && response.length > 0) {
            //if drop exists for instance then get image download url
            choice.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
              response[0].drop_id,
              size,
              vm.uuid
            );
          } else {
            choice.thumbnail = undefined;
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

    vm.showHistoryDetails = data => {
      if (vm.mtoChoiceData !== undefined) {
        vm.mtoChoiceData.showhistory = false;
      }
      vm.mtoChoiceData = data;
      vm.mtoChoiceData.showhistory = true;
      vm.isShowHistory = true;
      $scope.instanceName = data.choice_description;
      $scope.isMaintenance = true;
      $scope.loadHistory(data.id);
    };

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

    $scope.closeShowHistory = () => {
      $scope.showhistory = false;
      $scope.isMaintenance = true;
      $scope.instanceName = null;
      if (vm.mtoChoiceData !== undefined) {
        vm.mtoChoiceData.showhistory = false;
      }
    };

    //current mto option information
    vm.getSelectedMTOInformation = () => {
      let mto_id_selected = $stateParams.mto_id;
      MTOService.API.FetchMto(mto_id_selected)
        .then(response => {
          vm.selected_mto = response.data;
          vm.loadCollections(); //load vendor linked collections for selected vendor
          vm.loadFamilies(); //load vendor linked families for selected vendor
          vm.loadPriceGroups(); //load vendor linked price groups for selected vendor
          vm.getModelAndSetValidationRules(); //get validations rules
          !$stateParams.id && $state.current.name.includes(".new")
            ? vm.openForm("mtochoice")
            : "";
        })
        .catch(error => logger.error(error));
    };

    //get mto configuration parameters
    vm.getMTOParameters = () => {
      MTOParameterService.API.GetMTOParameter()
        .then(response => {
          if (response.data[0].status_id !== 200) {
            vm.disableActions = true;
          } else {
            vm.disableActions = false;
          }
        })
        .catch(error => logger.error(error));
    };

    vm.getChoiceCount = () => {
      MTOChoiceService.API.GetChoiceCount($stateParams.mto_id)
        .then(response => {
          $timeout(() => {
            vm.totalRecordCount = response;
            if (vm.mtoChoiceDataList && vm.mtoChoiceDataList.length) {
              vm.availableChoiceCount = vm.totalRecordCount - vm.mtoChoiceDataList.length;
            }
          }, 0);
        })
        .catch(error => logger.error(error));
    };

    // On Press of refresh button fetch choice count and the data
    vm.reloadChoiceCountAndList = refresh => {
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
            vm.getChoiceCount();
            vm.reload(refresh)
              .then(response => {
                resolve(response);
              })
              .catch(error => {
                reject(error);
              });
          } else {
            vm.reload(refresh)
              .then(response => {
                resolve(response);
                vm.totalRecordCount = response.data.filterdRecordCount;
                vm.availableChoiceCount = vm.totalRecordCount - vm.mtoChoiceDataList.length;
              })
              .catch(error => {
                reject(error);
              });
          }
        }
      });
    };

    // Sets current pagination variables
    vm.pagination = () => {
      vm.resetUnusedFilterArrays();
      if (vm.sortByField === "") {
        vm.sortByField = "none";
        vm.sortByOrder = "desc";
      }
      vm.groupByValue = vm.groupByField === "" ? null : vm.groupByValue;
    };

    vm.reload = refresh => {
      return new Promise((resolve, reject) => {
        vm.groupByField = "";
        vm.initMTOUserDefinedDataDirective();
        vm.page = 1;
        vm.isLoaded = false;
        vm.isGroupByApplied = false;
        if (refresh !== undefined) {
          // On click of refresh button, a message bar with information will be toggled in UI
          vm.totalTimeText = "";
          vm.isRefreshing = true;
          vm.refreshTableText = "Refreshing list...";
        }
        vm.pagination();
        MTOChoiceService.API.GetChoicesByOptionId(
          $stateParams.mto_id,
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
            vm.mtoChoiceDataList = response.data.data;
            vm.originalMTOChoiceDataList = JSON.parse(
              JSON.stringify(vm.mtoChoiceDataList)
            );
            vm.loadThumbNailImages("165x165");
            localStorage.removeItem("ChoicePageCount");
            vm.totalRecordCount = response.data.filterdRecordCount;
            vm.availableChoiceCount = vm.totalRecordCount - response.data.data.length;
            MTOService.API.FetchMto($stateParams.mto_id)
              .then(res => {
                if (res.data.collection_supported === 1) {
                  $scope.is_collection = true;
                } else {
                  $scope.is_collection = false;
                }
                if (
                  res.data.pricing_method &&
                  res.data.pricing_method.toLowerCase() === "price group"
                ) {
                  $scope.is_price = true;
                } else {
                  $scope.is_price = false;
                }

                if (res.data.family_supported === 1) {
                  $scope.is_family = true;
                } else {
                  $scope.is_family = false;
                }
              })
              .catch(error => {
                logger.error(error);
              });
            vm.MapChoices(response.data.data);
            vm.isLoaded = true;
            resolve(response);
          })
          .catch(error => {
            logger.error(error);
            vm.isRefreshing = true;
            vm.refreshTableText = "Unsuccessfull!";
            reject(error);
            $timeout(() => {
              vm.isRefreshing = false;
            }, 3500);
          });
      });
    };

    vm.MapChoices = list => {
      for (let i = 0; i < list.length; i++) {
        if (vm.ChoicesMap[list[i].id] === undefined) {
          vm.ChoicesMap[list[i].id] = list[i];
        }
      }
      $stateParams.id && $state.current.name.includes(".update")
        ? vm.gotoUpdateState()
        : "";
    };

    // Scroll bar will be pointed to (x, y) position
    vm.scrollToPosition = (x, y) => {
      window.scrollTo(x, y);
    };

    vm.loadMoreMtoChoice = () => {
      vm.isLoading = true;
      vm.page = parseInt(LocalMemory.API.Get("ChoicePageCount")) || 1;
      vm.pagination();
      if (!vm.isFilterApplied) {
        if (vm.sortByField === "") {
          vm.sortByField = "none";
          vm.sortByOrder = "desc";
        }
        MTOChoiceService.API.GetChoicesByOptionId(
          vm.selected_mto.id,
          { page: vm.page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.mtoChoiceDataList.push(response.data[i]);
                vm.originalMTOChoiceDataList.push(response.data[i]);
              }
              vm.availableChoiceCount =
                vm.totalRecordCount - vm.originalMTOChoiceDataList.length;
              vm.getMtoChoiceMetaData()
                .then(response => {
                  vm.loadThumbNailImages("165x165");
                })
                .catch(error => {
                  logger.error(error);
                });
              vm.setLimit();
              LocalMemory.API.Post("ChoicePageCount", vm.page + 1);
              vm.isLoading = false;
              if (vm.searchMtoChoice) {
                $scope.showhistory = false;
                vm.mtoChoiceDataList = $filter("filter")(
                  vm.originalMTOChoiceDataList,
                  vm.searchMtoChoice
                );
              }
              vm.MapChoices(vm.mtoChoiceDataList);
            } else {
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        MTOChoiceService.API.GetChoicesByOptionId(
          vm.selected_mto.id,
          { page: vm.page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        ).then(response => {
          if (response.data.length > 0) {
            for (let i = 0; i < response.data.length; i++) {
              vm.mtoChoiceDataList.push(response.data[i]);
            }
            !vm.isGroupByFilterApplied
              ? (vm.availableChoiceCount =
                vm.totalRecordCount - vm.mtoChoiceDataList.length)
              : "";
            vm.getMtoChoiceMetaData()
              .then(response => {
                vm.loadThumbNailImages("165x165");
              })
              .catch(error => {
                logger.error(error);
              });
            vm.setLimit();
            LocalMemory.API.Post("ChoicePageCount", vm.page + 1);
            vm.isLoading = false;
          } else {
            vm.isLoading = false;
          }
        });
      }
    };

    vm.initMTOUserDefinedDataDirective = () => {
      $scope.head = vm.selected_mto;
      $scope.edit_master_id = "";
    };

    // Loading Collections based on vendor ID
    vm.loadCollections = (vendorID, collectionId) => {
      vm.showLoadingCollections = true;
      let currentVendorId;
      // while linking collection to vendor we are sending the vendor ID hence the parameter
      !vendorID
        ? (currentVendorId = vm.selected_mto.vendor_id)
        : (currentVendorId = vendorID);
      MTOCollectionService.API.SearchVendorCollections(
        "vendor_id",
        currentVendorId
      )
        .then(response => {
          $scope.vendor_id = vm.selected_mto.vendor_id;
          vm.allCollections = response.data;
          if (collectionId) {
            $scope.choiceHead.collection_id = collectionId;
          }
          vm.showLoadingCollections = false;
        })
        .catch(error => logger.error(error));
    };

    // Loading MTO Collections irrespective of the Vendor ID
    vm.loadMTOCollections = () => {
      vm.showLoadingCollections = true;
      MTOCollectionService.API.GetMtoCollections()
        .then(response => {
          vm.allMTOCollections = response.data;
          vm.showLoadingCollections = false;
        })
        .catch(error => logger.error(error));
    };

    vm.loadFamilies = (vendorID, familyId) => {
      vm.showLoadingFamily = true;
      let currentVendorId;
      // while linking collection to vendor we are sending the vendor ID hence the parameter
      !vendorID
        ? (currentVendorId = vm.selected_mto.vendor_id)
        : (currentVendorId = vendorID);
      MTOFamilyService.API.SearchVendorFamilies("vendor_id", currentVendorId)
        .then(response => {
          $scope.vendor_id = vm.selected_mto.vendor_id;
          vm.allFamilies = response.data;
          if (familyId) {
            $scope.choiceHead.family_id = familyId;
          }
          vm.showLoadingFamily = false;
        })
        .catch(error => logger.error(error));
    };

    // Loading MTO Families irrespective of the Vendor ID
    vm.loadMTOFamilies = () => {
      vm.showLoadingFamily = true;
      MTOFamilyService.API.GetFamilies()
        .then(response => {
          vm.allMTOFamilies = response.data;
          vm.showLoadingFamily = false;
        })
        .catch(error => logger.error(error));
    };

    vm.loadPriceGroups = (vendorID, priceGroupId) => {
      vm.showLoadingPriceGroup = true;
      let currentVendorId;
      // while linking collection to vendor we are sending the vendor ID hence the parameter
      !vendorID
        ? (currentVendorId = vm.selected_mto.vendor_id)
        : (currentVendorId = vendorID);
      MTOPriceGroupService.API.SearchVendorPriceGroups(
        "vendor_id",
        currentVendorId
      )
        .then(response => {
          vm.allPriceGroups = response.data;
          if (priceGroupId) {
            $scope.choiceHead.price_group_id = priceGroupId;
          }
          vm.showLoadingPriceGroup = false;
          vm.loadPriceGroupsDropDown();
        })
        .catch(error => logger.error(error));
    };

    // Loading MTO PriceGroups irrespective of the Vendor ID
    vm.loadMTOPriceGroups = () => {
      vm.showLoadingPriceGroup = true;
      MTOPriceGroupService.API.GetMtoPriceGroups()
        .then(response => {
          vm.allMTOPriceGroups = response.data;
          vm.showLoadingPriceGroup = false;
        })
        .catch(error => logger.error(error));
    };

    vm.loadPriceGroupsDropDown = () => {
      //Selectize object for Price Group Drop down
      $scope.selectPriceGroup = {
        valueField: "price_group_id",
        labelField: "price_group",
        searchField: ["price_group"],
        sortField: "price_group",
        //Space is added to so that end of the text does not cut off
        placeholder: "Select Price Group" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        options: vm.allPriceGroups,
        render: {
          option: (data, escape) => {
            if (data.status_id === vm.statusCodes.Inactive.ID) {
              return (
                '<div class="p-5 disabled">' +
                '<div class="m-5">' +
                '<span class="c-black f-13"> ' +
                escape(data.price_group) +
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
                escape(data.price_group) +
                "</span>" +
                "<span>" +
                "</span>" +
                '<span class="f-300 f-11 c-gray pull-right">' +
                escape(data.status) +
                "</span>" +
                "</div>" +
                "</div>"
              );
            }
          },
          item: (data, escape) => {
            vm.selectedPriceGroup = data.price_group;
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.price_group) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vm.createAttributeValuesMap = () => {
      AttributeValueService.API.GetAttributeValues()
        .then(response => {
          vm.allAttributeValues = response.data;
          vm.createMap("allAttributeValues", "attributeValuesMap", "id"); // Create Map witk Key :Id, value : choice object
        })
        .catch(error => logger.error(error));
    };

    vm.createMap = (fromArrayModel, toMapModel, key) => {
      _.each(vm[fromArrayModel], value => {
        vm[toMapModel][value[key]] = value;
      });
    };

    vm.watchers = () => {
      /** searching MTO Choice Data List */
      $scope.$watch("choiceCtrl.searchMtoChoice", (searchValue, o) => {
        $scope.showhistory = false;
        vm.mtoChoiceDataList = $filter("filter")(
          vm.originalMTOChoiceDataList,
          searchValue
        );
      });
    };

    // Get group choices by selected group by field
    vm.groupByData = groupByColumn => {
      return new Promise((resolve, reject) => {
        vm.isGroupHeader = false;
        vm.groupChoices = [];
        vm.isGroupByApplied = true;
        vm.isFilterApplied === true ? (vm.isGroupByFilterApplied = true) : "";
        if (groupByColumn.length > 0) {
          vm.pagination();
          MTOChoiceService.API.GetChoicesByOptionId(
            vm.selected_mto.id,
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
                    vm.groupChoices.push(response.data.data[i]);
                  } else {
                    response.data.data[i].selected = 1;
                    response.data.data[i].expanded = false;
                    vm.groupChoices.push(response.data.data[i]);
                  }
                } else {
                  response.data.data[i].selected = 1;
                  response.data.data[i].expanded = false;
                  vm.groupChoices.push(response.data.data[i]);
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
          vm.getChoiceCount();
          vm.scrollToPosition(0, 0);
          vm.reload()
            .then(response => {
              resolve(response);
            }).catch(error => {
              reject(error);
            });
        }
      });
    };

    vm.MapGroupChoices = list => {
      for (let i = 0; i < list.length; i++) {
        if (vm.groupChoicesMap[list[i].id] === undefined) {
          vm.groupChoicesMap[list[i].id] = list[i];
        }
      }
    };

    //on click of group header, get data for the same group
    vm.showMtoChoiceData = (groupByField, groupData) => {
      groupData.isChoicesLoaded = false;
      groupData.expanded = !groupData.expanded; //toggle group data list
      if (groupData.choices === undefined) {
        vm.groupByValue = groupData[groupByField];
        groupData.groupPage = 1;
        vm.pagination();
        //Get data for applied group by field and selected group
        MTOChoiceService.API.GetChoicesByOptionId(
          vm.selected_mto.id,
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            groupData.isChoicesLoaded = true;
            if (response.data.data.length > 0) {
              groupData.choices = response.data.data;
              groupData.availableGroupChoices =
                groupData.count - response.data.data.length;
              vm.groupChoicesMap = [];
              vm.ChoicesMap = [];
              vm.MapGroupChoices(groupData.choices);
              // load choice images when choices are grouped by field
              vm.getMtoChoiceMetaData()
                .then(res => {
                  vm.loadGroupByThumbNailImages("165x165", groupData.choices);
                })
                .catch(error => {
                  logger.error(error);
                });
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        groupData.isChoicesLoaded = true;
      }
    };

    //load next batch of records on click of load more button
    vm.loadMoreMtoChoiceData = (groupByField, groupData) => {
      groupData.isMoreChoicesLoaded = false;
      vm.groupByValue = groupData[groupByField];
      vm.groupByField = groupByField;
      if (groupData[groupByField]) {
        groupData.groupPage = groupData.groupPage + 1;
        vm.pagination();
        MTOChoiceService.API.GetChoicesByOptionId(
          vm.selected_mto.id,
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            let data = response.data.data || response.data;
            groupData.isMoreChoicesLoaded = true;
            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                groupData.choices.push(data[i]);
                if (!vm.groupChoicesMap[data[i].id]) {
                  groupData.choices.push(data[i]);
                  vm.groupChoicesMap[data[i].id] = data[i];
                  vm.ChoicesMap[data[i].id] = data[i];
                }
              }
              groupData.availableGroupChoices =
                groupData.count - groupData.choices.length;

              vm.setLimit();
              // load choice images when data loaded
              vm.getMtoChoiceMetaData()
                .then(res => {
                  vm.loadGroupByThumbNailImages("165x165", groupData.choices);
                })
                .catch(error => {
                  logger.error(error);
                });
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    ///Function to load images for choices when group by filter is applied
    vm.loadGroupByThumbNailImages = (size, choices) => {
      if (choices && vm.choice_thumbnails) {
        for (let i = 0; i < choices.length; i++) {
          let thumbnail = vm.choice_thumbnails.filter(lake => {
            return lake.instance_id == choices[i].id;
          });
          if (thumbnail[0]) {
            if (!thumbnail[0].url) {
              choices[i].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                thumbnail[0].drop_id,
                size,
                vm.uuid
              );
            } else if (thumbnail[0].url) {
              choices[i].thumbnail = thumbnail[0].url;
            }
            choices[i].drop_id = thumbnail[0].drop_id;
          }
        }
      }
    };

    ///Group by Panel: Select or Unselect all the item groups
    vm.toggleAllGroups = isSelectAll => {
      for (let i = 0; i < vm.groupChoices.length; i++) {
        if (isSelectAll) {
          vm.groupChoices[i].selected = 1;
        } else {
          vm.groupChoices[i].expanded = false;
          vm.groupChoices[i].choices = undefined; //remove data from group after Unselect all
          vm.groupChoices[i].selected = 0;
        }
      }
    };

    //toggle list of group options when group by filter is applied
    vm.toggleselectedGroupMtoChoice = (gc, index) => {
      if (gc.selected) {
        for (let x = 0; x < vm.selectedGroupHeader.length; x++) {
          if (
            vm.selectedGroupHeader[x][vm.groupByField] === gc[vm.groupByField]
          ) {
            vm.selectedGroupHeader.splice(x, 1);
          }
        }
        gc.locations = undefined;
        for (let i = 0; i < vm.groupChoices.length; i++) {
          vm.groupChoices[i].isLocationsLoaded = undefined;
        }
      } else {
        vm.selectedGroupHeader.push(gc);
      }
      gc.expanded = false;
    };

    vm.setInitialState = entityName => {
      vm.publishResponseMessage = false;
      if (entityName.toLowerCase() === "mtocollection" && entityName) {
        $timeout(() => {
          angular.element("#short_description_collection").focus();
        }, 0);
      } else if (entityName.toLowerCase() === "mtofamily" && entityName) {
        $timeout(() => {
          angular.element("#short_description_family").focus();
        }, 0);
      } else if (entityName.toLowerCase() === "mtopricegroup" && entityName) {
        $timeout(() => {
          angular.element("#short_description_pg").focus();
        }, 0);
      } else {
      }
    };

    vm.resetForm = entityName => {
      if (entityName.toLowerCase() === "mtocollection" && entityName) {
        vm.collection_details = {};
        vm.collection_details["short_description"] = null;
      } else if (entityName.toLowerCase() === "mtofamily" && entityName) {
        vm.family_details = {};
        vm.family_details["short_description"] = null;
      } else if (entityName.toLowerCase() === "mtopricegroup" && entityName) {
        vm.price_group_details = {};
        vm.price_group_details["short_description"] = null;
      } else {

      }
    };

    //Initialize Create and Update Forms
    vm.InitializeCreateUpdateForm = () => {
      vm.getMTOParameters(); // get mto configuartion parameters
      vm.getMtoChoiceMetaData();
      $scope.getStatuses(common.Identifiers.mto_option);
      $scope.getNextStatuses(common.Identifiers.mto_option);
      !$stateParams.id && $state.current.name.includes(".new")
        ? vm.openForm("mtochoice")
        : "";
    };

    vm.openForm = entityName => {
      vm.error = false;
      vm.message = null;
      vm.isCloned = false;
      /* variables to reset the Notification message-start */
      $scope.mtoChoiceSuccessMessage = null;
      $scope.mtoChoiceErrorMessage = null;
      $scope.mtoChoiceUDDSuccessMessage = null;
      vm.validationMessage = null;
      $scope.isEnabled = false;
      /* variables to reset the Notification message-end */

      if (
        entityName.toLowerCase() === "mtochoice" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.isInvalidForm = false; // variable used to show error fields
        vm.isUpdate = false;
        vm.opdone = false;
        vm.isShowDetails = true;
        vm.isChoiceGrids = false;
        $scope.effective_val = false;
        $scope.choiceHead = {};
        $scope.choiceHead.effective_date = moment()
          .utcOffset("0")
          .format($scope.date_format);
        $scope.choiceHead.status_id = 200;
        $scope.choiceHead.next_status_id = 500;
        $scope.choiceHead.status = "Active";
        $scope.choiceHead.next_status_value = "None";
        $scope.choiceHead.option_id = parseInt($stateParams.mto_id);
        $scope.choiceHead.option_type_id = vm.selected_mto.option_type_id;
        $scope.edit_master_id = "";
        /*edit screen variables-start*/
        vm.showSummaryPanel = true;
        $scope.drop = {};
        $scope.files = [];
        $scope.errFiles = null;
        vm.createStage = true;
        vm.configureStage = false;
        vm.previewandpublishStage = false;
        vm.createForm = true;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.confirmDelete = false;
        vm.publishResponseMessage = false;
        /*edit screen variables-end*/
        $scope.uddValidationErrors = [];
        $scope.queuedDrops = [];
        vm.resetModel();
      } else if (
        entityName.toLowerCase() === "mtocollection" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.getCollectionModelAndSetValidationRules();
        vm.isSaveSuccess = false;
        vm.isShowCollectionDetails = true;
        vm.saveBtnText = "Save";
        vm.saveBtnError = false;
        vm.collection_details = {};
        vm.collection_form.$setPristine();
        vm.setInitialState(entityName);

        vm.resetForm(entityName);
      } else if (
        entityName.toLowerCase() === "mtofamily" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.getFamilyModelAndSetValidationRules();
        vm.isSaveSuccess = false;
        vm.isShowFamilyDetails = true;
        vm.saveBtnText = "Save";
        vm.saveBtnError = false;
        vm.family_details = {};
        vm.family_form.$setPristine();
        vm.setInitialState(entityName);

        vm.resetForm(entityName);
      } else if (
        entityName.toLowerCase() === "mtopricegroup" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.getPriceGroupModelAndSetValidationRules();
        vm.isSaveSuccess = false;
        vm.isShowPriceGroupDetails = true;
        vm.saveBtnText = "Save";
        vm.saveBtnError = false;
        vm.price_group_details = {};
        vm.price_group_form.$setPristine();
        vm.setInitialState(entityName);

        vm.resetForm(entityName);
      } else {
      }
    };

    vm.createAnotherForm = entityName => {
      if (
        entityName.toLowerCase() === "mtocollection" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.isSaveSuccess = false;
        vm.isShowCollectionDetails = true;
        vm.saveBtnText = "Save";
        vm.collection_details = {};
        vm.setInitialState(entityName);
        vm.collection_details.collection_status_id =
          vm.previousCollection.collection_status_id;
      } else if (
        entityName.toLowerCase() === "mtofamily" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.isSaveSuccess = false;
        vm.isShowFamilyDetails = true;
        vm.saveBtnText = "Save";
        vm.family_details = {};
        vm.setInitialState(entityName);
        vm.family_details.families_status_id =
          vm.previousFamily.families_status_id;
      } else if (
        entityName.toLowerCase() === "mtopricegroup" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.isSaveSuccess = false;
        vm.isShowPriceGroupDetails = true;
        vm.saveBtnText = "Save";
        vm.price_group_details = {};
        vm.setInitialState(entityName);
        vm.price_group_details.price_group_status_id =
          vm.previousPriceGroup.price_group_status_id;
      } else {

      }
    };

    vm.closeForm = entityName => {
      if (entityName.toLowerCase() === "mtochoice" && entityName) {
        $scope.isEnabled = false; /* setting variable false while create mto choice from create mto choice*/
        vm.isShowDetails = false;
        vm.isChoiceGrids = true;
        vm.showDependencyDetailsData = false;
        vm.showDependencyDetails = false;
      } else if (entityName.toLowerCase() === "mtocollection" && entityName) {
        vm.isShowCollectionDetails = false;
      } else if (entityName.toLowerCase() === "mtofamily" && entityName) {
        vm.isShowFamilyDetails = false;
      } else if (entityName.toLowerCase() === "mtopricegroup" && entityName) {
        vm.isShowPriceGroupDetails = false;
      } else {

      }

      // $state.go("common.prime.mtooptions.mtochoices");
      $window.history.back();
      vm.showFilter ? vm.showAdvancedFilter() : "";
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = () => {
      vm.showDependencyDetails = false;
    };

    vm.changeEvent = eachMtoMaster => {
      if (eachMtoMaster.next_status_id === 500) {
        $scope.effective_val = false;
      } else {
        $scope.effective_val = true;
      }
    };

    vm.openFiltersPanel = () => {
      $state.go("common.prime.mtooptions.mtochoices.filter");
    };

    vm.updateMTOChoice = data => {
      if (vm.permissionsMap.update) {
        data.isShowUpdateProcessing = true;
        $timeout(() => {
          $state
            .go("common.prime.mtooptions.mtochoices.update", { id: data.id })
            .then(() => {
              data.isShowUpdateProcessing = false;
            });
        }, 0);
      }
    };

    vm.dblClickAction = data => {
      $scope.choiceHead = {};
      vm.publishResponseMessage = false;
      vm.isInvalidForm = false; // variable used to show error fields
      vm.isUpdate = true;
      vm.opdone = false;
      vm.isShowDetails = true;
      vm.isChoiceGrids = false;
      $scope.choiceHead = _.clone(data);
      vm.oldChoice = data;
      $scope.original_choice = _.clone(data);
      $scope.edit_master_id = data.id;
      $scope.master_id = data.id;
      $scope.isEnabled = true;
      vm.changeEvent(data);
      /* variables to reset the Notification message-start */
      $scope.mtoChoiceSuccessMessage = null;
      $scope.mtoChoiceErrorMessage = null;
      $scope.mtoChoiceUDDSuccessMessage = null;
      vm.validationMessage = null;
      $scope.drop = {};
      $scope.files = [];
      $scope.errFiles = null;
      $scope.choiceHead.choice_description.includes("Clone") ||
        $scope.choiceHead.choice_description.includes("clone")
        ? (vm.isCloned = true)
        : (vm.isCloned = false);
      $scope.uddValidationErrors = [];
      /* variables to reset the Notification message-end */
      /*edit screen variables-start*/
      vm.createStage = true;
      vm.configureStage = false;
      vm.previewandpublishStage = false;
      vm.manageDropScreen = false;
      vm.createForm = true;
      vm.configureScreen = false;
      vm.previewAndPublish = false;
      vm.confirmDelete = false;
      vm.loadImage($scope.choiceHead, "125x125");
      /*edit screen variables-end*/

      $scope.choiceHead.effective_date = $scope.getDateBasedOnFormat(
        $scope.choiceHead.effective_date
      ); //format date
      $scope.choiceHead.next_effective_date = $scope.getDateBasedOnFormat(
        $scope.choiceHead.next_effective_date
      ); //format date
      $scope.original_choice.effective_date = $scope.getDateBasedOnFormat(
        $scope.original_choice.effective_date
      ); //format date
      $scope.original_choice.next_effective_date = $scope.getDateBasedOnFormat(
        $scope.original_choice.next_effective_date
      ); //format date

      // Set Dependency details as false
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      vm.resetModel();
    };

    //goto update state if id exists in data map
    vm.gotoUpdateState = () => {
      $scope.uddValidationErrors = [];
      if (
        $stateParams.id &&
        $state.current.name.includes(".update") &&
        vm.ChoicesMap[$stateParams.id]
      ) {
        vm.ChoicesMap[$stateParams.id].next_effective_date === "1970-01-01"
          ? (vm.ChoicesMap[$stateParams.id].next_effective_date = "none")
          : "";
        //if current state is update and selected id is present in choices map then get data from map
        vm.dblClickAction(vm.ChoicesMap[$stateParams.id]);
      } else if (
        $stateParams.id &&
        $state.current.name.includes(".update") &&
        !vm.ChoicesMap[$stateParams.id]
      ) {
        //if current state is update and selected id is not present in choices map then get by API call
        MTOChoiceService.API.GetChoiceById($stateParams.id)
          .then(response => {
            if (response.id) {
              vm.ChoicesMap[$stateParams.id] = response;
              vm.dblClickAction(vm.ChoicesMap[$stateParams.id]);
            } else {
              //if response also don't have id then close form
              vm.closeForm("mtochoice");
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        vm.closeForm("mtochoice");
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

    vm.publishMTOChoice = (head, isPublishChanges) => {
      if (isPublishChanges) {
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.createForm = false;
        vm.previewAndPublish = true;
        vm.back = true;
      }
      vm.publishResponseMessage = true;
      if (vm.isUpdate) {
        vm.update("MTOChoice", head);
      } else {
        vm.save("MTOChoice", head);
      }
    };

    vm.focusSearchField = () => {
      angular.element("#inlineSearch").focus();
      vm.showFilter = true;
    };

    // Reset not applied filter arrays.
    vm.resetUnusedFilterArrays = refresh => {
      (vm.filters.collectionIds && !vm.filters.collectionIds.length)
        ? (delete vm.filters.collectionIds)
        : "";
      (vm.filters.familyIds && !vm.filters.familyIds.length)
        ? (delete vm.filters.familyIds)
        : "";
      (vm.filters.priceGroupIds && !vm.filters.priceGroupIds.length)
        ? (delete vm.filters.priceGroupIds)
        : "";
      (vm.filters.currentStatusIds && !vm.filters.currentStatusIds.length)
        ? (delete vm.filters.currentStatusIds)
        : "";
      (vm.filters.nextStatusIds && !vm.filters.nextStatusIds.length)
        ? (delete vm.filters.nextStatusIds)
        : "";
      vm.getFilterCount();
    };

    // Calculet filter count.
    vm.getFilterCount = () => {
      vm.appliedFilterCount = 0;
      vm.filters.collectionIds && vm.filters.collectionIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.familyIds && vm.filters.familyIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.priceGroupIds && vm.filters.priceGroupIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.currentStatusIds && vm.filters.currentStatusIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.nextStatusIds && vm.filters.nextStatusIds.length
        ? vm.appliedFilterCount++
        : "";
    };

    vm.showAdvancedFilter = flag => {
      $timeout(() => {
        $("#advanced-search").collapse("hide");
        vm.old_filters ? (vm.filters = _.clone(vm.old_filters)) : "";
        // First time when the panel is opened reset all the values
        if (!vm.advancedSearchPanel) {
          vm.resetFilters();
        } else {
          // When vm.advancedSearchPanel is true, then resetUnusedFilterArrays() will resets the not applied filters.
          // (this is when checks some values and clicks on search button without clicking on apply filter).
          vm.resetUnusedFilterArrays();
        }
        flag ? (vm.showFilter = !vm.showFilter) : "";
        vm.InitializeCreateUpdateForm();
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
      }, 500);
    };

    vm.setInitialHeight = () => {
      $timeout(() => {
        vm.showFilter ? vm.showAdvancedFilter() : "";
      }, 0);
    };

    vm.applyFilters = () => {
      vm.message = null;
      vm.errorMessage = null;
      vm.filters.length > 0
        ? (vm.applyFilterSuccess = true)
        : (vm.applyFilterSuccess = false); // Checking whether any filters are selected. If any filters are seleted we get filtered data else a message will be thrown to select any of the filter.
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
          "collectionIds" in vm.filters ||
          "familyIds" in vm.filters ||
          "priceGroupIds" in vm.filters ||
          "currentStatusIds" in vm.filters ||
          "nextStatusIds" in vm.filters ||
          !angular.equals(vm.old_filters, vm.filters)
        ) {
          if (
            !angular.equals(vm.old_filters, vm.filters) ||
            !vm.isFilterApplied ||
            (vm.isGroupByApplied && !vm.isGroupByFilterApplied) ||
            vm.opdone
          ) {
            vm.page = 1;
            vm.filters.mtoOtionId = $stateParams.mto_id;
            vm.applyFiltersBtnLabel = "Applying Filters...";
            vm.reloadChoiceCountAndList()
              .then(() => {
                vm.advancedSearchPanel = true;
                if (vm.isGroupByApplied) {
                  vm.isGroupHeader = true;
                  vm.isGroupByFilterApplied = true;
                }
                vm.isFilterApplied = true;
                vm.old_filters = angular.copy(vm.filters);
                vm.message = "Filter applied successfully!";
                vm.applyFiltersBtnLabel = "Apply Filters";
                common.$timeout(() => {
                  vm.message = null;
                  vm.errorMessage = null;
                  vm.showAdvancedFilter(true);
                }, 500);
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
          vm.applyFilterMessage = "* Please select atleast one filter to search relevant choices";
        }
      } else {
        vm.applyFilterSuccess = false;
        vm.showFilter = false;
        vm.applyFilterMessage = "* Please select atleast one filter to search relevant choices";
      }
    };

    vm.resetFilters = refresh => {
      vm.isResetFilter = true;
      vm.message = null;
      vm.errorMessage = null;
      vm.filters.collectionIds = [];
      vm.filters.familyIds = [];
      vm.filters.priceGroupIds = [];
      vm.filters.currentStatusIds = [];
      vm.filters.nextStatusIds = [];
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
          vm.showAdvancedFilter(true);
        }, 500);
      }
      if (vm.isFilterApplied && JSON.stringify(vm.old_filters) !== "{}") {
        vm.reloadChoiceCountAndList();
      }
      vm.isFilterApplied = false;
      vm.applyFilterSuccess = true;
      common.$timeout(() => {
        vm.isResetFilter = false;
        vm.advancedSearchPanel = false;
        vm.old_filters = {};
      }, 0);
    };

    //Storage Functions START
    vm.initializeDropForm = () => {
      $scope.isAllowMultipleDrops = true;
      vm.showConfirmDeletion = false;
      vm.DeletionConfirmation = false;
      vm.is_thumbnail = 1;
    };

    vm.getDropStatus = () => {
      try {
        $scope.statusList = DataLakeService.GetDropStatuses();
      } catch (error) {
        logger.error(error);
      }
    };

    //Get available drops by an entity and its uuid
    vm.fetchDropsByUuidAndInstanceId = instanceId => {
      try {
        DataLakeService.GetDropByUuidAndInstanceId(vm.uuid, instanceId)
          .then(response => {
            if (response.length > 0) {
              for (let index = 0; index < response.length; index++) {
                // if stream is cover image, then insert thumbnail with same url
                if (
                  response[index].stream.toLowerCase() === "cover image" &&
                  response[index].is_thumbnail
                ) {
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

    vm.selectFiles = (files, errFiles) => {
      $scope.isUpload = false;
      $scope.isDropUploaded = false;
      $scope.files = files;
      $scope.errFiles = errFiles;
      $scope.files && $scope.files[0] ? checkType($scope.files[0].type) : null;
    };

    vm.getLakeStreamLinkByIds = (lakeId, streamId) => {
      vm.mtodataUploaderror = false;
      vm.mtodataAddToQueueError = false;
      DataLakeService.GetLakeStreamLink(lakeId, streamId)
        .then(response => {
          $scope.isAllowMultipleDrops = true;
          response.length > 0
            ? ($scope.selectedLakeStream = response[0])
            : (scope.selectedLakeStream = {});
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
              $scope.dropsForselectedLakeStream = [];
              vm.mtodataUploaderror = false;
              vm.mtodataAddToQueueError = false;
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
              vm.replaceExistingDropAndUpload();
            } else {
              vm.addToQueueOrUploadDrop();
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
        if (!$scope.isAllowMultipleDrops) {
          $scope.isAllowMultipleDrops = true;
          vm.isProcessing = false;
        }
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

    $scope.resetAllconfigData = () => {
      vm.mtodataUploaderror = false;
      vm.mtodataAddToQueueError = false;
      vm.showCantGen = false;
      $scope.files = [];
      $scope.drop.url = null;
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
              $scope.isAllowMultipleDrops = false;
              vm.isUploading = false;
              vm.isAddedToQueue = false;
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
        vm.isUploading = true;
        vm.mtodataUploaderror = false;
        vm.isAddedToQueue = true;
        vm.mtodataAddToQueueError = false;
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
    };


    vm.replaceExistingDropAndUpload = () => {
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
      let uploadResponse = vm.uploadDrop(drop, $stateParams.id)
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
      if (vm.drop_form.ur) {
        vm.drop_form.url.$setPristine();
      }
    }

    vm.addToQueueOrUploadDrop = () => {
      if ($stateParams.id === undefined) {
        vm.addDropToQueue();
        // $scope.drop.stream_id = null;
        // $scope.files = undefined;
        // $scope.errFiles = undefined;
        // $scope.drop.url = undefined;
        // vm.drop_form.url.$setPristine();
      } else {
        vm.uploadDrop($scope.drop, $stateParams.id)
          .then(() => { })
          .catch(() => { });
      }
    };

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

    // on create location delete drop after confirmation
    vm.deleteDropFromQueue = () => {
      vm.DeletionConfirmation = false;
      let index = vm.dropIndex;
      $scope.queuedDrops.splice(index, 1);
      for (let i = 0; i < $scope.queuedDrops.length; i++) {
        if (
          $scope.queuedDrops[i].stream.toLowerCase() == "thumbnail" &&
          $scope.queuedDrops[i].is_coverImage
        ) {
          $scope.queuedDrops.splice(i, 1);
        }
      }
      $scope.isAllowMultipleDrops = true;
    };

    // To remove the drop from queue
    vm.removeDropsFromQueue = index => {
      let deletedDrop = $scope.queuedDrops[index];
      if (
        deletedDrop.stream.toLowerCase() === "cover image" &&
        deletedDrop.is_thumbnail
      ) {
        // store the value of index
        vm.dropIndex = index;
        vm.DeletionConfirmation = true;
        // if stream is thumbnail and copy of cover image
      } else if (
        deletedDrop.stream.toLowerCase() == "thumbnail" &&
        deletedDrop.is_coverImage
      ) {
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
      $scope.files = undefined;
      $scope.errFiles = undefined;
      common.$timeout(() => {
        vm.fetchDropLakesByUuid();
        vm.getDropStatus();
        $scope.drop = { source: "local" };
      }, 0);
    };

    // To delete drop
    vm.removeDrop = drop => {
      return new Promise((resolve, reject) => {
        try {
          vm.isDeleting = true;
          drop.uuid = vm.uuid;
          if (vm.dropToDelete) {
            drop = vm.dropToDelete;
          }
          angular.element("#showQueueMessage").show();
          vm.showSuccessQueueMessage = "Deleting drop in progress";
          DataLakeService.DeleteDrop(drop)
            .then(() => {
              vm.dropToDelete = undefined;
              vm.isDeleting = 1;
              vm.showSuccessQueueMessage = "Image unlinked from the MTO Choice";
              delete vm.oldChoice.thumbnail; //delete the thumbnail property
              delete $scope.choiceHead.thumbnail;
              vm.getMtoChoiceMetaData()
                .then(() => {
                  vm.loadThumbNailImages("165x165");
                })
                .catch(error => {
                  logger.error(error);
                });
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
              }, 4500);
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
      } else if (
        drop.stream.toLowerCase() === "thumbnail" &&
        drop.is_coverImage
      ) {
        vm.dropToDelete = undefined;
        let object = {
          drop_id: drop.drop_id,
          instance_id: drop.instace_id,
          is_thumbnail: 0
        };
        DataLakeAPIService.API.UpdateDetails(object)
          .then(response => {
            vm.$updateBtnText = "Update";
            angular.element("#showQueueMessage").show();
            vm.isDeleting = 1;
            vm.showSuccessQueueMessage = "Image unlinked from the MTO Choice";
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
      if (vm.is_thumbnail) {
        queuedDropObject.is_thumbnail = vm.is_thumbnail;
      }

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
      //     // vm.mtodataAddToQueueError = error.data;
      //     vm.mtodataAddToQueueError = "File type is not suitable for physical upload";
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
      // }

      // $scope.queuedDrops.push(queuedDropObject);
      // // If stream is cover image and is_thumbnail is true, then save the cover image as thumbnail
      // if (
      //   $scope.queuedDrops[0] &&
      //   $scope.queuedDrops[0].stream.toLowerCase() === "cover image" &&
      //   vm.is_thumbnail
      // ) {
      //   let obj = {
      //     lake: $scope.queuedDrops[0].lake,
      //     lake_id: $scope.queuedDrops[0].lake_id,
      //     stream: "Thumbnail",
      //     stream_code: "thumbnail",
      //     stream_id: 1,
      //     url: $scope.queuedDrops[0].url,
      //     file_name: $scope.queuedDrops[0].file_name,
      //     is_coverImage: true
      //   };
      //   $scope.queuedDrops.push(obj);
      // }

      // if ($scope.queuedDrops.length > 0) {
      //   vm.isUploading = false;
      //   angular.element("#showQueueMessage").show();
      //   vm.showSuccessQueueMessage = "Image added to the Queue";
      //   vm.resetModel();
      //   $timeout(() => {
      //     angular.element("#showQueueMessage").hide();
      //     vm.showSuccessQueueMessage = null;
      //   }, 2500);
      // }
    };

    vm.uploadQueuedDrops = insertedId => {
      if ($scope.queuedDrops) {
        for (let i = 0; i < $scope.queuedDrops.length; i++) {
          $scope.queuedDrops[i].instance_id = insertedId;
          DataLakeService.UploadDrop($scope.queuedDrops[i])
            .then(res => {
              // After create of drops, it should be shown in the list immidietly
              if (res && res.data && (i === $scope.queuedDrops.length - 1 ||
                ($scope.queuedDrops[i].is_thumbnail && i === ($scope.queuedDrops.length / 2) - 1)
              )) {
                vm.getMtoChoiceMetaData()
                  .then(response => {
                    vm.loadThumbNailImages("165x165");
                  }) //Load all drops and images after creating new drop
                  .catch(error => {
                    logger.error(error);
                  });
              }
            })
            .catch(error => {
              logger.error(error);
            });
        }
      }
    };

    vm.uploadDrop = (drop, instanceId) => {
      return new Promise((resolve, reject) => {
        try {
          vm.isUploading = true;
          // drop = $scope.drop;
          drop = angular.copy($scope.drop);
          drop.source = "local";
          drop.url = undefined;
          drop.instance_id = instanceId;
          drop.uuid = vm.uuid;
          drop.files = $scope.files;
          drop.is_thumbnail = vm.is_thumbnail;

          DataLakeService.UploadDrop(drop)
            .then(res => {
              vm.resetModel();
              vm.is_thumbnail = 1;
              // After create of drops, it should be shown in the list immidietly
              vm.getMtoChoiceMetaData();
              resolve(true);
              $timeout(() => {
                vm.isUploading = false;
                vm.isAddedToQueue = false;
                vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
                $scope.files = null;
                $scope.errFiles = null;
                $scope.drop.stream_id = null;
                $scope.drop.url = null;
                vm.drop_form.url.$setPristine();
                vm.validationMessage = null;
              }, 2000);
            })
            .catch(error => {
              reject(false);
              logger.error(error);
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              vm.mtodataUploaderror = "File type is not suitable for physical upload";
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
    //Storage function END

    vm.save = (entityName, payload) => {
      let dataToBeSaved = _.clone(payload);
      if (
        entityName.toLowerCase() === "mtochoice" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.isProcessing = true;
        vm.publishResponseMessage = true;
        $scope.mtoChoiceErrorMessage = null;
        dataToBeSaved.effective_date = $scope.getFormattedDate(
          payload.effective_date
        );
        dataToBeSaved.next_effective_date = $scope.getFormattedDate(
          payload.next_effective_date
        );
        dataToBeSaved.type_id = vm.selected_mto.option_type_id;
        $scope.head["type_id"] = payload.type_id;
        dataToBeSaved.option_id = vm.selected_mto.id;
        MTOChoiceService.API.InsertChoice(dataToBeSaved)
          .then(response => {
            vm.isProcessing = false;
            $scope.edit_master_id = response.data.inserted_id;
            $scope.master_id = response.data.inserted_id;
            payload.id = response.data.inserted_id;
            // set next_effective_date
            payload.next_status_value.toLowerCase() === "none"
              ? (payload.next_effective_date = "1970-01-01")
              : "";
            //push new data object to data list
            vm.mtoChoiceDataList.length > 0
              ? vm.mtoChoiceDataList.unshift(response.data.choice[0])
              : (vm.mtoChoiceDataList = response.data.choice);
            vm.recordsCount = vm.recordsCount + 1; //increase records count
            vm.totalRecordCount = vm.totalRecordCount + 1; //increase total records count
            //if group by filter is applied then update choice from group array
            if (vm.groupByField) {
              //find index of group under which current choice exist
              let groupFieldIndex = vm.groupChoices.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );
              if (groupFieldIndex === -1) {
                vm.groupChoices.push({
                  [vm.groupByField]: payload[vm.groupByField],
                  count: 1,
                  expanded: false,
                  selected: 1,
                  choices: [payload]
                });
              } else if (
                groupFieldIndex > -1 &&
                vm.groupChoices[groupFieldIndex].choices
              ) {
                vm.groupChoices[groupFieldIndex].choices.unshift(payload);
                vm.groupChoices[groupFieldIndex].count++;
              } else {
                vm.groupChoices[groupFieldIndex].count++;
              }
              vm.groupChoicesMap[payload.id] === undefined
                ? (vm.groupChoicesMap[payload.id] = payload)
                : "";
            }
            //Push new data object to key-value map
            vm.ChoicesMap[response.data.inserted_id] = response.data.choice[0];
            vm.opdone = true;
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              response: response.data,
              inserted_id: response.data.inserted_id
            });
            vm.uploadQueuedDrops(response.data.inserted_id);
          })
          .catch(error => {
            vm.isProcessing = false;
            $scope.$broadcast("saveOrUpdateUdd", {
              event: "save",
              error: error
            });
            logger.error(error);
          });
      } else if (
        entityName.toLowerCase() === "mtocollection" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.saveBtnText = "Saving Now...";
        vm.isLinkingVendor = true;
        vm.previousCollection = payload;
        MTOCollectionService.API.InsertMtoCollection(payload)
          .then(response => {
            let pay = {};
            pay.collection_id = response.data.inserted_id;
            pay.vendor_id = vm.selected_mto.vendor_id;
            MTOCollectionService.API.LinkVendorToCollection(pay)
              .then(resp => {
                MTOCollectionService.API.SearchVendorCollections(
                  "vendor_id",
                  vm.selected_mto.vendor_id
                )
                  .then(res => {
                    vm.allCollections = res.data;
                    $scope.choiceHead.collection_id = angular.copy(
                      response.data.inserted_id
                    );
                  })
                  .catch(error => {
                    logger.error(error);
                  });
              })
              .catch(error => {
                logger.error(error);
              });
            vm.saveBtnText = "Done";
            vm.isLinkingVendor = false;
            vm.isSaveSuccess = true;
          })
          .catch(error => {
            if (error.status === 412) {
              let pay = {};
              let collection = _.filter(vm.allMTOCollections, collection => {
                return collection.short_description.toLowerCase() ===
                  vm.collection_details.short_description.toLowerCase()
                  ? collection.id
                  : null;
              });
              if (collection[0]) {
                pay.collection_id = collection[0].id;
              }
              if ($scope.vendor_id) {
                pay.vendor_id = $scope.vendor_id;
              } else {
                pay.vendor_id = vm.selected_mto.vendor_id;
                //goto update state if id exists in data map
              }
              MTOCollectionService.API.LinkVendorToCollection(pay)
                .then(response => {
                  vm.loadCollections(pay.vendor_id, pay.collection_id);
                  vm.saveBtnText = "Done";
                  vm.isLinkingVendor = false;
                  vm.isSaveSuccess = true;
                })
                .catch(error => {
                  vm.saveBtnText = "Oops.!! Something went wrong";
                  vm.isLinkingVendor = false;
                  vm.saveBtnError = true;
                  if (error.data.error.errno === 1062) {
                    vm.message = "Record already exist";
                  } else if (error.status == 412) {
                    vm.message = "Record already exists";
                  } else {
                    vm.message = Notification.errorNotification(error);
                  }
                  logger.error(error);
                  $timeout(() => {
                    vm.saveBtnText = "Save";
                    vm.saveBtnError = false;
                    vm.message = null;
                  }, 3000);
                });
            }
            $timeout(() => {
              vm.saveBtnText = "Save";
              vm.saveBtnError = false;
              vm.message = null;
            }, 3000);
            logger.error(error);
          });
      } else if (
        entityName.toLowerCase() === "mtofamily" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.saveBtnText = "Saving Now...";
        vm.isLinkingVendor = true;
        vm.previousFamily = payload;

        MTOFamilyService.API.InsertFamily(payload)
          .then(response => {
            vm.previousFamily.id = response.data.inserted_id;
            vm.allMTOFamilies.push(vm.previousFamily);
            let pay = {};
            pay.family_id = response.data.inserted_id;
            pay.vendor_id = vm.selected_mto.vendor_id;
            MTOFamilyService.API.LinkVendorToFamily(pay)
              .then(resp => {
                MTOFamilyService.API.SearchVendorFamilies(
                  "vendor_id",
                  vm.selected_mto.vendor_id
                )
                  .then(res => {
                    vm.allFamilies = res.data;
                    $scope.choiceHead.family_id = angular.copy(
                      response.data.inserted_id
                    );
                    vm.saveBtnText = "Done";
                    vm.isLinkingVendor = false;
                    vm.isSaveSuccess = true;
                  })
                  .catch(error => {
                    logger.error(error);
                  });
              })
              .catch(error => logger.error(error));
          })
          .catch(error => {
            if (error.status === 412) {
              let pay = {};
              let family = _.filter(vm.allMTOFamilies, family => {
                return family.short_description.toLowerCase() ===
                  vm.family_details.short_description.toLowerCase()
                  ? family.id
                  : null;
              });
              pay.family_id = family[0].id;
              if ($scope.vendor_id) {
                pay.vendor_id = $scope.vendor_id;
              } else {
                pay.vendor_id = vm.selected_mto.vendor_id;
                //goto update state if id exists in data map
              }
              MTOFamilyService.API.LinkVendorToFamily(pay)
                .then(response => {
                  vm.loadFamilies(pay.vendor_id, pay.family_id);
                  vm.saveBtnText = "Done";
                  vm.isLinkingVendor = false;
                  vm.isSaveSuccess = true;
                })
                .catch(error => {
                  vm.saveBtnText = "Oops.!! Something went wrong";
                  vm.isLinkingVendor = false;
                  vm.saveBtnError = true;
                  if (error.data.error.errno === 1062) {
                    vm.message = "Record already exist";
                  } else if (error.status == 412) {
                    vm.message = "Record already exists";
                  } else {
                    vm.message = Notification.errorNotification(error);
                  }
                  logger.error(error);
                  $timeout(() => {
                    vm.saveBtnText = "Save";
                    vm.saveBtnError = false;
                    vm.message = null;
                  }, 3000);
                });
            }
            $timeout(() => {
              vm.saveBtnText = "Save";
              vm.saveBtnError = false;
              vm.message = null;
            }, 3000);

            logger.error(error);
          });
      } else if (
        entityName.toLowerCase() === "mtopricegroup" &&
        entityName &&
        !vm.disableActions
      ) {
        vm.saveBtnText = "Saving Now...";
        vm.isLinkingVendor = true;
        vm.previousPriceGroup = payload;
        MTOPriceGroupService.API.InsertMtoPriceGroup(payload)
          .then(response => {
            vm.previousPriceGroup.id = response.data.inserted_id;
            vm.allMTOPriceGroups.push(vm.previousPriceGroup);
            let pay = {};
            pay.price_group_id = response.data.inserted_id;
            pay.vendor_id = vm.selected_mto.vendor_id;
            MTOPriceGroupService.API.LinkVendorToMtoPriceGroup(pay)
              .then(resp => {
                MTOPriceGroupService.API.SearchVendorPriceGroups(
                  "vendor_id",
                  vm.selected_mto.vendor_id
                )
                  .then(res => {
                    vm.allPriceGroups = res.data;
                    $scope.choiceHead.price_group_id = angular.copy(
                      response.data.inserted_id
                    );
                  })
                  .catch(error => {
                    logger.error(error);
                  });
              })
              .catch(error => logger.error(error));
            vm.saveBtnText = "Done";
            vm.isLinkingVendor = false;
            vm.isSaveSuccess = true;
          })
          .catch(error => {
            if (error.status === 412) {
              let pay = {};
              let price_group = _.filter(vm.allMTOPriceGroups, price_group => {
                return price_group.short_description.toLowerCase() ===
                  vm.price_group_details.short_description.toLowerCase()
                  ? price_group.id
                  : null;
              });
              pay.price_group_id = price_group[0].id;
              if ($scope.vendor_id) {
                pay.vendor_id = $scope.vendor_id;
              } else {
                pay.vendor_id = vm.selected_mto.vendor_id;
                //goto update state if id exists in data map
              }
              MTOPriceGroupService.API.LinkVendorToMtoPriceGroup(pay)
                .then(response => {
                  vm.loadPriceGroups(pay.vendor_id, pay.price_group_id);
                  vm.saveBtnText = "Done";
                  vm.isLinkingVendor = false;
                  vm.isSaveSuccess = true;
                })
                .catch(error => {
                  vm.saveBtnText = "Oops.!! Something went wrong";
                  vm.isLinkingVendor = false;
                  vm.saveBtnError = true;
                  if (error.data.error.errno === 1062) {
                    vm.message = "Record already exist";
                  } else if (error.status == 412) {
                    vm.message = "Record already exists";
                  } else {
                    vm.message = Notification.errorNotification(error);
                  }
                  logger.error(error);
                  $timeout(() => {
                    vm.saveBtnText = "Save";
                    vm.saveBtnError = false;
                    vm.message = null;
                  }, 3000);
                });
            }
            $timeout(() => {
              vm.saveBtnText = "Save";
              vm.saveBtnError = false;
              vm.message = null;
            }, 3000);
          });
      } else {

      }
    };

    vm.hasUpdateChanges = payload => {
      let omitKeys = [
        "thumbnail",
        "price_group",
        "$$hashKey",
        "status",
        "next_status_value",
        "isShowUpdateProcessing"
      ];
      payload.next_status_id === 500
        ? omitKeys.push("next_effective_date")
        : null;
      for (let key in payload) {
        if (!omitKeys.includes(key)) {
          if (key.toLowerCase() === "effective_date") {
            if (
              $scope.getDateBasedOnFormat(payload.effective_date) !==
              $scope.original_choice[key]
            ) {
              return (vm.hasUpdate = true);
            }
          } else if (key.toLowerCase() === "next_effective_date") {
            if (
              $scope.getDateBasedOnFormat(payload.next_effective_date) !==
              $scope.original_choice[key]
            ) {
              return (vm.hasUpdate = true);
            }
          } else {
            if (payload[key] == $scope.original_choice[key]) {
              vm.hasUpdate = false;
            } else if (payload[key] != $scope.original_choice[key]) {
              return (vm.hasUpdate = true);
            }
          }
        }
      }
      return vm.hasUpdate;
    };

    vm.update = (entityName, payload) => {
      let dataToBeUpdated = _.clone(payload);
      if (
        entityName.toLowerCase() === "mtochoice" &&
        entityName &&
        !vm.disableActions
      ) {
        // variable to controle the loader functionality
        vm.isProcessing = true;
        ///Format effective and next effective date as per current date format
        dataToBeUpdated.effective_date = $scope.getFormattedDate(
          payload.effective_date
        );
        if (dataToBeUpdated.next_status_id == 500) {
          dataToBeUpdated.next_effective_date = "1970-01-01";
        } else {
          dataToBeUpdated.next_effective_date = $scope.getFormattedDate(
            payload.next_effective_date
          );
        }
        if (!vm.updateChoiceValidationForm()) {
          if (vm.hasUpdateChanges(dataToBeUpdated)) {
            MTOChoiceService.API.UpdateChoice(dataToBeUpdated)
              .then(response => {
                vm.isProcessing = false;
                response.data.data.thumbnail = payload.thumbnail;
                vm.getMtoChoiceMetaData()
                  .then(response => {
                    vm.loadThumbNailImages("165x165");
                  })
                  .catch(error => {
                    logger.error(error);
                  });
                //if group by filter is applied then update choice from group array
                if (vm.groupByField) {
                  //find index of group under which current choice exist
                  let groupFieldIndex = vm.groupChoices.findIndex(
                    group =>
                      group[vm.groupByField] ===
                      vm.groupChoicesMap[payload.id][vm.groupByField]
                  );
                  //find index of choice from choices list under the selected group
                  let groupIndex = vm.groupChoices[
                    groupFieldIndex
                  ].choices.findIndex(
                    choice => parseInt(choice.id) === parseInt(payload.id)
                  );

                  if (groupFieldIndex === -1) {
                    vm.groupChoices.push({
                      [vm.groupByField]: payload[vm.groupByField],
                      count: 1,
                      expanded: false,
                      selected: 1,
                      choices: [payload]
                    });
                  } else if (
                    groupFieldIndex > -1 &&
                    vm.groupChoices[groupFieldIndex].choices[groupIndex][
                    vm.groupByField
                    ] !== response.data.data[vm.groupByField]
                  ) {
                    vm.groupChoices[groupFieldIndex].choices.splice(
                      groupIndex,
                      1
                    );
                    vm.groupChoices[groupFieldIndex].count--;
                    let newGroupFieldIndex = vm.groupChoices.findIndex(
                      group =>
                        group[vm.groupByField] ===
                        response.data.data[vm.groupByField]
                    );
                    if (newGroupFieldIndex === -1) {
                      vm.groupChoices.push({
                        [vm.groupByField]: response.data.data[vm.groupByField],
                        count: 1,
                        expanded: false,
                        selected: 1,
                        choices: [response.data.data]
                      });
                    } else if (
                      newGroupFieldIndex > -1 &&
                      vm.groupChoices[newGroupFieldIndex].choices
                    ) {
                      vm.groupChoices[newGroupFieldIndex].choices.unshift(
                        response.data.data
                      );
                      vm.groupChoices[newGroupFieldIndex].count++;
                      vm.groupChoicesMap[payload.id] = response.data.data;
                    } else {
                      vm.groupChoices[newGroupFieldIndex].count++;
                    }
                    //update choice from list
                    vm.groupChoicesMap[payload.id] = response.data.data;
                  } else if (
                    groupFieldIndex > -1 &&
                    vm.groupChoices[groupFieldIndex].choices
                  ) {
                    //update choice from list
                    vm.groupChoices[groupFieldIndex].choices[groupIndex] =
                      response.data.data;
                    vm.groupChoicesMap[payload.id] = response.data.data;
                  }
                }
                let index = vm.mtoChoiceDataList.findIndex(
                  choice => choice.id === payload.id
                );
                vm.mtoChoiceDataList[index] = response.data.data; //update current object in the data list
                vm.ChoicesMap[payload.id] = response.data.data; //update object in the map
                $scope.original_choice = response.data.data;
                $scope.original_choice.effective_date = $scope.getDateBasedOnFormat(
                  $scope.original_choice.effective_date
                );
                // if($scope.original_choice.next_effective_date.toLowerCase() !== "none") {
                $scope.original_choice.next_effective_date = $scope.getDateBasedOnFormat(
                  $scope.original_choice.next_effective_date
                );
                // }
                vm.opdone = true;
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "update",
                  response: response,
                  inserted_id: payload.id
                });
              })
              .catch(error => {
                vm.isProcessing = false;
                $scope.$broadcast("saveOrUpdateUdd", {
                  event: "update",
                  error: error
                });
                logger.error(error);
              });
          } else {
            vm.isProcessing = false;
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
          vm.isProcessing = false;
          let response = {
            status: 412,
            form_validation_error: vm.validationError
          };
          $scope.$broadcast("saveOrUpdateUdd", {
            event: "update",
            response: response
          });
        }
      } else {

      }
    };

    vm.delete = payload => {
      vm.isLoadingDelete = true;
      if (!vm.disableActions) {
        MTOChoiceService.API.DeleteChoice($stateParams.mto_id, payload.id)
          .then(response => {
            vm.isLoadingDelete = false;
            vm.opdone = true;
            delete vm.ChoicesMap[payload.id];

            vm.totalRecordCount = vm.totalRecordCount - 1;
            /* variables to reset the Notification message-start */
            $scope.mtoChoiceSuccessMessage = null;
            $scope.mtoChoiceErrorMessage = null;
            $scope.mtoChoiceUDDSuccessMessage = null;
            //if group by filter is applied then delete choice from group array
            if (vm.groupByField) {
              //find index of group under which current choice exist
              let groupFieldIndex = vm.groupChoices.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );

              //find index of choice from choices list under the selected group
              let groupIndex = vm.groupChoices[
                groupFieldIndex
              ].choices.findIndex(
                choice => parseInt(choice.id) === parseInt(payload.id)
              );
              //Delete choice from list
              vm.groupChoices[groupFieldIndex].choices.splice(groupIndex, 1);
              vm.groupChoices[groupFieldIndex].count -= 1; //decrease choice count of the group
              delete vm.groupChoicesMap[payload.id];
              vm.limit =
                vm.groupChoices[groupFieldIndex].choices.length + vm.limit;
              vm.groupChoices[groupFieldIndex].groupPage -= 1;
            }
            let index = vm.mtoChoiceDataList.findIndex(
              choice => choice.id === payload.id
            );
            vm.mtoChoiceDataList.splice(index, 1);
            vm.recordsCount = vm.mtoChoiceDataList.length;
            /* variables to reset the Notification message-end */
            vm.closeForm("mtochoice");
          })
          .catch(error => {
            vm.dependencyList = error.data.dependency;
            vm.showDependencyDetailsData = true;
            $timeout(() => {
              $("#rcrightsidebar").focus();
            }, 0);
            logger.error(error);
          });
      } else {

      }
    };

    vm.reloadUDDs = () => {
      $scope.isEnabled = false;
      common.$timeout(() => {
        $scope.isEnabled = true;
      }, 1);
    };

    vm.goToClonePanel = choice => {
      choice.isLoadingClone = true;
      choice.choice_description.includes("clone") ||
        choice.choice_description.includes("Clone")
        ? ""
        : $state
          .go("common.prime.mtooptions.mtochoices.clone", {
            id: choice.id
          })
          .then(() => {
            if (choice.isLoadingClone) {
              $timeout(() => {
                choice.isLoadingClone = false;
              }, 1);
            }
          });
    };

    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
      vm.showDependencyDetails = true;
    };

    //This function will be called when click event happens on Next button taking screen name as parameter to move forward
    vm.goToScreen = screen => {
      vm.validationMessage = null;
      vm.validationError = [];
      vm.publishResponseMessage = false;
      vm.mtodataUploaderror = false;
      vm.opdone = false;
      if (screen && screen.toLowerCase() === "choicemasterscreen") {
        vm.createForm = true;
        vm.configureStage = false;
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
        vm.previewAndPublish = false;
        vm.back = true;
        $scope.isEnabled = true;
        // $scope.$broadcast("initUserDefinedData", {
        //   a: 10
        // });
        vm.validationMessage = null;
        //Variable to set the validation to false if the required validation is met
        vm.isInvalidForm = false;
      } else if (screen && screen.toLowerCase() === "dropconfigurationscreen") {
        vm.configureScreen = false;
        vm.manageDropScreen = true;
        vm.createForm = false;
        vm.previewAndPublish = false;
        vm.back = true;
      } else if (screen && screen.toLowerCase() === "publishscreen") {
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.createForm = false;
        vm.previewAndPublish = true;
        vm.back = true;
      }
    };

    vm.updateChoiceValidationForm = () => {
      vm.validationError = [];
      vm.isInvalidForm = false;
      if (vm.mto_choice_form && vm.mto_choice_form.$invalid) {
        vm.isInvalidForm = true; // variable used to show error fields
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in MTO choice maintenance Screen."
        );
      }
      if (vm.uddForm && vm.uddForm.$invalid) {
        vm.isInvalidForm = true; // variable used to show error fields
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields in UDD Screen."
        );
      }
      return vm.isInvalidForm;
    };

    vm.continueFn = screen => {
      vm.validationMessage = null;
      vm.isInvalidForm = false;
      if (vm.configureScreen === undefined) {
        vm.createForm = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.back = false;
      } else if (screen === "createForm") {
        $scope.isEnabled = true; /* setting variable true while going next to udd screen after changing collection and family option from master screen to get api call*/
        //if current screen is create/update master data form and form data
        //is valid and all mandatory fields are filled then go to next stage
        if (
          ($scope.is_collection === true && vm.allCollections.length === 0) ||
          ($scope.is_family === true && vm.allFamilies.length === 0) ||
          ($scope.is_price === true && vm.allPriceGroups.length === 0)
        ) {
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please add/select values for mandatory dependencies before proceeding.";
        } else {
          if (!vm.mto_choice_form.$invalid) {
            vm.createForm = false;
            vm.configureScreen = true;
            vm.manageDropScreen = false;
            vm.previewAndPublish = false;
            vm.back = true;
            // $scope.$broadcast("initUserDefinedData", {
            //   a: 10
            // });
          } else {
            vm.isInvalidForm = true; // variable used to show error fields
            //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
            vm.validationMessage =
              "Please check for any validation errors and all the mandatory fields.";
          }
        }
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        if (!vm.uddForm.$invalid) {
          vm.configureScreen = false;
          vm.manageDropScreen = true;
          vm.previewAndPublish = false;
          vm.back = true;
        } else {
          vm.isInvalidForm = true; // variable used to show error fields
          //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
          vm.validationMessage =
            "Please check for any validation errors and all the mandatory fields.";
        }
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        if (
          ($scope.files && $scope.files.length > 0) ||
          ($scope.drop.url && $scope.drop.url !== null)
        ) {
          let btnLabel = $stateParams.id ? "'Upload Image'" : "'Add to Queue'";
          if (vm.drop_form.$valid) {
            vm.validationMessage = `Please click on ${btnLabel} button to link drop to MTO Choice. Click on 'Skip' button to proceed without uploading.`;
          } else {
            vm.validationMessage = `Please fill in the required fields and click on ${btnLabel} button to link drop to MTO Choice or Click on 'Skip' button to proceed without uploading.`;
          }
        } else {
          vm.createForm = false;
          vm.configureScreen = false;
          vm.previewAndPublish = true;
          vm.manageDropScreen = false;
          vm.back = true;
        }
      } else if (screen && screen.toLowerCase() === "skip") {
        vm.manageDropScreen = false;
        vm.previewAndPublish = true;
        vm.back = true;
        vm.validationMessage = null;
      }
    };

    vm.backFn = screen => {
      vm.validationMessage = null;
      if (vm.configureScreen === undefined) {
        vm.back = false;
        vm.refineFn();
      } else if (screen && screen.toLowerCase() === "configurescreen") {
        $scope.isEnabled = false; /* setting variable false while going back to master screen after changing collection and family option */
        vm.createForm = true;
        vm.configureStage = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
      } else if (screen && screen.toLowerCase() === "dropscreen") {
        vm.configureScreen = true;
        vm.previewAndPublish = false;
        vm.showSummaryPanel = true;
        vm.manageDropScreen = false;
      } else if (screen && screen.toLowerCase() === "publishmtochoice") {
        vm.configureScreen = false;
        vm.previewAndPublish = false;
        vm.manageDropScreen = true;
        vm.showSummaryPanel = true;
      }
      vm.mtodataAddToQueueError = false;
    };

    vm.refineFn = () => {
      vm.createForm = true;
      vm.configureScreen = false;
      vm.locationAddressForm = false;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
    };
    vm.confirmDelete = false;
    vm.confirmDel = () => {
      vm.confirmDelete = !vm.confirmDelete;
    };

    // to get access from profile to operate crud operations
    $scope.getAccessPermissions(vm.uuid)
      .then(result => {
        vm.permissionsMap = JSON.parse(JSON.stringify(result));
        vm.initializeMTOChoice();
      })
      .catch(() => {
        this.permissionsMap = {};
        vm.initializeMTOChoice();
      })
    vm.watchers();
  }
})();
