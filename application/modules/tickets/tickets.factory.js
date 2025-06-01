(function() {
  "use strict";
  angular
    .module("rc.prime.tickets")
    .factory("NotificationService", NotificationService);
  NotificationService.$inject = ["$http", "application_configuration"];

  function NotificationService($http, application_configuration) {
    var API = {};
    API.CloseOrReopenTaskRequest = closeOrReopenTaskRequest;
    API.GetRequestsForGivenCodeAndState = getRequestsForGivenCodeAndState;
    API.FetchRequestPropertiesForRequest = fetchRequestPropertiesForRequest;
    API.SetRequestActionState = setRequestActionState;

    return {
      API
    };

    function getRequestsForGivenCodeAndState(taskCode, state) {
      return $http
        .get(
          `${application_configuration.jobsService
            .url}/api/task/${taskCode}/state/${state}`
        )
        .then(response => {
          return response.data;
        });
    }

    function setRequestActionState(transition) {
      return $http
        .post(
          application_configuration.jobsService.url +
            "/api/task/request/" +
            transition.request_id +
            "/action",
          transition
        )
        .then(response => {
          return response.data;
        });
    }

    function fetchRequestPropertiesForRequest(request_id, properties) {
      let endpoint =
        "/api/task/request/" + request_id + "/property/" + properties;
      return $http
        .get(application_configuration.jobsService.url + endpoint)
        .then(response => {
          return response.data;
        });
    }

    function closeOrReopenTaskRequest(request_id, action) {
      return $http
        .put(
          application_configuration.jobsService.url +
            "/api/task/request/" +
            request_id,
          { action: action }
        )
        .then(response => {
          return response.data;
        });
    }
  }
})();
