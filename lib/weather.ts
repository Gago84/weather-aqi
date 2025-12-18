export async function fetchWeatherAQI(lat: number, lon: number) {
    const weatherUrl =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;
  
    const airUrl =
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm2_5`;
  
    const [wRes, aRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(airUrl),
    ]);
  
    const weather = await wRes.json();
    const air = await aRes.json();
  
    const temp = weather.current.temperature_2m;
    const pm25 = air.current.pm2_5;
  
    return {
      temp: Math.round(temp),
      aqi: pm25ToAQI(pm25),
    };
  }
  
  function pm25ToAQI(pm25: number) {
    if (pm25 == null) return -1;
    if (pm25 <= 12) return Math.round((50 / 12) * pm25);
    if (pm25 <= 35.4)
      return Math.round(51 + ((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1));
    if (pm25 <= 55.4)
      return Math.round(101 + ((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5));
    return 200;
  }
  