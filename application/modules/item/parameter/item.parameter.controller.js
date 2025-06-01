(function() {
    'use strict';

    angular.module('rc.prime.item').controller('ItemParameterController', ItemParameterController);
    ItemParameterController.$inject = [
        "$scope",
        "common",
        "ItemParameterService"
    ];

    function ItemParameterController(
        $scope,
        common,
        ItemParameterService
    ) {
        /* jshint validthis:true */
        var vm = this;
        vm.uuid = 12;
        vm.oldItemParams = {};
        vm.oldSkuFormat = {};
        vm.start_end_error = false;
        vm.current_error = false;
        let logger = common.Logger.getInstance('ItemParameterController');

        function activate() {
            vm.getEntityInformation();
            vm.getParameters();
        }

        vm.getEntityInformation = function() {
            common.EntityDetails.API.GetEntityInformation(vm.uuid).then(_information => {
                vm.entityInformation = _information;
                $scope.name = vm.entityInformation.name;
                $scope.getStatuses(common.Identifiers.item); // Getting Item Module status
            });
        };

        vm.getParameters = function() {
            ItemParameterService.API.GetItemParameter()
                .then((response) => {
                    vm.itemParams = response.data[0];
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
            vm.getParameters();
        };

        vm.dblClickAction = function(itemParameter, index) {
            vm.oldItemParams = _.clone(itemParameter);
            vm.isShowDetails = true;
            vm.configIndex = index;
            vm.isUpdateSuccess = false;
            vm.updateBtnText = 'Update';
            vm.start_end_error = false;
            vm.current_error = false;
        };


        vm.hasUpdateChanges = function(payload) {
            if (vm.oldItemParams === undefined || vm.oldItemParams.status_id !== payload.status_id) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Save or update item parameter
         */
        vm.saveItemParameter = function(payload) {
            vm.updateBtnText = 'Updating Now...';
            if (vm.hasUpdateChanges(payload) === true) {
                ItemParameterService.API.InsertItemParameter(payload)
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

        activate();
    }

})();