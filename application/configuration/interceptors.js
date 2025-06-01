// calculus.config(function($httpProvider) {
// 	$httpProvider.interceptors.push('AuthIntreceptor');
// });

(function() {
  "use strict";
  angular.module("calculus").config(function($httpProvider) {
    $httpProvider.interceptors.push("AuthIntreceptor");
  });
})();
