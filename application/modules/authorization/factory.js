/**
 * Authorization Data Service Factory.
 * @param 	: {!angular.$http} $http The Angular http service.
 * @param 	: {calculus.application_configuration} application_configuration Calculus application configuration service.
 * @return : eturns javascript functions.
 */
function AuthorizationDataFactory($resource, $http, application_configuration) {

    return {

        AuthAPI: function(UAPrefixId) {
            return {
                /**
                 * Get All Permissions
                 * @method : GET
                 * @return :  promise with all the permission details.
                 */
                getPermissions: function() {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': "allow-data" },
                        url: application_configuration.apiServer + '/api/authorization/accesspermissions'
                    });
                },
                /**
                 * Get All Permissions for particular module
                 * @param 	: module_id
                 * @method  : GET
                 * @return  : promise with all the permission for specific module id
                 */
                getPermissionsForModule: function(module_id) {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': "allow-data" },
                        url: application_configuration.apiServer + '/api/authorization/accesspermissions/?module_id=' + module_id
                    });
                },
                /**
                 * Get All Roles
                 * @method  : GET
                 * @return  : promise with all the roles
                 */
                getRoles: function() {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': "allow-data" },
                        url: application_configuration.apiServer + '/api/authorization/accessrole'
                    });
                },
                Roles: $resource(application_configuration.apiServer + '/api/authorization/accessrole/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),
                Permissions: $resource(application_configuration.apiServer + '/api/authorization/accesspermissions', {

                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),

                /**
                 * Get All users
                 * @method  : GET
                 * @return  : promise with all the users
                 */
                getUsers: function() {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': "allow-data" },
                        url: application_configuration.apiServer + '/api/user'
                    });
                },

                /**
                 * Get All active users
                 * @method  : GET
                 * @return  : promise with all the users
                 */
                getActiveUsers: function() {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/user/activeusers'
                    });
                },
                /**
                 * Get All Roles for specific user
                 * @param 	: user_id
                 * @method  : GET
                 * @return  : promise with all role associated with a user id
                 */
                getRolesForUser: function(user_id) {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': "allow-data" },
                        url: application_configuration.apiServer + '/api/authorization/userrole/user_id/' + user_id
                    });
                },
                /**
                 * Get All Roles for specific user
                 * @param 	: user_id
                 * @method  : GET
                 * @return  : promise with all role associated with a user id
                 */
                getPermissionsForUser: function(user_id) {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': "allow-data" },
                        url: application_configuration.apiServer + '/api/authorization/userpermissions/user_id/' + user_id
                    });
                },


                /**
                 * Add a specific permission for a user
                 * @method  : POST
                 * @param 	: user_id
                 * @body 	: permission_id
                 * @return  : promise with success and error handlers
                 */
                UserRoles: $resource(application_configuration.apiServer + '/api/authorization/userrole/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),
                UserRolesByUserId: $resource(application_configuration.apiServer + '/api/authorization/userrole/user_id/:user_id', {
                    'user_id': '@user_id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),

                UserRolesPermissionsByPrefixes: $resource(application_configuration.apiServer + '/api/authorization/userrolespermissions/:prefixes', {
                    prefixes: '@prefixes'
                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    }
                }),
                getUserRolesPermissionsByUUIDs: function(uuids) {
                    try {
                        return $http.get(application_configuration.apiServer + '/api/authorization/userrolespermissions/uuids/' + uuids)
                            .then(response => {
                                return response.data;
                            })
                            .catch(error => {
                                //logger.error(error);
                            });

                    } catch (error) {
                        return new Promise((resolve, reject) => {
                            let error_object = {
                                message: "invalid uuids " + uuids,
                                error: error
                            }
                            reject(error_object);
                        });
                    }
                },
                /**
                 * Add a specific permission for a user
                 * @method  : POST
                 * @param 	: user_id
                 * @body 	: permission_id
                 * @return  : promise with success and error handlers
                 */
                UserPermissions: $resource(application_configuration.apiServer + '/api/authorization/userpermissions', {

                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),
                UserPermissionsByUserId: $resource(application_configuration.apiServer + '/api/authorization/userpermissions/user_id/:user_id', {
                    'user_id': '@user_id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),
                UserPermissionsByUserIdAndPrefix: $resource(application_configuration.apiServer + '/api/authorization/userpermissions/userid/prefix/:prefix', {
                    'prefix': '@prefix'
                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }
                }),
                UserPermissionsByUserIdAndPrefixes: $resource(application_configuration.apiServer + '/api/authorization/userpermissions/userid/prefixes', {
                    'prefixes': '@prefixes'
                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }
                }),
                RolePermission: $resource(application_configuration.apiServer + '/api/authorization/accessrolepermission/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),

                RolePermissionsByRoleId: $resource(application_configuration.apiServer + '/api/authorization/accessroleandpermission/role_id/:role_id', {
                    'role_id': '@role_id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: { 'prefix-id': "allow-data" },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }

                }),
                RolePermissionsByRolesAndPrefix: $resource(application_configuration.apiServer + '/api/authorization/accessrolepermission', {
                    'roles': '@roles',
                    'prefix': '@prefix'
                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }
                }),
                RolePermissionsByRolesAndPrefixes: $resource(application_configuration.apiServer + '/api/authorization/accessrolepermission/prefixes', {
                    'roles': '@roles',
                    'prefixes': '@prefixes'
                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }
                }),
                RolePermissionsByRoles: $resource(application_configuration.apiServer + '/api/authorization/accessrolepermission', {
                    'roles': '@roles'
                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: { 'prefix-id': UAPrefixId },
                        isArray: false,
                        cancellable: true
                    }
                }),
                UserPermissionsAndRolesPermissions: $resource(application_configuration.apiServer + '/api/authorization/userpermissionsandrolespermissions', {

                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    }
                }),
                UserPermissionsAndRolesPermissionsByPrefixes: $resource(application_configuration.apiServer + '/api/authorization/userpermissionsandrolespermissions/prefixes', {
                    prefixes: '@prefixes'
                }, {
                    query: {
                        method: 'get',
                        headers: { 'prefix-id': "allow-data" },
                        isArray: false,
                        cancellable: true
                    }
                }),

                /**
                 * [removeRolesFromUser description]
                 *
                 * @method removeRolesFromUser
                 *
                 * @param  {[type]}            user_id [description]
                 *
                 * @return {[type]}            [description]
                 */
                removeRolesFromUser: function(user_id) {
                    return $http({
                        method: 'DELETE',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/authorization/userrole/user_id/' + user_id

                    });
                },

                /**
                 * Remove a specific permission from the role
                 * @method  : POST
                 * @param 	: role_id
                 * @body 	: permission_id
                 * @return  : promise with success and error handlers
                 */
                removePermissionForRole: function(role_id, permission_id) {
                    return $http({
                        method: 'POST',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/authorization/accessrole/removepermission?role_id=' + role_id,
                        data: permission_id
                    });
                },
                /**
                 * Remove a specific permission from the user
                 * @method  : POST
                 * @param 	: user_id
                 * @body 	: permission_id
                 * @return  : promise with success and error handlers
                 */
                removePermissionForUser: function(user_id, permission_id) {
                    return $http({
                        method: 'POST',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/authorization/user/removepermission?role_id=' + user_id,
                        data: permission_id
                    });
                },
                /**
                 * Add a specific permission for a role
                 * @method  : POST
                 * @param 	: role_id
                 * @body 	: permission_id
                 * @return  : promise with success and error handlers
                 */
                addPermissionToRole: function(role_id, permission_id) {
                    return $http({
                        method: 'POST',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/authorization/accessrolepermission/removepermission?role_id=' + role_id,
                        data: permission_id
                    });
                },
                /**
                 * Add a specific permission for a user
                 * @method  : POST
                 * @param 	: user_id
                 * @body 	: permission_id
                 * @return  : promise with success and error handlers
                 */
                addPermissionToUser: function(user_id, permission_id) {
                    return $http({
                        method: 'POST',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/authorization/userpermission/removepermission?role_id=' + user_id,
                        data: permission_id
                    });
                },

                /**
                 * Get All users by Status
                 * @method  : GET
                 * @return  : promise with all the users
                 */
                getUsersByStatus: function(status_id) {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/user/status',
                        params: { status_id: status_id }
                    });
                },
                getUserStatuses: function() {
                    return $http({
                        method: 'GET',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/user/userstatuses'
                    });
                },
                updateUserStatus: function(user_id, data) {
                    return $http({
                        method: 'PUT',
                        headers: { 'prefix-id': UAPrefixId },
                        url: application_configuration.apiServer + '/api/user/status',
                        params: { user_id: user_id },
                        data: data
                    });
                },
            }
        }
    }
}
AuthorizationDataFactory.$inject = [
    '$resource',
    '$http',
    'application_configuration'
]
calculus.factory('AuthorizationDataFactory', AuthorizationDataFactory);