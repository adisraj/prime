/* Company      : ndvor IT Solutions ( www.ndvor.com )
 * Project      : Retail Calculus
 * Created Date : 2 May 2016
 * Purpose      : Authentication interceptor to check for the token details.
 * Author       : binish_john@ndvor.com
 */

/**
 * @name 	: AuthIntreceptor
 * @param 	: {angular.$rootScope} $rootScope The Angular rootscope service
 * @param 	: {angular.$q} $q The Angular promise object
 * @param 	: {angular.$window} $window Global.
 */

function AuthIntreceptor($rootScope, $q, SessionMemory, $state) {
  return {
    request: function (config) {
      config.headers = config.headers || {};
      /* Check if token exist in the session storage*/
      if (SessionMemory.API.Get("user.token")) {
        config.headers["x-access-token"] = SessionMemory.API.Get("user.token");
      }
      if (SessionMemory.API.Get("user.session")) {
        config.headers["session-id"] = SessionMemory.API.Get("user.session");
      }
      return config;
    },
    response: function (response) {
      /* If server send 401 need to navigate to the login page TODO*/
      if (response.status === 401) {
      }
      return response || $q.when(response);
    },
    responseError: function (response) {
      // Session has expired
      if (
        response.data &&
        response.data.error &&
        response.data.error.type &&
        response.data.error.type.toLowerCase() === "session_error"
      ) {
        $state.go("login");
      }
      return $q.reject(response);
    }
  };
}

/**
 * Dependency Injection for AuthIntreceptor
 * @param 	: {angular.$rootScope} $rootScope The Angular rootscope service
 * @param 	: {angular.$q} $q The Angular promise object
 * @param 	: {angular.$window} $window Global.
 */
AuthIntreceptor.$inject = ["$rootScope", "$q", "SessionMemory", "$state"];

calculus.factory("AuthIntreceptor", AuthIntreceptor);
