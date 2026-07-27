"use server"
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST( request:Request ){
    const body = await request.json()
    const email = body.email
    const parentName = body.parentName
    
    try {
        const { data : sendData, error: sendError } = await resend.emails.send({
        from: 'Acme <onboarding@toptierscholarsystems.com>',
        to: `${email}`,
        subject: `Hello ${parentName}`,
        react: '<p>Success!</p>',
        });

        const { data: statusData, error: statusError } = await resend.emails.get(
            sendData?.id ?? ""
        );

        console.log(statusData)
        
        if ( sendError ) {
            console.error( sendError )
            return Response.json({ sendError }, { status: 500 });
        }

        return Response.json( {sendData, email} );

    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}