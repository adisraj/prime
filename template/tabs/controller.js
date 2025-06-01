
function SideBarController($scope, $filter, API) {
	$scope.redirect = function(){
  		window.location = "http://www.google.com";
	}

}
SideBarController.$inject = ['$scope', '$filter', 'API'];
calculus.controller('SideBarController', SideBarController);