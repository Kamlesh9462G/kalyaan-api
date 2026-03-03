const express = require("express");
const marketRoute = require("./market.route");
const betTypeRoute = require("./betType.route");
const marketBetTypeRoute = require("./marketBetType.route");
const router = express.Router();

const defaultRoutes = [
    {
        path: "/markets",
        route: marketRoute,
    },
    {
        path:'/bet-types',
        route:betTypeRoute
    },
    {
        path:'/market-bet-types',
        route:marketBetTypeRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
