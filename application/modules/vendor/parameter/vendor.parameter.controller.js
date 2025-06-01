(function() {
    'use strict';

    angular.module('rc.prime.vendor').controller('VendorParameterController', VendorParameterController);
    VendorParameterController.$inject = [
        "$scope",
        "common",
        "VendorParameterService"
    ];

    function VendorParameterController(
        $scope,
        common,
        VendorParameterService
    ) {
        /* jshint validthis:true */
        var vm = this;
        vm.uuid = 2;
        vm.oldVendorParams = {};

        let logger = common.Logger.getInstance('VendorParameterController');
        vm.getEntityInformation = function() {
            common.EntityDetails.API.GetEntityInformation(vm.uuid).then(_information => {
                vm.entityInformation = _information;
                $scope.name = vm.entityInformation.name;
                $scope.getStatuses(common.Identifiers.vendor); // Getting Vendor Module status
            });
        };

        vm.getParameters = function() {
            VendorParameterService.API.GetVendorParameter()
                .then((response) => {
                    //Ng- Dynamic Table - Columns creations- Setting new,column,view column etc
                    vm.vendorParams = response.data[0];
                })
                .catch((error) => {
                    logger.error(error);
                });
        };

        vm.dblClickAction = function(vendorParameter) {
            vm.oldVendorParams = _.clone(vendorParameter);
            vm.isShowDetails = true;
            vm.isUpdateSuccess = false;
            vm.updateBtnText = 'Update';
        };


        vm.hasUpdateChanges = function(payload) {
            if (vm.oldVendorParams === undefined || vm.oldVendorParams.status_id !== payload.status_id) {
                return true;
            } else {
                return false;
            }
        };
        vm.update = function(payload) {
            vm.updateBtnText = 'Updating Now...';
            if (vm.hasUpdateChanges(payload) === true) {
                $scope.showhistory = false;
                VendorParameterService.API.InsertVendorParameter(payload)
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