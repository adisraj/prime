(function() {
    'use strict'
    angular.module('rc.prime.entity').controller('EntityController', EntityController);
    EntityController.$inject = [
        '$scope',
        'common',
        'EntityService'
    ];

    function EntityController(
        $scope,
        common,
        EntityService
    ) {

        let vm = this;
        vm.returnValue = "";
        vm.entityInformation = {};
        vm.entityPageDetails = {};
        vm.uddEntityPageDetails = {};
        vm.showAllEntitesFlag = false;
        vm.isViewAuthorized = true;
        vm.showAllButtonText = 'Show All';
        vm.uuid = "49";


        /** Common Modules */
        let $timeout = common.$timeout;
        let EntityDetails = common.EntityDetails;
        let generateDynamicTableColumnsService = common.GenerateDynamicTableColumnsService;
        let loadDynamicTableService = common.LoadDynamicTableService;
        let LocalMemory = common.LocalMemory;
        let logger = common.Logger.getInstance('EntityController');


        vm.getEntityInformation = function() {
            EntityDetails.API.GetEntityInformation(vm.uuid).then(entity_information => {
                vm.entityInformation = entity_information;
                $scope.name = vm.entityInformation.name;
            });
        };

        vm.getModelAndSetValidationRules = function() {
            EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(model => {
                $scope.entity_model = model;
                vm.getDynamicColumns(model);
            });
        };

        vm.initializeEntity = function() {
            vm.getEntityInformation();
            vm.getModelAndSetValidationRules();
            vm.reload(undefined, undefined, true);
        };

        vm.watchers = function() {
            $scope.$watch(angular.bind(vm.returnValue, function() {
                return vm.returnValue;
            }), function(value) {});
        };

        vm.reload = function(show_all_entity_flag, refresh, isCache) {
            if (refresh !== undefined) {
                vm.totalRecords = "";
                vm.totalTimeText = "";
                vm.isRefreshTable = true;
                vm.refreshTableText = "Table is refreshing...";
            }
            if (show_all_entity_flag !== undefined) {
                vm.showAllEntitesFlag = show_all_entity_flag;
            }

            if (isCache === undefined || isCache === null) {
                isCache = false;
            }
            $scope.selectedRow = null;
            EntityService.API.GetMasterEntities(isCache)
                .then((response) => {
                    //Ng- Dynamic Table - Columns creations- Setting new,column,view column etc
                    $scope.loadNgTableData(response, vm.returnValue, vm.entityInformation.tableName);
                    if (refresh !== undefined) {
                        vm.refreshTableText = "Table is refreshing...";
                        vm.totalRecords = response.data.length;
                        vm.totalRecordsText = "record(s) loaded in approximately";
                        vm.totalTimeText = "<strong>" + response.time_taken + "</strong><span class='f-14 c-gray'> seconds</span>";
                        vm.refreshTableText = "Successfully refreshed";
                        $timeout(() => {
                            vm.isRefreshTable = false;
                        }, 3500);
                    }
                })
                .catch((error) => {
                    if (error.status === 403) {
                        vm.isViewAuthorized = false;
                    }
                    vm.isRefreshTable = true;
                    vm.refreshTableText = "Unsuccessfull!";
                    $timeout(() => {
                        vm.isRefreshTable = false;
                    }, 3500);
                    logger.error(error);
                });
        };

        vm.getDynamicColumns = function(model) {
            let supportActions = {};
            let alterTitles = {};
            let drillTo = {}
            let entityMeta = generateDynamicTableColumnsService.getTableColumns(model, supportActions, alterTitles, drillTo);
            if (LocalMemory.API.Get(vm.entityInformation.tableName)) {
                $scope.encols = LocalMemory.API.Get(vm.entityInformation.tableName);;
            } else {
                $scope.encols = entityMeta.cols;
            }
            $scope.entityGroupByDropdown = entityMeta.dropdownList;
        };

        vm.loadNgTableData = function(response, returnData, tableName, groupByFlag) {
            if (vm.showAllEntitesFlag) {
                // For first time it will keep response in reference object for further use
                if (!groupByFlag) {
                    $scope.entity_response = response;
                }
                let table_data = loadDynamicTableService.getTableData(response, returnData);
                vm.returnValue = table_data.returnValue;
                if ($scope.entity_table !== undefined) {
                    vm.entityPageDetails.rowsperpage = $scope.entity_table.count();
                    vm.entityPageDetails.pageno = $scope.entity_table.page();
                }
                $scope.entity_table = $scope.getTable($scope.entity_response, vm.returnValue, vm.entityPageDetails);
                $scope.entity_table_dynamic = $scope.entity_table;
                $scope.setinstance = $scope.entity_table;

            } else if (!vm.showAllEntitesFlag) {
                if (!groupByFlag) {
                    $scope.uddentity_response = response;
                }
                let table_data = loadDynamicTableService.getTableData(response, returnData);
                let entity_data = [];
                _.each($scope.uddentity_response.data, function(res) {
                    if (res.master_data == 'Yes' || res.master_data == 1) {
                        entity_data.push(res);
                    }
                });

                $scope.uddentity_response.data = entity_data;
                vm.returnValue = table_data.returnValue;
                if ($scope.udd_entity_table !== undefined) {
                    vm.uddEntityPageDetails.rowsperpage = $scope.udd_entity_table.count();
                    vm.uddEntityPageDetails.pageno = $scope.udd_entity_table.page();
                }
                $scope.udd_entity_table = $scope.getTable($scope.uddentity_response, vm.returnValue, vm.uddEntityPageDetails);
                $scope.entity_table_dynamic = $scope.udd_entity_table;
                $scope.setinstance = $scope.entity_table_dynamic;
            } else {
                console.log("Show all entity flag defined", vm.showAllEntitesFlag);
            }
        };

        vm.showAllEntities = function() {
            vm.showAllEntitesFlag = !vm.showAllEntitesFlag;
            if (vm.showAllEntitesFlag) {
                EntityService.API.GetAllEntities().then((response) => {
                    $scope.loadNgTableData(response, vm.returnValue, vm.entityInformation.tableName);
                }).catch((error) => {
                    logger.error(error);
                });
                vm.showAllButtonText = "Show Master Data"
            } else if (!vm.showAllEntitesFlag) {
                vm.reload(vm.showAllEntitesFlag);
                vm.showAllButtonText = "Show All"
            } else {
                console.log("Show all entities flag defined", vm.showAllEntitesFlag);
            }
        };

        vm.initializeEntity();
        vm.watchers();
        $scope.loadNgTableData = vm.loadNgTableData;

    }
})();