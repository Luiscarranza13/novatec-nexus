import { type RouteConfig as Route } from "@tanstack/react-router";
import { IndexRoute } from "./admin.index";
import { LoginRoute } from "./admin.login";
import { MensajesRoute } from "./admin.mensajes";
import { PerfilRoute } from "./admin.perfil";
import { ProyectosRoute } from "./admin.proyectos";
import { ServiciosRoute } from "./admin.servicios";
import { BiometricRoute } from "./admin/biometric";

export interface AdminRoutes {
  admin: {
    children: {
      index: IndexRoute;
      login: LoginRoute;
      mensajes: MensajesRoute;
      perfil: PerfilRoute;
      proyectos: ProyectosRoute;
      servicios: ServiciosRoute;
      biometric: BiometricRoute;
    };
  };
}
