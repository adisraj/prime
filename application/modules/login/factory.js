(function () {
  "use strict";
  angular.module("rc.prime.login").factory("LoginService", LoginService);
  LoginService.$inject = [
    "$http",
    "application_configuration",
    "SessionMemory",
    "StatusService",
    "Module",
    "$stateParams"
  ];

  function LoginService(
    $http,
    application_configuration,
    SessionMemory,
    StatusService,
    Module,
    $stateParams
  ) {
    var API = {};
    API.ForgotPassword = forgotPassword;
    API.UpdateUnblockPassword=updateUnblockPassword
    API.Login = login;
    API.LoadInitialDataSet = loadInitialDataSet;
    API.VerifyMfaCode = verifyMfaCode;
    API.Logout = logout;
    API.GetSession = getSession;
    API.GetSessionCount = getSessionCount;
    API.SetUserLocation = setUserLocation;
    API.GetUsersMap = getUsersMap;
    API.GetWorkbenchPermissionsForUser = getWorkbenchPermissionsForUser;
    API.RemoveSessionId = removeSessionId;
    API.CreateSession = createSession;
    return {
      API
    };

    function getUsersMap(columns) {
      return $http
        .get(
          application_configuration.authenticationServer + "/api/user/graph", {
            params: {
              column: columns
            }
          }
        )
        .then(response => {
          return response.data.data;
        });
    }

    function getSession() {
      return $http
        .get(
          application_configuration.authenticationServer +
          "/session/" +
          SessionMemory.API.Get("user.session")
        )
        .then(res => {
          return res.data;
        });
    }

    function logout() {
      return $http.get(
        application_configuration.authenticationServer + "/api/user/logout", {
          params: {
            module_id: Module.id
          }
        }
      );
    }

    function createSession(data) {
      return $http.post(
        application_configuration.authenticationServer +
        "/session/add-session", data
      ).then(res => {
        return res.data;
      });
    }

    function getSessionCount() {
      return $http
        .get(
          application_configuration.authenticationServer +
          "/api/user/sessions/count", {
            params: {
              module_id: Module.id
            }
          }
        )
        .then(response => {
          return response.data.data;
        });
    }

    function login(userDetails) {
      return $http.post(
        application_configuration.authenticationServer +
        "/authentication/authenticate",
        userDetails
      );
    }

    function logout() {
      return $http.get(
        application_configuration.authenticationServer + "/api/user/logout", {
          params: {
            module_id: Module.id
          }
        }
      );
    }
    function forgotPassword(userDetails) {
      return $http.put(
        application_configuration.authenticationServer +
        "/user/forgotpassword/",
        userDetails
      );
    }

    function updateUnblockPassword(userDetails) {
      return $http.put(
        application_configuration.authenticationServer +
        `/user/updateUnblockedpassword/${userDetails.id}`,
        userDetails
      );
    }

    function loadInitialDataSet() {
      StatusService.initializeStatuses();
    }

    function setUserLocation(location) {
      return $http.put(
        application_configuration.authenticationServer +
        "/api/user/set/location",
        location
      );
    }

    function verifyMfaCode(mfatoken) {
      return $http
        .post(
          application_configuration.apiServer +
          "/api/user/mfa/verify?mfatoken=" +
          mfatoken
        )
        .then(response => {
          return response.data;
        });
    }

    function getWorkbenchPermissionsForUser(userId) {
      return $http
        .get(
          application_configuration.authenticationServer +
          "/api/access/workbench/" +
          userId
        )
        .then(res => {
          return res.data;
        });
    }

    function removeSessionId(sessionId, moduleId) {
      return $http.get(application_configuration.authenticationServer +
        "/api/user/logout/" + sessionId + "?module_id=" + moduleId)
        .then((response) => {
          return response.data;
        });
    }
  }
})();
