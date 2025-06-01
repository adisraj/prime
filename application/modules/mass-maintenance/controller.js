class MassMaintenanceController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    APIServices,
    SkuRetailService,
    HierarchyService,
    ItemService
  ) {
    //Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    this.logger = this.common.Logger.getInstance("MassMaintenanceController");
    //Initialize VendorService object, derived from the CommonServices Vendor Object
    this.VendorService = APIServices.Vendor;
    //Initialize VendorCollectionService object, derived from the CommonServices Item Object
    this.ItemService = APIServices.Item;
    this.ItemMasterService = ItemService.API;
    //Initialize RoundingRules object, derived from the CommonServices Retail Object
    this.RetailService = APIServices.Retail;
    this.SkuRetailService = SkuRetailService.API;
    this.HierarchyService = HierarchyService;
    //Loaded variable is set to false
    this.isVendorLoaded = false;
    this.isLoaded = false;
    this.LoadingClass = false;

    this.$scope.allClasses = [];
    //Function to initialize all the variables used along the controller
    this.InitializeControllerVariables();
    $scope
      .getAccessPermissions(129)
      .then(result => {
        this.permissionsMap = result;
        //Call Activate() method to intitialize the controller
        this.Activate();
        this.isLoaded = true;
      })
      .catch(error => {
        this.permissionsMap = error.data;
        //Call Activate() method to intitialize the controller
        this.Activate();
        this.isLoaded = true;
        logger.error(error);
      });
  }

  //Activate function to initialize the controller
  Activate() {
    //Load all vendors available
    this.FetchVendors();
    this.FetchAllDivisions();
    this.FetchAllDepartments();
    //Load all rounding rule groups available
    this.FetchRoundingRuleGroups();
    //Load all retail price types available
    this.FetchRetailPriceTypes();
    // to load product explorer hirarchy
    this.getProductExplorerHierarchy();
    // Load retails reason types
    this.getRetailReasonTypes();
    // Load retails reasons
    this.getRetailReasons();

    this.FetchEffectiveDates();
  }

  // resetting the value of selected vendor
  resetVendorValue() {
    if (this.selectedVendor) {
      this.loadingSkus = true;
      this.openVendorDropdown = undefined;
      this.selectedVendor = undefined
      this.selectedVendorIds = undefined;
      this.maintenanceObject.pricingFactor = undefined;
      this.pricingFactor = undefined;
      this.maintenanceObject.price_generate_method = undefined;
      this.RetailDates = [];
      this.FetchRetailDatesForVendorOrCollection(
        this.selectedVendor,
        this.maintenanceObject.collection_id,
        undefined,
        this.maintenanceObject.item_type_id,
        this.selectedDivision,
        this.selectedDepartment,
        this.selectedClasses
      );
    }
  }

  // resetting the value of selected division
  resetDivision() {
    if (this.selectedDivision) {
      this.loadingSkus = true;
      this.selectedDivision = undefined;
      this.$scope.allClasses = undefined;
      this.selectedDepartment = undefined;
      this.selectedClasses = undefined;
      this.GetSelectedDivisionVendors(this.selectedDivision, this.selectedDepartment);
      this.RetailDates = undefined;
    }
  }

  // resetting the value of selected department
  resetDepartment() {
    if (this.selectedDepartment) {
      this.loadingSkus = true;
      this.selectedClasses = undefined;
      this.selectedClassNames = undefined;
      this.selectedDepartment = undefined;
      this.selectedVendor = undefined;
      this.selectedVendorIds = undefined;
      this.GetSelectedDivisionVendors(this.selectedDivision, this.selectedDepartment);
      this.FetchClassForDivisionAndDepartment();
      if (this.selectedDivision || this.selectedVendor) {
        this.FetchRetailDatesForVendorOrCollection(
          this.selectedVendorIds,
          this.maintenanceObject.collection_id,
          undefined,
          this.maintenanceObject.item_type_id,
          this.selectedDivision,
          this.selectedDepartment,
          this.selectedClasses
        );
        this.division = _.filter(this.$scope.allDivisions, division => division.id == this.selectedDivision);
      } else {
        this.RetailDates = undefined;
      }
    }
  }

  // resetting the value of selected division
  resetClass() {
    if (this.selectedClasses) {
      this.loadingSkus = true;
      this.selectedClasses = undefined;
      this.selectedClassNames = ""
      this.$scope.allClasses = undefined;
      this.selectedVendor = undefined;
      this.selectedVendorIds = undefined;
      this.LoadingClass = true;
      this.GetSelectedDivisionVendors(this.selectedDivision, this.selectedDepartment);
      this.common.$timeout(() => {
        this.FetchClassForDivisionAndDepartment(this.selectedDivision, this.selectedDepartment)
      }, 1000);
    }
  }

  InitializeControllerVariables() {
    //Object assigned for mass maintenance form is initialized
    this.maintenanceObject = {};
    this.skuTypes = ["stock", "mto", "stock plus"];
    this.isSkuTypeSelected = true;
  }

  // function to toggle vendor dropdown
  toggleVendorDropdown() {
    if ((this.selectedVendor && this.selectedVendor.length && this.$scope.allVendors && this.$scope.allVendors.length != 1) || (!this.selectedVendor && this.$scope.allVendors && this.$scope.allVendors.length > 0)) {
      this.common.$timeout(() => {
        if (this.openVendorDropdown || this.openVendorDropdown == undefined) {
          $('.ui-select-container').scope().$select.open = true;
          this.openVendorDropdown = false;
        } else {
          $('.ui-select-container').scope().$select.open = false;
          this.openVendorDropdown = true;
        }
      }, 0);
    }
  }

  toggleDropdown() {
    if (this.openVendorDropdown == undefined || (!this.openVendorDropdown && this.selectedVendor && this.selectedVendor.length % 2 != 0)) {
      this.openVendorDropdown = false;
    } else {
      if (this.openVendorDropdown) {
        this.openVendorDropdown = false;
      } else {
        this.openVendorDropdown = false;
      }
    }
  }

  InitializeSelectizeVariables() {
    //Configure vendor search select object
    this.selectVendorConfiguration = {
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
      options: this.$scope.allVendors,
      render: {
        option: (data, escape) => {
          return (
            '<div class="p-5">' +
            '<div class="m-5">' +
            '<span class="c-black f-13"> ' +
            escape(data.name) +
            "</span>" +
            "</span>" +
            "<span>" +
            '<span class="f-300 f-11 c-gray pull-right">' +
            escape(data.VendorType) +
            "</span>" +
            "</div>" +
            "</div>"
          );
        },
        item: (data, escape) => {
          this.selectedVendor = data.name;
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
    //After loading all vendors, is loaded is set to true
    this.isVendorLoaded = true;
  }

  // Get the Vendors to create a map of Vendors
  FetchVendors = () => {
    let model = "allVendors";
    let vendors = JSON.parse(this.common.SessionMemory.API.Get("vendorList"));
    this.$scope[model] = vendors;
    this.model = vendors;
    this.InitializeSelectizeVariables();
  };

  // Fetch all divisions
  FetchAllDivisions = () => {
    this.RetailService.MassMaintenance.GetAllDivisions()
      .then(result => {
        this.$scope.allDivisions = result.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Fetch departments
  FetchAllDepartments = (divisionId) => {
    this.RetailService.MassMaintenance.GetAllDepartments()
      .then(result => {
        if (divisionId) {
          this.department = _.filter(result.data, department => department.division_id == divisionId);
          this.$scope.allDepartments = this.department;
        } else {
          this.$scope.allDepartments = result.data;
        }
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  setVendorData = (vendorId) => {
    let vendors = JSON.parse(this.common.SessionMemory.API.Get("vendorList"));
    let filteredVendor = vendors.filter(vendorData => vendorData.id === vendorId);
    this.selectedVendor = {
      id: filteredVendor[0].id,
      name: filteredVendor[0].name,
      status: filteredVendor[0].status,
      VendorType: filteredVendor[0].VendorType
    }
  }

  getCollections(selectedVendors) {
    let vendorId = [];
    this.selectedVendorIds = [];
    this.selectedVendorNames = "";
    for (let i = 0; selectedVendors && i < selectedVendors.length; i++) {
      vendorId.push(selectedVendors[i].id)
      this.selectedVendorNames += selectedVendors[i].name + ", ";
      this.selectedVendorIds = vendorId;
    }
    this.maintenanceObject.collection_id = undefined;
    vendorId = vendorId && !vendorId.length ? undefined : vendorId;
    this.FetchRetailDatesForVendorOrCollection(
      vendorId,
      this.maintenanceObject.collection_id,
      undefined,
      this.maintenanceObject.item_type_id,
      this.selectedDivision,
      this.selectedDepartment,
      this.selectedClasses
    );
    this.selectedCollection = undefined;
    this.VendorCollectionsMap = new Map();
    if (this.maintenanceObject && !this.maintenanceObject.item_type_id && !this.selectedDivision) {
      this.FetchVendorCollections(vendorId);
    } else {
      this.getCollectionsForSelectedItemTypeAndVendor(
        this.maintenanceObject.item_type_id,
        vendorId
      );
    }
  }

  //Function to get all the vendor collections
  FetchVendorCollections(vendorId) {
    //Call search vendor collections function from the common services injected
    const searchField = "vendor_id";
    if (vendorId && vendorId.length) {
      this.ItemService.VendorCollection.SearchVendorCollections(
        searchField,
        vendorId
      )
        .then(result => {
          this.SetVendorCollections(result.data);
        })
        .catch(error => {
          //Log the error, in the catch error block
          this.logger.error(error);
        });
    }
  }

  SetVendorCollections(result) {
    //Save the data obtained into VendorsCollections array
    this.VendorCollections = result;
    //Vendorcollections all options is added to deselect the collections
    this.VendorCollections.splice(0, 0, {
      collection: "All",
      collection_id: undefined
    });

    this.VendorCollections.splice(this.VendorCollections.length, 0, {
      collection: "None",
      collection_id: null
    });

    for (let i = 0; i < this.VendorCollections.length; i++) {
      if (
        this.VendorCollections[i] &&
        this.VendorCollections[i].collection_id
      ) {
        this.VendorCollectionsMap[
          this.VendorCollections[i]["collection_id"]
        ] = this.VendorCollections[i]["collection"];
      }
    }
  }

  GetCollectionNameById(collectionId) {
    if (collectionId !== undefined) {
      this.selectedCollection = this.VendorCollectionsMap[collectionId];
    } else {
      this.selectedCollection = undefined;
    }
  }

  //Function to get all the vendor collections
  FetchRoundingRuleGroups() {
    //Call fetch rounding rule groups function from the common services injected
    this.RetailService.RoundingRule.FetchRoundingRuleGroups()
      .then(result => {
        //Assign the data obtained into rounding rule groups array
        this.RoundingRuleGroups = result;
        //Find the default rounding rule group and assign it to the object
        _.filter(result, roundingRule => {
          roundingRule.is_default === 1
            ? (this.maintenanceObject.rule_group_id = roundingRule.id)
            : null;
        });
      })
      .catch(error => {
        //Log the error, in the catch error block
        this.logger.error(error);
      });
  }

  //Function to get all the retail price types
  FetchRetailPriceTypes() {
    this.RetailService.PriceType.FetchPriceTypes()
      .then(result => {
        //Assign the data obtained into price types array
        this.PriceTypes = result.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  //Function to get all effective date for price type and groups
  FetchEffectiveDates() {
    this.RetailService.EffectiveDates.GetAllEffectiveDates()
      .then(result => {
        this.EffetiveDates = result.data;
      })
      .catch(error => {
        this.logger.error(error);
      })
  }

  //Function to get all the retail dates available for selected vendor/collection
  FetchRetailDatesForVendorOrCollection(
    vendorId,
    collectionId,
    isFetchDates,
    itemTypeId,
    divisionId,
    departmentId,
    classId
  ) {
    let query = {
      skuTypeArray: this.skuTypes,
      item_type_id: itemTypeId,
      division_id: divisionId,
      department_id: departmentId,
      class_id: classId
    };
    vendorId = vendorId && !vendorId.length ? undefined : vendorId;
    this.RetailService.MassMaintenance.GetRetailDatesByVendorAndCollection(
      vendorId,
      collectionId,
      query
    )
      .then(result => {
        if (result.length) {
          result.map(ed => (ed.label = ed.effective_date));
          result.unshift({
            effective_date: "current",
            label: "Current Retails"
          });
        }
        //Assign the data obtained into retail dates array
        this.currentDate = new Date();
        this.RetailDates = result;
        this.RetailDates.filter(dt => dt.effective_date <= this.currentDate);
        isFetchDates === true
          ? null
          : this.FetchSkusForGivenVendorAndCollection(
            vendorId,
            collectionId,
            itemTypeId,
            this.selectedDivision,
            this.selectedDepartment,
            this.selectedClasses
          );
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  /**
   * End function of hierarchy tree view select for mass retail maintenance
   * Assign the id of selected hierarchy value as item type id
   */
  end(data) {
    this.loadingSkus = true;
    if (
      data.hierarchyValueData &&
      data.hierarchyValueData.id &&
      Number(this.maintenanceObject.item_type_id) !==
      Number(data.hierarchyValueData.id)
    ) {
      this.Skus = undefined;
      this.selectedPath = data.path_name;
      this.maintenanceObject.item_type_id = data.hierarchyValueData.id;
      this.VendorCollections = undefined;
      this.selectedCollection = undefined;
      this.selectedVendor = undefined;
      this.selectedVendorIds = undefined;
      this.selectedDivision = undefined;
      this.selectedDepartment = undefined;
      this.getSelectedItemTypeVendors(this.maintenanceObject.item_type_id);
      this.FetchRetailDatesForVendorOrCollection(
        this.selectedVendor,
        this.maintenanceObject.collection_id,
        undefined,
        this.maintenanceObject.item_type_id,
        this.selectedDivision,
        this.selectedDepartment,
        this.selectedClasses
      );
    } else if (data && data.hierarchyValueData && !data.hierarchyValueData.id) {
      this.maintenanceObject.item_type_id = undefined;
      this.selectedPath = undefined;
      this.FetchVendors();
      this.FetchRetailDatesForVendorOrCollection(
        this.selectedVendor,
        this.maintenanceObject.collection_id,
        undefined,
        this.maintenanceObject.item_type_id,
        this.selectedDivision,
        this.selectedDepartment,
        this.selectedClasses
      );
    }
  }

  // get PE hierarchy
  getProductExplorerHierarchy() {
    this.isPrimaryHierarchyLoaded = false;
    if (!this.productExplorerId) {
      this.HierarchyService.API.SearchHierarchy(
        "is_product_explorer_hierarchy_id",
        1
      )
        .then(result => {
          this.isPrimaryHierarchyLoaded = true;
          if (result.length > 0) {
            this.productExplorerId = result[0].id;
          }
        })
        .catch(error => {
          this.logger.error(error);
        });
    }
  }

  //Function to get all the classes for selected division/department
  FetchClassForDivisionAndDepartment(divisionId, departmentId) {
    this.$scope.allClasses = [];
    this.disableHierarchy = true;
    this.division = _.filter(this.$scope.allDivisions, division => division.id == divisionId);
    this.department = _.filter(this.$scope.allDepartments, department => department.id == departmentId);
    let department = _.filter(this.$scope.allDepartments, department => department.id == this.selectedDepartment);
    if (department.length > 0 && department[0].classes && department[0].classes.length > 0) {
      this.$scope.allClasses = department[0].classes;
      if (this.LoadingClass === true) {
        this.LoadingClass = false;
      }
    } else {
      this.LoadingClass = false;
    }
  }

  FetchSkusForGivenClass() {
    this.selectedClassNames = "";
    this.loadingSkus = true;
    this.FetchRetailDatesForVendorOrCollection(
      this.selectedVendorIds,
      this.maintenanceObject.collection_id,
      undefined,
      this.maintenanceObject.item_type_id,
      this.selectedDivision,
      this.selectedDepartment,
      this.selectedClasses
    );
    for (let i = 0; i < this.$scope.allClasses.length; i++) {
      for (let j = 0; j < this.selectedClasses.length; j++) {
        if (this.$scope.allClasses[i].id === this.selectedClasses[j]) {
          this.selectedClassNames += this.$scope.allClasses[i].class + ", ";
        }
      }
    }
  }

  //Function to get all the retail dates available for selected vendor/collection
  FetchSkusForGivenVendorAndCollection(vendorId, collectionId, itemTypeId, divisionId, departmentId, classId) {
    let query = {
      item_type_id: itemTypeId,
      division_id: divisionId,
      department_id: departmentId,
      class_id: classId,
      skuTypeArray: this.skuTypes
    };
    // this.loadingSkus = true;
    vendorId = this.selectedVendorIds && !this.selectedVendorIds.length ? undefined : this.selectedVendorIds;
    if ((this.selectedVendorIds && this.selectedVendorIds.length) || collectionId || itemTypeId || divisionId || departmentId || classId) {
      this.RetailService.MassMaintenance.GetSkusForVendorAndCollection(
        vendorId,
        collectionId,
        query
      )
        .then(result => {
          this.loadingSkus = false;
          //Assign the data obtained into retail dates array
          this.Skus = result;
          this.OriginalSkusList = result;
        })
        .catch(error => {
          this.loadingSkus = false;
          this.logger.error(error);
        });
    } else {
      this.Skus = undefined;
      this.loadingSkus = false;
      this.selectedVendor = undefined;
    }
  }
  GetSelectedDivisionVendors(divisioId, departmentId) {
    this.isVendorLoaded = false;
    this.selectedVendor = undefined;
    this.selectedVendorIds = undefined;
    this.selectedClassNames = undefined;
    this.selectedClasses = undefined;
    if (divisioId || departmentId) {
      this.RetailService.MassMaintenance.GetVendorsForDivisionAndDepartment(divisioId, departmentId)
        .then(result => {
          this.selectedVendor = undefined;
          //Save the data obtained into Vendors array
          this.$scope.allVendors = [];
          _.each(result, response => {
            if (response.goods_allowed === 1 && response.resale_allowed === 1) {
              this.$scope.allVendors.push(response);
            }
          });

          this.InitializeSelectizeVariables();
          this.isVendorLoaded = true;
          this.FetchRetailDatesForVendorOrCollection(
            this.selectedVendor,
            this.maintenanceObject.collection_id,
            undefined,
            this.maintenanceObject.item_type_id,
            this.selectedDivision,
            this.selectedDepartment,
            this.selectedClasses
          );
        })
        .catch(error => {
          this.logger.error(error);
        });
    } else {
      this.FetchVendors();
      this.selectedVendor = undefined;
      this.InitializeSelectizeVariables();
      this.isVendorLoaded = true;
    }
  }

  getSelectedItemTypeVendors(itemTypeId) {
    this.isVendorLoaded = false;
    this.selectedVendor = undefined;
    if (itemTypeId) {
      this.RetailService.MassMaintenance.GetVendorsForItemTypeId(itemTypeId)
        .then(result => {
          this.selectedVendor = undefined;
          //Save the data obtained into Vendors array
          this.$scope.allVendors = [];
          _.each(result, response => {
            if (response.goods_allowed === 1 && response.resale_allowed === 1) {
              this.$scope.allVendors.push(response);
            }
          });

          this.InitializeSelectizeVariables();
          this.isVendorLoaded = true;
        })
        .catch(error => {
          this.logger.error(error);
        });
    } else {
      this.$scope.allVendors = [];
      this.selectedVendor = undefined;
      this.InitializeSelectizeVariables();
      this.isVendorLoaded = true;
    }
  }

  getCollectionsForSelectedItemTypeAndVendor(itemTypeId, vendorId) {
    let query = {
      division_id: this.selectedDivision,
      department_id: this.selectedDepartment,
      class_id: this.selectedClasses
    };
    if (vendorId) {
      this.RetailService.MassMaintenance.GetCollectionsForItemTypeIdAndVendorId(
        itemTypeId,
        vendorId,
        query
      )
        .then(result => {
          this.SetVendorCollections(result);
        })
        .catch(error => {
          this.logger.error(error);
        });
    }
  }

  // function to get retail reason types
  getRetailReasonTypes() {
    this.SkuRetailService.GetRetailReasonTypes()
      .then(response => {
        this.retail_reason_types = response.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Getting all the retail reasons
  getRetailReasons() {
    this.SkuRetailService.GetRetailReasons()
      .then(response => {
        this.retail_reasons = response.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Once we select a price type we filter the price reason based on the type_id
  filterRetailReason() {
    // if price change type is permanent, assign the end_date to null
    if (this.maintenanceObject.reason_type_id === 1) {
      this.maintenanceObject.end_date = null;
    }
    this.retail_filtered_reasons = this.retail_reasons.filter(
      data => this.maintenanceObject.reason_type_id == data.type_id
    );
    if (this.retail_filtered_reasons.length === 1) {
      this.maintenanceObject.reason_id = this.retail_filtered_reasons[0].id;
    }
  }

  fetchValidPriceTypes() {
    if (
      this.maintenanceObject.from_effective_date !== "current" &&
      moment(this.maintenanceObject.from_effective_date).format(
        "YYYY-MM-DD"
      ) ===
      moment(this.maintenanceObject.copy_to_effective_date).format(
        "YYYY-MM-DD"
      )
    ) {
      this.CopyToPriceTypes = _.filter(this.PriceTypes, priceType => {
        return priceType.id !== this.maintenanceObject.copy_from_price_type_id;
      });
    } else {
      this.CopyToPriceTypes = this.PriceTypes;
    }
    this.CopyToPriceTypes = this.removespclPricetypes(this.CopyToPriceTypes);
  }

  removespclPricetypes(arr) {
    var app = [{
      "id": 6,
      "is_default": 0,
      "name": "First Cost"
    }, {
      "id": 7,
      "is_default": 0,
      "name": "Net Cost"
    }, {
      "id": 8,
      "is_default": 0,
      "name": "Average Cost"
    }, {
      "id": 9,
      "is_default": 0,
      "name": "Landed Cost"
    }];
    _.forEach(app, (v) => {
      arr = _.reject(arr, { id: v.id });
    });
    return arr;
  }

  FetchSkusByType(skuType, isSelected) {
    this.Skus = [];
    if (isSelected === 1) {
      this.skuTypes.push(skuType);
      this.isSkuTypeSelected = true;
      this.FetchRetailDatesForVendorOrCollection(
        this.selectedVendorIds,
        this.maintenanceObject.collection_id,
        undefined,
        this.maintenanceObject.item_type_id,
        this.selectedDivision,
        this.selectedDepartment,
        this.selectedClasses
      );
      this.Skus = _.filter(this.OriginalSkusList, sku => {
        if (this.skuTypes.length === 1 && skuType) {
          return sku.sku_type === this.skuTypes[0];
        } else if (this.skuTypes.length === 2) {
          if (
            sku.sku_type === this.skuTypes[0] ||
            sku.sku_type === this.skuTypes[1]
          ) {
            return sku;
          }
        } else if (this.skuTypes.length === 3) {
          if (
            sku.sku_type === this.skuTypes[0] ||
            sku.sku_type === this.skuTypes[1] ||
            sku.sku_type === this.skuTypes[2]
          ) {
            return sku;
          }
        } else {
          this.Skus = this.OriginalSkusList;
        }
      });
    } else {
      let index = this.skuTypes.findIndex(type => type === skuType);
      this.skuTypes.splice(index, 1);
      if (this.skuTypes.length > 0) {
        this.FetchRetailDatesForVendorOrCollection(
          this.selectedVendor,
          this.maintenanceObject.collection_id,
          true,
          this.maintenanceObject.item_type_id,
          this.selectedDivision,
          this.selectedDepartment,
          this.selectedClasses
        );
        this.Skus = _.filter(this.OriginalSkusList, sku => {
          if (this.skuTypes.length === 1) {
            return sku.sku_type === this.skuTypes[0];
          } else if (this.skuTypes.length === 2) {
            if (
              sku.sku_type === this.skuTypes[0] ||
              sku.sku_type === this.skuTypes[1]
            ) {
              return sku;
            }
          } else if (this.skuTypes.length === 3) {
            if (
              sku.sku_type === this.skuTypes[0] ||
              sku.sku_type === this.skuTypes[1] ||
              sku.sku_type === this.skuTypes[2]
            ) {
              return sku;
            }
          }
        });
      } else {
        this.isSkuTypeSelected = false;
        this.Skus = [];
      }
    }
  }

  // function to check selected price generating method
  checkPriceGeneratingMethod(method) {
    this.generateRetailsInfo =
      this.maintenanceObject.price_generate_method === "percentage"
        ? "The retails will be copied only if the sku's are having previous retails on the specific date selected as existing retails."
        : "The retails will be generated only for the sku's/vendors having landed cost.";
    if (method === "pricing_factor") {
      this.maintenanceObject.pricingFactor =
        this.pricingFactor && this.pricingFactor.factor
          ? this.pricingFactor.factor
          : undefined;
      this.maintenanceObject.method = null;
      this.maintenanceObject.no_lower_retail_change = null;
    } else {
      this.maintenanceObject.pricingFactor = undefined;
    }
  }

  // Function to get pricing factor for selected vendor
  fetchPricingFactorForVendor() {
    if (this.selectedVendorIds && this.selectedVendorIds.length) {
      this.ItemMasterService.FetchPricingFactorForAnEntityAndInstance(
        "vendor",
        this.selectedVendorIds
      )
        .then(result => {
          this.pricingFactor = result;
        })
        .catch(error => {
          this.logger.error(error);
        });
    } else {
      this.selectedVendor = undefined;
    }
  }

  // Function to get uinion of price types for selected effective date
  getPriceTypesIdsByEffectiveDate(effectiveDate) {
    var mass_retail = [{
      "id": 6,
      "is_default": 0,
      "name": "First Cost"
    }, {
      "id": 7,
      "is_default": 0,
      "name": "Net Cost"
    }, {
      "id": 8,
      "is_default": 0,
      "name": "Average Cost"
    }, {
      "id": 9,
      "is_default": 0,
      "name": "Landed Cost"
    }];
    this.CopyFromPriceTypes = [];
    if (effectiveDate && effectiveDate !== "current") {
      this.RetailService.MassMaintenance.GetPriceTypeIdsForEffectiveDate(
        effectiveDate
      )
        .then(result => {
          this.priceTypeIds = result.map(ptype => ptype.price_type_id);
          for (let i = 0; i < this.PriceTypes.length; i++) {
            if (this.priceTypeIds.includes(this.PriceTypes[i].id)) {
              this.CopyFromPriceTypes.push(this.PriceTypes[i]);
            }
          }
        })
        .catch(error => {
          this.logger.error(error);
        });
    } else {
      this.CopyFromPriceTypes = this.PriceTypes;
    }
    for (let i = 0; i < mass_retail.length; i++) {
      this.CopyFromPriceTypes.push(mass_retail[i]);
    }
    var data = this.CopyFromPriceTypes.filter((obj, pos, arr) => {
      return arr.map(mapObj =>
        mapObj.id).indexOf(obj.id) == pos;
    });
    this.CopyFromPriceTypes = data;
  }

  // function to reload hierarchy field in the form
  reloadHierarchyValue() {
    this.isPrimaryHierarchyLoaded = false;
    this.common.$timeout(() => {
      this.isPrimaryHierarchyLoaded = true;
    }, 0);
  }

  //Function to copy retails based on selected criteria
  executeRetailsCopy() {
    let skusList = [];
    let skuTypes = [];
    this.selectedVendor = null
    this.successMsg = null;
    this.errorMsg = null;
    this.notFound = 0;
    this.executedCount = 0;
    this.failedCount = 0;
    this.retailExists = 0;
    this.isExecuting = true;
    this.common.LocalMemory.API.Post("isExecuting", true);

    this.maintenanceObject.stock_sku_type === 1 ?
      skuTypes.push("'stock'") :
      null;
    this.maintenanceObject.mto_sku_type === 1 ? skuTypes.push("'mto'") : null;
    this.maintenanceObject.stock_plus_sku_type === 1 ?
      skuTypes.push("'stock plus'") :
      null;
    for (let i = 0; i < this.Skus.length; i++) {
      skusList.push({ sku_id: this.Skus[i].id, sku_type: this.Skus[i].sku_type, landed_cost: this.Skus[i].landed_cost });
    }
    let object = {
      skus: skusList,
      from_effective_date: this.maintenanceObject.from_effective_date && this.maintenanceObject.from_effective_date !== "current" ?
        moment(this.maintenanceObject.from_effective_date).format("YYYY-MM-DD") : this.maintenanceObject.from_effective_date,
      from_price_type_id: this.maintenanceObject.copy_from_price_type_id,
      skuTypes: skuTypes,
      reason_type_id: this.maintenanceObject.reason_type_id,
      reason_id: this.maintenanceObject.reason_id,
      to_effective_date: moment(
        this.maintenanceObject.copy_to_effective_date
      ).format("YYYY-MM-DD"),
      end_date: isNaN(Date.parse(moment(
        this.maintenanceObject.end_date
      ).format("YYYY-MM-DD"))) ? null : moment(
        this.maintenanceObject.end_date
      ).format("YYYY-MM-DD"),
      to_price_type_id: this.maintenanceObject.copy_to_price_type_id,
      method: this.maintenanceObject.percentage_change_value ? this.maintenanceObject.method : "inc",
      percentage_change_value: this.maintenanceObject.percentage_change_value ? this.maintenanceObject.percentage_change_value : 0,
      no_lower_retail_change: this.maintenanceObject.no_lower_retail_change,
      rule_group_id: this.maintenanceObject.rule_group_id,
      price_generate_method: this.maintenanceObject.price_generate_method ? this.maintenanceObject.price_generate_method : "null",
      pricingFactor: this.maintenanceObject.pricingFactor,
      vendor_id: this.selectedVendor
    };

    this.RetailService.MassMaintenance
      .ExecuteRetailsCopy(object)
      .then(result => {
        this.successMsg = result.data.message;
        this.isExecuting = false;
        // this.executedCount = result.copied;
        // this.failedCount = result.failed;
        // this.notFound = result.notFound;
        // this.retailExists = result.retailExists
        this.resetForm();
        //this.resetInformation();
      })
      .catch(error => {
        //this.failedCount = this.Skus.length;
        this.errorMsg = error.data.message;
        this.resetForm();
        this.logger.error(error);
      });
  }

  resetForm() {
    this.common.$timeout(() => {
      this.skuTypes = ["stock", "mto", "stock plus"];
      this.Skus = [];
      this.RetailDates = [];
      this.selectedDepartment = undefined;
      this.selectedDivision = undefined;
      this.$scope.allClasses = [];
      this.selectedClasses = undefined;
      this.isExecuting = false;
      this.$scope.isExecuting = false;
      this.common.LocalMemory.API.Post("isExecuting", false);
      this.selectedPath = undefined;
      this.selectedCollection = undefined;
      this.maintenanceObject = {};
      this.maintenanceObject.stock_sku_type = 1;
      this.maintenanceObject.mto_sku_type = 1;
      this.maintenanceObject.stock_plus_sku_type = 1;
      this.reloadHierarchyValue();
      this.FetchVendors();
      this.FetchAllDivisions();
      this.FetchAllDepartments();
      // Find the default rounding rule group and assign it to the object
      _.filter(this.RoundingRuleGroups, roundingRule => {
        roundingRule.is_default === 1
          ? (this.maintenanceObject.rule_group_id = roundingRule.id)
          : null;
      });
    }, 3000);

    this.common.$timeout(() => {
      this.errorMsg = null;
      this.successMsg = null
    }, 10000)
  }
  // function reset sku copy information
  resetInformation() {
    this.common.$timeout(() => {
      this.selectedPath = undefined;
      this.selectedCollection = undefined;
      this.selectedVendor = undefined;
      this.executedCount = null;
      this.failedCount = null;
      this.notFound = null;
      this.retailExists = null;
    }, 10000);
  }
}

angular
  .module("rc.prime.massmaintenance")
  .controller("MassMaintenanceController", MassMaintenanceController);
