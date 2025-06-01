 calculus.directive('notificationItem', function() {
     return {
         restrict: 'E',
         scope: {
             items: '=items'
         },
         templateUrl: 'application/directives/dashboard/notification-item.html'


     }
 });