import Swal from "sweetalert2";

const base = Swal.mixin({
  background: "#0f0f0f",
  color: "#f1f1f1",
  confirmButtonColor: "#00ff88",
  cancelButtonColor: "#374151",
  customClass: {
    popup: "!rounded-2xl !border !border-white/10 !shadow-2xl",
    confirmButton: "!rounded-xl !font-medium !text-black",
    cancelButton: "!rounded-xl !font-medium",
  },
});

export const swal = {
  confirm: (opts: { title: string; text?: string; confirmText?: string }) =>
    base.fire({
      title: opts.title,
      text: opts.text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: opts.confirmText ?? "Confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }),

  success: (title: string, text?: string) =>
    base.fire({ title, text, icon: "success", timer: 2000, showConfirmButton: false }),

  error: (title: string, text?: string) =>
    base.fire({ title, text, icon: "error" }),
};
