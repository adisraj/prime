function Services(
	$http,
	$q,
	application_configuration,
	ReportDataFactory) {
	var deferObject;
	var data_services = {

		EntitySchemaAPI: {
			Schema: function(){
				return ReportDataFactory.$report().$schema;
			},
	                Tables: function(){
				return ReportDataFactory.$report().$tables;
			},
	                Views: function(){
				return ReportDataFactory.$report().$views;
			},
	                ColumnsByTableName: function(){
				return ReportDataFactory.$report().$columns_by_table_name;	
			},
	                ColumnsById: function(){
				return ReportDataFactory.$report().$columns_by_id;		
			},
	                SchemaData: function(){
				return ReportDataFactory.$report().$schema_data;	
			}
		 }

	};
	return data_services;
};

Services.$inject = [
	'$http',
	'$q',
	'application_configuration',
	'ReportDataFactory'
];

angular.module('rc.prime.report').service('ReportDataService', Services);
