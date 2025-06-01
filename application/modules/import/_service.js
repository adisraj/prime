function Services(
    $http,
    $q,
    application_configuration) {

    var deferObject;
    var data_services = {
        Template: {
            getAll: function(template_name) {
                return $http({
                    method: 'GET',
                    url: application_configuration.apiServer + '/api/data/template/'
                });
            },
            download: function(data) {
                return $http({
                    method: 'POST',
                    url: application_configuration.apiServer + '/api/data/template/download/',
                    data: data

                });
            },
            upload: function(template_name) {
                return $http({
                    method: 'POST',
                    url: application_configuration.apiServer + '/api/data/upload/'


                });
            }
        },
        Mapping: {
            getMappingFile: function(mapping_name) {
                return $http({
                    method: 'GET',
                    url: application_configuration.apiServer + '/mapping_files/' + mapping_name
                });
            }

        }

    }
    return data_services;
}

Services.$inject = [
    '$http',
    '$q',
    'application_configuration'
]

angular.module('rc.prime.import').service('ImportDataService', Services);