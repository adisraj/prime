(function () {
    'use strict';

    angular
        .module('calculus')
        .factory('JobsService', JobsService)

    /**
     * @namespace JobsService
     * @desc Application wide Jobs http requests
     */
    JobsService.$inject = ['$http', 'application_configuration'];

    function JobsService($http, application_configuration) {
        let API = {};
        let endpoint = '/api/jobs';

        API.InsertTaskRequest = insertTaskRequest;
        API.InsertTaskRequestProperty = insertTaskRequestProperty;
        API.GetTaskRequestsByFilters = getTaskRequestsByFilters;
        API.GetTaskRequestsBynoFilters = getTaskRequestsBynoFilters;
        API.GetTaskTypes = getTaskTypes;

        return {
            API
        };


        /**
         * @name insertTaskRequest
         * @desc creates the task request to be done
         * @param {Object} taskDetails Task details to be stored in database
         */
        function insertTaskRequest(taskDetails) {
            return $http.post(application_configuration.jobsService.url + '/api/task/requests', taskDetails)
        }


        /**
         * @name insertTaskRequestProperty
         * @desc creates the task request property
         * @param {Object} propertyDetails task propert details to be stored in database
         */
        function insertTaskRequestProperty(propertyDetails) {
            return $http.post(application_configuration.jobsService.url + '/api/task/request/properties', propertyDetails)
        }

        /**
         * @name getTaskRequestsByFilter
         * @desc Get filtered task requests in notifications view
         * @param {Object} filters filters to be applied on task requests
         */
        function getTaskRequestsByFilters(filters) {
            return $http.get(`${application_configuration.jobsService.url}/api/task/filters`, { params: filters })
                .then(response => {
                    return response.data;
                });
        }

        function getTaskRequestsBynoFilters() {
            return $http.get(`${application_configuration.jobsService.url}/api/task/nofilters`)
                .then(response => {
                    return response.data;
                });
        }

        /**
        * @name getTaskTypes
        * @desc Get task types in notifications view to filter notifications
        */
        function getTaskTypes() {
            return $http.get(`${application_configuration.jobsService.url}/api/jobs/task/type`)
                .then(response => {
                    return response.data;
                });
        }
    }
})();
