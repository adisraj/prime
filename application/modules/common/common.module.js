/**
 *@description Common modules factory having all useful common dependencies. 
 * Contains Angular modules, 3rd party modules and custom modules too.
 */
(function() {
    'use strict';

    angular.module('common', [
        // Angular modules
        // Custom modules
        'calculus.logging',
        'calculus.application',
        // 3rd Party Modules

    ]);

    angular.module('common').factory('common', common);
    common.$inject = [
        '$filter',
        '$q',
        '$state',
        '$sce',
        "$stateParams",
        '$timeout',
        '$window',
        '$location',
        'ApplicationCache',
        'ApplicationPermissions',
        'EntityDetails',
        'generateDynamicTableColumnsService',
        'identifiers',
        'loadDynamicTableService',
        'Logger',
        'LocalMemory',
        'Notification',
        'PreviousState',
        'SessionMemory',
        'StatusService',
        'shortcuts'
    ]

    function common(
        $filter,
        $q,
        $state,
        $sce,
        $stateParams,
        $timeout,
        $window,
        $location,
        ApplicationCache,
        ApplicationPermissions,
        EntityDetails,
        generateDynamicTableColumnsService,
        identifiers,
        loadDynamicTableService,
        Logger,
        LocalMemory,
        Notification,
        PreviousState,
        SessionMemory,
        StatusService,
        shortcuts
    ) {
        return {
            $filter: $filter,
            $q: $q,
            $state: $state,
            $sce:$sce,
            $stateParams: $stateParams,
            $timeout: $timeout,
            $window: $window,
            ApplicationCache: ApplicationCache,
            ApplicationPermissions: ApplicationPermissions,
            EntityDetails: EntityDetails,
            GenerateDynamicTableColumnsService: generateDynamicTableColumnsService,
            Identifiers: identifiers,
            LoadDynamicTableService: loadDynamicTableService,
            Logger: Logger,
            Notification: Notification,
            LocalMemory: LocalMemory,
            PreviousState: PreviousState,
            SessionMemory: SessionMemory,
            StatusService: StatusService,
            ShortCuts: shortcuts
        };
    };



})();