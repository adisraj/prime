(function() {
    calculus.controller('AuthorizationController', AuthorizationController);

    AuthorizationController.$inject = [
        'Logger',
        'SessionMemory',
        '$state',
        '$scope',
        '$timeout',
        'UserService',
        'MFAService'
    ];

    function AuthorizationController(
        Logger,
        SessionMemory,
        $state,
        $scope,
        $timeout,
        UserService,
        MFAService
    ) {
        let vm = this;
        vm.$showDetails = false;
        vm.saveBtnText = 'Save';
        vm.$savebtnerror = false;
        vm.isSaveSuccess = false;
        vm.updateBtnText = 'Update';
        vm.$updatebtnerror = false;
        vm.$updatesuccess = false;
        vm.showDetails = false;
        vm.isShowPermission = false;
        vm.$updateFormParameters = false;
        vm.showUserDetails = false;
        vm.isShowUser = false;
        let logger = Logger.getInstance('AuthorizationController');

        vm.getAccessRoles = function() {
            UserService.API.GetAccessRoles()
                .then((response) => {
                    vm.accessRolesList = JSON.parse(JSON.stringify(response.data));
                })
                .catch((error) => {
                    logger.error(error);
                });
        };


        vm.getAvailableRoles = function(assigned_roles) {
            UserService.API.GetAccessRoles()
                .then((response) => {
                    vm.roles = _.clone(response.data);
                    vm.availableRolesList = [];
                    let usersMap = {};
                    for (let i = 0; i < assigned_roles.length; i++) {
                        if (usersMap[assigned_roles[i]['role_id']] === undefined) {
                            usersMap[assigned_roles[i]['role_id']] = assigned_roles[i];
                        }
                    }
                    for (let i = 0; i < vm.roles.length; i++) {
                        if (!usersMap[vm.roles[i]['role_id']]) {
                            vm.availableRolesList.push(vm.roles[i]);
                        }
                    };
                })
                .catch((error) => {
                    logger.error(error);
                });
        };

        vm.loadRolesByUserId = function() {
            vm.isRoles = true;
            vm.isSummary = false;
            vm.isSettings = false;
            vm.selectedUserDetails = vm.user_information;
            UserService.API.GetAccessRolesByUser(vm.user_information.id)
                .then((response) => {
                    vm.currentUserRolesList = JSON.parse(JSON.stringify(response.data));
                    vm.getAvailableRoles(vm.currentUserRolesList);
                });
        };

        vm.loadRolePermissionsByRoleId = function(role) {
            vm.role_name = role.role;
            vm.role_id = role.role_id;
            vm.isShowPermission = true;
            UserService.API.GetRolePermission(vm.role_id, vm.user_information.id)
                .then(response => {
                    vm.assignedRolesPermissionsList = response.data;
                    vm.getPermissions();
                });
        };

        vm.loadAccessPermissionsByUser = function(role) {
            vm.role_name = role.role;
            vm.role_id = role.role_id;
            vm.isShowPermission = true;
            UserService.API.GetAccessPermissionsByUser(vm.user_information.id)
                .then(response => {
                    vm.assignedRolesPermissionsList = response.data;
                    vm.getPermissions();
                });
        };

        vm.getPermissions = function() {
            let role_permission_map = {};
            let ids = [];
            vm.role_permissions = [];
            _.each(vm.assignedRolesPermissionsList, function(role_permission) {
                if (role_permission_map[role_permission.entity_id] === undefined) {
                    role_permission_map[role_permission.entity_id] = role_permission;
                    role_permission_map[role_permission.entity_id][role_permission.permission] = 1;
                    ids.push(role_permission.entity_id);
                } else {
                    role_permission_map[role_permission.entity_id][role_permission.permission] = 1;
                }
            });

            _.each(ids, function(id) {
                vm.role_permissions.push(role_permission_map[id]);
            });
        };

        function loadUsers() {
            UserService.API.GetUser()
                .then((response) => {
                    vm.users = response.data;
                })
                .catch((error) => {
                    logger.error(error);
                });
        };

        vm.isVerified = function() {
            UserService.API.GetUserById()
                .then(response => {
                    if (response[0].is_mfa_verified === 1) {
                        vm.is_mfa_verified = true;
                    } else {
                        vm.is_mfa_verified = false;
                    }
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.changeView = function(val) {
            loadUsers();
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
            } else if (val === 4) {
                loadUsers();
            }
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

        /**** Configuration of Roles and Permissions *********/
        Array.prototype.arrayObjectIndexOf = function(property, value) {
            for (let i = 0, len = vm.length; i < len; i++) {
                if (vm[i][property] === value) return i;
            }
            return -1;
        };

        vm.assignAvailableRole = function(available_role) {
            vm.availableRolesList.splice(available_role, 1);
            vm.currentUserRolesList.push(available_role);
            let user_role = {};
            user_role.user_id = vm.user_information.id;
            user_role.role_id = available_role.id;
            UserService.API.InsertUserRole(user_role)
                .then(response => {
                    vm.loadRolesByUserId();
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.getActiveUsers = function() {
            UserService.API.GetActiveUsers()
                .then(response => {
                    vm.active_users = response;
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.userLogout = function(active_user, index) {
            UserService.API.LogoutUser(active_user.session_id)
                .then(response => {
                    vm.active_users.splice(index, 1);
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.removeUserRole = function(user_role) {
            vm.currentUserRolesList.splice(user_role, 1);
            vm.availableRolesList.push(user_role);
            UserService.API.DeleteUserRole(user_role)
                .then(response => {
                    vm.loadRolesByUserId();
                })
                .catch(error => {
                    logger.error(error);
                });
        };

        vm.disableUser = function(user_id) {
            UserService.API.DisableUser(user_id)
                .then(response => {
                    vm.message = "User disabled";
                })
                .catch(error => {
                    vm.message = "Unable to disable user";
                });
        };

        vm.createUser = function(user) {
            vm.saveBtnText = 'Saving Now...';
            UserService.API.CreateUser(user).then(function(response) {
                response.message = "User created Successfully !!!";
                vm.saveBtnText = 'Save';
                vm.isSaveSuccess = true;
            }, function(error) {
                vm.saveBtnText = 'Oops.!! Something went wrong';
                vm.$savebtnerror = true;
                $timeout(function() {
                    vm.saveBtnText = 'Save';
                    vm.$savebtnerror = false;
                }, 5000);
            });
        };

        vm.enableUser = function(user) {
            user.status_id = 1;
            UserService.API.UpdateUser(user).then((response) => {
                vm.message = "User activated"
            }).catch(error => { logger.error(error) });

        }

        vm.update_user_details = function(user_details) {
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

        vm.resetToDefaultPreference = function() {
            UserService.API.ResetToDefaultPreference(vm.user_information.id)
                .then(response => {
                    vm.message = "User preference set to default."
                })
                .catch(error => {
                    vm.error = error.message;
                });
        };

        vm.clearSessions = function() {
            UserService.API.ClearSessions(vm.user_information.id)
                .then(response => {
                    vm.message = response.data.message;
                    vm.showUserDetailsByID(vm.user_information);
                })
                .catch(error => {
                    vm.error = error.message;
                });
        };

        vm.dblClickAction = function(user_information) {
            vm.userId = user_information;
            vm.showUserDetails = true;
            vm.$updateFormParameters = true;
            vm.isSaveSuccess = false;
            vm.$updatesuccess = false;
            vm.$showDetails = true;
            vm.$showAdd = false;
            vm.showUserDetailsByID(user_information);
            vm.user_information = user_information;
            vm.setInitialState('user');
        };

        vm.showUserDetailsByID = function(user_information) {
            vm.isSummary = true;
            vm.isRoles = false;
            vm.isSettings = false;
            vm.setInitialState('user');
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
                                });
                        })
                })
                .catch((error) => {
                    logger.error(error);
                });
        };

        vm.loadLoginAttempts = function() {
            UserService.API.GetLoginAttempts(vm.user_information.username, '10')
                .then(attempt_response => {
                    vm.user_details.login_attempts = attempt_response.message;
                });
        };

        vm.isShowUser = function(user) {
            vm.showUser = true;
            vm.user = user;
        };

        vm.loadUserSettings = () => {
            vm.isSettings = true;
            vm.isRoles = false;
            vm.isSummary = false;
        }

        vm.selectedRow = null;
        vm.setClickedRow = function(index) {
            vm.selectedRow = index;
        };

        vm.disableMFA = function() {
            MFAService.API.RefreshMFA()
                .then(response => {
                    vm.message = response.data.message;
                })
                .catch(error => {
                    vm.error = error.message;
                });
        };

        vm.setInitialState = function(entityName) {
            if (entityName.toLowerCase() === 'user' && entityName) {
                angular.element('#inputName').focus();
            } else if (entityName.toLowerCase() === 'roles' && entityName) {
                angular.element('#role').focus();
            } else {
                // console.log("Entity Name id defined", entityName);
            }
        };

        vm.createNewFn = function(entityName) {
            if (entityName === 'User') {
                vm.$showAdd = true;
                vm.$showDetails = true;
                vm.$updateFormParameters = false;
                $scope.registeration = {};
                vm.setInitialState(entityName);
            }
        };

        vm.closeCreateNew = function() {
            vm.showDetails = false;
            vm.isShowUser = false;
            vm.updateBtnText = 'Update';
            vm.$updatebtnerror = false;
            $timeout(function() {
                vm.$updatesuccess = false;
                vm.isSaveSuccess = false;
            }, 1500);
        };

        vm.createUserPanel = function() {
            vm.isShowUser = true;
            vm.user = "";
            vm.isCreateUser = true;
            vm.isDeleteSuccess = false;
        };
    }
})();