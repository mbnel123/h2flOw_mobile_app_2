# Push Notifications: Web & Native (FCM)

## Web (PWA)
- Notificaties werken via de Notification API en service workers.
- Testknop aanwezig in SettingsView.

## Native (iOS/Android)
- Voor push notificaties op echte apparaten gebruik je Firebase Cloud Messaging (FCM).
- Integratie kan via Capacitor (voor PWA naar native shell) of React Native Firebase.

### Stappen voor FCM integratie (Capacitor/React Native)
1. Registreer je app bij Firebase en download het configuratiebestand (`google-services.json` voor Android, `GoogleService-Info.plist` voor iOS).
2. Installeer de benodigde packages:
   - Capacitor: `@capacitor/push-notifications`
   - React Native: `@react-native-firebase/messaging`
3. Implementeer platformdetectie in `notificationService` en stuur notificaties via FCM als het een native app is.
4. Gebruik het bestaande notificatie-abstraction layer zodat je codebase platformonafhankelijk blijft.

### Voorbeeld native call (pseudo):
```typescript
if (window.Capacitor) {
  // Capacitor native push
  window.Capacitor.Plugins.PushNotifications.schedule({
    title: 'Test',
    body: 'Dit is een native push!',
  });
}
```

### Zie ook:
- https://capacitorjs.com/docs/apis/push-notifications
- https://rnfirebase.io/messaging/usage
