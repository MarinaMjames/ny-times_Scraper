// // Dependencies
// var express = require("express");
// var bodyParser = require("body-parser");
// var logger = require("morgan");
// var mongoose = require("mongoose");
// // Requiring our Note and Article models
// var Note = require("./models/note.js");
// var Article = require("./models/article.js");
// // Our scraping tools
// var request = require("request");
// var cheerio = require("cheerio");

// // Set mongoose to leverage built in JavaScript ES6 Promises
// mongoose.Promise = Promise;


// // Initialize Express
// var app = express();

// // Use body parser with our app
// app.use(logger("dev"));
// app.use(bodyParser.urlencoded({
//   extended: false
// }));



// // Database configuration with mongoose
// mongoose.connect("mongodb://heroku_hz6dn1zr:ikbauetepb47p1f2uin2krujkk@ds135963.mlab.com:35963/heroku_hz6dn1zr");
// var db = mongoose.connection;

// // Show any mongoose errors
// db.on("error", function(error) {
//   console.log("Mongoose Error: ", error);
// });

// // Once logged in to the db through mongoose, log a success message
// db.once("open", function() {
//   console.log("Mongoose connection successful.");
// });


// // // Routes
// // // ======


// // A GET request to scrape the echojs website
// app.get("/scrape", function(req, res) {
//   // First, we grab the body of the html with request
//   request("https://www.nytimes.com/", function(error, response, html) {
//     // Then, we load that into cheerio and save it to $ for a shorthand selector
//     var $ = cheerio.load(html);
//     // Now, we grab every h2 within an article tag, and do the following:
//     $("article .story").each(function(i, element) {

//       // Save an empty result object
//       var result = {};

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = $(this).children("h2").text();
//       result.link = $(this).children("h2").attr("href");
//       // Using our Article model, create a new entry
//       // This effectively passes the result object to the entry (and the title and link)
//       var entry = new Article(result);

//       // Now, save that entry to the db
//       entry.save(function(err, doc) {
//         if (err) {
//           console.log(err);
//         }
//         else {
//           console.log(doc);
//         }
//       });
//     });
//   });
// });

// // // This will get the articles we scraped from the mongoDB
// // app.get("/articles", function(req, res) {
// //   Article.find({}, function(err, data) {
// //     if (err) {
// //       console.log(err);
// //     }
// //     else {
// //       console.log(data);
// //       res.json(data);
// //     }
// //   });
// // });

// // // This will grab an article by it's ObjectId
// // app.get("/articles/:id", function(req, res) {
// //   // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
// //   Article.findOne({ "_id": req.params.id })
// //   // ..and populate all of the notes associated with it
// //   .populate("note")
// //   // now, execute our query
// //   .exec(function(error, doc) {
// //     // Log any errors
// //     if (error) {
// //       console.log(error);
// //     }
// //     // Otherwise, send the doc to the browser as a json object
// //     else {
// //       res.json(doc);
// //     }
// //   });
// // });

// // // // Create a new note or replace an existing note
// // app.post("/articles/:id", function(req, res) {
// //   // Create a new note and pass the req.body to the entry
// //   var newNote = new Note(req.body);

// //   // And save the new note the db
// //   newNote.save(function(error, doc) {
// //     // Log any errors
// //     if (error) {
// //       console.log(error);
// //     }
// //     // Otherwise
// //     else {
// //       // Use the article id to find and update it's note
// //       Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
// //       // Execute the above query
// //       .exec(function(err, doc) {
// //         // Log any errors
// //         if (err) {
// //           console.log(err);
// //         }
// //         else {
// //           // Or send the document to the browser
// //           res.send(doc);
// //         }
// //       });
// //     }
// //   });
// // });

// // Listen on port 3000
// app.listen(3000, function() {
//   console.log("App running on port 3000!");
// });





// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
// Make public a static dir
app.use(express.static("public"));

// Database configuration
var databaseUrl = "nyscraper";
var collections = ["data"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.nyscraper.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of ycombinator
request("https://www.nytimes.com/", function(error, response, html) {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".story-heading").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("a").text();
      var link = $(element).children("a").attr("href");

      // If this found element had both a title and a link
      if (title && link) {
        // Insert the data in the scrapedData db
        db.nyscraper.insert({
          title: title,
          link: link
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});
