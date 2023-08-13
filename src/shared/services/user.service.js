export  const createUser = async (phone)=>{
    const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/user/signup`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        phone : phone  
      }),
    })
    const all = await res.json();
    return all;
}
