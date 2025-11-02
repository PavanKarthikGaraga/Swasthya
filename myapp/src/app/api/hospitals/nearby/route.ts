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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    let hospitalTypes = ['hospital', 'medical center'];
    
    if (GEMINI_API_KEY) {
      try {
        // Ask Gemini what type of hospital/specialty is needed for this condition
        const geminiQuery = `Based on the medical condition "${condition}", what type of hospital or medical specialty would be most appropriate? Respond with just a short list of 2-3 hospital types or specialties, separated by commas.`;
        
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: geminiQuery }]
              }]
            })
          }
        );

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const geminiText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          // Extract hospital types from Gemini response
          if (geminiText) {
            hospitalTypes = geminiText.split(',').map((t: string) => t.trim().toLowerCase()).filter((t: string) => t);
          }
        }
      } catch (err) {
        console.log('Gemini hospital search failed, using fallback:', err);
      }
    }
    
    // Search for hospitals using OpenStreetMap
    const searchQuery = `hospital ${hospitalTypes[0] || ''} near ${lat},${lng}`;
    
    const osmResponse = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Swasthya-HealthApp/1.0'
        }
      }
    );
    
    let hospitals: any[] = [];
    
    if (osmResponse.ok) {
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

    // If no results, try a simpler search
    if (hospitals.length === 0) {
      const simpleSearchQuery = `hospital near ${lat},${lng}`;
      const fallbackResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(simpleSearchQuery)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'Swasthya-HealthApp/1.0'
          }
        }
      );
      
      if (fallbackResponse.ok) {
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

    return NextResponse.json({
      success: true,
      hospitals,
      condition,
      location: { lat, lng }
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

