export  const fetchMapData = async (eventId)=>{
    const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/address/allMarkers?eventId=${eventId}`, {
      method: 'GET'
    })
    const all = await res.json();
    return all;
}
