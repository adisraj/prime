(function() {
    "use strict";

    angular
        .module("rc.prime.item.pricegroup")
        .controller("ItemPriceGroupController", ItemPriceGroupController);
    ItemPriceGroupController.$inject = [
        "$scope",
        "$stateParams",
        "common",
        "HierarchyService",
        "HierarchyValueService",
        "ItemPriceGroupService",
        "ItemTypeService"
    ];

    function ItemPriceGroupController(
        $scope,
        $stateParams,
        common,
        HierarchyService,
        HierarchyValueService,
        ItemPriceGroupService,
        ItemTypeService
    ) {
        var vm = this;
        let logger = common.Logger.getInstance("ItemPriceGroupController");
        vm.entityInformation = {};
        vm.message = null;
        vm.isLoaded = false;

        vm.isUnauthorized = false;
        vm.isViewAuthorized = true;
        $scope.name = "Item Price Classification";

        //variables used in form
        vm.new_pg = {};
        vm.updateBtnText = "Update";
        vm.updateBtnError = false;
        vm.isUpdateSuccess = false;

        vm.sortType = "value_short_description";

        vm.selectedItemType = {};

        ///////// activating Item type module

        vm.initializeItemPriceGroup = () => {
            vm.selectedItemType = {
                typeId: $stateParams.item_type_id,
                desc: $stateParams.item_type_description
            };
            vm.getHierarchyValues();
            vm.getItemTypeById($stateParams.item_type_id)
        };

        //get item price groups from hierarchy values
        vm.getHierarchyValues = () => {
            HierarchyService.API.SearchHierarchy(
                    "is_pricing_classification_group_id",
                    1
                )
                .then(response => {
                    var price_classification_id = response[0].id;
                    let promise = vm.showhierarchyvaluelist(
                        vm.selectedItemType.typeId,
                        price_classification_id
                    );
                    promise.then(res => {
                        $stateParams.price_class_value && !vm.isUpdateSuccess ? vm.gotoUpdateStateIfIdExists() : '';
                    });
                })
                .catch(err => logger.error(err));
        };

        //get item type by id
        vm.getItemTypeById = typeId => {
            ItemTypeService.API.getItemTypesById(typeId)
                .then(response => {
                    vm.selectedItemType.desc = response[0].short_description;
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        //get hierarchy values then prepare and show price groups list
        vm.showhierarchyvaluelist = (typeId, price_classification_id) => {
            this.isLoaded = false;
            let data = HierarchyValueService.API.GetHierarchyValueByHierarchyId(
                    price_classification_id
                )
                .then(res => {
                    vm.hierarchyname = res.hierarchy;
                    let multisearchData = ItemPriceGroupService.API.MultiSearchItemPriceGroup({
                            item_type_id: typeId,
                            pricing_class_udd_id: res.data[0].hierarchy_id
                        })
                        .then(response => {
                            let d = {},
                                nd = [],
                                ids = [];
                            _.each(res.data, (groupValue) => {
                                let obj = {
                                    item_type_id: typeId,
                                    pricing_class_udd_id: groupValue.hierarchy_id,
                                    short_description: groupValue.hierarchy,
                                    pricing_class_udd_line_id: groupValue.id,
                                    value_short_description: groupValue.short_description,
                                    price_percentage: 100,
                                    is_created: false
                                };
                                d[groupValue.id] = obj;
                                nd.push(obj);
                                ids.push(groupValue.id);
                            });
                            if (response.data.length === 0) {
                                response.data = nd;
                            } else {
                                _.each(response.data, (info) => {
                                    d[info.pricing_class_udd_line_id] = {};                                    
                                    d[info.pricing_class_udd_line_id]["id"] = info.id;
                                    d[info.pricing_class_udd_line_id]["is_created"] = true;
                                    d[info.pricing_class_udd_line_id]["price_percentage"] =
                                        info.price_percentage;
                                    d[info.pricing_class_udd_line_id]["value_short_description"] = info.value_short_description;
                                });
                                response.data = [];
                                _.each(ids, (infoid) => {
                                    response.data.push(d[infoid]);
                                });
                            }
                            vm.createListMap(response.data);
                            vm.pricegroupsList = response.data;
                            vm.rowsCount = response.data.length;
                            this.isLoaded = true;
                            return response.data;
                        })
                        .catch(error => {
                            this.isLoaded = true;
                            if (error.status === 403) {
                                vm.isViewAuthorized = false;
                            }
                            logger.error(error);
                        });
                    return multisearchData;

                })
                .catch(error => {});

            return data;
        };
        //// view manipaulation

        vm.createListMap = (list) => {
            vm.priceclassMap = [];
            for (let i = 0; i < list.length; i++) {
                if (vm.priceclassMap[list[i].value_short_description] === undefined) {
                    vm.priceclassMap[list[i].value_short_description] = list[i];
                }
            }
        }

        //close forms
        vm.closeForm = () => {
            vm.message = null;
            common.$state.go("common.prime.itemtypepricegroup");
            common.$timeout(() => {
                vm.isUpdateSuccess = false;
            }, 500);
        };

        //on double click open update form
        vm.dblClickAction = (payload) => {
            common.$state.go("common.prime.itemtypepricegroup.update", {
                "price_class_value": payload.value_short_description
            });
            vm.isUpdateSuccess = false;
            vm.isUnauthorized = false;
            vm.updateBtnText = "Update";
            vm.new_pg = _.clone(payload);
            vm.setInitialState();
        };

        //go to update state if current value exists
        vm.gotoUpdateStateIfIdExists = () => {
            if (vm.priceclassMap[$stateParams.price_class_value]) {
                vm.dblClickAction(vm.priceclassMap[$stateParams.price_class_value]);
            } else {
                vm.closeForm();
            }
        }

        //set focus initially on first field in form
        vm.setInitialState = () => {
            common.$timeout(() => {
                angular.element("#price_percentage").focus();
            }, 0);
        };

        //update the price group value
        $scope.updatepricegroup = (payload) => {
            var newObj = [];
            if (payload.is_created === true) {
                //if price group is not created already, then update the same
                vm.updateBtnText = "Updating Now...";
                ItemPriceGroupService.API.UpdateItemPriceGroup(payload)
                    .then(response => {
                        vm.updateBtnText = "Done";
                        vm.isUpdateSuccess = true;
                        vm.initializeItemPriceGroup();
                    })
                    .catch(error => {
                        if (error.status === 403) {
                            vm.isUnauthorized = true;
                        } else {
                            vm.message = error.data.error;
                        }
                        vm.updateBtnText = "Oops.!! Something went wrong";
                        vm.updateBtnError = true;
                        common.$timeout(() => {
                            vm.updateBtnText = "Update";
                            vm.updateBtnError = false;
                        }, 2500);
                    });
            } else {
                //if price group is not created already, then create new
                vm.updateBtnText = "Updating Now...";
                ItemPriceGroupService.API.InsertItemPriceGroup(payload)
                    .then(response => {
                        vm.updateBtnText = "Done";
                        vm.isUpdateSuccess = true;
                        vm.initializeItemPriceGroup();
                    })
                    .catch(error => {
                        if (error.status === 403) {
                            vm.isUnauthorized = true;
                        } else {
                            vm.message = error.data.error;
                        }
                        vm.updateBtnText = "Oops.!! Something went wrong";
                        vm.updateBtnError = true;
                        common.$timeout(() => {
                            vm.updateBtnText = "Update";
                            vm.updateBtnError = false;
                        }, 2500);
                    });
            }
        };

        activate();

        function activate() {
            vm.initializeItemPriceGroup();
        }
        // Invoking Section
    }
})();