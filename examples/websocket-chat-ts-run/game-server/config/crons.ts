module.exports = {
    "chat": [
        {
            "id": 'onlineStatus',
            // 30秒一次
            "time": "0/30 * * * * *",
            "action": "cronTest.onlineCron"
        }
    ]
}