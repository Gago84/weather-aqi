export async function fetchWeatherAQI(lat: number, lon: number) {
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;

  const airUrl =
    `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`;

  const [wRes, aRes] = await Promise.all([fetch(weatherUrl), fetch(airUrl)]);

  if (!wRes.ok) throw new Error(`Weather API error: ${wRes.status}`);
  if (!aRes.ok) throw new Error(`Air API error: ${aRes.status}`);

  const weather = await wRes.json();
  const air = await aRes.json();

  const tempRaw = weather?.current?.temperature_2m;
  const pm25Raw = air?.current?.pm2_5;

  if (typeof tempRaw !== "number") throw new Error("Missing temperature_2m");
  if (typeof pm25Raw !== "number") throw new Error("Missing pm2_5");

  return {
    temp: Math.round(tempRaw),
    aqi: pm25ToUSaqi(pm25Raw),
  };
}

function pm25ToUSaqi(pm25: number): number {
  // EPA uses truncated 1 decimal place for PM2.5
  const c = Math.floor(pm25 * 10) / 10;

  const table: Array<[number, number, number, number]> = [
    [0.0, 12.0, 0, 50],
    [12.1, 35.4, 51, 100],
    [35.5, 55.4, 101, 150],
    [55.5, 150.4, 151, 200],
    [150.5, 250.4, 201, 300],
    [250.5, 350.4, 301, 400],
    [350.5, 500.4, 401, 500],
  ];

  for (const [cl, ch, il, ih] of table) {
    if (c >= cl && c <= ch) {
      const aqi = ((ih - il) / (ch - cl)) * (c - cl) + il;
      return clampInt(Math.round(aqi), 0, 500);
    }
  }

  return c > 500.4 ? 500 : 0;
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
