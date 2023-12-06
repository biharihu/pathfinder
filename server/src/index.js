const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Client } = require("@googlemaps/google-maps-services-js");

const { cities } = require("./helpers");

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());

const googleMapsApiKey = "<google maps key>"; // Replace with your API key

const googleMapsClient = new Client({});

// API endpoint to find the shortest path
app.post("/shortest-path", async (req, res) => {
  const { origin, destination } = req.body;
  try {
    const shortestPath = await findShortestPath(origin, destination);
    res.json({ path: shortestPath });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

async function findShortestPath(origin, destination) {
  try {
    const directionsResponse = await googleMapsClient
      .directions({
        params: {
          origin,
          destination,
          mode: "driving",
          key: googleMapsApiKey,
        },
      })
      .then((response) => {
        console.log("response  => ", response);
        return response;
      })
      .catch((err) => {
        console.log("err  => ", err);
        return err;
      });

    console.log("directionsResponse  => ", directionsResponse);

    const data = directionsResponse.data;

    console.log("data  => ", data);
    if (data.status === "OK") {
      const route = data.routes[0];
      const path = route.legs.reduce((acc, leg) => {
        return acc.concat(leg.steps.map((step) => step.start_location));
      }, []);

      path.push(
        route.legs[route.legs.length - 1].steps.slice(-1)[0].end_location
      );

      return path;
    } else {
      throw new Error(`Failed to retrieve directions. Status: ${data.status}`);
    }
  } catch (error) {
    throw new Error(`Error: ${error.message}`);
  }
}

// API endpoint to get list of cities
app.get("/cities", async (req, res) => {
  try {
    res.json({ cities });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Running on http://localhost:${port}`);
});
