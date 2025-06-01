function Services(
    $http,
    $q,
    application_configuration,
    $resource

) {
    var deferObject;
    var change_history_services = {
        get_change_history: function(url, id, instance_id) {
            var promise = $http({
                method: 'GET',
                headers: {
                    'prefix-id': "allow-data"
                },
                url: application_configuration[url + 'Service']['url'] + "/api/history/uuid/" + id + "/instance/" + instance_id
            });

            var deferObject = deferObject || $q.defer();

            promise.then(
                function(result) {
                    deferObject.resolve(result.data);
                },
                function(reason) {
                    deferObject.reject(reason);
                });
            return deferObject.promise;

        }
    }
    return change_history_services;
}

Services.$inject = [
    '$http',
    '$q',
    'application_configuration',
    '$resource'
]
calculus.service('ChangeHistoryService', Services);