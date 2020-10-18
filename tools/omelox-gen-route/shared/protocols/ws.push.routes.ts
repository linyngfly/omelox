export const wsPushRoutes = { chess:
   { client:
      { request:
         { c_enterScene: 'chess.clientHandler.c_enterScene',
           c_getGameList: 'chess.clientHandler.c_getGameList',
           c_getSceneConfig: 'chess.clientHandler.c_getSceneConfig',
           c_leaveScene: 'chess.clientHandler.c_leaveScene' } } },
  game:
   { chessRank:
      { request:
         { c_playerReady: 'game.chessRankHandler.c_playerReady',
           c_playerUnReady: 'game.chessRankHandler.c_playerUnReady' },
        push:
         { s_playerReady: 'game.chessRankHandler.s_playerReady',
           s_playerUnReady: 'game.chessRankHandler.s_playerUnReady' } },
     pokqznn:
      { request:
         { c_addBet: 'game.pokqznnHandler.c_addBet',
           c_robBanker: 'game.pokqznnHandler.c_robBanker',
           c_selectCard: 'game.pokqznnHandler.c_selectCard' },
        push:
         { s_betMulti: 'game.pokqznnHandler.s_betMulti',
           s_countdown: 'game.pokqznnHandler.s_countdown',
           s_initHandCards: 'game.pokqznnHandler.s_initHandCards',
           s_playerAddBet: 'game.pokqznnHandler.s_playerAddBet',
           s_playerRobBanker: 'game.pokqznnHandler.s_playerRobBanker',
           s_playerSelectedCard: 'game.pokqznnHandler.s_playerSelectedCard',
           s_robBankerMulti: 'game.pokqznnHandler.s_robBankerMulti',
           s_roomInfo: 'game.pokqznnHandler.s_roomInfo',
           s_setBanker: 'game.pokqznnHandler.s_setBanker',
           s_settlement: 'game.pokqznnHandler.s_settlement',
           s_showCard: 'game.pokqznnHandler.s_showCard' } },
     lastwar: { request: { c_attack: 'game.lastwarHandler.c_attack' } } },
  connector:
   { client: { request: { c_login: 'connector.clientHandler.c_login' } } } }