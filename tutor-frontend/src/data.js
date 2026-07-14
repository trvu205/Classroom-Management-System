// ===== HẰNG SỐ & HÀM TIỆN ÍCH DÙNG CHUNG =====

export const SUBJECTS = ["Toán", "Lý", "Hóa", "Anh văn", "Văn"];

export function formatCurrency(amount) {
  return (amount || 0).toLocaleString("vi-VN") + "đ";
}

export function formatDateVN(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function getMonthKey(dateStr) {
  return (dateStr || "").slice(0, 7); // YYYY-MM
}
