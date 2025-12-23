import { NativeModules, Platform } from "react-native";

const { WeatherAqi } = NativeModules;

export function startOngoing() {
  if (Platform.OS === "android") WeatherAqi?.startService?.();
}
export function updateOngoing(temp: number, aqi: number) {
  if (Platform.OS === "android") WeatherAqi?.update?.(String(temp), String(aqi));
}
export function saveLocation(lat: number, lon: number) {
  if (Platform.OS === "android") WeatherAqi?.saveLocation?.(lat, lon);
}
export function startPeriodicUpdates() {
  if (Platform.OS === "android") WeatherAqi?.startPeriodicUpdates?.();
}