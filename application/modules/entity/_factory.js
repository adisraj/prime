function DataService(
    $resource,
    application_configuration
) {
    return {
        $entity: function(entityPrefixId) {
            return {
                Instance: $resource(application_configuration.entityService.url + '/api/entity/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        cancellable: true
                    },
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    },
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            }
        },

        $model: function(entityPrefixId) {
            return {
                Instance: $resource(application_configuration.apiServer + '/model/:model_name', {
                    model_name: '@model_name'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        headers: {
                            'prefix-id': entityPrefixId
                        },
                        cancellable: true
                    }
                })
            }
        },
        $entity_details: function() {
            return {
                Instance: $resource(application_configuration.entityService.url + '/api/entity/details/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                }),
                EntityDetailsCountForUUIDs: $resource(application_configuration.entityService.url + '/api/entity/details/count/lov/:field-:values', {
                    field: '@field',
                    values: '@values'
                }, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    },
                    update: {
                        method: 'put',
                        isArray: false,
                        cancellable: true
                    }
                })
            }
        }


    }
}

DataService.$inject = [
    '$resource',
    'application_configuration'
]
angular.module('rc.prime.entity').factory('EntityDataFactory', DataService);