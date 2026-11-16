import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  en: {
    // Brand & General
    brand_subtitle: 'Hyperlocal Street Discovery',
    neighborhood_tag: 'Your neighborhood street marketplace',
    home: 'Home',
    explore: 'Explore Stalls',
    explore_nav: 'Explore',
    categories: 'Categories',
    browse_by_category: 'Browse by Category',
    all_categories: 'All Categories',
    near_me: 'Near Me',
    hubs: 'Khau Gali',
    account: 'Account',
    my_stall: 'My Stall',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    register_stall: 'Register Your Stall',
    vendor_dashboard: 'Vendor Dashboard',
    admin_portal: 'Admin Portal',
    sign_out: 'Sign Out',
    profile: 'Profile',

    // Hero Section
    hero_title_1: 'Find Local Stalls',
    hero_title_2: 'Near You.',
    hero_subtitle: 'Discover roadside sellers, seasonal fruit carts, traditional crafts, and neighborhood street vendors with verified locations and walking directions.',
    hero_search_placeholder: 'Search products, stalls, or local areas...',
    search: 'Search',
    find_stalls_near_me: 'Find Stalls Near Me',
    browse_all_listings: 'Browse all listings',
    gujarat_hubs: 'Gujarat Hubs:',
    featured_stalls: 'Featured Street Stalls',
    featured_stalls_sub: 'Popular street food carts and local stalls open today in your city.',
    browse_categories: 'Browse Categories',
    browse_categories_sub: 'Discover roadside artisans, food stalls, chai vendors, and daily essentials.',
    view_all_stalls: 'View All Stalls',

    // Trust Pillars
    zero_commission_title: '0% Commission • Counter Rates',
    zero_commission_desc: 'Direct in-person pricing with no food delivery platform surcharges or hidden commissions.',
    physical_discovery_title: 'Exact Spot Navigation',
    physical_discovery_desc: 'Turn-by-turn walking directions straight to the pushcart, roadside stall, or market hub.',
    authentic_vendors_title: 'Verified Street Hawkers',
    authentic_vendors_desc: 'Real neighborhood stalls with phone verification, live hours, and counter menus.',

    // Explore Page
    explore_stalls_title: 'Explore Local Stalls',
    explore_stalls_subtitle: 'Check physical stall areas, live opening hours, menu prices, and get direct turn-by-turn walking directions.',
    search_placeholder: 'Search product, stall name, item (pani puri, locho...)',
    locality_placeholder: 'Locality / Landmark (e.g. Law Garden)...',
    search_btn: 'Search Stalls',
    filters_btn: 'Filters',
    major_cities: 'Major Cities:',
    all_gujarat: 'All Gujarat',
    open_now: 'Open Right Now',
    stalls_near_me: 'Stalls Near Me',
    detecting_spot: 'Detecting your spot...',
    location_detected: 'Your Location Detected',
    within_radius: 'Within:',
    jain_options: '🌿 Jain Options',
    amul_butter_chip: '🧈 Amul Butter',
    stool_seating_chip: '🪑 Stool Seating',
    showing_stalls: 'Showing',
    stalls_count: 'stalls',
    show_pins: 'Show Pins',
    show_cards: 'Show Cards',
    split_view: 'Split',
    list_view: 'List',
    map_view: 'Map',
    no_stalls_found: 'No Matching Stalls Found',
    no_stalls_hint: 'Try expanding your distance, picking another area, or clearing filters.',
    clear_all_filters: 'Reset Filters',
    retry_search: 'Retry Search',

    // Mobile Filter Drawer
    filter_drawer_title: 'Filters & Dietary Preferences',
    filter_dietary_title: 'Dietary & Preparation Integrity',
    filter_jain_desc: 'No root vegetables, separate cookware',
    filter_butter_desc: 'Genuine dairy butter/ghee, no cheap palm oil',
    filter_distance_title: 'Distance Radius',
    filter_radius_walking: '1 km (Walking distance)',
    filter_radius_nearby: '2 km (Nearby)',
    filter_radius_area: '5 km (Neighborhood)',
    filter_radius_city: '10 km (Citywide)',
    filter_radius_wide: '25 km (Greater region)',
    apply_filters: 'Apply Filters',

    // Vendor Card & Stall Details
    open_at_spot: 'Open at spot',
    closed: 'Closed',
    away: 'Away',
    sold_out_badge: 'Sold Out Today',
    spot_confirmed: 'Spot Confirmed Today',
    jain_badge: 'Jain Available',
    amul_butter_badge: 'Amul Butter',
    stool_seating_badge: 'Stool Seating',
    mobile_thela: 'Mobile Thela',
    fixed_spot: 'Fixed Spot',
    upi_cash: 'UPI & Cash',
    street_parking: 'Street Parking',
    navigate: 'Navigate',
    stall_details: 'Stall Details',
    walking_directions: 'Get Walking Directions',
    direct_counter_menu: 'Direct Counter Menu',
    items: 'items',
    starting_from: 'From',
    view_full_menu: 'View Full Menu',

    // Public Profile Page
    visiting_guide: 'Visiting Guide & Practical Stall Information',
    sold_out_banner: 'Stall is Sold Out for Today',
    sold_out_banner_sub: 'The vendor has exhausted today’s fresh batch. Please check back tomorrow during regular operating hours.',
    counter_menu_heading: 'Counter Menu & Direct Item Pricing',
    zero_delivery_fee: 'Pay directly at counter • 0% delivery markup • No middleman',
    check_whatsapp: 'Check If Open (WhatsApp)',
  },

  gu: {
    // Brand & General
    brand_subtitle: 'સ્થાનિક લારી-ગલ્લા શોધ',
    neighborhood_tag: 'તમારા વિસ્તારનું સ્થાનિક બજાર',
    home: 'હોમ',
    explore: 'લારીઓ શોધો',
    explore_nav: 'શોધો',
    categories: 'કેટેગરી',
    browse_by_category: 'કેટેગરી મુજબ જુઓ',
    all_categories: 'બધી કેટેગરી',
    near_me: 'નજીકમાં',
    hubs: 'ખાઉ ગલી',
    account: 'ખાતું',
    my_stall: 'મારી લારી',
    sign_in: 'સાઇન ઇન',
    sign_up: 'રજીસ્ટર',
    register_stall: 'લારી રજીસ્ટર કરો',
    vendor_dashboard: 'વેન્ડર ડેશબોર્ડ',
    admin_portal: 'એડમિન પોર્ટલ',
    sign_out: 'સાઇન આઉટ',
    profile: 'પ્રોફાઇલ',

    // Hero Section
    hero_title_1: 'સ્થાનિક લારી-ગલ્લા શોધો',
    hero_title_2: 'તમારી નજીકમાં.',
    hero_subtitle: 'રોડસાઇડ લારીઓ, મોસમી ફળો, પરંપરાગત વાનગીઓ અને સ્થાનિક વેપારીઓ ચોક્કસ નકશા અને ચાલવાની દિશા સાથે શોધો.',
    hero_search_placeholder: 'વાનગી, લારીનું નામ અથવા વિસ્તાર શોધો...',
    search: 'શોધો',
    find_stalls_near_me: 'મારી નજીકની લારીઓ શોધો',
    browse_all_listings: 'બધી લારીઓ જુઓ',
    gujarat_hubs: 'ગુજરાતના મુખ્ય બજારો:',
    featured_stalls: 'પ્રખ્યાત સ્થાનિક લારીઓ',
    featured_stalls_sub: 'તમારા શહેરમાં આજે હાજર લોકપ્રિય ખાણીપીણીની લારીઓ અને દુકાનો.',
    browse_categories: 'કેટેગરી મુજબ શોધો',
    browse_categories_sub: 'સ્થાનિક કારીગરો, ખાણીપીણી, કટીંગ ચા અને દૈનિક જરૂરિયાતો શોધો.',
    view_all_stalls: 'બધી લારીઓ જુઓ',

    // Trust Pillars
    zero_commission_title: '૦% કમિશન • કાઉન્ટર ભાવ',
    zero_commission_desc: 'કોઈ ઓનલાઇન ડિલિવરી ચાર્જ કે છૂપા કમિશન વગર સીધા લારીના અસલ ભાવે મેળવો.',
    physical_discovery_title: 'ચોક્કસ જગ્યાનું નેવિગેશન',
    physical_discovery_desc: 'લારી, હાથગાડી કે ખાઉ ગલી સુધી પહોંચવાનો સ્ટેપ-બાય-સ્ટેપ ચાલવાનો નકશો.',
    authentic_vendors_title: 'વેરીફાઈડ સ્થાનિક ફેરીયાઓ',
    authentic_vendors_desc: 'સાચા સ્થાનિક લારીવાળાઓ, સમય, ફોન વેરિફિકેશન અને કાઉન્ટર મેનુ સાથે.',

    // Explore Page
    explore_stalls_title: 'સ્થાનિક લારીઓ અને દુકાનો શોધો',
    explore_stalls_subtitle: 'લાઈવ લારીની જગ્યા, સમય, મેનુના ભાવ અને ચાલવાનો નકશો જુઓ.',
    search_placeholder: 'વાનગી, લારીનું નામ (પાણીપુરી, લોચો...) શોધો',
    locality_placeholder: 'વિસ્તાર / લેન્ડમાર્ક (દા.ત. લો ગાર્ડન)...',
    search_btn: 'લારીઓ શોધો',
    filters_btn: 'ફિલ્ટર્સ',
    major_cities: 'મુખ્ય શહેરો:',
    all_gujarat: 'સમગ્ર ગુજરાત',
    open_now: 'હમણાં ખુલ્લું',
    stalls_near_me: 'મારી નજીકની લારીઓ',
    detecting_spot: 'તમારું લોકેશન શોધી રહ્યા છીએ...',
    location_detected: 'તમારું લોકેશન મળ્યું',
    within_radius: 'અંતર:',
    jain_options: '🌿 જૈન વિકલ્પ',
    amul_butter_chip: '🧈 અમૂલ બટર / ઘી',
    stool_seating_chip: '🪑 બેસવાની જગ્યા',
    showing_stalls: 'દર્શાવે છે',
    stalls_count: 'લારીઓ',
    show_pins: 'નકશો જુઓ',
    show_cards: 'યાદી જુઓ',
    split_view: 'બંને',
    list_view: 'યાદી',
    map_view: 'નકશો',
    no_stalls_found: 'તમારી શોધ મુજબ કોઈ લારી મળી નથી.',
    no_stalls_hint: 'અંતર વધારો અથવા અન્ય વિસ્તાર પસંદ કરો.',
    clear_all_filters: 'બધા ફિલ્ટર્સ સાફ કરો',
    retry_search: 'ફરીથી શોધો',

    // Mobile Filter Drawer
    filter_drawer_title: 'ફિલ્ટર્સ અને પસંદગીઓ',
    filter_dietary_title: 'ખોરાકની શુદ્ધતા અને ગુણવત્તા',
    filter_jain_desc: 'કંદમૂળ વગર, અલગ વાસણમાં તૈયારી',
    filter_butter_desc: 'અમૂલ ડેરી બટર/ઘી, પામ તેલ વગર',
    filter_distance_title: 'અંતર મર્યાદા',
    filter_radius_walking: '૧ કિમી (ચાલવાના અંતરે)',
    filter_radius_nearby: '૨ કિમી (નજીકમાં)',
    filter_radius_area: '૫ કિમી (આસપાસનો વિસ્તાર)',
    filter_radius_city: '૧૦ કિમી (સમગ્ર શહેર)',
    filter_radius_wide: '૨૫ કિમી (વિસ્તૃત પ્રદેશ)',
    apply_filters: 'ફિલ્ટર્સ લાગુ કરો',

    // Vendor Card & Stall Details
    open_at_spot: 'હાજર • ખુલ્લું છે',
    closed: 'બંધ છે',
    away: 'થોડીવારમાં આવશે',
    sold_out_badge: 'આજે પૂરું થઈ ગયું',
    spot_confirmed: 'આજની જગ્યા કન્ફર્મ',
    jain_badge: 'જૈન ઉપલબ્ધ',
    amul_butter_badge: 'અમૂલ બટર',
    stool_seating_badge: 'બેસવાની વ્યવસ્થા',
    mobile_thela: 'મોબાઈલ લારી',
    fixed_spot: 'કાયમી જગ્યા',
    upi_cash: 'UPI અને રોકડ',
    street_parking: 'પાર્કિંગ સુવિધા',
    navigate: 'રસ્તો જુઓ',
    stall_details: 'વિગતો જુઓ',
    walking_directions: 'ચાલવાનો રસ્તો',
    direct_counter_menu: 'કાઉન્ટર મેનુ',
    items: 'વાનગીઓ',
    starting_from: 'ભાવ',
    view_full_menu: 'આખું મેનુ જુઓ',

    // Public Profile Page
    visiting_guide: 'મુલાકાત માર્ગદર્શિકા અને લારીની માહિતી',
    sold_out_banner: 'આજે માલ ખલાસ થઈ ગયો છે',
    sold_out_banner_sub: 'આ લારી પર આજનો સ્ટોક પૂરો થયો છે. આવતીકાલે નિયમિત સમયે પધારો.',
    counter_menu_heading: 'કાઉન્ટર મેનુ અને અસલ ભાવ',
    zero_delivery_fee: 'સીધા કાઉન્ટર પર આપો • 0% ડિલિવરી ચાર્જ • કોઈ વચેટિયો નહીં',
    check_whatsapp: 'વોટ્સએપ પર પૂછો',
  },

  hi: {
    // Brand & General
    brand_subtitle: 'हाइपरलोकल स्ट्रीट डिस्कवरी',
    neighborhood_tag: 'आपके आस-पास का स्ट्रीट बाजार',
    home: 'होम',
    explore: 'ठेले खोजें',
    explore_nav: 'खोजें',
    categories: 'कैटेगरी',
    browse_by_category: 'कैटेगरी अनुसार देखें',
    all_categories: 'सभी कैटेगरी',
    near_me: 'पास में',
    hubs: 'खाऊ गली',
    account: 'अकाउंट',
    my_stall: 'मेरा ठेला',
    sign_in: 'लॉग इन',
    sign_up: 'साइन अप',
    register_stall: 'ठेला रजिस्टर करें',
    vendor_dashboard: 'विक्रेता डैशबोर्ड',
    admin_portal: 'एडमिन पोर्टल',
    sign_out: 'लॉग आउट',
    profile: 'प्रोफाइल',

    // Hero Section
    hero_title_1: 'लोकल ठेले और दुकानें खोजें',
    hero_title_2: 'आपके पास।',
    hero_subtitle: 'सड़क किनारे के ठेले, मौसमी फल, पारंपरिक खानपान और पड़ोस के वेंडर्स को सटीक लोकेशन और पैदल रास्ते के साथ खोजें।',
    hero_search_placeholder: 'डिश, ठेले का नाम या इलाका खोजें...',
    search: 'खोजें',
    find_stalls_near_me: 'पास के ठेले खोजें',
    browse_all_listings: 'सभी ठेले देखें',
    gujarat_hubs: 'गुजरात के प्रमुख बाजार:',
    featured_stalls: 'प्रसिद्ध स्ट्रीट ठेले',
    featured_stalls_sub: 'आपके शहर में आज मौजूद लोकप्रिय खाने-पीने के ठेले और दुकानें।',
    browse_categories: 'कैटेगरी के अनुसार खोजें',
    browse_categories_sub: 'लोकल कारीगर, खानपान के ठेले, कटिंग चाय और रोजमर्रा की जरूरतें।',
    view_all_stalls: 'सभी ठेले देखें',

    // Trust Pillars
    zero_commission_title: '0% कमीशन • सीधा काउंटर रेट',
    zero_commission_desc: 'बिना किसी डिलीवरी चार्ज या छुपे कमीशन के सीधे ठेले के असली रेट पर खाएं।',
    physical_discovery_title: 'सटीक लोकेशन और रास्ता',
    physical_discovery_desc: 'ठेले, हाथगाड़ी या खाऊ गली तक पहुंचने के लिए पैदल चलने का सटीक लाइव रास्ता।',
    authentic_vendors_title: 'वेरिफाइड लोकल वेंडर्स',
    authentic_vendors_desc: 'सच्चे स्थानीय ठेलेवाले, फोन वेरिफिकेशन, लाइव टाइमिंग और काउंटर मेनू के साथ।',

    // Explore Page
    explore_stalls_title: 'लोकल ठेले और दुकानें खोजें',
    explore_stalls_subtitle: 'ठेले की लाइव जगह, समय, काउंटर रेट और पैदल जाने का रास्ता देखें।',
    search_placeholder: 'डिश, ठेले का नाम (पानी पूरी, लोचा...) खोजें',
    locality_placeholder: 'इलाका / लैंडमार्क (उदा. लॉ गार्डन)...',
    search_btn: 'ठेले खोजें',
    filters_btn: 'फ़िल्टर',
    major_cities: 'प्रमुख शहर:',
    all_gujarat: 'पूरा गुजरात',
    open_now: 'अभी खुला है',
    stalls_near_me: 'पास के ठेले',
    detecting_spot: 'आपकी लोकेशन खोजी जा रही है...',
    location_detected: 'आपकी लोकेशन मिली',
    within_radius: 'दायरा:',
    jain_options: '🌿 जैन विकल्प',
    amul_butter_chip: '🧈 अमूल बटर / घी',
    stool_seating_chip: '🪑 बैठने की जगह',
    showing_stalls: 'दिखा रहे हैं',
    stalls_count: 'ठेले',
    show_pins: 'नक्शा देखें',
    show_cards: 'लिस्ट देखें',
    split_view: 'दोनों',
    list_view: 'लिस्ट',
    map_view: 'नक्शा',
    no_stalls_found: 'आपकी खोज के अनुसार कोई ठेला नहीं मिला।',
    no_stalls_hint: 'दूरी बढ़ाएं या किसी दूसरे इलाके का चयन करें।',
    clear_all_filters: 'सभी फ़िल्टर हटाएं',
    retry_search: 'फिर से खोजें',

    // Mobile Filter Drawer
    filter_drawer_title: 'फ़िल्टर और खानपान प्राथमिकताएं',
    filter_dietary_title: 'खानपान की शुद्धता और तैयारी',
    filter_jain_desc: 'कंदमूल रहित, अलग बर्तनों में तैयारी',
    filter_butter_desc: 'अमूल डेयरी बटर/घी, बिना पाम ऑयल',
    filter_distance_title: 'दूरी की सीमा',
    filter_radius_walking: '1 किमी (पैदल दूरी)',
    filter_radius_nearby: '2 किमी (पास में)',
    filter_radius_area: '5 किमी (आस-पास का इलाका)',
    filter_radius_city: '10 किमी (पूरे शहर में)',
    filter_radius_wide: '25 किमी (विस्तृत क्षेत्र)',
    apply_filters: 'फ़िल्टर लागू करें',

    // Vendor Card & Stall Details
    open_at_spot: 'मौजूद • खुला है',
    closed: 'बंद है',
    away: 'थोड़ी देर में आएंगे',
    sold_out_badge: 'आज खत्म हो गया',
    spot_confirmed: 'आज की जगह कन्फर्म',
    jain_badge: 'जैन विकल्प उपलब्ध',
    amul_butter_badge: 'अमूल बटर',
    stool_seating_badge: 'बैठने की व्यवस्था',
    mobile_thela: 'मोबाइल ठेला',
    fixed_spot: 'पक्की दुकान',
    upi_cash: 'UPI और नकद',
    street_parking: 'पार्किंग सुविधा',
    navigate: 'रास्ता देखें',
    stall_details: 'पूरी डिटेल',
    walking_directions: 'पैदल रास्ता',
    direct_counter_menu: 'काउंटर मेनू',
    items: 'आइटम',
    starting_from: 'शुरुआती रेट',
    view_full_menu: 'पूरा मेनू देखें',

    // Public Profile Page
    visiting_guide: 'विजिटिंग गाइड और ठेले की जानकारी',
    sold_out_banner: 'आज का स्टॉक खत्म हो चुका है',
    sold_out_banner_sub: 'इस ठेले पर आज का ताजा बैच समाप्त हो गया है। कृपया कल नियमित समय पर आएं।',
    counter_menu_heading: 'काउंटर मेनू और असली रेट',
    zero_delivery_fee: 'सीधे काउंटर पर भुगतान • 0% डिलीवरी चार्ज • कोई बिचौलिया नहीं',
    check_whatsapp: 'व्हाट्सएप पर पूछें',
  },
};

export const CATEGORY_TRANSLATIONS = {
  'street-food-chaat': { en: 'Street Food & Chaat', gu: 'સ્ટ્રીટ ફૂડ અને ચાટ', hi: 'स्ट्रीट फूड और चाट' },
  'fruits-vegetables': { en: 'Fruits & Vegetables', gu: 'શાકભાજી અને ફળો', hi: 'फल और सब्जियां' },
  'beverages-chai': { en: 'Beverages & Chai', gu: 'ચા અને પીણાં', hi: 'चाय और पेय पदार्थ' },
  'fast-food-meals': { en: 'Fast Food & Meals', gu: 'ફાસ્ટ ફૂડ અને ભોજન', hi: 'फास्ट फूड और भोजन' },
  'bakery-sweets': { en: 'Bakery & Sweets', gu: 'મીઠાઈ અને બેકરી', hi: 'मिठाई और बेकरी' },
  'flowers-puja': { en: 'Flowers & Puja Items', gu: 'ફૂલ અને પૂજા સામગ્રી', hi: 'फूल और पूजा सामग्री' },
  'tailoring-alterations': { en: 'Tailoring & Alterations', gu: 'દરજીકામ અને કપડાં', hi: 'सिलाई और कपड़े' },
  'repairs-services': { en: 'Repairs & Services', gu: 'રિપેરિંગ અને સેવાઓ', hi: 'मरम्मत और सेवाएं' },
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem('hezal_language') || 'en';
      }
    } catch (e) {
      // storage disabled
    }
    return 'en';
  });

  const changeLanguage = (newLang) => {
    if (['en', 'gu', 'hi'].includes(newLang)) {
      setLang(newLang);
      try {
        if (typeof window !== 'undefined') {
          if (window.localStorage) {
            window.localStorage.setItem('hezal_language', newLang);
          }
          if (document && document.documentElement) {
            document.documentElement.lang = newLang;
          }
          // Set Google Translate cookie so the whole page translates
          document.cookie = `googtrans=/en/${newLang}; path=/;`;
          document.cookie = `googtrans=/en/${newLang}; path=/; domain=${window.location.hostname};`;
          const combo = document.querySelector('.goog-te-combo');
          if (combo) {
            combo.value = newLang;
            combo.dispatchEvent(new Event('change'));
          }
        }
      } catch (e) {
        // ignore
      }
    }
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en?.[key] || key;
  };

  const tCategory = (slugOrName, defaultName) => {
    if (lang === 'en' && defaultName) return defaultName;
    const slug = String(slugOrName || '').toLowerCase().trim();
    if (CATEGORY_TRANSLATIONS[slug]?.[lang]) {
      return CATEGORY_TRANSLATIONS[slug][lang];
    }
    // Check by name substring
    for (const [key, map] of Object.entries(CATEGORY_TRANSLATIONS)) {
      if (slug.includes(key) || key.includes(slug)) {
        return map[lang] || defaultName || map.en;
      }
    }
    return defaultName || slugOrName;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, tCategory }}>
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
      tCategory: (s, defaultName) => defaultName || s,
    };
  }
  return context;
}

export default LanguageContext;
