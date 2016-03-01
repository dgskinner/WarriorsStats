var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory, teamInfoFactory) {
	$scope.playerInfo = playerInfoFactory;
	$scope.teams = teamInfoFactory;

	$scope.changeTeam = function (team) {
		if (!$scope.currentTeam || $scope.currentTeam.abbreviation !== team.abbreviation) {
			$scope.playerInfo.getInfoForTeam(team.abbreviation);
			$scope.currentTeam = team;
		}
	}

	$scope.sortByStat = function (stat) {
		$scope.sorter = '-' + stat;
	}

	$scope.finishedLoading = function () {
		return $scope.playerInfo.rosterSize > 0 &&
			$scope.playerInfo.players.length === $scope.playerInfo.rosterSize;
	}

	$scope.changeTeam($scope.teams.west[0]);
});