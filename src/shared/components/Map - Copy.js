import React,{useState,useRef,useMemo,useCallback,useEffect} from "react";
import PropTypes from "prop-types";

/*MAPBOX*/
import ReactMapGL, {
  Marker as Marker2,
  NavigationControl,
  ScaleControl
} from "react-map-gl";
/*MAPBOX*/


import { MapContainer, TileLayer, Marker, Popup,useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';

import "leaflet-geosearch/dist/geosearch.css";
import L from 'leaflet';
//import icon from 'leaflet/dist/images/marker-icon.png';
//import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { GeoSearchControl, OpenStreetMapProvider,GeocodeEarthProvider,MapBoxProvider  } from 'leaflet-geosearch'; 
import MarkerClusterGroup from 'react-leaflet-markercluster';

const icon = `${process.env.PUBLIC_URL}/images/diya.gif`; 
let DefaultIcon = L.icon({
    iconUrl: icon,
    iconSize:     [25, 30]
    //shadowUrl: iconShadow
});

const createClusterCustomIcon = function (cluster) {
  return L.divIcon({
    html: `<span>${cluster.getChildCount()}</span>`,
    className: 'marker-cluster-custom',
    iconSize: L.point(40, 40, true),
  });
};

L.Marker.prototype.options.icon = DefaultIcon;

function LeafletgeoSearch(props) {
  const map = useMap();
  let { onPositionUpdate,center,position,setPosition } = props;
  useEffect(() => {
    /*const provider = new OpenStreetMapProvider();*/
    const provider =  new MapBoxProvider({
      params: {
        access_token: "pk.eyJ1IjoiYW5pbDEyMyIsImEiOiJjbDNtbTBuZGcwMjBxM2RwbGQ5cjk4enZrIn0.V6IB8-ydmjltRdkI6SVL0A",
      },
    });

    /*new GeocodeEarthProvider({ params: {
      api_key: 'ge-d44f0d5fc73d1234',
    }});*/

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      searchLabel: 'Search location to add diya',
      showMarker: false
      /*marker: {
        icon : DefaultIcon,
        draggable: true
      }*/
    });

    map.addControl(searchControl);

    return () => map.removeControl(searchControl);
  }, []);

  map.on('geosearch/showlocation', (data)=>{
    if(data && data.location && data.location.x){
      let newLocation = {lat : data.location.y,lng : data.location.x};

      setPosition(newLocation)
      onPositionUpdate && onPositionUpdate(newLocation)
    }
  });

  return null;
}


function DraggableMarker(props) {
  let { onPositionUpdate,center,position,setPosition } = props;
  const [draggable, setDraggable] = useState(true)
  const markerRef = useRef(null)
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current
        if (marker != null) {
          setPosition(marker.getLatLng())
          onPositionUpdate && onPositionUpdate(marker.getLatLng())
        }
      }
    }),
    [],
  )
  const toggleDraggable = useCallback(() => {
    setDraggable((d) => !d)
  }, [])

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}>
      
    </Marker>
  )
}
/**
 * Losely based on: https://sharingbuttons.io/
 */
function Map(props) {
  let { markers,draggable, fullHeight , enableSearch, onPositionUpdate,center, ...rest } = props;
  const [position, setPosition] = useState(center)
  const site = window.location.href;

  return (<MapContainer center={[center.lat, center.lng]} zoom={3} scrollWheelZoom={true}  style={{ minHeight: fullHeight ? '100vh' : '50vh' }}>
            <TileLayer
              noWrap={false}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://api.mapbox.com/styles/v1/mapbox/dark-v10/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5pbDEyMyIsImEiOiJjbDNtbTBuZGcwMjBxM2RwbGQ5cjk4enZrIn0.V6IB8-ydmjltRdkI6SVL0A"
            />
            <MarkerClusterGroup showCoverageOnHover={false} iconCreateFunction={createClusterCustomIcon} chunkedLoading={true}>
              {
                markers.map((marker,index)=>{
                  return (<Marker key={"marker-"+index} position={[marker.attributes?marker.attributes.lat : marker.lat,marker.attributes?marker.attributes.lng:marker.lng]}>
                    <Popup>
                      {marker.tooltip ? marker.tooltip : (marker.attributes && marker.attributes.order ? marker.attributes.order.data.attributes.name : "NA")}                    
                    </Popup>
                  </Marker>)
                })   
              }
            </MarkerClusterGroup>
            
            {draggable ? <DraggableMarker position={position} setPosition={setPosition} onPositionUpdate={onPositionUpdate} center={center}/> : null}

            {enableSearch ? <LeafletgeoSearch position={position} setPosition={setPosition} onPositionUpdate={onPositionUpdate} center={center}/>  : null} 
          </MapContainer>);
}
Map.defaultProps = {markers: [],draggable : false,fullHeight : false, enableSearch:false,center : {lat: 51.505,  lng: -0.09}};

Map.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number,
    lang: PropTypes.number, //
    order : PropTypes.shape({
     data : PropTypes.shape({
       attributes : PropTypes.shape({
         name : PropTypes.string
       })
     })
    }),
    tooltip : PropTypes.string
  })),
  draggable : PropTypes.bool,
  fullHeight: PropTypes.bool,
  enableSearch: PropTypes.bool,
  onPositionUpdate : PropTypes.func,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),

};

export default Map;
