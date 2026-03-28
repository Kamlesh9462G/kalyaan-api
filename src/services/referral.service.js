
const httpStatus = require('http-status');
const { ObjectId } = require('mongodb')
const ApiError = require('../utils/ApiError');
const { Referral, ReferralSettings, Customer } = require('../models/index');

const getReferralStatus = async () => {
    try {
        return await ReferralSettings.aggregate([
            {
                '$project': {
                    'isReferralActive': 1
                }
            }
        ])
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getReferralSettings = async () => {
    try {
        return await ReferralSettings.aggregate([
            {
                '$project': {
                    'isReferralActive': 1,
                    'reward.referrerAmount': 1,
                    'referralLink.baseUrl': 1,
                    'campaign': 1
                }
            }
        ])
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }
}
const getReferralHistory = async (customerId) => {
    try {
        return await Customer.aggregate([
            {
                '$match': {
                    '_id': new ObjectId(customerId)
                }
            }, {
                '$lookup': {
                    'from': 'referrals',
                    'let': {
                        'userId': '$_id'
                    },
                    'pipeline': [
                        {
                            '$match': {
                                '$expr': {
                                    '$eq': [
                                        '$referrer', '$$userId'
                                    ]
                                }
                            }
                        }, {
                            '$lookup': {
                                'from': 'customers',
                                'localField': 'referredUser',
                                'foreignField': '_id',
                                'as': 'user'
                            }
                        }, {
                            '$unwind': '$user'
                        }, {
                            '$project': {
                                '_id': 0,
                                'name': '$user.name',
                                'email': '$user.email',
                                'date': '$createdAt',
                                'rewardAmount': 1,
                                'status': 1
                            }
                        }
                    ],
                    'as': 'referralHistory'
                }
            }, {
                '$addFields': {
                    'totalEarning': {
                        '$sum': {
                            '$map': {
                                'input': {
                                    '$filter': {
                                        'input': '$referralHistory',
                                        'as': 'ref',
                                        'cond': {
                                            '$eq': [
                                                '$$ref.status', 'REWARDED'
                                            ]
                                        }
                                    }
                                },
                                'as': 'r',
                                'in': '$$r.rewardAmount'
                            }
                        }
                    },
                    'totalReferral': {
                        '$size': '$referralHistory'
                    },
                    'active': {
                        '$size': {
                            '$filter': {
                                'input': '$referralHistory',
                                'as': 'ref',
                                'cond': {
                                    '$eq': [
                                        '$$ref.status', 'REWARDED'
                                    ]
                                }
                            }
                        }
                    },
                    'pending': {
                        '$size': {
                            '$filter': {
                                'input': '$referralHistory',
                                'as': 'ref',
                                'cond': {
                                    '$eq': [
                                        '$$ref.status', 'PENDING'
                                    ]
                                }
                            }
                        }
                    }
                }
            }, {
                '$project': {
                    'name': 1,
                    'email': 1,
                    'referralCode': 1,
                    'totalEarning': 1,
                    'totalReferral': 1,
                    'active': 1,
                    'pending': 1,
                    'referralHistory': 1
                }
            }
        ])
    } catch (error) {
        throw new ApiError(httpStatus.status.INTERNAL_SERVER_ERROR, error.message)
    }

}
module.exports = {
    getReferralStatus,
    getReferralSettings,
    getReferralHistory
}