'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useToast } from '@/components/ui/use-toast';
import { Order, DeliveryAssignment } from '@/lib/types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface DeliveryMapProps {
  activeDeliveries: DeliveryAssignment[];
  availableOrders: Order[];
}

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export function DeliveryMap({ activeDeliveries, availableOrders }: DeliveryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const { toast } = useToast();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.9629, 20.5937], // India center
      zoom: 4,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      toast({
        title: 'Error',
        description: 'Geolocation is not supported by your browser',
        variant: 'destructive',
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([longitude, latitude]);

        // Update delivery partner location on backend
        updateDeliveryPartnerLocation(longitude, latitude);
      },
      (error) => {
        toast({
          title: 'Error',
          description: 'Failed to get your location',
          variant: 'destructive',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Update markers on map
  useEffect(() => {
    if (!map.current || !userLocation) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    // Add user marker
    const userMarker = new mapboxgl.Marker({ color: '#8A2BE2' })
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup().setHTML('Your location'))
      .addTo(map.current);
    markersRef.current['user'] = userMarker;

    // Add active delivery markers
    activeDeliveries.forEach((delivery) => {
      if (!delivery.location) return;

      const marker = new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat(delivery.location)
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <p class="font-medium">Order #${delivery.orderId}</p>
              <p class="text-sm text-gray-500">${delivery.status}</p>
            </div>
          `)
        )
        .addTo(map.current!);
      markersRef.current[delivery.orderId] = marker;
    });

    // Add available order markers
    availableOrders.forEach((order) => {
      if (!order.location) return;

      const marker = new mapboxgl.Marker({ color: '#dc2626' })
        .setLngLat(order.location)
        .setPopup(
          new mapboxgl.Popup().setHTML(`
            <div class="p-2">
              <p class="font-medium">Order #${order.id}</p>
              <p class="text-sm text-gray-500">Available for pickup</p>
            </div>
          `)
        )
        .addTo(map.current!);
      markersRef.current[order.id] = marker;
    });

    // Fit bounds to include all markers
    const bounds = new mapboxgl.LngLatBounds();
    Object.values(markersRef.current).forEach((marker) => {
      bounds.extend(marker.getLngLat());
    });
    map.current.fitBounds(bounds, { padding: 50 });
  }, [activeDeliveries, availableOrders, userLocation]);

  async function updateDeliveryPartnerLocation(longitude: number, latitude: number) {
    try {
      // TODO: Implement API call to update location
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  }

  if (!userLocation) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-[500px] w-full rounded-lg border">
      <div ref={mapContainer} className="h-full w-full" />
    </div>
  );
} 