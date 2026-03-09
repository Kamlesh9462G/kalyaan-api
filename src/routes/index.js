const express = require("express");
const authRoute = require("./auth.route");
const betRoute = require('./bet.route')
const accountRoute = require('./account.route')
const walletRoute = require('./wallet.route')
const marketRoute = require('./market.route')
const rateRoute = require('./rate.route')
const customerRoute = require('./customer.route')
const router = express.Router();

const defaultRoutes = [
    {
        path: "/auth",
        route: authRoute,
    },
    {
        path:'/bets',
        route:betRoute
    },
    {
        path:'/accounts',
        route:accountRoute
    },
    {
        path:'/wallet',
        route:walletRoute
    },
    {
        path:"/markets",
        route:marketRoute
    },
    {
        path:"/rates",
        route:rateRoute
    },
       {
        path:"/customer",
        route:customerRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
