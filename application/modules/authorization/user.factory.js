(function() {
  "use strict";
  angular.module("rc.prime.authorisation").factory("UserService", UserService);
  UserService.$inject = ["$http", "application_configuration"];

  function UserService($http, application_configuration) {
    let API = {};

    API.DisableUser = disableUser;
    API.ClearSessions = clearSessions;
    API.CreateUser = createUser;
    API.CreateRolePermission = createRolePermission;
    API.DeleteUserRole = deleteUserRole;
    API.GetActiveUsers = getActiveUsers;
    API.GetAccessRoles = getAccessRoles;
    API.GetAccessRolesByUser = getAccessRolesByUser;
    API.GetAccessPermissionsByUser = getAccessPermissionsByUser;
    API.GetUser = getUser;
    API.GetUserById = getUserById;
    API.GetUserDetailsByUserId = getUserDetailsByUserId;
    API.GetLoginAttempts = getLoginAttempts;
    API.GetRolePermission = getRolePermission;
    API.LogoutUser = logoutUser;
    API.InsertUserRole = insertUserRole;
    API.InsertRolePermission = insertRolePermission;
    API.ResetToDefaultPreference = resetToDefaultPreference;
    API.UpdateUser = updateUser;
    API.UpdateUserDetails = updateUserDetails;
    API.AuthenticateSecondaryPassword = authenticateSecondaryPassword;
    API.IsAllowedFeaturedPassword = isAllowedFeaturedPassword;
    API.GetAuthorizationPermission = getAuthorizationPermission;
    API.GetSystemConfigurationSettingsByCode = getSystemConfigurationSettingsByCode;

    return {
      API
    };

    function disableUser(user_id) {
      return $http.put(
        application_configuration.apiServer + "/api/user/disable/" + user_id
      );
    }

    function createUser(user) {
      return $http.post(
        application_configuration.apiServer + "/api/user/",
        user
      );
    }

    function createRolePermission(rolePermission) {
      return $http.post(
        application_configuration.apiServer +
          "/api/authorization/accessrolepermission/",
        rolePermission
      );
    }

    function clearSessions(user_id) {
      return $http.get(
        application_configuration.authenticationServer +
          "/api/user/clear/session/user/" +
          user_id
      );
    }

    function deleteUserRole(user_role) {
      return $http.delete(
        application_configuration.apiServer +
          "/api/authorization/userrole/" +
          user_role.id,
        user_role
      );
    }

    function getActiveUsers() {
      return $http
        .get(application_configuration.apiServer + "/api/user/activeusers")
        .then(response => {
          return response.data.data;
        });
    }

    function getAccessRoles() {
      return $http
        .get(
          application_configuration.apiServer + "/api/authorization/accessrole"
        )
        .then(response => {
          return response.data;
        });
    }

    function getAccessRolesByUser(user_id) {
      return $http
        .get(
          application_configuration.apiServer +
            "/api/authorization/userrole/user_id/" +
            user_id
        )
        .then(response => {
          return response.data;
        });
    }

    function getRolePermission(role_id, user_id) {
      return $http
        .get(
          application_configuration.apiServer +
            "/api/authorization/accessrolepermission/role/" +
            role_id +
            "/user/" +
            user_id
        )
        .then(response => {
          return response.data;
        });
    }

    function getUser() {
      return $http
        .get(application_configuration.apiServer + "/api/user")
        .then(response => {
          return response.data;
        });
    }

    function getUserDetailsByUserId(user_id) {
      return $http
        .get(
          application_configuration.apiServer +
            "/api/user/details/user/" +
            user_id
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getUserById() {
      return $http
        .get(application_configuration.apiServer + "/api/user/userId/")
        .then(response => {
          return response.data.data;
        });
    }

    function getAccessPermissionsByUser(user_id) {
      return $http
        .get(
          application_configuration.apiServer +
            "/api/authorization/accessrolepermission/search/user_id-" +
            user_id
        )
        .then(response => {
          return response.data;
        });
    }

    function insertRolePermission(rolePermission) {
      return $http.post(
        application_configuration.apiServer +
          "/api/authorization/rolepermission",
        rolePermission
      );
    }

    function insertUserRole(roleDetails) {
      return $http.post(
        application_configuration.apiServer + "/api/authorization/userrole",
        roleDetails
      );
    }

    function getLoginAttempts(user, limit) {
      return $http
        .get(
          application_configuration.apiServer +
            "/api/user/loginattempt/user/" +
            user +
            "/" +
            limit
        )
        .then(response => {
          return response.data.data;
        });
    }

    function logoutUser(session_id) {
      return $http.get(
        application_configuration.apiServer + "/api/user/logout/" + session_id
      );
    }

    function resetToDefaultPreference(user_id) {
      return $http.put(
        application_configuration.apiServer +
          "/api/userpreference/reset/" +
          user_id
      );
    }

    function updateUser(user) {
      return $http.put(
        application_configuration.apiServer + "/api/user/userId/" + user.id,
        user
      );
    }

    function updateUserDetails(userDetails) {
      return $http.put(
        application_configuration.apiServer +
          "/api/user/details/" +
          userDetails.id,
        userDetails
      );
    }

    function authenticateSecondaryPassword(userId, secondary_password) {
      return $http
        .post(
          application_configuration.apiServer +
            "/api/user/" +
            userId +
            "/secondarypassword",
            { secondary_password }
        )
        .then(response => {
          return response.data;
        });
    }

    function isAllowedFeaturedPassword(feature) {
      return $http
        .get(
          application_configuration.apiServer +
            "/api/feature/user/allowpassword/feature/" +
            feature
        )
        .then(response => {
          return response.data;
        });
    }

    function getAuthorizationPermission(dataObj) {
      return $http
        .get(
          application_configuration.apiServer +
            "/api/authorization/permissions",
          { params: dataObj }
        )
        .then(response => {
          return response.data;
        });
    }

    function getSystemConfigurationSettingsByCode(code) {
      return $http.get(application_configuration.apiServer + "/api/system/configuration/settings/" + code)
        .then(response => {
          return response.data;
        });
    }
  }
})();
