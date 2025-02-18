var express = require('express');
var router = express.Router();
const authorization = require("../middleware/requireAuthorization");


/* GET movies listing. */
router.get("/movies/search", function (req, res, next) {
  const perPage = 100; // Results per page
  
  page = req.query.page || 1;

  if (isNaN(page)) {
    return res.status(400).json({ error: true, message: "Invalid page format. page must be a number." });
  }

  page = Number(req.query.page) || 1; // Get page number from query, default is 1
  
  const title = req.query.title || ""; // Get title from query, default is empty string
  const year = req.query.year;
  const offset = (page - 1) * perPage;

  // Validate the year format
  if (year && !/^\d{4}$/.test(year)) {
    return res.status(400).json({ error: true, message: "Invalid year format. Format must be yyyy." });
  }

  
  
  req.db
    .from("basics")
    .where('primaryTitle', 'like', `%${title}%`)
    .modify((queryBuilder) => {
      if (year) {
        queryBuilder.where('year', year);
      }
    })
    .count('* as total') // Counts total number of rows
    .then(countRows => {
      const total = countRows[0].total;
      const lastPage = Math.ceil(total / perPage);
      const nextPage = page < lastPage ? page + 1 : null;
      const prevPage = page > 1 ? page - 1 : null;

      return req.db
        .from("basics")
        .select(
          "primaryTitle as title",
          "year",
          "tconst as imdbID",
          "imdbRating",
          "rottentomatoesRating as rottenTomatoesRating",
          "metacriticRating",
          "rated as classification"
        )
        .where('primaryTitle', 'like', `%${title}%`)
        .modify((queryBuilder) => {
          if (year) {
            queryBuilder.where('year', year);
          }
        })
        .limit(perPage) // Limit results to 100
        .offset(offset) // ensures the correct page is returned
        .then((rows) => {
          const processedRows = rows.map(row => ({
            ...row,
            imdbRating: Number(row.imdbRating) || null,
            rottenTomatoesRating: Number(row.rottenTomatoesRating) || null,
            metacriticRating: Number(row.metacriticRating) || null,
          }));
          res.json({
            data: processedRows,
            // Add pagination data to response
            pagination: {
              total: total,
              lastPage: lastPage,
              prevPage: prevPage,
              nextPage: nextPage,
              perPage: perPage,
              currentPage: page,
              from: offset,
              to: offset + processedRows.length
            }
          });
        });
    })
});

/* GET movie by imdbID. */
router.get("/movies/data/:imdbID", function (req, res, next) {

  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message: "Invalid query parameters: " + Object.keys(req.query).join(', ') + ". Query parameters are not permitted."
    });
  }

  req.db
    .from("basics")
    .select(
      "primaryTitle as title",
      "year",
      "runtimeMinutes as runtime",
      "genres",
      "country",
      "boxoffice",
      "poster",
      "plot"
    )
    .where('tconst', req.params.imdbID)
    .then((rows) => {
      if (!rows.length) {
        return res.status(404).json({
          error: true,
          message: "No record exists of a movie with this ID"
        });
      }

      rows[0].genres = rows[0].genres.split(',');

      // Get the data from ratings table
      req.db
        .from("ratings")
        .select(
          "source",
          "value"
        )
        .where('tconst', req.params.imdbID)
        .then((ratingRows) => {
          // Parse the ratings
          const ratings = ratingRows.map(row => {
            return {
              source: row.source,
              value: parseFloat(row.value) // make sure the value is a number
            };
          });

          // Get the principal data
          req.db
            .from("principals")
            .select(
              "nconst as id",
              "category",
              "name",
              "characters"
            )
            .where('tconst', req.params.imdbID)
            .then((principalRows) => {
              principalRows.forEach(row => {
                if (row.characters) {
                  try {
                    // Parse the JSON string to a JavaScript array
                    row.characters = JSON.parse(row.characters);
                  } catch (err) {
                    console.log('Error parsing characters JSON', err);
                    row.characters = [];
                  }
                } else {
                  row.characters = [];
                }
              });

              // Create a new object, copying over the properties in the desired order
              const movieData = {
                title: rows[0].title,
                year: rows[0].year,
                runtime: rows[0].runtime,
                genres: rows[0].genres,
                country: rows[0].country,
                principals: principalRows,
                ratings: ratings,
                boxoffice: rows[0].boxoffice,
                poster: rows[0].poster,
                plot: rows[0].plot
              };

              res.json(movieData);
            });
        });
    });
});


/* GET people by ID */
router.get("/people/:id", authorization, function (req, res, next) {

  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message: "Invalid query parameters: " + Object.keys(req.query).join(', ') + ". Query parameters are not permitted."
    });
  }

  req.db
    .from("names")
    .select(
      "primaryName as name",
      "birthYear",
      "deathYear",
    )
    .where('nconst', req.params.id)
    .then((rows) => {
      if (!rows.length) {
        return res.status(404).json({
          error: true,
          message: "No record exists of a person with this ID"
        });
      }

      // Get the roles data from principals table
      req.db
        .from("principals")
        .select(
          "basics.primaryTitle as movieName",
          "principals.tconst as movieId",
          "principals.category",
          "principals.characters",
          "basics.imdbRating"
        )
        .leftJoin("basics", "principals.tconst", "basics.tconst")
        .where('principals.nconst', req.params.id)
        .then((rolesRows) => {
          // Parse the characters and imdbRating
          rolesRows.forEach(row => {
            if (row.characters) {
              try {
                // Parse the JSON string to a JavaScript array
                row.characters = JSON.parse(row.characters);
              } catch (err) {
                console.log('Error parsing characters JSON', err);
                row.characters = [];
              }
            } else {
              row.characters = [];
            }
            
            // Convert imdbRating to float
            if (row.imdbRating) {
              row.imdbRating = parseFloat(row.imdbRating);
            }
          });

          // Create a new object, copying over the properties in the desired order
          const peopleData = {
            name: rows[0].name,
            birthYear: rows[0].birthYear,
            deathYear: rows[0].deathYear,
            roles: rolesRows  // added the roles array here
          };

          res.json(peopleData);
        });
    });
});




  module.exports = router;
