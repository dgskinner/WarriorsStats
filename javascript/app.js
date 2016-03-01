var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory, teamInfoFactory) {
	$scope.teams = teamInfoFactory;
	$scope.currentTeam = $scope.teams.west[0];
	$scope.playerInfo = playerInfoFactory;
	$scope.playerInfo.getInfoForTeam($scope.currentTeam.abbreviation);

	$scope.changeTeam = function (team) {
		if ($scope.finishedLoading()) {
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
});