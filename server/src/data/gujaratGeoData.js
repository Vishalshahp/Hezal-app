/**
 * Comprehensive Geographic Dataset for Gujarat, India
 * Covers major municipal corporations, smart cities, towns, prominent neighborhood areas,
 * and iconic street markets / khau galli food streets.
 */

export const GUJARAT_CITIES = [
  { id: 'ahmedabad', name: 'Ahmedabad', gujarati: 'અમદાવાદ', coordinates: [72.5714, 23.0225], isMajor: true },
  { id: 'surat', name: 'Surat', gujarati: 'સુરત', coordinates: [72.8311, 21.1702], isMajor: true },
  { id: 'vadodara', name: 'Vadodara (Baroda)', gujarati: 'વડોદરા', coordinates: [73.1812, 22.3072], isMajor: true },
  { id: 'rajkot', name: 'Rajkot', gujarati: 'રાજકોટ', coordinates: [70.8022, 22.3039], isMajor: true },
  { id: 'gandhinagar', name: 'Gandhinagar', gujarati: 'ગાંધીનગર', coordinates: [72.6369, 23.2156], isMajor: true },
  { id: 'bhavnagar', name: 'Bhavnagar', gujarati: 'ભાવનગર', coordinates: [72.1501, 21.7645], isMajor: true },
  { id: 'jamnagar', name: 'Jamnagar', gujarati: 'જામનગર', coordinates: [70.0667, 22.4707], isMajor: true },
  { id: 'junagadh', name: 'Junagadh', gujarati: 'જૂનાગઢ', coordinates: [70.4579, 21.5222], isMajor: true },
  { id: 'anand', name: 'Anand', gujarati: 'આણંદ', coordinates: [72.9289, 22.5645], isMajor: false },
  { id: 'navsari', name: 'Navsari', gujarati: 'નવસારી', coordinates: [72.9282, 20.9500], isMajor: false },
  { id: 'bharuch', name: 'Bharuch', gujarati: 'ભરૂચ', coordinates: [72.9959, 21.7051], isMajor: false },
  { id: 'mehsana', name: 'Mehsana', gujarati: 'મહેસાણા', coordinates: [72.3999, 23.5880], isMajor: false },
  { id: 'bhuj', name: 'Bhuj (Kutch)', gujarati: 'ભુજ', coordinates: [69.6669, 23.2420], isMajor: false },
  { id: 'morbi', name: 'Morbi', gujarati: 'મોરબી', coordinates: [70.8384, 22.8173], isMajor: false },
  { id: 'porbandar', name: 'Porbandar', gujarati: 'પોરબંદર', coordinates: [69.6293, 21.6417], isMajor: false },
  { id: 'vapi', name: 'Vapi', gujarati: 'વાપી', coordinates: [72.9106, 20.3709], isMajor: false },
  { id: 'valsad', name: 'Valsad', gujarati: 'વલસાડ', coordinates: [72.9342, 20.6106], isMajor: false },
  { id: 'palanpur', name: 'Palanpur', gujarati: 'પાલનપુર', coordinates: [72.4385, 24.1724], isMajor: false },
  { id: 'patan', name: 'Patan', gujarati: 'પાટણ', coordinates: [72.1266, 23.8493], isMajor: false },
  { id: 'surendranagar', name: 'Surendranagar', gujarati: 'સુરેન્દ્રનગર', coordinates: [71.6370, 22.7277], isMajor: false },
  { id: 'nadiad', name: 'Nadiad', gujarati: 'નડિયાદ', coordinates: [72.8634, 22.6916], isMajor: false },
  { id: 'godhra', name: 'Godhra', gujarati: 'ગોધરા', coordinates: [73.6191, 22.7758], isMajor: false },
  { id: 'somnath', name: 'Veraval / Somnath', gujarati: 'વેરાવળ / સોમનાથ', coordinates: [70.3670, 20.9000], isMajor: false }
];

export const GUJARAT_AREAS_AND_LANDMARKS = [
  // ===================== AHMEDABAD =====================
  { name: 'Navrangpura', city: 'Ahmedabad', type: 'area', coordinates: [72.5567, 23.0373], pincode: '380009' },
  { name: 'Vastrapur', city: 'Ahmedabad', type: 'area', coordinates: [72.5255, 23.0366], pincode: '380015' },
  { name: 'Maninagar', city: 'Ahmedabad', type: 'area', coordinates: [72.6026, 22.9978], pincode: '380008' },
  { name: 'Satellite', city: 'Ahmedabad', type: 'area', coordinates: [72.5186, 23.0287], pincode: '380015' },
  { name: 'Bodakdev', city: 'Ahmedabad', type: 'area', coordinates: [72.5102, 23.0396], pincode: '380054' },
  { name: 'C.G. Road', city: 'Ahmedabad', type: 'area', coordinates: [72.5583, 23.0285], pincode: '380009' },
  { name: 'Prahlad Nagar', city: 'Ahmedabad', type: 'area', coordinates: [72.5085, 23.0125], pincode: '380015' },
  { name: 'Bopal', city: 'Ahmedabad', type: 'area', coordinates: [72.4632, 23.0343], pincode: '380058' },
  { name: 'South Bopal', city: 'Ahmedabad', type: 'area', coordinates: [72.4658, 23.0212], pincode: '380058' },
  { name: 'Ellisbridge', city: 'Ahmedabad', type: 'area', coordinates: [72.5701, 23.0216], pincode: '380006' },
  { name: 'Law Garden', city: 'Ahmedabad', type: 'area', coordinates: [72.5602, 23.0235], pincode: '380006' },
  { name: 'Paldi', city: 'Ahmedabad', type: 'area', coordinates: [72.5647, 23.0121], pincode: '380007' },
  { name: 'Ashram Road', city: 'Ahmedabad', type: 'area', coordinates: [72.5724, 23.0401], pincode: '380009' },
  { name: 'Gota', city: 'Ahmedabad', type: 'area', coordinates: [72.5367, 23.1042], pincode: '382481' },
  { name: 'Thaltej', city: 'Ahmedabad', type: 'area', coordinates: [72.5088, 23.0531], pincode: '380059' },
  { name: 'Nikol', city: 'Ahmedabad', type: 'area', coordinates: [72.6711, 23.0442], pincode: '382350' },
  { name: 'Chandkheda', city: 'Ahmedabad', type: 'area', coordinates: [72.5936, 23.1118], pincode: '382424' },
  { name: 'Sindhu Bhavan Road', city: 'Ahmedabad', type: 'area', coordinates: [72.4985, 23.0416], pincode: '380054' },
  { name: 'S.G. Highway', city: 'Ahmedabad', type: 'area', coordinates: [72.5134, 23.0492], pincode: '380054' },
  { name: 'Naranpura', city: 'Ahmedabad', type: 'area', coordinates: [72.5511, 23.0558], pincode: '380013' },
  { name: 'Ghatlodia', city: 'Ahmedabad', type: 'area', coordinates: [72.5401, 23.0678], pincode: '380061' },
  { name: 'Memnagar', city: 'Ahmedabad', type: 'area', coordinates: [72.5369, 23.0506], pincode: '380052' },
  { name: 'Sabarmati', city: 'Ahmedabad', type: 'area', coordinates: [72.5852, 23.0805], pincode: '380005' },
  { name: 'Shahibaug', city: 'Ahmedabad', type: 'area', coordinates: [72.5921, 23.0571], pincode: '380004' },
  { name: 'Naroda', city: 'Ahmedabad', type: 'area', coordinates: [72.6534, 23.0694], pincode: '382330' },
  { name: 'Khokhra', city: 'Ahmedabad', type: 'area', coordinates: [72.6189, 22.9961], pincode: '380008' },
  { name: 'Isanpur', city: 'Ahmedabad', type: 'area', coordinates: [72.5956, 22.9789], pincode: '382443' },
  { name: 'Odhav', city: 'Ahmedabad', type: 'area', coordinates: [72.6689, 23.0234], pincode: '382415' },
  { name: 'Gurukul', city: 'Ahmedabad', type: 'area', coordinates: [72.5298, 23.0487], pincode: '380052' },
  // Ahmedabad Landmarks & Street Food Streets
  { name: 'Manek Chowk Night Market', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5884, 23.0238], description: 'Iconic historic night food street famous for Gwalior Dosa, Pav Bhaji and Chocolate Sandwiches' },
  { name: 'Law Garden Khau Galli', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5598, 23.0232], description: 'Famous open-air evening street food strip and traditional handicraft market' },
  { name: 'Happy Street (Law Garden)', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5605, 23.0241], description: 'Modern pedestrian street food plaza' },
  { name: 'Vastrapur Lake Food Walk', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5262, 23.0359], description: 'Lakeside food court with chaat, momos, live ice cream rolls, and fresh juices' },
  { name: 'Urban Chowk (Rajpath Club)', city: 'Ahmedabad', type: 'landmark', coordinates: [72.4886, 23.0245], description: 'Vibrant open-air food park featuring modern local stalls' },
  { name: 'Ratna Pol & Old City Stalls', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5872, 23.0245], description: 'Heritage jewelry, silk, and spice stalls' },
  { name: 'Bhatiyar Gali', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5821, 23.0261], description: 'Centuries-old evening non-veg Mughlai street food market' },
  { name: 'CEPT University Food Lane', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5489, 23.0378], description: 'Student street hub famous for bun maska, chai, and Frankie stalls' },
  { name: 'Kankaria Lake Front', city: 'Ahmedabad', type: 'landmark', coordinates: [72.6012, 22.9989], description: 'Major tourist attraction with carnival snack stalls and kulfi carts' },
  { name: 'Teen Darwaza Market', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5845, 23.0251], description: 'Historic bazaar for footwear, clothes, household items, and street snacks' },
  { name: 'Dhalgarwad Cloth Market', city: 'Ahmedabad', type: 'landmark', coordinates: [72.5812, 23.0248], description: 'Traditional textile, bandhani, and saree street stalls' },

  // ===================== SURAT =====================
  { name: 'Adajan', city: 'Surat', type: 'area', coordinates: [72.7932, 21.1959], pincode: '395009' },
  { name: 'Vesu', city: 'Surat', type: 'area', coordinates: [72.7712, 21.1442], pincode: '395007' },
  { name: 'Varachha', city: 'Surat', type: 'area', coordinates: [72.8592, 21.2189], pincode: '395006' },
  { name: 'Athwa / Athwalines', city: 'Surat', type: 'area', coordinates: [72.8056, 21.1784], pincode: '395001' },
  { name: 'Piplod', city: 'Surat', type: 'area', coordinates: [72.7667, 21.1611], pincode: '395007' },
  { name: 'Katargam', city: 'Surat', type: 'area', coordinates: [72.8289, 21.2312], pincode: '395004' },
  { name: 'Rander', city: 'Surat', type: 'area', coordinates: [72.7956, 21.2156], pincode: '395005' },
  { name: 'Ghod Dod Road', city: 'Surat', type: 'area', coordinates: [72.8012, 21.1723], pincode: '395007' },
  { name: 'Citylight', city: 'Surat', type: 'area', coordinates: [72.7845, 21.1656], pincode: '395007' },
  { name: 'Pal', city: 'Surat', type: 'area', coordinates: [72.7756, 21.1989], pincode: '395009' },
  { name: 'Ring Road Textile Market', city: 'Surat', type: 'area', coordinates: [72.8423, 21.1912], pincode: '395002' },
  { name: 'Udhna', city: 'Surat', type: 'area', coordinates: [72.8456, 21.1456], pincode: '394210' },
  // Surat Landmarks & Food Streets
  { name: 'Piplod Street Food Street', city: 'Surat', type: 'landmark', coordinates: [72.7689, 21.1623], description: 'Premier street food hub for Surti Locho, Sev Khamani, and Cold Coco' },
  { name: 'Ghod Dod Road Khau Galli', city: 'Surat', type: 'landmark', coordinates: [72.8023, 21.1734], description: 'Popular shopping and street food avenue' },
  { name: 'Chauta Bazar', city: 'Surat', type: 'landmark', coordinates: [72.8223, 21.1989], description: 'Centuries-old market for cosmetics, street snacks, and clothes' },
  { name: 'Dumas Beach Bhajiya Lane', city: 'Surat', type: 'landmark', coordinates: [72.7102, 21.0998], description: 'Famous coastal roadside stalls serving hot Lashkari tomato and rathalu bhajiya' },
  { name: 'Zampa Bazar (Surti Mithai)', city: 'Surat', type: 'landmark', coordinates: [72.8312, 21.2012], description: 'Heritage bazaar known for authentic Surti Ghari and bakeries' },

  // ===================== VADODARA =====================
  { name: 'Alkapuri', city: 'Vadodara', type: 'area', coordinates: [73.1698, 22.3112], pincode: '390007' },
  { name: 'Sayajigunj', city: 'Vadodara', type: 'area', coordinates: [73.1823, 22.3101], pincode: '390005' },
  { name: 'Fatehgunj', city: 'Vadodara', type: 'area', coordinates: [73.1878, 22.3212], pincode: '390002' },
  { name: 'Manjalpur', city: 'Vadodara', type: 'area', coordinates: [73.1956, 22.2745], pincode: '390011' },
  { name: 'Akota', city: 'Vadodara', type: 'area', coordinates: [73.1678, 22.2989], pincode: '390020' },
  { name: 'Karelibaug', city: 'Vadodara', type: 'area', coordinates: [73.2012, 22.3245], pincode: '390018' },
  { name: 'Gotri', city: 'Vadodara', type: 'area', coordinates: [73.1412, 22.3156], pincode: '390021' },
  { name: 'Vasna Road', city: 'Vadodara', type: 'area', coordinates: [73.1512, 22.2889], pincode: '390007' },
  { name: 'Mandvi', city: 'Vadodara', type: 'area', coordinates: [73.2089, 22.3001], pincode: '390001' },
  { name: 'Nizampura', city: 'Vadodara', type: 'area', coordinates: [73.1789, 22.3356], pincode: '390002' },
  // Vadodara Landmarks & Food Streets
  { name: 'Ratri Bazar (Karelibaug)', city: 'Vadodara', type: 'landmark', coordinates: [73.1923, 22.3256], description: 'Vadodara official late-night food street with 40+ stalls under one roof' },
  { name: 'Sayajigunj Sev Usal Lane', city: 'Vadodara', type: 'landmark', coordinates: [73.1834, 22.3108], description: 'Legendary street for spicy Mahakali Sev Usal and Tari Poha' },
  { name: 'Mandvi & Mangal Bazar', city: 'Vadodara', type: 'landmark', coordinates: [73.2061, 22.3015], description: 'Historic core bazaar for traditional clothing, utensils, and street food' },
  { name: 'Khanderao Market', city: 'Vadodara', type: 'landmark', coordinates: [73.2012, 22.2978], description: 'Massive iconic fresh produce and flower market building' },
  { name: 'Sur Sagar Lake Plaza', city: 'Vadodara', type: 'landmark', coordinates: [73.2023, 22.3021], description: 'Surrounded by local kulfi, ice dish, and fafda jalebi vendors' },

  // ===================== RAJKOT =====================
  { name: 'Yagnik Road', city: 'Rajkot', type: 'area', coordinates: [70.7956, 22.2989], pincode: '360001' },
  { name: 'Kalawad Road', city: 'Rajkot', type: 'area', coordinates: [70.7712, 22.2856], pincode: '360005' },
  { name: '150 Feet Ring Road', city: 'Rajkot', type: 'area', coordinates: [70.7689, 22.2912], pincode: '360005' },
  { name: 'Kotecha Chowk', city: 'Rajkot', type: 'area', coordinates: [70.7812, 22.2923], pincode: '360001' },
  { name: 'Mavdi', city: 'Rajkot', type: 'area', coordinates: [70.7856, 22.2612], pincode: '360004' },
  { name: 'Dharmendra Road', city: 'Rajkot', type: 'area', coordinates: [70.8056, 22.3012], pincode: '360001' },
  { name: 'Race Course Ring Road', city: 'Rajkot', type: 'area', coordinates: [70.7912, 22.3056], pincode: '360001' },
  { name: 'University Road', city: 'Rajkot', type: 'area', coordinates: [70.7512, 22.2956], pincode: '360005' },
  // Rajkot Landmarks & Food
  { name: 'Race Course Food Court', city: 'Rajkot', type: 'landmark', coordinates: [70.7923, 22.3061], description: 'Epicenter of Kathiyawadi evening culture: gathiya, dabeli, and ice gola' },
  { name: 'Dharmendra Road Market', city: 'Rajkot', type: 'landmark', coordinates: [70.8061, 22.3018], description: 'Famous traditional market for Bandhani dresses, chaniya choli, and silver' },
  { name: 'Bangdi Bazaar', city: 'Rajkot', type: 'landmark', coordinates: [70.8045, 22.3025], description: 'Historic bangle, mehendi, and handicraft artisan street' },
  { name: 'Jubilee Garden Stalls', city: 'Rajkot', type: 'landmark', coordinates: [70.8021, 22.3015], description: 'Famous for Rajkot peda, chikki, and local refreshments' },

  // ===================== GANDHINAGAR =====================
  { name: 'Sector 21', city: 'Gandhinagar', type: 'area', coordinates: [72.6412, 23.2289], pincode: '382021' },
  { name: 'Sector 16', city: 'Gandhinagar', type: 'area', coordinates: [72.6345, 23.2212], pincode: '382016' },
  { name: 'Sector 7', city: 'Gandhinagar', type: 'area', coordinates: [72.6289, 23.2089], pincode: '382007' },
  { name: 'Sector 11', city: 'Gandhinagar', type: 'area', coordinates: [72.6312, 23.2156], pincode: '382011' },
  { name: 'Infocity', city: 'Gandhinagar', type: 'area', coordinates: [72.6289, 23.1912], pincode: '382009' },
  { name: 'Kudasan', city: 'Gandhinagar', type: 'area', coordinates: [72.6156, 23.1812], pincode: '382421' },
  { name: 'GIFT City', city: 'Gandhinagar', type: 'area', coordinates: [72.6856, 23.1612], pincode: '382355' },
  { name: 'Raysan', city: 'Gandhinagar', type: 'area', coordinates: [72.6289, 23.1689], pincode: '382426' },
  // Gandhinagar Landmarks & Food
  { name: 'Sector 21 Shopping Hub & Khau Galli', city: 'Gandhinagar', type: 'landmark', coordinates: [72.6418, 23.2295], description: 'Central evening street market for clothes, vegetables, and hot snacks' },
  { name: 'Infocity Food Alley', city: 'Gandhinagar', type: 'landmark', coordinates: [72.6292, 23.1918], description: 'Popular hub for IT workers and students with momos, dosas, and juices' },
  { name: 'Akshardham Stalls Area', city: 'Gandhinagar', type: 'landmark', coordinates: [72.6745, 23.2301], description: 'Souvenir, religious items, and traditional Gujarati fafda jalebi' },

  // ===================== BHAVNAGAR =====================
  { name: 'Waghawadi Road', city: 'Bhavnagar', type: 'area', coordinates: [72.1456, 21.7589], pincode: '364002' },
  { name: 'Ghogha Circle', city: 'Bhavnagar', type: 'area', coordinates: [72.1523, 21.7612], pincode: '364001' },
  { name: 'Crescent Circle Khau Gali', city: 'Bhavnagar', type: 'landmark', coordinates: [72.1489, 21.7656], description: 'Home to authentic Bhavnagari Gathiya and Bateta Bhungla' },

  // ===================== ANAND =====================
  { name: 'Vidyanagar Road', city: 'Anand', type: 'area', coordinates: [72.9245, 22.5512], pincode: '388120' },
  { name: 'Amul Dairy Road', city: 'Anand', type: 'area', coordinates: [72.9412, 22.5623], pincode: '388001' },
  { name: 'Nana Bazar', city: 'Anand', type: 'landmark', coordinates: [72.9312, 22.5612], description: 'Traditional market for fresh dairy, snacks, and street garments' }
];

/**
 * Match a user search query against Gujarat locations
 * Returns matching cities, areas, and landmarks
 */
export function searchGujaratLocations(query, limit = 8) {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();

  const results = [];

  // Match landmarks first (most specific)
  for (const item of GUJARAT_AREAS_AND_LANDMARKS) {
    if (
      item.name.toLowerCase().includes(q) ||
      item.city.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    ) {
      results.push({
        name: item.name,
        city: item.city,
        type: item.type,
        displayName: `${item.name}, ${item.city}`,
        coordinates: item.coordinates,
        pincode: item.pincode,
        description: item.description
      });
      if (results.length >= limit) return results;
    }
  }

  // Match cities
  for (const city of GUJARAT_CITIES) {
    if (city.name.toLowerCase().includes(q) || city.gujarati.includes(q)) {
      results.push({
        name: city.name,
        city: city.name,
        type: 'city',
        displayName: `${city.name}, Gujarat (${city.gujarati})`,
        coordinates: city.coordinates,
        isMajor: city.isMajor
      });
      if (results.length >= limit) return results;
    }
  }

  return results;
}

export default {
  GUJARAT_CITIES,
  GUJARAT_AREAS_AND_LANDMARKS,
  searchGujaratLocations
};
