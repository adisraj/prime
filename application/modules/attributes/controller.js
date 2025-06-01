class AttributeController {
  constructor(
    $scope,
    $stateParams,
    $state,
    common,
    AttributeFactory,
    EntityFactory,
    ItemTypeService,
    ItemUDDService,
    LocationUDDService,
    VendorUDDService,
    MTOUDDService,
    AttributeValueService,
    HierarchyValueService,
    HierarchyValuesTreePathService,
    valdr,
    SessionMemory,
    StatusCodes
  ) {
    // Bind all the dependencies to the controller into 'this' keyword
    this.$scope = $scope;
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.common = common;
    this.AttributeFactory = AttributeFactory;
    this.EntityFactory = EntityFactory;
    this.ItemTypeService = ItemTypeService;
    this.ItemUDDService = ItemUDDService;
    this.LocationUDDService = LocationUDDService;
    this.VendorUDDService = VendorUDDService;
    this.MtoUDDService = MTOUDDService;
    this.AttributeValueService = AttributeValueService;
    this.HierarchyValueService = HierarchyValueService;
    this.HierarchyValuesTreePathService = HierarchyValuesTreePathService;
    this.valdr = valdr;
    this.SessionMemory = SessionMemory;
    this.StatusCodes = StatusCodes;
    this.logger = this.common.Logger.getInstance("AttributeController");
    // Unique Identification number for attribute header entity, set in entity table
    this.uuid = "21";

    // Set default value for table sort type, page and page size for tir paginate table
    this.currentPage = 1;
    this.pageSize = 100;
    this.isShowAdd = false;
    this.isShowHistory = false;
    this.showConfigureUdd = false;
    this.sortType = ["entity", "description"];

    // When the variables are called, it has its this keyword set to the provided value
    this.$scope.loadHistory = this.FetchHistory.bind(this);
    this.$scope.closeShowHistory = this.CloseHistoryPanel.bind(this);

    // Initialize the variables for filter attribute by selected values for a field feature
    this.applyFilterMessage = null;
    this.filters = {};
    this.filters.entityIds = [];
    this.filters.statusIds = [];
    this.filters.formatIds = [];
    this.filters["description"] = null;
    this.is_important = 0;
    this.old_filters;
    this.applyFiltersBtnLabel = "Apply Filters";
    this.appliedFilterCount = 0;
    // this.maxShortDescriptionCharacter = 15;

    // Set Variables to delete and update confirmation to false initially
    this.isUpdateSuccess = false;
    this.isDeleteSuccess = false;
    this.isSaveSuccess = false;
    this.viewValuesOption = false;
    this.isUnauthorized = false;

    this.updateBtnText = "Update";
    this.isBtnEnable = true;
    // this.isSearchFocusd = false;

    // Is apply filter success is true initially
    this.applyFilterSuccess = true;

    this.$scope.$on("AttributeValueUpdate", (e, data) => {
      if (data.action === "create") {
        this.attributeValueCountMap[data.attribute_id] = this
          .attributeValueCountMap[data.attribute_id] ?
          Number(this.attributeValueCountMap[data.attribute_id]) + 1 :
          1;
      } else {
        this.attributeValueCountMap[data.attribute_id] = this
          .attributeValueCountMap[data.attribute_id] ?
          Number(this.attributeValueCountMap[data.attribute_id]) - 1 :
          0;
      }
    });
  }

  // Activate method to initialize attribute controller
  activate() {
    // Get value count for attributes with has values
    this.FetchAttributeValuesCount();
    // Get all Attributes
    this.ViewAttributes();
    // Get entity information like uuid and base-url for attribute entity
    this.getAttributeInformation();
    // Get the model JSON file containing rules to create or update an attribute
    this.GetModelAndSetValidationRules();
    // Set attribute columns to show true or false
    this.setGridProperties();
    this.getPermissionsForUuid("attributePermissions", this.uuid);
  }

  // Get permissions of crud operations for attribute
  getPermissionsForUuid(model, uuid) {
    this.$scope
      .getAccessPermissions(uuid)
      .then(res => {
        this[model] = res;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Set attribute grid properties for show-hide attribute columns
  setGridProperties() {
    this.attributeGrid = {
      columns: {
        id: {
          visible: false
        },
        status: {
          visible: true
        },
        entity: {
          visible: true
        },
        description: {
          visible: true
        },
        shortDescription: {
          visible: true
        },
        format: {
          visible: true
        },
        as400_data_tag: {
          visible: true
        },
        from: {
          visible: true
        },
        to: {
          visible: true
        },
        values: {
          visible: true
        },
        datalake: {
          visible: true
        }
      }
    };
  }

  focusSearchField() {
    this.common.$timeout(() => {
      angular.element("#inlineSearch").focus();
    }, 1000)
  }

  focusSearchFieldAdvance() {
    this.common.$timeout(() => {
      angular.element("#entity_drop")[0].children[0].childNodes[0].focus();
    }, 1000)
  }

  // Close the advanced search/filter attribute panel
  closeAdvancedSearchPanel() {
    $("#advanced-search").collapse("hide");
    this.applyFilterSuccess = true;
    // Reset the search filter variables to null
    this.ResetFilters();
  }

  // On click of row, send the row index and highlight the row clicked
  setClickedRow(index) {
    this.selectedRow = index;
  }

  // Get entity information like uuid and base-url for attribute entity
  getAttributeInformation() {
    this.common.EntityDetails.API.GetEntityInformation(this.uuid).then(
      AttributeDetails => {
        this.AttributeInformation = AttributeDetails;
      }
    );
  }

  // Get all the attribute formats available
  FetchFormats() {
    this.isAttributeLoading = true;
    this.Formats = JSON.parse(
      this.common.LocalMemory.API.Get("AttributeFormats")
    );
    if (this.Formats && this.Formats.length > 0) {
      this.formatIdMap = {};
      for (let i = 0; i < this.Formats.length; i++) {
        if (this.formatIdMap[this.Formats[i].id] === undefined) {
          this.formatIdMap[this.Formats[i].id] = this.Formats[i];
        }
      }
      return true;
    } else {
      return this.AttributeFactory.FetchFormats().then(response => {
        this.isAttributeLoading = false;
        this.common.LocalMemory.API.Post("AttributeFormats", response.data);
        this.formatIdMap = {};
        for (let i = 0; i < response.data.length; i++) {
          if (this.formatIdMap[response.data[i].id] === undefined) {
            this.formatIdMap[response.data[i].id] = response.data[i];
          }
        }
      });
    }
  }

  MapAttributesData(attributes, refresh) {
    // Map all attributes by ID - in key-value pair
    for (let i = 0; i < attributes.length; i++) {
      // If Attributes Map variable of ID is undefined, then create map
      if (this.AttributesMap[attributes[i].id] === undefined) {
        attributes[i].format = this.formatIdMap[attributes[i].format_id].format;
        attributes[i].ui_component = this.formatIdMap[
          attributes[i].format_id
        ].ui_component;
        attributes[i].entity = this.entityIdMap[attributes[i].entity_id].entity;
        attributes[i].status = this.statusIdsMap[
          attributes[i].status_id
        ].description;
        this.AttributesMap[attributes[i].id] = attributes[i];
      } else {
        attributes[i].entity = this.entityIdMap[attributes[i].entity_id].entity;
        attributes[i].status = this.statusIdsMap[
          attributes[i].status_id
        ].description;
        this.AttributesMap[attributes[i].id].format = this.formatIdMap[
          attributes[i].format_id
        ].format;
        this.AttributesMap[attributes[i].id].ui_component = this.formatIdMap[
          attributes[i].format_id
        ].ui_component;
      }
      if (i === attributes.length - 1) {
        this.isLoading = false;
        if (refresh !== undefined) {
          // After given time, reset refresh flag to false
          this.common.$timeout(() => {
            this.isRefreshTable = false;
            this.refreshTableText = "";
          }, 2500);
        }
      }
    }

    // Get data from map, based on selected attribute id and current state
    this.$stateParams.id &&
      (this.$state.current.name.includes(".update") ||
        this.$state.current.name.includes(".view")) ?
      this.LoadAttribute() :
      null;
  }

  // Fetch all master entities
  FetchEntities() {
    // Check if entity data is stored in local storage, fetch the entities stored
    let response = JSON.parse(this.common.LocalMemory.API.Get("entity_data"));
    let entities = [];
    if (response) {
      for (let i = 0; i < response.length; i++) {
        if (response[i].master_data === 1) {
          entities.push(response[i]);
        }
      }
      this.common.LocalMemory.API.Post("MasterEntities", entities);
      return this.LoadEntities();
    } else {
      // Else call request to fetch all the entities
      this.EntityFactory.FetchEntities(1)
        .then(entity_data => {
          entities = entity_data.data;
          this.common.LocalMemory.API.Post("MasterEntities", entities);
          return this.LoadEntities();
        })
        .catch(error => {
          this.logger.error(error);
        });
    }
  }

  // Get available statuses for UDD service
  FetchStatus() {
    // Check if status is stored in local storage, fetch if stored
    let statuses = JSON.parse(
      this.common.LocalMemory.API.Get(this.uuid + "_statuses")
    );
    this.statuses = statuses;
    if (statuses) {
      this.statusIdsMap = {};
      for (let i = 0; i < statuses.length; i++) {
        if (this.statusIdsMap[statuses[i].code] === undefined) {
          this.statusIdsMap[statuses[i].code] = statuses[i];
        }
      }
      return true;
    } else {
      // Else call request to fetch statuses
      return this.AttributeFactory.FetchStatus(1)
        .then(response => {
          // Store udd status into a variable in local memory for further use
          this.common.LocalMemory.API.Post(
            this.uuid + "_statuses",
            response.data
          );
          for (let i = 0; i < response.data.length; i++) {
            if (
              this.statusIdsMap &&
              this.statusIdsMap[response.data[i].code] === undefined
            ) {
              this.statusIdsMap[response.data[i].code] = response.data[i];
            }
          }
        })
        .catch(error => {
          this.logger.error(error);
        });
    }
  }

  // Load all the available attribute formats from the localmemory
  LoadFormats() {
    this.Formats = JSON.parse(
      this.common.LocalMemory.API.Get("AttributeFormats")
    );
  }

  // Load all the available entities from the localmemory
  LoadEntities() {
    this.Entities = JSON.parse(
      this.common.LocalMemory.API.Get("MasterEntities")
    );

    this.entityIdMap = {};
    if (this.Entities) {
      for (let i = 0; i < this.Entities.length; i++) {
        if (this.entityIdMap[this.Entities[i].id] === undefined) {
          this.entityIdMap[this.Entities[i].id] = this.Entities[i];
        }
      }
    }
    return true;
  }

  // Load all the available statuses from the localmemory
  LoadStatus() {
    this.Status = JSON.parse(
      this.common.LocalMemory.API.Get(this.uuid + "_statuses")
    );
  }

  FetchAttributeValuesCount() {
    this.AttributeFactory.FetchAttributeValuesCount()
      .then(valuesCount => {
        this.attributeValueCountMap = {};
        for (let i = 0; i < valuesCount.data.length; i++) {
          if (
            this.attributeValueCountMap[valuesCount.data[i].attribute_id] ===
            undefined
          ) {
            this.attributeValueCountMap[valuesCount.data[i].attribute_id] =
              valuesCount.data[i].attribute_value_count;
          }
        }
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Fetch all the attributes
  ViewAttributes(refresh) {
    this.AttributesMap = {};
    this.isLoading = true;
    if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
    }
    this.AttributeFactory.FetchAttributes()
      .then(response => {
        this.Attributes = response;
        this.rowsCount = response.data.length;
        // Initialize filter variable object
        this.filters = {};
        // Filter applied flag is set to false
        this.isFilterApplied = false;
        // update and delete success variable is set to false
        this.isUpdateSuccess = false;
        this.isDeleteSuccess = false;
        this.isConfirmDelete = false;
        this.isDeleteConfirmation = false;
        this.isSaveSuccess = false;

        // Get the from and to attribute count loaded for the selected page
        this.updateTableInformation(1);
        // Check if view permission for attributes is true or false and set the flag value accordingly
        this.Attributes.status === 404 ?
          (this.isViewAuthorized = false) :
          (this.isViewAuthorized = true);

        // Get the available attribute formats
        const fetchFormatPromise = this.FetchFormats();
        // Get all the master entities
        const fetchEntityPromise = this.FetchEntities();
        // Get the status available for udd
        const fetchStatusPromise = this.FetchStatus();

        // Map the attributes for format, entity and status
        Promise.all([
          fetchFormatPromise,
          fetchEntityPromise,
          fetchStatusPromise
        ])
          .then(() => {
            this.MapAttributesData(this.Attributes.data, refresh);
          })
          .catch(() => { });

        // Check for state params id and on refresh of delete form, show confirm form.
        this.$stateParams.id && this.$state.current.name.includes(".delete") ?
          (this.isConfirmDelete = true) :
          null;

        this.common.$timeout(() => {
          if (refresh !== undefined && !this.isLoading) {
            // Get the total record count to display
            this.totalRecords = this.Attributes.data.length;
            // Get the time taken to refresh attributes table and set message variable to display
            this.totalRecordsText = "record(s) loaded in approximately";
            this.totalTimeText =
              "<strong>" +
              this.Attributes.data.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            this.refreshTableText = "Successfully refreshed";
          }
        }, 0);
      })
      .catch(error => {
        // If fetch attributes fail, return a fail message
        this.isRefreshTable = true;
        this.refreshTableText = "Unsuccessfull!";
        this.common.$timeout(() => {
          this.isRefreshTable = false;
        }, 2500);
        this.isLoading = false;
        this.logger.error(error);
      });
  }

  // Re-Load attributes on click refresh button
  RefreshData(refresh) {
    this.setGridProperties();
    if (!this.appliedFilterCount) {
      this.ViewAttributes(refresh);
    } else if (refresh !== undefined) {
      this.totalRecords = "";
      this.totalTimeText = "";
      this.isRefreshTable = true;
      this.refreshTableText = "Table is refreshing...";
      this.common.$timeout(() => {
        this.isRefreshTable = false;
        this.refreshTableText = "";
      }, 2500);
    }
  }

  // Go to view attribute values state and page for selected attribute
  ViewAttributeValues(id) {
    this.common.$state.go("common.prime.attributes.values", {
      attribute_id: id
    });
    this.common.$timeout(() => {
      angular.element("#inlineSearch").focus();
    },2000)
  }

  // Get attribute by given Id
  LoadAttribute(id) {
    if (this.$stateParams.id && this.AttributesMap[this.$stateParams.id] && this.AttributesMap[this.$stateParams.id].format.toLowerCase() === 'date range') {
      this.assignMaxAndMinToValues(this.AttributesMap[this.$stateParams.id]);
    }
    // Get the mapped attributes by attribute id
    if (this.$stateParams.id && this.AttributesMap[this.$stateParams.id]) {
      this.Attribute = _.clone(this.AttributesMap[this.$stateParams.id]);
      this.oldAttribute = _.clone(this.AttributesMap[this.$stateParams.id]);
    }
    // Set the focus to description field on timeout
    this.common.$timeout(() => {
      angular.element("#description").focus();
      if (
        this.Attribute &&
        this.Attribute.format &&
        this.Attribute.format.toLowerCase() === "percentage" &&
        this.Attribute.attribute_from_value &&
        this.Attribute.attribute_to_value
      ) {
        this.Attribute.attribute_from_value = this.Attribute.attribute_from_value.endsWith(
          "%"
        ) ?
          this.Attribute.attribute_from_value.substring(
            0,
            this.Attribute.attribute_from_value.length - 1
          ) :
          this.Attribute.attribute_from_value;
        this.Attribute.attribute_to_value = this.Attribute.attribute_to_value.endsWith(
          "%"
        ) ?
          this.Attribute.attribute_to_value.substring(
            0,
            this.Attribute.attribute_to_value.length - 1
          ) :
          this.Attribute.attribute_to_value;
      }
      this.AddValidationRules();
    }, 0);

    this.isShowHistory = true;
  }

  // Function to transit the state to create new attribute
  PanelNewAttribute() {
    // Set message, error and attribute variables to null initially
    this.message = null;
    this.isSaveSuccess = false;
    this.error = null;
    this.ValidationError = null;
    this.isShowAdd = true;
    this.Attribute = {};
    this.Attribute.status_id = 200;
    this.Attribute.status = "Active";
    this.common.$state.go("common.prime.attributes.new");
    // Set the focus to description field on timeout
    this.common.$timeout(() => {
      angular.element("#description").focus();
    }, 0);
  }

  createAnotherAttribute() {
    this.PanelNewAttribute();
    this.Attribute.entity_id = this.oldAttributeValue.entity_id;
    this.Attribute.entity = this.oldAttributeValue.entity;
    this.Attribute.status_id = this.oldAttributeValue.status_id;
    this.Attribute.status = this.oldAttributeValue.status;
  }

  // Function for open configure udd panel
  openConfigureUddPanel(referedPage, attributeObject) {
    this.showConfigureUdd = true;
    this.common.$timeout(() => {
      angular.element("#select_item_type").focus();
    }, 2000);
    if (attributeObject && attributeObject.id) {
      this.attributeUdd = attributeObject;
    } else if (this.attributeId) {
      this.attributeUdd = _.clone(this.AttributesMap[this.attributeId]);
    }
    this.attributeUdd.referer = referedPage;
    this.exit();
  }

  // Function for close configure udd panel
  closeConfigureUddPanel() {
    this.common.$timeout(() => {
      angular.element("#inlineSearch").focus();
    }, 1000);
    this.showConfigureUdd = false;
    this.attributeUdd = {};
  }

  // Go to update state on click of cancel in delete form
  goToUpdateState() {
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    let id = this.$stateParams.id;
    this.common.$state.go("common.prime.attributes.update", {
      id: id
    });
    this.isShowHistory = true;
    this.common.$timeout(() => {
      angular.element("#description").focus();
    }, 1000);
  }

  assignMaxAndMinToValues(attribute) {
    attribute.min_to_value = Number(attribute.attribute_to_value.split(',')[0]);
    attribute.max_to_value = Number(attribute.attribute_to_value.split(',')[1]);
  }

  // Function to transit the state to update attribute by id
  PanelUpdateAttribute(attribute) {
    if (attribute.format.toLowerCase() === 'date range') {
      this.assignMaxAndMinToValues(attribute);
    }
    // Set message, error and history variables to null initially
    this.$scope.showhistory = false;
    this.isShowAdd = false;
    this.isShowHistory = true;
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    this.showConfigureUdd = false;
    this.message = null;
    this.error = null;
    this.updateBtnText = "Update";
    this.ValidationError = null;
    this.oldAttribute = _.clone(attribute);
    this.Attribute = _.clone(attribute);
    this.common.$state.go("common.prime.attributes.update", {
      id: attribute.id
    });

    // Set the focus to description field on timeout
    this.common.$timeout(() => {
      angular.element("#description").focus();
      if (
        this.Attribute &&
        this.Attribute.format &&
        this.Attribute.format.toLowerCase() === "percentage" &&
        this.Attribute.attribute_from_value &&
        this.Attribute.attribute_to_value
      ) {
        this.Attribute.attribute_from_value = this.Attribute.attribute_from_value.endsWith(
          "%"
        ) ?
          this.Attribute.attribute_from_value.substring(
            0,
            this.Attribute.attribute_from_value.length - 1
          ) :
          this.Attribute.attribute_from_value;
        this.Attribute.attribute_to_value = this.Attribute.attribute_to_value.endsWith(
          "%"
        ) ?
          this.Attribute.attribute_to_value.substring(
            0,
            this.Attribute.attribute_to_value.length - 1
          ) :
          this.Attribute.attribute_to_value;
      }
    }, 0);
  }

  // Function to transit the state to delete the selected attribute
  PanelDeleteAttribute(id) {
    this.message = null;
    this.error = null;
    // Variable to show confirm delete panel
    this.isConfirmDelete = true;
    this.isDeleteConfirmation = false;
    this.isShowHistory = false;
  }

  // How or hide column set flag
  ShowHideColumnSettings() {
    this.common.$timeout(() => {
      angular.element("#hide_show_column").focus();
    }, 1000);
    this.isColumnSettingsVisible = this.isColumnSettingsVisible ? false : true;
  }

  // After description tab out, set short description value same as description
  setDefaultShortDescription() {
    if (
      (this.Attribute.short_description === undefined ||
        this.Attribute.short_description === null ||
        this.Attribute.short_description.length === 0) &&
      !this.Attribute_form.short_description.$viewValue &&
      this.Attribute.description != null
    ) {
      // if (this.Attribute.description != null) {
      this.Attribute.short_description = this.Attribute.description.substring(
        0,
        29
      );
      //  }

      // this.Attribute.short_description = this.Attribute.description.substring(0, 29);
      // after setting short description, field is set as dirty stage
      this.Attribute_form.short_description.$setDirty();
    }
  }

  //  maxLengthCheck(object) {
  //   if (object.value.length > object.maxLength)
  //   object.value = object.value.slice(0, object.maxLength)
  // }

  hasUpdateChanges(object) {
    let omitKeys = [
      "dimension_unit",
      "dimension_class_id",
      "dimension_class",
      "default_dimension_unit"
    ];
    for (let key in object) {
      if (!omitKeys.includes(key)) {
        if (object[key] === this.oldAttribute[key]) {
          this.hasUpdateChange = false;
        } else {
          return (this.hasUpdateChange = true);
        }
      }
    }
    return this.hasUpdateChange;
  }

  // Request to create new attribute
  CreateAttribute() {
    // Set is processing flag to true till request is completed
    this.isProcessing = true;
    // Reset the inserted_id value if it exist
    this.Attribute_result_id = undefined;
    // Get standard date format for date selected if format is datepicker
    if (
      this.Attribute.ui_component.toLowerCase() === "datepicker" &&
      (
        this.Attribute.format.toLowerCase() === "date" ||
        this.Attribute.format.toLowerCase() === "date range"
      )
    ) {
      if (this.Attribute.format.toLowerCase() !== "date range") {
        this.Attribute.attribute_to_value = this.$scope.getDateBasedOnFormat(
          this.Attribute.attribute_to_value
        );
      } else {
        this.Attribute.attribute_to_value = `${this.Attribute.min_to_value},${this.Attribute.max_to_value}`
      }
      this.Attribute.attribute_from_value = this.$scope.getDateBasedOnFormat(
        this.Attribute.attribute_from_value
      );

      // If format is percentage concat to and from values with %
    } else if (this.Attribute.format.toLowerCase() === "percentage") {
      this.Attribute.attribute_to_value.includes("%") ?
        null :
        (this.Attribute.attribute_to_value = this.Attribute.attribute_to_value.concat(
          "%"
        ));
      this.Attribute.attribute_from_value.includes("%") ?
        null :
        (this.Attribute.attribute_from_value = this.Attribute.attribute_from_value.concat(
          "%"
        ));
    }
    // Set Attribute payload to create new Attribute
    let AttributePayLoad = {
      entity_id: this.Attribute.entity_id,
      format_id: this.Attribute.format_id,
      status_id: this.Attribute.status_id,
      description: this.Attribute.description,
      short_description: this.Attribute.short_description,
      as400_data_tag: this.Attribute.as400_data_tag,
      attribute_to_value: this.Attribute.attribute_to_value,
      attribute_from_value: this.Attribute.attribute_from_value,
      is_important: this.Attribute.is_important ? 1 : 0,
      dimension_unit_id: this.Attribute.dimension_unit_id
    };
    this.AttributeFactory.CreateAttribute(AttributePayLoad)
      .then(response => {
        this.oldAttributeValue = response.data;
        // Inserted record is added to existing attributes to show
        this.Attributes.data.push(response.data);
        if (response.data.has_values) {
          this.Attribute_result_id = response.data.id;
          this.viewValuesOption = true;
        } else {
          this.viewValuesOption = false;
        }
        this.attributeId = response.data.id;
        this.AttributesMap[response.data.id] = response.data;
        // Is processing flag is set to false
        this.isProcessing = false;
        this.rowsCount += 1;
        this.updateTableInformation(this.currentPage);
        // Set pristine and set form as untounched
        this.Attribute_form.$setPristine();
        this.Attribute_form.$setUntouched();
        // this.message = "New attribute created successfully.";
        this.isSaveSuccess = true;
        this.removeDimensionAttributesMap();
      })
      .catch(exception => {
        this.isProcessing = false;
        exception.status === 412 ?
          (this.error = exception.data.error.message) :
          (this.error = exception.data.error);
      });
    this.common.$timeout(() => {
      this.message = null;
      this.error = null;
    }, 3000);
  }

  // Request to update selected attribute
  UpdateAttribute() {
    // Set is processing flag to true till request is completed
    this.isProcessing = true;
    // Reset the inserted_id value if it exist
    this.Attribute_result_id = undefined;
    // Get standard date format for date selected if format is datepicker
    if (
      this.Attribute.ui_component.toLowerCase() === "datepicker" &&
      (
        this.Attribute.format.toLowerCase() === "date" ||
        this.Attribute.format.toLowerCase() === "date range"
      )
    ) {
      if (this.Attribute.format.toLowerCase() !== "date range") {
        this.Attribute.attribute_to_value = this.$scope.getDateBasedOnFormat(
          this.Attribute.attribute_to_value
        );
      } else {
        this.Attribute.attribute_to_value = `${this.Attribute.min_to_value},${this.Attribute.max_to_value}`
      }

      this.Attribute.attribute_from_value = this.$scope.getDateBasedOnFormat(
        this.Attribute.attribute_from_value
      );
    } else if (this.Attribute.format.toLowerCase() === "percentage") {
      // Concat % for to and from values if format is percentage
      this.Attribute.attribute_to_value.includes("%") ?
        null :
        (this.Attribute.attribute_to_value = this.Attribute.attribute_to_value.concat(
          "%"
        ));
      this.Attribute.attribute_from_value.includes("%") ?
        null :
        (this.Attribute.attribute_from_value = this.Attribute.attribute_from_value.concat(
          "%"
        ));
    }
    let attribute_value_count = this.AttributesMap[this.$stateParams.id]
      .attribute_value_count;
    // Update request with updated attribute payload
    this.updateBtnText = "Updating Now...";
    this.isBtnEnable = false;
    if (this.hasUpdateChanges(this.Attribute)) {
      this.$scope.showhistory = false; // close the history panel after update attribute
      this.AttributeFactory.UpdateAttribute(this.Attribute)
        .then(result => {
          if (result.data.has_values) {
            this.Attribute_result_id = result.data.id;
            this.viewValuesOption = true;
          } else {
            this.viewValuesOption = false;
          }
          this.attributeId = result.data.id;
          this.Attribute.has_values = result.data.has_values;
          // Find the attribute by index and set it with updated value
          let index = this.Attributes.data.findIndex(
            value => value.id === this.Attribute.id
          );
          this.Attributes.data[index] = this.Attribute;
          this.AttributesMap[this.Attribute.id] = this.Attribute;
          this.isBtnEnable = true;
          this.updateBtnText = "Done";
          this.isUpdateSuccess = true;
          this.isShowHistory = false;
          // Set is processing flag to false
          this.isProcessing = false;
          this.removeDimensionAttributesMap();
        })
        .catch(error => {
          this.updateBtnText = "Oops.!! Something went wrong";
          this.updateBtnError = true;
          this.isBtnEnable = false;
          this.isProcessing = false;
          if (error.status === 403) {
            this.isUnauthorized = true;
          } else {
            this.error = error.data.error.message || error.data.error.errors;
          }
          $timeout(() => {
            this.updateBtnError = false;
            this.updateBtnText = "Update";
          }, 2500);
        });
    } else {
      // Set is processing flag to false
      this.isProcessing = false;
      this.isBtnEnable = false;
      this.updateBtnText = "Nothing to update";
      this.updateBtnError = true;
      this.common.$timeout(() => {
        this.updateBtnText = "Update";
        this.updateBtnError = false;
        this.isBtnEnable = true;
      }, 1000);
    }
    this.common.$timeout(() => {
      this.isBtnEnable = true;
      this.updateBtnText = "Update";
      this.updateBtnError = false;
      this.message = null;
      this.error = null;
    }, 3000);
  }

  removeDimensionAttributesMap() {
    this.common.LocalMemory.API.Delete("DimensionAttributesMap");
  }

  // Request to delete selected attribute
  RemoveAttribute() {
    let id = this.$stateParams.id;
    this.isProcessing = true;
    this.AttributeFactory.DeleteAttribute(id)
      .then(result => {
        this.isProcessing = false;
        // Delete the object from attributes array after deletion
        this.Attributes.data = this.Attributes.data.filter(Attribute => {
          if (Attribute.id !== parseInt(id)) {
            return Attribute;
          }
        });
        this.isDeleteSuccess = true;
        this.isConfirmDelete = false;
        // Delete from attributes map
        delete this.AttributesMap[this.$stateParams.id];
        this.rowsCount -= 1;
        this.updateTableInformation(this.currentPage);
        this.message = "Attribute deleted successfully.";
        this.removeDimensionAttributesMap();
      })
      .catch(error => {
        this.isProcessing = false;
        if (error.status === 403) {
          this.isUnauthorized = true;
        } else if (error.data.type.toLowerCase() === "dependency check") {
          this.isDeleteConfirmation = true;
          this.isDeleteSuccess = false;
          this.isConfirmDelete = false;
        } else {
          this.error = error.data.error;
        }
      });
    this.common.$timeout(() => {
      this.message = null;
      this.error = null;
    }, 3500);
  }

  DeleteAttributeAndItsDependencies() {
    this.AttributeFactory.DeleteAttributeAndDependencies(this.$stateParams.id)
      .then(result => {
        this.isDeleteConfirmation = false;
        // Delete the object from attributes array after deletion
        this.Attributes.data = this.Attributes.data.filter(Attribute => {
          if (Attribute.id !== parseInt(this.$stateParams.id)) {
            return Attribute;
          }
        });
        this.isDeleteSuccess = true;
        this.isProcessing = false;
        this.isConfirmDelete = false;
        // Delete from attributes map
        delete this.AttributesMap[this.$stateParams.id];
        this.rowsCount -= 1;
        this.updateTableInformation(this.currentPage);
        this.message = "Attribute deleted successfully.";
      })
      .catch(error => {
        this.error = error;
        this.isProcessing = false;
      });
  }

  ProceedAttributeDeletion(Attribute) {
    this.isProcessing = true;
    if (this.entityIdMap[this.Attribute.entity_id]["uuid"] === 4) {
      this.ItemUDDService.API.DeleteItemUDDAndBridgeValuesByAttribute(
        Attribute.id
      )
        .then(response => {
          this.DeleteAttributeAndItsDependencies();
        })
        .catch(error => {
          console.log(error);
        });
        this.common.$timeout(() => {
          angular.element("#delete_panel").focus();
        }, 1000);
    } else if (this.entityIdMap[this.Attribute.entity_id]["uuid"] === 1) {
      this.LocationUDDService.API.DeleteLocationUDDAndBridgeValuesByAttribute(
        Attribute.id
      )
        .then(response => {
          this.DeleteAttributeAndItsDependencies();
        })
        .catch(error => {
          console.log(error);
        });
        this.common.$timeout(() => {
          angular.element("#delete_panel").focus();
        }, 1000);
    } else if (this.entityIdMap[this.Attribute.entity_id]["uuid"] === 9) {
      this.VendorUDDService.API.DeleteVendorUDDAndBridgeValuesByAttribute(
        Attribute.id
      )
        .then(response => {
          this.DeleteAttributeAndItsDependencies();
        })
        .catch(error => {
          console.log(error);
        });
        this.common.$timeout(() => {
          angular.element("#delete_panel").focus();
        }, 1000);
    } else if (this.entityIdMap[this.Attribute.entity_id]["uuid"] === 36) {
      this.MtoUDDService.API.DeleteMtoUDDAndBridgeValuesByAttribute(
        Attribute.id
      )
        .then(response => {
          this.DeleteAttributeAndItsDependencies();
        })
        .catch(error => {
          console.log(error);
        });
        this.common.$timeout(() => {
          angular.element("#delete_panel").focus();
        }, 1000);
    }
  }

  // Validate if from value is less than to
  ValidationFromTo() {
    this.ValidationError = null;
    if (this.Attribute.format.toLowerCase() === "date") {
      if (
        parseInt(
          moment(
            this.Attribute.attribute_from_value,
            this.SessionMemory.API.Get("user.preference.date.format")
          ).format("YYYYMMDD")
        ) >=
        parseInt(
          moment(
            this.Attribute.attribute_to_value,
            this.SessionMemory.API.Get("user.preference.date.format")
          ).format("YYYYMMDD")
        )
      ) {
        this.ValidationError = "To date should be greater than From date.";
      }
    }

    if (this.Attribute.format.toLowerCase() === "percentage") {
      parseInt(this.Attribute.attribute_from_value) > 100 ||
        parseInt(this.Attribute.attribute_to_value) > 100 ?
        (this.ValidationError = "Percentage value cannot exceed 100.") :
        null;
    }

    if (
      this.Attribute.format.toLowerCase() === "text" &&
      parseFloat(this.Attribute.attribute_from_value) >=
      parseFloat(this.Attribute.attribute_to_value)
    ) {
      this.ValidationError = "Max. Length should be greater than Min. Length.";
    }

    if (
      this.Attribute.format.toLowerCase() !== "date" &&
      this.Attribute.format.toLowerCase() !== "date range" &&
      this.Attribute.format.toLowerCase() !== "percentage" &&
      this.Attribute.format.toLowerCase() !== "text" &&
      this.Attribute.attribute_from_value &&
      this.Attribute.attribute_to_value &&
      (parseInt(this.Attribute.attribute_from_value) >
        parseInt(this.Attribute.attribute_to_value) ||
        parseFloat(this.Attribute.attribute_from_value) >=
        parseFloat(this.Attribute.attribute_to_value))
    ) {
      this.ValidationError = "To value should be greater than From value.";
    }
  }

  // Fetch available dimension classes
  FetchDimensionClass() {
    this.AttributeFactory.FetchDimensionClasses()
      .then(response => {
        this.DimensionClasses = response.data;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Fetch available dimension classes
  GetDimensionUnitAndClassByUnitID(unitId) {
    this.AttributeFactory.FetchDimensionUnitAndClassByUnitID(unitId)
      .then(response => {
        this.Attribute.dimension_unit = response.data[0].dimension_unit;
        this.Attribute.dimension_class_id = response.data[0].dimension_class_id;
        this.Attribute.dimension_class = response.data[0].dimension_class;
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Fetch available dimension units for given class
  GetDimensionUnitsForClass(classId) {
    this.AttributeFactory.FetchDimensionUnitsForClass(classId)
      .then(response => {
        this.DimensionClassUnits = response.data;
        // Get default dimension unit and set it to unit variable to show on default
        this.Attribute.default_dimension_unit = this.DimensionClassUnits.filter(
          DimensionClassUnit => DimensionClassUnit.is_default === 1
        );
        // this.Attribute.dimension_unit_id = this.Attribute.default_dimension_unit[0].id;
        // setting the class text value in to and from fields
        this.setDimensionClassText(classId);
      })
      .catch(error => {
        this.logger.error(error);
      });
  }

  // Go to view attributes page
  exit() {
    this.Attribute = null;
    this.isDeleteSuccess = false;
    this.isUpdateSuccess = false;
    this.isSaveSuccess = false;
    this.isConfirmDelete = false;
    this.isDeleteConfirmation = false;
    this.common.$state.go("common.prime.attributes");
    this.isUnauthorized = false;
    this.common.$timeout(() => {
      angular.element("#inlineSearch").focus();
      },1000)
  }

  // Get changes made to a record - previous and updated values
  FetchHistory() {
    // Loading history until get the response
    this.$scope.showhistoryloading = true;
    this.common.EntityDetails.API.GetHistoryData(
      this.uuid,
      this.$stateParams.id
    )
      .then(response => {
        this.$scope.historyList = response;
        this.$scope.showhistory = true;
        this.$scope.showhistoryloading = false;
      })
      .catch(error => {
        logger.error(error);
      });
  }

  // Function to close the history panel
  CloseHistoryPanel() {
    this.common.$timeout(() => {
      angular.element("#description").focus();
    }, 1000)
    this.$scope.showhistory = false;
    this.$scope.showhistoryloading = false;
  }

  cancelDeleteDependency() {
    this.common.$timeout(() => {
      angular.element("#description").focus();
      },1000)
  }

  // Reset filter search filter objects to null or empty to clear the filters applied
  ResetFilters() {
    this.applyFiltersBtn = false;
    this.applyFilterMessage = null;
    this.filters.entityIds = [];
    this.filters.statusIds = [];
    this.filters.formatIds = [];
    this.is_important = 0;
    this.filters["description"] = null;
    this.old_filters = {};
    this.applyFilterSuccess = true;
    this.filters.is_important = 0;
    this.applyFiltersBtnLabel = "Apply Filters";
    this.closeFilterPanel();
    if (this.isFilterApplied) {
      this.ViewAttributes();
    } else {
      this.isFilterApplied = false;
      this.resetFilterBtn = false;
    }
  }

  closeFilterPanel() {
    if ($("#advanced-search").hasClass("in")) {
      this.successMessage = null;
      $("#advanced-search").collapse("hide");
    }
  }

  // Get the attributes matching applied filters
  ApplyFilters() {
    this.successMessage = null;
    this.applyFilterSuccess = true;
    this.isProcessing = true;
    this.applyFilterMessage = null;
    //  check whether filters are applied or not
    if (this.old_filters === undefined && !Object.keys(this.filters).length) {
      this.applyFilterSuccess = false;
      this.isProcessing = false;
      this.applyFilterMessage =
        "* Please select atleast one filter to search relevant attributes";
    } // check whether filters are checked or not
    else if (
      this.old_filters === undefined &&
      (!this.filters.formatIds || !this.filters.formatIds.length) &&
      (!this.filters.statusIds || !this.filters.statusIds.length) &&
      (!this.filters.entityIds || !this.filters.entityIds.length) &&
      !this.filters.is_important
    ) {
      this.applyFilterSuccess = false;
      this.isProcessing = false;
      this.applyFilterMessage =
        "* Please select atleast one filter to search relevant attributes";
    }
    // check whether filters are applied and applied filter is equal to old filter
    else if (
      angular.equals(this.old_filters, this.filters) &&
      this.old_filters &&
      Object.keys(this.old_filters).length
    ) {
      this.applyFilterSuccess = false;
      this.isProcessing = false;
      this.applyFilterMessage =
        "* Search results already found for selected filters";
    } else if (
      this.old_filters &&
      Object.keys(this.old_filters).length &&
      (!this.filters.formatIds || !this.filters.formatIds.length) &&
      (!this.filters.statusIds || !this.filters.statusIds.length) &&
      (!this.filters.entityIds || !this.filters.entityIds.length) &&
      !this.filters.is_important
    ) {
      // if old filters are there but it is unchecked, then remove the filters and go back to attribute list
      this.isProcessing = false;
      this.applyFilterSuccess = false;
      this.ViewAttributes();
    } else if (
      this.old_filters &&
      this.old_filters !== undefined &&
      (!this.filters.formatIds || !this.filters.formatIds.length) &&
      (!this.filters.statusIds || !this.filters.statusIds.length) &&
      (!this.filters.entityIds || !this.filters.entityIds.length) &&
      !this.filters.is_important
    ) {
      // if old filters are there but it is unchecked, then remove the filters and go back to attribute list
      this.isProcessing = false;
      this.applyFilterSuccess = false;
      this.applyFilterMessage =
        "* Please select atleast one filter to search relevant attributes";
    } else {
      // If filters are applied, get the attribute matching applied filters
      this.applyFiltersBtnLabel = "Applying Filters...";
      this.AttributeFactory.FetchFilteredAttributes(this.filters)
        .then(response => {
          this.old_filters = angular.copy(this.filters);
          this.Attributes.data = response.data;
          this.rowsCount = response.data.length;
          this.isFilterApplied = true;
          this.successMessage = "Filter applied successfully!";
          this.updateTableInformation(1);
          this.applyFiltersBtnLabel = "Apply Filters";
          this.isProcessing = false;
          this.applyFilterSuccess = true;
          this.getFilterCount();
          this.common.$timeout(() => {
            this.successMessage = null;
            this.closeFilterPanel();
          }, 800);
        })
        .catch(error => {
          this.applyFiltersBtnLabel = "Apply Filters";
          this.logger.error(error);
        });
    }
  }

  // Calculate filter count
  getFilterCount() {
    this.appliedFilterCount = 0;
    this.filters.entityIds && this.filters.entityIds.length ?
      this.appliedFilterCount++
      :
      "";
    this.filters.statusIds && this.filters.statusIds.length ?
      this.appliedFilterCount++
      :
      "";
    this.filters.formatIds && this.filters.formatIds.length ?
      this.appliedFilterCount++
      :
      "";
    this.filters.is_important ? this.appliedFilterCount++ : "";
  }

  // Get the model and validation rules for attribute create and update
  GetModelAndSetValidationRules() {
    this.common.EntityDetails.API.GetModelAndSetValidationRules(
      this.uuid
    ).then(model => { });
  }

  // Check if selected attribute format has values or to and from values
  HasValues(formatId) {
    this.ValidationError = null;
    // Selected Dimension unit Variable is reset on change of the format
    this.selectedDimensionUnit = "";
    // Selected Dimension class Variable is reset on change of the format
    this.selectedDimensionClass = "";
    // Set from and to values to null on change of attribute format
    let Format = this.Formats.filter(Format => Format.id === formatId);
    this.Attribute.attribute_from_value = null;
    this.Attribute.attribute_to_value = null;
    this.Attribute.ui_component = Format[0].ui_component;
    this.Attribute.format = Format[0].format;
    this.Attribute.format.toLowerCase() === "dimension" ?
      (this.Attribute.dimension_class_id = null) :
      null;
    // Add vaildation rules based on format selected
    this.AddValidationRules();
  }

  // Set validation rules for different format selected
  AddValidationRules() {
    let obj = {};
    if (
      this.Attribute_form &&
      this.Attribute_form.attribute_from_value &&
      this.Attribute_form.attribute_to_value
    ) {
      this.Attribute_form.attribute_from_value.$setUntouched();
      this.Attribute_form.attribute_to_value.$setUntouched();
    }
    let getConstraint = this.valdr.getConstraints()["RULES-21"];
    if (
      this.Attribute &&
      this.Attribute.format &&
      this.Attribute.format.toLowerCase() === "integer"
    ) {
      (getConstraint["attribute_from_value"] = {
        digits: {
          integer: 10,
          message: "From must be an integer"
        },
        required: {
          message: "From is required!"
        }
      }),
        (getConstraint["attribute_to_value"] = {
          digits: {
            integer: 10,
            message: "To must be an integer"
          },
          required: {
            message: "To is required!"
          }
        });
      obj["RULES-21"] = getConstraint;
    } else if (
      this.Attribute &&
      this.Attribute.format &&
      this.Attribute.format.toLowerCase() === "number select"
    ) {
      (getConstraint["attribute_from_value"] = {
        digits: {
          integer: 10,
          message: "From must be an integer"
        },
        required: {
          message: "From is required!"
        }
      }),
        (getConstraint["attribute_to_value"] = {
          digits: {
            integer: 10,
            message: "To must be an integer"
          },
          required: {
            message: "To is required!"
          }
        });
      obj["RULES-21"] = getConstraint;
    } else if (
      this.Attribute &&
      this.Attribute.format &&
      this.Attribute.format.toLowerCase() === "percentage"
    ) {
      (getConstraint["attribute_from_value"] = {
        pattern: {
          value: /^[0-9]+%?$/,
          message: "From must be a number"
        },
        required: {
          message: "From is required!"
        }
      }),
        (getConstraint["attribute_to_value"] = {
          pattern: {
            value: /^[0-9]+%?$/,
            message: "To must be a number"
          },
          required: {
            message: "To is required!"
          }
        });
      obj["RULES-21"] = getConstraint;
    } else if (
      this.Attribute &&
      this.Attribute.format &&
      this.Attribute.format.toLowerCase() === "decimal"
    ) {
      (getConstraint["attribute_from_value"] = {
        digits: {
          integer: 10,
          fraction: 10,
          message: "From must be decimal"
        },
        required: {
          message: "From is required!"
        }
      }),
        (getConstraint["attribute_to_value"] = {
          digits: {
            integer: 10,
            fraction: 10,
            message: "To must be decimal"
          },
          required: {
            message: "To is required!"
          }
        });
      obj["RULES-21"] = getConstraint;
    } else if (
      this.Attribute &&
      this.Attribute.format &&
      this.Attribute.format.toLowerCase() === "dimension"
    ) {
      (getConstraint["attribute_from_value"] = {
        digits: {
          integer: 10,
          fraction: 10,
          message: "From must be a number"
        },
        required: {
          message: "From is required!"
        }
      }),
        (getConstraint["attribute_to_value"] = {
          digits: {
            integer: 10,
            fraction: 10,
            message: "To must be a number"
          },
          required: {
            message: "To is required!"
          }
        });
      obj["RULES-21"] = getConstraint;
    } else if (
      this.Attribute &&
      this.Attribute.format &&
      this.Attribute.format.toLowerCase() === "text"
    ) {
      (getConstraint["attribute_from_value"] = {
        digits: {
          integer: 5,
          message: "Min. Length must be an integer between 1 and 249"
        },
        min: {
          value: 1,
          message: "Min. Length must be an integer between 1 and 249"
        },
        max: {
          value: 249,
          message: "Min. Length must be an integer between 1 and 249"
        },
        required: {
          message: "Min. Length is required!"
        }
      }),
        (getConstraint["attribute_to_value"] = {
          digits: {
            integer: 5,
            message: "Max. Length must be an integer between 2 and 250"
          },
          min: {
            value: 2,
            message: "Max. Length must be an integer between 2 and 250"
          },
          max: {
            value: 250,
            message: "Max. Length must be an integer between 2 and 250"
          },
          required: {
            message: "Max. Length is required!"
          }
        });
      obj["RULES-21"] = getConstraint;
    } else if (
      this.Attribute &&
      this.Attribute.format &&
      (this.Attribute.format.toLowerCase() === "date" || this.Attribute.format.toLowerCase() === "date range")
    ) {
      delete getConstraint.attribute_from_value;
      delete getConstraint.attribute_to_value;
      obj["RULES-21"] = getConstraint;
    }
    this.valdr.addConstraints(obj);
  }

  // Get the attributes indexes to show number of attributes displayed per page
  pageChangeHandler(num) {
    this.currentPage = num;
    this.updateTableInformation(num);
  }

  // show table information like no. of records with or without search filter.
  updateTableInformation(currentPage) {
    let initalCount;
    if (this.rowsCount === 0) {
      initalCount = 0;
    } else {
      initalCount = 1;
    }
    if (currentPage === 1) {
      this.rowsInfo =
        "Displaying " +
        initalCount +
        "-" +
        (this.rowsCount < this.pageSize ? this.rowsCount : this.pageSize) +
        " Of " +
        this.rowsCount +
        " Records";
    } else {
      var start =
        parseInt(currentPage) * parseInt(this.pageSize) -
        parseInt(this.pageSize) +
        1;
      var end =
        parseInt(currentPage) * parseInt(this.pageSize) -
        parseInt(this.pageSize) +
        parseInt(this.pageSize);
      this.rowsInfo =
        "Displaying " +
        start +
        " - " +
        (end < this.rowsCount ? end : this.rowsCount) +
        " Of " +
        this.rowsCount +
        " Records";
    }
  }

  // set the text value for unit in the from and to text fields based on selection
  setDimensionUnitText(unitId) {
    let unit = this.DimensionClassUnits.filter(unit => {
      return unit.id == unitId;
    });
    this.selectedDimensionUnit = unit[0].description;
  }

  // set the text value for class in the from and to text fields based on selection
  setDimensionClassText(classId) {
    let dimensionClass = this.DimensionClasses.filter(dimensionClass => {
      return dimensionClass.id == classId;
    });
    this.selectedDimensionClass = dimensionClass[0].description;
  }
}

angular
  .module("rc.prime.attributes")
  .controller("AttributeController", AttributeController);
