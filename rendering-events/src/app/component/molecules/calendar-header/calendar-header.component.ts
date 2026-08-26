import { CommonModule } from "@angular/common";
import { Component, WritableSignal, signal, ChangeDetectionStrategy } from "@angular/core";
import { ButtonComponent } from "../../atoms/button/button.component";
import { IconComponent } from "../../atoms/icon/icon.component";

@Component({
    selector: 'app-calendar-header',
    imports: [CommonModule, ButtonComponent, IconComponent],
    templateUrl: './calendar-header.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./calendar-header.component.scss']
})
export class CalendarHeaderComponent{
    dateSelected: WritableSignal<Date> = signal(new Date());
    todayButton = "Aujourd'hui";
    iconLeft = "keyboard_arrow_left";
    iconRight = "keyboard_arrow_right";
    
  setToday = () => {
    this.dateSelected.set(new Date());
  }

  setNextDay = () => {
    const currentDate = this.dateSelected();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + 1);
    this.dateSelected.set(nextDate);
  }

  setPreviousDay = () => {
    const currentDate = this.dateSelected();
    const previousDate = new Date(currentDate);
    previousDate.setDate(currentDate.getDate() - 1);
    this.dateSelected.set(previousDate);
  }
    
}