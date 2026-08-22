"use client"

import { use } from "i18next";
import React, { useState, useEffect } from "react";

export default function TestGeolocation() {
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;

                    setUserLocation({ latitude, longitude });
                },

                (error) => {
                    console.error("Error get user location: ", error);
                }
            );
        } else {
            console.log("Geolocation is not supported by this browser");
        }
    };

    useEffect(() => {
        getUserLocation();
    }, []);

    return (
        <>
            <h1>Geolocation App</h1>
            {/* create a button that is mapped to the function which retrieves the users location */}
            <button onClick={getUserLocation}>Get User Location</button>
            {/* if the user location variable has a value, print the users location */}
            {userLocation && (
                <div>
                    <h2>User Location</h2>
                    <p>Latitude: {userLocation.latitude}</p>
                    <p>Longitude: {userLocation.longitude}</p>
                </div>
            )}
        </>
    );
}