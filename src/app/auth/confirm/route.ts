import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rutaSegura } from "@/lib/ruta-segura";

/**
 * Pedido del usuario: que el link del mail de confirmación "te lleve
 * devuelta a la pág después de verificar". Esta ruta es nueva -- antes no
 * existía ningún endpoint propio de confirmación, así que no toca nada de
 * la lógica de login/registro/sesión ya existente, solo agrega el paso que
 * faltaba después de que Supabase valida el link.
 *
 * Recibe `token_hash` + `type` (los manda Supabase), los cambia por una
 * sesión real guardada en cookies (mismo cliente de siempre,
 * @/lib/supabase/server) y redirige a `next` (por defecto /cuenta). Si el
 * link ya venció o es inválido, redirige a /login con un aviso en vez de
 * dejar al usuario en una pantalla rota.
 *
 * Para que el mail de confirmación apunte acá hace falta cambiar el
 * template "Confirm signup" en el dashboard de Supabase (Authentication >
 * Email Templates) -- eso no se puede hacer desde el código, ver el texto
 * de template en supabase/email-templates/confirm-signup.html.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = rutaSegura(searchParams.get("next"), "/cuenta");

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = "/login";
  redirectTo.search = "";
  redirectTo.searchParams.set("error", "confirmacion");
  return NextResponse.redirect(redirectTo);
}
