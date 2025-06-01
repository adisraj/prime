function EntityDetailsController($scope,
    $window,
    $filter,
    valdr,
    identifiers,
    EntityDataService,
    API,
    ngTableParams,
    $stateParams,
    $state,
    UserDataFactory,
    Notification,
    ValidationAPI,
    schemaWithValidationService,
    loadDynamicTableService,
    generateDynamicTableColumnsService,
    $timeout) {

    let EntityDetails = EntityDataService.EntityDetails;

    let self = this;
    this.selectedEntity = "";
    this.entityDetailPageDetails = {};
    this.pagedetails = {};
    this.moduleName = "Entity Details";
    this.$saveBtnText = 'Save';
    this.$savebtnerror = false;
    this.$savesuccess = false;
    this.$updateBtnText = 'Update';
    this.$updatebtnerror = false;
    this.$updatesuccess = false;
    this.$confirmdelete = false;
    this.$deletesuccess = false;

    this.getIdentifiersList = function() {
        return [
            identifiers.entity
        ];
    }

    this.setEntityInfo = function() {
        self.entityInfo = {
            EntityDetails: {
                name: 'Entity Details',
                moduleName: 'EntityDetails',
                tableName: 'entity_details_list',
                apiName: EntityDetails,
                modelName: 'entity_details',
                eventName: 'reloadEntityDetails',
                microServiceName: 'entity',
                uuid: 86
            }
        }
    }

    this.initEntityDetails = function() {
        ValidationAPI.setProgramNumber($state.current.templateUrl, $scope);
        self.setEntityInfo();
        $scope.getEntitiesForUUIDs(self.getIdentifiersList(), 'initScreen');
        $scope.$on('initScreen', function(event, attrs) {
            self.setEntityInfo(); // Setting Entity Info Eg. name etc
            self._loadModelAndSetValidations('EntityDetails');
            self.registerEvent('EntityDetails'); // Registering event for Entity
            self.reload('EntityDetails');
        });
    }

    this.registerEvent = function(entityName) {
        $scope.$on(self.entityInfo[entityName]['eventName'], function(event, args) {
            $scope.master_id = args.response.inserted_id;
            self.reload(entityName);
        });
    };

    let EntityDetailsAPI = EntityDataService.EntityDetails.getInstance();
    let EntityModel = EntityDataService.EntityDetails.getModel();


    this._loadModelAndSetValidations = function(entityName) {
        schemaWithValidationService.getModel(self.entityInfo[entityName]['modelName'], self.entityInfo[entityName]['microServiceName']).then((res) => {
            $scope.model = res.model;

            $scope.updateConstraints = schemaWithValidationService.getUpdateConstraints($scope.model);
            valdr.addConstraints($scope.updateConstraints);
            $scope.getConstraints = valdr.getConstraints;
            let supportActions = {
                edit: true,
                delete: true
            };
            let alterTitles = {};
            let drillTo = {
                "rules": { title: "Rules", show: true }
            }
            let edMeta = generateDynamicTableColumnsService.getTableColumns(res.model, supportActions, alterTitles, drillTo);
            if ($window.localStorage.getItem('entity_details_list')) {
                $scope.edcols = JSON.parse($window.localStorage.getItem('entity_details_list'));
            } else {
                $scope.edcols = edMeta.cols;
            }
            $scope.edGroupByDropdown = edMeta.dropdownList;
        });
    };
    /** Watching Group By Return Values
     */
    this.watchers = function() {
        $scope.$watch(angular.bind(self.returnValue, function() {
            return self.returnValue;
        }), function(value) {
            //$scope.fetch();
        });
    };

    $scope.setClickedRow = function(index) {
        $scope.selectedRow = index;
    };


    this.dblClickAction = function(entity, entityData) {
        if (entity == "EntityDetails") {
            self.showDetailsByID(entityData);
            self.$showDetails = $scope.accessRules.PER86.update.value;
        }
    };

    this.showDetailsByID = function(details) {
        self.$showAdd = false;
        self.$showDetails = true;
        self.$confirmdelete = false;
        self.$savesuccess = false;
        self.$updatesuccess = false;
        self.$deletesuccess = false;
        self.$updateBtnText = 'Update';
        self.getAllEntities(details);
        self.getEntityList();
        self.setInitialState();
    };

    this.showconfirm = function() {
        self.$confirmdelete = true;
    };

    this.loadNgTableData = function(response, returnData, tableName, groupByFlag) { // Ng-dynamic - Loading group by data after group by event
        if (tableName == 'entity_details_list') {
            if (!groupByFlag) {
                $scope.et_response = response;
            }

            let table_data = loadDynamicTableService.getTableData(response, returnData);
            self.returnValue = table_data.returnValue;

            if ($scope.entity_details_list !== undefined) {
                self.pagedetails.rowsperpage = $scope.entity_details_list.count();
                self.pagedetails.pageno = $scope.entity_details_list.page();
            }
            $scope.entity_details = $scope.getTable($scope.et_response, self.returnValue, self.pagedetails);
            $scope.entity_details_list = $scope.entity_details;
            $scope.setinstance = $scope.entity_details;

        }
    }

    self.showAll = function() {
        entityName = 'EntityDetails';
        $scope.$showAllDetails = !$scope.$showAllDetails;
        (self.entityInfo[entityName]['apiName']).getInstance().query(function(response) {
            /**
             *  Ng- Dynamic Table - Columns creations- Setting new,column,view column etc
             */
            $scope.loadNgTableData(response, self.returnValue, 'entity_details_list');

        });
    }

    self.reload = function(entityName) {
        $scope.selectedRow = null;
        (self.entityInfo[entityName]['apiName']).getInstance().query(function(response) {
            /**
             *  Ng- Dynamic Table - Columns creations- Setting new,column,view column etc
             */
            $scope.fulldatalist = response;
            $scope.loadNgTableData(response, self.returnValue, 'entity_details_list');
        });
        setTimeout(function(argument) {
            // body...
            $scope.refreshed = false;
        }, 100)
    };

    self.resetData = function() {
        $scope.loadNgTableData(viewDataChangeService.getViewData(), self.returnValue, 'entity_details_list');
    }

    this.showMainList = function() {
        self.$showDetails = false;
        self.$showValidations = false;
        self.reload('EntityDetails');
    }

    $scope.showRules = function(data, entity) {
        $scope.entityname = entity;
        $scope.model_show = data;
        EntityDataService.EntityDetails.getModel(data, entity).then(
            (response) => {
                self.$showValidations = true;
                self.$showDetails = false;
                $scope.model = JSON.parse(JSON.stringify(response));
            },
            (error) => {
                logger.error(error);
            });
    };

    $scope.$on('json-updated', function(msg, value) {
        EntityDataService.EntityDetails.updateModel($scope.model_show, value, $scope.entityname).then(
            function(response) {},
            function(error) {}
        );
    });

    $scope.save_entity_details = function(entityName, data) {
        self.$saveBtnText = 'Saving now...';
        data.entity_id = data.entity.id;
        data.entity = data.entity.entity;
        $scope.save(new((self.entityInfo[entityName]['apiName']).getInstance())(), data, self.entityInfo[entityName]['eventName']).then(function(response) {
            self.previousA = data
            self.$saveBtnText = 'Save';
            self.$savesuccess = true;
        }, function(error) {
            self.$saveBtnText = 'Oops.!! Something went wrong';
            self.$savebtnerror = true;
            $timeout(function() {
                self.$saveBtnText = 'Save';
                self.$savebtnerror = false;
            }, 5000);
        });
    };

    $scope.update_entity_details = function(entityName, data) {
        self.$updateBtnText = 'Updating Now...';
        $scope.update(new((self.entityInfo[entityName]['apiName']).getInstance())(), data, self.entityInfo[entityName]['eventName']).then(function(response) {
            self.reload(entityName);
            self.$updateBtnText = 'Done';
            self.$updatesuccess = true;
        }, function(error) {
            self.$updateBtnText = 'Oops.!! Something went wrong';
            self.$updatebtnerror = true;
            $timeout(function() {
                self.$updateBtnText = 'Update';
                self.$updatebtnerror = false;
            }, 5000);
        });
    };

    $scope.delete_entity_details = function(data) {
        $scope.delete(new((self.entityInfo[entityName]['apiName']).getInstance())(), data, self.entityInfo[entityName]['eventName']).then(function(response) {
            self.$deletesuccess = true;
            self.$confirmdelete = false;
            self.$confirmAttrValDelete = false;
            self.reload(entityName);
            $scope.lastPageTableRecordDeleteAction($scope.setinstance);
        }, function(error) {});
    };

    this.editMode = false;

    this.loadRespectiveEntityColumns = function(info) {
        $scope.fields = [];
        API.EntitySchemaAPI("allow-data").ColumnsByTableName.query({
            table_name: info.view_name
        }, function(res, d) {
            $scope.fields = res.data;
            info.fields = res.data;
        });
    }

    this.loadMicroServiceViews = function(info) {
        $scope.fields = [];
        API.EntitySchemaAPI().ViewsByMicroserviceName.query({
            microservicename: info.micro_service_name
        }, function(res, d) {
            $scope.microServiceViews = res.data;
        });
    };

    this.getEntityList = function() {
        EntityDataService.Entity.getInstance().query(function(res) {
            $scope.entitiesList = res.data;
        });
    };

    this.getAllEntities = function(info) {
        if (info != undefined) {
            self.loadRespectiveEntityColumns(info);
        }
        EntityDataService.EntityDetails.getInstance().query(function(res) {
            $scope.entities = res.data;
        });
    }

    let MainClass = function() {
        this.getColumns = function(selectedEntity) {
            if (selectedEntity == 'EntityDetails') {
                return { model: 'edcols', values: $scope.edcols };
            }
        };
    };

    this.setInitialState = function() {
        angular.element('#pref_entity').focus();
    }

    this.createEntityDetails = function() {
        /** Mouse Trap Binding Event **/
        self.editMode = false;
        self.newEntityDeatails = true;
        self.$showDetails = true;
        self.$showValidations = false;
        self.$showAdd = true;
        setTimeout(function() {
            $scope.$apply(function() {});
        }, 1000);
        self.getAllEntities();
        self.getEntityList();
        self.setInitialState();
    }

    $scope.MainClass = new MainClass();

    self.initEntityDetails();
    self.watchers();
    $scope.loadNgTableData = self.loadNgTableData;
    $scope.setClickedRow = self.setClickedRow;
    $scope.dblClickAction = self.dblClickAction;
}

EntityDetailsController.$inject = [
    '$scope',
    '$window',
    '$filter',
    'valdr',
    'identifiers',
    'EntityDataService',
    'API',
    'ngTableParams',
    '$stateParams',
    '$state',
    'UserDataFactory',
    'Notification',
    'ValidationAPI',
    'schemaWithValidationService',
    'loadDynamicTableService',
    'generateDynamicTableColumnsService',
    '$timeout'
];

angular.module('rc.prime.entity').controller('EntityDetailsController', EntityDetailsController);