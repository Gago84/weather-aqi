import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import {
  saveLocation,
  startOngoing,
  startPeriodicUpdates,
  updateOngoing,
} from "../../lib/androidOngoingNotif";
import { fetchWeatherAQI } from "../../lib/weather";

type WeatherData = {
  temp: number;
  aqi: number;
};

export default function HomeScreen() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const result = await fetchWeatherAQI(
        loc.coords.latitude,
        loc.coords.longitude
      );

      // ---- UI ----
      setData(result);
      setUpdatedAt(new Date());

      // ---- Android background / notification ----
      startOngoing();
      updateOngoing(result.temp, result.aqi);

      saveLocation(loc.coords.latitude, loc.coords.longitude);
      startPeriodicUpdates();
    })().catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.temp}>🌡 {data.temp}°C</Text>
      <Text style={styles.aqi}>🌫 AQI {data.aqi}</Text>

      {updatedAt && (
        <Text style={styles.updated}>
          Updated {formatTime(updatedAt)}
        </Text>
      )}
    </View>
  );
}

/* ---------- helpers ---------- */

function formatTime(d: Date) {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/* ---------- styles ---------- */

const styles = {
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "#000", // looks nice on AMOLED
  },
  center: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  temp: {
    fontSize: 40,
    color: "#fff",
    fontWeight: "600" as const,
  },
  aqi: {
    fontSize: 28,
    color: "#fff",
    marginTop: 6,
  },
  updated: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
  },
  error: {
    color: "red",
  },
};
