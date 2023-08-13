import {auth} from '../functions/firebase';

import { Subject } from 'rxjs'
import { filter } from 'rxjs/operators'

export const CURRENT_EVENT = "cur_ev";

const mainSubject = new Subject()

export  const eventList = async ()=>{
    const res = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/event/list`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json',"Authorization" : `Bearer ${auth.currentUser.za}` }
    })
    const all = await res.json();

    const currentEvent = localStorage.getItem(CURRENT_EVENT);
    
    if(!currentEvent && all && all.length>0){
        localStorage.setItem(CURRENT_EVENT,all[0].id)
        mainSubject.next({ topic : CURRENT_EVENT, data : all[0].id })
    }

    return all;
}
export const subscribeEventChange = ()=>{
    return mainSubject.pipe(filter(f => f.topic == CURRENT_EVENT));
}

export const setCurrentEvent = async (evId) => {
    localStorage.setItem(CURRENT_EVENT,evId)
    mainSubject.next({ topic : CURRENT_EVENT, data : evId })    
}

export const getCurrentEvent = async ()=>{
    const currentEvent = localStorage.getItem(CURRENT_EVENT);
    if(currentEvent){
        return currentEvent
    }else{
        await eventList();
        return localStorage.getItem(CURRENT_EVENT);
    }
}