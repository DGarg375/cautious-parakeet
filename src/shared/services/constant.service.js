export  const cookiePolicy = async (phone)=>{
    const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/constant/cookiePolicy`, {
      method: 'GET'
    })
    const all = await res.json();
    return all;
}


export  const privacyPolicy = async (phone)=>{
    const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/constant/privacyPolicy`, {
      method: 'GET'
    })
    const all = await res.json();
    return all;
}
