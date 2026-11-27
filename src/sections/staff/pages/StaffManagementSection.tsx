"use client";

import {
  Edit3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import type { UserResponseDTO } from "@/modules/users/domain/dto/UserDTO";
import { useUsersApi } from "@/modules/users/presentation/useUsersApi";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import Modal from "@/shared-ui/component/Modal";
import Pagination from "@/shared-ui/component/Pagination";
import SelectField from "@/shared-ui/component/SelectField";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/shared-ui/component/Table";
import TextField from "@/shared-ui/component/TextField";
import { showErrorToast, showSuccessToast } from "@/shared-ui/component/Toast";

type StaffRoleFilter = "ALL" | "PROCTOR" | "TEACHER" | "ADMIN";
type StaffRole = "PROCTOR" | "TEACHER" | "ADMIN";

const ROLE_META: Record<
  StaffRole,
  { label: string; color: BadgeColor; moodleMapping: string }
> = {
  ADMIN: {
    label: "Admin",
    color: "primary",
    moodleMapping: "Site Admin / System Manager",
  },
  TEACHER: {
    label: "Guru (Teacher)",
    color: "teal",
    moodleMapping: "Teacher + Course creator",
  },
  PROCTOR: {
    label: "Pengawas (Proctor)",
    color: "gold",
    moodleMapping: "Non-editing teacher",
  },
};

export const StaffManagementSection: FC = () => {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    createStaffUser,
    updateStaffUser,
    deleteStaffUser,
  } = useUsersApi();

  const [roleFilter, setRoleFilter] = useState<StaffRoleFilter>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<StaffRole>("PROCTOR");
  const [formRoomCode, setFormRoomCode] = useState("LAB-01");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadStaff = useCallback(async () => {
    await fetchUsers({ excludeRole: "STUDENT", limit: 500 }).catch(
      () => undefined,
    );
  }, [fetchUsers]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  const staffUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role === "STUDENT") return false;
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = u.fullName.toLowerCase().includes(q);
        const matchUsername = u.username.toLowerCase().includes(q);
        const matchRoom = (u.roomCode || "").toLowerCase().includes(q);
        if (!matchName && !matchUsername && !matchRoom) return false;
      }
      return true;
    });
  }, [users, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(staffUsers.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedStaff = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return staffUsers.slice(start, start + itemsPerPage);
  }, [staffUsers, safePage]);

  const openCreateModal = (defaultRole: StaffRole = "PROCTOR") => {
    setEditingUser(null);
    setFormUsername("");
    setFormFullName("");
    setFormPassword("");
    setFormRole(defaultRole);
    setFormRoomCode(defaultRole === "PROCTOR" ? "LAB-01" : "");
    setFormIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (u: UserResponseDTO) => {
    const role: StaffRole =
      u.role === "ADMIN" || u.role === "TEACHER" || u.role === "PROCTOR"
        ? u.role
        : "PROCTOR";
    setEditingUser(u);
    setFormUsername(u.username);
    setFormFullName(u.fullName);
    setFormPassword("");
    setFormRole(role);
    setFormRoomCode(u.roomCode || (role === "PROCTOR" ? "LAB-01" : ""));
    setFormIsActive(u.isActive);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formFullName.trim()) {
      showErrorToast("Nama lengkap wajib diisi.");
      return;
    }
    if (!editingUser && (!formUsername.trim() || formPassword.length < 6)) {
      showErrorToast("Username wajib diisi dan kata sandi minimal 6 karakter.");
      return;
    }
    if (formRole === "PROCTOR" && !formRoomCode.trim()) {
      showErrorToast(
        "Kode ruang ujian wajib diisi untuk Pengawas (1 Proktor = 1 Ruang).",
      );
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        await updateStaffUser(editingUser.id, {
          fullName: formFullName.trim(),
          role: formRole,
          roomCode:
            formRole === "PROCTOR" ? formRoomCode.trim().toUpperCase() : null,
          isActive: formIsActive,
          ...(formPassword.trim() ? { password: formPassword } : {}),
        });
        showSuccessToast(`Akun ${formFullName.trim()} berhasil diperbarui.`);
      } else {
        await createStaffUser({
          username: formUsername.trim(),
          fullName: formFullName.trim(),
          password: formPassword,
          role: formRole,
          roomCode:
            formRole === "PROCTOR" ? formRoomCode.trim().toUpperCase() : null,
          isActive: formIsActive,
        });
        showSuccessToast(`Akun ${formFullName.trim()} berhasil ditambahkan.`);
      }
      setModalOpen(false);
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Gagal menyimpan data akun.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (u: UserResponseDTO) => {
    try {
      await updateStaffUser(u.id, { isActive: !u.isActive });
      showSuccessToast(
        `Akun ${u.fullName} kini ${!u.isActive ? "aktif" : "dinonaktifkan"}.`,
      );
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Gagal mengubah status akun.",
      );
    }
  };

  const handleDelete = async (u: UserResponseDTO) => {
    if (!confirm(`Hapus akun ${u.fullName} (${u.username})?`)) return;
    try {
      await deleteStaffUser(u.id);
      showSuccessToast(`Akun ${u.fullName} berhasil dihapus.`);
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Gagal menghapus akun.",
      );
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-[#0d2b5c]">
            Manajemen Akun Pengawas (Proctor) &amp; Guru (Teacher)
          </h2>
          <p className="text-xs text-slate-500">
            Atur penugasan ruang ujian proktor (1 Proktor = 1 Ruang) serta akun
            guru (Moodle Teacher &amp; Course creator)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            color="secondary"
            size="sm"
            leftIcon={RefreshCw}
            onClick={() => void loadStaff()}
            disabled={isLoading}
          >
            Muat Ulang
          </Button>
          <Button
            type="button"
            variant="outline"
            color="teal"
            size="sm"
            leftIcon={Plus}
            onClick={() => openCreateModal("TEACHER")}
          >
            Tambah Guru
          </Button>
          <Button
            type="button"
            variant="filled"
            color="primary"
            size="sm"
            leftIcon={Plus}
            onClick={() => openCreateModal("PROCTOR")}
          >
            Tambah Pengawas
          </Button>
        </div>
      </div>

      {/* Moodle Role Mapping Info */}
      <Card className="border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
          <ShieldCheck className="h-4 w-4 text-[#0097a7] shrink-0" />
          <span className="font-bold text-[#0d2b5c]">
            Pemetaan Peran Moodle:
          </span>
          <Badge color="primary" variant="soft" size="sm">
            Admin = Site Admin / System Manager
          </Badge>
          <Badge color="teal" variant="soft" size="sm">
            Guru (Teacher) = Teacher + Course creator
          </Badge>
          <Badge color="gold" variant="soft" size="sm">
            Pengawas (Proctor) = Non-editing teacher (1 Ruang)
          </Badge>
        </div>
      </Card>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-slate-100 p-1">
          {(
            [
              { id: "ALL", label: "Semua Staf" },
              { id: "PROCTOR", label: "Pengawas (Proctor)" },
              { id: "TEACHER", label: "Guru (Teacher)" },
              { id: "ADMIN", label: "Admin" },
            ] as Array<{ id: StaffRoleFilter; label: string }>
          ).map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={roleFilter === tab.id ? "filled" : "ghost"}
              color={roleFilter === tab.id ? "primary" : "secondary"}
              onClick={() => {
                setRoleFilter(tab.id);
                setCurrentPage(1);
              }}
              className="rounded-xl"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <TextField
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, username, atau ruang..."
            leftIcon={Search}
            size="sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Staff Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Nama Lengkap</TableHeaderCell>
            <TableHeaderCell>Username</TableHeaderCell>
            <TableHeaderCell>Peran &amp; Mapping Moodle</TableHeaderCell>
            <TableHeaderCell>Ruang Tugas</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell className="text-right">Aksi</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading && paginatedStaff.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-xs text-slate-400"
              >
                Memuat daftar pengawas dan guru...
              </TableCell>
            </TableRow>
          ) : paginatedStaff.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="py-10 text-center text-xs text-slate-500"
              >
                Belum ada data pengawas atau guru yang cocok dengan filter.
              </TableCell>
            </TableRow>
          ) : (
            paginatedStaff.map((u) => {
              const meta = ROLE_META[(u.role as StaffRole) || "PROCTOR"] ?? {
                label: u.role,
                color: "neutral" as BadgeColor,
                moodleMapping: "-",
              };
              return (
                <TableRow key={u.id}>
                  <TableCell className="font-bold text-slate-900">
                    {u.fullName}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">
                    {u.username}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <Badge color={meta.color} variant="soft" size="sm">
                        {meta.label}
                      </Badge>
                      <span className="text-[11px] text-slate-400">
                        {meta.moodleMapping}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-semibold text-[#0d2b5c]">
                    {u.role === "PROCTOR"
                      ? u.roomCode || "Belum ditugaskan"
                      : "Semua Ruang"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      color={u.isActive ? "success" : "error"}
                      variant="soft"
                      size="sm"
                    >
                      {u.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        color="secondary"
                        size="xs"
                        leftIcon={Edit3}
                        onClick={() => openEditModal(u)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        color={u.isActive ? "gold" : "success"}
                        size="xs"
                        leftIcon={u.isActive ? UserX : UserCheck}
                        onClick={() => void handleToggleActive(u)}
                      >
                        {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        color="danger"
                        size="xs"
                        iconOnly
                        leftIcon={Trash2}
                        aria-label={`Hapus ${u.fullName}`}
                        onClick={() => void handleDelete(u)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {staffUsers.length > itemsPerPage && (
        <Pagination
          currentPage={safePage}
          totalItems={staffUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChangeAction={setCurrentPage}
        />
      )}

      {/* Create / Edit Staff Modal */}
      <Modal
        open={modalOpen}
        onClose={() => !isSaving && setModalOpen(false)}
        title={
          editingUser
            ? `Edit Akun: ${editingUser.fullName}`
            : "Tambah Akun Pengawas / Guru"
        }
        subtitle="Proktor dibatasi mengawasi 1 ruang ujian sesuai kode ruang yang ditugaskan."
        size="md"
        onSubmit={() => void handleSave()}
        submitText={editingUser ? "Simpan Perubahan" : "Buat Akun"}
        cancelText="Batal"
        submitLoading={isSaving}
      >
        <div className="flex flex-col gap-4">
          <TextField
            id="staff-fullname"
            label="Nama Lengkap"
            placeholder="Contoh: Ibu Siti Aminah, S.Pd"
            value={formFullName}
            onChange={(e) => setFormFullName(e.target.value)}
            required
          />

          <TextField
            id="staff-username"
            label="Username Login"
            placeholder="Contoh: proktor_lab01 atau guru_mtk"
            value={formUsername}
            onChange={(e) => setFormUsername(e.target.value)}
            disabled={Boolean(editingUser)}
            required
          />

          <TextField
            id="staff-password"
            label={
              editingUser
                ? "Kata Sandi Baru (Kosongkan jika tidak diubah)"
                : "Kata Sandi (Minimal 6 karakter)"
            }
            type="password"
            placeholder="Masukkan kata sandi..."
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            enablePasswordToggle
            required={!editingUser}
          />

          <SelectField
            label="Peran (Role)"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value as StaffRole)}
          >
            <option value="PROCTOR">
              Pengawas (Proctor) - Moodle Non-editing teacher
            </option>
            <option value="TEACHER">
              Guru (Teacher) - Moodle Teacher + Course creator
            </option>
            <option value="ADMIN">
              Administrator - Moodle Manager / Site Admin
            </option>
          </SelectField>

          {formRole === "PROCTOR" && (
            <TextField
              id="staff-room-code"
              label="Kode Ruang Ujian Tugas (Wajib untuk Proktor)"
              placeholder="Contoh: LAB-01"
              value={formRoomCode}
              onChange={(e) => setFormRoomCode(e.target.value)}
              helperText="1 Proktor hanya dapat memantau peserta dan pelanggaran pada ruang ini."
              required
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default StaffManagementSection;
