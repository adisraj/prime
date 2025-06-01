class NotificationsController {
  constructor(
    $scope,
    common,
    JobsService,
    SKUService,
    VendorPortalService,
    DataLakeAPIService,
    $sce
  ) {
    this.$scope = $scope;
    this.$sce = $sce;
    this.common = common;
    this.JobsService = JobsService;
    this.SKUService = SKUService;
    this.VendorPortalService = VendorPortalService;
    this.DataLakeAPIService = DataLakeAPIService;
    this.logger = this.common.Logger.getInstance("NotificationsController");
    this.limit = 100;
    this.showJobs = true;
    this.showMercuryChanges = false;
    this.totalRecordsCount = 0;
    this.mercuryRecordsCount = 0;
    this.isLoading = true;
    this.filters = {
      sortByObject: {
        field: "request_date",
        order: "desc"
      },
      page: 1,
      limit: this.limit
    }
    this.task_ar = [];
    this.tasksar = [];
    this.uniqueChars = [];
    this.isFirstPage = true;
    this.isLastPage = false;
    this.mercuryFilters = {
      page: 1,
      limit: this.limit
    }
    this.mercuryFilters.vendor_id = [];
    this.$scope._search = ""
    this.$scope._searchmercury = ""

    //This will show the searchbar by default.
    this.isNotificationSearchJob = false;
    this.isNotificationSearchMercury = false;
  }

  initializeNotifications() {
    this.selectedNotification = undefined;
    this.showJobs = true;
    this.showMercuryChanges = false;
    this.isLoading = true;
    this._search = '';
    this._searchmercury = '';
    this.filter_task();
    this.fetchTaskRequests(this.filters);
    this.fetchMercuryRequests(this.mercuryFilters);
    this.fetchUsers();
    // this.getTaskTypes();
  }

  filter_task() {
    this.task_ar = [];
    this.tasksar = [];
    this.JobsService.API.GetTaskRequestsBynoFilters()
      .then(response => {
        this.tasksar = response.data;
        for (let i = 0; i < this.tasksar.length; i++) {
          this.task_ar.push(this.tasksar[i].task_name)
        }
        this.uniqueChars = [...new Set(this.task_ar)];
      }).catch(error => {
        this.isLoadingMore = false;
        this.isLoading = false;
        this.logger.error(error);
      });
  }

  // Function to get task requests by filter
  fetchTaskRequests(filters) {
    if (filters.limit == 100 || !filters.limit.includes('-')) {
      this.isLoading = true;
      this.isloadingsku = true;
      this.message = null;
      this.JobsService.API.GetTaskRequestsByFilters(filters)
        .then(response => {
          if (filters.page === 1) {
            this.totalRecordsCount = response.recordsCount;
            this.taskRequests = response.data
          } else {
            this.taskRequests = [...this.taskRequests, ...response.data];
            // this.taskRequests = response.data;
          }
          var task = this.taskRequests.filter(task => task.request_title);
          _.each(task, item => {
            if (item.request_title.includes('-')) {
              var sku_id = item.request_title.split('-')[1]
              if (sku_id != "all") {
                this.SKUService.API.GetSKU(sku_id)
                  .then(response => {
                    if (response.data && response.data[0] && response.data[0].sku) {
                      item.sku_number = response.data[0].sku;
                      this.isloadingsku = false;
                    }
                  })
                  .catch(error => {
                    this.logger.error(error);
                  });
              }
            }
          })
          this.isLoadingMore = false;
          this.common.$timeout(() => {
            if (this.enable_filter == true) {
            this.message = "Filters applied successfully!";
            }
            this.isLoading = false;
          }, 5000)
          this.common.$timeout(() => {
              this.message = null;
          }, 6000)
        }).catch(error => {
          this.isLoadingMore = false;
          this.isLoading = false;
          this.logger.error(error);
        });
    }
  }

  first() {
    this.filters.limit = 0 + "," + 100
    this.limit = 100
    this.isFirstPage = true;
    this.isLastPage = false;
    this.fetchTaskRequests(this.filters)
  }

  last() {
    var last_count = this.totalRecordsCount - 100;
    this.filters.limit = last_count + "," + this.totalRecordsCount
    this.isLastPage = true;
    this.isFirstPage = false;
    this.fetchTaskRequests(this.filters)
  }

  prev() {
    this.filters.limit = (parseInt(this.limit) - 200) + "," + (parseInt(this.limit) - 100);
    this.limit = (parseInt(this.limit) - 100)
    this.fetchTaskRequests(this.filters)
  }

  next() {
    this.filters.limit = this.limit + "," + (parseInt(this.limit) + 100)
    this.isFirstPage = false;
    this.limit = (parseInt(this.limit) + 100)
    this.fetchTaskRequests(this.filters)
  }

  // Function to get user to filter notifications by requester
  fetchUsers() {
    this.common.EntityDetails.API.GetGraphSet(
      this.common.Identifiers.users,
      ["id", "name"]
    )
      .then(res => {
        this.requesters = res.data;
        this.usersMap = {};
        for (let i = 0; i < res.data.length; i++) {
          if (this.usersMap[res.data[i].id] === undefined) {
            this.usersMap[res.data[i].id] = res.data[i];
          }
        }
      })
      .catch(err => this.logger.error(err));
  }

  getTaskTypes() {
    this.JobsService.API.GetTaskTypes()
      .then(response => {
        this.taskTypes = response.data;
      }).catch(error => {
        this.logger.error(error);
      });
  }

  // apply jobs filters
  applyJobsFilters() {
    this.filters.page = 1;
    this.isLastPage = false;
    this.fetchTaskRequests(this.filters);
  }

  // reset jobs filters
  resetJobsFilters() {
    this.enable_filter = false;
    this.taskRequests = undefined;
    this.filters.requester_ids = [];
    this.filters.task_type_ids = [];
    this.filters.request_date = undefined;
    this.filters.page = 1;
    this.filters.limit = 100;
    this.limit = 100;
    this.isNotificationSearchJob = false;
    this.isNotificationSearchMercury = false;
    this.fetchTaskRequests(this.filters);
    this.isLastPage = false;
    this.isFirstPage = false;
  }

  // apply jobs filters
  applymercuryFilters() {
    this.mercuryFilters.created_dt = [];
    this.mercuryFilters.page = 1;
    this.mercuryFilters.created_dt.push(this.created_dt)
    this.fetchMercuryRequests(this.mercuryFilters);
  }

  refreshfilters() {
    this.showMercuryChanges = true;
    this.showJobs = false;
  }

  // reset mercury filters
  resetmercuryFilters() {
    this.initializeNotifications();
    this.enablemercury_filter = false;
    this.isNotificationSearchJob = false;
    this.isNotificationSearchMercury = false;
    this.mercuryRequests = undefined;
    this.mercuryFilters.vendor_id = [];
    this.mercuryFilters.task_type_ids = [];
    this.mercuryFilters.created_dt = [];
    this.created_dt = '';
    this.mercuryFilters.page = 1;
    this.mercuryFilters.limit = 100;
    this.limit = 100;
    this.refreshfilters();
    this.fetchMercuryRequests(this.mercuryFilters);
  }

  loadMoreTaskRequests() {
    this.isLoadingMore = true;
    this.enable_filter = false;
    this.filters.page += 1;
    this.fetchTaskRequests(this.filters);
  }

  notificationJobSearch() {
    this.isNotificationSearchJob = this.isNotificationSearchJob ? false : true;
  }

  notificationMercurySearch() {
    this.isNotificationSearchMercury = this.isNotificationSearchMercury ? false : true;
  }

  loadMoreMercuryRequests() {
    this.isLoadingMore = true;
    this.enablemercury_filter = false;
    this.mercuryFilters.page += 1;
    this.fetchMercuryRequests(this.mercuryFilters);
  }

  fetchMercuryRequests(filters) {
    var vendor_dtls = filters.vendor_id;
    if (filters.created_dt && filters.created_dt.length && filters.created_dt[0] == undefined) {
      filters.created_dt = [];
    }
    if (filters.vendor_id && filters.vendor_id.length > 0) {
      var venodrs = filters.vendor_id.map(function (item) {
        return item;
      });
      filters.vendor_id = venodrs.join(",");
    }
    this.isLoading = true;
    this.VendorPortalService.API.GetVendorPortalChangeRequests(filters)
      .then(response => {
        if (this.enablemercury_filter == true) {
          this.mercurymessage = "Filters applied successfully!"
        }
        
        if (filters.page === 1) {
          this.mercuryRecordsCount = response.RecordsCount;
          this.mercuryRequests = response.Data;
        } else {
          this.mercuryRequests = [...this.mercuryRequests, ...response.Data];
        }

        for (let i = 0; i < response.Data.length; i++) {
          this.mapValues(response.Data[i]);
        }
        this.isLoadingMore = false;
        this.isLoading = false;
        this.mercuryFilters.vendor_id = vendor_dtls;
        this.common.$timeout(() => {
          this.mercurymessage = null;
          this.isLoading = false;
        }, 1500)
      }).catch(error => {
        this.isLoadingMore = false;
        this.logger.error(error);
      });
  }

  // firstmercury() {
  //   var filters = {
  //     sortByObject: {
  //       field: "request_date",
  //       order: "desc"
  //     },
  //     limit: 0 + "," + 100
  //   }
  //   this.limit = 100
  //   this.isFirstPage = true;
  //   this.isLastPage = false;
  //   this.fetchMercuryRequests(filters)
  // }

  // lastmercury() {
  //   var last_count = this.mercuryRecordsCount - 100
  //   var filters = {
  //     sortByObject: {
  //       field: "request_date",
  //       order: "desc"
  //     },
  //     limit: last_count + "," + this.mercuryRecordsCount
  //   }
  //   this.isLastPage = true;
  //   this.isFirstPage = false;
  //   this.fetchMercuryRequests(filters)
  // }

  // prevmercury() {
  //   var filters = {
  //     sortByObject: {
  //       field: "request_date",
  //       order: "desc"
  //     },
  //     limit: (parseInt(this.limit) - 200) + "," + (parseInt(this.limit) - 100)
  //   }
  //   this.limit = (parseInt(this.limit) - 100)
  //   this.fetchMercuryRequests(filters)
  // }

  // nextmercury() {
  //   var filters = {
  //     sortByObject: {
  //       field: "request_date",
  //       order: "desc"
  //     },
  //     limit: this.limit + "," + (parseInt(this.limit) + 100)
  //   }
  //   this.isFirstPage = false;
  //   this.limit = (parseInt(this.limit) + 100)
  //   this.fetchMercuryRequests(filters)
  // }

  // map values to the chaned fields
  mapValues(data) {
    if (data.user_defined_data_id && data.user_defined_data_type.toLowerCase() === "attribute") {
      let fields = ["id", "short_description", "format", "dimension_unit"];
      this.getGraphData(data, fields, "id", data.user_defined_data_id, this.common.Identifiers.attribute);
    } else if (data.romanic_copy.length > 0 || (data.romanic_copy === "" && !data.description && !data.vendor_item_number && !data.vendor && !data.upc_number && !data.first_cost && !data.drop_ids.length)) {
      data.maintenance_description = "Romanic Copy";
      data.valueDescription = this.$sce.trustAsHtml(data.romanic_copy);
    } else if (data.description.length > 0) {
      data.maintenance_description = "SKU Description";
      data.valueDescription = data.description;
    } else if (data.vendor_item_number.length > 0) {
      data.maintenance_description = "Vendor Item Number";
      data.valueDescription = data.vendor_item_number;
    } else if (data.first_cost.length > 0) {
      data.maintenance_description = "First Cost";
      data.valueDescription = data.first_cost;
    } else if (data.upc_number.length > 0) {
      data.maintenance_description = "UPC Number";
      data.valueDescription = data.upc_number;
    } else if (data.vendor.length > 0) {
      data.maintenance_description = "Vendor Item Description";
      data.valueDescription = data.vendor;
    } else if (data.drop_ids.length > 0) {
      data.maintenance_description = "Image[s]"
    }
  }

  // function to get graph data for given parameters by uuid
  getGraphData(data, dataFields, conditionField, conditionValue, uuid) {
    this.common.EntityDetails.API.GetGraphSet(uuid, dataFields, conditionField, conditionValue)
      .then(response => {
        let result = response.length > 0 ? response[0] : null;
        if (data.user_defined_data_id && data.user_defined_data_type.toLowerCase() === "attribute") {
          data.maintenance_description = result.short_description;
          data.format = result.format;
          data.dimension_unit = result.dimension_unit;
          let fields = ["id", "short_description"];
          if (result.format.toLowerCase() === "value list" || result.format.toLowerCase() === "rating") {
            this.getValuesGraphData(data, fields, "id", data.udd_value_id, this.common.Identifiers.attribute_value);
          } else if (result.format.toLowerCase() === "multiselect") {
            let ids = data && data.value ? data.value.split(",") : [];
            for (let i = 0; i < ids.length; i++) {
              this.getValuesGraphData(data, fields, "id", ids[i], this.common.Identifiers.attribute_value);
            }
          } else if (result.format.toLowerCase() === "yes/no") {
            data.valueDescription = data.value === "1" || data.value === 1 ? "Yes" : "No";
          } else {
            data.valueDescription = data.value;
          }
        }
      })
  }

  getValuesGraphData(data, dataFields, conditionField, conditionValue, uuid) {
    this.common.EntityDetails.API.GetGraphSet(uuid, dataFields, conditionField, conditionValue)
      .then(response => {
        if (!data.valueDescription && data.format && data.format.toLowerCase() !== "multiselect") {
          data.valueDescription = response[0] && response[0].short_description ? response[0].short_description : "";
        } else {
          if (data.valuesArray === undefined) {
            data.valuesArray = [];
          }
          if (response[0] && response[0].short_description) {
            data.valuesArray.push(response[0].short_description)
            data.valueDescription = data.valuesArray.join(", ");
          }
        }
      })
  }

  showSkus(data) {
    this.showSkusDetail = true;
    this.selectedNotification = data;
    if (data.sku_ids.length > 0 && !data.skusList) {
      this.fetchSkusByMultipleIds(data.sku_ids);
    }

    if (data.drop_ids_array && data.drop_ids_array.length > 0 && !data.dropsList) {
      this.fetchDropsByMultipleIds(data.drop_ids_array);
    }
  }

  fetchSkusByMultipleIds(ids) {
    this.SKUService.API.GetSkusByIds(ids)
      .then(response => {
        this.selectedNotification.skusList = response.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  fetchDropsByMultipleIds(dropIds) {
    this.DataLakeAPIService.API.GetDropsByIds(dropIds)
      .then(response => {
        this.selectedNotification.dropsList = response.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }
}

angular
  .module("calculus")
  .controller("NotificationsController", NotificationsController);
