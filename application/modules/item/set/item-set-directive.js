(function () {
  "use strict";

  angular
    .module("rc.prime.item")
    .controller("ItemSetController", ItemSetController);

  ItemSetController.$inject = [
    "$scope",
    "common",
    "ItemService",
    "ItemSetService",
    "DataLakeAPIService",
    'VendorService',
    "valdr"
  ];

  function ItemSetController(
    $scope,
    common,
    ItemService,
    ItemSetService,
    DataLakeAPIService,
    VendorService,
    valdr
  ) {
    let vm = this;
    let logger = common.Logger.getInstance("ItemSetController");
    let Notification = common.Notification;
    let set_module_name = "Item";
    let search_field = "item_sub_type";
    let search_value = "item";
    let setPayload = {
      child_id: "child_item_id",
      parent_id: "parent_item_id"
    };
    vm.set = {};
    vm.parent_description = $scope.parent_description;
    vm.map_table = {};
    vm.uuid = "4";
    vm.setItems = undefined;
    var itemMap = {};
    var deletedIds = []; //ids of items to be deleted from set
    let Identifiers = common.Identifiers;

    //initialize the items drop down in item set stage
    function initDropDown() {
      //Configure vendor search select object
      common.$timeout(() => {
        $scope.selectItemConfiguration = {
          valueField: "child_item_id",
          labelField: "description",
          searchField: ["description"],
          sortField: "description",
          //Space is added to so that end of the text does not cut off
          placeholder: "Select Item" + " ",
          allowEmptyOption: true,
          create: false,
          highlight: false,
          hideSelected: true,
          searchConjunction: "or",
          options: vm.items,
          render: {
            option: function (data, escape) {
              if (data.status_id === 200 || data.status_id === 100) {
                return (
                  '<div class="p-5">' +
                  '<div class="m-5">' +
                  '<span class="c-black f-13"> ' +
                  escape(data.description) +
                  "</span>" +
                  '<span class="f-300 f-11 c-gray pull-right">' +
                  escape(data.status) +
                  "</span>" +
                  "</div>" +
                  "</div>"
                );
              } else {
                return (
                  '<div class="p-5 disabled">' +
                  '<div class="m-5">' +
                  '<span class="c-black f-13"> ' +
                  escape(data.description) +
                  "</span>" +
                  '<span class="f-300 f-11 c-gray pull-right">' +
                  escape(data.status) +
                  "</span>" +
                  "</div>" +
                  "</div>"
                );
              }
            },
            item: function (data, escape) {
              vm.showBtn = true;
              return (
                '<div class="option">' +
                '<span class="title m-r-5">' +
                escape(data.description) +
                "</span>" +
                "</div>"
              );
            }
          }
        };
      }, 0);
    }

    $scope.$watch("itemMaintCtrl.itemSetForm", (n, o) => {
      if (n) {
        init();
      }
    });

    function init() {
      if (vm.items === undefined && vm.setItems === undefined) {
        deletedIds = [];
        vm.items = [];
        vm.setItems = [];
        vm.isSetLoaded = false;
        vm.getVendors();
        //Get Sets available for the selected Item
        ItemSetService.API
          .GetItemSetsByParentItemId($scope.parent_id)
          .then(response => {
            var itemMap = {};
            vm.isSetLoaded = true;
            _.each(response, setItem => {
              vm.items = _.reject(vm.items, item => {
                return item["child_item_id"] == setItem["child_item_id"];
              });
              setItem.$update = true;
              vm.setItems.push(setItem);
              vm.fetchFirstSkuByItem(setItem);
            });
          })
          .catch(error => logger.error(error));
      }
    }

    vm.searchItemComponents = () => {
      if (vm.sku_number) {
        vm.getItemBySKUNumber();
      } else {
        vm.loadComponentItemsByType(vm.pe_item_hierarchy_value_id, vm.vendor);
      }
    }

    vm.end = data => {
      if (data.path_name !== undefined) {
        vm.pe_item_hierarchy_value_name = data.path_name;
        vm.pe_item_hierarchy_value_id = data.hierarchyValueData.id;
        vm.pe_item_hierarchy = data.hierarchyValueData.hierarchy;
        vm.pe_item_hierarchy_value_path = data.hierarchyValueData.tree_path;
        // Ihe item in the dropdown is reset
        vm.items = undefined;
        // This is to hide the 'message' till user selects another hierarchy
        vm.isLoading = undefined;
        // variable to set the item in the dropdown is reset
        vm.set.child_item_id = undefined;
      } else {
        vm.items = undefined;
      }
    }

    //Get the Vendors to create a map of Vendors
    vm.getVendors = () => {
      VendorService.API.GetVendors()
        .then(response => {
          let model = "allVendors";
          $scope[model] = [];
          vm[model] = [];
          _.each(response.data.data, response => {
            if (response.goods_allowed) {
              $scope[model].push(response);
              vm[model].push(response);
            }
          });
          vm.vendorsMap = [];
          for (let i = 0; i < response.data.data.length; i++) {
            if (vm.vendorsMap[response.data.data[i].id] === undefined) {
              vm.vendorsMap[response.data.data[i].id] = response.data.data[i];
            }
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.resetValue = () => {
      vm.set['child_item_id'] = undefined;
      if (vm.sku_number) {
        vm.sku_number = undefined;
        vm.items = undefined;
      }
    }

    vm.loadComponentItemsByType = (itemTypeId, vendorObject) => {
      vm.items = undefined;
      vm.isLoading = true;
      $scope.selectItemConfiguration = undefined;
      let vendorId;
      //Fecth all the items of sub type 'item' which could be added as set
      vendorObject ? vendorId = vendorObject.id : vendorId = undefined;
      ItemService.API
        .SearchItemsBySubType(search_value, vm.pe_item_hierarchy_value_id, vendorId)
        .then(response => {
          vm.items = response;
          initDropDown();
          vm.isLoading = false;
        })
        .catch(error => logger.error(error));
    }

    vm.getItemBySKUNumber = () => {
      if (vm.sku_number) {
        vm.isLoading = true;
        $scope.selectItemConfiguration = undefined;
        if (vm.sku_number.length < 8) {
          if (vm.sku_number.length == 7) {
            vm.sku_number = "00000000" + vm.sku_number;
            !vm.sku_number.includes("-") ?
              (vm.sku_number = vm.sku_number.substr(
                vm.sku_number.length - 9,
                vm.sku_number.length
              )) :
              (vm.sku_number = vm.sku_number.substr(
                vm.sku_number.length - 10,
                vm.sku_number.length
              ));
            !vm.sku_number.includes("-") ?
              (vm.sku_number =
                vm.sku_number.slice(0, 4) +
                "-" +
                vm.sku_number.slice(4, 7) +
                "-" +
                vm.sku_number.slice(7, 9)) :
              null;
          }
          else {
            //Append leading zeros to the existing sku number
            vm.sku_number = "000000" + vm.sku_number;
            //Get the sku number of length 6
            !vm.sku_number.includes("-") ? vm.sku_number = vm.sku_number.substr(
              vm.sku_number.length - 7,
              vm.sku_number.length
            ) : vm.sku_number = vm.sku_number.substr(
              vm.sku_number.length - 8,
              vm.sku_number.length);
            !vm.sku_number.includes("-")
              ? (vm.sku_number =
                vm.sku_number.slice(0, 4) +
                "-" +
                vm.sku_number.slice(4, 7))
              : null;
          }
        } else if (vm.sku_number.length === 8) {
          !vm.sku_number.includes("-")
            ? (vm.sku_number =
              vm.sku_number.slice(0, 4) +
              "-" +
              vm.sku_number.slice(4, 7))
            : null;
        } else if (vm.sku_number.length >= 9) {
          !vm.sku_number.includes("-")
            ? (vm.sku_number =
              vm.sku_number.slice(0, 4) +
              "-" +
              vm.sku_number.slice(4, 7) + "-" + vm.sku_number.slice(7, vm.sku_number.length))
            : null;
        }
        vm.items = undefined;
        ItemService.API.GetItems(undefined, { 'sku_number': vm.sku_number })
          .then(response => {
            if (response.data.data.length > 0) {
               if ((response.data.data[0].status_id === 200 || response.data.data[0].status_id === 100) && response.data.data[0].item_sub_type.toLowerCase() === 'item') {
                response.data.data[0].child_item_id = response.data.data[0].id;
                response.data.data[0].parent_item_id = null;
                vm.items = response.data.data;
                vm.set.child_item_id = response.data.data[0].id;
                initDropDown();
                vm.isLoading = false;
                vm.checkDuplicateItem();
              }  else {
                  vm.isLoading = false;
                }
            } else {
              vm.isLoading = false;
            }
          })
      }
    }

    ///Function to check selected item is already present in set, if yes then show message in UI
    vm.checkDuplicateItem = () => {
      vm.duplicateItemMessage = null;
      vm.showBtn = true;
      for (let i = 0; i < vm.setItems.length; i++) {
        if (
          parseInt(vm.set["child_item_id"]) ===
          parseInt(vm.setItems[i]["child_item_id"])
        ) {
          vm.duplicateItemMessage = "Item already exist in set";
          vm.showBtn = false; //hide button if item already exists in set
        }
      }
    };

    //Push items to the array of set items to add in the set
    vm.addValueToNewSet = () => {
      vm.items = _.filter(vm.items, (item) => {
        if (
          vm.set &&
          parseInt(item["child_item_id"]) === parseInt(vm.set["child_item_id"])
        ) {
          item.parent_item_id = $scope.parent_id;
          vm.setItems.push(item);
          vm.fetchFirstSkuByItem(item);
          vm.set = {};
          if (vm.sku_number) {
            vm.sku_number = undefined;
            vm.items = undefined;
            vm.isLoading = undefined;
          }
          vm.showBtn = false;
          vm.loadImage(item, '100x100');
        }
        return item;
      });
    };

    //load images for set items
    vm.loadImage = function (item, size) {
      DataLakeAPIService.API
        .GetDropsByUuidInstanceAndStream(
        vm.uuid,
        item.child_item_id,
        "cover_image"
        )
        .then(response => {
          if (response && response.length > 0) {
            item.thumbnail = DataLakeAPIService.API.GetImageDownloadUrl(
              response[0].drop_id,
              size,
              vm.uuid
            );
          }
        });
    };
    vm.saveSetValue = function (item) {
      var _object = {
        status_id: 200
      };
      _object["child_item_id"] = item["child_item_id"];
      _object["parent_item_id"] = $scope.parent_id;
      ItemSetService.API
        .InsertItemSet(_object)
        .then(response => {
          $scope.$parent.itemSetSuccessMessage = response.data.message;
        })
        .catch(error => {
          Notification.errornotification(error);
          logger.error(error);
        });
    };
    vm.updateSetValue = function (item) {
      var _object = {
        id: item.id
      };
      ItemSetService.API
        .UpdateItemSet(_object)
        .then(response => {
          $scope.$parent.itemSetSuccessMessage = Notification.responsenotification(response);
        })
        .catch(error => {
          Notification.errornotification(error);
          logger.error(error);
        });
    };

    vm.deleteValueFromSet = function (setVal) {
      vm.isDeleting = true;
      if (setVal.$update) {
        // deletedIds.push(setVal.id);
        vm.deleteSetValue({ id: setVal.id, parent_item_id: setVal.parent_item_id });
      }
      delete itemMap[setVal.child_item_id];
      vm.setItems = _.filter(vm.setItems, (item) => {
        return item.child_item_id !== setVal.child_item_id;
      });
      vm.checkDuplicateItem();
      vm.showBtn = true;
      vm.isDeleting = false;
    };
    vm.deleteSetValue = function (setItem) {
      ItemSetService.API
        .DeleteItemSet(setItem)
        .then(response => {
          vm.isDeleting = false;
          $scope.$parent.itemSetSuccessMessage = 'Removed component from set successfully.';
          Notification.responsenotification(response);
        })
        .catch(error => {
          Notification.errornotification(error);
          logger.error(error);
          vm.isDeleting = false;
        });
    };
    vm.reset = function (obj) {
      ItemSetService.API
        .GetItemSetById(obj.id)
        .then(response => {
          obj.$edit = false;
        })
        .catch(error => logger.error(error));
    };

    // function to reset udd value
    vm.resetComponentHierarchyValue = () => {
      if (vm.pe_item_hierarchy_value_id) {
        vm.pe_item_hierarchy_value_name = undefined;
        vm.pe_item_hierarchy_value_id = undefined;
        vm.pe_item_hierarchy = undefined;
        vm.pe_item_hierarchy_value_path = undefined;
        vm.items = undefined;
        vm.clearPath = true;
        if ($scope.hierarchyTree.currentNode) {
          $scope.hierarchyTree.currentNode.selected = undefined;
          $scope.hierarchyTree.currentNode = undefined;
        }
      }
    }

    //Function to reset selected Vendor value
    vm.resetSelectedVendor = () => {
      vm.vendor = {};
    }

    vm.resetSKUNumberValue = () => {
      if (vm.sku_number) {
        vm.sku_number = undefined;
        vm.items = undefined;
      }
    }

    vm.saveOrUpdateItemSet = function () {
      _.each(vm.setItems, function (setItem) {
        if (setItem.$update) {
          vm.updateSetValue(setItem);
        } else {
          vm.saveSetValue(setItem);
        }
      });
    };
    $scope.$on("saveOrUpdateUdd", function (e, args) {
      if ($scope.parent_id) {
        vm.saveOrUpdateItemSet();
      } else {
        if (args.response.status === 201) {
          $scope.parent_id = args.inserted_id;
          vm.saveOrUpdateItemSet();
        }
      }
    });
    
   vm.fetchFirstSkuByItem = itemData => {
      itemData.skuLoading = true;
      ItemService.API.FetchFirstSkuByItem(itemData.child_item_id)
        .then(response => {
          itemData.skuLoading = false;
          itemData.availableSkus = response.data.filter(sku => sku.sku_sub_type != "installation_fee");
        })
        .catch(error => {
          itemData.skuLoading = false;
          logger.error(error);
        });
    };
  }
  //Directive
  (function () {
    "use strict";

    angular
      .module("rc.prime.item")
      .directive("itemSetDirective", itemSetDirective);

    function itemSetDirective() {
      // Usage:
      //     <item-set-directive> </item-set-directive>
      // Creates:
      //
      var directive = {
        restrict: "EA",
        controller: ItemSetController,
        controllerAs: "vm",
        templateUrl: "application/modules/item/set/item.set.directive.html"
      };
      return directive;
    }
  })();
})();
