(function() {
    'use strict';

    angular
        .module('rc.prime.tag')
        .directive('panelTemplateDirective', directive);

    directive.$inject = [];

    function directive() {
        // Usage:
        //     <directive></directive>
        // Creates:
        //
        var directive = {
            link: link,
            restrict: 'E',
            templateUrl: './application/modules/hangtag/panel.department.template.html'
        };
        return directive;

        function link(scope, element, attrs) {}
    }

})();