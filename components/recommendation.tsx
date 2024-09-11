"use client"; // Mark this component as a client-side component
import { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import Link from "next/link";
import { db } from "@/app/firebase";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

export default function Recommendation() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) {
    // Check if all inputs are valid numbers
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      console.error("Invalid coordinates provided to calculateDistance:", {
        lat1,
        lon1,
        lat2,
        lon2,
      });
      return NaN;
    }

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLon / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const fetchItemsFromFirebase = async (userLocation: {
    lat: number;
    lng: number;
  }) => {
    try {
      const q = query(collection(db, "items"), where("available", "==", true));
      const querySnapshot = await getDocs(q);
      const fetchedItems: any[] = [];
      querySnapshot.forEach((doc) => {
        const itemData = doc.data();
        const { latitude, longitude } = itemData;
        console.log(
          `Item Coordinates: Latitude: ${latitude}, Longitude: ${longitude}`
        );

        console.log(itemData);

        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          latitude,
          longitude
        );
        console.log(`Distance to ${itemData.title}: ${distance} km`); // Debugging line

        if (distance >= 0 && distance <= 5) {
          fetchedItems.push({ id: doc.id, ...itemData, distance });
        }
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching items from Firebase:", error);
    }
  };

  const initializeMap = () => {
    if (mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newMap = new google.maps.Map(mapRef.current as HTMLElement, {
            center: { lat: latitude, lng: longitude },
            zoom: 14,
          });
          setMap(newMap);

          await fetchItemsFromFirebase({ lat: latitude, lng: longitude });
        },
        (error) => console.error("Error getting user location:", error)
      );
    }
  };

  const loadGoogleMapsScript = () => {
    if (typeof window.google === "undefined") {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  };

  useEffect(() => {
    loadGoogleMapsScript();
  }, []);

  useEffect(() => {
    if (map && items.length > 0) {
      items.forEach((item) => {
        if (
          typeof item.latitude === "number" &&
          typeof item.longitude === "number"
        ) {
          const marker = new google.maps.Marker({
            position: { lat: item.latitude, lng: item.longitude },
            map: map,
            title: item.title,
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${item.title}</strong><br>Condition: ${
              item.condition
            }<br>${item.distance.toFixed(1)} km away</div>`,
          });

          marker.addListener("click", () => {
            infoWindow.open(map, marker);
          });
        } else {
          console.error("Invalid latitude or longitude for item:", item);
        }
      });
    }
  }, [map, items]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-6xl mx-auto p-4 md:p-8">
      <div className="lg:col-span-3">
        <div className="w-full h-[50vh] md:h-[50vh] lg:h-[600px]">
          <div className="w-full h-full" ref={mapRef} />
        </div>
      </div>

      <div className="w-80 bg-background p-6 overflow-auto">
        <h2 className="text-2xl font-bold mb-4">Nearby Items</h2>
        <div className="grid gap-4">
          {items.length > 0 ? (
            items.map((item) => (
              <Link href={`/item/${item.id}`} key={item.id}>
                <Card className="cursor-pointer">
                  <CardContent className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      width={80}
                      height={80}
                      className="rounded-md"
                      style={{ aspectRatio: "80/80", objectFit: "cover" }}
                    />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-muted-foreground text-sm">
                        Condition: {item.condition}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {item.distance.toFixed(1)} km away
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p>No items found nearby.</p>
          )}
        </div>
      </div>
    </div>
  );
}
