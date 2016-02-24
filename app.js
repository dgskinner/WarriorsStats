var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory) {
	$scope.players = playerInfoFactory;
});

app.factory("playerInfoFactory", function ($http, $log) {
	var PLAYER_IDS = [2571, 203084, 101106, 203546, 201939, 203105, 203110, 2738, 2733, 1626172, 203949, 201575, 201578, 201574, 202691, 2760];
	var players = [];
	PLAYER_IDS.forEach( function (playerId) {
		var url = "http://stats.nba.com/stats/commonplayerinfo?callback=JSON_CALLBACK&PlayerID=" + playerId;
		$http.jsonp(url).success(function (data) {
			players.push(data.resultSets);
		}).error(function () {
			$log.error("Unable to retrieve info for player " + playerId);
		});
	});
	return players;
});

app.directive("tableRow", function () {
	return {
		templateUrl: "tableRowDirective.html"
	};
});