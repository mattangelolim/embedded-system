import "./App.css";
import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { faHeartbeat, faSun, faTint } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import firebaseConfig from "./firebase";
import secret from "./secret";

firebase.initializeApp(firebaseConfig);
firebaseConfig.apiKey = secret.apiKey;

function App() {
  const [ldrData, setLdrData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [ecgData, setECGData] = useState([]);

  useEffect(() => {
    // RETRIEVE DATA FROM FIREBASE
    const ldrRef = firebase.database().ref("Sensor/ldr_data");
    const waterRef = firebase.database().ref("Sensor/waterSensorData");
    const ecgRef = firebase.database().ref("Sensor/ecgData");

    // GET THE REALTIME VALUE OF LDR
    const handleLdrData = (snapshot) => {
      const data = snapshot.val();
      setLdrData(data);
    };
    // GET THE REALTIME VALUE OF WATER SENSOR
    const handleWaterData = (snapshot) => {
      const data = snapshot.val();
      setWaterData(data);
    };
    // GET THE REALTIME VALUE OF ECG
    const handleECGData = (snapshot) => {
      const data = snapshot.val();
      setECGData(data);
    };

    // CHECK IF ERRORS
    ldrRef.on("value", handleLdrData, (error) => {
      console.error("Error retrieving data:", error);
    });

    waterRef.on("value", handleWaterData, (error) => {
      console.error("Error retrieving data:", error);
    });

    ecgRef.on("value", handleECGData, (error) => {
      console.error("Error retrieving ECG data:", error);
    });

    // Cleanup the listener when the component unmounts
    return () => {
      ldrRef.off("value", handleLdrData);
      waterRef.off("value", handleWaterData);
      ecgRef.off("value", handleECGData);
    };
  }, []);

  // MESSAGE PROMPT DISPLAYED IN FRONTEND
  const getLdrMessage = () => {
    if (ldrData) {
      if (ldrData >= 500) {
        return "Bring your umbrella if you're going outside!";
      } else {
        return "The lighting condition is normal, have a great day ahead!";
      }
    } else {
      return "It's too dark outside.";
    }
  };

  const getWaterLevelMessage = () => {
    if (waterData) {
      if (waterData >= 500) {
        return "The water level is high. Please be careful of flashfloods!";
      } else {
        return "There is a little raining outside, bring your umbrella!";
      }
    } else {
      return "it seems like it is not raining at the moment";
    }
  };

  const getEcgDataMessage = () => {
    if (ecgData) {
      if (ecgData === 4095) {
        return "If there are no ups and downs in your life, it means you are dead.";
      } else {
        return "Protect your heart!";
      }
    } else {
      return "Detecting ECG Data...";
    }
  };

  // MANIPULATING FRONTEND BACKGROUND
  let appClassName = "App";
  if (waterData >= 500) {
    appClassName += " high-water";
  } else if (ldrData >= 500) {
    appClassName += " sunny";
  } else if (0 < ldrData && ldrData < 500 && waterData !== 0) {
    appClassName += " sunny-raining";
  } else if (0 < waterData && waterData < 500 && ldrData === 0) {
    appClassName += " raining-drizzle";
  } else if (waterData === 0 && ldrData === 0) {
    appClassName += " night";
  } else if (ecgData !== 0) {
    appClassName += " heart-beat";
  }

  return (
    <div className={appClassName}>
      <div className="container">
        <div className="container-margin">
          <div className="content">
            <h2>Sensor Interpretation</h2>
            <div className="content-list">
              <FontAwesomeIcon icon={faHeartbeat} />
              <li>Heartbeat</li>
            </div>
            <p>{getEcgDataMessage()}</p>
            <div className="content-list">
              <FontAwesomeIcon icon={faSun} />
              {ldrData !== null && <li>Sunlight</li>}
            </div>
            <p>{getLdrMessage()}</p>
            <div className="content-list">
              <FontAwesomeIcon icon={faTint} />
              <li>Water Level</li>
            </div>
            <p>{getWaterLevelMessage()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
