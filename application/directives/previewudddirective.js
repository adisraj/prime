 calculus.directive("previewUddDirective", function () {
     return {
         restrict: 'E',
         templateUrl: 'template/app-specific/previewudddirective.html',
         scope: {
             uddData: '=',
             attributeValuesMap: '=',
             mtoOptionsMap: '=',
             mtoOptionChoicesMap: '=',
             isSummary: '=',
             selectedHierarchyProperty: '='
         },
         link: function (scope, element, attrs) {

         }
     }
 });