import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { fetchWeatherAQI } from "../../lib/weather";

export default function HomeScreen() {
  const [data, setData] = useState<{ temp: number; aqi: number } | null>(null);
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

      setData(result);
    })().catch((e) => setError(String(e)));
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 36 }}>🌡 {data.temp}°C</Text>
      <Text style={{ fontSize: 28 }}>🌫 AQI {data.aqi}</Text>
    </View>
  );
}
