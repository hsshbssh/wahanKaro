import { io, Socket }from "socket.io-client"

let socket:Socket | null=null

export const getSocketIo=()=>{
    if(!socket){
        socket=io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL)//connection establish krne ke liye we have to connect our client side to server side
    }

    return socket
}