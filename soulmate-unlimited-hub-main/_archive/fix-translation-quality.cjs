const fs = require('fs');
const path = require('path');

// Tüm dil dosyalarını oku
const localesDir = './client/src/i18n/locales';
const allFiles = fs.readdirSync(localesDir)
  .filter(file => file.endsWith('.json') && !file.includes('.backup'))
  .sort();

console.log('🔍 Çeviri kalitesi kontrol ediliyor...\n');

// Yanlış çevirilerin düzeltme listesi
const correctTranslations = {
  // Almanca düzeltmeler
  de: {
    "ORCONTINUEWITHMAIL": "ODER MIT E-MAIL FORTFAHREN",
    "adjustFiltersOrTryAgain": "Passen Sie die Filter an oder versuchen Sie es später erneut",
    "activeSubscriptions": "Aktive Abonnements", 
    "addMorePhotos": "Weitere Fotos hinzufügen",
    "analyticsNotAvailable": "Analysen nicht verfügbar",
    "banError": "Fehler beim Sperren des Benutzers",
    "banReasonLabel": "Sperrgrund",
    "bestTimeToPost": "Beste Zeit zum Posten",
    "close": "Schließen",
    "deleteError": "Fehler beim Löschen",
    "dismissed": "Abgelehnt",
    "engageWithOthers": "Mit anderen interagieren",
    "failedToDismiss": "Ablehnung fehlgeschlagen",
    "failedToLikeBack": "Rückantwort fehlgeschlagen",
    "failedToLoadGuests": "Gäste konnten nicht geladen werden",
    "failedToLoadLikes": "Likes konnten nicht geladen werden",
    "failedToSendLike": "Like konnte nicht gesendet werden",
    "feature.basicMatching": "Basis-Matching",
    "features.seeWhoLikesYou": "Sehen wer dich mag",
    "friday": "Freitag",
    "fromSubscriptions": "Von Abonnements",
    "gender": "Geschlecht",
    "growthRate": "Wachstumsrate",
    "hide": "Verbergen",
    "improveProfile": "Profil verbessern",
    "improvementTips": "Verbesserungstipps",
    "increaseVisibility": "Sichtbarkeit erhöhen",
    "justNow": "Gerade eben",
    "likeBack": "Zurück liken",
    "likeRemoved": "Like entfernt",
    "likeSent": "Like gesendet",
    "monday": "Montag",
    "monthlyGrowth": "Monatliches Wachstum",
    "newLike": "Neuer Like",
    "newVisitor": "Neuer Besucher",
    "nextPage": "Nächste Seite",
    "noBio": "Keine Bio",
    "none": "Keine",
    "saturday": "Samstag",
    "seeWhoVisitedDescription": "Sehen wer Ihr Profil besucht hat",
    "someoneNewLikedYou": "Jemand Neues mag dich",
    "someoneViewedYourProfile": "Jemand hat dein Profil angesehen",
    "stayActiveOnPlatform": "Auf der Plattform aktiv bleiben",
    "sunday": "Sonntag",
    "thursday": "Donnerstag",
    "total": "Gesamt",
    "totalLikes": "Gesamte Likes",
    "totalViews": "Gesamte Ansichten",
    "trackYourProfilePerformance": "Verfolgen Sie die Leistung Ihres Profils",
    "tuesday": "Dienstag",
    "unbanError": "Fehler beim Aufheben der Sperre",
    "updateBioRegularly": "Bio regelmäßig aktualisieren",
    "upgradeToViewAnalytics": "Für Analysen auf Premium upgraden",
    "useBoostsStrategically": "Boosts strategisch nutzen",
    "userBannedMessage": "Benutzer gesperrt",
    "userDeletedMessage": "Benutzer gelöscht",
    "userUnbannedMessage": "Benutzersperre aufgehoben",
    "username": "Benutzername",
    "usersToPremium": "Benutzer zu Premium",
    "viewed": "Angesehen",
    "viewsPerDay": "Ansichten pro Tag",
    "viewsToday": "Heutige Ansichten",
    "visitedOn": "Besucht am",
    "visitor": "Besucher",
    "wednesday": "Mittwoch",
    "week": "Woche",
    "weeklyAverage": "Wöchentlicher Durchschnitt",
    "weeklyViews": "Wöchentliche Ansichten",
    "worldwide": "Weltweit",
    "youLikedBack": "Du hast zurück geliked",
    "youMatched": "Ihr habt gematcht",
    "yourLikeWasSent": "Dein Like wurde gesendet",
    "noPermissionToManageSubscriptions": "Keine Berechtigung zur Abonnementverwaltung",
    "durationDays": "Dauer (Tage)",
    "days7": "7 Tage",
    "days30": "30 Tage", 
    "days90": "90 Tage",
    "year1": "1 Jahr",
    "granting": "Gewähren...",
    "grantTierForDays": "{tier} für {duration} Tage gewähren",
    "noUserSelected": "Kein Benutzer ausgewählt",
    "pleaseSelectUserToGrant": "Bitte wählen Sie einen Benutzer aus der Liste aus, um ein Abonnement zu gewähren",
    "current": "Aktuell:",
    "grantSubscription": "Abonnement gewähren"
  },

  // Türkçe düzeltmeler
  tr: {
    "dailyLimitReached": "Günlük limit doldu",
    "upgradeLikesMessage": "Günlük beğeni limitiniz doldu. {tier} paketine geçin!",
    "upgradeSuperLikesMessage": "Günlük süper beğeni limitiniz doldu. {tier} paketine geçin!",
    "completeProfileToGetLikes": "Profilinizi tamamlayın ve fotoğraf ekleyin!",
    "seeAll": "Tümünü Gör",
    "verification": "Doğrulama"
  },

  // İngilizce düzeltmeler
  en: {
    "activeSubscriptions": "Active Subscriptions",
    "addMorePhotos": "Add More Photos", 
    "analyticsNotAvailable": "Analytics Not Available",
    "banError": "Error occurred while banning user",
    "banReasonLabel": "Ban Reason",
    "bestTimeToPost": "Best Time to Post",
    "close": "Close",
    "deleteError": "Delete Error",
    "dismissed": "Dismissed",
    "engageWithOthers": "Engage with Others",
    "failedToDismiss": "Failed to Dismiss",
    "failedToLikeBack": "Failed to Like Back",
    "failedToLoadGuests": "Failed to Load Guests",
    "failedToLoadLikes": "Failed to Load Likes",
    "failedToSendLike": "Failed to Send Like",
    "feature.basicMatching": "Basic Matching",
    "features.seeWhoLikesYou": "See Who Likes You",
    "friday": "Friday",
    "fromSubscriptions": "From Subscriptions",
    "gender": "Gender",
    "growthRate": "Growth Rate",
    "hide": "Hide",
    "improveProfile": "Improve Profile",
    "improvementTips": "Improvement Tips",
    "increaseVisibility": "Increase Visibility",
    "justNow": "Just now",
    "likeBack": "Like Back",
    "likeRemoved": "Like Removed",
    "likeSent": "Like Sent",
    "monday": "Monday",
    "monthlyGrowth": "Monthly Growth",
    "newLike": "New Like",
    "newVisitor": "New Visitor",
    "nextPage": "Next Page",
    "noBio": "No Bio",
    "none": "None",
    "saturday": "Saturday",
    "seeWhoVisitedDescription": "See who visited your profile",
    "someoneNewLikedYou": "Someone new liked you",
    "someoneViewedYourProfile": "Someone viewed your profile",
    "stayActiveOnPlatform": "Stay active on platform",
    "sunday": "Sunday",
    "thursday": "Thursday",
    "total": "Total",
    "totalLikes": "Total Likes",
    "totalViews": "Total Views",
    "trackYourProfilePerformance": "Track your profile performance",
    "tuesday": "Tuesday",
    "unbanError": "Error occurred while unbanning user",
    "updateBioRegularly": "Update bio regularly",
    "upgradeToViewAnalytics": "Upgrade to view analytics",
    "useBoostsStrategically": "Use boosts strategically",
    "userBannedMessage": "User has been banned",
    "userDeletedMessage": "User has been deleted",
    "userUnbannedMessage": "User ban has been removed",
    "username": "Username",
    "usersToPremium": "Users to Premium",
    "viewed": "Viewed",
    "viewsPerDay": "Views per Day",
    "viewsToday": "Views Today",
    "visitedOn": "Visited on",
    "visitor": "Visitor",
    "wednesday": "Wednesday",
    "week": "Week",
    "weeklyAverage": "Weekly Average",
    "weeklyViews": "Weekly Views",
    "worldwide": "Worldwide",
    "youLikedBack": "You liked back",
    "youMatched": "You matched",
    "yourLikeWasSent": "Your like was sent",
    "noPermissionToManageSubscriptions": "No permission to manage subscriptions",
    "durationDays": "Duration (Days)",
    "days7": "7 Days",
    "days30": "30 Days",
    "days90": "90 Days", 
    "year1": "1 Year",
    "granting": "Granting...",
    "grantTierForDays": "Grant {tier} for {duration} days",
    "noUserSelected": "No User Selected",
    "pleaseSelectUserToGrant": "Please select a user from the list to grant subscription",
    "current": "Current:",
    "grantSubscription": "Grant Subscription"
  }
};

// Her dil dosyasını kontrol et ve düzelt
allFiles.forEach(file => {
  const langCode = file.replace('.json', '');
  const filePath = path.join(localesDir, file);
  
  console.log(`📝 ${langCode.toUpperCase()} dosyası kontrol ediliyor...`);
  
  try {
    const translations = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let fixedCount = 0;
    
    // Bu dil için düzeltmeler varsa uygula
    if (correctTranslations[langCode]) {
      const fixes = correctTranslations[langCode];
      
      Object.keys(fixes).forEach(key => {
        if (translations[key] && translations[key] !== fixes[key]) {
          console.log(`  ✏️  "${key}": "${translations[key]}" → "${fixes[key]}"`);
          translations[key] = fixes[key];
          fixedCount++;
        }
      });
      
      // Dosyayı güncelle (alfabetik sıralama ile)
      if (fixedCount > 0) {
        const sorted = {};
        Object.keys(translations).sort().forEach(key => {
          sorted[key] = translations[key];
        });
        
        fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), 'utf8');
        console.log(`  ✅ ${fixedCount} çeviri düzeltildi\n`);
      } else {
        console.log(`  ✅ Bu dilde düzeltme gerekmedi\n`);
      }
    } else {
      console.log(`  ℹ️  Bu dil için düzeltme listesi yok\n`);
    }
    
  } catch (error) {
    console.log(`  ❌ Hata: ${error.message}\n`);
  }
});

console.log('🎉 Çeviri kalitesi düzeltme işlemi tamamlandı!');
