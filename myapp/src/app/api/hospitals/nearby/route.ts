import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const condition = searchParams.get('condition') || 'general';

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Use Gemini to help identify what type of hospitals are needed for this condition
    // Skip Gemini if it's likely to fail - use simple mapping instead
    let hospitalTypes = ['hospital', 'medical center'];
    
    // Simple condition-to-hospital-type mapping for faster, more reliable results
    const conditionMapping: { [key: string]: string[] } = {
      'cardiac': ['hospital', 'cardiac center', 'heart hospital'],
      'emergency': ['emergency', 'hospital', 'trauma center'],
      'mental': ['psychiatric', 'mental health', 'hospital'],
      'pediatric': ['pediatric', 'children hospital'],
      'general': ['hospital', 'medical center', 'clinic']
    };
    
    // Check if we have a direct mapping
    const conditionLower = condition.toLowerCase();
    for (const [key, types] of Object.entries(conditionMapping)) {
      if (conditionLower.includes(key)) {
        hospitalTypes = types;
        break;
      }
    }
    
    // Search for hospitals using OpenStreetMap with timeout
    const searchQuery = `hospital ${hospitalTypes[0] || ''} near ${lat},${lng}`;
    
    // Create an abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    let osmResponse;
    try {
      osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Swasthya-HealthApp/1.0'
          },
          signal: controller.signal
        }
      );
      clearTimeout(timeoutId);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.log('Hospital search timeout, trying simpler query');
      } else {
        console.log('Hospital search error:', fetchError.message);
      }
      osmResponse = null;
    }
    
    let hospitals: any[] = [];
    
    if (osmResponse && osmResponse.ok) {
      const osmData = await osmResponse.json();
      if (osmData && osmData.length > 0) {
        // Helper function to calculate distance
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
          const R = 6371; // Earth's radius in km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          return R * c;
        };

        hospitals = osmData.map((place: any) => {
          const distance = calculateDistance(lat, lng, parseFloat(place.lat), parseFloat(place.lon));
          
          return {
            name: place.display_name?.split(',')[0] || 'Hospital',
            type: place.address?.hospital || place.address?.amenity || 'Medical Facility',
            distance: `${distance.toFixed(1)} km`,
            phone: place.address?.phone || 'Contact hospital directly',
            address: place.display_name,
            lat: parseFloat(place.lat),
            lng: parseFloat(place.lon)
          };
        });
      }
    }

    // If no results, try a simpler search with timeout
    if (hospitals.length === 0) {
      const simpleSearchQuery = `hospital near ${lat},${lng}`;
      const fallbackController = new AbortController();
      const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 5000);
      
      let fallbackResponse;
      try {
        fallbackResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(simpleSearchQuery)}&format=json&limit=5&addressdetails=1`,
          {
            headers: {
              'User-Agent': 'Swasthya-HealthApp/1.0'
            },
            signal: fallbackController.signal
          }
        );
        clearTimeout(fallbackTimeoutId);
      } catch (fetchError: any) {
        clearTimeout(fallbackTimeoutId);
        console.log('Fallback hospital search error:', fetchError.message);
        fallbackResponse = null;
      }
      
      if (fallbackResponse && fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
            const R = 6371;
            const dLat = (lat2 - lat1) * Math.PI / 180;
            const dLon = (lon2 - lon1) * Math.PI / 180;
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c;
          };

          hospitals = fallbackData.map((place: any) => {
            const distance = calculateDistance(lat, lng, parseFloat(place.lat), parseFloat(place.lon));
            
            return {
              name: place.display_name?.split(',')[0] || 'Hospital',
              type: place.address?.hospital || 'Medical Facility',
              distance: `${distance.toFixed(1)} km`,
              phone: place.address?.phone || 'Contact hospital directly',
              address: place.display_name,
              lat: parseFloat(place.lat),
              lng: parseFloat(place.lon)
            };
          });
        }
      }
    }

    // Sort hospitals by distance (they should already be sorted, but ensure it)
    hospitals.sort((a, b) => {
      const distA = parseFloat(a.distance.replace(' km', ''));
      const distB = parseFloat(b.distance.replace(' km', ''));
      return distA - distB;
    });

    return NextResponse.json({
      success: true,
      hospitals: hospitals.slice(0, 5), // Limit to top 5 closest
      condition,
      location: { lat, lng },
      count: hospitals.length
    });

  } catch (error: any) {
    console.error('Error fetching nearby hospitals:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch nearby hospitals',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

