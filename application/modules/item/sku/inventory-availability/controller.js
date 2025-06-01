(function () {
  "use strict";
  angular
    .module("rc.prime.sku")
    .controller("InventoryAvailabilty", InventoryAvailabilty);
  InventoryAvailabilty.$inject = [
    "$scope",
    "$rootScope",
    "$stateParams",
    "common",
    "ItemService",
    "SKUService",
    "SessionMemory",
    "NotificationService",
    "VendorService"
  ];

  function InventoryAvailabilty(
    $scope,
    $rootScope,
    $stateParams,
    common,
    ItemService,
    SKUService,
    SessionMemory,
    NotificationService,
    VendorService
  ) {
    let vm = this;

    /** Common Modules */
    let $state = common.$state;
    let $timeout = common.$timeout;
    let LocalMemory = common.LocalMemory;
    let logger = common.Logger.getInstance("InventoryAvailabilty");
    this.skuavailabilityList = [];
    this.skuVendorPOList = [];
    // this.loadinglocations = false;
    var locations = [1, 2, 3, 4, 6, 7, 8, 9, 10, 870, 880, 905, 906, 999]

    //To load the locations to check the availability of the SKU
    vm.loadLocationsBySku = () => {
      this.isLoaded = false;
      this.notstocked = false;
      this.po_default = false;
      this.mainsku = false;
      SKUService.API.GetSKU($stateParams.id).then(response => {
        vm.sku_details = response.data[0];
        vm.fetchSkuAvailabilityStatus();
        vm.getVendorById(vm.sku_details);
        let skuNumber = vm.sku_details.sku.replace("-", "");
        skuNumber = skuNumber.substring(1, 7);
        SKUService.API.GetInventoriesForSKU(vm.sku_details.id)
          .then(response => {
            if (response.length) {
              this.sku_inventory_method = response[0].inventory_method_id;
              if (response[0].inventory_method_id == 5) {
                this.notstocked = true;
                this.isLoaded = true;
              }
              else {
                this.notstocked = false;
                if ((response[0].inventory_method_id == 6 || response[0].inventory_method_id == 8) && vm.sku_details.sku_sub_type.toLowerCase() === "set") {
                  this.forwrd_value = 0;
                  this.main_reserved = 0;
                  this.isloaded = true;
                  SKUService.API
                    .FetchSkuSetAndItsAvailability(vm.sku_details.id)
                    .then(response => {
                      vm.setSkuAvailability = response;
                      vm.setskufilteredar = vm.setSkuAvailability.filter((arr, index, self) =>
                        index === self.findIndex((t) => (t.sku == arr.sku && t.child_sku_id == arr.child_sku_id)));
                      vm.setskufilteredar = vm.setskufilteredar.filter(x => x.child_sku_id !== vm.sku_details.id && x.sku_sub_type != "set")
                      SKUService.API
                        .GetSKULocations(locations)
                        .then(res => {
                          vm.setavailbility_uddar = res.data;
                          vm.setavailbility_uddar = vm.setavailbility_uddar.filter(id => id.user_defined_data_id == 2042);
                          _.each(vm.setskufilteredar, filter => {
                            filter.sku_id = filter.child_sku_id;
                            SKUService.API.GetInventoriesForSKU(filter.sku_id).then(res => {
                              if (res && res.length) filter.inventorymethod = res[0];
                              if (filter.status_id == 200) filter.status = 'Active';
                              if (filter.status_id == 400) filter.status = 'Pending Inactive';
                              if (filter.status_id == 300) filter.status = 'Inactive';
                              if (filter.status_id == 100) filter.status = 'Pending Active';
                              SKUService.API.GetvendorDetails(filter.sku_id).then(response => {
                                if (response.data[0]) {
                                  filter.vendor = response.data[0].name;
                                }
                              })
                              let skuno = filter.sku.replace("-", "");
                              skuno = skuno.substring(1, 7);
                              // vm.loadAvailability(skuno)
                              filter.dc_quantity = 0;
                              filter.stores_quantity = 0;
                              filter.po_setqty = 0;
                              filter.sku_locations = [];
                              if (filter.inventorymethod == undefined || filter.inventorymethod.inventory_method_id == 1) {
                                filter.no_inventory = false;
                                SKUService.API
                                  .GetSkuAvailabilityForLocationodbc(skuno)
                                  .then(response => {
                                    filter.skuavailabilityList = response;
                                    for (let i = 0; i < filter.skuavailabilityList.length; i++) {
                                      filter.sku_locations.push(filter.skuavailabilityList[i].BILCD)
                                      if (!(filter.skuavailabilityList[i].BIQOH || filter.skuavailabilityList[i].BIQIT || filter.skuavailabilityList[i].BIQOO || filter.skuavailabilityList[i].BIQAL ||
                                        filter.skuavailabilityList[i].BIROH || filter.skuavailabilityList[i].BIRIT || filter.skuavailabilityList[i].BIROO)) {
                                        filter.sku_locations.splice(i, 1);
                                        filter.skuavailabilityList.splice(i, 1);
                                        i--;
                                      }
                                    }
                                    SKUService.API
                                      .GetVendorPOForLocationodbc(skuno)
                                      .then(res => {
                                        filter.skuvendorlocation = res;
                                        if (filter.skuavailabilityList && filter.skuavailabilityList.length) {
                                          _.each(vm.setavailbility_uddar, udd => {
                                            _.each(filter.skuavailabilityList, avail => {
                                              vm.addlocations(avail);
                                              if (avail.location_id == udd.location_id) {
                                                if (udd.udd_value_id == 3013) {
                                                  filter.dc_quantity += (avail.BIQOH + avail.BIQIT + (avail.BIQOO - avail.BIQAL) -
                                                    (avail.BIROH + avail.BIRIT +
                                                      avail.BIROO))
                                                }
                                                else if (udd.udd_value_id == 3014) {
                                                  filter.stores_quantity += (avail.BIQOH + avail.BIQIT + (avail.BIQOO - avail.BIQAL) -
                                                    (avail.BIROH + avail.BIRIT +
                                                      avail.BIROO))
                                                }
                                                else {

                                                }
                                              }
                                            })
                                          })
                                          _.each(filter.skuvendorlocation, loc => {
                                            vm.addlocations(loc);
                                          })
                                          var empty_ar = [];
                                          if (filter.skuvendorlocation && filter.skuvendorlocation.length) {
                                            for (let i = 0; i < filter.skuvendorlocation.length; i++) {
                                              if (!filter.sku_locations.includes(filter.skuvendorlocation[i].PDRLCD)) {
                                                filter.skuvendorlocation.splice(i, 1);
                                                i--;
                                              }
                                              _.each(vm.setavailbility_uddar, skuset => {
                                                empty_ar.push(skuset.location_id);
                                                if (skuset.udd_value_id == 3015) {
                                                  if (filter.skuvendorlocation[i] && filter.skuvendorlocation[i].location_id == skuset.location_id) {
                                                    filter.skuvendorlocation = filter.skuvendorlocation.filter((arr, index, self) =>
                                                      index === self.findIndex((t) => (t.location_id == arr.location_id)))
                                                    filter.skuvendorlocation.splice(i, 1);
                                                    if (i > 0) i--;
                                                  }
                                                }
                                              })
                                            }
                                          }

                                          const locations = [1139, 1140, 1141, 1142, 1143, 1144, 1145, 1146, 1147, 1148, 1149, 1150, 1151, 1152];
                                          var location_ar = []
                                          location_ar = locations.filter(f => !empty_ar.includes(f));
                                          _.each(location_ar, loc => {
                                            for (let i = 0; i < filter.skuvendorlocation.length; i++) {
                                              if (filter.skuvendorlocation[i] && filter.skuvendorlocation[i].location_id == loc) {
                                                filter.skuvendorlocation = filter.skuvendorlocation.filter((arr, index, self) =>
                                                  index === self.findIndex((t) => (t.location_id == arr.location_id)))
                                                filter.skuvendorlocation.splice(i, 1);
                                                if (i > 0) i--;
                                              }
                                            }
                                          })

                                          _.each(filter.skuvendorlocation, po => {
                                            po.PDPO = po["PDPO#"];
                                            _.each(filter.skuavailabilityList, skuavail => {
                                              if (skuavail.BIEDP == po.PDEDP && skuavail.BILCD == po.PDRLCD) {
                                                if (!this.forwrd_value) {
                                                  if (!this.po_default) this.main_reserved = skuavail.BIRVO;
                                                }
                                                else {
                                                  this.main_reserved = this.forwrd_value;
                                                }
                                                if (this.main_reserved > 0)
                                                  if (this.main_reserved > po.PDQVO) {
                                                    po.PDRS = po.PDQVO;
                                                    this.forwrd_value = this.main_reserved - po.PDQVO;
                                                  }
                                                  else {
                                                    po.PDRS = this.main_reserved;
                                                    this.main_reserved = 0;
                                                    this.po_default = true;
                                                  }
                                                else {
                                                  po.PDRS = 0;
                                                }
                                                filter.po_setqty += po.PDQVO - po.PDRS;
                                              }
                                            })
                                          })
                                          vm.isloaded = false;
                                        }
                                      })
                                  })
                              }
                              else {
                                filter.dc_quantity = filter.inventorymethod.inventory_method;
                                filter.no_inventory = true;
                                filter.colspan = 4;
                              }
                            })

                            common.$timeout(() => {
                              vm.isloaded = false;
                            }, 5000)
                          })
                        })
                    })
                } else {
                  vm.loadAvailability(skuNumber);
                  this.isLoaded = true;
                  this.mainsku = true;
                }
              }
            }
          })
      });
    };
    vm.loadLocationsBySku();

    vm.showsetsubsku = (id) => {
      $scope.showSetsubSKU = true;
      this.loadinglocations = true;
      this.skunotstocked = false;
      this.po_default = false;
      SKUService.API.GetSKUById(id.sku_id)
        .then(response => {
          vm.sub_sku_details = response.data[0];
          vm.sub_sku_details.vendorName = id.vendor;
        })
      id.selectedsubsku = true;
      _.each(vm.setskufilteredar, avail => {
        if (avail.sku_id !== id.sku_id) {
          avail.selectedsubsku = false;
        }
      })
      let skuNumber = id.sku.replace("-", "");
      skuNumber = skuNumber.substring(1, 7);
      SKUService.API.GetInventoriesForSKU(id.sku_id)
        .then(response => {
          if (response.length) {
            if (response[0].inventory_method_id == 5) {
              this.skunotstocked = true;
              this.isLoaded = true;
              this.loadinglocations = false;
            }
            else {
              this.skunotstocked = false;
              vm.loadAvailability(skuNumber);
            }
          }
        })
    }

    // close dependency details side panel only
    vm.closesubSKU = () => {
      $scope.showSetsubSKU = false;
      this.skuavailabilityList = [];
      this.skuVendorPOList = [];
      _.each(vm.setskufilteredar, avail => {
        avail.selectedsubsku = false;
      })
    };

    vm.getVendorById = (sku) => {
      var vendorId = sku.vendor_id;
      VendorService.API.GetVendorById(vendorId).then(response => {
        vm.is_resale_allowed = response.resale_allowed;
        sku.vendorName = response.name;
      });
    };

    vm.fetchSkuAvailabilityStatus = () => {
      SKUService.API
        .FetchAvailabilityForSku(
          $stateParams.id,
          SessionMemory.API.Get("user.baseLocationId")
        )
        .then(response => {
          vm.skuAvailability = response.status;
          vm.isLoaded = true;
        })
        .catch(error => {
          console.log(error);
        });
    };

    // Open update inventory availibility details panel and get inventory types and qualities
    vm.openUpdateInventoryPanel = (availability, skuId) => {
      //Function to first deselect any previously selected location
      vm.deSelectAllInventoryPanels();
      vm.showLockedScreen = true;
      vm.inventoryUpdateBtn = "Update";
      vm.inventoryDetails = {};
      availability.selected = true;
      vm.selectedAvailability = availability;
      !vm.qualitiesList ? vm.getAllInventoryQualities() : "";
      !vm.inventoryTypes ? vm.getAllInventoryTypes() : "";
    };

    //Function to deselect all previously selected locations
    vm.deSelectAllInventoryPanels = () => {
      vm.availability.filter(availability => {
        availability.selected = false;
      });
    };

    // Get all the inventory qualities list
    vm.getAllInventoryQualities = () => {
      SKUService.API
        .GetInventoryQualityList()
        .then(response => {
          vm.qualitiesList = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    //Get all the inventory types list
    vm.getAllInventoryTypes = () => {
      SKUService.API
        .GetInventoryTypes()
        .then(response => {
          vm.inventoryTypes = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.addlocations = (avail) => {
      var avail_location = 0;
      if (avail.BILCD) avail_location = avail.BILCD;
      else avail_location = avail.PDRLCD;
      switch (avail_location) {
        case 1:
          avail.location_id = 1140
          break;
        case 2:
          avail.location_id = 1139
          break;
        case 3:
          avail.location_id = 1141
          break;
        case 4:
          avail.location_id = 1142
          break;
        case 6:
          avail.location_id = 1143
          break;
        case 7:
          avail.location_id = 1144
          break;
        case 8:
          avail.location_id = 1145
          break;
        case 9:
          avail.location_id = 1146
          break;
        case 10:
          avail.location_id = 1147
          break;
        case 905:
          avail.location_id = 1148
          break;
        case 906:
          avail.location_id = 1149
          break;
        case 870:
          avail.location_id = 1150
          break;
        case 880:
          avail.location_id = 1151
          break;
        case 999:
          avail.location_id = 1152
          break;
      }
    }

    //Showing the availablity of SKUs on click of locations in the side panel of check availability
    vm.loadAvailability = (SKUId) => {
      this.loadinglocations = true;
      this.tryagain = false;
      this.total_poqty = 0;
      this.total_poresv = 0;
      this.total_avail = 0;
      this.forwrd_value = 0;
      this.main_reserved = 0;
      this.sku_total_onhandQty = 0;
      this.sku_total_onhandRes = 0;
      this.sku_total_intransQty = 0;
      this.sku_total_intransRes = 0;
      this.sku_total_onorderQty = 0;
      this.sku_total_onorderRes = 0;
      this.sku_total_onorder = 0;
      this.sku_total_reserved = 0;
      this.sku_total_available = 0;
      this.sku_locations = [];
      vm.loadskuAvailList(SKUId);
    };

    vm.loadskuAvailList = (SKUId) => {
      SKUService.API
        .GetSkuAvailabilityForLocationodbc(SKUId)
        .then(response => {
          this.skuavailabilityList = response;
          if (this.skuavailabilityList && this.skuavailabilityList.length) {
            _.each(this.skuavailabilityList, avail => {
              vm.addlocations(avail);
              this.sku_total_onhandQty += avail.BIQOH;
              // vm.sku_total_onhandRes += avail.BIROH;
              this.sku_total_intransQty += avail.BIQIT;
              // vm.sku_total_intransRes += avail.BIRIT;
              // vm.sku_total_onorderQty += avail.BIQOO;
              this.sku_total_onorder += avail.BIQOO - avail.BIQAL;
              this.sku_total_reserved += avail.BIROH + avail.BIRIT + avail.BIROO;
              avail.display_availble = avail.BIQOH + avail.BIQIT + (avail.BIQOO - avail.BIQAL) - (avail.BIROH + avail.BIRIT + avail.BIROO);
              this.sku_total_available += avail.BIQOH + avail.BIQIT + (avail.BIQOO - avail.BIQAL) - (avail.BIROH + avail.BIRIT + avail.BIROO);
              // vm.sku_total_onorderRes += avail.BIROO;
              this.sku_locations.push(avail.BILCD);
            })
            for (let i = 0; i < this.skuavailabilityList.length; i++) {
              if (!vm.skuavailabilityList[i].BIQVO && (!locations.includes(this.skuavailabilityList[i].BILCD) || !(vm.skuavailabilityList[i].BIQOH || vm.skuavailabilityList[i].BIQIT || vm.skuavailabilityList[i].BIQOO || vm.skuavailabilityList[i].BIQAL ||
                vm.skuavailabilityList[i].BIROH || vm.skuavailabilityList[i].BIRIT || vm.skuavailabilityList[i].BIROO))) {
                const index = this.sku_locations.indexOf(this.skuavailabilityList[i].BILCD);
                if (index > -1) {
                  this.sku_locations.splice(index, 1); // 2nd parameter means remove one item only
                }
                this.skuavailabilityList.splice(i, 1);
                i--;
              }
            }
            this.loadpoList(SKUId);
          }
          else {
            this.loadinglocations = false;
            // vm.tryagain = true;
            this.isloaded = false;
            this.validlocations();
          }
        })
        .catch(error => {
          logger.error(error);
          this.tryagain = true;
          this.loadinglocations = false;
          this.data_loading = true;
          this.isloaded = false;
        });
    }

    vm.loadpoList = (SKUId) => {
      SKUService.API
        .GetVendorPOForLocationodbc(SKUId)
        .then(res => {
          this.skuVendorPOList = res;
          if (this.skuVendorPOList && this.skuVendorPOList.length) {
            _.each(this.skuVendorPOList, po => {
              vm.addlocations(po);
              po.PDPO = po["PDPO#"];
              this.total_poqty += po.PDQVO;
              // this.sku_locations.push(po.PDRLCD);
              $timeout(() => {
                _.each(this.skuavailabilityList, skuavail => {
                  if (skuavail.BIEDP == po.PDEDP && skuavail.BILCD == po.PDRLCD) {
                    if (!this.forwrd_value) {
                      // this.forwrd_value = skuavail.BIRVO - po.PDQVO;
                      // po.PDRS = po.PDQVO;
                      if (!this.po_default) this.main_reserved = skuavail.BIRVO;
                    }
                    else {
                      this.main_reserved = this.forwrd_value;
                    }
                    if (this.main_reserved > 0)
                      if (this.main_reserved > po.PDQVO) {
                        po.PDRS = po.PDQVO;
                        this.forwrd_value = this.main_reserved - po.PDQVO;
                      }
                      else {
                        po.PDRS = this.main_reserved;
                        this.main_reserved = 0;
                        this.po_default = true;
                      }
                    else {
                      po.PDRS = 0;
                    }
                    this.total_poresv += po.PDRS;
                    this.total_avail += po.PDQVO - po.PDRS;
                  }
                  this.loadTotalresv = true;
                });
                this.validlocations();
              }, 3000)
            })
          }
          else {
            this.validlocations();
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    this.validlocations = () => {
      $timeout(() => {
        for (let i = 0; i < this.skuVendorPOList.length; i++) {
          if (!locations.includes(this.skuVendorPOList[i].PDRLCD) || !this.sku_locations.includes(this.skuVendorPOList[i].PDRLCD)) {
            this.skuVendorPOList.splice(i, 1);
            i--;
          }
        }
        if (this.sku_locations.length) {
          SKUService.API
            .GetSKULocations(this.sku_locations)
            .then(res => {
              this.skuLocations = res.data;
              this.skuLocations = this.skuLocations.filter(loc => loc.user_defined_data_id == 1421);
              if (vm.setavailbility_uddar) this.filtered_skuset = vm.setavailbility_uddar;
              else this.filtered_skuset = res.data.filter(loc => loc.user_defined_data_id == 2042)
              this.sku_total_available = 0;
              this.sku_total_onhandQty = 0;
              this.sku_total_intransQty = 0;
              this.sku_total_onorder = 0;
              this.sku_total_reserved = 0;
              var empty_ar = [];
              if (this.filtered_skuset.length == 0 && this.skuavailabilityList.length > 0) {
                _.each(res.data, null_loc => {
                  this.filtered_skuset.push({ "location_id": null_loc.location_id, "udd_value_id": 3015 });
                })
                this.filtered_skuset = this.filtered_skuset.filter((arr, index, self) =>
                  index === self.findIndex((t) => (t.location_id == arr.location_id)))
              }
              _.each(this.filtered_skuset, skuset => {
                empty_ar.push(skuset.location_id);
                if (skuset.udd_value_id == 3015) {
                  for (let i = 0; i < this.skuavailabilityList.length; i++) {
                    if (this.skuavailabilityList[i].location_id == skuset.location_id) {
                      this.skuavailabilityList.splice(i, 1);
                      if (i > 0) i--;
                    }
                  }
                  for (let i = 0; i < this.skuVendorPOList.length; i++) {
                    if (this.skuVendorPOList[i] && this.skuVendorPOList[i].location_id == skuset.location_id) {
                      this.skuVendorPOList = this.skuVendorPOList.filter((arr, index, self) =>
                        index === self.findIndex((t) => (t.location_id == arr.location_id)))
                      this.skuVendorPOList.splice(i, 1);
                      if (i > 0) i--;
                    }
                  }
                }
              })

              const locations = [1139, 1140, 1141, 1142, 1143, 1144, 1145, 1146, 1147, 1148, 1149, 1150, 1151, 1152];
              var location_ar = []
              if (empty_ar && empty_ar.length) {
                location_ar = locations.filter(f => !empty_ar.includes(f));

                _.each(location_ar, loc => {
                  for (let i = 0; i < this.skuavailabilityList.length; i++) {
                    if (this.skuavailabilityList[i].location_id == loc) {
                      this.skuavailabilityList.splice(i, 1);
                      if (i > 0) i--;
                    }
                  }
                  for (let i = 0; i < this.skuVendorPOList.length; i++) {
                    if (this.skuVendorPOList[i] && this.skuVendorPOList[i].location_id == loc) {
                      this.skuVendorPOList = this.skuVendorPOList.filter((arr, index, self) =>
                        index === self.findIndex((t) => (t.location_id == arr.location_id)))
                      this.skuVendorPOList.splice(i, 1);
                      if (i > 0) i--;
                    }
                  }
                })
              }
              _.each(this.skuLocations, loc => {
                _.each(res.data, dt => {
                  if (dt.user_defined_data_id == 2041) {
                    if (loc.location_id == dt.location_id) {
                      loc.display_sequence = Number(dt.value);
                    }
                  }
                })
              })
              if (res.data)
                _.each(this.skuavailabilityList, avail => {
                  _.each(this.skuLocations, loc => {
                    if (avail.BILCD == loc.value) {
                      avail.location_name = loc.Location_Name;
                      if (loc.display_sequence) avail.display_sequence = loc.display_sequence
                    };
                  })
                  if (!avail.display_sequence) avail.display_sequence = null;
                  this.sku_total_onhandQty += avail.BIQOH;
                  // vm.sku_total_onhandRes += avail.BIROH;
                  this.sku_total_intransQty += avail.BIQIT;
                  // vm.sku_total_intransRes += avail.BIRIT;
                  // vm.sku_total_onorderQty += avail.BIQOO;
                  this.sku_total_onorder += avail.BIQOO - avail.BIQAL;
                  this.sku_total_reserved += avail.BIROH + avail.BIRIT + avail.BIROO;
                  avail.display_availble = avail.BIQOH + avail.BIQIT + (avail.BIQOO - avail.BIQAL) - (avail.BIROH + avail.BIRIT + avail.BIROO);
                  this.sku_total_available += avail.BIQOH + avail.BIQIT + (avail.BIQOO - avail.BIQAL) - (avail.BIROH + avail.BIRIT + avail.BIROO);
                })

              this.skuavailabilityList.sort((a, b) => a.display_sequence - b.display_sequence);
              _.each(this.skuVendorPOList, po => {
                _.each(this.skuLocations, loc => {
                  if (po.PDRLCD == loc.value) po.location_name = loc.Location_Name;
                })
              })
              this.loadinglocations = false;
            })
            .catch(error => {
              logger.error(error);
              this.tryagain = true;
              this.loadinglocations = false;
              this.data_loading = true;
              this.isloaded = false;
            });
        }
        else {
          // this.tryagain = true;
          this.loadinglocations = false;
        }
      }, 3000)
    }

    vm.updateInventoryAvailibility = availability => {
      availability.inventory_demand = 0;
      availability.inventory_reserve = 0;
      vm.inventoryUpdateBtn = "Updating...";
      vm.updatingInventory = true;
      availability.location_id = vm.selectedAvailability.id;
      availability.sku_id = vm.sku_details.id;
      if (availability.method == 0) {
        availability.inventory_quantity = "-" + availability.inventory_quantity;
      }
      SKUService.API
        .UpsertInventoryAvailability(availability)
        .then(response => {
          vm.inventoryUpdateBtn = "Update";
          vm.inventoryDetails = {};
          vm.updatingInventory = false;
          vm.inventoryMessage = response.data.message;
          if (
            vm.selectedAvailability &&
            vm.selectedAvailability.skuavailabilityList &&
            vm.selectedAvailability.skuavailabilityList.length > 0
          ) {
            let isAlreadyExist = false;
            let list = vm.selectedAvailability.skuavailabilityList;
            for (let i = 0; i < list.length; i++) {
              if (
                (list[i].location_id =
                  availability.location_id &&
                  list[i].inventory_type_id ===
                  availability.inventory_type_id &&
                  list[i].inventory_quality_id ===
                  availability.inventory_quality_id)
              ) {
                isAlreadyExist = true;
                list[i].inventory_quantity =
                  parseInt(list[i].inventory_quantity) +
                  parseInt(availability.inventory_quantity);
              }
            }
            if (!isAlreadyExist) {
              vm.selectedAvailability.skuavailabilityList.push(availability);
            }
          } else {
            vm.selectedAvailability.isSkuAvailable = true;
            $timeout(() => {
              vm.selectedAvailability.skuavailabilityList = [availability];
            }, 0);
          }
        })
        .catch(error => {
          vm.updatingInventory = false;
          vm.inventoryUpdateBtn = "Update";
          logger.error(error);
        });

      $timeout(() => {
        vm.inventoryMessage = null;
        angular.element("#inventory_type_id").focus();
      }, 3000);
    };

    vm.goBack = () => {
      if (
        $stateParams.request_id &&
        $stateParams.previous_state === "review tickets"
      ) {
        $state.go("common.prime.tickets");
      } else {
        if ($stateParams.previous_state === "sku") {
          $state.go("common.prime.itemMaintenance.sku");
          $timeout(() => {
            angular.element("#check_availability").focus();
          }, 1000);
        }
        else {
          $rootScope.$broadcast("closeAvailbility", {
            value: true
          });
        }
      }
    };
    vm.focusBacktoToggle = () => {
      $timeout(() => {
        angular.element("#check_availability_toggle").focus();
      }, 1000);
    }
  }
})();
