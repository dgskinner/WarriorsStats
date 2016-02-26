var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory) {
	$scope.players = playerInfoFactory;
	$scope.sortByStat = function (stat) {
		$scope.sorter = '-' + stat;
	}
});

app.factory("playerInfoFactory", function ($http, $log) {
	var playersUrl = "http://stats.nba.com/stats/commonallplayers?Season=2015-16&LeagueID=00&isOnlyCurrentSeason=1&callback=JSON_CALLBACK";
	var players = [];
	var keys =  [];

	function getFullPlayerInfo (playerId) {
		var playerUrl = "http://stats.nba.com/stats/commonplayerinfo?callback=JSON_CALLBACK&PlayerID=" + playerId;
		$http.jsonp(playerUrl).success(function (data) {
			if (keys.length === 0) {
				keys = setKeys(data);
			}
			var values = setValues(data);
			var player = {};
			for (var i = 0; i < keys.length; i++) {
				player[keys[i]] = values[i];
			}
			player.HEIGHT_IN_INCHES = convertHeightToInches(player.HEIGHT);
			players.push(player);
		}).error(function () {
			$log.error("Unable to retrieve info for player " + playerId);
		});
	}

	function setKeys (data) {
		return data.resultSets[0].headers.concat(data.resultSets[1].headers);
	}

	function setValues (data) {
		return data.resultSets[0].rowSet[0].concat(data.resultSets[1].rowSet[0]);
	}

	function convertHeightToInches (height) {
		var splitHeight = height.split("-");
		var feet = parseInt(splitHeight[0]);
		var inches = parseInt(splitHeight[1]);
		return feet * 12 + inches;
	}

	$http.jsonp(playersUrl).success(function (data) {
		data.resultSets[0].rowSet.forEach( function (playerInfo) {
			if (playerInfo[10] === "GSW") {
				var playerId = playerInfo[0];
				getFullPlayerInfo(playerId);
			}
		});
	}).error(function () {
		$log.error("Unable to retrieve all player info");
	});

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