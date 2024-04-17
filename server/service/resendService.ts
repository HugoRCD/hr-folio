import { Resend } from 'resend'

const resend = new Resend(process.env.NUXT_PRIVATE_RESEND_API_KEY)

// find your audience id here: https://resend.com/audiences
const nuxtLogAudienceId = '555dc1c1-1008-4182-be98-605be9d1ebf6'

type sendMailDto = {
  email: string;
  message: string;
  name: string;
}

export async function sendSubscribeEmail(email: string) {
  try {
    await resend.emails.send({
      from: 'HugoRCD <contact@hrcd.fr>',
      to: [email],
      subject: 'Welcome to HugoRCD newsletter!',
      html: `
            <h1>Welcome to HugoRCD newsletter!</h1>
            <p>
                You've just subscribed to HugoRCD newsletter with this email: <strong>${email}</strong>.
            </p>
            <p>
                You can unsubscribe at any time by clicking on the link below the future emails you'll receive.
            </p>
            <p>
                See you soon!
            </p>
      `,
    })
  } catch (error) {
    console.error(error)
  }
}

export async function sendContactEmail({ email, message, name }: sendMailDto) {
  try {
    await resend.emails.send({
      from: 'HugoRCD <contact@hrcd.fr>',
      to: ['hrichard206@gmail.com'],
      subject: 'New message from hrcd.fr',
      html: `
            <h3>New message from hrcd.fr</h3>
            <p>
                You've just received a new message from ${ name.length ? name : 'a visitor' } with this email: <strong>${ email }</strong>.
            </p>
            <p>
                <strong>Message:</strong>
                <p>${ message }</p>
            </p>
      `,
    })
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
}

export async function addContactToList(email: string) {
  return await resend.contacts.create({
    email,
    audienceId: nuxtLogAudienceId,
  })
}
