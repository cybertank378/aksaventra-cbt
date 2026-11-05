//Files: src/shared-ui/component/Form/FormSection.tsx

"use client";

import type React from "react";

type Props = {
  children: React.ReactNode;
};

const FormSection: React.FC<Props> = ({ children }) => {
  return <div className="space-y-4">{children}</div>;
};

export default FormSection;
