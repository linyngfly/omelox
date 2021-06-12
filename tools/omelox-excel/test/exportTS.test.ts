import * as should from 'should';
import ExportServerTS from '../lib/exportServerTS';

let exportTS = new ExportServerTS({
    inputdir: '../template',
    outdir: '../out',
    channel: 'wechat,google',
    type: 1,
});
exportTS.genConfig()


// describe('utils test', function () {
//     describe('#invokeCallback', function () {
//         it('should gen config ok', function () {
//             let exportTS = new ExportServerTS({
//                 inputdir: '../template',
//                 outdir: '../out',
//                 channel: 'wechat,google',
//                 type: 1,
//             });
//             exportTS.genConfig()

//             // let p1 = 1, p2 = 'str';

//             // let func = function (arg1: number, arg2: string) {
//             //     p1.should.equal(arg1);
//             //     p2.should.equal(arg2);
//             // };

//             // utils.invokeCallback(func, p1, p2);
//         });

//         it('should gen config fail', function () {
//             let p1 = 1, p2 = 'str';
//             (function () {
//                 // utils.invokeCallback(null, p1, p2);
//             }).should.not.throw();
//         });
//     });
// });

// process.env.PUB_VER = "wechat";

// let tt = config_data_getter.instance.getRowByIndex(fishery_fish_model, fishery_fish_model.FIELDS.ID, "key_denglongyu_boss");
// let tt1 = config_data_getter.instance.getRowByIndex(fishery_fish_model, fishery_fish_model.FIELDS.ID, "key_denglongyu_boss", "fishery_fish_boss.json");


// let aa = config_const_getter.instance.getConstData(common_const_model);
// console.log(aa.FIGHT_1V1_TREASURE_SERIES)
// // aa.CHANGE_CASH_2

// let bb = config_lang_getter.instance.getConstData(i18n_string_client_model, "vi-VN");
// console.log(bb.label_0002);
// console.log(bb.label_0001);