import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface WeatherData {
  temperature: number;
  condition: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  getMockWeather(): Observable<WeatherData> {
    // Simulate API call with mock data
    const mockData: WeatherData = {
      temperature: 22,
      condition: 'Sunny',
      location: 'New York'
    };

    return of(mockData).pipe(delay(1000)); // Simulate network delay
  }
}
