(function() {
    'use strict';

    angular.module('rc.prime.mto').controller('MTOParameterController', MTOParameterController);
    MTOParameterController.$inject = [
        "$scope",
        "common",
        "MTOParameterService"
    ];

    function MTOParameterController(
        $scope,
        common,
        MTOParameterService
    ) {
        /* jshint validthis:true */
        var vm = this;
        vm.uuid = 37;
        vm.oldMTOParams = {};

        let logger = common.Logger.getInstance('MTOParameterController');
        vm.getEntityInformation = function() {
            common.EntityDetails.API.GetEntityInformation(vm.uuid).then(lt_information => {
                vm.entityInformation = lt_information;
                $scope.name = vm.entityInformation.name;
                $scope.getStatuses(common.Identifiers.mto_option); // GET statuses for MTO module
            });
        };


        vm.getParameters = function() {
            MTOParameterService.API.GetMTOParameter()
                .then((response) => {
                    //Ng- Dynamic Table - Columns creations- Setting new,column,view column etc
                    vm.mtoParams = response.data[0];
                })
                .catch((error) => {
                    logger.error(error);
                });
        };

        vm.closeForm = function() {
            vm.message = null;
            vm.isShowDetails = false;
            vm.updateBtnText = 'Update';
            vm.updateBtnError = 'false';
            common.$timeout(function() {
                vm.isUpdateSuccess = false;
            }, 500);

        };

        vm.dblClickAction = function(mtoParameter) {
            vm.oldMTOParams = _.clone(mtoParameter);
            vm.isShowDetails = true;
            vm.isUpdateSuccess = false;
            vm.updateBtnText = 'Update';
        };


        vm.hasUpdateChanges = function(payload) {
            if (vm.oldMTOParams === undefined || vm.oldMTOParams.status_id !== payload.status_id) {
                return true;
            } else {
                return false;
            }
        };
        vm.update = function(payload) {
            vm.updateBtnText = 'Updating Now...';
            if (vm.hasUpdateChanges(payload) === true) {
                $scope.showhistory = false;
                MTOParameterService.API.InsertMTOParameter(payload)
                    .then((response) => {
                        vm.getParameters();
                        vm.isShowDetails = false;
                    })
                    .catch((error) => {
                        vm.isShowDetails = true;
                    });
            } else {
                vm.updateBtnText = 'Nothing to update';
                vm.updateBtnError = true;
                common.$timeout(function() {
                    vm.updateBtnText = 'Update';
                    vm.updateBtnError = false;
                }, 1000);
            }
        };

        function activate() {
            vm.getEntityInformation();
            vm.getParameters();
        }
        activate();
    }
})();