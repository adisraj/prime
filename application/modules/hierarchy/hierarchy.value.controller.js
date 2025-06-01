(() => {
  angular
    .module("rc.prime.hierarchy.value")
    .controller("HierarchyValueController", HierarchyValueController);
  HierarchyValueController.$inject = [
    "$scope",
    "$stateParams",
    "$TreeDnDConvert",
    "$window",
    "common",
    "growl",
    "HierarchyService",
    "ItemTypeService",
    "HierarchyValueService",
    "StatusCodes"
  ];

  function HierarchyValueController(
    $scope,
    $stateParams,
    $TreeDnDConvert,
    $window,
    common,
    growl,
    HierarchyService,
    ItemTypeService,
    HierarchyValueService,
    StatusCodes
  ) {
    let vm = this;
    vm.statusCodes = StatusCodes;
    /** Common Modules */
    let $timeout = common.$timeout;
    let EntityDetails = common.EntityDetails;
    let logger = common.Logger.getInstance("HierarchyValueController");

    vm.hierarchy_value_details = {};
    vm.isShowHierarchyValue = true;
    vm.showHierarchyValueAdd = false;
    vm.showDeleteOpts = false;
    vm.showValueDetails = false;
    vm.showHierarchyValueParent = false;
    vm.oldHierPropDetails = {};
    vm.isLoaded = false;
    vm.isUnauthorized = false;
    vm.isViewAuthorized = true;

    vm.isDeleteSuccess = false;
    vm.saveValueBtnText = "Save";
    vm.saveValueBtnError = false;
    vm.isSaveValueSuccess = false;
    vm.updateValueBtnText = "Update";
    vm.updateValueBtnError = false;
    vm.isUpdateValueSuccess = false;
    vm.isConfirmValueDelete = false;
    vm.isShowHistory = false;
    vm.pagedetails = {};
    vm.entityInformation = {};
    vm.uuid = "26";

    vm.getEntityInformation = () => {
      EntityDetails.API.GetEntityInformation(vm.uuid).then(_information => {
        vm.entityInformation = _information;
        $scope.name = vm.entityInformation.name;
      });
    };

    //get JSON model and set validation rules for hierarchy values
    vm.getModelAndSetValidationRules = () => {
      EntityDetails.API.GetModelAndSetValidationRules(vm.uuid)
        .then(model => {})
        .catch(error => {
          logger.error(error);
        });
    };

    vm.reload = () => {
      $timeout(() => {
        angular.element("#hierarchy_back").focus();
      }, 1000);
      $scope.selectedRow = null;
      HierarchyValueService.API.GetHierarchyValueByHierarchyId(vm.hierarchy_id)
        .then(response => {
          vm.rowsCount = response.data.length;
          $timeout(() => {
            vm.isLoaded = true;
          }, 10);
          vm.fetchHierarchyProp(response.data);
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isLoaded = true; // isLoaded variable true after api call
            vm.isViewAuthorized = false;
          }
          logger.error(error);
        });
    };

    vm.initializeHierarchyValues = () => {
      vm.isLoaded = false;
      vm.hierarchy_id = $stateParams.hierarchy_id;
      vm.getEntityInformation();
      vm.getModelAndSetValidationRules();
      vm.getPermissionsForUuid("hierarchyValuePermissions", vm.uuid);
    };

    // Get permissions of crud oprations for hierarchy value
    vm.getPermissionsForUuid = (model, uuid) => {
      $scope
        .getAccessPermissions(uuid)
        .then(res => {
          vm[model] = res;
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.fetchHierarchyById = () => {
      HierarchyService.API.GetHierarchyById(vm.hierarchy_id)
        .then(response => {
          $scope.selectedHierarchy = response;
          vm.reload();
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.watchers = () => {
      $scope.$watch(
        angular.bind(vm.returnValue, () => {
          return vm.returnValue;
        }),
        value => {}
      );
    };

    vm.save = payload => {
      let tree_path = "";
      let level = 1;
      let object = {};
      if ($scope.currentParentId && $scope.currentParentId !== "") {
        $scope.currentParent.short_description_ops =
          payload.short_description_ops;
        $scope.hierr_details = $scope.currentParent;
        $scope.hierr_details.id = $scope.currentParentId;
      }
      if ($scope.hierr_details.level !== undefined) {
        level = $scope.hierr_details.level + 1;
      }
      if ($scope.hierr_details.parent_id === undefined) {
        tree_path = "null";
      } else if ($scope.hierr_details.parent_id == null) {
        tree_path = $scope.hierr_details.id;
      } else {
        tree_path =
          $scope.hierr_details.tree_path + ">" + $scope.hierr_details.id;
      }
      object = {
        status_id: parseInt(payload.status_id),
        display_sequence: 1,
        short_description: payload.short_description_ops,
        hierarchy_id: vm.hierarchy_id,
        hierarchy: $scope.selectedHierarchy.description,
        level: level,
        parent_id: $scope.hierr_details.id,
        node_visibility: payload.node_visibility,
        tree_path: String(tree_path)
      };

      vm.saveValueBtnText = "Saving Now...";
      HierarchyValueService.API.InsertHierarchyValue(object)
        .then(response => {
          object.id = response.data.inserted_id;
          let values = JSON.parse(common.SessionMemory.API.Get("hierarchyValueList"));
          values.push(object);
          common.SessionMemory.API.Post("hierarchyValueList", JSON.stringify(values));
          vm.isShowHierarchyValue = true;
          vm.saveValueBtnText = "Save";
          vm.isSaveValueSuccess = true;
          vm.previousHV = payload;
          vm.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.error = true;
            vm.message = error.data.error.message;
          }
          vm.saveValueBtnText = "Oops.!! Something went wrong";
          vm.saveValueBtnError = true;
          $timeout(() => {
            vm.message = null;
            vm.saveValueBtnText = "Save";
            vm.saveValueBtnError = false;
            angular.element("#short_description").focus();
          }, 2000);
        });
        
        $timeout(() => {
          angular.element("#done_btn").focus();
        }, 2000);
    };

    vm.focusSave = () => {
      $timeout(() => {
        angular.element("#save_btn").focus();
      }, 2500);
    };

    vm.hasUpdateChanges = payload => {
      if (
        vm.oldHierPropDetails.short_description !==
          payload.short_description_ops ||
        vm.oldHierPropDetails.status_id !== payload.status_id ||
        vm.oldHierPropDetails.display_sequence !== payload.display_sequence ||
        vm.oldHierPropDetails.node_visibility !== payload.node_visibility
      ) {
        return true;
      } else {
        return false;
      }
    };

    vm.update = payload => {
      if (vm.hasUpdateChanges(payload) === true) {
        payload.old_short_description = vm.oldHierPropDetails.short_description;
        payload.short_description = $scope.hierr_details.short_description_ops;
        vm.updateValueBtnText = "Updating Now...";
        $scope.showhistory = false;
        HierarchyValueService.API.UpdateHierarchyValue(payload)
          .then(response => {
            let values = JSON.parse(common.SessionMemory.API.Get("hierarchyValueList"));
            let idx = values.findIndex(value => value.id === payload.id);
            idx>-1 ? values[idx] = payload : null;
            common.SessionMemory.API.Post("hierarchyValueList", JSON.stringify(values));
            vm.reload();
            vm.isShowHistory = false;
            vm.updateValueBtnText = "Done";
            vm.isUpdateValueSuccess = true;
            ItemTypeService.API.UpdateBuyerValue(payload)
            .then(response => { 
             })
          })
          .catch(error => {
            if (error.status === 403) {
              vm.isUnauthorized = true;
            } else {
              vm.message = error.data.error.message;
            }
            vm.updateValueBtnText = "Oops.!! Something went wrong";
            vm.updateValueBtnError = true;
            $timeout(() => {
              vm.message = null;
              vm.updateValueBtnText = "Update";
              vm.updateValueBtnError = false;
              angular.element("#short_description").focus();
            }, 2500);
          });
          $timeout(() => {
            angular.element("#done_btn").focus();
          }, 2000);
      } else {
        vm.updateValueBtnText = "Nothing to update";
        vm.updateValueBtnError = true;
        $timeout(() => {
          vm.updateValueBtnText = "Update";
          vm.updateValueBtnError = false;
          angular.element("#short_description").focus();
        }, 1000);
      }
    };

    vm.delete = payload => {
      vm.message = null;
      HierarchyValueService.API.DeleteHierarchyValue(payload)
        .then(response => {
          let values = JSON.parse(common.SessionMemory.API.Get("hierarchyValueList"));
          values.splice(values.findIndex(val => val.id === payload.id), 1);
          common.SessionMemory.API.Post("hierarchyValueList", JSON.stringify(values));
          vm.isDeleteSuccess = true;
          vm.$confirmdelete = false;
          vm.isConfirmValueDelete = false;
          payload.old_short_description = vm.oldHierPropDetails.short_description;
          payload.short_description = null;
          ItemTypeService.API.UpdateBuyerValue(payload)
              .then(response => { })
          vm.reload();
        })
        .catch(error => {
          if (error.status === 403) {
            vm.isUnauthorized = true;
          } else {
            vm.message = error.data.error;
          }
          logger.error(error);
        });

      $timeout(() => {
        vm.message = null;
        angular.element("#done_btn").focus();
      }, 2000);
    };

    vm.showconfirm = nodeForValue => {
      vm.showValueDetails = true;
      vm.showHierarchyValueAdd = false;
      vm.showHierarchyValueParent = true;
      vm.isConfirmValueDelete = true;
      vm.isUnauthorized = false;
      vm.isShowHistory = false;
      if (nodeForValue !== undefined) {
        $scope.hierr_details = nodeForValue;
      }
    };

    vm.fetchHierarchyProp = data => {
      $scope.returnValues = data;
      vm.hierarchyPropertiesOps();
    };

    vm.showHideFollowingArray = groupArray => {
      for (let i = 0; i < groupArray.length; i++) {
        groupArray[i].hideRows = !groupArray[i].hideRows;
      }
    };

    vm.setInitialState = () => {
      $timeout(() => {
        angular.element("#short_description").focus();
      }, 0);
    };

    vm.resetForm = () => {
      $scope.hierr_details = {};
      $scope.hierr_details["short_description_ops"] = null;
      $scope.hierr_details["node_visibility"] = 0;
    };

    vm.openForm = () => {
      $timeout(() => {
        $scope.hierr_details.status_id = 200;
        $scope.hierr_details.status = "Active";
      }, 0);
      vm.validationError = null;
      $scope.currentParentId = "";
      $scope.currentParent = undefined;
      vm.showValueDetails = true;
      vm.showHierarchyValueParent = true;
      vm.isConfirmValueDelete = false;
      vm.showHierarchyValueAdd = true;
      vm.setInitialState();
      vm.hierarchyPropDetails_form.$setPristine();
      vm.resetForm();
    };

    vm.createAnotherForm = () => {
      vm.saveValueBtnText = "Save";
      vm.isSaveValueSuccess = false;
      vm.hierarchy_values = { node_visibility: 0 };
      vm.setInitialState();
      $scope.parent_value_description = $scope.hierr_details.short_description;

      //Setiing Previously entered data to the new context
      $scope.hierr_details = {};
      $scope.hierr_details["short_description_ops"] = null;
      $scope.hierr_details.status_id = vm.previousHV.status_id;
    };

    vm.closeForm = () => {
      $scope.hierr_details = null;
      vm.showValueDetails = false;
      vm.$showHP = false;
      vm.isShowHierarchyValue = true;
      vm.saveValueBtnText = "Save";
      vm.updateValueBtnText = "Update";
      vm.updateValueBtnError = false;
      vm.saveValueBtnError = false;
      $scope.selectedNode = undefined;
      $timeout(() => {
        vm.validationError = null;
        vm.isUnauthorized = false;
        vm.isDeleteSuccess = false;
        vm.isSaveValueSuccess = false;
        vm.isUpdateValueSuccess = false;
        vm.isConfirmValueDelete = false;
        // angular.element("#hierarchy_back").focus();
      }, 500);
    };
    vm.focusGoback= () => {
      $timeout(() => {
        angular.element("#hierarchy_back").focus();
      }, 1000);
    }

    vm.setClickedRow = index => {
      $scope.selectedRow = index;
    };

    vm.getHierarchyValueById = (nodeId, cb) => {
      HierarchyValueService.API.GetHierarchyValueById(nodeId)
        .then(response => {
          $scope.hpData = response;
          cb($scope.hpData);
        })
        .catch(error => {
          logger.error(error);
        });
    };

    /* Function to check node_visibility flag for any parent node of selected node is set to 'No', then show message in UI*/
    vm.checkParentsVisibility = value => {
      let pathArray = value.tree_path
        ? value.tree_path.split(">").map(Number)
        : [];
      if ($scope.selectedNode.isAddChild) {
        pathArray.push(value.id);
      }

      if (pathArray.length > 0) {
        for (let i = 0; i < $scope.returnValues.length; i++) {
          if (
            pathArray.includes($scope.returnValues[i].id) &&
            !$scope.returnValues[i].node_visibility
          ) {
            vm.validationError =
              "Parent node is invisible in PE. Any nodes under invisible nodes will also not be displayed in PE";
          }
        }
      }
    };

    vm.hierarchyPropertiesOps = () => {
      let treeData = $scope.returnValues;
      let tree;
      $scope.my_tree = tree = {};
      $scope.my_tree.editFunctionality = node => {
        $scope.selectedNode = angular.copy(node);
        if (node.node_visibility) {
          vm.checkParentsVisibility($scope.selectedNode);
        }
        $scope.selectedNode.isEdit = true;
        vm.oldHierPropDetails = node;
        let node_id = node.id;
        vm.setInitialState();
        vm.getHierarchyValueById(node_id, function(d) {
          $scope.currentParent = undefined;
          vm.showHierarchyValueAdd = false;
          vm.isDeleteSuccess = false;
          $scope.hierr_details = d;
          $scope.hierr_details.editId = $scope.hierr_details.id;
          $scope.hierr_details.short_description_ops = d.short_description;
          $scope.hierr_details.status_id = d.status_id;
          $scope.hierr_details.node_visibility = d.node_visibility;
        });
        vm.isShowHistory = true;
        vm.isUnauthorized = false;
      };
      $scope.my_tree.addFunctionality = node => {
        vm.validationError = null;
        $scope.currentParentId = "";
        vm.showHierarchyValueAdd = true;
        vm.showHierarchyValueParent = false;
        $scope.selectedNode = angular.copy(node);
        $scope.selectedNode.isAddChild = true;
        $scope.hierr_details = angular.copy(node);
        $scope.parent_value_description = node.short_description;
        $scope.hierr_details.editId = $scope.hierr_details.id;
        $scope.hierr_details.editId = "";
        $scope.hierr_details.short_description_ops = "";
        $scope.hierr_details.node_visibility = 0;
        $scope.hierr_details.status_id = "";
        $scope.currentParent = node;
        $scope.currentParentId = node.id;
        vm.setInitialState();
        vm.hierarchyPropDetails_form.$setPristine();
      };
      $scope.my_tree.deleteFunctionality = node => {
        if (node.__children__.length === 0) {
          $scope.$showDeleteOpts = true;
          $scope
            .delete(new (HierarchyValues.getInstance())(), node, "")
            .then(result => {})
            .catch(error => {
              logger.error(error);
            });
        } else {
          $scope.$showDeleteOpts = false;
          growl.error("Warning! Cannot delete parent hierarchy value", {
            disableCountDown: true
          });
        }
      };

      $scope.expanding_property = {
        field: "short_description",
        titleClass: "text-center",
        cellClass: "v-middle",
        displayName: "Name"
      };
      $scope.col_defs_table = [];
      let obj = {
        1: {
          displayName: " New Child",
          cellTemplate:
            '<button type="button" class="bg-none border-none"  title="New child" title-direction="left" fixed-position="true" ng-click="tree.addFunctionality(node);valueCtrl.showValueDetails=true;valueCtrl.showHierarchyValueParent = false;  valueCtrl.isUpdateValueSuccess = false" > <i class="plusbtn zmdi zmdi-plus zmdi-hc-fw c-green f-700" style="cursor:pointer;"></i> </button>',
          cellClass: "iconcolumnwidthCompany"
        },
        2: {
          displayName: " Edit ",
          cellTemplate:
            '<button type="button" class="bg-none border-none" title="Edit" title-direction="left" fixed-position="true" ng-click="tree.editFunctionality(node);valueCtrl.showValueDetails=true; valueCtrl.showHierarchyValueAdd = false; valueCtrl.showHierarchyValueParent = true"> <i class="zmdi zmdi-edit" ng-style="styleClasseditIcon" style="cursor:pointer;"></i> </button>',
          cellClass: "iconcolumnwidthCompany"
        },
        3: {
          displayName: "Documents",
          cellTemplate:
            '<button type="button" class="p-l-5 header-button datalake-button" ng-click="showMetaData(valueCtrl.entityInformation,node,permissionsMap);"data-ng-disabled="!permissionsMap.drop"> <span class="zmdi zmdi-cloud zmdi-hc-fw" data-ng-if="permissionsMap.drop" title="Click here to manage documents" title-direction="left" fixed-position="true"></span><span class="zmdi zmdi-cloud-off zmdi-hc-fw" data-ng-if="!permissionsMap.drop" title="Access denied" title-direction="left" fixed-position="true"></span></button>',
          cellClass: "iconcolumnwidthCompany"
        },
        4: {
          displayName: "Display Sequeunce",
          cellTemplate: `<span title="Display Sequence" ng-bind-html="node.display_sequence"> </span>`
        },
        5: {
          displayName: "Display in PE",
          cellTemplate: `<span> <i ng-if="node.node_visibility" class="glyphicon glyphicon-ok c-green" title="Displaying in PE" title-direction="left" fixed-position="true"></i>
                    <i ng-if="!node.node_visibility" class="glyphicon glyphicon-remove c-red" title="Not displaying in PE" title-direction="left" fixed-position="true"></i>
                    </span>`,
          cellClass: "iconcolumnwidthCompany"
        }
      };

      if ($scope.selectedHierarchy.is_group === 1) {
        $scope.col_defs_table = [obj[2], obj[3]];
        $scope.allowDragNDrop = false;
      } else {
        if ($scope.selectedHierarchy.is_primary_item_hierarchy_id) {
          $scope.col_defs_table = [obj[4], obj[5], obj[1], obj[2], obj[3]];
        } else {
          $scope.col_defs_table = [obj[4], obj[1], obj[2], obj[3]];
        }
        // disabled hierarchy values drag n drop feature. To enable make it 'true'
        $scope.allowDragNDrop = false;
      }
      // Adding Default Hierarchy Properties
      if (treeData.length === 0) {
        vm.showHierarchyValueAdd = true;
      }
      $scope.tree_list = null;
      $scope.tree_list = $TreeDnDConvert.line2tree(treeData, "id", "parent_id");
      $scope.tree_table = angular.copy($scope.tree_list, []);
      $scope.callbacks = {
        beforeDrag: function(scopeDrag) {
          return true;
        },
        dragStop: function(info, passed) {
          if (!info || (!info.changed && info.drag.enabledMove) || !passed) {
            return null;
          }
          info.target.reload_data();
          if (info.target !== info.drag && info.drag.enabledMove) {
            info.drag.reload_data();
          }
        },
        dropped: function(info, pass) {
          if (!info) {
            return null;
          }
          let _node = info.node,
            _nodeAdd = null,
            _move = info.move,
            _parent = null,
            _parentRemove = info.parent || info.drag.treeData,
            _parentAdd = _move.parent || info.target.treeData,
            isMove = info.drag.enabledMove;
          if (!info.changed && isMove) {
            return false;
          }
          if (info.target.$callbacks.accept(info, info.move, info.changed)) {
            if (isMove) {
              _parent = _parentRemove;
              if (angular.isDefined(_parent.__children__)) {
                _parent = _parent.__children__;
              }
              _nodeAdd = info.drag.$callbacks.remove(
                _node,
                _parent,
                info.drag.$callbacks,
                true
              );
            } else {
              _nodeAdd = info.drag.$callbacks.clone(
                _node,
                info.drag.$callbacks
              );
            }
            if (
              isMove &&
              info.drag === info.target &&
              _parentRemove === _parentAdd &&
              _move.pos >= info.node.__index__
            ) {
              _move.pos--;
            }
            _parent = _parentAdd;
            if (_parent.__children__) {
              _parent = _parent.__children__;
            }
            info.target.$callbacks.add(
              _nodeAdd,
              _move.pos,
              _parent,
              info.drag.$callbacks
            );
            let array = vm.convertTreeToList(
              info.node,
              info.move.parent,
              _move.pos
            );
            HierarchyValueService.API.UpdateHierarchyValue(array[0])
              .then(response => {
                vm.reload();
              })
              .catch(error => {
                logger.error(error);
              });
            return true;
          }
          return false;
        },
        dragStart: function(event) {},
        dragMove: function(event) {}
      };
    };

    vm.convertTreeToList = (root, parent, pos) => {
      let array = [];
      let stack = [];
      if (parent === null) {
        if (root.parent_id !== null) {
          root.prev_parent = true;
          root.prev_parent_id = root.parent_id;
        } else {
          root.prev_parent = false;
          root.prev_parent_id = null;
        }
        root.new_parent = false;
        root.new_parent_id = null;
        root.level = 1;
        root.parent_id = null;
        root.tree_path = "";
      } else {
        if (root.parent_id !== null) {
          root.prev_parent = true;
          root.prev_parent_id = root.parent_id;
        } else {
          root.prev_parent = false;
          root.prev_parent_id = null;
        }
        root.new_parent = true;
        root.new_parent_id = parent.id;
        root.level = parent.level + 1;
        root.parent_id = parent.id;
        if (parent.tree_path === "") {
          root.tree_path = parent.id;
        } else {
          root.tree_path = parent.tree_path + ">" + parent.id;
        }
      }
      root.old_seq = root.display_sequence;
      root.new_seq = pos;
      stack.push(root);
      while (stack.length !== 0) {
        let node = stack.pop();
        array.push(node);
        for (let i = node.__children__.length - 1; i >= 0; i--) {
          node.__children__[i].level = node.level + 1;
          if (node.tree_path === "") {
            node.__children__[i].tree_path =
              "" + node.__children__[i].parent_id;
          } else {
            node.__children__[i].tree_path =
              node.tree_path + ">" + node.__children__[i].parent_id;
          }
          stack.push(node.__children__[i]);
        }
      }
      return array;
    };

    //Get history details for hierarchy
    $scope.loadHistory = () => {
      EntityDetails.API.GetHistoryData(
        vm.entityInformation.uuid,
        $scope.hpData.id
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
      $timeout(() => {
        angular.element("#short_description").focus();
      }, 1000);  
      $scope.showhistory = false;
    };

    vm.initializeHierarchyValues();
    vm.watchers();
    $scope.hierr_details = vm.hierarchy_value_details = {};
    $scope.setClickedRow = vm.setClickedRow;
  }
})();
