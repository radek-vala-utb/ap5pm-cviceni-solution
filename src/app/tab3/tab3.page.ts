import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { PublicHoliday } from '../models/public-holiday';
import { daysUntil, localDateIso } from '../models/holiday-date';
import { HolidayApiService } from '../services/holiday-api.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab3Page {
  private readonly holidayApi = inject(HolidayApiService);

  readonly holidays = signal<PublicHoliday[]>([]);
  readonly selectedId = signal('');
  readonly today = signal(localDateIso());
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly selectedHoliday = computed(() =>
    this.holidays().find((holiday) => holiday.id === this.selectedId()),
  );

  readonly remainingDays = computed(() => {
    const holiday = this.selectedHoliday();
    return holiday ? daysUntil(holiday.startDate, this.today()) : null;
  });

  async ionViewWillEnter(): Promise<void> {
    console.log('Tab3Page: ionViewWillEnter');
    await this.loadHolidays();
  }

  holidayName(holiday: PublicHoliday): string {
    return holiday.name.find((name) => name.language === 'CS')?.text ??
      holiday.name[0]?.text ?? 'Svátek bez názvu';
  }

  async loadHolidays(): Promise<void> {
    if (this.loading()) {
      return;
    }

    const previousId = this.selectedId();
    const today = localDateIso();
    const nextYear = Number(today.slice(0, 4)) + 1;
    this.today.set(today);
    this.loading.set(true);
    this.errorMessage.set('');
    this.holidays.set([]);
    this.selectedId.set('');

    try {
      const holidays = await this.holidayApi.getHolidays(today, `${nextYear}-12-31`);
      const upcoming = holidays.filter((holiday) => holiday.startDate >= today);
      this.holidays.set(upcoming);
      this.selectedId.set(
        upcoming.find((holiday) => holiday.id === previousId)?.id ?? upcoming[0]?.id ?? '',
      );
    } catch (error) {
      console.error('Svátky se nepodařilo načíst.', error);

      if (error instanceof TimeoutError) {
        this.errorMessage.set('Server neodpověděl včas. Zkuste načtení znovu.');
      } else if (error instanceof HttpErrorResponse && error.status === 0) {
        this.errorMessage.set('API není dostupné. Zkontrolujte připojení a zkuste to znovu.');
      } else {
        this.errorMessage.set('Svátky se nepodařilo načíst. Zkuste to znovu později.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}