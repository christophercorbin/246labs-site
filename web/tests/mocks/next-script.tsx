import React from "react";

interface ScriptProps {
  id?: string;
  strategy?: string;
  children?: string | React.ReactNode;
  [key: string]: unknown;
}

export default function Script({ id, children, ...props }: ScriptProps) {
  return (
    <script id={id} {...props}>
      {children}
    </script>
  );
}
