export { default } from "next-auth/middleware"

export const config = {
    matcher: [
        '/:role(patient|doctor|admin)/dashboard/:path*'
    ]
}