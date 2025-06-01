angular.module('rc.prime.components', []);
angular.module('rc.prime.components')
	.directive('rcField', function() {
		return {
			restrict: 'E',
			require: '^rcData',
			templateUrl: 'application/modules/_shared/rc.component.text.tpl.html',
			scope: {
				rcData: '='
			}
		}
	});