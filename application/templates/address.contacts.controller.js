(function() {
    'use strict';

    angular
        .module('calculus')
        .controller('AddrCntController', AddrCntController)

    AddrCntController.$inject = [
        '$scope',
        'AddressContactService',
        'common',
        'valdr',
        "AS400FieldsRegularExpression"
    ];

    function AddrCntController(
        $scope,
        AddressContactService,
        common,
        valdr,
        AS400FieldsRegularExpression
    ) {
        var vm = this;
        let $timeout = common.$timeout;
        let logger = common.Logger.getInstance('AddrCntController');
        vm.showAddress = true;
        vm.as400FieldsRegularExpression=AS400FieldsRegularExpression
        vm.showAddressPanel = () => {
            $scope.isShowAddressPanel = true;
            vm.showAddress = true;
            $scope.isShowContactsPanel = false;
            vm.showContacts = false;
        }

        vm.showContactPanel = () => {
            $scope.isShowContactsPanel = true;
            vm.showContacts = true;
            $scope.isShowAddressPanel = false;
            vm.showAddress = false;
        }

        activate();

        function activate() {}
    }
})();