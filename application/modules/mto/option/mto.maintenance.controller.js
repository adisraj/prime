(function () {
  "use strict";
  angular
    .module("rc.prime.mto")
    .controller("MTOMaintenanceController", MTOMaintenanceController);
  MTOMaintenanceController.$inject = [
    "$scope",
    "$window",
    "common",
    "MTOService",
    "MTOTypeService",
    "MTOParameterService",
    "VendorService",
    "UserService",
    "DataLakeAPIService",
    "DataLakeService",
    "StatusCodes",
    "$location",
    "$http"
  ];

  function MTOMaintenanceController(
    $scope,
    $window,
    common,
    MTOService,
    MTOTypeService,
    MTOParameterService,
    VendorService,
    UserService,
    DataLakeAPIService,
    DataLakeService,
    StatusCodes,
    $location,
    $http
  ) {
    let vm = this;
    let $filter = common.$filter;
    let $state = common.$state;
    let $stateParams = common.$stateParams;
    let logger = common.Logger.getInstance("MTOMaintenanceController");
    let EntityDetails = common.EntityDetails;
    let ApplicationPermissions = common.ApplicationPermissions;
    let Identifiers = common.Identifiers;
    let generateDynamicTableColumnsService =
      common.GenerateDynamicTableColumnsService;
    let Notification = common.Notification;
    let LocalMemory = common.LocalMemory;

    /**variable declaration */
    vm.entityInformation = {};
    vm.mtoGroupByDropdown = [];
    vm.mtoDataList = [];
    vm.allMTOTypes = {};
    vm.allVendors = {};
    vm.applyFiltersBtnLabel = "Apply Filters";
    vm.mtoDescription = "";
    vm.$location = $location;
    vm.isAddedToQueue = false;
    vm.mtoOptAddToQueueError = false;
    vm.dependencyList = [];
    vm.errorDependentData = [];
    vm.groupMTOMasterMap = [];
    vm.showDependencyDetailsData = false;
    vm.showDependencyDetails = false;
    vm.isShowDetails = false;
    vm.isUpdate = false;
    vm.opdone = false;
    vm.isLoading = false;
    vm.showFilter = false; //Variable to hide the Advanced Search panel initially
    vm.advancedSearchPanel = false;
    vm.filters = {};
    vm.appliedFilterCount = 0;
    $scope.drop = {};
    vm.isGroupByApplied = false;
    vm.isGroupByFilterApplied = false;
    vm.uuid = "36";
    vm.isViewAuthorized = true;
    vm.applyFilterSuccess = true;
    vm.sortByField = "none"; // Variable to hold current sorting field.
    vm.sortByOrder = "desc"; // Variable to hold the order for the sort option.
    vm.groupByField = "";
    vm.groupByValue = null;
    //vm.groupMTOMaster = [];
    vm.selectedGroupHeader = [];
    // Variable to hold the access value for 'option-clone' from user management
    vm.isCloneAllowed = false;
    vm.isLoadingDelete = false;
    vm.isResetFilter = false;
    vm.statusCodes = StatusCodes;
    // variable to save cover image as thumbnail
    vm.is_thumbnail = 1;
    // variable to call confirmation panel on cover image deletion
    vm.showConfirmDeletion = false;
    // On create, variable to call confirmation panel on cover image deletion
    vm.DeletionConfirmation = false;

    //Configure vendor search select object
    $scope.selectVendorConfiguration = {
      valueField: "id",
      labelField: "name",
      searchField: ["name"],
      sortField: "name",
      //Space is added to so that end of the text does not cut off
      placeholder: "Select Vendors" + " ",
      allowEmptyOption: true,
      create: false,
      highlight: false,
      hideSelected: true,
      searchConjunction: "or",
      options: $scope.allVendors,
      render: {
        option: (data, escape) => {
          if (data.status_id === vm.statusCodes.Inactive.ID) {
            return (
              '<div class="p-5 disabled">' +
              '<div class="m-5">' +
              '<span class="c-black f-13"> ' +
              escape(data.name) +
              " : " +
              data.status +
              "</span>" +
              "</span>" +
              "<span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.VendorType) +
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
              " : " +
              data.status +
              "</span>" +
              "</span>" +
              "<span>" +
              '<span class="f-300 f-11 c-gray pull-right">' +
              escape(data.VendorType) +
              "</span>" +
              "</div>" +
              "</div>"
            );
          }
        },
        item: (data, escape) => {
          vm.selectedVendor = data.name;
          return (
            '<div class="option">' +
            '<span class="title m-r-5">' +
            escape(data.name) +
            "</span>" +
            "-" +
            '<span class="m-l-5 f-12 text-muted">' +
            escape(data.VendorType) +
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
        value: "description"
      },
      {
        field: "Option Type",
        value: "option_type"
      },
      {
        field: "Vendor",
        value: "vendor"
      },
      {
        field: "Status",
        value: "status"
      }
    ];

    vm.setLimit = () => {
      vm.limit = 50;
    };

    vm.initializeMTO = () => {
      vm.setLimit();
      vm.reloadOptionCountAndList();
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.fetchFeatureAccessDetails();
    };

    // Fetch access for clone
    vm.fetchFeatureAccessDetails = () => {
      UserService.API.IsAllowedFeaturedPassword("option-clone")
        .then(result => {
          if (result.data && result.data.length) {
            vm.isCloneAllowed = true;
          } else {
            vm.isCloneAllowed = false;
          }
        })
        .catch(error => {
          console.error(error);
        });
    };

    //get required mto information
    vm.getEntityInformation = () => {
      common.EntityDetails.API.GetEntityInformation(vm.uuid)
        .then(lt_information => {
          vm.entityInformation = lt_information;
          $scope.name = vm.entityInformation.name;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid)
        .then(model => {
          vm.getDynamicColumns(model);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.getDynamicColumns = model => {
      let supportActions = {};
      let alterTitles = {};
      let drillTo = {};
      let mtoMeta = generateDynamicTableColumnsService.getTableColumns(
        model,
        supportActions,
        alterTitles,
        drillTo
      );
      vm.mtoGroupByDropdown = mtoMeta.dropdownList;
    };

    /*Get Meta data for MTO*/
    vm.getMTOMetaData = () => {
      let data = DataLakeAPIService.API.GetDropsByUuid(vm.uuid)
        .then(res => {
          if (res.data !== undefined) {
            vm.mto_thumbnails = res.data;
          } else {
            vm.mto_thumbnails = [];
          }
          return res;
        })
        .catch(error => {
          logger.error(error);
        });
      return data;
    };

    // Function to get preview
    vm.getDownloadUrl = (url, downloadUrl) => {
      if (!downloadUrl) {
        return DataLakeAPIService.API.GetDownloadUrl(url, vm.uuid);
      } else {
        return downloadUrl;
      }
    };


    /*Load thumbnail images for MTO data cards*/
    vm.loadThumbNailImages = size => {
      if (vm.mtoDataList && vm.originalMTODataList && vm.originalMTODataList.length) {
        for (let i = 0; i < vm.mtoDataList.length; i++) {
          if (vm.mto_thumbnails) {
            let thumbnail = vm.mto_thumbnails.filter(lake => {
              return lake.instance_id == vm.mtoDataList[i].id;
            });

            if (thumbnail[0] && vm.originalMTODataList[i]) {
              if (!thumbnail[0].url) {
                if (
                  thumbnail[0].type &&
                  thumbnail[0].type.toLowerCase() === "virtual"
                ) {
                  vm.mtoDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    "",
                    vm.uuid
                  );
                  vm.mtoDataList[i].drop_id = thumbnail[0].drop_id;
                  /**Store the images inside originalMTODataList array for getting images in search result */
                  vm.originalMTODataList[i].thumbnail =
                    vm.mtoDataList[i].thumbnail;
                  vm.originalMTODataList[i].drop_id = vm.mtoDataList[i].drop_id;
                } else {
                  vm.mtoDataList[
                    i
                  ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                    thumbnail[0].drop_id,
                    size,
                    vm.uuid
                  );
                  vm.mtoDataList[i].drop_id = thumbnail[0].drop_id;
                  /**Store the images inside originalMTODataList array for getting images in search result */
                  vm.originalMTODataList[i].thumbnail =
                    vm.mtoDataList[i].thumbnail;
                  vm.originalMTODataList[i].drop_id = vm.mtoDataList[i].drop_id;
                }
              } else if (thumbnail[0].url) {
                vm.mtoDataList[i].thumbnail = thumbnail[0].url;
              }
            }
          }
        }
      }
    };

    vm.loadImage = function (mto, size) {
      DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
        vm.uuid,
        mto.id,
        "cover_image"
      )
        .then(response => {
          if (response && response.length > 0) {
            if (!response[0].url) {
              mto.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                response[0].drop_id,
                size,
                vm.uuid
              );
            } else if (response[0].url) {
              mto.thumbnail = response[0].url;
            }
          } else {
            mto.thumbnail = undefined;
          }
        })
        .catch(error => {
          logger.error(error);
        });
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
      if (vm.mtoData !== undefined) {
        vm.mtoData.showhistory = false;
      }
      vm.mtoData = data;
      vm.mtoData.showhistory = true;
      vm.isShowHistory = true;
      $scope.instanceName = data.description;
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

    $scope.closeShowHistory = function () {
      $scope.showhistory = false;
      $scope.isMaintenance = true;
      $scope.instanceName = null;
      if (vm.mtoData !== undefined) {
        vm.mtoData.showhistory = false;
      }
    };

    vm.getMTOTypes = () => {
      vm.showLoadingOptionType = true;
      MTOTypeService.API.GetMTOTypes()
        .then(response => {
          vm.allMTOTypes = response.data;
          vm.showLoadingOptionType = false;
          vm.loadOptionTypesDropDown();
        })
        .catch(error => logger.error(error));
    };

    vm.loadOptionTypesDropDown = () => {
      //Selectize object for Option Type Drop down
      $scope.selectOptionType = {
        valueField: "id",
        labelField: "short_description",
        searchField: ["short_description"],
        sortField: "short_description",
        //Space is added to so that end of the text does not cut off
        placeholder: "Select Option Type" + " ",
        allowEmptyOption: true,
        create: false,
        highlight: false,
        hideSelected: true,
        searchConjunction: "or",
        options: vm.allMTOTypes,
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
            vm.selectedOptionType = data.short_description;
            return (
              '<div class="option">' +
              '<span class="title m-r-5">' +
              escape(data.short_description) +
              "</span>" +
              "</div>"
            );
          }
        }
      };
    };

    vm.getVendors = () => {
      VendorService.API.GetVendors()
        .then(response => {
          vm.allVendors = [];
          _.each(response.data.data, response => {
            if (response.goods_allowed) {
              vm.allVendors.push(response);
            }
          });
        })
        .catch(error => {
          logger.error(error);
        });
    };

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


    // vm.setVendorData = (vendorId) => {
    //   let filteredVendor = vm.allVendors.filter(vendorData => vendorData.id === vendorId);
    //   vm.selectedVendor = {
    //     id: filteredVendor[0].id,
    //     name: filteredVendor[0].name,
    //     status: filteredVendor[0].status,
    //     VendorType: filteredVendor[0].VendorType
    //   }
    // }

    vm.gotoChoices = id => {
      $state.go("common.prime.mtooptions.mtochoices", {
        mto_id: id
      });
    };

    vm.fetchTotalRecordCount = () => {
      MTOService.API.FetchTotalRecordCount()
        .then(mtoCount => {
          common.$timeout(() => {
            vm.totalRecordCount = mtoCount;
            if (vm.mtoDataList && vm.mtoDataList.length) {
              vm.availableMtoCount = vm.totalRecordCount - vm.mtoDataList.length;
            }
          }, 0);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    // On Press of refresh button fetch options count and the data
    vm.reloadOptionCountAndList = refresh => {
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
            vm.fetchTotalRecordCount();
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
                vm.availableMtoCount = vm.totalRecordCount - vm.mtoDataList.length;
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
        let page = 1;
        vm.isLoaded = false;
        vm.isGroupByApplied = false;
        if (refresh !== undefined) {
          // On click of refresh button, a message bar with information will be toggled in UI
          vm.totalTimeText = "";
          vm.isRefreshing = true;
          vm.refreshTableText = "Refreshing list...";
        }
        vm.pagination();
        MTOService.API.GetMTOList(
          { page: page, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (refresh !== undefined) {
              // After successfully refreshed information like time taken for getting response and number of records fetched will be displyed in UI
              vm.isLoaded = true;
              vm.totalRecordsText = "record(s) loaded in approximately";
              vm.totalTimeText =
                "<strong>" +
                response.time_taken +
                "</strong><span class='f-14 c-gray'> seconds</span>";
              vm.refreshTableText = "Successfully refreshed";
              common.$timeout(() => {
                vm.isRefreshing = false;
              }, 3500);
            }
            vm.recordsCount = response.data.data.length;
            vm.mtoDataList = response.data.data;
            vm.totalRecordCount = response.data.filterdRecordCount;
            vm.availableMtoCount = vm.totalRecordCount - response.data.data.length;
            vm.originalMTODataList = JSON.parse(JSON.stringify(vm.mtoDataList));

            // Get thumbnail images for all options after getting metadata like drop id.
            let thumbnailsList = vm.getMTOMetaData();
            thumbnailsList.then(res => {
              vm.loadThumbNailImages("165x165");
            });
            localStorage.removeItem("MtoPageCount");
            vm.isLoaded = true;
            vm.mapMTOOptions(response.data.data);
            resolve(response);
          })
          .catch(error => {
            vm.isRefreshing = true;
            vm.refreshTableText = "Unsuccessfull!";
            reject(error);
            logger.error(error);
            common.$timeout(() => {
              vm.isRefreshing = false;
            }, 3500);
          });
      });
    };

    //create map with key-value pair where key:id
    vm.mapMTOOptions = list => {
      vm.OptionsMap = [];
      for (let i = 0; i < list.length; i++) {
        if (vm.OptionsMap[list[i].id] === undefined) {
          vm.OptionsMap[list[i].id] = list[i];
        }
      }
      $stateParams.id && $state.current.name.includes(".update")
        ? vm.gotoUpdateState()
        : "";
    };

    //Initialize Create and Update Forms
    vm.InitializeCreateUpdateForm = () => {
      vm.getMTOParameters();
      $scope.getStatuses(common.Identifiers.mto_option);
      vm.getMTOTypes();
      vm.getVendors();
      !$stateParams.id && $state.current.name.includes(".new")
        ? vm.openForm()
        : "";
    };

    // Scroll bar will be pointed to (x, y) position
    vm.scrollToPosition = (x, y) => {
      window.scrollTo(x, y);
    };

    vm.loadMoreMtos = () => {
      vm.isLoading = true;
      let page = parseInt(LocalMemory.API.Get("MtoPageCount")) || 1;
      vm.pagination();
      if (!vm.isFilterApplied) {
        if (vm.sortByField === "") {
          vm.sortByField = "none";
          vm.sortByOrder = "desc";
        }
        MTOService.API.GetMTOList(
          { page: page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.mtoDataList.push(response.data[i]);
                vm.originalMTODataList.push(response.data[i]);
              }
              vm.availableMtoCount =
                vm.totalRecordCount - vm.originalMTODataList.length;
              if (vm.searchMtos) {
                $scope.showhistory = false;
                vm.mtoDataList = $filter("filter")(
                  vm.originalMTODataList,
                  vm.searchMtos
                );
              }
              vm.getMTOMetaData()
                .then(response => {
                  vm.loadThumbNailImages("165x165");
                })
                .catch(error => {
                  logger.error(error);
                });
              vm.setLimit();
              LocalMemory.API.Post("MtoPageCount", page + 1);
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        MTOService.API.GetMTOList(
          { page: page + 1, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: vm.groupByField, value: vm.groupByValue }
        )
          .then(response => {
            if (response.data.length > 0) {
              for (let i = 0; i < response.data.length; i++) {
                vm.mtoDataList.push(response.data[i]);
              }
              !vm.isGroupByFilterApplied
                ? (vm.availableMtoCount =
                  vm.totalRecordCount - vm.mtoDataList.length)
                : "";
              vm.getMTOMetaData()
                .then(response => {
                  vm.loadThumbNailImages("165x165");
                })
                .catch(error => {
                  logger.error(error);
                });
              vm.setLimit();
              LocalMemory.API.Post("MtoPageCount", page + 1);
              vm.isLoading = false;
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.watchers = () => {
      /** searching MTO Data List */
      $scope.$watch("mtoMaintCtrl.searchMtos", (searchValue, o) => {
        $scope.showhistory = false;
        vm.mtoDataList = $filter("filter")(vm.originalMTODataList, searchValue);
      });
    };

    /************** Group data by field implementation *****************/
    vm.groupByData = groupByColumn => {
      return new Promise((resolve, reject) => {
        vm.isGroupHeader = false;
        vm.groupMTOMaster = [];
        vm.isGroupByApplied = true;
        vm.isFilterApplied === true ? (vm.isGroupByFilterApplied = true) : "";
        if (groupByColumn.length > 0) {
          vm.pagination();
          MTOService.API.GetMTOList(
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
                    vm.groupMTOMaster.push(response.data.data[i]);
                  } else {
                    response.data.data[i].selected = 1;
                    response.data.data[i].expanded = false;
                    vm.groupMTOMaster.push(response.data.data[i]);
                  }
                } else {
                  response.data.data[i].selected = 1;
                  response.data.data[i].expanded = false;
                  vm.groupMTOMaster.push(response.data.data[i]);
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
          vm.fetchTotalRecordCount();
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

    vm.MapGroupMTOMaster = list => {
      for (let i = 0; i < list.length; i++) {
        if (vm.groupMTOMasterMap[list[i].id] === undefined) {
          vm.groupMTOMasterMap[list[i].id] = list[i];
        }
      }
    };

    vm.showMtoData = function (groupByField, groupData) {
      groupData.isMtoOptionsLoaded = false;
      groupData.expanded = !groupData.expanded;
      if (groupData.mtooptions === undefined) {
        vm.groupByValue = groupData[groupByField];
        groupData.groupPage = 1;
        vm.pagination();
        MTOService.API.GetMTOList(
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: groupByField, value: vm.groupByValue }
        )
          .then(response => {
            groupData.isMtoOptionsLoaded = true;
            if (response.data.data.length > 0) {
              groupData.mtooptions = response.data.data;
              groupData.availableGroupMtoOptions =
                groupData.count - response.data.data.length;
              vm.groupMTOMasterMap = [];
              vm.OptionsMap = [];
              vm.MapGroupMTOMaster(groupData.mtooptions);
              vm.mapMTOOptions(groupData.mtooptions);
              vm.loadGroupByThumbNailImages("165x165", groupData.mtooptions);
            }
          })
          .catch(error => {
            logger.error(error);
          });
      } else {
        groupData.isMtoOptionsLoaded = true;
      }
    };

    vm.loadGroupByThumbNailImages = (size, mtooptions) => {
      if (mtooptions) {
        for (let i = 0; i < mtooptions.length; i++) {
          let thumbnail = vm.mto_thumbnails.filter(lake => {
            return lake.instance_id == mtooptions[i].id;
          });
          if (thumbnail[0]) {
            if (!thumbnail[0].url) {
              mtooptions[
                i
              ].thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
                thumbnail[0].drop_id,
                size,
                vm.uuid
              );
            } else if (thumbnail[0].url) {
              mtooptions[i].thumbnail = thumbnail[0].url;
            }
            mtooptions[i].drop_id = thumbnail[0].drop_id;
          }
        }
      }
    };

    ///Group by Panel: Select or Unselect all the item groups
    vm.toggleAllGroups = isSelectAll => {
      for (let i = 0; i < vm.groupMTOMaster.length; i++) {
        if (isSelectAll) {
          vm.groupMTOMaster[i].selected = 1;
        } else {
          vm.groupMTOMaster[i].expanded = false;
          vm.groupMTOMaster[i].mtooptions = undefined; //remove data from group after Unselect all
          vm.groupMTOMaster[i].selected = 0;
        }
      }
    };

    vm.toggleselectedGroupMtoOptions = function (gc, index) {
      if (gc.selected) {
        for (let x = 0; x < vm.selectedGroupHeader.length; x++) {
          if (
            vm.selectedGroupHeader[x][vm.groupByField] === gc[vm.groupByField]
          ) {
            vm.selectedGroupHeader.splice(x, 1);
          }
        }
        gc.mtooptions = undefined;
        for (let i = 0; i < vm.groupMTOMaster.length; i++) {
          vm.groupMTOMaster[i].isMtoOptionsLoaded = undefined;
        }
      } else {
        vm.selectedGroupHeader.push(gc);
      }
      gc.expanded = false;
    };

    //load next batch of records on click of load more button
    vm.loadMoreMtoOptData = (groupByField, groupData) => {
      groupData.isMoreMtoOptsLoaded = false;
      vm.groupByValue = groupData[groupByField];
      if (groupData[groupByField]) {
        groupData.groupPage = groupData.groupPage + 1;
        vm.pagination();
        MTOService.API.GetMTOList(
          { page: groupData.groupPage, limit: vm.limit },
          vm.filters,
          { field: vm.sortByField, order: vm.sortByOrder },
          { field: groupByField, value: vm.groupByValue }
        )
          .then(response => {
            let data = response.data.data || response.data;
            groupData.isMoreMtoOptsLoaded = true;
            if (data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                if (!vm.groupMTOMasterMap[data[i].id]) {
                  groupData.mtooptions.push(data[i]);
                  vm.groupMTOMasterMap[data[i].id] = data[i];
                  vm.OptionsMap[data[i].id] = data[i];
                }
              }
              groupData.availableGroupMtoOptions =
                groupData.count - groupData.mtooptions.length;
              vm.loadGroupByThumbNailImages("165x165", groupData.mtooptions);
              vm.setLimit();
            }
          })
          .catch(error => {
            logger.error(error);
          });
      }
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

    vm.fetchDropsByUuidAndInstanceId = instanceId => {
      $scope.notImage = false;
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

    vm.selectFiles = (files, errFiles) => {
      $scope.isUpload = false;
      $scope.isDropUploaded = false;
      $scope.files = files;
      $scope.errFiles = errFiles;
      $scope.notImage = false;
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
      vm.choicedataUploaderror = false;
      vm.mtoOptAddToQueueError = false;
      $scope.notImage = false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
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

    vm.addCoverImg = () => {
      if ($scope.drop.source && $scope.drop.source.toLowerCase() === "url") {
        vm.AddedForUrl($scope.drops);
        vm.isProcessing = true;
      } else {
        vm.replaceExistingDropAndUpload();
      }
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
              vm.choicedataUploaderror = false;
              vm.mtoOptAddToQueueError = false;
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
        if (!$scope.isAllowMultipleDrops) {
          $scope.isAllowMultipleDrops = true;
          vm.isProcessing = false;
        }
      }
    };

    $scope.resetAllconfigData = () => {
      vm.choicedataUploaderror = false;
      vm.mtoOptAddToQueueError = false;
      vm.showCantGen = false;
      $scope.files = [];
      $scope.drop.url = null;
      $scope.notImage = false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
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
              $scope.notImage = false;
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
        vm.isUploading = true;
        vm.choicedataUploaderror = false;
        vm.isAddedToQueue = true;
        vm.mtoOptAddToQueueError = false;
        if (drops && drops.length > 0) {
          if ($scope.selectedLakeStream.stream_id == 33) {
            let coverDrops = drops.filter(item => {
              return item.stream_id == 33;
            });
            if (coverDrops && coverDrops.length > 0) {

              $scope.isAllowMultipleDrops = false;
              vm.isUploading = false;
              vm.isAddedToQueue = false;
              $scope.notImage = false;
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
      $scope.notImage = false;
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
        common.$timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      } else {
        // $scope.queuedDrops.splice(index, 1);
        $scope.queuedDrops.splice(index, 1);
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        common.$timeout(() => {
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
        // $scope.drop.stream_id = null;
        // $scope.files = undefined;
        // $scope.errFiles = undefined;
        // $scope.drop.url = undefined;
        // vm.drop_form.url.$setPristine();
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
        common.$timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      } else {
        $scope.queuedDrops.splice(index, 1);
        angular.element("#showQueueMessage").show();
        vm.showSuccessQueueMessage = "Image removed from the Queue";
        common.$timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      if ($scope.queuedDrops.length === 0) {
        $scope.isAllowMultipleDrops = true;
      }
    };

    vm.resetModel = () => {
      $scope.drop = { source: "local" };
      $scope.files = undefined;
      $scope.errFiles = undefined;
      vm.fetchDropLakesByUuid();
      vm.getDropStatus();
    };

    // To delete drop
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
              vm.showSuccessQueueMessage = "Image unlinked from the MTO Option";
              delete vm.oldMtoOption.thumbnail; //delete the thumbnail property
              delete vm.mtooption.thumbnail;
              vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
              vm.resetModel();
              // This function is to remove the confirm box
              vm.initializeDropForm();
              resolve(true);
              common.$timeout(() => {
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
            vm.showSuccessQueueMessage = "Image unlinked from the MTO Option";
            vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
            vm.resetModel();
            // This function is to remove the confirm box
            vm.initializeDropForm();
            common.$timeout(() => {
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
      //     // If stream is cover image and is_thumbnail is true, then save the cover image as thumbnail
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
      //       common.$timeout(() => {
      //         angular.element("#showQueueMessage").hide();
      //         vm.showSuccessQueueMessage = null;
      //       }, 2500);
      //     }
      //     vm.resetValues();
      //     vm.isAddedToQueue = false;
      //   })
      //   .catch(error => {
      //     vm.isAddedToQueue = false;
      //     // vm.mtoOptAddToQueueError = error.data;
      //     vm.mtoOptAddToQueueError = "File type is not suitable for physical upload";
      //   });
      // } else {
      $scope.queuedDrops.push(queuedDropObject);
      // If stream is cover image and is_thumbnail is true, then save the cover image as thumbnail
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
        common.$timeout(() => {
          angular.element("#showQueueMessage").hide();
          vm.showSuccessQueueMessage = null;
        }, 2500);
      }
      vm.isAddedToQueue = false;
      $scope.notImage = false;
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      // }
      // $scope.queuedDrops.push(queuedDropObject);
      // // If stream is cover image and is_thumbnail is true, then save the cover image as thumbnail
      // if ($scope.queuedDrops[0] && $scope.queuedDrops[0].stream.toLowerCase() === "cover image" && vm.is_thumbnail) {
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
      //   common.$timeout(() => {
      //     angular.element("#showQueueMessage").hide();
      //     vm.showSuccessQueueMessage = null;
      //   }, 2500);
      // }
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
                vm.getMTOMetaData()
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

    vm.uploadDrop = (drop, instanceId,del) => {
      return new Promise((resolve, reject) => {
        try {
          vm.isUploading = true;
          // drop = $scope.drop;
          drop = angular.copy($scope.drop);
          drop.instance_id = instanceId;
          drop.uuid = vm.uuid;
          drop.files = $scope.files;
          drop.is_thumbnail = vm.is_thumbnail;
          drop.url = undefined;
          drop.is_save_to_document_store = undefined;
          drop.source = "local"
          if(del){
            if(del.source==="url" && del.url){
              drop.url=del.url
              drop.thumbnail=del.url
            }
          }
          DataLakeService.UploadDrop(drop)
            .then(() => {
              // After create of drops, it should be shown in the list immidietly
              vm.getMTOMetaData()
                .then(() => {
                  vm.loadThumbNailImages("165x165");
                  vm.resetModel();
                  vm.is_thumbnail = 1;
                })
                .catch(error => {
                  logger.error(error);
                });
              resolve(true);
              common.$timeout(() => {
                vm.isUploading = false;
                vm.isAddedToQueue = false;
                vm.fetchDropsByUuidAndInstanceId(drop.instance_id);
                $scope.files = null;
                $scope.errFiles = null;
                $scope.drop.stream_id = null;
                $scope.drop.url = null;
                vm.drop_form.url.$setPristine();
                vm.validationMessage = null;
                $scope.notImage = false;
                $scope.notImageUrl=false
                $scope.invalidUrl = false;
              }, 2000);
            })
            .catch(error => {
              reject(false);
              logger.error(error);
              vm.isUploading = false;
              // vm.choicedataUploaderror = error.data;
              vm.isAddedToQueue = false;
              vm.choicedataUploaderror = "File type is not suitable for physical upload";
            });
        } catch (error) {
          reject(false);
          logger.error(error);
        }
      });
    };
    //Storage function END

    //Shows the list of dependent entities in side panel
    vm.showDependencyListDetails = data => {
      vm.errorDependentData = data;
      vm.showDependencyDetailsData = true;
      vm.showDependencyDetails = true;
    };

    vm.openForm = () => {
      if (!vm.disableActions) {
        $state.go("common.prime.mtooptions.new");
        vm.isUpdate = false;
        vm.isInvalidForm = false; // variable used to show validation error for form fields
        vm.opdone = false;
        vm.isShowDetails = true;
        vm.validationMessage = null;
        $scope.head = {};
        $scope.head.effective_date = moment()
          .utcOffset("0")
          .format($scope.date_format);
        // set status and next_status
        $scope.head.status_id = 200;
        $scope.head.status = "Active";
        vm.showSummaryPanel = true;
        vm.createStage = true;
        vm.configureStage = false;
        vm.previewandpublishStage = false;
        vm.createForm = true;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.confirmDelete = false;
        $scope.drop = {};
        $scope.files = [];
        $scope.errFiles = null;
        /* variables to reset the Notification message-start */
        $scope.mtoSuccessMessage = null;
        $scope.mtoErrorMessage = null;
        /* variables to reset the Notification message-end */
        vm.publishResponseMessage = false;
        $scope.queuedDrops = [];
        vm.resetModel();
      }
    };

    vm.closeForm = () => {
      $scope.notImage=false
      $scope.notImageUrl=false
      $scope.invalidUrl = false;
      vm.isShowDetails = false;
      vm.showDependencyDetailsData = false;
      vm.showDependencyDetails = false;
      // $state.go("common.prime.mtooptions");
      $window.history.back();
      vm.showFilter ? vm.InitializeFilterForm() : "";
    };

    //close dependency details side panel only
    vm.closeDependencyDetails = () => {
      vm.showDependencyDetails = false;
    };

    vm.dblClickAction = data => {
      if (vm.permissionsMap.update) {
        data.isShowUpdateProcessing = true;
        common.$timeout(() => {
          $state
            .go("common.prime.mtooptions.update", { id: data.id })
            .then(() => {
              data.isShowUpdateProcessing = false;
            });
        }, 0);
        vm.isInvalidForm = false; // variable used to show validation error for form fields
        vm.isUpdate = true;
        vm.opdone = false;
        vm.mtooption = _.clone(data);
        vm.oldMtoOption = data;
        vm.old_option = _.clone(data);
        vm.mtooption.vendor = { id: data.vendor_id };
        vm.showSummaryPanel = true;
        vm.publishResponseMessage = false;
        vm.createStage = true;
        vm.configureStage = false;
        vm.validationMessage = null;
        vm.previewandpublishStage = false;
        vm.createForm = true;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
        vm.confirmDelete = false;
        $scope.drop = {};
        $scope.files = [];
        $scope.errFiles = null;
        vm.loadImage(vm.mtooption, "125x125");
        vm.mtooption.description.includes("Clone") ||
          vm.mtooption.description.includes("clone")
          ? (vm.isCloned = true)
          : (vm.isCloned = false);
        vm.mtooption.effective_date = $scope.getDateBasedOnFormat(
          vm.mtooption.effective_date
        );
        vm.old_option.effective_date = $scope.getDateBasedOnFormat(
          vm.old_option.effective_date
        );
        /* variables to reset the Notification message-start */
        $scope.mtoSuccessMessage = null;
        $scope.mtoErrorMessage = null;
        /* variables to reset the Notification message-end */
        // Set Dependency details to false
        vm.showDependencyDetailsData = false;
        vm.showDependencyDetails = false;
        vm.resetModel();
      }
    };

    //goto update state if id exists in data map
    vm.gotoUpdateState = () => {
      if ($stateParams.id && $state.current.name.includes(".update")) {
        //if current state is update and selected id is not present in options map then get by API call
        MTOService.API.GetMTOListById($stateParams.id)
          .then(response => {
            if (response.id) {
              vm.OptionsMap[$stateParams.id] = response;
              vm.dblClickAction(vm.OptionsMap[$stateParams.id]);
            } else {
              //if response also don't have id then close form
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

    vm.setStages = () => {
      vm.createForm = true;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
    };

    vm.setStageIndication = currentScreen => {
      if (currentScreen && currentScreen.toLowerCase() === "createform") {
        vm.createStage = true;
        vm.manageDropStage = false;
        vm.previewAndPublish = false;
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "dropscreen"
      ) {
        vm.createStage = true;
        vm.manageDropStage = true;
        vm.previewAndPublish = false;
        //Hide the Queued message on load of the drop manage screen
        angular.element("#showQueueMessage").hide();
      } else if (
        currentScreen &&
        currentScreen.toLowerCase() === "previewandpublish"
      ) {
        vm.createStage = true;
        vm.manageDropStage = true;
        vm.previewAndPublish = true;
      }
    };

    vm.performKeyUpEvent = event => {
      if (event.keyCode === 27 && vm.showDependencyDetailsData === true) {
        vm.showDependencyDetailsData = false;
        vm.$confirmdelete = false;
      }
    };

    vm.openFiltersPanel = () => {
      $state.go("common.prime.mtooptions.filter");
    };

    // Reset not applied filter arrays.
    vm.resetUnusedFilterArrays = refresh => {
      (vm.filters.optionTypeIds && !vm.filters.optionTypeIds.length)
        ? (delete vm.filters.optionTypeIds)
        : "";
      (vm.filters.vendorIds && !vm.filters.vendorIds.length)
        ? (delete vm.filters.vendorIds)
        : "";
      (vm.filters.currentStatusIds && !vm.filters.currentStatusIds.length)
        ? (delete vm.filters.currentStatusIds)
        : "";
      vm.getFilterCount();
    };

    // Calculet filter count.
    vm.getFilterCount = () => {
      vm.appliedFilterCount = 0;
      vm.filters.optionTypeIds && vm.filters.optionTypeIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.vendorIds && vm.filters.vendorIds.length
        ? vm.appliedFilterCount++
        : "";
      vm.filters.currentStatusIds && vm.filters.currentStatusIds.length
        ? vm.appliedFilterCount++
        : "";
    };

    //Initialize Create and Update Forms
    vm.InitializeFilterForm = flag => {
      common.$timeout(() => {
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
        vm.getMTOParameters();
        $scope.getStatuses(common.Identifiers.mto_option);
        vm.getMTOTypes();
        vm.getVendors();
        vm.checkFilterHeight();
      }, 0);
    };

    vm.focusSearchField = () => {
      angular.element("#inlineSearch").focus();
      vm.showFilter = true;
    };

    /*
     * This function is used to get the height of the element
     * and move the datalist accordingly.
     */
    vm.checkFilterHeight = () => {
      common.$timeout(() => {
        let headerHeight = angular.element(".rc-module-header").height();
        angular.element(".module-content").css("margin-top", headerHeight);
      }, 500);
    };

    vm.setInitialHeight = () => {
      common.$timeout(() => {
        vm.showFilter ? vm.InitializeFilterForm() : "";
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
        )
          delete vm.filters[property];
      }
      if (
        Object.keys(vm.filters).length != 0 ||
        (vm.old_filters !== undefined && !angular.equals(vm.old_filters, vm.filters))
      ) {
        vm.applyFilterSuccess = true;
        if (
          "optionTypeIds" in vm.filters ||
          "vendorIds" in vm.filters ||
          "currentStatusIds" in vm.filters ||
          !angular.equals(vm.old_filters, vm.filters)
        ) {
          if (
            !angular.equals(vm.old_filters, vm.filters) ||
            !vm.isFilterApplied ||
            (vm.isGroupByApplied && !vm.isGroupByFilterApplied) ||
            vm.opdone
          ) {
            vm.page = 1;
            vm.applyFiltersBtnLabel = "Applying Filters...";
            vm.reloadOptionCountAndList()
              .then(() => {
                vm.advancedSearchPanel = true;
                if (vm.isGroupByApplied) {
                  vm.isGroupHeader = true;
                  vm.isGroupByFilterApplied = true;
                }
                vm.isFilterApplied = true;
                vm.old_filters = _.clone(vm.filters);
                vm.message = "Filter applied successfully!";
                vm.applyFiltersBtnLabel = "Apply Filters";
                common.$timeout(() => {
                  vm.message = null;
                  vm.errorMessage = null;
                  vm.InitializeFilterForm(true);
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
          vm.applyFilterMessage = "* Please select atleast one filter to search relevant mto options";
        }
      } else {
        vm.applyFilterSuccess = false;
        vm.showFilter = false;
        vm.applyFilterMessage = "* Please select atleast one filter to search relevant mto options";
      }
    };

    vm.resetFilters = refresh => {
      vm.isResetFilter = true;
      vm.message = null;
      vm.errorMessage = null;
      vm.filters.optionTypeIds = [];
      vm.filters.vendorIds = [];
      vm.filters.currentStatusIds = [];
      vm.applyFiltersBtnLabel = "Apply Filters";
      /*
        Only on click of the reset button in the filter panel the message
        for the reset will be shown by passing -1.
      */
      if (refresh === -1) {
        if (JSON.stringify(vm.old_filters) !== "{}") {
          vm.resetMessage = "Filter reset successfull!";
        }
        common.$timeout(() => {
          vm.resetMessage = null;
          vm.InitializeFilterForm(true);
        }, 2500);
      }
      if (vm.isFilterApplied && JSON.stringify(vm.old_filters) !== "{}") {
        vm.reloadOptionCountAndList();
      }
      vm.isFilterApplied = false;
      vm.applyFilterSuccess = true;
      common.$timeout(() => {
        vm.isResetFilter = false;
        vm.advancedSearchPanel = false;
        vm.old_filters = {};
      }, 0);
    };

    /************** Save,update or delete MTO implementation *****************/
    vm.publishMTO = (head, isPublishChanges) => {
      if (isPublishChanges) {
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.createForm = false;
        vm.previewAndPublish = true;
        vm.back = true;
      }
      if (vm.isUpdate) {
        vm.update(head);
      } else {
        vm.save(head);
      }
    };

    vm.save = payload => {
      /* variables to reset the Notification message-start */
      $scope.mtoSuccessMessage = null;
      $scope.mtoErrorMessage = null;
      /* variables to reset the Notification message-end */
      let dataToBeSaved = _.clone(payload);
      if (!vm.disableActions) {
        vm.isProcessing = true;
        vm.publishResponseMessage = true;
        dataToBeSaved.effective_date = $scope.getFormattedDate(
          payload.effective_date
        );
        dataToBeSaved.vendor_id = parseInt($scope.head.vendor.id);
        // get option_type by option_type_id from vm.allMTOTypes
        payload.option_type =
          vm.allMTOTypes[
            vm.allMTOTypes.findIndex(
              type => type.id === Number(payload.option_type_id)
            )
          ].short_description;
        MTOService.API.InsertMTO(dataToBeSaved)
          .then(response => {
            vm.isProcessing = false;
            vm.recordsCount++;
            $scope.mtoSuccessMessage = "MTO Option created successfully";
            // set inserted id to payload
            payload.id = response.data.inserted_id;
            // reset vendors that are override in dblClick()
            payload.vendor_id = parseInt(payload.vendor.id);
            let vendorIndex = vm.allVendors.findIndex(
              vendor => vendor.id === Number(payload.vendor_id)
            );
            // push newly created vendor to list of mtooptions
            if (vm.mtoDataList && vm.mtoDataList.length) {
              let mtoData = _.clone(payload);
              mtoData.vendor = vm.allVendors[vendorIndex].name;
              vm.mtoDataList.unshift(mtoData);
            } else {
              vm.mtoDataList = [];
              vm.mtoDataList.push(payload);
            }
            vm.OptionsMap[payload.id] = payload;
            // if group by filter is applied then update vendor from group array
            if (vm.groupByField) {
              // find index of group under which current vendor exist
              let groupFieldIndex = vm.groupMTOMaster.findIndex(
                group => group[vm.groupByField] === payload[vm.groupByField]
              );
              if (groupFieldIndex === -1) {
                vm.groupMTOMaster.push({
                  [vm.groupByField]: payload[vm.groupByField],
                  count: 1,
                  expanded: false,
                  selected: 1,
                  mtooptions: [payload]
                });
              } else if (
                groupFieldIndex > -1 &&
                vm.groupMTOMaster[groupFieldIndex].mtooptions
              ) {
                vm.groupMTOMaster[groupFieldIndex].mtooptions.unshift(payload);
                vm.groupMTOMaster[groupFieldIndex].count++;
              } else {
                vm.groupMTOMaster[groupFieldIndex].count++;
              }
              vm.groupMTOMasterMap[payload.id] === undefined
                ? (vm.groupMTOMasterMap[payload.id] = payload)
                : "";
            }
            vm.totalRecordCount = vm.totalRecordCount + 1;
            vm.opdone = true;
            vm.uploadQueuedDrops(response.data.inserted_id);
          })
          .catch(error => {
            vm.isProcessing = false;
            $scope.mtoErrorMessage = error.data.error.message;
            logger.error(error);
          });
      } else {

      }
    };

    vm.hasUpdateChanges = updatedOption => {
      for (let i = 0; i < Object.values(updatedOption).length; i++) {
        Object.keys(updatedOption)[i].toLowerCase() === "effective_date"
          ? (vm.old_option.effective_date = moment(
            vm.old_option.effective_date
          ).format("MM/DD/YYYY"))
          : null;
        //Do not compare object values if it has following keys
        if (
          Object.keys(updatedOption)[i] &&
          Object.keys(updatedOption)[i].toLowerCase() !== "thumbnail" &&
          Object.keys(updatedOption)[i] !== "$$hashKey" &&
          Object.keys(updatedOption)[i] !== "status" &&
          Object.keys(updatedOption)[i].toLowerCase() !==
          "isshowupdateprocessing" &&
          Object.keys(updatedOption)[i].toLowerCase() !==
          "individual_id_or_company_id"
        ) {
          if (
            Object.values(updatedOption)[i] !=
            Object.values(vm.old_option)[i] &&
            Object.keys(updatedOption)[i] &&
            Object.keys(updatedOption)[i].toLowerCase() !== "vendor"
          ) {
            return true;
          } else if (
            Object.keys(updatedOption)[i] &&
            Object.keys(updatedOption)[i].toLowerCase() === "vendor" &&
            Object.values(updatedOption)[i].id != vm.old_option.vendor_id
          ) {
            return true;
          }
        }
      }
      return false;
    };

    vm.update = payload => {
      // variable to controle the loader functionality
      vm.isProcessing = true;
      // Variable to show the Published review section.
      vm.publishResponseMessage = true;
      /* variables to reset the Notification message-start */
      $scope.mtoSuccessMessage = null;
      $scope.mtoErrorMessage = null;
      /* variables to reset the Notification message-end */
      let dataToBeUpdated = _.clone(payload);
      if (!vm.updateFormValidation()) {
        payload.vendor_id = parseInt(vm.mtooption.vendor.id);
        if (vm.hasUpdateChanges(payload)) {
          if (!vm.disableActions) {
            dataToBeUpdated.effective_date = $scope.getFormattedDate(
              payload.effective_date
            );
            dataToBeUpdated.vendor_id = parseInt(vm.mtooption.vendor.id);
            MTOService.API.UpdateMTO(dataToBeUpdated)
              .then(response => {
                vm.isProcessing = false;
                response.data.data.thumbnail = payload.thumbnail;
                vm.getMTOMetaData()
                  .then(response => {
                    vm.loadThumbNailImages("165x165");
                  })
                  .catch(error => {
                    logger.error(error);
                  });
                if (vm.groupByField) {
                  if (
                    vm.groupByField &&
                    vm.groupByField.toLowerCase() === "vendor"
                  ) {
                    //find index of group under which current mtooption exist
                    let groupFieldIndex = vm.groupMTOMaster.findIndex(
                      group =>
                        group[vm.groupByField] ===
                        vm.OptionsMap[payload.id].vendor
                    );
                    //find index of mtooption from mtooption list under the selected group
                    let groupIndex = vm.groupMTOMaster[
                      groupFieldIndex
                    ].mtooptions.findIndex(
                      option => parseInt(option.id) === parseInt(payload.id)
                    );
                    if (groupFieldIndex === -1) {
                      vm.groupMTOMaster.push({
                        [vm.groupByField]: payload[vm.groupByField],
                        count: 1,
                        expanded: false,
                        selected: 1,
                        mtooptions: [payload]
                      });
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupMTOMaster[groupFieldIndex].mtooptions[groupIndex][
                      vm.groupByField
                      ] !== response.data.data[vm.groupByField]
                    ) {
                      vm.groupMTOMaster[groupFieldIndex].mtooptions.splice(
                        groupIndex,
                        1
                      );
                      vm.groupMTOMaster[groupFieldIndex].count--;
                      let newGroupFieldIndex = vm.groupMTOMaster.findIndex(
                        group =>
                          group[vm.groupByField] ===
                          response.data.data[vm.groupByField]
                      );
                      if (newGroupFieldIndex === -1) {
                        vm.groupMTOMaster.push({
                          [vm.groupByField]:
                            response.data.data[vm.groupByField],
                          count: 1,
                          expanded: false,
                          selected: 1,
                          mtooptions: [response.data.data]
                        });
                      } else if (
                        newGroupFieldIndex > -1 &&
                        vm.groupMTOMaster[newGroupFieldIndex].mtooptions
                      ) {
                        vm.groupMTOMaster[
                          newGroupFieldIndex
                        ].mtooptions.unshift(response.data.data);
                        vm.groupMTOMaster[newGroupFieldIndex].count++;
                        vm.groupMTOMasterMap[payload.id] = response.data.data;
                      } else {
                        vm.groupMTOMaster[newGroupFieldIndex].count++;
                      }
                      //Update mtooption to Map
                      vm.groupMTOMasterMap[payload.id] = response.data.data;
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupMTOMaster[groupFieldIndex].mtooptions
                    ) {
                      //Update mtooption to list
                      vm.groupMTOMaster[groupFieldIndex].mtooptions[
                        groupIndex
                      ] = response.data.data;
                      vm.groupMTOMasterMap[payload.id] = response.data.data;
                    } else {
                      //vm.groupMTOMaster[groupFieldIndex].count++;
                    }
                  } else {
                    //find index of group under which current mtooption exist
                    let groupFieldIndex = vm.groupMTOMaster.findIndex(
                      group =>
                        group[vm.groupByField] ===
                        vm.groupMTOMasterMap[payload.id][vm.groupByField]
                    );
                    //find index of mtooption from mtooption list under the selected group
                    let groupIndex = vm.groupMTOMaster[
                      groupFieldIndex
                    ].mtooptions.findIndex(
                      option => parseInt(option.id) === parseInt(payload.id)
                    );
                    if (groupFieldIndex === -1) {
                      vm.groupMTOMaster.push({
                        [vm.groupByField]: payload[vm.groupByField],
                        count: 1,
                        expanded: false,
                        selected: 1,
                        mtooptions: [payload]
                      });
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupMTOMaster[groupFieldIndex].mtooptions[groupIndex][
                      vm.groupByField
                      ] !== response.data.data[vm.groupByField]
                    ) {
                      vm.groupMTOMaster[groupFieldIndex].mtooptions.splice(
                        groupIndex,
                        1
                      );
                      vm.groupMTOMaster[groupFieldIndex].count--;
                      let newGroupFieldIndex = vm.groupMTOMaster.findIndex(
                        group =>
                          group[vm.groupByField] ===
                          response.data.data[vm.groupByField]
                      );
                      if (newGroupFieldIndex === -1) {
                        vm.groupMTOMaster.push({
                          [vm.groupByField]:
                            response.data.data[vm.groupByField],
                          count: 1,
                          expanded: false,
                          selected: 1,
                          mtooptions: [response.data.data]
                        });
                      } else if (
                        newGroupFieldIndex > -1 &&
                        vm.groupMTOMaster[newGroupFieldIndex].mtooptions
                      ) {
                        vm.groupMTOMaster[
                          newGroupFieldIndex
                        ].mtooptions.unshift(response.data.data);
                        vm.groupMTOMaster[newGroupFieldIndex].count++;
                        vm.groupMTOMasterMap[payload.id] = response.data.data;
                      } else {
                        vm.groupMTOMaster[newGroupFieldIndex].count++;
                      }
                      //Update mtooption to Map
                      vm.groupMTOMasterMap[payload.id] = response.data.data;
                    } else if (
                      groupFieldIndex > -1 &&
                      vm.groupMTOMaster[groupFieldIndex].mtooptions
                    ) {
                      //Update mtooption to list
                      vm.groupMTOMaster[groupFieldIndex].mtooptions[
                        groupIndex
                      ] = response.data.data;
                      vm.groupMTOMasterMap[payload.id] = response.data.data;
                    } else {
                      //vm.groupMTOMaster[groupFieldIndex].count++;
                    }
                  }
                }
                // find index of current vendor in mtooptions list
                let index = this.mtoDataList.findIndex(
                  mto => mto.id === payload.id
                );
                vm.mtoDataList[index] = response.data.data;
                vm.OptionsMap[payload.id] = response.data.data;
                vm.old_option = response.data.data;
                $scope.mtoSuccessMessage = "MTO Option updated successfully";
                vm.opdone = true;
              })
              .catch(error => {
                vm.isProcessing = false;
                $scope.mtoErrorMessage = error.data.error.message;
                logger.error(error);
              });
          } else {
            vm.isProcessing = false;

          }
        } else {
          vm.isProcessing = false;
          vm.opdone = true;
          // vm.publishResponseMessage = true;
          $scope.mtoSuccessMessage = "Nothing to update in MTO Option";
        }
      } else {
        vm.isProcessing = false;
      }
    };

    vm.delete = payload => {
      vm.isLoadingDelete = true;
      /* variables to reset the Notification message-start */
      $scope.mtoSuccessMessage = null;
      $scope.mtoErrorMessage = null;
      /* variables to reset the Notification message-end */
      if (!vm.disableActions) {
        MTOService.API.DeleteMTO(payload)
          .then(response => {
            vm.isLoadingDelete = false;
            // Notification.responsenotification(response.data);
            vm.totalRecordCount = vm.totalRecordCount - 1;
            vm.recordsCount = vm.recordsCount - 1;
            vm.opdone = true;
            // find index of current vendor in mtooptions list
            let index = this.mtoDataList.findIndex(
              vendor => vendor.id === payload.id
            );
            // if group by filter is applied then delete vendor from group array
            if (vm.groupByField) {
              if (vm.groupByField.toLowerCase() === "vendor") {
                //find index of group under which current mtooption exist
                let groupFieldIndex = vm.groupMTOMaster.findIndex(
                  group =>
                    group[vm.groupByField] === vm.OptionsMap[payload.id].vendor
                );
                // find index of vendor from mtooptions list under the selected group
                let groupIndex = vm.groupMTOMaster[
                  groupFieldIndex
                ].mtooptions.findIndex(
                  option => parseInt(option.id) === parseInt(payload.id)
                );
                // Delete vendor from list
                vm.groupMTOMaster[groupFieldIndex].mtooptions.splice(
                  groupIndex,
                  1
                );
                vm.groupMTOMaster[groupFieldIndex].count -= 1; //decrease vendor count of the group
                delete vm.groupMTOMasterMap[payload.id];
                vm.limit =
                  vm.groupMTOMaster[groupFieldIndex].mtooptions.length +
                  vm.limit;
                vm.groupMTOMaster[groupFieldIndex].groupPage -= 1;
              } else {
                //find index of group under which current vendor exist
                let groupFieldIndex = vm.groupMTOMaster.findIndex(
                  group => group[vm.groupByField] === payload[vm.groupByField]
                );
                // find index of vendor from mtooptions list under the selected group
                let groupIndex = vm.groupMTOMaster[
                  groupFieldIndex
                ].mtooptions.findIndex(
                  option => parseInt(option.id) === parseInt(payload.id)
                );
                // Delete vendor from list
                vm.groupMTOMaster[groupFieldIndex].mtooptions.splice(
                  groupIndex,
                  1
                );
                vm.groupMTOMaster[groupFieldIndex].count -= 1; //decrease vendor count of the group
                delete vm.groupMTOMasterMap[payload.id];
                vm.limit =
                  vm.groupMTOMaster[groupFieldIndex].mtooptions.length +
                  vm.limit;
                vm.groupMTOMaster[groupFieldIndex].groupPage -= 1;
              }
            }
            // remove vendor from list
            this.mtoDataList.splice(index, 1);
            vm.OptionsMap.splice(payload.id, 1);
            vm.closeForm();
          })
          .catch(error => {
            if (error.status === 412) {
              $("#rcrightsidebar").focus();
              vm.dependencyList = error.data.dependency;
              vm.showDependencyDetailsData = true;
            } else {
              vm.deleteMtoMessage = "Error while deleting MTO";
              common.$timeout(() => {
                vm.deleteMtoMessage = null;
                vm.confirmDelete = false;
              }, 2500);
            }
            logger.error(error);
          });
      } else {

      }
    };

    //Goto clone mto option panel
    vm.goToClonePanel = mto => {
      mto.isLoadingClone = true;
      mto.description.includes("Clone") || mto.description.includes("clone")
        ? ""
        : $state
          .go("common.prime.mtooptions.clone", {
            id: mto.id
          })
          .then(() => {
            if (mto.isLoadingClone) {
              common.$timeout(() => {
                mto.isLoadingClone = false;
              }, 0);
            }
          });
    };

    vm.updateFormValidation = () => {
      vm.validationError = [];
      vm.isInvalidForm = false;
      //if current screen is create/update master data form and form data
      //is valid and all mandatory fields are filled then go to next stage
      if (vm.mto_maint_form && vm.mto_maint_form.$invalid) {
        //Variable to set the validation to true if validation is not met
        vm.isInvalidForm = true;
        //if form data is invalid or mandetory fileds are empty then show message in create/update form UI
        vm.validationError.push(
          "Please check for any validation errors and all the mandatory fields In Vendor Master Screen."
        );
      }
      return vm.isInvalidForm;
    };

    vm.continueFn = function (screen) {
      vm.validationMessage = null;
      vm.isInvalidForm = false;
      if (screen && screen.toLowerCase() === "createform") {
        if (!vm.mto_maint_form.$invalid) {
          vm.createForm = false;
          vm.manageDropScreen = true;
          vm.previewAndPublish = false;
          vm.back = true;
        } else {
          vm.isInvalidForm = true;
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
            vm.validationMessage = `Please click on ${btnLabel} button to link drop to MTO Option. Click on 'Skip' button to proceed without uploading.`;
          } else {
            vm.validationMessage = `Please fill in the required fields and click on ${btnLabel} button to link drop to MTO Option or Click on 'Skip' button to proceed without uploading.`;
            vm.isInvalidForm = true;
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
    vm.backFn = function (screen) {
      vm.validationMessage = null;
      if (screen && screen.toLowerCase() === "dropscreen") {
        vm.createForm = true;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
      } else if (screen && screen.toLowerCase() === "previewandpublish") {
        vm.createForm = false;
        vm.manageDropScreen = true;
        vm.previewAndPublish = false;
        vm.showSummaryPanel = true;
      }
      vm.mtoOptAddToQueueError = false;
    };
    vm.refineFn = function () {
      vm.createForm = true;
      vm.manageDropScreen = false;
      vm.previewAndPublish = false;
    };
    vm.confirmDelete = false;
    vm.confirmDel = function () {
      vm.confirmDelete = !vm.confirmDelete;
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
      vm.choicedataUploaderror = false;
      vm.opdone = false;
      if (screen && screen.toLowerCase() === "createform") {
        vm.createForm = true;
        vm.configureStage = false;
        vm.configureScreen = false;
        vm.manageDropScreen = false;
        vm.previewAndPublish = false;
      } else if (screen && screen.toLowerCase() === "dropscreen") {
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

    // to get access from profile to operate crud operations
    $scope.getAccessPermissions(vm.uuid)
      .then(result => {
        vm.permissionsMap = JSON.parse(JSON.stringify(result));
        vm.initializeMTO();
      })
      .catch(() => {
        vm.permissionsMap = {};
        vm.initializeMTO();
      });
    vm.watchers();
  }
})();
