import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    brand_subtitle: 'Hyperlocal Street Discovery',
    home: 'Home',
    explore: 'Explore',
    near_me: 'Near Me',
    hubs: 'Food Hubs',
    account: 'Account',
    my_stall: 'My Stall',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    register_stall: 'Register Your Stall',
    explore_stalls_title: 'Explore Local Stalls',
    explore_stalls_subtitle: 'Check physical stall areas, live opening hours, menu prices, and get direct turn-by-turn walking directions.',
    search_placeholder: 'Search product, stall name, item (pani puri, locho...)',
    locality_placeholder: 'Locality / Landmark (e.g. Law Garden)...',
    search_btn: 'Search Stalls',
    filters_btn: 'Filters',
    open_now: 'Open Right Now',
    stalls_near_me: 'Stalls Near Me',
    jain_available: 'Jain Available',
    amul_butter: 'Amul Butter / Pure Ghee',
    seating_available: 'Seating Available',
    navigate: 'Navigate',
    stall_details: 'Stall Details',
    sold_out_today: 'Sold Out Today',
    spot_confirmed: 'Spot Confirmed Today',
    counter_menu_title: 'Counter Menu & Item Prices (Pay directly at stall • Zero delivery markup)',
    walking_directions: 'Get Walking Directions',
    check_whatsapp: 'Check If Open (WhatsApp)',
    view_list: 'Show List',
    view_map: 'Show Map',
    famous_hubs_title: 'Famous Food Streets & Market Hubs:',
  },
  gu: {
    brand_subtitle: 'સ્થાનિક લારી-ગલ્લા શોધ',
    home: 'હોમ',
    explore: 'શોધો',
    near_me: 'નજીકમાં',
    hubs: 'ખાઉ ગલી',
    account: 'ખાતું',
    my_stall: 'મારી લારી',
    sign_in: 'સાઇન ઇન',
    sign_up: 'રજીસ્ટર',
    register_stall: 'લારી રજીસ્ટર કરો',
    explore_stalls_title: 'સ્થાનિક લારીઓ અને દુકાનો શોધો',
    explore_stalls_subtitle: 'લાઈવ લારીની જગ્યા, સમય, મેનુના ભાવ અને ચાલવાનો નકશો જુઓ.',
    search_placeholder: 'વાનગી, લારીનું નામ (પાણીપુરી, લોચો...) શોધો',
    locality_placeholder: 'વિસ્તાર / લેન્ડમાર્ક (દા.ત. લો ગાર્ડન)...',
    search_btn: 'શોધો',
    filters_btn: 'ફિલ્ટર્સ',
    open_now: 'હમણાં ખુલ્લું',
    stalls_near_me: 'મારી નજીકની લારીઓ',
    jain_available: 'જૈન ઉપલબ્ધ',
    amul_butter: 'અમૂલ બટર / શુદ્ધ ઘી',
    seating_available: 'બેસવાની જગ્યા',
    navigate: 'દિશા જુઓ',
    stall_details: 'વિગતો જુઓ',
    sold_out_today: 'આજે પૂરું થઈ ગયું',
    spot_confirmed: 'હાજર લારી (કન્ફર્મ)',
    counter_menu_title: 'કાઉન્ટર મેનુ અને ભાવ (સીધા લારીવાળાને આપો • 0% કમિશન)',
    walking_directions: 'ચાલવાનો નકશો જુઓ',
    check_whatsapp: 'વોટ્સએપ પર પૂછો',
    view_list: 'યાદી જુઓ',
    view_map: 'નકશો જુઓ',
    famous_hubs_title: 'પ્રખ્યાત ખાઉ ગલીઓ અને બજારો:',
  },
  hi: {
    brand_subtitle: 'हाइपरलोकल स्ट्रीट डिस्कवरी',
    home: 'होम',
    explore: 'खोजें',
    near_me: 'पास में',
    hubs: 'खाऊ गली',
    account: 'अकाउंट',
    my_stall: 'मेरा ठेला',
    sign_in: 'लॉग इन',
    sign_up: 'साइन अप',
    register_stall: 'ठेला रजिस्टर करें',
    explore_stalls_title: 'लोकल ठेले और दुकानें खोजें',
    explore_stalls_subtitle: 'ठेले की लाइव जगह, समय, काउंटर रेट और पैदल जाने का रास्ता देखें।',
    search_placeholder: 'डिश, ठेले का नाम (पानी पूरी, लोचा...) खोजें',
    locality_placeholder: 'इलाका / लैंडमार्क (उदा. लॉ गार्डन)...',
    search_btn: 'खोजें',
    filters_btn: 'फ़िल्टर',
    open_now: 'अभी खुला है',
    stalls_near_me: 'पास के ठेले',
    jain_available: 'जैन विकल्प उपलब्ध',
    amul_butter: 'अमूल बटर / शुद्ध घी',
    seating_available: 'बैठने की व्यवस्था',
    navigate: 'रास्ता देखें',
    stall_details: 'पूरी डिटेल',
    sold_out_today: 'आज खत्म हो गया',
    spot_confirmed: 'आज ठेला मौजूद है',
    counter_menu_title: 'काउंटर मेनू और रेट (सीधे ठेले वाले को भुगतान • 0% डिलीवरी चार्ज)',
    walking_directions: 'पैदल रास्ता देखें',
    check_whatsapp: 'व्हाट्सएप पर पूछें',
    view_list: 'लिस्ट देखें',
    view_map: 'नक्शा देखें',
    famous_hubs_title: 'प्रसिद्ध खाऊ गलियां और बाजार:',
  },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('hezal_language') || 'en';
    }
    return 'en';
  });

  const changeLanguage = (newLang) => {
    if (['en', 'gu', 'hi'].includes(newLang)) {
      setLang(newLang);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('hezal_language', newLang);
      }
    }
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: 'en',
      changeLanguage: () => {},
      t: (key) => TRANSLATIONS.en[key] || key,
    };
  }
  return context;
}

export default LanguageContext;
