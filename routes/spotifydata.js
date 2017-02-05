/**
 * Created by Stefan Aleksik on 05.2.2017.
 */
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});


module.exports = router;