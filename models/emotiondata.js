var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var datetimejs = require('../models/DateFormat.js');

// Create connection to database
var config =
    {
        userName: 'YOUR_DATABASE_USERNAME', // update me
        password: 'YOUR_DATABASE_PASSWORD', // update me
        server: 'YOUR_DATABASE_SERVER.database.chinacloudapi.cn', // update me
        options:
        {
            database: 'YOUR_DATABASE_NAME' //update me
            , encrypt: true
        }
    }
var dbconnection = new Connection(config);

module.exports = function (data, callback) {
    console.log('insert record into table...');
    currenttime = (new Date()).pattern("yyyy-MM-dd HH:mm:ss");
    var sqlString = "Insert dbo.emotionlist(faceid,gender,age,emotion,time) values";
    for (i = 0; i < data.length; i++) {
        if (i!=0) sqlString+=",";
        sqlString+="('" + data[i].faceid + "',N'" + data[i].gender + "','" + data[i].age + "',N'" + data[i].emotion + "','" + currenttime + "')";
    }
    sqlString+=";";
        // Insert Into record table
        request = new Request(
            sqlString,
            function (err, rowCount, rows) {
                console.log(rowCount + ' row(s) returned');
                callback(err);
                process.exit();
            }
        );

        request.on('row', function (columns) {
            columns.forEach(function (column) {
                console.log("%s\t%s", column.metadata.colName, column.value);
            });
        });
        if (dbconnection) dbconnection.execSql(request);
        else {
            dbconnection = new Connection(config);
            dbconnection.on('connect', function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    dbconnection.execSql(request);
                }
            }
            );
        }
    

}