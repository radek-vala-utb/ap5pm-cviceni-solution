import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { PublicHoliday } from '../models/public-holiday';
import { isCalendarDate } from '../models/holiday-date';

function isHolidayName(value: unknown): value is PublicHoliday['name'][number] {
  return typeof value === 'object' && value !== null &&
    'language' in value && typeof value.language === 'string' &&
    'text' in value && typeof value.text === 'string';
}

function isPublicHoliday(value: unknown): value is PublicHoliday {
  return typeof value === 'object' && value !== null &&
    'id' in value && typeof value.id === 'string' &&
    'startDate' in value && isCalendarDate(value.startDate) &&
    'endDate' in value && isCalendarDate(value.endDate) &&
    'name' in value && Array.isArray(value.name) &&
    value.name.length > 0 && value.name.every(isHolidayName);
}

@Injectable({
  providedIn: 'root',
})
export class HolidayApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://openholidaysapi.org/PublicHolidays';

  async getHolidays(validFrom: string, validTo: string): Promise<PublicHoliday[]> {
    const response = await firstValueFrom(
      this.http.get<unknown>(this.apiUrl, {
        params: {
          countryIsoCode: 'CZ',
          languageIsoCode: 'CS',
          validFrom,
          validTo,
        },
      }).pipe(timeout(10000)),
    );

    if (!Array.isArray(response) || !response.every(isPublicHoliday)) {
      throw new Error('API vrátilo svátky v neočekávaném formátu.');
    }

    return response.sort((a, b) => a.startDate.localeCompare(b.startDate));
  }
}