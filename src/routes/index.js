const express = require("express");
const authRoute = require("./auth.route");
const betRoute = require('./bet.route')
const accountRoute = require('./account.route')
const walletRoute = require('./wallet.route')
const marketRoute = require('./market.route')
const rateRoute = require('./rate.route')
const customerRoute = require('./customer.route')
const quickActionRoute = require('./quickAction.route')
const sidebarRoute = require('./sidebar.route')
const appConfigRoute = require('./appConfig.route')
const supportRoute = require('./support.route')
const guideRoute = require('./guide.route')
const gameBetGuideRoute = require('./gameBetGuide.route')
const faqRoute = require('./faq.route')
const merchantVpaRoute = require('./merchantVpa.route')
const referralRoute = require('./referral.route')
const favouriteRoute = require('./favourite.route')
const notificationRoute = require('./notification.route')

const router = express.Router();

const defaultRoutes = [
    {
        path: "/auth",
        route: authRoute,
    },
    {
        path: '/bets',
        route: betRoute
    },
    {
        path: '/accounts',
        route: accountRoute
    },
    {
        path: '/wallet',
        route: walletRoute
    },
    {
        path: "/markets",
        route: marketRoute
    },
    {
        path: "/rates",
        route: rateRoute
    },
    {
        path: "/customer",
        route: customerRoute
    },
    {
        path: '/quick-actions',
        route: quickActionRoute
    },
    {
        path: '/sidebars',
        route: sidebarRoute
    },
    {
        path: '/app-config',
        route: appConfigRoute
    },
    {
        path: '/support',
        route: supportRoute
    },
    {
        path: '/guide',
        route: guideRoute
    },
    {
        path: '/game-bet-guides',
        route: gameBetGuideRoute
    },
    {
        path: '/faq',
        route: faqRoute
    },
    {
        path: '/merchant-vpas',
        route: merchantVpaRoute
    },
    {
        path: '/referral',
        route: referralRoute
    },
    {
        path: '/favourites',
        route: favouriteRoute
    },
    {
        path: '/notifications',
        route: notificationRoute
    }
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
