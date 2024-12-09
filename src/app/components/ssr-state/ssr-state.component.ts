import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, catchError, of, tap } from 'rxjs';
import { WeatherService, WeatherData } from '../../services/weather.service';
import { StateKey, makeStateKey } from '@angular/core';

// Define state transfer keys
const WEATHER_KEY = makeStateKey<WeatherData>('weatherData');
const USER_PREFS_KEY = makeStateKey<UserPreferences>('userPrefs');

interface UserPreferences {
  theme: 'light' | 'dark';
  lastUpdated: string;
}

@Component({
  selector: 'app-ssr-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ssr-state-demo">
      <h1>SSR State Management Demo</h1>

      <!-- Weather Data with Transfer State -->
      <section class="weather-section">
        <h2>Weather Information</h2>
        @if (weatherData$ | async; as weather) {
          <div class="weather-card">
            <h3>{{ weather.location }}</h3>
            <p>Temperature: {{ weather.temperature }}°C</p>
            <p>Condition: {{ weather.condition }}</p>
          </div>
        } @else {
          <p>Loading weather data...</p>
        }
      </section>

      <!-- Browser State Sync -->
      <section class="preferences-section">
        <h2>User Preferences</h2>
        <div class="preferences-card">
          <h3>Theme: {{ userPrefs.theme }}</h3>
          <button (click)="toggleTheme()">Toggle Theme</button>
          <p>Last Updated: {{ userPrefs.lastUpdated }}</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .ssr-state-demo {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .weather-card, .preferences-card {
      padding: 1rem;
      border-radius: 8px;
      background: #f8f9fa;
      margin: 1rem 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    button {
      padding: 0.5rem 1rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin: 0.5rem 0;

      &:hover {
        background: #0056b3;
      }
    }
  `]
})
export class SsrStateComponent {
  private weatherService = inject(WeatherService);
  private meta = inject(Meta);
  private title = inject(Title);

  weatherData$: Observable<WeatherData>;
  userPrefs: UserPreferences = {
    theme: 'light',
    lastUpdated: new Date().toISOString()
  };

  constructor() {
    this.setupSEO();
    this.weatherData$ = this.getWeatherData();
    this.initUserPrefs();
  }

  private setupSEO() {
    this.title.setTitle('SSR State Management Demo');
    this.meta.addTags([
      { name: 'description', content: 'Demo of Angular SSR state management features' },
      { name: 'keywords', content: 'Angular, SSR, State Management, SEO' },
      { property: 'og:title', content: 'SSR State Management Demo' },
      { property: 'og:description', content: 'Learn about Angular SSR state management' },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: 'SSR State Management Demo' },
      { name: 'robots', content: 'index, follow' }
    ]);
  }

  private getWeatherData(): Observable<WeatherData> {
    return this.weatherService.getMockWeather().pipe(
      tap(data => {
        sessionStorage.setItem(WEATHER_KEY, JSON.stringify(data));
      }),
      catchError(error => {
        console.error('Error fetching weather data:', error);
        return of({
          temperature: 0,
          condition: 'Error loading weather data',
          location: 'Unknown'
        });
      })
    );
  }

  private initUserPrefs() {
    const storedPrefs = sessionStorage.getItem(USER_PREFS_KEY);
    
    if (storedPrefs) {
      this.userPrefs = JSON.parse(storedPrefs);
    } else if (typeof window !== 'undefined') {
      const localPrefs = localStorage.getItem('userPrefs');
      if (localPrefs) {
        try {
          this.userPrefs = JSON.parse(localPrefs);
        } catch (error) {
          console.error('Error parsing user preferences:', error);
        }
      }
    }
  }

  toggleTheme() {
    this.userPrefs = {
      theme: this.userPrefs.theme === 'light' ? 'dark' : 'light',
      lastUpdated: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('userPrefs', JSON.stringify(this.userPrefs));
        sessionStorage.setItem(USER_PREFS_KEY, JSON.stringify(this.userPrefs));
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
    }
  }
}
