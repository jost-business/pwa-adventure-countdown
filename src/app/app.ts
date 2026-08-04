import { Component, OnInit, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';

const TARGET = new Date(2026, 7, 16, 16, 5); // August 16, 2026 · 16:05

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit, OnDestroy {
  private timer?: ReturnType<typeof setInterval>;
  readonly now = signal(new Date());

  readonly countdown = computed(() => {
    const diff = TARGET.getTime() - this.now().getTime();
    if (diff <= 0) return null;
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const nights  = Math.floor((TARGET.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24));
    return { days, hours, minutes, seconds, nights };
  });

  readonly isToday = computed(() => this.countdown() === null);

  ngOnInit(): void {
    this.timer = setInterval(() => this.now.set(new Date()), 1000);
    this.initNotifications();
    this.pingNtfy();
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private pingNtfy(): void {
    fetch('https://ntfy.sh/jost_business_casablanca_countdown', {
      method: 'POST',
      body: '💕 She opened the countdown app!',
      headers: { 'Title': 'Casablanca Countdown', 'Priority': 'default' }
    }).catch(() => { /* silent fail if offline */ });
  }

  private async initNotifications(): Promise<void> {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (this.isToday() && Notification.permission === 'granted') {
      new Notification('✈️ Today is the day!', {
        body: 'Casablanca is waiting for you both! 💕',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png',
      });
    }
  }
}
