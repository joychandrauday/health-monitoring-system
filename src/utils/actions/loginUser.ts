"use server"

import { UserData } from "@/app/(withNavLayout)/register/page";

export const loginUser = async (data: Partial<UserData>) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API}/api/v1/login`, {
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