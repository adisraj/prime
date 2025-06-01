(function () {
    'use strict';

    angular
        .module('rc.prime.entity')
        .controller('EntityDetailsController', EntityDetailsController)

    EntityDetailsController.$inject = [
        '$scope',
        'common',
        'API',
        'EntityService',
        'EntityDetailsService'
    ];

    function EntityDetailsController(
        $scope,
        common,
        API,
        EntityService,
        EntityDetailsService
    ) {
        let vm = this;

        /** Common Modules */
        let $timeout = common.$timeout;
        let ApplicationPermissions = common.ApplicationPermissions;
        let EntityDetails = common.EntityDetails;
        let generateDynamicTableColumnsService = common.GenerateDynamicTableColumnsService;
        let loadDynamicTableService = common.LoadDynamicTableService;
        let LocalMemory = common.LocalMemory;
        let logger = common.Logger.getInstance('EntityDetailsController');


        vm.returnValue = "";
        vm.entityInformation = {};
        vm.pagedetails = {};
        vm.entitiesList = {};
        vm.ed_details = {};
        vm.previousED = {};

        vm.isShowDetails = false;
        vm.isShowValidations = false;
        vm.isShowAdd = false;
        vm.isShowHistory = false;

        vm.saveBtnText = 'Save';
        vm.saveBtnError = false;
        vm.isSaveSuccess = false;
        vm.updateBtnText = 'Update';
        vm.updateBtnError = false;
        vm.isUpdateSuccess = false;
        vm.isConfirmDelete = false;
        vm.isDeleteSuccess = false;
        vm.uuid = "86";

        vm.getEntityInformation = function () {
            vm.entityInformation = EntityDetails.API.GetEntityInformation(vm.uuid);
        };

        vm.getPermissions = function () {
            ApplicationPermissions.Module.InitializePermissions([vm.entityInformation.uuid]).then(accessRules => {
                vm.entityInformation.accessRules = accessRules;;
                vm.reload();
            });
        };

        vm.getModelAndSetValidationRules = function () {
            EntityDetails.API.GetModelAndSetValidationRules(vm.uuid).then(model => {
                vm.getDynamicColumns(model);
            });
        };

        vm.initializeEntityDetails = function () {
            vm.getEntityInformation();
            vm.getModelAndSetValidationRules();
            vm.getPermissions();
            vm.getEntityList();
        };

        vm.watchers = function () {
            $scope.$watch(angular.bind(vm.returnValue, function () {
                return vm.returnValue;
            }), function (value) {});
        };

        vm.getDynamicColumns = function (model) {
            let supportActions = {};
            let alterTitles = {};
            let drillTo = {
                "rules": {
                    title: "Rules",
                    show: true
                }
            }
            let edMeta = generateDynamicTableColumnsService.getTableColumns(model, supportActions, alterTitles, drillTo);
            if (LocalMemory.API.Get(vm.entityInformation.tableName)) {
                $scope.edcols = LocalMemory.API.Get(vm.entityInformation.tableName);;
            } else {
                $scope.edcols = edMeta.cols;
            }
            $scope.edGroupByDropdown = edMeta.dropdownList;
        };

        vm.reload = function () {
            $scope.selectedRow = null;
            EntityDetailsService.API.GetEntityDetailsList()
                .then(response => {
                    $scope.loadNgTableData(response, vm.returnValue, vm.entityInformation.tableName);
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.loadNgTableData = function (response, returnData, tableName, groupByFlag) { // Ng-dynamic - Loading group by data after group by event
            if (!groupByFlag) {
                $scope.et_response = response;
            }

            var table_data = loadDynamicTableService.getTableData(response, returnData);
            vm.returnValue = table_data.returnValue;

            if ($scope.entity_details_list !== undefined) {
                vm.pagedetails.rowsperpage = $scope.entity_details_list.count();
                vm.pagedetails.pageno = $scope.entity_details_list.page();
            }
            $scope.entity_details = $scope.getTable($scope.et_response, vm.returnValue, vm.pagedetails);
            $scope.entity_details_list = $scope.entity_details;
            $scope.setinstance = $scope.entity_details;
        };

        vm.loadMicroServiceViews = function (info) {
            API.EntitySchemaAPI().ViewsByMicroserviceName.query({
                microservicename: info.micro_service_name
            }, function (res, d) {
                $scope.microServiceViews = res.data;
                vm.loadRespectiveEntityColumns(info);
            });
        };

        vm.loadRespectiveEntityColumns = function (info) {
            $scope.fields = [];
            API.EntitySchemaAPI("allow-data").ColumnsByTableName.query({
                table_name: info.view_name
            }, function (res, d) {
                $scope.fields = res.data;
                info.fields = res.data;
            });
        };

        vm.showRules = function (model_name, microServiceName) {
            vm.entityname = microServiceName;
            vm.model_show = model_name;
            EntityDetailsService.API.GetModel(model_name, microServiceName).then((response) => {
                vm.isShowValidations = true;
                vm.isShowDetails = false;
                $scope.model = JSON.parse(JSON.stringify(response));
            }).catch(error => {

            });

        };

        $scope.$on('json-updated', function (msg, value) {
            EntityDetailsService.API.UpdateModel(vm.entityname, vm.model_show, value).then(response => {})
                .catch(error => {});
        });

        vm.save = function (data) {
            vm.saveBtnText = 'Saving now...';
            data.entity_id = data.entity.id;
            data.entity = data.entity.entity;
            EntityDetailsService.API.InsertEntityDetails(data)
                .then(response => {
                    vm.reload();
                    vm.previousED = data
                    vm.saveBtnText = 'Save';
                    vm.isSaveSuccess = true;
                })
                .catch(error => {
                    vm.saveBtnText = 'Oops.!! Something went wrong';
                    vm.saveBtnError = true;
                    $timeout(function () {
                        vm.saveBtnText = 'Save';
                        vm.saveBtnError = false;
                    }, 3000);
                });

        };

        vm.update = function (data) {
            vm.updateBtnText = 'Updating Now...';
            EntityDetailsService.API.UpdateEntityDetails(data)
                .then(response => {
                    vm.isShowHistory = false;
                    vm.updateBtnText = 'Done';
                    vm.isUpdateSuccess = true;
                    vm.reload();
                }).catch(error => {
                    vm.updateBtnText = 'Oops.!! Something went wrong';
                    vm.updateBtnError = true;
                    $timeout(function () {
                        vm.updateBtnText = 'Update';
                        vm.updateBtnError = false;
                    }, 3000);
                });
        };
        vm.delete = function (data) {
            EntityDetailsService.API.DeleteEntityDetails(data)
                .then(function (response) {
                    vm.isDeleteSuccess = true;
                    vm.isConfirmDelete = false;
                    vm.reload();
                    $scope.lastPageTableRecordDeleteAction($scope.setinstance);
                }, function (error) {});
        };

        vm.showconfirm = function () {
            vm.isShowHistory = false;
            vm.isConfirmDelete = true;
        }

        vm.getEntityList = function () {
            EntityService.API.GetAllEntities()
                .then(function (res) {
                    vm.entitiesList = res.data;
                });
        };

        vm.setInitialState = function () {
            angular.element('#pref_entity').focus();
        };

        vm.openForm = function () {
            vm.ed_details = {};
            vm.isShowDetails = true;
            vm.isShowValidations = false;
            vm.isShowAdd = true;
            vm.isConfirmDelete = false;
            vm.isSaveSuccess = false;
            vm.isUpdateSuccess = false;
            vm.isDeleteSuccess = false;
            vm.setInitialState();
        };

        vm.closeForm = function () {
            vm.isShowDetails = false;
            vm.isShowValidations = false;
        };

        vm.dblClickAction = function (entityData) {
            vm.showDetailsByID(entityData);
            vm.isShowDetails = vm.entityInformation.accessRules.PER86.update.value;
        };

        vm.showDetailsByID = function (entityData) {
            vm.ed_details = _.clone(entityData);
            vm.isShowAdd = false;
            vm.isShowHistory = true;
            vm.isConfirmDelete = false;
            vm.isSaveSuccess = false;
            vm.isUpdateSuccess = false;
            vm.isDeleteSuccess = false;
            vm.updateBtnText = 'Update';
            vm.setInitialState();
        };

        $scope.setClickedRow = function (index) {
            $scope.selectedRow = index;
        };

        //Close show history panel only
        $scope.closeShowHistory = () => {
            $scope.showhistory = false;
        };

        //Get history details for entity details
        $scope.loadHistory = () => {
            EntityDetails.API.GetHistoryData(vm.entityInformation.uuid, vm.ed_details.id)
                .then(response => {
                    $scope.historyList = response.data;
                    $scope.showhistory = true;
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.initializeEntityDetails();
        vm.watchers();
        $scope.loadNgTableData = vm.loadNgTableData;
        $scope.setClickedRow = self.setClickedRow;
    }
})();