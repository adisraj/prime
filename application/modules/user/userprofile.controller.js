(function() {
    'use strict';

    angular
        .module('rc.prime.user')
        .controller('UserProfileController', UserProfileController)

    UserProfileController.$inject = [
        '$scope',
        'common',
        'UserService',
        'ngTableParams',
        'AuthorizationDataFactory',
        'MFAService',
        'RoleService',
        'PreferenceService'
    ];

    function UserProfileController(
        $scope,
        common,
        UserService,
        ngTableParams,
        AuthorizationDataFactory,
        MFAService,
        RoleService,
        PreferenceService
    ) {
        let vm = this;
        let $timeout = common.$timeout;
        let SessionMemory = common.SessionMemory;
        let logger = common.Logger.getInstance('UserProfileController');
        let AuthAPI = AuthorizationDataFactory.AuthAPI("");

        vm.user_details = {};
        vm.isShowPermissions = false;
        vm.$showDetails = false;
        vm.updateBtnText = 'Update';
        vm.$updatebtnerror = false;
        vm.$updatesuccess = false;

        vm.update_user = function(user_details) {
            if (user_details.name) {
                UserService.API.UpdateUser(user_details).then((response) => {}).catch(error => { logger.error(error) });
            }
            vm.updateBtnText = 'Updating Now...';
            UserService.API.UpdateUserDetails(user_details)
                .then((response) => {
                        vm.updateBtnText = 'Done';
                        vm.$updatesuccess = true;
                    },
                    function(error) {
                        vm.updateBtnText = 'Oops.!! Something went wrong';
                        vm.$updatebtnerror = true;
                        $timeout(function() {
                            vm.updateBtnText = 'Update';
                            vm.$updatebtnerror = false;
                        }, 5000);
                    });
        };

        vm.disableMFA = function() {
            MFAService.API.RefreshMFAByUser(vm.user_details.user_id)
                .then(response => {
                    vm.message = response.data.message;
                })
                .catch(error => {
                    vm.error = error.message;
                });
        };

        vm.clearSessions = function() {
            if (vm.user_details.sessions.length > 0) {
                UserService.API.ClearSessions(vm.user_details.user_id)
                    .then(response => {
                        vm.message = response.data.message;
                        vm.getUserDetails();
                    })
                    .catch(error => {
                        vm.error = error.message;
                    });
            } else {
                vm.errorMessage = "Noting to clear";
            }
            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500);
        };

        vm.resetPreferencesForUser = function() {
            if (!vm.option_default_flag || !vm.value_default_flag) {
                PreferenceService.API.ResetPreferencesToDefault(vm.userId)
                    .then(response => {
                        vm.message = "Preferences set to default";
                        vm.getPreferencesForUser(vm.userId);
                        vm.default_flag = true;
                    }).catch(error => {
                        logger.error(error);
                    });
            } else if (vm.option_default_flag && vm.value_default_flag) {
                vm.errorMessage = "Noting to change";
            }
            $timeout(() => {
                vm.message = null;
                vm.errorMessage = null;
            }, 2500);
        }

        vm.getPreferencesForUser = function(userId) {
            PreferenceService.API.GetPreferencesByUserId(userId)
                .then(response => {
                    vm.allPreferences = response.data;
                    vm.storePreferences(vm.allPreferences);
                }).catch(error => {
                    logger.error(error);
                });
        };

        vm.storePreferences = function(preferencesList) {
            for (var i = 0; i < preferencesList.length; i++) {
                let user_preference = preferencesList[i].preference.replace(new RegExp(' ', 'g'), '.');
                if (preferencesList[i].option_id && !preferencesList[i].value) {
                    vm.option_default_flag = preferencesList[i].default_flag;
                    SessionMemory.API.Post('user.preference.' + user_preference, preferencesList[i].option);
                } else if (preferencesList[i].value && !preferencesList[i].option_id) {
                    vm.value_default_flag = preferencesList[i].default_flag;
                    SessionMemory.API.Post('user.preference.' + user_preference, preferencesList[i].value);
                }
            };
            vm.getUserDetails();
        };

        vm.isVerified = function() {
            UserService.API.GetUserById()
                .then(response => {
                    if (response[0].is_mfa_verified === 1) {
                        vm.is_verified = true;
                    } else {
                        vm.is_verified = false;
                    }
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.getUserDetails = function() {
            let user_information = {};
            vm.userId = SessionMemory.API.Get('user.id');
            vm.isSetLocation = true;
            UserService.API.GetUserById().then((user_response) => {
                    user_information = user_response[0];
                    vm.user_information = user_response[0];
                    UserService.API.GetUserDetailsByUserId(user_information.id)
                        .then((response) => {
                            UserService.API.GetSessionsForUser(user_information.id)
                                .then(session_response => {
                                    UserService.API.GetLoginAttempts(user_information.username)
                                        .then(attempt_response => {
                                            vm.user_details = response[0];
                                            vm.user_details.time_format = SessionMemory.API.Get('user.preference.time.format');
                                            vm.user_details.date_format = SessionMemory.API.Get('user.preference.date.format');
                                            vm.user_details.sessions = session_response;
                                            vm.user_details.login_attempts = attempt_response.message;
                                            vm.user_details.last_logged_time = attempt_response.message[0].timestamp;
                                            vm.loadRolesByUserId(user_information.id);
                                            vm.isVerified();
                                        });
                                });
                        });
                })
                .catch((error) => {
                    logger.error(error);
                });
        };


        $scope.search_user_roles = {
            term: ''
        };


        $scope.search_user_roles = {
            term: ''
        };

        vm.fetchUserRoles = function(data) {
            // body...
            $scope.user_roles = new ngTableParams({
                page: 1,
                count: 10,
                filter: $scope.search_user_roles
            }, {
                total: data.length,
                getData: function($defer, params) {
                    if (params.filter().term) {
                        orderedData = params.filter() ? $filter(
                            'filter')(data, params.filter()
                            .term) : data;
                    } else {
                        orderedData = params.sorting() ?
                            $filter('orderBy')(data, params.orderBy()) :
                            data;
                    }
                    $defer.resolve(orderedData.slice((params.page() -
                            1) * params.count(), params
                        .page() * params.count()));
                }
            });
        }

        vm.loadRolesByUserId = function(id) {
            UserService.API.GetAccessRolesByUser(id)
                .then((response) => {
                    vm.userRoles = response.data;
                    vm.fetchUserRoles(vm.userRoles);
                });
        };

        vm.loadRolePermissionsByRoleId = function(id) {
            $scope.role_id = id;
            RoleService.API.GetRolePermission(id)
                .then(response => {
                    vm.assignedRolesPermissionsList = response.data;
                    vm.customRolePermissions(vm.assignedRolesPermissionsList);
                });
        };

        vm.customRolePermissions = function(dataObj) {
            var userRolePermMap = {};
            var ids = [];
            vm.userRolePermList = [];
            _.each(vm.assignedRolesPermissionsList, function(usrRolePermObj) {
                if (userRolePermMap[usrRolePermObj.entity_id] == undefined) {
                    userRolePermMap[usrRolePermObj.entity_id] = usrRolePermObj;
                    userRolePermMap[usrRolePermObj.entity_id][usrRolePermObj.permission] = 1;
                    ids.push(usrRolePermObj.entity_id);
                } else {
                    userRolePermMap[usrRolePermObj.entity_id][usrRolePermObj.permission] = 1;
                }
            });
            _.each(ids, function(id) {
                vm.userRolePermList.push(userRolePermMap[id]);
            });
        }

        vm.loadLoginAttempts = function() {
            UserService.API.GetLoginAttempts(vm.user_information.username, '10')
                .then(attempt_response => {
                    vm.user_details.login_attempts = attempt_response.message;
                });
        };

        vm.openForm = function() {
            vm.$updatesuccess = false;
            vm.$showDetails = true;
        };
        vm.closeForm = function() {
            vm.$showDetails = false;
        }

        activate();

        function activate() {
            vm.getUserDetails();
            vm.getPreferencesForUser(vm.userId);
        };
    }
})();