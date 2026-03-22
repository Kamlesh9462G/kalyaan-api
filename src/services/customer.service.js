const httpStatus = require('http-status');
const { ObjectId } = require('mongodb');
const { Customer } = require('../models/index');
const ApiError = require('../utils/ApiError');

const getCustomer = async (filterQuery) => {
    try {
        return await Customer.findOne(filterQuery)
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const getCustomers = async (filterQuery) => {
    try {
        return await Customer.aggregate([
            {
                '$match': {}
            }, {
                '$lookup': {
                    'from': 'wallets',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                }
                            }
                        }, {
                            '$project': {
                                'balance': 1,
                                '_id': 0
                            }
                        }
                    ],
                    'as': 'wallet'
                }
            }, {
                '$lookup': {
                    'from': 'deposits',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                }
                            }
                        }, {
                            '$group': {
                                '_id': null,
                                'totalDeposits': {
                                    '$sum': {
                                        '$cond': [
                                            {
                                                '$eq': [
                                                    '$status', 'success'
                                                ]
                                            }, '$amount', 0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    'as': 'depositStats'
                }
            }, {
                '$lookup': {
                    'from': 'withdraws',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                }
                            }
                        }, {
                            '$group': {
                                '_id': null,
                                'totalWithdrawals': {
                                    '$sum': {
                                        '$cond': [
                                            {
                                                '$eq': [
                                                    '$status', 'paid'
                                                ]
                                            }, '$amount', 0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    'as': 'withdrawStats'
                }
            }, {
                '$lookup': {
                    'from': 'betitems',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                }
                            }
                        }, {
                            '$group': {
                                '_id': null,
                                'totalBets': {
                                    '$sum': 1
                                },
                                'totalWon': {
                                    '$sum': {
                                        '$cond': [
                                            {
                                                '$eq': [
                                                    '$status', 'won'
                                                ]
                                            }, '$winAmount', 0
                                        ]
                                    }
                                },
                                'totalLost': {
                                    '$sum': {
                                        '$cond': [
                                            {
                                                '$eq': [
                                                    '$status', 'lost'
                                                ]
                                            }, '$amount', 0
                                        ]
                                    }
                                }
                            }
                        }
                    ],
                    'as': 'betStats'
                }
            }, {
                '$lookup': {
                    'from': 'betitems',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                },
                                'status': 'pending'
                            }
                        }, {
                            '$sort': {
                                'createdAt': -1
                            }
                        }, {
                            '$limit': 5
                        }, {
                            '$project': {
                                '_id': 1,
                                'amount': 1,
                                'market': 1,
                                'betType': 1,
                                'digit': 1,
                                'session': 1,
                                'createdAt': 1
                            }
                        }
                    ],
                    'as': 'activeBets'
                }
            }, {
                '$lookup': {
                    'from': 'customerbankaccounts',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                }
                            }
                        }, {
                            '$project': {
                                '_id': 0,
                                'id': '$_id',
                                'accountHolder': 1,
                                'bankName': 1,
                                'accountNumber': 1,
                                'ifsc': 1,
                                'isPrimary': 1
                            }
                        }
                    ],
                    'as': 'bankAccounts'
                }
            }, {
                '$lookup': {
                    'from': 'customerupiaccounts',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                }
                            }
                        }, {
                            '$project': {
                                '_id': 0,
                                'id': '$_id',
                                'upiId': '$upiId',
                                'isPrimary': 1
                            }
                        }
                    ],
                    'as': 'upiAccounts'
                }
            }, {
                '$lookup': {
                    'from': 'supporttickets',
                    'let': {
                        'customerId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$customerId', '$$customerId'
                                    ]
                                }
                            }
                        }, {
                            '$sort': {
                                'createdAt': -1
                            }
                        }, {
                            '$limit': 5
                        }, {
                            '$project': {
                                '_id': 0,
                                'id': '$_id',
                                'subject': 1,
                                'status': 1,
                                'createdAt': 1
                            }
                        }
                    ],
                    'as': 'supportTickets'
                }
            }, {
                '$project': {
                    '_id': 1,
                    'name': 1,
                    'email': 1,
                    'phone': 1,
                    'status': 1,
                    'isDepositBlocked': 1,
                    'isWithdrawBlocked': 1,
                    'createdAt': 1,
                    'lastLoginAt': 1,
                    'walletBalance': {
                        '$ifNull': [
                            {
                                '$first': '$wallet.balance'
                            }, 0
                        ]
                    },
                    'totalDeposits': {
                        '$ifNull': [
                            {
                                '$first': '$depositStats.totalDeposits'
                            }, 0
                        ]
                    },
                    'totalWithdrawals': {
                        '$ifNull': [
                            {
                                '$first': '$withdrawStats.totalWithdrawals'
                            }, 0
                        ]
                    },
                    'totalBets': {
                        '$ifNull': [
                            {
                                '$first': '$betStats.totalBets'
                            }, 0
                        ]
                    },
                    'totalWon': {
                        '$ifNull': [
                            {
                                '$first': '$betStats.totalWon'
                            }, 0
                        ]
                    },
                    'totalLost': {
                        '$ifNull': [
                            {
                                '$first': '$betStats.totalLost'
                            }, 0
                        ]
                    },
                    'netProfit': {
                        '$subtract': [
                            {
                                '$ifNull': [
                                    {
                                        '$first': '$betStats.totalWon'
                                    }, 0
                                ]
                            }, {
                                '$ifNull': [
                                    {
                                        '$first': '$betStats.totalLost'
                                    }, 0
                                ]
                            }
                        ]
                    },
                    'bankAccounts': 1,
                    'upiAccounts': 1,
                    'activeBets': 1,
                    'supportTickets': 1
                }
            }, {
                '$skip': 0
            }, {
                '$limit': 20
            }
        ])
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
const setCustomerName = async (customerId, name) => {
    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            throw new ApiError(httpStatus.status.NOT_FOUND, "Customer not found");
        }
        customer.name = name;
        await customer.save();
        return customer;
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}

const getCustomerProfile = async (customerId) => {
    try {
        return await Customer.aggregate([
            {
                '$match': {
                    '_id': new ObjectId(customerId)
                }
            }, {
                '$lookup': {
                    'from': 'wallets',
                    'localField': '_id',
                    'foreignField': 'customerId',
                    'as': 'wallet'
                }
            }, {
                '$project': {
                    'name': 1,
                    'email': 1,
                    'walletBalance': {
                        '$arrayElemAt': [
                            '$wallet.balance', 0
                        ]
                    }
                }
            }
        ]);

    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message);
    }
}
module.exports = {
    getCustomer,
    setCustomerName,
    getCustomerProfile,
    getCustomers
}