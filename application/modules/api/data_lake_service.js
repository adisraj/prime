function Services(
    $http,
    $q,
    application_configuration,
    $resource

) {
    var deferObject;
    var data_services = {
        Meta: {
            mapCategories: function() {
                return $resource('../application/data/map_datalake_category.json', {}, {
                    query: {
                        method: 'get',
                        isArray: false,
                        cancellable: true
                    }
                })
            },
            getCreateInstanceUrl: function() {
                return application_configuration.dataLakeService.url + '/meta/create';
            },
            getUpdateInstanceUrl: function(id) {
                return application_configuration.dataLakeService.url + '/meta/update/' + id;
            },
            SearchInstance: function() {
                return $resource(application_configuration.dataLakeService.url + '/meta/search', {}, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            },
            getById: function(id) {
                return $resource(application_configuration.dataLakeService.url + '/meta/find/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            },
            GetCategories: function() {
                return $resource(application_configuration.dataLakeService.url + '/meta/category', {}, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            },
            GetCategoriesByUuid: function(uuid) {
                return $resource(application_configuration.dataLakeService.url + '/meta/category/uuid/' + uuid, {
                    'uuid': '@uuid'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            },
            GetMetaDataByUUIDAndCategories: function() {
                return $resource(application_configuration.dataLakeService.url + '/meta/find/uuid/:uuid/category/:category', {}, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            },
            GetMetaDataByInstanceIdAndCategory: function(instanceId, category) {
                return $resource(application_configuration.dataLakeService.url + '/meta/find/instance/:instanceId/category/:category', {
                    'instanceId': '@instanceId',
                    'category': '@category'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }
                })
            },
            CreateInstance: function() {
                return $resource(application_configuration.dataLakeService.url + '/meta/create', {
                    id: '@id'
                }, {
                    save: {
                        method: 'post',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }

                });
            },
            UpdateInstance: function() {
                return $resource(application_configuration.dataLakeService.url + '/meta/update/data_id/:data_id', {
                    data_id: '@data_id'
                }, {
                    update: {
                        method: 'put',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }

                });
            },
            getDownloadUrl: function(url) {
                return application_configuration.dataLakeService.url + '/meta/download/' + url;
            },
            DownloadByUrl: function(url) {
                return $resource(application_configuration.dataLakeService.url + '/meta/download/:url', {
                    url: '@url'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }

                });
            },
            RemoveDataSetByUrl: function(url) {
                return $resource(application_configuration.dataLakeService.url + '/meta/remove/:url', {
                    url: '@url'
                }, {
                    delete: {
                        method: 'delete',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }

                });
            }
        },
        ImportJob: {
            getUploadUrl: function() {
                return (application_configuration.dataLakeService.url + '/importjob/upload');
            },
        },
        Mapping: {
            list: function() {
                return $resource(application_configuration.dataLakeService.url + '/mapping/list/:id', {
                    id: '@id'
                }, {
                    query: {
                        method: 'get',
                        headers: {
                            'prefix-id': "allow-data"
                        },
                        isArray: false,
                        cancellable: true
                    }

                });
            }


        }
    }
    return data_services;
}

Services.$inject = [
    '$http',
    '$q',
    'application_configuration',
    '$resource'

]
calculus.service('DataLakeServices', Services);