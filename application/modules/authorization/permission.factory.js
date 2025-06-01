(function() {
    'use strict'
    angular.module('rc.prime.authorisation').factory('PermissionService', PermissionService);
    PermissionService.$inject = [
        '$http',
        'application_configuration'
    ]

    function PermissionService($http, application_configuration) {
        let API = {};

        API.CreateUser = createUser;
        API.CreateRolePermission = createRolePermission;
        API.DeleteUserRole = deleteUserRole;
        API.DeleteRolePermission = deleteRolePermission;
        API.GetAccessPermissionByPermission = getAccessPermissionByPermission;
        API.GetAccessPermissions = getAccessPermissions;
        API.GetUsers = getUsers;
        API.GetUserAccessRoles = getUserAccessRoles;
        API.GetUserDetailsByUserId = getUserDetailsByUserId;
        API.GetSessionsForUser = getSessionsForUser;
        API.GetLoginAttempts = getLoginAttempts;
        API.GetRolePermission = getRolePermission;
        API.InsertUserRole = insertUserRole;
        API.InsertRolePermission = insertRolePermission;
        API.UpdateUser = updateUser;
        API.UpdateUserDetails = updateUserDetails;

        return {
            API
        };

        function disableUser(user_id) {
            return $http.put(application_configuration.apiServer + '/api/user/disable/' + user_id);
        };

        function createUser(user) {
            return $http.post(application_configuration.apiServer + '/api/user/', user);
        };

        function createRolePermission(rolePermission) {
            return $http.post(application_configuration.apiServer + '/api/authorization/accessrolepermission/', rolePermission);
        };

        function getAccessPermissionByPermission(permission_id) {
            return $http.get(application_configuration.apiServer + '/api/authorization/accessrolepermission/permission_id/' + permission_id)
                .then((response) => {
                    return response.data;
                });
        };

        function getUserAccessRoles(role_id) {
            return $http.get(application_configuration.apiServer + '/api/authorization/userrole/role_id/' + role_id)
                .then((response) => {
                    return response.data;
                });
        };

        function deleteUserRole(user_role) {
            return $http.delete(application_configuration.apiServer + '/api/authorization/userrole/' + user_role.id, user_role);
        };

        function deleteRolePermission(role_permission) {
            return $http.delete(application_configuration.apiServer + '/api/authorization/accessrolepermission/' + role_permission.id);
        };

        function getRolePermission(role_id) {
            return $http.get(application_configuration.apiServer + '/api/authorization/accessroleandpermission/role_id/' + role_id)
                .then((response) => {
                    return response.data;
                });
        };

        function getAccessPermissions() {
            return $http.get(application_configuration.apiServer + '/api/authorization/accesspermissions')
                .then((response) => {
                    return response.data;
                });
        };

        function insertRolePermission(permissionDetails) {
            return $http.post(application_configuration.apiServer + '/api/authorization/accessrolepermission', permissionDetails);
        };

        function getUsers() {
            return $http.get(application_configuration.apiServer + '/api/user')
                .then((response) => {
                    return response.data;
                });
        };

        function getUserDetailsByUserId(user_id) {
            return $http.get(application_configuration.apiServer + '/api/user/details/user/' + user_id)
                .then((response) => {
                    return response.data.data;
                });
        };

        function getSessionsForUser(user_id) {
            return $http.get(application_configuration.apiServer + '/api/user/sessions/' + user_id)
                .then((response) => {
                    return response.data.data;
                });
        };

        function insertUserRole(roleDetails) {
            return $http.post(application_configuration.apiServer + '/api/authorization/userrole', roleDetails);
        };

        function getLoginAttempts(user) {
            return $http.get(application_configuration.apiServer + '/api/user/loginattempt/user/' + user)
                .then((response) => {
                    return response.data.data;
                });
        };

        function updateUser(user) {
            return $http.put(application_configuration.apiServer + '/api/user/userId/' + user.user_id, user);
        };

        function updateUserDetails(userDetails) {
            return $http.put(application_configuration.apiServer + '/api/user/details/' + userDetails.id, userDetails);
        };
    };
})();