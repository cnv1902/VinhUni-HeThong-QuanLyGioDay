# Tài liệu API Layer: SemanticEditorApi

**Đường dẫn:** `static/js/api/admin/semanticEditorApi.js`
**Ngôn ngữ:** JavaScript [Ngôn ngữ: JS/TS (React)]

Object `apiSemanticEditor` — API Layer phục vụ component `SemanticEditor` (trình soạn thảo công thức). Chú ý: các phương thức này trả về **raw `Response` object** (không parse JSON), khác với các API object khác.

---

## Danh sách phương thức (Methods)

| Phương thức | [In] | Endpoint | HTTP | [Out] |
|---|---|---|---|---|
| `getHeSoLopDongDonGian()` | *(không có)* | `GET {API_PREFIX}/he-so-lop-dong/danh-sach-don-gian` | GET | `Promise<Response>` |
| `getTruongHopNhomCongThuc(groupId)` | `groupId` (any) | `GET {API_PREFIX}/truong-hop-cong-thuc/nhom-cong-thuc/{groupId}` | GET | `Promise<Response>` |
| `getHeSoLopDong()` | *(không có)* | `GET {API_PREFIX}/he-so-lop-dong/` | GET | `Promise<Response>` |
| `deleteTruongHopCongThuc(caseId)` | `caseId` (any) | `DELETE {API_PREFIX}/truong-hop-cong-thuc/{caseId}` | DELETE | `Promise<Response>` |
| `bulkUpdateHeSoLopDong(payload)` | `payload` (Array) | `PUT {API_PREFIX}/he-so-lop-dong/bulk-update` | PUT | `Promise<Response>` |
| `bulkUpdateTruongHopNhomCongThuc(groupId, validTruongHop)` | `groupId` (any), `validTruongHop` (Array) | `PUT {API_PREFIX}/truong-hop-cong-thuc/nhom-cong-thuc/{groupId}/bulk-update` | PUT | `Promise<Response>` |

---

## Đặc điểm quan trọng ([Side-effect / Proc])

- **Không parse JSON, không xử lý lỗi HTTP** — trả về raw `Response` object. Caller (`semantic_editor.js`) tự chịu trách nhiệm kiểm tra `response.ok` và gọi `response.json()`.
- Sử dụng `window.API_PREFIX` với fallback cứng `'/api/v1'` nếu biến chưa được inject.
- Gửi body dạng JSON với `Content-Type: application/json` cho các phương thức PUT.
  - `bulkUpdateHeSoLopDong`: body là `{ he_so_lop_dong: payload }`
  - `bulkUpdateTruongHopNhomCongThuc`: body là `{ truong_hop_cong_thuc: validTruongHop }`

---

## Ví dụ sử dụng

```javascript
// Caller phải tự parse và xử lý lỗi
const response = await apiSemanticEditor.getHeSoLopDong();
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const data = await response.json();
```
