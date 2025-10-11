import { z } from 'zod';
import axios from 'axios';
import { ZodTool } from '../types';

const WeatherApiSchema = z.object({
  city: z.string().min(1, 'City name is required'),
  country: z.string().optional(),
  units: z.enum(['metric', 'imperial', 'kelvin']).default('metric'),
  apiKey: z.string().optional().describe('OpenWeatherMap API key (optional, will use default if not provided)'),
});

const WeatherApiOutputSchema = z.object({
  city: z.string(),
  country: z.string(),
  temperature: z.number(),
  feelsLike: z.number(),
  humidity: z.number(),
  pressure: z.number(),
  description: z.string(),
  windSpeed: z.number(),
  windDirection: z.number(),
  visibility: z.number(),
  timestamp: z.string(),
  error: z.boolean().optional(),
});

export const weatherApiTool: ZodTool = {
  name: 'weather_api',
  description: 'Get current weather information for any city using wttr.in (free, no API key required)',
  inputSchema: WeatherApiSchema,
  outputSchema: WeatherApiOutputSchema,
  execute: async (args: z.infer<typeof WeatherApiSchema>) => {
    const { city, country, units, apiKey } = WeatherApiSchema.parse(args);
    
    // Use provided API key or fallback to environment variable
    const weatherApiKey = apiKey || process.env.OPENWEATHER_API_KEY || 'demo_key';
    
    try {
      // Using wttr.in - completely free weather API, no API key required
      const location = country ? `${city},${country}` : city;
      const response = await axios.get(`https://wttr.in/${encodeURIComponent(location)}`, {
        params: {
          format: 'j1', // JSON format
          lang: 'en',
        },
        timeout: 10000,
      });

      const data = response.data as any;
      const current = data.current_condition[0];
      
      return {
        city: data.nearest_area[0].areaName[0].value,
        country: data.nearest_area[0].country[0].value,
        temperature: parseFloat(current.temp_C),
        feelsLike: parseFloat(current.FeelsLikeC),
        humidity: parseInt(current.humidity),
        pressure: parseInt(current.pressure),
        description: current.weatherDesc[0].value,
        windSpeed: parseFloat(current.windspeedKmph) * 0.277778, // Convert km/h to m/s
        windDirection: parseInt(current.winddirDegree),
        visibility: parseFloat(current.visibility),
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      if (error.response) {
        return {
          city,
          country: country || '',
          temperature: 0,
          feelsLike: 0,
          humidity: 0,
          pressure: 0,
          description: 'Error fetching weather data',
          windSpeed: 0,
          windDirection: 0,
          visibility: 0,
          timestamp: new Date().toISOString(),
          error: true,
        };
      }
      throw new Error(`Weather API call failed: ${error.message}`);
    }
  },
};
