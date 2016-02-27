var app = angular.module("app", []);

app.controller("appController",  function ($scope, playerInfoFactory) {
	$scope.players = playerInfoFactory;
	$scope.sortByStat = function (stat) {
		$scope.sorter = '-' + stat;
	}
});

app.factory("playerInfoFactory", function ($http, $q, $log) {
	var playersUrl = "http://stats.nba.com/stats/commonallplayers?Season=2015-16&LeagueID=00&isOnlyCurrentSeason=1&callback=JSON_CALLBACK";
	var players = [];
	var basicKeys = [];
	var advancedKeys = [];

	function getBasicPlayerInfo (playerId) {
		var playerInfoUrl = "http://stats.nba.com/stats/commonplayerinfo?callback=JSON_CALLBACK&PlayerID=" + playerId;
		$http.jsonp(playerInfoUrl).success(function (data) {
			if (basicKeys.length === 0) {
				basicKeys = setBasicKeys(data);
			}
			var values = setBasicValues(data);
			var player = {};
			for (var i = 0; i < basicKeys.length; i++) {
				player[basicKeys[i]] = values[i];
			}
			player.HEIGHT_IN_INCHES = convertHeightToInches(player.HEIGHT);
			getFullGameLogForPlayer(playerId, player);
			// players.push(player);
		}).error(function () {
			$log.error("Unable to retrieve info for player " + playerId);
		});
	}

	// changes state of player object - not sure this the best way...
	function getFullGameLogForPlayer (playerId, player) {
		var regularSeasonUrl = "http://stats.nba.com/stats/playergamelog?Season=2015-16&SeasonType=Regular+Season&callback=JSON_CALLBACK&PlayerID=" + playerId;
		var postSeasonUrl = "http://stats.nba.com/stats/playergamelog?Season=2015-16&SeasonType=Playoffs&callback=JSON_CALLBACK&PlayerID=" + playerId;
		$q.all([
			$http.jsonp(regularSeasonUrl),
			$http.jsonp(postSeasonUrl)
		]).then(function (responses) {
			var regularSeasonGames = responses[0].data.resultSets[0].rowSet;
			var postSeasonGames = responses[1].data.resultSets[0].rowSet;
			// var avgSteals = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 20);
			player.THREE_POINT_PCT = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 12, true);
			player.FREE_THROW_PCT = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 15, true);
			player.FIELD_GOAL_PCT = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 9, true);
			player.STEALS = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 20, false);
			player.BLOCKS = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 21, false);
			player.MIN = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 6, false);
			players.push(player);
		});
	}

	function averageStatOverRegularAndPostSeason (regularSeasonGames, postSeasonGames, statIndex, isPercentage) {
		var total = 0;
		regularSeasonGames.forEach(function (game) {
			total += game[statIndex];
		});
		postSeasonGames.forEach(function (game) {
			total += game[statIndex];
		});
		var gamesPlayed = regularSeasonGames.length + postSeasonGames.length;
		// if it's a percentage stat then we want two decimal places
		// otherwise one is fine (or zero; 2.0 can simply be displayed at 2)
		if (isPercentage) {
			return (total / gamesPlayed).toFixed(2);
		} else {
			return Math.round(total / gamesPlayed * 10) / 10;
		}
	}

	function setBasicKeys (data) {
		return data.resultSets[0].headers.concat(data.resultSets[1].headers);
	}

	// function setAdvancedKeys (data) {
	// 	return data.resultSets[0].headers.concat(data.resultSets[1].headers);
	// }

	function setBasicValues (data) {
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
				getBasicPlayerInfo(playerId);
				// getFullGameLogForPlayer(playerId);
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