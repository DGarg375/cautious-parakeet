import React,{useState,useRef,useMemo,useCallback,useEffect} from "react";
import PropTypes from "prop-types";
import Cluster from "./Map/Cluster";
import PinGroups from "./Map/PinGroups";

/*MAPBOX*/ 
import ReactMapGL, {
  Marker,
  NavigationControl,
  ScaleControl,
  Popup
} from "react-map-gl";
import MapGL from 'react-map-gl';

//import Geocoder from "react-map-gl-geocoder";
import Geocoder from 'react-mapbox-gl-geocoder'
import './Map/Map.css';

//import 'mapbox-gl/dist/mapbox-gl.css';
const navStyle = {
  top: "1rem",
  left: "1rem"
};

const scaleControlStyle = {
  bottom: "3rem",
  left: "1rem"
};

const MAP_STYLE={
    water: '#DBE2E6',
    parks: '#E6EAE9',
    buildings: '#c0c0c8',
    roads: '#ffffff',
    labels: '#78888a',
    background: '#EBF0F0'
}
const icon = `${process.env.PUBLIC_URL}/images/diya.gif`

/*MAPBOX*/


function Map(props) {

  let { markers,draggable, fullHeight , enableSearch, onPositionUpdate,center, onInfoUpdate, ...rest } = props;
  const [position, setPosition] = useState(center);
  const [clusterClicked, setClusterClicked] = useState(false);
  const [lastMapClick, setLastMapClick] = useState(undefined);
  const [map, setMap] = useState(undefined);
  const [popupInfo, setPopupInfo] = useState(null);
  const [info, setInfo] = useState("");

  const site = window.location.href;
  const MAPBOX_API = `${process.env.REACT_APP_MAPBOX_API}`;
  
  const [viewport, setViewport] = useState({
    latitude: center.lat,
    longitude: center.lng,
    zoom: 3
  });

  const handleViewportChange = useCallback(
    (newViewport) => {
      const {width, height, ...etc} = newViewport
      setViewport(etc)
    },
    []
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      });
    },
    []
  );

  const markerUpdate = (event)=>{
    setPosition({lat : event.lngLat[1],lng : event.lngLat[0]})
    onPositionUpdate({lat : event.lngLat[1],lng : event.lngLat[0]})
  }

  const onSearchResultSelected = (newViewport, item) => {
    if(newViewport.zoom<10)newViewport.zoom = 12;
    if(draggable){
      setPosition({lat : item.geometry.coordinates[1],lng : item.geometry.coordinates[0] }) // PREV : {lat : newViewport.latitude,lng : newViewport.longitude }
      onPositionUpdate({lat : item.geometry.coordinates[1],lng : item.geometry.coordinates[0] })

      newViewport.latitude = item.geometry.coordinates[1];
      newViewport.longitude = item.geometry.coordinates[0];
    }
    console.log(newViewport)
    setViewport(newViewport);
  };

  const onMapClick = (e)=>{
    setLastMapClick(e.lngLat)
  }

  const onClusterClick = (e)=>{
    setClusterClicked(true)
  }

  

  useEffect(() => {
    const { width, height, latitude, longitude, zoom } = viewport;
    
    if(clusterClicked && lastMapClick && lastMapClick.length>=2 && zoom<=16){
      setViewport({
        width: width,
        height: height,
        latitude: lastMapClick[1],
        longitude: lastMapClick[0],
        zoom: zoom+2
      });  
    }  

    setClusterClicked(false)
  }, [lastMapClick]);

  return (
  <ReactMapGL
      {...viewport}
      width='100%'
      height={fullHeight ? '93.3vh' : '45vh'}
      mapStyle = "mapbox://styles/mapbox/dark-v10"
      className="map"
      onClick={onMapClick}
      mapboxApiAccessToken={MAPBOX_API}
      onViewportChange={(viewport) => setViewport(viewport)}
      ref={ref => ref && setMap(ref.getMap())}
    >
      {map && !draggable && <Cluster
            map={map}
            radius={100}
            extent={512}
            nodeSize={64}
            element={clusterProps => (
              <PinGroups onViewportChange={(viewport) => setViewport(viewport)} {...clusterProps}  onClick={onClusterClick}/>
            )}
          >

      {markers.map((marker,index) => {
          if((marker.attributes && marker.attributes.lat) && (marker.attributes && marker.attributes.lng) || (marker.lat || marker.lng)){
            return (<div 
                      latitude={marker.attributes?marker.attributes.lat : marker.lat} 
                      longitude={marker.attributes?marker.attributes.lng: marker.lng}
                      onClick={e => {
                          // If we let the click event propagates to the map, it will immediately close the popup
                          // with `closeOnClick: true`
                          setPopupInfo(marker);
                      }}
                      
                      key={"MRK-DIV-"+index}>
                          <Marker 
                            key={"MRK-"+index} 
                            latitude={marker.attributes?marker.attributes.lat : marker.lat} 
                            longitude={marker.attributes?marker.attributes.lng:marker.lng}
                          >
                            <img src={icon} width="35" height="30"/> 
                        </Marker>
              </div>)
          }else{
            return <></>
          }
        }
        
      )}
      </Cluster> }

      {popupInfo && (
          <Popup
            anchor="bottom-right"
            offsetLeft = {18}
            longitude={popupInfo.attributes?popupInfo.attributes.lng:popupInfo.lng}
            latitude={popupInfo.attributes?popupInfo.attributes.lat : popupInfo.lat}
            onClose={() => setPopupInfo(null)}

          >  
              <b>{popupInfo.tooltip && popupInfo.tooltip !=''? popupInfo.tooltip : (popupInfo.attributes && popupInfo.attributes.order ? popupInfo.attributes.order.data.attributes.name : "NA")}</b>
              <br/>{popupInfo.attributes && popupInfo.attributes.order ? popupInfo.attributes.order.data.attributes.info : "NA"}
          </Popup>
      )}


      { map && enableSearch && <Geocoder
          mapRef={map}
          onSelected={onSearchResultSelected} 
          viewport={viewport}    
          value={""}
          mapboxApiAccessToken={MAPBOX_API}
          position="top-center"
        />
      }
     
      {
        draggable && <Marker
          latitude={Number(position.lat)}
          longitude={Number(position.lng)}
          anchor="center"
          draggable={draggable}
          onDragEnd={markerUpdate}
        >
          <img src={icon} width="30" height="45"/>
        </Marker>
      }

      {draggable && (
          <Popup
            anchor="bottom-right"
            offsetLeft = {18}
            closeButton = {false}
            longitude={Number(position.lng)}
            latitude={Number(position.lat)}
            onClose={() => setPopupInfo(null)}
          >  
            <div class="form-group">
                <textarea class="form-control" style={{border: "1px solid #e5dddd"}} maxlength="100" rows="4" value={info} onChange={(e)=>{setInfo(e.target.value);onInfoUpdate(e.target.value)}}></textarea>
            </div>
          </Popup>
      )}

    </ReactMapGL>
  );
}

Map.defaultProps = {markers: [],draggable : false,fullHeight : false, enableSearch:false,center : {lat: 51.505,  lng: -0.09}};

Map.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number,
    lang: PropTypes.number, //
    order : PropTypes.shape({
     data : PropTypes.shape({
       attributes : PropTypes.shape({
         name : PropTypes.string,
         info : PropTypes.string
       })
     })
    }),
    tooltip : PropTypes.string
  })),
  draggable : PropTypes.bool,
  fullHeight: PropTypes.bool,
  enableSearch: PropTypes.bool,
  onInfoUpdate : PropTypes.func,
  onPositionUpdate : PropTypes.func,
  center: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),

};

export default Map;
