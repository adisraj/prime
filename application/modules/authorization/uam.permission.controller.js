(function() {
    calculus.controller('AccessPermissionController', AccessPermissionController);

    AccessPermissionController.$inject = [
        'Logger',
        '$state',
        'RoleService'
    ];

    function AccessPermissionController(
        Logger,
        $state,
        RoleService
    ) {
        let vm = this;
        vm.$showDetails = false;
        vm.saveBtnText = 'Save';
        vm.$savebtnerror = false;
        vm.isSaveSuccess = false;
        vm.updateBtnText = 'Update';
        vm.$updatebtnerror = false;
        vm.$updatesuccess = false;
        vm.moduleName = "User";
        vm.moduleNameRoles = "Role";
        vm.showDetails = false;
        vm.isShowPermission = false;
        vm.$updateFormParameters = false;
        vm.isShowPermissionDetails = false;
        vm.isShowUser = false;
        let logger = Logger.getInstance('AccessPermissionController');

        vm.loadAvailablePermissions = function() {
            vm.isSummary = true;
            vm.isSettings = false;
            RoleService.API.GetAccessPermissions()
                .then((response) => {
                    vm.availablePermissions = response.data.data;
                })
                .catch((error) => {
                    logger.error(error);
                });
        };

        vm.changeView = function(val) {
            if (val === 1) {
                vm.showRoles = true;
                vm.$showDetails = false;
                vm.$showRolePermissions = false;
                document.getElementById("rolesBtn").focus();
            } else if (val === 2) {
                vm.showPermission = true;
            } else if (val === 5) {
                vm.activeUsers = true;
                document.getElementById("activeUsersBtn").focus();
            } else if (val === 4) {}
        };

        if ($state.current.name === "authorization.master.roles") {
            vm.changeView(1);
        } else if ($state.current.name === "authorization.master.permissions") {
            vm.changeView(2);
        } else if ($state.current.name === "authorization.master.activeusers") {
            vm.changeView(5);
        } else {
            vm.changeView(4);
        }

        vm.viewPermission = function(permission) {
            vm.permission_info = permission;
        }
    }
})();