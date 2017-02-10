/**
 * Created by Stefan Aleksik on 06.2.2017.
 */
var json2csv = require('json2csv');
var fs = require('fs');
var FormData = require('form-data');

//External server URL
var serverURL = "http://celtest1.lnu.se:3003/upload";
/*
 * Sending data to an external server
 * @param username (String)- the username used in Spotify/Lastfm apps
 * @param apiType (String) - the type of Web API: spotify/lastfm
 * @param method (String) - the Web API request: e.g., saved-tracks, top-tracks,top-artists, etc.
 * @param fields (Array) - an array of field names that will be extracted from json object
 * @param data (Array) - an array of JSON objects
 */
exports.sendData = function(username,apiType,method,fields,data){

    var csv = json2csv({data:data,fields:fields});


    var filename = apiType+"_"+method + ".csv";

    fs.writeFile(filename,csv,function(err){
        if(err) {console.log(err)}

        var formdata = new FormData();

        formdata.append('csvfiles',fs.createReadStream(filename));
        formdata.append('username',username);
        formdata.append('apiType',apiType);
        formdata.append('method',method);

        formdata.submit(serverURL, function(err, res) {
            console.log(res.body);
        });

    })
};

