var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory) {
	$scope.players = playerInfoFactory;
	$scope.sortByStat = function (stat) {
		$scope.sorter = '-' + stat;
	}
});