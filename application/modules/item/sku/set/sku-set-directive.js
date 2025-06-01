(function () {
  "use strict";

  angular
    .module("rc.prime.sku")
    .controller("SKUSetController", SKUSetController);

  SKUSetController.$inject = [
    "$scope",
    "$rootScope",
    "$stateParams",
    "common",
    "SKUService",
    "ItemService",
    "SKUSetService",
    "DataLakeAPIService",
    "valdr"
  ];

  function SKUSetController(
    $scope,
    $rootScope,
    $stateParams,
    common,
    SKUService,
    ItemService,
    SKUSetService,
    DataLakeAPIService,
    valdr
  ) {
    let vm = this;
    let Notification = common.Notification;
    let logger = common.Logger.getInstance("SKUSetController");
    //variables to get skus by sub type and sub type value
    let search_field = "sku_sub_type";
    let search_value = ["'component'", "'SKU'"];
    let SessionMemory = common.SessionMemory;
    vm.selectedItem = null;

    let setPayload = {
      child_id: "child_sku_id",
      parent_id: "parent_sku_id"
    };
    let item_set_uuid = "29";
    vm.uuid = "44"; //sku master uuid
    var skuMap = {};
    vm.setSkus = []; //variable to add components to sku set
    vm.originalSetSkus = [];
    var deletedIds = []; //variable to store set component ids to be deleted from set
    vm.set = {};
    $scope.$watch("skuMaintCtrl.skuSetForm", function (n, o) {
      if (n) {
        vm.itemSetId === undefined ? getChildSetItems() : "";
      }
    });

    /**
     * Get all Set items and fetch existing sets for the SKU
     */
    function getChildSetItems() {
      vm.isLoadingItemSets = true;
      vm.items = [];
      //vm.setSkus = [];
      common.EntityDetails.API.GetGraphSet(
        item_set_uuid,
        ["child_item_id", "description"],
        "parent_item_id",
        $stateParams.item_id
      )
        .then(response => {
          vm.itemSets = response.data;
          vm.isLoadingItemSets = false;
          for (let i = 0; i < response.data.length; i++) {
            vm.items.push(response.data[i].child_item_id);
          }
          //Get existing sets added to the current SKU if exists
          if (vm.items.length > 0 && vm.items.length === response.data.length) {
            vm.getSkuComponentsForItems(vm.items);
            vm.fetchComponentsByParentSKU();
          }
        })
        .catch(error => {
          logger.error(error);
        });
    }

    /**
     * 1.Get all Skus available for set items
     * 2.Map the fetched sku ids as child sku id
     * 3.Fetch all the sku sets available for the above map of child sku id
     */
    vm.getSkuComponentsForItems = items => {
      vm.skus = [];
      vm.newskus = [];
      let getAll = true;
      //Get skus available for items array
      SKUService.API.FetchSkusByItemIdsAndSubType(items, search_value, getAll)
        .then(response => {
          _.each(response.data, it => {
            it["child_sku_id"] = it.id;
            it["parent_sku_id"] = null;
            skuMap[it.id] = it;
            delete it.id;
            vm.skus.push(it);
          });
          //Get all the sets already existing for a SKU
          //vm.fetchComponentsByParentSKU();
        })
        .catch(error => logger.error(error));
    };

    vm.fetchComponentsByParentSKU = () => {
      vm.isLoadingSKUSet = true;
      SKUSetService.API.FetchSkuSetsByParentSkuId($scope.parent_id)
        .then(response => {
          var skuMap = {};
          vm.isLoadingSKUSet = false;
          _.each(response, setSku => {
            vm.skus = _.reject(vm.skus, sku => {
              return sku["child_sku_id"] == setSku["child_sku_id"];
            });
            setSku.$update = true;
            var checkSetObj = vm.setSkus.some(sku => {
              return sku.child_sku_id === setSku.child_sku_id;
            });
            checkSetObj === false ? vm.setSkus.push(setSku) : null;
          });
          vm.originalSetSkus = _.clone(vm.setSkus);
        })
        .catch(error => logger.error(error));
    };

    vm.getSkusForItems = itemId => {
      vm.isLoading = true;
      vm.skus = [];
      vm.newskus = [];
      vm.set.quantity = undefined;
      vm.set.child_sku_id = undefined;
      let getAll = true;
      if (itemId !== null) {
        vm.selectedItem = itemId;
        //Get skus available for items array
        SKUService.API.FetchSkusByItemIdsAndSubType(itemId, search_value, getAll)
          .then(response => {
            _.each(response.data, it => {
              it["child_sku_id"] = it.id;
              it["parent_sku_id"] = null;
              skuMap[it.id] = it;
              delete it.id;
              vm.skus.push(it);
            });
            vm.originalSkus = vm.skus;
            if (vm.setSkus.length > 0) {
              vm.populateSKUForItem();
            }
            //Get all the sets already existing for a SKU
            SKUSetService.API.FetchSkuSetsByParentSkuId($scope.parent_id)
              .then(response => {
                vm.isLoading = false;
                var skuMap = {};
                _.each(response, setSku => {
                  vm.skus = _.reject(vm.skus, sku => {
                    return sku["child_sku_id"] == setSku["child_sku_id"];
                  });
                });
              })
              .catch(error => {
                vm.isLoading = false;
                logger.error(error);
              });
          })
          .catch(error => {
            vm.isLoading = false;
            logger.error(error);
          });
      }
    };

    vm.populateSKUForItem = () => {
      for (let i = 0; i < vm.originalSkus.length; i++) {
        let found = false;
        for (let j = 0; j < vm.setSkus.length; j++) {
          if (vm.originalSkus[i].child_sku_id === vm.setSkus[j].child_sku_id) {
            found = true;
            break;
          }
        }
        if (found === false) {
          vm.newskus.push(vm.originalSkus[i]);
        }
      }
      vm.skus = vm.newskus;
    };

    vm.addValueToNewSet = function () {
      var _object = {
        status_id: 1,
        quantity: vm.set.quantity
      };
      _object["child_sku_id"] = vm.set["child_sku_id"];
      vm.setSkus.push(vm.set);
      vm.skus = _.filter(vm.skus, function (sku) {
        return (
          sku["child_sku_id"] !== vm.set["child_sku_id"] &&
          sku["item_id"] === vm.set["item_id"]
        );
      });
      _object["parent_sku_id"] = $scope.parent_id;
      vm.set = {};
    };

    vm.saveSetValue = function (sku, skuEvent) {
      var _object = {
        status_id: sku.status_id,
        quantity: sku.quantity
      };
      _object["child_sku_id"] = sku["child_sku_id"];
      _object["parent_sku_id"] = $scope.parent_id;
      _object["sku_event"] = skuEvent;
      _object["child_sku_number"] = sku.sku;
      _object["parent_sku_number"] = vm.skuDetails.sku;
      SKUSetService.API.InsertSKUSet(_object)
        .then(response => {
          sku.id = response.data.inserted_id;
          if ($scope.$parent)
            $scope.$parent.$parent.skuUDDSetSuccessMessage =
              "SKU set components has been inserted";
          $scope.$parent && $scope.$parent.notification
            ? ($scope.$parent.notification["skuSetMessage"] =
              response.data.message)
            : ($scope.$parent.$parent.notification["skuSetMessage"] =
              response.data.message);
          vm.changeParentStatus()
          common.$timeout(() => {
            $scope.$parent && $scope.$parent.notification
              ? ($scope.$parent.notification["skuSetMessage"] = null)
              : ($scope.$parent.$parent.notification["skuSetMessage"] = null);
          }, 2500);
        })
        .catch(error => {
          //Notification.errornotification(error);
          logger.error(error);
        });
    };

    vm.changeParentStatus = () => {
      let setstatusId = vm.getsetchildStatus();
      if (!setstatusId) setstatusId = 100;
      if (setstatusId) {
        let dataToBeUpdate = vm.skuDetails;
        dataToBeUpdate.status_id = setstatusId;
        // if (dataToBeUpdate.status_id == 200) dataToBeUpdate.status = 'Active';
        // if (dataToBeUpdate.status_id == 400) dataToBeUpdate.status = 'Pending Inactive';
        // if (dataToBeUpdate.status_id == 300) dataToBeUpdate.status = 'Inactive';
        // if (dataToBeUpdate.status_id == 100) dataToBeUpdate.status = 'Pending Active';
        if (dataToBeUpdate.status_id == vm.skuDetails.next_status_id) dataToBeUpdate.next_status_id = 500;
        SKUSetService.API.UpdateSKUparentStatus(dataToBeUpdate)
          .then(response => {
            vm.skuDetails.status_id = dataToBeUpdate.status_id;
            // vm.skuDetails.status = dataToBeUpdate.status;
            $scope.skuHead.status_id = vm.skuDetails.status_id;
            vm.skuDetails.next_status_id = dataToBeUpdate.next_status_id;
            $scope.skuHead.next_status_id = dataToBeUpdate.next_status_id;
            // vm.skuDetails.next_status = dataToBeUpdate.next_status;
            ItemService.API.UpdateItemStatusBasedOnAssociatedSUKsStatus(vm.skuDetails.item_id)
              .then(() => { })
          })
      }
    }

    $scope.$parent.$on("updateSetstatus", function (e, args) {
      if (args.skuDetails) {
        var _object = {
          status_id: args.skuDetails.status_id,
          id: args.skuDetails.id
        };
        _object["child_sku_id"] = args.skuDetails.id;
        _object["sku_event"] = args.event;
        _object["child_sku_number"] = args.skuDetails.sku;
        SKUSetService.API.UpdateChildsetstatus(_object).then((res) => { })
      }
    })

    vm.getsetchildStatus = () => {
      let active_count = 0
      let pending_active_count = 0
      let inactive_count = 0
      let pending_inactive_count = 0
      let setstatusId = vm.skuDetails.status_id
      for (let index = 0; index < vm.setSkus.length; index++) {
        let set_sku = vm.setSkus[index];
        if (set_sku["status_id"] == 100) pending_active_count += 1
        else if (set_sku["status_id"] == 200) active_count += 1
        else if (set_sku["status_id"] == 300) inactive_count += 1
        else if (set_sku["status_id"] == 400) pending_inactive_count += 1
      }
      if (inactive_count > 0) { return 300; }
      else if (active_count > 0 && pending_active_count == 0 && inactive_count == 0 && pending_inactive_count == 0) { return 200 }
      else if (pending_active_count > 0 && inactive_count == 0) { return 100 }
      else if (pending_active_count == 0 && inactive_count == 0 && pending_inactive_count > 0) { return 400 }
    }

    vm.updateSetValue = function (sku) {
      var _object = {
        id: sku.id,
        quantity: sku.quantity
      };
      SKUSetService.API.UpdateSKUSet(_object)
        .then(response => {
          if ($scope.$parent && $scope.$parent.notification) {
            $scope.$parent.notification["skuSetMessage"] =
              response.data.message;
          } else {
            $scope.$parent.$parent.notification["skuSetMessage"] =
              response.data.message;
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.checkDeleteId = setVal => {
      vm.skuDetails = $scope.$parent.skuHead;
      setVal.parent_sku_id = vm.skuDetails.id;
      setVal.parent_sku_number = vm.skuDetails.sku;
      if (setVal.id) {
        vm.deleteSetValue(setVal);
      } else {
        vm.deleteValueFromSet(setVal);
      }
      common.$timeout(() => {
        vm.isDeleteAction = false;
      }, 3000);
    };

    vm.checkInsertId = setVal => {
      if (setVal.id) {
        vm.updateSetValue(setVal);
      } else {
        vm.addValueToNewSet(setVal);
      }
    };

    vm.deleteValueFromSet = function (setVal) {
      let deletedIndex = vm.setSkus.findIndex(setSku => setSku.id == setVal.id)
      if (deletedIndex >= 0) {
        deletedIds.push(setVal.id);
      }
      skuMap && skuMap[setVal.child_sku_id]
        ? delete skuMap[setVal.child_sku_id]["quantity"]
        : null;
      //vm.skus.push(skuMap[setVal.child_sku_id]);
      vm.setSkus = _.filter(vm.setSkus, function (sku) {
        return sku.child_sku_id !== setVal.child_sku_id;
      });
      vm.getSkusForItems(vm.selectedItem);
    };

    vm.deleteSetValue = function (setSku) {
      SKUSetService.API.DeleteSKUSet(setSku)
        .then(response => {
          vm.deleteValueFromSet(setSku);
          //getChildSetItems();
          vm.set = {};
        })
        .catch(error => {
          logger.error(error);
        });

      common.$timeout(() => {
        if ($scope.$parent && $scope.$parent.notification) {
          $scope.$parent.notification["skuSetDeleteMessage"] = null;
        } else if (
          $scope.$parent &&
          $scope.$parent.$parent &&
          $scope.$parent.$parent.notification
        ) {
          $scope.$parent.$parent.notification["skuSetDeleteMessage"] = null;
        }
      }, 2500);
    };

    $scope.hasUpdateValues = sku => {
      if (vm.originalSetSkus.indexOf(sku) >= 0 && sku !== undefined) {
        $scope.$parent.$parent.skuUDDSetSuccessMessage =
          "Nothing to update in SKU set components";
      } else {
        return true;
      }
    };

    vm.saveOrUpdateSkuSet = event => {
      let skuEvent = "";
      if (event === "save") {
        skuEvent = "sku-create";
      } else if (event === "update") {
        skuEvent = "sku-update";
      }
      if ($scope.$parent && $scope.$parent.$parent) {
        $scope.$parent.$parent.skuUDDSetSuccessMessage =
          "Nothing to update/create in SKU set components";
      }
      common.$timeout(() => {
        vm.isHasSetUpdates = false;
        for (let i = 0; i < vm.setSkus.length; i++) {
          let setSku = vm.setSkus[i];
          if (setSku.$update) {
            if ($scope.hasUpdateValues(setSku)) {
              vm.isHasSetUpdates = true;
              vm.updateSetValue(setSku);
              $scope.$parent.$parent.skuUDDSetSuccessMessage =
                "Updated SKU set components successfully";
            }
            vm.changeParentStatus();
          } else {
            if (!setSku.id) {
              vm.isHasSetUpdates = true;
              vm.saveSetValue(setSku, skuEvent);
              $scope.$parent.$parent.skuUDDSetSuccessMessage = "Added SKU set components successfully";
            }
          }
        }
        /*To delete the sku*/
        if (deletedIds.length) {
          for (let j = 0; j < deletedIds.length; j++) {
            let id = deletedIds[j];
            if (vm.setSkus.length == 0) {
              vm.captureSetSkusChanges($scope.parent_id, "delete");
            } else {
              vm.isHasSetUpdates = true;
            }
            vm.deleteSetValue({ id: id });
            $scope.$parent.$parent.skuUDDSetSuccessMessage =
              "Updated SKU set components successfully";
          }
          deletedIds = [];
          vm.changeParentStatus();
        } else {
          if ($scope.$parent && $scope.$parent.$parent) {
            $scope.$parent.$parent.skuUDDSetSuccessMessage =
              "Nothing to update/create in SKU set components";
          }
        }
        if (vm.isHasSetUpdates) {
          vm.captureSetSkusChanges($scope.parent_id, "create");
        }
      }, 0);
    };

    vm.captureSetSkusChanges = (parentSkuId, action) => {
      if (vm.skuDetails.sku_type !== "mto") {
        SKUSetService.API.CaptureSkuSetChangeInQueue(parentSkuId, action)
          .then(result => {

          })
      }
    }

    vm.loadImage = function (sku, size) {
      DataLakeAPIService.API.GetDropsByUuidInstanceAndStream(
        vm.uuid,
        sku.child_sku_id,
        "cover_image"
      ).then(response => {
        if (response && response.length > 0) {
          sku.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
            response[0].drop_id,
            size,
            vm.uuid
          );
        }
      });
    };

    $scope.$parent.$on("saveOrUpdateUdd", function (e, args) {
      if (args.error === undefined) {
        if (
          args.skuDetails &&
          args.skuDetails.id &&
          args.skuDetails.id == $scope.parent_id
        ) {
          vm.skuDetails = args.skuDetails;
        } else {
          vm.skuDetails = $scope.$parent && $scope.$parent.skuHead ? $scope.$parent.skuHead : {};
        }

        if ($scope.parent_id && vm.skuDetails.sku_sub_type && vm.skuDetails.sku_sub_type.toLowerCase() === "set" && args.event != "delete") {
          vm.saveOrUpdateSkuSet(args.event);
        } else if (args.event === "delete" && $scope.parent_id && vm.skuDetails.sku_sub_type && vm.skuDetails.sku_sub_type.toLowerCase() === "set") {
          vm.deleteSetValue(args.response);
        } else {
          if (args.response && args.response.status === 201) {
            $scope.parent_id = args.inserted_id;
            vm.saveOrUpdateSkuSet(args.event);
          }
        }
      } else {
        if ($scope.$parent && $scope.$parent.$parent) {
          $scope.$parent.$parent.skuUDDSetSuccessMessage = null;
        } else {
          $scope.$parent.skuUDDSetSuccessMessage = null;
        }
      }
    });
  }

  //Directive
  (function () {
    "use strict";

    angular
      .module("rc.prime.sku")
      .directive("skuSetDirective", skuSetDirective);

    function skuSetDirective() {
      var directive = {
        restrict: "EA",
        controller: SKUSetController,
        controllerAs: "vm",
        templateUrl: "application/modules/item/sku/set/sku.set.directive.html"
      };
      return directive;
    }
  })();
})();
