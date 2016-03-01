var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory) {
	$scope.playerInfo = playerInfoFactory;
	$scope.teams = {
		west: ["GSW", "OKC", "LAC"],
		east: ["CLE", "MIA", "CHI"]
	};

	$scope.changeTeam = function (team) {
		$scope.playerInfo.getInfoForTeam(team);
		$scope.team = team;
	}

	$scope.sortByStat = function (stat) {
		$scope.sorter = '-' + stat;
	}

	$scope.finishedLoading = function () {
		return $scope.playerInfo.rosterSize > 0 &&
			$scope.playerInfo.players.length === $scope.playerInfo.rosterSize;
	}

	$scope.changeTeam("GSW");
});