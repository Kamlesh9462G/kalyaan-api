const express = require("express");
const marketRoute = require("./market.route");
const betTypeRoute = require("./betType.route");
const marketBetTypeRoute = require("./marketBetType.route");
const resultRoute = require("./result.route");
const walletRoute = require('./wallet.route');
const quickActionRoute = require('./quickAction.route')
const sidebarRoute = require('./sidebar.route')
const appConfigRoute = require('./appConfig.route')
const supportRoute = require('./support.route')
const guideRoute = require('./guide.route')
const gameBetGuideRoute = require('./gameBetGuide.route')
const faqRoute = require('./faq.route')
const customerRoute = require('./customer.route')
const accountRoute = require('./account.route')
const betRoute = require('./bet.route')
const merchantVpaRoute = require('./merchantVpa.route')
const referralSettingsRoute = require('./referralSettings.route')
const router = express.Router();

const defaultRoutes = [
    {
        path: "/markets",
        route: marketRoute,
    },
    {
        path: '/bet-types',
        route: betTypeRoute
    },
    {
        path: '/market-bet-types',
        route: marketBetTypeRoute
    },
    {
        path: '/results',
        route: resultRoute
    },
    {
        path: '/wallet',
        route: walletRoute
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
        path: '/customers',
        route: customerRoute
    }
    ,
    {
        path: '/accounts',
        route: accountRoute
    }
    ,
    {
        path: '/bets',
        route: betRoute
    },
    {
        path: '/merchant-vpas',
        route: merchantVpaRoute
    },
    {
        path:'/referral-settings',
        route:referralSettingsRoute
    }

];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;
