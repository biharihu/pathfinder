import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const RenderMap = () => {
  const [map, setMap] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedOrigin, setSelectedOrigin] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const convertData = (data) => {
    const converted = data.map((item) => {
      return {
        value: item.name,
        label: item.name,
        ...item,
      };
    });

    return converted;
  };

  useEffect(() => {
    // Fetch the list of cities from your server or an API
    const fetchCities = async () => {
      try {
        const response = await axios.get("http://localhost:4000/cities");
        setCities(convertData(response.data.cities));
      } catch (error) {
        console.error("Error fetching cities:", error.message);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    const fetchShortestPath = async () => {
      try {
        if (selectedOrigin && selectedDestination) {
          const response = await axios.post(
            "http://localhost:4000/shortest-path",
            {
              origin: selectedOrigin.value,
              destination: selectedDestination.value,
            }
          );

          const encodedPolyline = response.data.path;
          renderPolyline(encodedPolyline);
        }
      } catch (error) {
        console.error("Error fetching shortest path:", error);
      }
    };

    if (map === null) {
      setMap(
        new window.google.maps.Map(document.getElementById("map"), {
          center: { lat: 0, lng: 0 },
          zoom: 2,
        })
      );
    } else {
      fetchShortestPath();
    }
  }, [map, selectedOrigin, selectedDestination]);

  const renderPolyline = (encodedPolyline) => {
    const pathCoordinates = encodedPolyline.map((point) => ({
      lat: parseFloat(point.lat),
      lng: parseFloat(point.lng),
    }));

    const pathPolyline = new window.google.maps.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    pathPolyline.setMap(
      new window.google.maps.Map(document.getElementById("map"), {
        center: { lat: encodedPolyline[0].lat, lng: encodedPolyline[0].lng },
        zoom: 5,
      })
    );
  };

  const handleOriginChange = (selectedOption) => {
    setSelectedOrigin(selectedOption);
  };

  const handleDestinationChange = (selectedOption) => {
    setSelectedDestination(selectedOption);
  };

  return (
    <div>
      <div style={{ marginBottom: "16px" }}>
        <label>Origin:</label>
        <Select
          value={selectedOrigin}
          onChange={handleOriginChange}
          options={cities}
          isClearable
        />
      </div>
      <div style={{ marginBottom: "16px" }}>
        <label>Destination:</label>
        <Select
          value={selectedDestination}
          onChange={handleDestinationChange}
          options={cities}
          isClearable
        />
      </div>
      <div id="map" style={{ height: "500px" }}></div>
    </div>
  );
};

export default RenderMap;
