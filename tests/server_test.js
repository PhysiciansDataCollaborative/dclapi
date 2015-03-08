var assert = require("assert");
var sinon = require("sinon");
var request = require("supertest");

var database = require("../lib/database");
var server = require("../lib/server");

describe("Server", function() {
    describe("GET /classbyatc/", function() {
        var db;
        var webService;

        beforeEach(function() {
            db = sinon.createStubInstance(database.SQLiteInterface);
            webService = new server.ExpressServer(db);
        });

        it("should return JSON containing description for a known ATC code", function(done) {
            db.getAtcDescription = function(atcCode, callback) {
                if (atcCode === "A") {
                    callback(null, "ALIMENTARY TRACT AND METABOLISM");
                }
            };

            request(webService.expressApp).get("/classbyatc/A")
                .expect(200)
                .expect("Content-Type", "application/json; charset=utf-8")
                .end(function(error, response) {
                    if (error) {
                        throw error;
                    }

                    assert.deepEqual(
                        JSON.parse(response.text),
                        {ATC: "A", class: "ALIMENTARY TRACT AND METABOLISM"}
                    );

                    done();
                });
        });

        it("should return 404 and error message for an unknown ATC code", function(done) {
            var errorMessage = "ATC code not recognized";
            db.getAtcDescription = function(atc, callback) {
                callback(new Error(errorMessage), null);
            };

            request(webService.expressApp).get("/classbyatc/NOTRECOG")
                .expect(404)
                .expect("Content-Type", "application/json; charset=utf-8")
                .end(function(error, response) {
                    if (error) {
                        throw error;
                    }

                    assert.deepEqual(
                        JSON.parse(response.text),
                        {ATC: "NOTRECOG", error: errorMessage}
                    );

                    done();
                });
        });
    });
});
