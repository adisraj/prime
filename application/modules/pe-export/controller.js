class PeExportController {
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
    // this.logger = this.common.Logger.getInstance("MassMaintenanceController");
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
    this.otherSeldivision = null;
    this.$scope.allClasses = [];
    this.selClass = [];
    this.allDivisionsSelected = false;
    this.allDivisionsSKuCount = 0;
    this.generatingAllSkuIndReport = false;
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
    this.FetchAllDivisions();
    this.FetchAllDepartments();
    //Load all rounding rule groups available
    // this.FetchRoundingRuleGroups();
    //Load all retail price types available
    // this.FetchRetailPriceTypes();
    // to load product explorer hirarchy
    this.getProductExplorerHierarchy();
    // Load retails reason types
    this.getRetailReasonTypes();
    // Load retails reasons
    this.getRetailReasons();
    
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

  onSelectedDivision() {
    this.loadingSkus = true;
    this.loadingExportSkus=true; 
    this.selectedDivision = this.selDivision.id;
    this.selDepartment = null;
    this.selectedDepartment = null;
    this.selectedClasses = null;
    this.selectedClassNames = null;
    this.selClass = [];
    // this.GetSelectedDivisionVendors(this.selectedDivision);
    this.FetchSkusForGivenVendorAndCollection(
      this.selectedVendor,
      this.maintenanceObject.collection_id,
      this.maintenanceObject.item_type_id,
      this.selectedDivision,
      this.selectedDepartment,
      this.selectedClasses
    );
    this.FetchAllDepartments(this.selectedDivision);
    this.FetchClassForDivisionAndDepartment(this.selectedDivision)
  }

  onSelectedDepartment() {
    this.loadingSkus = true;
    this.loadingExportSkus=true; 
    this.selectedDepartment = this.selDepartment.id;
    this.selectedClasses = null;
    this.selectedClassNames = null;
    this.selClass = [];
    // this.GetSelectedDivisionVendors(this.selectedDivision, this.selectedDepartment);
    this.FetchSkusForGivenVendorAndCollection(
      this.selectedVendor,
      this.maintenanceObject.collection_id,
      this.maintenanceObject.item_type_id,
      this.selectedDivision,
      this.selectedDepartment,
      this.selectedClasses
    );
    this.FetchClassForDivisionAndDepartment(this.selectedDivision, this.selectedDepartment)
  }

  FetchSkusForGivenClass() {
    this.selectedClasses = this.selClass.map(it => it.id);
    // this.selClassNames = this.selClass.map(it => it.class); 
    this.selectedClassNames = "";
    this.loadingSkus = true;
    this.loadingExportSkus = true;
    this.FetchSkusForGivenVendorAndCollection(
      this.selectedVendorIds,
      this.maintenanceObject.collection_id,
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

  onHitSubmit() {
    this.loadingSkus = true;
    this.loadingExportSkus=true; 
    this.FetchSkusForGivenVendorAndCollection(
      this.selectedVendor,
      this.maintenanceObject.collection_id,
      this.maintenanceObject.item_type_id,
      this.selectedDivision,
      this.selectedDepartment,
      this.selectedClasses
    );
  }

  // resetting the value of selected division
  resetDivision() {
    this.selDivision = null;
    this.selDepartment = null;
    if (this.selectedDivision) {
      // this.loadingSkus = true;
      // this.loadingExportSkus = true;
      this.selClass = null;
      this.selectedDivision = undefined;
      this.$scope.allClasses = undefined;
      this.selectedDepartment = undefined;
      this.selectedClasses = undefined;
      // this.GetSelectedDivisionVendors(this.selectedDivision, this.selectedDepartment);
      this.RetailDates = undefined;
    }
  }

  // resetting the value of selected department
  resetDepartment() {
    this.selDepartment = null;
    if (this.selectedDepartment) {
      this.loadingSkus = true;
      this.loadingExportSkus = true;
      this.selClass = null;
      this.selectedClasses = undefined;
      this.selectedClassNames = undefined;
      this.selectedDepartment = undefined;
      this.selectedVendor = undefined;
      this.selectedVendorIds = undefined;
      // this.GetSelectedDivisionVendors(this.selectedDivision, this.selectedDepartment);
      this.FetchClassForDivisionAndDepartment();
      if (this.selectedDivision || this.selectedVendor) {
        // this.FetchRetailDatesForVendorOrCollection(
        //   this.selectedVendorIds,
        //   this.maintenanceObject.collection_id,
        //   undefined,
        //   this.maintenanceObject.item_type_id,
        //   this.selectedDivision,
        //   this.selectedDepartment,
        //   this.selectedClasses
        // );

        this.FetchSkusForGivenVendorAndCollection(
          this.selectedVendorIds,
          this.maintenanceObject.collection_id,
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
      this.loadingExportSkus = true;
      this.selClass = null;
      this.selectedClasses = undefined;
      this.selectedClassNames = ""
      this.$scope.allClasses = undefined;
      this.selectedVendor = undefined;
      this.selectedVendorIds = undefined;
      this.LoadingClass = true;
      this.FetchSkusForGivenVendorAndCollection(
        this.selectedVendorIds,
        this.maintenanceObject.collection_id,
        this.maintenanceObject.item_type_id,
        this.selectedDivision,
        this.selectedDepartment,
        this.selectedClasses
      );
      // this.GetSelectedDivisionVendors(this.selectedDivision, this.selectedDepartment);
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
        this.allDivisionsSelected = true;
        this.getAllDivisonsSKus();
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
    this.loadingExportSkus = true;
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
      // this.getSelectedItemTypeVendors(this.maintenanceObject.item_type_id);
      // this.FetchRetailDatesForVendorOrCollection(
      //   this.selectedVendor,
      //   this.maintenanceObject.collection_id,
      //   undefined,
      //   this.maintenanceObject.item_type_id,
      //   this.selectedDivision,
      //   this.selectedDepartment,
      //   this.selectedClasses
      // );
      this.FetchSkusForGivenVendorAndCollection(
        this.selectedVendor,
        this.maintenanceObject.collection_id,
        this.maintenanceObject.item_type_id,
        this.selectedDivision,
        this.selectedDepartment,
        this.selectedClasses
      );
    } else if (data && data.hierarchyValueData && !data.hierarchyValueData.id) {
      this.maintenanceObject.item_type_id = undefined;
      this.selectedPath = undefined;
      //  this.FetchVendors();
      this.FetchSkusForGivenVendorAndCollection(
        this.selectedVendor,
        this.maintenanceObject.collection_id,
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

  getAllDivisonsSKus() {
    this.selDepartment = null;
    this.selDivision = null;
    this.selectedDivision = null;
    this.selectedDepartment = null;
    this.selectedClassNames = [];
    this.selectedClasses = null;
    this.selClass = [];
    if (this.allDivisionsSelected) {
      this.loadingAllDivSkus = true;
      let divs = this.$scope.allDivisions.map(item => item.id);
      let query = {
        item_type_id: undefined,
        division_id: undefined,
        department_id: undefined,
        class_id: undefined,
        skuTypeArray: this.skuTypes,
        allDivisions: divs
      };
      this.RetailService.MassMaintenance.GetSkusForVendorAndCollection(
        undefined,
        undefined,
        query
        ).then(result => {
        this.allDivisionskus = []
        this.allDivisionsSKuCount = result.length;
        this.allDivisionsSKuInd = result;
        this.allDivisionsSKuInd.sort((a, b) => {
          const nameA = a.division.toUpperCase(); // ignore upper and lowercase
          const nameB = b.division.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        })
        this.RetailService.MassMaintenance.GetSkuforImport(
          query
        ).then(skuCoverImadd => {
          this.AllDivisionskuCoverImg = skuCoverImadd;
          this.RetailService.MassMaintenance.GetAllItemsforImport(
            query
          )
            .then(allItems => {
              this.allDivisonsAllItems = allItems;
              this.RetailService.MassMaintenance.GetCoverItemsforImport(
                query
              )
                .then(itemCoverIma => {
                  this.allDivisonsItemCover = itemCoverIma;
                  // this.loadingAllDivSkus = false;
                  this.allDivisionskus = [];
                  divs.forEach(div => {
                    let data = {}
                    data['division_id'] = div;
                    let divisionF = this.$scope.allDivisions.filter(item => item.id == div);
                    data['division'] = divisionF[0].division;
                    let altems = allItems.filter(item => item.division_id == div);
                    data['allItems'] = altems;
                    let allCIIt = itemCoverIma.filter(item => item.division_id == div);
                    data['itemCoverIma'] = allCIIt;
                    let allSk = result.filter(item => item.division_id == div);
                    data['totalSkuCount'] = allSk.length;
                    let allCISk = skuCoverImadd.filter(item => item.division_id == div);
                    data['skuCoverIma'] = allCISk;
                    let coverIds = allCISk.map(item => item.sku_id);
                    let allnoCISk = allSk.filter(item => {
                      return coverIds.indexOf(item.id) == -1;
                    });
                    data['notCoverImgExistSku'] = allnoCISk;
                    this.allDivisionskus.push(data);
                  });

                  this.allDivSkuIndData = [['Divison', 'Department', 'Class', 'SKU#', 'SKU Description', 'Status', 'SKU Type', 'Inventory Method', 'Vendor', 'SKU level cover image', 'Item  level cover image']];
                  for (let i = 0; i < this.allDivisionsSKuInd.length; i++) {
                    let qudata = [];
                    if (this.allDivisionsSKuInd[i].division) {
                      qudata.push(this.allDivisionsSKuInd[i].division);
                    } else {
                      qudata.push('');
                    }
                    if (this.allDivisionsSKuInd[i].department) {
                      qudata.push(this.allDivisionsSKuInd[i].department);
                    } else {
                      qudata.push('');
                    }
                    if (this.allDivisionsSKuInd[i].class_info) {
                      qudata.push(this.allDivisionsSKuInd[i].class_info);
                    } else {
                      qudata.push('');
                    }
                    qudata.push(this.allDivisionsSKuInd[i].sku);
                    if (this.allDivisionsSKuInd[i].description) {
                      qudata.push(this.allDivisionsSKuInd[i].description);
                    } else {
                      qudata.push('');
                    }
                    if (this.allDivisionsSKuInd[i].status) {
                      qudata.push(this.allDivisionsSKuInd[i].status);
                    } else {
                      qudata.push('');
                    }
                    if (this.allDivisionsSKuInd[i].sku_type) {
                      qudata.push(this.allDivisionsSKuInd[i].sku_type);
                    } else {
                      qudata.push('');
                    }
                    if (this.allDivisionsSKuInd[i].inventory_method) {
                      qudata.push(this.allDivisionsSKuInd[i].inventory_method);
                    } else {
                      qudata.push('');
                    }
                    
                    if (this.allDivisionsSKuInd[i].vendor_name) {
                      qudata.push(this.allDivisionsSKuInd[i].vendor_name);
                    } else {
                      qudata.push('');
                    }
                    let exist = 'No';
                    for(let j = 0; j < this.AllDivisionskuCoverImg.length; j++) {
                      if (this.AllDivisionskuCoverImg[j].sku_id == this.allDivisionsSKuInd[i].id) {
                        exist = 'Yes';
                      }
                    }
                    let hasItemCover = 'No';
                    for(let j = 0; j < this.allDivisonsItemCover.length; j++) {
                      if (this.allDivisonsItemCover[j].item_id == this.allDivisionsSKuInd[i].item_id) {
                        hasItemCover = 'Yes';
                      }
                    }
                    qudata.push(exist);
                    qudata.push(hasItemCover);
                    this.allDivSkuIndData.push(qudata);
                    if ( i == this.allDivisionsSKuInd.length - 1) {
                      this.loadingAllDivSkus = false;
                    }
                  }
               
                }).catch(err => {
                  this.loadingAllDivSkus = false;
                })
            }).catch(err => {
              this.loadingAllDivSkus = false;
            })          
        }).catch(err => {
          this.loadingAllDivSkus = false;
        })
      }).catch(error => {
        this.loadingAllDivSkus = false;
      });
    }    
  }

  generateAllSkuIndReport() {
    this.generatingAllSkuIndReport = true;
   var data = this.allDivSkuIndData;
   var ws_name = "data";
   function Workbook() {
     if (!(this instanceof Workbook)) return new Workbook();
     this.SheetNames = [];
     this.Sheets = {};
   }
   var wb = new Workbook()
   var ws = this.sheet_from_array_of_arrays(data);
   var wscols = [ {wpx: 130}, {wpx: 130}, {wpx: 130}, {wpx: 80}, {wpx: 200}, {wpx: 130}, {wpx: 130}, {wpx: 180}, {wpx: 180}, {wpx: 140}, {wpx: 140} ];
   ws['!cols'] = wscols;

   /* add worksheet to workbook */
   wb.SheetNames.push(ws_name);
   wb.Sheets[ws_name] = ws;
   this.getExcel(wb);
  //  var wbout = this.nfef(wb)
  //  let fileName = 'All Divisons-SKU-details-report-' + moment(new Date(Date.now())).format("YYYYMMDD_HHmmss");
  //  fileName = fileName + ".xlsx";
  //  this.generatingAllSkuIndReport = false;
  
 }

  getExcel(wb) {
    let query = {
      wb: wb
    }
    this.RetailService.MassMaintenance.GenerateXl(
      query
    ).then(data1 => {
        var wbout = data1.data;
        this.finalG(wbout);
      }).catch(err => {
        console.log(err)
      })
  }

 finalG(wbout) {
  let fileName = 'All Divisons-SKU-details-report-' + moment(new Date(Date.now())).format("YYYYMMDD_HHmmss");
  fileName = fileName + ".xlsx";
  this.generatingAllSkuIndReport = false;
  saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), fileName);
}

  //Function to get all the retail dates available for selected vendor/collection
  FetchSkusForGivenVendorAndCollection(vendorId, collectionId, itemTypeId, divisionId, departmentId, classId, divs) {
    // this.loadingSkus = true;
    // this.loadingExportSkus=true; 
    let query = {
      item_type_id: itemTypeId,
      division_id: divisionId,
      department_id: departmentId,
      class_id: classId,
      skuTypeArray: this.skuTypes,
      allDivisions: divs
    };
    // this.loadingSkus = true;
    vendorId = this.selectedVendorIds && !this.selectedVendorIds.length ? undefined : this.selectedVendorIds;
    if ((this.selectedVendorIds && this.selectedVendorIds.length) || collectionId || itemTypeId || divisionId || departmentId || classId || (divs && divs.length) ) {
      this.RetailService.MassMaintenance.GetSkusForVendorAndCollection(
        vendorId,
        collectionId,
        query
      )
      .then(result => {
        this.Skus = result;
        this.totalSkuCount = this.Skus.length;
        this.OriginalSkusList = result;
        this.RetailService.MassMaintenance.GetSkuforImport(
          query
        )
          .then(skuCoverIma => {
            this.skuCoverIma = skuCoverIma;
            this.totalCoverImgSkus = skuCoverIma.length;
            let coverIds = skuCoverIma.map(item => item.sku_id);
            this.notCoverImgExistSku = this.Skus.filter(item => {
              return coverIds.indexOf(item.id) == -1 
            });

            this.RetailService.MassMaintenance.GetAllItemsforImport(
              query
            )
            .then(allItems => {
              this.allItems = allItems;
              this.RetailService.MassMaintenance.GetCoverItemsforImport(
                query
              )
                .then(itemCoverIma => {
                  this.itemCoverIma = itemCoverIma;
                  this.totalCoverImgItems = itemCoverIma.length;
                  this.loadingSkus = false;
                  this.loadingExportSkus = false;
                
                }).catch(err => {
                  this.loadingSkus = false;
                  this.loadingExportSkus = false;
                })
            }).catch(err => {
              this.loadingSkus = false;
              this.loadingExportSkus = false;
            })
           
          }).catch(err => {
            this.loadingSkus = false;
            this.loadingExportSkus = false;
          })
      })
      .catch(error => {
        this.loadingExportSkus = false;
        this.loadingSkus = false;
        this.logger.error(error);
      });
    } else {
      this.Skus = undefined;
      this.skuCoverIma = undefined
      this.loadingSkus = false;
      this.loadingExportSkus = false;
      this.selectedVendor = undefined;
    }
  }

  generateAllDivisonsReport(allDivSku) {
    var data = [['Divison', 'Department', 'Class', 'Total Number of SKUs in PE', 'With SKU and Item Cover Image',
    'with SKU Only Cover Image','With Item Only Cover Image' ,'With a Cover Image','Percent of Total',
     'Without a Cover Image', 'Percent of Total']];
    if (allDivSku && allDivSku.length > 0) {
      allDivSku.forEach(item => {
        let colE = 0;
        let colF = 0;
        let colG = 0;
        let obj = [];
        obj.push(item.division);
        obj.push('');
        obj.push('');
        item.allItems.forEach(elem1 => {
          let exist = false;
          for(let j = 0; j < item.itemCoverIma.length; j++) {
            if (item.itemCoverIma[j].item_id == elem1.id) {
              exist = true;
              break;
            }
          }
          let skucI = item.skuCoverIma.filter(skuI => {
            return skuI.item_id == elem1.id;
          })
          let nonSkuCI = item.notCoverImgExistSku.filter(skuI => {
            return skuI.item_id == elem1.id;
          })
          if (exist) {
            colE += skucI.length;
            colG += nonSkuCI.length
          } else {
            colF += skucI.length;
          }
        })

        obj.push(item.totalSkuCount);
        obj.push(colE);
        obj.push(colF);
        obj.push(colG);
        let total = colE + colF + colG;
        obj.push(total);
        if (item.totalSkuCount) {
          if (total > 0) {
            let totalCoverImgSkusPr = parseFloat((total * 100)/item.totalSkuCount).toFixed(2);
            obj.push(Number(totalCoverImgSkusPr));
          } else {
            obj.push(Number(parseFloat(0).toFixed(2)));
          }
         
          let totalNCoverImgSkus = item.totalSkuCount - total;
          obj.push(totalNCoverImgSkus);
          if (totalNCoverImgSkus > 0) {
            let totalCoverImgSkusPr = parseFloat((totalNCoverImgSkus * 100)/item.totalSkuCount).toFixed(2);
            obj.push(Number(totalCoverImgSkusPr));
          } else {
            obj.push(Number(parseFloat(0).toFixed(2)));
          }
        }
        data.push(obj);
      })
    } 
    var ws_name = "data";
    function Workbook() {
      if (!(this instanceof Workbook)) return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }
    var wb = new Workbook()
    var ws = this.sheet_from_array_of_arrays(data);
    var wscols =   [{wpx: 130}, {wpx: 130}, {wpx: 130}, {wpx: 180}, {wpx: 200}, {wpx: 180},
      {wpx: 180}, {wpx: 140}, {wpx: 120}, {wpx: 140}, {wpx: 120}];
    ws['!cols'] = wscols;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    var fileName = "All Divisons-" + moment(new Date(Date.now())).format("YYYYMMDD_HHmmss");
    fileName = fileName + ".xlsx";
    this.generatingReport = false;
    saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), fileName);
  }

  generateSkuReport() {
    this.generatingReport = true;
    var data = [['Divison', 'Department', 'Class', 'Total Number of SKUs in PE', 'with SKU and Item Cover Image',
    'with SKU Only Cover Image','with Item Only Cover Image' ,'With a Cover Image','Percent of Total',
     'without a Cover Image', 'Percent of Total'],
      ['', '' ,'']]
     
   
    if (this.selectedDivision) {
      data[1][0] = this.division[0].division;
    }
    if (this.selectedDepartment) {
      data[1][1] = this.department[0].department;
    }
    if (this.selectedClasses && this.selectedClasses.length) {
      data[1][2] = this.selectedClassNames;
    }
    let colE = 0;
    let colF = 0;
    let colG = 0;
    this.allItems.forEach(elem1 => {
      let exist = false;
      for(let j = 0; j < this.itemCoverIma.length; j++) {
        if (this.itemCoverIma[j].item_id == elem1.id) {
          exist = true;
          break;
        }
      }
      let skucI = this.skuCoverIma.filter(skuI => {
        return skuI.item_id == elem1.id;
      })
      let nonSkuCI = this.notCoverImgExistSku.filter(skuI => {
        return skuI.item_id == elem1.id;
      })
      if (exist) {
        colG += nonSkuCI.length
        colE += skucI.length;
      } else {
        colF += skucI.length;
      }
    })
    data[1].push(this.totalSkuCount);
    data[1].push(colE);
    data[1].push(colF);
    data[1].push(colG);
    let total = colE + colF + colG;
    data[1].push(total);
    if (this.totalSkuCount) {
      let totalCoverImgSkusPr = parseFloat((total * 100)/this.totalSkuCount).toFixed(2);
      data[1].push(Number(totalCoverImgSkusPr));
      let totalNCoverImgSkus = this.totalSkuCount - total;
      data[1].push(totalNCoverImgSkus);
      let totalNCoverImgSkusPr = parseFloat((totalNCoverImgSkus * 100)/this.totalSkuCount).toFixed(2);
      data[1].push(Number(totalNCoverImgSkusPr));
    }
      
    var ws_name = "data";
    function Workbook() {
      if (!(this instanceof Workbook)) return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }
    var wb = new Workbook()
    var ws = this.sheet_from_array_of_arrays(data);
    var wscols = [{wpx: 130}, {wpx: 130}, {wpx: 130}, {wpx: 180}, {wpx: 200}, {wpx: 180},
      {wpx: 180}, {wpx: 140}, {wpx: 120}, {wpx: 140}, {wpx: 120}];
    ws['!cols'] = wscols;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    let fileName = '';
    if (this.selectedDivision) {
      fileName = this.division[0].division;
    }
    if (this.selectedDepartment) {
      fileName += '-' + this.department[0].department;
    }
    if (this.selectedClasses && this.selectedClasses.length) {
      let classess = this.$scope.allClasses.filter(item => {
        return this.selectedClasses.indexOf(item.id) > -1
      })
      let classMp = classess.map(item => item.class);
      fileName += '-' + classMp.join('-');
    }
    fileName += '-' + moment(new Date(Date.now())).format("YYYYMMDD_HHmmss");
    fileName = fileName + ".xlsx";
    this.generatingReport = false;
    saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), fileName);
  }

  generateSkuIndReport() {
    this.generatingIndReport = true;
    var data = [['Divison', 'Department', 'Class', 'SKU#', 'SKU Description', 'Status', 'SKU Type', 'Inventory Method', 'Vendor', 'SKU level cover image', 'Item  level cover image']];
    for (let i = 0; i < this.Skus.length; i++) {
      let qudata = [];
      if (this.selectedDivision) {
        qudata.push(this.division[0].division);
      } else {
        qudata.push('');
      }
      if (this.selectedDepartment) {
        qudata.push(this.department[0].department);
      } else {
        qudata.push('');
      }
      if (this.selectedClasses && this.selectedClasses.length) {
        qudata.push(this.selectedClassNames);
      } else {
        qudata.push('');
      }
      qudata.push(this.Skus[i].sku);
      if (this.Skus[i].description) {
        qudata.push(this.Skus[i].description);
      } else {
        qudata.push('');
      }
      if (this.Skus[i].status) {
        qudata.push(this.Skus[i].status);
      } else {
        qudata.push('');
      }
      if (this.Skus[i].sku_type) {
        qudata.push(this.Skus[i].sku_type);
      } else {
        qudata.push('');
      }
      if (this.Skus[i].inventory_method) {
        qudata.push(this.Skus[i].inventory_method);
      } else {
        qudata.push('');
      }
      
      if (this.Skus[i].vendor_name) {
        qudata.push(this.Skus[i].vendor_name);
      } else {
        qudata.push('');
      }
      let exist = 'No';
      for(let j = 0; j < this.skuCoverIma.length; j++) {
        if (this.skuCoverIma[j].sku_id == this.Skus[i].id) {
          exist = 'Yes';
        }
      }
      let hasItemCover = 'No';
      for(let j = 0; j < this.itemCoverIma.length; j++) {
        if (this.itemCoverIma[j].item_id == this.Skus[i].item_id) {
          hasItemCover = 'Yes';
        }
      }
      qudata.push(exist);
      qudata.push(hasItemCover);
      data.push(qudata);
    }
    var ws_name = "data";
    function Workbook() {
      if (!(this instanceof Workbook)) return new Workbook();
      this.SheetNames = [];
      this.Sheets = {};
    }
    var wb = new Workbook()
    var ws = this.sheet_from_array_of_arrays(data);
    var wscols = [ {wpx: 130}, {wpx: 130}, {wpx: 130}, {wpx: 80}, {wpx: 200}, {wpx: 130}, {wpx: 130}, {wpx: 180}, {wpx: 180}, {wpx: 140}, {wpx: 140} ];
    ws['!cols'] = wscols;

    /* add worksheet to workbook */
    wb.SheetNames.push(ws_name);
    wb.Sheets[ws_name] = ws;
    var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    let fileName = 'SKU-details-report-' + moment(new Date(Date.now())).format("YYYYMMDD_HHmmss");
    fileName = fileName + ".xlsx";
    this.generatingIndReport = false;
    saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), fileName);
  }



  // generateAllSkuIndReport() {
  //    this.generatingAllSkuIndReport = true;
  //   var data = [['Divison', 'Department', 'Class', 'SKU#', 'SKU Description', 'Status', 'SKU Type', 'Inventory Method', 'Vendor', 'SKU level cover image', 'Item  level cover image']];
  //   for (let i = 0; i < this.allDivisionsSKuInd.length; i++) {
  //     let qudata = [];
  //     if (this.allDivisionsSKuInd[i].division) {
  //       qudata.push(this.allDivisionsSKuInd[i].division);
  //     } else {
  //       qudata.push('');
  //     }
  //     if (this.allDivisionsSKuInd[i].department) {
  //       qudata.push(this.allDivisionsSKuInd[i].department);
  //     } else {
  //       qudata.push('');
  //     }
  //     if (this.allDivisionsSKuInd[i].class_info) {
  //       qudata.push(this.allDivisionsSKuInd[i].class_info);
  //     } else {
  //       qudata.push('');
  //     }
  //     qudata.push(this.allDivisionsSKuInd[i].sku);
  //     if (this.allDivisionsSKuInd[i].description) {
  //       qudata.push(this.allDivisionsSKuInd[i].description);
  //     } else {
  //       qudata.push('');
  //     }
  //     if (this.allDivisionsSKuInd[i].status) {
  //       qudata.push(this.allDivisionsSKuInd[i].status);
  //     } else {
  //       qudata.push('');
  //     }
  //     if (this.allDivisionsSKuInd[i].sku_type) {
  //       qudata.push(this.allDivisionsSKuInd[i].sku_type);
  //     } else {
  //       qudata.push('');
  //     }
  //     if (this.allDivisionsSKuInd[i].inventory_method) {
  //       qudata.push(this.allDivisionsSKuInd[i].inventory_method);
  //     } else {
  //       qudata.push('');
  //     }
      
  //     if (this.allDivisionsSKuInd[i].vendor_name) {
  //       qudata.push(this.allDivisionsSKuInd[i].vendor_name);
  //     } else {
  //       qudata.push('');
  //     }
  //     let exist = 'No';
  //     for(let j = 0; j < this.AllDivisionskuCoverImg.length; j++) {
  //       if (this.AllDivisionskuCoverImg[j].sku_id == this.allDivisionsSKuInd[i].id) {
  //         exist = 'Yes';
  //       }
  //     }
  //     let hasItemCover = 'No';
  //     for(let j = 0; j < this.allDivisonsItemCover.length; j++) {
  //       if (this.allDivisonsItemCover[j].item_id == this.allDivisionsSKuInd[i].item_id) {
  //         hasItemCover = 'Yes';
  //       }
  //     }
  //     qudata.push(exist);
  //     qudata.push(hasItemCover);
  //     data.push(qudata);
  //     if ( i == this.allDivisionsSKuInd.length - 1) {
  //       this.generatingAllSkuIndReport = false;
  //     }
  //   }

  //   var ws_name = "data";
  //   function Workbook() {
  //     if (!(this instanceof Workbook)) return new Workbook();
  //     this.SheetNames = [];
  //     this.Sheets = {};
  //   }
  //   var wb = new Workbook()
  //   var ws = this.sheet_from_array_of_arrays(data);
  //   var wscols = [ {wpx: 130}, {wpx: 130}, {wpx: 130}, {wpx: 80}, {wpx: 200}, {wpx: 130}, {wpx: 130}, {wpx: 180}, {wpx: 180}, {wpx: 140}, {wpx: 140} ];
  //   ws['!cols'] = wscols;

  //   /* add worksheet to workbook */
  //   wb.SheetNames.push(ws_name);
  //   wb.Sheets[ws_name] = ws;
  //   var wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
  //   let fileName = 'All Divisons-SKU-details-report-' + moment(new Date(Date.now())).format("YYYYMMDD_HHmmss");
  //   fileName = fileName + ".xlsx";
    
  //   saveAs(new Blob([this.s2ab(wbout)], { type: "application/octet-stream" }), fileName);
  // }

  sheet_from_array_of_arrays(data, opts) {
    var ws = {};
    var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
    for (var R = 0; R != data.length; ++R) {
      for (var C = 0; C != data[R].length; ++C) { 
          if (range.s.r > R) range.s.r = R;
          if (range.s.c > C) range.s.c = C;
          if (range.e.r < R) range.e.r = R;
          if (range.e.c < C) range.e.c = C;
          var cell = { v: data[R][C] };
          if (cell.v == null) continue;
          var cell_ref = XLSX.utils.encode_cell({ c: C, r: R });

          if (typeof cell.v === 'number') cell.t = 'n';
          else if (typeof cell.v === 'boolean') cell.t = 'b';
          else if (cell.v instanceof Date) {
              cell.t = 'n';
              cell.z = XLSX.SSF._table[14];
              cell.v = this.datenum(cell.v);
          } else cell.t = 's';

          ws[cell_ref] = cell;
      }
    }
    if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
    return ws;
  }

  datenum(v, date1904) {
    if (date1904) v += 1462;
    var epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
  }

  s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i != s.length; ++i) {
      view[i] = s.charCodeAt(i) & 0xFF;
    }
     
    return buf;
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
      // this.FetchVendors();
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
      "id": 5,
      "is_default": 0,
      "name": "First Cost"
    }, {
      "id": 6,
      "is_default": 0,
      "name": "Net Cost"
    }, {
      "id": 7,
      "is_default": 0,
      "name": "Average Cost"
    }, {
      "id": 8,
      "is_default": 0,
      "name": "Landed Cost"
    }];
    _.forEach(app, (v) => {
      arr = _.reject(arr, { id: v.id });
    });
    return arr;
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
      // this.FetchVendors();
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
  .module("rc.prime.peexport")
  .controller("PeExportController", PeExportController);
