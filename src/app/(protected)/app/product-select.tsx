import { Select, SelectItem } from "@heroui/react";
import React from "react";

type ProductSelectProps = {
  productNames: { key: string; label: string }[];
  isLoading: boolean;
};

export const PRODUCT_SELECT_PREDEFINED_PROPS = {
  label: "Select Product",
  placeholder: "Select a product",
  className: "min-w-[200px]",
};

export default function ProductSelect({
  productNames,
  isLoading,
}: ProductSelectProps) {
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set(["all"]));

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKeys(new Set(e.target.value.split(",")));
  };

  return (
    <Select
      {...PRODUCT_SELECT_PREDEFINED_PROPS}
      selectedKeys={selectedKeys}
      onChange={handleSelectionChange}
      isLoading={isLoading}
    >
      {productNames.map((product) => (
        <SelectItem key={product.key}>{product.label}</SelectItem>
      ))}
    </Select>
  );
}
