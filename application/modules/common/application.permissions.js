(function() {
    'use strict';
    angular.module('calculus.application').factory('ApplicationPermissions', ApplicationPermissions);

    ApplicationPermissions.$inject = ['Logger', 'AuthorizationDataFactory'];

    function ApplicationPermissions(Logger, AuthorizationDataFactory) {
        var logger = Logger.getInstance('Application.Permissions');
        try {
            var Module = {};
            Module.InitializePermissions = initializePermissions;

            function initializePermissions(uuids) {
                try {
                    return AuthorizationDataFactory.AuthAPI().getUserRolesPermissionsByUUIDs(uuids)
                        .then(response => {
                            var accessRulesMap = {};
                            for (var i = 0; i < response.data.length; i++) {
                                var userPermObj = response.data[i];
                                if (accessRulesMap["PER" + userPermObj.uuid] === undefined) {
                                    accessRulesMap["PER" + userPermObj.uuid] = {};
                                }
                                accessRulesMap["PER" + userPermObj.uuid][userPermObj.permission] = { value: 1 };
                                accessRulesMap["PER" + userPermObj.uuid]["prefix"] = userPermObj.prefix;
                                accessRulesMap["PER" + userPermObj.uuid]["entityId"] = userPermObj.entity_id;
                                accessRulesMap["PER" + userPermObj.uuid]["name"] = userPermObj.entity;
                            };
                            return accessRulesMap;
                        })
                        .catch(error => {
                            logger.error(error);
                        });
                } catch (error) {
                    return new Promise((resolve, reject) => {
                        let error_object = {
                            error: error
                        }
                        reject(error_object);
                    });

                }
            }
            return {
                Module
            };
        } catch (error) {
            logger.error('Error while getting entity details', [error]);
        }
    }

})();