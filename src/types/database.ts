// Tipos que reflejan supabase/migrations/000*.sql. Escritos a mano (este
// entorno no tiene salida a internet para correr
// `supabase gen types typescript`); ver README para regenerarlos de forma
// oficial una vez que el proyecto tenga la Supabase CLI disponible.

export type RolUsuario = "administrador" | "empleado" | "cliente";
export type EstadoStock = "disponible" | "ultimas_unidades" | "sin_stock" | "consultar";
export type EstadoPedido =
  | "nuevo"
  | "pago_pendiente"
  | "pago_aprobado"
  | "confirmado"
  | "preparando"
  | "enviado"
  | "entregado"
  | "cancelado";
export type EstadoPago = "pendiente" | "aprobado" | "rechazado" | "cancelado" | "reembolsado";
export type TipoEntrega = "envio" | "retiro_local";
export type MetodoPago = "mercadopago" | "tarjeta" | "transferencia" | "efectivo";
export type EstadoSolicitudMecanica = "pendiente" | "aceptada" | "rechazada" | "completada";

export interface Caracteristica {
  label: string;
  value: string;
}

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          nombre: string | null;
          apellido: string | null;
          telefono: string | null;
          dni_cuit: string | null;
          rol: RolUsuario;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["perfiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["perfiles"]["Row"]>;
      };
      categorias: {
        Row: {
          id: string;
          nombre: string;
          slug: string;
          descripcion: string | null;
          imagen_url: string | null;
          categoria_padre_id: string | null;
          orden: number;
          activo: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["categorias"]["Row"]> & {
          nombre: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["categorias"]["Row"]>;
      };
      marcas: {
        Row: {
          id: string;
          nombre: string;
          slug: string;
          logo_url: string | null;
          descripcion: string | null;
          orden: number;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["marcas"]["Row"]> & {
          nombre: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["marcas"]["Row"]>;
      };
      motos: {
        Row: {
          id: string;
          marca: string;
          modelo: string;
          anio_desde: number | null;
          anio_hasta: number | null;
          cilindrada: number | null;
          activo: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["motos"]["Row"]> & {
          marca: string;
          modelo: string;
        };
        Update: Partial<Database["public"]["Tables"]["motos"]["Row"]>;
      };
      productos: {
        Row: {
          id: string;
          sku: string;
          codigo: string;
          codigo_alternativo: string | null;
          nombre: string;
          slug: string;
          categoria_id: string | null;
          subcategoria_id: string | null;
          marca_id: string | null;
          precio: number;
          precio_anterior: number | null;
          precio_promocional: number | null;
          oferta_desde: string | null;
          oferta_hasta: string | null;
          costo: number | null;
          stock: number;
          stock_minimo: number;
          estado_stock: EstadoStock;
          descripcion_corta: string | null;
          descripcion_completa: string | null;
          caracteristicas: Caracteristica[];
          tags: string[];
          destacado: boolean;
          activo: boolean;
          imagen_principal_url: string | null;
          seo_title: string | null;
          seo_description: string | null;
          fecha_alta: string;
          fecha_modificacion: string;
          creado_por: string | null;
          modificado_por: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["productos"]["Row"]> & {
          sku: string;
          codigo: string;
          nombre: string;
          slug: string;
          precio: number;
        };
        Update: Partial<Database["public"]["Tables"]["productos"]["Row"]>;
      };
      producto_imagenes: {
        Row: {
          id: string;
          producto_id: string;
          url: string;
          alt_text: string | null;
          orden: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["producto_imagenes"]["Row"]> & {
          producto_id: string;
          url: string;
        };
        Update: Partial<Database["public"]["Tables"]["producto_imagenes"]["Row"]>;
      };
      producto_compatibilidad: {
        Row: {
          id: string;
          producto_id: string;
          moto_id: string | null;
          marca_moto: string | null;
          modelo_moto: string | null;
          anio_desde: number | null;
          anio_hasta: number | null;
          cilindrada: number | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["producto_compatibilidad"]["Row"]> & {
          producto_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["producto_compatibilidad"]["Row"]>;
      };
      direcciones: {
        Row: {
          id: string;
          usuario_id: string;
          nombre: string | null;
          direccion: string;
          ciudad: string;
          provincia: string;
          codigo_postal: string | null;
          telefono: string | null;
          predeterminada: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["direcciones"]["Row"]> & {
          usuario_id: string;
          direccion: string;
          ciudad: string;
          provincia: string;
        };
        Update: Partial<Database["public"]["Tables"]["direcciones"]["Row"]>;
      };
      favoritos: {
        Row: {
          id: string;
          usuario_id: string | null;
          session_id: string | null;
          producto_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["favoritos"]["Row"]> & {
          producto_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["favoritos"]["Row"]>;
      };
      pedidos: {
        Row: {
          id: string;
          numero: number;
          usuario_id: string | null;
          nombre: string;
          apellido: string;
          email: string;
          telefono: string;
          dni_cuit: string | null;
          tipo_entrega: TipoEntrega;
          direccion_envio: Record<string, unknown> | null;
          subtotal: number;
          costo_envio: number;
          descuento: number;
          total: number;
          estado: EstadoPedido;
          metodo_pago: MetodoPago | null;
          notas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pedidos"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["pedidos"]["Row"]>;
      };
      pedido_items: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string | null;
          nombre_producto: string;
          codigo: string | null;
          precio_unitario: number;
          cantidad: number;
          subtotal: number;
        };
        Insert: Partial<Database["public"]["Tables"]["pedido_items"]["Row"]> & {
          pedido_id: string;
          nombre_producto: string;
          precio_unitario: number;
          cantidad: number;
          subtotal: number;
        };
        Update: Partial<Database["public"]["Tables"]["pedido_items"]["Row"]>;
      };
      pagos: {
        Row: {
          id: string;
          pedido_id: string;
          proveedor: string;
          mp_payment_id: string | null;
          mp_preference_id: string | null;
          estado: EstadoPago;
          monto: number;
          moneda: string;
          raw_response: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["pagos"]["Row"]> & {
          pedido_id: string;
          monto: number;
        };
        Update: Partial<Database["public"]["Tables"]["pagos"]["Row"]>;
      };
      banners: {
        Row: {
          id: string;
          titulo: string | null;
          descripcion: string | null;
          imagen_url: string;
          boton_texto: string | null;
          boton_url: string | null;
          fecha_inicio: string | null;
          fecha_fin: string | null;
          activo: boolean;
          orden: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["banners"]["Row"]> & { imagen_url: string };
        Update: Partial<Database["public"]["Tables"]["banners"]["Row"]>;
      };
      configuracion: {
        Row: {
          id: number;
          nombre_negocio: string;
          rubro: string | null;
          logo_url: string | null;
          favicon_url: string | null;
          email: string | null;
          whatsapp: string | null;
          whatsapp_link: string | null;
          direccion: string | null;
          ciudad: string | null;
          provincia: string | null;
          horarios: Record<string, string>;
          instagram_url: string | null;
          facebook_url: string | null;
          metodos_pago: { mercadopago?: boolean; transferencia?: boolean; efectivo?: boolean };
          metodos_envio: {
            envio_activo?: boolean;
            retiro_activo?: boolean;
            costo_envio_fijo?: number | null;
            envio_gratis_desde?: number | null;
          };
          dias_nuevo: number;
          seo: { title?: string; description?: string };
          google: {
            analytics_id?: string | null;
            reviews_enabled?: boolean;
            search_console_verified?: boolean;
            /** Link real de "dejar una reseña" (Google Business Profile, ej. https://g.page/r/.../review). Nunca inventado. */
            review_url?: string | null;
          };
          mercadopago_public_key: string | null;
          cookies_texto: string | null;
          secciones_home: Record<string, boolean>;
          hero: {
            activo?: boolean;
            titulo?: string;
            subtitulo?: string;
            imagen_url?: string;
            boton_texto?: string;
            boton_url?: string;
          };
          anuncio_barra: { activo?: boolean; texto?: string; color?: string };
          cuentas_clientes_activas: boolean;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["configuracion"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["configuracion"]["Row"]>;
      };
      historial_cambios: {
        Row: {
          id: string;
          tabla: string;
          registro_id: string;
          usuario_id: string | null;
          accion: string;
          campo: string | null;
          valor_anterior: string | null;
          valor_nuevo: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["historial_cambios"]["Row"]> & {
          tabla: string;
          registro_id: string;
          accion: string;
        };
        Update: Partial<Database["public"]["Tables"]["historial_cambios"]["Row"]>;
      };
      logs_acceso: {
        Row: {
          id: string;
          usuario_id: string | null;
          email: string | null;
          exito: boolean;
          ip: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["logs_acceso"]["Row"]> & { exito: boolean };
        Update: Partial<Database["public"]["Tables"]["logs_acceso"]["Row"]>;
      };
      servicios_mecanica: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          orden: number;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["servicios_mecanica"]["Row"]> & {
          nombre: string;
        };
        Update: Partial<Database["public"]["Tables"]["servicios_mecanica"]["Row"]>;
      };
      solicitudes_mecanica: {
        Row: {
          id: string;
          numero: number;
          usuario_id: string | null;
          nombre: string;
          apellido: string;
          telefono: string;
          email: string | null;
          moto_marca: string | null;
          moto_modelo: string | null;
          servicios_ids: string[];
          descripcion_problema: string | null;
          repuesto_cliente: string | null;
          repuesto_cliente_registrado_at: string | null;
          disclaimer_aceptado: boolean;
          disclaimer_aceptado_at: string | null;
          estado: EstadoSolicitudMecanica;
          notas_internas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["solicitudes_mecanica"]["Row"]> & {
          nombre: string;
          apellido: string;
          telefono: string;
          disclaimer_aceptado: true;
        };
        Update: Partial<Database["public"]["Tables"]["solicitudes_mecanica"]["Row"]>;
      };
    };
    Views: {
      vista_productos: {
        Row: Database["public"]["Tables"]["productos"]["Row"] & {
          categoria_nombre: string | null;
          categoria_slug: string | null;
          marca_nombre: string | null;
          marca_slug: string | null;
          en_oferta: boolean;
          precio_vigente: number;
          es_nuevo: boolean;
        };
      };
    };
    Functions: {
      crear_pedido: {
        Args: {
          p_usuario_id: string | null;
          p_nombre: string;
          p_apellido: string;
          p_email: string;
          p_telefono: string;
          p_dni_cuit: string | null;
          p_tipo_entrega: TipoEntrega;
          p_direccion_envio: Record<string, unknown> | null;
          p_costo_envio: number;
          p_items: { producto_id: string; cantidad: number }[];
          p_metodo_pago?: MetodoPago | null;
        };
        Returns: string;
      };
      crear_solicitud_mecanica: {
        Args: {
          p_usuario_id: string | null;
          p_nombre: string;
          p_apellido: string;
          p_telefono: string;
          p_email: string | null;
          p_moto_marca: string | null;
          p_moto_modelo: string | null;
          p_servicios_ids: string[];
          p_descripcion_problema: string | null;
          p_repuesto_cliente: string | null;
          p_disclaimer_aceptado: boolean;
        };
        Returns: { id: string; numero: number };
      };
    };
  };
}
