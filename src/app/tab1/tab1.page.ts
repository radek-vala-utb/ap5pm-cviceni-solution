import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonInput, IonButton, IonList, IonListHeader, IonLabel, IonItem, IonNote } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CounterComponent } from '../components/counter/counter.component';
import { SavedCounter } from '../models/saved-counter';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CounterComponent,
    IonHeader, IonToolbar, IonTitle, IonContent, FormsModule,
    IonList,
    IonListHeader,
    IonLabel,
    IonItem,
    IonNote
],
})

export class Tab1Page {
  savedCounters: SavedCounter[] = [];
  onSaved(counter: SavedCounter): void {  
    this.savedCounters.unshift(counter);
  }
}
