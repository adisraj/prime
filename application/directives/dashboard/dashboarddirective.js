 calculus.directive('widgetCount', function() {
     return {
         restrict: 'E',
         scope: {
             label: '@wdLabel',
             count: '=wdCount',
             path: '@wdPath',
             openForm: '&openForm'
         },
         templateUrl: 'application/directives/dashboard/widget-count.html'


     }
 });

 calculus.directive('widgetStatusDetail', function() {
     return {
         restrict: 'E',
         scope: {
             label: '@wdLabel',
             count: '=wdCount'
         },
         link: function(scope) {


         },
         templateUrl: 'application/directives/dashboard/widget-status-detail.html'
     }
 });