const Tedious = require("tedious");
const Promise = require("bluebird");

module.exports = {
    msSqlConnecter: function (config) {
        let currentConnect;
        currentConnect = this;
        currentConnect.config = config;
        currentConnect.errorHandler;
        currentConnect.connectedHandler;
        currentConnect.connection;

        currentConnect.onConnected = function (callback) {
            currentConnect.connectedHandler = callback;
            return currentConnect;
        };

        currentConnect.onError = function (callback) {
            currentConnect.errorHandler = callback;
            return currentConnect;
        };

        currentConnect.Request = function (sql) {
            let currentRequest = this;
            currentRequest.sql = sql;
            currentRequest.params = [];
            currentRequest.result = [];

            currentRequest.errorHandler;
            currentRequest.onComplateHandler;

            currentRequest.addParam = function (key, type, value) {
                currentRequest.params.push({ key: key, type: type, value: value });
                return currentRequest;
            };

            currentRequest.Run = function () {
                let request = new Tedious.Request(currentRequest.sql, function (err, rowCount, rows) {
                    if (err) {
                        currentRequest.errorHandler(err);
                    }
                    else {
                        currentRequest.onComplateHandler(rowCount, currentRequest.result);
                    }
                });

                request.on("row", function (columns) {
                    let item = {};
                    columns.forEach(function (column) {

                        item[column.metadata.colName] = column.value;
                    });
                    currentRequest.result.push(item);
                });

                for (let i in currentRequest.params) {
                    let item = currentRequest.params[i];
                    request.addParameter(item.key, item.type, item.value);
                }

                currentConnect.connection.execSql(request);
                return currentRequest;
            };

            currentRequest.onError = function (callback) {
                currentRequest.errorHandler = callback;
                return currentRequest;
            };

            currentRequest.onComplate = function (callback) {
                currentRequest.onComplateHandler = callback;

                return currentRequest;
            };
        };

        currentConnect.connect = function () {
            let connection = new Tedious.Connection(config);
            currentConnect.connection = connection;
            return Promise.promisify(connection.on.bind(connection))("connect");
        }
    }
};