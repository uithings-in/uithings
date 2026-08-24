const { listComponents } = require("./src/controllers/componentController");
const mongoose = require("mongoose");
const { Component } = require("./src/models/Component");

async function run() {
  Component.find = function(query) {
    console.log("Query:", JSON.stringify(query, null, 2));
    return {
      sort: () => ({
        skip: () => ({
          limit: () => ({
            select: () => ({
              populate: () => ({
                lean: () => Promise.resolve([])
              })
            })
          })
        })
      })
    };
  };
  Component.countDocuments = function(query) {
    return Promise.resolve(0);
  };
  
  const req = {
    query: {
      page: "1",
      limit: "15",
      skip: "0",
      designType: "UI Design"
    }
  };
  const res = {
    set: (k, v) => console.log("Set header", k, v),
    json: (data) => console.log("Result:", JSON.stringify(data, null, 2)),
    status: (s) => { console.log("Status:", s); return res; },
    send: (msg) => console.log("Send:", msg)
  };
  
  try {
    await listComponents(req, res, (err) => console.error("Next error:", err));
  } catch (err) {
    console.error("Caught error:", err);
  }
}
run();
