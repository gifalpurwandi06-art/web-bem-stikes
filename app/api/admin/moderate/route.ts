import { Resend } from "resend";
import { verifyAdminAuthorization } from "../../../../lib/supabase/server";

type ModerationRequest = {
  resource?: "works" | "aspirations";
  id?: string;
  status?: "approved" | "rejected";
  adminNote?: string;
};

export async function POST(request: Request) {
  const admin = await verifyAdminAuthorization(request.headers.get("authorization"));
  if (!admin) return Response.json({ error: "Akses admin diperlukan." }, { status: 401 });

  let body: ModerationRequest;
  try {
    body = await request.json() as ModerationRequest;
  } catch {
    return Response.json({ error: "Format permintaan tidak valid." }, { status: 400 });
  }

  if (!body.id || !body.status || !body.resource || !["works", "aspirations"].includes(body.resource)) {
    return Response.json({ error: "Data moderasi belum lengkap." }, { status: 400 });
  }

  const note = (body.adminNote || "").trim().slice(0, 2000);
  let recipient: { email: string; name: string; title: string } | null = null;
  let updateError: { message: string } | null = null;

  if (body.resource === "works") {
    const { data: work, error: readError } = await admin.serviceClient
      .from("works")
      .select("id, title, author_name, author_email")
      .eq("id", body.id)
      .maybeSingle();
    if (readError) return Response.json({ error: "Tidak dapat membaca pengajuan karya." }, { status: 500 });
    if (!work) return Response.json({ error: "Pengajuan karya tidak ditemukan." }, { status: 404 });

    recipient = { email: work.author_email, name: work.author_name, title: work.title };
    const result = await admin.serviceClient
      .from("works")
      .update({ status: body.status, admin_note: note || null, reviewed_at: new Date().toISOString() })
      .eq("id", body.id);
    updateError = result.error;
  } else {
    const result = await admin.serviceClient
      .from("aspirations")
      .update({ status: body.status, admin_note: note || null, reviewed_at: new Date().toISOString() })
      .eq("id", body.id);
    updateError = result.error;
  }

  if (updateError) return Response.json({ error: "Status tidak berhasil diperbarui." }, { status: 500 });
  if (!recipient) return Response.json({ statusUpdated: true, emailSent: false });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    return Response.json({
      statusUpdated: true,
      emailSent: false,
      warning: "Status tersimpan, tetapi Resend belum dikonfigurasi.",
    });
  }

  const outcome = body.status === "approved" ? "diterima dan disetujui untuk ditampilkan" : "belum dapat diterima";
  const { data, error } = await new Resend(apiKey).emails.send({
    from,
    to: [recipient.email],
    subject: `Pembaruan status karya: ${recipient.title}`,
    text: [
      `Halo ${recipient.name},`,
      "",
      `Karya Anda, \"${recipient.title}\", ${outcome} oleh BEM KM STIKes Dharma Husada.`,
      note ? `Catatan admin: ${note}` : "",
      "",
      "Salam,",
      "BEM KM STIKes Dharma Husada",
    ].filter(Boolean).join("\n"),
  });

  if (error) {
    return Response.json({
      statusUpdated: true,
      emailSent: false,
      warning: "Status tersimpan, tetapi email belum berhasil dikirim.",
    });
  }

  return Response.json({ statusUpdated: true, emailSent: Boolean(data?.id) });
}