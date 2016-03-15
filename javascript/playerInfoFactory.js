app.factory("playerInfoFactory", function ($http, $q, $log) {
    var playerInfoFactory = {};
    var playersUrl = "http://stats.nba.com/stats/commonallplayers?Season=2015-16&LeagueID=00&isOnlyCurrentSeason=1&callback=JSON_CALLBACK";
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
            if (regularSeasonGames.length > 0 || postSeasonGames.length > 0) {
                player.FIELD_GOAL_PCT = getPercentageMadeOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 7, 8);
                player.THREE_POINT_PCT = getPercentageMadeOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 10, 11);
                player.FREE_THROW_PCT = getPercentageMadeOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 13, 14);
                player.STEALS = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 20);
                player.BLOCKS = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 21);
                player.MIN = averageStatOverRegularAndPostSeason(regularSeasonGames, postSeasonGames, 6);
                playerInfoFactory.players.push(player);
            } else {
                playerInfoFactory.rosterSize--;
            }
        });
    }

    function averageStatOverRegularAndPostSeason (regularSeasonGames, postSeasonGames, statIndex) {
        var total = 0;
        regularSeasonGames.forEach(function (game) {
            total += game[statIndex];
        });
        postSeasonGames.forEach(function (game) {
            total += game[statIndex];
        });
        var gamesPlayed = regularSeasonGames.length + postSeasonGames.length;
        // one decimal place is fine here (or zero; 2.0 will simply be displayed as 2)
        return Math.round(total / gamesPlayed * 10) / 10;
    }

    function getPercentageMadeOverRegularAndPostSeason (regularSeasonGames, postSeasonGames, madeIndex, attemptedIndex) {
        var totalMade = 0;
        var totalAttempted = 0;
        regularSeasonGames.forEach(function (game) {
            totalMade += game[madeIndex];
            totalAttempted += game[attemptedIndex];
        });
        postSeasonGames.forEach(function (game) {
            totalMade += game[madeIndex];
            totalAttempted += game[attemptedIndex];
        });
        // want two decimal places no matter what for percentage stats
        return totalAttempted === 0 ? 0 : (totalMade / totalAttempted).toFixed(2);
    }

    function setBasicKeys (data) {
        return data.resultSets[0].headers.concat(data.resultSets[1].headers);
    }

    function setBasicValues (data) {
        return data.resultSets[0].rowSet[0].concat(data.resultSets[1].rowSet[0]);
    }

    function convertHeightToInches (height) {
        var splitHeight = height.split("-");
        var feet = parseInt(splitHeight[0]);
        var inches = parseInt(splitHeight[1]);
        return feet * 12 + inches;
    }

    playerInfoFactory.getInfoForTeam = function (teamAbbreviation   ) {
        playerInfoFactory.players = [];
        playerInfoFactory.rosterSize = 0;
        $http.jsonp(playersUrl).success(function (data) {
            data.resultSets[0].rowSet.forEach( function (playerInfo) {
                if (playerInfo[10] === teamAbbreviation) {
                    playerInfoFactory.rosterSize++;
                    var playerId = playerInfo[0];
                    getBasicPlayerInfo(playerId);
                }
            });
        }).error(function () {
            $log.error("Unable to retrieve all player info");
        });
    }

    return playerInfoFactory;
});