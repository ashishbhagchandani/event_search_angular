var express = require("express");
const request = require("request");
var geohash = require("ngeohash");
var cors = require("cors");
var app = express();

var SpotifyWebApi = require("spotify-web-api-node");

// credentials are optional
const spotifyApi = new SpotifyWebApi();

// set the client ID and client secret of your Spotify app
spotifyApi.setClientId("");
spotifyApi.setClientSecret("");

app.use(express.json());
app.use(cors());

app.get("/ticketmastersearch", async (req, res) => {
  const { keyword, segmentId, lat, lng, radius } = req.query;
  const locationhash = geohash.encode(lat, lng, 7);
  let url =
    "https://app.ticketmaster.com/discovery/v2/events.json?apikey=";
  url += "&keyword=" + keyword;
  if (segmentId) {
    url += "&segmentId=" + segmentId;
  }
  url += "&radius=" + radius;
  url += "&unit=miles";
  url += "&geoPoint=" + locationhash;
  console.log(url);
  await request(url, { json: true }, (err, response, body) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.json(body);
    }
  });
});

app.get("/ticketmastersuggest", (req, res) => {
  // console.log(req);
  const keyword = req.query.value;
  // console.log(keyword);
  let url =
    "https://app.ticketmaster.com/discovery/v2/suggest?apikey=";
  url += "&keyword=" + keyword;
  // console.log(url);
  request(url, { json: true }, (err, response, body) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.json(body);
    }
  });
});

app.get("/ticketmastereventdetail", (req, res) => {
  const id = req.query.id;
  const url = `https://app.ticketmaster.com/discovery/v2/events/${id}?apikey=`;
  console.log(url);
  request(url, { json: true }, (err, response, body) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.json(body);
    }
  });
});

app.get("/spotifysearchartist", async (req, res) => {
  // console.log("artist", req.query["artistlist"].split(","));
  if (req.query["artistlist"] == "") {
    return [];
  }
  const artistname = req.query["artistlist"].split(",");
  // console.log("artistname11", artistname);
  // if (artistname.length == 0) {
  //   console.log("artistname", artistname);
  //   return [];
  // }
  // var resdata = [];
  request.post(
    {
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            ":"
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      form: {
        grant_type: "client_credentials",
      },
    },
    async function (error, response, body) {
      if (error) {
        console.log(error);
        res.status(500).send("Error getting access token");
      } else {
        const accessToken = JSON.parse(body).access_token;
        console.log(accessToken);
        spotifyApi.setAccessToken(accessToken);

        const searchPromises = artistname.map((searchTerm) => {
          return spotifyApi.searchArtists(searchTerm).then(
            function (data) {
              // console.log("test", data.body.artists.items[0].name);
              let artistId;
              if (
                data.body.artists.items[0].name.toLowerCase() ==
                searchTerm.toLowerCase()
              ) {
                artistId = data.body.artists.items[0].id;
              }

              // Get album and artist data in parallel
              return Promise.all([
                spotifyApi.getArtistAlbums(artistId, { limit: 3 }),
                spotifyApi.getArtist(artistId),
              ]).then(function ([albumData, artistData]) {
                const result = {
                  artist: artistData.body,
                  album: albumData.body,
                };
                return result;
              });
            },
            function (err) {
              console.error(err);
              res.status(500).send("Error searching artists");
            }
          );
        });

        try {
          const searchResults = await Promise.all(searchPromises);
          // console.log(searchResults);
          res.json(searchResults);
        } catch (error) {
          console.error(error);
          res.status(500).send("Error getting search results");
        }
      }
    }
  );
});

app.get("/ticketmastervenue", (req, res) => {
  console.log(req.query);
  const venue = req.query.venue;
  const url = `https://app.ticketmaster.com/discovery/v2/venues?apikey=&keyword=${venue}`;
  console.log(url);
  request(url, { json: true }, (err, response, body) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    } else {
      res.json(body);
    }
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("service on port 3000!");
  console.log(__dirname);
});

console.log(__dirname);
app.use(express.static(__dirname + "/dist/hw8"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/dist/hw8/index.html");
});
app.get("/search", (req, res) => {
  res.sendFile(__dirname + "/dist/hw8/index.html");
});
app.get("/favorites", (req, res) => {
  res.sendFile(__dirname + "/dist/hw8/index.html");
});
