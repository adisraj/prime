function DataService(
    $resource,
    application_configuration
) {

    return {
		$report: function(prefixId){	
	 		return {
		 
			
			        $schema: $resource(application_configuration.apiServer + '/api/entity/schema', {}, {
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
			        $tables: $resource(application_configuration.apiServer + '/api/entity/schema/tables', {}, {
			            query: {
			                method: 'get',
			                isArray: false,
			                cancellable: true
			            }

			        }),
			        $views: $resource(application_configuration.apiServer + '/api/entity/schema/views', {}, {
			            query: {
			                method: 'get',
			                isArray: false,
			                cancellable: true
			            }

			        }),
			        $columns_by_table_name: $resource(application_configuration.apiServer + '/api/entity/schema/columns/table/:table_name', {
			            table_name: '@table_name'
			        }, {
			            query: {
			                method: 'get',
			                isArray: false,
			                headers: {
			                    'prefix-id': prefixId
			                },
			                cancellable: true
			            }

			        }),
			        $columns_by_id: $resource(application_configuration.apiServer + '/api/entity/schema/columns/:id', {
			            id: '@id'
			        }, {
			            query: {
			                method: 'get',
			                isArray: false,
			                headers: {
			                    'prefix-id': prefixId
			                },
			                cancellable: true
			            }

			        }),
			        $schema_data: $resource(application_configuration.apiServer + '/api/entity/schema/data/:id/query/:sql', {
			            id: '@id',
			            sql: '@sql'
			        }, {
			            query: {
			                method: 'get',
			                isArray: false,
			                headers: {
			                    'prefix-id': prefixId
			                },
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
angular.module('rc.prime.report').factory('ReportDataFactory', DataService);
