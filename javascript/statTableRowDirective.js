app.directive("statTableRow", function () {
    return {
        templateUrl: "templates/statTableRowDirective.html",
        restrict: "A",
        scope: {
            player: "="
        }
    };
});