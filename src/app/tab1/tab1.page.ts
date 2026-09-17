import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CounterComponent } from '../components/counter/counter.component';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CounterComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, FormsModule
],
})

export class Tab1Page {

  private readonly countryService = inject(CounterService);
  
  onSaved(counter: SavedCounter): void {  
    this.countryService.add(counter);
  }
}
