(function() {
    'use strict';

    angular.module('rc.prime.location').controller('LocationParameterController', LocationParameterController);
    LocationParameterController.$inject = [
        "$scope",
        "common",
        "LocationParameterService"
    ];

    function LocationParameterController(
        $scope,
        common,
        LocationParameterService
    ) {
        /* jshint validthis:true */
        var vm = this;
        vm.uuid = 19;
        vm.oldLocationParams = {};
        vm.updateParamBtnError = false;

        let logger = common.Logger.getInstance('LocationParameterController');
        vm.getEntityInformation = function() {
            common.EntityDetails.API.GetEntityInformation(vm.uuid).then(lp_information => {
                vm.entityInformation = lp_information;
                $scope.name = vm.entityInformation.name;
                $scope.getStatuses(common.Identifiers.location);
            });
        };

        vm.getParameters = function() {
            LocationParameterService.API.GetLocationParameter()
                .then((response) => {
                    //Ng- Dynamic Table - Columns creations- Setting new,column,view column etc
                    vm.locationParams = response[0];
                })
                .catch((error) => {
                    logger.error(error);
                });
        };

        vm.dblClickAction = function(locationParameter) {
            vm.oldLocationParams = _.clone(locationParameter);
            vm.isShowDetails = true;
            vm.isUpdateSuccess = false;
            vm.updateBtnText = 'Update';
        };

        vm.hasUpdateChanges = function(payload) {
            if (vm.oldLocationParams === undefined || vm.oldLocationParams.status_id !== payload.status_id) {
                return true;
            } else {
                return false;
            }
        };
        vm.update = function(payload) {
            vm.updateBtnText = 'Updating Now...';
            if (vm.hasUpdateChanges(payload) === true) {
                $scope.showhistory = false;
                LocationParameterService.API.InsertLocationParameter(payload)
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