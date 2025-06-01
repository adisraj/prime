(function() {
  "use strict";
  angular
    .module("rc.prime.template")
    .controller("ToolbarTemplateController", ToolbarTemplateController);
  ToolbarTemplateController.$inject = [
    "$scope",
    "common",
    "HierarchyValueService",
    "TemplateService",
    "LocationFactory",
    "valdr"
  ];

  function ToolbarTemplateController(
    $scope,
    common,
    HierarchyValueService,
    TemplateService,
    LocationFactory,
    valdr
  ) {
    let vm = this;

    /** Form Actions */
    vm.saveBtnText = "Save";
    vm.saveBtnError = false;
    vm.isSaveSuccess = false;
    vm.updateBtnText = "Update";
    vm.updateBtnError = false;
    vm.isUpdateSuccess = false;
    vm.isConfirmDelete = false;
    vm.isDeleteSuccess = false;
    vm.isShowTabDetails = false;
    vm.sortType = "template_name";
    //variable to show the preview of tabs
    vm.showPreview = false;
    vm.isLoaded = true;
    vm.nodesDetails = [];
    vm.currentPage = 1;
    vm.pageSize = 10;
    vm.template_toolbar_uuid = 119;
    $scope.apiInstanceDisplayValues = TemplateService.API.UpdateToolbarTabById;
    /** Common Modules */
    let logger = common.Logger.getInstance("ToolbarTemplateController");
    let $timeout = common.$timeout;
    let $q = common.$q;
    // Variable used to show move up down columns
    vm.showmoveupdown = true;

    /** Activate toolbar template controller */
    vm.activate = () => {
      vm.fetchLocations();
      vm.getModelAndSetValidationRules(vm.template_toolbar_uuid);
      $scope.getAccessPermissions(vm.template_toolbar_uuid);
    };

    // unction to toggle move up/down rows arrow column
    vm.toggleColumn = flag => {
      vm.showmoveupdown = flag;
    };

    /** Funtional operations on templates start*/
    vm.getTemplates = refresh => {
      if (refresh !== undefined) {
        vm.totalRecords = "";
        vm.totalTimeText = "";
        vm.isRefreshTable = true;
        vm.refreshTableText = "Table is refreshing...";
      }
      vm.templates = [];
      vm.isLoaded = false;
      TemplateService.API.GetTemplates()
        .then(response => {
          vm.templates = response.data;
          vm.rowsCount = response.data.length;
          if (refresh !== undefined) {
            vm.refreshTableText = "Table is refreshing...";
            vm.totalRecords = response.data.length;
            vm.totalRecordsText = "record(s) loaded in approximately";
            vm.totalTimeText =
              "<strong>" +
              response.time_taken +
              "</strong><span class='f-14 c-gray'> seconds</span>";
            vm.refreshTableText = "Successfully refreshed";
            $timeout(() => {
              vm.isRefreshTable = false;
            }, 3500);
          }
          vm.isLoaded = true;
          vm.mapLocations();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.mapLocations = () => {
      for (let i = 0; i < vm.templates.length; i++) {
        for (let j = 0; j < vm.locations.length; j++) {
          if (vm.templates[i].location_id === vm.locations[j].id) {
            vm.templates[i].location = vm.locations[j].name;
          }
        }
      }
    };

    // get validation rules
    vm.getModelAndSetValidationRules = uuid => {
      common.EntityDetails.API.GetModelAndSetValidationRules(
        uuid
      ).then(model => {});
    };

    vm.saveTemplate = template_details => {
      template_details.location_ids = vm.locationIds;
      vm.saveBtnText = "Saving...";
      vm.isProcessing = true;
      TemplateService.API.CreateTemplate(template_details)
        .then(response => {
          vm.isProcessing = false;
          vm.isSaveSuccess = true;
          vm.saveBtnText = "Save";
          for (
            let index = 0;
            index < template_details.location_ids.length;
            index++
          ) {
            const newTemplateLocatoin = {
              id: response.data.inserted_id,
              template_id: response.data.inserted_id,
              template_name: template_details.template_name,
              active_from: template_details.active_from,
              status: 1,
              location_id: template_details.location_ids[index].id
            };
            vm.rowsCount++;
            vm.templates.push(newTemplateLocatoin);
          }
          vm.mapLocations();
        })
        .catch(error => {
          vm.isProcessing = false;
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.error = error.data.message || error.data.error;
          common.$timeout(function() {
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
            vm.error = null;
          }, 3500);
          logger.error(error);
        });
    };

    //Check if the current update payload is different from the old payload
    vm.hasUpdateChanges = payload => {
      //Initialise hasupdate variable to false initially
      let hasUpdateChanges = false;
      // Get the location ids array for the current locations set for template
      const currentLocations = vm.locationIds.map(x => x.id);
      // Get the old location ids array for the old locations set for template
      const oldLocations = vm.oldLocationIds.map(x => x.id);
      //Get the difference between the two arrays
      let diff = _.difference(currentLocations, oldLocations);
      for (let key in payload) {
        //Check if the payload changes and if there are any changes to the array
        if (payload[key] !== vm.oldTemplateDetails[key] || diff.length > 0) {
          // If any changes are made, return true else return false
          return true;
        }
      }
      //Return hasupdate variable
      return hasUpdateChanges;
    };

    vm.updateTemplate = template_details => {
      for (let index = 0; index < vm.locationIds.length; index++) {
        for (let oldIndex = 0; oldIndex < vm.locationIds.length; oldIndex++) {
          if (
            vm.oldLocationIds[index] &&
            vm.locationIds[oldIndex].id === vm.oldLocationIds[index].id
          ) {
            vm.locationIds[index].status = vm.oldLocationIds[index].status;
          }
        }
      }
      //Check if the payload has any changes made to template object
      if (vm.hasUpdateChanges(template_details)) {
        template_details.location_ids = vm.locationIds;
        vm.updateBtnText = "Updating...";
        vm.isProcessing = true;
        let dataToSave = angular.copy(template_details);
        dataToSave.active_from = $scope.getFormattedDate(
          template_details.active_from
        );
        TemplateService.API.UpdateTemplate(dataToSave)
          .then(response => {
            vm.isProcessing = false;
            vm.updateBtnText = "Update";
            vm.isUpdateSuccess = true;
            for (let index = 0; index < vm.oldLocationIds.length; index++) {
              vm.templates.splice(
                vm.templates.findIndex(
                  template =>
                    Number(template.id) === Number(template_details.id) &&
                    Number(template.location_id) ===
                      Number(vm.oldLocationIds[index].id)
                ),
                1
              );
              vm.rowsCount--;
            }
            for (
              let index = 0;
              index < template_details.location_ids.length;
              index++
            ) {
              const newTemplateLocatoin = {
                id: template_details.id,
                template_id: template_details.id,
                template_name: template_details.template_name,
                active_from: template_details.active_from,
                status:
                  template_details.location_ids[index].status !== undefined
                    ? template_details.location_ids[index].status
                    : 1,
                location_id: template_details.location_ids[index].id
              };
              vm.rowsCount++;
              vm.templates.push(newTemplateLocatoin);
            }
            vm.mapLocations();
          })
          .catch(error => {
            vm.isProcessing = false;
            vm.updateBtnText = "Oops.!! Something went wrong";
            vm.updateBtnError = true;
            vm.error = error.data.message || error.data.error;
            common.$timeout(() => {
              vm.updateBtnText = "Update";
              vm.updateBtnError = false;
              vm.error = null;
            }, 3500);
            logger.error(error);
          });
      } else {
        // Else set nothing to update error message
        vm.isProcessing = false;
        vm.updateBtnText = "Nothing to update";
        vm.updateBtnError = true;
        common.$timeout(() => {
          vm.updateBtnText = "Update";
          vm.updateBtnError = false;
          vm.error = null;
        }, 3000);
      }
    };

    vm.updateStatus = template_details => {
      template_details.status = template_details.status ? 0 : 1;
      vm.isProcessing = true;
      TemplateService.API.UpdateTemplateLocation(template_details)
        .then(response => {
          vm.isProcessing = false;
        })
        .catch(error => {
          vm.isProcessing = false;
          vm.error = error.data.message || error.data.error;
          common.$timeout(() => {
            vm.error = null;
          }, 3500);
          logger.error(error);
        });
    };

    vm.showconfirm = () => {
      vm.isConfirmDelete = true;
    };

    vm.deleteTemplate = template_id => {
      TemplateService.API.DeleteTemplate(template_id)
        .then(response => {
          if (response.status === 200) {
            vm.isConfirmDelete = false;
            vm.isDeleteSuccess = true;
            for (let index = 0; index < vm.oldLocationIds.length; index++) {
              vm.templates.splice(
                vm.templates.findIndex(
                  template =>
                    Number(template.id) === Number(template_id) &&
                    Number(template.location_id) ===
                      Number(vm.oldLocationIds[index].id)
                ),
                1
              );
              vm.rowsCount--;
            }
          } else if (response.data.status !== 200) {
            vm.error = "Error in template deletion";
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.showTabNodePanel = tab_id => {
      vm.showTabItemsPanel = true;
      vm.isShowTabDetails = true;
      vm.isSaveSuccess = false;
      vm.department_class_details = {};
      vm.tabId = tab_id;
      vm.getTabItems();
    };

    vm.createAnotherForm = () => {
      vm.isSaveSuccess = false;
      vm.department_class_details = {};
    };

    vm.getTabItems = () => {
      vm.tabItems = [];
      TemplateService.API.GetTabItemsByTabId(vm.tabId)
        .then(response => {
          vm.tabItems = response.data;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.prepareDropDown = (entityName, nodes) => {
      vm.classMap = [];
      if (entityName.toLowerCase() === "department" && entityName) {
        let departmentIds = {};
        vm.departmentsMap = [];

        for (let i = 0; i < vm.tabItems.length; i++) {
          if (departmentIds[vm.tabItems[i].node_id] === undefined) {
            departmentIds[vm.tabItems[i].node_id] = vm.tabItems[i].node_id;
          }
        }

        for (let i = 0; i < vm.departments.length; i++) {
          if (departmentIds[vm.departments[i].id] === undefined) {
            vm.departmentsMap.push(vm.departments[i]);
          }
        }
      } else if (entityName.toLowerCase() === "class" && entityName) {
        let classIds = {};

        for (let i = 0; i < vm.tabItems.length; i++) {
          if (classIds[vm.tabItems[i].node_id] === undefined) {
            classIds[vm.tabItems[i].node_id] = vm.tabItems[i].node_id;
          }
        }

        for (let i = 0; i < vm.classes.length; i++) {
          if (classIds[vm.classes[i].id] === undefined) {
            vm.classMap.push(vm.classes[i]);
          }
        }
      } else {
       
      }

      vm.selectAllClass(true);
    };

    /* Get product explorer hierarchy values list */
    vm.showPEHierarchyValues = () => {
      if (!vm.nodesDetails || !vm.nodesDetails.length) {
        TemplateService.API.GetNodes()
          .then(response => {
            // Key-value map of hierarchy value id and data
            vm.hierarchyValuesMap = JSON.parse(response.lookup);

            // Division/Department/Class tree structure
            vm.nodesDetails = response.results;
          })
          .catch(error => {
            logger.error(error);
          });
      }
    };

    vm.selectAllClass = select_all => {
      vm.selectedClasses = [];
      for (let i = 0; i < vm.classMap.length; i++) {
        let cls = vm.classMap[i];
        if (select_all) {
          vm.selectedClasses[cls.id] = true;
        } else {
          delete vm.selectedClasses[cls.id];
        }
      }
    };

    vm.changeValue = (class_id, skuValue) => {
      if (!skuValue) {
        delete vm.selectedClasses[class_id];
        if (Object.keys(vm.selectedClasses).length > 0) {
          vm.select_all = false;
        } else if (Object.keys(vm.selectedClasses).length === 0) {
          vm.select_all = false;
        }
      }
    };

    // function to add new items under a tab
    vm.saveTabItems = payload => {
      payload.tab_id = vm.tabId;
      vm.saveBtnText = "Saving...";
      vm.errorMessage = null;
      vm.message = null;
      vm.isProcessing = true;
      $q.all(addItems(payload))
        .then(response => {
          vm.saveBtnText = "Save";
          vm.isProcessing = false;
          vm.getTabItems();
          vm.department_class_details = {};
          vm.message = "Tab contents added successfully!";
          common.$timeout(() => {
            vm.message = null;
          }, 3500);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          }
          vm.isProcessing = false;
          vm.saveBtnText = "Oops.!! Something went wrong";
          vm.saveBtnError = true;
          vm.errorMessage = error.data.error;
          common.$timeout(() => {
            vm.saveBtnText = "Save";
            vm.saveBtnError = false;
            vm.errorMessage = null;
          }, 3500);
        });
    };

    let addItems = payload => {
      let promises = [];
      if (Object.keys(vm.selectedClasses).length > 0) {
        for (var key in vm.selectedClasses) {
          if (
            vm.selectedClasses.hasOwnProperty(key) &&
            vm.selectedClasses[key] === true
          ) {
            let object = {
              nodes: [{ id: key }],
              tab_id: payload.tab_id
            };
            promises.push(createTabItem(object));
          }
        }
      } else {
        let object = {
          nodes: [{ id: payload.department_id }],
          tab_id: payload.tab_id
        };
        promises.push(createTabItem(object));
      }
      return promises;
    };

    let createTabItem = payload => {
      let d = $q.defer();
      TemplateService.API.InsertTabItem(payload)
        .then(res => {
          d.resolve({ success: true });
        })
        .catch(error => {
          d.reject(error);
        });
      return d.promise;
    };

    vm.deleteTabItem = payload => {
      vm.itemsErrorMessage = null;
      vm.itemsMessage = null;
      TemplateService.API.RemoveTabItem(vm.tabId, payload.node_id)
        .then(response => {
          vm.getTabItems();
          vm.department_class_details = {};
          vm.itemsMessage = "Tab item deleted successfully!";
        })
        .catch(error => {
          logger.error(error);
          vm.itemsErrorMessage = "Unable to delete item tab!";
        });

      $timeout(() => {
        vm.itemsErrorMessage = null;
        vm.itemsMessage = null;
      }, 3500);
    };

    vm.selectedChildren = [];

    function checkNode(subhierarchy) {
      for (let i = 0; i < subhierarchy.length; i++) {
        vm.loadNodes(subhierarchy[i]);
      }
    }

    vm.pushNode = node => {
      vm.selectedNode = node;
      if (node.checked) {
        if (node.nodes.length === 0) {
          vm.selectedChildren.push(node);
        } else {
          //calling recursively to reach the node's last children and add to model
          add(node.nodes);

          function add(nodes) {
            nodes.forEach(node => {
              if (node.nodes.length === 0) {
                vm.selectedChildren.push(node);
              } else {
                add(node.nodes);
              }
            });
          }
        }
      } else {
        if (node.nodes.length === 0) {
          vm.selectedChildren.forEach(data => {
            if (data.id === node.id) {
              vm.selectedChildren.splice(vm.selectedChildren.indexOf(data), 1);
            }
          });
        } else {
          //calling recursively to reach the node's last children and remove to model
          remove(node.nodes);

          function remove(nodes) {
            nodes.forEach(node => {
              if (node.nodes.length === 0) {
                vm.selectedChildren.forEach(data => {
                  if (data.id === node.id) {
                    vm.selectedChildren.splice(
                      vm.selectedChildren.indexOf(data),
                      1
                    );
                  }
                });
              } else {
                remove(node.nodes);
              }
            });
          }
        }
      }
      vm.selectedChildren = vm.selectedChildren.filter((item, pos) => {
        return vm.selectedChildren.indexOf(item) == pos;
      });
    };

    vm.addNodeToTab = selectedChildren => {
      let nodeArray = {
        nodes: selectedChildren
      };
      vm.isProcessing = true;
      TemplateService.API.AddNodeToTab(vm.tab_id, nodeArray)
        .then(response => {
          if (response.status === 201) {
            vm.message = "Added hierarchy to tab succesfully";
            vm.isProcessing = false;
          }
        })
        .catch(error => {
          if (error.status === 505) {
            vm.error = error.data;
            vm.isProcessing = false;
          }
          logger.error(error);
        });
    };

    vm.openTemplatePanel = () => {
      vm.function = "Create";
      vm.template_details = {};
      vm.isShowTemplateForm = true;
      vm.isAddTemplate = true;
      vm.saveBtnError = false;
      vm.updateBtnError = false;
      vm.message = "";
      vm.template_form.$setPristine();
      vm.setInitialState("Toolbar");
    };

    // Function to highlight selected row in table
    vm.setClickedRow = index => {
      vm.selectedRow = index;
    };

    /// function to fetch locations list
    vm.fetchLocations = () => {
      vm.locations = [];
      LocationFactory.API.GetLocations()
        .then(response => {
          vm.locations = response.data.data;
          // variables to hold location ids while create template
          vm.locationIds = [];
          vm.templateLocationIdsMap = {};
          vm.getTemplates();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    /**
     * @description - toggleAddOrRemoveLocationFromMap() will redirect for add or remove functionality based on isAdd flag.
     */
    vm.toggleAddOrRemoveLocationFromMap = (flagName, location) => {
      if (
        flagName &&
        flagName.toLowerCase() === "toggleall" &&
        vm.locations.length > vm.locationIds.length
      ) {
        vm.locationIds = [];
        vm.templateLocationIdsMap = {};
        for (
          let locationIndex = 0;
          locationIndex < vm.locations.length;
          locationIndex++
        ) {
          vm.templateLocationIdsMap[vm.locations[locationIndex].id] = {
            id: vm.locations[locationIndex].id,
            name: vm.locations[locationIndex].name
          };
          vm.locationIds.push({
            id: vm.locations[locationIndex].id,
            name: vm.locations[locationIndex].name
          });
        }
      } else if (flagName && flagName.toLowerCase() === "toggleall") {
        vm.locationIds = [];
        vm.templateLocationIdsMap = {};
      } else {
        if (vm.templateLocationIdsMap[location.id] === undefined) {
          vm.templateLocationIdsMap[location.id] = {
            id: location.id,
            name: location.name
          };
          vm.locationIds.push({ id: location.id, name: location.name });
        } else {
          delete vm.templateLocationIdsMap[location.id];
          vm.locationIds.splice(
            vm.locationIds.findIndex(
              locationObject =>
                Number(locationObject.id) === Number(location.id)
            ),
            1
          );
        }
      }
    };

    vm.closeTemplatePanel = () => {
      vm.isShowTemplateForm = false;
      vm.locationIds = [];
      vm.templateLocationIdsMap = {};
      common.$timeout(() => {
        vm.message = "";
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    //set focus on first field in form
    vm.setInitialState = entityName => {
      common.$timeout(() => {
        if (entityName && entityName.toLowerCase() === "toolbar") {
          angular.element("#template_name").focus();
        } else if (entityName && entityName.toLowerCase() === "toolbar tab") {
          angular.element("#display_name").focus();
        }
      }, 0);
    };

    vm.createAnotherTemplate = () => {
      vm.function = "Create";
      vm.isShowTemplateForm = true;
      vm.isAddTemplate = true;
      vm.isConfirmDelete = false;
      vm.isSaveSuccess = false;
      vm.template_details = {};
      vm.locationIds = [];
      vm.templateLocationIdsMap = {};
    };

    vm.dblClickAction = (data, entityName) => {
      if (entityName && entityName.toLowerCase() === "toolbar") {
        vm.locationIds = [];
        vm.oldLocationIds = [];
        vm.templateLocationIdsMap = {};
        vm.templates.filter(templateData => {
          if (
            vm.templateLocationIdsMap[templateData.location_id] === undefined &&
            parseInt(data.template_id) === parseInt(templateData.template_id)
          ) {
            vm.templateLocationIdsMap[templateData.location_id] = {
              id: templateData.location_id,
              location: templateData.location
            };
            vm.locationIds.push({
              id: templateData.location_id,
              location: templateData.location,
              status: templateData.status
            });
            vm.oldLocationIds.push({
              id: templateData.location_id,
              location: templateData.location,
              status: templateData.status
            });
          }
        });
        vm.function = vm.updateBtnText = "Update";
        vm.isAddTemplate = false;
        data.active_from = $scope.getDateBasedOnFormat(data.active_from);
        vm.template_details = angular.copy(data);
        vm.oldTemplateDetails = angular.copy(vm.template_details);
        vm.isConfirmDelete = false;
        vm.isSaveSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isDeleteSuccess = false;
        vm.isShowTemplateForm = true;
        vm.message = null;
      } else if (entityName && entityName.toLowerCase() === "toolbar tab") {
        vm.template_tab_details = _.clone(data);
        vm.oldTabDetails = _.clone(data);
        vm.isTabUpdate = true;
      }
      vm.setInitialState(entityName);
    };
    /** Funtional operations on templates end*/

    /** Funtional operations on boomark templates items start*/
    vm.viewTemplateTabsForTemplate = templateData => {
      vm.template_id = templateData.id;
      vm.active_from = templateData.active_from;
      vm.location_id = templateData.location_id;
      vm.isLoadingTabs = true; // variable to show loader when loading tabs in side panel
      vm.getTemplateTabsByTemplateId(vm.template_id);
      vm.openTemplateTabsPanel();
      vm.showPEHierarchyValues(); // Get product explorer hierarchy values on opening of panel
    };

    /* Function to get tabs for selected toolbar */
    vm.getTemplateTabsByTemplateId = templateId => {
      TemplateService.API.GetTemplateTabsByTemplateId(templateId)
        .then(response => {
          vm.templateTabs = response;
          vm.isLoadingTabs = false;
        })
        .catch(error => {
          vm.isLoadingTabs = false;
          logger.error(error);
        });
    };

    vm.openTemplateTabsPanel = () => {
      vm.template_tab_details = {};
      vm.isShowTemplateItemForm = true;
      vm.isAddTemplateItem = true;
      vm.message = "";
      vm.bookmarkedTemplateItems = {};
      vm.setInitialState("Toolbar Tab");
    };

    vm.closeTemplateTabPanel = () => {
      vm.isShowTemplateItemForm = false;
      common.$timeout(() => {
        vm.successmessage = "";
        vm.isDeleteSuccess = false;
        vm.isUpdateSuccess = false;
        vm.isSaveSuccess = false;
        vm.isConfirmDelete = false;
      }, 500);
    };

    vm.addTabToTemplate = display_name => {
      let toolbarTabObject = {
        template_id: vm.template_id,
        display_name: display_name
      };
      vm.isProcessing = true;
      TemplateService.API.CreateTemplateTab(vm.template_id, toolbarTabObject)
        .then(response => {
          vm.successmessage = "Added tab to toolbar";
          vm.template_tab_details = {};
          toolbarTabObject.display_sequence = vm.templateTabs.length + 1;
          toolbarTabObject.id = response.data.inserted_id;
          vm.templateTabs.push(toolbarTabObject);
          vm.isProcessing = false;
          vm.showmoveupdown = false;
          common.$timeout(() => {
            vm.showmoveupdown = true;
          }, 0);
          common.$timeout(() => {
            vm.successmessage = "";
          }, 3500);
        })
        .catch(error => {
          vm.isProcessing = false;
          vm.errormessage = error.data.message || error.data.error;
          common.$timeout(() => {
            vm.errormessage = null;
          }, 3500);
          logger.error(error);
        });
    };

    vm.updateToolbarTab = tabDetails => {
      if (tabDetails.display_name !== vm.oldTabDetails.display_name) {
        tabDetails.template_id = vm.template_id;
        let data = _.clone(tabDetails);
        TemplateService.API.UpdateToolbarTabById(data)
          .then(response => {
            vm.successmessage = "Toolbar tab updated successfully!";
            vm.templateTabs[
              vm.templateTabs.findIndex(tab => tab.id === tabDetails.id)
            ] = tabDetails;
            vm.isTabUpdate = false;
            vm.template_tab_details = {};
            common.$timeout(() => {
              vm.successmessage = "";
            }, 3500);
          })
          .catch(error => {
            vm.errormessage = error.data.message || error.data.error;
            common.$timeout(() => {
              vm.errormessage = null;
            }, 3500);
            logger.error(error);
          });
      } else {
        vm.errormessage = "Nothing to update";
        common.$timeout(() => {
          vm.errormessage = null;
        }, 2000);
      }
    };

    vm.removeTabFromTemplate = tab_id => {
      TemplateService.API.DeleteTemplateTab(tab_id)
        .then(response => {
          vm.successmessage = "Removed tab from toolbar";
          vm.getTemplateTabsByTemplateId(vm.template_id);
        })
        .catch(error => {
          logger.error(error);
        });
      common.$timeout(() => {
        vm.successmessage = "";
      }, 3500);
    };

    /** Funtional operations on boomark templates items end */

    vm.activate();
  }
})();
