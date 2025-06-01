function ReportController($scope,
    $filter,
    identifiers,
    EntityService,
    ngTableParams,
    $state,
    $stateParams,
    Notification,
    GenericAPI,
    ValidationAPI,
    UserAccessAllPermissionsService,
    UserDataFactory,
    ReportDataService) {

    var self = this;

    var Report = ReportDataService.EntitySchemaAPI;

    function init() {
        self.modules = [];


        var schema = Report.Schema().query(function(res, d) {
            self.modules = res.data;
        });
    };

    function columnsById() {
        self.fields = [];
      

        var schema = Report.ColumnsById().query({ id: self.entity_details_id }, function(res, d) {
            self.fields = res.data;
        
        });
    }

    function searchQuery() {
        var schemaData = Report.SchemaData().query({ id: self.entity_details_id, sql: $scope.output }, function(res, d) {
            dynamicTable(res.data);
        });
    }

    function dynamicTable(data) {
        self.cols = [];
        _.each(self.fields, function(fd) {
            self.cols.push({ field: fd.column_name, title: fd.column_name, show: true });
        });
        self.data = data;
        self.tableParams = new ngTableParams({}, {
            dataset: data
        });
    }
    self.columnsById = columnsById;
    self.searchQuery = searchQuery;
    init();
    var data = '{"group": {"operator": "AND","rules": []}}';

    function htmlEntities(str) {
        return String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function computed(group) {
        if (!group) return "";
        for (var str = "(", i = 0; i < group.rules.length; i++) {
            i > 0 && (str += " " + group.operator + " ");
            str += group.rules[i].group ?
                computed(group.rules[i].group) :
                group.rules[i].field + " " + htmlEntities(group.rules[i].condition) + " " + group.rules[i].data;
        }
        return str + ")";
    }
    $scope.json = null;
    $scope.filter = JSON.parse(data);
    $scope.$watch('filter', function(newValue) {
        $scope.json = JSON.stringify(newValue, null, 2);
        $scope.output = computed(newValue.group);
    }, true);

}





ReportController.$inject = [
    '$scope',
    '$filter',
    'identifiers',
    'EntityService',
    'ngTableParams',
    '$state',
    '$stateParams',
    'Notification',
    'GenericAPI',
    'ValidationAPI',
    'UserAccessAllPermissionsService',
    'UserDataFactory',
    'ReportDataService'
];



angular.module('rc.prime.report').controller('ReportController', ReportController);