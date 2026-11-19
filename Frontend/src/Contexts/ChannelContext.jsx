import { createContext } from "react";
import { Outlet } from "react-router";

export const ChannelContext = createContext()


export function ChannelContextProvider (){
    return (
        <ChannelContext.Provider>
            <Outlet/>
        </ChannelContext.Provider>
    )
}
