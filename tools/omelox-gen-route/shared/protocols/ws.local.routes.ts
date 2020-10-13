export const wsRoutes = { chess:
   { client:
      { request:
         { c_enterScene: 'c_enterScene',
           c_getGameList: 'c_getGameList',
           c_getSceneConfig: 'c_getSceneConfig',
           c_leaveScene: 'c_leaveScene' } } },
  game:
   { chessRank:
      { request:
         { c_playerReady: 'c_playerReady',
           c_playerUnReady: 'c_playerUnReady' },
        push:
         { s_playerReady: 's_playerReady',
           s_playerUnReady: 's_playerUnReady' } },
     pokqznn:
      { request:
         { c_addBet: 'c_addBet',
           c_robBanker: 'c_robBanker',
           c_selectCard: 'c_selectCard' },
        push:
         { s_betMulti: 's_betMulti',
           s_countdown: 's_countdown',
           s_initHandCards: 's_initHandCards',
           s_playerAddBet: 's_playerAddBet',
           s_playerRobBanker: 's_playerRobBanker',
           s_playerSelectedCard: 's_playerSelectedCard',
           s_robBankerMulti: 's_robBankerMulti',
           s_roomInfo: 's_roomInfo',
           s_setBanker: 's_setBanker',
           s_settlement: 's_settlement',
           s_showCard: 's_showCard' } },
     lastwar: { request: { c_attack: 'c_attack' } } },
  connector: { client: { request: { c_login: 'c_login' } } } }