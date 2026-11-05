"use client";

import Divider from "@/shared-ui/component/Divider";
import SelectField from "@/shared-ui/component/SelectField";
import TextField from "@/shared-ui/component/TextField";

/* ================= TYPES ================= */

type Option = { label: string; value: string };

export type Field<T extends object> =
  | {
      type?: "text"; // default
      name: keyof T;
      label?: string;
      full?: boolean;
    }
  | {
      type: "select";
      name: keyof T;
      label?: string;
      options: Option[];
      full?: boolean;
    }
  | {
      type: "divider";
    };

type Props<T extends object> = {
  fields: Field<T>[];
  form: T;
  errors: Partial<Record<keyof T, string>>;
  onChangeAction: <K extends keyof T>(name: K, value: T[K]) => void;
};

/* ================= COMPONENT ================= */

export default function AutoFormGrid<T extends object>({
  fields,
  form,
  errors,
  onChangeAction,
}: Props<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map((field, i) => {
        /* ===== DIVIDER ===== */
        if (field.type === "divider") {
          return (
            <div key={i} className="col-span-1 sm:col-span-2">
              <Divider />
            </div>
          );
        }

        const colSpan = field.full ? "col-span-1 sm:col-span-2" : "";

        /* ===== SELECT ===== */
        if (field.type === "select") {
          const name = field.name;
          return (
            <div key={String(name)} className={colSpan}>
              <SelectField
                label={field.label}
                value={String(form[name] ?? "")}
                onChange={(e) =>
                  onChangeAction(name, e.target.value as T[typeof name])
                }
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SelectField>
            </div>
          );
        }

        /* ===== TEXT ===== */
        const name = field.name;
        return (
          <div key={String(name)} className={colSpan}>
            <TextField
              label={field.label}
              value={String(form[name] ?? "")}
              error={errors[name]}
              onChange={(e) =>
                onChangeAction(name, e.target.value as T[typeof name])
              }
            />
          </div>
        );
      })}
    </div>
  );
}
