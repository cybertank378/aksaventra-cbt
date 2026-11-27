"use client";

import {
  CheckSquare,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  X,
} from "lucide-react";
import { type FC, useCallback, useEffect, useMemo, useState } from "react";
import type { UserResponseDTO } from "@/modules/users/domain/dto/UserDTO";
import { useUsersApi } from "@/modules/users/presentation/useUsersApi";
import type { UserRole } from "@/security/rbacConfig";
import Badge, { type BadgeColor } from "@/shared-ui/component/Badge";
import Button from "@/shared-ui/component/Button";
import Card from "@/shared-ui/component/Card";
import Checkbox from "@/shared-ui/component/Checkbox";
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
    bulkUpdateUserRoles,
  } = useUsersApi();

  const [roleFilter, setRoleFilter] = useState<StaffRoleFilter>("ALL");
  const [search, setSearch] = useState("");
  const [searchEditable, setSearchEditable] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkRole, setBulkRole] = useState<UserRole>("TEACHER");
  const [bulkRoomCode, setBulkRoomCode] = useState("LAB-01");
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [passwordEditable, setPasswordEditable] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponseDTO | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<StaffRole>("PROCTOR");
  const [formRoomCode, setFormRoomCode] = useState("LAB-01");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadStaff = useCallback(async () => {
    await fetchUsers({ excludeRole: "STUDENT", limit: 1000 }).catch(
      () => undefined,
    );
  }, [fetchUsers]);

  useEffect(() => {
    void loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    const handleSynced = () => {
      void loadStaff();
    };
    window.addEventListener("aksaventra:synced", handleSynced);
    return () => {
      window.removeEventListener("aksaventra:synced", handleSynced);
    };
  }, [loadStaff]);

  const roleCounts = useMemo(() => {
    let all = 0;
    let proctor = 0;
    let teacher = 0;
    let admin = 0;
    for (const u of users) {
      if (u.role === "STUDENT") continue;
      all++;
      if (u.role === "PROCTOR") proctor++;
      else if (u.role === "TEACHER") teacher++;
      else if (u.role === "ADMIN") admin++;
    }
    return { ALL: all, PROCTOR: proctor, TEACHER: teacher, ADMIN: admin };
  }, [users]);

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

  const selectableFilteredIds = useMemo(
    () =>
      staffUsers
        .filter((u) => u.username.trim().toLowerCase() !== "admin")
        .map((u) => u.id),
    [staffUsers],
  );

  const selectablePageIds = useMemo(
    () =>
      paginatedStaff
        .filter((u) => u.username.trim().toLowerCase() !== "admin")
        .map((u) => u.id),
    [paginatedStaff],
  );

  const allPageSelected =
    selectablePageIds.length > 0 &&
    selectablePageIds.every((id) => selectedIds.has(id));
  const somePageSelected =
    selectablePageIds.some((id) => selectedIds.has(id)) && !allPageSelected;

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        for (const id of selectablePageIds) {
          next.delete(id);
        }
      } else {
        for (const id of selectablePageIds) {
          next.add(id);
        }
      }
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(selectableFilteredIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkRoleUpdate = async () => {
    const targetIds = Array.from(selectedIds);
    if (targetIds.length === 0) return;

    if (bulkRole === "PROCTOR" && !bulkRoomCode.trim()) {
      showErrorToast(
        "Kode ruang ujian wajib diisi saat mengubah peran massal menjadi Pengawas (Proctor).",
      );
      return;
    }

    const roleLabels: Record<UserRole, string> = {
      ADMIN: "Admin",
      TEACHER: "Guru (Teacher)",
      PROCTOR: "Pengawas (Proctor)",
      STUDENT: "Siswa (Student)",
    };

    setIsBulkSaving(true);
    try {
      const res = await bulkUpdateUserRoles({
        userIds: targetIds,
        role: bulkRole,
        roomCode:
          bulkRole === "PROCTOR" ? bulkRoomCode.trim().toUpperCase() : null,
      });
      setSelectedIds(new Set());
      const skippedNote =
        res.skippedCount > 0
          ? ` (${res.skippedCount} akun admin dilindungi dilewati)`
          : "";
      showSuccessToast(
        `${res.updatedCount} akun berhasil diubah ke ${roleLabels[bulkRole]} (sinkron Moodle: ${res.moodleSyncedCount}/${res.updatedCount})${skippedNote}.`,
      );
      await loadStaff();
    } catch (err) {
      showErrorToast(
        err instanceof Error
          ? err.message
          : "Gagal memperbarui peran akun secara massal.",
      );
      await loadStaff();
    } finally {
      setIsBulkSaving(false);
    }
  };

  const openCreateModal = (defaultRole: StaffRole = "PROCTOR") => {
    setEditingUser(null);
    setFormUsername("");
    setFormFullName("");
    setFormPassword("");
    setChangePassword(true);
    setPasswordEditable(false);
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
    setChangePassword(false);
    setPasswordEditable(false);
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
    if (editingUser && changePassword && formPassword.length < 6) {
      showErrorToast("Kata sandi baru minimal 6 karakter.");
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
          ...(changePassword && formPassword.trim()
            ? { password: formPassword }
            : {}),
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
      await loadStaff();
    } catch (err) {
      showErrorToast(
        err instanceof Error ? err.message : "Gagal menyimpan data akun.",
      );
      await loadStaff();
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
      await loadStaff();
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
      setSelectedIds((prev) => {
        if (!prev.has(u.id)) return prev;
        const next = new Set(prev);
        next.delete(u.id);
        return next;
      });
      showSuccessToast(`Akun ${u.fullName} berhasil dihapus.`);
      await loadStaff();
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
              {tab.label} ({roleCounts[tab.id]})
            </Button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <TextField
            type="search"
            name="staff-filter-query"
            autoComplete="off"
            spellCheck={false}
            readOnly={!searchEditable}
            onFocus={() => setSearchEditable(true)}
            onBlur={() => setSearchEditable(false)}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama, username, atau ruang..."
            leftIcon={Search}
            rightIcon={search ? X : undefined}
            onRightIconClick={
              search
                ? () => {
                    setSearch("");
                    setCurrentPage(1);
                  }
                : undefined
            }
            size="sm"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {/* Bulk Role Update Bar */}
      {selectedIds.size > 0 && (
        <Card className="border-[#0097a7]/30 bg-cyan-50/70 p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="teal" variant="filled" size="sm">
                {selectedIds.size} akun dipilih
              </Badge>
              {selectableFilteredIds.length > selectedIds.size && (
                <Button
                  type="button"
                  variant="ghost"
                  color="teal"
                  size="xs"
                  leftIcon={CheckSquare}
                  onClick={selectAllFiltered}
                  disabled={isBulkSaving}
                >
                  Pilih semua hasil filter ({selectableFilteredIds.length})
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                color="secondary"
                size="xs"
                leftIcon={X}
                onClick={clearSelection}
                disabled={isBulkSaving}
              >
                Batal pilih
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <label
                htmlFor="bulk-role-select"
                className="text-xs font-semibold text-slate-700 whitespace-nowrap"
              >
                Ubah Peran Ke:
              </label>

              <div className="w-full sm:w-72">
                <SelectField
                  id="bulk-role-select"
                  size="sm"
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value as UserRole)}
                  disabled={isBulkSaving}
                  className="rounded-xl pl-3"
                >
                  <option value="TEACHER">
                    Guru (Teacher) - Teacher + Course creator
                  </option>
                  <option value="PROCTOR">
                    Pengawas (Proctor) - Non-editing teacher
                  </option>
                  <option value="ADMIN">
                    Admin - Site Admin / System Manager
                  </option>
                  <option value="STUDENT">
                    Siswa (Student) - Hapus peran staf
                  </option>
                </SelectField>
              </div>

              {bulkRole === "PROCTOR" && (
                <div className="w-full sm:w-40">
                  <TextField
                    id="bulk-room-code"
                    aria-label="Kode Ruang"
                    placeholder="Kode ruang (LAB-01)"
                    value={bulkRoomCode}
                    onChange={(e) => setBulkRoomCode(e.target.value)}
                    size="sm"
                    disabled={isBulkSaving}
                    className="rounded-xl px-3"
                    required
                  />
                </div>
              )}

              <Button
                type="button"
                variant="filled"
                color="primary"
                size="sm"
                leftIcon={ShieldCheck}
                onClick={() => void handleBulkRoleUpdate()}
                loading={isBulkSaving}
                disabled={isBulkSaving}
                className="h-9 rounded-xl px-4 shrink-0"
              >
                Terapkan Peran
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Staff Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell className="w-12">
              <Checkbox
                checked={allPageSelected}
                indeterminate={somePageSelected}
                onChange={toggleSelectPage}
                disabled={selectablePageIds.length === 0 || isBulkSaving}
              />
            </TableHeaderCell>
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
                colSpan={7}
                className="py-10 text-center text-xs text-slate-400"
              >
                Memuat daftar pengawas dan guru...
              </TableCell>
            </TableRow>
          ) : paginatedStaff.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-10 text-center text-xs text-slate-500"
              >
                Belum ada data pengawas atau guru yang cocok dengan filter.
              </TableCell>
            </TableRow>
          ) : (
            paginatedStaff.map((u) => {
              const isPrimaryAdmin =
                u.username.trim().toLowerCase() === "admin";
              const isSelected = selectedIds.has(u.id);
              const meta = ROLE_META[(u.role as StaffRole) || "PROCTOR"] ?? {
                label: u.role,
                color: "neutral" as BadgeColor,
                moodleMapping: "-",
              };
              return (
                <TableRow
                  key={u.id}
                  className={isSelected ? "bg-cyan-50/50" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      disabled={isPrimaryAdmin || isBulkSaving}
                      onChange={() => toggleSelectOne(u.id)}
                    />
                  </TableCell>
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
        {modalOpen && (
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSave();
            }}
            className="flex flex-col gap-4"
          >
            <TextField
              id="staff-fullname"
              name="staff-fullname"
              autoComplete="off"
              label="Nama Lengkap"
              placeholder="Contoh: Ibu Siti Aminah, S.Pd"
              value={formFullName}
              onChange={(e) => setFormFullName(e.target.value)}
              required
            />

            <TextField
              id="staff-username"
              name="staff-account-username"
              autoComplete="off"
              label="Username Login"
              placeholder="Contoh: proktor_lab01 atau guru_mtk"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              disabled={Boolean(editingUser)}
              required
            />

            {editingUser && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
                <Checkbox
                  checked={changePassword}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setChangePassword(checked);
                    if (!checked) {
                      setFormPassword("");
                      setPasswordEditable(false);
                    }
                  }}
                  label="Ubah kata sandi akun ini"
                />
              </div>
            )}

            {(!editingUser || changePassword) && (
              <TextField
                id="staff-password"
                name="staff-new-password"
                autoComplete="new-password"
                readOnly={!passwordEditable}
                onFocus={() => setPasswordEditable(true)}
                label={
                  editingUser
                    ? "Kata Sandi Baru (Minimal 6 karakter)"
                    : "Kata Sandi (Minimal 6 karakter)"
                }
                type="password"
                placeholder="Masukkan kata sandi..."
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                enablePasswordToggle
                required
              />
            )}

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
                name="staff-room-code"
                autoComplete="off"
                label="Kode Ruang Ujian Tugas (Wajib untuk Proktor)"
                placeholder="Contoh: LAB-01"
                value={formRoomCode}
                onChange={(e) => setFormRoomCode(e.target.value)}
                helperText="1 Proktor hanya dapat memantau peserta dan pelanggaran pada ruang ini."
                required
              />
            )}
          </form>
        )}
      </Modal>
    </div>
  );
};

export default StaffManagementSection;
