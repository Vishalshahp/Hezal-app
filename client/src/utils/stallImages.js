import { getImageUrl } from './imageUrl';

/**
 * Curated, Authentic, High-Resolution Real Images for Hezal Market Stalls & Products across Gujarat.
 * Every stall has its own distinct, non-repeated real photograph representing authentic local
 * street food, clay pottery, fresh produce, traditional garments, flowers, and artisan crafts.
 */

export const STALL_IMAGES = {
  // 1. Ahmedabad - Law Garden Chaat & Pani Puri
  'ramesh': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80',
  'pani puri': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=900&q=80',

  // 2. Ahmedabad - Manek Chowk Midnight Dosa & Sandwich
  'manek chowk': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80',

  // 3. Ahmedabad - Law Garden Traditional Chaniya Choli & Handcrafts
  'law garden': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80',

  // 4. Ahmedabad - Vastrapur Lake Terracotta & Clay Pottery
  'geeta': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=900&q=80',

  // 5. Ahmedabad - Navrangpura Seasonal Organic Fruits
  'kishanlal': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=900&q=80',

  // 6. Ahmedabad - CG Road Tender Coconut Water Cart
  'green oasis': 'https://images.unsplash.com/photo-1544681280-d25a782adc9b?auto=format&fit=crop&w=900&q=80',

  // 7. Ahmedabad - Nehru Bridge Duplicate Key & Locksmith
  'master duplicate': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80',
  'locksmith': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80',

  // 8. Ahmedabad - Ashram Road Shree Ram Florist & Pooja Items
  'shree ram florist': 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=900&q=80',

  // 9. Ahmedabad - Relief Road Old City Tailoring & Alteration
  'old city tailoring': 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80',

  // 10. Ahmedabad - Sindhu Bhavan Road Chai Adda & Bun Maska
  'sindhu bhavan': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=900&q=80',

  // 11. Surat - Piplod Jani Surti Butter Locho & Khaman
  'jani': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
  'locho': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',

  // 12. Surat - Dumas Beach Roasted Sweet Corn & Bhutta
  'dumas beach': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80',
  'bhutta': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=900&q=80',

  // 13. Surat - Chauta Bazar Traditional Bandhani & Dupattas
  'chauta bazar': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=900&q=80',

  // 14. Surat - Rander Street Dum Biryani & Seekh Kebabs
  'rander': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=900&q=80',

  // 15. Surat - Adajan Royal Surti Ghari & Farsan
  'adajan': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=900&q=80',
  'ghari': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=900&q=80',

  // 16. Surat - Varachha Diamond Circle Fresh Fruit Juices & Shakes
  'varachha': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=900&q=80',

  // 17. Surat - Gopipura Handcrafted Mojdis & Ethnic Jootis
  'gopipura': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',
  'mojdi': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80',

  // 18. Surat - Ring Road Wholesale Household Goods & Utensils
  'ring road': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=900&q=80',

  // 19. Vadodara - Sayajigunj Mahakali Special Sev Usal
  'mahakali': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=900&q=80',
  'sev usal': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=900&q=80',

  // 20. Vadodara - Mandvi Gate Chaniya Choli & Traditional Attire
  'mandvi gate': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=900&q=80',

  // 21. Vadodara - Fatehgunj University Masala Chai & Bun Maska
  'fatehgunj': 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&w=900&q=80',

  // 22. Vadodara - Alkapuri Seasonal Fresh Juice & Fruit Bowls
  'alkapuri': 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=900&q=80',

  // 23. Vadodara - Raopura Pyarelal Farsan & Dry Fruit Bhakharwadi
  'raopura': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80',
  'bhakharwadi': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=900&q=80',

  // 24. Vadodara - Karelibaug Pottery & Terracotta Plant Pots
  'karelibaug': 'https://images.unsplash.com/photo-1598188306155-25e400eb5078?auto=format&fit=crop&w=900&q=80',

  // 25. Rajkot - Yagnik Road Saurashtra Vanela Gathiya & Hot Jalebi
  'saurashtra': 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80',
  'jalebi': 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=900&q=80',

  // 26. Rajkot - Dharmendra Road Kutchi Embroidery & Traditional Bags
  'dharmendra road': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',

  // 27. Rajkot - Trikon Baug Famous Ice Dish Gola & Kulfi
  'trikon baug': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=900&q=80',
  'gola': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=900&q=80',

  // 28. Rajkot - Kalawad Road Royal Dabeli & Jumbo Vada Pav
  'kalawad road': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',
  'dabeli': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80',

  // 29. Rajkot - Gundawadi Fresh Vegetable & Organic Spinach Greens
  'gundawadi': 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=900&q=80',

  // 30. Gandhinagar - Sector 21 Capital Desi Dal Baati & Khichdi
  'capital desi': 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=900&q=80',
  'dal baati': 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=900&q=80',

  // 31. Gandhinagar - Sector 7 Mysore Masala Dosa Corner
  'sector 7': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=900&q=80',

  // 32. Gandhinagar - Infocity Late Night Chai, Maggi & Coffee Point
  'infocity': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=900&q=80',
  'maggi': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=900&q=80',

  // 33. Bhavnagar - Crescent Circle Famous Gathiya & Kadhi
  'bhavnagar crescent': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80',
  'gathiya': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80',

  // 34. Bhavnagar - Ghogha Circle Fresh Sugarcane & Cold Soda
  'ghogha circle': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=900&q=80',
  'sugarcane': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=900&q=80',

  // 35. Jamnagar - Bedi Gate Authentic Dry Fruit Kachori
  'bedi gate': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80',
  'kachori': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80',

  // 36. Jamnagar - Chandi Bazar Traditional Brass & Metal Artifacts
  'chandi bazar': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80',
  'brass': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=80',

  // 37. Junagadh - Girnar Foothills Pure Herbal Honey & Forest Ayurveda
  'girnar': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=80',
  'honey': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=900&q=80',

  // 38. Anand - Amul Dairy Road Special Mawa Kulfi & Rabdi
  'amul dairy road': 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=900&q=80',
  'kulfi': 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=900&q=80',

  // 39. Bhuj - Shroff Bazar Kutchi Dabeli & Mud Art Work
  'shroff bazar': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80',
  'mud art': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80'
};

// Unique Product Image Mapping
export const PRODUCT_IMAGES = {
  'mineral water pani puri': 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80',
  'sev puri': 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=600&q=80',
  'dahi puri': 'https://images.unsplash.com/photo-1606471191009-63994c53433b?auto=format&fit=crop&w=600&q=80',
  'gwalior butter dosa': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
  'sandwich': 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?auto=format&fit=crop&w=600&q=80',
  'navratri': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
  'matka': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
  'kulhad': 'https://images.unsplash.com/photo-1598188306155-25e400eb5078?auto=format&fit=crop&w=600&q=80',
  'orange': 'https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&w=600&q=80',
  'apple': 'https://images.unsplash.com/photo-1587393855524-087f83d95bc9?auto=format&fit=crop&w=600&q=80',
  'pomegranate': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
  'coconut': 'https://images.unsplash.com/photo-1544681280-d25a782adc9b?auto=format&fit=crop&w=600&q=80',
  'key': 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80',
  'lock': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
  'marigold': 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=600&q=80',
  'rose': 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=600&q=80',
  'alteration': 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=600&q=80',
  'chai': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
  'bun maska': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'locho': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
  'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  'bhutta': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
  'bandhani': 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80',
  'biryani': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
  'kebab': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
  'ghari': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
  'shake': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
  'mojdi': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
  'steel': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80',
  'sev usal': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&w=600&q=80',
  'kurti': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
  'fruit bowl': 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=600&q=80',
  'bhakharwadi': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?auto=format&fit=crop&w=600&q=80',
  'clay tawa': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
  'gathiya': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
  'jalebi': 'https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=600&q=80',
  'kutchi bag': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  'ice dish': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
  'dabeli': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
  'spinach': 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=600&q=80',
  'dal baati': 'https://images.unsplash.com/photo-1567337710282-00832b415979?auto=format&fit=crop&w=600&q=80',
  'mysore dosa': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
  'maggi': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
  'sugarcane': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=600&q=80',
  'kachori': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
  'brass': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
  'honey': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80',
  'kulfi': 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80'
};

// 8 Distinct Category Fallback Images
export const CATEGORY_FALLBACK_IMAGES = {
  'street-food': 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80',
  'fresh-produce': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=900&q=80',
  'beverages-juices': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=900&q=80',
  'flowers-plants': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
  'handcrafts': 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
  'clothing': 'https://images.unsplash.com/photo-1516762689617-e1cffcef479d?auto=format&fit=crop&w=900&q=80',
  'household-essentials': 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=900&q=80',
  'repair-services': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=900&q=80'
};

/**
 * Returns a high-res cover image for a product.
 */
export function getProductCoverImage(prod) {
  if (prod?.image && typeof prod.image === 'string' && prod.image.trim() !== '') {
    return getImageUrl(prod.image);
  }
  const name = (prod?.name || '').toLowerCase();
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (name.includes(key)) return url;
  }
  return null;
}

/**
 * Returns a high-res cover image for a vendor stall.
 */
export function getStallCoverImage(vendor) {
  if (vendor?.coverPhoto && typeof vendor.coverPhoto === 'string' && vendor.coverPhoto.trim() !== '') {
    return getImageUrl(vendor.coverPhoto);
  }

  const name = (vendor?.stallName || '').toLowerCase();
  for (const [keyword, url] of Object.entries(STALL_IMAGES)) {
    if (name.includes(keyword)) {
      return url;
    }
  }

  if (vendor?.categories && vendor.categories.length > 0) {
    const firstCat = vendor.categories[0];
    const slug = typeof firstCat === 'object' ? firstCat.slug : firstCat;
    if (slug && CATEGORY_FALLBACK_IMAGES[slug]) {
      return CATEGORY_FALLBACK_IMAGES[slug];
    }
  }

  // Fallback to verified street food image
  return 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=900&q=80';
}
