var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory) {
	$scope.players = playerInfoFactory;
	// $scope.sortByStat = function (stat) {

	// }
});

app.factory("playerInfoFactory", function ($http, $log) {
	var PLAYER_IDS = [2571, 203084, 101106, 203546, 201939, 203105, 203110, 2738, 2733, 1626172, 203949, 201575, 201578, 201574, 202691, 2760];
	var players = [];
	var keys =  [];
	PLAYER_IDS.forEach( function (playerId) {
		var url = "http://stats.nba.com/stats/commonplayerinfo?callback=JSON_CALLBACK&PlayerID=" + playerId;
		$http.jsonp(url).success(function (data) {
			if (keys.length === 0) {
				keys = setKeys(data);
			}
			var values = setValues(data);
			var player = {};
			for (var i = 0; i < keys.length; i++) {
				player[keys[i]] = values[i];
			}
			players.push(player);
		}).error(function () {
			$log.error("Unable to retrieve info for player " + playerId);
		});
	});
	function setKeys (data) {
		return data.resultSets[0].headers.concat(data.resultSets[1].headers);
	}
	function setValues (data) {
		return data.resultSets[0].rowSet[0].concat(data.resultSets[1].rowSet[0]);
	}
	return players;
});

app.directive("statTableRow", function () {
	return {
		templateUrl: "statTableRowDirective.html",
		restrict: "A",
		scope: {
			player: "="
		}
	};
});