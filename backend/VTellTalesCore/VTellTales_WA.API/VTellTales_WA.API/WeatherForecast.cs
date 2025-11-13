using System;

namespace VTellTales_WA.API
{
    public class WeatherForecast
    {
        public DateTime Date { get; set; }

        public int TemperatureC { get; set; }

        public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);

        // Allow null here to satisfy the compiler when no value is provided by callers/tests.
        public string? Summary { get; set; }
    }
}
