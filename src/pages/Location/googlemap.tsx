import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const MapComponent = () => {
    const [location, setLocation]: any = useState(null);

    setLocation({ lat: '30.706781271967635', lng: '76.68441217508138' });

    return (
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            {location ? (
                <GoogleMap center={location} zoom={15} mapContainerStyle={{ width: "100%", height: "400px" }}>
                    <Marker position={location} />
                </GoogleMap>
            ) : (
                <p>Loading map...</p>
            )}
        </LoadScript>
    );
};

export default MapComponent;
