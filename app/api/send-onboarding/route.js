import nodemailer from "nodemailer";

export async function POST(request) {
  const { navn, virksomhed, telefon, mail, region } = await request.json();

  if (!navn || !virksomhed || !telefon || !mail) {
    return Response.json(
      { error: "Manglende påkrævede felter" },
      { status: 400 },
    );
  }

  const onboardingUrl =
    process.env.ONBOARDING_URL || "https://ditdomæne.dk/onboarding";

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  const mailToApplicant = {
    from: `".legal Partnerprogram" <${process.env.MAIL_USER}>`,
    to: mail,
    subject: "Velkommen til .legal — her er dit onboarding-link",
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #032478;">
        <h2 style="font-size: 24px; margin-bottom: 16px;">Hej ${navn} 👋</h2>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          Tak for din interesse i at blive .legal-partner. Vi har modtaget din ansøgning fra <strong>${virksomhed}</strong>.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          Klik på knappen herunder for at gå i gang med onboardingflowet og oprette din partnerprofil:
        </p>
        <a href="${onboardingUrl}"
          style="display: inline-block; background: #7284FA; color: #fff; padding: 14px 32px; border-radius: 100px; font-size: 16px; font-weight: 600; text-decoration: none;">
          Start onboarding →
        </a>
        <p style="font-size: 14px; color: #6a7282; margin-top: 32px; line-height: 1.6;">
          Det tager ca. 10 minutter at udfylde. Har du spørgsmål er du velkommen til at svare på denne mail.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;" />
        <p style="font-size: 13px; color: #a0aec0;">.legal Partnerprogram</p>
      </div>
    `,
  };

  const mailToInternal = {
    from: `".legal Partnerprogram" <${process.env.MAIL_USER}>`,
    to: process.env.MAIL_USER,
    subject: `Ny partneransøgning: ${virksomhed}`,
    html: `
      <div style="font-family: sans-serif; color: #032478;">
        <h2>Ny partneransøgning</h2>
        <table style="font-size: 15px; border-collapse: collapse;">
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Navn:</td><td>${navn}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Virksomhed:</td><td>${virksomhed}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Telefon:</td><td>${telefon}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Mail:</td><td>${mail}</td></tr>
          <tr><td style="padding: 6px 16px 6px 0; font-weight: bold;">Region:</td><td>${region || "—"}</td></tr>
        </table>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailToApplicant);
    await transporter.sendMail(mailToInternal);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Mail fejl:", error);
    return Response.json({ error: "Mail kunne ikke sendes" }, { status: 500 });
  }
}
