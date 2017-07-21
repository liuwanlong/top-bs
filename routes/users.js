var express = require('express');
var router = express.Router();
var mysql = require('../mysql/conn');

/* GET users listing. */
/*router.get('/', function(req, res, next) {
res.send('respond with a resource');
});*/

//请求实时新闻
router.get('/', function(req, res) {
    console.log(1);
    // 请求 req
    // 相应 res
    mysql.query('SELECT * FROM news WHERE TYPE = \'junshi\' OR TYPE = \'keji\' OR TYPE = \'caijing\' LIMIT 14',(err,results)=>{
        if (err) {
            console.log(err);
        }else{
            // console.log(results);
            console.log(results);
            return res.send({data:results});
        }
    });
});

// 新用户注册
router.post('/', function (req, res, next) {
    // 处理数据
    let reg = req.body;
    let login = {
        mobile: reg['mobile'],
        username: reg['username'],
        password: reg['password']
    };
    if (reg['secPwd']) {
        delete  reg['secPwd'];
    }
    reg['email'] = reg['email'].toLowerCase();
    delete reg['password'];
    console.log(reg['password'])
    // 写入到 user 表
    mysql.query(`select * from login where username=?`, reg.username, (err, result) => {
        if (result[0]) {          // 检测用户名
            // console.log(result[0],'该用户名已被注册');
            return res.send({result: 'nameExit'});
        } else {                  // 检测手机号码（主键）
            mysql.query(`select * from login where mobile=?`, reg.mobile, (err, result) => {
                if (result[0]) {
                    console.log(result[0], '该手机号已被注册');
                    return res.send({result: 'mobileExit'});
                } else {
                    mysql.query(`insert into user set ?`, reg, (err) => {
                        if (err) {
                            console.log('user --> 失败')
                        } else {       // 写入到login
                            mysql.query(`insert into login set ?`, login, (err) => {
                                err ? console.log('login --> 失败') : res.send({result: true});
                            })
                        }
                    });
                }
            });
        }
    })

});

// 用户登录
router.post('/:login', function (req, res, next) {
    let user = req.body;
    mysql.query(`select u.*,l.password from login l,user u where u.username=?
                    and l.password=?`,
        [user.username, user.password], (err, result) => {
            try {
                if (result[0].password == user.password) {
                    res.send({result: result[0]});
                } else {
                    new Error();
                }
            } catch (err) {
                mysql.query(`select u.*,l.password from login l,user u where u.mobile=?
                    and l.password=?`, [user.username, user.password], (err, result) => {
                    try{
                        if (result[0].password == user.password) {
                            res.send({result: result[0]});
                        } else {
                            res.send({result: false});
                        }
                    }catch(err){
                        res.send({result: false});
                    }
                })
            }
        });
});

module.exports = router;
