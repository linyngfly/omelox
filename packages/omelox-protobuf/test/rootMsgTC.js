var tc = module.exports;

tc.onMove = {
    'entityId':14,
    'path' : [{'x':128,'y':796},{'x':677,'y':895}],
    'speed':160
};

tc['area.playerHandler.enterScene'] = {
    entities : {
        item : [
            {
                entityId : 1,
                kindId : 1001
            },
            {
                entityId : 2,
                kindId : 1002
            }
        ],
        equipment : [
            {
                entityId : 1,
                kindId : 2001
            },
            {
                entityId : 2,
                kindId : 2002
            }
        ]
    },
    curPlayer : {
        entityId : 1,
        kindId : 3001,
        bag : {
            items : [
                {
                    id : 1,
                    type : 'omelox'
                },
                {
                    id : 2,
                    type : 'protobuf'
                }
            ]
        },
        equipments : [
            {
                entityId : 1,
                kindId : 2001
            },
            {
                entityId : 2,
                kindId : 2002
            }
        ]
    },
    map : {
        name : 'a',
        width : 10,
        height : 10,
        tileW : 5,
        tileH : 5,
        weightMap:[
          {'collisions':[]},
          {'collisions':[]},
          {'collisions':[
            {'start':1,'length':3},
            {'start':79,'length':3}
          ]},
          {'collisions':[
            {'start':27,'length':2},
            {'start':78,'length':4}
          ]}
        ]
    }
};