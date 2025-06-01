(function () {
  "use strict";

  angular
    .module("rc.prime.sku")
    .directive("skuTemplateDirective", skuTemplateDirective);

  SKUTemplateController.$inject = [
    "$scope",
    "$stateParams",
    "common",
    "SKUService",
    "SKUTemplateService",
    "DataLakeAPIService"
  ];

  function SKUTemplateController(
    $scope,
    $stateParams,
    common,
    SKUService,
    SKUTemplateService,
    DataLakeAPIService
  ) {
    let vm = this;
    let logger = common.Logger.getInstance("SKUTemplateController");
    let $timeout = common.$timeout;

    let search_value = ["'SKU'"];
    let item_set_uuid = "29";

    let skuMap = {};
    vm.queuedSkusMap = {};
    vm.templateSkus = [];

    /**
         * When skuTemplateForm is true, initialize the directive
         * Get all the set items available for selected item
         */
    $scope.$watch("skuMaintCtrl.skuTemplateForm", function (n, o) {
      n ? getSetItemsForItem() : null;
    });

    // Get all set items for the selected item
    function getSetItemsForItem() {
      vm.itemIds = [];
      common.EntityDetails.API
        .GetGraphSet(
        item_set_uuid,
        ["child_item_id", "description"],
        "parent_item_id",
        $stateParams.item_id
        )
        .then(response => {
          vm.items = response.data;
          // for (let i = 0; i < response.data.length; i++) {
          //     vm.itemIds.push(response.data[i].child_item_id)
          // }
        })
        .catch(error => {
          logger.error(error);
        });
    }

    //Get Skus Available for the selected Item Set
    vm.getSkusForItem = item => {
      vm.sku_ids = [];
      SKUService.API
        .FetchSkusByItemIdsAndSubType([item.child_item_id], search_value)
        .then(response => {
          item.skus = [];
          item.childSkuIds = [];
          _.each(response.data, it => {
            it["child_sku_id"] = it.id;
            it["parent_sku_id"] = null;
            skuMap[it.id] = it;
            delete it.id;
            item.skus.push(it);
          });
          item.show = true;
          //Get all the sets already existing for a SKU
          if ($scope.parent_id) {
            SKUTemplateService.API
              .FetchTemplateByParentSkuId($scope.parent_id, item.child_item_id)
              .then(response => {
                vm.sku_ids = response.skuIds;
                item.header_id = response.header_id;
                item.header = response.header;
                item.minimum_units = response.minimum_quantity;
                item.is_mandatory = response.is_mandatory;
                item.childSkuIds = response.skuIds;
                item.$update = true;
              })
              .catch(error => logger.error(error));
          }
        })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.addTemplateObject = template => {
      let SKUTemplateObject = {
        status_id: 200,
        header_id: template.header_id,
        parent_sku_id: $scope.parent_id,
        header_name: template.header,
        is_mandatory: template.is_mandatory || 0,
        skuIds: template.childSkuIds,
        minimum_quantity: template.minimum_units,
        $update: template.$update
      };
      if (vm.queuedSkusMap[template.header]) {
        template.templateAddedError = "Sku Template is already added to the queue";
        $timeout(() => {
          template.header = null;
          template.is_mandatory = null;
          template.childSkuIds = [];
          template.minimum_units = null;
          template.templateAddedError = null;
        }, 1500);
      } else {
        vm.queuedSkusMap[template.header] = SKUTemplateObject;
        vm.templateSkus.push(SKUTemplateObject);
      }
    };

    vm.addSkuTemplate = setSku => {
      setSku["parent_sku_id"] = $scope.parent_id;
      SKUTemplateService.API
        .InsertSKUTemplate(setSku)
        .then(response => { })
        .catch(error => { });
    };

    vm.updateTemplate = template => {
      var SKUTemplateObject = {
        id: template.header_id,
        header_name: template.header,
        minimum_quantity: template.minimum_units,
        is_mandatory: template.is_mandatory,
        skuIds: template.skuIds
      };
      SKUTemplateService.API
        .UpdateSKUTemplate(SKUTemplateObject)
        .then(response => { })
        .catch(error => {
          logger.error(error);
        });
    };

    vm.insertOrUpdateSkuTemplate = templateObject => {
      if (
        templateObject.$update === true &&
        templateObject.header_id !== undefined
      ) {
        templateObject.header_name = templateObject.header;
        (templateObject.skuIds = templateObject.childSkuIds),
          vm.updateTemplate(templateObject);
      } else {
        let SKUTemplateObject = {
          status_id: 200,
          header_id: templateObject.header_id,
          parent_sku_id: $scope.parent_id,
          header_name: templateObject.header,
          is_mandatory: templateObject.is_mandatory || 0,
          skuIds: templateObject.childSkuIds,
          minimum_quantity: templateObject.minimum_units
        };
        vm.addSkuTemplate(SKUTemplateObject);
      }
    };

    vm.saveOrUpdateSkuTemplate = () => {
      _.each(vm.templateSkus, setSku => {
        if (setSku.$update === true && setSku.header_id !== undefined) {
          vm.updateTemplate(setSku);
        } else {
          vm.addSkuTemplate(setSku);
        }
      });
    };

    $scope.$on("saveOrUpdateUdd", function (e, args) {
      if ($scope.parent_id) {
        vm.saveOrUpdateSkuTemplate();
      } else {
        if (args.response.status === 201) {
          $scope.parent_id = args.inserted_id;
          vm.saveOrUpdateSkuTemplate();
        }
      }
    });
  }

  function skuTemplateDirective() {
    var directive = {
      restrict: "EA",
      controller: SKUTemplateController,
      controllerAs: "templateController",
      templateUrl:
      "application/modules/item/sku/template/sku.template.directive.html"
    };
    return directive;

    function link(scope, element, attrs) { }
  }
})();
