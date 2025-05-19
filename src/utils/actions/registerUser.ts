"use server"

import { UserData } from "@/app/(withNavLayout)/register/page";


export const registerUser = async (data: UserData) => {

    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/users/register`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        cache: "no-store"
    })
    const userInfo = await res.json()

    return userInfo;
}