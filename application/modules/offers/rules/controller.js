(function() {
    'use strict';

    angular
        .module('rc.prime.offerrule')
        .controller('RulesController', RulesController)

    RulesController.$inject = [
        '$scope',
        '$stateParams',
        'common',
        'RulesFactory'
    ];

    function RulesController(
        $scope,
        $stateParams,
        common,
        RulesFactory
    ) {
        let vm = this;
        let $timeout = common.$timeout;
        let logger = common.Logger.getInstance('RulesController');

        vm.isProcessing = false;
        vm.Offer = "";

        vm.sortType = "name";
        vm.currentPage = 1;
        vm.pageSize = 25;
        vm.rowsCount = 0;

        vm.rulesSortType = "id";
        vm.rulesCurrentPage = 1;
        vm.rulesPageSize = 25;

        vm.fetchOfferRules = (refresh) => {
            if (refresh !== undefined) {
                vm.totalRecords = "";
                vm.totalTimeText = "";
                vm.isRefreshTable = true;
                vm.refreshTableText = "Table is refreshing...";
            }
            RulesFactory.API
                .FetchOfferRules($stateParams.id)
                .then(rules => {
                    vm.OfferRules = rules;
                    vm.rulesRowsCount = rules.length;
                    if (refresh !== undefined) {
                        vm.refreshTableText = "Table is refreshing...";
                        vm.totalRecords = rules.length;
                        vm.totalRecordsText = "record(s) loaded in approximately";
                        vm.totalTimeText = "<strong>" + rules.time_taken + "</strong><span class='f-14 c-gray'> seconds</span>";
                        vm.refreshTableText = "Successfully refreshed";
                        $timeout(() => {
                            vm.isRefreshTable = false;
                        }, 3500);
                    }
                    vm.pageChangeHandler(1);
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.fetchRuleTypes = () => {
            RulesFactory.API
                .FetchRuleTypes()
                .then(ruleTypes => {
                    vm.RuleTypes = ruleTypes;
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.AddRule = () => {
            vm.Rule.offerId = $stateParams.id;
            RulesFactory.API.AddRule(vm.Rule)
                .then(response => {
                    vm.message = "Added rule to offer successfully.";
                })
                .catch(error => {
                    logger.error(error);
                })
        };

        vm.fetchRule = () => {
            RulesFactory.API.FetchOfferRule($stateParams.rule_id)
                .then(response => {
                    vm.Rule = response[0];
                })
                .catch(error => {
                    logger.error(error);
                })
        }

        vm.deleteRule = () => {
            RulesFactory.API
                .RemoveOfferRule(vm.Rule.offer_id, vm.Rule.rule_type_id)
                .then(response => {
                    vm.message = "Deleted Offer Rule successfully.";
                })
                .catch(error => {
                    logger.error(error);
                })
        }


        vm.PanelNewRule = (ruleId) => {
            common.$state.go('common.prime.offerrules.new');
        }

        vm.PanelUpdateRule = (ruleId) => {
            common.$state.go('common.prime.offerrules.update', {
                rule_id: ruleId
            });
        }

        vm.PanelDeleteRule = (rule) => {
            vm.Rule = rule;
            common.$state.go('common.prime.offerrules.delete', {
                rule_id: rule.id
            });
        }

        vm.setAction = (entityData, entityRulesData, field) => {
            for (let i = 0; i < entityData.length; i++) {
                if (entityRulesData[entityData[i].id] && (entityData[i].id === entityRulesData[entityData[i].id][field])) {
                    entityData[i]['action'] = 'remove';
                } else {
                    entityData[i]['action'] = 'add';
                }
            }
        };

        vm.addOrRemove = (entityName, data) => {
            if (entityName && entityName.toLowerCase() === 'item') {
                if (data.action && data.action === 'add') {
                    vm.addItemForRule(data);
                } else {
                    vm.removeItemForRule(data);
                }
            } else if (entityName && entityName.toLowerCase() === 'sku') {
                if (data.action && data.action === 'add') {
                    vm.addSKUForRule(data);
                } else {
                    vm.removeSKUForRule(data);
                }
            } else if (entityName && entityName.toLowerCase() === 'collection') {
                if (data.action && data.action === 'add') {
                    vm.addCollectionForRule(data);
                } else {
                    vm.removeCollectionForRule(data);
                }
            }

        };

        vm.showItems = (ruleId) => {
            common.$state.go('common.prime.offerrules.items', {
                "rule_id": ruleId
            });
        };

        vm.fetchItems = (flag) => {
            vm.itemsList = [];
            common.EntityDetails.API
                .GetGraphSet(common.Identifiers.item, ['id', 'description'])
                .then(response => {
                    vm.itemsList = response.data;
                    if (flag) {
                        vm.getItemsByRule();
                    }
                })
                .catch(error => logger.error(error));
        };

        vm.getItemsByRule = () => {
            vm.ruleItemsMap = [];
            RulesFactory.API
                .FetchItemsByRule($stateParams.rule_id)
                .then(response => {
                    for (let i = 0; i < response.length; i++) {
                        if (vm.ruleItemsMap[response[i].item_id] === undefined) {
                            vm.ruleItemsMap[response[i].item_id] = response[i];
                        }
                    }
                    vm.setAction(vm.itemsList, vm.ruleItemsMap, 'item_id');
                }).catch(error => {
                    logger.error(error);
                });
        };

        vm.addItemForRule = (data) => {
            let dataToBeSave = {
                rule_id: $stateParams.rule_id,
                item_id: data.id
            }
            vm.message = null;
            vm.errorMessage = null;

            RulesFactory.API
                .AddItemToRule(dataToBeSave)
                .then(response => {
                    vm.getItemsByRule();
                    vm.message = "Item added successfully!";
                })
                .catch(error => {
                    vm.errorMessage = "Unable to add item!"
                    logger.error(error);
                });

            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500)
        };

        vm.removeItemForRule = (data) => {
            let obj = {
                rule_id: $stateParams.rule_id,
                item_id: data.id
            }
            vm.message = null;
            vm.errorMessage = null;
            RulesFactory.API
                .DeleteItemForRule(obj)
                .then(response => {
                    vm.getItemsByRule();
                    vm.message = "Item deleted successfully!";
                })
                .catch(error => {
                    vm.errorMessage = "Unable to delete item!"
                    logger.error(error);
                });

            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500)
        };

        vm.showSkus = (ruleId) => {
            vm.rule_details = {};
            common.$state.go('common.prime.offerrules.skus', {
                "rule_id": ruleId
            });
        };

        vm.fetchSKUsByItemId = (itemId) => {
            vm.skuList = [];
            common.EntityDetails.API
                .GetGraphSet(common.Identifiers.sku_master, ['id', 'description'], 'item_id', itemId)
                .then(response => {
                    vm.skuList = response.data;
                    vm.fetchSkusByRule();
                })
                .catch(error => logger.error(error));
        };

        vm.fetchSkusByRule = () => {
            vm.ruleSkusMap = [];
            RulesFactory.API
                .FetchSKUsByRule($stateParams.rule_id)
                .then(response => {
                    for (let i = 0; i < response.length; i++) {
                        if (vm.ruleSkusMap[response[i].sku_id] === undefined) {
                            vm.ruleSkusMap[response[i].sku_id] = response[i];
                        }
                    }
                    vm.setAction(vm.skuList, vm.ruleSkusMap, 'sku_id');
                })
                .catch(error => {
                    logger.error(error);
                });
        }

        vm.addSKUForRule = (data) => {
            let dataToBeSave = {
                rule_id: $stateParams.rule_id,
                sku_id: data.id
            }
            vm.message = null;
            vm.errorMessage = null;

            RulesFactory.API.AddSKUToRule(dataToBeSave)
                .then(response => {
                    vm.fetchSkusByRule();
                    vm.message = "SKU added successfully!";
                })
                .catch(error => {
                    vm.errorMessage = "Unable to add SKU!"
                    logger.error(error);
                });

            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500)
        };

        vm.removeSKUForRule = (data) => {
            let obj = {
                rule_id: $stateParams.rule_id,
                sku_id: data.id
            }
            vm.message = null;
            vm.errorMessage = null;
            RulesFactory.API.DeleteSKUForRule(obj)
                .then(response => {
                    vm.fetchSkusByRule();
                    vm.message = "SKU deleted successfully!";
                })
                .catch(error => {
                    vm.errorMessage = "Unable to delete SKU!"
                    logger.error(error);
                });

            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500)
        };

        vm.showCollections = (ruleId) => {
            common.$state.go('common.prime.offerrules.collections', {
                "rule_id": ruleId
            });
        }

        vm.fetchCollections = () => {
            vm.collections = [];
            common.EntityDetails.API.GetGraphSet(common.Identifiers.item_collection, ['id', 'short_description'])
                .then(response => {
                    vm.collections = response.data;
                    vm.fetchCollectionsByRule();
                })
                .catch(error => logger.error(error));
        };

        vm.fetchCollectionsByRule = () => {
            vm.ruleCollectionsMap = [];
            RulesFactory.API.FetchCollectionsByRule($stateParams.rule_id)
                .then(response => {
                    for (let i = 0; i < response.length; i++) {
                        if (vm.ruleCollectionsMap[response[i].collection_id] === undefined) {
                            vm.ruleCollectionsMap[response[i].collection_id] = response[i];
                        }
                    }
                    vm.setAction(vm.collections, vm.ruleCollectionsMap, 'collection_id');
                })
                .catch(error => {
                    logger.error(error);
                })
        }


        vm.addCollectionForRule = (data) => {
            let dataToBeSave = {
                rule_id: $stateParams.rule_id,
                collection_id: data.id
            }
            vm.message = null;
            vm.errorMessage = null;

            RulesFactory.API.AddCollectionToRule(dataToBeSave)
                .then(response => {
                    vm.fetchCollectionsByRule();
                    vm.message = "Item collection added successfully!";
                })
                .catch(error => {
                    vm.errorMessage = "Unable to add item collection!"
                    logger.error(error);
                });

            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500)
        };

        vm.removeCollectionForRule = (data) => {
            let obj = {
                rule_id: $stateParams.rule_id,
                collection_id: data.id
            }
            vm.message = null;
            vm.errorMessage = null;
            RulesFactory.API.DeleteCollectionForRule(obj)
                .then(response => {
                    vm.fetchCollectionsByRule();
                    vm.message = "Item collection deleted successfully!";
                })
                .catch(error => {
                    vm.errorMessage = "Unable to delete item collection!"
                    logger.error(error);
                });

            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500)
        };

        vm.pageChangeHandler = (num) => {
            vm.currentPage = num;
            vm.updateTableInformation(num);
        };

        vm.updateTableInformation = (currentPage) => {
            let initalCount;
            if (!vm.rulesRowsCount || vm.rulesRowsCount === 0) {
                initalCount = 0;
            } else {
                initalCount = 1;
            }
            if (currentPage === 1) {
                vm.rulesRowsInfo = "Displaying " + initalCount + "-" + (vm.rulesRowsCount < vm.rulesPageSize ? vm.rulesRowsCount : vm.rulesPageSize) + " Of " + vm.rulesRowsCount + " Records";
            } else {
                var start = (parseInt(currentPage) * parseInt(vm.rulesPageSize)) - parseInt(vm.rulesPageSize) + 1;
                var end = (((parseInt(currentPage) * parseInt(vm.rulesPageSize)) - parseInt(vm.rulesPageSize)) + parseInt(vm.rulesPageSize));
                vm.rulesRowsInfo = "Displaying " + start + "-" + (end < vm.rulesRowsCount ? end : vm.rulesRowsCount) + " Of " + vm.rulesRowsCount + " Records";
            }
        };

    }
})();