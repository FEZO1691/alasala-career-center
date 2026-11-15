// طلب فتح لوحة بوابة من أي مكان في الصفحة (قائمة تسجيل الدخول، زر الـ Hero)
export const OPEN_GATEWAY_EVENT = "open-gateway";

export function openGateway(id: string) {
  window.dispatchEvent(new CustomEvent<string>(OPEN_GATEWAY_EVENT, { detail: id }));
}
