import {auth} from '../functions/firebase';

export  const pay = async (payment_method_id,amount,name)=>{
    const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/payment/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',"Authorization" : `Bearer ${auth.currentUser.za}` },
        body: JSON.stringify({
          payment_method_id: payment_method_id,
          amount : amount,
          name: name
        }),
    })
    const all = await res.json();
    return all;
}

export  const confirmPay = async (payment_intent_id,amount,name,info,event,locations)=>{
    const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/payment/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',"Authorization" : `Bearer ${auth.currentUser.za}` },
        body: JSON.stringify({ payment_intent_id, amount , name, locations, info, event}),
    })
    const all = await res.json();
    return all;
}
