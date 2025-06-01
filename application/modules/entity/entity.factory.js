(function() {
    angular.module('rc.prime.entity').service('EntityService', EntityService);
    EntityService.$inject = [
        '$http',
        'application_configuration'
    ];

    function EntityService($http, application_configuration) {
        let API = {};
        let isCache = false;
        API.GetMasterEntities = getMasterEntities;
        API.GetMasterEntitiesAndEntitiesByUuid = getMasterEntitiesAndEntitiesByUuid;
        API.GetEntityById = getEntityById;
        API.GetAllEntities = getAllEntities;
        API.GetEntityByUUID = getEntityByUUID;
        API.GetPrefix = getPrefix;
        API.FetchStatus = fetchStatus;
        API.GetModules = getModules;
        API.GetAccessModulePermissionForUser = getAccessModulePermissionForUser;
        API.FindByCopyright = findByCopyright;
        API.FindByCopyrightNoAuth = findByCopyrightnoauth;
        
        return {
            API
        };

        function getAllEntities() {
            isCache = false;
            return $http.get(application_configuration.entityService.url + '/api/entity')
                .then(function(response) {
                    return response.data;
                });
        };

        function getMasterEntitiesAndEntitiesByUuid(uuids) {
            return $http.get(application_configuration.entityService.url + '/api/entity/uuids/' + uuids)
                .then(function(response) {
                    return response.data;
                });
        };

        function getMasterEntities(cacheValue) {
            if (cacheValue !== undefined && cacheValue !== null) {
                isCache = cacheValue;
            }
            return $http.get(application_configuration.entityService.url + '/api/entity/search/master_data-' + 1, { cache: isCache })
                .then(function(response) {
                    let time = response.config.responseTimestamp - response.config.requestTimestamp;
                    response.data.time_taken = (time / 1000);
                    return response.data;
                });
        };

        function getEntityById(id) {
            return $http.get(application_configuration.entityService.url + '/api/entity/' + id)
                .then(function(response) {
                    return response.data;
                });
        };
        function getPrefix(entity) {
            return $http.get(application_configuration.entityService.url + '/api/entity/search/entity-' + entity)
                .then(function(response) {
                    return response.data;
                });
        }

        function getEntityByUUID(_uuid) {
            return $http.get(application_configuration.entityService.url + '/api/entity/uuid/' + _uuid)
                .then((response) => {
                    return response.data;
                });
        };

        function fetchStatus() {
            return $http.get(application_configuration.entityService.url + '/api/entity/status')
                .then((response) => {
                    return response.data;
                });
        }

        function getModules() {
            return $http.get(application_configuration.entityService.url + '/api/package/modules')
                .then((response) => {
                    return response.data;
                });
        };

        function getAccessModulePermissionForUser(moduleId) {
            return $http.get(application_configuration.authenticationServer + '/api/access/role/module/' + moduleId)
                .then((response) => {
                    return response.data;
                });
        };
        
        function findByCopyright() {
            return $http
              .get(
                application_configuration.entityService.url +
                  "/api/copyright/details"
              )
              .then(response => {
                return response.data;
              });
          }
          
          function findByCopyrightnoauth() {
            return $http
              .get(
                application_configuration.entityService.url +
                  "/api/copyright/detailsnoauth"
              )
              .then(response => {
                return response.data;
              });
          }
    }
})();
